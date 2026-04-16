# 🔒 SSL Setup dengan Cloudflare

## Status Saat Ini

✅ Logo sudah bisa diakses: http://188.166.247.252/logo.jpg  
✅ Aplikasi running dengan baik  
❌ Privy memerlukan HTTPS untuk embedded wallet  

## Masalah

Privy menampilkan error:
```
Embedded wallet is only available over HTTPS
```

## Solusi: 2 Opsi

### Opsi 1: Cloudflare SSL (Paling Mudah) ⭐ RECOMMENDED

Cloudflare sudah menyediakan SSL otomatis. Kita hanya perlu:

#### Step 1: Set SSL Mode di Cloudflare

1. Login ke Cloudflare Dashboard
2. Pilih domain `reagent.eu.cc`
3. Go to **SSL/TLS** → **Overview**
4. Set SSL mode ke **"Flexible"** atau **"Full"**

**Pilih mode:**
- **Flexible**: Cloudflare ↔ User (HTTPS), Cloudflare ↔ VPS (HTTP)
  - ✅ Paling mudah, tidak perlu setup SSL di VPS
  - ⚠️ Traffic antara Cloudflare-VPS tidak encrypted
  
- **Full**: Cloudflare ↔ User (HTTPS), Cloudflare ↔ VPS (HTTPS)
  - ✅ Lebih aman, semua traffic encrypted
  - ⚠️ Perlu setup SSL di VPS (self-signed OK)

#### Step 2: Update Privy Dashboard

1. Go to https://dashboard.privy.io
2. Select your app
3. Settings → Domains
4. Add domains:
   - `https://reagent.eu.cc`
   - `https://mining.reagent.eu.cc`

#### Step 3: Update .env di VPS

```bash
ssh root@188.166.247.252
cd /root/reagent
nano .env
```

Ubah:
```bash
NEXTAUTH_URL="http://reagent.eu.cc"
```

Jadi:
```bash
NEXTAUTH_URL="https://reagent.eu.cc"
```

Save dan restart:
```bash
pm2 restart reagent --update-env
```

#### Step 4: Test

Buka browser:
- https://reagent.eu.cc
- https://mining.reagent.eu.cc

Privy seharusnya sudah bisa digunakan!

---

### Opsi 2: Let's Encrypt SSL (Lebih Aman)

Jika ingin SSL certificate langsung di VPS:

#### Step 1: Disable Cloudflare Proxy

1. Login ke Cloudflare Dashboard
2. Go to **DNS** → **Records**
3. Klik **orange cloud** (Proxied) untuk menjadi **gray cloud** (DNS only)
4. Lakukan untuk kedua records:
   - `reagent.eu.cc`
   - `mining.reagent.eu.cc`

#### Step 2: Tunggu DNS Propagation

```bash
# Cek DNS (harus return 188.166.247.252)
nslookup reagent.eu.cc 8.8.8.8
```

Tunggu 5-10 menit sampai DNS resolve ke IP VPS.

#### Step 3: Run SSL Setup Script

```bash
ssh root@188.166.247.252
cd /root/reagent
chmod +x setup-ssl-vps.sh
./setup-ssl-vps.sh
```

Script akan:
- Install Certbot
- Obtain SSL certificate dari Let's Encrypt
- Configure Nginx dengan SSL
- Setup auto-renewal

#### Step 4: Update .env

```bash
nano .env
```

Ubah ke HTTPS:
```bash
NEXTAUTH_URL="https://reagent.eu.cc"
```

Restart:
```bash
pm2 restart reagent --update-env
```

#### Step 5: Update Privy Dashboard

Add HTTPS domains di Privy dashboard.

---

## Perbandingan Opsi

| Feature | Cloudflare SSL | Let's Encrypt |
|---------|---------------|---------------|
| Setup | ⭐⭐⭐⭐⭐ Sangat mudah | ⭐⭐⭐ Perlu setup |
| Kecepatan | ⭐⭐⭐⭐⭐ CDN caching | ⭐⭐⭐ Direct |
| Keamanan | ⭐⭐⭐⭐ (Flexible) / ⭐⭐⭐⭐⭐ (Full) | ⭐⭐⭐⭐⭐ End-to-end |
| DDoS Protection | ⭐⭐⭐⭐⭐ Built-in | ❌ None |
| Auto-renewal | ✅ Otomatis | ✅ Via Certbot |
| Certificate | Cloudflare | Let's Encrypt |

## Rekomendasi

**Untuk production**: Gunakan **Cloudflare SSL (Flexible mode)** karena:
- ✅ Setup paling mudah (1 menit)
- ✅ Gratis DDoS protection
- ✅ CDN untuk loading lebih cepat
- ✅ Auto SSL renewal
- ✅ Tidak perlu maintain certificate di VPS

**Untuk development/testing**: Bisa gunakan HTTP sementara dengan:
```bash
# Di Privy provider, disable embedded wallet untuk testing
```

## Troubleshooting

### Cloudflare SSL tidak aktif

1. Cek SSL mode: SSL/TLS → Overview
2. Pastikan mode bukan "Off"
3. Tunggu 1-2 menit untuk propagation

### Privy masih error setelah SSL

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Cek `.env` sudah HTTPS
4. Restart PM2: `pm2 restart reagent --update-env`
5. Update Privy dashboard domains

### Mixed Content Error

Jika ada error "Mixed Content", pastikan semua resource menggunakan HTTPS atau relative URLs.

## Quick Commands

```bash
# Update .env ke HTTPS
ssh root@188.166.247.252 "cd /root/reagent && sed -i 's|http://|https://|g' .env && pm2 restart reagent --update-env"

# Check SSL status
curl -I https://reagent.eu.cc

# View PM2 logs
ssh root@188.166.247.252 "pm2 logs reagent --lines 50"
```

## Next Steps

Setelah SSL aktif:

1. ✅ Test Privy login
2. ✅ Test embedded wallet creation
3. ✅ Test token minting
4. ✅ Update all documentation dengan HTTPS URLs
5. ✅ Setup monitoring untuk SSL expiration (jika pakai Let's Encrypt)

---

**Pilihan terbaik**: Gunakan Cloudflare SSL Flexible mode untuk kemudahan dan performa optimal.
