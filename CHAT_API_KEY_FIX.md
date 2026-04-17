# Chat API Key Fix - COMPLETE ✅

## Problem

Chat tidak bisa berfungsi dengan error:
```
Error: AI API key not configured. Please set up your API key in settings or contact support.
```

## Root Cause

File `.env` di VPS tidak memiliki konfigurasi `PLATFORM_API_KEY` yang diperlukan oleh fungsi `getPlatformConfig()` di `src/lib/platform.ts`.

### Code Flow

1. User mengirim chat message
2. `streamDirectAIResponse()` memanggil `getUserAIConfig(userId)`
3. `getUserAIConfig()` check apakah user punya BYOK (Bring Your Own Key)
4. Jika tidak ada BYOK, return `getPlatformConfig()`
5. `getPlatformConfig()` membaca `process.env.PLATFORM_API_KEY`
6. **PROBLEM**: `PLATFORM_API_KEY` tidak ada di .env VPS → return empty string
7. Chat gagal dengan error "AI API key not configured"

## Solution

Menambahkan konfigurasi AI yang hilang ke `.env` di VPS:

```bash
# ─── AI Configuration (WAJIB untuk Hermes) ────────────────────────────────────
AI_API_KEY=akml-jiPghENoUyjtFxCEeGRunnoyiGMUHuji
AI_API_BASE_URL=https://api.akashml.com/v1
AI_MODEL=MiniMaxAI/MiniMax-M2.5
AI_PROVIDER_ID=AkashML

# ─── Platform AI Key (fallback jika Hermes tidak tersedia) ────────────────────
PLATFORM_API_KEY=akml-jiPghENoUyjtFxCEeGRunnoyiGMUHuji
PLATFORM_API_BASE_URL=https://api.akashml.com/v1
PLATFORM_API_MODEL=MiniMaxAI/MiniMax-M2.5

# ─── Credit System ────────────────────────────────────────────────────────────
SIGNUP_CREDIT_BONUS=1000
CREDIT_COST_PER_1K_TOKENS=10

# ─── Hermes Agent Framework ───────────────────────────────────────────────────
HERMES_CLI_AVAILABLE=true
HERMES_LEARNING_ENABLED=true
HERMES_MEMORY_ENABLED=true
HERMES_SKILLS_ENABLED=true

# ─── Wallet Encryption ────────────────────────────────────────────────────────
WALLET_ENCRYPTION_KEY=bDVCAHTKiBpd4EnsLqtlh7QyvXNfOGM9
```

## Implementation Steps

1. SSH ke VPS
```bash
ssh root@188.166.247.252
```

2. Tambahkan konfigurasi ke .env
```bash
cat >> /root/reagent/.env << 'EOF'
# AI Configuration
PLATFORM_API_KEY=akml-jiPghENoUyjtFxCEeGRunnoyiGMUHuji
PLATFORM_API_BASE_URL=https://api.akashml.com/v1
PLATFORM_API_MODEL=MiniMaxAI/MiniMax-M2.5
# ... (other configs)
EOF
```

3. Restart PM2 dengan update-env
```bash
pm2 restart reagent --update-env
```

## Verification

Check logs untuk memastikan platform mode aktif:
```bash
pm2 logs reagent --lines 20 | grep -i "platform\|api"
```

Expected output:
```
[Hermes] Using platform mode with model MiniMaxAI/MiniMax-M2.5
[Hermes] Sending X messages to AI API (including system prompt)
```

## How It Works Now

### Platform Mode (Default)
- User tidak perlu setup API key sendiri
- Menggunakan `PLATFORM_API_KEY` milik platform
- Credits dideduct dari user balance
- Model: MiniMaxAI/MiniMax-M2.5 via AkashML

### BYOK Mode (Optional)
- User bisa setup API key sendiri di settings
- Menggunakan API key user
- Credits TIDAK dideduct (user bayar sendiri ke provider)
- Model: Sesuai pilihan user

## Files Involved

- `/root/reagent/.env` - Environment variables (VPS)
- `src/lib/platform.ts` - Platform config functions
- `src/lib/hermes-integration.ts` - Chat integration with AI

## Testing

1. Login ke https://reagent.eu.cc
2. Go to Dashboard → Chat
3. Send message: "Hello, test chat"
4. Should receive response from AI
5. Check credits deducted in sidebar

## Status: ✅ FIXED

- Environment variables added to VPS
- PM2 restarted with new config
- Platform mode active
- Chat working with platform API key

## Credits System

- New users get 1000 credits on signup
- Each 1K tokens costs 10 credits
- Credits auto-deduct on each chat message
- Users can see balance in sidebar

---

**Result**: Chat sekarang berfungsi dengan platform API key! 🎉
