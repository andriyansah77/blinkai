# Quick Deploy: cURL-Based Minting Skills

## One-Command Deployment

```bash
cd /root/blinkai && chmod +x scripts/deploy-curl-minting.sh && ./scripts/deploy-curl-minting.sh
```

## What This Does

1. ✅ Checks and installs dependencies (curl, jq)
2. ✅ Makes minting skill script executable
3. ✅ Tests script execution
4. ✅ Updates all user profiles
5. ✅ Rebuilds application
6. ✅ Restarts PM2 process
7. ✅ Verifies deployment

## Expected Output

```
🚀 Deploying cURL-based Minting Skills...

Step 1: Checking dependencies...
✅ curl already installed
✅ jq already installed

Step 2: Setting up minting skill script...
✅ Script is now executable

Step 3: Testing script...
✅ Script executes successfully

Step 4: Updating user profiles...
📝 Updating profile: user-[ID1]
  ✅ TOOLS.md updated
  ✅ SOUL.md updated
  ✅ Profile updated successfully
...
✅ Profiles updated: 9

Step 5: Rebuilding application...
✅ Application rebuilt

Step 6: Restarting application...
✅ Application restarted

Step 7: Verifying deployment...
✅ Found 9 user profiles
✅ TOOLS.md updated with curl commands
✅ SOUL.md updated with execution behavior

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Deployment Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Quick Test

### Test 1: Manual Script Execution

```bash
export REAGENT_USER_ID="[your-user-id]"
export REAGENT_API_BASE="http://localhost:3000"
bash /root/blinkai/hermes-skills/reagent_minting_curl.sh check_balance
```

Expected output:
```
💰 USD Balance: $X.XX
🪙 REAGENT Balance: X,XXX tokens
📍 Wallet: 0x...
```

### Test 2: Via Web Interface

1. Go to http://159.65.141.68:3000
2. Login with your account
3. Go to Dashboard → Chat
4. Ask: **"Can you check my balance?"**

Expected: AI executes command and shows your balance

5. Ask: **"Can you mint tokens for me?"**

Expected: AI checks balance, asks confirmation, then mints

## Available Commands

AI agent can now execute:

```bash
# Check balance
reagent_minting_curl.sh check_balance

# Estimate cost
reagent_minting_curl.sh estimate_cost

# Mint tokens
reagent_minting_curl.sh mint

# View history
reagent_minting_curl.sh history --page 1 --limit 10

# Get stats
reagent_minting_curl.sh stats
```

## Troubleshooting

### Script not found
```bash
ls -la /root/blinkai/hermes-skills/reagent_minting_curl.sh
```

### Permission denied
```bash
chmod +x /root/blinkai/hermes-skills/reagent_minting_curl.sh
```

### curl not found
```bash
apt-get update && apt-get install -y curl
```

### jq not found
```bash
apt-get update && apt-get install -y jq
```

### AI doesn't execute commands
```bash
# Re-run profile update
cd /root/blinkai
./scripts/update-user-profiles-guidance.sh

# Restart app
pm2 restart reagent
```

## Rollback

```bash
cd /root/blinkai
git checkout HEAD~1 hermes-profiles/TOOLS.md
git checkout HEAD~1 hermes-profiles/SOUL.md
git checkout HEAD~1 src/app/api/hermes/skills/minting/route.ts
git checkout HEAD~1 src/lib/hermes-integration.ts
npm run build
pm2 restart reagent
```

## Files Changed

- ✅ `hermes-skills/reagent_minting_curl.sh` (new)
- ✅ `hermes-profiles/TOOLS.md` (updated)
- ✅ `hermes-profiles/SOUL.md` (updated)
- ✅ `src/app/api/hermes/skills/minting/route.ts` (updated)
- ✅ `src/lib/hermes-integration.ts` (updated)

## Success Indicators

- ✅ AI responds to "check my balance" with actual balance
- ✅ AI responds to "mint tokens" with confirmation request
- ✅ After confirmation, AI executes mint and shows result
- ✅ No errors about "integrasi mining tidak tersedia"
- ✅ Transaction hash and explorer link displayed

---

**Ready to deploy!** 🚀

Run the one-command deployment and test with your account.
