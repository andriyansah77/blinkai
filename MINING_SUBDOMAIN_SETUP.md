# Mining Subdomain Setup - mining.reagent.eu.cc

## Overview

Subdomain `mining.reagent.eu.cc` untuk menyediakan:
- 📚 API Documentation
- 🔧 Skill Installation Scripts (minting.sh, wallet.sh)
- 💚 Health Status Page
- 🌐 Public API Endpoints

## Cloudflare DNS Setup

### Step 1: Login ke Cloudflare

1. Go to https://dash.cloudflare.com
2. Login dengan akun Anda
3. Pilih domain `reagent.eu.cc`

### Step 2: Tambah DNS Record

1. Klik tab **DNS** di sidebar
2. Klik **Add record**
3. Isi form:
   - **Type**: `A`
   - **Name**: `mining` (akan menjadi mining.reagent.eu.cc)
   - **IPv4 address**: `159.65.141.68` (IP VPS Anda)
   - **Proxy status**: ✅ Proxied (orange cloud)
   - **TTL**: Auto
4. Klik **Save**

### Step 3: Verifikasi DNS

Tunggu 1-5 menit, lalu test:

```bash
# Test DNS resolution
nslookup mining.reagent.eu.cc

# Test HTTP
curl -I http://mining.reagent.eu.cc

# Test HTTPS (setelah SSL setup)
curl -I https://mining.reagent.eu.cc
```

## Nginx Configuration

### Step 1: Create Nginx Config

SSH ke VPS dan buat config:

```bash
ssh root@159.65.141.68

# Create nginx config
cat > /etc/nginx/sites-available/mining.reagent.eu.cc << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name mining.reagent.eu.cc;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name mining.reagent.eu.cc;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/mining.reagent.eu.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mining.reagent.eu.cc/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # CORS Headers for API
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, X-User-ID" always;

    # Handle OPTIONS requests
    if ($request_method = 'OPTIONS') {
        return 204;
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
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (docs, skills, health)
    location ~* \.(html|sh|txt|json)$ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=3600";
    }

    # Logs
    access_log /var/log/nginx/mining.reagent.eu.cc.access.log;
    error_log /var/log/nginx/mining.reagent.eu.cc.error.log;
}
EOF
```

### Step 2: Enable Site

```bash
# Create symlink
ln -s /etc/nginx/sites-available/mining.reagent.eu.cc /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx (don't restart yet, SSL not configured)
# nginx -s reload
```

## SSL Certificate Setup

### Step 1: Install Certbot (if not installed)

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate

```bash
# Stop nginx temporarily
systemctl stop nginx

# Get certificate
certbot certonly --standalone -d mining.reagent.eu.cc

# Start nginx
systemctl start nginx
```

### Step 3: Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Certbot will auto-renew via cron
```

## Upload Public Files to VPS

### Step 1: Upload Documentation

```bash
# From local machine
scp blinkai/public/docs/index.html root@159.65.141.68:/root/blinkai/public/docs/
```

### Step 2: Upload Skills

```bash
scp blinkai/public/skills/minting.sh root@159.65.141.68:/root/blinkai/public/skills/
scp blinkai/public/skills/wallet.sh root@159.65.141.68:/root/blinkai/public/skills/
```

### Step 3: Upload Health Page

```bash
scp blinkai/public/health/index.html root@159.65.141.68:/root/blinkai/public/health/
```

### Step 4: Set Permissions

```bash
ssh root@159.65.141.68 'chmod 644 /root/blinkai/public/skills/*.sh'
```

## Verification

### Test Documentation

```bash
curl https://mining.reagent.eu.cc/docs
```

Expected: HTML documentation page

### Test Skills Download

```bash
# Test minting skill
curl -O https://mining.reagent.eu.cc/skills/minting.sh
cat minting.sh

# Test wallet skill
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
cat wallet.sh
```

### Test Health Status

```bash
curl https://mining.reagent.eu.cc/health
```

Expected: Health status page

### Test API Endpoints

```bash
# Test minting API
curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"action": "get_balance"}'

# Test wallet API
curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/wallet \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"action": "check_balance"}'
```

## File Structure

```
/root/blinkai/public/
├── docs/
│   └── index.html          # API Documentation
├── skills/
│   ├── minting.sh          # Minting skill script
│   └── wallet.sh           # Wallet skill script
└── health/
    └── index.html          # Health status page
```

## URLs Available

### Documentation
- https://mining.reagent.eu.cc/docs
- Complete API documentation with examples

### Skills Installation
- https://mining.reagent.eu.cc/skills/minting.sh
- https://mining.reagent.eu.cc/skills/wallet.sh

### Health Status
- https://mining.reagent.eu.cc/health
- Real-time API health monitoring

### API Endpoints
- https://mining.reagent.eu.cc/api/hermes/skills/minting
- https://mining.reagent.eu.cc/api/hermes/skills/wallet

## Installation Guide for Other Agents

### For Minting Operations

```bash
# 1. Download skill
curl -O https://mining.reagent.eu.cc/skills/minting.sh

# 2. Make executable
chmod +x minting.sh

# 3. Configure
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="https://mining.reagent.eu.cc"

# 4. Test
./minting.sh get_balance
```

### For Wallet Operations

```bash
# 1. Download skill
curl -O https://mining.reagent.eu.cc/skills/wallet.sh

# 2. Make executable
chmod +x wallet.sh

# 3. Configure
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="https://mining.reagent.eu.cc"

# 4. Test
./wallet.sh check_balance
```

## Security Considerations

### CORS Configuration
- Allows cross-origin requests for API endpoints
- Restricts methods to GET, POST, OPTIONS
- Allows X-User-ID header for authentication

### Rate Limiting
- Implemented at application level
- 60 req/min for read operations
- 10 req/min for write operations

### SSL/TLS
- Force HTTPS redirect
- TLS 1.2+ only
- Strong cipher suites

### Authentication
- X-User-ID header required for API calls
- Session-based auth for web interface
- No public access without authentication

## Monitoring

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/mining.reagent.eu.cc.access.log

# Error logs
tail -f /var/log/nginx/mining.reagent.eu.cc.error.log
```

### Application Logs

```bash
# PM2 logs
pm2 logs reagent --lines 100
```

### Health Check

```bash
# Automated health check
curl -s https://mining.reagent.eu.cc/health | grep "Operational"
```

## Troubleshooting

### Issue: DNS not resolving

**Solution:**
```bash
# Check DNS propagation
nslookup mining.reagent.eu.cc

# Wait 5-10 minutes for DNS propagation
# Clear local DNS cache
```

### Issue: SSL certificate error

**Solution:**
```bash
# Renew certificate
certbot renew --force-renewal

# Restart nginx
systemctl restart nginx
```

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check if Next.js is running
pm2 status

# Restart application
pm2 restart reagent

# Check nginx config
nginx -t
```

### Issue: CORS errors

**Solution:**
- Check nginx CORS headers configuration
- Verify OPTIONS requests are handled
- Check browser console for specific error

## Deployment Checklist

- [ ] DNS record added in Cloudflare
- [ ] Nginx config created
- [ ] SSL certificate obtained
- [ ] Public files uploaded
- [ ] Permissions set correctly
- [ ] Nginx reloaded
- [ ] Documentation accessible
- [ ] Skills downloadable
- [ ] Health page working
- [ ] API endpoints responding
- [ ] CORS working for external agents

## Next Steps

1. **Share Installation URLs** with other AI agent developers
2. **Monitor Usage** via nginx logs and application metrics
3. **Update Documentation** as API evolves
4. **Add More Skills** as features are developed

## Support

For issues or questions:
- Documentation: https://mining.reagent.eu.cc/docs
- Health Status: https://mining.reagent.eu.cc/health
- Main Dashboard: https://reagent.eu.cc

---

**Created**: April 12, 2026  
**Status**: Ready for Deployment  
**Subdomain**: mining.reagent.eu.cc
