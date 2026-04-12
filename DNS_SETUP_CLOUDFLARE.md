# Setup DNS dengan Cloudflare untuk reagent.eu.cc

## Kenapa Cloudflare?

- ✅ Gratis
- ✅ Mudah setup A record
- ✅ CDN gratis
- ✅ DDoS protection
- ✅ SSL/TLS support
- ✅ Fast DNS propagation

---

## Step 1: Daftar Cloudflare

1. Buka: https://dash.cloudflare.com/sign-up
2. Daftar dengan email Anda
3. Verify email

---

## Step 2: Add Domain ke Cloudflare

1. Login ke Cloudflare Dashboard
2. Klik **"Add a Site"**
3. Masukkan: **reagent.eu.cc**
4. Klik **"Add site"**
5. Pilih plan **"Free"**
6. Klik **"Continue"**

---

## Step 3: Setup DNS Records

Cloudflare akan scan DNS records yang ada. Tambahkan A record:

### A Record untuk Root Domain

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 159.65.141.68 | Proxied (🟠) | Auto |

**Cara tambah:**
1. Klik **"Add record"**
2. Type: **A**
3. Name: **@** (atau reagent.eu.cc)
4. IPv4 address: **159.65.141.68**
5. Proxy status: **Proxied** (orange cloud 🟠)
6. Klik **"Save"**

### Optional: WWW Subdomain

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | www | 159.65.141.68 | Proxied (🟠) | Auto |

---

## Step 4: Update Nameservers di eu.cc

Cloudflare akan memberikan 2 nameservers, contoh:
- `aron.ns.cloudflare.com`
- `june.ns.cloudflare.com`

**Update di eu.cc dashboard:**

1. Login ke eu.cc control panel
2. Cari domain **reagent.eu.cc**
3. Cari bagian **"Nameservers"** atau **"DNS Settings"**
4. Ganti DNS 1 dan DNS 2 dengan nameservers dari Cloudflare:
   - **DNS 1**: `aron.ns.cloudflare.com` (contoh)
   - **DNS 2**: `june.ns.cloudflare.com` (contoh)
5. Save changes

---

## Step 5: Verify di Cloudflare

1. Kembali ke Cloudflare dashboard
2. Klik **"Done, check nameservers"**
3. Cloudflare akan verify (bisa 5 menit - 24 jam)
4. Anda akan dapat email konfirmasi

---

## Step 6: Configure SSL/TLS di Cloudflare

Setelah nameservers active:

1. Di Cloudflare dashboard, pilih domain **reagent.eu.cc**
2. Klik **"SSL/TLS"** di sidebar
3. Pilih mode: **"Full (strict)"** atau **"Full"**
   - **Full**: Cloudflare ↔ Server (self-signed OK)
   - **Full (strict)**: Cloudflare ↔ Server (valid cert required)

**Recommended**: Pilih **"Full"** dulu, nanti upgrade ke **"Full (strict)"** setelah Let's Encrypt installed.

---

## Step 7: Enable Additional Security

### Always Use HTTPS

1. Klik **"SSL/TLS"** → **"Edge Certificates"**
2. Enable **"Always Use HTTPS"**
3. Enable **"Automatic HTTPS Rewrites"**

### HSTS (Optional)

1. Scroll ke **"HTTP Strict Transport Security (HSTS)"**
2. Klik **"Enable HSTS"**
3. Configure settings (recommended defaults)

---

## Step 8: Test DNS

Setelah nameservers active (tunggu 5-30 menit):

```bash
# Check DNS
dig reagent.eu.cc

# Should show Cloudflare IPs (not your server IP directly)
# This is normal - Cloudflare proxies the traffic

# Check nameservers
dig NS reagent.eu.cc

# Should show Cloudflare nameservers
```

---

## Step 9: Run SSL Setup Script

Setelah DNS active, run setup script:

```bash
cd /root/blinkai
chmod +x scripts/setup-domain-ssl.sh
sudo ./scripts/setup-domain-ssl.sh
```

**IMPORTANT**: Saat script minta SSL certificate, Cloudflare harus dalam mode **"Full"** atau **"Flexible"**, bukan **"Full (strict)"**.

---

## Step 10: Update Cloudflare SSL Mode

Setelah Let's Encrypt certificate installed:

1. Kembali ke Cloudflare dashboard
2. **SSL/TLS** → **Overview**
3. Ubah ke **"Full (strict)"**

---

## Cloudflare Settings Summary

### DNS Records
```
Type: A
Name: @
Content: 159.65.141.68
Proxy: Proxied (🟠)
```

### SSL/TLS
```
Mode: Full (strict)
Always Use HTTPS: On
Automatic HTTPS Rewrites: On
Minimum TLS Version: 1.2
```

### Security
```
Security Level: Medium
Challenge Passage: 30 minutes
Browser Integrity Check: On
```

---

## Benefits of Using Cloudflare

### 1. CDN (Content Delivery Network)
- Static assets cached globally
- Faster load times worldwide

### 2. DDoS Protection
- Automatic DDoS mitigation
- Rate limiting

### 3. SSL/TLS
- Free SSL certificate from Cloudflare
- Plus your Let's Encrypt cert on server

### 4. Analytics
- Traffic analytics
- Security insights

### 5. Performance
- Auto minification
- Brotli compression
- HTTP/2 & HTTP/3

---

## Troubleshooting

### Issue: Nameservers not updating

**Solution**: Wait 24-48 hours. Some registrars are slow.

Check status:
```bash
dig NS reagent.eu.cc
```

### Issue: Too many redirects

**Solution**: Change Cloudflare SSL mode to "Full" or "Flexible"

### Issue: 502 Bad Gateway

**Solution**: 
1. Check if app is running: `pm2 status`
2. Check Nginx: `sudo systemctl status nginx`
3. Check Cloudflare SSL mode

### Issue: Certificate validation failed

**Solution**: 
1. Temporarily set Cloudflare to "DNS Only" (grey cloud)
2. Run certbot
3. Set back to "Proxied" (orange cloud)

---

## Alternative: DNS Only Mode

If you want to use Let's Encrypt without Cloudflare proxy:

1. Click the orange cloud (🟠) next to A record
2. It will turn grey (☁️) - "DNS Only"
3. Now traffic goes directly to your server
4. You lose CDN/DDoS protection but SSL setup is simpler

---

## Quick Reference

### Cloudflare Dashboard
https://dash.cloudflare.com

### DNS Propagation Check
https://dnschecker.org/#A/reagent.eu.cc

### Cloudflare Docs
https://developers.cloudflare.com/dns/

---

## Summary

1. ✅ Add domain to Cloudflare
2. ✅ Add A record: @ → 159.65.141.68
3. ✅ Update nameservers at eu.cc
4. ✅ Wait for verification (5-30 min)
5. ✅ Set SSL mode to "Full"
6. ✅ Run setup script on server
7. ✅ Change SSL mode to "Full (strict)"
8. ✅ Access https://reagent.eu.cc

**Total time**: ~30 minutes (including DNS propagation)
