# /mine Command API Implementation - Complete

## Overview
Implementasi lengkap command `/mine` yang dapat digunakan oleh:
1. Web chat (dashboard)
2. Telegram bot AI agent
3. External integrations

## Masalah yang Diperbaiki
1. Command `/mine` tidak berfungsi di webchat
2. AI agent di Telegram tidak bisa execute mining via API
3. Tidak ada dokumentasi untuk slash commands di TOOLS.md

## Solusi

### 1. API Endpoint: /api/hermes/commands

**File**: `blinkai/src/app/api/hermes/commands/route.ts`

Menambahkan handler untuk command `/mine` yang:
- Parse amount dari command (default 1, max 10)
- Validate input (1-10 tokens)
- Execute mining via `/api/mining/simple-mint` dengan server-side signing
- Return formatted output dengan progress setiap mint
- Handle errors dengan pesan yang jelas

**Features**:
- Server-side signing (tidak perlu private key di client)
- Progress tracking untuk setiap mint
- Transaction hash untuk setiap mint
- Automatic delay 2 detik antar mint
- Comprehensive error handling

### 2. Frontend Integration

**File**: `blinkai/src/components/dashboard/HermesChat.tsx`

Command `/mine` tetap ditangani di frontend untuk webchat, tapi sekarang juga bisa dipanggil via API untuk bot.

### 3. Documentation Update

**File**: `blinkai/hermes-profiles/TOOLS.md`

Menambahkan section "Slash Commands" dengan dokumentasi lengkap:
- Daftar semua available commands
- Usage examples
- API call examples
- Response format

## API Usage

### For Web Chat (Automatic)
```typescript
// Frontend automatically handles /mine command
// User just types: /mine 5
```

### For Telegram Bot / External
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-User-ID: user@example.com" \
  -d '{
    "command": "/mine 5"
  }'
```

**Response**:
```json
{
  "success": true,
  "output": "⛏️ Starting auto mining for 5 REAGENT tokens...\n\n✅ Mint 1/5: Transaction submitted\n   TX Hash: 0x1234567890...abcdef12\n   Tokens: 10000 REAGENT\n\n✅ Mint 2/5: Transaction submitted\n   TX Hash: 0xabcdef1234...56789012\n   Tokens: 10000 REAGENT\n\n...\n\n🎉 Mining complete! Minted 50000 REAGENT tokens.\n\nTransactions are being confirmed on the blockchain. Check your balance in a few minutes.",
  "error": ""
}
```

## Available Commands

### /mine [amount]
- **Description**: Auto mine REAGENT tokens
- **Amount**: 1-10 (default: 1)
- **Fee**: 0.05 PATHUSD per mint (auto-mining)
- **Reward**: 10,000 REAGENT per mint
- **Examples**:
  - `/mine` - Mine 1 token
  - `/mine 5` - Mine 5 tokens
  - `/mine 10` - Mine 10 tokens (max)

### /help
- **Description**: Show all available commands
- **Usage**: `/help`

### Other Commands
- `/clear` - Clear chat history
- `/export` - Export chat history
- `/skills` - List agent skills
- `/memory` - Show agent memory
- `/sessions` - List chat sessions
- `/agent` - Agent information

## Authentication

### Web Chat
```http
Cookie: privy-token=<session_token>
```
Automatic - handled by browser

### Telegram Bot / External
```http
Authorization: Bearer <PLATFORM_API_KEY>
X-User-ID: <user_id>
```

Get API key from:
1. Login to dashboard
2. Go to Settings
3. Generate API key
4. Copy and use in Authorization header

## Error Handling

### Invalid Amount
```json
{
  "success": false,
  "output": "",
  "error": "Invalid amount. Please specify a number between 1 and 10.\nUsage: /mine [amount]\nExample: /mine 5"
}
```

### Mining Failed
```json
{
  "success": false,
  "output": "",
  "error": "Mining failed: Insufficient PATHUSD balance\n\nUsage: /mine [amount]\nExample: /mine 5 (mints 5 times, earning 50,000 REAGENT)"
}
```

### Unknown Command
```json
{
  "success": false,
  "output": "",
  "error": "Unknown command: /xyz. Type 'help' for available commands."
}
```

## Testing

### Test di Web Chat
1. Login ke dashboard
2. Buka chat
3. Ketik `/help` - harus muncul daftar commands
4. Ketik `/mine 1` - harus mulai mining
5. Ketik `/mine 5` - harus mine 5 kali

### Test di Telegram Bot
1. Setup Telegram bot dengan Hermes
2. Configure API key dan user ID
3. User kirim pesan "Mulai mining 5 token"
4. AI agent harus execute `/mine 5` via API
5. User dapat response dengan progress

### Test via cURL
```bash
# Get your API key from dashboard settings
API_KEY="your_api_key_here"
USER_ID="your_email@example.com"

# Test /help command
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -d '{"command": "/help"}'

# Test /mine command
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -d '{"command": "/mine 3"}'
```

## File Changes

1. **blinkai/src/app/api/hermes/commands/route.ts**
   - Added `/mine` command handler
   - Added `/help` command handler
   - Integrated with `/api/mining/simple-mint`
   - Added progress tracking and error handling

2. **blinkai/hermes-profiles/TOOLS.md**
   - Added "Slash Commands" section
   - Documented all available commands
   - Added API usage examples
   - Added response format examples

3. **blinkai/MINE_COMMAND_API_COMPLETE.md**
   - Complete documentation (this file)

## Deploy

```bash
cd /root/reagent
git pull
npm run build
pm2 restart reagent
```

Hard refresh browser: Ctrl+Shift+R

## Benefits

1. **Unified Interface**: Same command works in web chat and Telegram bot
2. **Server-Side Signing**: No need to expose private keys
3. **Progress Tracking**: User sees real-time progress
4. **Error Handling**: Clear error messages
5. **Scalable**: Easy to add more commands
6. **Documented**: Complete API documentation for developers

## Next Steps

1. Add more slash commands (/balance, /wallet, /send, etc)
2. Add command aliases (/m for /mine, /h for /help)
3. Add command history and autocomplete
4. Add rate limiting per user
5. Add analytics for command usage
