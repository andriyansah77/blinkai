# Deploy Auto-Registration Feature

## Quick Deploy

```bash
# 1. Push changes (if not already done)
git add .
git commit -m "feat: auto-register Telegram commands on channel setup"
git push origin main

# 2. SSH to VPS
ssh root@188.166.247.252

# 3. Pull and deploy
cd /root/reagent
git pull
npm run build
pm2 restart reagent

# 4. Verify
pm2 logs reagent --lines 20
```

## Test After Deployment

### 1. Test Channel Creation

1. Go to https://reagent.eu.cc/dashboard/channels
2. Click "Add Channel"
3. Select "Telegram"
4. Paste bot token from @BotFather
5. Click "Connect"
6. Look for success message mentioning commands

### 2. Verify in Telegram

1. Open your bot in Telegram
2. Type `/` (forward slash)
3. You should see:
   ```
   /mine - Mine REAGENT tokens (usage: /mine [amount])
   /balance - Check your wallet balance
   /wallet - View your wallet information
   /help - Show help message and available commands
   /start - Start the bot and link your account
   ```

### 3. Test Commands

```
/start
Expected: Welcome message

/help
Expected: Command list with descriptions

/mine 3
Expected: Mining 3 times, showing results

/balance
Expected: REAGENT and PATHUSD balance

/wallet
Expected: Wallet address and info
```

### 4. Check Server Logs

```bash
pm2 logs reagent | grep "Telegram"
```

Look for:
```
✅ Telegram commands auto-registered for user [userId]
```

## Troubleshooting

### Commands Not Registered

Check logs:
```bash
pm2 logs reagent --lines 100 | grep -i "command"
```

If you see errors, check:
1. Bot token is valid
2. Bot has proper permissions
3. Network connectivity to Telegram API

### Channel Created But No Commands

This is OK! The registration is non-fatal. Users can:
1. Still use commands by typing them manually
2. Register manually using the script
3. Remove and re-add the channel

### Manual Registration (Fallback)

If auto-registration fails:
```bash
cd /root/reagent/hermes-skills
python register_telegram_commands.py YOUR_BOT_TOKEN
```

## Rollback (If Needed)

If something goes wrong:
```bash
cd /root/reagent
git log --oneline -5  # Find previous commit
git reset --hard COMMIT_HASH
npm run build
pm2 restart reagent
```

## Success Criteria

✅ Build completes without errors  
✅ PM2 restart successful  
✅ Can add Telegram channel in dashboard  
✅ Commands appear in Telegram bot  
✅ All commands work correctly  
✅ Logs show successful registration  

## Files Changed

- `src/app/api/channels/route.ts` - Main implementation
- `TELEGRAM_BOT_SETUP.md` - Updated docs
- `TELEGRAM_AUTO_REGISTRATION.md` - New feature docs
- `TASK_13_COMPLETE.md` - Task summary

## Support

If issues occur:
1. Check PM2 logs: `pm2 logs reagent`
2. Check build output: `npm run build`
3. Test API directly: `curl https://reagent.eu.cc/api/channels`
4. Verify bot token with @BotFather

---

**Ready to Deploy**: ✅ YES  
**Estimated Time**: 5 minutes  
**Risk Level**: LOW (non-breaking change)
