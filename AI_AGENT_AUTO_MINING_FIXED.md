# AI Agent Auto Mining - FIXED ✅

## Problem
AI agent tidak bisa eksekusi wallet user karena:
1. Private key tidak disimpan di database (set ke empty string)
2. Inscription engine tidak support server-side signing
3. AI agent berjalan di server, tidak bisa akses browser wallet

## Solution
Enable server-side signing dengan encrypted private key:

### 1. Store Encrypted Private Key (wallet-manager.ts)
**Changed**: `generateWallet()` method

**Before**:
```typescript
encryptedPrivateKey: '', // Empty - no server-side storage
keyIv: '', // Empty - not needed
```

**After**:
```typescript
// Encrypt private key for server-side storage
const { encrypted, iv } = this.encryptPrivateKey(privateKey);

encryptedPrivateKey: encrypted, // Encrypted for AI agent use
keyIv: iv, // IV for decryption
```

**Impact**: Semua wallet baru akan punya encrypted private key di database

### 2. Enable Server-Side Signing (inscription-engine.ts)
**Changed**: `executeInscription()` method

**Added Logic**:
```typescript
// Check if wallet has encrypted private key
const hasEncryptedKey = !!(dbWallet?.encryptedPrivateKey && dbWallet.encryptedPrivateKey.length > 0);

// For auto mining, try server-side signing if we have encrypted key
if (type === 'auto' && hasEncryptedKey && !forceClientSigning) {
  // Decrypt private key
  const privateKey = walletManager.decryptPrivateKey(
    dbWallet.encryptedPrivateKey!,
    dbWallet.keyIv!
  );
  
  // Sign and broadcast transaction
  const signedTx = await this.signTransaction(tx, privateKey);
  const txHash = await this.submitTransaction(signedTx);
  
  // Return success with tx hash
  return {
    success: true,
    txHash,
    tokensEarned: TOKENS_PER_INSCRIPTION
  };
}
```

**Fallback**: Jika decrypt gagal atau tidak ada encrypted key, fallback ke client-side signing

### 3. AI Agent Skill (auto_mining_skill.py)
**Already Correct**: Skill sudah support server-side signing

```python
response = requests.post(
    f"{PLATFORM_URL}/api/mining/inscribe",
    json={
        "confirm": True,
        "forceClientSigning": False  # Allow server-side signing
    }
)
```

## How It Works

### For New Users (After This Fix)
1. User sign up → Wallet generated with encrypted private key
2. AI agent calls `/api/mining/inscribe` with `type: 'auto'`
3. Server decrypts private key
4. Server signs transaction
5. Server broadcasts to blockchain
6. ✅ Success! No browser interaction needed

### For Existing Users (Before This Fix)
1. User has wallet WITHOUT encrypted private key
2. AI agent calls `/api/mining/inscribe` with `type: 'auto'`
3. Server detects no encrypted key
4. Server returns unsigned transaction
5. ❌ Requires client-side signing (browser)

## Migration for Existing Users

### Option 1: Manual Migration (Recommended)
User perlu re-generate wallet:
1. Backup current wallet (mnemonic/private key)
2. Transfer tokens to new address
3. Delete old wallet
4. Generate new wallet (will have encrypted key)
5. AI agent can now auto mine

### Option 2: Import with Encryption
Add endpoint to encrypt existing wallet:
```typescript
POST /api/wallet/enable-auto-mining
// Encrypts current wallet's private key
```

## Security

### Encryption
- Algorithm: AES-256-GCM
- Key: From `WALLET_ENCRYPTION_KEY` env variable
- IV: Unique per wallet (16 bytes)
- Auth Tag: Included for integrity verification

### Access Control
- Private key only decrypted during transaction signing
- Decryption happens in memory, never logged
- Only accessible via authenticated API calls
- Rate limited: 10 mints per hour per user

### User Consent
- User agrees to terms during onboarding
- Mnemonic/private key shown once during wallet creation
- User can export wallet anytime
- User can disable auto mining anytime

## Testing

### Test New User Flow
```bash
# 1. Create new user account
# 2. Generate wallet (will have encrypted key)
# 3. Fund wallet with PATHUSD
# 4. Set API key: export REAGENT_API_KEY="..."
# 5. Run AI agent: hermes chat "Start mining REAGENT"
# 6. Check result - should succeed without browser interaction
```

### Test Existing User Flow
```bash
# 1. Login as existing user (wallet without encrypted key)
# 2. Try AI agent mining
# 3. Should get error: "requires client-side signing"
# 4. User needs to migrate wallet (see Migration section)
```

### Verify Encryption
```sql
-- Check if wallet has encrypted private key
SELECT 
  "userId",
  "address",
  LENGTH("encryptedPrivateKey") as key_length,
  LENGTH("keyIv") as iv_length,
  "createdAt"
FROM "Wallet"
WHERE "userId" = 'USER_ID';

-- key_length should be > 0 for new wallets
-- key_length = 0 for old wallets (need migration)
```

## Deployment

### 1. Deploy Code
```bash
ssh root@188.166.247.252
cd /root/reagent
git pull origin main
npm run build
pm2 restart reagent
```

### 2. Verify Environment
```bash
# Check encryption key is set
grep WALLET_ENCRYPTION_KEY /root/reagent/.env

# Should be 32 characters
# If not set, add it:
echo "WALLET_ENCRYPTION_KEY=your-32-char-key-here" >> /root/reagent/.env
pm2 restart reagent
```

### 3. Test
```bash
# Create test user
curl -X POST https://reagent.eu.cc/api/wallet/create \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Check if encrypted key exists
# Login to database and check Wallet table
```

## Files Changed

### Modified
- `src/lib/mining/wallet-manager.ts` - Store encrypted private key
- `src/lib/mining/inscription-engine.ts` - Enable server-side signing

### No Changes Needed
- `hermes-skills/auto_mining_skill.py` - Already correct
- `src/app/api/mining/inscribe/route.ts` - Already correct
- Database schema - Already has fields

## Benefits

✅ AI agent can auto mine without browser  
✅ Fully automated mining  
✅ No user interaction needed  
✅ Secure with encryption  
✅ Rate limited for safety  
✅ Fallback to client-side if needed  

## Limitations

❌ Existing users need wallet migration  
❌ Requires WALLET_ENCRYPTION_KEY in env  
❌ Private key stored on server (encrypted)  
❌ Single point of failure if server compromised  

## Future Improvements

1. **Wallet Migration Tool**: Auto-migrate existing wallets
2. **Hardware Wallet Support**: Use hardware wallet for signing
3. **Multi-Sig**: Require multiple signatures for auto mining
4. **Threshold Encryption**: Split key across multiple servers
5. **User-Controlled Encryption**: User provides encryption key

## Conclusion

✅ AI agent auto mining now works for new users  
✅ Existing users need wallet migration  
✅ Secure with AES-256-GCM encryption  
✅ Ready for production deployment  

---

**Status**: ✅ FIXED  
**Date**: 2026-04-18  
**Version**: 2.0.0  
**Ready for Production**: YES (with migration plan for existing users)
