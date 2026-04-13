# ReAgent

AI agent deployment platform with blockchain integration. Built with Hermes Agent framework and Tempo Network.

## Features

- AI Agent with 73+ skills (Hermes framework)
- Token mining (10K REAGENT per mint on Tempo Network)
- Integrated wallet with encrypted storage
- Multi-channel gateway (Telegram, Discord, Slack)
- Web dashboard for management

---

## Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd reagent
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database
npx prisma db push

# Run
npm run dev
```

---

## Deployment

### VPS Deployment
```bash
# On VPS
git clone <your-repo>
cd reagent
npm install
cp .env.example .env
# Edit .env
npx prisma db push
npm run build
pm2 start npm --name reagent -- start
```

### Docker Deployment
```bash
docker compose up -d --build
docker compose exec app npx prisma db push
```

---

## Key Endpoints

- `/api/hermes/chat` - Chat with AI agent
- `/api/hermes/skills` - List/manage skills
- `/api/hermes/gateway` - Gateway configuration
- `/api/mining/mint` - Mine REAGENT tokens
- `/api/wallet/balance` - Check wallet balance

---

## Environment Variables

Required variables in `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-32-chars-min"
NEXTAUTH_URL="http://your-domain.com"

AI_API_KEY="your-api-key"
AI_API_BASE_URL="https://api.provider.com/v1"
AI_MODEL="model-name"

TEMPO_RPC_URL="https://rpc.tempo.xyz"
TEMPO_CHAIN_ID="4217"
REAGENT_TOKEN_ADDRESS="0x20C000000000000000000000a59277C0c1d65Bc5"

WALLET_ENCRYPTION_KEY="your-encryption-key"
```

---

## Tech Stack

- Next.js 14 + TypeScript
- Hermes Agent Framework
- Tempo Network (Blockchain)
- Prisma + SQLite
- NextAuth.js
- Tailwind CSS

## License

MIT
