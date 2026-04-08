import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesCliWrapper } from "@/lib/hermes-cli-wrapper";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 Testing Hermes CLI connection...');

    // Test 1: Check environment variable
    const envAvailable = process.env.HERMES_CLI_AVAILABLE === 'true';
    console.log(`Environment HERMES_CLI_AVAILABLE: ${envAvailable}`);

    // Test 2: Check Hermes CLI installation
    let hermesInstalled = false;
    let hermesVersion = null;
    let hermesError = null;

    try {
      hermesInstalled = await hermesCliWrapper.isHermesInstalled();
      if (hermesInstalled) {
        const versionResult = await execAsync('hermes --version');
        hermesVersion = versionResult.stdout.trim();
        console.log(`✅ Hermes version: ${hermesVersion}`);
      }
    } catch (error) {
      hermesError = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Hermes CLI error: ${hermesError}`);
    }

    // Test 3: Check Hermes configuration
    let hermesConfig = null;
    let configError = null;

    try {
      const configResult = await execAsync('hermes config check');
      hermesConfig = configResult.stdout.trim();
      console.log(`✅ Hermes config: ${hermesConfig}`);
    } catch (error) {
      configError = error instanceof Error ? error.message : 'Config check failed';
      console.log(`⚠️  Hermes config: ${configError}`);
    }

    // Test 4: Check available models
    let availableModels = null;
    let modelsError = null;

    try {
      const modelsResult = await execAsync('hermes model list');
      availableModels = modelsResult.stdout.trim();
      console.log(`✅ Available models: ${availableModels}`);
    } catch (error) {
      modelsError = error instanceof Error ? error.message : 'Models check failed';
      console.log(`⚠️  Models check: ${modelsError}`);
    }

    // Test 5: Test simple chat
    let chatTest = null;
    let chatError = null;

    if (hermesInstalled) {
      try {
        const chatResult = await execAsync('hermes chat -q "Hello, test message" --no-memory');
        chatTest = chatResult.stdout.trim();
        console.log(`✅ Chat test successful`);
      } catch (error) {
        chatError = error instanceof Error ? error.message : 'Chat test failed';
        console.log(`⚠️  Chat test: ${chatError}`);
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        hermesCliAvailable: envAvailable
      },
      hermes: {
        installed: hermesInstalled,
        version: hermesVersion,
        error: hermesError
      },
      configuration: {
        status: hermesConfig ? 'valid' : 'needs_setup',
        details: hermesConfig,
        error: configError
      },
      models: {
        available: availableModels ? availableModels.split('\n').filter(l => l.trim()) : [],
        error: modelsError
      },
      chatTest: {
        success: chatTest !== null,
        response: chatTest ? chatTest.substring(0, 200) + '...' : null,
        error: chatError
      },
      recommendations: [
        ...(hermesInstalled ? [] : ['Install Hermes CLI: curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash']),
        ...(hermesConfig ? [] : ['Configure Hermes: hermes model']),
        ...(availableModels ? [] : ['Setup API keys: hermes config set OPENROUTER_API_KEY your-key']),
        ...(chatTest ? [] : ['Test chat functionality manually: hermes chat'])
      ]
    });

  } catch (error) {
    console.error("Hermes test error:", error);
    return NextResponse.json({
      error: "Failed to test Hermes CLI",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, message } = body;

    switch (action) {
      case 'quick_chat':
        if (!message) {
          return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        try {
          const result = await execAsync(`hermes chat -q "${message}" --no-memory`);
          return NextResponse.json({
            success: true,
            response: result.stdout.trim(),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            error: "Chat test failed",
            details: error instanceof Error ? error.message : "Unknown error"
          }, { status: 500 });
        }

      case 'check_config':
        try {
          const result = await execAsync('hermes config check');
          return NextResponse.json({
            success: true,
            config: result.stdout.trim(),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            error: "Config check failed",
            details: error instanceof Error ? error.message : "Unknown error"
          }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Hermes test action error:", error);
    return NextResponse.json({
      error: "Failed to execute test action",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}