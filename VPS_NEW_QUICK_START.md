# 🚀 Quick Start - VPS Baru

## VPS Info
```
IP: 188.166.247.252
User: root
Path: /root/reagent
PM2: reagent
Port: 3000
```

## Setup Lengkap
Lihat: `VPS_SETUP_NEW.md` untuk panduan lengkap setup dari awal.

## Quick Deploy (Setelah Setup)

```bash
ssh root@188.166.247.252 "cd /root/reagent && git pull && rm -rf .next && npm install --legacy-peer-deps && npm run build && pm2 restart reagent --update-env"
```

## Useful Commands

```bash
# Connect
ssh root@188.166.247.252

# Check status
pm2 status

# View logs
pm2 logs reagent

# Restart app
pm2 restart reagent

# Monitor
pm2 monit
```

## DNS Update Required

Update DNS records ke IP baru:
```
A Record: reagent.eu.cc → 188.166.247.252
A Record: mining.reagent.eu.cc → 188.166.247.252
```

## What's Already Committed

✅ Privy authentication integration
✅ NPX CLI tool for minting
✅ Developer Guide on landing page
✅ All code pushed to GitHub (commit 4583cab)

## Next Steps

1. Setup VPS baru (lihat VPS_SETUP_NEW.md)
2. Update DNS records
3. Deploy aplikasi
4. Test Privy authentication
5. Migrate remaining pages to Privy

---

**Old VPS**: 159.65.141.68 (mati)
**New VPS**: 188.166.247.252 (aktif)
