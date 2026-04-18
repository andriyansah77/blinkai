# ReAgent Platform Guide

## Platform Overview

ReAgent is an AI agent deployment platform on Tempo Network that enables users to:
- Deploy AI agents with blockchain capabilities
- Mine REAGENT tokens through AI automation
- Manage wallets and tokens on Tempo Network
- Integrate with Telegram and other platforms

**Platform URL**: https://reagent.eu.cc  
**Network**: Tempo Testnet  
**Chain ID**: 4217

---

## How to Execute Commands

AI agents should execute commands by calling the ReAgent API directly, NOT through Hermes CLI commands.

### ❌ WRONG - Don't Use Hermes CLI
```
/balance  ← This won't work
/mine     ← This won't work
```

### ✅ CORRECT - Use ReAgent API
```bash
# Check balance
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -d '{"command": "/balance"}'

# Mine tokens
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -d '{"command": "/mine 5"}'
```

---

## Available Commands

### 1. Check Balance
**User Request**: "Check my balance", "What's my balance?", "Show wallet"

**API Call**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/balance"}'
```

**Response**:
```json
{
  "success": true,
  "output": "💰 Wallet Balance\n==================\n\nAddress: 0xA54193Fc126182f3b0167077c5FEf0A8bFEB7937\nREAGENT: 50000.000000 tokens\nPATHUSD: 10.500000 tokens\n\nLast Updated: 2024-01-15 10:30:00"
}
```

### 2. Mine Tokens
**User Request**: "Mine 5 tokens", "Start mining", "Mint REAGENT"

**API Call**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/mine 5"}'
```

**Response**:
```json
{
  "success": true,
  "output": "⛏️ Starting auto mining for 5 REAGENT tokens...\n\n✅ Mint 1/5: Transaction submitted\n   TX Hash: 0x1234567890...abcdef12\n   Tokens: 10000 REAGENT\n\n...\n\n🎉 Mining complete! Minted 50000 REAGENT tokens."
}
```

### 3. Show Wallet Info
**User Request**: "Show my wallet", "Wallet info", "What's my address?"

**API Call**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/wallet"}'
```

### 4. Help
**User Request**: "Help", "What can you do?", "Show commands"

**API Call**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/help"}'
```

---

## Authentication

### Environment Variables Required

AI agents need these environment variables configured:

```bash
REAGENT_API_KEY=sk_live_abc123...     # Platform API key
REAGENT_USER_ID=user@example.com      # User's email or Privy ID
```

### How to Get API Key

1. User logs in to https://reagent.eu.cc
2. Goes to Settings page
3. Generates API key
4. Copies and provides to AI agent

### How to Get User ID

User ID is the user's email address or Privy user ID (format: `did:privy:...`).

---

## Important Rules for AI Agents

### 1. Always Use API Calls
- ❌ Don't use `/balance` as Hermes CLI command
- ✅ Use API call to `/api/hermes/commands` with `{"command": "/balance"}`

### 2. Check Environment Variables
Before making API calls, verify:
```bash
if [ -z "$REAGENT_API_KEY" ]; then
  echo "Error: REAGENT_API_KEY not set"
  exit 1
fi

if [ -z "$REAGENT_USER_ID" ]; then
  echo "Error: REAGENT_USER_ID not set"
  exit 1
fi
```

### 3. Handle Errors Gracefully
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

Tell user: "API key tidak valid. Silakan generate API key baru di dashboard Settings."

### 4. Parse Response Correctly
```json
{
  "success": true,
  "output": "💰 Wallet Balance\n..."
}
```

Display the `output` field to user, formatted nicely.

---

## Common User Requests & Responses

### "Check my balance"
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/balance"}'
```

### "Mine 3 tokens"
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/mine 3"}'
```

### "Show my wallet"
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/wallet"}'
```

### "What can you do?"
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "/help"}'
```

---

## Troubleshooting

### Error: "Invalid API key"
**Solution**: User needs to generate new API key from dashboard Settings.

### Error: "Wallet not found"
**Solution**: User needs to create wallet first via dashboard.

### Error: "Insufficient PATHUSD balance"
**Solution**: User needs to deposit PATHUSD to wallet first.

### Error: "Unknown command"
**Solution**: AI agent is using wrong command format. Use API calls, not CLI commands.

---

## Mining Fees

- Auto-mining: 0.05 PATHUSD per mint
- Manual mining: 0.1 PATHUSD per mint
- Reward: 10,000 REAGENT per mint
- Maximum: 10 mints per command

---

## Links

- Dashboard: https://reagent.eu.cc
- Explorer: https://explore.tempo.xyz
- Documentation: Check dashboard help section

---

## Summary for AI Agents

1. ✅ Use API calls to `/api/hermes/commands`
2. ✅ Include `Authorization` and `X-User-ID` headers
3. ✅ Send command in JSON body: `{"command": "/balance"}`
4. ❌ Don't use Hermes CLI commands directly
5. ❌ Don't call `/balance` or `/mine` as CLI commands

**Example Template**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REAGENT_API_KEY" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"command": "YOUR_COMMAND_HERE"}'
```
