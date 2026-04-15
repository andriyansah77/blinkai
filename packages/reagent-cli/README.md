# @reagent/cli

CLI tool for ReAgent - Mint REAGENT tokens and manage your AI agent from the command line.

## Installation

### Using npx (Recommended)

No installation required! Just run:

```bash
npx @reagent/cli balance
npx @reagent/cli mint
```

### Global Installation

```bash
npm install -g @reagent/cli
reagent balance
reagent mint
```

### Local Installation

```bash
npm install @reagent/cli
npx reagent balance
```

## Configuration

Create a `.env` file in your project root or set environment variables:

```bash
REAGENT_API_BASE=https://reagent.eu.cc
REAGENT_USER_ID=your_user_id_here
REAGENT_SESSION_TOKEN=your_session_token_here
```

You can get your User ID and Session Token from the ReAgent dashboard.

## Commands

### Check Balance

Check your USD, ETH, and REAGENT balance:

```bash
npx @reagent/cli balance
# or
reagent balance
reagent b
```

### Estimate Minting Cost

Estimate the cost to mint 10,000 REAGENT tokens:

```bash
npx @reagent/cli estimate
# or
reagent estimate
reagent e
```

### Mint Tokens

Mint 10,000 REAGENT tokens:

```bash
npx @reagent/cli mint
# or
reagent mint
reagent m
```

### View Minting History

Get your minting transaction history:

```bash
npx @reagent/cli history
# or
reagent history
reagent h

# With options
reagent history --page 2 --limit 20
reagent history --status confirmed
```

Options:
- `-p, --page <number>` - Page number (default: 1)
- `-l, --limit <number>` - Items per page (default: 10)
- `-s, --status <status>` - Filter by status (pending/confirmed/failed)

### Global Statistics

Get global mining statistics:

```bash
npx @reagent/cli stats
# or
reagent stats
reagent s
```

### Show Configuration

Display current CLI configuration:

```bash
npx @reagent/cli config
# or
reagent config
```

## Using cURL Instead

Every command supports the `--curl` flag to show the equivalent cURL command:

```bash
# Show cURL command for balance check
reagent balance --curl

# Show cURL command for minting
reagent mint --curl

# Show cURL command for history
reagent history --page 1 --limit 5 --curl
```

Example output:

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}'
```

## Direct cURL Usage

You can also use cURL directly without the CLI:

### Check Balance

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"check_balance"}'
```

### Estimate Cost

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"estimate_cost"}'
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

### Get Stats

```bash
curl -X POST "https://reagent.eu.cc/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: YOUR_USER_ID" \
  -d '{"action":"get_stats"}'
```

## Examples

### Quick Start

```bash
# Check your balance
npx @reagent/cli balance

# Estimate minting cost
npx @reagent/cli estimate

# Mint tokens
npx @reagent/cli mint

# View history
npx @reagent/cli history
```

### Advanced Usage

```bash
# View last 20 confirmed mints
reagent history --limit 20 --status confirmed

# Get cURL command for automation
reagent mint --curl > mint-command.sh
chmod +x mint-command.sh
./mint-command.sh
```

### Automation with cURL

```bash
# Save your credentials
export REAGENT_USER_ID="your_user_id"
export REAGENT_API="https://reagent.eu.cc"

# Create a minting script
cat > auto-mint.sh << 'EOF'
#!/bin/bash
curl -X POST "$REAGENT_API/api/hermes/skills/minting" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: $REAGENT_USER_ID" \
  -d '{"action":"mint_tokens"}'
EOF

chmod +x auto-mint.sh
./auto-mint.sh
```

## Features

- ✅ Check balance (USD, ETH, REAGENT)
- ✅ Estimate minting costs
- ✅ Mint 10,000 REAGENT tokens
- ✅ View minting history with pagination
- ✅ Global mining statistics
- ✅ Generate cURL commands for automation
- ✅ Colorful terminal output
- ✅ Loading spinners
- ✅ Error handling
- ✅ Environment variable configuration

## Requirements

- Node.js >= 14.0.0
- ReAgent account with User ID
- ETH balance for gas fees

## Support

- Website: https://reagent.eu.cc
- GitHub: https://github.com/andriyansah77/blinkai
- Explorer: https://explore.tempo.xyz

## License

MIT License - see LICENSE file for details
