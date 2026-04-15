#!/bin/bash
# Setup ReAgent di VPS Baru - 188.166.247.252
# Run: bash DEPLOY_VPS_BARU.sh

set -e

echo "🚀 Setup ReAgent di VPS Baru"
echo "=============================="

# Update system
echo "📦 Update system..."
apt update && apt upgrade -y

# Install Node.js 20.x
echo "📦 Install Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo "📦 Install PM2..."
npm install -g pm2

# Install Git
echo "📦 Install Git..."
apt install -y git

# Clone repository
echo "📥 Clone repository dari GitHub..."
cd /root
if [ -d "reagent" ]; then
    echo "⚠️  Directory reagent sudah ada, backup dulu..."
    mv reagent reagent.backup.$(date +%s)
fi

git clone https://github.com/andriyansah77/blinkai.git reagent
cd reagent

# Create .env file
echo "📝 Buat .env file..."
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://reagent:reagent123@localhost:5432/reagent?schema=public"

# NextAuth (backward compatibility)
NEXTAUTH_URL="https://reagent.eu.cc"
NEXTAUTH_SECRET="change-this-to-random-secret-key-min-32-chars"

# Privy Authentication (REQUIRED)
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id-here"
PRIVY_APP_SECRET="your-privy-app-secret-here"

# Tempo Network
NEXT_PUBLIC_TEMPO_RPC_URL="https://rpc.tempo.xyz"
NEXT_PUBLIC_TEMPO_CHAIN_ID="4217"

# Wallet (optional, untuk deployment contract)
DEPLOYER_PRIVATE_KEY=""
ADMIN_WALLET_ADDRESS=""

# Contract Addresses (akan diisi setelah deployment)
NEXT_PUBLIC_REAGENT_TOKEN_ADDRESS=""
NEXT_PUBLIC_PATHUSD_TOKEN_ADDRESS=""
EOF

echo "⚠️  PENTING: Edit .env dan isi Privy credentials!"
echo "   nano /root/reagent/.env"
echo ""
echo "   Dapatkan Privy credentials di: https://dashboard.privy.io"
echo ""

# Install PostgreSQL
echo "📦 Install PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database
echo "🗄️  Setup database..."
sudo -u postgres psql << EOSQL
DROP DATABASE IF EXISTS reagent;
DROP USER IF EXISTS reagent;
CREATE DATABASE reagent;
CREATE USER reagent WITH ENCRYPTED PASSWORD 'reagent123';
GRANT ALL PRIVILEGES ON DATABASE reagent TO reagent;
ALTER DATABASE reagent OWNER TO reagent;
EOSQL

# Install dependencies
echo "📦 Install dependencies..."
npm install --legacy-peer-deps

# Setup database schema
echo "🗄️  Setup database schema..."
npx prisma generate
npx prisma db push

# Build application
echo "🔨 Build application..."
npm run build

# Start with PM2
echo "🚀 Start application dengan PM2..."
pm2 delete reagent 2>/dev/null || true
pm2 start npm --name "reagent" -- start
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root
pm2 save

# Install Nginx
echo "📦 Install Nginx..."
apt install -y nginx

# Create Nginx config
echo "⚙️  Setup Nginx..."
cat > /etc/nginx/sites-available/reagent << 'NGINX_EOF'
server {
    listen 80;
    server_name reagent.eu.cc;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name mining.reagent.eu.cc;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

# Enable site
ln -sf /etc/nginx/sites-available/reagent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Setup firewall
echo "🔒 Setup firewall..."
apt install -y ufw
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Install Certbot for SSL
echo "🔒 Install Certbot..."
apt install -y certbot python3-certbot-nginx

echo ""
echo "✅ Setup selesai!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env dan isi Privy credentials:"
echo "   nano /root/reagent/.env"
echo ""
echo "2. Restart aplikasi:"
echo "   pm2 restart reagent --update-env"
echo ""
echo "3. Update DNS records ke IP: 188.166.247.252"
echo "   - reagent.eu.cc → 188.166.247.252"
echo "   - mining.reagent.eu.cc → 188.166.247.252"
echo ""
echo "4. Setup SSL (setelah DNS propagasi):"
echo "   certbot --nginx -d reagent.eu.cc -d mining.reagent.eu.cc"
echo ""
echo "5. Check status:"
echo "   pm2 status"
echo "   pm2 logs reagent"
echo ""
echo "🌐 Test lokal: curl http://localhost:3000"
echo ""
