#!/bin/bash

# 🚀 GitHub Deployment Setup Script
# Script untuk setup deployment ReAgent via GitHub ke VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
GITHUB_REPO=""
VPS_USER=""
VPS_HOST=""
VPS_PORT="22"

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -r, --repo REPO       GitHub repository (username/repo-name)"
    echo "  -u, --user USER       VPS username"
    echo "  -h, --host HOST       VPS IP address or domain"
    echo "  -p, --port PORT       SSH port (default: 22)"
    echo "  --help                Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -r myusername/reagent -u root -h 192.168.1.100"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--repo)
            GITHUB_REPO="$2"
            shift 2
            ;;
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

# Validate parameters
if [[ -z "$GITHUB_REPO" || -z "$VPS_USER" || -z "$VPS_HOST" ]]; then
    print_error "GitHub repo, VPS user, and host are required!"
    show_usage
    exit 1
fi

print_status "🚀 Setting up GitHub deployment for ReAgent..."
print_status "Repository: https://github.com/$GITHUB_REPO"
print_status "Target VPS: $VPS_USER@$VPS_HOST:$VPS_PORT"

# Step 1: Test VPS connection
print_status "📡 Testing VPS connection..."
if ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'Connection successful'" > /dev/null 2>&1; then
    print_success "VPS connection established"
else
    print_error "Cannot connect to VPS"
    exit 1
fi

# Step 2: Setup SSH key for GitHub on VPS
print_status "🔑 Setting up SSH key for GitHub on VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
    # Check if SSH key already exists
    if [ ! -f ~/.ssh/id_ed25519 ]; then
        echo "Generating SSH key for GitHub..."
        ssh-keygen -t ed25519 -C "vps-deploy-key" -f ~/.ssh/id_ed25519 -N ""
        echo "SSH key generated successfully"
    else
        echo "SSH key already exists"
    fi
    
    # Add GitHub to known hosts
    ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null || true
    
    echo "=== PUBLIC SSH KEY ==="
    echo "Copy this key and add it to your GitHub repository:"
    echo "https://github.com/settings/keys"
    echo ""
    cat ~/.ssh/id_ed25519.pub
    echo ""
    echo "======================"
EOF

print_warning "Please add the SSH key above to your GitHub account:"
print_warning "1. Go to https://github.com/settings/keys"
print_warning "2. Click 'New SSH key'"
print_warning "3. Paste the public key and save"
read -p "Press Enter after adding the SSH key to GitHub..."

# Step 3: Test GitHub connection from VPS
print_status "🔍 Testing GitHub connection from VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
    echo "Testing GitHub SSH connection..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo "✅ GitHub SSH connection successful"
    else
        echo "❌ GitHub SSH connection failed"
        echo "Please check if you added the SSH key correctly"
        exit 1
    fi
EOF

if [ $? -ne 0 ]; then
    print_error "GitHub SSH setup failed"
    exit 1
fi

# Step 4: Clone repository and setup
print_status "📦 Cloning repository and setting up application..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
    # Remove existing directory if exists
    if [ -d "reagent" ]; then
        echo "Removing existing reagent directory..."
        rm -rf reagent
    fi
    
    # Clone repository
    echo "Cloning repository..."
    git clone git@github.com:$GITHUB_REPO.git reagent
    cd reagent
    
    # Check prerequisites
    echo "Checking prerequisites..."
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found"
        exit 1
    fi
    
    if ! command -v hermes &> /dev/null; then
        echo "❌ Hermes CLI not found"
        exit 1
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Setup environment
    echo "Setting up environment..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env file with your configuration"
    fi
    
    # Test Hermes
    echo "Testing Hermes CLI..."
    npm run test:hermes || echo "⚠️  Hermes test failed, check configuration later"
    
    # Setup database
    echo "Setting up database..."
    npm run setup
    
    # Build application
    echo "Building application..."
    npm run build
    
    # Install PM2 if not available
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi
    
    # Start application
    echo "Starting application with PM2..."
    pm2 delete reagent 2>/dev/null || true
    pm2 start npm --name "reagent" -- start
    pm2 save
    
    # Setup auto-restart
    pm2 startup | grep -E '^sudo' | bash || true
    
    echo "✅ Application deployed successfully!"
    pm2 status
EOF

if [ $? -ne 0 ]; then
    print_error "Deployment setup failed"
    exit 1
fi

# Step 5: Create update script on VPS
print_status "📝 Creating update script on VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
    cat > ~/update-reagent.sh << 'SCRIPT'
#!/bin/bash
set -e

echo "🔄 Updating ReAgent from GitHub..."
cd ~/reagent

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building application..."
npm run build

echo "🔄 Restarting application..."
pm2 restart reagent

echo "✅ Update completed successfully!"
pm2 status
SCRIPT

    chmod +x ~/update-reagent.sh
    echo "✅ Update script created at ~/update-reagent.sh"
EOF

# Step 6: Create GitHub Actions workflow (optional)
print_status "🤖 Creating GitHub Actions workflow..."
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << EOF
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: \${{ secrets.VPS_HOST }}
        username: \${{ secrets.VPS_USER }}
        key: \${{ secrets.VPS_SSH_KEY }}
        port: \${{ secrets.VPS_PORT }}
        script: |
          cd reagent
          git pull origin main
          npm install
          npm run build
          pm2 restart reagent
          echo "✅ Auto-deployment completed!"
EOF

print_success "🎉 GitHub deployment setup completed!"
echo ""
echo "📋 Setup Summary:"
echo "  ✅ SSH key generated and configured"
echo "  ✅ Repository cloned to VPS"
echo "  ✅ Application deployed and running"
echo "  ✅ PM2 configured for auto-restart"
echo "  ✅ Update script created"
echo "  ✅ GitHub Actions workflow created"
echo ""
echo "🌐 Access Information:"
echo "  🔗 Application: http://$VPS_HOST:3000"
echo "  📊 API Status: http://$VPS_HOST:3000/api/hermes/status"
echo "  🧪 Test Hermes: http://$VPS_HOST:3000/api/hermes/test"
echo ""
echo "🔧 Management Commands:"
echo "  📊 Check status: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 status'"
echo "  🔄 Update app: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST '~/update-blinkai.sh'"
echo "  📝 View logs: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'pm2 logs blinkai'"
echo ""
echo "🤖 Auto-Deployment Setup (Optional):"
echo "  1. Go to https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo "  2. Add these secrets:"
echo "     - VPS_HOST: $VPS_HOST"
echo "     - VPS_USER: $VPS_USER"
echo "     - VPS_PORT: $VPS_PORT"
echo "     - VPS_SSH_KEY: (private SSH key from VPS)"
echo "  3. Push .github/workflows/deploy.yml to enable auto-deployment"
echo ""
echo "⚠️  Important Next Steps:"
echo "  1. Edit .env file on VPS with your API keys"
echo "  2. Test the application in browser"
echo "  3. Setup domain/SSL if needed"
echo "  4. Configure firewall for port 3000"
echo ""
print_success "🚀 BlinkAI is now ready for GitHub-based deployment!"