"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Workflow, 
  Plus, 
  Settings, 
  Zap, 
  Clock, 
  CheckCircle, 
  Brain,
  MessageSquare,
  Globe,
  Database,
  Cpu,
  Calendar,
  Activity,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HermesFeature {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "error" | "loading";
  category: string;
  type: 'core' | 'gateway' | 'skill' | 'memory' | 'cron';
  lastUsed?: string;
  usageCount?: number;
  config?: any;
  actions?: string[];
}

export default function FeaturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [features, setFeatures] = useState<HermesFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchHermesFeatures();
    }
  }, [status, router]);

  const fetchHermesFeatures = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive Hermes status
      const [statusRes, skillsRes, gatewayRes, cronRes, sessionsRes] = await Promise.all([
        fetch("/api/hermes/status"),
        fetch("/api/hermes/skills"),
        fetch("/api/hermes/gateway"),
        fetch("/api/hermes/cron"),
        fetch("/api/hermes/sessions")
      ]);

      const [statusData, skillsData, gatewayData, cronData, sessionsData] = await Promise.all([
        statusRes.ok ? statusRes.json() : null,
        skillsRes.ok ? skillsRes.json() : null,
        gatewayRes.ok ? gatewayRes.json() : null,
        cronRes.ok ? cronRes.json() : null,
        sessionsRes.ok ? sessionsRes.json() : null
      ]);

      setSystemStatus(statusData);

      // Build features list from Hermes data
      const hermesFeatures: HermesFeature[] = [
        // Core Hermes Features
        {
          id: 'hermes-cli',
          name: 'Hermes CLI Integration',
          description: 'Core Hermes agent framework with full CLI access',
          status: statusData?.hermes?.installed ? 'active' : 'inactive',
          category: 'Core System',
          type: 'core',
          config: {
            version: statusData?.hermes?.version,
            path: statusData?.hermes?.cliPath
          },
          actions: ['test', 'diagnostics']
        },
        {
          id: 'user-profile',
          name: 'User Profile Isolation',
          description: 'Isolated Hermes profile for complete user separation',
          status: statusData?.profile?.exists ? 'active' : 'inactive',
          category: 'User Management',
          type: 'core',
          config: {
            profileName: statusData?.profile?.name,
            home: statusData?.profile?.home
          },
          actions: ['create', 'delete', 'reset']
        },
        {
          id: 'memory-system',
          name: 'Memory System',
          description: 'Persistent memory with multiple backend support',
          status: statusData?.memory?.status === 'active' ? 'active' : 'inactive',
          category: 'Memory & Learning',
          type: 'memory',
          usageCount: statusData?.memory?.total || 0,
          config: {
            type: statusData?.memory?.type,
            total: statusData?.memory?.total
          },
          actions: ['configure', 'clear']
        },
        {
          id: 'chat-system',
          name: 'Conversational AI',
          description: 'Streaming chat with learning capabilities',
          status: 'active',
          category: 'Communication',
          type: 'core',
          usageCount: sessionsData?.sessions?.length || 0,
          lastUsed: sessionsData?.sessions?.[0]?.lastActivity,
          actions: ['chat', 'history']
        }
      ];

      // Add Gateway Features
      if (statusData?.gateway) {
        hermesFeatures.push({
          id: 'gateway-system',
          name: 'Multi-Platform Gateway',
          description: 'Connect to Telegram, Discord, WhatsApp and more',
          status: statusData.gateway.status === 'running' ? 'active' : 'inactive',
          category: 'Platform Integration',
          type: 'gateway',
          usageCount: Object.keys(statusData.gateway.platforms || {}).length,
          config: {
            platforms: statusData.gateway.platforms,
            status: statusData.gateway.status
          },
          actions: ['start', 'stop', 'configure']
        });

        // Add individual platform features
        Object.entries(statusData.gateway.platforms || {}).forEach(([platform, config]: [string, any]) => {
          hermesFeatures.push({
            id: `platform-${platform}`,
            name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Integration`,
            description: `Connect your agent to ${platform}`,
            status: config.status === 'connected' ? 'active' : 'inactive',
            category: 'Platform Connections',
            type: 'gateway',
            config,
            actions: ['connect', 'disconnect', 'test']
          });
        });
      }

      // Add Skills Features
      if (skillsData?.skills) {
        const installedSkills = skillsData.skills.filter((s: any) => s.installed);
        
        hermesFeatures.push({
          id: 'skills-system',
          name: 'Skills Management',
          description: 'Install and manage agent capabilities',
          status: installedSkills.length > 0 ? 'active' : 'inactive',
          category: 'Capabilities',
          type: 'skill',
          usageCount: installedSkills.length,
          config: {
            total: skillsData.skills.length,
            installed: installedSkills.length,
            enabled: skillsData.skills.filter((s: any) => s.enabled).length
          },
          actions: ['browse', 'install', 'manage']
        });

        // Add individual skills
        installedSkills.forEach((skill: any) => {
          hermesFeatures.push({
            id: `skill-${skill.name}`,
            name: skill.name,
            description: skill.description || 'Custom skill capability',
            status: skill.enabled ? 'active' : 'inactive',
            category: 'Installed Skills',
            type: 'skill',
            config: skill,
            actions: ['enable', 'disable', 'remove']
          });
        });
      }

      // Add Cron Features
      if (cronData?.cronJobs) {
        hermesFeatures.push({
          id: 'cron-system',
          name: 'Scheduled Tasks',
          description: 'Automated tasks and recurring jobs',
          status: cronData.cronJobs.length > 0 ? 'active' : 'inactive',
          category: 'Automation',
          type: 'cron',
          usageCount: cronData.cronJobs.length,
          config: {
            total: cronData.cronJobs.length,
            enabled: cronData.cronJobs.filter((j: any) => j.enabled).length
          },
          actions: ['create', 'manage', 'logs']
        });

        // Add individual cron jobs
        cronData.cronJobs.forEach((job: any) => {
          hermesFeatures.push({
            id: `cron-${job.id}`,
            name: job.name,
            description: `Scheduled: ${job.schedule}`,
            status: job.enabled ? 'active' : 'inactive',
            category: 'Scheduled Tasks',
            type: 'cron',
            config: job,
            actions: ['run', 'edit', 'delete']
          });
        });
      }

      setFeatures(hermesFeatures);
    } catch (error) {
      console.error("Failed to fetch Hermes features:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureAction = async (featureId: string, action: string) => {
    try {
      let endpoint = '';
      let method = 'POST';
      let body: any = { action };

      switch (featureId) {
        case 'hermes-cli':
          endpoint = '/api/hermes/test';
          if (action === 'test') {
            body = { action: 'quick_chat', message: 'Hello, test message' };
          } else if (action === 'diagnostics') {
            body = { action: 'run_diagnostics' };
          }
          break;
        case 'user-profile':
          endpoint = '/api/hermes/status';
          if (action === 'create') {
            body = { action: 'createProfile' };
          } else if (action === 'delete') {
            body = { action: 'deleteProfile' };
          }
          break;
        case 'gateway-system':
          endpoint = '/api/hermes/status';
          if (action === 'start') {
            body = { action: 'startGateway' };
          } else if (action === 'stop') {
            body = { action: 'stopGateway' };
          }
          break;
        default:
          console.log(`Action ${action} for feature ${featureId}`);
          return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Action result:', result);
        // Refresh features after action
        fetchHermesFeatures();
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "loading":
        return <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "loading":
        return "text-primary bg-blue-400/10 border-blue-400/20";
      case "error":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'core': return <Cpu className="w-5 h-5" />;
      case 'gateway': return <Globe className="w-5 h-5" />;
      case 'skill': return <Brain className="w-5 h-5" />;
      case 'memory': return <Database className="w-5 h-5" />;
      case 'cron': return <Calendar className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const categories = Array.from(new Set(features.map(f => f.category)));
  const featuresByCategory = categories.reduce((acc, category) => {
    acc[category] = features.filter(f => f.category === category);
    return acc;
  }, {} as Record<string, HermesFeature[]>);

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Workflow className="w-6 h-6 text-green-400" />
              Hermes Features
            </h1>
            <p className="text-muted-foreground mt-1">Manage your Hermes agent capabilities and integrations</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchHermesFeatures}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-foreground rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={() => router.push('/dashboard/agents')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-foreground font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground font-semibold text-lg">System Overview</h2>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                systemStatus?.hermes?.installed ? "bg-green-400" : "bg-red-400"
              )} />
              <span className="text-muted-foreground text-sm">
                {systemStatus?.hermes?.installed ? "Hermes Active" : "Hermes Inactive"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Core Features</p>
                <p className="text-muted-foreground text-sm">{features.filter(f => f.type === 'core').length} active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Skills</p>
                <p className="text-muted-foreground text-sm">{features.filter(f => f.type === 'skill').length} installed</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Platforms</p>
                <p className="text-muted-foreground text-sm">{features.filter(f => f.type === 'gateway').length} connected</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-foreground font-medium">Automation</p>
                <p className="text-muted-foreground text-sm">{features.filter(f => f.type === 'cron').length} jobs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features by Category */}
        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
          <div key={category} className="mb-8">
            <h3 className="text-foreground font-semibold text-lg mb-4 flex items-center gap-2">
              {getTypeIcon(categoryFeatures[0]?.type)}
              {category}
              <span className="text-sm text-muted-foreground font-normal">({categoryFeatures.length})</span>
            </h3>
            
            <div className="space-y-4">
              {categoryFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                        {getTypeIcon(feature.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-foreground">{feature.name}</h4>
                          <div className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded-full border text-xs",
                            getStatusColor(feature.status)
                          )}>
                            {getStatusIcon(feature.status)}
                            <span className="capitalize">{feature.status}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{feature.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {feature.usageCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>{feature.usageCount} uses</span>
                            </div>
                          )}
                          {feature.lastUsed && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Last: {new Date(feature.lastUsed).toLocaleDateString()}</span>
                            </div>
                          )}
                          {feature.config && Object.keys(feature.config).length > 0 && (
                            <div className="flex items-center gap-1">
                              <Settings className="w-3 h-3" />
                              <span>Configured</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {feature.actions?.map((action) => (
                        <button
                          key={action}
                          onClick={() => handleFeatureAction(feature.id, action)}
                          className="px-3 py-1 bg-accent hover:bg-accent/90 text-muted-foreground hover:text-foreground text-xs rounded-lg transition-colors capitalize"
                        >
                          {action}
                        </button>
                      ))}
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {features.length === 0 && (
          <div className="text-center py-12">
            <Workflow className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Hermes features detected</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Make sure Hermes CLI is installed and your profile is created
            </p>
            <button
              onClick={fetchHermesFeatures}
              className="bg-green-600 hover:bg-green-700 text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Refresh Features
            </button>
          </div>
        )}
      </div>
    </div>
  );
}





