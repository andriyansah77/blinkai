#!/bin/bash
# Activate HTTPS for mining.reagent.eu.cc
# Run these commands step by step

echo "═══════════════════════════════════════════════════════════════════"
echo "  HTTPS Activation for mining.reagent.eu.cc"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANT: Before running this script:"
echo "   1. Add DNS record in Cloudflare:"
echo "      Type: A, Name: mining, IPv4: 159.65.141.68, Proxy: ON"
echo "   2. Wait 5 minutes for DNS propagation"
echo "   3. Verify: nslookup mining.reagent.eu.cc"
echo ""
read -p "Have you completed the DNS setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete DNS setup first, then run this script again."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Step 1: Get SSL Certificate"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Get email for SSL certificate
read -p "Enter your email for SSL certificate: " EMAIL

echo ""
echo "Getting SSL certificate from Let's Encrypt..."
echo ""

ssh root@159.65.141.68 << EOSSH
set -e
echo "Stopping nginx..."
systemctl stop nginx

echo "Getting SSL certificate..."
certbot certonly --standalone -d mining.reagent.eu.cc \
  --email $EMAIL \
  --agree-tos \
  --non-interactive

echo "Verifying certificate..."
ls -la /etc/letsencrypt/live/mining.reagent.eu.cc/

echo "Certificate obtained successfully!"
EOSSH

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Step 2: Upload SSL-Enabled Nginx Config"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "Uploading nginx configuration..."
scp blinkai/nginx-mining-subdomain.conf root@159.65.141.68:/etc/nginx/sites-available/mining.reagent.eu.cc

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Step 3: Start Nginx with HTTPS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

ssh root@159.65.141.68 << EOSSH
set -e
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
systemctl start nginx

echo "Checking nginx status..."
systemctl status nginx --no-pager | head -10
EOSSH

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Step 4: Verification"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "Waiting 5 seconds for nginx to fully start..."
sleep 5

echo "Testing HTTPS endpoints..."
echo ""

echo "1. Health page:"
curl -I https://mining.reagent.eu.cc/health 2>&1 | head -5

echo ""
echo "2. Documentation:"
curl -I https://mining.reagent.eu.cc/docs 2>&1 | head -5

echo ""
echo "3. Minting skill:"
curl -I https://mining.reagent.eu.cc/skills/minting.sh 2>&1 | head -5

echo ""
echo "4. Wallet skill:"
curl -I https://mining.reagent.eu.cc/skills/wallet.sh 2>&1 | head -5

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  ✅ HTTPS Activation Complete!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your subdomain is now live at:"
echo "   https://mining.reagent.eu.cc"
echo ""
echo "📚 Available URLs:"
echo "   Documentation: https://mining.reagent.eu.cc/docs"
echo "   Health Status: https://mining.reagent.eu.cc/health"
echo "   Minting Skill: https://mining.reagent.eu.cc/skills/minting.sh"
echo "   Wallet Skill:  https://mining.reagent.eu.cc/skills/wallet.sh"
echo ""
echo "🔧 Installation for other agents:"
echo "   curl -O https://mining.reagent.eu.cc/skills/minting.sh"
echo "   curl -O https://mining.reagent.eu.cc/skills/wallet.sh"
echo ""
echo "🔄 SSL certificate will auto-renew via certbot"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
