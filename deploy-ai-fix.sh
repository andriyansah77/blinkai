#!/bin/bash

# Deploy AI Agent Context Fix to VPS
echo "🚀 Deploying AI agent context fix to VPS..."

cd /root/blinkai

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "🔄 Restarting PM2 with updated environment..."
pm2 restart reagent --update-env

echo "✅ Deployment complete!"
echo ""
echo "📊 Checking PM2 status..."
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs reagent --lines 20 --nostream

echo ""
echo "🎉 AI agent should now maintain context without 504 timeouts!"
echo "💡 Conversation history is limited to last 6 messages (3 exchanges)"
