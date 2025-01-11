variable "vpc_id" {
  description = "The ID of the existing VPC"
  type        = string
  default     = "vpc-025ad8b8b2d701979"
}

variable "owner_name" {
  description = "Owner name tag for resources"
  type        = string
  default     = "kstrikis"
}

variable "project_name" {
  description = "Project name tag for resources"
  type        = string
  default     = "chatgenius"
}

variable "github_repo" {
  description = "GitHub repository for the project"
  type        = string
  default     = "kstrikis/next-gen-messaging"
}

variable "ami_id" {
  description = "Ubuntu 24.04 AMI ID"
  type        = string
  default     = "ami-079cb33ef719a7b78"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "environment_name" {
  description = "Environment name (production or development)"
  type        = string
  default     = "development"
}