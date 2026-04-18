# Telegram Commands Auto-Registration

## Overview

Slash commands are now automatically registered when you configure a Telegram channel in the ReAgent dashboard. No manual setup required!

## How It Works

When you add a Telegram bot token in Dashboard → Channels → Add Channel:

1. ✅ Bot token is validated
2. ✅ Hermes gateway is configured
3. ✅ **Slash commands are automatically registered** (NEW!)
4. ✅ Bot is ready to use immediately

## Registered Commands

The following commands are automatically registered with your bot:

| Command | Description |
|---------|-------------|
| `/mine [amount]` | Mine REAGENT tokens (1-10 at a time) |
| `/balance` | Check your wallet balance |
| `/wallet` | View your wallet information |
| `/help` | Show help message and available commands |
| `/start` | Start the bot and link your account |

## User Experience

### Before (Manual Setup)
```bash
# User had to manually run:
cd /root/reagent/hermes-skills
python register_telegram_commands.py YOUR_BOT_TOKEN
```

### After (Automatic)
1. Go to Dashboard → Channels
2. Click "Add Channel"
3. Select "Telegram"
4. Paste bot token
5. Click "Connect"
6. ✅ Done! Commands are ready

## Technical Implementation

### API Endpoint: `/api/channels`

When a Telegram channel is created, the POST handler:

```typescript
// 1. Setup Telegram gateway
setupResult = await hermesIntegration.setupTelegram(userId, botToken);

// 2. Auto-register commands (if setup successful)
if (setupResult.success) {
  const commandsRegistered = await registerTelegramCommands(botToken);
  // Non-fatal: channel still works even if registration fails
}
```

### Command Registration Function

```typescript
async function registerTelegramCommands(botToken: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/setMyCommands`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commands: TELEGRAM_COMMANDS })
  });
  
  const result = await response.json();
  return result.ok === true;
}
```

## Error Handling

- Command registration is **non-fatal**
- If registration fails, the channel still works
- Users can still type commands manually
- Errors are logged but don't block channel creation

## Testing

### 1. Add Telegram Channel
```
Dashboard → Channels → Add Channel → Telegram
```

### 2. Check Commands in Telegram
Open your bot in Telegram and type `/` - you should see all commands listed

### 3. Test Commands
```
/start   → Welcome message
/help    → Command list
/mine 5  → Mine 5 REAGENT tokens
/balance → Check balance
/wallet  → View wallet info
```

## Benefits

✅ **Zero manual setup** - Commands work immediately  
✅ **Better UX** - Users see commands in Telegram UI  
✅ **Consistent** - All bots have the same commands  
✅ **Automatic** - No scripts to run or remember  
✅ **Reliable** - Happens during channel creation  

## Backward Compatibility

Existing bots that were set up manually will continue to work. If you want to update their commands, simply:

1. Remove the channel in dashboard
2. Add it again with the same bot token
3. Commands will be re-registered automatically

## Manual Registration (Optional)

If you need to manually register commands (e.g., for testing):

```bash
cd /root/reagent/hermes-skills
python register_telegram_commands.py YOUR_BOT_TOKEN
```

Or use the shell script:
```bash
cd /root/reagent/scripts
./setup-telegram-commands.sh YOUR_BOT_TOKEN
```

## Files Modified

- `src/app/api/channels/route.ts` - Added auto-registration logic
- `hermes-skills/telegram_commands_skill.py` - Command definitions
- `hermes-skills/register_telegram_commands.py` - Manual registration script (still available)

## Success Message

When you successfully add a Telegram channel, you'll see:

```
✅ Telegram channel connected successfully to your isolated Hermes instance! 
   Slash commands (/mine, /balance, /wallet, /help, /start) have been 
   automatically registered.
```

## Troubleshooting

### Commands not showing in Telegram?

1. Wait 1-2 minutes for Telegram to update
2. Close and reopen the chat with your bot
3. Type `/` to see if commands appear
4. Try `/help` to verify bot is responding

### Registration failed but channel works?

This is normal! The bot will still work, users just need to type commands manually. The registration is a UX enhancement, not a requirement.

### Want to verify registration?

Check server logs:
```bash
pm2 logs reagent | grep "Telegram commands"
```

You should see:
```
✅ Telegram commands auto-registered for user [userId]
```

## Related Documentation

- [TELEGRAM_BOT_MINING.md](./TELEGRAM_BOT_MINING.md) - Mining API integration
- [TELEGRAM_BOT_SETUP.md](./TELEGRAM_BOT_SETUP.md) - Bot setup guide
- [TELEGRAM_COMMANDS_SETUP.md](./TELEGRAM_COMMANDS_SETUP.md) - Manual command setup

---

**Status**: ✅ Implemented and deployed  
**Version**: 1.0.0  
**Date**: 2026-04-18
