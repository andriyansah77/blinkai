# Quick DNS Setup untuk reagent.eu.cc

## Masalah: eu.cc Dashboard Cuma Ada DNS 1 & DNS 2

Itu untuk **nameservers**, bukan A record. Kita perlu pakai DNS provider lain.

---

## 🚀 Recommended: Cloudflare (Gratis + CDN + DDoS Protection)

### Step 1: Daftar Cloudflare
https://dash.cloudflare.com/sign-up

### Step 2: Add Domain
1. Klik "Add a Site"
2. Masukkan: **reagent.eu.cc**
3. Pilih plan **Free**

### Step 3: Add A Record
```
Type: A
Name: @
Content: 159.65.141.68
Proxy: Proxied (🟠)
```

### Step 4: Update Nameservers di eu.cc

Cloudflare akan kasih 2 nameservers, contoh:
- `aron.ns.cloudflare.com`
- `june.ns.cloudflare.com`

**Di eu.cc dashboard:**
- DNS 1: `aron.ns.cloudflare.com`
- DNS 2: `june.ns.cloudflare.com`

### Step 5: Wait (5-30 menit)

Cloudflare akan verify nameservers.

### Step 6: Configure SSL di Cloudflare

1. SSL/TLS → Overview
2. Pilih: **Full**

### Step 7: Run Setup Script

```bash
cd /root/blinkai
chmod +x scripts/setup-domain-ssl.sh
sudo ./scripts/setup-domain-ssl.sh
```

### Step 8: Update SSL Mode

Setelah Let's Encrypt installed:
1. Cloudflare → SSL/TLS
2. Ubah ke: **Full (strict)**

---

## ✅ Done!

Access: https://reagent.eu.cc

---

## 🔧 Alternative: FreeDNS (Gratis, No CDN)

### Step 1: Daftar
https://freedns.afraid.org/signup/

### Step 2: Add A Record
```
Type: A
Subdomain: @
Domain: reagent.eu.cc
Destination: 159.65.141.68
```

### Step 3: Update Nameservers di eu.cc
- DNS 1: `ns1.afraid.org`
- DNS 2: `ns2.afraid.org`

### Step 4: Run Setup Script
```bash
cd /root/blinkai
sudo ./scripts/setup-domain-ssl.sh
```

---

## 📊 Comparison

| Feature | Cloudflare | FreeDNS |
|---------|-----------|---------|
| Price | Free | Free |
| CDN | ✅ | ❌ |
| DDoS Protection | ✅ | ❌ |
| SSL | ✅ | ❌ |
| Speed | Fast | Slow |
| Setup | Easy | Easy |

**Recommendation**: Use Cloudflare

---

## 🆘 Need Help?

Read full guides:
- `DNS_SETUP_CLOUDFLARE.md` - Detailed Cloudflare guide
- `DNS_SETUP_FREEDNS.md` - FreeDNS alternative
- `DOMAIN_SSL_SETUP.md` - Complete SSL setup guide

---

**Choose one DNS provider, update nameservers, then run the setup script!**
