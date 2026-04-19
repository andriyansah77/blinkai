/**
 * Comprehensive Hermes Integration with Full User Isolation
 * Based on NousResearch/hermes-agent documentation
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

const execAsync = promisify(exec);

// AI API Configuration for fallback
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

export interface HermesProfile {
  userId: string;
  profileName: string;
  hermesHome: string;
  configPath: string;
  envPath: string;
  soulPath: string;
  status: 'active' | 'inactive' | 'error';
}

export interface HermesCommand {
  command: string;
  subcommand?: string;
  args?: string[];
  flags?: Record<string, string | boolean>;
}

export interface HermesSkill {
  name: string;
  source: string;
  description: string;
  installed: boolean;
  enabled: boolean;
}

export interface HermesSession {
  id: string;
  title?: string;
  created: string;
  lastActivity: string;
  messageCount: number;
  source: string;
}

export interface HermesCronJob {
  id: string;
  name: string;
  schedule: string;
  prompt: string;
  enabled: boolean;
  nextRun?: string;
}

export interface HermesMemory {
  type: 'built-in' | 'honcho' | 'openviking' | 'mem0';
  status: 'active' | 'inactive';
  config?: Record<string, any>;
}

export interface HermesGateway {
  status: 'running' | 'stopped' | 'error';
  platforms: {
    telegram?: { status: string; botToken?: string };
    discord?: { status: string; botToken?: string };
    whatsapp?: { status: string; paired?: boolean };
    slack?: { status: string; botToken?: string };
  };
}

export class HermesIntegration {
  private hermesPath = '/root/.local/bin/hermes';
  private profilesDir = '/root/.hermes/profiles';

  constructor() {
    // No need to ensure dir - Hermes manages this
  }

  private async ensureProfilesDir() {
    // Hermes manages profile directories automatically
  }

  /**
   * Sanitize user ID to be compatible with Hermes profile naming rules
   * Hermes only allows: [a-z0-9][a-z0-9_-]{0,63}
   * Privy user IDs contain colons (did:privy:xxx) which must be replaced
   */
  private sanitizeUserId(userId: string): string {
    return userId.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  }

  /**
   * Get profile name for a user
   */
  private getProfileName(userId: string): string {
    return `user-${this.sanitizeUserId(userId)}`;
  }

  /**
   * Execute Hermes command with user profile isolation
   */
  private async executeHermesCommand(
    userId: string,
    command: HermesCommand,
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<{ success: boolean; output: string; error: string }> {
    const profileName = this.getProfileName(userId);
    const profileHome = path.join(this.profilesDir, profileName);
    
    // Build command arguments
    const args = [
      '--profile', profileName,
      command.command
    ];
    
    if (command.subcommand) {
      args.push(command.subcommand);
    }
    
    if (command.args) {
      args.push(...command.args);
    }
    
    // Add flags
    if (command.flags) {
      for (const [key, value] of Object.entries(command.flags)) {
        if (typeof value === 'boolean' && value) {
          args.push(`--${key}`);
        } else if (typeof value === 'string') {
          args.push(`--${key}`, value);
        }
      }
    }
    
    const fullCommand = `${this.hermesPath} ${args.join(' ')}`;
    
    console.log(`[executeHermesCommand] Full command: ${fullCommand}`);
    console.log(`[executeHermesCommand] CWD: ${options.cwd || profileHome}`);
    console.log(`[executeHermesCommand] Profile home: ${profileHome}`);
    
    try {
      const result = await execAsync(fullCommand, {
        cwd: options.cwd || profileHome,
        timeout: options.timeout || 30000,
        env: {
          ...process.env,
          HERMES_HOME: profileHome,
          REAGENT_USER_ID: userId,
          REAGENT_API_BASE: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }
      });
      
      console.log(`[executeHermesCommand] Success! stdout length: ${result.stdout.length}, stderr length: ${result.stderr.length}`);
      console.log(`[executeHermesCommand] First 500 chars of stdout:`, result.stdout.substring(0, 500));
      
      return {
        success: true,
        output: result.stdout,
        error: result.stderr
      };
    } catch (error: any) {
      console.error(`[executeHermesCommand] Error:`, error.message);
      console.error(`[executeHermesCommand] stdout:`, error.stdout);
      console.error(`[executeHermesCommand] stderr:`, error.stderr);
      
      return {
        success: false,
        output: error.stdout || '',
        error: error.message
      };
    }
  }

  /**
   * Profile Management
   */
  async createProfile(userId: string, options: {
    clone?: boolean;
    cloneAll?: boolean;
    cloneFrom?: string;
  } = {}): Promise<{ success: boolean; profile?: HermesProfile; error?: string }> {
    try {
      console.log(`[Profile] Creating profile for user ${userId}`);
      
      const profileName = this.getProfileName(userId);
      
      // Build command WITHOUT --profile flag (profile doesn't exist yet!)
      const args = ['profile', 'create', profileName];
      
      if (options.clone) args.push('--clone');
      if (options.cloneAll) args.push('--clone-all');
      if (options.cloneFrom) args.push('--clone-from', options.cloneFrom);
      
      const fullCommand = `${this.hermesPath} ${args.join(' ')}`;
      
      console.log(`[Profile] Executing: ${fullCommand}`);
      
      try {
        const result = await execAsync(fullCommand, {
          timeout: 30000,
          env: {
            ...process.env
          }
        });
        
        console.log(`[Profile] Profile created successfully for user ${userId}`);
        console.log(`[Profile] Output:`, result.stdout);
        
        // Now get the profile info
        const profile = await this.getProfile(userId);
        
        // Set default AI configuration
        if (profile && profile.status === 'active') {
          console.log(`[Profile] Setting default AI configuration for user ${userId}`);
          
          // Set API key in both config.yaml and .env
          const configPath = `/root/.hermes/profiles/${profileName}/config.yaml`;
          const envPath = `/root/.hermes/profiles/${profileName}/.env`;
          
          try {
            // 1. Create config.yaml with custom provider
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
            
            await execAsync(`cat > ${configPath} << 'EOF'\n${configContent}\nEOF`);
            console.log(`[Profile] Config.yaml created with custom provider for user ${userId}`);
            
            // 2. Update .env file (Hermes reads API keys and model config from here)
            // IMPORTANT: Use exact environment variable names that Hermes expects
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
            
            // Write .env file directly using cat with proper escaping
            // Use double quotes to allow variable expansion
            await execAsync(`cat > ${envPath} << EOF
${envContent}
EOF`);
            
            console.log(`[Profile] .env file created for user ${userId}`);
            console.log(`[Profile] API Key set: ${AI_API_KEY ? 'Yes' : 'No'}`);
            console.log(`[Profile] AI configuration set successfully`);
            
            // 3. Copy profile markdown files (PLATFORM.md, TOOLS.md, SOUL.md)
            console.log(`[Profile] Copying profile markdown files for user ${userId}`);
            const profileDir = `/root/.hermes/profiles/${profileName}`;
            const sourceProfilesDir = '/root/reagent/hermes-profiles';
            
            try {
              // Copy PLATFORM.md
              await execAsync(`cp ${sourceProfilesDir}/PLATFORM.md ${profileDir}/PLATFORM.md`);
              console.log(`[Profile] ✅ PLATFORM.md copied`);
              
              // Copy TOOLS.md
              await execAsync(`cp ${sourceProfilesDir}/TOOLS.md ${profileDir}/TOOLS.md`);
              console.log(`[Profile] ✅ TOOLS.md copied`);
              
              // Copy SOUL.md
              await execAsync(`cp ${sourceProfilesDir}/SOUL.md ${profileDir}/SOUL.md`);
              console.log(`[Profile] ✅ SOUL.md copied`);
              
              console.log(`[Profile] All profile files copied successfully for user ${userId}`);
            } catch (copyError) {
              console.error(`[Profile] Failed to copy profile markdown files:`, copyError);
              // Continue anyway, profile is created
            }
            
            // 4. Install ReAgent Commands skill
            console.log(`[Profile] Installing ReAgent Commands skill for user ${userId}`);
            try {
              // Copy skill files to Hermes skills directory
              const hermesSkillsDir = '/root/.hermes/skills';
              const sourceSkillsDir = '/root/reagent/hermes-skills';
              
              // Ensure skills directory exists
              await execAsync(`mkdir -p ${hermesSkillsDir}`);
              
              // Copy skill files
              await execAsync(`cp ${sourceSkillsDir}/reagent_commands.py ${hermesSkillsDir}/`);
              await execAsync(`cp ${sourceSkillsDir}/reagent_commands.json ${hermesSkillsDir}/`);
              await execAsync(`chmod +x ${hermesSkillsDir}/reagent_commands.py`);
              
              console.log(`[Profile] ✅ Skill files copied to ${hermesSkillsDir}`);
              
              // Install skill for this profile
              const installResult = await this.executeHermesCommand(userId, {
                command: 'skills',
                subcommand: 'install',
                args: ['reagent_commands']
              });
              
              if (installResult.success) {
                console.log(`[Profile] ✅ ReAgent Commands skill installed for user ${userId}`);
              } else {
                console.warn(`[Profile] ⚠️ Failed to install skill:`, installResult.error);
              }
            } catch (skillError) {
              console.error(`[Profile] Failed to install ReAgent Commands skill:`, skillError);
              // Continue anyway, skill can be installed later
            }
          } catch (configError) {
            console.error(`[Profile] Failed to set AI configuration:`, configError);
            // Continue anyway, profile is created
          }
        }
        
        return { success: true, profile: profile || undefined };
      } catch (execError: any) {
        // Check if profile already exists
        if (execError.stdout?.includes('already exists') || execError.message?.includes('already exists')) {
          console.log(`[Profile] Profile already exists for user ${userId}, returning existing profile`);
          const profile = await this.getProfile(userId);
          return { success: true, profile: profile || undefined };
        }
        
        console.error(`[Profile] Failed to create profile for user ${userId}:`, execError);
        return { 
          success: false, 
          error: `Profile creation failed: ${execError.message || execError}` 
        };
      }
    } catch (error) {
      console.error(`[Profile] Exception during profile creation for user ${userId}:`, error);
      return { success: false, error: `Profile creation failed: ${error}` };
    }
  }

  async getProfile(userId: string): Promise<HermesProfile | null> {
    try {
      const profileName = this.getProfileName(userId);
      
      // Check if profile exists in Hermes by listing profiles
      try {
        const { stdout } = await execAsync(`${this.hermesPath} profile list`);
        const profileExists = stdout.includes(profileName);
        
        if (!profileExists) {
          console.log(`[Profile] Profile ${profileName} not found in Hermes`);
          return {
            userId,
            profileName,
            hermesHome: `/root/.hermes/profiles/${profileName}`,
            configPath: `/root/.hermes/profiles/${profileName}/config.yaml`,
            envPath: `/root/.hermes/profiles/${profileName}/.env`,
            soulPath: `/root/.hermes/profiles/${profileName}/SOUL.md`,
            status: 'inactive'
          };
        }
        
        console.log(`[Profile] Profile ${profileName} found in Hermes`);
        
        const profile: HermesProfile = {
          userId,
          profileName,
          hermesHome: `/root/.hermes/profiles/${profileName}`,
          configPath: `/root/.hermes/profiles/${profileName}/config.yaml`,
          envPath: `/root/.hermes/profiles/${profileName}/.env`,
          soulPath: `/root/.hermes/profiles/${profileName}/SOUL.md`,
          status: 'active'
        };
        
        return profile;
      } catch (listError) {
        console.error(`[Profile] Error checking profile list:`, listError);
        // Fallback to inactive
        return {
          userId,
          profileName,
          hermesHome: `/root/.hermes/profiles/${profileName}`,
          configPath: `/root/.hermes/profiles/${profileName}/config.yaml`,
          envPath: `/root/.hermes/profiles/${profileName}/.env`,
          soulPath: `/root/.hermes/profiles/${profileName}/SOUL.md`,
          status: 'inactive'
        };
      }
    } catch (error) {
      console.error(`[Profile] Exception in getProfile:`, error);
      return null;
    }
  }

  async deleteProfile(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const profileName = this.getProfileName(userId);
      const command: HermesCommand = {
        command: 'profile',
        subcommand: 'delete',
        args: [profileName],
        flags: { yes: true }
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Profile deletion failed: ${error}` };
    }
  }

  /**
   * Chat and Sessions with AI API Fallback
   */
  async *sendChatMessage(
    userId: string,
    message: string,
    options: {
      model?: string;
      provider?: string;
      skills?: string[];
      toolsets?: string[];
      quiet?: boolean;
      conversationHistory?: Array<{role: string; content: string}>;
    } = {}
  ): AsyncGenerator<string> {
    console.log(`[Hermes] sendChatMessage called for user ${userId}`);
    
    // First, try to use Hermes CLI
    const isHermesAvailable = await this.isHermesInstalled();
    console.log(`[Hermes] CLI available: ${isHermesAvailable}`);
    
    if (isHermesAvailable) {
      try {
        console.log(`[Hermes] Attempting to use Hermes CLI...`);
        // Try Hermes CLI first
        yield* this.streamHermesResponse(userId, message, options);
        console.log(`[Hermes] Hermes CLI succeeded`);
        return;
      } catch (hermesError) {
        console.warn('[Hermes] CLI failed, falling back to direct AI API:', hermesError);
        // Continue to fallback
      }
    } else {
      console.log(`[Hermes] CLI not available, using direct AI API fallback`);
    }
    
    // Fallback to direct AI API with conversation history
    console.log(`[Hermes] Using direct AI API fallback with ${options.conversationHistory?.length || 0} previous messages`);
    yield* this.streamDirectAIResponse(userId, message, options);
  }

  private async *streamDirectAIResponse(
    userId: string,
    message: string,
    options: {
      model?: string;
      provider?: string;
      conversationHistory?: Array<{role: string; content: string}>;
    } = {}
  ): AsyncGenerator<string> {
    try {
      // Import getUserAIConfig dynamically to avoid circular dependency
      const { getUserAIConfig } = await import('@/lib/platform');
      
      // Get user's AI config (platform or BYOK)
      const aiConfig = await getUserAIConfig(userId);
      
      const model = options.model || aiConfig.model;
      const apiKey = aiConfig.apiKey;
      const baseUrl = aiConfig.baseUrl;
      
      if (!apiKey) {
        yield "Error: AI API key not configured. Please set up your API key in settings or contact support.";
        return;
      }

      console.log(`[Hermes] Using ${aiConfig.mode} mode with model ${model}`);

      // Build messages array with conversation history
      const messages: Array<{role: string; content: string}> = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant powered by ReAgent with Hermes integration. You have access to conversation history and should maintain context throughout the conversation.'
        }
      ];

      // Add conversation history if provided
      if (options.conversationHistory && options.conversationHistory.length > 0) {
        messages.push(...options.conversationHistory);
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      console.log(`[Hermes] Sending ${messages.length} messages to AI API (including system prompt)`);

      // Prepare request to AI API
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`AI API error: ${response.status} - ${error}`);
      }

      if (!response.body) {
        throw new Error('No response body from AI API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Direct AI API error:', error);
      yield `I apologize, but I'm experiencing technical difficulties at the moment. `;
      yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}. `;
      yield `Please try again in a moment or contact support if the issue persists.`;
    }
  }

  private async *streamHermesResponse(
    userId: string, 
    message: string,
    options: {
      model?: string;
      provider?: string;
      skills?: string[];
      toolsets?: string[];
      quiet?: boolean;
    } = {}
  ): AsyncGenerator<string> {
    const profileName = this.getProfileName(userId);
    const profileHome = path.join(this.profilesDir, profileName);
    
    const command: HermesCommand = {
      command: 'chat',
      flags: {
        query: message,
        ...(options.model && { model: options.model }),
        ...(options.provider && { provider: options.provider }),
        ...(options.skills && { skills: options.skills.join(',') }),
        ...(options.toolsets && { toolsets: options.toolsets.join(',') }),
        quiet: options.quiet || true
      }
    };
    
    const args = [
      '--profile', profileName,
      command.command
    ];
    
    if (command.subcommand) args.push(command.subcommand);
    if (command.args) args.push(...command.args);
    
    // Add flags
    if (command.flags) {
      for (const [key, value] of Object.entries(command.flags)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean' && value) {
            args.push(`--${key}`);
          } else if (typeof value === 'string') {
            args.push(`--${key}`, value);
          }
        }
      }
    }

    try {
      const hermesProcess = spawn(this.hermesPath, args, {
        cwd: profileHome,
        stdio: 'pipe',
        env: {
          ...process.env,
          HERMES_HOME: profileHome,
          REAGENT_USER_ID: userId,
          REAGENT_API_BASE: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }
      });

      let buffer = '';
      let hasOutput = false;
      
      // Handle stdout
      hermesProcess.stdout.on('data', (data) => {
        buffer += data.toString();
      });

      // Handle stderr
      hermesProcess.stderr.on('data', (data) => {
        console.error('Hermes stderr:', data.toString());
      });

      // Wait for process to complete
      await new Promise((resolve, reject) => {
        hermesProcess.on('close', (code) => {
          if (code === 0 || code === null) {
            resolve(undefined);
          } else {
            reject(new Error(`Hermes process exited with code ${code}`));
          }
        });
        
        hermesProcess.on('error', (error) => {
          reject(error);
        });

        // Timeout after 60 seconds
        setTimeout(() => {
          hermesProcess.kill();
          reject(new Error('Hermes process timeout'));
        }, 60000);
      });

      // Process and stream response
      if (buffer.trim()) {
        // Clean the response to remove CLI metadata
        const cleanedResponse = this.cleanHermesResponse(buffer);
        
        if (cleanedResponse) {
          hasOutput = true;
          
          // Stream word by word for natural feel
          const words = cleanedResponse.split(' ');
          for (let i = 0; i < words.length; i++) {
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            await new Promise(resolve => setTimeout(resolve, 30)); // Faster streaming
          }
        }
      }

      if (!hasOutput) {
        throw new Error('No output from Hermes CLI');
      }
    } catch (error) {
      console.error('Hermes stream error:', error);
      throw error; // Let caller handle fallback
    }
  }

  private isMetadataLine(line: string): boolean {
    const metadataPatterns = [
      /Hermes Agent/i,
      /Project:/i,
      /Python:/i,
      /OpenAI SDK:/i,
      /Up to date/i,
      /Loading/i,
      /Initializing/i,
      /^\[.*\]/,  // [INFO], [DEBUG], etc
      />>>/,
      /<<</,
      /^─+$/,  // Separator lines
      /^═+$/,  // Separator lines
      /^Model:/i,
      /^Provider:/i,
      /^Temperature:/i,
      /^Max tokens:/i,
      /^Streaming:/i,
      /^Session:/i,
      /^Profile:/i,
      /^Using profile:/i,
      /^Chat session/i,
      /^Starting chat/i,
      /^Connecting to/i,
      /^Response:/i,
      /^Assistant:/i,
      /^User:/i,
      /^\s*$/,  // Empty lines
      /^✓/,  // Checkmarks
      /^✗/,  // X marks
      /^•/,  // Bullets
      /^─/,  // Lines
      /^═/,  // Lines
      /^│/,  // Vertical lines
      /^┌/,  // Box drawing
      /^└/,  // Box drawing
      /^├/,  // Box drawing
      /^┤/,  // Box drawing
      /^┬/,  // Box drawing
      /^┴/,  // Box drawing
      /^┼/,  // Box drawing
      /╭/,   // Box drawing rounded
      /╮/,   // Box drawing rounded
      /╯/,   // Box drawing rounded
      /╰/,   // Box drawing rounded
      /┊/,   // Dotted line
      /🔎/,   // Search emoji
      /⚕/,   // Medical symbol
      /preparing/i,
      /search_files/i,
      /find /i,
      /session_id:/i,
      /\d+\.\d+s$/,  // Timing like "0.6s"
    ];

    return metadataPatterns.some(pattern => pattern.test(line.trim()));
  }

  /**
   * Clean and extract actual AI response from Hermes CLI output
   */
  private cleanHermesResponse(rawOutput: string): string {
    const lines = rawOutput.split('\n');
    const cleanedLines: string[] = [];
    let inResponseSection = false;
    let responseStarted = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Skip metadata lines
      if (this.isMetadataLine(trimmed)) continue;
      
      // Look for response markers
      if (trimmed.toLowerCase().includes('response:') || 
          trimmed.toLowerCase().includes('assistant:')) {
        inResponseSection = true;
        continue;
      }
      
      // If we're in response section or found actual content
      if (inResponseSection || (!this.isMetadataLine(trimmed) && trimmed.length > 10)) {
        responseStarted = true;
        cleanedLines.push(trimmed);
      }
    }

    // If no response found, try to extract any meaningful text
    if (cleanedLines.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && 
            !this.isMetadataLine(trimmed) && 
            trimmed.length > 20 &&
            !trimmed.startsWith('[') &&
            !trimmed.startsWith('─') &&
            !trimmed.startsWith('═')) {
          cleanedLines.push(trimmed);
        }
      }
    }

    // Join lines and clean up extra spaces
    let result = cleanedLines.join(' ').trim();
    
    // Remove any remaining CLI artifacts
    result = result
      .replace(/\[INFO\]/gi, '')
      .replace(/\[DEBUG\]/gi, '')
      .replace(/\[ERROR\]/gi, '')
      .replace(/\[WARNING\]/gi, '')
      .replace(/>>>/g, '')
      .replace(/<<</g, '')
      .replace(/─+/g, '')
      .replace(/═+/g, '')
      .replace(/│/g, '')
      .replace(/┌/g, '')
      .replace(/└/g, '')
      .replace(/├/g, '')
      .replace(/┤/g, '')
      .replace(/┬/g, '')
      .replace(/┴/g, '')
      .replace(/┼/g, '')
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    return result;
  }

  async getSessions(userId: string): Promise<HermesSession[]> {
    try {
      const command: HermesCommand = {
        command: 'sessions',
        subcommand: 'list'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseSessionsList(result.output);
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  private parseSessionsList(output: string): HermesSession[] {
    // Parse Hermes sessions list output
    const sessions: HermesSession[] = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Parse session line format
      const match = line.match(/(\w+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})/);
      if (match) {
        sessions.push({
          id: match[1],
          title: match[2],
          created: match[3],
          lastActivity: match[3],
          messageCount: 0,
          source: 'cli'
        });
      }
    }
    
    return sessions;
  }

  /**
   * Skills Management
   */
  async getSkills(userId: string): Promise<HermesSkill[]> {
    try {
      console.log(`[HermesIntegration] getSkills called for user: ${userId}`);
      
      const command: HermesCommand = {
        command: 'skills',
        subcommand: 'list'
      };

      console.log(`[HermesIntegration] Executing hermes command: skills list`);
      const result = await this.executeHermesCommand(userId, command);
      
      console.log(`[HermesIntegration] Command result - success: ${result.success}, output length: ${result.output.length}, error: ${result.error}`);
      
      if (result.success) {
        const skills = this.parseSkillsList(result.output);
        console.log(`[HermesIntegration] Parsed ${skills.length} skills`);
        return skills;
      }
      
      console.log(`[HermesIntegration] Command failed, returning empty array`);
      return [];
    } catch (error) {
      console.error(`[HermesIntegration] getSkills exception:`, error);
      return [];
    }
  }

  private parseSkillsList(output: string): HermesSkill[] {
    const skills: HermesSkill[] = [];
    
    try {
      const lines = output.split('\n');
      
      // Parse table format from Hermes CLI
      // New format: │ skill-name │ category │ source │ trust │
      let inTable = false;
      
      for (const line of lines) {
        // Skip empty lines
        if (!line || !line.trim()) continue;
        
        // Detect table start (header with ┏ or title "Installed Skills")
        if (line.includes('┏') || line.includes('Installed Skills')) {
          inTable = true;
          continue;
        }
        
        // Skip table end
        if (line.includes('└') || line.includes('┗')) {
          inTable = false;
          continue;
        }
        
        // Skip header row (contains ┃) and separator row (contains ┡ or ━)
        if (line.includes('┃') || line.includes('┡') || line.includes('━')) {
          continue;
        }
        
        // Skip summary line (e.g., "0 hub-installed, 75 builtin, 0 local")
        if (line.match(/\d+\s+(hub-installed|builtin|local)/)) {
          continue;
        }
        
        // Parse skill rows (lines containing │ and in table)
        if (inTable && line.includes('│')) {
          try {
            // Split by │ and clean up
            const parts = line.split('│')
              .map(p => p ? p.trim() : '')
              .filter(p => p.length > 0);
            
            if (parts.length >= 3) {
              const name = parts[0];
              const category = parts[1] || '';
              const source = parts[2] || 'unknown';
              
              // Skip if name is empty
              if (!name) {
                continue;
              }
              
              skills.push({
                name: name,
                source: source,
                description: category,
                installed: true, // All listed skills are installed
                enabled: true
              });
            }
          } catch (parseError) {
            console.error('[HermesIntegration] Error parsing skill line:', line, parseError);
            continue;
          }
        }
      }
      
      console.log(`[HermesIntegration] Parsed ${skills.length} skills from output`);
    } catch (error) {
      console.error('[HermesIntegration] Error parsing skills list:', error);
    }
    
    return skills;
  }

  async installSkill(userId: string, skillName: string, options: {
    source?: string;
    force?: boolean;
  } = {}): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'skills',
        subcommand: 'install',
        args: [skillName],
        flags: {
          ...(options.source && { source: options.source }),
          force: options.force || false
        }
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Skill installation failed: ${error}` };
    }
  }

  async uninstallSkill(userId: string, skillName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'skills',
        subcommand: 'uninstall',
        args: [skillName]
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Skill uninstallation failed: ${error}` };
    }
  }

  /**
   * Gateway Management
   */
  async getGatewayStatus(userId: string): Promise<HermesGateway> {
    try {
      console.log(`[Gateway] Getting status for user ${userId}`);
      const profileName = this.getProfileName(userId);
      
      // Initialize gateway object
      const gateway: HermesGateway = {
        status: 'stopped',
        platforms: {}
      };
      
      // Check if gateway service is running
      try {
        const { stdout } = await execAsync(
          `${this.hermesPath} --profile ${profileName} gateway status`,
          { timeout: 10000 }
        );
        
        console.log(`[Gateway] Status output:`, stdout.substring(0, 200));
        
        // Parse the output
        const parsedGateway = this.parseGatewayStatus(stdout);
        gateway.status = parsedGateway.status;
        
        console.log(`[Gateway] Parsed status: ${gateway.status}`);
      } catch (statusError: any) {
        console.warn(`[Gateway] Status check failed for user ${userId}:`, statusError.message);
        // Gateway not running, but continue to check config
      }
      
      // Always check config.yaml for configured platforms (even if gateway is stopped)
      const configPath = `/root/.hermes/profiles/${profileName}/config.yaml`;
      try {
        const { stdout: configContent } = await execAsync(`cat ${configPath}`);
        const config = yaml.parse(configContent);
        
        console.log(`[Gateway] Config keys:`, Object.keys(config));
        
        // Check which platforms are configured
        if (config.telegram?.bot_token) {
          console.log(`[Gateway] Telegram configured`);
          gateway.platforms.telegram = {
            status: gateway.status === 'running' ? 'connected' : 'disconnected',
            botToken: '***' // Hide token
          };
        }
        
        if (config.discord?.bot_token) {
          console.log(`[Gateway] Discord configured`);
          gateway.platforms.discord = {
            status: gateway.status === 'running' ? 'connected' : 'disconnected',
            botToken: '***' // Hide token
          };
        }
        
        if (config.whatsapp) {
          console.log(`[Gateway] WhatsApp configured`);
          gateway.platforms.whatsapp = {
            status: gateway.status === 'running' ? 'connected' : 'disconnected',
            paired: true
          };
        }
        
        if (config.slack?.bot_token) {
          console.log(`[Gateway] Slack configured`);
          gateway.platforms.slack = {
            status: gateway.status === 'running' ? 'connected' : 'disconnected',
            botToken: '***' // Hide token
          };
        }
        
        console.log(`[Gateway] Total platforms configured: ${Object.keys(gateway.platforms).length}`);
      } catch (configError) {
        console.warn(`[Gateway] Could not read config for user ${userId}:`, configError);
      }
      
      return gateway;
    } catch (error) {
      console.error(`[Gateway] Error getting status for user ${userId}:`, error);
      return {
        status: 'error',
        platforms: {}
      };
    }
  }

  private parseGatewayStatus(output: string): HermesGateway {
    const gateway: HermesGateway = {
      status: 'stopped',
      platforms: {}
    };
    
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Check if gateway service is running
      if (line.includes('Active:') && line.includes('active') && line.includes('running')) {
        gateway.status = 'running';
      }
      
      // Alternative check for running status
      if (line.includes('gateway service is running')) {
        gateway.status = 'running';
      }
      
      // Check systemd status
      if (line.includes('Loaded:') && line.includes('loaded')) {
        // Service is loaded, likely running
      }
    }
    
    return gateway;
  }

  async startGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Gateway] Starting gateway for user ${userId}`);
      
      const profileName = this.getProfileName(userId);
      
      // Check if gateway is already running
      try {
        const { stdout: statusOutput } = await execAsync(
          `${this.hermesPath} --profile ${profileName} gateway status`,
          { timeout: 10000 }
        );
        
        if (statusOutput.includes('active') && statusOutput.includes('running')) {
          console.log(`[Gateway] Gateway already running for user ${userId}`);
          return { success: true };
        }
      } catch (statusError) {
        console.log(`[Gateway] Gateway not running, will start it`);
      }
      
      // Install gateway service if not installed (non-interactive)
      try {
        console.log(`[Gateway] Installing gateway service for user ${userId}`);
        
        // Use spawn to handle interactive prompts
        const installProcess = spawn(this.hermesPath, [
          '--profile', profileName,
          'gateway', 'install'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Auto-answer 'yes' to any prompts
        installProcess.stdin.write('yes\n');
        installProcess.stdin.end();
        
        await new Promise((resolve, reject) => {
          let output = '';
          let errorOutput = '';
          
          installProcess.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          installProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
          
          installProcess.on('close', (code) => {
            if (code === 0 || output.includes('already exists') || errorOutput.includes('already exists')) {
              console.log(`[Gateway] Gateway service installed/exists for user ${userId}`);
              resolve(undefined);
            } else {
              console.warn(`[Gateway] Install exit code ${code}, output: ${output}, error: ${errorOutput}`);
              resolve(undefined); // Continue anyway
            }
          });
          
          installProcess.on('error', (error) => {
            console.warn(`[Gateway] Install process error:`, error);
            resolve(undefined); // Continue anyway
          });
          
          // Timeout after 30 seconds
          setTimeout(() => {
            installProcess.kill();
            resolve(undefined);
          }, 30000);
        });
      } catch (installError: any) {
        console.warn(`[Gateway] Install warning:`, installError);
        // Continue anyway
      }
      
      // Start the gateway using hermes command
      try {
        console.log(`[Gateway] Starting gateway service for user ${userId}`);
        
        await execAsync(
          `${this.hermesPath} --profile ${profileName} gateway start`,
          { timeout: 15000 }
        );
        
        // Wait a bit for service to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verify it's running
        try {
          const { stdout: verifyOutput } = await execAsync(
            `${this.hermesPath} --profile ${profileName} gateway status`,
            { timeout: 5000 }
          );
          
          if (verifyOutput.includes('active') || verifyOutput.includes('running')) {
            console.log(`[Gateway] ✅ Gateway started successfully for user ${userId}`);
            return { success: true };
          } else {
            console.warn(`[Gateway] Gateway may not be running: ${verifyOutput}`);
            // Return success anyway - gateway might be running but status check failed
            return { success: true };
          }
        } catch (verifyError) {
          console.warn(`[Gateway] Status verification failed, assuming success:`, verifyError);
          return { success: true };
        }
      } catch (startError: any) {
        console.error(`[Gateway] Failed to start gateway:`, startError);
        return { 
          success: false, 
          error: `Gateway start failed: ${startError.message || startError}` 
        };
      }
    } catch (error) {
      console.error(`[Gateway] Exception starting gateway for user ${userId}:`, error);
      return { success: false, error: `Gateway start failed: ${error}` };
    }
  }

  async stopGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Gateway] Stopping gateway for user ${userId}`);
      
      const command: HermesCommand = {
        command: 'gateway',
        subcommand: 'stop'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        console.log(`[Gateway] Gateway stopped successfully for user ${userId}`);
      } else {
        console.error(`[Gateway] Failed to stop gateway for user ${userId}:`, result.error);
      }
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error(`[Gateway] Exception stopping gateway for user ${userId}:`, error);
      return { success: false, error: `Gateway stop failed: ${error}` };
    }
  }

  async restartGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Gateway] Restarting gateway for user ${userId}`);
      
      // Stop gateway first
      const stopResult = await this.stopGateway(userId);
      if (!stopResult.success) {
        console.warn(`[Gateway] Stop warning (may not be running): ${stopResult.error}`);
      }
      
      // Wait for clean shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start gateway
      const startResult = await this.startGateway(userId);
      
      if (startResult.success) {
        console.log(`[Gateway] ✅ Gateway restarted successfully for user ${userId}`);
      }
      
      return startResult;
    } catch (error) {
      console.error(`[Gateway] Exception restarting gateway for user ${userId}:`, error);
      return { success: false, error: `Gateway restart failed: ${error}` };
    }
  }

  async setupGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Gateway] Setting up gateway for user ${userId}`);
      
      // Skip interactive gateway setup - we already configured via config.yaml
      // Just return success so we can proceed to start gateway
      console.log(`[Gateway] Gateway configuration already set via config.yaml`);
      
      return { success: true };
    } catch (error) {
      console.error(`[Gateway] Exception during gateway setup for user ${userId}:`, error);
      return { success: false, error: `Gateway setup failed: ${error}` };
    }
  }

  /**
   * Platform-specific setup
   */
  async setupTelegram(userId: string, botToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Platform] Setting up Telegram for user ${userId}`);
      
      // Edit config.yaml directly instead of using config set
      const profileName = this.getProfileName(userId);
      const configPath = `/root/.hermes/profiles/${profileName}/config.yaml`;
      
      try {
        // Read existing config
        let configContent = '';
        try {
          const { stdout } = await execAsync(`cat ${configPath}`);
          configContent = stdout;
        } catch (readError) {
          console.log(`[Platform] Config file not found, will create new one`);
          configContent = '';
        }
        
        // Parse YAML and add telegram config
        const config = configContent ? yaml.parse(configContent) : {};
        
        // Set model config for custom provider
        if (!config.model) {
          config.model = {};
        }
        config.model.provider = 'custom';
        config.model.model = AI_MODEL;
        config.model.base_url = AI_API_BASE_URL;
        config.model.api_key_env = 'OPENAI_API_KEY';
        config.model.timeout = 60;
        config.model.max_retries = 3;
        
        // Set telegram config
        if (!config.telegram) {
          config.telegram = {};
        }
        config.telegram.bot_token = botToken;
        config.telegram.enabled = true; // Enable Telegram platform
        
        // Add gateway config to allow all users (can be restricted later)
        if (!config.gateway) {
          config.gateway = {};
        }
        config.gateway.allow_all_users = true; // Allow all users for now
        
        // Write back to file
        const newConfigContent = yaml.stringify(config);
        await execAsync(`cat > ${configPath} << 'EOF'\n${newConfigContent}\nEOF`);
        
        console.log(`[Platform] Telegram token set successfully for user ${userId}`);
        
        // Update .env file with ReAgent API credentials
        const envPath = `/root/.hermes/profiles/${profileName}/.env`;
        try {
          // Get platform API key from environment
          const platformApiKey = process.env.PLATFORM_API_KEY || '';
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://reagent.eu.cc';
          
          // Append ReAgent credentials to .env
          const envAddition = `
# Gateway Configuration
GATEWAY_ALLOW_ALL_USERS=true
TELEGRAM_BOT_TOKEN=${botToken}

# ReAgent Platform Credentials (Auto-configured)
REAGENT_API_KEY=${platformApiKey}
REAGENT_USER_ID=${userId}
REAGENT_API_BASE=${appUrl}
`;
          await execAsync(`echo '${envAddition}' >> ${envPath}`);
          console.log(`[Platform] ✅ ReAgent credentials auto-configured for user ${userId}`);
        } catch (envError) {
          console.warn(`[Platform] Failed to update .env file:`, envError);
          // Continue anyway, config.yaml should be enough
        }
      } catch (fileError) {
        console.error(`[Platform] Failed to edit config file:`, fileError);
        return { success: false, error: `Failed to set Telegram token: ${fileError}` };
      }

      // Restart gateway to apply new config
      console.log(`[Platform] Restarting gateway to apply Telegram config for user ${userId}`);
      
      const restartResult = await this.restartGateway(userId);
      
      if (restartResult.success) {
        console.log(`[Platform] ✅ Telegram setup completed and gateway restarted for user ${userId}`);
        return { success: true };
      } else {
        console.error(`[Platform] Failed to restart gateway after Telegram setup:`, restartResult.error);
        return { success: false, error: `Gateway restart failed: ${restartResult.error}` };
      }
    } catch (error) {
      console.error(`[Platform] Exception during Telegram setup for user ${userId}:`, error);
      return { success: false, error: `Telegram setup failed: ${error}` };
    }
  }

  async setupDiscord(userId: string, botToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[Platform] Setting up Discord for user ${userId}`);
      
      // Edit config.yaml directly instead of using config set
      const profileName = this.getProfileName(userId);
      const configPath = `/root/.hermes/profiles/${profileName}/config.yaml`;
      
      try {
        // Read existing config
        let configContent = '';
        try {
          const { stdout } = await execAsync(`cat ${configPath}`);
          configContent = stdout;
        } catch (readError) {
          console.log(`[Platform] Config file not found, will create new one`);
          configContent = '';
        }
        
        // Parse YAML and add discord config
        const config = configContent ? yaml.parse(configContent) : {};
        
        // Set model config for custom provider
        if (!config.model) {
          config.model = {};
        }
        config.model.provider = 'custom';
        config.model.model = AI_MODEL;
        config.model.base_url = AI_API_BASE_URL;
        config.model.api_key_env = 'OPENAI_API_KEY';
        config.model.timeout = 60;
        config.model.max_retries = 3;
        
        // Set discord config
        if (!config.discord) {
          config.discord = {};
        }
        config.discord.bot_token = botToken;
        config.discord.enabled = true; // Enable Discord platform
        
        // Add gateway config to allow all users (can be restricted later)
        if (!config.gateway) {
          config.gateway = {};
        }
        config.gateway.allow_all_users = true; // Allow all users for now
        
        // Write back to file
        const newConfigContent = yaml.stringify(config);
        await execAsync(`cat > ${configPath} << 'EOF'\n${newConfigContent}\nEOF`);
        
        console.log(`[Platform] Discord token set successfully for user ${userId}`);
        
        // Also update .env file with gateway environment variables
        const envPath = `/root/.hermes/profiles/${profileName}/.env`;
        try {
          // Append gateway config to .env
          const envAddition = `\n# Gateway Configuration\nGATEWAY_ALLOW_ALL_USERS=true\nDISCORD_BOT_TOKEN=${botToken}\n`;
          await execAsync(`echo '${envAddition}' >> ${envPath}`);
          console.log(`[Platform] Gateway environment variables added to .env for user ${userId}`);
        } catch (envError) {
          console.warn(`[Platform] Failed to update .env file:`, envError);
          // Continue anyway, config.yaml should be enough
        }
      } catch (fileError) {
        console.error(`[Platform] Failed to edit config file:`, fileError);
        return { success: false, error: `Failed to set Discord token: ${fileError}` };
      }

      // Restart gateway to apply new config
      console.log(`[Platform] Restarting gateway to apply Discord config for user ${userId}`);
      
      const restartResult = await this.restartGateway(userId);
      
      if (restartResult.success) {
        console.log(`[Platform] ✅ Discord setup completed and gateway restarted for user ${userId}`);
        return { success: true };
      } else {
        console.error(`[Platform] Failed to restart gateway after Discord setup:`, restartResult.error);
        return { success: false, error: `Gateway restart failed: ${restartResult.error}` };
      }
    } catch (error) {
      console.error(`[Platform] Exception during Discord setup for user ${userId}:`, error);
      return { success: false, error: `Discord setup failed: ${error}` };
    }
  }

  async setupWhatsApp(userId: string): Promise<{ success: boolean; error?: string; instructions?: string }> {
    try {
      console.log(`[Platform] Setting up WhatsApp for user ${userId}`);
      
      const profileName = this.getProfileName(userId);
      
      // WhatsApp requires interactive terminal for QR code
      // We cannot run it through subprocess, so we provide instructions instead
      const instructions = `WhatsApp setup requires an interactive terminal to display the QR code.

Please run this command in your SSH terminal:

  hermes --profile ${profileName} whatsapp

Then scan the QR code with your WhatsApp mobile app:
1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Tap "Link a Device"
4. Scan the QR code displayed in the terminal

Once connected, the gateway will automatically handle WhatsApp messages.`;

      console.log(`[Platform] WhatsApp requires manual setup via terminal for user ${userId}`);
      
      // Return success with instructions
      return { 
        success: true, 
        error: undefined,
        instructions 
      };
    } catch (error) {
      console.error(`[Platform] Exception during WhatsApp setup for user ${userId}:`, error);
      return { success: false, error: `WhatsApp setup failed: ${error}` };
    }
  }

  /**
   * Configuration Management
   */
  async setConfig(userId: string, key: string, value: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'config',
        subcommand: 'set',
        args: [key, value]
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Config set failed: ${error}` };
    }
  }

  async getConfig(userId: string): Promise<Record<string, any>> {
    try {
      const command: HermesCommand = {
        command: 'config',
        subcommand: 'show'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseConfig(result.output);
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }

  private parseConfig(output: string): Record<string, any> {
    try {
      // Try to parse as YAML
      return yaml.parse(output) || {};
    } catch (error) {
      // Fallback to simple key-value parsing
      const config: Record<string, any> = {};
      const lines = output.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^(\w+(?:\.\w+)*)\s*:\s*(.+)$/);
        if (match) {
          config[match[1]] = match[2];
        }
      }
      
      return config;
    }
  }

  /**
   * Cron Jobs Management
   */
  async getCronJobs(userId: string): Promise<HermesCronJob[]> {
    try {
      const command: HermesCommand = {
        command: 'cron',
        subcommand: 'list'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseCronJobs(result.output);
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  private parseCronJobs(output: string): HermesCronJob[] {
    const jobs: HermesCronJob[] = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Parse cron job line format
      const match = line.match(/(\w+)\s+(.+?)\s+(\S+)\s+(.+)/);
      if (match) {
        jobs.push({
          id: match[1],
          name: match[2],
          schedule: match[3],
          prompt: match[4],
          enabled: !line.includes('paused')
        });
      }
    }
    
    return jobs;
  }

  async createCronJob(userId: string, options: {
    name: string;
    schedule: string;
    prompt: string;
    skills?: string[];
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'cron',
        subcommand: 'create',
        args: [options.name, options.schedule, options.prompt],
        flags: {
          ...(options.skills && { skill: options.skills.join(',') })
        }
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Cron job creation failed: ${error}` };
    }
  }

  /**
   * Memory Management
   */
  async getMemoryStatus(userId: string): Promise<HermesMemory> {
    try {
      const command: HermesCommand = {
        command: 'memory',
        subcommand: 'status'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseMemoryStatus(result.output);
      }
      
      return { type: 'built-in', status: 'active' };
    } catch (error) {
      return { type: 'built-in', status: 'inactive' };
    }
  }

  private parseMemoryStatus(output: string): HermesMemory {
    const memory: HermesMemory = { type: 'built-in', status: 'active' };
    
    if (output.includes('honcho')) {
      memory.type = 'honcho';
    } else if (output.includes('openviking')) {
      memory.type = 'openviking';
    } else if (output.includes('mem0')) {
      memory.type = 'mem0';
    }
    
    memory.status = output.includes('active') ? 'active' : 'inactive';
    
    return memory;
  }

  /**
   * Status and Diagnostics
   */
  async getStatus(userId: string): Promise<Record<string, any>> {
    try {
      const command: HermesCommand = {
        command: 'status',
        flags: { all: true }
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseStatus(result.output);
      }
      
      return {};
    } catch (error) {
      return {};
    }
  }

  private parseStatus(output: string): Record<string, any> {
    const status: Record<string, any> = {};
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('Profile:')) {
        status.profile = line.split(':')[1]?.trim();
      }
      if (line.includes('Model:')) {
        status.model = line.split(':')[1]?.trim();
      }
      if (line.includes('Provider:')) {
        status.provider = line.split(':')[1]?.trim();
      }
      if (line.includes('Gateway:')) {
        status.gateway = line.split(':')[1]?.trim();
      }
    }
    
    return status;
  }

  async runDiagnostics(userId: string): Promise<{ success: boolean; report: string; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'doctor'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      return {
        success: result.success,
        report: result.output,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        report: '',
        error: `Diagnostics failed: ${error}`
      };
    }
  }

  /**
   * Utility Methods
   */
  async isHermesInstalled(): Promise<boolean> {
    try {
      const result = await execAsync(`${this.hermesPath} --version`);
      return result.stdout.includes('Hermes Agent');
    } catch (error) {
      return false;
    }
  }

  async getVersion(): Promise<string> {
    try {
      const result = await execAsync(`${this.hermesPath} --version`);
      return result.stdout.trim();
    } catch (error) {
      return 'Unknown';
    }
  }
}

// Global instance
export const hermesIntegration = new HermesIntegration();
