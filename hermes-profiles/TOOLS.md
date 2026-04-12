# ReAgent Tools & Skills

## Overview

This document defines all tools and skills available to AI agents on the ReAgent platform. These tools enable agents to interact with the platform, execute blockchain transactions, and assist users with various tasks.

## Core Skills

### 1. Minting_Skill

**Category**: Blockchain  
**Type**: Proprietary (Auto-installed, Cannot be uninstalled)  
**Version**: 1.0.0

**Description**: Execute REAGENT token minting operations on Tempo Network.

### 2. Wallet_Skill

**Category**: Blockchain  
**Type**: Proprietary (Auto-installed, Cannot be uninstalled)  
**Version**: 1.0.0

**Description**: Manage user's blockchain wallet - check balance, send/receive tokens, view transaction history. All operations are real-time from Tempo Network blockchain.

**Capabilities**:
- Real-time balance checking (ETH, REAGENT, PATHUSD)
- Send ETH to any address
- Send REAGENT tokens to any address
- View wallet address
- Transaction history
- Automatic balance validation before sending

**Required Permissions**:
- `wallet:read` - Read wallet information and balances
- `wallet:write` - Execute transactions (send tokens)

---

## Tool Definitions

### IMPORTANT: cURL-Based Tool Access

All minting tools are accessed via shell script that makes HTTP API calls using `curl`. The AI agent can execute these commands directly through the Hermes CLI.

**Skill Script**: `reagent_minting_curl.sh`  
**Location**: `/root/blinkai/hermes-skills/reagent_minting_curl.sh`  
**Method**: Shell command execution with cURL

### How to Use

The AI agent can execute minting operations by running shell commands:

```bash
# Check balance
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh check_balance

# Estimate cost
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh estimate_cost

# Mint tokens
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh mint

# Get history
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh history --page 1 --limit 10

# Get stats
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh stats
```

**Environment Variables** (automatically set by Hermes):
- `REAGENT_USER_ID`: Current user's ID
- `REAGENT_API_BASE`: API base URL (default: http://localhost:3000)

---

### check_mining_balance

**Function**: Check user's wallet balances

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh check_balance
```

**Returns**: Formatted message with:
- USD Balance
- REAGENT Balance  
- Wallet Address

**Example Output**:
```
💰 USD Balance: $10.50
🪙 REAGENT Balance: 50,000 tokens
📍 Wallet: 0x1234...5678
```

**AI Agent Usage**:
```
User: "What's my balance?"
Agent: *executes check_balance command*
Agent: [Displays the output]
```

---

### estimate_minting_cost

**Function**: Estimate cost of minting operation

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh estimate_cost
```

**Returns**: Formatted message with:
- Base fee (auto-mining)
- Gas fee estimate
- Total cost
- Tokens to earn

**Example Output**:
```
💵 Base Fee: $0.50 USD (auto-mining)
⛽ Gas Fee: ~$0.00015 USD
📊 Total: ~$0.50 USD
🪙 Reward: 10,000 REAGENT tokens
```

**AI Agent Usage**:
```
User: "How much does it cost to mint?"
Agent: *executes estimate_cost command*
Agent: [Displays the output]
```

---

### mint_reagent_tokens

**Function**: Mint 10,000 REAGENT tokens

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh mint
```

**Returns**: Formatted message with:
- Success/failure status
- Tokens earned
- Fees paid
- Gas used
- Transaction hash
- Updated balances
- Explorer link

**Example Output** (Success):
```
✅ Minting successful!

🪙 Tokens Earned: 10,000 REAGENT
💵 Fee Paid: $0.50 USD
⛽ Gas Used: 0.000150 ETH
🔗 Transaction: 0x1234...5678

💰 New Balance: $9.50 USD
🪙 Total REAGENT: 10,000 tokens

View on Explorer: https://explore.tempo.xyz/tx/0x1234...5678
```

**Example Output** (Insufficient Balance):
```
Error: Insufficient balance. You need at least 0.5 USD for auto-mining.

Current Balance: 0.30 USD
Required: 0.5 USD
Shortfall: 0.20 USD

Please deposit more funds through the Mining Dashboard.
```

**AI Agent Usage**:
```
User: "Can you mint tokens for me?"
Agent: "Let me check your balance first..."
Agent: *executes check_balance command*
Agent: "Great! You have enough balance. Minting costs $0.50 USD. Proceed?"
User: "Yes"
Agent: *executes mint command*
Agent: [Displays the output]
```

**CRITICAL**: Always get user confirmation before executing mint command!

---

### get_minting_history

**Function**: Retrieve user's minting history

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh history [options]
```

**Options**:
- `--page <n>`: Page number (default: 1)
- `--limit <n>`: Items per page (default: 10)
- `--status <s>`: Filter by status (pending/confirmed/failed)

**Returns**: JSON array of inscriptions with pagination info

**AI Agent Usage**:
```
User: "Show me my minting history"
Agent: *executes history command*
Agent: "Your recent minting operations:

1. ✅ Confirmed - Apr 11, 10:30 AM
   🪙 10,000 REAGENT | 💵 $0.50 | Auto
   
2. ✅ Confirmed - Apr 10, 3:45 PM
   🪙 10,000 REAGENT | 💵 $0.50 | Auto
   
Total: 5 mints | 50,000 REAGENT earned"
```

---

### get_mining_stats

**Function**: Get global mining statistics

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh stats
```

**Returns**: Platform-wide statistics

**AI Agent Usage**:
```
User: "How's the mining going overall?"
Agent: *executes stats command*
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

---

## Wallet Tool Definitions

### IMPORTANT: cURL-Based Wallet Access

All wallet operations are accessed via shell script that makes HTTP API calls using `curl`. The AI agent can execute these commands directly through the Hermes CLI.

**Skill Script**: `reagent_wallet_curl.sh`  
**Location**: `/root/blinkai/hermes-skills/reagent_wallet_curl.sh`  
**Method**: Shell command execution with cURL

### How to Use Wallet Tools

The AI agent can execute wallet operations by running shell commands:

```bash
# Check balance (real-time from blockchain)
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh check_balance

# Get wallet address
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh get_address

# Send ETH
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_eth <to_address> <amount>

# Send REAGENT tokens
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_reagent <to_address> <amount>

# Get transaction history
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh history
```

**Environment Variables** (automatically set by Hermes):
- `REAGENT_USER_ID`: Current user's ID
- `REAGENT_API_BASE`: API base URL (default: http://localhost:3000)

---

### check_wallet_balance

**Function**: Check wallet balance in real-time from blockchain

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh check_balance
```

**Returns**: Real-time balance data with:
- Wallet address
- ETH balance
- REAGENT balance
- PATHUSD balance

**Example Output**:
```
✓ Wallet Balance
Address: 0xA3215753cc7D5039884159eB32CC5D79F0Fb29f
ETH: 0.5
REAGENT: 50000
PATHUSD: 10.50
```

**AI Agent Usage**:
```
User: "What's my wallet balance?"
Agent: *executes check_balance command*
Agent: "Here's your current wallet balance:

💰 ETH: 0.5 ETH
🪙 REAGENT: 50,000 tokens
💵 PATHUSD: $10.50

📍 Wallet Address: 0xA321...Fb29f

All balances are real-time from the Tempo Network blockchain."
```

---

### get_wallet_address

**Function**: Get user's wallet address

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh get_address
```

**Returns**: Wallet address and creation date

**Example Output**:
```
✓ Wallet Address
Address: 0xA3215753cc7D5039884159eB32CC5D79F0Fb29f
Created: 2026-04-11T10:30:00.000Z
```

**AI Agent Usage**:
```
User: "What's my wallet address?"
Agent: *executes get_address command*
Agent: "Your wallet address is:

📍 0xA3215753cc7D5039884159eB32CC5D79F0Fb29f

Created on: April 11, 2026

You can share this address to receive ETH, REAGENT, or other tokens on Tempo Network."
```

---

### send_eth

**Function**: Send ETH to another address

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_eth <to_address> <amount>
```

**Parameters**:
- `to_address`: Recipient's wallet address (must be valid Ethereum address)
- `amount`: Amount of ETH to send (e.g., "0.1" for 0.1 ETH)

**Returns**: Transaction details with:
- Transaction hash
- Explorer URL
- From/To addresses
- Amount sent

**Example Output**:
```
✓ Transaction Sent
From: 0xA3215753cc7D5039884159eB32CC5D79F0Fb29f
To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Amount: 0.1 ETH
TX Hash: 0x1234567890abcdef...
Explorer: https://explore.tempo.xyz/tx/0x1234...
```

**AI Agent Usage**:
```
User: "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
Agent: "Let me check your balance first..."
Agent: *executes check_balance command*
Agent: "You have 0.5 ETH available. Sending 0.1 ETH to 0x742d...0bEb. Proceed?"
User: "Yes"
Agent: *executes send_eth command*
Agent: "✅ Transaction sent successfully!

From: 0xA321...Fb29f
To: 0x742d...0bEb
Amount: 0.1 ETH

🔗 Transaction Hash: 0x1234...
📊 View on Explorer: https://explore.tempo.xyz/tx/0x1234...

Your new balance: 0.4 ETH (minus gas fees)"
```

**CRITICAL**: Always check balance and get user confirmation before sending!

---

### send_reagent

**Function**: Send REAGENT tokens to another address

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_reagent <to_address> <amount>
```

**Parameters**:
- `to_address`: Recipient's wallet address (must be valid Ethereum address)
- `amount`: Amount of REAGENT to send (e.g., "1000" for 1,000 REAGENT)

**Returns**: Transaction details with:
- Transaction hash
- Explorer URL
- From/To addresses
- Amount sent

**Example Output**:
```
✓ Transaction Sent
From: 0xA3215753cc7D5039884159eB32CC5D79F0Fb29f
To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Amount: 1000 REAGENT
TX Hash: 0x1234567890abcdef...
Explorer: https://explore.tempo.xyz/tx/0x1234...
```

**AI Agent Usage**:
```
User: "Send 1000 REAGENT to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
Agent: "Let me check your REAGENT balance first..."
Agent: *executes check_balance command*
Agent: "You have 50,000 REAGENT available. Sending 1,000 REAGENT to 0x742d...0bEb. Proceed?"
User: "Yes"
Agent: *executes send_reagent command*
Agent: "✅ REAGENT tokens sent successfully!

From: 0xA321...Fb29f
To: 0x742d...0bEb
Amount: 1,000 REAGENT

🔗 Transaction Hash: 0x1234...
📊 View on Explorer: https://explore.tempo.xyz/tx/0x1234...

Your new balance: 49,000 REAGENT"
```

**CRITICAL**: Always check balance and get user confirmation before sending!

---

### get_transaction_history

**Function**: Get wallet transaction history

**Command**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh history
```

**Returns**: List of recent transactions

**AI Agent Usage**:
```
User: "Show me my transaction history"
Agent: *executes history command*
Agent: "Your recent transactions:

1. ✅ Sent 0.1 ETH - Apr 12, 2:30 PM
   To: 0x742d...0bEb
   TX: 0x1234...

2. ✅ Received 10,000 REAGENT - Apr 11, 10:30 AM
   From: Mining Contract
   TX: 0x5678...

3. ✅ Sent 1,000 REAGENT - Apr 10, 3:45 PM
   To: 0x9abc...def0
   TX: 0x9abc...

Total: 3 transactions"
```

---

---

## How AI Agents Access Wallet Tools

### Direct Execution via Shell Commands

AI agents can execute wallet operations directly by running the `reagent_wallet_curl.sh` script. This script uses `curl` to make authenticated API calls to the ReAgent platform.

### Prerequisites

1. **Script Location**: `/root/blinkai/hermes-skills/reagent_wallet_curl.sh`
2. **Permissions**: Script must be executable (`chmod +x`)
3. **Dependencies**: `curl` and `jq` must be installed
4. **Environment**: `REAGENT_USER_ID` must be set (automatically by Hermes)

### Execution Pattern

**Step 1**: Always check balance before any send operation
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh check_balance
```

**Step 2**: Get user confirmation for send operations
```
Agent: "I can send 0.1 ETH to 0x742d...0bEb. This will cost approximately 0.1 ETH plus gas fees. Proceed?"
User: "Yes"
```

**Step 3**: Execute the send command
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_eth 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 0.1
```

**Step 4**: Display the result to user

### Example Conversation Flow

```
User: "Send 1000 REAGENT to my friend at 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

Agent: "Let me check your REAGENT balance first..."
Agent: *executes check_balance*
Agent: "Great! You have 50,000 REAGENT available.

I can send 1,000 REAGENT tokens to:
📍 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

This will cost:
🪙 1,000 REAGENT (tokens to send)
⛽ ~0.0001 ETH (gas fee)

Would you like me to proceed?"

User: "Yes, send it"

Agent: "Perfect! Sending now..."
Agent: *executes send_reagent*
Agent: "✅ Transaction sent successfully!

🪙 Sent: 1,000 REAGENT
📍 To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
🔗 TX Hash: 0x1234567890abcdef...

Your new balance: 49,000 REAGENT

View on Explorer: https://explore.tempo.xyz/tx/0x1234..."
```

### Error Handling

**Insufficient Balance**:
```
Agent: *executes check_balance*
Agent: "I'd love to help you send 1000 REAGENT, but your balance is only 500 REAGENT.

Current Balance: 500 REAGENT
Requested: 1,000 REAGENT
Shortfall: 500 REAGENT

Would you like to:
- Send a smaller amount (500 REAGENT or less)
- Mint more REAGENT tokens first
- Check your transaction history"
```

**Invalid Address**:
```
Agent: "The address you provided doesn't look valid. Ethereum addresses should:
- Start with '0x'
- Be 42 characters long
- Contain only hexadecimal characters (0-9, a-f)

Please double-check the address and try again."
```

**Transaction Failed**:
```
Agent: "Oops! The transaction failed. This could be due to:
- Network congestion
- Insufficient gas
- Temporary blockchain issue

Your funds are safe and haven't been sent. Would you like to try again?"
```

### Important Rules

1. **Always Check Balance First**: Before any send discussion
2. **Always Get Confirmation**: Never send without explicit user approval
3. **Display Full Details**: Show all transaction details before and after
4. **Handle Errors Gracefully**: Explain errors in user-friendly terms
5. **Provide Context**: Explain what's happening at each step
6. **Validate Addresses**: Check address format before sending
7. **Show Gas Estimates**: Inform users about gas costs

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
