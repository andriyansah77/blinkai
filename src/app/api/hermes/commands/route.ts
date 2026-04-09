import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";
import { prisma } from "@/lib/prisma";

// Available Hermes slash commands
const HERMES_COMMANDS = {
  '/help': {
    description: 'Show all available commands',
    usage: '/help',
    category: 'General'
  },
  '/skills': {
    description: 'List available skills',
    usage: '/skills [search]',
    category: 'Skills'
  },
  '/memory': {
    description: 'Show agent memory',
    usage: '/memory [search]',
    category: 'Memory'
  },
  '/clear': {
    description: 'Clear chat history',
    usage: '/clear',
    category: 'Chat'
  },
  '/agent': {
    description: 'Show agent information',
    usage: '/agent [info|stats]',
    category: 'Agent'
  },
  '/learn': {
    description: 'Teach agent something new',
    usage: '/learn <topic> <information>',
    category: 'Learning'
  },
  '/forget': {
    description: 'Remove from agent memory',
    usage: '/forget <topic>',
    category: 'Memory'
  },
  '/mode': {
    description: 'Change agent mode',
    usage: '/mode [creative|balanced|precise]',
    category: 'Settings'
  },
  '/export': {
    description: 'Export chat history',
    usage: '/export [json|txt]',
    category: 'Data'
  },
  '/reset': {
    description: 'Reset agent to default state',
    usage: '/reset',
    category: 'Agent'
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { command, args = [] } = body;

    if (!command || !command.startsWith('/')) {
      return NextResponse.json({ error: "Invalid command format" }, { status: 400 });
    }

    // Get user's agent
    const userAgents = await HermesAgentDB.getUserAgents(session.user.id!);
    const agent = userAgents[0];

    if (!agent) {
      return NextResponse.json({ error: "No agent found" }, { status: 404 });
    }

    console.log(`🔧 Processing Hermes command: ${command} with args:`, args);

    // Process command
    let result;
    switch (command) {
      case '/help':
        result = await handleHelpCommand();
        break;
      
      case '/skills':
        result = await handleSkillsCommand(agent.id, args[0]);
        break;
      
      case '/memory':
        result = await handleMemoryCommand(agent.id, args[0]);
        break;
      
      case '/clear':
        result = await handleClearCommand();
        break;
      
      case '/agent':
        result = await handleAgentCommand(agent, args[0]);
        break;
      
      case '/learn':
        result = await handleLearnCommand(agent.id, args.join(' '));
        break;
      
      case '/forget':
        result = await handleForgetCommand(agent.id, args.join(' '));
        break;
      
      case '/mode':
        result = await handleModeCommand(agent.id, args[0]);
        break;
      
      case '/export':
        result = await handleExportCommand(args[0]);
        break;
      
      case '/reset':
        result = await handleResetCommand(agent.id);
        break;
      
      default:
        result = {
          type: 'error',
          message: `Unknown command: ${command}. Type /help to see available commands.`
        };
    }

    return NextResponse.json({
      success: true,
      command,
      result
    });

  } catch (error) {
    console.error("Hermes command error:", error);
    return NextResponse.json(
      { error: "Failed to process command" },
      { status: 500 }
    );
  }
}

// Command handlers
async function handleHelpCommand() {
  const categories = Object.entries(HERMES_COMMANDS).reduce((acc, [cmd, info]) => {
    if (!acc[info.category]) acc[info.category] = [];
    acc[info.category].push({ command: cmd, ...info });
    return acc;
  }, {} as Record<string, any[]>);

  let helpText = "# 🤖 Hermes Agent Commands\n\n";
  
  Object.entries(categories).forEach(([category, commands]) => {
    helpText += `## ${category}\n`;
    commands.forEach(cmd => {
      helpText += `- **${cmd.command}** - ${cmd.description}\n`;
      helpText += `  Usage: \`${cmd.usage}\`\n\n`;
    });
  });

  return {
    type: 'info',
    message: helpText
  };
}

async function handleSkillsCommand(agentId: string, search?: string) {
  try {
    const skills = await HermesAgentDB.getAgentSkills(agentId);
    
    let filteredSkills = skills;
    if (search) {
      filteredSkills = skills.filter(skill => 
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filteredSkills.length === 0) {
      return {
        type: 'info',
        message: search 
          ? `No skills found matching "${search}"`
          : "No skills available. Skills will be learned automatically as you interact with the agent."
      };
    }

    let skillsText = `# 🛠️ Agent Skills ${search ? `(matching "${search}")` : ''}\n\n`;
    
    filteredSkills.forEach(skill => {
      skillsText += `## ${skill.name}\n`;
      skillsText += `${skill.description}\n`;
      skillsText += `- **Category**: ${skill.category}\n`;
      skillsText += `- **Usage**: ${skill.usage} times\n`;
      skillsText += `- **Status**: ${skill.status}\n\n`;
    });

    return {
      type: 'info',
      message: skillsText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve skills"
    };
  }
}

async function handleMemoryCommand(agentId: string, search?: string) {
  try {
    const memories = await HermesAgentDB.getAgentMemories(agentId, search);
    
    if (memories.length === 0) {
      return {
        type: 'info',
        message: search 
          ? `No memories found matching "${search}"`
          : "No memories stored yet. The agent will learn and remember as you interact."
      };
    }

    let memoryText = `# 🧠 Agent Memory ${search ? `(matching "${search}")` : ''}\n\n`;
    
    memories.forEach(memory => {
      memoryText += `## ${memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}\n`;
      memoryText += `${memory.content}\n`;
      memoryText += `- **Importance**: ${(memory.importance * 100).toFixed(0)}%\n`;
      memoryText += `- **Last accessed**: ${new Date(memory.lastAccessed).toLocaleDateString()}\n\n`;
    });

    return {
      type: 'info',
      message: memoryText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve memories"
    };
  }
}

async function handleClearCommand() {
  return {
    type: 'action',
    action: 'clear_chat',
    message: "Chat history cleared."
  };
}

async function handleAgentCommand(agent: any, subcommand?: string) {
  if (subcommand === 'stats') {
    return {
      type: 'info',
      message: `# 📊 Agent Statistics\n\n` +
        `- **Total Sessions**: ${agent.totalSessions}\n` +
        `- **Total Messages**: ${agent.totalMessages}\n` +
        `- **Skills Used**: ${agent.totalSkillsUsed}\n` +
        `- **Created**: ${new Date(agent.createdAt).toLocaleDateString()}\n` +
        `- **Last Updated**: ${new Date(agent.updatedAt).toLocaleDateString()}\n`
    };
  }

  return {
    type: 'info',
    message: `# 🤖 Agent Information\n\n` +
      `**Name**: ${agent.name}\n` +
      `**Description**: ${agent.description}\n` +
      `**Model**: ${agent.model}\n` +
      `**Provider**: ${agent.provider}\n` +
      `**Temperature**: ${agent.temperature}\n` +
      `**Max Tokens**: ${agent.maxTokens}\n` +
      `**Memory Enabled**: ${agent.memoryEnabled ? 'Yes' : 'No'}\n` +
      `**Learning Enabled**: ${agent.learningEnabled ? 'Yes' : 'No'}\n` +
      `**Status**: ${agent.status}\n\n` +
      `Type \`/agent stats\` for usage statistics.`
  };
}

async function handleLearnCommand(agentId: string, content: string) {
  if (!content.trim()) {
    return {
      type: 'error',
      message: "Please provide something to learn. Usage: `/learn <topic> <information>`"
    };
  }

  try {
    // Get agent to get userId
    const agent = await HermesAgentDB.getAgent(agentId);
    if (!agent) {
      return {
        type: 'error',
        message: "Agent not found"
      };
    }

    // Store as memory
    await prisma.hermesMemory.create({
      data: {
        agentId,
        userId: agent.userId,
        type: 'user_preference',
        content: content.trim(),
        importance: 0.8,
        metadata: JSON.stringify({}),
        lastAccessed: new Date()
      }
    });

    return {
      type: 'success',
      message: `✅ Learned: "${content.trim()}"`
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to store learning"
    };
  }
}

async function handleForgetCommand(agentId: string, topic: string) {
  if (!topic.trim()) {
    return {
      type: 'error',
      message: "Please specify what to forget. Usage: `/forget <topic>`"
    };
  }

  try {
    const deleted = await HermesAgentDB.deleteMemory(agentId, topic.trim());
    
    return {
      type: 'success',
      message: deleted 
        ? `✅ Forgot about: "${topic.trim()}"` 
        : `No memories found about: "${topic.trim()}"`
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to forget"
    };
  }
}

async function handleModeCommand(agentId: string, mode?: string) {
  const validModes = ['creative', 'balanced', 'precise'];
  
  if (!mode) {
    return {
      type: 'info',
      message: `# 🎛️ Agent Modes\n\n` +
        `Available modes: ${validModes.join(', ')}\n\n` +
        `- **creative**: Higher temperature, more creative responses\n` +
        `- **balanced**: Default temperature, balanced responses\n` +
        `- **precise**: Lower temperature, more focused responses\n\n` +
        `Usage: \`/mode <mode>\``
    };
  }

  if (!validModes.includes(mode)) {
    return {
      type: 'error',
      message: `Invalid mode. Available modes: ${validModes.join(', ')}`
    };
  }

  try {
    const temperature = mode === 'creative' ? 0.9 : mode === 'precise' ? 0.3 : 0.7;
    await HermesAgentDB.updateAgent(agentId, { temperature });

    return {
      type: 'success',
      message: `✅ Agent mode changed to: ${mode} (temperature: ${temperature})`
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to change mode"
    };
  }
}

async function handleExportCommand(format?: string) {
  return {
    type: 'action',
    action: 'export_chat',
    format: format || 'json',
    message: `Exporting chat history as ${format || 'json'}...`
  };
}

async function handleResetCommand(agentId: string) {
  try {
    // Reset agent to default settings
    await HermesAgentDB.updateAgent(agentId, {
      temperature: 0.7,
      maxTokens: 4000
    });

    // Clear memories (optional - could be dangerous)
    // await HermesAgentDB.clearMemories(agentId);

    return {
      type: 'success',
      message: "✅ Agent reset to default settings. Memories preserved."
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to reset agent"
    };
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Hermes Commands API",
    commands: Object.keys(HERMES_COMMANDS),
    usage: "POST with { command, args } to execute commands"
  });
}