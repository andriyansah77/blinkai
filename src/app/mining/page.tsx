"use client";

import { useEffect, useState, useCallback, Component, ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wallet,
  Copy,
  CheckCircle,
  Coins,
  TrendingUp,
  Zap,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  DollarSign,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { MintingHistory } from "@/components/mining/MintingHistory";
import { DepositInstructions } from "@/components/mining/DepositInstructions";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Mining page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              We encountered an error loading the mining dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface WalletData {
  address: string;
  reagentBalance: number;
  pathusdBalance: number;
  usdBalance: number;
  isNewWallet?: boolean;
  needsSetup?: boolean;
}

interface MiningStats {
  totalInscriptions: number;
  totalSupplyMinted: string;
  remainingAllocation: string;
  allocationPercentage: number;
  inscriptions24h: number;
  uniqueUsers: number;
  typeBreakdown: {
    auto: number;
    manual: number;
    autoPercentage: string;
    manualPercentage: string;
  };
}

function MiningPageContent() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch wallet data
      try {
        const walletRes = await fetch("/api/wallet");
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          
          // Validate balance data before setting state
          if (walletData) {
            const validatedData = {
              ...walletData,
              pathusdBalance: isNaN(walletData.pathusdBalance) || !isFinite(walletData.pathusdBalance) 
                ? 0 
                : walletData.pathusdBalance,
              reagentBalance: isNaN(walletData.reagentBalance) || !isFinite(walletData.reagentBalance) 
                ? 0 
                : walletData.reagentBalance,
            };
            setWallet(validatedData);
          }
        } else if (walletRes.status === 404) {
          // Wallet not found - redirect to onboarding
          router.push('/onboarding');
          return;
        } else {
          // Other errors - show error but don't crash
          console.error('Failed to fetch wallet:', walletRes.status);
          toast.error('Failed to load wallet data. Please refresh the page.');
        }
      } catch (walletError) {
        console.error('Wallet fetch error:', walletError);
        toast.error('Failed to load wallet data. Please check your connection.');
      }

      // Fetch mining stats
      try {
        const statsRes = await fetch("/api/mining/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        } else {
          console.error('Failed to fetch stats:', statsRes.status);
          // Don't show error for stats - it's not critical
        }
      } catch (statsError) {
        console.error('Stats fetch error:', statsError);
        // Don't show error for stats - it's not critical
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch mining data:", error);
      toast.error("Failed to load mining data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/sign-in");
    } else if (authenticated) {
      fetchData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [ready, authenticated, router, fetchData]);

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMintNow = async () => {
    try {
      setMinting(true);
      
      const response = await fetch("/api/mining/inscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully minted ${data.tokensEarned} REAGENT!`);
        fetchData(); // Refresh data
      } else {
        toast.error(data.error?.message || "Minting failed");
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Failed to mint tokens");
    } finally {
      setMinting(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading mining dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="h-full bg-background overflow-auto">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Mining Dashboard</h1>
            <p className="text-muted-foreground">
              Mint REAGENT tokens on Tempo Network
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Wallet & Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* USD Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">PATHUSD Balance</h3>
            <p className="text-3xl font-bold text-foreground mb-2">
              {(() => {
                try {
                  const balance = typeof wallet?.pathusdBalance === 'number' 
                    ? wallet.pathusdBalance 
                    : parseFloat(wallet?.pathusdBalance || '0');
                  
                  if (isNaN(balance) || !isFinite(balance)) {
                    return '0.00';
                  }
                  
                  return Number(balance.toFixed(4)).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 4 
                  });
                } catch (error) {
                  console.error('Error formatting PATHUSD balance:', error);
                  return '0.00';
                }
              })()}
            </p>
            <p className="text-muted-foreground text-xs">Available for minting</p>
          </motion.div>

          {/* REAGENT Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">REAGENT Balance</h3>
            <p className="text-3xl font-bold text-foreground mb-2">
              {(() => {
                try {
                  const balance = typeof wallet?.reagentBalance === 'number' 
                    ? wallet.reagentBalance 
                    : parseFloat(wallet?.reagentBalance || '0');
                  
                  if (isNaN(balance) || !isFinite(balance)) {
                    return '0';
                  }
                  
                  return Number(balance.toFixed(2)).toLocaleString('en-US', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 2 
                  });
                } catch (error) {
                  console.error('Error formatting REAGENT balance:', error);
                  return '0';
                }
              })()}
            </p>
            <p className="text-muted-foreground text-xs">TIP-20 tokens</p>
          </motion.div>

          {/* Wallet Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm mb-1">Wallet Address</h3>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-mono text-foreground truncate flex-1">
                {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : "Not available"}
              </p>
              <button
                onClick={handleCopyAddress}
                disabled={!wallet?.address}
                className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-muted-foreground text-xs">Tempo Network</p>
          </motion.div>
        </div>

        {/* Minting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-foreground font-semibold text-lg mb-1">Mint REAGENT Tokens</h2>
              <p className="text-muted-foreground text-sm">
                Mint 10,000 REAGENT tokens per transaction
              </p>
            </div>
            <Zap className="w-6 h-6 text-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Auto Minting */}
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-foreground font-medium">Auto Minting</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="text-foreground font-medium">0.5 PATHUSD + gas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="text-foreground font-medium">10,000 REAGENT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="text-foreground font-medium">Via AI Agent</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Use your AI agent to mint tokens automatically
              </p>
            </div>

            {/* Manual Minting */}
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <h3 className="text-foreground font-medium">Manual Minting</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="text-foreground font-medium">1.0 PATHUSD + gas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="text-foreground font-medium">10,000 REAGENT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="text-foreground font-medium">Direct</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Mint tokens directly through the dashboard
              </p>
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMintNow}
            disabled={minting || !wallet?.address}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {minting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Inscribe Now
              </>
            )}
          </button>

          {!wallet?.address && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-400">
                Wallet not found. Please contact support to set up your mining wallet.
              </p>
            </div>
          )}
        </motion.div>

        {/* Global Mining Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-foreground font-semibold text-lg">Global Mining Statistics</h2>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats?.totalInscriptions ? stats.totalInscriptions.toLocaleString() : "0"}
              </p>
              <p className="text-muted-foreground text-sm">Total Mints</p>
              <p className="text-primary text-xs mt-1">+{stats?.inscriptions24h || 0} today</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats?.totalSupplyMinted ? (parseInt(stats.totalSupplyMinted) / 1000000).toFixed(1) + "M" : "0"}
              </p>
              <p className="text-muted-foreground text-sm">Tokens Minted</p>
              <p className="text-green-400 text-xs mt-1">{stats?.allocationPercentage ? stats.allocationPercentage.toFixed(1) : 0}% of allocation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats?.uniqueUsers ? stats.uniqueUsers.toLocaleString() : "0"}
              </p>
              <p className="text-muted-foreground text-sm">Active Miners</p>
              <p className="text-purple-400 text-xs mt-1">Unique users</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats?.typeBreakdown.auto || 0} / {stats?.typeBreakdown.manual || 0}
              </p>
              <p className="text-muted-foreground text-sm">Auto / Manual</p>
              <p className="text-blue-400 text-xs mt-1">
                {stats?.typeBreakdown.autoPercentage || 0}% auto
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="text-foreground font-semibold mb-4">About REAGENT Mining</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              REAGENT is a TIP-20 token on Tempo Network. Each mint operation creates 10,000 REAGENT tokens.
            </p>
            <p>
              <strong className="text-foreground">Token Address:</strong>{" "}
              <code className="text-xs bg-accent px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_REAGENT_TOKEN_ADDRESS || "0x20C000000000000000000000a59277C0c1d65Bc5"}
              </code>
            </p>
            <p>
              <strong className="text-foreground">Network:</strong> Tempo Network (Chain ID: 4217)
            </p>
            <p>
              <strong className="text-foreground">Pricing:</strong> Auto minting (0.5 PATHUSD) offers 50% savings compared to manual minting (1.0 PATHUSD)
            </p>
          </div>
        </motion.div>

        {/* Minting History */}
        <MintingHistory />

        {/* Deposit Instructions */}
        <DepositInstructions />
      </div>
    </div>
  );
}

export default function MiningPage() {
  return (
    <ErrorBoundary>
      <MiningPageContent />
    </ErrorBoundary>
  );
}
