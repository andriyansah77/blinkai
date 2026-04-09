# Bot Testing Instructions

## Current Status
✅ Profile `.env` updated with platform API credentials
✅ Gateway service restarted and running
✅ Bot should now respond correctly

## Test the Bot

### 1. Send Message to Telegram Bot
1. Open Telegram
2. Find your bot: @YourBotUsername
3. Send a message: "Hello, are you working?"
4. Bot should respond using the platform API

### 2. Check Bot Response
The bot should:
- Respond within a few seconds
- Use the platform API (AkashML/MiniMax-M2.5)
- NOT show "Provider authentication failed" error

### 3. Verify in Dashboard
1. Go to http://159.65.141.68:3000/dashboard/channels
2. Channel status should show "connected"
3. If still shows "disconnected", refresh the page

## If Bot Still Not Working

### Option 1: Check Logs
```bash
ssh root@159.65.141.68
journalctl --user -u hermes-gateway-user-cmnq76h5b0001s4vs3n282mey -f
```

### Option 2: Test Hermes CLI Directly
```bash
ssh root@159.65.141.68
/root/.local/bin/hermes --profile user-cmnq76h5b0001s4vs3n282mey chat --query "Hello, test message"
```

This should respond without errors. If it works, the bot should work too.

### Option 3: Recreate Channel
If still not working:
1. Delete channel in dashboard
2. Delete profile: `/root/.local/bin/hermes profile delete user-cmnq76h5b0001s4vs3n282mey --yes`
3. Create channel again (will use new code with correct .env)

## Expected Behavior

### Working Bot:
```
User: Hello
Bot: Hello! I'm your Hermes AI assistant. How can I help you today?
```

### Not Working (Old Error):
```
User: Hello
Bot: Provider authentication failed: No inference provider configured
```

## Technical Details

### Profile Location
`/root/.hermes/profiles/user-cmnq76h5b0001s4vs3n282mey/`

### .env File Content
```bash
OPENAI_API_KEY=akml-jiPghENoUyjtFxCEeGRunnoyiGMUHuji
OPENAI_API_BASE=https://api.akashml.com/v1
LLM_MODEL=MiniMaxAI/MiniMax-M2.5
LLM_PROVIDER=openai
TELEGRAM_BOT_TOKEN=8652990958:AAF8KJwH6juSntosmdelbuPQNQI9EEp3XYE
```

### Gateway Service
- Name: `hermes-gateway-user-cmnq76h5b0001s4vs3n282mey.service`
- Status: Active (running)
- PID: 84643

## Next Steps After Testing

1. ✅ Confirm bot responds correctly
2. ✅ Update channel status in dashboard to "connected"
3. ✅ Test with new user to verify auto-setup works
4. 🔄 Implement credit deduction system
5. 🔄 Add usage tracking

---

**Last Updated**: 2026-04-10
**Gateway Restarted**: 2026-04-09 17:24:30 UTC
**Status**: Ready for testing
