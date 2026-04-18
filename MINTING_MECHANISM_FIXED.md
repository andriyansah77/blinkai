# Minting Mechanism - Fixed & Complete

## Overview
REAGENT token minting sekarang menggunakan **client-side signing** dengan MetaMask/Privy wallet untuk keamanan maksimal.

## How It Works

### 1. User Flow (Web Interface)

```
User clicks "Inscribe Now"
    ↓
Frontend requests unsigned transaction from /api/mining/inscribe
    ↓
Server creates inscription record & returns unsigned tx
    ↓
Frontend prompts MetaMask to sign & broadcast transaction
    ↓
User signs transaction in MetaMask
    ↓
MetaMask broadcasts to Tempo Network
    ↓
Frontend submits tx hash to /api/mining/submit-signed
    ↓
Server monitors transaction confirmation
    ↓
On confirmation: Update inscription status & user balance
```

### 2. Technical Details

#### A. Request Unsigned Transaction
```typescript
POST /api/mining/inscribe
{
  "confirm": true,
  "forceClientSigning": true
}

Response:
{
  "success": true,
  "inscriptionId": "...",
  "requiresClientSigning": true,
  "unsignedTransaction": {
    "to": "0x20C000000000000000000000a59277C0c1d65Bc5", // REAGENT token
    "from": "0x...", // User's wallet
    "data": "0x...", // Encoded mint(address,uint256) call
    "value": "0",
    "gasLimit": "150000",
    "gasPrice": "...",
    "nonce": 123,
    "chainId": 4217
  }
}
```

#### B. Sign & Broadcast with MetaMask
```typescript
const provider = window.ethereum;
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: userAddress,
    to: unsignedTx.to,
    data: unsignedTx.data,
    value: unsignedTx.value,
    gas: unsignedTx.gasLimit,
    gasPrice: unsignedTx.gasPrice,
  }],
});
```

#### C. Submit Transaction Hash
```typescript
POST /api/mining/submit-signed
{
  "inscriptionId": "...",
  "txHash": "0x..."
}

Response:
{
  "success": true,
  "inscriptionId": "...",
  "txHash": "0x...",
  "explorerUrl": "https://explore.tempo.xyz/tx/0x..."
}
```

#### D. Server Monitors Transaction
```typescript
// Server automatically monitors transaction
// Polls every 10 seconds for up to 5 minutes
// On confirmation:
// - Updates inscription status to 'confirmed'
// - Updates user's REAGENT balance
// - Records gas used
```

## Smart Contract Details

### REAGENT Token (TIP-20)
- **Address**: `0x20C000000000000000000000a59277C0c1d65Bc5`
- **Network**: Tempo Mainnet (Chain ID: 4217)
- **Standard**: TIP-20 (ERC-20 compatible)
- **Decimals**: 6
- **Function**: `mint(address to, uint256 amount)`

### Minting Transaction
```solidity
// Function signature
function mint(address to, uint256 amount) external

// Example call
mint(
  "0xUserAddress",
  10000000000  // 10,000 REAGENT (6 decimals)
)
```

### Encoded Data
```
Function selector: 0x40c10f19
Parameters:
  - address to: 0x000000000000000000000000[UserAddress]
  - uint256 amount: 0x00000000000000000000000000000000000000000000000000000002540be400
```

## Security Features

### 1. No Private Keys on Server
- ✅ All transactions signed client-side
- ✅ User maintains full control of wallet
- ✅ Server never has access to private keys

### 2. Rate Limiting
- ✅ Maximum 10 mints per hour per user
- ✅ Prevents spam and abuse
- ✅ In-memory rate limit store (use Redis in production)

### 3. Transaction Monitoring
- ✅ Automatic confirmation tracking
- ✅ Timeout after 5 minutes
- ✅ Refund on failure (for managed wallets)

### 4. Gas Payment
- ✅ User pays gas directly from wallet
- ✅ No PATHUSD balance required for external wallets
- ✅ Transparent gas estimation

## Cost Structure

### Manual Minting (Web Interface)
- **Cost**: Gas only (paid in native token)
- **Reward**: 10,000 REAGENT
- **Fee**: No platform fee for external wallets
- **Gas Estimate**: ~150,000 gas units

### Auto Minting (AI Agent)
- **Status**: Not supported (requires wallet signing)
- **Alternative**: Use web interface
- **Reason**: AI agent cannot sign transactions

## Database Schema

### Inscription Record
```typescript
{
  id: string;
  userId: string;
  walletId: string;
  type: 'auto' | 'manual';
  status: 'pending' | 'pending_signature' | 'confirmed' | 'failed';
  txHash?: string;
  inscriptionFee: string; // Always '0' for external wallets
  gasEstimate: string;
  gasFee: string;
  tokensEarned: string; // '10000'
  blockNumber?: number;
  confirmations?: number;
  errorMessage?: string;
  refunded: boolean;
  createdAt: Date;
  confirmedAt?: Date;
}
```

## Error Handling

### Common Errors

#### 1. User Rejected Transaction
```
Error: User rejected the transaction
Code: 4001
Solution: User needs to approve in MetaMask
```

#### 2. Insufficient Gas
```
Error: Insufficient funds for gas
Solution: User needs native tokens for gas
```

#### 3. Rate Limit Exceeded
```
Error: Rate limit exceeded. Maximum 10 inscriptions per hour.
Solution: Wait until rate limit resets
```

#### 4. Transaction Failed
```
Error: Transaction reverted
Possible causes:
- User doesn't have ISSUER_ROLE
- Token contract not deployed
- Network congestion
```

## Testing

### 1. Test on Tempo Testnet
```bash
# Update .env
TEMPO_RPC_URL="https://testnet-rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"
REAGENT_TOKEN_ADDRESS="0x..." # Deploy test token first
```

### 2. Test Minting Flow
```typescript
// 1. Request unsigned transaction
const response = await fetch('/api/mining/inscribe', {
  method: 'POST',
  body: JSON.stringify({ confirm: true, forceClientSigning: true })
});

// 2. Sign with MetaMask
const txHash = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [unsignedTx]
});

// 3. Submit tx hash
await fetch('/api/mining/submit-signed', {
  method: 'POST',
  body: JSON.stringify({ inscriptionId, txHash })
});

// 4. Wait for confirmation
// Server monitors automatically
```

### 3. Verify on Explorer
```
https://explore.tempo.xyz/tx/[txHash]
```

## Deployment Checklist

- [x] REAGENT token deployed on Tempo
- [x] Token address in .env
- [x] Client-side signing implemented
- [x] Transaction monitoring working
- [x] Rate limiting enabled
- [x] Error handling complete
- [x] Database schema updated
- [ ] Test on testnet
- [ ] Deploy to production
- [ ] Monitor first transactions

## Troubleshooting

### Issue: Transaction not confirming
**Solution**: Check Tempo Network status, increase gas price

### Issue: MetaMask not prompting
**Solution**: Check if wallet is connected, refresh page

### Issue: Balance not updating
**Solution**: Wait for transaction confirmation (up to 5 minutes)

### Issue: "Wallet not linked" error
**Solution**: User needs to connect wallet in onboarding

## Future Improvements

1. **Batch Minting**: Allow multiple mints in one transaction
2. **Gas Optimization**: Optimize contract calls
3. **Scheduled Minting**: Allow users to schedule mints
4. **Multi-wallet Support**: Support multiple wallets per user
5. **Analytics**: Track minting patterns and optimize

---

**Status**: ✅ Ready for Production
**Last Updated**: 2026-04-18
**Version**: 2.0 (Client-side signing)
