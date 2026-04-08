#!/bin/bash

# Update VPS from GitHub
cd blinkai || exit 1

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main

echo "📦 Fixing package.json dependencies..."
# Fix any dependency issues
sed -i 's/"@types\/marked": "^12\.0\.0"/"@types\/marked": "^5.0.0"/' package.json

echo "📦 Installing/updating dependencies..."
npm install

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🗄️ Setting up database..."
npm run db:push

echo "🏗️ Building application..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart blinkai || pm2 start npm --name "blinkai" -- start

echo "✅ Update completed!"
pm2 status