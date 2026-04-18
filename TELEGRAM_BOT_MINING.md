# Telegram Bot Mining Integration

## Overview
Telegram bot menggunakan API endpoint yang sama dengan webchat untuk mining REAGENT tokens.

## Architecture

```
Telegram Bot → telegram_commands_skill.py → /api/mining/simple-mint → simpleMintingEngine
                                                    ↑
Web Chat → HermesChat.tsx → /mine command ─────────┘
```

## API Endpoint

### POST /api/mining/simple-mint

**Authentication:**
- **Web Chat**: Privy session cookie
- **Telegram Bot**: API key + X-User-ID header

**Request Headers (Bot):**
```
Authorization: Bearer {PLATFORM_API_KEY}
X-User-ID: {userId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "auto"  // or "manual"
}
```

**Response:**
```json
{
  "success": true,
  "inscriptionId": "insc_xxx",
  "txHash": "0x...",
  "tokensEarned": 10000,
  "message": "Transaction submitted successfully"
}
```

## Mining Flow

### Web Chat (/mine command)
1. User types `/mine 5` in chat
2. HermesChat parses command
3. Loops 5 times calling `/api/mining/simple-mint`
4. Uses Privy session for auth
5. Displays results in chat

### Telegram Bot (/mine command)
1. User types `/mine 5` in Telegram
2. telegram_commands_skill.py parses command
3. Loops 5 times calling `/api/mining/simple-mint`
4. Uses API key + X-User-ID for auth
5. Sends formatted message back to Telegram

## Configuration

### Environment Variables

```bash
# Platform URL
PLATFORM_URL=https://reagent.eu.cc

# API Key for bot authentication
PLATFORM_API_KEY=your_secure_api_key_here
```

### Telegram Bot Setup

1. **Install Skill:**
   ```bash
   cp hermes-skills/telegram_commands_skill.py ~/.hermes/skills/
   ```

2. **Configure Bot:**
   - Set `PLATFORM_URL` in bot environment
   - Set `PLATFORM_API_KEY` (must match server)

3. **Link User Account:**
   - User visits https://reagent.eu.cc
   - Goes to Dashboard → Channels
   - Connects Telegram bot
   - Links account with `/start` command

## Features

### Supported Commands

- `/mine [amount]` - Mine REAGENT tokens (1-10 times)
- `/balance` - Check wallet balance
- `/wallet` - View wallet info
- `/help` - Show help message
- `/start` - Start bot and link account

### Mining Limits

- **Amount**: 1-10 per command
- **Type**: Auto mining (0.5 PATHUSD + gas)
- **Reward**: 10,000 REAGENT per mint
- **Server-side**: All signing done on server

## Error Handling

### Common Errors

1. **"Invalid API key"**
   - Check PLATFORM_API_KEY matches on both sides
   - Verify Authorization header format

2. **"Account not linked"**
   - User needs to link Telegram account
   - Visit platform and connect in Channels

3. **"Insufficient balance"**
   - User needs PATHUSD for fees
   - Check wallet balance with `/balance`

4. **"Mining failed"**
   - Check server logs
   - Verify wallet has gas
   - Check network connectivity

## Testing

### Test Bot Locally

```python
python hermes-skills/telegram_commands_skill.py
```

### Test API Endpoint

```bash
# With bot authentication
curl -X POST https://reagent.eu.cc/api/mining/simple-mint \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-User-ID: user_123" \
  -H "Content-Type: application/json" \
  -d '{"type":"auto"}'
```

## Security

### API Key Protection

- Store `PLATFORM_API_KEY` securely
- Never commit to git
- Use environment variables
- Rotate regularly

### User Authentication

- Bot requests require valid API key
- User ID verified against database
- Telegram account must be linked
- Session validation on server

## Monitoring

### Logs to Check

```bash
# Server logs
tail -f /var/log/reagent/app.log | grep SimpleMint

# Bot logs
tail -f ~/.hermes/logs/telegram_commands.log
```

### Metrics

- Total mints via bot
- Success/failure rate
- Average response time
- User engagement

## Troubleshooting

### Bot Not Responding

1. Check bot is running
2. Verify PLATFORM_URL is correct
3. Test API endpoint directly
4. Check network connectivity

### Mining Fails

1. Check user has wallet
2. Verify PATHUSD balance
3. Check gas balance
4. Review server logs

### Account Linking Issues

1. Verify Telegram integration enabled
2. Check database for TelegramLink entry
3. Test `/start` command
4. Review API logs

## Future Improvements

- [ ] Batch minting optimization
- [ ] Mining queue system
- [ ] Real-time notifications
- [ ] Mining statistics per user
- [ ] Referral rewards
- [ ] Mining leaderboard

## Support

For issues or questions:
- GitHub: https://github.com/andriyansah77/blinkai
- Documentation: https://reagent.eu.cc/docs
- Telegram: @Reagentempo_AI
