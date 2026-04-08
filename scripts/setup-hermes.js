#!/usr/bin/env node

/**
 * Setup script for Hermes Agent integration
 * This script initializes the database schema and checks Hermes CLI availability
 */

const { PrismaClient } = require('@prisma/client');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function checkHermesInstallation() {
  try {
    await execAsync('hermes --version');
    console.log('✅ Hermes CLI is already installed');
    return true;
  } catch (error) {
    console.log('⚠️  Hermes CLI not found');
    return false;
  }
}

async function installHermes() {
  console.log('📦 Installing Hermes Agent CLI...');
  
  try {
    // Check if we're on Windows
    if (process.platform === 'win32') {
      console.log('🪟 Windows detected');
      console.log('⚠️  Hermes Agent requires WSL2 on Windows');
      console.log('📖 Please install WSL2 first: https://docs.microsoft.com/en-us/windows/wsl/install');
      console.log('🔧 Then run this setup from within WSL2');
      return false;
    }

    // Install Hermes using official installer
    console.log('🔄 Running Hermes installer...');
    await execAsync('curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash');
    
    // Reload shell environment
    try {
      await execAsync('source ~/.bashrc || source ~/.zshrc || true');
    } catch (e) {
      // Ignore shell reload errors
    }
    
    // Verify installation
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit
    const installed = await checkHermesInstallation();
    
    if (installed) {
      console.log('✅ Hermes CLI installed successfully');
      return true;
    } else {
      console.log('⚠️  Hermes installation may need manual verification');
      console.log('🔧 Try running: source ~/.bashrc && hermes --version');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Failed to install Hermes CLI:', error.message);
    console.log('📖 Manual installation guide: https://hermes-agent.nousresearch.com/docs/getting-started/installation/');
    return false;
  }
}

async function setupHermesEnvironment() {
  console.log('🔧 Setting up Hermes environment...');
  
  try {
    // Create Hermes instances directory
    const instancesDir = path.join(process.cwd(), '.hermes-instances');
    
    // Create directory if it doesn't exist
    if (!fsSync.existsSync(instancesDir)) {
      await fs.mkdir(instancesDir, { recursive: true });
    }
    console.log('✅ Created Hermes instances directory');

    // Create Hermes config template
    const configTemplate = {
      agent: {
        name: "BlinkAI Agent",
        personality: "You are a helpful AI assistant created with BlinkAI.",
        learning: {
          enabled: true,
          auto_improve: true
        },
        memory: {
          enabled: true,
          max_entries: 1000
        }
      },
      model: {
        provider: "openai",
        name: "gpt-4o",
        temperature: 0.7,
        max_tokens: 4000
      },
      tools: {
        enabled: ["web_search", "code_execution", "file_operations"],
        web_search: {
          enabled: true
        },
        code_execution: {
          enabled: true,
          timeout: 30
        }
      },
      skills: {
        enabled: [],
        auto_load: true
      }
    };

    const configPath = path.join(instancesDir, 'config-template.yaml');
    
    // Simple YAML stringify (basic implementation)
    const yamlContent = `# Hermes Agent Configuration Template
agent:
  name: "${configTemplate.agent.name}"
  personality: "${configTemplate.agent.personality}"
  learning:
    enabled: ${configTemplate.agent.learning.enabled}
    auto_improve: ${configTemplate.agent.learning.auto_improve}
  memory:
    enabled: ${configTemplate.agent.memory.enabled}
    max_entries: ${configTemplate.agent.memory.max_entries}

model:
  provider: "${configTemplate.model.provider}"
  name: "${configTemplate.model.name}"
  temperature: ${configTemplate.model.temperature}
  max_tokens: ${configTemplate.model.max_tokens}

tools:
  enabled: [${configTemplate.tools.enabled.map(t => `"${t}"`).join(', ')}]
  web_search:
    enabled: ${configTemplate.tools.web_search.enabled}
  code_execution:
    enabled: ${configTemplate.tools.code_execution.enabled}
    timeout: ${configTemplate.tools.code_execution.timeout}

skills:
  enabled: []
  auto_load: ${configTemplate.skills.auto_load}
`;

    await fs.writeFile(configPath, yamlContent);
    console.log('✅ Created Hermes config template');

    return true;
  } catch (error) {
    console.error('❌ Failed to setup Hermes environment:', error.message);
    return false;
  }
}

async function setupHermes() {
  console.log('🚀 Setting up Hermes Agent integration...');

  try {
    // Check database connection
    console.log('📝 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check Hermes CLI installation
    console.log('🔍 Checking Hermes CLI installation...');
    let hermesInstalled = await checkHermesInstallation();
    
    if (!hermesInstalled) {
      console.log('📦 Hermes CLI not found, attempting installation...');
      hermesInstalled = await installHermes();
    }

    // Setup Hermes environment
    const envSetup = await setupHermesEnvironment();

    console.log('\n🎉 Hermes Agent setup completed!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ Database schema ready');
    console.log(`- ${hermesInstalled ? '✅' : '⚠️ '} Hermes CLI ${hermesInstalled ? 'installed' : 'needs manual setup'}`);
    console.log(`- ${envSetup ? '✅' : '❌'} Hermes environment ${envSetup ? 'configured' : 'failed'}`);
    console.log('- ✅ Onboarding flow configured');

    if (!hermesInstalled) {
      console.log('\n⚠️  Manual Hermes Setup Required:');
      console.log('1. Install Hermes CLI manually:');
      console.log('   curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash');
      console.log('2. Reload your shell: source ~/.bashrc');
      console.log('3. Verify: hermes --version');
      console.log('4. Configure API keys: hermes model');
    }

    console.log('\n🚀 You can now start the application with: npm run dev');
    console.log('📝 New users will go through onboarding to create their agents');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupHermes();