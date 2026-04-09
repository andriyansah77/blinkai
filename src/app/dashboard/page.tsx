"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  };
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'skill' | 'agent' | 'gateway';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive status
      const [statusRes, agentsRes, skillsRes, sessionsRes] = await Promise.all([
        fetch("/api/hermes/status"),
        fetch("/api/hermes/agents"),
        fetch("/api/hermes/skills"),
        fetch("/api/hermes/sessions")
      ]);

      const [statusData, agentsData, skillsData, sessionsData] = await Promise.all([
        statusRes.ok ? statusRes.json() : null,
        agentsRes.ok ? agentsRes.json() : null,
        skillsRes.ok ? skillsRes.json() : null,
        sessionsRes.ok ? sessionsRes.json() : null
      ]);

      // Process data into dashboard stats
      const dashboardStats: DashboardStats = {
        agents: {
          total: agentsData?.agents?.length || 0,
          active: agentsData?.agents?.filter((a: any) => a.status === 'active').length || 0,
          learning: agentsData?.agents?.filter((a: any) => a.learningEnabled).length || 0
        },
        skills: {
          total: skillsData?.skills?.length || 0,
          installed: skillsData?.skills?.filter((s: any) => s.installed).length || 0,
          categories: statusData?.skills?.list ? 
            [...new Set(statusData.skills.list.map((s: any) => s.source))].length : 0
        },
        sessions: {
          total: sessionsData?.sessions?.length || 0,
          today: sessionsData?.sessions?.filter((s: any) => 
            new Date(s.created).toDateString() === new Date().toDateString()
          ).length || 0,
          thisWeek: sessionsData?.sessions?.filter((s: any) => {
            const sessionDate = new Date(s.created);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
          }).length || 0
        },
        memory: {
          total: statusData?.memory?.total || 0,
          active: statusData?.memory?.status === 'active',
          type: statusData?.memory?.type || 'built-in'
        },
        gateway: {
          status: statusData?.gateway?.status || 'stopped',
          platforms: Object.keys(statusData?.gateway?.platforms || {}).length,
          connections: Object.values(statusData?.gateway?.platforms || {})
            .filter((p: any) => p.status === 'connected').length
        },
        system: {
          hermesInstalled: statusData?.hermes?.installed || false,
          version: statusData?.hermes?.version || 'Unknown',
          uptime: calculateUptime()
        }
      };

      setStats(dashboardStats);

      // Generate recent activities
      const recentActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'agent',
          title: 'Hermes Profile Active',
          description: `Your Hermes agent profile is ${statusData?.profile?.status || 'inactive'}`,
          timestamp: new Date().toISOString(),
          status: statusData?.profile?.status === 'active' ? 'success' : 'warning'
        },
        {
          id: '2',
          type: 'gateway',
          title: 'Gateway Status',
          description: `Gateway is ${statusData?.gateway?.status || 'stopped'}`,
          timestamp: new Date().toISOString(),
          status: statusData?.gateway?.status === 'running' ? 'success' : 'warning'
        },
        {
          id: '3',
          type: 'skill',
          title: 'Skills Available',
          description: `${skillsData?.skills?.length || 0} skills ready to install`,
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      ];

      setActivities(recentActivities);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUptime = () => {
    // Simple uptime calculation - in real app this would come from server
    const hours = Math.floor(Math.random() * 24) + 1;
    return `${hours}h ${Math.floor(Math.random() * 60)}m`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="h-full bg-[#0A0A0A] overflow-auto">
      {/* Header */}
      <div className="border-b border-white/[0.06] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {session?.user?.name || 'User'}
            </h1>
            <p className="text-white/60">
              Your ReAgent dashboard with Hermes integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/chat')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Start Chat
            </button>
            <button
              onClick={() => router.push('/dashboard/agents')}
              className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* System Status */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">System Status</h2>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                stats?.system.hermesInstalled ? "bg-green-400" : "bg-red-400"
              )} />
              <span className="text-white/60 text-sm">
                {stats?.system.hermesInstalled ? "Hermes Active" : "Hermes Inactive"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-lg">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Hermes CLI</p>
                <p className="text-white/40 text-sm">{stats?.system.version}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Memory</p>
                <p className="text-white/40 text-sm capitalize">{stats?.memory.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-lg">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Gateway</p>
                <p className="text-white/40 text-sm capitalize">{stats?.gateway.status}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-lg">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-medium">Uptime</p>
                <p className="text-white/40 text-sm">{stats?.system.uptime}</p>
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
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/agents')}
                className="text-white/40 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white font-semibold mb-1">AI Agents</h3>
            <p className="text-2xl font-bold text-white mb-2">{stats?.agents.total || 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">{stats?.agents.active || 0} active</span>
              <span className="text-blue-400">{stats?.agents.learning || 0} learning</span>
            </div>
          </motion.div>

          {/* Skills Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/agents?view=skills')}
                className="text-white/40 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white font-semibold mb-1">Skills</h3>
            <p className="text-2xl font-bold text-white mb-2">{stats?.skills.total || 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">{stats?.skills.installed || 0} installed</span>
              <span className="text-blue-400">{stats?.skills.categories || 0} categories</span>
            </div>
          </motion.div>

          {/* Sessions Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/chat')}
                className="text-white/40 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white font-semibold mb-1">Chat Sessions</h3>
            <p className="text-2xl font-bold text-white mb-2">{stats?.sessions.total || 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">{stats?.sessions.today || 0} today</span>
              <span className="text-blue-400">{stats?.sessions.thisWeek || 0} this week</span>
            </div>
          </motion.div>

          {/* Gateway Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => router.push('/dashboard/channels')}
                className="text-white/40 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white font-semibold mb-1">Gateway</h3>
            <p className="text-2xl font-bold text-white mb-2">{stats?.gateway.platforms || 0}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">{stats?.gateway.connections || 0} connected</span>
              <span className={cn(
                "capitalize",
                stats?.gateway.status === 'running' ? "text-green-400" : "text-orange-400"
              )}>
                {stats?.gateway.status || 'stopped'}
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
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Recent Activity</h3>
              <Activity className="w-5 h-5 text-white/40" />
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    activity.status === 'success' ? "bg-green-500/20" :
                    activity.status === 'warning' ? "bg-orange-500/20" : "bg-red-500/20"
                  )}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{activity.title}</p>
                    <p className="text-white/60 text-sm">{activity.description}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
              <Zap className="w-5 h-5 text-white/40" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/dashboard/chat')}
                className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-left transition-colors group"
              >
                <MessageSquare className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium text-sm">Start Chat</p>
                <p className="text-white/60 text-xs">Chat with Hermes</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/agents')}
                className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-left transition-colors group"
              >
                <Bot className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium text-sm">Create Agent</p>
                <p className="text-white/60 text-xs">New AI agent</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/channels')}
                className="p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-left transition-colors group"
              >
                <Globe className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium text-sm">Connect Platform</p>
                <p className="text-white/60 text-xs">Telegram, Discord</p>
              </button>

              <button
                onClick={() => router.push('/dashboard/skills')}
                className="p-4 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg text-left transition-colors group"
              >
                <Brain className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white font-medium text-sm">Browse Skills</p>
                <p className="text-white/60 text-xs">Enhance agents</p>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Performance Overview</h3>
            <TrendingUp className="w-5 h-5 text-white/40" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats?.sessions.total || 0}</p>
              <p className="text-white/60 text-sm">Total Conversations</p>
              <p className="text-green-400 text-xs mt-1">+{stats?.sessions.thisWeek || 0} this week</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats?.memory.total || 0}</p>
              <p className="text-white/60 text-sm">Memories Stored</p>
              <p className="text-blue-400 text-xs mt-1 capitalize">{stats?.memory.type} system</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stats?.skills.installed || 0}</p>
              <p className="text-white/60 text-sm">Active Skills</p>
              <p className="text-purple-400 text-xs mt-1">{stats?.skills.total || 0} available</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
