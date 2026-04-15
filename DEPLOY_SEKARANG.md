# 🚀 Deploy Sekarang ke VPS Baru

## Copy-Paste Commands Ini

### 1. Connect ke VPS
```bash
ssh root@188.166.247.252
```

### 2. Run Setup Script (Otomatis)
```bash
curl -o setup.sh https://raw.githubusercontent.com/andriyansah77/blinkai/main/DEPLOY_VPS_BARU.sh && chmod +x setup.sh && bash setup.sh
```

Script ini akan:
- Install semua dependencies (Node.js, PM2, PostgreSQL, Nginx)
- Clone repository dari GitHub
- Setup database
- Build aplikasi
- Start dengan PM2
- Setup Nginx & firewall

**Waktu: ~10-15 menit**

### 3. Edit .env (WAJIB!)
```bash
nano /root/reagent/.env
```

Ganti baris ini:
```bash
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id-here"
PRIVY_APP_SECRET="your-privy-app-secret-here"
```

Dengan credentials dari: https://dashboard.privy.io

Save: `Ctrl+X`, `Y`, `Enter`

### 4. Restart
```bash
pm2 restart reagent --update-env
pm2 logs reagent
```

### 5. Update DNS
Di DNS provider, update:
```
reagent.eu.cc → 188.166.247.252
mining.reagent.eu.cc → 188.166.247.252
```

### 6. Setup SSL (Setelah DNS Propagasi)
```bash
certbot --nginx -d reagent.eu.cc -d mining.reagent.eu.cc
```

## Done! 🎉

Test: https://reagent.eu.cc

---

## Yang Sudah Siap di GitHub

✅ Privy authentication (multi-login: email, wallet, social)
✅ Embedded wallet auto-creation
✅ NPX CLI tool: `npx @reagent/cli`
✅ Developer Guide di landing page
✅ REST API documentation
✅ Semua fitur terbaru

## Jika Ada Masalah

Lihat troubleshooting di: `CARA_DEPLOY_VPS_BARU.md`

Atau setup manual: `VPS_SETUP_NEW.md`
