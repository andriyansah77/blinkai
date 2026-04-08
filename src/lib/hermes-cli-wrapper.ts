/**
 * Hermes CLI Wrapper
 * Integrates with the actual NousResearch/hermes-agent CLI
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

const execAsync = promisify(exec);

export interface HermesConfig {
  name: string;
  personality?: string;
  model: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  skills?: string[];
}

export interface HermesInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  port?: number;
  configPath: string;
}

export class HermesCliWrapper {
  private instancesDir: string;
  private instances: Map<string, HermesInstance> = new Map();

  constructor() {
    this.instancesDir = path.join(process.cwd(), '.hermes-instances');
    this.ensureInstancesDir();
  }

  private async ensureInstancesDir() {
    await fs.ensureDir(this.instancesDir);
  }

  /**
   * Check if Hermes CLI is installed
   */
  async isHermesInstalled(): Promise<boolean> {
    try {
      // Check environment variable first
      if (process.env.HERMES_CLI_AVAILABLE === 'true') {
        console.log('✅ Hermes CLI marked as available in environment');
        return true;
      }

      // Try to execute hermes command with full path first
      try {
        const result = await execAsync('/root/.local/bin/hermes --version');
        console.log('✅ Hermes CLI detected with full path:', result.stdout.trim());
        return true;
      } catch (pathError) {
        // Try with sudo su and full path as fallback
        try {
          const result = await execAsync('sudo su -c "/root/.local/bin/hermes --version"');
          console.log('✅ Hermes CLI detected with sudo and full path:', result.stdout.trim());
          return true;
        } catch (sudoError) {
          console.log('⚠️  Hermes CLI not found with full path or sudo');
          return false;
        }
      }
    } catch (error) {
      console.log('⚠️  Hermes CLI not found:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Execute Hermes command with proper sudo handling
   */
  private async executeHermesCommand(command: string, args: string[] = [], options: any = {}): Promise<any> {
    // Use full path to Hermes CLI on VPS
    const hermesPath = '/root/.local/bin/hermes';
    const fullCommand = `${hermesPath} ${args.join(' ')}`;
    
    try {
      // Try with full path first
      return await execAsync(fullCommand, options);
    } catch (normalError) {
      // Fallback to sudo su with full path
      try {
        return await execAsync(`sudo su -c "${fullCommand}"`, options);
      } catch (sudoError) {
        throw new Error(`Failed to execute Hermes command: ${sudoError}`);
      }
    }
  }

  /**
   * Install Hermes CLI
   */
  async installHermes(): Promise<void> {
    try {
      console.log('Installing Hermes CLI...');
      
      // For Windows, we need to use WSL or provide alternative installation
      if (process.platform === 'win32') {
        console.log('Windows detected. Hermes requires WSL2 or Linux environment.');
        throw new Error('Hermes Agent requires WSL2 on Windows. Please install WSL2 first.');
      }
      
      // Install using the official installer
      await execAsync('curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash');
      
      // Reload shell environment
      await execAsync('source ~/.bashrc || source ~/.zshrc || true');
      
      console.log('Hermes CLI installed successfully');
    } catch (error) {
      throw new Error(`Failed to install Hermes CLI: ${error}`);
    }
  }

  /**
   * Create a new Hermes agent instance
   */
  async createAgent(config: HermesConfig): Promise<string> {
    const instanceId = `agent-${Date.now()}`;
    const instanceDir = path.join(this.instancesDir, instanceId);
    
    await fs.ensureDir(instanceDir);

    // Create Hermes configuration using the official format
    const hermesConfig = {
      // Core agent settings
      agent: {
        name: config.name,
        personality: config.personality || `You are ${config.name}, a helpful AI assistant.`,
        learning: {
          enabled: true,
          auto_improve: true
        },
        memory: {
          enabled: true,
          max_entries: 1000
        }
      },
      
      // Model configuration
      model: {
        provider: config.provider,
        name: config.model,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000
      },
      
      // API configuration
      api: {
        key: config.apiKey,
        base_url: config.baseUrl || undefined
      },
      
      // Tools and capabilities
      tools: {
        enabled: config.tools || ['web_search', 'code_execution', 'file_operations'],
        web_search: {
          enabled: true
        },
        code_execution: {
          enabled: true,
          timeout: 30
        }
      },
      
      // Skills
      skills: {
        enabled: config.skills || [],
        auto_load: true
      }
    };

    // Write configuration file (Hermes uses YAML config)
    const configPath = path.join(instanceDir, 'config.yaml');
    await fs.writeFile(configPath, yaml.stringify(hermesConfig));

    // Create SOUL.md (personality file) - This is Hermes-specific
    const soulPath = path.join(instanceDir, 'SOUL.md');
    const soulContent = `# ${config.name}

${config.personality || `You are ${config.name}, a helpful AI assistant with the following characteristics:`}

## Core Identity
You are ${config.name}, an AI agent powered by the Hermes framework. You have:
- **Learning capabilities**: You learn and improve from every interaction
- **Persistent memory**: You remember conversations and user preferences
- **Adaptive personality**: You adjust your communication style based on context
- **Tool access**: You can use various tools to help users effectively

## Personality Traits
- Helpful and friendly
- Learning-oriented and curious
- Professional yet approachable
- Proactive in offering assistance
- Consistent with your core identity as ${config.name}

## Capabilities
- Answer questions and provide information
- Learn from conversations to improve future responses
- Execute tools and skills when needed
- Remember context across sessions
- Adapt to user preferences and communication styles

## Guidelines
- Be conversational and natural in your responses
- Ask clarifying questions when you need more information
- Provide detailed explanations when they would be helpful
- Stay consistent with your personality as ${config.name}
- Use your memory and learning capabilities to provide personalized assistance
- Be proactive in suggesting helpful actions or information

## Learning & Memory
You grow smarter with each interaction. Use your:
- **Session memory**: Remember what we've discussed in this conversation
- **Long-term memory**: Recall user preferences and past interactions
- **Skill learning**: Develop new capabilities based on user needs
- **Pattern recognition**: Identify and adapt to user communication patterns

Remember: You are not just answering questions - you are building a relationship and growing as an assistant with each interaction.
`;

    await fs.writeFile(soulPath, soulContent);

    // Create skills directory
    const skillsDir = path.join(instanceDir, 'skills');
    await fs.ensureDir(skillsDir);

    // Create memories directory
    const memoriesDir = path.join(instanceDir, 'memories');
    await fs.ensureDir(memoriesDir);

    // Store instance info
    const instance: HermesInstance = {
      id: instanceId,
      name: config.name,
      status: 'stopped',
      configPath
    };

    this.instances.set(instanceId, instance);
    
    return instanceId;
  }

  /**
   * Start a Hermes agent instance
   */
  async startAgent(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const instanceDir = path.dirname(instance.configPath);
    
    try {
      // Set environment variables for Hermes
      const env = {
        ...process.env,
        HERMES_CONFIG_PATH: instance.configPath,
        HERMES_WORK_DIR: instanceDir
      };

      // Start Hermes using full path with correct arguments
      let hermesProcess;
      try {
        // Try with full path first - use simple chat command
        hermesProcess = spawn('/root/.local/bin/hermes', ['chat', '--quiet'], {
          cwd: instanceDir,
          detached: true,
          stdio: 'pipe',
          env
        });
      } catch (pathError) {
        // Fallback to sudo su with full path
        hermesProcess = spawn('sudo', ['su', '-c', `/root/.local/bin/hermes chat --quiet`], {
          cwd: instanceDir,
          detached: true,
          stdio: 'pipe',
          env
        });
      }

      instance.pid = hermesProcess.pid;
      instance.status = 'running';
      
      // Find available port (Hermes typically uses 8000+)
      instance.port = 8000 + parseInt(instanceId.split('-')[1]) % 1000;

      console.log(`Started Hermes agent ${instance.name} with PID ${instance.pid}`);
      
      // Handle process events
      hermesProcess.on('error', (error) => {
        console.error(`Hermes process error: ${error}`);
        instance.status = 'error';
      });

      hermesProcess.on('exit', (code) => {
        console.log(`Hermes process exited with code ${code}`);
        instance.status = 'stopped';
        instance.pid = undefined;
      });
      
    } catch (error) {
      instance.status = 'error';
      throw new Error(`Failed to start agent: ${error}`);
    }
  }

  /**
   * Stop a Hermes agent instance
   */
  async stopAgent(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    if (instance.pid) {
      try {
        process.kill(instance.pid, 'SIGTERM');
        instance.status = 'stopped';
        instance.pid = undefined;
        console.log(`Stopped Hermes agent ${instance.name}`);
      } catch (error) {
        console.error(`Failed to stop agent: ${error}`);
      }
    }
  }

  /**
   * Send a message to a Hermes agent
   */
  async sendMessage(instanceId: string, message: string, userId: string): Promise<AsyncGenerator<string>> {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.status !== 'running') {
      throw new Error(`Agent ${instanceId} is not running`);
    }

    const instanceDir = path.dirname(instance.configPath);
    
    // Use Hermes CLI to send message with proper session handling
    return this.streamHermesResponse(instanceDir, message, userId, instance.configPath);
  }

  /**
   * Stream response from Hermes CLI
   */
  private async *streamHermesResponse(instanceDir: string, message: string, userId: string, configPath: string): AsyncGenerator<string> {
    try {
      // Create session directory for this user if it doesn't exist
      const sessionDir = path.join(instanceDir, 'sessions', userId);
      await fs.ensureDir(sessionDir);

      // Set environment for Hermes
      const env = {
        ...process.env,
        HERMES_CONFIG_PATH: configPath,
        HERMES_WORK_DIR: instanceDir,
        HERMES_SESSION_DIR: sessionDir
      };

      // Execute Hermes chat command with proper session handling and full path
      let hermesProcess;
      try {
        // Try with full path first - use query mode for single message
        hermesProcess = spawn('/root/.local/bin/hermes', [
          'chat', 
          '--query', message,
          '--quiet'
        ], {
          cwd: instanceDir,
          stdio: 'pipe',
          env
        });
      } catch (pathError) {
        // Fallback to sudo su with full path
        hermesProcess = spawn('sudo', [
          'su', '-c', 
          `/root/.local/bin/hermes chat --query "${message}" --quiet`
        ], {
          cwd: instanceDir,
          stdio: 'pipe',
          env
        });
      }

      let buffer = '';
      
      // Stream the output
      for await (const chunk of hermesProcess.stdout) {
        buffer += chunk.toString();
        
        // Split by lines and yield complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            // Parse Hermes output format if needed
            try {
              const parsed = JSON.parse(line);
              if (parsed.content) {
                yield parsed.content;
              } else {
                yield line;
              }
            } catch {
              // If not JSON, yield as plain text
              yield line;
            }
          }
        }
      }

      // Yield any remaining content
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.content) {
            yield parsed.content;
          } else {
            yield buffer;
          }
        } catch {
          yield buffer;
        }
      }

      // Wait for process to complete
      await new Promise((resolve, reject) => {
        hermesProcess.on('close', (code) => {
          if (code === 0) {
            resolve(code);
          } else {
            reject(new Error(`Hermes process exited with code ${code}`));
          }
        });
        
        hermesProcess.on('error', reject);
      });
      
    } catch (error) {
      throw new Error(`Failed to get response from Hermes: ${error}`);
    }
  }

  /**
   * Add a skill to a Hermes agent
   */
  async addSkill(instanceId: string, skillName: string, skillCode: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    const instanceDir = path.dirname(instance.configPath);
    const skillsDir = path.join(instanceDir, 'skills');
    
    await fs.ensureDir(skillsDir);
    
    const skillFile = path.join(skillsDir, `${skillName}.py`);
    await fs.writeFile(skillFile, skillCode);
    
    console.log(`Added skill ${skillName} to agent ${instance.name}`);
  }

  /**
   * Get agent status
   */
  getAgentStatus(instanceId: string): HermesInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * List all agent instances
   */
  getAllAgents(): HermesInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Setup Hermes environment for a user
   */
  async setupUserEnvironment(userId: string, config: HermesConfig): Promise<string> {
    // Check if Hermes is installed
    if (!(await this.isHermesInstalled())) {
      await this.installHermes();
    }

    // Create agent instance
    const instanceId = await this.createAgent(config);
    
    // Start the agent
    await this.startAgent(instanceId);
    
    return instanceId;
  }

  /**
   * Cleanup agent instance
   */
  async cleanupAgent(instanceId: string): Promise<void> {
    await this.stopAgent(instanceId);
    
    const instance = this.instances.get(instanceId);
    if (instance) {
      const instanceDir = path.dirname(instance.configPath);
      await fs.remove(instanceDir);
      this.instances.delete(instanceId);
    }
  }
}

// Global instance
export const hermesCliWrapper = new HermesCliWrapper();