# Testing AI Agent Auto Mining

## Prerequisites

1. VPS deployed and running at https://reagent.eu.cc
2. User account created and logged in
3. Wallet connected (MetaMask or Privy)
4. Some PATHUSD in wallet for gas fees

## Test Steps

### 1. Enable Managed Wallet

1. Open https://reagent.eu.cc/mining
2. Scroll to "AI Agent Auto Mining" section
3. Look for "Managed Wallet for Auto Mining" subsection
4. Click "Enable Managed Wallet" button
5. Wait for confirmation toast
6. Verify status badge changes to "Enabled" with green checkmark

**Expected Result:**
- Success toast: "Managed wallet enabled! AI agent can now mint tokens automatically."
- Status badge shows green "Enabled"
- New wallet address generated and stored in database with encrypted private key

### 2. Verify Database

SSH to VPS and check database:

```bash
ssh root@188.166.247.252
psql -U reagent -d reagent -c "SELECT address, LENGTH(\"encryptedPrivateKey\") as key_length, LENGTH(\"keyIv\") as iv_length FROM \"Wallet\" WHERE \"userId\" = 'YOUR_USER_ID';"
```

**Expected Result:**
- `key_length` should be > 0 (encrypted private key exists)
- `iv_length` should be 32 (16 bytes in hex)
- `address` should be the new managed wallet address

### 3. Test API Endpoint

Check wallet API response:

```bash
curl -X GET https://reagent.eu.cc/api/wallet \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  | jq
```

**Expected Result:**
```json
{
  "success": true,
  "address": "0x...",
  "hasManagedWallet": true,
  ...
}
```

### 4. Test AI Agent Auto Mining

#### Option A: Via Hermes CLI

```bash
# Set API key
export REAGENT_API_KEY="your_api_key_from_dashboard"

# Test auto mining
hermes chat "Start mining REAGENT tokens"
```

#### Option B: Via Direct API Call

```bash
curl -X POST https://reagent.eu.cc/api/mining/inscribe \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "type": "auto",
    "forceClientSigning": false
  }' \
  | jq
```

**Expected Result:**
```json
{
  "success": true,
  "inscriptionId": "...",
  "txHash": "0x...",
  "tokensEarned": "10000",
  "message": "Transaction submitted successfully"
}
```

### 5. Monitor Transaction

Check transaction on Tempo Explorer:
```
https://temposcan.io/tx/TX_HASH
```

Or check inscription status:
```bash
curl -X GET https://reagent.eu.cc/api/mining/inscriptions?page=1&limit=10 \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  | jq
```

**Expected Result:**
- Transaction appears on blockchain
- Status changes from "pending" to "confirmed"
- REAGENT balance increases by 10,000

### 6. Verify Balance Update

Refresh mining page and check:
- REAGENT balance increased
- Transaction appears in history
- Status shows "Confirmed"

## Error Cases to Test

### 1. Auto Mining Without Managed Wallet

Disable managed wallet in database:
```sql
UPDATE "Wallet" SET "encryptedPrivateKey" = '', "keyIv" = '' WHERE "userId" = 'YOUR_USER_ID';
```

Try auto mining - should get error:
```json
{
  "success": false,
  "error": "Auto mining requires managed wallet. Please enable managed wallet in settings to allow AI agent to mint on your behalf."
}
```

### 2. Invalid API Key

Try with wrong API key - should get 401 Unauthorized

### 3. Insufficient Gas

Try minting with empty managed wallet - should fail with gas error

## Logs to Check

### PM2 Logs
```bash
pm2 logs reagent --lines 100
```

Look for:
- `[InscriptionEngine] Using server-side signing with managed wallet`
- `[WalletManager] Decrypting private key...`
- `[WalletManager] Decryption successful`
- `Transaction submitted successfully`

### Database Logs
```bash
psql -U reagent -d reagent -c "SELECT * FROM \"Inscription\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

Check:
- `type` = 'auto'
- `status` = 'confirmed'
- `txHash` is present
- `tokensEarned` = '10000'

## Troubleshooting

### Error: "Failed to decrypt private key"

Check:
1. `WALLET_ENCRYPTION_KEY` in .env matches key used during encryption
2. `encryptedPrivateKey` and `keyIv` are not corrupted in database
3. Key length is exactly 32 characters

### Error: "Wallet not found"

Check:
1. User is logged in
2. Wallet exists in database
3. Session cookie is valid

### Error: "Transaction failed"

Check:
1. Managed wallet has PATHUSD for gas
2. REAGENT token contract is deployed
3. Managed wallet has ISSUER_ROLE on token contract
4. RPC endpoint is responding

## Success Criteria

- ✅ Managed wallet can be enabled from UI
- ✅ Private key is encrypted and stored in database
- ✅ API returns `hasManagedWallet: true`
- ✅ Auto mining request succeeds
- ✅ Transaction is signed server-side
- ✅ Transaction is broadcast to blockchain
- ✅ Transaction confirms within 5 minutes
- ✅ REAGENT balance increases
- ✅ Inscription record is created with status "confirmed"
- ✅ AI agent can trigger auto mining via chat

## Performance Metrics

- Enable managed wallet: < 2 seconds
- Auto mining request: < 1 second
- Transaction broadcast: < 5 seconds
- Transaction confirmation: 10-60 seconds
- Balance update: < 30 seconds (cache refresh)

## Security Checks

- ✅ Private key never exposed in API responses
- ✅ Private key only decrypted in memory during signing
- ✅ Encryption uses AES-256-GCM with auth tag
- ✅ IV is unique per wallet
- ✅ API key required for auto mining
- ✅ Rate limiting enforced (10 per hour)
