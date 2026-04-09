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
  private profilesDir = '/tmp/hermes-profiles';

  constructor() {
    this.ensureProfilesDir();
  }

  private async ensureProfilesDir() {
    await fs.ensureDir(this.profilesDir);
  }

  /**
   * Execute Hermes command with user profile isolation
   */
  private async executeHermesCommand(
    userId: string,
    command: HermesCommand,
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<{ success: boolean; output: string; error: string }> {
    const profileName = `user-${userId}`;
    const profileHome = path.join(this.profilesDir, profileName);
    
    // Ensure profile directory exists
    await fs.ensureDir(profileHome);
    
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
    
    try {
      const result = await execAsync(fullCommand, {
        cwd: options.cwd || profileHome,
        timeout: options.timeout || 30000,
        env: {
          ...process.env,
          HERMES_HOME: profileHome
        }
      });
      
      return {
        success: true,
        output: result.stdout,
        error: result.stderr
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
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
      const profileName = `user-${userId}`;
      const command: HermesCommand = {
        command: 'profile',
        subcommand: 'create',
        args: [profileName],
        flags: {
          clone: options.clone || false,
          'clone-all': options.cloneAll || false,
          ...(options.cloneFrom && { 'clone-from': options.cloneFrom })
        }
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        const profile = await this.getProfile(userId);
        return { success: true, profile: profile || undefined };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: `Profile creation failed: ${error}` };
    }
  }

  async getProfile(userId: string): Promise<HermesProfile | null> {
    try {
      const profileName = `user-${userId}`;
      const hermesHome = path.join(this.profilesDir, profileName);
      
      const profile: HermesProfile = {
        userId,
        profileName,
        hermesHome,
        configPath: path.join(hermesHome, 'config.yaml'),
        envPath: path.join(hermesHome, '.env'),
        soulPath: path.join(hermesHome, 'SOUL.md'),
        status: await fs.pathExists(hermesHome) ? 'active' : 'inactive'
      };
      
      return profile;
    } catch (error) {
      return null;
    }
  }

  async deleteProfile(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const profileName = `user-${userId}`;
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
    
    // Fallback to direct AI API
    console.log(`[Hermes] Using direct AI API fallback`);
    yield* this.streamDirectAIResponse(message, options);
  }

  private async *streamDirectAIResponse(
    message: string,
    options: {
      model?: string;
      provider?: string;
    } = {}
  ): AsyncGenerator<string> {
    try {
      const model = options.model || AI_MODEL;
      const apiKey = AI_API_KEY;
      
      if (!apiKey) {
        yield "Error: AI API key not configured. Please set AI_API_KEY or OPENAI_API_KEY environment variable.";
        return;
      }

      // Prepare request to AI API
      const response = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant powered by ReAgent with Hermes integration.'
            },
            {
              role: 'user',
              content: message
            }
          ],
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
    const profileName = `user-${userId}`;
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
          HERMES_HOME: profileHome
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
        const lines = buffer.split('\n').filter(line => line.trim());
        let response = '';
        
        for (const line of lines) {
          // Skip CLI metadata
          if (this.isMetadataLine(line)) continue;
          response += line + ' ';
        }
        
        if (response.trim()) {
          hasOutput = true;
          const words = response.trim().split(' ');
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
      /Hermes Agent/,
      /Project:/,
      /Python:/,
      /OpenAI SDK:/,
      /Up to date/,
      /Loading/,
      /Initializing/,
      /^\[/,
      />>>/,
      /<<</
    ];
    
    return metadataPatterns.some(pattern => pattern.test(line));
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
      const command: HermesCommand = {
        command: 'skills',
        subcommand: 'list'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseSkillsList(result.output);
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  private parseSkillsList(output: string): HermesSkill[] {
    const skills: HermesSkill[] = [];
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Parse skill line format
      if (line.includes('✓') || line.includes('✗')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          skills.push({
            name: parts[1],
            source: 'installed',
            description: parts.slice(2).join(' '),
            installed: line.includes('✓'),
            enabled: line.includes('✓')
          });
        }
      }
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
      const command: HermesCommand = {
        command: 'gateway',
        subcommand: 'status'
      };

      const result = await this.executeHermesCommand(userId, command);
      
      if (result.success) {
        return this.parseGatewayStatus(result.output);
      }
      
      return {
        status: 'stopped',
        platforms: {}
      };
    } catch (error) {
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
      if (line.includes('Gateway:') && line.includes('running')) {
        gateway.status = 'running';
      }
      
      if (line.includes('Telegram:')) {
        gateway.platforms.telegram = {
          status: line.includes('connected') ? 'connected' : 'disconnected'
        };
      }
      
      if (line.includes('Discord:')) {
        gateway.platforms.discord = {
          status: line.includes('connected') ? 'connected' : 'disconnected'
        };
      }
      
      if (line.includes('WhatsApp:')) {
        gateway.platforms.whatsapp = {
          status: line.includes('connected') ? 'connected' : 'disconnected',
          paired: line.includes('paired')
        };
      }
    }
    
    return gateway;
  }

  async startGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'gateway',
        subcommand: 'start'
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Gateway start failed: ${error}` };
    }
  }

  async stopGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'gateway',
        subcommand: 'stop'
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Gateway stop failed: ${error}` };
    }
  }

  async setupGateway(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'gateway',
        subcommand: 'setup'
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
      return { success: false, error: `Gateway setup failed: ${error}` };
    }
  }

  /**
   * Platform-specific setup
   */
  async setupTelegram(userId: string, botToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Set bot token in config
      const setTokenResult = await this.setConfig(userId, 'telegram.bot_token', botToken);
      if (!setTokenResult.success) {
        return setTokenResult;
      }

      // Setup gateway
      return await this.setupGateway(userId);
    } catch (error) {
      return { success: false, error: `Telegram setup failed: ${error}` };
    }
  }

  async setupDiscord(userId: string, botToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Set bot token in config
      const setTokenResult = await this.setConfig(userId, 'discord.bot_token', botToken);
      if (!setTokenResult.success) {
        return setTokenResult;
      }

      // Setup gateway
      return await this.setupGateway(userId);
    } catch (error) {
      return { success: false, error: `Discord setup failed: ${error}` };
    }
  }

  async setupWhatsApp(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command: HermesCommand = {
        command: 'whatsapp'
      };

      const result = await this.executeHermesCommand(userId, command);
      return { success: result.success, error: result.error };
    } catch (error) {
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