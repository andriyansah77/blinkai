# Slash Command: /mine

## Overview
Slash command `/mine` memungkinkan user untuk auto mining REAGENT tokens langsung dari chat interface menggunakan MetaMask wallet mereka.

## Cara Penggunaan

### Syntax
```
/mine [amount]
```

### Parameters
- `amount` (optional): Jumlah minting yang ingin dilakukan (1-10)
  - Default: 1 jika tidak dispesifikasikan
  - Setiap mint menghasilkan 10,000 REAGENT tokens

### Contoh
```
/mine          → Mint 1x (10,000 REAGENT)
/mine 3        → Mint 3x (30,000 REAGENT)
/mine 10       → Mint 10x (100,000 REAGENT)
```

## Cara Kerja

### Flow
1. User ketik `/mine` atau `/mine 5` di chat
2. System request unsigned transaction dari API
3. MetaMask popup muncul untuk approve transaction
4. User approve di MetaMask
5. Transaction di-broadcast ke blockchain
6. System monitor transaction confirmation
7. Chat menampilkan progress dan hasil

### Technical Flow
```
User Input → handleMineCommand()
           ↓
GET /api/mining/mine-chat (unsigned tx)
           ↓
MetaMask Sign & Broadcast
           ↓
POST /api/mining/submit-signed (tx hash)
           ↓
Monitor Transaction
           ↓
Display Result in Chat
```

## Requirements

### User Requirements
- MetaMask installed dan connected
- Wallet sudah di-generate saat onboarding
- Sufficient PATHUSD untuk gas fees
- Wallet memiliki ISSUER_ROLE pada REAGENT token contract

### Technical Requirements
- Browser dengan MetaMask extension
- Active Privy session
- Wallet linked to user account

## Implementation Details

### Frontend (HermesChat.tsx)
```typescript
// Handle /mine command
const handleMineCommand = async (args: string[]) => {
  // 1. Parse amount
  const amount = args.length > 0 ? parseInt(args[0]) : 1;
  
  // 2. Check MetaMask
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  
  // 3. Loop for each mint
  for (let i = 0; i < amount; i++) {
    // Get unsigned tx
    const result = await fetch('/api/mining/mine-chat', { method: 'POST' });
    
    // Sign with MetaMask
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    });
    
    // Submit for monitoring
    await fetch('/api/mining/submit-signed', {
      body: JSON.stringify({ inscriptionId, txHash })
    });
  }
}
```

### Backend (mine-chat/route.ts)
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const session = await getPrivySession(request);
  
  // 2. Execute inscription (returns unsigned tx)
  const result = await inscriptionEngine.executeInscription(
    userId,
    'auto',  // Type auto
    false    // Don't force client signing
  );
  
  return NextResponse.json(result);
}
```

### Inscription Engine
```typescript
// Always return unsigned transaction for chat mining
const tx = await this.constructInscriptionTransaction(wallet.address);

return {
  success: true,
  inscriptionId: inscription.id,
  requiresClientSigning: true,
  unsignedTransaction: tx
};
```

## Features

### Progress Display
Chat menampilkan real-time progress:
```
⛏️ Starting auto mining for 3 REAGENT tokens...

✅ Mint 1/3: Transaction submitted
   TX Hash: 0x1234567...89abcdef
   Tokens: 10000 REAGENT

✅ Mint 2/3: Transaction submitted
   TX Hash: 0xabcdef1...23456789
   Tokens: 10000 REAGENT

✅ Mint 3/3: Transaction submitted
   TX Hash: 0x9876543...fedcba21
   Tokens: 10000 REAGENT

🎉 Mining complete! Minted 30000 REAGENT tokens.

Transactions are being confirmed on the blockchain. 
Check your balance on the Mining page in a few minutes.
```

### Error Handling
```
❌ Mining failed: MetaMask not found. Please install MetaMask to use auto mining.

Usage: /mine [amount]
Example: /mine 5 (mints 5 times, earning 50,000 REAGENT)

Note: You need MetaMask installed and connected to use this command.
```

## Rate Limiting

- Maximum 10 mints per command
- 2 second delay between each mint
- Backend rate limit: 10 mints per hour per user

## Gas Fees

- User pays gas fees from their own wallet
- No PATHUSD deduction for external wallets
- Estimated gas: ~150,000 gas per mint
- Gas price: Dynamic based on network

## Security

- All transactions signed client-side with MetaMask
- Private keys never sent to server
- Server only receives tx hash after broadcast
- User must approve each transaction in MetaMask

## Benefits

### vs Manual Mining
- ✅ Faster: No need to open mining page
- ✅ Convenient: Mine from chat interface
- ✅ Batch: Mint multiple times with one command
- ✅ Progress: Real-time feedback in chat

### vs Managed Wallet
- ✅ Simpler: No need to enable managed wallet
- ✅ Secure: Private keys stay in MetaMask
- ✅ Transparent: User approves each transaction
- ✅ No setup: Works with existing wallet

## Limitations

- Requires MetaMask installed
- User must approve each transaction manually
- Cannot run fully automated (needs user interaction)
- Limited to 10 mints per command

## Future Enhancements

1. Support other wallets (WalletConnect, Coinbase Wallet)
2. Batch transactions (approve once, mint multiple)
3. Schedule mining (set time for auto mining)
4. Mining notifications (Discord, Telegram)
5. Mining analytics (track earnings over time)

## Testing

### Test Cases
1. `/mine` - Single mint
2. `/mine 5` - Multiple mints
3. `/mine 0` - Invalid amount (should error)
4. `/mine 11` - Exceeds limit (should error)
5. `/mine abc` - Invalid input (should error)
6. Without MetaMask - Should show error
7. User rejects transaction - Should handle gracefully

### Manual Testing
```bash
# 1. Open chat
https://reagent.eu.cc/dashboard/chat

# 2. Type command
/mine 3

# 3. Approve in MetaMask
# 4. Wait for completion
# 5. Check balance on mining page
```

## Deployment

### Files Changed
- `src/components/dashboard/HermesChat.tsx` - Added /mine command handler
- `src/app/api/mining/mine-chat/route.ts` - New API endpoint
- `src/lib/mining/inscription-engine.ts` - Simplified auto mining
- `src/types/ethereum.d.ts` - MetaMask type definitions

### Deploy Steps
```bash
cd /root/reagent
git pull origin main
npm run build
pm2 restart reagent
```

### Verify
```bash
# Check if command appears in suggestions
# Type "/" in chat and look for /mine

# Test command
/mine 1

# Check logs
pm2 logs reagent
```

## Support

### Common Issues

**"MetaMask not found"**
- Install MetaMask extension
- Refresh page after installation

**"Transaction failed"**
- Check wallet has PATHUSD for gas
- Check wallet has ISSUER_ROLE
- Check network is Tempo Mainnet

**"Invalid amount"**
- Use number between 1-10
- Example: /mine 5

**"Rate limit exceeded"**
- Wait 1 hour before mining again
- Maximum 10 mints per hour

## Documentation

- User Guide: See Mining page help section
- API Docs: `/api/mining/mine-chat`
- Developer Docs: This file

## Changelog

### v1.0.0 (2026-04-18)
- Initial implementation
- Support /mine command with amount parameter
- MetaMask integration
- Real-time progress display
- Error handling and validation
