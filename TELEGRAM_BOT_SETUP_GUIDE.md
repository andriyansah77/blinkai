# Telegram Bot Setup Guide - ReAgent AI Agent

## Masalah yang Terjadi

AI agent di Telegram mencoba menggunakan Hermes CLI commands (`/balance`, `/mine`) yang tidak tersedia. AI agent harus memanggil ReAgent API secara langsung.

## Solusi

AI agent perlu dikonfigurasi dengan environment variables yang benar dan menggunakan API calls, bukan CLI commands.

## Setup Environment Variables

AI agent di Telegram memerlukan 2 environment variables:

```bash
REAGENT_API_KEY=sk_live_abc123...     # Platform API key
REAGENT_USER_ID=user@example.com      # User's email or Privy ID
```

### Cara Mendapatkan API Key

1. Login ke https://reagent.eu.cc
2. Buka Settings page
3. Generate API key
4. Copy API key yang dihasilkan

### Cara Mendapatkan User ID

User ID adalah email address yang digunakan untuk login, atau Privy user ID (format: `did:privy:...`).

## Konfigurasi Hermes Profile

Update file `~/.hermes/profiles/user-{email}/config.yaml`:

```yaml
name: "ReAgent AI Agent"
model: "gpt-4"
provider: "openai"

environment:
  REAGENT_API_KEY: "sk_live_abc123..."
  REAGENT_USER_ID: "user@example.com"

skills:
  - name: "reagent_minting"
    enabled: true
    
platforms:
  telegram:
    enabled: true
    bot_token: "YOUR_TELEGRAM_BOT_TOKEN"
```

## Cara AI Agent Memanggil API

### ❌ SALAH - Jangan Gunakan CLI Commands

```bash
# Ini TIDAK akan bekerja
/balance
/mine
/wallet
```

### ✅ BENAR - Gunakan API Calls

```bash
# Check balance
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/balance"}'

# Mine tokens
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/mine 5"}'

# Show wallet
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/wallet"}'
```

## Testing

### Test API Key

```bash
export REAGENT_API_KEY="your_api_key_here"
export REAGENT_USER_ID="your@email.com"

# Test balance command
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/balance"}'
```

Expected response:
```json
{
  "success": true,
  "output": "💰 Wallet Balance\n==================\n\nAddress: 0xA54193Fc126182f3b0167077c5FEf0A8bFEB7937\nREAGENT: 50000.000000 tokens\nPATHUSD: 10.500000 tokens\n\nLast Updated: 2024-01-15 10:30:00"
}
```

### Test Mining

```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/mine 1"}'
```

Expected response:
```json
{
  "success": true,
  "output": "⛏️ Starting auto mining for 1 REAGENT token...\n\n✅ Mint 1/1: Transaction submitted\n   TX Hash: 0x1234567890...abcdef12\n   Tokens: 10000 REAGENT\n\n🎉 Mining complete! Minted 10000 REAGENT tokens."
}
```

## Troubleshooting

### Error: "Invalid API key"

**Penyebab**: API key salah atau expired.

**Solusi**:
1. Generate API key baru di dashboard Settings
2. Update environment variable `REAGENT_API_KEY`
3. Restart Hermes agent

### Error: "Unknown command /balance"

**Penyebab**: AI agent mencoba menggunakan Hermes CLI command, bukan ReAgent API.

**Solusi**:
1. Pastikan AI agent membaca PLATFORM.md dan TOOLS.md
2. Pastikan AI agent menggunakan curl/HTTP calls, bukan CLI commands
3. Check Hermes profile configuration

### Error: "Wallet not found"

**Penyebab**: User belum membuat wallet di ReAgent.

**Solusi**:
1. User login ke https://reagent.eu.cc
2. Wallet akan auto-created saat pertama kali login
3. Coba lagi setelah wallet dibuat

### Error: "Insufficient PATHUSD balance"

**Penyebab**: User tidak punya cukup PATHUSD untuk mining.

**Solusi**:
1. User perlu deposit PATHUSD ke wallet
2. Minimum 0.05 PATHUSD untuk auto-mining
3. Check balance dengan `/balance` command

## User Instructions

Untuk user yang ingin setup Telegram bot:

1. **Generate API Key**:
   - Login ke https://reagent.eu.cc
   - Buka Settings
   - Click "Generate API Key"
   - Copy API key

2. **Configure Hermes**:
   - Set environment variables:
     ```bash
     export REAGENT_API_KEY="your_api_key"
     export REAGENT_USER_ID="your@email.com"
     ```
   - Atau tambahkan ke Hermes config file

3. **Test Connection**:
   - Send message ke Telegram bot: "Check my balance"
   - AI agent harus memanggil API dan menampilkan balance

4. **Start Mining**:
   - Send message: "Mine 5 tokens"
   - AI agent akan execute mining via API
   - Tidak perlu manual approval

## Important Notes

1. **API Key Security**: Jangan share API key dengan orang lain. API key memberikan akses penuh ke wallet user.

2. **User ID**: Harus match dengan user yang login. Tidak bisa menggunakan user ID orang lain.

3. **Auto-Signing**: Semua minting via API menggunakan server-side signing. Tidak perlu manual approval.

4. **Rate Limiting**: API memiliki rate limiting. Jangan spam requests.

5. **Balance Check**: Selalu check balance sebelum mining untuk memastikan cukup PATHUSD.

## Summary

- ✅ Use API calls to `/api/hermes/commands`
- ✅ Set `REAGENT_API_KEY` and `REAGENT_USER_ID` environment variables
- ✅ Send commands in JSON body: `{"command": "/balance"}`
- ❌ Don't use Hermes CLI commands (`/balance`, `/mine`)
- ❌ Don't call localhost URLs (use https://reagent.eu.cc)

## Support

Jika masih ada masalah:
- Check logs: `~/.hermes/logs/`
- Check config: `~/.hermes/profiles/user-{email}/config.yaml`
- Contact support: support@reagent.ai
- Documentation: https://reagent.eu.cc/docs
