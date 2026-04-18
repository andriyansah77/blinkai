# ReAgent Tools & Skills

## Overview

This document defines all tools and skills available to AI agents on the ReAgent platform. These tools enable agents to interact with the platform via REST API endpoints, execute blockchain transactions, and assist users with various tasks.

## API-Based Architecture

All agent operations are performed through HTTP API calls to the ReAgent platform. The platform handles:
- Authentication (Privy session for web, API key + User ID for bots)
- Blockchain interactions (wallet, transactions, minting)
- Database operations (history, statistics)
- Security and validation

## Core Skills

### 1. Minting_Skill

**Category**: Blockchain  
**Type**: Proprietary (Auto-installed, Cannot be uninstalled)  
**Version**: 2.0.0  
**API Endpoint**: `/api/mining/simple-mint`

**Description**: Execute REAGENT token minting operations on Tempo Network via unified API endpoint.

**Authentication**:
- Web: Privy session cookie (automatic)
- Bot: `Authorization: Bearer {API_KEY}` + `X-User-ID: {userId}` headers

### 2. Wallet_Skill

**Category**: Blockchain  
**Type**: Proprietary (Auto-installed, Cannot be uninstalled)  
**Version**: 2.0.0  
**API Endpoints**: `/api/wallet/*`

**Description**: Manage user's blockchain wallet via API - check balance, send/receive tokens, view transaction history. All operations are real-time from Tempo Network blockchain.

**Capabilities**:
- Real-time balance checking (ETH, REAGENT, PATHUSD)
- Send ETH to any address
- Send REAGENT tokens to any address
- View wallet address and info
- Transaction history
- Automatic balance validation before sending

**Required Permissions**:
- `wallet:read` - Read wallet information and balances
- `wallet:write` - Execute transactions (send tokens)

**Authentication**:
- Web: Privy session cookie (automatic)
- Bot: `Authorization: Bearer {API_KEY}` + `X-User-ID: {userId}` headers

---

## API Endpoint Reference

### Base URL
- Production: `https://reagent.eu.cc`
- Development: `http://localhost:3000`

### Authentication Methods

**Web Chat (Dashboard)**:
```http
Cookie: privy-token=<session_token>
```

**Telegram Bot / External**:
```http
Authorization: Bearer <PLATFORM_API_KEY>
X-User-ID: <user_id>
```

---

## Mining API Endpoints

### check_mining_balance

**Endpoint**: `GET /api/wallet/balance`  
**Authentication**: Required (session or API key)

**Description**: Check user's wallet balances in real-time from blockchain

**Request**:
```http
GET /api/wallet/balance HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
```

**Response**:
```json
{
  "success": true,
  "address": "0x1234567890abcdef...",
  "reagentBalance": "50000.000000",
  "pathusdBalance": "10.500000",
  "ethBalance": "0.5"
}
```

**AI Agent Usage**:
```
User: "What's my balance?"
Agent: *calls GET /api/wallet/balance*
Agent: "Here's your current balance:

💰 USD Balance: $10.50
🪙 REAGENT Balance: 50,000 tokens
⛽ ETH Balance: 0.5 ETH
📍 Wallet: 0x1234...5678"
```

---

### mint_reagent_tokens

**Endpoint**: `POST /api/mining/simple-mint`  
**Authentication**: Required (session or API key)

**Description**: Mint 10,000 REAGENT tokens (unified endpoint for web and bot)

**Request**:
```http
POST /api/mining/simple-mint HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
Content-Type: application/json

{
  "type": "auto"
}
```

**Request Body**:
- `type`: `"auto"` (for AI agent) or `"manual"` (for dashboard)

**Response** (Success):
```json
{
  "success": true,
  "txHash": "0x1234567890abcdef...",
  "tokensEarned": 10000,
  "feePaid": "0.500000",
  "gasUsed": "0.000150",
  "newUsdBalance": "10.000000",
  "newReagentBalance": "60000.000000",
  "explorerUrl": "https://explore.tempo.xyz/tx/0x1234..."
}
```

**Response** (Insufficient Balance):
```json
{
  "success": false,
  "error": "Insufficient balance",
  "required": "0.500000",
  "current": "0.300000",
  "shortfall": "0.200000"
}
```

**AI Agent Usage**:
```
User: "Can you mint tokens for me?"
Agent: "Let me check your balance first..."
Agent: *calls GET /api/wallet/balance*
Agent: "Great! You have $10.50 USD. Minting costs $0.50. Proceed?"
User: "Yes"
Agent: *calls POST /api/mining/simple-mint with {"type": "auto"}*
Agent: "✅ Success! You've earned 10,000 REAGENT tokens!

🪙 Tokens Earned: 10,000 REAGENT
💵 Fee Paid: $0.50 USD
🔗 TX: 0x1234...5678

💰 New Balance: $10.00 USD
🪙 Total REAGENT: 60,000 tokens

View: https://explore.tempo.xyz/tx/0x1234..."
```

**CRITICAL**: Always get user confirmation before calling this endpoint!

---

### get_minting_history

**Endpoint**: `GET /api/mining/inscriptions`  
**Authentication**: Required (session or API key)

**Description**: Retrieve user's minting history with pagination

**Request**:
```http
GET /api/mining/inscriptions?page=1&limit=10&status=confirmed HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `status`: Filter by status (optional: `pending`, `confirmed`, `failed`)

**Response**:
```json
{
  "success": true,
  "inscriptions": [
    {
      "id": "123",
      "txHash": "0x1234...",
      "tokensEarned": 10000,
      "feePaid": "0.500000",
      "status": "confirmed",
      "type": "auto",
      "createdAt": "2026-04-18T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

**AI Agent Usage**:
```
User: "Show me my minting history"
Agent: *calls GET /api/mining/inscriptions?page=1&limit=10*
Agent: "Your recent minting operations:

1. ✅ Confirmed - Apr 18, 10:30 AM
   🪙 10,000 REAGENT | 💵 $0.50 | Auto
   
2. ✅ Confirmed - Apr 17, 3:45 PM
   🪙 10,000 REAGENT | 💵 $0.50 | Auto
   
Total: 5 mints | 50,000 REAGENT earned"
```

---

### get_mining_stats

**Endpoint**: `GET /api/mining/stats`  
**Authentication**: Required (session or API key)

**Description**: Get platform-wide mining statistics

**Request**:
```http
GET /api/mining/stats HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
```

**Response**:
```json
{
  "success": true,
  "totalMints": 1250,
  "totalTokensMinted": "12500000.000000",
  "activeMiners": 320,
  "last24h": 45,
  "autoMints": 800,
  "manualMints": 450,
  "remainingAllocation": "187500000.000000"
}
```

**AI Agent Usage**:
```
User: "How's the mining going overall?"
Agent: *calls GET /api/mining/stats*
Agent: "Global Mining Statistics:

📊 Total Mints: 1,250
🪙 Tokens Minted: 12.5M REAGENT (6.25% of allocation)
👥 Active Miners: 320 users
📈 Last 24h: 45 new mints

Mining Methods:
🤖 Auto: 800 (64%)
👆 Manual: 450 (36%)

Keep mining! 187.5M REAGENT still available."
```

---

## Wallet API Endpoints

### check_wallet_balance

**Endpoint**: `GET /api/wallet/balance`  
**Authentication**: Required (session or API key)

**Description**: Check wallet balance in real-time from blockchain

**Request**:
```http
GET /api/wallet/balance HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
```

**Response**:
```json
{
  "success": true,
  "address": "0xA3215753cc7D5039884159eB32CC5D79F0Fb29f",
  "ethBalance": "0.5",
  "reagentBalance": "50000.000000",
  "pathusdBalance": "10.500000"
}
```

**AI Agent Usage**:
```
User: "What's my wallet balance?"
Agent: *calls GET /api/wallet/balance*
Agent: "Here's your current wallet balance:

💰 ETH: 0.5 ETH
🪙 REAGENT: 50,000 tokens
💵 PATHUSD: $10.50

📍 Wallet Address: 0xA321...Fb29f

All balances are real-time from the Tempo Network blockchain."
```

---

### get_wallet_info

**Endpoint**: `GET /api/wallet/info`  
**Authentication**: Required (session or API key)

**Description**: Get wallet address and creation info

**Request**:
```http
GET /api/wallet/info HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
```

**Response**:
```json
{
  "success": true,
  "address": "0xA3215753cc7D5039884159eB32CC5D79F0Fb29f",
  "network": "tempo",
  "createdAt": "2026-04-11T10:30:00.000Z"
}
```

**AI Agent Usage**:
```
User: "What's my wallet address?"
Agent: *calls GET /api/wallet/info*
Agent: "Your wallet address is:

� 0xA3215753cc7D5039884159eB32CC5D79F0Fb29f

Created on: April 11, 2026
Network: Tempo Network

You can share this address to receive ETH, REAGENT, or other tokens."
```

---

### send_eth (Coming Soon)

**Endpoint**: `POST /api/wallet/send-eth`  
**Authentication**: Required (session or API key)

**Description**: Send ETH to another address

**Request**:
```http
POST /api/wallet/send-eth HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
Content-Type: application/json

{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.1"
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0x1234567890abcdef...",
  "from": "0xA3215753cc7D5039884159eB32CC5D79F0Fb29f",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.1",
  "explorerUrl": "https://explore.tempo.xyz/tx/0x1234..."
}
```

---

### send_reagent (Coming Soon)

**Endpoint**: `POST /api/wallet/send-reagent`  
**Authentication**: Required (session or API key)

**Description**: Send REAGENT tokens to another address

**Request**:
```http
POST /api/wallet/send-reagent HTTP/1.1
Host: reagent.eu.cc
Authorization: Bearer <API_KEY>
X-User-ID: <user_id>
Content-Type: application/json

{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "1000"
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "0x1234567890abcdef...",
  "from": "0xA3215753cc7D5039884159eB32CC5D79F0Fb29f",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "1000",
  "explorerUrl": "https://explore.tempo.xyz/tx/0x1234..."
}
```

---

## How AI Agents Access Tools

### API-Based Execution

AI agents interact with the ReAgent platform through HTTP API calls. The platform provides a unified API that works across all channels (web chat, Telegram, Discord, WhatsApp).

### Prerequisites

1. **Authentication**: API key (for bots) or session cookie (for web)
2. **User Context**: User ID must be provided or derived from session
3. **Network Access**: HTTPS connection to reagent.eu.cc
4. **Permissions**: Appropriate permissions for the operation

### Execution Pattern

**Step 1**: Always check balance before any operation
```http
GET /api/wallet/balance
```

**Step 2**: Get user confirmation for transactions
```
Agent: "I can mint 10,000 REAGENT for $0.50. Proceed?"
User: "Yes"
```

**Step 3**: Execute the operation
```http
POST /api/mining/simple-mint
Content-Type: application/json

{"type": "auto"}
```

**Step 4**: Display the result to user

### Example Conversation Flow

```
User: "Can you mint some tokens for me?"

Agent: "Let me check your balance first..."
Agent: *calls GET /api/wallet/balance*
Agent: "Great! You have $10.50 USD available.

Minting 10,000 REAGENT tokens will cost $0.50 USD (including gas).

Would you like me to proceed?"

User: "Yes, go ahead"

Agent: "Perfect! Minting now..."
Agent: *calls POST /api/mining/simple-mint with {"type": "auto"}*
Agent: "✅ Success! You've earned 10,000 REAGENT tokens!

🪙 Tokens Earned: 10,000 REAGENT
� Fee Paid: $0.50 USD
🔗 TX: 0x1234...5678

💰 New Balance: $10.00 USD
🪙 Total REAGENT: 10,000 tokens

View: https://explore.tempo.xyz/tx/0x1234..."
```

### Error Handling

**Insufficient Balance**:
```
Agent: *calls GET /api/wallet/balance*
Agent: "I'd love to help you mint tokens, but your balance is $0.30 USD.

You need at least $0.50 USD for auto-mining.

Would you like me to show you how to deposit funds?"
```

**Transaction Failure**:
```
Agent: *calls POST /api/mining/simple-mint*
Agent: "Oops! The minting transaction failed. This could be due to:
- Network congestion
- Temporary blockchain issue

Your funds have been refunded. Would you like to try again?"
```

**API Error**:
```
Agent: "I'm having trouble connecting to the platform right now. This is usually temporary.

Let me try again in a moment... If it persists, please check your connection or contact support."
```

### Important Rules

1. **Always Check Balance First**: Before any transaction discussion
2. **Always Get Confirmation**: Never transact without explicit user approval
3. **Display Full Details**: Show all transaction details before and after
4. **Handle Errors Gracefully**: Explain errors in user-friendly terms
5. **Provide Context**: Explain what's happening at each step
6. **Validate Inputs**: Check addresses, amounts before sending
7. **Show Costs**: Inform users about fees and gas costs

---

## Tool Usage Guidelines

### When to Use Wallet Tools

**Appropriate Scenarios**:
1. User explicitly requests to check balance
2. User wants to send tokens or ETH
3. User asks about their wallet address
4. User wants to see transaction history
5. User asks "how much do I have?"

**Inappropriate Scenarios**:
1. User hasn't mentioned wallet or balance
2. User is asking unrelated questions
3. Automatic/unsolicited transactions
4. Sending without user confirmation

### Best Practices

1. **Always Confirm Before Sending**:
   ```
   User: "Send 0.1 ETH to 0x742d..."
   Agent: "I can send 0.1 ETH to 0x742d...0bEb. This will cost approximately 0.1 ETH plus gas fees (~0.0001 ETH). Proceed?"
   User: "Yes"
   Agent: *executes send_eth*
   ```

2. **Provide Context**:
   - Explain costs before sending
   - Show current balance
   - Mention gas fees
   - Provide explorer links

3. **Handle Errors Gracefully**:
   - Explain what went wrong
   - Suggest solutions
   - Offer to check balance or retry

4. **Be Proactive**:
   - Suggest checking balance when relevant
   - Remind about transaction costs
   - Share interesting wallet stats

### Response Templates

**Successful Send**:
```
"Great news! I've successfully sent [amount] [token] to [address].

The transaction cost [amount] [token] plus [gas] ETH in gas fees and is now confirmed on the blockchain. You can view it on the Tempo Explorer.

Your new balance is [new_balance] [token].

Would you like to do anything else with your wallet?"
```

**Insufficient Balance**:
```
"I'd love to help you send [amount] [token], but your balance is a bit low.

Current Balance: [current] [token]
Required: [required] [token]
Shortfall: [shortfall] [token]

Would you like to:
- Send a smaller amount
- Check how to get more [token]
- View your transaction history"
```

**Balance Inquiry**:
```
"Here's your current wallet balance:

💰 ETH: [eth_balance] ETH
🪙 REAGENT: [reagent_balance] tokens
💵 PATHUSD: $[pathusd_balance]

📍 Wallet Address: [address]

All balances are real-time from the Tempo Network blockchain.

What would you like to do?"
```

---

Mining Methods:
🤖 Auto: 800 (64%)
👆 Manual: 450 (36%)

Keep mining! 187.5M REAGENT still available."
```

---

---

## How AI Agents Access Minting Tools

### Direct Execution via Shell Commands

AI agents can execute minting operations directly by running the `reagent_minting_curl.sh` script. This script uses `curl` to make authenticated API calls to the ReAgent platform.

### Prerequisites

1. **Script Location**: `/root/blinkai/hermes-skills/reagent_minting_curl.sh`
2. **Permissions**: Script must be executable (`chmod +x`)
3. **Dependencies**: `curl` and `jq` must be installed
4. **Environment**: `REAGENT_USER_ID` must be set (automatically by Hermes)

### Execution Pattern

**Step 1**: Check balance before any operation
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh check_balance
```

**Step 2**: If minting, get user confirmation first
```
Agent: "I can mint 10,000 REAGENT tokens for $0.50 USD. Proceed?"
User: "Yes"
```

**Step 3**: Execute the mint command
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh mint
```

**Step 4**: Display the result to user

### Example Conversation Flow

```
User: "Can you mint some tokens for me?"

Agent: "Let me check your balance first..."
Agent: *executes check_balance*
Agent: "Great! You have $10.50 USD available.

Minting 10,000 REAGENT tokens will cost $0.50 USD (including gas).

Would you like me to proceed?"

User: "Yes, go ahead"

Agent: "Perfect! Minting now..."
Agent: *executes mint*
Agent: "✅ Success! You've earned 10,000 REAGENT tokens!

🪙 Tokens Earned: 10,000 REAGENT
💵 Fee Paid: $0.50 USD
🔗 Transaction: 0x1234...5678

💰 New Balance: $10.00 USD
🪙 Total REAGENT: 10,000 tokens

View on Explorer: https://explore.tempo.xyz/tx/0x1234...5678"
```

### Error Handling

**Insufficient Balance**:
```
Agent: *executes check_balance*
Agent: "I'd love to help you mint tokens, but your balance is $0.30 USD.

You need at least $0.50 USD for auto-mining.

Would you like me to show you how to deposit funds?"
```

**Transaction Failure**:
```
Agent: *executes mint*
Agent: "Oops! The minting transaction failed. This could be due to:
- Network congestion
- Temporary blockchain issue

Your funds have been refunded. Would you like to try again?"
```

### Important Rules

1. **Always Check Balance First**: Before any minting discussion
2. **Always Get Confirmation**: Never mint without explicit user approval
3. **Display Full Output**: Show all details from the command output
4. **Handle Errors Gracefully**: Explain errors in user-friendly terms
5. **Provide Context**: Explain what's happening at each step

---

## Tool Usage Guidelines

### When to Use Mining Tools

**Appropriate Scenarios**:
1. User explicitly requests to mint tokens
2. User asks about minting costs or process
3. User wants to check their balance
4. User inquires about mining history
5. User asks about platform statistics

**Inappropriate Scenarios**:
1. User hasn't mentioned mining or tokens
2. User is asking unrelated questions
3. Automatic/unsolicited minting
4. Minting without user confirmation

### When to Use Wallet Tools

**Appropriate Scenarios**:
1. User explicitly requests to check balance
2. User wants to send tokens or ETH
3. User asks about their wallet address
4. User wants to see transaction history
5. User asks "how much do I have?"

**Inappropriate Scenarios**:
1. User hasn't mentioned wallet or balance
2. User is asking unrelated questions
3. Automatic/unsolicited transactions
4. Sending without user confirmation

### Best Practices

1. **Always Confirm Before Transactions**:
   ```
   User: "Mint tokens"
   Agent: "I can mint 10,000 REAGENT for $0.50 USD. Proceed?"
   User: "Yes"
   Agent: *calls POST /api/mining/simple-mint*
   ```

2. **Provide Context**:
   - Explain costs before transactions
   - Show current balance
   - Mention savings for auto mining
   - Display transaction details

3. **Handle Errors Gracefully**:
   - Explain what went wrong
   - Suggest solutions
   - Offer to check balance or retry

4. **Be Proactive**:
   - Suggest minting when balance is high
   - Remind about auto mining savings
   - Share interesting statistics

### Response Templates

**Successful Mint**:
```
"Great news! I've successfully minted 10,000 REAGENT tokens for you via the auto-mining API.

The transaction cost $0.50 USD and is now confirmed on the blockchain.

Your new balance is $X.XX USD and you now have X,XXX REAGENT tokens total.

Would you like to mint more, or is there anything else I can help you with?"
```

**Insufficient Balance**:
```
"I'd love to help you mint tokens, but it looks like your USD balance is a bit low.

Current Balance: $X.XX USD
Required: $0.50 USD
Shortfall: $X.XX USD

You can deposit more funds through the Mining Dashboard. Would you like me to show you how?"
```

**Cost Inquiry**:
```
"Minting 10,000 REAGENT tokens costs:

Manual (via dashboard): $1.00 USD + gas
Auto (via me): $0.50 USD + gas

That's a 50% savings when you let me handle it via the API! Gas fees are typically very low on Tempo Network (less than $0.001).

Would you like me to mint some tokens for you?"
```

---

## Skill Integration

### Auto-Installation

Both Minting_Skill and Wallet_Skill are automatically installed for all users during registration. They cannot be uninstalled as they're core platform features.

### Skill Metadata

**Minting_Skill**:
```json
{
  "name": "Minting_Skill",
  "version": "2.0.0",
  "description": "Mint REAGENT tokens via unified API endpoint",
  "author": "ReAgent Platform",
  "category": "blockchain",
  "proprietary": true,
  "autoInstall": true,
  "apiEndpoint": "/api/mining/simple-mint",
  "capabilities": [
    "check_balance",
    "execute_mint",
    "get_history",
    "get_stats"
  ],
  "requiredPermissions": [
    "wallet:read",
    "wallet:write",
    "mining:execute"
  ]
}
```

**Wallet_Skill**:
```json
{
  "name": "Wallet_Skill",
  "version": "2.0.0",
  "description": "Manage wallet and send tokens via API",
  "author": "ReAgent Platform",
  "category": "blockchain",
  "proprietary": true,
  "autoInstall": true,
  "apiEndpoints": [
    "/api/wallet/balance",
    "/api/wallet/info",
    "/api/wallet/send-eth",
    "/api/wallet/send-reagent"
  ],
  "capabilities": [
    "check_balance",
    "get_address",
    "send_eth",
    "send_reagent",
    "get_history"
  ],
  "requiredPermissions": [
    "wallet:read",
    "wallet:write"
  ]
}
```

---

## Multi-Channel Support

### Telegram Bot Integration

**Commands**: `/mine`, `/balance`, `/wallet`, `/help`, `/start`  
**Skill**: `telegram_commands_skill.py`  
**API**: Same `/api/mining/simple-mint` endpoint as web  
**Authentication**: `Authorization: Bearer {API_KEY}` + `X-User-ID: {userId}`

**Auto-Registration**: Commands automatically registered when user adds Telegram channel

**Example Flow**:
```
User: /mine 3
Bot: *calls POST /api/mining/simple-mint 3 times*
Bot: "✅ Mining completed!

🎉 Successful: 3/3
🪙 Total earned: 30,000 REAGENT

📝 Last TX: 0x1234...5678
🔗 Explorer: https://explore.tempo.xyz/tx/0x1234..."
```

### Discord Bot Integration (Coming Soon)

Same API endpoints, different authentication method.

### WhatsApp Bot Integration (Coming Soon)

Same API endpoints, different authentication method.

---

## Future Tools (Coming Soon)

### Trading_Skill
- Create buy/sell orders
- View order book
- Execute trades
- Track trading history

### Scheduling_Skill
- Schedule recurring mints
- Manage schedules
- Auto-pause on low balance

### Analytics_Skill
- Personal mining analytics
- ROI calculations
- Trend analysis
- Recommendations

---

**Document Version**: 2.0.0  
**Last Updated**: 2026-04-18  
**Platform**: ReAgent v1.0.0  
**API Base**: https://reagent.eu.cc
