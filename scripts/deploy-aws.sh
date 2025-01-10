#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Please create a .env file with AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
    exit 1
fi

source .env

# Check required environment variables
required_vars=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env file"
        exit 1
    fi
done

# Set AWS region
export AWS_DEFAULT_REGION="us-east-1"

echo "🚀 Starting deployment process..."

# Create security group
echo "Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name chatgenius-sg \
    --description "Security group for ChatGenius application" \
    --output text \
    --query 'GroupId' 2>/dev/null || \
    aws ec2 describe-security-groups \
    --group-names chatgenius-sg \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# Configure security group rules
echo "Configuring security group rules..."
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 2>/dev/null || true

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 2>/dev/null || true

# Create key pair
KEY_NAME="chatgenius-key"
KEY_FILE="$KEY_NAME.pem"

if [ ! -f "$KEY_FILE" ]; then
    echo "Creating new key pair..."
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --query 'KeyMaterial' \
        --output text > $KEY_FILE
    chmod 400 $KEY_FILE
fi

# Launch EC2 instance
echo "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c7217cdde317cfec \  # Ubuntu 22.04 LTS in us-east-1
    --instance-type t2.micro \
    --key-name $KEY_NAME \
    --security-group-ids $SECURITY_GROUP_ID \
    --user-data file://setup-ec2.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=chatgenius}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get instance public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "✅ Deployment completed!"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "SSH access: ssh -i $KEY_FILE ubuntu@$PUBLIC_IP"
echo "Application will be available at: http://$PUBLIC_IP"
echo "Initial setup may take a few minutes to complete..." 