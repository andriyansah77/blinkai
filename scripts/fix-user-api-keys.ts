/**
 * Script to fix API keys in existing user profiles
 * Run with: npx tsx scripts/fix-user-api-keys.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const AI_API_KEY = process.env.AI_API_KEY || process.env.PLATFORM_API_KEY || '';
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || process.env.PLATFORM_API_BASE_URL || 'https://api.akashml.com/v1';
const AI_MODEL = process.env.AI_MODEL || process.env.PLATFORM_API_MODEL || 'MiniMaxAI/MiniMax-M2.5';

async function fixUserApiKeys() {
  try {
    console.log('🔧 Fixing API keys in user profiles...');
    console.log(`API Key: ${AI_API_KEY ? 'Set' : 'NOT SET'}`);
    console.log(`Base URL: ${AI_API_BASE_URL}`);
    console.log(`Model: ${AI_MODEL}`);
    
    if (!AI_API_KEY) {
      console.error('❌ AI_API_KEY not set in environment!');
      process.exit(1);
    }
    
    // Get all user profiles
    const { stdout } = await execAsync('ls -1 /root/.hermes/profiles/');
    const profiles = stdout.trim().split('\n').filter(p => p.startsWith('user-'));
    
    console.log(`\n📁 Found ${profiles.length} user profiles`);
    
    for (const profileName of profiles) {
      console.log(`\n👤 Processing profile: ${profileName}`);
      
      const envPath = `/root/.hermes/profiles/${profileName}/.env`;
      const configPath = `/root/.hermes/profiles/${profileName}/config.yaml`;
      
      // Extract user ID from profile name
      const userId = profileName.replace('user-', '').replace(/-/g, ':');
      
      // Update .env file
      const envContent = `# Hermes Profile Environment Variables
# Auto-configured by ReAgent Platform

# OpenAI-compatible API (Platform-provided)
OPENAI_API_KEY=${AI_API_KEY}
OPENAI_BASE_URL=${AI_API_BASE_URL}

# Model Configuration  
MODEL=${AI_MODEL}

# Platform Mode - Credits will be deducted from user account
REAGENT_PLATFORM_MODE=true
REAGENT_USER_ID=${userId}
`;
      
      try {
        // Backup existing .env
        await execAsync(`cp ${envPath} ${envPath}.backup 2>/dev/null || true`);
        
        // Write new .env
        await execAsync(`cat > ${envPath} << 'ENVEOF'
${envContent}
ENVEOF`);
        
        console.log(`  ✅ Updated .env file`);
        
        // Check if Telegram config exists and preserve it
        try {
          const { stdout: oldEnv } = await execAsync(`cat ${envPath}.backup`);
          const telegramMatch = oldEnv.match(/TELEGRAM_BOT_TOKEN=(.+)/);
          const discordMatch = oldEnv.match(/DISCORD_BOT_TOKEN=(.+)/);
          
          if (telegramMatch) {
            await execAsync(`echo "\n# Gateway Configuration\nGATEWAY_ALLOW_ALL_USERS=true\nTELEGRAM_BOT_TOKEN=${telegramMatch[1]}" >> ${envPath}`);
            console.log(`  ✅ Preserved Telegram config`);
          }
          
          if (discordMatch) {
            await execAsync(`echo "DISCORD_BOT_TOKEN=${discordMatch[1]}" >> ${envPath}`);
            console.log(`  ✅ Preserved Discord config`);
          }
        } catch (e) {
          // No backup or no gateway config
        }
        
        // Update config.yaml
        const configContent = `# Hermes Profile Configuration
# Auto-configured by ReAgent Platform

model:
  provider: custom
  model: ${AI_MODEL}
  base_url: ${AI_API_BASE_URL}
  api_key_env: OPENAI_API_KEY
  timeout: 60
  max_retries: 3
`;
        
        await execAsync(`cat > ${configPath} << 'CFGEOF'
${configContent}
CFGEOF`);
        
        console.log(`  ✅ Updated config.yaml`);
        
        // Verify the API key was written
        const { stdout: verifyEnv } = await execAsync(`grep OPENAI_API_KEY ${envPath}`);
        if (verifyEnv.includes(AI_API_KEY)) {
          console.log(`  ✅ API key verified in .env`);
        } else {
          console.log(`  ⚠️  API key not found in .env, trying alternative method...`);
          
          // Alternative method: direct echo
          await execAsync(`sed -i 's/OPENAI_API_KEY=.*/OPENAI_API_KEY=${AI_API_KEY}/' ${envPath}`);
          console.log(`  ✅ API key set via sed`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating profile: ${error}`);
      }
    }
    
    console.log('\n✅ All profiles updated!');
    console.log('\n🔄 Restarting gateways...');
    
    // Restart all gateways
    for (const profileName of profiles) {
      try {
        await execAsync(`hermes --profile ${profileName} gateway restart 2>/dev/null || true`);
        console.log(`  ✅ Restarted gateway for ${profileName}`);
      } catch (e) {
        console.log(`  ⚠️  Gateway not running for ${profileName}`);
      }
    }
    
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserApiKeys();
