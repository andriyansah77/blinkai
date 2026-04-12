# Wallet Integration - File-Based Storage with AI Agent Support

## Overview

Sistem wallet baru dengan file-based storage (`data/wallets.json`) yang isolated per user. AI agent dapat melakukan operasi wallet secara real-time dari blockchain Tempo Network.

## Fitur Utama

### 1. File-Based Storage ✅
- **Lokasi**: `data/wallets.json`
- **Isolasi**: Per user (userId sebagai key)
- **Enkripsi**: AES-256-GCM untuk private key
- **Format**:
```json
{
  "user-123": {
    "userId": "user-123",
    "address": "0xA3215753cc7D5039884159eB32CC5D79F0Fb29f",
    "encryptedPrivateKey": "...",
    "iv": "...",
    "authTag": "...",
    "createdAt": "2026-04-12T10:30:00.000Z",
    "lastUsed": "2026-04-12T12:45:00.000Z"
  }
}
```

### 2. Real-Time Balance dari Blockchain ✅
- ETH balance (native token)
- REAGENT balance (TIP-20 token)
- PATHUSD balance (stablecoin)
- Query langsung ke Tempo Network RPC

### 3. AI Agent Operations ✅

**Check Balance**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh check_balance
```

**Get Address**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh get_address
```

**Send ETH**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_eth <to_address> <amount>
```

**Send REAGENT**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh send_reagent <to_address> <amount>
```

**Transaction History**:
```bash
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh history
```

## Arsitektur

```
User → AI Agent (Hermes CLI) → Shell Script → cURL → API Endpoint → FileWalletManager → Blockchain
                                                                    ↓
                                                              data/wallets.json
```

## File Structure

```
blinkai/
├── data/
│   └── wallets.json                    # Wallet storage (isolated per user)
├── src/
│   ├── lib/
│   │   └── wallet/
│   │       └── file-wallet-manager.ts  # Wallet manager with file storage
│   └── app/
│       └── api/
│           └── hermes/
│               └── skills/
│                   └── wallet/
│                       └── route.ts    # Wallet API endpoint
├── hermes-skills/
│   └── reagent_wallet_curl.sh          # Shell script for AI agent
└── hermes-profiles/
    └── TOOLS.md                         # Updated with wallet commands
```

## API Endpoint

### POST /api/hermes/skills/wallet

**Authentication**: 
- Session-based (NextAuth) OR
- X-User-ID header (for Hermes CLI)

**Actions**:

1. **check_balance**
   - Returns: Real-time balance from blockchain
   - Response:
   ```json
   {
     "success": true,
     "data": {
       "address": "0xA321...",
       "eth": "0.5",
       "reagent": "50000",
       "pathusd": "10.50"
     },
     "formatted": {
       "address": "0xA321...",
       "eth": "0.5 ETH",
       "reagent": "50000 REAGENT",
       "pathusd": "10.50 PATHUSD"
     }
   }
   ```

2. **get_address**
   - Returns: Wallet address and creation date
   
3. **send_eth**
   - Parameters: `to`, `amount`
   - Validates balance before sending
   - Returns: Transaction hash and explorer URL
   
4. **send_reagent**
   - Parameters: `to`, `amount`
   - Validates balance before sending
   - Returns: Transaction hash and explorer URL
   
5. **get_history**
   - Parameters: `limit` (optional)
   - Returns: Transaction history

## Security Features

### 1. Enkripsi Private Key
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2
- Unique IV per wallet
- Authentication tag untuk integrity

### 2. File Permissions
- `data/` directory: `chmod 700` (owner only)
- `wallets.json`: Readable only by application

### 3. User Isolation
- Setiap user hanya bisa akses wallet sendiri
- userId sebagai key di JSON
- API endpoint validate userId dari session/header

### 4. Balance Validation
- Check balance sebelum send
- Prevent insufficient balance transactions
- Gas fee estimation

## Contoh Penggunaan AI Agent

### Scenario 1: Check Balance

```
User: "Berapa saldo wallet saya?"

AI Agent: *executes check_balance*
AI Agent: "Berikut saldo wallet Anda saat ini:

💰 ETH: 0.5 ETH
🪙 REAGENT: 50,000 tokens
💵 PATHUSD: $10.50

📍 Alamat Wallet: 0xA321...Fb29f

Semua saldo adalah real-time dari blockchain Tempo Network."
```

### Scenario 2: Send REAGENT

```
User: "Kirim 1000 REAGENT ke 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

AI Agent: "Biarkan saya cek saldo REAGENT Anda dulu..."
AI Agent: *executes check_balance*
AI Agent: "Bagus! Anda memiliki 50,000 REAGENT.

Saya bisa mengirim 1,000 REAGENT ke:
📍 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

Biaya:
🪙 1,000 REAGENT (token yang dikirim)
⛽ ~0.0001 ETH (biaya gas)

Lanjutkan?"

User: "Ya, kirim"

AI Agent: "Sempurna! Mengirim sekarang..."
AI Agent: *executes send_reagent*
AI Agent: "✅ Transaksi berhasil dikirim!

🪙 Dikirim: 1,000 REAGENT
📍 Ke: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
🔗 TX Hash: 0x1234567890abcdef...

Saldo baru Anda: 49,000 REAGENT

Lihat di Explorer: https://explore.tempo.xyz/tx/0x1234..."
```

### Scenario 3: Insufficient Balance

```
User: "Kirim 100 ETH ke alamat teman saya"

AI Agent: *executes check_balance*
AI Agent: "Maaf, saldo ETH Anda tidak cukup untuk transaksi ini.

Saldo Saat Ini: 0.5 ETH
Diminta: 100 ETH
Kekurangan: 99.5 ETH

Apakah Anda ingin:
- Kirim jumlah yang lebih kecil (maksimal 0.5 ETH)
- Cek riwayat transaksi
- Lihat cara mendapatkan lebih banyak ETH"
```

## Deployment Steps

### 1. Upload Files

```bash
# Run deployment script
bash blinkai/scripts/deploy-wallet-integration.sh
```

Atau manual:

```bash
# Create data directory
ssh root@159.65.141.68 "mkdir -p /root/blinkai/data && chmod 700 /root/blinkai/data"

# Upload wallet manager
scp blinkai/src/lib/wallet/file-wallet-manager.ts root@159.65.141.68:/root/blinkai/src/lib/wallet/

# Upload API endpoint
scp blinkai/src/app/api/hermes/skills/wallet/route.ts root@159.65.141.68:/root/blinkai/src/app/api/hermes/skills/wallet/

# Upload shell script
scp blinkai/hermes-skills/reagent_wallet_curl.sh root@159.65.141.68:/root/blinkai/hermes-skills/
ssh root@159.65.141.68 "chmod +x /root/blinkai/hermes-skills/reagent_wallet_curl.sh"

# Upload updated TOOLS.md
scp blinkai/hermes-profiles/TOOLS.md root@159.65.141.68:/root/blinkai/hermes-profiles/
```

### 2. Update User Profiles

```bash
ssh root@159.65.141.68 'for profile_dir in /root/.hermes/profiles/user-*; do cp /root/blinkai/hermes-profiles/TOOLS.md "$profile_dir/TOOLS.md"; done'
```

### 3. Rebuild & Restart

```bash
ssh root@159.65.141.68 'cd /root/blinkai && npm run build && pm2 restart reagent'
```

## Testing

### 1. Test Wallet Script

```bash
ssh root@159.65.141.68

# Set environment
export REAGENT_USER_ID="cmnq76h5b0001s4vs3n282mey"
export REAGENT_API_BASE="http://localhost:3000"

# Test check balance
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh check_balance

# Test get address
bash /root/blinkai/hermes-skills/reagent_wallet_curl.sh get_address
```

### 2. Test via AI Agent

```bash
# Use Hermes CLI
hermes --profile user-cmnq76h5b0001s4vs3n282mey chat --query "Berapa saldo wallet saya?"
```

### 3. Test via Dashboard

1. Login ke https://reagent.eu.cc
2. Go to Dashboard → Chat
3. Ask: "Berapa saldo wallet saya?"
4. Verify AI agent executes check_balance command

## Environment Variables

Add to `.env`:

```bash
# Wallet Configuration
WALLET_ENCRYPTION_KEY="your-32-character-encryption-key-here"
TEMPO_RPC_URL="https://rpc.tempo.xyz"
REAGENT_TOKEN_ADDRESS="0x20C000000000000000000000a59277C0c1d65Bc5"
PATHUSD_TOKEN_ADDRESS="0x0000000000000000000000000000000000000000"
```

## Monitoring

### Check Wallet File

```bash
ssh root@159.65.141.68 'cat /root/blinkai/data/wallets.json | jq'
```

### Check Logs

```bash
ssh root@159.65.141.68 'pm2 logs reagent --lines 100'
```

### Check API Endpoint

```bash
curl -X POST https://reagent.eu.cc/api/hermes/skills/wallet \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"action":"get_address"}'
```

## Troubleshooting

### Issue: Wallet not found

**Solution**: Generate wallet first via dashboard or API

### Issue: Insufficient balance

**Solution**: Check balance first, inform user about shortfall

### Issue: Invalid address

**Solution**: Validate address format (0x + 40 hex characters)

### Issue: Transaction failed

**Solution**: Check gas balance, network status, retry

## Future Enhancements

1. **Transaction History from Explorer**
   - Query Tempo Network explorer API
   - Store transaction log in database
   
2. **Multi-Token Support**
   - Support for any TIP-20 token
   - Token discovery and balance checking
   
3. **Gas Estimation**
   - Real-time gas price from network
   - Estimate total transaction cost
   
4. **Batch Transactions**
   - Send to multiple addresses
   - Bulk token transfers
   
5. **Wallet Import/Export**
   - Export encrypted private key
   - Import from private key or mnemonic

## Security Considerations

1. **Never Log Private Keys**: Private keys should never appear in logs
2. **Secure File Permissions**: `data/` directory must be owner-only
3. **Validate All Inputs**: Address format, amount, etc.
4. **Rate Limiting**: Prevent abuse of send operations
5. **User Confirmation**: Always require confirmation for send operations

## Conclusion

Sistem wallet baru dengan file-based storage memberikan:
- ✅ Isolasi per user yang aman
- ✅ Real-time balance dari blockchain
- ✅ AI agent dapat melakukan operasi wallet
- ✅ Enkripsi private key yang kuat
- ✅ Validasi balance sebelum transaksi
- ✅ User-friendly error handling

AI agent sekarang dapat membantu user mengelola wallet mereka dengan aman dan efisien!

---

**Created**: April 12, 2026  
**Status**: Ready for Deployment  
**Version**: 1.0.0
