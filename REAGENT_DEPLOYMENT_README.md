# 🚀 REAGENT Token - Mainnet Deployment Guide

**Status:** ✅ Ready for Production Deployment  
**Network:** Tempo Mainnet (Chain ID: 4217)  
**Method:** Automated via Tempo CLI  
**Safety:** Multiple confirmations + pre-flight checks

---

## 📚 Documentation Index

### Quick Start
- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - 5-step quick deployment guide ⚡
- **[DEPLOYMENT_CHECKLIST_INTERACTIVE.md](./DEPLOYMENT_CHECKLIST_INTERACTIVE.md)** - Interactive checklist ✅

### Comprehensive Guides
- **[PRODUCTION_DEPLOYMENT_READY.md](./PRODUCTION_DEPLOYMENT_READY.md)** - Complete deployment guide 📖
- **[PHASE0_PRODUCTION_SUMMARY.md](./PHASE0_PRODUCTION_SUMMARY.md)** - Phase 0 summary 📊
- **[PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist 📋

### Technical Documentation
- **[TEMPO_CLI_DEPLOYMENT.md](./TEMPO_CLI_DEPLOYMENT.md)** - Tempo CLI integration 🔧
- **[DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)** - Troubleshooting guide 🔍
- **[TEMPO_INTEGRATION_NOTES.md](./TEMPO_INTEGRATION_NOTES.md)** - Tempo Network integration 📝

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Update .env (2 variables)
# - QUOTE_TOKEN_ADDRESS="0x..."
# - WALLET_ENCRYPTION_KEY="..." (32 chars)

# 2. Install Tempo CLI
curl -L https://tempo.xyz/install | bash

# 3. Login
tempo wallet login

# 4. Fund wallet (~0.05 ETH equivalent)
tempo wallet address  # Get address
tempo wallet balances # Check balance

# 5. Deploy to mainnet
npm run reagent:deploy:production
```

**Estimated Time:** 15-30 minutes  
**Estimated Cost:** ~0.012-0.06 ETH equivalent in gas

---

## 📋 What You Need

### Prerequisites
1. **Quote Token Address**
   - Get from: https://explorer.tempo.xyz
   - Search: "USDT" or "USDC" or "PATHUSD"
   - Copy mainnet contract address

2. **Encryption Key**
   - Generate 32 random characters
   - PowerShell: `-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})`

3. **Tempo CLI**
   - Install: `curl -L https://tempo.xyz/install | bash`
   - Login: `tempo wallet login`

4. **Wallet Funding**
   - ~0.05 ETH equivalent in stablecoins
   - For gas fees

---

## 🚀 Deployment Process

### Step 1: Configuration (5 min)

Edit `.env` file:
```bash
QUOTE_TOKEN_ADDRESS="0x..."  # Mainnet stablecoin address
WALLET_ENCRYPTION_KEY="..."  # 32 random characters
```

### Step 2: Setup Tempo CLI (5 min)

```bash
# Install
curl -L https://tempo.xyz/install | bash

# Login (opens browser)
tempo wallet login

# Verify
tempo wallet address
tempo wallet balances
```

### Step 3: Fund Wallet (5-10 min)

```bash
# Get wallet address
tempo wallet address

# Transfer stablecoins to this address
# Wait for confirmation

# Verify balance
tempo wallet balances
```

### Step 4: Deploy (5-10 min)

```bash
# Run production deployment
npm run reagent:deploy:production
```

The script will:
1. ✅ Run pre-flight checks
2. ⚠️ Ask for confirmation (type "yes")
3. 📋 Show deployment config
4. ⚠️ Ask final confirmation (type "DEPLOY TO MAINNET")
5. 🚀 Deploy REAGENT token
6. 🔐 Grant ISSUER_ROLE
7. 📊 Set supply cap (400M)
8. 💾 Save deployment info
9. 📝 Update .env

### Step 5: Verification (5 min)

```bash
# Verify deployment
npm run reagent:verify

# Test minting
npm run reagent:test

# Check Explorer
# Link provided in deployment output
```

---

## 📊 Expected Output

After successful deployment:

```
🎉 PRODUCTION DEPLOYMENT SUCCESSFUL
======================================================================
Network:              Tempo Mainnet
Chain ID:             4217
Token Address:        0x...
Admin Address:        0x...
Platform Wallet:      0x...
Quote Token:          0x...
Explorer:             https://explorer.tempo.xyz/address/0x...
======================================================================

📝 Next Steps:
   1. Verify token on Tempo Explorer
   2. Test minting functionality
   3. Monitor token contract
   4. Announce to team
   5. Proceed to Phase 3
======================================================================
```

---

## 🔒 Safety Features

### Pre-Flight Checks
- ✅ Tempo CLI installed
- ✅ Wallet logged in
- ✅ Sufficient balance
- ✅ Environment variables set
- ✅ Mainnet configuration verified

### Confirmation Prompts
- ⚠️ Initial mainnet warning
- ⚠️ Configuration review
- ⚠️ Final confirmation (requires exact text)

### Automatic Verification
- ✅ Token contract verification
- ✅ Role assignment verification
- ✅ Supply cap verification
- ✅ Deployment info backup

---

## 📁 Files & Scripts

### Deployment Scripts
- `scripts/deploy-production.ts` - Production deployment
- `scripts/verify-reagent-roles.ts` - Verification
- `scripts/test-reagent-mint.ts` - Minting test
- `scripts/deploy-with-tempo-cli.ts` - Tempo CLI integration

### NPM Commands
```bash
npm run reagent:deploy:production  # Deploy to mainnet
npm run reagent:verify             # Verify deployment
npm run reagent:test               # Test minting
npm run tempo:setup                # Setup Tempo CLI (Windows)
npm run tempo:setup:linux          # Setup Tempo CLI (Linux/Mac)
```

### Configuration Files
- `.env` - Environment configuration
- `.env.example` - Example configuration
- `scripts/tsconfig.json` - TypeScript config

### Documentation
- `PRODUCTION_DEPLOYMENT_READY.md` - Full guide
- `DEPLOY_NOW.md` - Quick guide
- `DEPLOYMENT_CHECKLIST_INTERACTIVE.md` - Checklist
- `DEPLOYMENT_TROUBLESHOOTING.md` - Troubleshooting
- `PHASE0_PRODUCTION_SUMMARY.md` - Summary

---

## 🆘 Troubleshooting

### Common Issues

**"Tempo CLI not installed"**
```bash
curl -L https://tempo.xyz/install | bash
source ~/.bashrc
```

**"Not logged in"**
```bash
tempo wallet login
```

**"Insufficient balance"**
```bash
tempo wallet balances
# Fund wallet with stablecoins
```

**"Invalid QUOTE_TOKEN_ADDRESS"**
- Verify address on Tempo Explorer
- Must be mainnet address (not testnet)
- Must start with 0x

**More issues?** See [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)

---

## 📞 Support & Resources

### Documentation
- **Tempo Docs**: https://docs.tempo.xyz
- **Tempo Explorer**: https://explorer.tempo.xyz
- **TIP-20 Spec**: https://docs.tempo.xyz/tip-20

### Project Documentation
- Full deployment guide: `PRODUCTION_DEPLOYMENT_READY.md`
- Troubleshooting: `DEPLOYMENT_TROUBLESHOOTING.md`
- Phase 0 summary: `PHASE0_PRODUCTION_SUMMARY.md`

### Getting Help
1. Check troubleshooting guide
2. Verify transaction on Explorer
3. Review deployment logs
4. Contact Tempo support if needed

---

## ⚠️ Important Reminders

### Before Deployment
- ✅ This is MAINNET - real tokens, irreversible actions
- ✅ Test on testnet first (recommended but optional)
- ✅ Backup all configuration
- ✅ Have sufficient gas funds
- ✅ Verify all addresses

### After Deployment
- ✅ Verify on Explorer immediately
- ✅ Test minting functionality
- ✅ Backup deployment info
- ✅ Monitor for 24 hours
- ✅ Update team documentation

### Security
- ✅ Never share private keys
- ✅ Keep encryption key secure
- ✅ Don't commit sensitive data to git
- ✅ Use Tempo CLI for wallet management
- ✅ Verify all transactions on Explorer

---

## 🎯 Deployment Checklist

- [ ] Read documentation
- [ ] Update `.env` (QUOTE_TOKEN_ADDRESS, WALLET_ENCRYPTION_KEY)
- [ ] Install Tempo CLI
- [ ] Login to Tempo Wallet
- [ ] Fund wallet with gas
- [ ] Run `npm run reagent:deploy:production`
- [ ] Verify on Explorer
- [ ] Test minting
- [ ] Backup deployment info
- [ ] Update team
- [ ] Proceed to Phase 3

---

## 📈 What's Next

After successful deployment:

1. **Phase 3: Trading System**
   - Implement order book
   - Add trading endpoints
   - Build trading UI

2. **Phase 4: Agent Integration**
   - Connect Hermes agents
   - Implement auto-mining
   - Add agent rewards

3. **Phase 5: Frontend**
   - Build mining dashboard
   - Add wallet management UI
   - Implement trading interface

---

## 🎉 Ready to Deploy?

1. **Quick Start**: Read [DEPLOY_NOW.md](./DEPLOY_NOW.md)
2. **Full Guide**: Read [PRODUCTION_DEPLOYMENT_READY.md](./PRODUCTION_DEPLOYMENT_READY.md)
3. **Checklist**: Use [DEPLOYMENT_CHECKLIST_INTERACTIVE.md](./DEPLOYMENT_CHECKLIST_INTERACTIVE.md)

**Command to deploy:**
```bash
npm run reagent:deploy:production
```

---

**Version:** Phase 0 - Production Ready  
**Last Updated:** 2024  
**Status:** ✅ Ready for Mainnet Deployment

⚠️ **FINAL WARNING**: This will deploy to MAINNET with REAL tokens. Make sure you're ready!
