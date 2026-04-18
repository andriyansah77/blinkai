# ReAgent AI Agent Tools

## Overview

AI agents on ReAgent platform can execute commands and interact with the blockchain via simple slash commands. All operations use server-side signing for security.

---

## Available Commands

### /mine [amount]
**Description**: Auto mine REAGENT tokens with server-side signing  
**Usage**: `/mine [amount]` where amount is 1-10  
**Fee**: 0.05 PATHUSD per mint (auto-mining)  
**Reward**: 10,000 REAGENT per mint

**Examples**:
```
/mine          → Mine 1 token (default)
/mine 5        → Mine 5 tokens (50,000 REAGENT)
/mine 10       → Mine 10 tokens (100,000 REAGENT, maximum)
```

**API Call**:
```http
POST /api/hermes/commands HTTP/1.1
Host: reagent.eu.cc
Content-Type: application/json
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>

{
  "command": "/mine 5"
}
```

**Response**:
```json
{
  "success": true,
  "output": "⛏️ Starting auto mining for 5 REAGENT tokens...\n\n✅ Mint 1/5: Transaction submitted\n   TX Hash: 0x1234567890...abcdef12\n   Tokens: 10000 REAGENT\n\n...\n\n🎉 Mining complete! Minted 50000 REAGENT tokens.",
  "error": ""
}
```

---

### /balance
**Description**: Check wallet balance (REAGENT and PATHUSD)  
**Usage**: `/balance`

**API Call**:
```http
POST /api/hermes/commands HTTP/1.1
Host: reagent.eu.cc
Content-Type: application/json
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>

{
  "command": "/balance"
}
```

**Response**:
```json
{
  "success": true,
  "output": "💰 Wallet Balance\n==================\n\nAddress: 0x1234567890abcdef...\nREAGENT: 50000.000000 tokens\nPATHUSD: 10.500000 tokens\n\nLast Updated: 2024-01-15 10:30:00",
  "error": ""
}
```

---

### /wallet
**Description**: Show complete wallet information  
**Usage**: `/wallet`

**API Call**:
```http
POST /api/hermes/commands HTTP/1.1
Host: reagent.eu.cc
Content-Type: application/json
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>

{
  "command": "/wallet"
}
```

**Response**:
```json
{
  "success": true,
  "output": "🔐 Wallet Information\n==================\n\nAddress: 0x1234567890abcdef...\nNetwork: Tempo Testnet\n\nBalances:\n- REAGENT: 50000.000000 tokens\n- PATHUSD: 10.500000 tokens\n\nCreated: 2024-01-01 08:00:00\nLast Updated: 2024-01-15 10:30:00",
  "error": ""
}
```

---

### /help
**Description**: Show all available commands  
**Usage**: `/help`

**API Call**:
```http
POST /api/hermes/commands HTTP/1.1
Host: reagent.eu.cc
Content-Type: application/json
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>

{
  "command": "/help"
}
```

**Response**:
```json
{
  "success": true,
  "output": "Available Commands:\n==================\n\n/help - Show this help message\n/mine [amount] - Auto mine REAGENT tokens (1-10)\n/balance - Check wallet balance\n/wallet - Show wallet information\n\nExamples:\n---------\n/mine 5 - Mine 5 REAGENT tokens\n/balance - Check your balance\n/wallet - Show wallet address and info",
  "error": ""
}
```

---

## Authentication

### Web Chat (Dashboard)
```http
Cookie: privy-token=<session_token>
```
Automatic - handled by browser session

### Telegram Bot / External API
```http
Authorization: Bearer <PLATFORM_API_KEY>
X-User-ID: <user_id>
```

**Get API Key**:
1. Login to dashboard at https://reagent.eu.cc
2. Go to Settings
3. Generate API key
4. Copy and use in Authorization header

**User ID**: User's email address or Privy user ID

---

## Direct API Endpoints

For advanced use cases, you can also call these endpoints directly:

### Mining API
**Endpoint**: `POST /api/mining/simple-mint`  
**Body**: `{ "type": "auto" }`  
**Description**: Execute single mint operation

### Wallet Balance API
**Endpoint**: `GET /api/wallet/balance`  
**Description**: Get wallet balances (REAGENT, PATHUSD)

### Wallet Info API
**Endpoint**: `GET /api/wallet/info`  
**Description**: Get complete wallet information

---

## Error Handling

### Invalid Amount
```json
{
  "success": false,
  "output": "",
  "error": "Invalid amount. Please specify a number between 1 and 10.\nUsage: /mine [amount]\nExample: /mine 5"
}
```

### Insufficient Balance
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
  "error": "Unknown command: /xyz. Type '/help' for available commands."
}
```

### Authentication Failed
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## Usage Examples

### Example 1: Mining via Telegram Bot
User sends: "Mine 5 REAGENT tokens"

AI Agent executes:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "X-User-ID: user@example.com" \
  -d '{"command": "/mine 5"}'
```

### Example 2: Check Balance
User sends: "What's my balance?"

AI Agent executes:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "X-User-ID: user@example.com" \
  -d '{"command": "/balance"}'
```

### Example 3: Show Wallet Info
User sends: "Show my wallet"

AI Agent executes:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "X-User-ID: user@example.com" \
  -d '{"command": "/wallet"}'
```

---

## Important Notes

1. **Server-Side Signing**: All transactions are signed server-side. Users don't need to expose private keys.

2. **Rate Limiting**: Mining has automatic 2-second delay between mints to prevent rate limiting.

3. **Balance Requirements**: 
   - Auto-mining requires 0.05 PATHUSD per mint
   - Manual mining requires 0.1 PATHUSD per mint

4. **Transaction Confirmation**: Blockchain transactions take a few minutes to confirm. Check balance after 2-3 minutes.

5. **Maximum Mining**: Maximum 10 tokens per command to prevent timeout.

6. **Network**: All operations are on Tempo Testnet.

---

## Support

For issues or questions:
- Web: https://reagent.eu.cc
- Documentation: Check dashboard help section
- API Status: All endpoints return detailed error messages
