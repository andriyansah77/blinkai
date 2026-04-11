# ReAgent Tools & Skills

## Overview

This document defines all tools and skills available to AI agents on the ReAgent platform. These tools enable agents to interact with the platform, execute blockchain transactions, and assist users with various tasks.

## Core Skills

### 1. Minting_Skill

**Category**: Blockchain  
**Type**: Proprietary (Auto-installed, Cannot be uninstalled)  
**Version**: 1.0.0

**Description**: Execute REAGENT token minting operations on Tempo Network. This skill enables AI agents to mint tokens on behalf of users with automatic balance validation and cost estimation.

**Capabilities**:
- Balance checking (USD and REAGENT)
- Cost estimation with gas calculation
- Token minting execution
- Transaction monitoring
- History retrieval
- Statistics reporting

**Required Permissions**:
- `wallet:read` - Read wallet information
- `wallet:write` - Execute transactions
- `mining:execute` - Mint tokens

---

## Tool Definitions

### mint_reagent_tokens

**Function**: Main minting function with user-friendly feedback

**Description**: Mint 10,000 REAGENT tokens for the user. Automatically checks balance, estimates cost, validates sufficient funds, and executes the minting transaction.

**Parameters**: None

**Returns**: Human-readable feedback message with:
- Success/failure status
- Tokens earned
- Fees paid
- Gas used
- Transaction hash
- Updated balances
- Explorer link

**Example Usage**:
```
User: "Can you mint some REAGENT tokens for me?"
Agent: *calls mint_reagent_tokens()*
Agent: "✅ Minting successful!

🪙 Tokens Earned: 10,000 REAGENT
💵 Fee Paid: $1.00 USD
⛽ Gas Used: 0.000150 ETH
🔗 Transaction: 0x1234...5678

💰 New Balance: $9.00 USD
🪙 Total REAGENT: 10,000

View on Explorer: https://explore.tempo.xyz/tx/0x1234...5678"
```

**Error Handling**:
- Insufficient balance: Returns clear message with shortfall amount
- Transaction failure: Returns error with retry suggestion
- Network issues: Returns timeout message

---

### check_mining_balance

**Function**: Check user's wallet balances

**Description**: Retrieve current USD balance (for mining fees) and REAGENT token balance.

**Parameters**: None

**Returns**: JSON object with:
```json
{
  "success": true,
  "address": "0x...",
  "usdBalance": 10.50,
  "reagentBalance": 50000
}
```

**Example Usage**:
```
User: "What's my balance?"
Agent: *calls check_mining_balance()*
Agent: "Your current balances:
💰 USD Balance: $10.50
🪙 REAGENT Balance: 50,000 tokens
📍 Wallet: 0x1234...5678"
```

---

### estimate_minting_cost

**Function**: Estimate cost of minting operation

**Description**: Calculate the total cost (fee + gas) for minting REAGENT tokens.

**Parameters**: None

**Returns**: JSON object with:
```json
{
  "success": true,
  "feeUsd": 1.0,
  "gasEstimate": 0.000150,
  "totalCostUsd": 1.00015,
  "tokensToEarn": 10000
}
```

**Example Usage**:
```
User: "How much does it cost to mint?"
Agent: *calls estimate_minting_cost()*
Agent: "Minting cost breakdown:
💵 Base Fee: $1.00 USD (manual)
⛽ Gas Fee: ~$0.00015 USD
📊 Total: ~$1.00 USD
🪙 Reward: 10,000 REAGENT tokens

Note: Auto mining via AI agent costs only $0.50 USD (50% savings!)"
```

---

### get_minting_history

**Function**: Retrieve user's minting history

**Description**: Get paginated list of user's past minting operations with status, amounts, and transaction details.

**Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status - "pending", "confirmed", "failed"

**Returns**: JSON object with:
```json
{
  "success": true,
  "inscriptions": [
    {
      "id": "...",
      "createdAt": "2026-04-11T10:30:00Z",
      "type": "manual",
      "tokensEarned": 10000,
      "feeUsd": 1.0,
      "gasUsed": 0.000150,
      "status": "confirmed",
      "txHash": "0x..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Example Usage**:
```
User: "Show me my minting history"
Agent: *calls get_minting_history()*
Agent: "Your recent minting operations:

1. ✅ Confirmed - Apr 11, 10:30 AM
   🪙 10,000 REAGENT | 💵 $1.00 | Manual
   
2. ✅ Confirmed - Apr 10, 3:45 PM
   🪙 10,000 REAGENT | 💵 $0.50 | Auto
   
Total: 5 mints | 50,000 REAGENT earned"
```

---

### get_mining_stats

**Function**: Get global mining statistics

**Description**: Retrieve platform-wide mining statistics including total mints, tokens minted, active miners, and type breakdown.

**Parameters**: None

**Returns**: JSON object with:
```json
{
  "success": true,
  "stats": {
    "totalInscriptions": 1250,
    "totalSupplyMinted": "12500000",
    "remainingAllocation": "187500000",
    "allocationPercentage": 6.25,
    "inscriptions24h": 45,
    "uniqueUsers": 320,
    "typeBreakdown": {
      "auto": 800,
      "manual": 450,
      "autoPercentage": "64.0",
      "manualPercentage": "36.0"
    }
  }
}
```

**Example Usage**:
```
User: "How's the mining going overall?"
Agent: *calls get_mining_stats()*
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

## Tool Usage Guidelines

### When to Use Minting Tools

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

### Best Practices

1. **Always Confirm Before Minting**:
   ```
   User: "Mint tokens"
   Agent: "I can mint 10,000 REAGENT tokens for you. This will cost approximately $1.00 USD. Would you like me to proceed?"
   User: "Yes"
   Agent: *calls mint_reagent_tokens()*
   ```

2. **Provide Context**:
   - Explain costs before minting
   - Show current balance
   - Mention savings for auto mining

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
"Great news! I've successfully minted 10,000 REAGENT tokens for you. 

The transaction cost $1.00 USD and is now confirmed on the blockchain. You can view it on the Tempo Explorer.

Your new balance is $X.XX USD and you now have X,XXX REAGENT tokens total.

Would you like to mint more, or is there anything else I can help you with?"
```

**Insufficient Balance**:
```
"I'd love to help you mint tokens, but it looks like your USD balance is a bit low.

Current Balance: $X.XX USD
Required: $1.00 USD
Shortfall: $X.XX USD

You can deposit more funds through the Mining Dashboard. Would you like me to show you how?"
```

**Cost Inquiry**:
```
"Minting 10,000 REAGENT tokens costs:

Manual (via dashboard): $1.00 USD + gas
Auto (via me): $0.50 USD + gas

That's a 50% savings when you let me handle it! Gas fees are typically very low on Tempo Network (less than $0.001).

Would you like me to mint some tokens for you?"
```

---

## Skill Integration

### Auto-Installation

The Minting_Skill is automatically installed for all users during registration. It cannot be uninstalled as it's a core platform feature.

### Skill Metadata

```json
{
  "name": "Minting_Skill",
  "version": "1.0.0",
  "description": "Mint REAGENT tokens on Tempo Network",
  "author": "ReAgent Platform",
  "category": "blockchain",
  "proprietary": true,
  "autoInstall": true,
  "capabilities": [
    "check_balance",
    "estimate_cost",
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

**Document Version**: 1.0.0  
**Last Updated**: 2026-04-11  
**Platform**: ReAgent v1.0.0
