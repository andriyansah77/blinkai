# 🚀 REAGENT Token - Production Deployment Ready

## Status: ✅ READY FOR MAINNET DEPLOYMENT

Script production deployment sudah siap dan terintegrasi dengan Tempo CLI untuk deployment otomatis ke mainnet.

---

## 📋 Pre-Deployment Requirements

### 1. Update Environment Variables

Sebelum deployment, update file `.env` dengan nilai berikut:

```bash
# ─── Mining Feature (Tempo Network) ───────────────────────────────────────────
# Tempo Network RPC endpoint (mainnet) - SUDAH BENAR ✅
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"

# Quote Token Address - HARUS DIISI ❌
# Ini adalah address stablecoin USD di Tempo mainnet (contoh: USDT, USDC, atau PATHUSD)
QUOTE_TOKEN_ADDRESS="0x..." # TODO: Ganti dengan address stablecoin mainnet

# Wallet encryption key - HARUS DIGANTI ❌
# Generate random 32 karakter untuk production
WALLET_ENCRYPTION_KEY="change-this-to-a-secure-32-char-key-in-production"

# Platform Wallet (opsional, default ke Tempo wallet)
PLATFORM_WALLET_ADDRESS="" # Kosongkan untuk menggunakan Tempo wallet
```

### 2. Generate Secure Encryption Key

Gunakan salah satu cara berikut untuk generate encryption key:

**Option A: PowerShell (Windows)**
```powershell
# Generate random 32 karakter
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option B: Node.js**
```javascript
// Jalankan di Node.js console
require('crypto').randomBytes(32).toString('hex').substring(0, 32)
```

**Option C: Online Generator**
- Kunjungi: https://www.random.org/strings/
- Length: 32
- Characters: Alphanumeric

Copy hasil generate dan update `WALLET_ENCRYPTION_KEY` di `.env`

### 3. Get Quote Token Address

Quote token adalah stablecoin USD yang digunakan untuk pricing. Pilih salah satu:

**Option A: PATHUSD (Tempo Native Stablecoin)**
- Cek dokumentasi Tempo untuk address PATHUSD di mainnet
- Atau deploy sendiri jika belum ada

**Option B: USDT/USDC**
- Cek Tempo Explorer untuk address USDT atau USDC di mainnet
- Pastikan token sudah ter-deploy dan liquid

**Cara mendapatkan address:**
1. Kunjungi: https://explorer.tempo.xyz
2. Search untuk "USDT" atau "USDC" atau "PATHUSD"
3. Copy contract address
4. Update `QUOTE_TOKEN_ADDRESS` di `.env`

---

## 🔧 Installation & Setup

### Step 1: Install Tempo CLI

```bash
# Install Tempo CLI
curl -L https://tempo.xyz/install | bash

# Verify installation
tempo --version
```

### Step 2: Login to Tempo Wallet

```bash
# Login (akan membuka browser)
tempo wallet login

# Verify login
tempo wallet status

# Get wallet address
tempo wallet address
```

### Step 3: Fund Wallet with Gas

Wallet Tempo perlu diisi dengan token untuk gas fees:

**Estimated Gas Costs:**
- Deploy token: ~0.01-0.05 ETH equivalent
- Grant ISSUER_ROLE: ~0.001-0.005 ETH equivalent
- Set supply cap: ~0.001-0.005 ETH equivalent
- **Total**: ~0.012-0.06 ETH equivalent

**Cara funding:**
1. Get wallet address: `tempo wallet address`
2. Transfer stablecoin ke address tersebut
3. Verify balance: `tempo wallet balances`

---

## 🚀 Deployment Process

### Pre-Flight Checklist

Sebelum deploy, pastikan semua ini sudah dilakukan:

- [ ] `.env` updated dengan `QUOTE_TOKEN_ADDRESS`
- [ ] `.env` updated dengan `WALLET_ENCRYPTION_KEY` yang secure
- [ ] Tempo CLI installed dan logged in
- [ ] Wallet funded dengan sufficient gas
- [ ] Tested on testnet (opsional tapi recommended)

### Deploy to Mainnet

```bash
# Run production deployment script
npm run reagent:deploy:production
```

Script akan:
1. ✅ Menjalankan pre-flight checks
2. ⚠️ Meminta konfirmasi deployment ke mainnet
3. 🚀 Deploy REAGENT token via TIP20Factory
4. 🔐 Grant ISSUER_ROLE ke platform wallet
5. 📊 Set supply cap (400M REAGENT)
6. 💾 Save deployment info
7. 📝 Update .env dengan token address

### Safety Features

Script production memiliki multiple safety checks:

1. **Pre-flight Checks:**
   - Tempo CLI installed
   - Wallet logged in
   - Sufficient balance
   - Environment variables set
   - Mainnet configuration verified

2. **Confirmation Prompts:**
   - Initial warning about mainnet deployment
   - Final confirmation requiring exact text input

3. **Verification:**
   - Token contract verification
   - Role assignment verification
   - Supply cap verification

---

## 📊 Post-Deployment

### Verify Deployment

Setelah deployment berhasil, script akan output:

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
```

### Next Steps

1. **Verify on Explorer**
   - Kunjungi link Explorer yang diberikan
   - Pastikan token details benar (name, symbol, decimals)

2. **Test Minting**
   ```bash
   npm run reagent:test
   ```

3. **Update Documentation**
   - Token address sudah otomatis update di `.env`
   - Deployment info tersimpan di `REAGENT_MAINNET_DEPLOYMENT.json`

4. **Proceed to Phase 3**
   - Setelah token deployed dan verified
   - Lanjut implement trading system (Phase 3)

---

## 🔒 Security Notes

### DO:
✅ Backup deployment info (`REAGENT_MAINNET_DEPLOYMENT.json`)
✅ Keep encryption key secure
✅ Monitor token contract after deployment
✅ Test minting before announcing

### DON'T:
❌ Share wallet private keys
❌ Commit sensitive data to git
❌ Deploy without sufficient gas
❌ Skip verification steps

---

## 🆘 Troubleshooting

### Issue: "Tempo CLI not installed"
```bash
curl -L https://tempo.xyz/install | bash
source ~/.bashrc  # or restart terminal
```

### Issue: "Not logged in to Tempo Wallet"
```bash
tempo wallet login
```

### Issue: "Insufficient balance"
```bash
# Check balance
tempo wallet balances

# Fund wallet dengan stablecoin
# Transfer ke address dari: tempo wallet address
```

### Issue: "Invalid QUOTE_TOKEN_ADDRESS"
- Pastikan address valid (starts with 0x)
- Pastikan address adalah mainnet address
- Verify di Tempo Explorer

### Issue: "WALLET_ENCRYPTION_KEY is still default"
- Generate new key (lihat section "Generate Secure Encryption Key")
- Update di `.env`

---

## 📞 Support

- **Tempo Docs**: https://docs.tempo.xyz
- **Tempo Explorer**: https://explorer.tempo.xyz
- **Tempo Discord**: Check docs for invite link

---

## 🎯 Quick Start Commands

```bash
# 1. Install Tempo CLI
curl -L https://tempo.xyz/install | bash

# 2. Login
tempo wallet login

# 3. Check balance
tempo wallet balances

# 4. Deploy to mainnet
npm run reagent:deploy:production
```

---

**Status**: ✅ Ready for Production Deployment
**Network**: Tempo Mainnet (Chain ID: 4217)
**Method**: Automated via Tempo CLI
**Safety**: Multiple confirmation prompts + pre-flight checks

⚠️ **IMPORTANT**: Ini akan deploy ke MAINNET dengan REAL tokens. Pastikan semua sudah dicek!
