#!/bin/bash
# Deploy Mining Subdomain - mining.reagent.eu.cc
# This script uploads public files and configures nginx

set -e

VPS_HOST="root@159.65.141.68"
DOMAIN="mining.reagent.eu.cc"

echo "🚀 Deploying Mining Subdomain: $DOMAIN"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Create directories on VPS
echo -e "${BLUE}📁 Creating directories on VPS...${NC}"
ssh $VPS_HOST "mkdir -p /root/blinkai/public/docs /root/blinkai/public/skills /root/blinkai/public/health"

# Step 2: Upload documentation
echo -e "${BLUE}📚 Uploading documentation...${NC}"
scp blinkai/public/docs/index.html $VPS_HOST:/root/blinkai/public/docs/

# Step 3: Upload skills
echo -e "${BLUE}🔧 Uploading skills...${NC}"
scp blinkai/public/skills/minting.sh $VPS_HOST:/root/blinkai/public/skills/
scp blinkai/public/skills/wallet.sh $VPS_HOST:/root/blinkai/public/skills/

# Step 4: Upload health page
echo -e "${BLUE}💚 Uploading health page...${NC}"
scp blinkai/public/health/index.html $VPS_HOST:/root/blinkai/public/health/

# Step 5: Set permissions
echo -e "${BLUE}🔒 Setting permissions...${NC}"
ssh $VPS_HOST "chmod 644 /root/blinkai/public/skills/*.sh"
ssh $VPS_HOST "chmod 644 /root/blinkai/public/docs/index.html"
ssh $VPS_HOST "chmod 644 /root/blinkai/public/health/index.html"

# Step 6: Create nginx config
echo -e "${BLUE}⚙️  Creating nginx configuration...${NC}"
ssh $VPS_HOST "cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Redirect HTTP to HTTPS
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;

    # CORS Headers for API
    add_header Access-Control-Allow-Origin \"*\" always;
    add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS\" always;
    add_header Access-Control-Allow-Headers \"Content-Type, X-User-ID\" always;

    # Handle OPTIONS requests
    if (\\\$request_method = 'OPTIONS') {
        return 204;
    }

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }

    # Static files (docs, skills, health)
    location ~* \\\.(html|sh|txt|json)\\\$ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \\\$host;
        add_header Cache-Control \"public, max-age=3600\";
    }

    # Logs
    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;
}
EOF"

# Step 7: Enable site
echo -e "${BLUE}🔗 Enabling nginx site...${NC}"
ssh $VPS_HOST "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"

# Step 8: Test nginx config
echo -e "${BLUE}✅ Testing nginx configuration...${NC}"
ssh $VPS_HOST "nginx -t"

# Step 9: Get SSL certificate
echo -e "${YELLOW}🔐 SSL Certificate Setup${NC}"
echo "Run this command on VPS to get SSL certificate:"
echo ""
echo "  ssh $VPS_HOST"
echo "  systemctl stop nginx"
echo "  certbot certonly --standalone -d $DOMAIN"
echo "  systemctl start nginx"
echo ""

# Step 10: Verification
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Add DNS record in Cloudflare:"
echo "   Type: A"
echo "   Name: mining"
echo "   IPv4: 159.65.141.68"
echo "   Proxy: Enabled (orange cloud)"
echo ""
echo "2. Wait 5 minutes for DNS propagation"
echo ""
echo "3. Get SSL certificate (see command above)"
echo ""
echo "4. Test URLs:"
echo "   https://$DOMAIN/docs"
echo "   https://$DOMAIN/skills/minting.sh"
echo "   https://$DOMAIN/skills/wallet.sh"
echo "   https://$DOMAIN/health"
echo ""
echo "5. Test API:"
echo "   curl -X POST https://$DOMAIN/api/hermes/skills/minting \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -H \"X-User-ID: test-user\" \\"
echo "     -d '{\"action\": \"get_balance\"}'"
echo ""
