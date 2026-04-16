# 🔒 SSL Setup Guide for ReAgent

## Why SSL is Required

Privy embedded wallet requires HTTPS to function properly. Without SSL, you'll see this error:
```
Embedded wallet is only available over HTTPS
```

## Prerequisites

1. ✅ Domain pointing to VPS: `reagent.eu.cc` → `188.166.247.252`
2. ✅ Subdomain configured: `mining.reagent.eu.cc` → `188.166.247.252`
3. ✅ Ports 80 and 443 open in firewall
4. ✅ Nginx installed and running

## Quick Setup (Automated)

### Step 1: Upload SSL Setup Script

```bash
# From your local machine
scp setup-ssl-vps.sh root@188.166.247.252:/root/
```

### Step 2: Run SSL Setup Script

```bash
# SSH to VPS
ssh root@188.166.247.252

# Make script executable
chmod +x /root/setup-ssl-vps.sh

# Run the script
/root/setup-ssl-vps.sh
```

The script will:
- Install Certbot
- Obtain SSL certificate for both domains
- Configure Nginx with SSL
- Setup auto-renewal
- Add security headers

### Step 3: Update Environment Variables

Update `.env` on VPS to use HTTPS:

```bash
nano /root/reagent/.env
```

Change:
```bash
NEXTAUTH_URL="http://reagent.eu.cc"
```

To:
```bash
NEXTAUTH_URL="https://reagent.eu.cc"
```

### Step 4: Restart Application

```bash
cd /root/reagent
pm2 restart reagent --update-env
```

### Step 5: Verify SSL

```bash
# Test HTTPS
curl -I https://reagent.eu.cc

# Should return: HTTP/2 200
```

## Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Certbot

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### 2. Stop Nginx

```bash
systemctl stop nginx
```

### 3. Obtain SSL Certificate

```bash
certbot certonly --standalone \
  -d reagent.eu.cc \
  -d mining.reagent.eu.cc \
  --non-interactive \
  --agree-tos \
  --email admin@reagent.eu.cc
```

### 4. Update Nginx Configuration

```bash
nano /etc/nginx/sites-available/reagent
```

Replace with:

```nginx
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
```

### 5. Test and Restart Nginx

```bash
nginx -t
systemctl start nginx
systemctl enable nginx
```

### 6. Setup Auto-Renewal

```bash
systemctl enable certbot.timer
systemctl start certbot.timer

# Test renewal
certbot renew --dry-run
```

## Update Privy Dashboard

After SSL is setup, update your Privy dashboard:

1. Go to https://dashboard.privy.io
2. Select your app
3. Go to Settings → Domains
4. Update domains to use HTTPS:
   - `https://reagent.eu.cc`
   - `https://mining.reagent.eu.cc`

## Troubleshooting

### Certificate Not Found

If Certbot fails, check DNS:
```bash
# Check if domain resolves to VPS IP
dig reagent.eu.cc +short
# Should return: 188.166.247.252
```

### Nginx Configuration Error

Test configuration:
```bash
nginx -t
```

View error logs:
```bash
tail -f /var/log/nginx/error.log
```

### SSL Certificate Expired

Renew manually:
```bash
certbot renew
systemctl restart nginx
```

### Privy Still Shows HTTP Error

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check `.env` has HTTPS URL
4. Restart PM2: `pm2 restart reagent --update-env`

## Verification Checklist

After setup, verify:

- [ ] `https://reagent.eu.cc` loads without SSL warning
- [ ] `https://mining.reagent.eu.cc` loads without SSL warning
- [ ] HTTP redirects to HTTPS automatically
- [ ] Privy login works without errors
- [ ] Embedded wallet can be created
- [ ] SSL certificate shows valid (green lock icon)

## Certificate Information

- **Issuer**: Let's Encrypt
- **Validity**: 90 days
- **Auto-renewal**: Enabled via systemd timer
- **Renewal check**: Twice daily
- **Certificate path**: `/etc/letsencrypt/live/reagent.eu.cc/`

## Security Headers Explained

- **HSTS**: Forces HTTPS for 1 year
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables XSS filter

## Next Steps

After SSL is working:

1. ✅ Test Privy authentication
2. ✅ Test embedded wallet creation
3. ✅ Test token minting
4. ✅ Update all documentation with HTTPS URLs
5. ✅ Monitor SSL certificate expiration

---

**Important**: SSL certificate will auto-renew 30 days before expiration. No manual intervention needed.
