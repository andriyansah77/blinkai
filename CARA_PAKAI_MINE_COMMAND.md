# Cara Pakai Command /mine

## Langkah Mudah

### 1. Buka Chat
- Pergi ke https://reagent.eu.cc/dashboard/chat
- Pastikan sudah login

### 2. Ketik Command
```
/mine
```
atau dengan jumlah:
```
/mine 5
```

### 3. Approve di MetaMask
- MetaMask akan popup
- Klik "Confirm" untuk approve transaction
- Tunggu sampai selesai

### 4. Selesai!
- Chat akan menampilkan progress
- Tokens akan masuk ke wallet Anda
- Cek balance di Mining page

## Contoh Penggunaan

### Mint 1x (10,000 REAGENT)
```
/mine
```
atau
```
/mine 1
```

### Mint 5x (50,000 REAGENT)
```
/mine 5
```

### Mint 10x (100,000 REAGENT)
```
/mine 10
```

## Yang Dibutuhkan

✅ MetaMask installed  
✅ Wallet sudah connected  
✅ Ada PATHUSD untuk gas fees  
✅ Wallet punya ISSUER_ROLE  

## Keuntungan

- 🚀 Cepat - Langsung dari chat
- 💬 Mudah - Tinggal ketik command
- 📊 Real-time - Lihat progress langsung
- 🔒 Aman - Private key tetap di MetaMask

## Troubleshooting

### "MetaMask not found"
→ Install MetaMask extension dulu

### "Invalid amount"
→ Gunakan angka 1-10 saja

### "Transaction failed"
→ Pastikan ada PATHUSD untuk gas

### "Rate limit exceeded"
→ Tunggu 1 jam, max 10 mints per jam

## Tips

💡 Gunakan `/mine 10` untuk mining maksimal sekaligus  
💡 Tunggu 2 detik antara setiap mint (otomatis)  
💡 Cek balance di Mining page setelah selesai  
💡 Transaction butuh beberapa menit untuk confirm  

## Deploy ke VPS

```bash
ssh root@188.166.247.252
cd /root/reagent
git pull origin main
npm run build
pm2 restart reagent
```

Setelah deploy, hard refresh browser (Ctrl+Shift+R) dan test command `/mine` di chat!
