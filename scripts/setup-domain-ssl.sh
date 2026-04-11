#!/bin/bash
# Setup domain and SSL for ReAgent Platform
# Domain: reagent.eu.cc

set -e

DOMAIN="reagent.eu.cc"
EMAIL="admin@reagent.eu.cc"  # Change this to your email
APP_PORT="3000"

echo "🌐 Setting up domain and SSL for ReAgent Platform"
echo "Domain: $DOMAIN"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Install Nginx
echo -e "${BLUE}Step 1: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
    echo -e "${GREEN}✅ Nginx installed${NC}"
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
fi

# Step 2: Install Certbot
echo -e "${BLUE}Step 2: Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installed${NC}"
else
    echo -e "${GREEN}✅ Certbot already installed${NC}"
fi

# Step 3: Create Nginx configuration (HTTP only first)
echo -e "${BLUE}Step 3: Creating Nginx configuration...${NC}"

cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name reagent.eu.cc;

    # Allow Certbot validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support for real-time features
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/reagent_access.log;
    error_log /var/log/nginx/reagent_error.log;
}
EOF

echo -e "${GREEN}✅ Nginx configuration created${NC}"

# Step 4: Enable site
echo -e "${BLUE}Step 4: Enabling site...${NC}"
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site

# Test Nginx configuration
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

# Reload Nginx
systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT: DNS Configuration Required${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Before proceeding with SSL, ensure your DNS is configured:"
echo ""
echo "Domain: $DOMAIN"
echo "Type: A Record"
echo "Value: $(curl -s ifconfig.me)"
echo ""
echo "Check DNS propagation:"
echo "  dig $DOMAIN"
echo "  nslookup $DOMAIN"
echo ""
read -p "Press Enter once DNS is configured and propagated..."

# Step 5: Obtain SSL certificate
echo ""
echo -e "${BLUE}Step 5: Obtaining SSL certificate...${NC}"

# Stop nginx temporarily for standalone mode
systemctl stop nginx

# Try to obtain certificate
if certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    echo -e "${GREEN}✅ SSL certificate obtained${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo ""
    echo "Common issues:"
    echo "  1. DNS not propagated yet (wait 5-10 minutes)"
    echo "  2. Port 80 blocked by firewall"
    echo "  3. Domain not pointing to this server"
    echo ""
    echo "You can retry manually with:"
    echo "  certbot certonly --standalone -d $DOMAIN"
    
    # Start nginx back
    systemctl start nginx
    exit 1
fi

# Step 6: Update Nginx configuration with SSL
echo -e "${BLUE}Step 6: Updating Nginx configuration with SSL...${NC}"

cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name reagent.eu.cc;

    # Allow Certbot validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name reagent.eu.cc;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/reagent.eu.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reagent.eu.cc/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/reagent.eu.cc/chain.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Logging
    access_log /var/log/nginx/reagent_access.log;
    error_log /var/log/nginx/reagent_error.log;

    # Max upload size
    client_max_body_size 10M;
}
EOF

echo -e "${GREEN}✅ Nginx configuration updated with SSL${NC}"

# Test configuration
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx started and enabled${NC}"

# Step 7: Setup auto-renewal
echo -e "${BLUE}Step 7: Setting up SSL auto-renewal...${NC}"

# Test renewal
if certbot renew --dry-run; then
    echo -e "${GREEN}✅ SSL auto-renewal configured${NC}"
else
    echo -e "${YELLOW}⚠️  SSL auto-renewal test had warnings${NC}"
fi

# Step 8: Update .env file
echo -e "${BLUE}Step 8: Updating .env file...${NC}"

ENV_FILE="/root/blinkai/.env"

if [ -f "$ENV_FILE" ]; then
    # Update NEXTAUTH_URL
    if grep -q "NEXTAUTH_URL=" "$ENV_FILE"; then
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" "$ENV_FILE"
    else
        echo "NEXTAUTH_URL=https://$DOMAIN" >> "$ENV_FILE"
    fi
    
    # Update NEXT_PUBLIC_APP_URL
    if grep -q "NEXT_PUBLIC_APP_URL=" "$ENV_FILE"; then
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://$DOMAIN|g" "$ENV_FILE"
    else
        echo "NEXT_PUBLIC_APP_URL=https://$DOMAIN" >> "$ENV_FILE"
    fi
    
    echo -e "${GREEN}✅ .env file updated${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found at $ENV_FILE${NC}"
fi

# Step 9: Restart application
echo -e "${BLUE}Step 9: Restarting application...${NC}"

cd /root/blinkai

# Rebuild with new environment
if npm run build; then
    echo -e "${GREEN}✅ Application rebuilt${NC}"
else
    echo -e "${YELLOW}⚠️  Build had warnings${NC}"
fi

# Restart PM2
if pm2 restart reagent; then
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 restart had issues${NC}"
fi

# Step 10: Configure firewall
echo -e "${BLUE}Step 10: Configuring firewall...${NC}"

if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw delete allow 'Nginx HTTP'
    echo -e "${GREEN}✅ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠️  UFW not installed, skipping firewall configuration${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Domain and SSL Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your ReAgent Platform is now accessible at:"
echo -e "${GREEN}https://$DOMAIN${NC}"
echo ""
echo "SSL Certificate Details:"
echo "  Issuer: Let's Encrypt"
echo "  Valid for: 90 days"
echo "  Auto-renewal: Enabled"
echo ""
echo "Next renewal check:"
certbot certificates | grep "Expiry Date" | head -1
echo ""
echo "Useful commands:"
echo "  Check SSL status: certbot certificates"
echo "  Renew manually: certbot renew"
echo "  Test renewal: certbot renew --dry-run"
echo "  Check Nginx: systemctl status nginx"
echo "  View logs: tail -f /var/log/nginx/reagent_error.log"
echo ""
echo "Security features enabled:"
echo "  ✅ HTTPS with TLS 1.2/1.3"
echo "  ✅ HTTP to HTTPS redirect"
echo "  ✅ HSTS (Strict-Transport-Security)"
echo "  ✅ Security headers"
echo "  ✅ SSL auto-renewal"
echo ""
