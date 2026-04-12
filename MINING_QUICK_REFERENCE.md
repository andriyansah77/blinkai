# 🚀 ReAgent Mining - Quick Reference

**Last Updated:** April 12, 2026  
**Status:** LIVE & OPERATIONAL ✅

---

## 📚 Documentation URLs

| Resource | URL | Status |
|----------|-----|--------|
| **API Docs** | https://mining.reagent.eu.cc/docs/index.html | ✅ LIVE |
| **Complete Guide** | https://mining.reagent.eu.cc/docs/mining-guide.md | ✅ LIVE |
| **Skills README** | https://mining.reagent.eu.cc/skills/README.md | ✅ LIVE |
| **Mining UI** | https://mining.reagent.eu.cc/ | ✅ LIVE |

---

## 🛠️ Download Skills

### Minting Skill
```bash
curl -O https://mining.reagent.eu.cc/skills/minting.sh
chmod +x minting.sh
```

### Wallet Skill
```bash
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
chmod +x wallet.sh
```

---

## ⚙️ Quick Setup

```bash
# 1. Download skills
curl -O https://mining.reagent.eu.cc/skills/minting.sh
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
chmod +x minting.sh wallet.sh

# 2. Configure
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="https://mining.reagent.eu.cc"

# 3. Test
./minting.sh get_balance
./wallet.sh check_balance
```

---

## 🎯 Common Commands

### Minting
```bash
# Check balance
./minting.sh get_balance

# Estimate gas
./minting.sh estimate_gas 1000

# Mint tokens
./minting.sh mint 1000

# Get stats
./minting.sh get_stats
```

### Wallet
```bash
# Check balance
./wallet.sh check_balance

# Get address
./wallet.sh get_address

# Send REAGENT
./wallet.sh send_reagent 0x742d35Cc... 1000

# Transaction history
./wallet.sh history
```

---

## 🔑 Get Your User ID

1. Register: https://reagent.eu.cc
2. Login to dashboard
3. Copy User ID from profile
4. Set: `export REAGENT_USER_ID="your-id"`

---

## 🌐 Network Info

| Property | Value |
|----------|-------|
| Network | Tempo Network |
| Chain ID | 4217 |
| RPC | https://rpc.tempo.xyz |
| Explorer | https://explore.tempo.xyz |
| REAGENT Token | 0x20C000000000000000000000a59277C0c1d65Bc5 |
| Decimals | 6 |

---

## 📖 Full Documentation

For complete guides, examples, and troubleshooting:

**👉 https://mining.reagent.eu.cc/docs/mining-guide.md**

Includes:
- Web interface tutorial
- AI agent integration
- API examples (JS, Python, cURL)
- Automation scripts
- Troubleshooting
- Best practices
- FAQ

---

## 🆘 Support

- **Docs:** https://mining.reagent.eu.cc/docs/
- **Dashboard:** https://reagent.eu.cc/dashboard
- **Health:** https://mining.reagent.eu.cc/health

---

## ✨ Quick Examples

### Example 1: Simple Mint
```bash
export REAGENT_USER_ID="your-id"
./minting.sh mint 1000
```

### Example 2: Check & Send
```bash
./wallet.sh check_balance
./wallet.sh send_reagent 0x742d... 500
```

### Example 3: Daily Auto-Mint
```bash
#!/bin/bash
export REAGENT_USER_ID="your-id"
./minting.sh mint 10000
```

Save as `daily-mint.sh`, then:
```bash
chmod +x daily-mint.sh
crontab -e
# Add: 0 9 * * * /path/to/daily-mint.sh
```

---

**Ready to start? Visit:** https://mining.reagent.eu.cc/docs/mining-guide.md
