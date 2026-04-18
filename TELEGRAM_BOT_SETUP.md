# Telegram Bot Setup Guide

## Register Slash Commands in BotFather

Untuk membuat slash commands muncul di Telegram bot, Anda perlu mendaftarkannya di BotFather.

### Step 1: Open BotFather

1. Buka Telegram
2. Cari `@BotFather`
3. Start chat dengan `/start`

### Step 2: Set Commands

1. Kirim command: `/setcommands`
2. Pilih bot Anda dari list
3. Copy-paste commands berikut:

```
mine - Mine REAGENT tokens (usage: /mine [amount])
balance - Check your wallet balance
wallet - View your wallet information
help - Show help message and available commands
start - Start the bot and link your account
```

### Step 3: Verify Commands

1. Buka chat dengan bot Anda
2. Ketik `/` - Anda akan melihat list commands
3. Test setiap command

## Alternative: Send Commands via BotFather

Jika cara di atas tidak bekerja, kirim dalam format ini ke BotFather:

```
/setcommands

mine - Mine REAGENT tokens
balance - Check wallet balance
wallet - View wallet info
help - Show help
start - Start bot
```

## Command Details

### /mine [amount]
- **Description**: Mine REAGENT tokens
- **Usage**: `/mine` or `/mine 5`
- **Parameters**: 
  - `amount` (optional): Number of times to mint (1-10)
  - Default: 1
- **Example**: 
  - `/mine` - Mint once (10,000 REAGENT)
  - `/mine 5` - Mint 5 times (50,000 REAGENT)

### /balance
- **Description**: Check your wallet balance
- **Usage**: `/balance`
- **Returns**: REAGENT and PATHUSD balance

### /wallet
- **Description**: View wallet information
- **Usage**: `/wallet`
- **Returns**: Wallet address, network, creation date

### /help
- **Description**: Show help message
- **Usage**: `/help`
- **Returns**: List of all commands with descriptions

### /start
- **Description**: Start bot and link account
- **Usage**: `/start`
- **Returns**: Welcome message and setup instructions

## Testing Commands

After registering commands in BotFather:

1. **Test /start**
   ```
   /start
   ```
   Expected: Welcome message

2. **Test /help**
   ```
   /help
   ```
   Expected: List of commands

3. **Test /balance**
   ```
   /balance
   ```
   Expected: Your balance info

4. **Test /wallet**
   ```
   /wallet
   ```
   Expected: Your wallet info

5. **Test /mine**
   ```
   /mine
   ```
   Expected: Mining result (1 mint)

6. **Test /mine with amount**
   ```
   /mine 3
   ```
   Expected: Mining result (3 mints)

## Troubleshooting

### Commands Not Showing

1. **Clear and re-register**:
   - Send `/deletecommands` to BotFather
   - Select your bot
   - Re-register with `/setcommands`

2. **Restart Telegram**:
   - Close and reopen Telegram app
   - Commands should appear

3. **Check bot username**:
   - Make sure you selected correct bot in BotFather
   - Verify bot token is correct

### Commands Not Working

1. **Check bot is running**:
   ```bash
   # Check Hermes instance
   hermes status
   
   # Check logs
   tail -f ~/.hermes/logs/bot.log
   ```

2. **Verify skill is loaded**:
   ```bash
   # List skills
   hermes skills list
   
   # Should show: telegram_commands
   ```

3. **Test API endpoint**:
   ```bash
   curl -X POST https://reagent.eu.cc/api/mining/simple-mint \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "X-User-ID: test_user" \
     -H "Content-Type: application/json" \
     -d '{"type":"auto"}'
   ```

### Account Not Linked

If you get "Account not linked" error:

1. Visit https://reagent.eu.cc
2. Login/Sign up
3. Go to Dashboard → Channels
4. Click "Connect Telegram"
5. Follow instructions to link
6. Send `/start` to bot again

## Advanced Configuration

### Custom Command Descriptions

You can customize command descriptions in BotFather:

```
mine - ⛏️ Mine REAGENT tokens (10K per mint)
balance - 💰 Check your REAGENT & PATHUSD balance
wallet - 👛 View your Tempo wallet address
help - ℹ️ Get help and see all commands
start - 🚀 Start mining and link your account
```

### Command Scopes

Set different commands for different user types:

1. **All users**: Basic commands (start, help)
2. **Group admins**: Admin commands
3. **Private chat**: All commands

To set scopes:
```
/setcommands
# Select bot
# Select scope (all_private_chats, all_group_chats, etc.)
# Enter commands
```

## Bot Menu Button

Enable menu button for easy access:

1. Send `/setmenubutton` to BotFather
2. Select your bot
3. Choose "Edit menu button"
4. Set button text: "Commands"
5. Set button URL: `https://reagent.eu.cc/docs/bot`

## Quick Reference

### BotFather Commands

- `/newbot` - Create new bot
- `/setcommands` - Set bot commands
- `/deletecommands` - Delete bot commands
- `/setdescription` - Set bot description
- `/setabouttext` - Set about text
- `/setuserpic` - Set bot profile picture
- `/setmenubutton` - Set menu button

### Bot Commands Format

```
command - description
```

Rules:
- Command: lowercase, no spaces, no special chars
- Description: max 256 characters
- Max 100 commands per bot

## Example Setup Session

```
You: /setcommands
BotFather: Choose a bot to change the list of commands.

You: @YourBotName
BotFather: OK. Send me a list of commands for your bot.

You: 
mine - Mine REAGENT tokens
balance - Check wallet balance
wallet - View wallet info
help - Show help
start - Start bot

BotFather: Success! Command list updated.
```

## Support

Need help?
- Documentation: https://reagent.eu.cc/docs
- Telegram: @Reagentempo_AI
- GitHub: https://github.com/andriyansah77/blinkai

## Next Steps

After setting up commands:

1. ✅ Register commands in BotFather
2. ✅ Test all commands
3. ✅ Link your account
4. ✅ Start mining!

Happy mining! ⛏️
