# Setup Telegram Bot Commands

## Quick Setup (Recommended)

### Method 1: Using Python Script

```bash
# Navigate to skills directory
cd hermes-skills

# Run registration script
python register_telegram_commands.py YOUR_BOT_TOKEN
```

**Example:**
```bash
python register_telegram_commands.py 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Method 2: Using Environment Variable

```bash
# Set bot token
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"

# Run script
python hermes-skills/register_telegram_commands.py
```

### Method 3: Using Shell Script

```bash
# Make executable
chmod +x scripts/setup-telegram-commands.sh

# Run
./scripts/setup-telegram-commands.sh YOUR_BOT_TOKEN
```

## Manual Setup via BotFather

If automatic registration doesn't work, register manually:

1. Open Telegram and search for `@BotFather`
2. Send `/setcommands`
3. Select your bot
4. Copy and paste:

```
mine - Mine REAGENT tokens (usage: /mine [amount])
balance - Check your wallet balance
wallet - View your wallet information
help - Show help message and available commands
start - Start the bot and link your account
```

## Verify Commands

After registration:

1. Open your bot in Telegram
2. Type `/` - you should see all commands
3. Test each command:
   - `/start` - Welcome message
   - `/help` - Help text
   - `/balance` - Check balance
   - `/wallet` - Wallet info
   - `/mine` - Mine tokens

## Commands List

| Command | Description | Usage |
|---------|-------------|-------|
| `/mine` | Mine REAGENT tokens | `/mine` or `/mine 5` |
| `/balance` | Check wallet balance | `/balance` |
| `/wallet` | View wallet info | `/wallet` |
| `/help` | Show help | `/help` |
| `/start` | Start bot | `/start` |

## Troubleshooting

### Commands Not Showing

**Solution 1: Re-register**
```bash
python hermes-skills/register_telegram_commands.py YOUR_BOT_TOKEN
```

**Solution 2: Clear cache**
- Close Telegram completely
- Reopen and check bot

**Solution 3: Manual registration**
- Use BotFather method above

### "Unknown command" Error

This means:
- Commands are registered in Telegram UI
- But bot code is not handling them

**Check:**
1. Skill is loaded in Hermes
2. Bot is running
3. Environment variables are set

### Bot Not Responding

**Check bot status:**
```bash
# If using Hermes
hermes status

# Check logs
tail -f ~/.hermes/logs/bot.log
```

**Verify configuration:**
```bash
# Check environment variables
echo $TELEGRAM_BOT_TOKEN
echo $PLATFORM_URL
echo $PLATFORM_API_KEY
```

## Integration with Hermes

The `telegram_commands_skill.py` automatically provides command definitions:

```python
# Commands are defined in the skill
skill = TelegramCommandsSkill()
commands = skill.get_telegram_commands()

# Returns:
# [
#   {"command": "mine", "description": "..."},
#   {"command": "balance", "description": "..."},
#   ...
# ]
```

Hermes can use these to:
1. Auto-register on bot startup
2. Provide command help
3. Handle command routing

## Advanced: Auto-Registration on Startup

To auto-register commands when bot starts, add to your Hermes config:

```yaml
# .hermes-instances/your-bot/config.yaml
telegram:
  auto_register_commands: true
  bot_token: ${TELEGRAM_BOT_TOKEN}
```

Or in your bot initialization code:

```python
from telegram_commands_skill import TelegramCommandsSkill

# Initialize skill
skill = TelegramCommandsSkill()

# Register commands on startup
bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
if bot_token:
    skill.register_commands(bot_token)
```

## Testing

After setup, test all commands:

```bash
# In Telegram, send to your bot:
/start
/help
/balance
/wallet
/mine
/mine 3
```

Expected responses:
- ✅ Welcome message
- ✅ Help text with commands
- ✅ Balance information
- ✅ Wallet address
- ✅ Mining result (1 mint)
- ✅ Mining result (3 mints)

## Support

Need help?
- Check logs: `tail -f ~/.hermes/logs/bot.log`
- Test API: `curl https://reagent.eu.cc/api/mining/simple-mint`
- Documentation: https://reagent.eu.cc/docs
- Telegram: @Reagentempo_AI

## Quick Reference

```bash
# Register commands
python hermes-skills/register_telegram_commands.py YOUR_BOT_TOKEN

# Check bot info
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getMe

# Get current commands
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getMyCommands

# Delete commands
curl https://api.telegram.org/botYOUR_BOT_TOKEN/deleteMyCommands
```
