'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Coins, 
  Wallet, 
  Loader2, 
  Copy, 
  CheckCircle, 
  ExternalLink,
  AlertCircle,
  Zap,
  TrendingUp,
  Activity,
  DollarSign,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Tempo Network Configuration
const TEMPO_NETWORK = {
  chainId: '0x1079', // 4217 in hex
  chainName: 'Tempo Network',
  nativeCurrency: {
    name: 'PATH',
    symbol: 'PATH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.tempo.xyz'],
  blockExplorerUrls: ['https://explore.tempo.xyz'],
};

interface WalletState {
  address: string | null;
  balance: string;
  reagentBalance: string;
  pathUsdBalance: string;
  connected: boolean;
}

interface MiningStats {
  totalInscriptions: number;
  totalSupplyMinted: string;
  remainingAllocation: string;
  allocationPercentage: number;
  inscriptions24h: number;
  uniqueUsers: number;
}

export default function MiningWebPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: '0',
    reagentBalance: '0',
    pathUsdBalance: '0',
    connected: false,
  });
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [repeat, setRepeat] = useState('1');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [walletLinked, setWalletLinked] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    fetchStats();
    if (session) {
      fetchUserStatus();
    }
  }, [session]);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch('/api/mining/status');
      if (response.ok) {
        const data = await response.json();
        setUserStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // Get PATH balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest'],
          });
          const balanceInEth = parseInt(balance, 16) / 1e18;
          
          // Get token balances
          const tokenBalances = await fetchTokenBalances(address);
          
          setWallet({
            address,
            balance: balanceInEth.toFixed(4),
            reagentBalance: tokenBalances.reagent,
            pathUsdBalance: '0',
            connected: true,
          });

          // Link wallet to user account if signed in
          if (session && !walletLinked) {
            try {
              const linkResponse = await fetch('/api/mining/wallet/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
              });
              
              if (linkResponse.ok) {
                setWalletLinked(true);
                console.log('Wallet linked to account');
              }
            } catch (linkError) {
              console.error('Failed to link wallet:', linkError);
            }
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/mining/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTokenBalances = async (address: string) => {
    if (typeof window.ethereum === 'undefined') {
      return { reagent: '0' };
    }
    
    try {
      // REAGENT token address (6 decimals)
      const REAGENT_TOKEN = '0x20C000000000000000000000a59277C0c1d65Bc5';
      
      // ERC20 balanceOf function signature
      const balanceOfData = '0x70a08231' + address.slice(2).padStart(64, '0');
      
      // Get REAGENT balance
      const reagentBalanceHex = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: REAGENT_TOKEN,
          data: balanceOfData,
        }, 'latest'],
      });
      
      // Convert from hex and adjust for 6 decimals
      const reagentBalance = parseInt(reagentBalanceHex, 16) / 1e6;
      
      return {
        reagent: reagentBalance.toFixed(2),
      };
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return {
        reagent: '0',
      };
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      setConnecting(true);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = accounts[0];

      // Check if we're on Tempo Network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== TEMPO_NETWORK.chainId) {
        // Try to switch to Tempo Network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: TEMPO_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [TEMPO_NETWORK],
              });
            } catch (addError) {
              toast.error('Failed to add Tempo Network');
              setConnecting(false);
              return;
            }
          } else {
            toast.error('Failed to switch to Tempo Network');
            setConnecting(false);
            return;
          }
        }
      }

      // Get PATH balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const balanceInEth = parseInt(balance, 16) / 1e18;

      // Get token balances
      const tokenBalances = await fetchTokenBalances(address);

      setWallet({
        address,
        balance: balanceInEth.toFixed(4),
        reagentBalance: tokenBalances.reagent,
        pathUsdBalance: '0', // This would need to be fetched from pathUSD contract
        connected: true,
      });

      // Link wallet to user account if signed in
      if (session) {
        try {
          const linkResponse = await fetch('/api/mining/wallet/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });
          
          if (linkResponse.ok) {
            setWalletLinked(true);
            console.log('Wallet linked successfully');
            // Refresh user status after linking
            fetchUserStatus();
          }
        } catch (linkError) {
          console.error('Failed to link wallet:', linkError);
          // Don't show error to user - wallet still works
        }
      }

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      balance: '0',
      reagentBalance: '0',
      pathUsdBalance: '0',
      connected: false,
    });
    toast.success('Wallet disconnected');
  };

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEstimate = async () => {
    if (!repeat || parseInt(repeat) <= 0 || parseInt(repeat) > 50) {
      setError('Please enter a valid number of mints (1-50)');
      return;
    }

    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    setEstimating(true);
    setError('');
    setGasEstimate(null);

    try {
      // Use GET method with query params
      const response = await fetch('/api/mining/estimate?type=manual', {
        method: 'GET',
      });

      const data = await response.json();
      if (!data.success || data.error) {
        setError(data.error?.message || 'Failed to estimate gas');
      } else {
        setGasEstimate({
          protocolFee: data.estimate.inscriptionFee + ' pathUSD',
          gasEstimate: data.estimate.estimatedGas + ' PATH',
          totalFee: data.estimate.totalCost + ' pathUSD',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to estimate gas');
    } finally {
      setEstimating(false);
    }
  };

  const handleInscribe = async () => {
    if (!repeat || parseInt(repeat) <= 0 || parseInt(repeat) > 50) {
      setError('Please enter a valid number of mints (1-50)');
      return;
    }

    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Step 1: Call inscribe API to get unsigned transaction
      const response = await fetch('/api/mining/inscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirm: true
        }),
      });

      const data = await response.json();
      
      // Log for debugging
      console.log('Inscribe response:', { status: response.status, data });
      
      // Handle different error cases
      if (response.status === 401) {
        setError('Please sign in to your ReAgent account first');
        toast.error('Authentication required. Please sign in.');
        setTimeout(() => {
          window.location.href = '/sign-in?callbackUrl=/mining-web';
        }, 2000);
        return;
      }
      
      if (response.status === 400 && !data.requiresClientSigning) {
        const errorMsg = data.error?.message || data.error?.code || JSON.stringify(data.error) || 'Bad request';
        console.error('400 Error details:', data.error);
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      // Step 2: Check if client-side signing is required
      if (data.requiresClientSigning && data.unsignedTransaction) {
        toast.loading('Please sign the transaction in MetaMask...');
        
        try {
          // Step 3: Request user to sign transaction with MetaMask
          if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not found');
          }
          
          const tx = data.unsignedTransaction;
          
          const signedTx = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              from: tx.from,
              to: tx.to,
              data: tx.data,
              value: tx.value || '0x0',
              gas: tx.gasLimit ? `0x${parseInt(tx.gasLimit).toString(16)}` : undefined,
              gasPrice: tx.gasPrice ? `0x${parseInt(tx.gasPrice).toString(16)}` : undefined,
            }],
          });

          console.log('Transaction signed:', signedTx);
          toast.success('Transaction submitted!');

          // Transaction hash is returned directly from eth_sendTransaction
          setResult({
            amount: '10000',
            txHash: signedTx,
            gasPaid: '~0.0001',
            explorerUrl: `https://explore.tempo.xyz/tx/${signedTx}`,
          });
          
          toast.success('Successfully minted 10,000 REAGENT!');
          
          // Refresh balances
          await checkConnection();
          
        } catch (signError: any) {
          console.error('Signing error:', signError);
          if (signError.code === 4001) {
            setError('Transaction rejected by user');
            toast.error('You rejected the transaction');
          } else {
            setError(`Failed to sign transaction: ${signError.message}`);
            toast.error('Failed to sign transaction');
          }
        }
        return;
      }
      
      // For managed wallets (server-side signing)
      if (!data.success || data.error) {
        const errorMsg = data.error?.message || data.error || 'Minting failed';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        setResult({
          amount: data.tokensEarned || '10000',
          txHash: data.txHash,
          gasPaid: data.feePaid || '0.0001',
          explorerUrl: `https://explore.tempo.xyz/tx/${data.txHash}`,
        });
        toast.success(`Successfully minted ${data.tokensEarned || '10,000'} REAGENT!`);
        // Refresh balances
        await checkConnection();
      }
    } catch (err: any) {
      console.error('Inscribe error:', err);
      const errorMsg = err.message || 'Failed to inscribe';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-foreground text-xl font-bold">REAGENT MINING</h1>
                  <p className="text-muted-foreground text-sm">Tempo Network Inscriptions</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Session Status */}
              {status === 'loading' ? (
                <div className="text-muted-foreground text-sm">Loading...</div>
              ) : status === 'unauthenticated' ? (
                <button
                  onClick={() => router.push('/sign-in?callbackUrl=/mining-web')}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              ) : (
                <div className="hidden md:block text-right mr-4">
                  <p className="text-foreground text-sm font-medium">{session?.user?.name || session?.user?.email}</p>
                  <p className="text-muted-foreground text-xs">Signed in</p>
                </div>
              )}
              
              {/* Wallet Connection */}
              {wallet.connected ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-foreground text-sm font-medium">
                      {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </p>
                    <p className="text-muted-foreground text-xs">{wallet.balance} PATH</p>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg transition-all font-medium"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Wallet Info Cards */}
          {wallet.connected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <h3 className="text-muted-foreground text-sm mb-1">Wallet Address</h3>
                <p className="text-lg font-mono text-foreground truncate">
                  {wallet.address?.slice(0, 10)}...{wallet.address?.slice(-8)}
                </p>
                <p className="text-muted-foreground text-xs mt-2">Tempo Network</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-muted-foreground text-sm mb-1">PATH Balance</h3>
                <p className="text-2xl font-bold text-foreground">{wallet.balance}</p>
                <p className="text-muted-foreground text-xs mt-2">Native token</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-muted-foreground text-sm mb-1">REAGENT Balance</h3>
                <p className="text-2xl font-bold text-foreground">{wallet.reagentBalance}</p>
                <p className="text-muted-foreground text-xs mt-2">TIP-20 tokens</p>
              </motion.div>
            </div>
          )}

          {/* Connection Warning */}
          {!wallet.connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-foreground text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your Web3 wallet to start minting REAGENT tokens on Tempo Network
              </p>
              
              {status === 'unauthenticated' && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-start gap-2 text-left">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-orange-400 font-medium mb-1">Sign In Required</p>
                      <p className="text-orange-400/80 text-sm">
                        You need to sign in to your ReAgent account before minting tokens.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {status === 'unauthenticated' && (
                  <button
                    onClick={() => router.push('/sign-in?callbackUrl=/mining-web')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-all font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In First
                  </button>
                )}
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg transition-all font-medium"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* User Status Info - Show if wallet connected and ready */}
          {wallet.connected && session && userStatus && userStatus.canMint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Ready to Mint!</h3>
                  <p className="text-green-400/90 text-sm mb-2">
                    Your MetaMask wallet is connected and ready. When you click Mint, you'll be asked to sign the transaction in MetaMask.
                  </p>
                  <p className="text-green-400/80 text-xs">
                    💡 Gas fees will be paid directly from your wallet in PATH tokens.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Minting Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wallet.connected ? 0.3 : 0.1 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Minting Section */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-foreground text-lg font-semibold">INSCRIPTION</h2>
                <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-lg">
                  <span className="text-primary font-mono text-sm">$REAGENT</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Number of Mints Input */}
                <div>
                  <label className="block text-muted-foreground text-sm font-medium mb-2">
                    NUMBER OF MINTS (1 - 50)
                  </label>
                  <input
                    type="number"
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    min="1"
                    max="50"
                    placeholder="1"
                    disabled={!wallet.connected}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                  />
                  <p className="text-muted-foreground text-xs mt-2">
                    Each mint creates 10,000 REAGENT tokens · {stats ? `${(parseInt(stats.remainingAllocation) / 1000000).toFixed(1)}M remaining` : 'Loading...'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Inscription Data Preview */}
            <div className="p-6 bg-background/50 border-b border-border">
              <h3 className="text-foreground text-sm font-semibold mb-3">TEMPO INSCRIPTIONS</h3>
              <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm">
                <pre className="text-muted-foreground">
{`{
  "op": "mint",
  "tick": "REAGENT",
  "amt": "10000"
}`}
                </pre>
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                Fixed amount per mint: 10,000 REAGENT (6 decimals)
              </p>
            </div>

            {/* Fee Summary */}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Tokens</span>
                <span className="text-foreground font-medium">
                  {repeat} mints × 10,000 = {parseInt(repeat) * 10000} REAGENT
                </span>
              </div>
              
              {gasEstimate && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee (est.)</span>
                    <span className="text-foreground font-medium">{gasEstimate.gasEstimate || '~0.00021'} PATH</span>
                  </div>
                  <div className="h-px bg-border my-2"></div>
                </>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-foreground font-semibold">Gas Fee</span>
                <span className="text-foreground font-bold">
                  {gasEstimate ? gasEstimate.gasEstimate || '~0.00021 PATH' : 'Estimate first'}
                </span>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
                <p className="text-blue-400 text-xs">
                  💡 Gas fees will be paid directly from your connected MetaMask wallet in PATH tokens.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={handleEstimate}
                  disabled={estimating || loading || !wallet.connected}
                  className="px-6 py-3 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {estimating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    'Estimate Gas'
                  )}
                </button>
                <button
                  onClick={handleInscribe}
                  disabled={loading || estimating || !wallet.connected}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Mint
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className="p-6 bg-green-500/10 border-t border-green-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-400 font-semibold mb-2">✓ Inscription Successful!</h3>
                    <p className="text-foreground text-lg font-bold mb-2">{result.amount} REAGENT</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Transaction Hash</span>
                        <span className="text-foreground font-mono text-xs">{result.txHash?.slice(0, 20)}...</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Gas Paid</span>
                        <span className="text-foreground">{result.gasPaid} PATH</span>
                      </div>
                    </div>
                    {result.explorerUrl && (
                      <a
                        href={result.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                      >
                        View on Explorer
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Global Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-foreground font-semibold text-lg">Global Statistics</h2>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {stats.totalInscriptions.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Mints</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {(parseInt(stats.totalSupplyMinted) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-muted-foreground text-sm">Tokens Minted</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {stats.uniqueUsers.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">Active Miners</p>
                </div>

                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {stats.allocationPercentage.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-sm">Minted</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
