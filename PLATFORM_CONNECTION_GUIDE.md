# 🔌 Platform Connection Guide

## Status: Ready to Configure

Platform connection (Telegram, Discord, WhatsApp) sudah terintegrasi dengan Hermes CLI!

## Supported Platforms

### ✅ Telegram
- **Status**: Fully Supported
- **Setup**: Bot Token dari @BotFather
- **Features**: Private chats, Groups, Channels, Inline queries

### ✅ Discord  
- **Status**: Fully Supported
- **Setup**: Bot Token dari Discord Developer Portal
- **Features**: Text channels, Voice channels, Slash commands, Webhooks

### ✅ WhatsApp
- **Status**: Fully Supported
- **Setup**: QR Code pairing via Hermes
- **Features**: QR code setup, Business messaging, Media sharing, Groups

## How It Works

```
User connects platform via Dashboard
    ↓
1. Bot token disimpan di Hermes config (per-user isolated)
2. Hermes gateway setup dijalankan
3. Gateway started untuk user tersebut
4. Platform connected dan siap menerima pesan
```

## Setup Instructions

### 1. Telegram Bot

#### Step 1: Create Bot
```bash
1. Open Telegram dan cari @BotFather
2. Send /newbot
3. Follow instructions (nama bot, username)
4. Copy bot token yang diberikan
   Format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

#### Step 2: Connect di Dashboard
```
1. Go to Dashboard → Channels
2. Click "Add Channel"
3. Select "Telegram"
4. Paste bot token
5. Click "Connect to Telegram"
```

#### Step 3: Test Bot
```
1. Search bot username di Telegram
2. Send /start
3. Bot akan merespon via Hermes agent
```

### 2. Discord Bot

#### Step 1: Create Bot
```bash
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" section
4. Click "Add Bot"
5. Copy bot token
6. Enable "Message Content Intent"
```

#### Step 2: Invite Bot to Server
```
1. Go to OAuth2 → URL Generator
2. Select scopes: bot, applications.commands
3. Select permissions: Send Messages, Read Messages, etc.
4. Copy generated URL
5. Open URL in browser dan invite bot ke server
```

#### Step 3: Connect di Dashboard
```
1. Go to Dashboard → Channels
2. Click "Add Channel"
3. Select "Discord"
4. Paste bot token
5. (Optional) Add Server ID
6. Click "Connect to Discord"
```

### 3. WhatsApp

#### Step 1: Connect via Dashboard
```
1. Go to Dashboard → Channels
2. Click "Add Channel"
3. Select "WhatsApp"
4. Click "Connect to WhatsApp"
```

#### Step 2: Scan QR Code
```
1. Hermes akan generate QR code
2. Open WhatsApp di phone
3. Go to Settings → Linked Devices
4. Tap "Link a Device"
5. Scan QR code yang ditampilkan
```

#### Step 3: Test Connection
```
1. Send message ke nomor WhatsApp yang di-pair
2. Bot akan merespon via Hermes agent
```

## Troubleshooting

### Gateway Not Starting

**Problem**: Gateway fails to start after platform setup

**Solution**:
```bash
# SSH ke VPS
ssh root@159.65.141.68

# Check gateway status
/root/.local/bin/hermes --profile user-{userId} gateway status

# Start gateway manually
/root/.local/bin/hermes --profile user-{userId} gateway start

# Check logs
pm2 logs blinkai | grep -i gateway
```

### Bot Token Invalid

**Problem**: "Invalid bot token" error

**Solution**:
1. Verify token format (no spaces, complete token)
2. For Telegram: Token format is `123456789:ABCdefGHI...`
3. For Discord: Token format is `MTIzNDU2Nzg5...`
4. Regenerate token if needed

### Bot Not Responding

**Problem**: Bot connected but tidak merespon pesan

**Solution**:
```bash
# Check if gateway is running
/root/.local/bin/hermes --profile user-{userId} gateway status

# Check Hermes config
/root/.local/bin/hermes --profile user-{userId} config show

# Restart gateway
/root/.local/bin/hermes --profile user-{userId} gateway stop
/root/.local/bin/hermes --profile user-{userId} gateway start
```

### WhatsApp QR Code Not Showing

**Problem**: QR code tidak muncul saat setup WhatsApp

**Solution**:
```bash
# Run WhatsApp pairing manually
/root/.local/bin/hermes --profile user-{userId} whatsapp

# QR code akan ditampilkan di terminal
# Scan dengan WhatsApp di phone
```

## User Isolation

Setiap user mendapat:
- ✅ Isolated Hermes profile (`user-{userId}`)
- ✅ Separate gateway instance
- ✅ Independent bot configurations
- ✅ Isolated message handling

**Benefit**: Bot user A tidak akan interfere dengan bot user B!

## Gateway Management

### Start Gateway
```bash
/root/.local/bin/hermes --profile user-{userId} gateway start
```

### Stop Gateway
```bash
/root/.local/bin/hermes --profile user-{userId} gateway stop
```

### Check Status
```bash
/root/.local/bin/hermes --profile user-{userId} gateway status
```

### Install as Service (Optional)
```bash
# User service (recommended)
/root/.local/bin/hermes --profile user-{userId} gateway install

# System service (requires sudo)
sudo /root/.local/bin/hermes --profile user-{userId} gateway install --system
```

## API Endpoints

### Get Gateway Status
```bash
GET /api/hermes/gateway
```

### Start Gateway
```bash
POST /api/hermes/gateway
{
  "action": "start"
}
```

### Stop Gateway
```bash
POST /api/hermes/gateway
{
  "action": "stop"
}
```

### Setup Platform
```bash
POST /api/hermes/gateway
{
  "action": "setup-platform",
  "platform": "telegram",
  "config": {
    "botToken": "123456789:ABCdefGHI..."
  }
}
```

## Configuration Files

### Hermes Profile Config
```yaml
# Location: /root/.hermes/profiles/user-{userId}/config.yaml

telegram:
  bot_token: "123456789:ABCdefGHI..."
  
discord:
  bot_token: "MTIzNDU2Nzg5..."
  
model:
  provider: openai
  api_key: "your-api-key"
  base_url: "https://api.akashml.com/v1"
  model: "MiniMaxAI/MiniMax-M2.5"
```

## Next Steps

1. ✅ Setup bot di platform pilihan (Telegram/Discord/WhatsApp)
2. ✅ Connect via Dashboard → Channels
3. ✅ Test bot dengan send message
4. ✅ Monitor via Dashboard → Channels (message count, status)
5. ✅ Scale: Add more platforms atau multiple bots per platform

## Support

Jika ada masalah:
1. Check logs: `pm2 logs blinkai`
2. Check gateway status: `hermes gateway status`
3. Check Hermes config: `hermes config show`
4. Restart gateway jika perlu

---

**Last Updated**: 2026-04-09
**Status**: ✅ READY TO USE
**VPS**: http://159.65.141.68:3000
