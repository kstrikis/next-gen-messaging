locals {
  name_prefix = "${var.owner_name}-${var.project_name}-${terraform.workspace}"
}

# Look up existing VPC
data "aws_vpc" "existing" {
  id = var.vpc_id
}

# Look up or create subnet
data "aws_subnet" "existing" {
  vpc_id = data.aws_vpc.existing.id
  filter {
    name   = "tag:Name"
    values = [local.name_prefix]
  }
}

resource "aws_subnet" "main" {
  count             = data.aws_subnet.existing.id == null ? 1 : 0
  vpc_id            = data.aws_vpc.existing.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = local.name_prefix
  }
}

locals {
  subnet_id = coalesce(data.aws_subnet.existing.id, try(aws_subnet.main[0].id, null))
}

# Look up or create security group
data "aws_security_group" "existing" {
  vpc_id = data.aws_vpc.existing.id
  filter {
    name   = "tag:Name"
    values = [local.name_prefix]
  }
}

resource "aws_security_group" "app" {
  count  = data.aws_security_group.existing.id == null ? 1 : 0
  name   = local.name_prefix
  vpc_id = data.aws_vpc.existing.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = local.name_prefix
  }
}

locals {
  security_group_id = coalesce(data.aws_security_group.existing.id, try(aws_security_group.app[0].id, null))
}

# Create EC2 instance
resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = local.subnet_id

  vpc_security_group_ids = [local.security_group_id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose git
              systemctl start docker
              systemctl enable docker
              
              # Clone repository
              git clone https://github.com/${var.github_repo}.git /app
              cd /app
              
              # Start application
              docker-compose up -d
              EOF

  tags = {
    Name = local.name_prefix
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }
}