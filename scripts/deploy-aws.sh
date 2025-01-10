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

# Create user data script
USER_DATA=$(cat << 'EOF'
#!/bin/bash

# Exit on error
set -e

# Set up logging
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/app_setup_${TIMESTAMP}.log"
exec 1> >(tee -a "$LOG_FILE") 2>&1

echo "Starting setup at $(date)"
echo "Logging to $LOG_FILE"

# Function to log steps
log_step() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        log_step "✅ $1 successful"
    else
        log_step "❌ $1 failed"
        exit 1
    fi
}

# Update system packages
log_step "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
check_status "System update"

# Install Docker
log_step "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
check_status "Docker installation"

# Install Docker Compose
log_step "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
check_status "Docker Compose installation"

# Start Docker service
log_step "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker
check_status "Docker service start"

# Add ubuntu user to docker group
log_step "Adding user to docker group..."
sudo usermod -aG docker ubuntu
check_status "User group modification"

# Create app directory
log_step "Creating app directory..."
sudo mkdir -p /app
sudo chown ubuntu:ubuntu /app
cd /app
check_status "App directory creation"

# Get the instance's public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
log_step "Public IP: $PUBLIC_IP"

# Clone repository
log_step "Cloning repository..."
git clone https://github.com/kstrikis/next-gen-messaging.git .
check_status "Repository clone"

# Create .env file
log_step "Creating .env file..."
cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@db:5432/chatgenius?schema=public
PORT=3001
CORS_ORIGIN=http://${PUBLIC_IP}
EOL
check_status "Environment file creation"

# Start the application
log_step "Starting the application..."
sudo docker-compose up -d
check_status "Application startup"

log_step "✅ Setup completed successfully!"
echo "Application should be available at: http://${PUBLIC_IP}"
echo "Check logs at: $LOG_FILE"
echo "To view application logs: docker-compose logs -f"
EOF
)

# Launch EC2 instance
echo "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-08353a303889d045d \
    --instance-type t2.micro \
    --key-name $KEY_NAME \
    --subnet-id $SUBNET_ID \
    --security-group-ids $SECURITY_GROUP_ID \
    --user-data "$USER_DATA" \
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
echo "To check setup progress: ssh -i $KEY_FILE ubuntu@$PUBLIC_IP 'tail -f /var/log/app_setup_*.log'" 