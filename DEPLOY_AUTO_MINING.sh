#!/bin/bash

# Deploy AI Agent Auto Mining Feature to VPS
# Run this script on VPS: bash DEPLOY_AUTO_MINING.sh

set -e

echo "=========================================="
echo "Deploying AI Agent Auto Mining Feature"
echo "=========================================="

# Navigate to project directory
cd /root/reagent

echo ""
echo "1. Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "2. Installing dependencies..."
npm install

echo ""
echo "3. Building application..."
npm run build

echo ""
echo "4. Restarting PM2 process..."
pm2 restart reagent

echo ""
echo "5. Copying updated Hermes skill..."
cp /root/reagent/hermes-skills/auto_mining_skill.py /root/.hermes/skills/
cp /root/reagent/hermes-skills/auto_mining_skill.json /root/.hermes/skills/

echo ""
echo "6. Checking PM2 status..."
pm2 status

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open https://reagent.eu.cc in browser"
echo "2. Hard refresh (Ctrl+Shift+R)"
echo "3. Go to Mining page"
echo "4. Enable managed wallet from AI Agent Setup section"
echo "5. Test auto mining with AI agent"
echo ""
echo "To view logs:"
echo "  pm2 logs reagent"
echo ""
echo "To monitor:"
echo "  pm2 monit"
echo ""
