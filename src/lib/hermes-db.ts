/**
 * Hermes Agent Database Integration
 * Connects Hermes Agent framework with Prisma database
 */

import { PrismaClient } from '@prisma/client';
import { HermesAgent, HermesAgentConfig, HermesSkill, HermesMemory, HermesSession } from './hermes-agent';

const prisma = new PrismaClient();

export class HermesAgentDB {
  
  // Agent Management
  static async createAgent(userId: string, config: Partial<HermesAgentConfig>) {
    const agent = await prisma.hermesAgent.create({
      data: {
        userId,
        name: config.name || 'Unnamed Agent',
        description: config.description || '',
        model: config.model || 'gpt-4o',
        provider: config.provider || 'openai',
        systemPrompt: config.systemPrompt || '',
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 4000,
        tools: JSON.stringify(config.tools || []),
        memoryEnabled: config.memory !== false,
        learningEnabled: config.learningEnabled !== false,
      }
    });

    return agent;
  }

  static async getAgent(agentId: string) {
    return await prisma.hermesAgent.findUnique({
      where: { id: agentId },
      include: {
        skills: true,
        sessions: {
          orderBy: { updatedAt: 'desc' },
          take: 10
        },
        memories: {
          orderBy: { importance: 'desc' },
          take: 50
        }
      }
    });
  }

  static async getUserAgents(userId: string) {
    return await prisma.hermesAgent.findMany({
      where: { userId, status: 'active' },
      include: {
        skills: true,
        _count: {
          select: {
            sessions: true,
            memories: true,
            skills: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async updateAgent(agentId: string, updates: Partial<HermesAgentConfig>) {
    return await prisma.hermesAgent.update({
      where: { id: agentId },
      data: {
        name: updates.name,
        description: updates.description,
        model: updates.model,
        provider: updates.provider,
        systemPrompt: updates.systemPrompt,
        temperature: updates.temperature,
        maxTokens: updates.maxTokens,
        tools: updates.tools ? JSON.stringify(updates.tools) : undefined,
        memoryEnabled: updates.memory,
        learningEnabled: updates.learningEnabled,
        updatedAt: new Date()
      }
    });
  }

  static async deleteAgent(agentId: string) {
    return await prisma.hermesAgent.update({
      where: { id: agentId },
      data: { status: 'deleted' }
    });
  }

  // Skills Management
  static async createSkill(agentId: string, skill: Omit<HermesSkill, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.hermesSkill.create({
      data: {
        agentId,
        name: skill.name,
        description: skill.description,
        code: skill.code,
        category: skill.category,
        tags: JSON.stringify(skill.tags),
        usage: skill.usage,
        rating: skill.rating,
      }
    });
  }

  static async getSkill(skillId: string) {
    const skill = await prisma.hermesSkill.findUnique({
      where: { id: skillId },
      include: { agent: true }
    });

    if (skill) {
      return {
        ...skill,
        tags: JSON.parse(skill.tags)
      };
    }
    return null;
  }

  static async getAgentSkills(agentId: string) {
    const skills = await prisma.hermesSkill.findMany({
      where: { agentId, status: 'active' },
      orderBy: { usage: 'desc' }
    });

    return skills.map(skill => ({
      ...skill,
      tags: JSON.parse(skill.tags)
    }));
  }

  // Memory Management for slash commands
  static async getAgentMemories(agentId: string, search?: string) {
    const where: any = { agentId };
    
    if (search) {
      where.content = {
        contains: search
      };
    }

    return await prisma.hermesMemory.findMany({
      where,
      orderBy: { importance: 'desc' },
      take: 20
    });
  }

  static async addMemory(agentId: string, memory: { type: string; content: string; importance: number; metadata?: any }) {
    return await prisma.hermesMemory.create({
      data: {
        agentId,
        userId: '', // Will be set by the API
        type: memory.type,
        content: memory.content,
        importance: memory.importance,
        metadata: JSON.stringify(memory.metadata || {}),
        lastAccessed: new Date()
      }
    });
  }

  static async deleteMemory(agentId: string, searchTerm: string) {
    const memories = await prisma.hermesMemory.findMany({
      where: {
        agentId,
        content: {
          contains: searchTerm
        }
      }
    });

    if (memories.length > 0) {
      await prisma.hermesMemory.deleteMany({
        where: {
          id: { in: memories.map(m => m.id) }
        }
      });
      return true;
    }
    return false;
  }

  static async getAllSkills(userId?: string) {
    const where = userId ? {
      agent: { userId },
      status: 'active'
    } : { status: 'active' };

    const skills = await prisma.hermesSkill.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, userId: true }
        }
      },
      orderBy: { usage: 'desc' }
    });

    return skills.map(skill => ({
      ...skill,
      tags: JSON.parse(skill.tags),
      agentName: skill.agent.name
    }));
  }

  static async updateSkillUsage(skillId: string) {
    return await prisma.hermesSkill.update({
      where: { id: skillId },
      data: {
        usage: { increment: 1 },
        updatedAt: new Date()
      }
    });
  }

  static async updateSkillRating(skillId: string, rating: number) {
    return await prisma.hermesSkill.update({
      where: { id: skillId },
      data: { rating }
    });
  }

  // Session Management
  static async createSession(agentId: string, userId: string, title?: string) {
    return await prisma.hermesSession.create({
      data: {
        agentId,
        userId,
        title: title || `Session ${new Date().toLocaleString()}`,
        messages: JSON.stringify([]),
        context: JSON.stringify({}),
      }
    });
  }

  static async getSession(sessionId: string) {
    const session = await prisma.hermesSession.findUnique({
      where: { id: sessionId },
      include: { agent: true }
    });

    if (session) {
      return {
        ...session,
        messages: JSON.parse(session.messages),
        context: JSON.parse(session.context),
        skillsUsed: JSON.parse(session.skillsUsed)
      };
    }
    return null;
  }

  static async updateSession(sessionId: string, updates: {
    messages?: any[];
    context?: any;
    skillsUsed?: string[];
    tokenUsed?: number;
  }) {
    return await prisma.hermesSession.update({
      where: { id: sessionId },
      data: {
        messages: updates.messages ? JSON.stringify(updates.messages) : undefined,
        context: updates.context ? JSON.stringify(updates.context) : undefined,
        skillsUsed: updates.skillsUsed ? JSON.stringify(updates.skillsUsed) : undefined,
        tokenUsed: updates.tokenUsed,
        messageCount: updates.messages ? updates.messages.length : undefined,
        updatedAt: new Date()
      }
    });
  }

  static async getUserSessions(userId: string, agentId?: string) {
    const where = agentId ? { userId, agentId } : { userId };
    
    const sessions = await prisma.hermesSession.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    return sessions.map(session => ({
      ...session,
      messages: JSON.parse(session.messages),
      context: JSON.parse(session.context),
      skillsUsed: JSON.parse(session.skillsUsed)
    }));
  }

  // Memory Management
  static async storeMemory(memory: Omit<HermesMemory, 'id' | 'createdAt' | 'lastAccessed'>) {
    return await prisma.hermesMemory.create({
      data: {
        agentId: memory.agentId,
        userId: memory.userId,
        type: memory.type,
        content: memory.content,
        metadata: JSON.stringify(memory.metadata),
        importance: memory.importance,
        embedding: memory.embedding ? JSON.stringify(memory.embedding) : null,
      }
    });
  }

  static async getMemories(agentId: string, userId: string, type?: string, limit = 50) {
    const where = type ? { agentId, userId, type } : { agentId, userId };
    
    const memories = await prisma.hermesMemory.findMany({
      where,
      orderBy: [
        { importance: 'desc' },
        { lastAccessed: 'desc' }
      ],
      take: limit
    });

    return memories.map(memory => ({
      ...memory,
      metadata: JSON.parse(memory.metadata),
      embedding: memory.embedding ? JSON.parse(memory.embedding) : null
    }));
  }

  static async updateMemoryAccess(memoryId: string) {
    return await prisma.hermesMemory.update({
      where: { id: memoryId },
      data: { lastAccessed: new Date() }
    });
  }

  static async searchMemories(agentId: string, userId: string, query: string, limit = 10) {
    // Simple text search - in production, use vector similarity
    const memories = await prisma.hermesMemory.findMany({
      where: {
        agentId,
        userId,
        content: {
          contains: query
        }
      },
      orderBy: { importance: 'desc' },
      take: limit
    });

    return memories.map(memory => ({
      ...memory,
      metadata: JSON.parse(memory.metadata),
      embedding: memory.embedding ? JSON.parse(memory.embedding) : null
    }));
  }

  static async cleanupOldMemories(agentId: string, maxMemories = 1000) {
    // Keep only the most important and recent memories
    const memoriesToDelete = await prisma.hermesMemory.findMany({
      where: { agentId },
      orderBy: [
        { importance: 'asc' },
        { lastAccessed: 'asc' }
      ],
      skip: maxMemories
    });

    if (memoriesToDelete.length > 0) {
      const idsToDelete = memoriesToDelete.map(m => m.id);
      return await prisma.hermesMemory.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    return { count: 0 };
  }

  // Analytics
  static async getAgentStats(agentId: string) {
    const agent = await prisma.hermesAgent.findUnique({
      where: { id: agentId },
      include: {
        _count: {
          select: {
            sessions: true,
            memories: true,
            skills: true
          }
        }
      }
    });

    if (!agent) return null;

    const recentSessions = await prisma.hermesSession.count({
      where: {
        agentId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    const totalTokens = await prisma.hermesSession.aggregate({
      where: { agentId },
      _sum: { tokenUsed: true }
    });

    const skillUsage = await prisma.hermesSkill.aggregate({
      where: { agentId },
      _sum: { usage: true }
    });

    return {
      ...agent,
      stats: {
        totalSessions: agent._count.sessions,
        totalMemories: agent._count.memories,
        totalSkills: agent._count.skills,
        recentSessions,
        totalTokens: totalTokens._sum.tokenUsed || 0,
        totalSkillUsage: skillUsage._sum.usage || 0
      }
    };
  }

  static async getUserStats(userId: string) {
    const agents = await prisma.hermesAgent.count({
      where: { userId, status: 'active' }
    });

    const sessions = await prisma.hermesSession.count({
      where: { userId }
    });

    const memories = await prisma.hermesMemory.count({
      where: { userId }
    });

    const skills = await prisma.hermesSkill.count({
      where: { agent: { userId } }
    });

    return {
      totalAgents: agents,
      totalSessions: sessions,
      totalMemories: memories,
      totalSkills: skills
    };
  }
}

export default HermesAgentDB;