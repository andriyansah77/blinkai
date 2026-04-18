# Balance & Auto-Signing Fix - Complete

## Masalah yang Diperbaiki

### 1. PATHUSD Balance Tidak Terbaca
**Masalah**: AI agent menampilkan PATHUSD balance sebagai `null` padahal address sudah memiliki PATHUSD.

**Penyebab**: Endpoint `/api/wallet/balance` hanya membaca dari database, tidak fetch real-time dari blockchain.

**Solusi**: 
- Tambahkan fetch real-time PATHUSD balance dari blockchain menggunakan ethers.js
- Update database dengan balance terbaru
- Fallback ke database balance jika blockchain fetch gagal

### 2. Minting Masih Pending Signature
**Masalah**: Minting via Telegram bot membuat inscription dengan status `pending_signature` yang memerlukan manual approval, padahal seharusnya auto-signed seperti di webchat.

**Penyebab**: Telegram bot memanggil endpoint `/api/hermes/skills/minting` yang masih menggunakan `InscriptionEngine` lama (client-side signing).

**Solusi**:
- Update endpoint `/api/hermes/skills/minting` untuk menggunakan `simpleMintingEngine` (server-side signing)
- Hapus dependency ke `InscriptionEngine`, `WalletManager`, `UsdBalanceManager` lama
- Gunakan `simpleWalletManager` dan `simpleMintingEngine` yang sudah support server-side signing

## File Changes

### 1. `/api/wallet/balance` - Real-time Balance Fetch

**File**: `blinkai/src/app/api/wallet/balance/route.ts`

**Changes**:
- Added ethers.js import
- Added PATHUSD contract interaction
- Fetch real-time balance from blockchain
- Update database with latest balance
- Fallback to cached balance if blockchain fetch fails

**Before**:
```typescript
// Only read from database
return NextResponse.json({
  success: true,
  address: wallet.address,
  reagentBalance: wallet.reagentBalance,
  pathusdBalance: wallet.pathusdBalance, // Could be null
  lastBalanceUpdate: wallet.lastBalanceUpdate
});
```

**After**:
```typescript
// Fetch from blockchain
const provider = new ethers.JsonRpcProvider(TEMPO_RPC_URL);
const pathusdContract = new ethers.Contract(PATHUSD_ADDRESS, ERC20_ABI, provider);
const pathusdBalanceRaw = await pathusdContract.balanceOf(wallet.address);
const pathusdBalance = ethers.formatUnits(pathusdBalanceRaw, 6);

// Update database
await prisma.wallet.update({
  where: { userId },
  data: {
    pathusdBalance,
    lastBalanceUpdate: new Date()
  }
});

return NextResponse.json({
  success: true,
  address: wallet.address,
  reagentBalance: wallet.reagentBalance,
  pathusdBalance, // Real-time from blockchain
  lastBalanceUpdate: new Date()
});
```

### 2. `/api/hermes/skills/minting` - Server-Side Signing

**File**: `blinkai/src/app/api/hermes/skills/minting/route.ts`

**Changes**:
- Replaced `InscriptionEngine` with `simpleMintingEngine`
- Replaced `WalletManager` with `simpleWalletManager`
- Removed `UsdBalanceManager` (not needed, uses PATHUSD from blockchain)
- Removed `GasEstimator` (not needed, uses fixed estimate)
- All minting now uses server-side signing
- No more `pending_signature` status

**Before**:
```typescript
import { InscriptionEngine } from "@/lib/mining/inscription-engine";
import { WalletManager } from "@/lib/mining/wallet-manager";
import { UsdBalanceManager } from "@/lib/mining/usd-balance-manager";

// Client-side signing - creates pending_signature
const inscriptionEngine = new InscriptionEngine();
const result = await inscriptionEngine.executeInscription(userId, "auto");
```

**After**:
```typescript
import { simpleMintingEngine } from "@/lib/mining/simple-minting-engine";
import { simpleWalletManager } from "@/lib/mining/simple-wallet-manager";

// Server-side signing - auto-signed immediately
const result = await simpleMintingEngine.mint(userId, "auto");
```

## API Behavior Changes

### check_balance
**Before**:
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "usdBalance": null,  // ❌ Could be null
    "reagentBalance": 0
  }
}
```

**After**:
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "pathusdBalance": 10.5,  // ✅ Real-time from blockchain
    "reagentBalance": 0
  }
}
```

### mint_tokens
**Before**:
```json
{
  "success": true,
  "txHash": null,  // ❌ No txHash, needs manual signing
  "status": "pending_signature"  // ❌ Waiting for user
}
```

**After**:
```json
{
  "success": true,
  "txHash": "0x1234...",  // ✅ Transaction submitted
  "tokensEarned": "10000",
  "feePathusd": "0.05",
  "status": "pending"  // ✅ Auto-signed, waiting for confirmation
}
```

## Testing

### Test Balance Fix

**Web Chat**:
```
/balance
```
Should show real PATHUSD balance from blockchain.

**Telegram Bot**:
User: "Check my balance"
AI agent should show correct PATHUSD balance.

**cURL**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/commands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -d '{"command": "/balance"}'
```

### Test Auto-Signing Fix

**Telegram Bot**:
User: "Mine 1 token"
AI agent should:
1. Execute mining
2. Return txHash immediately
3. No manual approval needed
4. Status should be "pending" not "pending_signature"

**Direct API Call**:
```bash
curl -X POST https://reagent.eu.cc/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-User-ID: $USER_ID" \
  -d '{"action": "mint_tokens"}'
```

Should return:
```json
{
  "success": true,
  "txHash": "0x...",
  "tokensEarned": "10000",
  "feePathusd": "0.05",
  "message": "✅ Minting successful!..."
}
```

## Important Notes

1. **Real-Time Balance**: Balance is now fetched from blockchain every time, ensuring accuracy.

2. **Server-Side Signing**: All minting operations use master wallet for signing, no user interaction needed.

3. **No More pending_signature**: Inscriptions are created with status "pending" and txHash immediately.

4. **Backward Compatibility**: Old endpoints still exist but should not be used. Telegram bot should use:
   - `/api/hermes/commands` for slash commands
   - `/api/hermes/skills/minting` for direct minting API

5. **Fee Structure**: 
   - Auto-mining: 0.05 PATHUSD
   - Manual mining: 0.1 PATHUSD

6. **PATHUSD Decimals**: PATHUSD uses 6 decimals (like USDC), not 18 like ETH.

## Deploy

```bash
cd /root/reagent
git pull
npm run build
pm2 restart reagent
```

Hard refresh browser: Ctrl+Shift+R

## Verification

After deploy, verify:

1. ✅ `/balance` command shows correct PATHUSD balance
2. ✅ `/mine` command auto-signs and returns txHash
3. ✅ No inscriptions with `pending_signature` status
4. ✅ Telegram bot can mine without manual approval
5. ✅ Balance updates after each mint

## Summary

- ✅ Fixed PATHUSD balance reading from blockchain
- ✅ Fixed auto-signing for Telegram bot minting
- ✅ Removed client-side signing dependency
- ✅ All minting now uses server-side signing
- ✅ Consistent behavior between web chat and Telegram bot
