# Update mining.reagent.eu.cc ke HTTPS

## Langkah Cepat (15 menit)

### 1️⃣ Setup DNS di Cloudflare (5 menit)

1. Buka https://dash.cloudflare.com
2. Login dan pilih domain **reagent.eu.cc**
3. Klik tab **DNS**
4. Klik **Add record**
5. Isi:
   - **Type**: A
   - **Name**: mining
   - **IPv4 address**: 159.65.141.68
   - **Proxy status**: ✅ Proxied (orange cloud)
   - **TTL**: Auto
6. Klik **Save**
7. **Tunggu 5 menit** untuk DNS propagation

### 2️⃣ Get SSL Certificate (5 menit)

Jalankan command ini satu per satu:

```bash
# SSH ke VPS
ssh root@159.65.141.68

# Stop nginx
systemctl stop nginx

# Get SSL certificate (ganti email dengan email Anda)
certbot certonly --standalone -d mining.reagent.eu.cc --email your-email@example.com --agree-tos --non-interactive

# Atau jika gagal, jalankan interaktif:
certbot certonly --standalone -d mining.reagent.eu.cc
```

Jika berhasil, akan muncul:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/mining.reagent.eu.cc/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/mining.reagent.eu.cc/privkey.pem
```

### 3️⃣ Update Nginx Config (2 menit)

Dari local machine (bukan di VPS):

```bash
# Upload config dengan SSL
scp blinkai/nginx-mining-subdomain.conf root@159.65.141.68:/etc/nginx/sites-available/mining.reagent.eu.cc
```

Lalu di VPS:

```bash
# Test config
nginx -t

# Start nginx
systemctl start nginx

# Check status
systemctl status nginx
```

### 4️⃣ Test HTTPS (1 menit)

```bash
# Test dari local machine
curl -I https://mining.reagent.eu.cc/health

# Test documentation
curl https://mining.reagent.eu.cc/docs

# Test skills
curl -I https://mining.reagent.eu.cc/skills/minting.sh
```

Jika semua berhasil, Anda akan melihat response HTTP/2 200!

## Troubleshooting

### ❌ DNS tidak resolve

**Cek:**
```bash
nslookup mining.reagent.eu.cc
```

**Solusi:**
- Tunggu 5-10 menit lagi
- Pastikan DNS record sudah di-add di Cloudflare
- Cek proxy status (harus orange cloud)

### ❌ Certbot gagal

**Error**: "Failed to connect"

**Solusi:**
```bash
# Pastikan nginx benar-benar stop
systemctl stop nginx
killall nginx

# Cek port 80 tidak dipakai
netstat -tulpn | grep :80

# Coba lagi
certbot certonly --standalone -d mining.reagent.eu.cc
```

### ❌ Nginx gagal start

**Cek error:**
```bash
tail -f /var/log/nginx/error.log
```

**Solusi umum:**
```bash
# Test config
nginx -t

# Jika error SSL certificate not found:
ls -la /etc/letsencrypt/live/mining.reagent.eu.cc/

# Jika file tidak ada, ulangi step 2
```

### ❌ 502 Bad Gateway

**Solusi:**
```bash
# Cek Next.js running
pm2 status

# Restart jika perlu
pm2 restart reagent
```

## Verifikasi Lengkap

Setelah HTTPS aktif, test semua URL:

```bash
# Health
curl https://mining.reagent.eu.cc/health

# Documentation
curl https://mining.reagent.eu.cc/docs

# Skills
curl https://mining.reagent.eu.cc/skills/minting.sh
curl https://mining.reagent.eu.cc/skills/wallet.sh
curl https://mining.reagent.eu.cc/skills/README.md

# API Minting
curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"action": "get_balance"}'

# API Wallet
curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/wallet \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"action": "check_balance"}'
```

## Update Installation Commands

Setelah HTTPS aktif, update default API base di scripts:

### Update minting.sh
```bash
# Edit line:
API_BASE="${REAGENT_API_BASE:-https://mining.reagent.eu.cc}"
```

### Update wallet.sh
```bash
# Edit line:
API_BASE="${REAGENT_API_BASE:-https://mining.reagent.eu.cc}"
```

### Re-upload scripts
```bash
scp blinkai/public/skills/minting.sh root@159.65.141.68:/root/blinkai/public/skills/
scp blinkai/public/skills/wallet.sh root@159.65.141.68:/root/blinkai/public/skills/
```

## SSL Auto-Renewal

Certbot sudah setup auto-renewal. Verifikasi:

```bash
# Cek renewal timer
systemctl status certbot.timer

# Test renewal (dry run)
certbot renew --dry-run
```

Certificate akan auto-renew 30 hari sebelum expire.

## Checklist

- [ ] DNS record added di Cloudflare
- [ ] DNS resolving (nslookup berhasil)
- [ ] SSL certificate obtained
- [ ] Nginx config updated
- [ ] Nginx started successfully
- [ ] HTTPS working (curl berhasil)
- [ ] Documentation accessible
- [ ] Skills downloadable
- [ ] API endpoints responding
- [ ] Scripts updated dengan HTTPS URL

## Selesai! 🎉

Subdomain mining.reagent.eu.cc sekarang fully operational dengan HTTPS!

**URLs:**
- 📚 Documentation: https://mining.reagent.eu.cc/docs
- 💚 Health Status: https://mining.reagent.eu.cc/health
- 🔧 Minting Skill: https://mining.reagent.eu.cc/skills/minting.sh
- 💰 Wallet Skill: https://mining.reagent.eu.cc/skills/wallet.sh

**Installation untuk agent lain:**
```bash
curl -O https://mining.reagent.eu.cc/skills/minting.sh
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
chmod +x minting.sh wallet.sh
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="https://mining.reagent.eu.cc"
```

---

**Total Time**: ~15 menit  
**Status**: Production Ready ✅
