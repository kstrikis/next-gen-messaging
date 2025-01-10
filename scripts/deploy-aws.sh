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

# Get Internet Gateway ID
IGW_ID=$(aws ec2 describe-internet-gateways \
    --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
    --query 'InternetGateways[0].InternetGatewayId' \
    --output text)

# Create our own subnet
echo "Creating subnet..."
SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.1.100.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=kstrikis-week1-chatgenius-subnet}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# Enable auto-assign public IP on subnet
aws ec2 modify-subnet-attribute \
    --subnet-id $SUBNET_ID \
    --map-public-ip-on-launch

# Get main route table ID
ROUTE_TABLE_ID=$(aws ec2 describe-route-tables \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=association.main,Values=true" \
    --query 'RouteTables[0].RouteTableId' \
    --output text)

# Associate route table with our subnet
aws ec2 associate-route-table \
    --route-table-id $ROUTE_TABLE_ID \
    --subnet-id $SUBNET_ID

# Create security group
echo "Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name chatgenius-sg \
    --description "Security group for ChatGenius application" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=kstrikis-week1-chatgenius-sg}]" \
    --output text \
    --query 'GroupId')

# Configure security group rules
echo "Configuring security group rules..."
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

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
    --image-id ami-08353a303889d045d \
    --instance-type t2.micro \
    --key-name $KEY_NAME \
    --subnet-id $SUBNET_ID \
    --security-group-ids $SECURITY_GROUP_ID \
    --user-data file://setup-ec2.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=kstrikis-week1-chatgenius}]" \
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