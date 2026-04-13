# PathUSD - Kemana Uangnya Masuk? 💰

## Jawaban Singkat:
**PathUSD masuk ke DATABASE platform sebagai REVENUE, bukan ke blockchain!**

---

## 🎯 2 Jenis Minting

### 1. Dashboard Minting (Managed Wallet)
```
┌─────────────────────────────────────────────────┐
│  User Balance: $10 PATHUSD                      │
│                                                  │
│  [Klik Mint] → Platform potong $1               │
│                                                  │
│  Database mencatat:                              │
│  ✓ User balance: $10 → $9                       │
│  ✓ Platform revenue: +$1                        │
│  ✓ Gas fee: ~$0.02 (dibayar platform)          │
│  ✓ Net profit: ~$0.98                           │
│                                                  │
│  User dapat: 10,000 REAGENT                     │
└─────────────────────────────────────────────────┘
```

**PathUSD masuk kemana?**
- ✅ Dicatat di tabel `UsdTransaction` (database)
- ✅ Menjadi revenue platform
- ✅ Sebagian untuk bayar gas (~$0.02)
- ✅ Sisanya profit (~$0.98)

---

### 2. Mining Web (External Wallet - MetaMask)
```
┌─────────────────────────────────────────────────┐
│  User MetaMask: 0.1 TEMPO                       │
│                                                  │
│  [Klik Mint] → Platform TIDAK potong pathUSD    │
│                                                  │
│  MetaMask popup:                                 │
│  ✓ Gas fee: ~0.001 TEMPO                        │
│  ✓ User approve & bayar sendiri                 │
│                                                  │
│  Platform revenue: $0                           │
│  User dapat: 10,000 REAGENT                     │
└─────────────────────────────────────────────────┘
```

**PathUSD masuk kemana?**
- ❌ **TIDAK ADA pathUSD yang dipotong!**
- ✅ User bayar gas langsung dari wallet
- ✅ Platform tidak dapat revenue

---

## 📊 Perbandingan

| Aspek | Dashboard (Managed) | Mining Web (External) |
|-------|---------------------|----------------------|
| PathUSD dipotong? | ✅ Ya ($1.00) | ❌ Tidak ($0.00) |
| Gas dibayar siapa? | Platform | User sendiri |
| Platform revenue? | ✅ Ya (~$0.98) | ❌ Tidak |
| User dapat REAGENT? | ✅ 10,000 | ✅ 10,000 |

---

## 💡 Kesimpulan

**PathUSD itu virtual balance di database, bukan cryptocurrency!**

Ketika user minting:
1. Platform potong pathUSD dari balance user (database)
2. Platform catat sebagai revenue (database)
3. Platform bayar gas fee ke blockchain (~$0.02)
4. Platform profit sisanya (~$0.98)

**Tidak ada transfer pathUSD ke blockchain!** Semua tracking di database saja.

---

## 🔍 Cara Cek

Lihat di database:
```sql
-- Cek balance user
SELECT * FROM UsdBalance WHERE userId = 'xxx';

-- Cek transaksi
SELECT * FROM UsdTransaction ORDER BY createdAt DESC LIMIT 10;

-- Cek total revenue platform
SELECT SUM(CAST(amount AS REAL)) FROM UsdTransaction 
WHERE type = 'inscription_fee';
```

---

**Intinya:** PathUSD = virtual currency di platform, bukan crypto di blockchain! 🎯
