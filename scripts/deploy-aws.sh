#!/bin/bash

# Exit on error
set -e

# Set up logging
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deploy_${TIMESTAMP}.log"
exec 1> >(tee -a "$LOG_FILE") 2>&1

echo "Starting deployment at $(date)"
echo "Logging to $LOG_FILE"

# Set AWS region
export AWS_DEFAULT_REGION="us-east-1"

echo "🚀 Starting deployment process..."

# Get existing VPC
echo "Getting shared VPC..."
VPC_ID=$(aws ec2 describe-vpcs \
    --vpc-ids vpc-025ad8b8b2d701979 \
    --query 'Vpcs[0].VpcId' \
    --output text)

if [ -z "$VPC_ID" ]; then
    echo "❌ Could not find VPC"
    exit 1
fi

echo "Found VPC: $VPC_ID"

# Use existing subnet
SUBNET_ID="subnet-0245a1065b564d276"
echo "Using existing subnet: $SUBNET_ID"

# Use existing security group
SECURITY_GROUP_ID="sg-020435edf9410848f"
echo "Using existing security group: $SECURITY_GROUP_ID"

# Create or use existing key pair
KEY_NAME="chatgenius-key"
KEY_FILE="$KEY_NAME.pem"

if [ ! -f "$KEY_FILE" ]; then
    echo "Key file not found, checking if key pair exists in AWS..."
    if aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
        echo "Key pair exists in AWS but no local key file. Please provide the existing key file or delete the key pair from AWS."
        exit 1
    else
        echo "Creating new key pair..."
        aws ec2 create-key-pair \
            --key-name $KEY_NAME \
            --query 'KeyMaterial' \
            --output text > $KEY_FILE
        chmod 400 $KEY_FILE
    fi
else
    echo "Using existing key pair and key file"
fi

# Use existing instance
echo "Using existing instance..."
INSTANCE_ID="i-00b9543a918aee8bb"

# Send setup script to instance
echo "Sending setup script to instance..."
SETUP_SCRIPT=$(cat setup-instance.sh)
aws ec2 modify-instance-attribute \
    --instance-id $INSTANCE_ID \
    --attribute userData \
    --value "$SETUP_SCRIPT"

# Restart the instance to apply user data
echo "Restarting instance to apply changes..."
aws ec2 stop-instances --instance-ids $INSTANCE_ID
aws ec2 wait instance-stopped --instance-ids $INSTANCE_ID
aws ec2 start-instances --instance-ids $INSTANCE_ID
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
echo "To check setup progress: ssh -i $KEY_FILE ubuntu@$PUBLIC_IP 'tail -f /var/log/app_setup_*.log'" 