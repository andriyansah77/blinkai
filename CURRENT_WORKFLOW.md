# ReAgent Platform - Current Working Workflow

**Last Updated**: 2026-04-18  
**Status**: ✅ Production Ready  
**Version**: 3.0.0

## Overview

ReAgent adalah platform AI agent deployment di Tempo Network dengan fitur mining REAGENT tokens. Dokumentasi ini menjelaskan workflow yang benar-benar works di production.

## Table of Contents

1. [Architecture](#architecture)
2. [User Onboarding Flow](#user-onboarding-flow)
3. [Mining System](#mining-system)
4. [Telegram Bot Integration](#telegram-bot-integration)
5. [Configuration](#configuration)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Blockchain**: Tempo Network (Chain ID: 4217)
- **Authentication**: Privy (Web3 + Social Login)
- **AI Framework**: Hermes Agent Framework

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                     ReAgent Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │  Mining Page │  │  Telegram Bot│      │
│  │   (Web UI)   │  │  (Web UI)    │  │  (Hermes)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │   API Routes    │                        │
│                   │  (Next.js)      │                        │
│                   └────────┬────────┘                        │
│                            │                                  │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐     │
│  │Simple Minting│  │Simple Wallet │  │   Prisma     │     │
│  │   Engine     │  │   Manager    │  │   (ORM)      │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │   PostgreSQL    │                        │
│                   │   Database      │                        │
│                   └─────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ ethers.js
                            ▼
                ┌───────────────────────┐
                │   Tempo Network       │
                │   (Blockchain)        │
                │                       │
                │  - REAGENT Token      │
                │  - PATHUSD Token      │
                └───────────────────────┘
```

---

## User Onboarding Flow

### Step 1: Sign Up / Login

User bisa login dengan:
- Email + Password
- Google OAuth
- Wallet (MetaMask, WalletConnect)

**Implementation**: Privy handles authentication

```typescript
// src/app/auth/page.tsx
const { login, authenticated } = usePrivy();
```

### Step 2: Auto Wallet Creation

Setelah login, wallet otomatis dibuat dengan:
- Private key encrypted (AES-256-GCM)
- Stored di database
- User dapat mnemonic untuk backup

**Implementation**:
```typescript
// src/lib/mining/simple-wallet-manager.ts
const wallet = ethers.Wallet.createRandom();
const encryptedKey = encrypt(wallet.privateKey);
await prisma.wallet.create({
  data: {
    userId,
    address: wallet.address,
    encryptedPrivateKey: encryptedKey,
    keyIv: iv
  }
});
```

### Step 3: Dashboard Access

User langsung bisa akses:
- Dashboard (AI agents)
- Mining page (mint REAGENT)
- Wallet info
- Transaction history

---

## Mining System

### Architecture: Server-Side Minting

**Key Concept**: Master wallet mints TO user address, user pays fee FROM their wallet.

```
┌─────────────────────────────────────────────────────────────┐
│                    Mining Flow                               │
└─────────────────────────────────────────────────────────────┘

User Request (/mine or API call)
         │
         ▼
┌────────────────────┐
│ 1. Authenticate    │ ← Privy session or API key
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 2. Check Balance   │ ← User must have PATHUSD for fee
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 3. Transfer Fee    │ ← User → Platform (ERC-20 transfer)
│    (PATHUSD)       │   Amount: 0.5 (auto) or 1.0 (manual)
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 4. Create Record   │ ← Database inscription record
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 5. Mint Tokens     │ ← Master wallet → User address
│    (REAGENT)       │   Amount: 10,000 REAGENT
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 6. Monitor TX      │ ← Wait for confirmation
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 7. Update Balance  │ ← Update database
└────────────────────┘
```

### Fee Structure

| Type | Fee (PATHUSD) | Tokens Earned | Use Case |
|------|---------------|---------------|----------|
| Auto | 0.5 | 10,000 REAGENT | AI agent mining |
| Manual | 1.0 | 10,000 REAGENT | User manual mining |

**Configurable via .env**:
```bash
AUTO_MINT_FEE=0.5
MANUAL_MINT_FEE=1.0
```

### API Endpoints

#### POST /api/mining/simple-mint

Mint REAGENT tokens.

**Authentication**: 
- Privy session (dashboard)
- API key + X-User-ID header (bot)

**Request**:
```json
{
  "type": "auto" | "manual"
}
```

**Response**:
```json
{
  "success": true,
  "inscriptionId": "inscription_123",
  "txHash": "0x...",
  "tokensEarned": "10000",
  "feePaid": "0.5"
}
```

### Master Wallet Setup

Master wallet adalah wallet khusus yang memiliki ISSUER_ROLE untuk mint REAGENT tokens.

**Setup**:
```bash
# Generate master wallet
npx tsx scripts/setup-master-wallet.ts

# Output:
# Master Wallet Created!
# Address: 0x...
# Mnemonic: word1 word2 ... word12
# Private Key: 0x...

# Add to .env
echo "MASTER_WALLET_USER_ID=master" >> .env

# Fund master wallet with PATHUSD for gas
# Grant ISSUER_ROLE on REAGENT token contract
```

**Grant ISSUER_ROLE**:
```solidity
// On REAGENT token contract
grantRole(
  0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122,
  MASTER_WALLET_ADDRESS
)
```

---

## Telegram Bot Integration

### Overview

User bisa mining REAGENT langsung dari Telegram bot dengan slash commands.

### Setup

1. **Create Bot** di @BotFather
2. **Connect Bot** di Dashboard → Channels
3. **Link Account** dengan `/start` di Telegram
4. **Use Commands**: `/mine`, `/balance`, `/wallet`

### Slash Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Link Telegram account | `/start` |
| `/mine [amount]` | Mine REAGENT tokens | `/mine 5` |
| `/balance` | Check wallet balance | `/balance` |
| `/wallet` | View wallet info | `/wallet` |
| `/help` | Show help message | `/help` |

### Architecture

```
Telegram User
     │
     ▼
Telegram Bot (Hermes Gateway)
     │
     ▼
telegram_commands_skill.py
     │
     ▼
Platform API (/api/mining/simple-mint)
     │
     ▼
Simple Minting Engine
     │
     ▼
Blockchain (Tempo Network)
```

### Database Schema

```sql
CREATE TABLE "TelegramLink" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "telegramUserId" TEXT UNIQUE NOT NULL,
  "telegramUsername" TEXT,
  "telegramFirstName" TEXT,
  "telegramLastName" TEXT,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);
```

### API Endpoints

#### POST /api/telegram/link

Link Telegram account to platform user.

**Request**:
```json
{
  "telegramUserId": "123456789",
  "telegramUsername": "john_doe",
  "telegramFirstName": "John",
  "telegramLastName": "Doe"
}
```

#### GET /api/telegram/user

Get user by Telegram ID.

**Query**: `?telegram_id=123456789`

**Response**:
```json
{
  "success": true,
  "userId": "user_123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://reagent:password@localhost:5432/reagent"

# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-app-secret"

# Tempo Network
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"

# Token Addresses
REAGENT_TOKEN_ADDRESS="0x20C000000000000000000000a59277C0c1d65Bc5"
PATHUSD_TOKEN_ADDRESS="0x20c0000000000000000000000000000000000000"

# Master Wallet
MASTER_WALLET_USER_ID="master"
PLATFORM_WALLET_ADDRESS="0xYourPlatformWalletAddress"

# Wallet Encryption
WALLET_ENCRYPTION_KEY="your-32-character-encryption-key"

# Mining Fees (configurable)
AUTO_MINT_FEE="0.5"
MANUAL_MINT_FEE="1.0"

# Platform API (for Telegram bot)
PLATFORM_API_KEY="your-secure-api-key"
PLATFORM_URL="https://reagent.eu.cc"

# AI Configuration
AI_API_KEY="your-openai-api-key"
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
```

### Fee Configuration

Ubah fee tanpa rebuild:

```bash
# Edit .env
nano .env

# Update values
AUTO_MINT_FEE=0.3
MANUAL_MINT_FEE=0.8

# Restart
pm2 restart reagent
```

---

## Deployment

### Prerequisites

- VPS dengan Ubuntu 20.04+
- Node.js 18+
- PostgreSQL 14+
- PM2 (process manager)
- Domain dengan SSL

### Step-by-Step Deployment

#### 1. Setup VPS

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx certbot python3-certbot-nginx
```

#### 2. Setup Database

```bash
# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE reagent;
CREATE USER reagent WITH PASSWORD 'reagent123';
GRANT ALL PRIVILEGES ON DATABASE reagent TO reagent;
\q
EOF
```

#### 3. Clone and Setup Project

```bash
# Clone repository
cd /root
git clone https://github.com/your-repo/reagent.git
cd reagent

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
# Or if database already exists:
npx prisma db push --accept-data-loss
```

#### 4. Setup Master Wallet

```bash
# Generate master wallet
npx tsx scripts/setup-master-wallet.ts

# Save output (address, mnemonic, private key)
# Add to .env:
echo "MASTER_WALLET_USER_ID=master" >> .env

# Fund master wallet with PATHUSD
# Grant ISSUER_ROLE on REAGENT token
```

#### 5. Build and Start

```bash
# Build application
npm run build

# Start with PM2
pm2 start npm --name "reagent" -- start
pm2 save
pm2 startup
```

#### 6. Setup Nginx

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/reagent << 'EOF'
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
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/reagent /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL
certbot --nginx -d reagent.eu.cc
```

#### 7. Setup Telegram Bot (Optional)

```bash
# Copy Telegram skill
cp hermes-skills/telegram_commands_skill.py /root/.hermes/skills/

# Set environment
export PLATFORM_API_KEY="your-api-key"
export PLATFORM_URL="https://reagent.eu.cc"

# Restart Hermes gateways
hermes gateway restart --all
```

### Update Deployment

```bash
# Pull latest code
cd /root/reagent
git pull origin main

# Install new dependencies (if any)
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (if any)
npx prisma migrate deploy

# Build
npm run build

# Restart
pm2 restart reagent

# Check logs
pm2 logs reagent --lines 50
```

---

## Troubleshooting

### Mining Failed: Insufficient PATHUSD

**Problem**: User tidak punya PATHUSD untuk bayar fee

**Solution**:
1. User harus deposit PATHUSD ke wallet mereka
2. Check balance: `/api/wallet/balance`
3. Minimum: 0.5 PATHUSD (auto) atau 1.0 PATHUSD (manual)

### Mining Failed: Gas Limit Exceeded

**Problem**: Gas limit terlalu kecil (150k → 300k)

**Solution**: Already fixed di code (gas limit = 300k)

### Mining Failed: Value Transfer Not Allowed

**Problem**: Trying to transfer native token instead of ERC-20

**Solution**: Already fixed - using ERC-20 transfer for PATHUSD

### Telegram Bot Not Responding

**Problem**: Bot tidak respond ke slash commands

**Check**:
```bash
# 1. Gateway status
hermes --profile user-{userId} gateway status

# 2. Skill loaded
hermes --profile user-{userId} skills list

# 3. Logs
pm2 logs reagent --lines 50
```

**Solution**:
```bash
# Restart gateway
hermes --profile user-{userId} gateway restart

# Or restart all
hermes gateway restart --all
```

### Database Migration Error

**Problem**: P3005 - Database schema not empty

**Solution**:
```bash
# Use db push instead
npx prisma db push --accept-data-loss

# Or baseline migration
npx prisma migrate resolve --applied migration_name
```

### Master Wallet No ISSUER_ROLE

**Problem**: Master wallet cannot mint tokens

**Solution**:
```bash
# Grant ISSUER_ROLE on REAGENT token contract
# Call grantRole() function with:
# - role: 0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122
# - account: MASTER_WALLET_ADDRESS
```

---

## Best Practices

### Security

1. **Never expose private keys** - Always encrypted in database
2. **Use environment variables** - Never hardcode secrets
3. **Rate limiting** - Max 10 mints per hour per user
4. **API key authentication** - For bot requests
5. **SSL/TLS** - Always use HTTPS in production

### Performance

1. **Database indexing** - Already optimized in schema
2. **Caching** - Gas price cached for 60 seconds
3. **Async operations** - Transaction monitoring runs async
4. **Connection pooling** - Prisma handles automatically

### Monitoring

```bash
# Check application logs
pm2 logs reagent --lines 100

# Check database
psql -U reagent -d reagent -c "SELECT COUNT(*) FROM \"Inscription\" WHERE status = 'confirmed';"

# Check master wallet balance
# Use Tempo Explorer: https://explore.tempo.xyz/address/MASTER_WALLET_ADDRESS

# Monitor PM2
pm2 monit
```

---

## Support

- **Documentation**: https://reagent.eu.cc/docs
- **Tempo Explorer**: https://explore.tempo.xyz
- **Tempo Network**: https://tempo.xyz

---

**Last Updated**: 2026-04-18  
**Version**: 3.0.0  
**Status**: ✅ Production Ready
