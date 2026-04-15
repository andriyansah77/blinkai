# 🚀 Setup VPS Baru - 188.166.247.252

## VPS Info
- IP: 188.166.247.252
- User: root
- Domain: reagent.eu.cc, mining.reagent.eu.cc

## Step 1: Connect to VPS

```bash
ssh root@188.166.247.252
```

## Step 2: Install Node.js & npm

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

## Step 3: Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Verify PM2
pm2 -v

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you
```

## Step 4: Install Git

```bash
apt install -y git

# Configure git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Step 5: Clone Repository

```bash
# Navigate to root home
cd /root

# Clone repository
git clone https://github.com/andriyansah77/blinkai.git reagent

# Navigate to project
cd reagent
```

## Step 6: Setup Environment Variables

```bash
# Create .env file
nano .env
```

Paste this content (update with your actual values):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reagent?schema=public"

# NextAuth (keep for backward compatibility)
NEXTAUTH_URL="https://reagent.eu.cc"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Privy Authentication (REQUIRED)
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-app-secret"

# Tempo Network
NEXT_PUBLIC_TEMPO_RPC_URL="https://rpc.tempo.xyz"
NEXT_PUBLIC_TEMPO_CHAIN_ID="4217"

# Wallet
DEPLOYER_PRIVATE_KEY="your-deployer-private-key"
ADMIN_WALLET_ADDRESS="your-admin-wallet-address"

# Contract Addresses (will be set after deployment)
NEXT_PUBLIC_REAGENT_TOKEN_ADDRESS=""
NEXT_PUBLIC_PATHUSD_TOKEN_ADDRESS=""

# API Keys (if needed)
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

## Step 7: Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE reagent;
CREATE USER reagent WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE reagent TO reagent;
\q
EOF

# Update DATABASE_URL in .env with the password you set
nano .env
# Change: DATABASE_URL="postgresql://reagent:your-secure-password@localhost:5432/reagent?schema=public"
```

## Step 8: Install Dependencies & Build

```bash
cd /root/reagent

# Install dependencies (use legacy-peer-deps for Privy)
npm install --legacy-peer-deps

# Setup database
npx prisma generate
npx prisma db push

# Build application
npm run build
```

## Step 9: Start with PM2

```bash
# Start application
pm2 start npm --name "reagent" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs reagent --lines 50
```

## Step 10: Install & Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/reagent
```

Paste this configuration:

```nginx
# Main domain - reagent.eu.cc
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

# Subdomain - mining.reagent.eu.cc
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
```

Save and enable:

```bash
# Enable site
ln -s /etc/nginx/sites-available/reagent /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

## Step 11: Setup SSL with Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificates for both domains
certbot --nginx -d reagent.eu.cc -d mining.reagent.eu.cc

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
certbot renew --dry-run
```

## Step 12: Configure Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

## Step 13: Update DNS Records

Go to your DNS provider (FreeDNS or Cloudflare) and update:

```
A Record: reagent.eu.cc → 188.166.247.252
A Record: mining.reagent.eu.cc → 188.166.247.252
```

Wait 5-10 minutes for DNS propagation.

## Step 14: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs reagent --lines 50

# Check if app is running
curl http://localhost:3000

# Check Nginx
systemctl status nginx

# Check SSL
curl https://reagent.eu.cc
```

## Quick Deploy Script (After Initial Setup)

Save this as `/root/deploy.sh`:

```bash
#!/bin/bash
cd /root/reagent
git pull
rm -rf .next
npm install --legacy-peer-deps
npm run build
pm2 restart reagent --update-env
pm2 logs reagent --lines 30
```

Make executable:
```bash
chmod +x /root/deploy.sh
```

Use it:
```bash
/root/deploy.sh
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs reagent

# Restart app
pm2 restart reagent

# Stop app
pm2 stop reagent

# Start app
pm2 start reagent

# Delete app from PM2
pm2 delete reagent

# Monitor
pm2 monit

# Show app info
pm2 show reagent
```

## Troubleshooting

### App not starting
```bash
# Check logs
pm2 logs reagent --lines 100

# Check if port 3000 is in use
lsof -i :3000

# Restart
pm2 restart reagent
```

### Database connection error
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check database exists
sudo -u postgres psql -l

# Test connection
sudo -u postgres psql -d reagent
```

### Nginx not working
```bash
# Check Nginx status
systemctl status nginx

# Check configuration
nginx -t

# View error logs
tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Renew certificates
certbot renew

# Check certificate status
certbot certificates
```

## Next Steps After Setup

1. ✅ Verify https://reagent.eu.cc works
2. ✅ Test Privy authentication at /sign-in
3. ✅ Check Developer Guide section
4. ✅ Test NPX CLI tool
5. 🔄 Migrate remaining pages to Privy
6. 🔄 Deploy REAGENT token contract
7. 🔄 Setup mining functionality

## Quick Reference

```bash
# Deploy updates
cd /root/reagent && git pull && npm run build && pm2 restart reagent

# View logs
pm2 logs reagent

# Check status
pm2 status

# Monitor resources
pm2 monit
```

---

**VPS IP**: 188.166.247.252
**Domains**: reagent.eu.cc, mining.reagent.eu.cc
**App Path**: /root/reagent
**PM2 Name**: reagent
**Port**: 3000
