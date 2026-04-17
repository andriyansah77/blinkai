# Wallet Decryption Issue - Status & Solution

## Problem

Existing wallets in the database cannot be decrypted with the current `WALLET_ENCRYPTION_KEY`. This affects 9 wallets that were created earlier.

## Root Cause

The wallets were likely encrypted with a different encryption key that is no longer available. Possible scenarios:
1. `.env` file was regenerated/changed after wallets were created
2. Encryption key was different during initial testing
3. Bug in original encryption implementation

## Impact

- Users with managed wallets (created through platform) cannot mint tokens server-side
- Wallet decryption fails with error: "Unsupported state or unable to authenticate data"

## Solution Implemented

### 1. External Wallet Support (WORKING)

The platform now fully supports external wallets (MetaMask, etc.) for minting:

- ✅ Users can connect MetaMask wallet
- ✅ Minting transactions are signed client-side
- ✅ No server-side decryption needed
- ✅ Users pay gas directly from their wallet
- ✅ No pathUSD balance deduction for external wallets

**Code Changes:**
- `inscription-engine.ts`: Detects external wallets and returns unsigned transaction
- Frontend: Signs transaction with MetaMask
- No decryption required

### 2. Wallet Skill Script (DEPLOYED)

New wallet management script for AI agents:
- Location: `/root/reagent/hermes-skills/reagent_wallet_curl.sh`
- Permissions: Executable (`chmod +x`)
- Features: check_balance, get_address, send_eth, send_reagent, history

**Note:** Wallet skill only works with external wallets or newly created wallets with correct encryption key.

### 3. Platform Skills (WORKING)

All platform skills now work correctly:
- ✅ 76 skills detected (up from 75)
- ✅ Minting skill functional with external wallets
- ✅ Wallet skill deployed and executable

## Current Status

### Working ✅
- External wallet minting (MetaMask)
- New wallet creation with correct encryption
- Skills sidebar sync (76 skills)
- Channels sidebar sync
- API key configuration
- PathUSD balance checking

### Not Working ❌
- Decryption of existing 9 managed wallets
- Server-side signing for old wallets
- Wallet export for old wallets

## Recommendations

### For Users
1. **Use External Wallet**: Connect MetaMask for minting operations
2. **Create New Wallet**: If you need managed wallet, create a new one (will use correct encryption)
3. **Don't Export Old Wallets**: Old managed wallets cannot be exported

### For Platform
1. **Document External Wallet Flow**: Update user documentation to recommend MetaMask
2. **Disable Managed Wallet Creation**: Until encryption issue is fully resolved
3. **Add Warning**: Show warning for users with old managed wallets

## Technical Details

### Encryption Configuration
```bash
WALLET_ENCRYPTION_KEY="bDVCAHTKiBpd4EnsLqtlh7QyvXNfOGM9"
ENCRYPTION_ALGORITHM="aes-256-gcm"
KEY_LENGTH=32
IV_LENGTH=16
AUTH_TAG_LENGTH=16
```

### Affected Wallets
- Total: 9 wallets
- All created before encryption key was properly set
- All have `encryptedPrivateKey` length: 160 chars
- All have `keyIv` length: 32 chars

### Decryption Logic (CORRECT)
```typescript
// Auth tag is last 32 hex chars (16 bytes)
const authTagHex = encryptedData.slice(-32);
const encryptedHex = encryptedData.slice(0, -32);

const authTag = Buffer.from(authTagHex, 'hex');
const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);
decipher.setAuthTag(authTag);

let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

## Next Steps

1. ✅ Deploy wallet skill script - DONE
2. ✅ Test external wallet minting - WORKING
3. ⏳ Update user documentation
4. ⏳ Add UI warning for old managed wallets
5. ⏳ Consider wallet migration tool (if original key is found)

## Files Modified

- `src/lib/mining/wallet-manager.ts` - Fixed decryption logic
- `hermes-skills/reagent_wallet_curl.sh` - New wallet skill
- `scripts/test-wallet-decryption.ts` - Diagnostic script
- `scripts/fix-wallet-encryption.ts` - Attempted fix script
- `scripts/try-decrypt-with-default-key.ts` - Key testing script

## Conclusion

While old managed wallets cannot be decrypted, the platform is fully functional with external wallets. Users can mint tokens, manage balances, and use all platform features through MetaMask integration.

**Status: TASK 5 - PARTIALLY COMPLETE**
- ✅ Platform skills working
- ✅ Wallet skill deployed
- ✅ External wallet minting working
- ❌ Old managed wallet decryption not resolved (workaround: use external wallet)

---

**Last Updated**: 2026-04-17
**Author**: Kiro AI Assistant
