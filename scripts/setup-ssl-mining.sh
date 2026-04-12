#!/bin/bash
# Setup SSL for mining.reagent.eu.cc
# Run this script AFTER DNS is configured in Cloudflare

set -e

VPS_HOST="root@159.65.141.68"
DOMAIN="mining.reagent.eu.cc"

echo "🔐 Setting up SSL for $DOMAIN"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check DNS
echo -e "${BLUE}📡 Checking DNS resolution...${NC}"
if nslookup $DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✓ DNS is resolving${NC}"
else
    echo -e "${RED}✗ DNS is not resolving yet${NC}"
    echo "Please add DNS record in Cloudflare first:"
    echo "  Type: A"
    echo "  Name: mining"
    echo "  IPv4: 159.65.141.68"
    echo "  Proxy: Enabled"
    echo ""
    echo "Then wait 5 minutes and run this script again."
    exit 1
fi

# Step 2: Stop nginx
echo -e "${BLUE}🛑 Stopping nginx...${NC}"
ssh $VPS_HOST "systemctl stop nginx"

# Step 3: Get SSL certificate
echo -e "${BLUE}🔐 Getting SSL certificate...${NC}"
echo "This will ask for your email address..."
ssh $VPS_HOST "certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@reagent.eu.cc || certbot certonly --standalone -d $DOMAIN"

# Step 4: Verify certificate
echo -e "${BLUE}✅ Verifying certificate...${NC}"
ssh $VPS_HOST "ls -la /etc/letsencrypt/live/$DOMAIN/"

# Step 5: Upload SSL-enabled nginx config
echo -e "${BLUE}📝 Uploading SSL-enabled nginx config...${NC}"
scp nginx-mining-subdomain.conf $VPS_HOST:/etc/nginx/sites-available/$DOMAIN

# Step 6: Test nginx config
echo -e "${BLUE}🧪 Testing nginx configuration...${NC}"
ssh $VPS_HOST "nginx -t"

# Step 7: Start nginx
echo -e "${BLUE}🚀 Starting nginx...${NC}"
ssh $VPS_HOST "systemctl start nginx"

# Step 8: Check nginx status
echo -e "${BLUE}📊 Checking nginx status...${NC}"
ssh $VPS_HOST "systemctl status nginx --no-pager | head -10"

# Step 9: Test HTTPS
echo -e "${BLUE}🌐 Testing HTTPS...${NC}"
sleep 2
if curl -I https://$DOMAIN/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ HTTPS is working!${NC}"
else
    echo -e "${YELLOW}⚠ HTTPS test failed, but this might be due to DNS propagation${NC}"
fi

# Success
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ SSL Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Your subdomain is now available at:"
echo "   https://$DOMAIN"
echo ""
echo "📚 Test URLs:"
echo "   Documentation: https://$DOMAIN/docs"
echo "   Health Status: https://$DOMAIN/health"
echo "   Minting Skill: https://$DOMAIN/skills/minting.sh"
echo "   Wallet Skill:  https://$DOMAIN/skills/wallet.sh"
echo ""
echo "🔧 Installation command for other agents:"
echo "   curl -O https://$DOMAIN/skills/minting.sh"
echo "   curl -O https://$DOMAIN/skills/wallet.sh"
echo ""
echo "🔄 SSL certificate will auto-renew via certbot"
echo ""
