# Hermes Agent Setup Guide

This guide will help you set up BlinkAI with the integrated Hermes Agent framework.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd blinkai
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # AI Configuration (Required)
   AI_API_KEY="your-openai-api-key"
   AI_API_BASE_URL="https://api.openai.com/v1"
   AI_MODEL="gpt-4o"
   AI_PROVIDER_ID="openai"
   
   # Hermes Agent Framework
   HERMES_LEARNING_ENABLED="true"
   HERMES_MEMORY_ENABLED="true"
   HERMES_SKILLS_ENABLED="true"
   ```

3. **Database and Hermes Setup**
   ```bash
   npm run setup
   ```
   
   This command will:
   - Initialize the database schema
   - Create default user account
   - Set up default Hermes agent
   - Add example skills
   - Grant initial credits

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open http://localhost:3000
   - Login with: `admin@blinkai.com` / `password123`
   - Navigate to Dashboard → Chat to interact with Kira

## Manual Setup Steps

If you prefer to set up manually:

### 1. Database Schema
```bash
npx prisma db push
```

### 2. Create User Account
Use the registration page or create directly in database.

### 3. Create Hermes Agent
Navigate to Dashboard → Agents → Create Agent

### 4. Add Skills
Go to Dashboard → Skills → Create Skill

## Features Overview

### 🤖 AI Agents
- **Kira**: General-purpose assistant with learning capabilities
- **Custom Agents**: Create specialized agents for specific tasks
- **Learning Loop**: Agents improve from conversations
- **Memory System**: Persistent context across sessions

### 🛠️ Skills System
- **Custom Skills**: JavaScript-based agent capabilities
- **Skill Library**: Browse and share skills
- **Categories**: Web, Analysis, Text, Code, Data
- **Marketplace**: Earn money by creating skills

### 💭 Memory & Learning
- **Conversation Memory**: Remember past interactions
- **User Preferences**: Learn user patterns
- **Context Awareness**: Maintain session context
- **Importance Scoring**: Prioritize valuable memories

### 🔧 Tools Integration
- **Web Search**: Real-time information retrieval
- **Code Execution**: Sandboxed code running
- **File Operations**: Read/write capabilities
- **Custom Tools**: Extend with new capabilities

## Dashboard Navigation

### Main Sections
- **Chat**: Interact with AI agents
- **Agents**: Manage and create agents
- **Skills**: Browse and create skills
- **Channels**: Configure communication channels
- **Features**: Explore advanced features
- **Jobs**: Schedule automated tasks
- **Workspace**: File and project management
- **Terminal**: Command-line interface

### Agent Management
1. **Create Agent**: Define name, model, system prompt
2. **Configure Learning**: Enable memory and learning
3. **Add Skills**: Attach custom capabilities
4. **Monitor Usage**: Track performance metrics

### Skills Development
1. **Create Skill**: Write JavaScript functions
2. **Test Execution**: Validate skill functionality
3. **Share Skills**: Publish to marketplace
4. **Earn Revenue**: Monetize popular skills

## API Usage

### Chat with Agent
```javascript
const response = await fetch('/api/hermes/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    agentId: 'your-agent-id'
  })
});
```

### Create Agent
```javascript
const agent = await fetch('/api/hermes/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Assistant',
    description: 'Custom AI assistant',
    model: 'gpt-4o',
    learningEnabled: true
  })
});
```

### Add Skill
```javascript
const skill = await fetch('/api/hermes/skills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'agent-id',
    name: 'My Skill',
    code: 'async function mySkill(params) { return params; }',
    category: 'general'
  })
});
```

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Reset database
rm dev.db
npm run db:push
npm run setup:hermes
```

**Agent Not Responding**
- Check AI API key configuration
- Verify model availability
- Check network connectivity

**Skills Not Working**
- Validate JavaScript syntax
- Check skill parameters
- Review execution logs

**Memory Issues**
- Check memory limits in environment
- Clean old memories via API
- Monitor memory usage

### Debug Mode

Enable debug logging:
```env
DEBUG="hermes:*"
NODE_ENV="development"
```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Memory Cleanup**: Regular cleanup of old memories
3. **Skill Caching**: Cache frequently used skills
4. **Connection Pooling**: Configure database connection limits

## Production Deployment

### Environment Variables
```env
NODE_ENV="production"
DATABASE_URL="your-production-db-url"
NEXTAUTH_SECRET="secure-random-string"
AI_API_KEY="production-api-key"
```

### Docker Deployment
```bash
docker compose up -d --build
```

### Database Migration
```bash
npx prisma migrate deploy
```

## Support

- **Documentation**: Check README.md for detailed setup
- **Issues**: Report bugs on GitHub
- **Community**: Join Discord for discussions
- **API Reference**: See /api/hermes endpoints

## Next Steps

1. **Explore Features**: Try different agent configurations
2. **Create Skills**: Build custom capabilities
3. **Share & Earn**: Publish skills to marketplace
4. **Integrate**: Connect with external services
5. **Scale**: Deploy to production environment

Happy building with Hermes Agent! 🚀