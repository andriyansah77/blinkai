# Gateway Auto-Start Fix - COMPLETE ✅

## Problem
Gateway tidak berjalan otomatis saat onboarding karena Hermes profile belum dibuat sebelum mencoba start gateway.

## Root Cause
Di `src/app/api/onboarding/deploy/route.ts`:
1. `hermesCliWrapper.setupUserEnvironment()` dipanggil untuk setup Hermes CLI instance
2. Tapi ini TIDAK membuat Hermes profile yang diperlukan untuk gateway
3. Gateway mencoba start dengan `--profile` flag, tapi profile tidak ada
4. Error: "Profile 'user-did-privy-xxx' does not exist"

## Solution Implemented

### 1. Added Profile Creation Step (Step 2.5)
```typescript
// 2.5. Create Hermes profile for gateway and chat (CRITICAL for gateway)
try {
  console.log(`[Onboarding] Creating Hermes profile for user ${session.user.id}`);
  const { hermesIntegration } = await import('@/lib/hermes-integration');
  
  const profileResult = await hermesIntegration.createProfile(session.user.id!);
  if (profileResult.success) {
    console.log(`[Onboarding] ✅ Hermes profile created successfully`);
  }
} catch (profileError) {
  console.error('[Onboarding] Profile creation error:', profileError);
}
```

### 2. Added Profile Verification Before Gateway Start (Step 7)
```typescript
// Import ensureHermesProfile
const { ensureHermesProfile } = await import('@/lib/ensure-hermes-profile');

// CRITICAL: Ensure Hermes profile exists before starting gateway
const profileResult = await ensureHermesProfile(session.user.id!);

if (!profileResult.success) {
  gatewayStatus.error = `Profile creation failed: ${profileResult.error}`;
  // Don't attempt gateway start if profile doesn't exist
} else {
  // Proceed with gateway setup and start
}
```

## Flow After Fix

1. ✅ User creation in database
2. ✅ Hermes CLI instance setup (hermesCliWrapper)
3. ✅ **NEW: Hermes profile creation** (hermesIntegration.createProfile)
4. ✅ Agent creation in database
5. ✅ Credits and skills setup
6. ✅ Auto-install minting skill
7. ✅ **Verify profile exists** (ensureHermesProfile)
8. ✅ Setup gateway (non-interactive)
9. ✅ Start gateway service

## Files Modified
- `src/app/api/onboarding/deploy/route.ts`

## Testing
1. Register user baru di https://reagent.eu.cc/sign-up
2. Complete onboarding flow
3. Check gateway status di dashboard
4. Verify profile exists: `hermes profile list`
5. Verify gateway running: `hermes --profile user-did-privy-xxx gateway status`

## Deployment
```bash
# Local
git add .
git commit -m "fix: ensure Hermes profile creation before gateway start"
git push

# VPS
ssh root@188.166.247.252
cd /root/reagent
git pull
npm run build
pm2 restart reagent --update-env
```

## Status: ✅ DEPLOYED
- Commit: 7bc6775
- Deployed: 2026-04-17
- VPS: 188.166.247.252
- Domain: https://reagent.eu.cc

## Next Steps
- Test dengan user baru untuk verify gateway auto-start
- Monitor logs untuk memastikan tidak ada error
- Jika masih ada issue, check Hermes CLI logs: `hermes --profile user-xxx gateway logs`
