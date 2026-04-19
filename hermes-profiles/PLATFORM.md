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

## IMPORTANT: How AI Agents Should Work

AI agents on ReAgent have a **Python skill** (`reagent_commands.py`) that handles all ReAgent operations automatically. 

### ✅ CORRECT - Use Python Skill

When user asks about balance, mining, or wallet:

```python
# The skill is automatically available
# Just respond naturally and the skill will be triggered

User: "Check my balance"
AI: *reagent_commands.py skill is triggered automatically*
AI: *displays balance from API response*

User: "Mine 5 tokens"
AI: *reagent_commands.py skill is triggered automatically*
AI: *displays mining progress from API response*
```

### Skill Triggers

The `reagent_commands.py` skill is automatically triggered when user message contains:
- **Balance**: "balance", "saldo", "check balance", "cek saldo"
- **Mining**: "mine", "mining", "mint", "minting"
- **Wallet**: "wallet", "address", "alamat"
- **Help**: "help", "bantuan", "command", "perintah"

### How It Works

1. User sends message to Telegram bot
2. Hermes detects trigger words
3. `reagent_commands.py` skill is executed
4. Skill calls ReAgent API with credentials from environment
5. Skill returns formatted response
6. AI agent displays response to user

---

## Available Commands

The Python skill handles these commands automatically:

### 1. Check Balance
**User says**: "Check my balance", "What's my balance?", "Cek saldo"

**Skill executes**: `check_balance()`

**API Call**: `POST /api/hermes/commands` with `{"command": "/balance"}`

**Response**:
```
💰 Wallet Balance
==================

Address: 0xA54193Fc126182f3b0167077c5FEf0A8bFEB7937
REAGENT: 50000.000000 tokens
PATHUSD: 10.500000 tokens

Last Updated: 2024-01-15 10:30:00
```

### 2. Mine Tokens
**User says**: "Mine 5 tokens", "Start mining", "Mint REAGENT"

**Skill executes**: `mine_tokens(amount)`

**API Call**: `POST /api/hermes/commands` with `{"command": "/mine 5"}`

**Response**:
```
⛏️ Starting auto mining for 5 REAGENT tokens...

✅ Mint 1/5: Transaction submitted
   TX Hash: 0x1234567890...abcdef12
   Tokens: 10000 REAGENT

...

🎉 Mining complete! Minted 50000 REAGENT tokens.
```

### 3. Show Wallet
**User says**: "Show my wallet", "Wallet info", "What's my address?"

**Skill executes**: `show_wallet()`

**API Call**: `POST /api/hermes/commands` with `{"command": "/wallet"}`

### 4. Help
**User says**: "Help", "What can you do?", "Show commands"

**Skill executes**: `show_help()`

**API Call**: `POST /api/hermes/commands` with `{"command": "/help"}`

---

## Environment Variables

The Python skill reads credentials from environment variables that are **automatically configured** when user adds Telegram channel:

```bash
REAGENT_API_KEY=sk_platform_abc123...     # Platform API key
REAGENT_USER_ID=did:privy:xyz789...       # User's Privy ID
REAGENT_API_BASE=https://reagent.eu.cc    # Platform URL
```

These are injected into `/root/.hermes/profiles/user-{userId}/.env` automatically.

---

## For AI Agents: Natural Language Processing

You don't need to call APIs directly. Just understand what user wants and let the skill handle it:

**User**: "Can you check how much REAGENT I have?"
**AI**: *Skill detects "check" + "REAGENT" → triggers check_balance()*
**AI**: "Let me check your balance..." *displays result*

**User**: "I want to mine 3 tokens"
**AI**: *Skill detects "mine" + "3" → triggers mine_tokens(3)*
**AI**: "Starting mining for 3 tokens..." *displays result*

**User**: "What's my wallet address?"
**AI**: *Skill detects "wallet" + "address" → triggers show_wallet()*
**AI**: "Here's your wallet information..." *displays result*

---

## Troubleshooting

### If Skill Doesn't Trigger

Check if skill is installed:
```bash
hermes --profile user-{userId} skills list
```

Should show:
```
✓ reagent_commands - ReAgent platform commands
```

### If API Calls Fail

Check environment variables:
```bash
cat /root/.hermes/profiles/user-{userId}/.env | grep REAGENT
```

Should show:
```
REAGENT_API_KEY=sk_platform_...
REAGENT_USER_ID=did:privy:...
REAGENT_API_BASE=https://reagent.eu.cc
```

---

## Summary for AI Agents

1. ✅ Python skill (`reagent_commands.py`) handles all ReAgent operations
2. ✅ Skill is automatically triggered by keywords
3. ✅ Credentials are auto-configured from environment
4. ✅ Just respond naturally - skill does the work
5. ❌ Don't try to call APIs manually
6. ❌ Don't use Hermes CLI commands

**Your job**: Understand user intent and let the skill execute the operation.
