# Deploy cURL-Based Minting Skills

## Quick Deployment

Run these commands on your VPS:

```bash
# 1. Make the skill script executable
chmod +x /root/blinkai/hermes-skills/reagent_minting_curl.sh

# 2. Test the script manually
export REAGENT_USER_ID="test-user-id"
export REAGENT_API_BASE="http://localhost:3000"
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh help

# 3. Update all user profiles
cd /root/blinkai
chmod +x scripts/update-user-profiles-guidance.sh
./scripts/update-user-profiles-guidance.sh

# 4. Restart the application (if needed)
pm2 restart reagent
```

## What Gets Deployed

### 1. Shell Script Skill
**File**: `/root/blinkai/hermes-skills/reagent_minting_curl.sh`

**Features**:
- Uses `curl` to call minting API
- Authenticates with X-User-ID header
- Formats output for AI agent
- Handles errors gracefully
- Supports all minting operations

**Commands**:
- `check_balance` - Check USD and REAGENT balance
- `estimate_cost` - Estimate minting cost
- `mint` - Mint 10,000 REAGENT tokens
- `history` - Get minting history
- `stats` - Get global statistics

### 2. Updated API Endpoint
**File**: `/root/blinkai/src/app/api/hermes/skills/minting/route.ts`

**Changes**:
- Accepts X-User-ID header for authentication
- Falls back to session-based auth
- Allows Hermes CLI to call API

### 3. Updated Profile Files
**Files**: 
- `/root/blinkai/hermes-profiles/TOOLS.md`
- `/root/blinkai/hermes-profiles/SOUL.md`

**Changes**:
- Documents shell command execution
- Provides AI agent instructions
- Updates behavior to use direct execution
- Adds confirmation requirements

## Testing

### Test 1: Script Execution

```bash
# Set environment
export REAGENT_USER_ID="[actual-user-id]"
export REAGENT_API_BASE="http://localhost:3000"

# Test check balance
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh check_balance

# Expected output:
# 💰 USD Balance: $X.XX
# 🪙 REAGENT Balance: X,XXX tokens
# 📍 Wallet: 0x...
```

### Test 2: API Endpoint

```bash
# Test with curl directly
curl -X POST http://localhost:3000/api/hermes/skills/minting \
  -H "Content-Type: application/json" \
  -H "X-User-ID: [actual-user-id]" \
  -d '{"action":"check_balance"}'

# Expected: JSON response with success: true
```

### Test 3: AI Agent

1. Log in to http://159.65.141.68:3000
2. Go to Dashboard → Chat
3. Ask: "Can you check my balance?"
4. Expected: AI executes command and shows balance
5. Ask: "Can you mint tokens for me?"
6. Expected: AI checks balance, asks confirmation, then mints

## Verification Checklist

- [ ] Script is executable (`chmod +x`)
- [ ] Script runs without errors
- [ ] API accepts X-User-ID header
- [ ] User profiles updated with new TOOLS.md
- [ ] User profiles updated with new SOUL.md
- [ ] AI agent can execute check_balance
- [ ] AI agent can execute estimate_cost
- [ ] AI agent can execute mint (with confirmation)
- [ ] AI agent can execute history
- [ ] AI agent can execute stats
- [ ] Error messages are user-friendly
- [ ] Insufficient balance handled gracefully

## Expected Behavior

### Scenario 1: Check Balance

```
User: "What's my balance?"
AI: "Let me check your balance..."
AI: *executes check_balance*
AI: "💰 USD Balance: $10.50
🪙 REAGENT Balance: 50,000 tokens
📍 Wallet: 0x1234...5678"
```

### Scenario 2: Mint Tokens (Success)

```
User: "Can you mint tokens for me?"
AI: "Let me check your balance first..."
AI: *executes check_balance*
AI: "Great! You have $10.50 USD available.

Minting 10,000 REAGENT tokens will cost approximately $0.50 USD (including gas).

Would you like me to proceed?"

User: "Yes"
AI: "Perfect! Minting now..."
AI: *executes mint*
AI: "✅ Minting successful!

🪙 Tokens Earned: 10,000 REAGENT
💵 Fee Paid: $0.50 USD
🔗 Transaction: 0x...

💰 New Balance: $10.00 USD
🪙 Total REAGENT: 60,000 tokens"
```

### Scenario 3: Insufficient Balance

```
User: "Can you mint tokens?"
AI: "Let me check your balance first..."
AI: *executes check_balance*
AI: "I'd love to help you mint tokens, but your balance is $0.30 USD.

You need at least $0.50 USD for auto-mining.

Would you like me to show you how to deposit funds?"
```

## Troubleshooting

### Issue: Script not found

```bash
# Check if file exists
ls -la /root/blinkai/hermes-skills/reagent_minting_curl.sh

# If not, ensure files are uploaded
```

### Issue: Permission denied

```bash
# Make executable
chmod +x /root/blinkai/hermes-skills/reagent_minting_curl.sh
```

### Issue: curl command not found

```bash
# Install curl
apt-get update && apt-get install -y curl
```

### Issue: jq command not found

```bash
# Install jq
apt-get update && apt-get install -y jq
```

### Issue: API returns 401 Unauthorized

```bash
# Check if X-User-ID header is being sent
# Verify user ID is correct
# Check API endpoint code
```

### Issue: AI agent doesn't execute commands

```bash
# Check if TOOLS.md is updated
cat /root/.hermes/profiles/user-*/TOOLS.md | grep "reagent_minting_curl"

# Check if SOUL.md is updated
cat /root/.hermes/profiles/user-*/SOUL.md | grep "reagent_minting_curl"

# Re-run update script
./scripts/update-user-profiles-guidance.sh
```

## Rollback

If issues occur:

```bash
cd /root/blinkai

# Restore previous versions
git checkout HEAD~1 hermes-profiles/TOOLS.md
git checkout HEAD~1 hermes-profiles/SOUL.md
git checkout HEAD~1 src/app/api/hermes/skills/minting/route.ts

# Update profiles
./scripts/update-user-profiles.sh

# Restart app
pm2 restart reagent
```

## Success Metrics

### Before
- ❌ AI shows "integrasi mining tidak tersedia"
- ❌ Cannot check balance
- ❌ Cannot mint tokens
- ❌ No direct execution

### After
- ✅ AI can check balance directly
- ✅ AI can estimate costs
- ✅ AI can mint tokens (with confirmation)
- ✅ AI can show history
- ✅ AI can show statistics
- ✅ User-friendly error messages
- ✅ Full minting capability

---

**Status**: ✅ Ready for deployment  
**Date**: 2026-04-11  
**Version**: 2.0.0 (cURL-based execution)
