# 🚀 Deploy ReAgent via GitHub ke VPS

Panduan lengkap deploy ReAgent ke VPS menggunakan GitHub sebagai perantara. Cara ini paling praktis dan profesional!

## 🎯 Keuntungan Deploy via GitHub

- ✅ **Version Control**: Semua perubahan ter-track
- ✅ **Easy Updates**: Tinggal `git pull` untuk update
- ✅ **Backup Otomatis**: Code tersimpan di cloud
- ✅ **Collaboration**: Tim bisa kerja bareng
- ✅ **CI/CD Ready**: Bisa setup auto-deployment

## 📋 Prerequisites

### Di Local Machine:
- ✅ **Git** ter-install
- ✅ **GitHub Account**
- ✅ **SSH Key** (optional tapi recommended)

### Di VPS:
- ✅ **Git** ter-install
- ✅ **Node.js & npm**
- ✅ **Hermes CLI** (sudah ada)
- ✅ **SSH Access**

## 🚀 Step-by-Step Guide

### Step 1: Push Project ke GitHub

#### 1.1 Create GitHub Repository
```bash
# Buka https://github.com/new
# Buat repository baru: "reagent" atau nama lain
# Jangan centang "Initialize with README" (karena project sudah ada)
```

#### 1.2 Initialize Git (jika belum)
```bash
cd reagent

# Initialize git jika belum
git init

# Add semua files
git add .

# Commit pertama
git commit -m "Initial commit: ReAgent with Hermes integration"
```

#### 1.3 Connect ke GitHub Repository
```bash
# Ganti dengan URL repository kamu
git remote add origin https://github.com/username/reagent.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

### Step 2: Setup VPS untuk GitHub

#### 2.1 Connect ke VPS
```bash
ssh username@your-vps-ip
```

#### 2.2 Generate SSH Key (Recommended)
```bash
# Generate SSH key untuk GitHub
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

#### 2.3 Add SSH Key ke GitHub
```bash
# 1. Copy output dari command di atas
# 2. Buka https://github.com/settings/keys
# 3. Click "New SSH key"
# 4. Paste public key dan save
```

#### 2.4 Test GitHub Connection
```bash
ssh -T git@github.com
# Should show: "Hi username! You've successfully authenticated"
```

### Step 3: Clone & Deploy di VPS

#### 3.1 Clone Repository
```bash
# Clone project dari GitHub
git clone git@github.com/username/reagent.git
# atau jika tidak pakai SSH key:
# git clone https://github.com/username/reagent.git

cd reagent
```

#### 3.2 Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit dengan konfigurasi VPS
nano .env
```

**Isi file `.env` untuk VPS:**
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth (GANTI dengan domain/IP VPS)
NEXTAUTH_URL="http://your-vps-ip:3000"
NEXTAUTH_SECRET="generate-random-32-char-secret"

# AI Configuration (WAJIB)
AI_API_KEY="sk-your-openai-api-key-here"
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
AI_PROVIDER_ID="openai"

# Hermes Agent Framework
HERMES_CLI_AVAILABLE="true"
HERMES_LEARNING_ENABLED="true"
HERMES_MEMORY_ENABLED="true"
HERMES_SKILLS_ENABLED="true"

# Platform Branding
NEXT_PUBLIC_PLATFORM_NAME="ReAgent"
NEXT_PUBLIC_PLATFORM_TAGLINE="Deploy Your AI Agents in Seconds"
```

#### 3.3 Install & Setup
```bash
# Install dependencies
npm install

# Test Hermes CLI
npm run test:hermes

# Setup database
npm run setup

# Build aplikasi
npm run build
```

#### 3.4 Start dengan PM2
```bash
# Install PM2 jika belum ada
npm install -g pm2

# Start aplikasi
pm2 start npm --name "reagent" -- start

# Save PM2 config
pm2 save

# Auto-restart on boot
pm2 startup
# Copy & run command yang muncul
```

### Step 4: Verify Deployment

#### 4.1 Check Application Status
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs blinkai

# Check application
curl http://localhost:3000/api/hermes/status
```

#### 4.2 Test dari Browser
- **Website**: `http://your-vps-ip:3000`
- **API Status**: `http://your-vps-ip:3000/api/hermes/status`
- **Test Hermes**: `http://your-vps-ip:3000/api/hermes/test`

## 🔄 Update Process (Super Mudah!)

Setiap kali ada perubahan code:

### Di Local Machine:
```bash
# Edit code
# ...

# Commit changes
git add .
git commit -m "Update: description of changes"
git push origin main
```

### Di VPS:
```bash
cd blinkai

# Pull latest changes
git pull origin main

# Install new dependencies (jika ada)
npm install

# Rebuild aplikasi
npm run build

# Restart aplikasi
pm2 restart blinkai
```

## 🤖 Auto-Deployment dengan GitHub Actions (Advanced)

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd blinkai
          git pull origin main
          npm install
          npm run build
          pm2 restart blinkai
```

**Setup Secrets di GitHub:**
1. Buka repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VPS_HOST`: IP address VPS
   - `VPS_USER`: Username VPS
   - `VPS_SSH_KEY`: Private SSH key

## 🔧 Troubleshooting

### Problem: Git clone gagal
```bash
# Jika SSH key bermasalah, pakai HTTPS
git clone https://github.com/username/blinkai.git

# Set credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Problem: Permission denied
```bash
# Fix ownership
sudo chown -R $USER:$USER ~/blinkai

# Fix permissions
chmod -R 755 ~/blinkai
```

### Problem: Port 3000 tidak bisa diakses
```bash
# Check firewall
sudo ufw status
sudo ufw allow 3000

# Check if port is used
sudo netstat -tlnp | grep :3000
```

### Problem: PM2 tidak start
```bash
# Check PM2 status
pm2 status

# Restart PM2
pm2 restart all

# Check logs
pm2 logs blinkai --lines 50
```

## 📁 Struktur Project di VPS

```
/home/username/
└── blinkai/
    ├── .git/                 # Git repository
    ├── .env                  # Environment config (VPS specific)
    ├── node_modules/         # Dependencies
    ├── .next/               # Built application
    ├── prisma/
    │   └── dev.db           # SQLite database
    ├── .hermes-instances/   # Hermes agent instances
    └── scripts/             # Deployment scripts
```

## 🎉 Benefits GitHub Deployment

- 🔄 **Easy Updates**: `git pull` untuk update
- 📝 **Version History**: Semua perubahan ter-track
- 🔒 **Secure**: SSH key authentication
- 👥 **Team Collaboration**: Multiple developers
- 🤖 **Auto Deployment**: GitHub Actions
- 💾 **Backup**: Code tersimpan di cloud
- 🔍 **Issue Tracking**: GitHub Issues
- 📊 **Analytics**: GitHub Insights

## 🚀 Quick Commands Summary

```bash
# Setup awal (sekali aja)
git clone git@github.com/username/blinkai.git
cd blinkai
cp .env.example .env && nano .env
npm install && npm run setup && npm run build
pm2 start npm --name "blinkai" -- start

# Update rutin (setiap ada perubahan)
git pull origin main
npm install
npm run build
pm2 restart blinkai

# Monitoring
pm2 status
pm2 logs blinkai
curl http://localhost:3000/api/hermes/status
```

**Total setup time: 10-15 menit** ⏱️
**Update time: 2-3 menit** ⚡

Ini cara paling profesional dan mudah untuk maintain aplikasi di VPS!