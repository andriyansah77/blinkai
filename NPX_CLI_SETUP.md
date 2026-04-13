# ReAgent NPX CLI - Setup Guide

Complete guide untuk menggunakan ReAgent CLI dengan NPX dan cURL.

## 🚀 Quick Start

### Menggunakan NPX (Tanpa Install)

```bash
# Check balance
npx @reagent/cli balance

# Mint tokens
npx @reagent/cli mint

# View history
npx @reagent/cli history
```

### Install Global

```bash
npm install -g @reagent/cli

# Sekarang bisa pakai langsung
reagent balance
reagent mint
reagent history
```

## 📦 Setup

### 1. Dapatkan User ID

1. Login ke https://reagent.eu.cc
2. Buka Dashboard
3. Copy User ID dari Settings atau Profile

### 2. Konfigurasi Environment Variables

Buat file `.env` di project folder:

```bash
REAGENT_API_BASE=https://reagent.eu.cc
REAGENT_USER_ID=your_user_id_here
```

Atau set di terminal:

```bash
export REAGENT_API_BASE=https://reagent.eu.cc
export REAGENT_USER_ID=your_user_id_here
```

### 3. Test Connection

```bash
npx @reagent/cli config
```

## 📖 Perintah Lengkap

### Check Balance

```bash
# Menggunakan NPX
npx @reagent/cli balance

# Atau alias
npx @reagent/cli b

# Lihat cURL command
npx @reagent/cli balance --curl
```

### Estimate Cost

```bash
# Estimate biaya minting
npx @reagent/cli estimate

# Alias
npx @reagent/cli e

# Lihat cURL command
npx @reagent/cli estimate --curl
```

### Mint Tokens

```bash
# Mint 10,000 REAGENT
npx @reagent/cli mint

# Alias
npx @reagent/cli m

# Lihat cURL command
npx @reagent/cli mint --curl
```

### View History

```bash
# Default (page 1, limit 10)
npx @reagent/cli history

# Alias
npx @reagent/cli h

# Dengan pagination
npx @reagent/cli history --page 2 --limit 20

# Filter by status
npx @reagent/cli history --status confirmed

# Lihat cURL command
npx @reagent/cli history --curl
```

### Global Stats

```bash
# Lihat statistik global
npx @reagent/cli stats

# Alias
npx @reagent/cli s

# Lihat cURL command
npx @reagent/cli stats --curl
```

### Show Config

```bash
# Lihat konfigurasi saat ini
npx @reagent/cli config
```

## 🔧 Menggunakan cURL

Setiap command bisa dikonversi ke cURL dengan flag `--curl`:

```bash
# Generate cURL command untuk balance
npx @reagent/cli balance --curl

# Output:
# curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
#   -H "Content-Type: application/json" \
#   -H "X-User-ID: YOUR_USER_ID" \
#   -d '{"action":"check_balance"}'
```

### Direct cURL Usage

#### Check Balance

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}'
```

#### Mint Tokens

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"mint_tokens"}'
```

#### Get History

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_history","page":1,"limit":10}'
```

## 🤖 Automation Scripts

### Auto-Mint Script

```bash
#!/bin/bash
# auto-mint.sh

# Set credentials
export REAGENT_USER_ID="your_user_id"

# Check balance
echo "Checking balance..."
npx @reagent/cli balance

# Estimate cost
echo -e "\nEstimating cost..."
npx @reagent/cli estimate

# Mint tokens
echo -e "\nMinting tokens..."
npx @reagent/cli mint
```

### Scheduled Minting (Cron)

```bash
# Edit crontab
crontab -e

# Mint setiap hari jam 10 pagi
0 10 * * * cd /path/to/project && npx @reagent/cli mint >> /var/log/reagent-mint.log 2>&1
```

### Monitor Balance

```bash
#!/bin/bash
# monitor.sh

while true; do
  clear
  echo "=== ReAgent Balance Monitor ==="
  date
  echo ""
  npx @reagent/cli balance
  echo ""
  echo "Refreshing in 30 seconds..."
  sleep 30
done
```

## 📝 Package.json Scripts

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "reagent:balance": "reagent balance",
    "reagent:mint": "reagent mint",
    "reagent:history": "reagent history",
    "reagent:stats": "reagent stats"
  }
}
```

Lalu jalankan:

```bash
npm run reagent:balance
npm run reagent:mint
```

## 🔐 Security Tips

1. **Jangan commit User ID** ke git
2. **Gunakan .env file** untuk credentials
3. **Add .env ke .gitignore**:

```bash
echo ".env" >> .gitignore
```

4. **Gunakan environment variables** di production:

```bash
# Di server
export REAGENT_USER_ID="production_user_id"
```

## 🐛 Troubleshooting

### Error: User ID not set

```bash
# Set User ID
export REAGENT_USER_ID="your_user_id"

# Atau buat .env file
echo "REAGENT_USER_ID=your_user_id" > .env
```

### Error: Cannot find module

```bash
# Install dependencies
cd packages/reagent-cli
npm install
```

### Error: Permission denied

```bash
# Make script executable
chmod +x index.js
```

### Error: API connection failed

```bash
# Check API base URL
npx @reagent/cli config

# Test connection
curl https://reagent.eu.cc/api/health
```

## 📚 Examples

### Example 1: Check Balance Before Minting

```bash
#!/bin/bash

# Check balance
BALANCE=$(npx @reagent/cli balance --json)
ETH=$(echo $BALANCE | jq -r '.data.ethBalance')

# Check if enough ETH
if (( $(echo "$ETH > 0.001" | bc -l) )); then
  echo "Sufficient balance, minting..."
  npx @reagent/cli mint
else
  echo "Insufficient ETH balance"
fi
```

### Example 2: Batch Minting

```bash
#!/bin/bash

for i in {1..5}; do
  echo "Mint $i of 5"
  npx @reagent/cli mint
  sleep 60  # Wait 1 minute between mints
done
```

### Example 3: Export History to CSV

```bash
#!/bin/bash

npx @reagent/cli history --json | \
  jq -r '.data.mints[] | [.createdAt, .amount, .status, .txHash] | @csv' \
  > minting-history.csv
```

## 🌐 Integration dengan Hermes AI

Skill untuk Hermes AI agent:

```bash
#!/bin/bash
# hermes-skill-mint.sh

case "$1" in
  "check")
    npx @reagent/cli balance
    ;;
  "mint")
    npx @reagent/cli mint
    ;;
  "history")
    npx @reagent/cli history --limit 5
    ;;
  *)
    echo "Usage: $0 {check|mint|history}"
    ;;
esac
```

## 📦 Publishing ke NPM

Jika ingin publish package sendiri:

```bash
cd packages/reagent-cli

# Login ke NPM
npm login

# Publish
npm publish --access public
```

## 🔗 Links

- Website: https://reagent.eu.cc
- GitHub: https://github.com/andriyansah77/blinkai
- Explorer: https://explore.tempo.xyz
- NPM: https://www.npmjs.com/package/@reagent/cli

## 💡 Tips

1. **Gunakan alias** untuk command yang sering dipakai
2. **Setup cron jobs** untuk automated minting
3. **Monitor balance** secara berkala
4. **Backup User ID** dengan aman
5. **Test di testnet** dulu sebelum production
6. **Gunakan --curl flag** untuk debugging
7. **Check history** setelah minting untuk konfirmasi

## 🆘 Support

Jika ada masalah:

1. Check dokumentasi: `npx @reagent/cli --help`
2. Lihat config: `npx @reagent/cli config`
3. Test dengan cURL: `npx @reagent/cli balance --curl`
4. Buka issue di GitHub
5. Join Discord community

---

**Happy Minting! 🚀**
