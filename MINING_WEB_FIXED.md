# Mining Web Fixed - Token Balance & Minting ✅

**Date:** April 12, 2026  
**Status:** FIXED & DEPLOYED  
**Task:** Fix token balance and minting according to tasks.md specifications

---

## 🔧 What Was Fixed

### 1. Token Decimals
**Before:** Assumed 18 decimals (standard ERC20)  
**After:** Correctly using 6 decimals (TIP-20 standard)

```typescript
// REAGENT token uses 6 decimals, not 18
const reagentBalance = parseInt(reagentBalanceHex, 16) / 1e6;
```

### 2. Minting Amount
**Before:** User could input any amount (1-10,000)  
**After:** Fixed at 10,000 REAGENT per mint

**Changes:**
- Removed amount input field
- Changed to "NUMBER OF MINTS" input
- Each mint = exactly 10,000 REAGENT
- User selects how many mints (1-50)

### 3. Token Balance Fetching
**Before:** Hardcoded '0' balance  
**After:** Real-time balance from blockchain

**Implementation:**
```typescript
const fetchTokenBalances = async (address: string) => {
  const REAGENT_TOKEN = '0x20C000000000000000000000a59277C0c1d65Bc5';
  const balanceOfData = '0x70a08231' + address.slice(2).padStart(64, '0');
  
  const reagentBalanceHex = await window.ethereum.request({
    method: 'eth_call',
    params: [{
      to: REAGENT_TOKEN,
      data: balanceOfData,
    }, 'latest'],
  });
  
  const reagentBalance = parseInt(reagentBalanceHex, 16) / 1e6; // 6 decimals
  return { reagent: reagentBalance.toFixed(2) };
};
```

### 4. UI Updates
**Before:**
- "AMOUNT PER MINT" input
- "REPEAT (1-50)" input
- Total calculation: repeat × amount

**After:**
- "NUMBER OF MINTS (1-50)" input only
- Each mint = 10,000 REAGENT (displayed)
- Total calculation: mints × 10,000

---

## 📋 Specifications from tasks.md

### Token Details
```
Name: ReAgent Token
Symbol: REAGENT
Type: TIP-20
Decimals: 6 (not 18!)
Address: 0x20C000000000000000000000a59277C0c1d65Bc5
Network: Tempo (Chain ID: 4217)
```

### Minting Rules
```
Amount per mint: 10,000 REAGENT (fixed)
Min mints: 1
Max mints: 50
Total per session: up to 500,000 REAGENT
```

### Pricing
```
Auto minting: 0.5 PATHUSD + gas
Manual minting: 1.0 PATHUSD + gas
```

---

## 🎨 UI Changes

### Input Section
**Before:**
```
┌─────────────────────────────────────┐
│ AMOUNT PER MINT                     │
│ [10000]                             │
│ 20.5M remaining · limit 10,000      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ REPEAT (1 - 50)                     │
│ [1]                                 │
└─────────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────────┐
│ NUMBER OF MINTS (1 - 50)            │
│ [1]                                 │
│ Each mint creates 10,000 REAGENT    │
│ tokens · 20.5M remaining            │
└─────────────────────────────────────┘
```

### Inscription Preview
**Before:**
```json
{
  "op": "mint",
  "tick": "REAGENT",
  "amt": "${amount}"  // Variable
}
```

**After:**
```json
{
  "op": "mint",
  "tick": "REAGENT",
  "amt": "10000"  // Fixed
}
```
+ Note: Fixed amount per mint: 10,000 REAGENT (6 decimals)

### Total Calculation
**Before:**
```
Total Tokens: 1 × 10000 = 10000 REAGENT
```

**After:**
```
Total Tokens: 1 mints × 10,000 = 10,000 REAGENT
```

---

## 🔍 Balance Display

### REAGENT Balance Card
**Before:**
```typescript
reagentBalance: '0', // Hardcoded
```

**After:**
```typescript
// Fetched from blockchain
const tokenBalances = await fetchTokenBalances(address);
reagentBalance: tokenBalances.reagent, // Real balance
```

**Display:**
```
┌─────────────────────────────────────┐
│ 💎 REAGENT Balance                  │
│ 50,000.00                           │
│ TIP-20 tokens                       │
└─────────────────────────────────────┘
```

---

## 🔧 Code Changes

### 1. Removed State
```typescript
// Removed
const [amount, setAmount] = useState('10000');
```

### 2. Updated Functions
```typescript
// handleEstimate
body: JSON.stringify({ amount: 10000 }), // Fixed

// handleInscribe
body: JSON.stringify({ 
  amount: 10000, // Fixed
  walletAddress: wallet.address 
}),
```

### 3. Added Balance Fetching
```typescript
const fetchTokenBalances = async (address: string) => {
  // ERC20 balanceOf call
  // Returns balance with 6 decimals
};
```

### 4. Updated Validation
```typescript
// Before
if (!amount || parseFloat(amount) <= 0) {
  setError('Please enter a valid amount');
}

// After
if (!repeat || parseInt(repeat) <= 0 || parseInt(repeat) > 50) {
  setError('Please enter a valid number of mints (1-50)');
}
```

---

## ✅ Verification

### Build Status
```bash
✓ Compiled successfully
✓ /mining-web - 4.97 kB (134 kB First Load JS)
✓ TypeScript checks passed
```

### Application Status
- **PM2 Process:** reagent (PID: 155756)
- **Status:** ONLINE ✅
- **Memory:** ~61MB
- **Build:** SUCCESS ✅

### URLs
- **Mining Interface:** https://mining.reagent.eu.cc ✅
- **Status:** LIVE ✅

---

## 📊 Comparison

### Token Balance
| Aspect | Before | After |
|--------|--------|-------|
| Decimals | 18 (wrong) | 6 (correct) |
| Source | Hardcoded '0' | Blockchain fetch |
| Display | Always 0 | Real balance |
| Update | Never | On connect/mint |

### Minting
| Aspect | Before | After |
|--------|--------|-------|
| Amount | Variable (1-10,000) | Fixed (10,000) |
| Input | 2 fields | 1 field |
| Calculation | repeat × amount | mints × 10,000 |
| Validation | Amount + repeat | Mints only |

---

## 🎯 Key Improvements

### 1. Correct Token Standard
- ✅ Using TIP-20 with 6 decimals
- ✅ Proper balance calculation
- ✅ Correct display format

### 2. Simplified UX
- ✅ One input instead of two
- ✅ Clear "mints" terminology
- ✅ Fixed amount per mint
- ✅ Better user understanding

### 3. Real-Time Data
- ✅ Fetch balance from blockchain
- ✅ Update after minting
- ✅ Show actual holdings

### 4. Specification Compliance
- ✅ Matches tasks.md requirements
- ✅ Follows TIP-20 standard
- ✅ Correct token economics

---

## 📝 Technical Details

### ERC20 balanceOf Call
```typescript
// Function signature: balanceOf(address)
const selector = '0x70a08231';
const paddedAddress = address.slice(2).padStart(64, '0');
const data = selector + paddedAddress;

// Call contract
const result = await ethereum.request({
  method: 'eth_call',
  params: [{
    to: REAGENT_TOKEN,
    data: data,
  }, 'latest'],
});

// Parse result (6 decimals)
const balance = parseInt(result, 16) / 1e6;
```

### Token Contract
```
Address: 0x20C000000000000000000000a59277C0c1d65Bc5
Standard: TIP-20 (Extended ERC-20)
Decimals: 6
Symbol: REAGENT
Name: ReAgent Token
```

---

## 🚀 Deployment

### Files Modified
```
src/app/mining-web/page.tsx (26KB)
```

### Changes Summary
- Removed amount state and input
- Added fetchTokenBalances function
- Updated connectWallet to fetch balances
- Updated checkConnection to fetch balances
- Changed "REPEAT" to "NUMBER OF MINTS"
- Fixed total calculation
- Updated inscription preview
- Fixed validation logic
- Updated API calls with fixed amount

### Build & Deploy
```bash
npm run build ✅
pm2 restart reagent ✅
```

---

## 🎉 Summary

Mining web interface sudah diperbaiki sesuai spesifikasi tasks.md:

**Token Balance:**
- ✅ Menggunakan 6 decimals (TIP-20)
- ✅ Fetch real balance dari blockchain
- ✅ Update setelah minting

**Minting:**
- ✅ Fixed 10,000 REAGENT per mint
- ✅ User pilih jumlah mints (1-50)
- ✅ Total = mints × 10,000
- ✅ UI lebih simple dan jelas

**Status:** PRODUCTION READY ✅
