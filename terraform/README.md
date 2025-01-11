# Terraform Infrastructure

This directory contains Terraform configurations for deploying the ChatGenius application to AWS in both development and production environments.

## Prerequisites

- Terraform installed
- AWS CLI configured with appropriate credentials
- Git installed

## Structure

```
terraform/
├── main.tf           # Main infrastructure configuration
├── variables.tf      # Variable definitions
├── outputs.tf        # Output definitions
└── versions.tf       # Provider and version configurations
```

## Usage

1. Initialize Terraform:

```bash
terraform init
```

2. Select workspace (environment):

For development:

```bash
terraform workspace new development
# or select if it exists
terraform workspace select development
```

For production:

```bash
terraform workspace new production
# or select if it exists
terraform workspace select production
```

3. Plan the deployment:

```bash
terraform plan
```

4. Apply the configuration:

```bash
terraform apply
```

5. To destroy the infrastructure:

```bash
terraform destroy
```

## Variables

Key variables are set with defaults but can be overridden:

- `vpc_id`: The ID of the existing VPC
- `owner_name`: Owner name tag for resources
- `project_name`: Project name tag for resources
- `github_repo`: GitHub repository for the project
- `ami_id`: Ubuntu 24.04 AMI ID
- `instance_type`: EC2 instance type

## Outputs

After applying, you'll see:

- `instance_id`: ID of the EC2 instance
- `instance_public_ip`: Public IP address
- `instance_public_dns`: Public DNS name
- `subnet_id`: ID of the subnet
- `security_group_id`: ID of the security group

## Notes

- The configuration will look for existing resources with matching tags before creating new ones
- Each environment (development/production) maintains its own state
- Resources are tagged with environment, project, and owner information
