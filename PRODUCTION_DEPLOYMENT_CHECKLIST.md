# Production Deployment Checklist - REAGENT Token

## ⚠️ CRITICAL: Pre-Deployment Checklist

Before deploying to **Tempo Mainnet**, ensure ALL items are checked:

### 1. Environment Configuration

- [ ] **TEMPO_RPC_URL** set to mainnet: `https://rpc.tempo.xyz`
- [ ] **TEMPO_CHAIN_ID** set to mainnet: `4217`
- [ ] **WALLET_ENCRYPTION_KEY** changed from default (32+ characters)
- [ ] **QUOTE_TOKEN_ADDRESS** verified (mainnet USD stablecoin)
- [ ] All sensitive data NOT committed to git

### 2. Tempo Wallet Setup

- [ ] Tempo CLI installed: `tempo --version`
- [ ] Logged in to Tempo Wallet: `tempo wallet login`
- [ ] Wallet address obtained: `tempo wallet address`
- [ ] Wallet funded with **REAL** tokens for gas
- [ ] Sufficient balance verified: `tempo wallet balances`

### 3. Token Economics Verification

- [ ] Token Name: "ReAgent Token"
- [ ] Token Symbol: "REAGENT"
- [ ] Decimals: 6 (TIP-20 standard)
- [ ] Total Supply Cap: 400,000,000 REAGENT
- [ ] Minting Allocation: 200,000,000 REAGENT (50%)
- [ ] Tokens per Mint: 10,000 REAGENT

### 4. Security Verification

- [ ] Quote token address verified on Tempo Explorer
- [ ] Admin wallet secured (will be Tempo wallet)
- [ ] Platform wallet address decided
- [ ] Backup plan for wallet recovery
- [ ] Multi-sig considered for admin operations

### 5. Testing Completed

- [ ] Tested on Tempo Testnet first
- [ ] All scripts compile without errors
- [ ] Deployment flow tested end-to-end
- [ ] Verification script tested
- [ ] Minting test successful on testnet

### 6. Documentation Ready

- [ ] Deployment info will be saved
- [ ] Token address will be recorded
- [ ] Explorer link will be documented
- [ ] Team notified of deployment

### 7. Post-Deployment Plan

- [ ] Verify token on Tempo Explorer
- [ ] Test minting functionality
- [ ] Grant ISSUER_ROLE to platform wallet
- [ ] Update .env with token address
- [ ] Announce deployment to team
- [ ] Monitor for 24 hours

## 🚀 Deployment Commands

### Step 1: Final Environment Check

```bash
# Verify mainnet configuration
cat .env | grep TEMPO_RPC_URL
cat .env | grep TEMPO_CHAIN_ID
cat .env | grep QUOTE_TOKEN_ADDRESS
```

Expected output:
```
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"
QUOTE_TOKEN_ADDRESS="0x..." (valid mainnet address)
```

### Step 2: Verify Tempo Wallet

```bash
# Check Tempo CLI
tempo --version

# Check login status
tempo wallet status

# Get wallet address
tempo wallet address

# Check balance (MUST have sufficient gas)
tempo wallet balances
```

### Step 3: Deploy to Mainnet

```bash
# Deploy REAGENT token
npm run reagent:deploy:tempo
```

### Step 4: Verify Deployment

```bash
# Verify roles and configuration
npm run reagent:verify
```

### Step 5: Test Minting

```bash
# Test minting functionality
npm run reagent:test
```

## ⚠️ Important Notes

### Gas Costs

Estimated gas costs for deployment:
- Deploy token: ~0.01-0.05 ETH equivalent
- Grant ISSUER_ROLE: ~0.001-0.005 ETH equivalent
- Set supply cap: ~0.001-0.005 ETH equivalent
- **Total**: ~0.012-0.06 ETH equivalent in stablecoins

### Irreversible Actions

Once deployed to mainnet:
- ❌ Cannot change token name or symbol
- ❌ Cannot change decimals
- ❌ Cannot change total supply cap (once set)
- ✅ Can grant/revoke roles
- ✅ Can pause/unpause (if needed)

### Emergency Procedures

If something goes wrong:
1. **DO NOT PANIC**
2. Document the error
3. Check transaction on Explorer
4. Contact Tempo support if needed
5. Have rollback plan ready

## 📋 Post-Deployment Checklist

After successful deployment:

- [ ] Token address recorded in `REAGENT_DEPLOYMENT.json`
- [ ] Token verified on Tempo Explorer
- [ ] REAGENT_TOKEN_ADDRESS updated in .env
- [ ] ISSUER_ROLE granted to platform wallet
- [ ] Supply cap verified (400M REAGENT)
- [ ] Test mint successful
- [ ] Team notified
- [ ] Documentation updated
- [ ] Monitoring set up
- [ ] Backup of deployment info created

## 🔒 Security Reminders

### DO:
✅ Use Tempo CLI for secure wallet management
✅ Verify all addresses before deployment
✅ Test on testnet first
✅ Keep deployment info backed up
✅ Monitor token contract after deployment

### DON'T:
❌ Deploy without testing on testnet
❌ Share private keys or wallet access
❌ Deploy with insufficient gas
❌ Skip verification steps
❌ Ignore error messages

## 📞 Support

If you need help:
- **Tempo Docs**: https://docs.tempo.xyz
- **Tempo Discord**: Check docs for invite
- **Tempo Explorer**: https://explorer.tempo.xyz
- **Emergency**: Document everything and seek help

---

**Network**: Tempo Mainnet
**Chain ID**: 4217
**Deployment Method**: Tempo CLI
**Status**: Ready for Production Deployment

⚠️ **FINAL WARNING**: This will deploy to MAINNET with REAL tokens. Double-check everything!
