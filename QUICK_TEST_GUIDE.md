# 🚀 Quick Test Guide - Hermes Fixes

## ⚡ Quick Verification (5 minutes)

### 1. Test New User Auto-Setup
```bash
# Register a new user
curl -X POST http://159.65.141.68:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123"
  }'

# Check logs for auto-setup
ssh root@159.65.141.68 "pm2 logs blinkai --lines 50 | grep GatewaySetup"

# Expected output:
# [GatewaySetup] Starting setup for user xxx
# [GatewaySetup] ✅ Profile created
# [GatewaySetup] ✅ Gateway service installed
# [GatewaySetup] ✅ Gateway service started
```

### 2. Test Chat Response Quality
```bash
# 1. Open browser: http://159.65.141.68:3000
# 2. Login with your account
# 3. Go to Dashboard → Chat
# 4. Send message: "Hello, how are you?"
# 5. Verify response is clean (no CLI metadata like "Hermes Agent", "─────", etc.)
```

### 3. Test Existing Users Bulk Setup
```bash
# First, login to get session token
# Then call the endpoint

# List users
curl http://159.65.141.68:3000/api/hermes/setup-all-users \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Setup all users
curl -X POST http://159.65.141.68:3000/api/hermes/setup-all-users \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected response:
# {
#   "message": "Bulk user setup completed",
#   "results": {
#     "total": X,
#     "successful": X,
#     "failed": 0,
#     "details": [...]
#   }
# }
```

---

## 🔍 Detailed Verification

### Check Profile Exists
```bash
ssh root@159.65.141.68

# List all profiles
hermes profile list

# Check specific user profile
hermes --profile user-{userId} profile list

# Expected: Profile should be listed
```

### Check Gateway Status
```bash
ssh root@159.65.141.68

# Check gateway status for user
hermes --profile user-{userId} gateway status

# Expected: "active (running)" or similar
```

### Check Application Logs
```bash
ssh root@159.65.141.68

# Real-time logs
pm2 logs blinkai

# Last 100 lines
pm2 logs blinkai --lines 100

# Filter for setup logs
pm2 logs blinkai --lines 200 | grep -E "(GatewaySetup|Registration)"

# Filter for chat logs
pm2 logs blinkai --lines 200 | grep -E "(Chat|Hermes)"
```

---

## ✅ Success Indicators

### New User Registration
- ✅ User created successfully
- ✅ Can login immediately
- ✅ Logs show: `[GatewaySetup] Starting setup for user xxx`
- ✅ Logs show: `[GatewaySetup] ✅ Profile created`
- ✅ Logs show: `[GatewaySetup] ✅ Gateway service installed`
- ✅ Logs show: `[GatewaySetup] ✅ Gateway service started`
- ✅ Profile appears in `hermes profile list`
- ✅ Gateway status shows "running"

### Chat Response
- ✅ Response appears word-by-word (streaming)
- ✅ No CLI metadata visible (no "Hermes Agent", "─────", ">>>", etc.)
- ✅ Response is natural and conversational
- ✅ No technical headers or separators
- ✅ Clean, professional appearance

### Bulk Setup
- ✅ Endpoint returns success
- ✅ All users have profiles created
- ✅ All gateways are running
- ✅ No errors in response

---

## ❌ Troubleshooting

### Problem: Profile not created
**Symptoms**: Logs don't show GatewaySetup messages

**Check**:
```bash
# Check if Hermes is installed
ssh root@159.65.141.68 "hermes --version"

# Check if setup function is being called
ssh root@159.65.141.68 "pm2 logs blinkai --lines 200 | grep Registration"
```

**Solution**: Verify `setupUserGateway()` is called in register route

---

### Problem: Chat shows CLI metadata
**Symptoms**: Response includes "Hermes Agent", "─────", ">>>", etc.

**Check**: Verify `cleanHermesResponse()` is being called

**Solution**: 
```bash
# Check the code
cat src/lib/hermes-integration.ts | grep -A 20 "cleanHermesResponse"

# Should see it being called in streamHermesResponse
```

---

### Problem: Gateway not running
**Symptoms**: Gateway status shows "stopped" or "error"

**Check**:
```bash
ssh root@159.65.141.68
hermes --profile user-{userId} gateway status
```

**Solution**:
```bash
# Manually start gateway
hermes --profile user-{userId} gateway start

# Or reinstall
hermes --profile user-{userId} gateway install
hermes --profile user-{userId} gateway start
```

---

## 🎯 Quick Health Check

Run this one-liner to check everything:
```bash
ssh root@159.65.141.68 "echo '=== PM2 Status ===' && pm2 status && echo -e '\n=== Hermes Profiles ===' && hermes profile list && echo -e '\n=== Recent Logs ===' && pm2 logs blinkai --lines 20 --nostream"
```

---

## 📊 Expected Results

### Healthy System
```
=== PM2 Status ===
┌─────┬──────────┬─────────┬─────────┐
│ id  │ name     │ status  │ restart │
├─────┼──────────┼─────────┼─────────┤
│ 0   │ blinkai  │ online  │ 0       │
└─────┴──────────┴─────────┴─────────┘

=== Hermes Profiles ===
user-xxx (active)
user-yyy (active)
user-zzz (active)

=== Recent Logs ===
[GatewaySetup] ✅ Profile created
[GatewaySetup] ✅ Gateway service installed
[GatewaySetup] ✅ Gateway service started
[Chat] Starting chat for user xxx
[Chat] Completed successfully
```

---

## 🔗 Quick Links

- **Application**: http://159.65.141.68:3000
- **Dashboard**: http://159.65.141.68:3000/dashboard
- **Chat**: http://159.65.141.68:3000/dashboard/chat
- **Sign Up**: http://159.65.141.68:3000/sign-up

---

## 📝 Test Checklist

- [ ] New user registration works
- [ ] Auto-setup runs in background
- [ ] Profile created automatically
- [ ] Gateway installed automatically
- [ ] Gateway started automatically
- [ ] User can login immediately
- [ ] Chat works (with fallback if needed)
- [ ] Chat responses are clean (no CLI metadata)
- [ ] Bulk setup endpoint works
- [ ] Existing users can be setup
- [ ] All profiles appear in Hermes
- [ ] All gateways are running

---

**Status**: ✅ READY FOR TESTING
**Date**: 2026-04-10
