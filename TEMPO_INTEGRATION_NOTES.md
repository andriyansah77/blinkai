# Tempo Network Integration Notes

## Overview

Implementasi mining feature menggunakan **Tempo Network** dengan **TIP-20 token standard** (bukan inscription system seperti Bitcoin Ordinals).

## Tempo Network Details

- **Mainnet RPC**: `https://rpc.tempo.xyz`
- **Chain ID**: `4217`
- **Explorer**: https://explorer.tempo.xyz
- **Documentation**: https://docs.tempo.xyz

## TIP-20 Token Standard

REAGENT token menggunakan TIP-20, yang merupakan extended ERC-20 dengan fitur:
- Standard ERC-20 functions (transfer, approve, etc.)
- Memo support untuk transfers
- Role-based access control (ISSUER_ROLE, PAUSE_ROLE, etc.)
- 6 decimals (bukan 18 seperti ETH)
- Built-in compliance features

### Key Differences from ERC-20

1. **Decimals**: TIP-20 uses 6 decimals (not 18)
2. **Minting**: Requires `ISSUER_ROLE` permission
3. **Currency**: Must specify ISO 4217 currency code (e.g., "USD")
4. **Quote Token**: Must specify quote token for DEX pairing

## REAGENT Token Deployment

### Step 1: Deploy REAGENT Token

Gunakan TIP20Factory untuk deploy REAGENT token:

```typescript
// TIP20Factory address (precompiled)
const FACTORY_ADDRESS = '0x20Fc000000000000000000000000000000000000';

// Deploy parameters
const params = {
  name: 'ReAgent Token',
  symbol: 'REAGENT',
  currency: 'USD', // ISO 4217 code
  quoteToken: '0x...', // USD-denominated TIP-20 token address
  admin: '0x...', // Platform admin address
  salt: ethers.id('reagent-v1') // Unique salt for deterministic address
};

// Call createToken
const factory = new ethers.Contract(FACTORY_ADDRESS, TIP20FactoryABI, signer);
const reagentAddress = await factory.createToken(
  params.name,
  params.symbol,
  params.currency,
  params.quoteToken,
  params.admin,
  params.salt
);
```

### Step 2: Grant ISSUER_ROLE

Platform wallet harus memiliki ISSUER_ROLE untuk mint tokens:

```typescript
const ISSUER_ROLE = ethers.id('ISSUER_ROLE');
const reagentToken = new ethers.Contract(reagentAddress, TIP20ABI, adminSigner);

// Grant ISSUER_ROLE to platform wallet
await reagentToken.grantRole(ISSUER_ROLE, platformWalletAddress);
```

### Step 3: Update Environment Variables

```env
REAGENT_TOKEN_ADDRESS="0x..." # Deployed REAGENT token address
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"
```

## Minting Process

### Current Implementation

Inscription Engine sudah diupdate untuk menggunakan TIP-20 mint function:

```typescript
// Encode mint function call
const iface = new ethers.Interface([
  'function mint(address to, uint256 amount) external'
]);

// TIP-20 uses 6 decimals
const amountInUnits = ethers.parseUnits('10000', 6); // 10,000 REAGENT

const mintData = iface.encodeFunctionData('mint', [userAddress, amountInUnits]);
```

### Transaction Flow

1. User requests inscription (auto or manual)
2. Platform deducts USD balance (0.5 or 1.0 PATHUSD)
3. Platform constructs TIP-20 mint transaction
4. Platform signs with wallet that has ISSUER_ROLE
5. Transaction submitted to Tempo Network
6. On confirmation, user receives 10,000 REAGENT tokens

## Token Economics

- **Total Supply**: 400,000,000 REAGENT (400M)
- **Inscription Allocation**: 200,000,000 REAGENT (50%)
- **Tokens per Inscription**: 10,000 REAGENT
- **Max Inscriptions**: 20,000 (200M / 10K)
- **Decimals**: 6 (TIP-20 standard)

## Platform Wallet Requirements

Platform wallet yang melakukan minting harus:

1. **Have ISSUER_ROLE** on REAGENT token contract
2. **Have sufficient gas** (in native Tempo tokens or USD stablecoin)
3. **Be properly secured** (private key encrypted with AES-256)

## Gas Fees

Tempo Network supports paying gas fees in stablecoins (USD TIP-20 tokens):

- Users can pay gas in PATHUSD or other USD stablecoins
- No need to hold native Tempo tokens
- Gas prices are typically very low (optimized for payments)

## Security Considerations

### Role Management

- **ISSUER_ROLE**: Only platform wallet should have this role
- **DEFAULT_ADMIN_ROLE**: Separate admin wallet for role management
- **PAUSE_ROLE**: Emergency pause capability

### Supply Cap

Set supply cap to prevent unlimited minting:

```typescript
// Set supply cap to 400M REAGENT
await reagentToken.setSupplyCap(ethers.parseUnits('400000000', 6));
```

### Transfer Policy

Configure TIP-403 transfer policy if needed for compliance:

```typescript
// Default policy ID = 1 (always allow)
// Can be changed for KYC/compliance requirements
await reagentToken.changeTransferPolicyId(policyId);
```

## Testing

### Testnet

Tempo may have a testnet - check documentation for:
- Testnet RPC URL
- Testnet Chain ID
- Testnet faucet for gas tokens

### Local Testing

For local development:
1. Use mock contracts that implement TIP-20 interface
2. Test with Hardhat/Foundry local network
3. Deploy to testnet before mainnet

## Next Steps

1. **Deploy REAGENT Token**:
   - Use TIP20Factory to deploy
   - Grant ISSUER_ROLE to platform wallet
   - Set supply cap to 400M
   - Update REAGENT_TOKEN_ADDRESS in .env

2. **Test Minting**:
   - Test mint transaction on testnet
   - Verify token balance updates
   - Check gas costs

3. **Update Documentation**:
   - Document actual REAGENT token address
   - Document platform wallet address
   - Document role assignments

4. **Security Audit**:
   - Review role permissions
   - Test emergency pause
   - Verify supply cap enforcement

## References

- [Tempo Documentation](https://docs.tempo.xyz)
- [TIP-20 Specification](https://docs.tempo.xyz/protocol/tip20/spec)
- [TIP-20 Factory](https://docs.tempo.xyz/protocol/tip20/spec#tip20factory)
- [Tempo Explorer](https://explorer.tempo.xyz)

## Important Notes

⚠️ **CRITICAL**: Platform wallet private key harus di-encrypt dengan AES-256 dan disimpan dengan aman. Wallet ini memiliki ISSUER_ROLE dan dapat mint unlimited tokens jika tidak ada supply cap.

⚠️ **SUPPLY CAP**: Pastikan supply cap di-set ke 400M REAGENT untuk mencegah minting berlebihan.

⚠️ **DECIMALS**: TIP-20 menggunakan 6 decimals, bukan 18. Pastikan semua perhitungan menggunakan `parseUnits(amount, 6)`.

⚠️ **QUOTE TOKEN**: REAGENT harus memiliki quote token yang valid (USD-denominated TIP-20 token) untuk DEX integration.
