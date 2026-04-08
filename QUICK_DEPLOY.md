# 🚀 Quick Deploy ke VPS - 5 Menit Setup

Panduan super cepat untuk deploy ReAgent ke VPS kamu yang sudah ada Hermes CLI.

## 🎯 Method 1: Via GitHub (Recommended & Professional)

### Step 1: Push ke GitHub
```bash
# Di local machine
cd reagent
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/reagent.git
git push -u origin main
```

### Step 2: Deploy ke VPS
```bash
# Otomatis dengan script
./scripts/setup-github-deploy.sh -r username/reagent -u root -h 192.168.1.100

# Atau manual
ssh username@your-vps-ip
git clone https://github.com/username/reagent.git
cd reagent
npm install && cp .env.example .env && nano .env
npm run setup && npm run build
pm2 start npm --name "reagent" -- start
```

### Step 3: Update (Super Mudah!)
```bash
# Di VPS, tinggal jalankan:
~/update-reagent.sh
# atau
cd reagent && git pull && npm install && npm run build && pm2 restart reagent
```

## 🎯 Method 2: Otomatis dengan Script

### Windows (PowerShell):
```powershell
# Buka PowerShell sebagai Administrator
cd reagent
.\scripts\deploy-to-vps.ps1 -VpsUser root -VpsHost 192.168.1.100
```

### Linux/macOS (Bash):
```bash
cd reagent
chmod +x scripts/deploy-to-vps.sh
./scripts/deploy-to-vps.sh -u root -h 192.168.1.100
```

**Ganti dengan info VPS kamu:**
- `root` → username VPS kamu
- `192.168.1.100` → IP address VPS kamu

## 🎯 Method 3: Manual (5 Langkah)

### Step 1: Connect ke VPS
```bash
ssh username@your-vps-ip
```

### Step 2: Clone/Upload Project
```bash
# Option A: Git Clone (jika ada repo)
git clone https://github.com/your-repo/reagent.git
cd reagent

# Option B: Upload manual
# Upload folder reagent ke VPS via FileZilla/SCP
```

### Step 3: Install & Setup
```bash
npm install
cp .env.example .env
nano .env  # Edit dengan API key kamu
```

### Step 4: Test & Build
```bash
npm run test:hermes  # Test Hermes CLI
npm run setup        # Setup database
npm run build        # Build aplikasi
```

### Step 5: Start Production
```bash
npm install -g pm2
pm2 start npm --name "reagent" -- start
pm2 save
```

## 🔧 Info VPS yang Dibutuhkan

Sebelum deploy, pastikan kamu punya:

- 🌐 **IP Address**: `192.168.1.100` (contoh)
- 👤 **Username**: `root` atau `ubuntu` (contoh)
- 🔑 **Password/SSH Key**: untuk login
- 🔧 **Port SSH**: biasanya `22`

## ⚙️ Edit File .env

Setelah deploy, edit file `.env` di VPS:

```bash
# Connect ke VPS
ssh username@your-vps-ip

# Edit environment
cd reagent
nano .env
```

**Isi yang WAJIB diubah:**
```env
# Ganti dengan domain/IP VPS kamu
NEXTAUTH_URL="http://your-vps-ip:3000"

# Ganti dengan API key OpenAI kamu
AI_API_KEY="sk-your-actual-openai-key-here"

# Hermes sudah ada di VPS
HERMES_CLI_AVAILABLE="true"
```

## 🌐 Akses Aplikasi

Setelah deploy selesai:

- **Website**: `http://your-vps-ip:3000`
- **API Status**: `http://your-vps-ip:3000/api/hermes/status`
- **Test Hermes**: `http://your-vps-ip:3000/api/hermes/test`

## 🔍 Troubleshooting Cepat

### Problem: Tidak bisa connect SSH
```bash
# Cek IP dan port
ping your-vps-ip
telnet your-vps-ip 22
```

### Problem: Hermes tidak terdeteksi
```bash
# Di VPS, cek Hermes
which hermes
hermes --version
```

### Problem: Port 3000 tidak bisa diakses
```bash
# Di VPS, cek firewall
sudo ufw allow 3000
# atau
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### Problem: PM2 tidak jalan
```bash
# Di VPS, restart PM2
pm2 restart reagent
pm2 logs reagent
```

## 🎉 Success Checklist

- [ ] ✅ SSH ke VPS berhasil
- [ ] ✅ Project ter-upload ke VPS
- [ ] ✅ `npm install` berhasil
- [ ] ✅ File `.env` sudah diedit
- [ ] ✅ `npm run test:hermes` PASSED
- [ ] ✅ `npm run build` berhasil
- [ ] ✅ PM2 running (`pm2 status`)
- [ ] ✅ Website bisa diakses di browser
- [ ] ✅ API `/api/hermes/status` return success

## 🚀 Commands Berguna

```bash
# Cek status aplikasi
ssh username@vps-ip 'pm2 status'

# Lihat logs
ssh username@vps-ip 'pm2 logs reagent'

# Restart aplikasi
ssh username@vps-ip 'pm2 restart reagent'

# Update aplikasi (jika ada perubahan)
ssh username@vps-ip 'cd reagent && git pull && npm install && npm run build && pm2 restart reagent'
```

**Total waktu deploy: 5-10 menit** ⏱️

Pilih method yang paling mudah buat kamu!