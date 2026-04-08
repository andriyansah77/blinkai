# BlinkAI

> **Don't just think it, Build it.**

BlinkAI is an AI-powered web application builder with advanced agent capabilities powered by the Hermes Agent framework. Create intelligent AI agents that learn from interactions, develop skills, and improve over time.

---

## Features

### Core Features
- 🤖 **AI Code Generation** — Powered by any OpenAI-compatible API
- ⚡ **Live Preview** — See your app as it's being generated
- 🖥️ **Monaco Editor** — VS Code-quality code editing
- 📱 **Responsive Preview** — Desktop, tablet, and mobile views
- 💾 **Auto-save** — Never lose your work
- 📦 **Export as ZIP** — Download your project
- 🎨 **Template Gallery** — Start from pre-built templates
- 🌙 **Dark/Light Mode** — Easy on the eyes

### Hermes Agent Framework
- 🧠 **Learning Agents** — AI agents that improve from conversations
- 🔧 **Custom Skills** — Create and share reusable agent capabilities
- 💭 **Persistent Memory** — Agents remember context across sessions
- 🔄 **Skill Marketplace** — Earn money by creating and selling skills
- 📊 **Agent Analytics** — Track performance and usage statistics
- 🛠️ **Multi-Tool Support** — Web search, code execution, file operations
- 🎯 **Specialized Agents** — Create agents for specific tasks and domains

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd blinkai

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and set your DATABASE_URL and AI_API_KEY

# Initialize the database
npx prisma db push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Hermes Agent Framework

BlinkAI integrates the powerful Hermes Agent framework, providing advanced AI capabilities:

### Agent Types

1. **Kira** - General-purpose assistant with learning capabilities
2. **Code Assistant** - Specialized for programming and development
3. **Research Assistant** - Focused on information gathering and analysis
4. **Custom Agents** - Create your own specialized agents

### Skills System

Create custom skills to extend agent capabilities:

```javascript
async function webScraper(params) {
  const { url, selector } = params;
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const content = extractContent(html, selector);
    
    return {
      success: true,
      content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Memory & Learning

Agents automatically:
- Store conversation context
- Learn user preferences
- Improve responses over time
- Remember skills and their usage patterns

---

## VPS Deployment

### Method 1: GitHub Deployment (Recommended)

The easiest way to deploy BlinkAI to your VPS is via GitHub:

#### Step 1: Push to GitHub
```bash
# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial BlinkAI setup"
git remote add origin https://github.com/username/blinkai.git
git push -u origin main
```

#### Step 2: Auto-Deploy to VPS
```bash
# Use the automated deployment script
npm run deploy:github -- -r username/blinkai -u root -h your-vps-ip
```

#### Step 3: Easy Updates
```bash
# On VPS, future updates are simple:
~/update-blinkai.sh
```

### Method 2: Direct Deployment

#### Linux/macOS:
```bash
npm run deploy:linux -- -u root -h your-vps-ip
```

#### Windows:
```bash
npm run deploy:windows -- -VpsUser root -VpsHost your-vps-ip
```

### Method 3: Docker Deployment

### Prerequisites

- A VPS running Ubuntu/Debian (e.g. DigitalOcean, Hetzner, Vultr)
- Docker and Docker Compose installed
- A domain name (optional but recommended)

### Step 1 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in, then:
docker --version
```

### Step 2 — Upload your project

```bash
# On your local machine:
scp -r ./blinkai user@your-server-ip:~/blinkai
# Or clone from your git repo on the server
```

### Step 3 — Configure environment

```bash
cd ~/blinkai
cp .env.example .env
nano .env
```

Set these required values:

```env
DATABASE_URL="file:./data/blinkai.db"
NEXTAUTH_SECRET="your-super-secret-random-string-min-32-chars"
NEXTAUTH_URL="http://your-domain.com"  # or http://your-server-ip:3000

# AI Configuration
AI_API_KEY="sk-..."
AI_API_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
AI_PROVIDER_ID="openai"

# Hermes Agent Configuration
HERMES_LEARNING_ENABLED="true"
HERMES_MEMORY_ENABLED="true"
HERMES_SKILLS_ENABLED="true"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Step 4 — Create the data directory

```bash
mkdir -p data
```

### Step 5 — Build and start

```bash
docker compose up -d --build
```

Check logs:
```bash
docker compose logs -f app
```

### Step 6 — Initialize the database

```bash
docker compose exec app npx prisma db push
```

The app is now running at `http://your-server-ip`.

---

## API Endpoints

### Hermes Agent API

- `GET /api/hermes/agents` - List all agents
- `POST /api/hermes/agents` - Create new agent
- `POST /api/hermes/chat` - Chat with agents
- `GET /api/hermes/skills` - List skills
- `POST /api/hermes/skills` - Create new skill

### Example: Create Agent

```javascript
const response = await fetch('/api/hermes/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Assistant',
    description: 'A helpful AI assistant',
    model: 'gpt-4o',
    provider: 'openai',
    learningEnabled: true
  })
});
```

### Example: Chat with Agent

```javascript
const response = await fetch('/api/hermes/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    agentId: 'agent-id-here'
  })
});
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite path, e.g. `file:./data/blinkai.db` |
| `NEXTAUTH_SECRET` | ✅ | Random secret string (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | Full URL of your deployment |
| `AI_API_KEY` | ✅ | AI provider API key |
| `AI_API_BASE_URL` | ✅ | AI provider base URL |
| `AI_MODEL` | ✅ | AI model name |
| `AI_PROVIDER_ID` | ✅ | AI provider identifier |
| `HERMES_LEARNING_ENABLED` | ⚠️ | Enable agent learning (default: true) |
| `HERMES_MEMORY_ENABLED` | ⚠️ | Enable agent memory (default: true) |
| `HERMES_SKILLS_ENABLED` | ⚠️ | Enable skills system (default: true) |

---

## AI Provider Support

BlinkAI works with any OpenAI-compatible API:

| Provider | Base URL | Example Model |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Together AI | `https://api.together.xyz/v1` | `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo` |
| Ollama (local) | `http://localhost:11434/v1` | `llama3.2` |
| Anthropic (via proxy) | Varies | Varies |

Users can configure their preferred provider in **Settings → AI Configuration**.

---

## Dashboard Features

### Main Dashboard
- **Chat Interface** - Interact with AI agents
- **Agent Management** - Create and configure agents
- **Skills Library** - Browse and create skills
- **Memory Insights** - View agent learning progress

### Agent Capabilities
- **Learning Loop** - Continuous improvement from interactions
- **Skill Creation** - Develop custom capabilities
- **Memory Management** - Persistent context and preferences
- **Multi-Modal Support** - Text, code, and data processing

### Skills Marketplace
- **Create Skills** - Build reusable agent capabilities
- **Earn Revenue** - Monetize your skills
- **Community Library** - Access shared skills
- **Usage Analytics** - Track skill performance

---

## Updating

```bash
# Pull latest changes
git pull

# Update dependencies
npm install

# Update database schema
npx prisma db push

# Rebuild and restart
docker compose up -d --build
```

---

## Troubleshooting

**App won't start:**
```bash
docker compose logs app
```

**Database errors:**
```bash
docker compose exec app npx prisma db push
```

**Agent not responding:**
- Check AI API key configuration
- Verify model availability
- Check agent status in dashboard

**Skills not working:**
- Validate skill code syntax
- Check agent permissions
- Review skill execution logs

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js with JWT
- **Database**: SQLite via Prisma
- **AI Framework**: Hermes Agent (NousResearch)
- **AI**: OpenAI-compatible streaming API
- **Editor**: Monaco Editor
- **Styling**: Tailwind CSS
- **UI**: Radix UI + custom components
- **Animations**: Framer Motion

---

## Contributing

We welcome contributions to both BlinkAI and the Hermes Agent integration! 

### Areas for Contribution
- New agent templates
- Skill library expansion
- UI/UX improvements
- Performance optimizations
- Documentation updates

---

## License

MIT
