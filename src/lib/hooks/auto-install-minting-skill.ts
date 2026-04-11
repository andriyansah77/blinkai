/**
 * Auto-Install Minting Skill Hook
 * 
 * This hook automatically installs the ReAgent Minting Skill
 * when a new user registers or creates their first agent.
 * 
 * The skill is marked as proprietary and cannot be uninstalled.
 */

import { prisma } from '@/lib/prisma';
import { MINTING_SKILL_METADATA } from '@/lib/skills/minting-skill';

export interface SkillInstallResult {
  success: boolean;
  skillId?: string;
  error?: string;
}

/**
 * Auto-install Minting Skill for a user
 * Called during user registration or first agent creation
 */
export async function autoInstallMintingSkill(userId: string): Promise<SkillInstallResult> {
  try {
    // Check if user already has the minting skill
    const existingSkill = await prisma.hermesSkill.findFirst({
      where: {
        agent: {
          userId
        },
        name: MINTING_SKILL_METADATA.name
      }
    });

    if (existingSkill) {
      console.log(`Minting skill already installed for user ${userId}`);
      return {
        success: true,
        skillId: existingSkill.id
      };
    }

    // Get user's agent
    const agent = await prisma.hermesAgent.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!agent) {
      return {
        success: false,
        error: 'No agent found for user'
      };
    }

    // Create minting skill
    const skill = await prisma.hermesSkill.create({
      data: {
        agentId: agent.id,
        name: MINTING_SKILL_METADATA.name,
        description: MINTING_SKILL_METADATA.description,
        code: '// Minting skill - integrated with platform',
        category: MINTING_SKILL_METADATA.category,
        tags: JSON.stringify(['mining', 'blockchain', 'reagent', 'proprietary']),
        status: 'active',
        usage: 0,
        rating: 5.0
      }
    });

    console.log(`Minting skill installed for user ${userId}: ${skill.id}`);

    return {
      success: true,
      skillId: skill.id
    };

  } catch (error: any) {
    console.error('Failed to auto-install minting skill:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Prevent uninstallation of proprietary skills
 * Called before skill uninstallation
 */
export async function preventProprietarySkillUninstall(skillId: string): Promise<boolean> {
  try {
    const skill = await prisma.hermesSkill.findUnique({
      where: { id: skillId },
      select: {
        name: true,
        tags: true
      }
    });

    if (!skill) {
      return false; // Skill not found, allow deletion
    }

    // Check if skill is proprietary by tags
    const tags = JSON.parse(skill.tags || '[]');
    if (tags.includes('proprietary')) {
      console.log(`Prevented uninstallation of proprietary skill: ${skill.name}`);
      return true; // Prevent uninstallation
    }

    // Check if it's the minting skill by name
    if (skill.name === MINTING_SKILL_METADATA.name) {
      console.log(`Prevented uninstallation of minting skill: ${skill.name}`);
      return true; // Prevent uninstallation
    }

    return false; // Allow uninstallation

  } catch (error) {
    console.error('Error checking skill uninstall permission:', error);
    return false; // Allow uninstallation on error (fail-open)
  }
}

/**
 * Ensure minting skill is installed for all existing users
 * Migration function to be run once
 */
export async function ensureMintingSkillForAllUsers(): Promise<{
  success: boolean;
  installed: number;
  skipped: number;
  errors: number;
}> {
  const results = {
    success: true,
    installed: 0,
    skipped: 0,
    errors: 0
  };

  try {
    // Get all users with agents
    const users = await prisma.user.findMany({
      where: {
        hermesAgents: {
          some: {}
        }
      },
      select: {
        id: true
      }
    });

    console.log(`Ensuring minting skill for ${users.length} users...`);

    for (const user of users) {
      const result = await autoInstallMintingSkill(user.id);
      
      if (result.success) {
        if (result.skillId) {
          results.installed++;
        } else {
          results.skipped++;
        }
      } else {
        results.errors++;
        console.error(`Failed to install skill for user ${user.id}:`, result.error);
      }
    }

    console.log(`Minting skill installation complete:`, results);

    return results;

  } catch (error) {
    console.error('Failed to ensure minting skill for all users:', error);
    return {
      ...results,
      success: false
    };
  }
}
