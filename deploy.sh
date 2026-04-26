#!/bin/bash

# AI Assistant Platform Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment of AI Assistant Platform..."

# Configuration
PROJECT_NAME="ai-assistant-platform"
PROJECT_DIR="/opt/$PROJECT_NAME"
GITHUB_REPO=""  # 如果有 GitHub 仓库，填写这里

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create project directory
print_info "Creating project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Check if source code exists
if [ ! -f "package.json" ]; then
    print_warn "Source code not found in $PROJECT_DIR"
    print_info "Please upload the project files to $PROJECT_DIR first:"
    echo "  scp -r ai-assistant-platform/my-app/* root@8.155.53.159:$PROJECT_DIR/"
    exit 1
fi

# Create environment file if not exists
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
# 使用远程 PostgreSQL 或本地 Docker PostgreSQL
DATABASE_URL="postgresql://admin:admin123@8.155.53.159:5432/pgsql"

# NextAuth Configuration
NEXTAUTH_URL="http://8.155.53.159:3000"
NEXTAUTH_SECRET="change-this-to-a-random-secret-key-min-32-chars"

# OpenAI API Configuration (Required)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# App Configuration
NEXT_PUBLIC_APP_NAME="AI Assistant Platform"
NEXT_PUBLIC_APP_URL="http://8.155.53.159:3000"
EOF
    print_warn "Please edit .env file and set your OPENAI_API_KEY and other configurations"
    nano .env
fi

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Remove old images
print_info "Cleaning up old images..."
docker rmi ${PROJECT_NAME}-app 2>/dev/null || true

# Build and start
print_info "Building Docker image..."
docker-compose build --no-cache

print_info "Starting services..."
docker-compose up -d

# Wait for service to be ready
print_info "Waiting for service to start..."
sleep 10

# Check health
print_info "Checking service health..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_info "✅ Service is running successfully!"
    print_info "🌐 Access your application at: http://8.155.53.159:3000"
else
    print_warn "⚠️  Service may still be starting. Check logs with: docker-compose logs -f"
fi

# Setup Nginx reverse proxy (optional)
if command -v nginx &> /dev/null; then
    print_info "Nginx detected. Do you want to configure reverse proxy? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        cat > /etc/nginx/conf.d/ai-assistant.conf << 'EOF'
server {
    listen 80;
    server_name 8.155.53.159;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
        nginx -t && systemctl reload nginx
        print_info "Nginx configured successfully"
    fi
fi

print_info "📊 Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop service:  docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Update:        ./deploy.sh"

print_info "🎉 Deployment completed!"
