# 🚀 Manual Deployment - Privy Integration

## Status
✅ Code committed to GitHub (commit 4583cab)
✅ Local build in progress
⏳ VPS deployment pending (SSH connection issue)

## Quick Deploy Commands

### Option 1: SSH Manual Deploy
```bash
# Connect to VPS
ssh root@188.166.247.252

# Navigate to project
cd /root/reagent

# Pull latest code
git pull

# Clean build
rm -rf .next

# Install dependencies (with legacy peer deps for Privy)
npm install --legacy-peer-deps

# Build
npm run build

# Restart PM2
pm2 restart reagent --update-env

# Check logs
pm2 logs reagent --lines 50
```

### Option 2: One-Line Deploy (if SSH works)
```bash
ssh root@188.166.247.252 "cd /root/reagent && git pull && rm -rf .next && npm install --legacy-peer-deps && npm run build && pm2 restart reagent --update-env"
```

## What's Been Deployed

### 1. Privy Authentication
- ✅ Privy provider with Tempo Network
- ✅ Multiple login methods (email, wallet, social)
- ✅ Embedded wallet auto-creation
- ✅ New sign-in and sign-up pages

### 2. NPX CLI Tool
- ✅ `npx @reagent/cli` for token minting
- ✅ cURL support with `--curl` flag
- ✅ Complete documentation

### 3. Developer Guide
- ✅ Added to landing page
- ✅ NPX CLI documentation
- ✅ REST API examples

## Environment Variables Required

Make sure `.env` on VPS has:
```bash
# Privy (REQUIRED for auth to work)
NEXT_PUBLIC_PRIVY_APP_ID="your-privy-app-id"
PRIVY_APP_SECRET="your-privy-app-secret"

# Other existing vars...
DATABASE_URL="..."
NEXTAUTH_SECRET="..."
# etc.
```

## After Deployment

### 1. Test Landing Page
```
https://reagent.eu.cc
```
Should work normally with new Developer Guide section.

### 2. Test Sign In
```
https://reagent.eu.cc/sign-in
```
Should show Privy login modal when clicking "Sign In with Privy".

### 3. Expected Behavior

✅ **Will Work:**
- Landing page (/)
- Sign-in page (/sign-in)
- Sign-up page (/sign-up)
- API routes (still using old auth for now)

⚠️ **Will Show Errors (Expected):**
- Dashboard (/dashboard)
- Mining pages (/mining, /mining-web)
- Settings (/settings)
- Onboarding (/onboarding)

These pages still use NextAuth `useSession` hook and need migration.

### 4. Hard Refresh Browser
After deployment, press:
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

## Troubleshooting

### Build Errors
If build fails with Privy errors:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Privy Not Loading
1. Check `.env` has correct Privy credentials
2. Check Privy Dashboard → Domains includes:
   - `https://reagent.eu.cc`
   - `https://mining.reagent.eu.cc`
3. Restart PM2: `pm2 restart reagent --update-env`

### SSH Connection Issues
If SSH times out:
1. Check VPS is running: `ping 188.166.247.252`
2. Check firewall allows SSH (port 22)
3. Try from different network
4. Contact DigitalOcean support if VPS is down

## Next Steps After Deployment

### Phase 1: Verify Privy Works
1. Test sign-in with email
2. Test sign-in with wallet
3. Test sign-in with Google/Twitter
4. Verify embedded wallet is created

### Phase 2: Migrate Protected Pages
Update these files to use Privy instead of NextAuth:

```typescript
// Before (NextAuth)
import { useSession } from 'next-auth/react';
const { data: session } = useSession();

// After (Privy)
import { usePrivy } from '@privy-io/react-auth';
const { ready, authenticated, user } = usePrivy();
```

Files to migrate:
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/agents/page.tsx`
- `src/app/dashboard/agents/[id]/page.tsx`
- `src/app/mining/page.tsx`
- `src/app/mining-web/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/settings/page.tsx`

### Phase 3: Update API Routes
Update API routes to use Privy authentication:

```typescript
// Before
import { getServerSession } from "next-auth";
const session = await getServerSession(authOptions);

// After
import { getPrivyUser } from '@/lib/privy-server';
const user = await getPrivyUser(request);
```

### Phase 4: Remove NextAuth (Optional)
After all pages migrated:
1. Remove NextAuth dependencies
2. Remove `src/lib/auth.ts`
3. Remove NextAuth API routes
4. Update `.env.example`

## Support

Need help?
- Check `PRIVY_MIGRATION_COMPLETE.md` for full guide
- Check `PRIVY_SETUP.md` for Privy configuration
- Privy Docs: https://docs.privy.io
- Privy Discord: https://discord.gg/privy

---

**Deployment Status**: Ready to deploy manually via SSH
**Commit**: 4583cab
**Branch**: main
