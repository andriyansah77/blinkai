/**
 * Utility to ensure Hermes profile exists for a user
 * This is called on various entry points to guarantee user isolation
 */

import { hermesIntegration } from './hermes-integration';

const profileCheckCache = new Map<string, { checked: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Ensure a Hermes profile exists for the given user
 * Uses caching to avoid repeated checks
 */
export async function ensureHermesProfile(userId: string): Promise<{
  success: boolean;
  profile?: any;
  error?: string;
  created?: boolean;
}> {
  try {
    // Check cache first
    const cached = profileCheckCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return { success: true, created: false };
    }

    console.log(`[EnsureProfile] Checking profile for user ${userId}`);

    // Check if profile exists
    const profile = await hermesIntegration.getProfile(userId);

    if (profile && profile.status === 'active') {
      console.log(`[EnsureProfile] Profile already exists for user ${userId}`);
      
      // Update cache
      profileCheckCache.set(userId, { checked: true, timestamp: Date.now() });
      
      return { success: true, profile, created: false };
    }

    // Profile doesn't exist or is inactive, create it
    console.log(`[EnsureProfile] Creating profile for user ${userId}`);
    const createResult = await hermesIntegration.createProfile(userId);

    if (createResult.success) {
      console.log(`✅ [EnsureProfile] Profile created successfully for user ${userId}`);
      
      // Update cache
      profileCheckCache.set(userId, { checked: true, timestamp: Date.now() });
      
      return { 
        success: true, 
        profile: createResult.profile, 
        created: true 
      };
    } else {
      console.error(`❌ [EnsureProfile] Failed to create profile for user ${userId}:`, createResult.error);
      return { 
        success: false, 
        error: createResult.error,
        created: false
      };
    }
  } catch (error) {
    console.error(`[EnsureProfile] Exception for user ${userId}:`, error);
    return { 
      success: false, 
      error: `Profile check failed: ${error}`,
      created: false
    };
  }
}

/**
 * Clear cache for a specific user (useful after profile deletion)
 */
export function clearProfileCache(userId: string) {
  profileCheckCache.delete(userId);
}

/**
 * Clear all profile cache (useful for testing)
 */
export function clearAllProfileCache() {
  profileCheckCache.clear();
}
