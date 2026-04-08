#!/bin/bash

# Update VPS from GitHub
set -e

echo "🔄 Updating BlinkAI from GitHub..."

# Navigate to project directory
cd ~/blinkai

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔧 Fixing package.json dependencies..."
sed -i 's/"@types\/marked": "\^12\.0\.0"/"@types\/marked": "^5.0.0"/' package.json

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🗄️ Setting up database..."
npm run db:push

echo "🏗️ Building application..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart blinkai

echo "📊 Checking status..."
pm2 status

echo "✅ Update completed successfully!"
echo "🌐 Application: http://159.65.141.68:3000"