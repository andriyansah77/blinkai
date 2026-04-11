# 🚀 Deploy REAGENT Token to Mainnet - Quick Guide

## ⚡ Quick Start (5 Steps)

### 1️⃣ Update .env (2 variables)

```bash
# Edit .env file
QUOTE_TOKEN_ADDRESS="0x..."  # Get from Tempo Explorer
WALLET_ENCRYPTION_KEY="..."  # Generate 32 random chars
```

**Get Quote Token:**
- Visit: https://explorer.tempo.xyz
- Search: "USDT" or "USDC" or "PATHUSD"
- Copy address

**Generate Key:**
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 2️⃣ Install Tempo CLI

```bash
curl -L https://tempo.xyz/install | bash
tempo --version
```

### 3️⃣ Login to Tempo

```bash
tempo wallet login
tempo wallet address
```

### 4️⃣ Fund Wallet

```bash
# Get address
tempo wallet address

# Transfer ~0.05 ETH equivalent in stablecoins
# Check balance
tempo wallet balances
```

### 5️⃣ Deploy!

```bash
npm run reagent:deploy:production
```

---

## ✅ What Happens

1. Pre-flight checks (CLI, wallet, balance, config)
2. Confirmation prompt (type "yes")
3. Show config
4. Final confirmation (type "DEPLOY TO MAINNET")
5. Deploy REAGENT token
6. Grant ISSUER_ROLE
7. Set supply cap (400M)
8. Save deployment info
9. Update .env

---

## 📊 After Deployment

```bash
# Verify on Explorer
# Link will be shown in output

# Test minting
npm run reagent:test

# Check deployment info
cat REAGENT_MAINNET_DEPLOYMENT.json
```

---

## 🆘 Troubleshooting

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
- Check address starts with 0x
- Verify on Tempo Explorer
- Must be mainnet address

---

## 📁 Documentation

- **Full Guide**: `PRODUCTION_DEPLOYMENT_READY.md`
- **Checklist**: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- **Summary**: `PHASE0_PRODUCTION_SUMMARY.md`

---

## ⚠️ Safety

- ✅ Multiple confirmation prompts
- ✅ Pre-flight checks
- ✅ Mainnet verification
- ✅ Deployment backup
- ✅ Error handling

---

**Ready?** Run: `npm run reagent:deploy:production`

**Questions?** Read: `PRODUCTION_DEPLOYMENT_READY.md`
