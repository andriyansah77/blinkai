# BlinkAI + Hermes Agent Setup Instructions

Ikuti langkah-langkah berikut untuk mengintegrasikan BlinkAI dengan framework **Hermes Agent asli dari NousResearch** dan mendapatkan flow onboarding yang lengkap.

## 🎯 Status Integrasi Hermes

### ✅ Yang Sudah Terintegrasi (Framework Hermes Asli):
- **Hermes CLI Wrapper**: Menggunakan CLI `hermes` dari NousResearch/hermes-agent
- **Real Agent Creation**: Membuat agent dengan config YAML dan SOUL.md sesuai format Hermes
- **Streaming Chat**: Komunikasi real-time dengan Hermes instances
- **Learning & Memory**: Fitur pembelajaran dan memori dari Hermes framework
- **Skills System**: Sistem skill yang kompatibel dengan Hermes
- **Fallback System**: Jika Hermes tidak tersedia, fallback ke OpenAI standar

### 🔧 Setup untuk VPS (Hermes CLI Sudah Tersedia):
- **Environment Configuration**: Set `HERMES_CLI_AVAILABLE=true` di .env
- **API Keys**: Configure AI provider keys untuk Hermes
- **Test Connection**: Gunakan `npm run test:hermes` untuk verifikasi
- **Auto Detection**: System otomatis detect Hermes CLI yang sudah ter-install

## 🚀 Quick Start (VPS dengan Hermes CLI)

### 1. Install Dependencies
```bash
cd blinkai
npm install
```

### 2. Setup Environment (VPS dengan Hermes CLI)
```bash
cp .env.example .env
```

Edit file `.env` dan isi konfigurasi berikut:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://your-vps-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# AI Configuration (WAJIB untuk Hermes)
AI_API_KEY="sk-your-openai-api-key"
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
AI_PROVIDER_ID="openai"

# Hermes Agent Framework (VPS Setup)
HERMES_CLI_AVAILABLE="true"
HERMES_LEARNING_ENABLED="true"
HERMES_MEMORY_ENABLED="true"
HERMES_SKILLS_ENABLED="true"
```

### 3. Test Hermes CLI Connection
```bash
npm run test:hermes
```

**Output yang diharapkan:**
```
✅ Hermes CLI Installation - PASSED
✅ Hermes Configuration - PASSED  
✅ Available Models - PASSED
✅ Quick Chat Test - PASSED
🎉 All tests passed! Hermes CLI is ready to use.
```

### 4. Setup Database & Environment
```bash
npm run setup
```

### 5. Start Production Server
```bash
npm run build
npm run start
```

### 6. Verify Integration
- **API Status**: `http://your-domain.com/api/hermes/status`
- **Test Endpoint**: `http://your-domain.com/api/hermes/test`
- **Chat API**: `http://your-domain.com/api/hermes/chat`

### 4. Start Development Server
```bash
npm run dev
```

### 5. Check Hermes Status
- **Status API**: http://localhost:3000/api/hermes/status
- **Test API**: http://localhost:3000/api/hermes/test  
- **Chat API**: http://localhost:3000/api/hermes/chat

### 6. Complete Onboarding Flow
- Buka: http://localhost:3000
- Klik "Sign Up" untuk membuat akun baru
- Ikuti flow onboarding:
  1. **Create Agent**: Beri nama dan personality agent Anda
  2. **Connect Channels**: Pilih platform (Discord, Telegram, dll)
  3. **Choose Plan**: Pilih Free Plan (1k credits)
  4. **Deploy**: Tunggu proses deployment selesai
- Setelah selesai, Anda akan diarahkan ke dashboard

## 🎯 Flow Onboarding Baru

### ✅ Step 1: Agent Setup
- User memberi nama agent (contoh: "Alex", "Maya")
- Optional: Menentukan personality agent
- Contoh personality: "Friendly and helpful assistant who loves coding"

### ✅ Step 2: Channel Connection
- Pilih platform untuk chat dengan agent:
  - 🎮 Discord (server integration)
  - ✈️ Telegram (bot integration)
  - 💼 Slack (workspace bot)
  - 📱 WhatsApp (Business API)
- User bisa skip dan connect nanti

### ✅ Step 3: Plan Selection
- **Free Plan**: 1,000 credits, basic models, 2 channels
- **Pro Plan**: 10,000 credits, GPT-4, unlimited channels
- **Enterprise**: 100,000 credits, white-label, SLA

### ✅ Step 4: Deployment
- Proses otomatis:
  1. Creating AI agent
  2. Setting up personality & skills
  3. Connecting channels
  4. Configuring plan & credits
  5. Deploying to cloud
  6. Running tests
- Redirect ke dashboard setelah selesai

## 🎨 Dashboard Features

### ✅ Sidebar Navigation (Tanpa Menu Agents)
- **Main**: Chat
- **Automation**: Skills, Channels, Features, Jobs, Workspace, Terminal
- **Account**: Usage

### ✅ Dynamic Agent Info
- Header menampilkan nama agent user
- Status "Running [Agent Name]" 
- Model info di plan section

### ✅ Chat Interface
- Menampilkan "[Agent Name] is ready"
- Auto-connect ke agent yang sudah di-deploy
- Jika belum ada agent, redirect ke onboarding

## 🔧 API Endpoints Baru

### Onboarding & Deployment
```bash
POST /api/onboarding/deploy
{
  "agentName": "Alex",
  "agentPersonality": "Friendly coding assistant",
  "channels": ["discord", "telegram"],
  "plan": "free"
}
```

### User Agent Info
```bash
GET /api/user/agent
# Returns user's primary agent info
```

### Channel Management
```bash
GET /api/channels          # List connected channels
POST /api/channels         # Connect new channel
```

## 🔧 Technical Implementation

### ✅ Hermes Framework Integration
1. **Real CLI Integration**: `src/lib/hermes-cli-wrapper.ts` - Wrapper untuk Hermes CLI asli
2. **Agent Creation**: Format config YAML dan SOUL.md sesuai Hermes spec
3. **Streaming Chat**: `src/app/api/hermes/chat/route.ts` - Real-time dengan Hermes instances
4. **Status Monitoring**: `src/app/api/hermes/status/route.ts` - Monitor Hermes installation & agents
5. **Fallback System**: Otomatis fallback ke OpenAI jika Hermes tidak tersedia

### ✅ Files Added/Modified
1. `src/app/onboarding/page.tsx` - Complete onboarding flow
2. `src/app/api/onboarding/deploy/route.ts` - Deployment API
3. `src/app/api/user/agent/route.ts` - User agent API
4. `src/app/api/channels/route.ts` - Channel management
5. `src/hooks/useUserAgent.ts` - Agent info hook
6. `src/components/dashboard/HermesSidebar.tsx` - Updated sidebar
7. `src/components/dashboard/HermesChat.tsx` - Updated chat
8. `src/app/dashboard/channels/page.tsx` - Channel management UI

### ✅ Database Schema
- HermesAgent: User's AI agents
- HermesSkill: Agent capabilities
- HermesSession: Chat sessions
- HermesMemory: Learning data
- CreditLedger: Credit tracking

### ✅ Flow Logic
1. **Register** → Redirect ke `/onboarding`
2. **Onboarding** → Create agent, setup channels, choose plan
3. **Deploy** → API call creates agent + skills + credits
4. **Dashboard** → Show agent info, enable chat

## 🎉 User Experience

### New User Journey:
1. **Landing Page** → Sign Up
2. **Onboarding** → 4-step wizard (2-3 minutes)
3. **Deployment** → Automated setup (1-2 minutes)
4. **Dashboard** → Ready to chat with personalized agent

### Existing User:
- Direct login → Dashboard
- Agent info loaded automatically
- Chat works immediately

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV="production"
DATABASE_URL="your-production-db"
NEXTAUTH_SECRET="secure-random-string"
AI_API_KEY="production-api-key"
```

### Docker
```bash
docker compose up -d --build
```

## 🐛 Troubleshooting

### Onboarding Issues
```bash
# Reset user onboarding
DELETE FROM HermesAgent WHERE userId = 'user-id';
DELETE FROM CreditLedger WHERE userId = 'user-id';
```

### Agent Not Found
- User perlu complete onboarding
- Check `/api/user/agent` response
- Verify agent creation in database

### Channel Connection
- Validate bot tokens
- Check platform API limits
- Review webhook configurations

## 🎯 Next Steps

1. **Test Flow**: Complete onboarding sebagai user baru
2. **Channel Integration**: Implement actual Discord/Telegram bots
3. **Payment**: Integrate Stripe untuk paid plans
4. **Analytics**: Track user engagement dan agent performance
5. **Skills Marketplace**: Enable skill sharing dan monetization

## 🎉 Selesai!

Flow onboarding lengkap sudah terintegrasi dengan **Hermes Agent Framework asli**:
- ✅ Register → Onboarding → Deploy → Dashboard
- ✅ **Real Hermes CLI Integration** (bukan custom implementation)
- ✅ Custom agent creation dengan personality sesuai format Hermes SOUL.md
- ✅ Learning & Memory capabilities dari Hermes framework
- ✅ Skills system yang kompatibel dengan Hermes
- ✅ Channel selection (Discord, Telegram, etc)
- ✅ Plan selection dengan credit system
- ✅ Automated deployment process dengan Hermes setup
- ✅ Dashboard tanpa menu Agents (chat langsung available)
- ✅ Dynamic agent info di sidebar
- ✅ Fallback system jika Hermes CLI tidak tersedia

### 🔍 Cara Verifikasi Hermes Integration:
1. **Check API**: `GET /api/hermes/status` - Status instalasi dan agents
2. **Check Chat**: `GET /api/hermes/chat` - Info framework version
3. **Check Logs**: Console akan show "Hermes instance created" saat deploy
4. **Check Files**: `.hermes-instances/` directory akan berisi agent configs

### 🎯 Framework Authentication:
- ✅ Menggunakan CLI `hermes` dari repository NousResearch/hermes-agent
- ✅ Config format YAML sesuai Hermes specification
- ✅ SOUL.md personality files sesuai Hermes format
- ✅ Command structure: `hermes chat --config` (bukan custom commands)
- ✅ Session handling dan memory sesuai Hermes architecture

Selamat mencoba framework Hermes yang asli! 🚀