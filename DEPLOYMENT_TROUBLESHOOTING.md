# 🔧 REAGENT Token Deployment - Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah saat deployment REAGENT token ke Tempo mainnet.

---

## 🚨 Common Issues & Solutions

### 1. Tempo CLI Issues

#### ❌ "tempo: command not found"

**Cause:** Tempo CLI belum terinstall atau PATH belum diupdate

**Solution:**
```bash
# Install Tempo CLI
curl -L https://tempo.xyz/install | bash

# Reload shell configuration
source ~/.bashrc  # Linux/Mac
# atau restart terminal untuk Windows

# Verify installation
tempo --version
```

#### ❌ "Not logged in to Tempo Wallet"

**Cause:** Belum login ke Tempo Wallet

**Solution:**
```bash
# Login (akan buka browser)
tempo wallet login

# Verify login
tempo wallet status

# Should show: "Logged in as: 0x..."
```

#### ❌ "Failed to connect to Tempo Wallet"

**Cause:** Browser tidak terbuka atau login gagal

**Solution:**
1. Pastikan browser default sudah diset
2. Coba login manual:
   ```bash
   tempo wallet login --manual
   ```
3. Copy URL yang muncul ke browser
4. Complete login di browser
5. Return to terminal

---

### 2. Environment Variable Issues

#### ❌ "Missing environment variables: QUOTE_TOKEN_ADDRESS"

**Cause:** `QUOTE_TOKEN_ADDRESS` belum diset di `.env`

**Solution:**
1. Kunjungi https://explorer.tempo.xyz
2. Search "USDT" atau "USDC" atau "PATHUSD"
3. Copy contract address
4. Edit `.env`:
   ```bash
   QUOTE_TOKEN_ADDRESS="0x..." # paste address here
   ```
5. Save file

#### ❌ "WALLET_ENCRYPTION_KEY is still set to default value"

**Cause:** Encryption key masih menggunakan nilai default

**Solution:**
```powershell
# Generate new key (PowerShell)
$key = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host $key
```

Copy output dan update di `.env`:
```bash
WALLET_ENCRYPTION_KEY="<paste_generated_key_here>"
```

#### ❌ "RPC URL is not mainnet"

**Cause:** `.env` masih menggunakan testnet RPC

**Solution:**
Edit `.env`:
```bash
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"
```

#### ❌ "Invalid QUOTE_TOKEN_ADDRESS"

**Cause:** Address tidak valid atau salah format

**Solution:**
1. Pastikan address starts with `0x`
2. Pastikan address length = 42 characters (0x + 40 hex chars)
3. Verify address di Tempo Explorer
4. Pastikan address adalah mainnet address (bukan testnet)

---

### 3. Wallet Balance Issues

#### ❌ "Wallet has insufficient balance for gas fees"

**Cause:** Wallet tidak punya cukup token untuk gas

**Solution:**
```bash
# Check current balance
tempo wallet balances

# Get wallet address
tempo wallet address

# Transfer stablecoins ke address tersebut
# Minimum: ~0.05 ETH equivalent

# Verify balance after transfer
tempo wallet balances
```

**Recommended amount:** 0.1 ETH equivalent untuk safety margin

#### ❌ "Transaction failed: insufficient funds"

**Cause:** Gas fees lebih tinggi dari expected

**Solution:**
1. Check balance: `tempo wallet balances`
2. Add more funds if needed
3. Wait for network congestion to decrease
4. Retry deployment

---

### 4. Deployment Transaction Issues

#### ❌ "Transaction not confirmed"

**Cause:** Transaction stuck atau network congestion

**Solution:**
1. Wait longer (up to 5 minutes)
2. Check transaction on Explorer
3. If stuck, contact Tempo support
4. DO NOT retry immediately (might create duplicate)

#### ❌ "Failed to parse transaction hash"

**Cause:** Tempo CLI output format berbeda

**Solution:**
1. Check Tempo CLI version: `tempo --version`
2. Update if needed: `curl -L https://tempo.xyz/install | bash`
3. Check terminal output for actual TX hash (starts with 0x)
4. Manually verify on Explorer

#### ❌ "TokenCreated event not found"

**Cause:** Deployment transaction failed atau event parsing error

**Solution:**
1. Check transaction on Explorer
2. Look for "TokenCreated" event in logs
3. If event exists, manually copy token address
4. Update `.env` manually:
   ```bash
   REAGENT_TOKEN_ADDRESS="0x..." # paste token address
   ```

---

### 5. Role Assignment Issues

#### ❌ "Failed to grant ISSUER_ROLE"

**Cause:** Admin wallet tidak punya permission atau transaction failed

**Solution:**
1. Verify admin wallet: `tempo wallet address`
2. Check token contract on Explorer
3. Verify admin has DEFAULT_ADMIN_ROLE
4. Retry role assignment:
   ```bash
   npm run reagent:verify
   ```

#### ❌ "Platform wallet does not have ISSUER_ROLE"

**Cause:** Role grant transaction failed

**Solution:**
1. Check transaction on Explorer
2. Manually grant role via Tempo CLI:
   ```bash
   # Get ISSUER_ROLE hash
   # 0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122
   
   # Grant role (replace addresses)
   tempo request <TOKEN_ADDRESS> --method POST --data '{
     "to": "<TOKEN_ADDRESS>",
     "data": "0x2f2ff15d114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122000000000000000000000000<PLATFORM_WALLET_ADDRESS>"
   }'
   ```

---

### 6. Supply Cap Issues

#### ❌ "Failed to set supply cap"

**Cause:** Transaction failed atau permission issue

**Solution:**
1. Verify admin wallet has permission
2. Check transaction on Explorer
3. Retry:
   ```bash
   # Manual supply cap setting
   # 400M REAGENT = 400000000 * 10^6 = 400000000000000
   ```

#### ❌ "Supply cap already set"

**Cause:** Supply cap sudah diset sebelumnya

**Solution:**
1. Check current supply cap on Explorer
2. If correct (400M), skip this step
3. If incorrect, contact Tempo support (might not be changeable)

---

### 7. TypeScript Compilation Issues

#### ❌ "Unable to compile TypeScript: BigInt literals not available"

**Cause:** TypeScript target terlalu rendah

**Solution:**
Already fixed in `scripts/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

If still error, verify script runs with:
```bash
npx ts-node --project scripts/tsconfig.json scripts/deploy-production.ts
```

#### ❌ "Property 'mint' does not exist on type 'BaseContract'"

**Cause:** TypeScript type inference issue

**Solution:**
Already fixed in code with proper type casting. If still error:
1. Check ethers version: `npm list ethers`
2. Should be v6.x
3. Update if needed: `npm install ethers@^6.16.0`

---

### 8. Network Issues

#### ❌ "Failed to connect to RPC"

**Cause:** Network connectivity atau RPC endpoint down

**Solution:**
1. Check internet connection
2. Verify RPC URL: `https://rpc.tempo.xyz`
3. Test RPC manually:
   ```bash
   curl -X POST https://rpc.tempo.xyz \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
4. If RPC down, wait or contact Tempo support

#### ❌ "Request timeout"

**Cause:** Network slow atau RPC overloaded

**Solution:**
1. Wait and retry
2. Check Tempo status page
3. Try during off-peak hours

---

### 9. Verification Issues

#### ❌ "Token verification failed"

**Cause:** Token details tidak match expected values

**Solution:**
1. Check token on Explorer
2. Verify:
   - Name: "ReAgent Token"
   - Symbol: "REAGENT"
   - Decimals: 6
3. If different, check if correct token address
4. If wrong token deployed, need to redeploy

#### ❌ "Test minting failed"

**Cause:** ISSUER_ROLE tidak granted atau supply cap issue

**Solution:**
1. Verify ISSUER_ROLE: `npm run reagent:verify`
2. Check supply cap on Explorer
3. Check platform wallet has role
4. Retry test: `npm run reagent:test`

---

### 10. File System Issues

#### ❌ "Failed to save deployment info"

**Cause:** Permission issue atau disk full

**Solution:**
1. Check disk space: `df -h` (Linux/Mac) or `Get-PSDrive` (PowerShell)
2. Check write permissions in project directory
3. Manually create file if needed:
   ```json
   {
     "network": "mainnet",
     "tokenAddress": "0x...",
     "timestamp": "2024-..."
   }
   ```

#### ❌ "Failed to update .env"

**Cause:** File locked atau permission issue

**Solution:**
1. Close any editors with `.env` open
2. Check file permissions
3. Manually update `.env`:
   ```bash
   REAGENT_TOKEN_ADDRESS="0x..." # add token address
   ```

---

## 🔍 Debugging Steps

### General Debugging Process

1. **Read the error message carefully**
   - Note exact error text
   - Note which step failed

2. **Check logs**
   - Terminal output
   - Transaction hash (if available)
   - Explorer transaction details

3. **Verify configuration**
   ```bash
   # Check .env
   cat .env | grep TEMPO
   cat .env | grep QUOTE
   cat .env | grep WALLET_ENCRYPTION
   
   # Check Tempo CLI
   tempo --version
   tempo wallet status
   tempo wallet balances
   ```

4. **Check network status**
   - Tempo Explorer: https://explorer.tempo.xyz
   - RPC endpoint: https://rpc.tempo.xyz
   - Network congestion

5. **Verify prerequisites**
   - [ ] Tempo CLI installed
   - [ ] Logged in
   - [ ] Wallet funded
   - [ ] Environment variables set
   - [ ] Mainnet configuration

---

## 📞 Getting Help

### Self-Help Resources

1. **Documentation**
   - `PRODUCTION_DEPLOYMENT_READY.md` - Full guide
   - `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Checklist
   - `PHASE0_PRODUCTION_SUMMARY.md` - Summary

2. **Tempo Resources**
   - Docs: https://docs.tempo.xyz
   - Explorer: https://explorer.tempo.xyz
   - Status: Check docs for status page

3. **Check Transaction**
   - Always check transaction on Explorer
   - Look for error messages in logs
   - Verify gas used vs gas limit

### When to Contact Support

Contact Tempo support if:
- RPC endpoint consistently failing
- Transaction confirmed but token not deployed
- Role assignment failing despite correct permissions
- Network-level issues
- Smart contract issues

**Before contacting support, have ready:**
- Transaction hash
- Wallet address
- Error message
- Steps to reproduce
- Screenshots if applicable

---

## 🛡️ Safety Reminders

### Before Retrying

- ✅ Check if previous transaction succeeded
- ✅ Verify on Explorer
- ✅ Don't create duplicate deployments
- ✅ Wait for confirmations
- ✅ Document all attempts

### Emergency Procedures

If deployment partially succeeded:
1. Document what succeeded
2. Note token address if deployed
3. Check which steps failed
4. Complete remaining steps manually
5. Update documentation

---

## ✅ Success Indicators

Deployment successful when:
- ✅ Token deployed (address received)
- ✅ Token verified on Explorer
- ✅ ISSUER_ROLE granted
- ✅ Supply cap set (400M)
- ✅ Test minting successful
- ✅ `.env` updated
- ✅ Deployment info saved

---

## 📝 Logging Issues

If you encounter an issue not covered here:

1. Document the issue:
   - Error message
   - Steps to reproduce
   - Environment details
   - Transaction hash (if any)

2. Check if it's a known issue

3. Try suggested solutions

4. If unresolved, seek help with documentation

---

**Last Updated:** Phase 0 Production Deployment
**Status:** Ready for Mainnet
**Support:** See documentation files for detailed guides
