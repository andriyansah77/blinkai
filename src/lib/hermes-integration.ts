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
   * Chat and Sessions
   */
  async sendChatMessage(
    userId: string,
    message: string,
    options: {
      model?: string;
      provider?: string;
      skills?: string[];
      toolsets?: string[];
      quiet?: boolean;
    } = {}
  ): Promise<AsyncGenerator<string>> {
    const command: HermesCommand = {
      command: 'chat',
      flags: {
        query: message,
        model: options.model,
        provider: options.provider,
        skills: options.skills?.join(','),
        toolsets: options.toolsets?.join(','),
        quiet: options.quiet || true
      }
    };

    return this.streamHermesResponse(userId, command);
  }

  private async *streamHermesResponse(userId: string, command: HermesCommand): AsyncGenerator<string> {
    const profileName = `user-${userId}`;
    const profileHome = path.join(this.profilesDir, profileName);
    
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
      
      for await (const chunk of hermesProcess.stdout) {
        buffer += chunk.toString();
      }

      await new Promise((resolve) => {
        hermesProcess.on('close', resolve);
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
          const words = response.trim().split(' ');
          for (let i = 0; i < words.length; i++) {
            yield words[i] + (i < words.length - 1 ? ' ' : '');
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      }
    } catch (error) {
      yield `Error: ${error}`;
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
          source: options.source,
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
          skill: options.skills?.join(',')
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