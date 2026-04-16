/**
 * API Client with Privy Authentication
 * Automatically adds Privy access token to requests
 */

import { usePrivy } from '@privy-io/react-auth';
import { useCallback } from 'react';

/**
 * Get authenticated fetch function with Privy token
 * Use this in client components to make authenticated API calls
 */
export function useAuthenticatedFetch() {
  const { getAccessToken } = usePrivy();

  return useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getAccessToken();
    
    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }, [getAccessToken]);
}

/**
 * Helper function to make authenticated API calls
 * Can be used directly in client components
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  getAccessToken: () => Promise<string | null>
) {
  const token = await getAccessToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Global fetch interceptor
 * Automatically adds Privy token to all /api/* requests
 */
let globalGetAccessToken: (() => Promise<string | null>) | null = null;

export function setGlobalAccessTokenGetter(getter: () => Promise<string | null>) {
  globalGetAccessToken = getter;
}

// Override global fetch for /api/* requests
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Only intercept /api/* requests
    if (url.startsWith('/api/') && globalGetAccessToken) {
      try {
        const token = await globalGetAccessToken();
        
        if (token) {
          const headers = new Headers(init?.headers);
          headers.set('Authorization', `Bearer ${token}`);
          
          return originalFetch(input, {
            ...init,
            headers,
          });
        }
      } catch (error) {
        console.error('Failed to add auth token:', error);
      }
    }
    
    return originalFetch(input, init);
  };
}
