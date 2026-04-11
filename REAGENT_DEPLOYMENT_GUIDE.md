# REAGENT Token Deployment Guide

## Overview

This guide walks through deploying the REAGENT token on Tempo Network using the TIP20Factory precompiled contract. This is **Phase 0** of the mining feature implementation and must be completed before any minting operations can occur.

## Prerequisites

### 1. Wallet Setup

You need **two wallets**:

1. **Admin Wallet**: 
   - Has DEFAULT_ADMIN_ROLE on the token
   - Used to deploy the token and grant roles
   - Needs gas for deployment transactions
   
2. **Platform Wallet**:
   - Will receive ISSUER_ROLE
   - Used by the platform to mint tokens for users
   - Needs gas for minting transactions

### 2. Quote Token

You need the address of a **USD-denominated TIP-20 token** for DEX pairing. This is required by the TIP20Factory.

Options:
- Use an existing USD stablecoin on Tempo (USDT, USDC, etc.)
- Deploy your own USD-denominated TIP-20 token first

### 3. Gas Funds

Ensure both wallets have sufficient native tokens for gas:
- Admin wallet: ~0.1 ETH (for deployment + role grants)
- Platform wallet: Ongoing gas for minting operations

## Environment Variables

Before running the deployment script, set these environment variables in your `.env` file:

```env
# Tempo Network Configuration
TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"

# Admin Wallet (for deployment)
PLATFORM_ADMIN_PRIVATE_KEY="0x..." # Private key with 0x prefix

# Platform Wallet (will receive ISSUER_ROLE)
PLATFORM_WALLET_ADDRESS="0x..."
PLATFORM_WALLET_PRIVATE_KEY="0x..." # For testing mint

# Quote Token (USD-denominated TIP-20)
QUOTE_TOKEN_ADDRESS="0x..." # Address of USD stablecoin

# Wallet Encryption (for storing user private keys)
WALLET_ENCRYPTION_KEY="your-strong-secret-key-here"
```

## Deployment Steps

### Step 1: Verify Configuration

Check that all environment variables are set:

```bash
# On Windows PowerShell
Get-Content .env | Select-String "TEMPO_RPC_URL|TEMPO_CHAIN_ID|PLATFORM_ADMIN_PRIVATE_KEY|PLATFORM_WALLET_ADDRESS|QUOTE_TOKEN_ADDRESS"

# On Linux/Mac
grep -E "TEMPO_RPC_URL|TEMPO_CHAIN_ID|PLATFORM_ADMIN_PRIVATE_KEY|PLATFORM_WALLET_ADDRESS|QUOTE_TOKEN_ADDRESS" .env
```

### Step 2: Run Deployment Script

Execute the deployment script:

```bash
npx ts-node scripts/deploy-reagent-token.ts
```

The script will:
1. ✅ Connect to Tempo Network
2. ✅ Deploy REAGENT token using TIP20Factory
3. ✅ Verify deployment (name, symbol, decimals)
4. ✅ Grant ISSUER_ROLE to platform wallet
5. ✅ Set supply cap to 400M REAGENT
6. ✅ Test minting 10,000 REAGENT
7. ✅ Save deployment info to `REAGENT_DEPLOYMENT.json`
8. ✅ Update `.env` with token address

### Step 3: Verify Deployment

After successful deployment, verify on Tempo Explorer:

1. Go to https://explorer.tempo.xyz
2. Search for the token address (printed in deployment summary)
3. Verify:
   - Token name: "ReAgent Token"
   - Symbol: "REAGENT"
   - Decimals: 6
   - Supply cap: 400,000,000

### Step 4: Verify Roles

Check that roles are correctly assigned:

```bash
npx ts-node scripts/verify-reagent-roles.ts
```

Expected output:
- ✅ Admin has DEFAULT_ADMIN_ROLE
- ✅ Platform wallet has ISSUER_ROLE
- ✅ Supply cap is 400M REAGENT

### Step 5: Test Minting

Test that platform wallet can mint tokens:

```bash
npx ts-node scripts/test-reagent-mint.ts
```

This will:
1. Mint 10,000 REAGENT to a test address
2. Verify balance increased
3. Verify total supply increased

## Deployment Output

After successful deployment, you'll see:

```
✅ Deployment completed successfully!

📋 DEPLOYMENT SUMMARY
======================================================================
Token Address:          0x1234567890abcdef...
Admin Address:          0xabcdef1234567890...
Platform Wallet:        0x9876543210fedcba...
Quote Token:            0xfedcba0987654321...
Timestamp:              2024-01-15T10:30:00.000Z
======================================================================

📝 Next Steps:
   1. Verify token on Tempo Explorer: https://explorer.tempo.xyz
   2. Update .env with REAGENT_TOKEN_ADDRESS
   3. Test minting functionality
   4. Proceed with Phase 3 implementation
======================================================================
```

## Files Created

After deployment, these files will be created:

1. **REAGENT_DEPLOYMENT.json**: Complete deployment information
2. **.env** (updated): Contains REAGENT_TOKEN_ADDRESS

## Troubleshooting

### Error: "Admin wallet has no balance for gas fees"

**Solution**: Send native tokens to the admin wallet address for gas.

### Error: "QUOTE_TOKEN_ADDRESS not set in environment"

**Solution**: Set the quote token address in `.env`. This must be a valid USD-denominated TIP-20 token on Tempo Network.

### Error: "Network mismatch: Expected 4217, got ..."

**Solution**: Verify TEMPO_RPC_URL is pointing to Tempo mainnet (https://rpc.tempo.xyz).

### Error: "Failed to grant ISSUER_ROLE"

**Solution**: 
1. Verify admin wallet has DEFAULT_ADMIN_ROLE
2. Check that platform wallet address is correct
3. Ensure transaction was confirmed

### Error: "Mint test failed"

**Solution**:
1. Verify ISSUER_ROLE was granted correctly
2. Check platform wallet has gas for transactions
3. Verify supply cap is not exceeded

## Security Considerations

### Private Key Storage

⚠️ **CRITICAL**: Never commit private keys to version control!

- Store private keys in `.env` (already in `.gitignore`)
- Use environment variables in production
- Consider using hardware wallets for admin operations
- Encrypt platform wallet private key in database

### Role Management

- **DEFAULT_ADMIN_ROLE**: Keep admin private key in cold storage
- **ISSUER_ROLE**: Only platform wallet should have this role
- **PAUSE_ROLE**: Consider granting to emergency response wallet

### Supply Cap

- Supply cap is set to 400M REAGENT
- This CANNOT be exceeded (enforced by contract)
- 50% (200M) allocated for minting operations
- 20,000 max minting operations (200M / 10K per mint)

## Post-Deployment Checklist

- [ ] Token deployed successfully
- [ ] Token verified on Tempo Explorer
- [ ] ISSUER_ROLE granted to platform wallet
- [ ] Supply cap set to 400M REAGENT
- [ ] Test mint successful
- [ ] REAGENT_TOKEN_ADDRESS added to .env
- [ ] Deployment info saved to REAGENT_DEPLOYMENT.json
- [ ] Admin private key secured (cold storage)
- [ ] Platform wallet private key encrypted
- [ ] Documentation updated with token address

## Next Steps

After successful deployment:

1. **Update Task Status**: Mark Phase 0 tasks as complete
2. **Proceed to Phase 3**: Frontend UI and Agent Integration
3. **Test Integration**: Verify minting engine works with deployed token
4. **Monitor**: Set up monitoring for token contract events

## Reference

- **Tempo Documentation**: https://docs.tempo.xyz
- **TIP-20 Specification**: https://docs.tempo.xyz/protocol/tip20/spec
- **Tempo Explorer**: https://explorer.tempo.xyz
- **TIP20Factory Address**: 0x20Fc000000000000000000000000000000000000

## Support

If you encounter issues:

1. Check Tempo Network status
2. Verify all environment variables
3. Review transaction on Tempo Explorer
4. Check admin wallet balance
5. Consult Tempo documentation

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
