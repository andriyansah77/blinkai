# Test Gateway Auto-Start - Ready!

## Changes Deployed ✅

1. **Profile Creation Added** (Step 2.5)
   - Calls `hermesIntegration.createProfile()` after Hermes CLI setup
   - Creates actual Hermes profile needed for gateway

2. **Profile Verification Added** (Step 7)
   - Uses `ensureHermesProfile()` before gateway start
   - Prevents gateway start if profile doesn't exist

3. **Path Fixed**
   - Changed from `/root/blinkai/hermes-profiles/` to `/root/reagent/hermes-profiles/`
   - Profile markdown files will now copy correctly

## Testing Steps

1. **Register New User**
   - Go to: https://reagent.eu.cc/sign-up
   - Create new account with email

2. **Complete Onboarding**
   - Step 1: Agent Name & Personality
   - Step 2: Wallet Setup (generate or import)
   - Step 3: Select Plan (Free/Pro/Enterprise)
   - Step 4: Deploy Agent

3. **Check Gateway Status**
   - After onboarding completes, go to Dashboard
   - Look for Gateway status indicator
   - Should show "Running" instead of "Stopped"

## Monitor Logs (Optional)

```bash
# SSH to VPS
ssh root@188.166.247.252

# Watch logs in real-time
pm2 logs reagent --lines 50

# Look for these log messages:
# [Onboarding] Creating Hermes profile for user...
# [Profile] Profile created successfully
# [Onboarding] ✅ Hermes profile created successfully
# [Onboarding] Ensuring Hermes profile exists
# [Onboarding] ✅ Profile verified/created
# [Gateway] Starting gateway for user...
# [Gateway] ✅ Gateway started successfully
```

## Verify Profile Created

```bash
# SSH to VPS
ssh root@188.166.247.252

# List Hermes profiles
hermes profile list

# Should see: user-did-privy-xxx

# Check gateway status for specific user
hermes --profile user-did-privy-xxx gateway status

# Should show: active (running)
```

## Expected Result

Gateway should be **RUNNING** automatically after onboarding completes!

## If Still Not Working

Check logs for:
1. Profile creation errors
2. Gateway install errors
3. Gateway start errors

Share the error messages for further debugging.

---

**Status**: Ready for testing
**Deployed**: 2026-04-17 10:04 UTC
**Commit**: eca6f25
