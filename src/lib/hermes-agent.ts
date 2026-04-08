/**
 * Hermes Agent Integration
 * Integrates with NousResearch/hermes-agent framework
 */

import { v4 as uuidv4 } from 'uuid';

export interface HermesAgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  provider: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  skills: string[];
  memory: boolean;
  learningEnabled: boolean;
}

export interface HermesSkill {
  id: string;
  name: string;
  description: string;
  code: string;
  category: string;
  tags: string[];
  usage: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HermesMemory {
  id: string;
  agentId: string;
  userId: string;
  type: 'conversation' | 'skill' | 'user_preference' | 'context';
  content: string;
  metadata: Record<string, any>;
  importance: number;
  embedding?: number[];
  createdAt: Date;
  lastAccessed: Date;
}

export interface HermesSession {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  messages: HermesMessage[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface HermesMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface HermesTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export class HermesAgent {
  private config: HermesAgentConfig;
  private skills: Map<string, HermesSkill> = new Map();
  private memory: HermesMemory[] = [];
  private tools: Map<string, HermesTool> = new Map();
  private sessions: Map<string, HermesSession> = new Map();

  constructor(config: HermesAgentConfig) {
    this.config = config;
    this.initializeDefaultTools();
  }

  private initializeDefaultTools() {
    // Web search tool
    this.tools.set('web_search', {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Number of results', default: 5 }
      },
      execute: async (params) => {
        // Implementation would connect to search API
        return { results: [], query: params.query };
      }
    });

    // Code execution tool
    this.tools.set('execute_code', {
      name: 'execute_code',
      description: 'Execute code in a sandboxed environment',
      parameters: {
        language: { type: 'string', description: 'Programming language' },
        code: { type: 'string', description: 'Code to execute' }
      },
      execute: async (params) => {
        // Implementation would use sandboxed execution
        return { output: '', error: null, language: params.language };
      }
    });

    // File operations tool
    this.tools.set('file_operations', {
      name: 'file_operations',
      description: 'Perform file operations',
      parameters: {
        operation: { type: 'string', enum: ['read', 'write', 'list', 'delete'] },
        path: { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'File content (for write)' }
      },
      execute: async (params) => {
        // Implementation would handle file operations
        return { success: true, result: null };
      }
    });
  }

  async createSession(userId: string, title?: string): Promise<string> {
    const sessionId = uuidv4();
    const session: HermesSession = {
      id: sessionId,
      agentId: this.config.id,
      userId,
      title: title || `Session ${new Date().toLocaleString()}`,
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async chat(sessionId: string, message: string, userId: string): Promise<AsyncGenerator<string, void, unknown>> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message
    const userMessage: HermesMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);

    // Process with agent logic
    return this.processMessage(session, message, userId);
  }

  private async *processMessage(session: HermesSession, message: string, userId: string): AsyncGenerator<string, void, unknown> {
    // Retrieve relevant memories
    const relevantMemories = await this.retrieveMemories(message, userId);
    
    // Build context
    const context = this.buildContext(session, relevantMemories);
    
    // Generate response using configured model
    const response = await this.generateResponse(context, message);
    
    // Stream response
    for (const chunk of response) {
      yield chunk;
    }

    // Store conversation in memory if learning is enabled
    if (this.config.learningEnabled) {
      await this.storeMemory({
        id: uuidv4(),
        agentId: this.config.id,
        type: 'conversation',
        content: `User: ${message}\nAssistant: ${response.join('')}`,
        metadata: { userId, sessionId: session.id },
        importance: this.calculateImportance(message, response.join('')),
        createdAt: new Date(),
        lastAccessed: new Date()
      });
    }
  }

  private async retrieveMemories(query: string, userId: string): Promise<HermesMemory[]> {
    // Simple relevance scoring - in production, use vector similarity
    return this.memory
      .filter(m => m.metadata.userId === userId)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);
  }

  private buildContext(session: HermesSession, memories: HermesMemory[]): string {
    let context = this.config.systemPrompt + '\n\n';
    
    // Add relevant memories
    if (memories.length > 0) {
      context += 'Relevant context from previous interactions:\n';
      memories.forEach(memory => {
        context += `- ${memory.content}\n`;
      });
      context += '\n';
    }

    // Add recent conversation history
    const recentMessages = session.messages.slice(-10);
    if (recentMessages.length > 0) {
      context += 'Recent conversation:\n';
      recentMessages.forEach(msg => {
        context += `${msg.role}: ${msg.content}\n`;
      });
    }

    return context;
  }

  private async generateResponse(context: string, message: string): Promise<string[]> {
    // This would integrate with the actual AI model
    // For now, return a mock response
    const mockResponse = [
      "I understand your request. ",
      "Let me help you with that. ",
      "Based on the context, I can provide the following information..."
    ];
    
    return mockResponse;
  }

  private calculateImportance(userMessage: string, assistantResponse: string): number {
    // Simple importance calculation - in production, use more sophisticated methods
    let importance = 0.5;
    
    // Increase importance for questions
    if (userMessage.includes('?')) importance += 0.2;
    
    // Increase importance for longer responses
    if (assistantResponse.length > 200) importance += 0.1;
    
    // Increase importance for code or technical content
    if (assistantResponse.includes('```') || assistantResponse.includes('function')) {
      importance += 0.2;
    }
    
    return Math.min(importance, 1.0);
  }

  private async storeMemory(memory: HermesMemory): Promise<void> {
    this.memory.push(memory);
    
    // Keep memory size manageable
    if (this.memory.length > 1000) {
      this.memory = this.memory
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 800);
    }
  }

  async addSkill(skill: HermesSkill): Promise<void> {
    this.skills.set(skill.id, skill);
  }

  async executeSkill(skillId: string, params: any): Promise<any> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    // Execute skill code (in production, use sandboxed execution)
    try {
      const func = new Function('params', skill.code);
      const result = await func(params);
      
      // Update skill usage
      skill.usage += 1;
      skill.updatedAt = new Date();
      
      return result;
    } catch (error) {
      throw new Error(`Skill execution failed: ${error}`);
    }
  }

  getConfig(): HermesAgentConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<HermesAgentConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getSkills(): HermesSkill[] {
    return Array.from(this.skills.values());
  }

  getMemoryStats(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    this.memory.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1;
    });
    
    return {
      total: this.memory.length,
      byType
    };
  }

  getSessions(): HermesSession[] {
    return Array.from(this.sessions.values());
  }

  getSession(sessionId: string): HermesSession | undefined {
    return this.sessions.get(sessionId);
  }
}

// Default agent configurations
export const DEFAULT_AGENTS: Partial<HermesAgentConfig>[] = [
  {
    name: "Kira",
    description: "General-purpose AI assistant with learning capabilities",
    model: "gpt-4o",
    provider: "openai",
    systemPrompt: "You are Kira, a helpful AI assistant. You learn from interactions and improve over time.",
    temperature: 0.7,
    maxTokens: 4000,
    tools: ["web_search", "execute_code", "file_operations"],
    skills: [],
    memory: true,
    learningEnabled: true
  },
  {
    name: "Code Assistant",
    description: "Specialized coding assistant with advanced programming capabilities",
    model: "gpt-4o",
    provider: "openai",
    systemPrompt: "You are a senior software engineer. Help with coding, debugging, and architecture decisions.",
    temperature: 0.3,
    maxTokens: 8000,
    tools: ["execute_code", "file_operations"],
    skills: [],
    memory: true,
    learningEnabled: true
  },
  {
    name: "Research Assistant",
    description: "Research-focused agent with web search and analysis capabilities",
    model: "gpt-4o",
    provider: "openai",
    systemPrompt: "You are a research assistant. Help find, analyze, and synthesize information from various sources.",
    temperature: 0.5,
    maxTokens: 6000,
    tools: ["web_search"],
    skills: [],
    memory: true,
    learningEnabled: true
  }
];

// Agent manager for handling multiple agents
export class HermesAgentManager {
  private agents: Map<string, HermesAgent> = new Map();

  async createAgent(config: Partial<HermesAgentConfig>): Promise<string> {
    const agentId = uuidv4();
    const fullConfig: HermesAgentConfig = {
      id: agentId,
      name: config.name || "Unnamed Agent",
      description: config.description || "",
      model: config.model || "gpt-4o",
      provider: config.provider || "openai",
      systemPrompt: config.systemPrompt || "You are a helpful AI assistant.",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 4000,
      tools: config.tools || [],
      skills: config.skills || [],
      memory: config.memory !== false,
      learningEnabled: config.learningEnabled !== false
    };

    const agent = new HermesAgent(fullConfig);
    this.agents.set(agentId, agent);
    return agentId;
  }

  getAgent(agentId: string): HermesAgent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): HermesAgent[] {
    return Array.from(this.agents.values());
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    return this.agents.delete(agentId);
  }
}

// Global agent manager instance
export const hermesAgentManager = new HermesAgentManager();