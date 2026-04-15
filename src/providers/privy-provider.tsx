'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { createConfig } from '@privy-io/wagmi';

// Tempo Network configuration
const tempoNetwork = {
  id: 4217,
  name: 'Tempo Network',
  network: 'tempo',
  nativeCurrency: {
    decimals: 18,
    name: 'PATH',
    symbol: 'PATH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.tempo.xyz'] },
    public: { http: ['https://rpc.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' },
  },
  testnet: false,
} as const;

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [tempoNetwork],
  transports: {
    [tempoNetwork.id]: http(),
  },
});

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord'],
        appearance: {
          theme: 'dark',
          accentColor: '#f97316', // Orange-500
          logo: '/logo.jpg',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: tempoNetwork,
        supportedChains: [tempoNetwork],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
