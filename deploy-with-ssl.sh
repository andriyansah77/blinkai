#!/bin/bash

# Complete Deployment Script with SSL Setup
# This script deploys ReAgent to VPS and configures SSL

set -e

VPS_IP="188.166.247.252"
VPS_USER="root"
DOMAIN="reagent.eu.cc"
SUBDOMAIN="mining.reagent.eu.cc"

echo "🚀 ReAgent Complete Deployment with SSL"
echo "========================================"
echo ""

# Step 1: Push to GitHub
echo "📤 Step 1: Pushing to GitHub..."
git add .
git commit -m "Deploy with SSL setup" || echo "No changes to commit"
git push
echo "✅ Pushed to GitHub"
echo ""

# Step 2: Pull on VPS and rebuild
echo "📥 Step 2: Deploying to VPS..."
ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /root/reagent
echo "Pulling latest changes..."
git pull
echo "Removing old build..."
rm -rf .next node_modules/.cache
echo "Building application..."
npm run build
echo "Restarting PM2..."
pm2 restart reagent --update-env
echo "✅ Application deployed"
ENDSSH
echo ""

# Step 3: Check if SSL is already setup
echo "🔒 Step 3: Checking SSL status..."
SSL_EXISTS=$(ssh ${VPS_USER}@${VPS_IP} "[ -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ] && echo 'yes' || echo 'no'")

if [ "$SSL_EXISTS" = "no" ]; then
    echo "SSL not found. Setting up SSL..."
    
    # Upload SSL setup script
    echo "Uploading SSL setup script..."
    scp setup-ssl-vps.sh ${VPS_USER}@${VPS_IP}:/root/
    
    # Run SSL setup
    echo "Running SSL setup..."
    ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
chmod +x /root/setup-ssl-vps.sh
/root/setup-ssl-vps.sh
ENDSSH
    
    # Update .env to use HTTPS
    echo "Updating .env to use HTTPS..."
    ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /root/reagent
sed -i 's|NEXTAUTH_URL="http://|NEXTAUTH_URL="https://|g' .env
pm2 restart reagent --update-env
ENDSSH
    
    echo "✅ SSL setup complete"
else
    echo "✅ SSL already configured"
fi
echo ""

# Step 4: Verify deployment
echo "🧪 Step 4: Verifying deployment..."

# Check if HTTPS is working
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN} || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ HTTPS is working (Status: $HTTP_STATUS)"
else
    echo "⚠️  HTTPS returned status: $HTTP_STATUS"
    echo "   Checking HTTP..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${VPS_IP} || echo "000")
    echo "   HTTP Status: $HTTP_STATUS"
fi

# Check PM2 status
echo ""
echo "PM2 Status:"
ssh ${VPS_USER}@${VPS_IP} "pm2 status reagent"

echo ""
echo "========================================"
echo "🎉 Deployment Complete!"
echo "========================================"
echo ""
echo "🌐 Access your application:"
if [ "$SSL_EXISTS" = "yes" ] || [ "$HTTP_STATUS" = "200" ]; then
    echo "   https://${DOMAIN}"
    echo "   https://${SUBDOMAIN}"
else
    echo "   http://${VPS_IP}"
    echo ""
    echo "⚠️  SSL setup may need DNS propagation (5-10 minutes)"
    echo "   Once DNS is ready, run: ssh ${VPS_USER}@${VPS_IP} '/root/setup-ssl-vps.sh'"
fi
echo ""
echo "📊 View logs:"
echo "   ssh ${VPS_USER}@${VPS_IP} 'pm2 logs reagent'"
echo ""
echo "🔄 Quick commands:"
echo "   Deploy updates: ./deploy-with-ssl.sh"
echo "   Restart app: ssh ${VPS_USER}@${VPS_IP} 'pm2 restart reagent'"
echo "   View status: ssh ${VPS_USER}@${VPS_IP} 'pm2 status'"
echo ""
