# Mining Web - Client-Side Signing Fix

## Problem Identified
The API response was being filtered between the inscription engine and the HTTP response. The server logs showed `requiresClientSigning: true` was set correctly, but the browser only received `{success: true, inscriptionId: '...', rateLimit: {...}}` without the critical `requiresClientSigning` and `unsignedTransaction` fields.

## Root Cause
In `/api/mining/inscribe/route.ts` (lines 117-125), the success response was manually constructed with only specific fields:
```typescript
return NextResponse.json({
  success: true,
  inscriptionId: result.inscriptionId,
  txHash: result.txHash,
  tokensEarned: result.tokensEarned,
  feePaid: result.feePaid,
  rateLimit: { ... }
});
```

The `requiresClientSigning` and `unsignedTransaction` fields from the inscription engine were being dropped.

## Solution Applied
Added the missing fields to the API response:
```typescript
return NextResponse.json({
  success: true,
  inscriptionId: result.inscriptionId,
  txHash: result.txHash,
  tokensEarned: result.tokensEarned,
  feePaid: result.feePaid,
  requiresClientSigning: result.requiresClientSigning,  // ✅ ADDED
  unsignedTransaction: result.unsignedTransaction,      // ✅ ADDED
  rateLimit: { ... }
});
```

## How It Works Now

### For External Wallets (MetaMask) on `/mining-web`:
1. User clicks "Mint" button
2. Frontend sends `forceClientSigning: true` to `/api/mining/inscribe`
3. Inscription engine detects external wallet and returns:
   - `requiresClientSigning: true`
   - `unsignedTransaction: { from, to, data, gasLimit, gasPrice }`
4. API route now passes these fields to browser ✅
5. Frontend detects `requiresClientSigning` and prompts MetaMask
6. User signs transaction in MetaMask using `eth_sendTransaction`
7. Transaction hash returned and displayed to user

### For Managed Wallets on `/mining`:
- Works as before with server-side signing
- No changes needed

## Files Modified
- `blinkai/src/app/api/mining/inscribe/route.ts` - Added missing response fields

## Testing Instructions
1. Sign in to ReAgent account
2. Go to `/mining-web`
3. Connect MetaMask wallet
4. Click "Mint" button
5. Browser should now receive `requiresClientSigning: true` and `unsignedTransaction` object
6. MetaMask should prompt for transaction signature
7. After signing, transaction should be submitted to blockchain

## Expected Console Output
```javascript
[Inscribe API] Request params: { confirm: true, forceClientSigning: true, userId: '...' }
[InscriptionEngine] isExternalWallet: true
[Inscribe API] Inscription result: { success: true, requiresClientSigning: true, inscriptionId: '...' }
```

Browser receives:
```javascript
{
  success: true,
  inscriptionId: "cmnx...",
  requiresClientSigning: true,  // ✅ Now included
  unsignedTransaction: {        // ✅ Now included
    from: "0x...",
    to: "0x20C000000000000000000000a59277C0c1d65Bc5",
    data: "0x...",
    gasLimit: "100000",
    gasPrice: "1000000000"
  },
  rateLimit: { remaining: 9, resetAt: "..." }
}
```

## Status
✅ FIXED - External wallets can now mint REAGENT tokens using client-side signing with MetaMask
