# Telegram Bot Slash Commands Integration

## Overview

Telegram bot yang terintegrasi dengan Hermes Framework sekarang mendukung slash commands untuk mining dan wallet management. User bisa langsung mining REAGENT tokens dari Telegram tanpa perlu buka dashboard!

## Features

✅ `/mine [amount]` - Mine REAGENT tokens (1-10 times)
✅ `/balance` - Check wallet balance
✅ `/wallet` - View wallet info
✅ `/help` - Show help message
✅ `/start` - Start bot and link account
✅ Auto-sync dengan akun platform
✅ Server-side minting (no MetaMask needed)

## Architecture

```
Telegram User
    ↓
Telegram Bot (Hermes Gateway)
    ↓
telegram_commands_skill.py
    ↓
Platform API (/api/mining/simple-mint)
    ↓
Simple Minting Engine
    ↓
Blockchain (Tempo Network)
```

## Setup

### 1. Generate Platform API Key

```bash
# Generate secure random key
openssl rand -hex 32

# Add to .env
echo "PLATFORM_API_KEY=your_generated_key_here" >> .env
```

### 2. Install Telegram Commands Skill

Skill sudah tersedia di `hermes-skills/telegram_commands_skill.py`. Hermes akan auto-load skill ini saat gateway start.

### 3. Configure Telegram Bot

1. **Create bot di @BotFather**:
   ```
   /newbot
   Bot Name: ReAgent Mining Bot
   Username: reagent_mining_bot
   ```

2. **Set commands di @BotFather**:
   ```
   /setcommands
   
   mine - Mine REAGENT tokens
   balance - Check your balance
   wallet - View wallet info
   help - Show help message
   start - Start using the bot
   ```

3. **Connect bot di Dashboard**:
   - Login ke https://reagent.eu.cc
   - Go to Dashboard → Channels
   - Click "Connect Channel"
   - Select Telegram
   - Paste bot token
   - Click Connect

### 4. Link Telegram Account

User perlu link Telegram account mereka dengan platform account:

1. **User sends `/start` di Telegram bot**
2. **Bot saves Telegram user ID** ke database
3. **Account linked** - user bisa pakai slash commands

## Slash Commands

### `/mine [amount]`

Mine REAGENT tokens. Amount is optional (default 1, max 10).

**Examples**:
```
/mine          → Mine 1 time (10,000 REAGENT)
/mine 5        → Mine 5 times (50,000 REAGENT)
/mine 10       → Mine 10 times (100,000 REAGENT)
```

**Response**:
```
✅ Mining successful!

🎉 Minted: 10000 REAGENT
📝 TX Hash: 0x1234567...89abcdef
🔗 View: https://explore.tempo.xyz/tx/0x...

💰 Total minted: 1 time(s)
```

**Requirements**:
- User must have wallet created (auto-created on signup)
- User must have PATHUSD for fee (0.5 PATHUSD per mint)
- Master wallet must have ISSUER_ROLE

### `/balance`

Check wallet balance.

**Example**:
```
/balance
```

**Response**:
```
💰 Your Balance

🪙 REAGENT: 50000
💵 PATHUSD: 10.5

📍 Wallet: 0x1234567...89abcdef
🔗 View: https://explore.tempo.xyz/address/0x...
```

### `/wallet`

View wallet info.

**Example**:
```
/wallet
```

**Response**:
```
👛 Your Wallet

📍 Address: 0x1234567890abcdef1234567890abcdef12345678
🌐 Network: TEMPO
📅 Created: 2026-04-18

🔗 Explorer: https://explore.tempo.xyz/address/0x...

⚠️ Keep your wallet safe!
```

### `/help`

Show help message with all available commands.

**Example**:
```
/help
```

**Response**:
```
🤖 ReAgent Bot Commands

⛏️ Mining:
/mine [amount] - Mine REAGENT tokens (1-10)
Example: /mine 5

💰 Wallet:
/balance - Check your balance
/wallet - View wallet info

ℹ️ Info:
/help - Show this help message
/start - Start using the bot

📚 Learn more: https://reagent.eu.cc
```

### `/start`

Start bot and link Telegram account.

**Example**:
```
/start
```

**Response**:
```
👋 Welcome to ReAgent!

I'm your AI-powered mining assistant on Tempo Network.

🎯 Quick Start:
1. Your wallet is automatically created
2. Use /mine to start mining REAGENT tokens
3. Use /balance to check your balance

💡 Need help? Use /help

Let's start mining! ⛏️
```

## API Endpoints

### POST /api/telegram/link

Link Telegram account to platform user.

**Headers**:
- `Authorization: Bearer <PLATFORM_API_KEY>` (for bot)
- `X-User-ID: <user_id>` (for bot)
- Or Privy session cookie (for dashboard)

**Body**:
```json
{
  "telegramUserId": "123456789",
  "telegramUsername": "john_doe",
  "telegramFirstName": "John",
  "telegramLastName": "Doe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Telegram account linked successfully",
  "telegramLink": {
    "id": "link_123",
    "telegramUserId": "123456789",
    "telegramUsername": "john_doe"
  }
}
```

### DELETE /api/telegram/link

Unlink Telegram account.

**Headers**:
- Privy session cookie

**Response**:
```json
{
  "success": true,
  "message": "Telegram account unlinked successfully"
}
```

### GET /api/telegram/user

Get user info by Telegram ID.

**Query Params**:
- `telegram_id` (required): Telegram user ID

**Headers**:
- `Authorization: Bearer <PLATFORM_API_KEY>`

**Response**:
```json
{
  "success": true,
  "userId": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-04-18T..."
}
```

### POST /api/mining/simple-mint

Mine REAGENT tokens (supports bot authentication).

**Headers**:
- `Authorization: Bearer <PLATFORM_API_KEY>`
- `X-User-ID: <user_id>`
- `Content-Type: application/json`

**Body**:
```json
{
  "type": "auto"
}
```

**Response**:
```json
{
  "success": true,
  "inscriptionId": "inscription_123",
  "txHash": "0x...",
  "tokensEarned": "10000",
  "message": "Transaction submitted successfully"
}
```

### GET /api/wallet/balance

Get wallet balance (supports bot authentication).

**Headers**:
- `Authorization: Bearer <PLATFORM_API_KEY>`
- `X-User-ID: <user_id>`

**Response**:
```json
{
  "success": true,
  "address": "0x...",
  "reagentBalance": "50000",
  "pathusdBalance": "10.5",
  "lastBalanceUpdate": "2026-04-18T..."
}
```

### GET /api/wallet/info

Get wallet info (supports bot authentication).

**Headers**:
- `Authorization: Bearer <PLATFORM_API_KEY>`
- `X-User-ID: <user_id>`

**Response**:
```json
{
  "success": true,
  "id": "wallet_123",
  "address": "0x...",
  "network": "tempo",
  "reagentBalance": "50000",
  "pathusdBalance": "10.5",
  "createdAt": "2026-04-18T...",
  "lastBalanceUpdate": "2026-04-18T..."
}
```

## Database Schema

### TelegramLink Table

Stores the mapping between platform users and Telegram accounts:

```sql
CREATE TABLE "TelegramLink" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "telegramUserId" TEXT UNIQUE NOT NULL,
    "telegramUsername" TEXT,
    "telegramFirstName" TEXT,
    "telegramLastName" TEXT,
    "botToken" TEXT,
    "active" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "TelegramLink_userId_active_idx" ON "TelegramLink"("userId", "active");
```

**Fields**:
- `userId` - Platform user ID (unique)
- `telegramUserId` - Telegram user ID (unique)
- `telegramUsername` - Telegram @username (optional)
- `telegramFirstName` - User's first name from Telegram
- `telegramLastName` - User's last name from Telegram
- `botToken` - Bot token (optional, for multi-bot support)
- `active` - Whether link is active (can be deactivated)

## Security

### API Key Authentication

Telegram bot menggunakan `PLATFORM_API_KEY` untuk authenticate ke platform API:

```python
headers = {
    "Authorization": f"Bearer {PLATFORM_API_KEY}",
    "X-User-ID": user_id,
    "Content-Type": "application/json"
}
```

### User ID Verification

Platform API verifies:
1. API key is valid
2. User ID exists in database
3. User has wallet created
4. User has sufficient balance

### Rate Limiting

Same rate limits as dashboard:
- Max 10 mints per hour per user
- Max 1 request per second per user

## Deployment

### 1. Update Code

```bash
cd /root/reagent
git pull origin main
```

### 2. Run Database Migration

```bash
# Run Prisma migration to create TelegramLink table
npx prisma migrate deploy

# Or if using dev database
npx prisma migrate dev
```

### 3. Add Environment Variables

```bash
# Generate API key
API_KEY=$(openssl rand -hex 32)

# Add to .env
echo "PLATFORM_API_KEY=$API_KEY" >> .env
echo "PLATFORM_URL=https://reagent.eu.cc" >> .env
```

### 4. Build and Restart

```bash
npm run build
pm2 restart reagent
```

### 5. Update Hermes Skills

```bash
# Copy skill to Hermes skills directory
cp hermes-skills/telegram_commands_skill.py /root/.hermes/skills/

# Restart all gateways
hermes gateway restart --all
```

### 6. Test

```bash
# Test in Telegram
/start
/mine 1
/balance
```

## Troubleshooting

### Problem: Bot tidak respond ke slash commands

**Check 1**: Gateway running?
```bash
hermes --profile user-{userId} gateway status
```

**Check 2**: Skill loaded?
```bash
hermes --profile user-{userId} skills list
```

**Solution**: Restart gateway
```bash
hermes --profile user-{userId} gateway restart
```

### Problem: "Account not linked" error

**Cause**: User belum send `/start` atau Telegram ID tidak tersimpan di TelegramLink table

**Solution**:
1. User send `/start` di Telegram bot
2. Check database:
   ```sql
   SELECT * FROM "TelegramLink" 
   WHERE "userId" = 'user_123';
   ```
3. Pastikan ada record dengan `telegramUserId`
4. Jika tidak ada, call `/api/telegram/link` untuk create link

### Problem: "Invalid API key" error

**Cause**: `PLATFORM_API_KEY` tidak match

**Solution**:
1. Check .env di VPS:
   ```bash
   grep PLATFORM_API_KEY /root/reagent/.env
   ```
2. Check skill environment:
   ```bash
   echo $PLATFORM_API_KEY
   ```
3. Pastikan sama

### Problem: Mining failed

**Check logs**:
```bash
pm2 logs reagent --lines 50 | grep SimpleMint
```

**Common causes**:
- User tidak punya PATHUSD (need 0.5 per mint)
- Master wallet tidak punya ISSUER_ROLE
- Master wallet tidak punya PATHUSD untuk gas

## Testing

### Test Slash Commands

```bash
# In Telegram bot
/start
/help
/mine 1
/balance
/wallet
/mine 5
```

### Test API Directly

```bash
# Get user by Telegram ID
curl -X GET "https://reagent.eu.cc/api/telegram/user?telegram_id=123456789" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Mine tokens
curl -X POST "https://reagent.eu.cc/api/mining/simple-mint" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-User-ID: user_123" \
  -H "Content-Type: application/json" \
  -d '{"type":"auto"}'

# Get balance
curl -X GET "https://reagent.eu.cc/api/wallet/balance" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-User-ID: user_123"
```

## Benefits

✅ User bisa mining dari Telegram (no need dashboard)
✅ Slash commands mudah digunakan
✅ Auto-sync dengan platform account
✅ Server-side minting (secure)
✅ Same API dengan dashboard (consistent)
✅ Rate limiting (prevent abuse)

## Future Improvements

1. **More Commands**:
   - `/history` - View mining history
   - `/stats` - View mining stats
   - `/withdraw` - Withdraw tokens

2. **Notifications**:
   - Mining success notification
   - Balance update notification
   - Low PATHUSD warning

3. **Group Features**:
   - Group mining leaderboard
   - Group mining challenges
   - Referral system

---

**Status**: ✅ READY
**Date**: 2026-04-18
**Version**: 1.0.0
