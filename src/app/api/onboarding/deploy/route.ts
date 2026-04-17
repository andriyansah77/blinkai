import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { HermesAgentDB } from "@/lib/hermes-db";
import { hermesCliWrapper } from "@/lib/hermes-cli-wrapper";
import { autoInstallMintingSkill } from "@/lib/hooks/auto-install-minting-skill";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentName, agentPersonality, channels, plan } = body;

    if (!agentName) {
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
    }

    // 0. Ensure user exists in database (upsert)
    const userEmail = session.user.email || `${session.user.id}@privy.user`;
    const userName = session.user.name || session.user.id!;
    
    await prisma.user.upsert({
      where: { id: session.user.id! },
      update: {
        email: userEmail,
        name: userName,
      },
      create: {
        id: session.user.id!,
        email: userEmail,
        name: userName,
        password: 'PRIVY_AUTH', // Privy users don't use password
      }
    });

    console.log(`[Onboarding] User ensured in database: ${session.user.id}`);

    // 1. Create the Hermes agent in database
    const systemPrompt = `You are ${agentName}, ${agentPersonality || 'a helpful AI assistant'}. 

PERSONALITY:
${agentPersonality || 'You are friendly, helpful, and engaging. You love to assist users with their questions and tasks.'}

CAPABILITIES:
- Answer questions and provide helpful information
- Learn from conversations to improve responses
- Remember user preferences and context
- Execute skills and tools when needed
- Adapt your communication style to each user

GUIDELINES:
- Be conversational and natural
- Ask clarifying questions when needed
- Provide detailed explanations when helpful
- Stay in character as ${agentName}
- Be proactive in offering assistance

Remember: You grow smarter with each interaction. Use your memory and learning capabilities to provide increasingly personalized assistance.`;

    const agent = await HermesAgentDB.createAgent(session.user.id!, {
      name: agentName,
      description: agentPersonality || `AI assistant named ${agentName}`,
      model: process.env.AI_MODEL || 'gpt-4o',
      provider: process.env.AI_PROVIDER_ID || 'openai',
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
      tools: ['web_search', 'execute_code', 'file_operations'],
      memory: true,
      learningEnabled: true
    });

    // 2. Setup actual Hermes CLI instance
    let hermesInstanceId: string | null = null;
    try {
      hermesInstanceId = await hermesCliWrapper.setupUserEnvironment(session.user.id!, {
        name: agentName,
        personality: systemPrompt,
        model: process.env.AI_MODEL || 'gpt-4o',
        provider: process.env.AI_PROVIDER_ID || 'openai',
        apiKey: process.env.AI_API_KEY!,
        baseUrl: process.env.AI_API_BASE_URL,
        temperature: 0.7,
        maxTokens: 4000,
        tools: ['web_search', 'code_execution'],
        skills: []
      });
      
      console.log(`Hermes instance created: ${hermesInstanceId}`);
    } catch (error) {
      console.warn(`Failed to setup Hermes CLI instance: ${error}`);
      // Continue without Hermes CLI - will fallback to regular AI
    }

    // 2.5. Create Hermes profile for gateway and chat (CRITICAL for gateway)
    try {
      console.log(`[Onboarding] Creating Hermes profile for user ${session.user.id}`);
      const { hermesIntegration } = await import('@/lib/hermes-integration');
      
      const profileResult = await hermesIntegration.createProfile(session.user.id!);
      if (profileResult.success) {
        console.log(`[Onboarding] ✅ Hermes profile created successfully for user ${session.user.id}`);
      } else {
        console.warn(`[Onboarding] Failed to create Hermes profile: ${profileResult.error}`);
      }
    } catch (profileError) {
      console.error('[Onboarding] Profile creation error:', profileError);
      // Continue anyway - will try again during gateway setup
    }

    // 3. Set up user plan and credits
    const creditAmount = plan === 'free' ? 1000 : plan === 'pro' ? 10000 : 100000;
    
    await prisma.creditLedger.create({
      data: {
        userId: session.user.id!,
        amount: creditAmount,
        reason: 'plan_signup',
        meta: JSON.stringify({ 
          plan, 
          agentId: agent.id,
          hermesInstanceId,
          onboarding: true 
        })
      }
    });

    // 4. Create default skills for the agent
    const defaultSkills = [
      {
        name: 'Greeting Assistant',
        description: 'Friendly greeting and introduction skill',
        category: 'social',
        tags: ['greeting', 'introduction', 'welcome'],
        code: `
async function greetingAssistant(params) {
  const { userName, timeOfDay } = params;
  
  const greetings = {
    morning: "Good morning",
    afternoon: "Good afternoon", 
    evening: "Good evening",
    night: "Good evening"
  };
  
  const greeting = greetings[timeOfDay] || "Hello";
  const name = userName ? \` \${userName}\` : "";
  
  return {
    success: true,
    message: \`\${greeting}\${name}! I'm ${agentName}, your AI assistant. How can I help you today?\`,
    timestamp: new Date().toISOString()
  };
}

return greetingAssistant(params);`
      },
      {
        name: 'Help Guide',
        description: 'Provide help and guidance to users',
        category: 'support',
        tags: ['help', 'guide', 'assistance'],
        code: `
async function helpGuide(params) {
  const { topic } = params;
  
  const helpTopics = {
    general: "I can help you with questions, tasks, and conversations. Just ask me anything!",
    features: "I have learning capabilities, memory, and can use various tools to assist you.",
    commands: "You can chat with me naturally. I'll understand and respond appropriately.",
    skills: "I can learn new skills and improve over time based on our interactions."
  };
  
  const response = helpTopics[topic] || helpTopics.general;
  
  return {
    success: true,
    help: response,
    availableTopics: Object.keys(helpTopics),
    timestamp: new Date().toISOString()
  };
}

return helpGuide(params);`
      }
    ];

    for (const skillData of defaultSkills) {
      await HermesAgentDB.createSkill(agent.id, {
        ...skillData,
        usage: 0,
        rating: 0
      });
      
      // Also add to Hermes CLI if available
      if (hermesInstanceId) {
        try {
          await hermesCliWrapper.addSkill(
            hermesInstanceId, 
            skillData.name, 
            skillData.code
          );
        } catch (error) {
          console.warn(`Failed to add skill to Hermes CLI: ${error}`);
        }
      }
    }

    // 5. Store channel preferences (for future implementation)
    if (channels && channels.length > 0) {
      // In a real implementation, you would set up the actual channel connections here
      // For now, we just store the preferences
      await prisma.user.update({
        where: { id: session.user.id! },
        data: {
          // You could add a channels field to store preferences
        }
      });
    }

    // 6. Auto-install Minting Skill (proprietary, cannot be uninstalled)
    try {
      const mintingSkillResult = await autoInstallMintingSkill(session.user.id!);
      if (mintingSkillResult.success) {
        console.log(`Minting skill auto-installed: ${mintingSkillResult.skillId}`);
      } else {
        console.warn(`Failed to auto-install minting skill: ${mintingSkillResult.error}`);
      }
    } catch (error) {
      console.error('Error auto-installing minting skill:', error);
      // Continue even if minting skill installation fails
    }

    // 7. Auto-install and start gateway service
    let gatewayStatus = { installed: false, running: false, error: null as string | null };
    try {
      console.log(`[Onboarding] Setting up gateway for user ${session.user.id}`);
      
      // Import hermesIntegration and ensureHermesProfile
      const { hermesIntegration } = await import('@/lib/hermes-integration');
      const { ensureHermesProfile } = await import('@/lib/ensure-hermes-profile');
      
      // CRITICAL: Ensure Hermes profile exists before starting gateway
      console.log(`[Onboarding] Ensuring Hermes profile exists for user ${session.user.id}`);
      const profileResult = await ensureHermesProfile(session.user.id!);
      
      if (!profileResult.success) {
        console.error(`[Onboarding] Failed to ensure profile: ${profileResult.error}`);
        gatewayStatus.error = `Profile creation failed: ${profileResult.error}`;
        // Don't attempt gateway start if profile doesn't exist
      } else {
        console.log(`[Onboarding] ✅ Profile verified/created for user ${session.user.id}`);
        
        // Setup gateway (non-interactive)
        const setupResult = await hermesIntegration.setupGateway(session.user.id!);
        if (setupResult.success) {
          console.log(`[Onboarding] Gateway setup completed for user ${session.user.id}`);
          gatewayStatus.installed = true;
          
          // Start gateway service
          const startResult = await hermesIntegration.startGateway(session.user.id!);
          if (startResult.success) {
            console.log(`[Onboarding] ✅ Gateway started successfully for user ${session.user.id}`);
            gatewayStatus.running = true;
          } else {
            console.warn(`[Onboarding] Gateway start warning: ${startResult.error}`);
            gatewayStatus.error = startResult.error || 'Failed to start gateway';
          }
        } else {
          console.warn(`[Onboarding] Gateway setup warning: ${setupResult.error}`);
          gatewayStatus.error = setupResult.error || 'Failed to setup gateway';
        }
      }
    } catch (gatewayError) {
      console.error('[Onboarding] Gateway setup error:', gatewayError);
      gatewayStatus.error = gatewayError instanceof Error ? gatewayError.message : 'Unknown gateway error';
      // Continue anyway - gateway is optional
    }

    // 8. Create initial session
    const session_id = await HermesAgentDB.createSession(
      agent.id, 
      session.user.id!, 
      `Welcome Session with ${agentName}`,
      [] // Empty messages array for new session
    );

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description
      },
      hermes: {
        instanceId: hermesInstanceId,
        cliAvailable: hermesInstanceId !== null
      },
      gateway: gatewayStatus,
      credits: creditAmount,
      plan,
      sessionId: session_id.id,
      message: `${agentName} has been successfully deployed and is ready to chat!`
    }, { status: 201 });

  } catch (error) {
    console.error("Deployment error:", error);
    return NextResponse.json(
      { error: "Failed to deploy agent", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const hermesInstalled = await hermesCliWrapper.isHermesInstalled();
    const runningAgents = hermesCliWrapper.getAllAgents();
    
    return NextResponse.json({
      message: "Onboarding Deployment API",
      version: "2.0.0",
      hermes: {
        installed: hermesInstalled,
        runningAgents: runningAgents.length,
        agents: runningAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          status: agent.status
        }))
      },
      endpoints: {
        POST: "Deploy new agent after onboarding with real Hermes CLI integration"
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get deployment status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}