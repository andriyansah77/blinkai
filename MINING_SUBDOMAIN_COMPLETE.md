# Mining Subdomain Complete - mining.reagent.eu.cc

## Status: ✅ DEPLOYED (HTTP Only - SSL Pending)

Subdomain mining.reagent.eu.cc telah berhasil di-deploy dengan dokumentasi lengkap dan skill installation scripts.

## What Was Deployed

### 1. API Documentation ✅
- **URL**: http://mining.reagent.eu.cc/docs (HTTPS pending DNS + SSL)
- **File**: `/root/blinkai/public/docs/index.html`
- **Content**: Complete API documentation with examples
- **Features**:
  - Quick start guide
  - Minting API endpoints
  - Wallet API endpoints
  - Configuration guide
  - Network information
  - Error handling
  - Rate limits

### 2. Skill Installation Scripts ✅
- **Minting Skill**: http://mining.reagent.eu.cc/skills/minting.sh
- **Wallet Skill**: http://mining.reagent.eu.cc/skills/wallet.sh
- **README**: http://mining.reagent.eu.cc/skills/README.md
- **Location**: `/root/blinkai/public/skills/`
- **Features**:
  - Downloadable via curl
  - Executable bash scripts
  - Color-coded output
  - Error handling
  - Environment variable configuration

### 3. Health Status Page ✅
- **URL**: http://mining.reagent.eu.cc/health
- **File**: `/root/blinkai/public/health/index.html`
- **Features**:
  - Real-time status
  - API version
  - Network info
  - Uptime counter
  - Available endpoints list

### 4. Nginx Configuration ✅
- **Config**: `/etc/nginx/sites-available/mining.reagent.eu.cc`
- **Status**: Enabled and running
- **Features**:
  - Proxy to Next.js (port 3000)
  - CORS headers for API
  - Static file caching
  - Access logs
  - Error logs

## File Structure on VPS

```
/root/blinkai/
├── public/
│   ├── docs/
│   │   └── index.html          ✅ Uploaded
│   ├── skills/
│   │   ├── minting.sh          ✅ Uploaded
│   │   ├── wallet.sh           ✅ Uploaded
│   │   └── README.md           ✅ Uploaded
│   └── health/
│       └── index.html          ✅ Uploaded
└── nginx-mining-subdomain.conf ✅ Uploaded

/etc/nginx/
├── sites-available/
│   └── mining.reagent.eu.cc    ✅ Created
└── sites-enabled/
    └── mining.reagent.eu.cc    ✅ Symlinked
```

## URLs Available (HTTP Only)

### Documentation
```
http://mining.reagent.eu.cc/docs
```
Complete API documentation with examples and guides.

### Skills Installation
```bash
# Minting skill
curl -O http://mining.reagent.eu.cc/skills/minting.sh

# Wallet skill
curl -O http://mining.reagent.eu.cc/skills/wallet.sh

# README
curl http://mining.reagent.eu.cc/skills/README.md
```

### Health Status
```
http://mining.reagent.eu.cc/health
```
Real-time API health monitoring.

### API Endpoints
```bash
# Minting API
curl -X POST http://mining.reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: your-user-id" \
  -d '{"action": "get_balance"}'

# Wallet API
curl -X POST http://mining.reagent.eu.cc/api/hermes/skills/wallet \
  -H "Content-Type: application/json" \
  -H "X-User-ID: your-user-id" \
  -d '{"action": "check_balance"}'
```

## Next Steps

### 1. Setup DNS in Cloudflare ⏳

1. Login ke https://dash.cloudflare.com
2. Pilih domain `reagent.eu.cc`
3. Klik tab **DNS**
4. Klik **Add record**
5. Isi:
   - Type: `A`
   - Name: `mining`
   - IPv4: `159.65.141.68`
   - Proxy: ✅ Enabled (orange cloud)
   - TTL: Auto
6. Klik **Save**
7. Tunggu 5-10 menit untuk DNS propagation

### 2. Setup SSL Certificate ⏳

Setelah DNS propagation selesai:

```bash
# SSH to VPS
ssh root@159.65.141.68

# Stop nginx
systemctl stop nginx

# Get SSL certificate
certbot certonly --standalone -d mining.reagent.eu.cc

# Upload SSL-enabled config
# (use blinkai/nginx-mining-subdomain.conf)

# Start nginx
systemctl start nginx
```

### 3. Update URLs to HTTPS ⏳

Setelah SSL aktif, update semua URL dari `http://` ke `https://`:
- Documentation: https://mining.reagent.eu.cc/docs
- Skills: https://mining.reagent.eu.cc/skills/
- Health: https://mining.reagent.eu.cc/health
- API: https://mining.reagent.eu.cc/api/

## Installation Guide for Other Agents

### Quick Install - Minting Skill

```bash
# Download
curl -O http://mining.reagent.eu.cc/skills/minting.sh

# Make executable
chmod +x minting.sh

# Configure
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="http://mining.reagent.eu.cc"

# Test
./minting.sh get_balance
```

### Quick Install - Wallet Skill

```bash
# Download
curl -O http://mining.reagent.eu.cc/skills/wallet.sh

# Make executable
chmod +x wallet.sh

# Configure
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="http://mining.reagent.eu.cc"

# Test
./wallet.sh check_balance
```

## Skill Commands

### Minting Skill

```bash
# Get balance
./minting.sh get_balance

# Estimate gas
./minting.sh estimate_gas 1000

# Mint tokens
./minting.sh mint 1000

# Get statistics
./minting.sh get_stats
```

### Wallet Skill

```bash
# Check balance
./wallet.sh check_balance

# Get address
./wallet.sh get_address

# Send ETH
./wallet.sh send_eth 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 0.1

# Send REAGENT
./wallet.sh send_reagent 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000

# Transaction history
./wallet.sh history
```

## Features

### Documentation Page
- ✅ Beautiful responsive design
- ✅ Complete API reference
- ✅ Code examples with syntax highlighting
- ✅ Installation instructions
- ✅ Configuration guide
- ✅ Error handling guide
- ✅ Rate limits information
- ✅ Network information
- ✅ Support links

### Skill Scripts
- ✅ Color-coded output (green, red, yellow, blue)
- ✅ JSON parsing with jq
- ✅ Error handling
- ✅ Environment variable configuration
- ✅ Help text with usage examples
- ✅ Formatted responses
- ✅ Authentication via X-User-ID header

### Health Page
- ✅ Real-time status indicator
- ✅ Animated pulse effect
- ✅ API version display
- ✅ Network information
- ✅ Uptime counter
- ✅ Available endpoints list
- ✅ Links to documentation

### Nginx Configuration
- ✅ Proxy to Next.js app
- ✅ CORS headers for API access
- ✅ Static file caching
- ✅ Security headers
- ✅ Access and error logs
- ✅ OPTIONS request handling

## Testing

### Test Documentation

```bash
curl http://mining.reagent.eu.cc/docs
```

Expected: HTML page with API documentation

### Test Skills Download

```bash
# Test minting skill
curl -I http://mining.reagent.eu.cc/skills/minting.sh

# Test wallet skill
curl -I http://mining.reagent.eu.cc/skills/wallet.sh
```

Expected: HTTP 200 OK

### Test Health Page

```bash
curl http://mining.reagent.eu.cc/health
```

Expected: HTML page with health status

### Test API Endpoints

```bash
# Test minting API
curl -X POST http://mining.reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: cmnun09dl0001ifasc9dgzjrz" \
  -d '{"action": "get_balance"}'

# Test wallet API
curl -X POST http://mining.reagent.eu.cc/api/hermes/skills/wallet \
  -H "Content-Type: application/json" \
  -H "X-User-ID: cmnun09dl0001ifasc9dgzjrz" \
  -d '{"action": "check_balance"}'
```

Expected: JSON response with success: true

## Monitoring

### Nginx Logs

```bash
# Access logs
ssh root@159.65.141.68 'tail -f /var/log/nginx/mining.reagent.eu.cc.access.log'

# Error logs
ssh root@159.65.141.68 'tail -f /var/log/nginx/mining.reagent.eu.cc.error.log'
```

### Application Logs

```bash
ssh root@159.65.141.68 'pm2 logs reagent --lines 50'
```

## Security

### CORS Configuration
- Allows all origins (`*`) for public API
- Restricts methods to GET, POST, OPTIONS
- Allows X-User-ID header for authentication

### Authentication
- X-User-ID header required for API calls
- Session-based auth for web interface
- Rate limiting at application level

### Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer-when-downgrade

## Troubleshooting

### Issue: DNS not resolving

**Solution**: 
- Add DNS record in Cloudflare
- Wait 5-10 minutes for propagation
- Test with: `nslookup mining.reagent.eu.cc`

### Issue: 502 Bad Gateway

**Solution**:
```bash
# Check if Next.js is running
ssh root@159.65.141.68 'pm2 status'

# Restart if needed
ssh root@159.65.141.68 'pm2 restart reagent'
```

### Issue: Skills not downloadable

**Solution**:
```bash
# Check file permissions
ssh root@159.65.141.68 'ls -la /root/blinkai/public/skills/'

# Fix permissions if needed
ssh root@159.65.141.68 'chmod 644 /root/blinkai/public/skills/*'
```

## Deployment Checklist

- [x] Public directories created
- [x] Documentation uploaded
- [x] Skills uploaded
- [x] Health page uploaded
- [x] README uploaded
- [x] Nginx config created
- [x] Nginx config enabled
- [x] Nginx reloaded
- [ ] DNS record added (pending)
- [ ] SSL certificate obtained (pending)
- [ ] HTTPS enabled (pending)

## What's Next

1. **Add DNS Record** in Cloudflare for mining.reagent.eu.cc
2. **Get SSL Certificate** using Certbot
3. **Update to HTTPS** by uploading SSL-enabled nginx config
4. **Test All URLs** with HTTPS
5. **Share Installation URLs** with other AI agent developers
6. **Monitor Usage** via logs and metrics

## Support

- **Documentation**: http://mining.reagent.eu.cc/docs (HTTPS pending)
- **Health Status**: http://mining.reagent.eu.cc/health (HTTPS pending)
- **Main Dashboard**: https://reagent.eu.cc

## Conclusion

✅ **Subdomain mining.reagent.eu.cc berhasil di-deploy**
✅ **Dokumentasi API lengkap tersedia**
✅ **Skill installation scripts siap digunakan**
✅ **Health monitoring page aktif**
✅ **Nginx configuration berjalan dengan baik**

Tinggal setup DNS di Cloudflare dan SSL certificate, maka subdomain akan fully operational dengan HTTPS!

---

**Deployment Date**: April 12, 2026  
**Status**: HTTP Deployed, HTTPS Pending  
**Subdomain**: mining.reagent.eu.cc  
**VPS**: 159.65.141.68
