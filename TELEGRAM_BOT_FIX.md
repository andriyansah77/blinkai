# ✅ Telegram Bot Fix - Gateway Restart

## 🐛 Masalah

User melaporkan:
- Register user baru berhasil ✅
- Connect channel ke Telegram berhasil ✅
- Keterangan menunjukkan "berhasil" ✅
- **TAPI bot tidak hidup** ❌

## 🔍 Root Cause

Setelah bot token Telegram disimpan ke `config.yaml`, gateway **tidak di-restart** untuk membaca config baru.

**Flow Sebelumnya**:
```
1. User input bot token
2. Token disimpan ke config.yaml ✅
3. setupGateway() dipanggil (hanya return success, tidak melakukan apa-apa)
4. startGateway() dipanggil di channels API
5. Gateway sudah running, jadi tidak restart
6. Bot token tidak terbaca ❌
```

**Masalah**: Gateway yang sudah running tidak otomatis reload config file.

---

## ✅ Solusi

### 1. Tambah Method `restartGateway()`

```typescript
// src/lib/hermes-integration.ts
async restartGateway(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Gateway] Restarting gateway for user ${userId}`);
    
    // Stop gateway first
    const stopResult = await this.stopGateway(userId);
    if (!stopResult.success) {
      console.warn(`[Gateway] Stop warning (may not be running): ${stopResult.error}`);
    }
    
    // Wait for clean shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start gateway
    const startResult = await this.startGateway(userId);
    
    if (startResult.success) {
      console.log(`[Gateway] ✅ Gateway restarted successfully for user ${userId}`);
    }
    
    return startResult;
  } catch (error) {
    console.error(`[Gateway] Exception restarting gateway for user ${userId}:`, error);
    return { success: false, error: `Gateway restart failed: ${error}` };
  }
}
```

### 2. Update `setupTelegram()` untuk Restart Gateway

**Sebelum**:
```typescript
// Setup gateway (tidak melakukan apa-apa)
const setupResult = await this.setupGateway(userId);
return setupResult;
```

**Sesudah**:
```typescript
// Restart gateway to apply new config
console.log(`[Platform] Restarting gateway to apply Telegram config for user ${userId}`);

const restartResult = await this.restartGateway(userId);

if (restartResult.success) {
  console.log(`[Platform] ✅ Telegram setup completed and gateway restarted for user ${userId}`);
  return { success: true };
} else {
  console.error(`[Platform] Failed to restart gateway after Telegram setup:`, restartResult.error);
  return { success: false, error: `Gateway restart failed: ${restartResult.error}` };
}
```

### 3. Update `setupDiscord()` (sama seperti Telegram)

Discord juga memerlukan gateway restart setelah config berubah.

### 4. Hapus Redundant `startGateway()` di Channels API

**Sebelum**:
```typescript
// Start gateway if not already running
const gatewayResult = await hermesIntegration.startGateway(session.user.id!);
if (!gatewayResult.success) {
  console.warn(`Gateway start warning: ${gatewayResult.error}`);
}
```

**Sesudah**:
```typescript
// Gateway already restarted in setupTelegram/setupDiscord
console.log(`✅ ${type} platform configured and gateway restarted`);
```

---

## 🚀 Flow Baru

```
1. User input bot token
2. Token disimpan ke config.yaml ✅
3. Gateway di-STOP ✅
4. Wait 2 detik untuk clean shutdown ✅
5. Gateway di-START dengan config baru ✅
6. Bot token terbaca dan bot hidup ✅
```

---

## 📊 Technical Details

### Gateway Restart Sequence

```typescript
// 1. Stop gateway
hermes --profile user-{userId} gateway stop

// 2. Wait for clean shutdown
await sleep(2000)

// 3. Start gateway with new config
hermes --profile user-{userId} gateway start
```

### Config File Location

```
/root/.hermes/profiles/user-{userId}/config.yaml
```

### Config Structure (Telegram)

```yaml
telegram:
  bot_token: "YOUR_BOT_TOKEN_HERE"

model:
  provider: openai
  model: gpt-4o-mini
  base_url: https://api.openai.com/v1
```

---

## 🧪 Testing

### Test Telegram Bot Setup

1. **Register user baru** atau login dengan user existing
2. **Go to Dashboard → Channels**
3. **Click "Connect Channel"**
4. **Select Telegram**
5. **Input bot token** dari @BotFather
6. **Click Connect**
7. **Tunggu 2-3 detik** (gateway restart)
8. **Cek logs**:
   ```bash
   ssh root@159.65.141.68
   pm2 logs blinkai --lines 50 | grep -E "(Platform|Gateway)"
   ```

### Expected Logs

```
[Platform] Setting up Telegram for user xxx
[Platform] Telegram token set successfully for user xxx
[Platform] Restarting gateway to apply Telegram config for user xxx
[Gateway] Stopping gateway for user xxx
[Gateway] Gateway stopped successfully for user xxx
[Gateway] Starting gateway for user xxx
[Gateway] Gateway started successfully for user xxx
[Platform] ✅ Telegram setup completed and gateway restarted for user xxx
✅ Telegram platform configured and gateway restarted
```

### Verify Bot is Running

```bash
# Check gateway status
ssh root@159.65.141.68
hermes --profile user-{userId} gateway status

# Expected output:
# ● hermes-gateway-user-xxx.service - Hermes Gateway for user-xxx
#    Loaded: loaded
#    Active: active (running)
```

### Test Bot Response

1. Open Telegram
2. Search for your bot
3. Send message: `/start`
4. Bot should respond ✅

---

## 🔧 Troubleshooting

### Problem: Bot masih tidak hidup setelah setup

**Check 1: Gateway status**
```bash
ssh root@159.65.141.68
hermes --profile user-{userId} gateway status
```

**Check 2: Config file**
```bash
cat /root/.hermes/profiles/user-{userId}/config.yaml
```

Pastikan ada:
```yaml
telegram:
  bot_token: "YOUR_TOKEN"
```

**Check 3: Gateway logs**
```bash
journalctl -u hermes-gateway-user-{userId} -n 50
```

**Solution**: Manual restart
```bash
hermes --profile user-{userId} gateway stop
sleep 2
hermes --profile user-{userId} gateway start
```

---

### Problem: Gateway tidak bisa stop

**Symptoms**: Error saat stop gateway

**Check**:
```bash
systemctl status hermes-gateway-user-{userId}
```

**Solution**: Force stop
```bash
systemctl stop hermes-gateway-user-{userId}
systemctl start hermes-gateway-user-{userId}
```

---

### Problem: Bot token tidak valid

**Symptoms**: Gateway running tapi bot tidak respond

**Check**: Verify token dengan curl
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

**Expected**: JSON dengan bot info

**Solution**: Generate token baru dari @BotFather

---

## 📝 Files Modified

### Core Implementation
- ✅ `src/lib/hermes-integration.ts`
  - Added `restartGateway()` method
  - Updated `setupTelegram()` to restart gateway
  - Updated `setupDiscord()` to restart gateway

### API Routes
- ✅ `src/app/api/channels/route.ts`
  - Removed redundant `startGateway()` call
  - Gateway already restarted in setup methods

---

## 🎯 Benefits

### Before Fix
- ❌ Bot token saved but not applied
- ❌ Gateway needs manual restart
- ❌ User confused why bot not working
- ❌ Poor UX

### After Fix
- ✅ Bot token saved and applied automatically
- ✅ Gateway restarted automatically
- ✅ Bot works immediately after setup
- ✅ Great UX

---

## 📊 Deployment Status

**Commit**: 97a7729
**Branch**: main
**Status**: ✅ DEPLOYED

### GitHub
- ✅ Pushed to andriyansah77/blinkai

### VPS (159.65.141.68)
- ✅ Code pulled
- ✅ Build successful (50 pages)
- ✅ PM2 restarted
- ✅ Application online

---

## ✅ Verification

### Quick Test
```bash
# 1. Setup Telegram bot
# 2. Check logs
ssh root@159.65.141.68 "pm2 logs blinkai --lines 30 | grep Platform"

# Expected:
# [Platform] ✅ Telegram setup completed and gateway restarted
```

### Full Test
1. Register new user
2. Connect Telegram channel
3. Wait 2-3 seconds
4. Send message to bot
5. Bot should respond ✅

---

## 🎉 Summary

**Problem**: Bot token disimpan tapi gateway tidak restart, jadi bot tidak hidup.

**Solution**: Tambah `restartGateway()` method dan panggil setelah config berubah.

**Result**: Bot langsung hidup setelah setup, UX lebih baik.

---

**Status**: ✅ FIXED & DEPLOYED
**Date**: 2026-04-10
**Ready**: YES - Test sekarang!
