# ReAgent Platform Profile

## Platform Overview

**ReAgent** is an AI-powered agent deployment platform that enables users to create, deploy, and manage intelligent AI agents with advanced capabilities. The platform is built on the Hermes Agent framework and integrates blockchain technology for token economics.

## Core Features

### 1. AI Agent Deployment
- Deploy custom AI agents with personalized personalities
- Multi-model support (GPT-4, Claude, Gemini, etc.)
- Conversational AI with memory and learning capabilities
- Multi-channel integration (Web, Telegram, Discord)

### 2. Token Mining System
- **REAGENT Token**: Platform's native TIP-20 token on Tempo Network
- **Mining Methods**:
  - Auto Mining: Configurable fee (default 0.05 PATHUSD) via AI agent
  - Manual Mining: Configurable fee (default 0.1 PATHUSD) via dashboard
- **Rewards**: 10,000 REAGENT tokens per successful mint
- **Total Supply**: 400M REAGENT (50% allocated for mining)
- **API Endpoint**: `/api/mining/simple-mint` (unified for web and bot)

### 3. Blockchain Integration
- **Network**: Tempo Network (Chain ID: 4217)
- **Token Standard**: TIP-20 (extended ERC-20 with 6 decimals)
- **Explorer**: https://explore.tempo.xyz
- **RPC**: https://rpc.tempo.xyz

### 4. Wallet Management
- Auto-generated HD wallets for each user
- Encrypted private key storage (AES-256-GCM)
- USD balance management for mining fees
- REAGENT token balance tracking

## Token Economics

### REAGENT Token Details
- **Name**: ReAgent Token
- **Symbol**: REAGENT
- **Standard**: TIP-20 (Tempo Network)
- **Decimals**: 6
- **Total Supply**: 400,000,000 REAGENT
- **Contract Address**: 0x20C000000000000000000000a59277C0c1d65Bc5

### Allocation
- **Mining Allocation**: 200M REAGENT (50%)
- **Platform Reserve**: 100M REAGENT (25%)
- **Team & Advisors**: 50M REAGENT (12.5%)
- **Liquidity**: 50M REAGENT (12.5%)

### Mining Economics
- **Tokens per Mint**: 10,000 REAGENT
- **Max Mints**: 20,000 (200M / 10K)
- **Auto Mining Fee**: Configurable via `AUTO_MINT_FEE` env (default 0.05 PATHUSD) + gas
- **Manual Mining Fee**: Configurable via `MANUAL_MINT_FEE` env (default 0.1 PATHUSD) + gas
- **Savings**: 50% discount for auto mining (default)
- **Payment Method**: ERC-20 transfer of PATHUSD token (not native transfer)

## Platform Capabilities

### For Users
1. **Agent Creation**: Deploy custom AI agents in minutes
2. **Token Mining**: Earn REAGENT tokens through mining
3. **Wallet Management**: Secure wallet with encrypted keys
4. **Balance Management**: Track USD and REAGENT balances
5. **Mining History**: View all minting transactions
6. **Trading** (Coming Soon): Trade REAGENT tokens

### For AI Agents
1. **Minting Skill**: Execute token minting via `/api/mining/simple-mint` endpoint
2. **Balance Checking**: Query user balances in real-time
3. **Wallet Operations**: Send ETH and REAGENT tokens
4. **History Retrieval**: Access minting and transaction history
5. **Statistics**: Get global mining statistics
6. **Multi-Channel**: Works on web chat, Telegram, Discord, WhatsApp

## Platform Values

### User-Centric
- Simple onboarding process
- Intuitive dashboard interface
- Clear pricing and economics
- Transparent transaction history

### Security-First
- Encrypted wallet storage
- 2FA for sensitive operations
- Audit logging for all operations
- Rate limiting for protection

### Innovation-Driven
- Cutting-edge AI technology
- Blockchain integration
- Continuous feature updates
- Community-driven development

## Platform Branding

### Voice & Tone
- **Professional yet Approachable**: We're experts but speak like humans
- **Clear & Concise**: No jargon unless necessary
- **Helpful & Supportive**: Always ready to assist
- **Innovative & Forward-Thinking**: Embracing the future of AI

### Key Messages
1. "Deploy your Agent in Minutes"
2. "Earn REAGENT tokens through intelligent mining"
3. "Your AI assistant, powered by blockchain"
4. "Simple, secure, and rewarding"

## Integration Points

### Hermes Framework
- Agent lifecycle management
- Skill system integration
- Memory and learning capabilities
- Multi-channel communication

### Tempo Network
- TIP-20 token standard
- Blockchain transactions
- Gas fee management
- Explorer integration

### Payment System
- PATHUSD stablecoin for fees (ERC-20 transfer)
- Token address: 0x20c0000000000000000000000000000000000000
- USD balance management
- Automatic refunds on failures
- Transaction tracking
- Unified API: `/api/mining/simple-mint` for all channels

## Support & Resources

### Documentation
- Platform Guide: /docs
- API Documentation: /api/docs
- Mining Guide: /mining/guide
- Wallet Guide: /wallet/guide

### Community
- Discord: [Coming Soon]
- Telegram: [Coming Soon]
- Twitter: [Coming Soon]
- GitHub: [Coming Soon]

### Support
- Email: support@reagent.ai
- Help Center: /help
- FAQ: /faq
- Status Page: /status

## API Integration

### Mining API Endpoint
- **URL**: `POST /api/mining/simple-mint`
- **Authentication**: 
  - Web: Privy session cookie
  - Bot: `Authorization: Bearer {API_KEY}` + `X-User-ID: {userId}` header
- **Request Body**: `{ "type": "auto" | "manual" }`
- **Response**: Transaction hash, tokens earned, fees paid, updated balances

### Telegram Bot Integration
- **Commands**: `/mine`, `/balance`, `/wallet`, `/help`, `/start`
- **Auto-Registration**: Commands registered automatically on channel setup
- **Unified API**: Uses same `/api/mining/simple-mint` endpoint as web
- **Skill**: `telegram_commands_skill.py` in hermes-skills

---

**Platform Version**: 1.0.0  
**Last Updated**: 2026-04-18  
**Network**: Tempo Mainnet (Chain ID: 4217)
