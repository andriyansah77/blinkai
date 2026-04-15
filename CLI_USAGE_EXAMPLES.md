# ReAgent CLI - Usage Examples

Real-world examples untuk menggunakan ReAgent CLI.

## 🚀 Getting Started

### First Time Setup

```bash
# 1. Get your User ID from dashboard
# Login to https://reagent.eu.cc → Settings → Copy User ID

# 2. Set environment variable
export REAGENT_USER_ID="your_user_id_here"

# 3. Test connection
npx @reagent/cli config

# 4. Check your balance
npx @reagent/cli balance
```

## 📖 Basic Examples

### Example 1: Check Balance Before Minting

```bash
#!/bin/bash
# check-and-mint.sh

echo "Checking balance..."
npx @reagent/cli balance

echo ""
echo "Estimating cost..."
npx @reagent/cli estimate

echo ""
read -p "Proceed with minting? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Minting tokens..."
    npx @reagent/cli mint
else
    echo "Cancelled"
fi
```

### Example 2: Daily Minting Routine

```bash
#!/bin/bash
# daily-mint.sh

# Set credentials
export REAGENT_USER_ID="your_user_id"

# Log file
LOG_FILE="/var/log/reagent-daily.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting daily minting routine"

# Check balance
log "Checking balance..."
npx @reagent/cli balance | tee -a "$LOG_FILE"

# Estimate cost
log "Estimating cost..."
npx @reagent/cli estimate | tee -a "$LOG_FILE"

# Mint tokens
log "Minting tokens..."
npx @reagent/cli mint | tee -a "$LOG_FILE"

log "Daily minting complete"
```

### Example 3: Monitor Balance in Real-Time

```bash
#!/bin/bash
# monitor-balance.sh

export REAGENT_USER_ID="your_user_id"

while true; do
    clear
    echo "╔════════════════════════════════════════╗"
    echo "║   ReAgent Balance Monitor              ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    npx @reagent/cli balance
    
    echo ""
    echo "Press Ctrl+C to exit"
    echo "Refreshing in 30 seconds..."
    sleep 30
done
```

## 🤖 Automation Examples

### Example 4: Scheduled Minting with Cron

```bash
# Edit crontab
crontab -e

# Add these lines:

# Mint every day at 10:00 AM
0 10 * * * export REAGENT_USER_ID="your_user_id" && npx @reagent/cli mint >> /var/log/reagent-mint.log 2>&1

# Check balance every hour
0 * * * * export REAGENT_USER_ID="your_user_id" && npx @reagent/cli balance >> /var/log/reagent-balance.log 2>&1

# Weekly stats report (every Monday at 9 AM)
0 9 * * 1 export REAGENT_USER_ID="your_user_id" && npx @reagent/cli stats >> /var/log/reagent-stats.log 2>&1
```

### Example 5: Batch Minting with Delay

```bash
#!/bin/bash
# batch-mint.sh

export REAGENT_USER_ID="your_user_id"

MINT_COUNT=5
DELAY_SECONDS=120  # 2 minutes between mints

echo "Starting batch minting: $MINT_COUNT mints"
echo "Delay between mints: $DELAY_SECONDS seconds"
echo ""

for i in $(seq 1 $MINT_COUNT); do
    echo "═══════════════════════════════════════"
    echo "Mint $i of $MINT_COUNT"
    echo "═══════════════════════════════════════"
    
    # Check balance
    echo "Checking balance..."
    npx @reagent/cli balance
    
    echo ""
    
    # Mint
    echo "Minting tokens..."
    npx @reagent/cli mint
    
    # Wait before next mint (except for last one)
    if [ $i -lt $MINT_COUNT ]; then
        echo ""
        echo "Waiting $DELAY_SECONDS seconds before next mint..."
        sleep $DELAY_SECONDS
        echo ""
    fi
done

echo ""
echo "═══════════════════════════════════════"
echo "Batch minting complete!"
echo "═══════════════════════════════════════"

# Show final history
echo ""
echo "Recent minting history:"
npx @reagent/cli history --limit 5
```

### Example 6: Smart Minting (Check Balance First)

```bash
#!/bin/bash
# smart-mint.sh

export REAGENT_USER_ID="your_user_id"

# Minimum ETH balance required (in ETH)
MIN_ETH_BALANCE=0.002

echo "Smart Minting Script"
echo "===================="
echo ""

# Get balance (assuming JSON output)
BALANCE_OUTPUT=$(npx @reagent/cli balance)

# Extract ETH balance (this is simplified, you'd need jq for real parsing)
echo "$BALANCE_OUTPUT"
echo ""

# Estimate cost
echo "Estimating minting cost..."
ESTIMATE_OUTPUT=$(npx @reagent/cli estimate)
echo "$ESTIMATE_OUTPUT"
echo ""

# Ask for confirmation
read -p "Proceed with minting? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Minting tokens..."
    npx @reagent/cli mint
    
    echo ""
    echo "Checking updated balance..."
    npx @reagent/cli balance
else
    echo "Minting cancelled"
fi
```

## 📊 Reporting Examples

### Example 7: Daily Report

```bash
#!/bin/bash
# daily-report.sh

export REAGENT_USER_ID="your_user_id"

REPORT_FILE="reagent-report-$(date +%Y%m%d).txt"

{
    echo "╔════════════════════════════════════════╗"
    echo "║   ReAgent Daily Report                 ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    echo "═══ Current Balance ═══"
    npx @reagent/cli balance
    echo ""
    
    echo "═══ Recent History (Last 10) ═══"
    npx @reagent/cli history --limit 10
    echo ""
    
    echo "═══ Global Statistics ═══"
    npx @reagent/cli stats
    echo ""
    
    echo "Report generated at: $(date '+%Y-%m-%d %H:%M:%S')"
} | tee "$REPORT_FILE"

echo ""
echo "Report saved to: $REPORT_FILE"
```

### Example 8: Export History to CSV

```bash
#!/bin/bash
# export-history.sh

export REAGENT_USER_ID="your_user_id"

CSV_FILE="reagent-history-$(date +%Y%m%d).csv"

echo "Exporting minting history to CSV..."

# Header
echo "Date,Amount,Status,Cost ETH,Cost USD,TX Hash" > "$CSV_FILE"

# Get history and parse (simplified - you'd need jq for real parsing)
npx @reagent/cli history --limit 100 >> "$CSV_FILE"

echo "Export complete: $CSV_FILE"
```

## 🔧 Integration Examples

### Example 9: Integrate with Telegram Bot

```bash
#!/bin/bash
# telegram-mint-bot.sh

export REAGENT_USER_ID="your_user_id"
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"

# Function to send Telegram message
send_telegram() {
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$message" \
        -d "parse_mode=HTML" > /dev/null
}

# Mint tokens
send_telegram "🚀 Starting minting process..."

MINT_OUTPUT=$(npx @reagent/cli mint 2>&1)

if echo "$MINT_OUTPUT" | grep -q "Minting Successful"; then
    send_telegram "✅ Minting successful!%0A%0A$MINT_OUTPUT"
else
    send_telegram "❌ Minting failed!%0A%0A$MINT_OUTPUT"
fi
```

### Example 10: Integrate with Discord Webhook

```bash
#!/bin/bash
# discord-mint-webhook.sh

export REAGENT_USER_ID="your_user_id"
DISCORD_WEBHOOK_URL="your_webhook_url"

# Function to send Discord message
send_discord() {
    local message="$1"
    local color="$2"  # Decimal color code
    
    curl -s -X POST "$DISCORD_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"embeds\": [{
                \"title\": \"ReAgent Minting\",
                \"description\": \"$message\",
                \"color\": $color,
                \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }]
        }" > /dev/null
}

# Mint tokens
MINT_OUTPUT=$(npx @reagent/cli mint 2>&1)

if echo "$MINT_OUTPUT" | grep -q "Minting Successful"; then
    send_discord "✅ Minting successful!\n\n\`\`\`$MINT_OUTPUT\`\`\`" 3066993  # Green
else
    send_discord "❌ Minting failed!\n\n\`\`\`$MINT_OUTPUT\`\`\`" 15158332  # Red
fi
```

## 🔄 Advanced Examples

### Example 11: Multi-Account Minting

```bash
#!/bin/bash
# multi-account-mint.sh

# Array of user IDs
USER_IDS=(
    "user_id_1"
    "user_id_2"
    "user_id_3"
)

echo "Multi-Account Minting"
echo "====================="
echo "Total accounts: ${#USER_IDS[@]}"
echo ""

for i in "${!USER_IDS[@]}"; do
    USER_ID="${USER_IDS[$i]}"
    
    echo "═══════════════════════════════════════"
    echo "Account $((i+1)) of ${#USER_IDS[@]}"
    echo "User ID: $USER_ID"
    echo "═══════════════════════════════════════"
    
    export REAGENT_USER_ID="$USER_ID"
    
    # Check balance
    echo "Balance:"
    npx @reagent/cli balance
    
    echo ""
    
    # Mint
    echo "Minting:"
    npx @reagent/cli mint
    
    echo ""
    
    # Wait between accounts
    if [ $i -lt $((${#USER_IDS[@]} - 1)) ]; then
        echo "Waiting 60 seconds before next account..."
        sleep 60
        echo ""
    fi
done

echo "═══════════════════════════════════════"
echo "Multi-account minting complete!"
echo "═══════════════════════════════════════"
```

### Example 12: Conditional Minting Based on Price

```bash
#!/bin/bash
# conditional-mint.sh

export REAGENT_USER_ID="your_user_id"

# Maximum cost in USD
MAX_COST_USD=0.10

echo "Conditional Minting Script"
echo "=========================="
echo "Max cost: \$$MAX_COST_USD"
echo ""

# Estimate cost
echo "Estimating cost..."
ESTIMATE_OUTPUT=$(npx @reagent/cli estimate)
echo "$ESTIMATE_OUTPUT"

# Extract cost (simplified - you'd need proper parsing)
# For demo purposes, we'll just proceed
echo ""
read -p "Cost is acceptable. Proceed? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Minting tokens..."
    npx @reagent/cli mint
else
    echo "Cost too high. Skipping mint."
fi
```

## 📱 Mobile/Remote Examples

### Example 13: SSH Remote Minting

```bash
#!/bin/bash
# remote-mint.sh

# SSH into VPS and mint
ssh user@your-vps.com << 'EOF'
    export REAGENT_USER_ID="your_user_id"
    npx @reagent/cli balance
    npx @reagent/cli mint
EOF
```

### Example 14: Termux (Android) Minting

```bash
#!/data/data/com.termux/files/usr/bin/bash
# termux-mint.sh

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    pkg install nodejs
fi

# Set credentials
export REAGENT_USER_ID="your_user_id"

# Mint
npx @reagent/cli mint

# Send notification
termux-notification --title "ReAgent" --content "Minting complete"
```

## 🎯 Production Examples

### Example 15: Production Deployment Script

```bash
#!/bin/bash
# production-mint.sh

set -e  # Exit on error

# Configuration
export REAGENT_USER_ID="${REAGENT_USER_ID:-}"
LOG_DIR="/var/log/reagent"
LOG_FILE="$LOG_DIR/mint-$(date +%Y%m%d).log"

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handler
error_handler() {
    log "ERROR: Script failed at line $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Main script
log "Starting production minting"

# Validate environment
if [ -z "$REAGENT_USER_ID" ]; then
    log "ERROR: REAGENT_USER_ID not set"
    exit 1
fi

# Check balance
log "Checking balance..."
npx @reagent/cli balance | tee -a "$LOG_FILE"

# Estimate cost
log "Estimating cost..."
npx @reagent/cli estimate | tee -a "$LOG_FILE"

# Mint tokens
log "Minting tokens..."
npx @reagent/cli mint | tee -a "$LOG_FILE"

# Verify
log "Verifying mint..."
npx @reagent/cli history --limit 1 | tee -a "$LOG_FILE"

log "Production minting complete"
```

---

## 💡 Tips

1. **Always check balance** before minting
2. **Use logging** for production scripts
3. **Add error handling** with `set -e` and `trap`
4. **Test scripts** in development first
5. **Monitor logs** regularly
6. **Set up alerts** for failures
7. **Use cron** for scheduled tasks
8. **Backup credentials** securely

## 🔗 Resources

- [Quick Reference](./packages/reagent-cli/QUICK_REFERENCE.md)
- [cURL Examples](./packages/reagent-cli/CURL_EXAMPLES.md)
- [Setup Guide](./NPX_CLI_SETUP.md)
- [Test Guide](./packages/reagent-cli/TEST_GUIDE.md)

---

**Happy Minting! 🚀**
