# ReAgent Mining API - Quick Reference

## 🚀 Installation URLs

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

## ⚙️ Configuration

```bash
export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="https://mining.reagent.eu.cc"
```

## 📚 Documentation

- **Full Docs**: https://mining.reagent.eu.cc/docs
- **Health Status**: https://mining.reagent.eu.cc/health
- **Skills README**: https://mining.reagent.eu.cc/skills/README.md

## ⛏️ Minting Commands

```bash
# Get balance
./minting.sh get_balance

# Estimate gas
./minting.sh estimate_gas 1000

# Mint tokens
./minting.sh mint 1000

# Get statistics
./minting.sh get_stats
```

## 💰 Wallet Commands

```bash
# Check balance
./wallet.sh check_balance

# Get address
./wallet.sh get_address

# Send ETH
./wallet.sh send_eth <to_address> <amount>

# Send REAGENT
./wallet.sh send_reagent <to_address> <amount>

# Transaction history
./wallet.sh history
```

## 🌐 API Endpoints

### Minting API
```bash
POST https://mining.reagent.eu.cc/api/hermes/skills/minting
```

**Actions**: `get_balance`, `estimate_gas`, `mint`, `get_stats`

### Wallet API
```bash
POST https://mining.reagent.eu.cc/api/hermes/skills/wallet
```

**Actions**: `check_balance`, `get_address`, `send_eth`, `send_reagent`, `get_history`

## 🔑 Authentication

Add header to API requests:
```bash
-H "X-User-ID: your-user-id"
```

## 📊 Network Info

- **Network**: Tempo Network
- **Chain ID**: 4217
- **RPC**: https://rpc.tempo.xyz
- **Explorer**: https://explore.tempo.xyz
- **REAGENT Token**: 0x20C000000000000000000000a59277C0c1d65Bc5

## 🚦 Rate Limits

- **Read operations**: 60 req/min
- **Write operations**: 10 req/min
- **Burst limit**: 100 req/hour

## 💡 Examples

### Check Balance and Mint
```bash
./minting.sh get_balance
./minting.sh estimate_gas 1000
./minting.sh mint 1000
```

### Send Tokens
```bash
./wallet.sh check_balance
./wallet.sh send_reagent 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000
```

## 🔗 Links

- **Main Platform**: https://reagent.eu.cc
- **Mining API**: https://mining.reagent.eu.cc
- **Documentation**: https://mining.reagent.eu.cc/docs
- **Health Status**: https://mining.reagent.eu.cc/health

---

**Version**: 1.0.0 | **Updated**: April 12, 2026
