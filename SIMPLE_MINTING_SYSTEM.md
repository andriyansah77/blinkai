# Simple Minting System - Complete Rebuild

## Overview
Sistem minting yang di-rebuild dari awal dengan konsep yang lebih simple:
- Semua wallet managed server-side
- Semua signing di server
- Tidak ada browser wallet integration
- AI agent dan manual minting pakai mekanisme yang sama

## Architecture

### 1. Simple Wallet Manager
**File**: `src/lib/mining/simple-wallet-manager.ts`

**Features**:
- Generate wallet dengan encrypted private key
- Decrypt private key untuk signing
- Sign transaction server-side
- Broadcast transaction ke blockchain

**Methods**:
```typescript
generateWallet(userId): Promise<SimpleWallet>
getWallet(userId): Promise<SimpleWallet | null>
getPrivateKey(userId): Promise<string>
signTransaction(userId, tx): Promise<string>
broadcastTransaction(signedTx): Promise<string>
```

### 2. Simple Minting Engine
**File**: `src/lib/mining/simple-minting-engine.ts`

**Features**:
- Construct mint transaction
- Sign dengan wallet manager
- Broadcast ke blockchain
- Monitor confirmation
- Update database

**Methods**:
```typescript
mint(userId, type): Promise<MintResult>
```

### 3. Simple Mint API
**File**: `src/app/api/mining/simple-mint/route.ts`

**Endpoint**: `POST /api/mining/simple-mint`

**Request**:
```json
{
  "type": "auto" | "manual"
}
```

**Response**:
```json
{
  "success": true,
  "inscriptionId": "...",
  "txHash": "0x...",
  "tokensEarned": "10000"
}
```

## Flow Diagram

### Wallet Generation
```
User Sign Up
    ↓
Generate Wallet (ethers.Wallet.createRandom())
    ↓
Encrypt Private Key (AES-256-GCM)
    ↓
Store in Database
    ↓
Return Mnemonic to User (backup)
```

### Minting Flow
```
User/AI Agent Request Mint
    ↓
Authenticate (Privy Session / API Key)
    ↓
Get User Wallet from DB
    ↓
Construct Mint Transaction
    ↓
Decrypt Private Key
    ↓
Sign Transaction
    ↓
Broadcast to Blockchain
    ↓
Monitor Confirmation
    ↓
Update Database
    ↓
Return Success
```

## Usage

### Manual Minting (Dashboard)
```typescript
// From mining page
const response = await fetch('/api/mining/simple-mint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'manual' })
});

const result = await response.json();
// { success: true, txHash: "0x...", tokensEarned: "10000" }
```

### AI Agent Minting
```python
# From Hermes skill
response = requests.post(
    f"{PLATFORM_URL}/api/mining/simple-mint",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    },
    json={"type": "auto"}
)

result = response.json()
# {'success': True, 'txHash': '0x...', 'tokensEarned': '10000'}
```

### Chat Command
```
User: /mine 5
Bot: ⛏️ Starting auto mining for 5 REAGENT tokens...
     ✅ Mint 1/5: Transaction submitted
        TX Hash: 0x1234567...89abcdef
        Tokens: 10000 REAGENT
     ...
     🎉 Mining complete! Minted 50000 REAGENT tokens.
```

## Security

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Source**: `WALLET_ENCRYPTION_KEY` environment variable
- **IV**: Unique 16 bytes per wallet
- **Auth Tag**: 16 bytes for integrity verification

### Access Control
- **Authentication**: Privy session or API key required
- **Rate Limiting**: 10 mints per hour per user
- **Private Key**: Only decrypted in memory during signing
- **Logging**: Private keys never logged

### User Consent
- User receives mnemonic during wallet creation
- User can export wallet anytime
- User agrees to terms during onboarding
- User can disable account anytime

## Database Schema

```sql
-- Wallet table (already exists)
CREATE TABLE "Wallet" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "address" TEXT UNIQUE NOT NULL,
  "encryptedPrivateKey" TEXT NOT NULL,  -- Encrypted with AES-256-GCM
  "keyIv" TEXT NOT NULL,                -- Initialization vector
  "reagentBalance" TEXT DEFAULT '0',
  "pathusdBalance" TEXT DEFAULT '0',
  "lastBalanceUpdate" TIMESTAMP DEFAULT NOW(),
  "network" TEXT DEFAULT 'tempo',
  "imported" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Inscription table (already exists)
CREATE TABLE "Inscription" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "type" TEXT NOT NULL,              -- 'auto' or 'manual'
  "status" TEXT NOT NULL,            -- 'pending', 'confirmed', 'failed'
  "txHash" TEXT,
  "tokensEarned" TEXT,
  "inscriptionFee" TEXT,
  "gasEstimate" TEXT,
  "gasFee" TEXT,
  "blockNumber" INTEGER,
  "confirmedAt" TIMESTAMP,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

```bash
# Required
WALLET_ENCRYPTION_KEY=your-32-character-encryption-key-here
TEMPO_RPC_URL=https://rpc.tempo.xyz
REAGENT_TOKEN_ADDRESS=0x20C000000000000000000000a59277C0c1d65Bc5
TEMPO_CHAIN_ID=4217

# Optional
NODE_ENV=production
```

## Deployment

### 1. Update Code
```bash
cd /root/reagent
git pull origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build
```bash
npm run build
```

### 4. Restart
```bash
pm2 restart reagent
```

### 5. Verify
```bash
# Check logs
pm2 logs reagent --lines 50

# Test API
curl -X POST https://reagent.eu.cc/api/mining/simple-mint \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"type":"manual"}'
```

## Testing

### Test Wallet Generation
```bash
# Create new user and wallet
curl -X POST https://reagent.eu.cc/api/wallet/create \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Check database
psql -U reagent -d reagent -c "
  SELECT 
    \"userId\", 
    \"address\", 
    LENGTH(\"encryptedPrivateKey\") as key_len,
    LENGTH(\"keyIv\") as iv_len
  FROM \"Wallet\" 
  ORDER BY \"createdAt\" DESC 
  LIMIT 1;
"

# key_len should be > 0
# iv_len should be 32 (16 bytes in hex)
```

### Test Manual Minting
```bash
# From dashboard
# 1. Login to https://reagent.eu.cc
# 2. Go to Mining page
# 3. Click "Inscribe Now"
# 4. Should succeed without MetaMask popup
```

### Test AI Agent Minting
```bash
# Set API key
export REAGENT_API_KEY="your_api_key"

# Run skill
cd /root/.hermes/skills
python3 auto_mining_skill.py start_mining 3

# Should mint 3 times successfully
```

### Test Chat Command
```bash
# In chat
/mine 5

# Should mint 5 times and show progress
```

## Troubleshooting

### Error: "Wallet not found"
- User needs to create wallet first
- Check if wallet exists in database
- Verify user is authenticated

### Error: "Failed to decrypt private key"
- Check `WALLET_ENCRYPTION_KEY` in .env
- Verify key is 32 characters
- Check if `encryptedPrivateKey` and `keyIv` exist in database

### Error: "Transaction failed"
- Check wallet has PATHUSD for gas
- Verify wallet has ISSUER_ROLE on token contract
- Check RPC endpoint is responding
- Verify network is Tempo Mainnet (4217)

### Error: "Rate limit exceeded"
- User can only mint 10 times per hour
- Wait 1 hour before trying again
- Check rate limit in database

## Migration from Old System

### For New Users
- ✅ Works out of the box
- Wallet generated with encrypted key
- Can use AI agent immediately

### For Existing Users
- ❌ Old wallets don't have encrypted key
- Need to generate new wallet
- Transfer tokens to new address
- Or run migration script (TODO)

## Benefits

✅ Simple architecture - easy to understand  
✅ Server-side only - no browser complexity  
✅ Works for both manual and AI agent  
✅ Secure with encryption  
✅ Easy to test and debug  
✅ No MetaMask/Privy wallet needed  

## Limitations

❌ Private key stored on server (encrypted)  
❌ Single point of failure  
❌ Existing users need migration  
❌ Cannot use external wallets  

## Future Improvements

1. **Migration Tool**: Auto-migrate existing wallets
2. **Hardware Wallet**: Support hardware wallet signing
3. **Multi-Sig**: Require multiple signatures
4. **Backup System**: Encrypted backup to S3
5. **Audit Logging**: Log all signing operations

## Conclusion

✅ Complete rebuild with simple architecture  
✅ Works for both manual and AI agent minting  
✅ Secure with AES-256-GCM encryption  
✅ Easy to deploy and test  
✅ Ready for production  

---

**Status**: ✅ COMPLETE  
**Date**: 2026-04-18  
**Version**: 3.0.0  
**Ready for Production**: YES
