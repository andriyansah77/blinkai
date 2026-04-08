#!/bin/bash

# 🔄 Update BlinkAI from GitHub
# Script untuk update aplikasi dari GitHub repository

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "❌ Error: This script must be run from the BlinkAI project directory"
    echo "Make sure you're in the directory that contains package.json and .git folder"
    exit 1
fi

print_status "🔄 Starting BlinkAI update from GitHub..."

# Step 1: Check git status
print_status "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to stash these changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before update $(date)"
        print_success "Changes stashed"
    else
        print_warning "Continuing with uncommitted changes..."
    fi
fi

# Step 2: Fetch and pull latest changes
print_status "📥 Fetching latest changes from GitHub..."
git fetch origin

# Check if there are updates
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    print_success "✅ Already up to date!"
    echo "No updates available from GitHub."
    exit 0
fi

print_status "📥 Pulling latest changes..."
git pull origin main

# Step 3: Check if package.json changed
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
    print_status "📦 package.json changed, updating dependencies..."
    npm install
else
    print_status "📦 Installing/updating dependencies..."
    npm install
fi

# Step 4: Run tests if Hermes is available
print_status "🧪 Testing Hermes CLI connection..."
if npm run test:hermes > /dev/null 2>&1; then
    print_success "Hermes CLI test passed"
else
    print_warning "Hermes CLI test failed, but continuing..."
fi

# Step 5: Run database migrations if needed
if git diff --name-only HEAD~1 HEAD | grep -q "prisma/schema.prisma"; then
    print_status "🗄️ Database schema changed, running migrations..."
    npm run db:push
else
    print_status "🗄️ Checking database..."
    npm run db:push > /dev/null 2>&1 || true
fi

# Step 6: Build application
print_status "🏗️ Building application..."
npm run build

# Step 7: Restart PM2 if running
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "blinkai"; then
        print_status "🔄 Restarting application with PM2..."
        pm2 restart blinkai
        
        # Wait a moment for restart
        sleep 3
        
        # Check status
        if pm2 list | grep "blinkai" | grep -q "online"; then
            print_success "Application restarted successfully"
        else
            print_warning "Application may have issues, check logs:"
            echo "pm2 logs blinkai"
        fi
    else
        print_warning "PM2 process 'blinkai' not found"
        echo "Start it manually with: pm2 start npm --name 'blinkai' -- start"
    fi
else
    print_warning "PM2 not found, restart application manually"
fi

# Step 8: Show update summary
print_success "🎉 Update completed successfully!"
echo ""
echo "📋 Update Summary:"
echo "  📥 Latest changes pulled from GitHub"
echo "  📦 Dependencies updated"
echo "  🏗️ Application rebuilt"
echo "  🔄 PM2 process restarted"
echo ""
echo "🔍 Verification:"
echo "  📊 Check status: pm2 status"
echo "  📝 View logs: pm2 logs blinkai"
echo "  🌐 Test API: curl http://localhost:3000/api/hermes/status"
echo ""

# Step 9: Show recent commits
print_status "📝 Recent changes:"
git log --oneline -5

echo ""
print_success "✅ BlinkAI update completed!"