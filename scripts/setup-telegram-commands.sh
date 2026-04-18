#!/bin/bash

# Setup Telegram Bot Commands
# This script registers slash commands with Telegram Bot API

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Telegram Bot Commands Setup ===${NC}\n"

# Check if BOT_TOKEN is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Bot token not provided${NC}"
    echo "Usage: ./setup-telegram-commands.sh YOUR_BOT_TOKEN"
    echo ""
    echo "Get your bot token from @BotFather"
    exit 1
fi

BOT_TOKEN=$1

echo -e "${YELLOW}Setting up commands for bot...${NC}\n"

# Define commands in JSON format
COMMANDS='[
  {
    "command": "mine",
    "description": "Mine REAGENT tokens (usage: /mine [amount])"
  },
  {
    "command": "balance",
    "description": "Check your wallet balance"
  },
  {
    "command": "wallet",
    "description": "View your wallet information"
  },
  {
    "command": "help",
    "description": "Show help message and available commands"
  },
  {
    "command": "start",
    "description": "Start the bot and link your account"
  }
]'

# Call Telegram API to set commands
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands" \
  -H "Content-Type: application/json" \
  -d "{\"commands\": ${COMMANDS}}")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Commands registered successfully!${NC}\n"
    echo "Commands registered:"
    echo "  /mine - Mine REAGENT tokens"
    echo "  /balance - Check wallet balance"
    echo "  /wallet - View wallet info"
    echo "  /help - Show help"
    echo "  /start - Start bot"
    echo ""
    echo -e "${GREEN}You can now use these commands in your Telegram bot!${NC}"
else
    echo -e "${RED}❌ Failed to register commands${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

# Get bot info to verify
echo -e "\n${YELLOW}Verifying bot info...${NC}"
BOT_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")

if echo "$BOT_INFO" | grep -q '"ok":true'; then
    BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    BOT_NAME=$(echo "$BOT_INFO" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}Bot verified:${NC}"
    echo "  Name: $BOT_NAME"
    echo "  Username: @$BOT_USERNAME"
else
    echo -e "${YELLOW}Warning: Could not verify bot info${NC}"
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open Telegram and search for your bot"
echo "2. Type / to see the commands"
echo "3. Test with /start"
echo ""
