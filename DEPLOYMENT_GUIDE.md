# 🚀 Deploy BlinkAI ke VPS - Panduan Lengkap

Panduan ini akan membantu kamu deploy BlinkAI ke VPS yang sudah ada Hermes CLI-nya.

## 📋 Prerequisites

### Di VPS kamu harus sudah ada:
- ✅ **Hermes CLI** (sudah ter-install)
- ✅ **Node.js** (v18 atau lebih baru)
- ✅ **npm** atau **yarn**
- ✅ **Git**
- ✅ **PM2** (untuk production management)

### Info VPS yang dibutuhkan:
- 🌐 **IP Address** atau **Domain**
- 🔑 **SSH Access** (username & password/key)
- 🔧 **Port** yang tersedia (default: 3000)

## 🎯 Method 1: Git Clone (Recommended)

### Step 1: Connect ke VPS
```bash
ssh username@your-vps-ip
# atau
ssh username@your-domain.com
```

### Step 2: Clone Project
```bash
# Clone project ke VPS
git clone https://github.com/your-username/blinkai.git
# atau upload manual jika belum ada repo

cd blinkai
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Isi file `.env` untuk VPS:**
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth (GANTI dengan domain VPS kamu)
NEXTAUTH_URL="http://your-vps-ip:3000"
NEXTAUTH_SECRET="generate-random-32-char-secret-key-here"

# AI Configuration (WAJIB)
AI_API_KEY="sk-your-openai-api-key-here"
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
AI_PROVIDER_ID="openai"

# Hermes Agent Framework (VPS Setup)
HERMES_CLI_AVAILABLE="true"
HERMES_LEARNING_ENABLED="true"
HERMES_MEMORY_ENABLED="true"
HERMES_SKILLS_ENABLED="true"

# Platform Branding
NEXT_PUBLIC_PLATFORM_NAME="HermesAI"
NEXT_PUBLIC_PLATFORM_TAGLINE="Deploy Your AI Agents in Seconds"
```

### Step 5: Test Hermes Connection
```bash
npm run test:hermes
```

**Expected Output:**
```
✅ Hermes CLI Installation - PASSED
✅ Hermes Configuration - PASSED
✅ Available Models - PASSED
✅ Quick Chat Test - PASSED
🎉 All tests passed! Hermes CLI is ready to use.
```

### Step 6: Setup Database & Build
```bash
# Setup database dan environment
npm run setup

# Build untuk production
npm run build
```

### Step 7: Start dengan PM2 (Production)
```bash
# Install PM2 jika belum ada
npm install -g pm2

# Start aplikasi dengan PM2
pm2 start npm --name "blinkai" -- start

# Auto-restart on server reboot
pm2 startup
pm2 save
```

### Step 8: Setup Nginx (Optional - Recommended)
```bash
# Install nginx
sudo apt update
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/blinkai
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com your-vps-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/blinkai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🎯 Method 2: Docker (Alternative)

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Step 2: Build & Run
```bash
# Build Docker image
docker build -t blinkai .

# Run container
docker run -d \
  --name blinkai \
  -p 3000:3000 \
  -v /path/to/hermes:/hermes \
  -e HERMES_CLI_AVAILABLE=true \
  blinkai
```

## 🎯 Method 3: Upload Manual

### Step 1: Compress Project
```bash
# Di local machine
tar -czf blinkai.tar.gz blinkai/
```

### Step 2: Upload ke VPS
```bash
# Upload via SCP
scp blinkai.tar.gz username@your-vps-ip:/home/username/

# Atau gunakan FileZilla/WinSCP untuk GUI
```

### Step 3: Extract & Setup
```bash
# Di VPS
ssh username@your-vps-ip
tar -xzf blinkai.tar.gz
cd blinkai
npm install
# Lanjut ke Step 4 dari Method 1
```

## 🔧 Troubleshooting

### Problem: Port 3000 sudah digunakan
```bash
# Cek port yang digunakan
sudo netstat -tlnp | grep :3000

# Kill process jika perlu
sudo kill -9 PID_NUMBER

# Atau gunakan port lain
PORT=3001 npm start
```

### Problem: Hermes CLI tidak terdeteksi
```bash
# Cek instalasi Hermes
which hermes
hermes --version

# Jika tidak ada, install ulang
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc
```

### Problem: Database error
```bash
# Reset database
rm -f prisma/dev.db
npm run db:push
```

### Problem: Permission denied
```bash
# Fix permissions
sudo chown -R $USER:$USER /path/to/blinkai
chmod +x scripts/*.js
```

## 🌐 Access Your Application

Setelah deploy berhasil, kamu bisa akses:

- **Direct**: `http://your-vps-ip:3000`
- **With Nginx**: `http://your-domain.com`
- **API Status**: `http://your-domain.com/api/hermes/status`
- **Test Hermes**: `http://your-domain.com/api/hermes/test`

## 📊 Monitoring

### Check Application Status
```bash
# PM2 status
pm2 status
pm2 logs blinkai

# System resources
htop
df -h
```

### Check Hermes Status
```bash
# Test Hermes CLI
hermes --version
hermes doctor

# Check running agents
ps aux | grep hermes
```

## 🔄 Updates & Maintenance

### Update Application
```bash
cd blinkai
git pull origin main
npm install
npm run build
pm2 restart blinkai
```

### Backup Database
```bash
# Backup SQLite database
cp prisma/dev.db backups/dev.db.$(date +%Y%m%d)
```

### Monitor Logs
```bash
# Application logs
pm2 logs blinkai --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🎉 Success Checklist

- [ ] ✅ VPS accessible via SSH
- [ ] ✅ Project uploaded/cloned to VPS
- [ ] ✅ Dependencies installed (`npm install`)
- [ ] ✅ Environment configured (`.env` file)
- [ ] ✅ Hermes CLI test passed (`npm run test:hermes`)
- [ ] ✅ Database setup completed (`npm run setup`)
- [ ] ✅ Application built (`npm run build`)
- [ ] ✅ PM2 running application (`pm2 status`)
- [ ] ✅ Nginx configured (optional)
- [ ] ✅ Application accessible via browser
- [ ] ✅ API endpoints working (`/api/hermes/status`)

## 🚀 Next Steps

1. **Setup SSL Certificate** (Let's Encrypt)
2. **Configure Domain** (if using custom domain)
3. **Setup Monitoring** (Uptime monitoring)
4. **Configure Backups** (Database & files)
5. **Setup CI/CD** (Auto-deployment)

Pilih method mana yang paling cocok dengan setup VPS kamu!