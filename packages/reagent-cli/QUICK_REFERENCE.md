# ReAgent CLI - Quick Reference Card

## 🚀 Installation

```bash
# No install (npx)
npx @reagent/cli <command>

# Global install
npm install -g @reagent/cli
reagent <command>
```

## ⚙️ Setup

```bash
# Set environment variables
export REAGENT_API_BASE=https://reagent.eu.cc
export REAGENT_USER_ID=your_user_id

# Or create .env file
echo "REAGENT_API_BASE=https://reagent.eu.cc" > .env
echo "REAGENT_USER_ID=your_user_id" >> .env
```

## 📋 Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `reagent balance` | `b` | Check USD, ETH, REAGENT balance |
| `reagent estimate` | `e` | Estimate minting cost |
| `reagent mint` | `m` | Mint 10,000 REAGENT tokens |
| `reagent history` | `h` | View minting history |
| `reagent stats` | `s` | Global mining statistics |
| `reagent config` | - | Show current configuration |

## 🔧 Options

### History Options
```bash
reagent history --page 2          # Page number
reagent history --limit 20        # Items per page
reagent history --status confirmed # Filter by status
```

### cURL Generation
```bash
reagent balance --curl   # Show cURL command
reagent mint --curl      # Show cURL command
```

## 📝 Examples

### Basic Usage
```bash
# Check balance
npx @reagent/cli balance

# Mint tokens
npx @reagent/cli mint

# View last 5 mints
npx @reagent/cli history --limit 5
```

### With Aliases
```bash
reagent b              # Balance
reagent e              # Estimate
reagent m              # Mint
reagent h --limit 10   # History
reagent s              # Stats
```

### Generate cURL
```bash
# Get cURL command for balance
reagent balance --curl

# Output:
# curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
#   -H "Content-Type: application/json" \
#   -H "X-User-ID: YOUR_USER_ID" \
#   -d '{"action":"check_balance"}'
```

## 🌐 Direct cURL Usage

### Check Balance
```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}'
```

### Mint Tokens
```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"mint_tokens"}'
```

### Get History
```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_history","page":1,"limit":10}'
```

## 🤖 Automation

### Auto-Mint Script
```bash
#!/bin/bash
export REAGENT_USER_ID="your_user_id"
npx @reagent/cli balance
npx @reagent/cli estimate
npx @reagent/cli mint
```

### Cron Job (Daily at 10 AM)
```bash
0 10 * * * npx @reagent/cli mint >> /var/log/reagent.log 2>&1
```

### Monitor Balance
```bash
watch -n 30 'npx @reagent/cli balance'
```

## 🔐 Security

```bash
# Don't commit credentials
echo ".env" >> .gitignore

# Use environment variables
export REAGENT_USER_ID="..."

# Or use .env file
cat > .env << EOF
REAGENT_API_BASE=https://reagent.eu.cc
REAGENT_USER_ID=your_user_id
EOF
```

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| User ID not set | `export REAGENT_USER_ID="..."` |
| Cannot find module | `cd packages/reagent-cli && npm install` |
| Permission denied | `chmod +x index.js` |
| API connection failed | Check `REAGENT_API_BASE` |

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "usdBalance": "10.50",
    "ethBalance": "0.005",
    "reagentBalance": "50000"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Insufficient balance"
}
```

## 🔗 Links

- **Website:** https://reagent.eu.cc
- **GitHub:** https://github.com/andriyansah77/blinkai
- **Explorer:** https://explore.tempo.xyz
- **Docs:** [README.md](./README.md)
- **cURL Guide:** [CURL_EXAMPLES.md](./CURL_EXAMPLES.md)
- **Setup Guide:** [NPX_CLI_SETUP.md](../../NPX_CLI_SETUP.md)

## 💡 Pro Tips

1. Use aliases (`b`, `m`, `h`) for faster typing
2. Add `--curl` flag to any command for automation
3. Set up cron jobs for scheduled minting
4. Monitor balance before minting
5. Check history after minting for confirmation
6. Use `jq` for JSON parsing: `reagent balance | jq '.'`
7. Create shell aliases: `alias rm='reagent mint'`

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "mint": "reagent mint",
    "balance": "reagent balance",
    "history": "reagent history --limit 20"
  }
}
```

Then run: `npm run mint`

---

**Quick Start:** `npx @reagent/cli balance && npx @reagent/cli mint`
