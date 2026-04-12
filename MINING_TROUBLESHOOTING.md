# Mining Web - Troubleshooting Guide

**Last Updated:** April 12, 2026

---

## 🐛 Common Error: 400 Bad Request

### Symptoms
```
POST /api/mining/inscribe 400 (Bad Request)
Inscribe response: {status: 400, data: {success: false, error: {...}}}
```

### Possible Causes & Solutions

#### 1. User Not Authenticated
**Error:** `UNAUTHORIZED` or `Authentication required`  
**Solution:**
- Sign in to ReAgent account
- Refresh page
- Try again

#### 2. Insufficient USD Balance
**Error:** `Insufficient balance` or `Not enough funds`  
**Solution:**
- Check USD balance in dashboard
- Deposit funds to platform wallet
- Manual minting requires 1.0 PATHUSD + gas

#### 3. Missing Wallet
**Error:** `Wallet not found` or `No wallet for user`  
**Solution:**
- Wallet should be auto-created on registration
- Check database: `SELECT * FROM Wallet WHERE userId = 'xxx'`
- If missing, create wallet via dashboard

#### 4. Rate Limit Exceeded
**Error:** `RATE_LIMIT_EXCEEDED` or `Too many requests`  
**Solution:**
- Wait 1 hour
- Maximum 10 mints per hour
- Check rate limit reset time

#### 5. Inscription Engine Error
**Error:** `INSCRIPTION_FAILED` or engine-specific error  
**Solution:**
- Check PM2 logs: `pm2 logs reagent`
- Verify REAGENT token deployment
- Check platform wallet has ISSUER_ROLE
- Verify Tempo Network RPC is accessible

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for "Inscribe response:" log
4. Expand `data.error` object
5. Note the error code and message

### Step 2: Check Session
```javascript
// In browser console
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "user": {
    "id": "xxx",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

If null → User not signed in

### Step 3: Check Wallet
```javascript
// In browser console
fetch('/api/wallet')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "address": "0x...",
  "reagentBalance": 0,
  "usdBalance": 0
}
```

### Step 4: Check USD Balance
```javascript
// In browser console
fetch('/api/wallet')
  .then(r => r.json())
  .then(data => console.log('USD Balance:', data.usdBalance))
```

Minimum required: 1.0 PATHUSD for manual minting

### Step 5: Test Estimate API
```javascript
// In browser console
fetch('/api/mining/estimate?type=manual')
  .then(r => r.json())
  .then(console.log)
```

Should return gas estimate without errors

---

## 🔧 Server-Side Checks

### Check PM2 Logs
```bash
ssh root@159.65.141.68
pm2 logs reagent --lines 50
```

Look for:
- Inscription API errors
- Database errors
- Blockchain RPC errors

### Check Database

#### Check User Wallet
```bash
ssh root@159.65.141.68
cd /root/blinkai
npx prisma studio
```

Or via SQL:
```sql
SELECT * FROM User WHERE email = 'user@example.com';
SELECT * FROM Wallet WHERE userId = 'xxx';
SELECT * FROM UsdBalance WHERE userId = 'xxx';
```

#### Check USD Balance
```sql
SELECT u.email, ub.balance 
FROM User u 
LEFT JOIN UsdBalance ub ON u.id = ub.userId 
WHERE u.email = 'user@example.com';
```

### Check Environment Variables
```bash
ssh root@159.65.141.68
cd /root/blinkai
cat .env | grep -E "REAGENT|TEMPO|PLATFORM"
```

Required variables:
```
REAGENT_TOKEN_ADDRESS=0x20C000000000000000000000a59277C0c1d65Bc5
TEMPO_RPC_URL=https://rpc.tempo.xyz
TEMPO_CHAIN_ID=4217
PLATFORM_WALLET_ADDRESS=0x...
PLATFORM_WALLET_PRIVATE_KEY=0x...
```

---

## 💡 Quick Fixes

### Fix 1: Create Missing Wallet
```bash
ssh root@159.65.141.68
cd /root/blinkai
npx ts-node scripts/create-wallet-for-user.ts <userId>
```

### Fix 2: Add USD Balance (Admin)
```bash
ssh root@159.65.141.68
cd /root/blinkai
npx ts-node scripts/add-usd-balance.ts <userId> <amount>
```

### Fix 3: Reset Rate Limit
Rate limits are in-memory, so restart PM2:
```bash
ssh root@159.65.141.68
pm2 restart reagent
```

### Fix 4: Check Inscription Engine
```bash
ssh root@159.65.141.68
cd /root/blinkai
npx ts-node scripts/test-inscription-engine.ts
```

---

## 📊 Error Code Reference

| Code | Meaning | Solution |
|------|---------|----------|
| UNAUTHORIZED | Not signed in | Sign in to account |
| RATE_LIMIT_EXCEEDED | Too many requests | Wait 1 hour |
| CONFIRMATION_REQUIRED | Missing confirm flag | Should not happen (client sends it) |
| INSCRIPTION_FAILED | Engine error | Check logs, verify setup |
| INSUFFICIENT_BALANCE | Not enough USD | Deposit funds |
| WALLET_NOT_FOUND | No wallet in DB | Create wallet |
| INTERNAL_ERROR | Server error | Check PM2 logs |

---

## 🎯 Common Scenarios

### Scenario 1: New User First Mint
**Problem:** User just registered, tries to mint, gets 400  
**Likely Cause:** No USD balance  
**Solution:**
1. User needs to deposit USD first
2. Go to dashboard → Deposit
3. Send funds to platform wallet
4. Admin confirms deposit
5. Try minting again

### Scenario 2: Wallet Connected But Can't Mint
**Problem:** Wallet connected, signed in, but mint fails  
**Likely Cause:** Missing wallet in database OR no USD balance  
**Solution:**
1. Check if wallet exists in DB
2. Check USD balance
3. If wallet missing, contact admin
4. If balance zero, deposit funds

### Scenario 3: Worked Before, Now Fails
**Problem:** User minted successfully before, now gets 400  
**Likely Cause:** Rate limit OR insufficient balance  
**Solution:**
1. Check if 10 mints already done in last hour
2. Check if USD balance depleted
3. Wait or deposit more funds

---

## 🔐 Security Checks

### Verify Platform Wallet
```bash
ssh root@159.65.141.68
cd /root/blinkai
npx ts-node scripts/verify-platform-wallet.ts
```

Should check:
- Wallet has ISSUER_ROLE on REAGENT token
- Wallet has enough PATH for gas
- Private key is valid

### Verify REAGENT Token
```bash
# Check token on Tempo Explorer
https://explore.tempo.xyz/address/0x20C000000000000000000000a59277C0c1d65Bc5
```

Should show:
- Token name: ReAgent Token
- Symbol: REAGENT
- Decimals: 6
- Supply cap: 400M

---

## 📞 Support Checklist

When reporting issues, provide:

1. **User Info**
   - Email
   - User ID
   - Registration date

2. **Error Details**
   - Full error message from console
   - Screenshot of error
   - Timestamp of error

3. **Browser Info**
   - Browser name and version
   - Wallet extension (MetaMask, etc.)
   - Operating system

4. **Steps to Reproduce**
   - What user did before error
   - Can error be reproduced?
   - Does it happen every time?

5. **Account Status**
   - Is user signed in?
   - Is wallet connected?
   - What's the USD balance?
   - How many mints done today?

---

## 🚀 Prevention

### For Users
1. Always sign in before connecting wallet
2. Check USD balance before minting
3. Don't exceed 10 mints per hour
4. Keep some PATH for gas fees

### For Admins
1. Monitor PM2 logs regularly
2. Check database integrity
3. Verify platform wallet balance
4. Test inscription engine periodically
5. Keep RPC endpoint accessible

---

## 📝 Logging

### Enable Debug Logging
```bash
ssh root@159.65.141.68
cd /root/blinkai
# Add to .env
echo "DEBUG=mining:*" >> .env
pm2 restart reagent
```

### View Logs
```bash
# Real-time logs
pm2 logs reagent

# Last 100 lines
pm2 logs reagent --lines 100

# Error logs only
pm2 logs reagent --err

# Save logs to file
pm2 logs reagent --lines 1000 > mining-logs.txt
```

---

## ✅ Health Check Script

Create a health check script:

```bash
#!/bin/bash
# health-check.sh

echo "=== ReAgent Mining Health Check ==="
echo ""

# Check PM2
echo "1. PM2 Status:"
pm2 status reagent

# Check Database
echo ""
echo "2. Database Connection:"
cd /root/blinkai
npx prisma db execute --stdin <<< "SELECT 1"

# Check RPC
echo ""
echo "3. Tempo RPC:"
curl -s -X POST https://rpc.tempo.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | jq .

# Check API
echo ""
echo "4. Mining API:"
curl -s https://mining.reagent.eu.cc/api/mining/stats | jq .

echo ""
echo "=== Health Check Complete ==="
```

Run with:
```bash
bash health-check.sh
```

---

**Need more help?** Check PM2 logs and database for specific error details.
