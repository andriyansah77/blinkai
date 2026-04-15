# 🚀 Cara Deploy ke VPS Baru (188.166.247.252)

## Langkah Cepat

### 1. Connect ke VPS
```bash
ssh root@188.166.247.252
```

### 2. Download & Run Setup Script
```bash
# Download script dari GitHub
curl -o setup.sh https://raw.githubusercontent.com/andriyansah77/blinkai/main/DEPLOY_VPS_BARU.sh

# Atau copy paste manual
nano setup.sh
# Paste isi dari DEPLOY_VPS_BARU.sh, save (Ctrl+X, Y, Enter)

# Make executable
chmod +x setup.sh

# Run
bash setup.sh
```

Script akan otomatis:
- ✅ Install Node.js, PM2, Git, PostgreSQL, Nginx
- ✅ Clone repository dari GitHub
- ✅ Setup database
- ✅ Install dependencies
- ✅ Build aplikasi
- ✅ Start dengan PM2
- ✅ Setup Nginx reverse proxy
- ✅ Setup firewall

### 3. Edit .env (PENTING!)
```bash
nano /root/reagent/.env
```

Update baris ini dengan Privy credentials kamu:
```bash
NEXT_PUBLIC_PRIVY_APP_ID="clxxx-your-app-id"
PRIVY_APP_SECRET="your-secret-here"
```

Dapatkan di: https://dashboard.privy.io

Save: `Ctrl+X`, `Y`, `Enter`

### 4. Restart Aplikasi
```bash
pm2 restart reagent --update-env
pm2 logs reagent
```

### 5. Update DNS Records

Di DNS provider kamu (FreeDNS/Cloudflare), update:
```
A Record: reagent.eu.cc → 188.166.247.252
A Record: mining.reagent.eu.cc → 188.166.247.252
```

Tunggu 5-10 menit untuk DNS propagasi.

### 6. Setup SSL (Setelah DNS Propagasi)
```bash
certbot --nginx -d reagent.eu.cc -d mining.reagent.eu.cc
```

Follow prompts:
- Enter email
- Agree to terms
- Choose redirect HTTP to HTTPS (option 2)

### 7. Test
```bash
# Test lokal
curl http://localhost:3000

# Test domain (setelah DNS propagasi)
curl https://reagent.eu.cc

# Check PM2
pm2 status
pm2 logs reagent
```

## Alternatif: Setup Manual Step-by-Step

Jika script gagal, ikuti manual di: `VPS_SETUP_NEW.md`

## Deploy Update Selanjutnya

Setelah setup awal, untuk deploy update:

```bash
ssh root@188.166.247.252

cd /root/reagent
git pull
rm -rf .next
npm install --legacy-peer-deps
npm run build
pm2 restart reagent --update-env
```

Atau one-liner:
```bash
ssh root@188.166.247.252 "cd /root/reagent && git pull && rm -rf .next && npm install --legacy-peer-deps && npm run build && pm2 restart reagent --update-env"
```

## Troubleshooting

### Script gagal di tengah jalan
```bash
# Lihat error terakhir
cat /var/log/syslog | tail -50

# Coba manual step by step (lihat VPS_SETUP_NEW.md)
```

### Build error
```bash
cd /root/reagent
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
npm run build
```

### Database error
```bash
# Reset database
sudo -u postgres psql << EOF
DROP DATABASE reagent;
CREATE DATABASE reagent;
GRANT ALL PRIVILEGES ON DATABASE reagent TO reagent;
EOF

# Re-run migrations
cd /root/reagent
npx prisma generate
npx prisma db push
```

### PM2 not starting
```bash
# Check logs
pm2 logs reagent --lines 100

# Check if port 3000 is in use
lsof -i :3000

# Kill if needed
kill -9 $(lsof -t -i:3000)

# Restart
pm2 restart reagent
```

### Nginx error
```bash
# Test config
nginx -t

# Check logs
tail -f /var/log/nginx/error.log

# Restart
systemctl restart nginx
```

## Quick Commands

```bash
# Status
pm2 status

# Logs
pm2 logs reagent

# Restart
pm2 restart reagent

# Monitor
pm2 monit

# Nginx status
systemctl status nginx

# Database
sudo -u postgres psql -d reagent
```

## Info VPS

```
IP: 188.166.247.252
User: root
Path: /root/reagent
PM2 Name: reagent
Port: 3000
Database: PostgreSQL (localhost:5432)
```

## Yang Sudah Ada di GitHub

✅ Privy authentication integration
✅ NPX CLI tool untuk minting
✅ Developer Guide di landing page
✅ Semua fitur terbaru

Tinggal clone dan deploy!

---

**Old VPS**: 159.65.141.68 (mati)
**New VPS**: 188.166.247.252 (aktif)
