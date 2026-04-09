/**
 * Auto-setup gateway for new users
 * This ensures every new user has a ready-to-use gateway service
 */

import { hermesIntegration } from './hermes-integration';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GatewaySetupResult {
  success: boolean;
  profileCreated: boolean;
  gatewayInstalled: boolean;
  gatewayStarted: boolean;
  error?: string;
}

/**
 * Complete gateway setup for a new user
 * 1. Create Hermes profile
 * 2. Install gateway service
 * 3. Start gateway service
 */
export async function setupUserGateway(userId: string): Promise<GatewaySetupResult> {
  const result: GatewaySetupResult = {
    success: false,
    profileCreated: false,
    gatewayInstalled: false,
    gatewayStarted: false,
  };

  try {
    console.log(`[GatewaySetup] Starting setup for user ${userId}`);

    // Step 1: Create profile
    console.log(`[GatewaySetup] Creating profile for user ${userId}`);
    const profileResult = await hermesIntegration.createProfile(userId);

    if (!profileResult.success) {
      result.error = `Profile creation failed: ${profileResult.error}`;
      console.error(`[GatewaySetup] ${result.error}`);
      return result;
    }

    result.profileCreated = true;
    console.log(`[GatewaySetup] ✅ Profile created for user ${userId}`);

    // Step 2: Install gateway service
    const profileName = `user-${userId}`;
    console.log(`[GatewaySetup] Installing gateway service for profile ${profileName}`);

    try {
      await execAsync(
        `/root/.local/bin/hermes --profile ${profileName} gateway install`,
        { timeout: 30000 }
      );

      result.gatewayInstalled = true;
      console.log(`[GatewaySetup] ✅ Gateway service installed for user ${userId}`);
    } catch (installError: any) {
      // Check if already installed
      if (installError.message?.includes('already exists') || 
          installError.message?.includes('already installed')) {
        result.gatewayInstalled = true;
        console.log(`[GatewaySetup] Gateway service already installed for user ${userId}`);
      } else {
        result.error = `Gateway installation failed: ${installError.message}`;
        console.error(`[GatewaySetup] ${result.error}`);
        return result;
      }
    }

    // Step 3: Start gateway service
    console.log(`[GatewaySetup] Starting gateway service for user ${userId}`);

    try {
      await execAsync(
        `/root/.local/bin/hermes --profile ${profileName} gateway start`,
        { timeout: 10000 }
      );

      result.gatewayStarted = true;
      console.log(`[GatewaySetup] ✅ Gateway service started for user ${userId}`);
    } catch (startError: any) {
      // Check if already running
      if (startError.message?.includes('already running') || 
          startError.message?.includes('active')) {
        result.gatewayStarted = true;
        console.log(`[GatewaySetup] Gateway service already running for user ${userId}`);
      } else {
        result.error = `Gateway start failed: ${startError.message}`;
        console.error(`[GatewaySetup] ${result.error}`);
        return result;
      }
    }

    // All steps completed
    result.success = true;
    console.log(`[GatewaySetup] 🎉 Complete setup for user ${userId}`);
    console.log(`[GatewaySetup] - Profile: ✅ Created`);
    console.log(`[GatewaySetup] - Gateway: ✅ Installed`);
    console.log(`[GatewaySetup] - Service: ✅ Running`);

    return result;
  } catch (error) {
    result.error = `Setup exception: ${error}`;
    console.error(`[GatewaySetup] Exception for user ${userId}:`, error);
    return result;
  }
}

/**
 * Check if user gateway is ready
 */
export async function isGatewayReady(userId: string): Promise<boolean> {
  try {
    const profileName = `user-${userId}`;
    const { stdout } = await execAsync(
      `/root/.local/bin/hermes --profile ${profileName} gateway status`,
      { timeout: 5000 }
    );

    return stdout.includes('active') && stdout.includes('running');
  } catch (error) {
    return false;
  }
}

/**
 * Get gateway setup status for a user
 */
export async function getGatewaySetupStatus(userId: string): Promise<{
  profileExists: boolean;
  gatewayInstalled: boolean;
  gatewayRunning: boolean;
}> {
  const status = {
    profileExists: false,
    gatewayInstalled: false,
    gatewayRunning: false,
  };

  try {
    // Check profile
    const profile = await hermesIntegration.getProfile(userId);
    status.profileExists = profile?.status === 'active';

    if (status.profileExists) {
      // Check gateway
      const isReady = await isGatewayReady(userId);
      status.gatewayInstalled = true; // If profile exists, gateway should be installed
      status.gatewayRunning = isReady;
    }
  } catch (error) {
    console.error(`[GatewaySetup] Error checking status for user ${userId}:`, error);
  }

  return status;
}
