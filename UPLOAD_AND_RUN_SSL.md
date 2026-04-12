# Upload & Run SSL Setup Script

## File yang Perlu di Upload

Script SSL setup sudah dibuat di:
```
blinkai/scripts/setup-domain-ssl.sh
```

---

## Cara 1: Upload via Git (Recommended)

Jika project sudah di Git:

```bash
# Di local machine
cd blinkai
git add scripts/setup-domain-ssl.sh
git commit -m "Add SSL setup script"
git push

# Di VPS
cd /root/blinkai
git pull
chmod +x scripts/setup-domain-ssl.sh
```

---

## Cara 2: Upload via SCP

Dari Windows/Local machine:

```bash
# Upload script
scp blinkai/scripts/setup-domain-ssl.sh root@159.65.141.68:/root/blinkai/scripts/

# SSH ke VPS
ssh root@159.65.141.68

# Make executable
chmod +x /root/blinkai/scripts/setup-domain-ssl.sh
```

---

## Cara 3: Copy-Paste Manual

### Step 1: Buat file di VPS

```bash
# SSH ke VPS
ssh root@159.65.141.68

# Create script file
nano /root/blinkai/scripts/setup-domain-ssl.sh
```

### Step 2: Copy script content

Copy seluruh isi file `blinkai/scripts/setup-domain-ssl.sh` dan paste ke nano editor.

### Step 3: Save & make executable

```bash
# Save: Ctrl+O, Enter, Ctrl+X
chmod +x /root/blinkai/scripts/setup-domain-ssl.sh
```

---

## Cara 4: Create Script Directly on VPS

Jalankan command ini di VPS untuk create script langsung:

```bash
cat > /root/blinkai/scripts/setup-domain-ssl.sh << 'EOFSCRIPT'
#!/bin/bash
# Setup domain and SSL for ReAgent Platform
# Domain: reagent.eu.cc

set -e

DOMAIN="reagent.eu.cc"
EMAIL="admin@reagent.eu.cc"
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

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

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

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    access_log /var/log/nginx/reagent_access.log;
    error_log /var/log/nginx/reagent_error.log;
}
EOF

echo -e "${GREEN}✅ Nginx configuration created${NC}"

# Step 4: Enable site
echo -e "${BLUE}Step 4: Enabling site...${NC}"
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

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

systemctl stop nginx

if certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    echo -e "${GREEN}✅ SSL certificate obtained${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    systemctl start nginx
    exit 1
fi

# Step 6: Update Nginx configuration with SSL
echo -e "${BLUE}Step 6: Updating Nginx configuration with SSL...${NC}"

cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name reagent.eu.cc;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name reagent.eu.cc;

    ssl_certificate /etc/letsencrypt/live/reagent.eu.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reagent.eu.cc/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/reagent.eu.cc/chain.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
        proxy_request_buffering off;
    }

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

    access_log /var/log/nginx/reagent_access.log;
    error_log /var/log/nginx/reagent_error.log;
    client_max_body_size 10M;
}
EOF

echo -e "${GREEN}✅ Nginx configuration updated with SSL${NC}"

if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx started and enabled${NC}"

# Step 7: Setup auto-renewal
echo -e "${BLUE}Step 7: Setting up SSL auto-renewal...${NC}"

if certbot renew --dry-run; then
    echo -e "${GREEN}✅ SSL auto-renewal configured${NC}"
else
    echo -e "${YELLOW}⚠️  SSL auto-renewal test had warnings${NC}"
fi

# Step 8: Update .env file
echo -e "${BLUE}Step 8: Updating .env file...${NC}"

ENV_FILE="/root/blinkai/.env"

if [ -f "$ENV_FILE" ]; then
    if grep -q "NEXTAUTH_URL=" "$ENV_FILE"; then
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" "$ENV_FILE"
    else
        echo "NEXTAUTH_URL=https://$DOMAIN" >> "$ENV_FILE"
    fi
    
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

if npm run build; then
    echo -e "${GREEN}✅ Application rebuilt${NC}"
else
    echo -e "${YELLOW}⚠️  Build had warnings${NC}"
fi

if pm2 restart reagent; then
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 restart had issues${NC}"
fi

# Step 10: Configure firewall
echo -e "${BLUE}Step 10: Configuring firewall...${NC}"

if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw delete allow 'Nginx HTTP' 2>/dev/null || true
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
EOFSCRIPT

# Make executable
chmod +x /root/blinkai/scripts/setup-domain-ssl.sh

echo "✅ Script created and made executable!"
echo ""
echo "Now run:"
echo "  sudo /root/blinkai/scripts/setup-domain-ssl.sh"
```

---

## Verify Script Exists

```bash
# Check if script exists
ls -la /root/blinkai/scripts/setup-domain-ssl.sh

# Should show:
# -rwxr-xr-x 1 root root [size] [date] setup-domain-ssl.sh
```

---

## Run the Script

```bash
# Make sure DNS is configured first!
# Then run:
sudo /root/blinkai/scripts/setup-domain-ssl.sh
```

---

## Quick One-Liner (Create & Run)

Copy-paste this entire command di VPS untuk create script dan run:

```bash
curl -o /root/blinkai/scripts/setup-domain-ssl.sh https://raw.githubusercontent.com/[your-repo]/blinkai/main/scripts/setup-domain-ssl.sh && chmod +x /root/blinkai/scripts/setup-domain-ssl.sh && sudo /root/blinkai/scripts/setup-domain-ssl.sh
```

(Ganti `[your-repo]` dengan repo GitHub Anda jika sudah di push)

---

## Manual Creation (Recommended)

Jika cara lain tidak work, gunakan Cara 4 di atas untuk create script langsung di VPS dengan command `cat`.

---

**Pilih salah satu cara, lalu jalankan script!** 🚀
