# Deploy Privy Migration ke VPS

## Build Status
✅ Build successful!

## Deployment Steps

### 1. Push ke GitHub
```bash
git add .
git commit -m "Complete Privy authentication migration - all API routes"
git push origin main
```

### 2. Deploy ke VPS
```bash
ssh root@188.166.247.252
cd /root/reagent
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart reagent --update-env
```

### 3. Verify Deployment
```bash
pm2 logs reagent --lines 50
```

### 4. Test in Browser
1. Open https://reagent.eu.cc
2. Login with Privy
3. Go to onboarding
4. Create an agent
5. Check if 401 error is gone

## What Changed

### Backend (41 API Routes Migrated)
- All API routes now use `getPrivySession(request)` instead of `getServerSession(authOptions)`
- Server-side authentication via Privy JWT token
- Compatible with existing NextAuth pattern

### Frontend (Global Fetch Interceptor)
- All `/api/*` requests automatically get Authorization header
- No need to manually add token in components
- Seamless integration with Privy

### Files Modified
- `src/lib/privy-server.ts` - Server-side Privy auth
- `src/lib/api-client.ts` - Global fetch interceptor
- `src/providers/privy-provider.tsx` - Auth interceptor setup
- 41 API route files

## Expected Behavior

After deployment:
- Login with Privy should work
- Onboarding flow should complete without 401 error
- All dashboard features should work
- Mining/wallet operations should work

## Troubleshooting

If 401 errors persist:
1. Check browser console for Authorization header
2. Check PM2 logs for Privy auth errors
3. Verify PRIVY_APP_SECRET in .env
4. Hard refresh browser (Ctrl+Shift+R)
