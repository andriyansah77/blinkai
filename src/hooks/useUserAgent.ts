import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  provider: string;
  skills: number;
  sessions: number;
  memories: number;
  learningEnabled: boolean;
  createdAt: string;
}

export function useUserAgent() {
  const { data: session, status } = useSession();
  const [agent, setAgent] = useState<UserAgent | null>(null);
  const [hasAgent, setHasAgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserAgent();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchUserAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/agent');
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent');
      }
      
      const data = await response.json();
      setAgent(data.agent);
      setHasAgent(data.hasAgent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAgent(null);
      setHasAgent(false);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (status === 'authenticated') {
      fetchUserAgent();
    }
  };

  return {
    agent,
    hasAgent,
    loading,
    error,
    refetch
  };
}