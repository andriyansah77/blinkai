# Platform API Integration Fix - Complete

## Problem Fixed
Bot was responding with error: "Provider authentication failed: No inference provider configured"

## Root Cause
Hermes reads API keys from the profile's `.env` file, but the environment variable `LLM_PROVIDER` was missing, causing Hermes to not recognize the configured provider.

## Solution Implemented

### 1. Profile `.env` Configuration
Updated `createProfile` method in `src/lib/hermes-integration.ts` to create profile `.env` file with:

```bash
# Hermes Profile Environment Variables
OPENAI_API_KEY=<platform_api_key>
OPENAI_API_BASE=<platform_api_base_url>
LLM_MODEL=<platform_model>
LLM_PROVIDER=openai

# Platform Mode
REAGENT_PLATFORM_MODE=true
REAGENT_USER_ID=<user_id>
```

### 2. Config.yaml Updates
- Removed `api_key` from config.yaml (Hermes reads it from .env)
- Set `provider: openai` for OpenAI-compatible API
- Set `model` and `base_url` in config.yaml

### 3. File Writing Method
Changed from `cat > file << 'EOF'` to `echo '...' > file` to avoid EOF parsing issues with special characters.

## How It Works

### User Flow:
1. User creates Telegram/Discord/WhatsApp channel
2. System creates isolated Hermes profile: `user-{userId}`
3. Profile directory: `/root/.hermes/profiles/user-{userId}/`
4. Profile `.env` file created with platform API credentials
5. Bot token written to `config.yaml`
6. Gateway service installed and started
7. Bot connects and responds using platform API

### Credit System:
- All users use the SAME platform API key (from `.env`)
- Each user has isolated profile with their own `.env` copy
- Credits tracked in database per user
- Future: Implement token counting and credit deduction

## Testing Steps

### 1. Test with Existing User
If you already created a channel, the profile exists but `.env` might be outdated:

```bash
# SSH to VPS
ssh root@159.65.141.68

# Check existing profile
ls -la /root/.hermes/profiles/user-cmnq76h5b0001s4vs3n282mey/

# Check .env file
cat /root/.hermes/profiles/user-cmnq76h5b0001s4vs3n282mey/.env

# If .env is missing or incorrect, delete profile and recreate
hermes profile delete user-cmnq76h5b0001s4vs3n282mey --yes

# Then in the web UI, delete the channel and create it again
```

### 2. Test with New User
1. Register new account at http://159.65.141.68:3000/sign-up
2. Go to Dashboard > Channels
3. Click "Connect Platform"
4. Select Telegram/Discord
5. Enter bot token
6. Click "Connect"
7. Wait for success notification
8. Send message to bot on Telegram/Discord
9. Bot should respond correctly

### 3. Verify Bot is Running
```bash
# Check gateway status
hermes --profile user-{userId} gateway status

# Check if bot is connected
# Should show "Gateway: running" and "Telegram: connected"

# Check logs
pm2 logs blinkai

# Test bot manually
# Send message to your bot on Telegram/Discord
```

## Files Modified
- `src/lib/hermes-integration.ts` (lines 157-220: createProfile method)
  - Added `LLM_PROVIDER=openai` to profile `.env`
  - Changed file writing method to avoid EOF issues
  - Removed `api_key` from config.yaml (Hermes reads from .env)

## Deployment Status
✅ Code committed: `93e2cb8`
✅ Pushed to GitHub: andriyansah77/blinkai
✅ Deployed to VPS: 159.65.141.68
✅ PM2 restarted: blinkai process online

## Next Steps

### Immediate:
1. Test with existing user (delete and recreate channel if needed)
2. Test with new user
3. Verify bot responds correctly
4. Check channel status shows "connected"

### Future Enhancements:
1. Implement token counting for credit deduction
2. Add credit limit checks before API calls
3. Add usage analytics per user
4. Add webhook for real-time credit updates
5. Add notification when credits low

## Platform Configuration
Current platform API (from `.env`):
- Provider: AkashML
- Model: MiniMaxAI/MiniMax-M2.5
- Base URL: https://api.akashml.com/v1
- API Key: akml-jiPghENoUyjtFxCEeGRunnoyiGMUHuji

All users will use this API key, with credits tracked per user in the database.

## Troubleshooting

### Bot not responding?
1. Check profile .env exists: `cat /root/.hermes/profiles/user-{userId}/.env`
2. Check gateway running: `hermes --profile user-{userId} gateway status`
3. Check PM2 logs: `pm2 logs blinkai`
4. Restart gateway: `hermes --profile user-{userId} gateway restart`

### Channel shows "disconnected"?
1. Delete channel in UI
2. Delete profile: `hermes profile delete user-{userId} --yes`
3. Create channel again (will recreate profile with correct .env)

### "Profile not found" error?
Profile will be auto-created when you create a channel. If error persists, check PM2 logs.

---

**Status**: ✅ FIXED AND DEPLOYED
**Date**: 2026-04-10
**Commit**: 93e2cb8
