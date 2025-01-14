# Infrastructure Documentation

## Overview

The application is deployed on AWS using Terraform for infrastructure as code. We use a single EC2 instance running Docker for both development and production environments.

## AWS Resources

### VPC

- ID: vpc-025ad8b8b2d701979
- Pre-existing VPC used for all environments

### Subnet

- CIDR: 10.0.1.0/24
- Availability Zone: us-east-1a
- Created if no subnet with our tag exists and CIDR is available

### Security Group

- Inbound Rules:
  - HTTP (80)
  - HTTPS (443)
  - SSH (22)
  - Application ports (3000-3001)
- Outbound Rules:
  - All traffic allowed

### EC2 Instance

- AMI: ami-079cb33ef719a7b78 (Ubuntu 24.04)
- Type: t2.micro
- Root Volume: 20GB gp3
- User Data:
  - Installs Docker and docker-compose
  - Clones repository
  - Starts application containers

## Resource Naming

All resources follow the naming convention:

```
{owner}-{project}-{environment}
```

Example: `kstrikis-chatgenius-development`

## Resource Tagging

All resources are tagged with:

- Name: {owner}-{project}-{environment}
- Environment: development/production
- Project: chatgenius
- Owner: kstrikis
- Repository: kstrikis/next-gen-messaging
- ManagedBy: terraform

## Safety Mechanisms

1. VPC Validation:

   - Verifies VPC exists before proceeding
   - Fails fast with clear error message

2. Subnet Safety:

   - Checks for existing subnet with our tag
   - Verifies CIDR block isn't in use
   - Creates new subnet only if both checks pass

3. Security Group Safety:

   - Checks for existing security group with our tag
   - Verifies name isn't in use
   - Creates new security group only if both checks pass

4. Resource Dependencies:
   - EC2 instance creation requires valid subnet and security group
   - Fails with clear error if prerequisites aren't met

## Environment Management

### Development

```bash
terraform workspace new development
terraform workspace select development
terraform plan
terraform apply
```

### Production

```bash
terraform workspace new production
terraform workspace select production
terraform plan
terraform apply
```

## Infrastructure Updates

1. Always use Terraform for changes:

   ```bash
   terraform plan    # Review changes
   terraform apply   # Apply changes
   ```

2. To destroy resources:
   ```bash
   terraform destroy
   ```

## Troubleshooting

1. VPC Issues:

   - Verify VPC ID in variables.tf
   - Check AWS console for VPC status

2. Subnet Conflicts:

   - Check existing CIDR blocks in VPC
   - Modify new_cidr in main.tf if needed

3. Security Group Issues:

   - Check for name conflicts
   - Verify port requirements

4. EC2 Issues:
   - Check instance logs
   - Verify Docker installation
   - Check application logs
