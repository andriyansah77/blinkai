#!/bin/bash

# SSL Setup Script for ReAgent VPS
# This script installs Certbot and configures SSL for reagent.eu.cc

echo "🔒 Setting up SSL for ReAgent..."

# Install Certbot
echo "📦 Installing Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
echo "⏸️  Stopping Nginx..."
systemctl stop nginx

# Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
certbot certonly --standalone -d reagent.eu.cc -d mining.reagent.eu.cc \
  --non-interactive \
  --agree-tos \
  --email admin@reagent.eu.cc \
  --preferred-challenges http

# Update Nginx configuration for SSL
echo "⚙️  Updating Nginx configuration..."
cat > /etc/nginx/sites-available/reagent << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name reagent.eu.cc mining.reagent.eu.cc;
    return 301 https://$server_name$request_uri;
}

# Main domain - reagent.eu.cc (HTTPS)
server {
    listen 443 ssl http2;
    server_name reagent.eu.cc;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/reagent.eu.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reagent.eu.cc/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}

# Subdomain - mining.reagent.eu.cc (HTTPS)
server {
    listen 443 ssl http2;
    server_name mining.reagent.eu.cc;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/reagent.eu.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reagent.eu.cc/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
EOF

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    # Start Nginx
    echo "✅ Starting Nginx..."
    systemctl start nginx
    systemctl enable nginx
    
    # Setup auto-renewal
    echo "🔄 Setting up auto-renewal..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    echo ""
    echo "✅ SSL Setup Complete!"
    echo ""
    echo "🌐 Your site is now available at:"
    echo "   https://reagent.eu.cc"
    echo "   https://mining.reagent.eu.cc"
    echo ""
    echo "🔒 SSL certificate will auto-renew before expiration"
    echo ""
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration and try again."
    exit 1
fi
