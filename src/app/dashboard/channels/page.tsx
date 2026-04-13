"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Plus, 
  Database, 
  MessageSquare, 
  Settings, 
  Activity, 
  RefreshCw,
  Send,
  Hash,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  type: string;
  name: string;
  agentId?: string;
  agentName?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastActivity: string;
  messageCount: number;
  config: Record<string, any>;
}

export default function ChannelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchChannels();
    }
  }, [status, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        fetchChannels(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchChannels = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      
      const response = await fetch('/api/hermes/gateway');
      if (response.ok) {
        const data = await response.json();
        // Convert gateway status to channels format
        const gatewayChannels: Channel[] = [];
        
        if (data.platforms) {
          Object.entries(data.platforms).forEach(([platform, config]: [string, any]) => {
            if (config && config.status) {
              gatewayChannels.push({
                id: platform,
                type: platform,
                name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Gateway`,
                status: config.status === 'connected' ? 'connected' : 'disconnected',
                lastActivity: new Date().toISOString(),
                messageCount: 0,
                config: config
              });
            }
          });
        }
        
        setChannels(gatewayChannels);
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-muted-foreground text-sm">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const CHANNEL_TYPES = [
    { 
      id: "telegram", 
      name: "Telegram", 
      icon: Send,
      description: "Connect via Telegram Bot API",
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/20",
      enabled: true,
      fields: ["bot_token"]
    },
    { 
      id: "discord", 
      name: "Discord", 
      icon: Hash,
      description: "Connect to Discord servers",
      color: "from-indigo-500 to-purple-600",
      iconColor: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      enabled: true,
      fields: ["bot_token"]
    },
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: MessageSquare,
      description: "QR code pairing via Hermes",
      color: "from-green-600 to-green-700",
      iconColor: "text-green-400",
      bgColor: "bg-green-500/20",
      enabled: true,
      fields: [] // QR code based, no manual fields
    },
    { 
      id: "slack", 
      name: "Slack", 
      icon: Users,
      description: "Connect to Slack workspaces",
      color: "from-purple-500 to-pink-600",
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/20",
      enabled: true,
      fields: ["bot_token"]
    }
  ];

  const getChannelType = (type: string) => {
    return CHANNEL_TYPES.find(t => t.id === type);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const connectedCount = channels.filter(c => c.status === 'connected').length;

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Database className="w-6 h-6 text-purple-400" />
              Gateway Channels
            </h1>
            <p className="text-muted-foreground mt-1">
              {connectedCount} connected • Connect your agent to messaging platforms
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchChannels()}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-foreground font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => {
                setSelectedType("");
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-foreground font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Channel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {CHANNEL_TYPES.map((type) => {
            const channel = channels.find(c => c.type === type.id);
            const Icon = type.icon;
            return (
              <div key={type.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", type.bgColor)}>
                    <Icon className={cn("w-5 h-5", type.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{type.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {channel?.status === 'connected' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs text-green-400">Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="text-xs text-gray-400">Not connected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Platforms */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHANNEL_TYPES.map((type, index) => {
              const Icon = type.icon;
              const channel = channels.find(c => c.type === type.id);
              const isConnected = channel?.status === 'connected';
              
              return (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 hover:border-purple-500/50 transition-all group cursor-pointer"
                  onClick={() => {
                    setSelectedType(type.id);
                    setShowAddModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", type.bgColor)}>
                      <Icon className={cn("w-6 h-6", type.iconColor)} />
                    </div>
                    {isConnected && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2">{type.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedType(type.id);
                      setShowAddModal(true);
                    }}
                    className="w-full bg-accent hover:bg-accent/80 text-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isConnected ? 'Reconfigure' : 'Configure'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Connected Channels */}
        {channels.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Connected Channels</h2>
            <div className="space-y-4">
              {channels.map((channel, index) => {
                const channelType = getChannelType(channel.type);
                const Icon = channelType?.icon || MessageSquare;
                
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-6 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", channelType?.bgColor)}>
                          <Icon className={cn("w-6 h-6", channelType?.iconColor)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground">{channel.name}</h3>
                            <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded capitalize">
                              {channel.type}
                            </span>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(channel.status)}
                              <span className={cn(
                                "text-xs font-medium capitalize",
                                channel.status === 'connected' ? 'text-green-400' :
                                channel.status === 'error' ? 'text-red-400' : 'text-gray-400'
                              )}>
                                {channel.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>Gateway active</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setSelectedType(channel.type);
                            setShowAddModal(true);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Configure Channel Modal */}
      {showAddModal && (
        <ConfigureChannelModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedType("");
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setSelectedType("");
            fetchChannels();
          }}
          channelTypes={CHANNEL_TYPES}
          selectedType={selectedType}
        />
      )}
    </div>
  );
}

interface ConfigureChannelModalProps {
  onClose: () => void;
  onSuccess: () => void;
  channelTypes: any[];
  selectedType?: string;
}

function ConfigureChannelModal({ onClose, onSuccess, channelTypes, selectedType: initialType }: ConfigureChannelModalProps) {
  const [selectedType, setSelectedType] = useState(initialType || "");
  const [formData, setFormData] = useState({
    bot_token: ""
  });
  const [loading, setLoading] = useState(false);

  const selectedChannel = channelTypes.find(t => t.id === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config: any = {
        platform: selectedType
      };

      // Add platform-specific config based on Hermes CLI requirements
      if (selectedType === 'telegram' || selectedType === 'discord' || selectedType === 'slack') {
        config.bot_token = formData.bot_token;
      }
      // WhatsApp uses QR code, no token needed

      const response = await fetch('/api/hermes/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert('Failed to configure channel: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to configure channel:', error);
      alert('Failed to configure channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSetupInstructions = (channelType: string) => {
    const instructions: Record<string, { title: string; steps: string[] }> = {
      telegram: {
        title: "Setup Telegram Bot",
        steps: [
          "1. Open Telegram and search for @BotFather",
          "2. Send /newbot and follow the instructions",
          "3. Copy the bot token provided by BotFather",
          "4. Paste the token below and click Configure"
        ]
      },
      discord: {
        title: "Setup Discord Bot",
        steps: [
          "1. Go to Discord Developer Portal",
          "2. Create a new application",
          "3. Go to Bot section and create a bot",
          "4. Copy the bot token and paste below"
        ]
      },
      whatsapp: {
        title: "Setup WhatsApp",
        steps: [
          "1. Click 'Start WhatsApp Gateway' below",
          "2. A QR code will be generated",
          "3. Open WhatsApp on your phone",
          "4. Scan the QR code to connect"
        ]
      },
      slack: {
        title: "Setup Slack Bot",
        steps: [
          "1. Go to api.slack.com/apps",
          "2. Create a new app",
          "3. Add Bot Token Scopes",
          "4. Install app to workspace and copy token"
        ]
      }
    };
    return instructions[channelType];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-foreground font-semibold text-lg">
            Configure {selectedChannel?.name || 'Channel'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        {!selectedType ? (
          <div>
            <p className="text-muted-foreground text-sm mb-6">Choose a platform to configure:</p>
            <div className="grid grid-cols-2 gap-4">
              {channelTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="p-4 bg-card hover:bg-accent border border-border rounded-lg text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", type.bgColor)}>
                        <Icon className={cn("w-5 h-5", type.iconColor)} />
                      </div>
                      <div>
                        <h3 className="text-foreground font-medium">{type.name}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Setup Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedChannel?.fields && selectedChannel.fields.length > 0 ? (
                  <>
                    {selectedChannel.fields.map((field: string) => (
                      <div key={field}>
                        <label className="block text-muted-foreground text-sm mb-2">
                          Bot Token
                          <span className="text-red-400 ml-1">*</span>
                        </label>
                        <input
                          type="password"
                          value={formData.bot_token}
                          onChange={(e) => setFormData({ ...formData, bot_token: e.target.value })}
                          className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="Paste your bot token here"
                          required
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm">
                      {selectedType === 'whatsapp' 
                        ? 'WhatsApp uses QR code pairing. Click the button below to start the gateway and scan the QR code.'
                        : 'No additional configuration needed. Click Configure to start the gateway.'}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedType("")}
                    className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (selectedChannel?.fields?.length > 0 && !formData.bot_token)}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {loading ? "Configuring..." : `Configure ${selectedChannel?.name}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Setup Instructions */}
            <div className="bg-accent/30 border border-border rounded-lg p-4">
              <h3 className="text-foreground font-medium mb-4 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {getSetupInstructions(selectedType)?.title}
              </h3>
              <div className="space-y-3">
                {getSetupInstructions(selectedType)?.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
