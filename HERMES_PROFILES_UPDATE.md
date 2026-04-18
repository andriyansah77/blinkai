# Hermes Profiles Update - API-Based Workflow

## Summary

Updated PLATFORM.md, SOUL.md, and TOOLS.md to reflect the current API-based workflow using `/api/mining/simple-mint` endpoint.

## What Changed

### 1. PLATFORM.md Updates

**Mining System**:
- ✅ Updated to show configurable fees via environment variables
- ✅ Added `AUTO_MINT_FEE` and `MANUAL_MINT_FEE` configuration
- ✅ Documented ERC-20 PATHUSD transfer (not native transfer)
- ✅ Added unified API endpoint `/api/mining/simple-mint`

**Payment System**:
- ✅ Added PATHUSD token address (0x20c0000000000000000000000000000000000000)
- ✅ Documented ERC-20 transfer method
- ✅ Added unified API reference

**Platform Capabilities**:
- ✅ Updated AI agent capabilities to include multi-channel support
- ✅ Added Telegram bot integration details
- ✅ Documented auto-registration of slash commands

**New Section - API Integration**:
- ✅ Mining API endpoint documentation
- ✅ Authentication methods (web vs bot)
- ✅ Request/response format
- ✅ Telegram bot integration details

### 2. SOUL.md Updates

**What You Know**:
- ✅ Updated mining costs to show configurable fees
- ✅ Added PATHUSD token address and ERC-20 transfer method
- ✅ Changed from shell script execution to API calls
- ✅ Updated skill descriptions to reflect API-based approach

**Mining Assistance Behavior**:
- ✅ Changed from `bash reagent_minting_curl.sh` to API calls
- ✅ Updated all examples to use API endpoints
- ✅ Simplified workflow (no shell scripts)

**Platform Knowledge**:
- ✅ Updated mining process to show API-based flow
- ✅ Added PATHUSD ERC-20 transfer details
- ✅ Updated capabilities to show API-based operations
- ✅ Added multi-channel support information

**Conversation Examples**:
- ✅ Updated all examples to reference API calls instead of shell commands
- ✅ Simplified language (no technical shell commands)
- ✅ More user-friendly explanations

### 3. TOOLS.md Updates

**Architecture**:
- ✅ Changed from shell script-based to API-based architecture
- ✅ Added API endpoint reference section
- ✅ Documented authentication methods (web vs bot)
- ✅ Added base URL configuration

**Minting_Skill**:
- ✅ Version updated to 2.0.0
- ✅ Changed from shell script to API endpoint
- ✅ Added `/api/mining/simple-mint` as primary endpoint
- ✅ Documented dual authentication (session + API key)

**Wallet_Skill**:
- ✅ Version updated to 2.0.0
- ✅ Changed from shell script to API endpoints
- ✅ Added multiple API endpoints (`/api/wallet/*`)
- ✅ Documented authentication methods

**Tool Definitions**:
- ✅ Replaced shell command examples with HTTP API calls
- ✅ Added request/response examples in HTTP format
- ✅ Documented JSON request/response bodies
- ✅ Updated all AI agent usage examples

**New Sections**:
- ✅ API Endpoint Reference (base URL, authentication)
- ✅ Mining API Endpoints (detailed documentation)
- ✅ Wallet API Endpoints (detailed documentation)
- ✅ Multi-Channel Support (Telegram, Discord, WhatsApp)

**Removed**:
- ❌ Shell script execution examples
- ❌ cURL command references
- ❌ File path references to shell scripts
- ❌ Environment variable setup for scripts

## Key Changes Summary

### Before (Shell Script-Based)
```bash
# AI agent executed shell commands
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh check_balance
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh mint
```

### After (API-Based)
```http
# AI agent makes HTTP API calls
GET /api/wallet/balance
POST /api/mining/simple-mint
```

## Benefits of API-Based Approach

1. **Cleaner Architecture**: No shell script dependencies
2. **Better Security**: Centralized authentication and validation
3. **Multi-Channel**: Same API works for web, Telegram, Discord, WhatsApp
4. **Easier Maintenance**: Single codebase for all channels
5. **Better Error Handling**: Consistent error responses
6. **Scalability**: API can handle multiple concurrent requests
7. **Monitoring**: Easier to log and monitor API calls

## API Endpoints Documented

### Mining Endpoints
- `GET /api/wallet/balance` - Check wallet balances
- `POST /api/mining/simple-mint` - Mint REAGENT tokens
- `GET /api/mining/inscriptions` - Get minting history
- `GET /api/mining/stats` - Get platform statistics

### Wallet Endpoints
- `GET /api/wallet/balance` - Check balances
- `GET /api/wallet/info` - Get wallet info
- `POST /api/wallet/send-eth` - Send ETH (coming soon)
- `POST /api/wallet/send-reagent` - Send REAGENT (coming soon)

## Authentication Methods

### Web Chat (Dashboard)
```http
Cookie: privy-token=<session_token>
```

### Telegram Bot / External
```http
Authorization: Bearer <PLATFORM_API_KEY>
X-User-ID: <user_id>
```

## Multi-Channel Support

### Telegram Bot
- Commands: `/mine`, `/balance`, `/wallet`, `/help`, `/start`
- Skill: `telegram_commands_skill.py`
- API: Same `/api/mining/simple-mint` endpoint
- Auto-registration: Commands registered on channel setup

### Discord Bot (Coming Soon)
- Same API endpoints
- Different authentication method

### WhatsApp Bot (Coming Soon)
- Same API endpoints
- Different authentication method

## Configuration

### Environment Variables
```bash
# Mining fees (configurable)
AUTO_MINT_FEE=0.5          # Default auto-mining fee
MANUAL_MINT_FEE=1.0        # Default manual mining fee

# PATHUSD token
PATHUSD_TOKEN_ADDRESS=0x20c0000000000000000000000000000000000000

# Platform API
PLATFORM_URL=https://reagent.eu.cc
PLATFORM_API_KEY=<your_api_key>
```

## Files Updated

1. `hermes-profiles/PLATFORM.md`
   - Added API integration section
   - Updated mining economics
   - Added payment system details
   - Updated version to 2026-04-18

2. `hermes-profiles/SOUL.md`
   - Updated capabilities to API-based
   - Changed all examples to use API calls
   - Updated mining process flow
   - Updated version to 2026-04-18

3. `hermes-profiles/TOOLS.md`
   - Complete rewrite from shell-based to API-based
   - Added API endpoint reference
   - Documented all endpoints with examples
   - Added multi-channel support section
   - Updated version to 2.0.0

## Testing

After updating profiles, test:

1. **Web Chat**: Verify AI agent can mint via API
2. **Telegram Bot**: Test `/mine` command
3. **Balance Check**: Verify real-time balance queries
4. **History**: Check minting history retrieval
5. **Stats**: Verify platform statistics

## Deployment

Profiles are automatically loaded by Hermes when:
- User creates new agent
- Agent restarts
- Profile files are updated

No rebuild or restart required - just update the files!

## Next Steps

1. ✅ Profiles updated
2. ⏳ Test with web chat
3. ⏳ Test with Telegram bot
4. ⏳ Verify all API endpoints work
5. ⏳ Monitor for any issues

---

**Status**: ✅ COMPLETE  
**Version**: 2.0.0  
**Date**: 2026-04-18  
**Updated By**: Kiro AI Assistant
