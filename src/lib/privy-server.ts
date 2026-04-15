import { PrivyClient } from '@privy-io/node';

// Initialize Privy client for server-side operations
const privyClient = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  appSecret: process.env.PRIVY_APP_SECRET || '',
});

/**
 * Get authenticated user from request
 * 
 * TODO: Implement proper server-side authentication with Privy
 * For now, use client-side authentication with usePrivy hook
 */
export async function getPrivyUser(request: Request) {
  // Temporary: Return null, use client-side auth for now
  return null;
}

/**
 * Get user's wallet address
 * Returns the first wallet address or embedded wallet
 */
export function getUserWalletAddress(user: any): string | null {
  if (!user) return null;

  // Try to get wallet from linked accounts
  const wallet = user.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' || account.type === 'smart_wallet'
  );

  return wallet?.address || null;
}

/**
 * Check if user has embedded wallet
 */
export function hasEmbeddedWallet(user: any): boolean {
  if (!user) return false;

  return user.linkedAccounts?.some(
    (account: any) => account.type === 'smart_wallet'
  ) || false;
}

/**
 * Get user's email
 */
export function getUserEmail(user: any): string | null {
  if (!user) return null;

  const emailAccount = user.linkedAccounts?.find(
    (account: any) => account.type === 'email'
  );

  return emailAccount?.address || null;
}

export { privyClient };
