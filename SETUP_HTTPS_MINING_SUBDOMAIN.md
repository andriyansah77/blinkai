# Setup HTTPS untuk mining.reagent.eu.cc

## Step 1: Setup DNS di Cloudflare (5 menit)

### 1.1 Login ke Cloudflare
1. Buka https://dash.cloudflare.com
2. Login dengan akun Anda
3. Klik domain **reagent.eu.cc**

### 1.2 Tambah DNS Record
1. Klik tab **DNS** di sidebar kiri
2. Klik tombol **Add record**
3. Isi form:
   ```
   Type: A
   Name: mining
   IPv4 address: 159.65.141.68
   Proxy status: ✅ Proxied (orange cloud icon)
   TTL: Auto
   ```
4. Klik **Save**

### 1.3 Verifikasi DNS
Tunggu 2-5 menit, lalu test:
```bash
nslookup mining.reagent.eu.cc
```

Expected output:
```
Server:  1.1.1.1
Address: 1.1.1.1

Non-authoritative answer:
Name:    mining.reagent.eu.cc
Address: 104.21.x.x (Cloudflare IP)
```

## Step 2: Get SSL Certificate (5 menit)

### 2.1 SSH ke VPS
```bash
ssh root@159.65.141.68
```

### 2.2 Stop Nginx
```bash
systemctl stop nginx
```

### 2.3 Get Certificate
```bash
certbot certonly --standalone -d mining.reagent.eu.cc
```

Jawab pertanyaan:
- Email: (masukkan email Anda)
- Terms of Service: Y
- Share email: N (optional)

Expected output:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/mining.reagent.eu.cc/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/mining.reagent.eu.cc/privkey.pem
```

### 2.4 Verify Certificate
```bash
ls -la /etc/letsencrypt/live/mining.reagent.eu.cc/
```

Expected files:
- fullchain.pem
- privkey.pem
- cert.pem
- chain.pem

## Step 3: Update Nginx Config (2 menit)

### 3.1 Upload SSL-Enabled Config

Dari local machine, upload config dengan SSL:
```bash
scp blinkai/nginx-mining-subdomain.conf root@159.65.141.68:/etc/nginx/sites-available/mining.reagent.eu.cc
```

### 3.2 Test Nginx Config
```bash
ssh root@159.65.141.68 'nginx -t'
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3.3 Start Nginx
```bash
ssh root@159.65.141.68 'systemctl start nginx'
```

### 3.4 Check Nginx Status
```bash
ssh root@159.65.141.68 'systemctl status nginx'
```

Expected: Active (running)

## Step 4: Verification (2 menit)

### 4.1 Test HTTPS
```bash
curl -I https://mining.reagent.eu.cc/health
```

Expected:
```
HTTP/2 200
server: nginx
content-type: text/html
```

### 4.2 Test Documentation
```bash
curl https://mining.reagent.eu.cc/docs
```

Expected: HTML content

### 4.3 Test Skills Download
```bash
curl -I https://mining.reagent.eu.cc/skills/minting.sh
```

Expected: HTTP/2 200

### 4.4 Test API Endpoint
```bash
curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"action": "get_balance"}'
```

Expected: JSON response

## Step 5: Update Documentation URLs

Setelah HTTPS aktif, update semua URL di dokumentasi dari `http://` ke `https://`:

### Files to Update:
- README files
- Documentation pages
- Installation scripts (REAGENT_API_BASE default)

## Troubleshooting

### Issue: DNS not resolving

**Check DNS:**
```bash
nslookup mining.reagent.eu.cc
dig mining.reagent.eu.cc
```

**Solution:**
- Wait 5-10 minutes for DNS propagation
- Clear local DNS cache
- Try from different network

### Issue: Certbot fails

**Error**: "Failed to connect to mining.reagent.eu.cc"

**Solution:**
```bash
# Check if port 80 is open
netstat -tulpn | grep :80

# Make sure nginx is stopped
systemctl stop nginx

# Try again
certbot certonly --standalone -d mining.reagent.eu.cc
```

### Issue: Nginx fails to start

**Check logs:**
```bash
tail -f /var/log/nginx/error.log
```

**Common issues:**
- SSL certificate path wrong
- Port 443 already in use
- Syntax error in config

**Solution:**
```bash
# Test config
nginx -t

# Check certificate exists
ls -la /etc/letsencrypt/live/mining.reagent.eu.cc/

# Check port 443
netstat -tulpn | grep :443
```

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check if Next.js is running
pm2 status

# Restart if needed
pm2 restart reagent

# Check logs
pm2 logs reagent --lines 50
```

## SSL Certificate Auto-Renewal

Certbot automatically sets up renewal. Verify:

```bash
# Check renewal timer
systemctl status certbot.timer

# Test renewal
certbot renew --dry-run
```

Expected: All renewals succeeded

## Security Check

### Test SSL Configuration

Use SSL Labs:
```
https://www.ssllabs.com/ssltest/analyze.html?d=mining.reagent.eu.cc
```

Expected: A or A+ rating

### Check Headers

```bash
curl -I https://mining.reagent.eu.cc
```

Should include:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## Final Checklist

- [ ] DNS record added in Cloudflare
- [ ] DNS resolving correctly
- [ ] SSL certificate obtained
- [ ] Nginx config updated
- [ ] Nginx started successfully
- [ ] HTTPS working (https://mining.reagent.eu.cc)
- [ ] Documentation accessible
- [ ] Skills downloadable
- [ ] Health page working
- [ ] API endpoints responding
- [ ] SSL Labs test passed
- [ ] Auto-renewal configured

## Quick Commands Summary

```bash
# 1. Add DNS in Cloudflare (manual)

# 2. Get SSL certificate
ssh root@159.65.141.68
systemctl stop nginx
certbot certonly --standalone -d mining.reagent.eu.cc

# 3. Upload SSL config
scp blinkai/nginx-mining-subdomain.conf root@159.65.141.68:/etc/nginx/sites-available/mining.reagent.eu.cc

# 4. Start nginx
ssh root@159.65.141.68 'nginx -t && systemctl start nginx'

# 5. Test
curl -I https://mining.reagent.eu.cc/health
```

## After HTTPS is Active

Update installation commands to use HTTPS:

```bash
# Minting skill
curl -O https://mining.reagent.eu.cc/skills/minting.sh
chmod +x minting.sh
export REAGENT_API_BASE="https://mining.reagent.eu.cc"

# Wallet skill
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
chmod +x wallet.sh
export REAGENT_API_BASE="https://mining.reagent.eu.cc"
```

---

**Total Time**: ~15 minutes  
**Difficulty**: Easy  
**Prerequisites**: Cloudflare account, VPS access
