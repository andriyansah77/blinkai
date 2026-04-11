#!/bin/bash

# Update VPS from GitHub
# This script connects to VPS via SSH and pulls latest changes

VPS_HOST="159.65.141.68"
VPS_USER="root"
APP_DIR="/root/blinkai"

echo "🚀 Updating VPS from GitHub..."
echo "================================"

# SSH to VPS and execute commands
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
  cd /root/blinkai
  
  echo "📥 Pulling latest changes from GitHub..."
  git pull origin main
  
  echo "📦 Installing dependencies..."
  npm install
  
  echo "🗄️  Running database migrations..."
  npx prisma migrate deploy
  
  echo "🔨 Building application..."
  npm run build
  
  echo "🔄 Restarting PM2 process..."
  pm2 restart reagent || pm2 start npm --name reagent -- start
  
  echo "✅ VPS update complete!"
  echo ""
  echo "📊 PM2 Status:"
  pm2 status
ENDSSH

echo ""
echo "✅ Deployment to VPS completed successfully!"
echo "🌐 Application should be running at: http://${VPS_HOST}:3000"
