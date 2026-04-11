# 🚀 REAGENT Token Deployment - START HERE

## ✅ Status: Production Ready

Semua script dan dokumentasi untuk deploy REAGENT token ke Tempo mainnet sudah siap.

---

## 🎯 Quick Start (4 Steps)

### 1. Update .env (2 variables)

```bash
QUOTE_TOKEN_ADDRESS="0x..."  # Get from explorer.tempo.xyz
WALLET_ENCRYPTION_KEY="..."  # Generate 32 chars
```

### 2. Install Tempo CLI

```bash
curl -L https://tempo.xyz/install | bash
tempo wallet login
```

### 3. Fund Wallet

```bash
tempo wallet address  # Get address
# Transfer ~0.05 ETH equivalent
tempo wallet balances # Verify
```

### 4. Deploy!

```bash
npm run reagent:deploy:production
```

---

## 📚 Documentation

**Quick Guides:**
- `DEPLOY_NOW.md` - 5-step guide
- `DEPLOYMENT_CHECKLIST_INTERACTIVE.md` - Checklist

**Full Guides:**
- `REAGENT_DEPLOYMENT_README.md` - Main guide
- `PRODUCTION_DEPLOYMENT_READY.md` - Complete guide
- `DEPLOYMENT_TROUBLESHOOTING.md` - Troubleshooting

**Summaries:**
- `PHASE0_COMPLETE_PRODUCTION_READY.md` - Overview
- `PHASE0_PRODUCTION_SUMMARY.md` - Summary

---

## ⚡ Commands

```bash
# Deploy to mainnet
npm run reagent:deploy:production

# Verify deployment
npm run reagent:verify

# Test minting
npm run reagent:test
```

---

## ⚠️ Important

- This deploys to MAINNET (real tokens)
- Actions are IRREVERSIBLE
- Estimated cost: ~0.012-0.06 ETH equivalent
- Estimated time: 30-45 minutes

---

## 🆘 Need Help?

1. Read: `REAGENT_DEPLOYMENT_README.md`
2. Quick: `DEPLOY_NOW.md`
3. Issues: `DEPLOYMENT_TROUBLESHOOTING.md`

---

**Ready?** → `DEPLOY_NOW.md`

**Want details?** → `REAGENT_DEPLOYMENT_README.md`

**Need checklist?** → `DEPLOYMENT_CHECKLIST_INTERACTIVE.md`
