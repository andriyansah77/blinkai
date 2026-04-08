#!/bin/bash

# 🚀 BlinkAI VPS Deployment Script
# Script otomatis untuk deploy BlinkAI ke VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
VPS_USER=""
VPS_HOST=""
VPS_PORT="22"
APP_DIR="/home/$VPS_USER/blinkai"
LOCAL_DIR="."

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -u, --user USER       VPS username"
    echo "  -h, --host HOST       VPS IP address or domain"
    echo "  -p, --port PORT       SSH port (default: 22)"
    echo "  -d, --dir DIR         Remote directory (default: /home/USER/blinkai)"
    echo "  --help                Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -u root -h 192.168.1.100"
    echo "  $0 -u ubuntu -h mydomain.com -p 2222"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--user)
            VPS_USER="$2"
            shift 2
            ;;
        -h|--host)
            VPS_HOST="$2"
            shift 2
            ;;
        -p|--port)
            VPS_PORT="$2"
            shift 2
            ;;
        -d|--dir)
            APP_DIR="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$VPS_USER" || -z "$VPS_HOST" ]]; then
    print_error "VPS user and host are required!"
    show_usage
    exit 1
fi

# Update APP_DIR with actual user
APP_DIR="/home/$VPS_USER/blinkai"

print_status "🚀 Starting BlinkAI deployment to VPS..."
print_status "Target: $VPS_USER@$VPS_HOST:$VPS_PORT"
print_status "Directory: $APP_DIR"

# Step 1: Test SSH connection
print_status "📡 Testing SSH connection..."
if ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
    print_success "SSH connection established"
else
    print_error "Cannot connect to VPS via SSH"
    print_error "Please check your credentials and network connection"
    exit 1
fi

# Step 2: Check prerequisites on VPS
print_status "🔍 Checking VPS prerequisites..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
    echo "Checking Node.js..."
    if command -v node &> /dev/null; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js not found"
        exit 1
    fi
    
    echo "Checking npm..."
    if command -v npm &> /dev/null; then
        echo "✅ npm: $(npm --version)"
    else
        echo "❌ npm not found"
        exit 1
    fi
    
    echo "Checking Hermes CLI..."
    if command -v hermes &> /dev/null; then
        echo "✅ Hermes CLI: $(hermes --version)"
    else
        echo "❌ Hermes CLI not found"
        exit 1
    fi
    
    echo "Checking PM2..."
    if command -v pm2 &> /dev/null; then
        echo "✅ PM2: $(pm2 --version)"
    else
        echo "⚠️  PM2 not found, will install later"
    fi
EOF

if [ $? -ne 0 ]; then
    print_error "Prerequisites check failed"
    exit 1
fi

print_success "Prerequisites check passed"

# Step 3: Create project directory
print_status "📁 Creating project directory..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "mkdir -p $APP_DIR"

# Step 4: Upload project files
print_status "📤 Uploading project files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'prisma/dev.db' \
    --exclude '.env' \
    -e "ssh -p $VPS_PORT" \
    $LOCAL_DIR/ $VPS_USER@$VPS_HOST:$APP_DIR/

print_success "Project files uploaded"

# Step 5: Install dependencies and setup
print_status "📦 Installing dependencies and setting up application..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
    cd $APP_DIR
    
    echo "Installing npm dependencies..."
    npm install
    
    echo "Setting up environment file..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env file with your configuration"
    fi
    
    echo "Testing Hermes CLI connection..."
    npm run test:hermes || echo "⚠️  Hermes test failed, check configuration"
    
    echo "Setting up database..."
    npm run setup
    
    echo "Building application..."
    npm run build
    
    echo "Installing PM2 if not available..."
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
EOF

if [ $? -ne 0 ]; then
    print_error "Setup failed"
    exit 1
fi

print_success "Application setup completed"

# Step 6: Start application with PM2
print_status "🚀 Starting application with PM2..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
    cd $APP_DIR
    
    # Stop existing instance if running
    pm2 delete blinkai 2>/dev/null || true
    
    # Start new instance
    pm2 start npm --name "blinkai" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Setup auto-restart on boot
    pm2 startup | grep -E '^sudo' | bash || true
    
    echo "Application started successfully!"
    pm2 status
EOF

print_success "Application deployed and started"

# Step 7: Show access information
print_status "🌐 Deployment completed successfully!"
echo ""
echo "📋 Access Information:"
echo "  🔗 Application URL: http://$VPS_HOST:3000"
echo "  📊 API Status: http://$VPS_HOST:3000/api/hermes/status"
echo "  🧪 Test Hermes: http://$VPS_HOST:3000/api/hermes/test"
echo ""
echo "🔧 Management Commands:"
echo "  📊 Check status: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 status'"
echo "  📝 View logs: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 logs blinkai'"
echo "  🔄 Restart app: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 restart blinkai'"
echo "  🛑 Stop app: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 stop blinkai'"
echo ""
echo "⚠️  Important Next Steps:"
echo "  1. Edit .env file on VPS with your API keys"
echo "  2. Configure domain/SSL if needed"
echo "  3. Setup firewall rules for port 3000"
echo "  4. Test the application in browser"
echo ""
print_success "🎉 BlinkAI deployment completed!"