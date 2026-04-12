# HTTPS Setup Summary - mining.reagent.eu.cc

## Status: ⏳ Menunggu DNS + SSL Setup

Semua file sudah siap, tinggal 3 langkah manual untuk aktivasi HTTPS.

## 📋 Yang Sudah Siap

✅ Nginx config dengan SSL support  
✅ Public files (docs, skills, health)  
✅ Scripts updated dengan HTTPS default URL  
✅ Documentation lengkap  
✅ Installation guides  

## 🚀 3 Langkah Aktivasi HTTPS

### Langkah 1: Setup DNS (5 menit)

**Di Cloudflare Dashboard:**

1. Login: https://dash.cloudflare.com
2. Pilih domain: **reagent.eu.cc**
3. Tab **DNS** → **Add record**
4. Isi form:
   ```
   Type: A
   Name: mining
   IPv4: 159.65.141.68
   Proxy: ✅ Proxied (orange cloud)
   TTL: Auto
   ```
5. **Save**
6. Tunggu 5 menit

**Verifikasi:**
```bash
nslookup mining.reagent.eu.cc
# Harus resolve ke Cloudflare IP
```

---

### Langkah 2: Get SSL Certificate (5 menit)

**Copy-paste commands ini:**

```bash
# 1. SSH ke VPS
ssh root@159.65.141.68

# 2. Stop nginx
systemctl stop nginx

# 3. Get SSL certificate (ganti email)
certbot certonly --standalone -d mining.reagent.eu.cc \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# 4. Verify certificate
ls -la /etc/letsencrypt/live/mining.reagent.eu.cc/

# 5. Exit SSH
exit
```

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/mining.reagent.eu.cc/fullchain.pem
```

---

### Langkah 3: Activate HTTPS (2 menit)

**Copy-paste commands ini:**

```bash
# 1. Upload SSL-enabled nginx config
scp blinkai/nginx-mining-subdomain.conf root@159.65.141.68:/etc/nginx/sites-available/mining.reagent.eu.cc

# 2. SSH dan start nginx
ssh root@159.65.141.68 'nginx -t && systemctl start nginx && systemctl status nginx --no-pager'

# 3. Test HTTPS
curl -I https://mining.reagent.eu.cc/health
```

**Expected output:**
```
HTTP/2 200
server: nginx
```

---

## ✅ Verification Checklist

Setelah setup, test semua URL:

```bash
# Health page
curl https://mining.reagent.eu.cc/health

# Documentation
curl https://mining.reagent.eu.cc/docs

# Minting skill
curl -I https://mining.reagent.eu.cc/skills/minting.sh

# Wallet skill
curl -I https://mining.reagent.eu.cc/skills/wallet.sh

# API test
curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test" \
  -d '{"action":"get_balance"}'
```

Semua harus return HTTP/2 200 atau valid JSON response.

---

## 🎯 Final URLs (After HTTPS Active)

### Documentation
```
https://mining.reagent.eu.cc/docs
```

### Skills Installation
```bash
# Minting
curl -O https://mining.reagent.eu.cc/skills/minting.sh

# Wallet
curl -O https://mining.reagent.eu.cc/skills/wallet.sh

# README
curl https://mining.reagent.eu.cc/skills/README.md
```

### Health Status
```
https://mining.reagent.eu.cc/health
```

### API Endpoints
```
POST https://mining.reagent.eu.cc/api/hermes/skills/minting
POST https://mining.reagent.eu.cc/api/hermes/skills/wallet
```

---

## 📦 Installation untuk Agent Lain

Setelah HTTPS aktif, share ini ke developer agent lain:

### Quick Install - Minting Skill
```bash
curl -O https://mining.reagent.eu.cc/skills/minting.sh
chmod +x minting.sh
export REAGENT_USER_ID="your-user-id"
./minting.sh get_balance
```

### Quick Install - Wallet Skill
```bash
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
chmod +x wallet.sh
export REAGENT_USER_ID="your-user-id"
./wallet.sh check_balance
```

**Note:** `REAGENT_API_BASE` sudah default ke HTTPS, tidak perlu di-set lagi.

---

## 🔧 Troubleshooting

### DNS tidak resolve
```bash
# Wait 5-10 minutes
# Check Cloudflare DNS settings
# Try: nslookup mining.reagent.eu.cc
```

### Certbot gagal
```bash
# Make sure nginx is stopped
systemctl stop nginx
killall nginx

# Check port 80
netstat -tulpn | grep :80

# Try again
certbot certonly --standalone -d mining.reagent.eu.cc
```

### Nginx gagal start
```bash
# Check config
nginx -t

# Check certificate exists
ls -la /etc/letsencrypt/live/mining.reagent.eu.cc/

# Check error log
tail -f /var/log/nginx/error.log
```

### 502 Bad Gateway
```bash
# Check Next.js
pm2 status
pm2 restart reagent
```

---

## 📊 SSL Certificate Info

- **Provider**: Let's Encrypt
- **Validity**: 90 days
- **Auto-renewal**: Yes (via certbot timer)
- **Renewal check**: 30 days before expiry

**Verify auto-renewal:**
```bash
ssh root@159.65.141.68 'certbot renew --dry-run'
```

---

## 🎉 Success Indicators

Setelah semua langkah selesai, Anda akan punya:

✅ Subdomain mining.reagent.eu.cc dengan HTTPS  
✅ SSL certificate valid dari Let's Encrypt  
✅ API documentation accessible  
✅ Downloadable skill scripts  
✅ Health monitoring page  
✅ Working API endpoints  
✅ CORS enabled untuk external agents  
✅ Auto-renewal SSL configured  

---

## 📚 Documentation Files

Referensi lengkap:
- `UPDATE_TO_HTTPS.md` - Step-by-step guide
- `SETUP_HTTPS_MINING_SUBDOMAIN.md` - Detailed instructions
- `MINING_SUBDOMAIN_SETUP.md` - Complete setup guide
- `MINING_SUBDOMAIN_COMPLETE.md` - Deployment summary
- `QUICK_REFERENCE_MINING_API.md` - Quick reference

---

## ⏱️ Estimated Time

- DNS Setup: 5 minutes
- SSL Certificate: 5 minutes
- Nginx Config: 2 minutes
- Testing: 3 minutes

**Total: ~15 minutes**

---

## 🆘 Need Help?

Jika ada masalah:
1. Cek troubleshooting section di atas
2. Review error logs: `/var/log/nginx/error.log`
3. Check PM2 logs: `pm2 logs reagent`
4. Verify DNS: `nslookup mining.reagent.eu.cc`
5. Test SSL: `openssl s_client -connect mining.reagent.eu.cc:443`

---

**Ready to go!** Tinggal jalankan 3 langkah di atas dan subdomain mining.reagent.eu.cc akan fully operational dengan HTTPS! 🚀
