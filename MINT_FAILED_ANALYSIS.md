# Mint Failed Analysis

## Problem
1. Transaction failed - hanya bayar gas fee, REAGENT tidak masuk
2. Tidak ada PATHUSD fee yang dibayar

## Root Causes

### 1. Wallet Tidak Punya ISSUER_ROLE
REAGENT token contract menggunakan access control. Hanya address dengan ISSUER_ROLE yang bisa mint.

**Solution**: 
- Grant ISSUER_ROLE ke semua wallet yang di-generate
- Atau gunakan master wallet yang sudah punya ISSUER_ROLE

### 2. PATHUSD Fee Tidak Diimplementasikan
Sistem baru (simple-minting-engine) tidak ada logic untuk:
- Deduct PATHUSD fee sebelum minting
- Check balance PATHUSD cukup atau tidak

**Original System**:
- Auto mining: 0.5 PATHUSD + gas
- Manual mining: 1.0 PATHUSD + gas

**New System**:
- Tidak ada PATHUSD fee
- Hanya bayar gas

## Solutions

### Option 1: Use Master Wallet (Recommended)
Gunakan 1 master wallet yang sudah punya ISSUER_ROLE untuk mint semua tokens.

**Pros**:
- Simple - tidak perlu grant role ke setiap wallet
- Secure - private key master wallet bisa di-manage lebih ketat
- Scalable - bisa mint untuk banyak user

**Cons**:
- Single point of failure
- Perlu track minting per user di database

**Implementation**:
```typescript
// Master wallet mints for user
const masterWallet = await getMasterWallet();
const tx = await constructMintTransaction(userAddress); // Mint TO user
const signedTx = await masterWallet.signTransaction(tx);
```

### Option 2: Grant ISSUER_ROLE to All Wallets
Grant ISSUER_ROLE ke setiap wallet yang di-generate.

**Pros**:
- Decentralized - setiap user punya control
- No single point of failure

**Cons**:
- Complex - perlu grant role untuk setiap wallet baru
- Gas cost - perlu transaction untuk grant role
- Security risk - banyak wallet dengan ISSUER_ROLE

### Option 3: Hybrid - Minting Service
Buat minting service yang:
1. User request mint via API
2. Service check user balance & eligibility
3. Service mint dengan master wallet
4. Service transfer tokens ke user

**Pros**:
- Best of both worlds
- Can implement PATHUSD fee
- Can implement rate limiting
- Can implement access control

**Cons**:
- More complex architecture
- Need transfer after mint (extra gas)

## Recommended Solution: Master Wallet + PATHUSD Fee

### Architecture
```
User Request Mint
    ↓
Check PATHUSD Balance >= Fee
    ↓
Deduct PATHUSD Fee
    ↓
Master Wallet Mints to User Address
    ↓
Update User Balance
    ↓
Return Success
```

### Implementation Steps

1. **Setup Master Wallet**
```bash
# Generate master wallet
# Grant ISSUER_ROLE to master wallet
# Fund master wallet with PATHUSD for gas
```

2. **Update Simple Minting Engine**
```typescript
// Check PATHUSD balance
const pathusdBalance = await getPathusdBalance(userId);
const fee = type === 'auto' ? 0.5 : 1.0;

if (pathusdBalance < fee) {
  throw new Error('Insufficient PATHUSD balance');
}

// Deduct fee
await deductPathusdFee(userId, fee);

// Mint with master wallet TO user address
const tx = await constructMintTransaction(userAddress);
const signedTx = await masterWallet.signTransaction(tx);
```

3. **Update Transaction Construction**
```typescript
// Mint TO user address (not FROM user address)
const data = iface.encodeFunctionData('mint', [
  userAddress,  // TO user
  amountInUnits
]);

return {
  to: REAGENT_TOKEN_ADDRESS,
  from: masterWalletAddress,  // FROM master wallet
  // ...
};
```

## PATHUSD Fee Implementation

### Database Schema
```sql
-- UsdBalance table (already exists)
CREATE TABLE "UsdBalance" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "walletId" TEXT UNIQUE NOT NULL,
  "balance" TEXT NOT NULL,  -- PATHUSD balance
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- UsdTransaction table (already exists)
CREATE TABLE "UsdTransaction" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,  -- 'debit' or 'credit'
  "amount" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "relatedType" TEXT,
  "relatedId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### Fee Logic
```typescript
async deductMintingFee(userId: string, type: 'auto' | 'manual'): Promise<void> {
  const fee = type === 'auto' ? '0.5' : '1.0';
  
  // Check balance
  const balance = await usdBalanceManager.getBalance(userId);
  if (parseFloat(balance) < parseFloat(fee)) {
    throw new Error(`Insufficient PATHUSD balance. Need ${fee}, have ${balance}`);
  }
  
  // Deduct fee
  await usdBalanceManager.deduct(
    userId,
    fee,
    'minting_fee',
    `${type} minting fee`,
    'inscription',
    inscriptionId
  );
}
```

## Next Steps

1. **Immediate Fix**: Use master wallet for minting
2. **Add PATHUSD Fee**: Implement fee deduction
3. **Test**: Verify minting works and fees are deducted
4. **Deploy**: Push to production

## Testing Checklist

- [ ] Master wallet has ISSUER_ROLE
- [ ] Master wallet has PATHUSD for gas
- [ ] User has PATHUSD for fee
- [ ] Minting deducts correct fee
- [ ] Tokens minted to user address
- [ ] Balance updated correctly
- [ ] Transaction confirmed on blockchain
- [ ] Database records correct
