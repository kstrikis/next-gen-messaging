#!/bin/bash

# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Create app directory
mkdir -p /app
cd /app

# Clone repository (you'll need to replace with your actual repo URL)
git clone https://github.com/yourusername/chatgenius2.git .

# Create .env file
cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@db:5432/chatgenius?schema=public
PORT=3001
CORS_ORIGIN=http://localhost
EOL

# Start the application
sudo docker-compose up -d

# Print the public IP
echo "Application is starting..."
echo "Public IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" 