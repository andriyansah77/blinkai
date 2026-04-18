# Deploy AI Agent Auto Mining - Step by Step

## Status Saat Ini
✅ Code sudah di-build dan deploy ke VPS
✅ Database migration sudah selesai
✅ Mining page sudah include AIAgentSetup component
⏳ Hermes skill belum di-install
⏳ Hermes CLI mengalami error 502/504

## Masalah yang Perlu Diperbaiki

### 1. Hermes Chat API Error (502/504)
**Penyebab**: Hermes CLI tidak berjalan dengan baik atau timeout
**Solusi**: Restart Hermes service dan verifikasi konfigurasi

### 2. Mining Page Sudah Fixed
✅ Error boundaries sudah ditambahkan
✅ Null checks untuk semua balance fields
✅ Safe formatting untuk PATHUSD dan REAGENT balance
✅ Fallback values untuk undefined data

## Langkah Deployment

### Step 1: SSH ke VPS
```bash
ssh root@188.166.247.252
```

### Step 2: Verify Application Status
```bash
cd /root/reagent
pm2 status
pm2 logs reagent --lines 50
```

### Step 3: Install Auto Mining Skill
```bash
# Copy skill files ke Hermes skills directory
cp /root/reagent/hermes-skills/auto_mining_skill.py /root/.hermes/skills/
cp /root/reagent/hermes-skills/auto_mining_skill.json /root/.hermes/skills/

# Make executable
chmod +x /root/.hermes/skills/auto_mining_skill.py

# Verify installation
ls -la /root/.hermes/skills/auto_mining*
```

### Step 4: Test Skill (Manual Test)
```bash
# Set environment variables
export REAGENT_PLATFORM_URL="https://reagent.eu.cc"

# Get API key from mining page first, then:
export REAGENT_API_KEY="rgt_your_api_key_here"

# Test check balance
python3 /root/.hermes/skills/auto_mining_skill.py check_balance

# Test start mining (if balance sufficient)
python3 /root/.hermes/skills/auto_mining_skill.py start_mining 1
```

### Step 5: Fix Hermes Chat API (502/504 Error)

#### Option A: Restart Hermes Service
```bash
# Check if Hermes is running
ps aux | grep hermes

# Kill any stuck Hermes processes
pkill -f hermes

# Restart application
pm2 restart reagent

# Check logs
pm2 logs reagent --lines 100
```

#### Option B: Check Hermes Configuration
```bash
# Verify Hermes CLI is installed
which hermes
/root/.local/bin/hermes --version

# Check Hermes profiles
hermes profiles list

# Check if default profile exists
ls -la /root/.hermes/profiles/

# If no profiles, create one
hermes profiles create default
```

#### Option C: Increase Timeout in Chat API
Edit `/root/reagent/src/app/api/hermes/chat/route.ts` jika masih timeout:
- Conversation history sudah di-limit ke 6 messages
- Bisa dikurangi lagi ke 4 messages jika masih timeout

### Step 6: Verify Mining Page
```bash
# Open browser and hard refresh
# URL: https://reagent.eu.cc/mining
# Press: Ctrl + Shift + R (hard refresh)

# Check for:
# 1. No blank white page
# 2. Balance displays correctly (not scientific notation)
# 3. AI Agent Setup section appears
# 4. API key is displayed
```

### Step 7: Test AI Agent Auto Mining

#### 7.1 Get API Key from UI
1. Open https://reagent.eu.cc/mining
2. Scroll to "AI Agent Auto Mining" section
3. Click eye icon to show API key
4. Copy API key

#### 7.2 Set Environment Variable
```bash
export REAGENT_API_KEY="rgt_your_copied_key"
export REAGENT_PLATFORM_URL="https://reagent.eu.cc"
```

#### 7.3 Test Commands
```bash
# Check balance
python3 /root/.hermes/skills/auto_mining_skill.py check_balance

# Expected output:
# {
#   "success": true,
#   "pathusd_balance": 1.5,
#   "reagent_balance": 0,
#   "wallet_address": "0x...",
#   "can_mint": true
# }

# Start mining
python3 /root/.hermes/skills/auto_mining_skill.py start_mining 1

# Expected output:
# {
#   "success": true,
#   "total_operations": 1,
#   "successful": 1,
#   "failed": 0,
#   "total_tokens_earned": 10000,
#   "results": [...]
# }
```

#### 7.4 Test via Hermes Chat (if working)
```bash
# Start Hermes chat
hermes chat

# Try commands:
# "Check my REAGENT balance"
# "Start mining REAGENT"
# "Mint 3 REAGENT tokens"
```

## Troubleshooting

### Mining Page Blank White Error
**Sudah Fixed!** Error boundaries dan null checks sudah ditambahkan.
Jika masih terjadi:
1. Hard refresh browser (Ctrl + Shift + R)
2. Clear browser cache
3. Check browser console untuk error details

### PATHUSD Balance Shows 0
**Sudah Fixed!** Auto-refresh setiap 30 detik dari blockchain.
Jika masih 0:
1. Verify wallet has PATHUSD on Tempo Explorer
2. Wait 30 seconds for auto-refresh
3. Click "Refresh" button manually

### Hermes Chat 502/504 Error
**Perlu diperbaiki!** Ikuti Step 5 di atas.
Kemungkinan penyebab:
1. Hermes CLI tidak running
2. Profile tidak ada
3. Timeout karena conversation history terlalu panjang
4. Memory/CPU overload

### Skill Not Found
```bash
# Verify skill files exist
ls -la /root/.hermes/skills/auto_mining*

# If not exist, copy again
cp /root/reagent/hermes-skills/auto_mining_skill.* /root/.hermes/skills/
chmod +x /root/.hermes/skills/auto_mining_skill.py
```

### API Key Invalid
1. Regenerate API key from mining page UI
2. Copy new key
3. Update environment variable
4. Try again

## Verification Checklist

- [ ] Application running (pm2 status shows "online")
- [ ] Mining page loads without blank white error
- [ ] Balance displays correctly (no scientific notation)
- [ ] AI Agent Setup section visible
- [ ] API key can be copied
- [ ] Skill files exist in /root/.hermes/skills/
- [ ] Skill test commands work
- [ ] Hermes chat API responds (no 502/504)
- [ ] Can mint via skill successfully

## Next Steps After Deployment

1. **Test dengan Real User**
   - User login ke https://reagent.eu.cc/mining
   - User copy API key
   - User set environment variable
   - User test skill commands

2. **Monitor Hermes Chat**
   - Check pm2 logs untuk errors
   - Monitor response times
   - Verify no more 502/504 errors

3. **Add Monitoring**
   - Log skill usage
   - Track minting success rate
   - Monitor API key usage

4. **Future Enhancements**
   - Add scheduling (mint every X hours)
   - Add notifications when minting complete
   - Add multi-wallet support
   - Add batch minting optimization

## Quick Commands Reference

```bash
# SSH to VPS
ssh root@188.166.247.252

# Check app status
pm2 status
pm2 logs reagent --lines 50

# Test skill
export REAGENT_API_KEY="rgt_..."
export REAGENT_PLATFORM_URL="https://reagent.eu.cc"
python3 /root/.hermes/skills/auto_mining_skill.py check_balance

# Restart app
pm2 restart reagent

# Check Hermes
hermes profiles list
hermes skills list

# View logs
tail -f /root/.pm2/logs/reagent-out.log
tail -f /root/.pm2/logs/reagent-error.log
```

## Support

Jika masih ada masalah:
1. Check pm2 logs: `pm2 logs reagent`
2. Check browser console untuk frontend errors
3. Test API endpoints manually dengan curl
4. Verify database connection
5. Check Hermes CLI status

---

**Status**: Ready for deployment
**Last Updated**: 2026-04-17
**Priority**: High (Hermes Chat 502/504 needs immediate fix)
