# Auto-Setup Onboarding - Implementation Complete

## Overview
Implementasi lengkap auto-setup saat onboarding untuk user baru, termasuk profile creation, gateway installation, dan wallet setup dengan opsi generate atau import.

## Features Implemented

### 1. Auto-Create Hermes Profile ✅
- Profile otomatis dibuat saat user menyelesaikan onboarding
- Profile name disanitize untuk kompatibilitas dengan Hermes CLI (remove colons dari Privy user ID)
- Config.yaml dan .env otomatis di-setup dengan AI provider credentials
- Profile markdown files (PLATFORM.md, TOOLS.md, SOUL.md) otomatis di-copy

**Location**: `src/lib/hermes-integration.ts` - `createProfile()` method

### 2. Auto-Install & Start Gateway Service ✅
- Gateway service otomatis di-install saat onboarding
- Gateway otomatis di-start setelah installation
- Status gateway (installed/running) ditampilkan di deployment success screen
- Error handling untuk kasus gateway gagal start (non-blocking)

**Location**: 
- `src/app/api/onboarding/deploy/route.ts` - Gateway setup logic
- `src/lib/hermes-integration.ts` - `setupGateway()`, `startGateway()` methods

### 3. Wallet Setup with Generate/Import Options ✅
- **New onboarding step**: Wallet Setup (step 2 of 5)
- **Generate Option**: Create new wallet automatically
  - Privy embedded wallet (TODO - fallback to ethers for now)
  - Ethers.js wallet generation as fallback
  - Private key encrypted with AES-256
- **Import Option**: Import existing wallet with private key
  - Validate private key format
  - Support with/without 0x prefix
  - Secure encryption before storage

**Endpoints**:
- `POST /api/wallet/generate` - Generate new wallet
- `POST /api/wallet/import` - Import external wallet

**Location**:
- `src/app/onboarding/page.tsx` - WalletSetupStep component
- `src/app/api/wallet/generate/route.ts`
- `src/app/api/wallet/import/route.ts`

## Onboarding Flow (Updated)

### Step 1: Agent Setup
- User enters agent name and personality
- Optional personality traits selection

### Step 2: Wallet Setup (NEW)
- Choose between Generate or Import
- **Generate**: Auto-create secure wallet
- **Import**: Enter private key to import existing wallet
- Wallet address displayed on success

### Step 3: Channels
- Select messaging platforms (Discord, Telegram, Slack, WhatsApp)
- Can be configured later from dashboard

### Step 4: Plan Selection
- Choose between Free, Pro, or Enterprise plan
- Credits allocated based on plan

### Step 5: Deployment
- Auto-create Hermes profile
- Auto-install gateway service
- Auto-start gateway
- Install default skills
- Auto-install minting skill
- Display deployment status with:
  - Wallet information
  - Gateway service status
  - Success/error messages

## Technical Details

### Wallet Encryption
- Algorithm: AES-256-CBC
- Key: `WALLET_ENCRYPTION_KEY` environment variable
- IV: Random 16 bytes per wallet
- Storage: Encrypted private key + IV in database

### Gateway Service
- Installation: `hermes --profile <profile> gateway install`
- Start: `hermes --profile <profile> gateway start`
- Status tracking: installed, running, error
- Non-blocking: Onboarding continues even if gateway fails

### Profile Sanitization
- Privy user IDs: `did:privy:xxx` → `user-did-privy-xxx`
- Regex: Replace all non-alphanumeric with `-`, convert to lowercase
- Hermes constraint: `[a-z0-9][a-z0-9_-]{0,63}`

## Database Schema

### Wallet Table
```prisma
model Wallet {
  id                   String   @id @default(cuid())
  userId               String   @unique
  address              String   @unique
  encryptedPrivateKey  String   // AES-256 encrypted
  keyIv                String   // Initialization vector
  reagentBalance       String   @default("0")
  pathusdBalance       String   @default("0")
  lastBalanceUpdate    DateTime @default(now())
  network              String   @default("tempo")
  imported             Boolean  @default(false) // true if imported, false if generated
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

## API Endpoints

### POST /api/wallet/generate
Generate new wallet for authenticated user.

**Request**: None (uses auth token)

**Response**:
```json
{
  "success": true,
  "address": "0x...",
  "source": "ethers",
  "message": "Wallet generated successfully"
}
```

### POST /api/wallet/import
Import external wallet using private key.

**Request**:
```json
{
  "privateKey": "0x..." // or without 0x prefix
}
```

**Response**:
```json
{
  "success": true,
  "address": "0x...",
  "imported": true,
  "message": "External wallet imported successfully"
}
```

### POST /api/onboarding/deploy
Deploy agent with auto-setup (updated to include gateway).

**Response** (updated):
```json
{
  "success": true,
  "agent": { "id": "...", "name": "...", "description": "..." },
  "hermes": { "instanceId": "...", "cliAvailable": true },
  "gateway": {
    "installed": true,
    "running": true,
    "error": null
  },
  "credits": 1000,
  "plan": "free",
  "sessionId": "...",
  "message": "Agent deployed successfully"
}
```

## Security Considerations

### Wallet Security
- Private keys never transmitted in plain text (except during import)
- AES-256 encryption for storage
- Unique IV per wallet
- Encryption key stored in environment variable (not in code)

### Gateway Security
- Each user has isolated profile
- Gateway runs under user's profile context
- No cross-user access

### Profile Isolation
- Each user has separate Hermes profile
- Profiles stored in `/root/.hermes/profiles/<profile-name>/`
- Environment variables isolated per profile

## Testing

### Test Wallet Generation
1. Sign up with new account
2. Complete onboarding
3. Choose "Generate New Wallet"
4. Verify wallet created in database
5. Check wallet displayed in dashboard

### Test Wallet Import
1. Sign up with new account
2. Complete onboarding
3. Choose "Import Existing Wallet"
4. Enter valid private key
5. Verify wallet imported correctly
6. Check wallet address matches

### Test Gateway Auto-Start
1. Sign up with new account
2. Complete onboarding
3. Check deployment success screen shows gateway status
4. SSH to VPS: `hermes --profile user-<sanitized-id> gateway status`
5. Verify gateway is running

## Deployment

### Commit
```bash
git commit -m "feat: Auto-setup onboarding with profile, gateway, and wallet options"
```

### Deploy to VPS
```bash
ssh root@188.166.247.252
cd /root/reagent
git pull
npm run build
pm2 restart reagent --update-env
```

### Verify
- Visit: https://reagent.eu.cc/sign-up
- Complete onboarding flow
- Check all features working

## Future Enhancements

### Privy Embedded Wallet Integration
- Replace ethers fallback with actual Privy embedded wallet
- Use Privy SDK to create wallet
- Leverage Privy's built-in security features

### Gateway Platform Configuration
- Auto-configure Telegram bot during onboarding
- Auto-configure Discord bot during onboarding
- QR code display for WhatsApp pairing

### Wallet Features
- Export wallet (download encrypted keystore)
- Wallet backup reminder
- Multi-wallet support
- Hardware wallet integration

## Files Modified

### New Files
- `src/app/api/wallet/generate/route.ts` - Wallet generation endpoint
- `src/app/api/wallet/import/route.ts` - Wallet import endpoint
- `AUTO_ONBOARDING_COMPLETE.md` - This documentation

### Modified Files
- `src/app/onboarding/page.tsx` - Added WalletSetupStep, updated flow
- `src/app/api/onboarding/deploy/route.ts` - Added gateway auto-setup
- `src/lib/hermes-integration.ts` - Already had gateway methods

## Status

✅ **COMPLETE** - All features implemented and deployed to production

- Auto-create profile: ✅ Working
- Auto-install gateway: ✅ Working
- Auto-start gateway: ✅ Working
- Wallet generation: ✅ Working
- Wallet import: ✅ Working
- Onboarding flow: ✅ Updated
- Deployment: ✅ Deployed to VPS

## Notes

- Gateway errors are non-blocking - onboarding continues even if gateway fails
- Wallet is required before deployment (enforced by onboarding flow)
- Profile sanitization handles Privy user IDs correctly
- All features tested on production VPS

---

**Date**: 2026-04-17
**Version**: 1.0.0
**Status**: Production Ready ✅
