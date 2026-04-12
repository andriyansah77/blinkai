# Setup DNS dengan FreeDNS untuk reagent.eu.cc

## Opsi Alternatif: FreeDNS

Jika tidak mau pakai Cloudflare, bisa pakai FreeDNS (afraid.org):

---

## Step 1: Daftar FreeDNS

1. Buka: https://freedns.afraid.org/signup/
2. Daftar akun gratis
3. Verify email

---

## Step 2: Add Domain

1. Login ke FreeDNS
2. Klik **"Subdomains"** → **"Add"**
3. Atau klik **"Registry"** untuk add full domain

### For Subdomain (Easier)

1. Type: **A**
2. Subdomain: **reagent**
3. Domain: Pilih dari list (cari yang .eu.cc)
4. Destination: **159.65.141.68**
5. Klik **"Save!"**

### For Full Domain

1. Klik **"Domains"** → **"Add a domain"**
2. Domain: **reagent.eu.cc**
3. Shared: **No** (private)
4. Klik **"Submit"**

---

## Step 3: Add A Record

1. Klik **"Subdomains"**
2. Klik **"Add"**
3. Type: **A**
4. Subdomain: **@** atau kosong
5. Domain: **reagent.eu.cc**
6. Destination: **159.65.141.68**
7. TTL: **3600**
8. Klik **"Save!"**

---

## Step 4: Get Nameservers

FreeDNS akan provide nameservers:
- `ns1.afraid.org`
- `ns2.afraid.org`
- `ns3.afraid.org`
- `ns4.afraid.org`

---

## Step 5: Update di eu.cc

1. Login ke eu.cc control panel
2. Cari domain **reagent.eu.cc**
3. Update nameservers:
   - **DNS 1**: `ns1.afraid.org`
   - **DNS 2**: `ns2.afraid.org`
4. Save

---

## Step 6: Wait & Verify

```bash
# Wait 5-30 minutes, then check
dig reagent.eu.cc

# Should show: 159.65.141.68
```

---

## Step 7: Run Setup Script

```bash
cd /root/blinkai
chmod +x scripts/setup-domain-ssl.sh
sudo ./scripts/setup-domain-ssl.sh
```

---

## Pros & Cons

### Pros
- ✅ Completely free
- ✅ Simple setup
- ✅ No account verification needed

### Cons
- ❌ No CDN
- ❌ No DDoS protection
- ❌ Basic DNS only
- ❌ Slower propagation

---

**Recommendation**: Use Cloudflare for better features and protection.
