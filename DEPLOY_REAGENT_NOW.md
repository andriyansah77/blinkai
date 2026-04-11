# 🚀 Deploy REAGENT Token - Ready to Go!

## ✅ Status: Configuration Complete

Semua konfigurasi sudah siap! Tinggal install Tempo CLI dan deploy.

---

## 📊 Current Configuration

### ✅ Environment Variables (All Set!)

```bash
# Network Configuration
TEMPO_RPC_URL="https://rpc.tempo.xyz"          ✅ Mainnet
TEMPO_CHAIN_ID="4217"                          ✅ Correct Chain ID

# Quote Token (pathUSD - Tempo native stablecoin)
QUOTE_TOKEN_ADDRESS="0x20c0000000000000000000000000000000000000"  ✅ Valid

# Wallet Encryption
WALLET_ENCRYPTION_KEY="bDVCAHTKiBpd4EnsLqtlh7QyvXNfOGM9"  ✅ Secure (32 chars)
```

**pathUSD Info:**
- Address: `0x20c0000000000000000000000000000000000000`
- Type: TIP-20 stablecoin (Tempo native)
- Price: $1.00 USD
- Usage: Quote token for DEX, fallback gas token
- Source: [GeckoTerminal](https://www.geckoterminal.com/tempo/tokens/0x20c0000000000000000000000000000000000000)

---

## 🎯 Next Steps (3 Steps Only!)

### Step 1: Install Tempo CLI (5 min)

**Windows (PowerShell as Administrator):**
```powershell
# Download installer
Invoke-WebRequest -Uri "https://tempo.xyz/install.ps1" -OutFile "$env:TEMP\tempo-install.ps1"

# Run installer
& "$env:TEMP\tempo-install.ps1"

# Verify installation
tempo --version
```

**Alternative (if above fails):**
```bash
# Using WSL or Git Bash
curl -L https://tempo.xyz/install | bash

# Reload shell
source ~/.bashrc

# Verify
tempo --version
```

### Step 2: Login to Tempo Wallet (5 min)

```bash
# Login (will open browser)
tempo wallet login

# Verify login
tempo wallet status

# Get wallet address
tempo wallet address

# Check balance
tempo wallet balances
```

**Important:** Wallet needs balance for gas fees (~0.05 ETH equivalent in stablecoins)

### Step 3: Deploy REAGENT Token (5 min)

```bash
# Navigate to project directory
cd C:\Users\Administrator\Downloads\project\project\blinkai

# Deploy to mainnet
npm run reagent:deploy:production
```

---

## 📋 Deployment Flow

```
START
  ↓
[Install Tempo CLI] → 5 minutes
  ↓
[Login to Tempo Wallet] → 5 minutes (browser opens)
  ↓
[Fund Wallet] → Transfer stablecoins for gas
  ↓
[Run Deploy Command] → npm run reagent:deploy:production
  ↓
  ├─ Pre-flight checks ✅
  ├─ Confirmation #1: Type "yes"
  ├─ Show configuration
  ├─ Confirmation #2: Type "DEPLOY TO MAINNET"
  ├─ Deploy REAGENT token via TIP20Factory
  ├─ Grant ISSUER_ROLE to platform wallet
  ├─ Set supply cap (400M REAGENT)
  ├─ Save deployment info
  └─ Update .env with token address
  ↓
SUCCESS → Token deployed to mainnet! 🎉
```

---

## 💰 Gas Costs Estimate

**Total estimated cost:** ~0.012-0.06 ETH equivalent

Breakdown:
- Deploy token: ~0.01-0.05 ETH
- Grant ISSUER_ROLE: ~0.001-0.005 ETH
- Set supply cap: ~0.001-0.005 ETH

**Recommended wallet balance:** 0.1 ETH equivalent (safety margin)

---

## 🔍 What Will Happen

### Pre-Flight Checks
Script will automatically verify:
- ✅ Tempo CLI installed
- ✅ Wallet logged in
- ✅ Sufficient balance
- ✅ Environment variables set
- ✅ Mainnet configuration

### Deployment Process
1. **Deploy Token**
   - Name: "ReAgent Token"
   - Symbol: "REAGENT"
   - Decimals: 6 (TIP-20 standard)
   - Quote Token: pathUSD
   - Admin: Your Tempo wallet

2. **Grant ISSUER_ROLE**
   - Platform wallet receives minting permission
   - Required for token minting operations

3. **Set Supply Cap**
   - Maximum supply: 400,000,000 REAGENT
   - Prevents unlimited minting

4. **Save Deployment Info**
   - Token address saved to `REAGENT_MAINNET_DEPLOYMENT.json`
   - `.env` updated with `REAGENT_TOKEN_ADDRESS`

---

## 📊 Expected Output

```
🚀 REAGENT Token Production Deployment

⚠️  WARNING: Deploying to TEMPO MAINNET with REAL tokens!

📋 Running pre-flight checks...

   Tempo CLI installed... ✅
   Tempo Wallet logged in... ✅
   Wallet has sufficient balance... ✅
   Environment variables set... ✅
   Mainnet configuration... ✅

✅ All pre-flight checks passed

⚠️  Are you SURE you want to deploy to MAINNET? (yes/no): yes

📋 Deployment Configuration:
   Network: Tempo Mainnet
   Chain ID: 4217
   RPC: https://rpc.tempo.xyz
   Admin Wallet: 0x...
   Platform Wallet: 0x...
   Quote Token: 0x20c0000000000000000000000000000000000000

⚠️  FINAL CONFIRMATION
   This will deploy REAGENT token to MAINNET
   This action is IRREVERSIBLE
   Real tokens will be used for gas fees

Type "DEPLOY TO MAINNET" to continue: DEPLOY TO MAINNET

🚀 Starting deployment...

   Preparing deployment transaction...
   Sending transaction to Tempo Mainnet...
   Transaction hash: 0x...
   Waiting for confirmation...
   ✓ Confirmed in block 12345

   ✅ REAGENT Token deployed: 0x...

✅ Verifying deployment...
   Name: ReAgent Token
   Symbol: REAGENT
   Decimals: 6
   ✓ Token verified

🔐 Granting ISSUER_ROLE...
   Granting ISSUER_ROLE to 0x...
   Transaction hash: 0x...
   ✓ ISSUER_ROLE granted

📊 Setting supply cap...
   Setting supply cap to 400M REAGENT...
   Transaction hash: 0x...
   ✓ Supply cap set

💾 Saving deployment information...
   ✓ Saved to REAGENT_MAINNET_DEPLOYMENT.json
   ✓ .env updated

======================================================================
🎉 PRODUCTION DEPLOYMENT SUCCESSFUL
======================================================================
Network:              Tempo Mainnet
Chain ID:             4217
Token Address:        0x...
Admin Address:        0x...
Platform Wallet:      0x...
Quote Token:          0x20c0000000000000000000000000000000000000
Explorer:             https://explore.tempo.xyz/address/0x...
======================================================================

📝 Next Steps:
   1. Verify token on Tempo Explorer
   2. Test minting functionality
   3. Monitor token contract
   4. Announce to team
   5. Proceed to Phase 3
======================================================================

✅ Production deployment completed successfully!

⚠️  IMPORTANT: Verify token on Tempo Explorer immediately!
   https://explore.tempo.xyz/address/0x...
```

---

## 🆘 Troubleshooting

### Issue: "tempo: command not found"
```bash
# Reload shell
source ~/.bashrc

# Or restart PowerShell/Terminal
```

### Issue: "Not logged in to Tempo Wallet"
```bash
tempo wallet login
```

### Issue: "Insufficient balance"
```bash
# Get wallet address
tempo wallet address

# Transfer stablecoins to this address
# Check balance
tempo wallet balances
```

### Issue: Deployment fails
1. Check error message
2. Verify transaction on Explorer
3. Check `DEPLOYMENT_TROUBLESHOOTING.md`
4. Retry if safe to do so

---

## 📞 Quick Commands

```bash
# Check Tempo CLI
tempo --version

# Check wallet status
tempo wallet status
tempo wallet address
tempo wallet balances

# Deploy token
npm run reagent:deploy:production

# Verify deployment
npm run reagent:verify

# Test minting
npm run reagent:test
```

---

## ✅ Configuration Summary

| Item | Status | Value |
|------|--------|-------|
| RPC URL | ✅ Set | https://rpc.tempo.xyz |
| Chain ID | ✅ Correct | 4217 |
| Quote Token | ✅ Valid | pathUSD (0x20c0...) |
| Encryption Key | ✅ Secure | 32 characters |
| Tempo CLI | ⏳ Pending | Need to install |
| Wallet Login | ⏳ Pending | Need to login |
| Wallet Balance | ⏳ Pending | Need to fund |

---

## 🎯 Ready to Deploy!

**All configuration is complete. You just need to:**

1. Install Tempo CLI (5 min)
2. Login and fund wallet (10 min)
3. Run deployment command (5 min)

**Total time:** ~20 minutes

**Command to deploy:**
```bash
npm run reagent:deploy:production
```

---

**Status:** ✅ Configuration Complete - Ready for Deployment
**Network:** Tempo Mainnet (Chain ID: 4217)
**Quote Token:** pathUSD (verified)
**Next:** Install Tempo CLI and deploy!

🚀 Let's deploy REAGENT token to mainnet!
