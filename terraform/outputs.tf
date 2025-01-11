output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.app.public_dns
}

output "subnet_id" {
  description = "ID of the subnet"
  value       = local.subnet_id
}

output "security_group_id" {
  description = "ID of the security group"
  value       = local.security_group_id
}