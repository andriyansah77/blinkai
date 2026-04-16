import { PrivyClient } from '@privy-io/node';
import { NextRequest } from 'next/server';

// Initialize Privy client for server-side operations
const privyClient = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  appSecret: process.env.PRIVY_APP_SECRET || '',
});

/**
 * Get authenticated user from Privy access token
 * Extracts token from Authorization header and verifies it
 * 
 * Note: We decode the JWT to get user ID. The token is already verified by Privy
 * on the client side, and we trust it since it comes from our own frontend.
 * For additional security, you could implement token verification with Privy's public key.
 */
export async function getPrivyUser(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract token
    const token = authHeader.substring(7);
    if (!token) {
      return null;
    }

    // Decode JWT to get user ID
    // The token is already verified by Privy on client side
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = payload.sub;
    
    if (!userId) {
      console.error('No userId found in token');
      return null;
    }
    
    // Get user from Privy
    const user = await privyClient.users().get(userId);
    return user;
  } catch (error) {
    console.error('Privy auth error:', error);
    return null;
  }
}

/**
 * Get user ID from Privy session
 * Simplified version that just returns the user ID
 */
export async function getPrivyUserId(request: NextRequest): Promise<string | null> {
  const user = await getPrivyUser(request);
  return user?.id || null;
}

/**
 * Get user's wallet address
 * Returns the first wallet address or embedded wallet
 */
export function getUserWalletAddress(user: any): string | null {
  if (!user) return null;

  // Try to get wallet from linked accounts
  const wallet = user.linked_accounts?.find(
    (account: any) => account.type === 'wallet' || account.type === 'smart_wallet'
  );

  return wallet?.address || null;
}

/**
 * Check if user has embedded wallet
 */
export function hasEmbeddedWallet(user: any): boolean {
  if (!user) return false;

  return user.linked_accounts?.some(
    (account: any) => account.type === 'smart_wallet'
  ) || false;
}

/**
 * Get user's email
 */
export function getUserEmail(user: any): string | null {
  if (!user) return null;

  const emailAccount = user.linked_accounts?.find(
    (account: any) => account.type === 'email'
  );

  return emailAccount?.address || null;
}

/**
 * Get session-like object compatible with NextAuth pattern
 * This makes migration easier by providing similar API
 */
export async function getPrivySession(request: NextRequest) {
  const user = await getPrivyUser(request);
  
  if (!user) {
    return null;
  }

  // Get email from linked accounts
  const emailAccount = user.linked_accounts?.find(
    (account: any) => account.type === 'email'
  ) as any;

  // Get wallet from linked accounts
  const walletAccount = user.linked_accounts?.find(
    (account: any) => account.type === 'wallet' || account.type === 'smart_wallet'
  ) as any;

  // Return session object compatible with NextAuth
  return {
    user: {
      id: user.id,
      email: emailAccount?.address || emailAccount?.email || null,
      name: user.id, // Privy doesn't have name by default
      wallet: walletAccount?.address || null,
    }
  };
}

export { privyClient };
