locals {
  name_prefix = "${var.owner_name}-${var.project_name}-${terraform.workspace}"
}

# Look up existing VPC
data "aws_vpc" "existing" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }

  lifecycle {
    postcondition {
      condition     = self.id == var.vpc_id
      error_message = "VPC ${var.vpc_id} does not exist in the account/region"
    }
  }
}

# Find all subnets in the VPC
data "aws_subnets" "vpc_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }
}

# Get details of all subnets to check CIDR blocks
data "aws_subnet" "vpc_subnet_details" {
  for_each = toset(data.aws_subnets.vpc_subnets.ids)
  id       = each.value
}

locals {
  existing_cidrs = [for s in data.aws_subnet.vpc_subnet_details : s.cidr_block]
  new_cidr       = "10.1.2.0/24"
  cidr_exists    = contains(local.existing_cidrs, local.new_cidr)
}

# Try to find existing subnet with our tag
data "aws_subnets" "existing" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }

  filter {
    name   = "tag:Name"
    values = ["kstrikis"]
  }
}

locals {
  existing_subnet_id = length(data.aws_subnets.existing.ids) > 0 ? tolist(data.aws_subnets.existing.ids)[0] : null
}

# Create subnet if it doesn't exist and CIDR is available
resource "aws_subnet" "main" {
  count             = local.existing_subnet_id == null ? 1 : 0
  vpc_id            = data.aws_vpc.existing.id
  cidr_block        = local.new_cidr
  availability_zone = "us-east-1a"

  lifecycle {
    precondition {
      condition     = !local.cidr_exists
      error_message = "CIDR block ${local.new_cidr} already exists in VPC ${data.aws_vpc.existing.id}"
    }
    prevent_destroy = true
  }

  tags = {
    Name = local.name_prefix
  }
}

locals {
  subnet_id = local.existing_subnet_id != null ? local.existing_subnet_id : (
    !local.cidr_exists ? aws_subnet.main[0].id : null
  )
}

# Verify we have a valid subnet
resource "null_resource" "subnet_check" {
  lifecycle {
    precondition {
      condition     = local.subnet_id != null
      error_message = "No valid subnet available. Either the CIDR ${local.new_cidr} is already in use, or we couldn't find/create a subnet."
    }
  }
}

# Find all security groups in the VPC
data "aws_security_groups" "vpc_security_groups" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }
}

# Get details of all security groups to check names
data "aws_security_group" "vpc_security_group_details" {
  for_each = toset(data.aws_security_groups.vpc_security_groups.ids)
  id       = each.value
}

locals {
  existing_sg_names = [for sg in data.aws_security_group.vpc_security_group_details : sg.name]
  sg_name_exists    = contains(local.existing_sg_names, local.name_prefix)
}

# Try to find existing security group with our tag
data "aws_security_groups" "existing" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }

  filter {
    name   = "tag:Name"
    values = [local.name_prefix]
  }
}

locals {
  existing_security_group_id = length(data.aws_security_groups.existing.ids) > 0 ? tolist(data.aws_security_groups.existing.ids)[0] : null
}

# Create security group if it doesn't exist and name is available
resource "aws_security_group" "app" {
  count       = local.existing_security_group_id == null && !local.sg_name_exists ? 1 : 0
  name        = local.name_prefix
  description = "Security group for ${local.name_prefix}"
  vpc_id      = data.aws_vpc.existing.id

  lifecycle {
    precondition {
      condition     = !local.sg_name_exists
      error_message = "Security group with name ${local.name_prefix} already exists in VPC ${data.aws_vpc.existing.id}"
    }
    prevent_destroy = true
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }

  ingress {
    from_port   = 3000
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Application ports"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = local.name_prefix
  }
}

locals {
  security_group_id = local.existing_security_group_id != null ? local.existing_security_group_id : (
    !local.sg_name_exists ? aws_security_group.app[0].id : null
  )
}

# Verify we have a valid security group
resource "null_resource" "security_group_check" {
  lifecycle {
    precondition {
      condition     = local.security_group_id != null
      error_message = "No valid security group available. Either the name ${local.name_prefix} is already in use, or we couldn't find/create a security group."
    }
  }
}

# Create EC2 instance
resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = local.subnet_id
  key_name      = "kstrikis-key"

  vpc_security_group_ids = [local.security_group_id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose git
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              
              # Clone repository with specific branch
              git clone -b feat/terraform-aws https://github.com/${var.github_repo}.git /app
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

  lifecycle {
    precondition {
      condition     = local.subnet_id != null && local.security_group_id != null
      error_message = "Both subnet and security group must be available before creating EC2 instance"
    }
  }
}