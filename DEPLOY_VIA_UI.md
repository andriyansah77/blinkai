# 🚀 Deploy REAGENT Token via Tempo Wallet UI

Panduan lengkap deploy REAGENT token menggunakan Tempo Wallet UI (cara paling aman).

---

## 📋 Informasi yang Dibutuhkan

### Contract Address
```
TIP20Factory: 0x20Fc000000000000000000000000000000000000
```

### Function to Call
```
createToken(string name, string symbol, string currency, address quoteToken, address admin, bytes32 salt)
```

### Parameters
```
name:       "ReAgent Token"
symbol:     "REAGENT"
currency:   "USD"
quoteToken: 0x20c0000000000000000000000000000000000000
admin:      0x3d4ddbbbfea7d850e1a065b3c928c3b4f2f39bfb
salt:       0x7265616765e6e742d6d61696e6e65742d7631000000000000000000000000000
```

**Salt Explanation:** 
- Salt adalah hash dari string "reagent-mainnet-v1"
- Digunakan untuk deterministic deployment

---

## 🌐 Step-by-Step Deployment

### Step 1: Buka Tempo Wallet

1. Buka browser (Chrome/Firefox/Brave)
2. Kunjungi: **https://wallet.tempo.xyz**
3. Login dengan wallet kamu (sudah login sebelumnya)
4. Pastikan balance ada: **1.000000 pathUSD** ✅

### Step 2: Akses Contract Interaction

Ada beberapa cara:

**Option A: Via Tempo Explorer (Recommended)**
1. Kunjungi: https://explore.tempo.xyz/address/0x20Fc000000000000000000000000000000000000
2. Klik tab "Write Contract"
3. Connect wallet
4. Cari function `createToken`

**Option B: Via Wallet Direct Contract Call**
1. Di Tempo Wallet, cari menu "Contract" atau "Interact"
2. Masukkan contract address: `0x20Fc000000000000000000000000000000000000`
3. Pilih function: `createToken`

### Step 3: Isi Parameters

Masukkan parameter satu per satu:

```
1. name (string):
   ReAgent Token

2. symbol (string):
   REAGENT

3. currency (string):
   USD

4. quoteToken (address):
   0x20c0000000000000000000000000000000000000

5. admin (address):
   0x3d4ddbbbfea7d850e1a065b3c928c3b4f2f39bfb

6. salt (bytes32):
   0x7265616765e6e742d6d61696e6e65742d7631000000000000000000000000000
```

### Step 4: Review & Send Transaction

1. Review semua parameter
2. Check gas estimate (should be ~0.02-0.05 pathUSD)
3. Klik "Write" atau "Send Transaction"
4. Confirm di wallet popup
5. Wait for confirmation (~5-10 seconds)

### Step 5: Get Token Address

Setelah transaction confirmed:

1. Copy transaction hash dari notification
2. Buka: https://explore.tempo.xyz/tx/[TRANSACTION_HASH]
3. Lihat "Logs" section
4. Cari event "TokenCreated"
5. Copy token address dari event

**Atau:**

Lihat di "Internal Transactions" atau "Token Transfers" untuk melihat token address yang baru dibuat.

---

## 📝 After Deployment

### Step 6: Verify Token

1. Buka: https://explore.tempo.xyz/address/[TOKEN_ADDRESS]
2. Verify:
   - Name: ReAgent Token ✅
   - Symbol: REAGENT ✅
   - Decimals: 6 ✅
   - Total Supply: 0 (belum ada mint) ✅

### Step 7: Grant ISSUER_ROLE

Sekarang grant ISSUER_ROLE ke platform wallet:

**Via Explorer:**
1. Buka token address di Explorer
2. Tab "Write Contract"
3. Connect wallet
4. Function: `grantRole`
5. Parameters:
   ```
   role:    0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122
   account: 0x3d4ddbbbfea7d850e1a065b3c928c3b4f2f39bfb
   ```
6. Send transaction

**Role Hash Explanation:**
- `0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122` adalah keccak256("ISSUER_ROLE")

### Step 8: Set Supply Cap

Set maximum supply to 400M REAGENT:

**Via Explorer:**
1. Token address → Write Contract
2. Function: `setSupplyCap`
3. Parameter:
   ```
   cap: 400000000000000
   ```
   (400M REAGENT dengan 6 decimals = 400,000,000 * 10^6)
4. Send transaction

### Step 9: Update .env

Update file `.env` dengan token address:

```bash
REAGENT_TOKEN_ADDRESS="0x[TOKEN_ADDRESS_DARI_STEP_5]"
```

---

## 🎯 Quick Reference

### Contract Addresses
```
TIP20Factory:  0x20Fc000000000000000000000000000000000000
pathUSD:       0x20c0000000000000000000000000000000000000
Your Wallet:   0x3d4ddbbbfea7d850e1a065b3c928c3b4f2f39bfb
```

### Function Signatures
```
createToken(string,string,string,address,address,bytes32)
grantRole(bytes32,address)
setSupplyCap(uint256)
```

### Important Values
```
ISSUER_ROLE hash: 0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122
Supply Cap:       400000000000000 (400M with 6 decimals)
Salt:             0x7265616765e6e742d6d61696e6e65742d7631000000000000000000000000000
```

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Token deployed successfully
- [ ] Token address obtained
- [ ] Name: "ReAgent Token"
- [ ] Symbol: "REAGENT"
- [ ] Decimals: 6
- [ ] ISSUER_ROLE granted to platform wallet
- [ ] Supply cap set to 400M
- [ ] Token visible on Explorer
- [ ] .env updated with token address

---

## 🆘 Troubleshooting

### "Transaction Failed"
- Check gas balance (need pathUSD)
- Verify all parameters are correct
- Check if salt already used (try different salt)

### "Cannot Find Function"
- Make sure you're on the correct contract
- Try refreshing the page
- Use Explorer instead of Wallet UI

### "Role Already Granted"
- This is OK, role was already granted
- Skip to next step

### "Supply Cap Already Set"
- Check current supply cap
- If correct (400M), skip this step
- If wrong, contact Tempo support

---

## 📞 Links

- **Tempo Wallet**: https://wallet.tempo.xyz
- **Tempo Explorer**: https://explore.tempo.xyz
- **TIP20Factory**: https://explore.tempo.xyz/address/0x20Fc000000000000000000000000000000000000
- **pathUSD**: https://explore.tempo.xyz/address/0x20c0000000000000000000000000000000000000
- **Your Wallet**: https://explore.tempo.xyz/address/0x3d4ddbbbfea7d850e1a065b3c928c3b4f2f39bfb

---

## ✅ Success!

Setelah semua step selesai:

1. ✅ REAGENT token deployed
2. ✅ ISSUER_ROLE granted
3. ✅ Supply cap set
4. ✅ .env updated
5. ✅ Ready for Phase 3!

**Next:** Test minting functionality dan lanjut ke Phase 3 (Trading System)

---

**Deployment Method:** Manual via Tempo Wallet UI
**Network:** Tempo Mainnet (Chain ID: 4217)
**Status:** Ready to Deploy
**Estimated Time:** 10-15 minutes
**Cost:** ~0.03-0.08 pathUSD total
