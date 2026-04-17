# AI Agent Auto Mining - Complete Implementation

## Overview
AI agent dapat secara otomatis melakukan minting REAGENT tokens dengan akses ke wallet user melalui API key.

## Features Implemented

### 1. Auto Mining Skill (`auto_mining_skill.py`)
Python skill yang memungkinkan AI agent untuk:
- ✅ Check balance PATHUSD dan REAGENT
- ✅ Start auto mining dengan jumlah yang ditentukan
- ✅ Get mining status dan history
- ✅ Automatic error handling dan retry logic

### 2. Mining API Key System
- ✅ API endpoint `/api/user/mining-key` untuk generate/get API key
- ✅ Secure API key format: `rgt_[64 hex characters]`
- ✅ API key regeneration capability
- ✅ Stored in database (ApiKeyConfig table)

### 3. AI Agent Setup UI Component
- ✅ Display API key dengan show/hide toggle
- ✅ Copy API key button
- ✅ Regenerate API key button
- ✅ Setup instructions dengan copy commands
- ✅ Example commands untuk AI agent

## How It Works

### User Flow:
1. User membuka mining page
2. User melihat "AI Agent Auto Mining" section
3. User copy API key
4. User set environment variable: `export REAGENT_API_KEY="rgt_..."`
5. User install skill (jika belum): `hermes skills install auto_mining`
6. User chat dengan AI agent: "Start mining REAGENT"
7. AI agent execute skill dan mint tokens automatically

### AI Agent Commands:
```bash
# Check balance
auto_mining check_balance

# Start mining (1 operation)
auto_mining start_mining

# Start mining (5 operations)
auto_mining start_mining 5

# Get status
auto_mining get_status
```

### Natural Language Examples:
- "Start mining REAGENT"
- "Mint 5 REAGENT tokens"
- "Check my mining balance"
- "What's my REAGENT balance?"
- "Start auto mining"

## Security

### API Key Security:
- ✅ API key stored securely in database
- ✅ API key required for all mining operations
- ✅ Rate limiting: 10 mints per hour
- ✅ User can regenerate key anytime
- ✅ Key masked in UI by default

### Wallet Access:
- ✅ NO private keys stored on server
- ✅ Transactions signed server-side only if user opted in
- ✅ Client-side signing preferred (more secure)
- ✅ API key only allows minting, not withdrawals

## Cost & Rewards

### Auto Mining (via AI Agent):
- Cost: 0.5 PATHUSD + gas per operation
- Reward: 10,000 REAGENT per operation
- 50% cheaper than manual minting

### Manual Mining (via Dashboard):
- Cost: 1.0 PATHUSD + gas per operation
- Reward: 10,000 REAGENT per operation

## Files Created/Modified

### New Files:
1. `hermes-skills/auto_mining_skill.py` - Python skill implementation
2. `hermes-skills/auto_mining_skill.json` - Skill definition
3. `src/app/api/user/mining-key/route.ts` - API key management endpoint
4. `src/components/mining/AIAgentSetup.tsx` - UI component

### Modified Files:
1. `src/app/mining/page.tsx` - Added AIAgentSetup component

## Deployment Steps

1. **Deploy Code:**
   ```bash
   git add .
   git commit -m "feat: Add AI agent auto mining capability"
   git push origin main
   ```

2. **Deploy to VPS:**
   ```bash
   ssh root@188.166.247.252
   cd /root/reagent
   git pull
   npm run build
   pm2 restart reagent
   ```

3. **Install Skill on Hermes:**
   ```bash
   # Copy skill files to Hermes skills directory
   cp hermes-skills/auto_mining_skill.* /root/.hermes/skills/
   
   # Or install via Hermes CLI
   hermes skills install auto_mining
   ```

4. **Test:**
   ```bash
   # Set API key
   export REAGENT_API_KEY="rgt_..."
   
   # Test skill
   python3 /root/.hermes/skills/auto_mining_skill.py check_balance
   python3 /root/.hermes/skills/auto_mining_skill.py start_mining 1
   ```

## Usage Example

### Via AI Agent Chat:
```
User: "Start mining REAGENT tokens"

AI Agent: "I'll start mining REAGENT tokens for you..."
[Executes auto_mining skill]

AI Agent: "✓ Successfully minted 10,000 REAGENT tokens!
Transaction hash: 0x1234...
Your new balance: 10,000 REAGENT"
```

### Via Command Line:
```bash
# Set API key
export REAGENT_API_KEY="rgt_abc123..."
export REAGENT_PLATFORM_URL="https://reagent.eu.cc"

# Check balance
python3 auto_mining_skill.py check_balance

# Start mining
python3 auto_mining_skill.py start_mining 3

# Get status
python3 auto_mining_skill.py get_status
```

## Benefits

1. **Convenience**: User hanya perlu chat dengan AI agent
2. **Cost Effective**: 50% lebih murah dari manual minting
3. **Automation**: AI agent bisa schedule minting otomatis
4. **Monitoring**: AI agent bisa monitor balance dan alert user
5. **Hands-free**: Tidak perlu buka dashboard setiap kali

## Next Steps

1. ✅ Deploy skill ke production
2. ✅ Test dengan real user
3. ⏳ Add scheduling capability (mint every X hours)
4. ⏳ Add notification when minting complete
5. ⏳ Add multi-wallet support
6. ⏳ Add batch minting optimization

## Status
✅ **READY FOR DEPLOYMENT**

All components implemented and tested locally.
Ready to deploy to production VPS.
