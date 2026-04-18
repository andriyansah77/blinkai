# Quick Fix Guide - Deploy Sekarang!

## 🚀 Deploy dalam 5 Menit

### Step 1: SSH ke VPS
```bash
ssh root@188.166.247.252
```

### Step 2: Pull & Build
```bash
cd /root/reagent
git pull
npm run build
pm2 restart reagent
```

### Step 3: Fix Hermes
```bash
# Make script executable
chmod +x scripts/fix-hermes-chat.sh scripts/test-ai-mining.sh

# Run fix script
bash scripts/fix-hermes-chat.sh
```

### Step 4: Verify
```bash
# Check app status
pm2 status

# Check logs (should see no errors)
pm2 logs reagent --lines 50
```

### Step 5: Test di Browser
1. Open: https://reagent.eu.cc/mining
2. Hard refresh: `Ctrl + Shift + R`
3. Verify:
   - ✅ Page loads (no blank white)
   - ✅ Balance tampil dengan benar
   - ✅ "AI Agent Auto Mining" section muncul
   - ✅ API key bisa di-copy

### Step 6: Test AI Mining
```bash
# Get API key dari mining page, lalu:
export REAGENT_API_KEY="rgt_your_key_here"
export REAGENT_PLATFORM_URL="https://reagent.eu.cc"

# Run test
bash scripts/test-ai-mining.sh
```

## ✅ Verification Checklist

Setelah deploy, check:

- [ ] Mining page loads tanpa error
- [ ] Balance tampil normal (bukan scientific notation)
- [ ] AI Agent Setup section visible
- [ ] Skill files ada: `ls -la /root/.hermes/skills/auto_mining*`
- [ ] Skill test works: `python3 /root/.hermes/skills/auto_mining_skill.py check_balance`
- [ ] Hermes chat tidak 502/504

## 🔧 Jika Ada Masalah

### Mining Page Blank
```bash
# Hard refresh browser: Ctrl + Shift + R
# Check logs
pm2 logs reagent --lines 100
```

### Hermes 502/504
```bash
# Run fix script lagi
bash scripts/fix-hermes-chat.sh

# Restart
pm2 restart reagent
```

### Skill Not Found
```bash
# Copy skill files
cp hermes-skills/auto_mining_skill.* /root/.hermes/skills/
chmod +x /root/.hermes/skills/auto_mining_skill.py
```

## 📚 Dokumentasi Lengkap

- `RINGKASAN_PERBAIKAN.md` - Summary dalam Bahasa Indonesia
- `DEPLOY_AI_AGENT_MINING.md` - Detailed deployment guide
- `AI_AGENT_AUTO_MINING_COMPLETE.md` - Technical documentation

## 🎯 Yang Sudah Fixed

1. ✅ Mining page blank white error → Error boundary added
2. ✅ PATHUSD scientific notation → Auto-refresh + validation
3. ✅ Minting undefined → Null checks + fallbacks
4. ✅ AI agent code → Complete, ready to deploy

## 🔄 Yang Perlu Deploy

1. ⏳ Install Hermes skill
2. ⏳ Fix Hermes chat 502/504
3. ⏳ Test end-to-end

## ⏱️ Estimated Time

- Deploy: 5 menit
- Test: 5 menit
- Total: 10 menit

## 📞 Support

Jika masih ada masalah:
```bash
# Check logs
pm2 logs reagent

# Check Hermes
hermes profiles list
hermes skills list

# Restart everything
pm2 restart reagent
bash scripts/fix-hermes-chat.sh
```

---

**Ready to deploy!** 🚀
