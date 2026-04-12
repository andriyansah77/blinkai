# Cara Test Mining Web Interface

## Status Deployment ✅
- Code terbaru sudah di-deploy ke VPS
- Build berhasil tanpa error
- PM2 sudah restart
- Logs sudah di-clear untuk monitoring

## Langkah-Langkah Testing

### 1. Buka Halaman Mining Web
```
https://mining.reagent.eu.cc
```

### 2. Sign In ke Akun ReAgent
- Klik tombol "Sign In" di header
- Login dengan akun ReAgent Anda
- Setelah login, Anda akan redirect kembali ke mining-web

### 3. Connect MetaMask Wallet
- Klik tombol "Connect Wallet"
- MetaMask akan popup
- Approve koneksi
- Sistem akan otomatis:
  - Switch ke Tempo Network (atau add network jika belum ada)
  - Link wallet address ke akun Anda di database
  - Tampilkan balance PATH dan REAGENT

### 4. Cek Status
Setelah wallet connected, Anda akan melihat:

**Jika Belum Ada Balance pathUSD:**
```
⚠️ Deposit Required

You need pathUSD balance to mint REAGENT tokens. 
Each mint costs approximately 1.0 pathUSD (protocol fee + gas).

Current Balance: 0 pathUSD
Required: 1.0 pathUSD

Please deposit pathUSD to your account to continue.
```

**Jika Sudah Ada Balance pathUSD:**
- Tidak ada warning
- Tombol "Mint" aktif
- Bisa langsung mint REAGENT

### 5. Test Minting (Jika Ada Balance)
- Masukkan jumlah mints (1-50)
- Klik "Estimate Gas" untuk lihat biaya
- Klik "Mint" untuk execute
- Tunggu konfirmasi

## Error Messages yang Mungkin Muncul

### ✅ "Wallet not linked. Please connect your wallet first and refresh the page."
**Artinya:** Wallet belum ter-register di database
**Solusi:** 
1. Pastikan sudah sign in
2. Connect wallet lagi
3. Refresh halaman
4. Cek browser console untuk error

### ✅ "Insufficient pathUSD balance. Required: 1.001 pathUSD. Current: 0 pathUSD."
**Artinya:** Tidak ada balance pathUSD di database
**Solusi:** Deposit pathUSD ke akun (hubungi support)

### ✅ "Authentication required. Please sign in."
**Artinya:** Belum login ke akun ReAgent
**Solusi:** Klik tombol "Sign In" di header

## Debugging

### Cek Browser Console
Buka Developer Tools (F12) dan lihat Console tab untuk:
- Error messages detail
- API response logs
- Wallet linking status

### Cek Server Logs
```bash
ssh root@159.65.141.68
cd /root/blinkai
pm2 logs reagent --lines 50
```

### Cek Database
```bash
ssh root@159.65.141.68
cd /root/blinkai
npx prisma studio
```
Lalu cek table `Wallet` dan `UsdBalance` untuk user Anda.

## API Endpoints Baru

### 1. POST /api/mining/wallet/link
Link MetaMask wallet ke akun user
```json
Request:
{
  "address": "0x1234..."
}

Response:
{
  "success": true,
  "message": "Wallet linked successfully",
  "wallet": {
    "address": "0x1234...",
    "linked": true
  }
}
```

### 2. GET /api/mining/status
Cek status mining user
```json
Response:
{
  "success": true,
  "status": {
    "authenticated": true,
    "hasWallet": true,
    "walletAddress": "0x1234...",
    "balance": {
      "total": "0",
      "available": "0",
      "locked": "0"
    },
    "canMint": false,
    "requirements": {
      "minBalance": "1.0",
      "currency": "pathUSD"
    }
  }
}
```

## Yang Sudah Diperbaiki

1. ✅ Wallet auto-link saat connect MetaMask
2. ✅ Error messages lebih jelas dan spesifik
3. ✅ Status display menunjukkan apa yang kurang
4. ✅ TypeScript build errors sudah fixed
5. ✅ Next.js cache cleared dan rebuild fresh

## Next Steps

### Untuk User Biasa
1. Sign in → Connect wallet → Deposit pathUSD → Mint

### Untuk Testing
1. Buat test user
2. Sign in dengan test user
3. Connect wallet
4. Cek apakah wallet ter-link di database
5. Tambah pathUSD balance manual di database
6. Test minting

### Untuk Production
1. Setup deposit system untuk pathUSD
2. Atau implement client-side signing (MetaMask langsung bayar)
3. Add balance top-up UI

## Kontak
Jika masih ada error:
1. Screenshot error di browser console
2. Copy error message lengkap
3. Cek PM2 logs di server
4. Share semua info untuk debugging

---

**Status:** ✅ Ready for testing
**URL:** https://mining.reagent.eu.cc
**Date:** 2026-04-12
