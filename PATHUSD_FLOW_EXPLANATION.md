# PathUSD Flow - Kemana PathUSD Masuk Saat Minting?

## 📊 Ringkasan Singkat

PathUSD yang dipotong saat minting **TIDAK masuk ke blockchain**, melainkan:
- ✅ Dicatat di database platform sebagai **revenue/pendapatan platform**
- ✅ Digunakan untuk membayar gas fee blockchain (untuk managed wallets)
- ✅ Tersimpan di tabel `UsdTransaction` sebagai audit trail

---

## 🔄 Alur Lengkap PathUSD

### 1️⃣ **Managed Wallet Minting** (Dashboard `/mining`)
User memiliki wallet yang dikelola platform (private key tersimpan terenkripsi).

**Biaya:** $1.00 PATHUSD per mint

**Alur:**
```
User Balance: $10.00 PATHUSD
         ↓
[Klik Mint Button]
         ↓
Platform deduct $1.00 dari balance
         ↓
Database: UsdTransaction created
  - type: "inscription_fee"
  - amount: "1.0"
  - balanceBefore: "10.0"
  - balanceAfter: "9.0"
         ↓
Platform sign & submit transaction
         ↓
Gas fee dibayar dari platform wallet
         ↓
User dapat 10,000 REAGENT
         ↓
User Balance: $9.00 PATHUSD
```

**Kemana $1.00 PATHUSD?**
- ❌ TIDAK masuk ke blockchain
- ✅ Masuk ke **platform revenue** (dicatat di database)
- ✅ Sebagian digunakan untuk bayar gas fee (~$0.01-0.05)
- ✅ Sisanya = profit platform (~$0.95-0.99)

---

### 2️⃣ **External Wallet Minting** (Mining Web `/mining-web`)
User menggunakan MetaMask (private key TIDAK tersimpan di platform).

**Biaya:** $0.00 PATHUSD (user bayar gas langsung dari wallet)

**Alur:**
```
User MetaMask Balance: 0.1 TEMPO
         ↓
[Klik Mint Button]
         ↓
Platform TIDAK deduct pathUSD
         ↓
Platform return unsigned transaction
         ↓
MetaMask popup muncul
         ↓
User approve & sign di MetaMask
         ↓
Gas fee dibayar langsung dari MetaMask (~0.001 TEMPO)
         ↓
Transaction submitted ke blockchain
         ↓
User dapat 10,000 REAGENT
         ↓
User MetaMask Balance: 0.099 TEMPO
```

**Kemana PathUSD?**
- ✅ **TIDAK ADA pathUSD yang dipotong!**
- ✅ User bayar gas fee langsung dari wallet mereka
- ✅ Platform TIDAK dapat revenue dari external wallet minting

---

## 💰 Database Schema - Tracking PathUSD

### Tabel: `UsdBalance`
Menyimpan saldo pathUSD setiap user:
```sql
{
  userId: "user123",
  balance: "9.0",        -- Total balance
  lockedBalance: "0.0",  -- Balance yang di-lock
  walletId: "wallet456"
}
```

### Tabel: `UsdTransaction`
Mencatat setiap transaksi pathUSD:
```sql
{
  id: "tx789",
  balanceId: "balance123",
  type: "inscription_fee",  -- Jenis transaksi
  amount: "1.0",            -- Jumlah yang dipotong
  balanceBefore: "10.0",    -- Balance sebelum
  balanceAfter: "9.0",      -- Balance sesudah
  description: "Inscription fee for minting",
  referenceType: "inscription",
  referenceId: "inscription_abc",
  createdAt: "2026-04-13T..."
}
```

### Tabel: `Inscription`
Mencatat setiap minting:
```sql
{
  id: "inscription_abc",
  userId: "user123",
  walletId: "wallet456",
  type: "manual",           -- auto atau manual
  status: "confirmed",
  inscriptionFee: "1.0",    -- Fee yang dibayar (0 untuk external wallet)
  gasFee: "0.02",           -- Gas yang digunakan
  tokensEarned: "10000",    -- REAGENT yang didapat
  txHash: "0x123...",
  confirmedAt: "2026-04-13T..."
}
```

---

## 🎯 Kesimpulan

### Untuk Managed Wallet (Dashboard):
- PathUSD **masuk ke platform revenue**
- Dicatat di database sebagai `UsdTransaction`
- Sebagian digunakan untuk bayar gas fee
- Sisanya = profit platform

### Untuk External Wallet (Mining Web):
- PathUSD **TIDAK dipotong sama sekali**
- User bayar gas langsung dari wallet mereka
- Platform tidak dapat revenue

---

## 📈 Contoh Perhitungan Revenue Platform

Jika 100 user minting dengan managed wallet:
```
100 mints × $1.00 = $100.00 revenue
100 mints × $0.02 gas = $2.00 gas cost
-----------------------------------
Net profit = $98.00
```

Jika 100 user minting dengan external wallet:
```
100 mints × $0.00 = $0.00 revenue
100 mints × $0.00 gas = $0.00 gas cost (user bayar sendiri)
-----------------------------------
Net profit = $0.00
```

---

## 🔍 Cara Cek PathUSD Flow

### 1. Cek Balance User
```bash
ssh root@159.65.141.68
sqlite3 /root/blinkai/prisma/dev.db
SELECT * FROM UsdBalance WHERE userId = 'USER_ID';
```

### 2. Cek Transaction History
```sql
SELECT * FROM UsdTransaction 
WHERE balanceId IN (SELECT id FROM UsdBalance WHERE userId = 'USER_ID')
ORDER BY createdAt DESC;
```

### 3. Cek Total Platform Revenue
```sql
SELECT 
  SUM(CAST(amount AS REAL)) as total_revenue,
  COUNT(*) as total_transactions
FROM UsdTransaction 
WHERE type = 'inscription_fee';
```

---

## ⚠️ Catatan Penting

1. **PathUSD bukan cryptocurrency** - ini hanya virtual balance di database
2. **Tidak ada smart contract** - semua tracking di database PostgreSQL/SQLite
3. **Refund otomatis** - jika minting gagal, pathUSD dikembalikan ke user
4. **Audit trail lengkap** - setiap transaksi tercatat dengan timestamp

---

**Tanggal:** 2026-04-13  
**Platform:** ReAgent (reagent.eu.cc)
