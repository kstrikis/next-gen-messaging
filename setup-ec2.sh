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

# Add current user to docker group
log_step "Adding user to docker group..."
sudo usermod -aG docker $USER
check_status "User group modification"

# Create app directory
log_step "Creating app directory..."
sudo mkdir -p /app
sudo chown $USER:$USER /app
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