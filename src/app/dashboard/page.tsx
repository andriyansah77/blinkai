"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Zap, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Cpu,
  Database,
  Globe,
  Calendar,
  RefreshCw,
  XCircle,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HermesAgentDB } from "@/lib/hermes-db";

interface DashboardStats {
  agents: {
    total: number;
    active: number;
    learning: number;
  };
  skills: {
    total: number;
    installed: number;
    categories: number;
  };
  sessions: {
    total: number;
    today: number;
    thisWeek: number;
  };
  memory: {
    total: number;
    active: boolean;
    type: string;
  };
  gateway: {
    status: string;
    platforms: number;
    connections: number;
  };
  system: {
    hermesInstalled: boolean;
    version: string;
    uptime: string;
    serverTime: string;
  };
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'skill' | 'agent' | 'gateway' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface HermesSession {
  id: string;
  title?: string;
  created: string;
  lastActivity: string;
  messageCount: number;
  source: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleCopyUserId = () => {
    if (session?.user?.id) {
      navigator.clipboard.writeText(session.user.id);
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    }
  };

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setSyncStatus('syncing');
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Ensure Hermes profile exists for this user (auto-create if needed)
      try {
        const profileRes = await fetch("/api/hermes/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.created) {
            console.log("✅ Hermes profile auto-created for user");
          }
        }
      } catch (profileError) {
        console.warn("Profile check failed:", profileError);
        // Continue anyway - not critical for dashboard display
      }
      
      // Fetch comprehensive Hermes status
      const statusRes = await fetch("/api/hermes/status");
      if (!statusRes.ok) {
        throw new Error(`Status API error: ${statusRes.status}`);
      }
      const statusData = await statusRes.json();

      // Process real data into dashboard stats
      const dashboardStats: DashboardStats = {
        agents: {
          total: statusData.profile?.exists ? 1 : 0,
          active: statusData.profile?.status === 'active' ? 1 : 0,
          learning: statusData.profile?.exists ? 1 : 0
        },
        skills: {
          total: statusData.skills?.total || 0,
          installed: statusData.skills?.installed || 0,
          categories: statusData.skills?.list ? 
            Array.from(new Set(statusData.skills.list.map((s: any) => s.source))).length : 0
        },
        sessions: {
          total: statusData.cronJobs?.total || 0,
          today: 0, // Calculated from actual sessions
          thisWeek: 0
        },
        memory: {
          total: 0, // Will be updated from memory API
          active: statusData.memory?.status === 'active',
          type: statusData.memory?.type || 'built-in'
        },
        gateway: {
          status: statusData.gateway?.status || 'stopped',
          platforms: Object.keys(statusData.gateway?.platforms || {}).length,
          connections: Object.values(statusData.gateway?.platforms || {})
            .filter((p: any) => p.status === 'connected').length
        },
        system: {
          hermesInstalled: statusData.hermes?.installed || false,
          version: statusData.hermes?.version || 'Unknown',
          uptime: formatUptime(statusData.system?.uptime || 0),
          serverTime: new Date().toISOString()
        }
      };

      // Fetch sessions for accurate counts
      try {
        const sessionsRes = await fetch("/api/hermes/sessions");
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          const sessions: HermesSession[] = sessionsData.sessions || [];
          
          const today = new Date().toDateString();
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          dashboardStats.sessions.total = sessions.length;
          dashboardStats.sessions.today = sessions.filter((s: HermesSession) => 
            new Date(s.created).toDateString() === today
          ).length;
          dashboardStats.sessions.thisWeek = sessions.filter((s: HermesSession) => {
            const sessionDate = new Date(s.created);
            return sessionDate >= weekAgo;
          }).length;
          
          // Calculate total message count from sessions
          const totalMessages = sessions.reduce((sum: number, s: HermesSession) => 
            sum + (s.messageCount || 0), 0
          );
          dashboardStats.memory.total = totalMessages;
        }
      } catch (sessionError) {
        console.warn("Failed to fetch sessions:", sessionError);
      }

      setStats(dashboardStats);
      setLastUpdated(new Date());
      
      if (isRefresh) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }

      // Generate real activities based on actual system state
      const recentActivities = generateRealActivities(statusData, dashboardStats);
      setActivities(recentActivities);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard data");
      if (isRefresh) {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchDashboardData();
      
      // Auto-refresh every 30 seconds if enabled
      if (autoRefresh) {
        const interval = setInterval(() => fetchDashboardData(true), 30000);
        return () => clearInterval(interval);
      }
    }
  }, [status, router, fetchDashboardData, autoRefresh]);

  // Generate real activities based on system state
  const generateRealActivities = (statusData: any, stats: DashboardStats): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    const now = new Date().toISOString();

    // Hermes Profile Activity
    if (statusData.profile?.exists) {
      activities.push({
        id: 'profile-active',
        type: 'agent',
        title: 'Hermes Profile Active',
        description: `Profile "${statusData.profile.name || 'default'}" is ready`,
        timestamp: now,
        status: 'success'
      });
    } else {
      activities.push({
        id: 'profile-inactive',
        type: 'agent',
        title: 'Hermes Profile Inactive',
        description: 'Create a profile to start using Hermes agents',
        timestamp: now,
        status: 'warning'
      });
    }

    // Gateway Activity
    if (statusData.gateway?.status === 'running') {
      activities.push({
        id: 'gateway-running',
        type: 'gateway',
        title: 'Gateway Running',
        description: `${stats.gateway.connections} platforms connected`,
        timestamp: now,
        status: 'success'
      });
    } else {
      activities.push({
        id: 'gateway-stopped',
        type: 'gateway',
        title: 'Gateway Stopped',
        description: 'Connect platforms like Telegram or Discord',
        timestamp: now,
        status: stats.gateway.platforms > 0 ? 'warning' : 'info'
      });
    }

    // Skills Activity
    if (stats.skills.installed > 0) {
      activities.push({
        id: 'skills-installed',
        type: 'skill',
        title: `${stats.skills.installed} Skills Installed`,
        description: `${stats.skills.total} total skills available`,
        timestamp: now,
        status: 'success'
      });
    } else if (stats.skills.total > 0) {
      activities.push({
        id: 'skills-available',
        type: 'skill',
        title: 'Skills Available',
        description: `${stats.skills.total} skills ready to install`,
        timestamp: now,
        status: 'info'
      });
    }

    // Memory Activity
    if (stats.memory.total > 0) {
      activities.push({
        id: 'memory-active',
        type: 'chat',
        title: `${stats.memory.total} Messages Stored`,
        description: `${stats.sessions.today} conversations today`,
        timestamp: now,
        status: 'success'
      });
    }

    return activities;
  };

  // Format uptime from seconds to readable string
  const formatUptime = (seconds: number): string => {
    if (!seconds || seconds === 0) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-full bg-background overflow-auto">
        {/* Header Skeleton */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-8 w-64 bg-accent animate-pulse rounded-lg mb-2" />
              <div className="h-4 w-96 bg-accent animate-pulse rounded-lg" />
              <div className="flex items-center gap-3 mt-2">
                <div className="h-3 w-32 bg-accent animate-pulse rounded" />
                <div className="h-3 w-3 bg-accent animate-pulse rounded-full" />
                <div className="h-3 w-40 bg-accent animate-pulse rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-24 bg-accent animate-pulse rounded-lg" />
              <div className="h-10 w-32 bg-accent animate-pulse rounded-lg" />
              <div className="h-10 w-36 bg-accent animate-pulse rounded-lg" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* System Status Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-32 bg-accent animate-pulse rounded" />
              <div className="h-4 w-24 bg-accent animate-pulse rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-lg">
                  <div className="w-10 h-10 bg-accent animate-pulse rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-accent animate-pulse rounded mb-2" />
                    <div className="h-3 w-16 bg-accent animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent animate-pulse rounded-xl" />
                  <div className="w-4 h-4 bg-accent animate-pulse rounded" />
                </div>
                <div className="h-4 w-24 bg-accent animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-accent animate-pulse rounded mb-2" />
                <div className="flex items-center gap-4">
                  <div className="h-3 w-16 bg-accent animate-pulse rounded" />
                  <div className="h-3 w-20 bg-accent animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Activity & Actions Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 w-32 bg-accent animate-pulse rounded" />
                  <div className="w-5 h-5 bg-accent animate-pulse rounded" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start gap-3 p-3 bg-card rounded-lg">
                      <div className="w-8 h-8 bg-accent animate-pulse rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-accent animate-pulse rounded mb-2" />
                        <div className="h-3 w-48 bg-accent animate-pulse rounded mb-1" />
                        <div className="h-3 w-20 bg-accent animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-foreground font-semibold text-lg mb-2">Failed to Load Dashboard</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background overflow-auto relative">
      {/* Sync Status Toast */}
      <AnimatePresence>
        {syncStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border",
              syncStatus === 'syncing' && "bg-blue-500/20 border-blue-500/30",
              syncStatus === 'success' && "bg-green-500/20 border-green-500/30",
              syncStatus === 'error' && "bg-red-500/20 border-red-500/30"
            )}>
              {syncStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-blue-400 text-sm font-medium">Syncing data...</span>
                </>
              )}
              {syncStatus === 'success' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Data synced!</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Sync failed</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome back, {session?.user?.name || 'User'}
            </h1>
            <p className="text-muted-foreground">
              Your ReAgent dashboard with Hermes integration
            </p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-muted-foreground text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              {session?.user?.id && (
                <>
                  <span className="text-muted-foreground text-xs">•</span>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">
                      User ID: {session.user.id.slice(0, 8)}...{session.user.id.slice(-4)}
                    </p>
                    <button
                      onClick={handleCopyUserId}
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="Copy User ID"
                    >
                      {copiedUserId ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                autoRefresh ? "bg-green-400 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-muted-foreground text-xs">
                {autoRefresh ? "Auto-sync" : "Manual"}
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-muted-foreground hover:text-foreground text-xs underline"
              >
                {autoRefresh ? "Disable" : "Enable"}
              </button>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              {refreshing ? "Syncing..." : "Refresh"}
            </button>
            <button
              onClick={() => router.push('/dashboard/chat')}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Start Chat
            </button>
            <button
              onClick={() => router.push('/dashboard/agents')}
              className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* System Status */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold text-lg">System Status</h2>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                stats?.system.hermesInstalled ? "bg-green-400" : "bg-red-400"
              )} />
              <span className="text-muted-foreground text-sm">
                {stats?.system.hermesInstalled ? "Hermes Active" : "Hermes Inactive"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Hermes CLI</p>
                <p className="text-muted-foreground text-sm">{stats?.system.version}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Memory</p>
                <p className="text-muted-foreground text-sm capitalize">{stats?.memory.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Gateway</p>
                <p className="text-muted-foreground text-sm capitalize">{stats?.gateway.status}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Uptime</p>
                <p className="text-muted-foreground text-sm">{stats?.system.uptime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Agents Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/agents')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-muted-foreground font-medium mb-1 text-sm">AI Agents</h3>
            <p className="text-3xl font-bold text-foreground mb-2">{stats?.agents?.total ?? 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {stats?.agents?.active ?? 0} active
              </span>
              <span className="text-primary flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {stats?.agents?.learning ?? 0} learning
              </span>
            </div>
          </motion.div>

          {/* Skills Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/agents?view=skills')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-muted-foreground font-medium mb-1 text-sm">Skills</h3>
            <p className="text-3xl font-bold text-foreground mb-2">{stats?.skills?.total ?? 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {stats?.skills?.installed ?? 0} installed
              </span>
              <span className="text-primary flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {stats?.skills?.categories ?? 0} categories
              </span>
            </div>
          </motion.div>

          {/* Sessions Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/chat')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-muted-foreground font-medium mb-1 text-sm">Chat Sessions</h3>
            <p className="text-3xl font-bold text-foreground mb-2">{stats?.sessions?.total ?? 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {stats?.sessions?.today ?? 0} today
              </span>
              <span className="text-primary flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {stats?.sessions?.thisWeek ?? 0} this week
              </span>
            </div>
          </motion.div>

          {/* Gateway Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/channels')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-muted-foreground font-medium mb-1 text-sm">Gateway</h3>
            <p className="text-3xl font-bold text-foreground mb-2">{stats?.gateway?.platforms ?? 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                {stats?.gateway?.connections ?? 0} connected
              </span>
              <span className={cn(
                "capitalize flex items-center gap-1",
                stats?.gateway?.status === 'running' ? "text-green-400" : "text-orange-400"
              )}>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  stats?.gateway?.status === 'running' ? "bg-green-400" : "bg-orange-400"
                )} />
                {stats?.gateway?.status ?? 'stopped'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground font-semibold text-lg">Recent Activity</h3>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">
                    Activities will appear here as you use Hermes
                  </p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-card rounded-lg hover:bg-accent transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      activity.status === 'success' ? "bg-green-500/20" :
                      activity.status === 'warning' ? "bg-orange-500/20" : 
                      activity.status === 'error' ? "bg-red-500/20" : "bg-blue-500/20"
                    )}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : activity.status === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-orange-400" />
                      ) : activity.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium text-sm">{activity.title}</p>
                      <p className="text-muted-foreground text-sm">{activity.description}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground font-semibold text-lg">Quick Actions</h3>
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/dashboard/chat')}
                className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-left transition-colors group"
              >
                <MessageSquare className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-foreground font-medium text-sm">Start Chat</p>
                <p className="text-muted-foreground text-xs">Chat with Hermes</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/agents')}
                className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-left transition-colors group"
              >
                <Bot className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-foreground font-medium text-sm">Create Agent</p>
                <p className="text-muted-foreground text-xs">New AI agent</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/channels')}
                className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-left transition-colors group"
              >
                <Globe className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-foreground font-medium text-sm">Connect Platform</p>
                <p className="text-muted-foreground text-xs">Telegram, Discord</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/skills')}
                className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-left transition-colors group"
              >
                <Brain className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-foreground font-medium text-sm">Browse Skills</p>
                <p className="text-muted-foreground text-xs">Enhance agents</p>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground font-semibold text-lg">Performance Overview</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stats?.sessions?.total ?? 0}</p>
              <p className="text-muted-foreground text-sm">Total Conversations</p>
              <p className="text-green-400 text-xs mt-1">+{stats?.sessions?.thisWeek ?? 0} this week</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stats?.memory?.total ?? 0}</p>
              <p className="text-muted-foreground text-sm">Memories Stored</p>
              <p className="text-primary text-xs mt-1 capitalize">{stats?.memory?.type ?? 'built-in'} system</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stats?.skills?.installed ?? 0}</p>
              <p className="text-muted-foreground text-sm">Active Skills</p>
              <p className="text-purple-400 text-xs mt-1">{stats?.skills?.total ?? 0} available</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}








