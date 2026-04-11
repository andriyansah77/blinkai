# Phase 0: REAGENT Token Deployment

## Quick Start

This phase deploys the REAGENT token on Tempo Network. Follow these steps in order:

### 0. Install Dependencies

First, install ts-node if not already installed:

```bash
npm install
```

This will install ts-node and all other dependencies.

### 1. Prerequisites Check

Ensure you have:
- [ ] Two Ethereum wallets (admin + platform)
- [ ] Gas funds in both wallets
- [ ] Quote token address (USD stablecoin on Tempo)
- [ ] Node.js and npm installed
- [ ] TypeScript installed (`npm install -g typescript ts-node`)

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in these values:

```env
# Tempo Network (already configured)
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"

# Admin Wallet (YOU MUST FILL THESE)
PLATFORM_ADMIN_PRIVATE_KEY="0x..."  # Your admin wallet private key
PLATFORM_ADMIN_ADDRESS="0x..."      # Your admin wallet address

# Platform Wallet (YOU MUST FILL THESE)
PLATFORM_WALLET_ADDRESS="0x..."     # Your platform wallet address
PLATFORM_WALLET_PRIVATE_KEY="0x..." # Your platform wallet private key

# Quote Token (YOU MUST FILL THIS)
QUOTE_TOKEN_ADDRESS="0x..."         # USD stablecoin address on Tempo

# Wallet Encryption (YOU MUST FILL THIS)
WALLET_ENCRYPTION_KEY="your-strong-secret-key-here"
```

### 3. Run Deployment

```bash
# Deploy REAGENT token
npx ts-node scripts/deploy-reagent-token.ts
```

Expected output:
```
🚀 Starting REAGENT Token Deployment on Tempo Network
📋 Loading configuration...
🔌 Connecting to Tempo Network...
📝 Deploying REAGENT token...
✅ Token deployed at: 0x...
🔐 Granting ISSUER_ROLE to platform wallet...
📊 Setting supply cap to 400M REAGENT...
🧪 Testing mint function...
✅ Deployment completed successfully!
```

### 4. Verify Deployment

```bash
# Verify roles and configuration
npx ts-node scripts/verify-reagent-roles.ts
```

Expected output:
```
🔍 Verifying REAGENT Token Configuration
✅ Token metadata correct
✅ Admin has DEFAULT_ADMIN_ROLE
✅ Platform wallet has ISSUER_ROLE
✅ Supply cap set correctly (400M REAGENT)
✅ Total supply within cap
```

### 5. Test Minting

```bash
# Test that platform wallet can mint
npx ts-node scripts/test-reagent-mint.ts
```

Expected output:
```
🧪 Testing REAGENT Token Minting
🔐 Verifying ISSUER_ROLE...
💎 Minting 10000 REAGENT...
✅ Mint test passed successfully!
```

### 6. Update Tasks

After successful deployment, mark Phase 0 tasks as complete:

- [x] 0.1 Deploy REAGENT token using TIP20Factory
- [x] 0.2 Grant ISSUER_ROLE to platform wallet
- [x] 0.3 Set supply cap to 400M REAGENT
- [x] 0.4 Configure quote token and verify deployment
- [x] 0.5 Update environment variables

## Files Created

After deployment, you'll have:

1. **REAGENT_DEPLOYMENT.json**: Complete deployment information
2. **.env** (updated): Contains REAGENT_TOKEN_ADDRESS
3. **Deployment logs**: Console output with all details

## Troubleshooting

### Common Issues

**Issue**: "Admin wallet has no balance for gas fees"
- **Solution**: Send native tokens to admin wallet for gas

**Issue**: "QUOTE_TOKEN_ADDRESS not set"
- **Solution**: Find a USD stablecoin on Tempo Network and set its address

**Issue**: "Network mismatch"
- **Solution**: Verify TEMPO_RPC_URL is correct (https://rpc.tempo.xyz)

**Issue**: "Failed to grant ISSUER_ROLE"
- **Solution**: Verify admin wallet has DEFAULT_ADMIN_ROLE

### Getting Help

1. Check deployment logs for error details
2. Verify all environment variables are set
3. Check wallet balances on Tempo Explorer
4. Review REAGENT_DEPLOYMENT_GUIDE.md for detailed instructions

## Security Checklist

Before proceeding to Phase 3:

- [ ] Admin private key stored securely (cold storage recommended)
- [ ] Platform wallet private key encrypted in database
- [ ] .env file NOT committed to git (check .gitignore)
- [ ] Token verified on Tempo Explorer
- [ ] Supply cap confirmed (400M REAGENT)
- [ ] ISSUER_ROLE granted only to platform wallet
- [ ] Test mint successful

## Next Steps

After Phase 0 is complete:

1. ✅ Mark all Phase 0 tasks as complete in tasks.md
2. ✅ Verify REAGENT_TOKEN_ADDRESS is in .env
3. ✅ Proceed to Phase 3: Frontend UI and Agent Integration
4. ✅ Test integration with minting engine

## Important Notes

⚠️ **CRITICAL SECURITY**:
- Never commit private keys to version control
- Keep admin wallet in cold storage
- Encrypt platform wallet private key in database
- Use strong WALLET_ENCRYPTION_KEY

⚠️ **SUPPLY CAP**:
- Supply cap is 400M REAGENT (cannot be exceeded)
- 50% (200M) allocated for minting operations
- 20,000 max minting operations possible

⚠️ **DECIMALS**:
- REAGENT uses 6 decimals (TIP-20 standard)
- Always use `parseUnits(amount, 6)` for amounts
- Never use 18 decimals (ERC-20 default)

## Reference

- **Deployment Script**: `scripts/deploy-reagent-token.ts`
- **Verification Script**: `scripts/verify-reagent-roles.ts`
- **Test Script**: `scripts/test-reagent-mint.ts`
- **Detailed Guide**: `REAGENT_DEPLOYMENT_GUIDE.md`
- **Tempo Docs**: https://docs.tempo.xyz
- **Tempo Explorer**: https://explorer.tempo.xyz

---

**Status**: Ready for deployment
**Last Updated**: 2024-01-15
