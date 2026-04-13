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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Custom Platform Icons as SVG components
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
  </svg>
);

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchChannels();
    }
  }, [status, router]);

  // Auto-refresh every 10 seconds for realtime sync
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        fetchChannels(true);
      }, 10000); // 10 seconds for realtime feel
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
      icon: TelegramIcon,
      description: "Connect via Telegram Bot API",
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-[#0088cc]",
      bgColor: "bg-[#0088cc]/20",
      enabled: true,
      fields: ["bot_token"]
    },
    { 
      id: "discord", 
      name: "Discord", 
      icon: DiscordIcon,
      description: "Connect to Discord servers",
      color: "from-indigo-500 to-purple-600",
      iconColor: "text-[#5865F2]",
      bgColor: "bg-[#5865F2]/20",
      enabled: true,
      fields: ["bot_token"]
    },
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: WhatsAppIcon,
      description: "QR code pairing via Hermes",
      color: "from-green-600 to-green-700",
      iconColor: "text-[#25D366]",
      bgColor: "bg-[#25D366]/20",
      enabled: true,
      fields: [] // QR code based, no manual fields
    },
    { 
      id: "slack", 
      name: "Slack", 
      icon: SlackIcon,
      description: "Connect to Slack workspaces",
      color: "from-purple-500 to-pink-600",
      iconColor: "text-[#4A154B]",
      bgColor: "bg-[#4A154B]/20",
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
          onSuccess={(message) => {
            setShowAddModal(false);
            setSelectedType("");
            setToast({ message, type: 'success' });
            setTimeout(() => setToast(null), 5000);
            fetchChannels();
          }}
          onError={(message) => {
            setToast({ message, type: 'error' });
            setTimeout(() => setToast(null), 5000);
          }}
          channelTypes={CHANNEL_TYPES}
          selectedType={selectedType}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={cn(
            "fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50",
            toast.type === 'success' ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={cn(
            "text-sm font-medium",
            toast.type === 'success' ? 'text-green-400' : 'text-red-400'
          )}>
            {toast.message}
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface ConfigureChannelModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  channelTypes: any[];
  selectedType?: string;
}

function ConfigureChannelModal({ onClose, onSuccess, onError, channelTypes, selectedType: initialType }: ConfigureChannelModalProps) {
  const [selectedType, setSelectedType] = useState(initialType || "");
  const [formData, setFormData] = useState({
    bot_token: ""
  });
  const [loading, setLoading] = useState(false);
  const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);

  const selectedChannel = channelTypes.find(t => t.id === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Special handling for WhatsApp - show instructions instead
    if (selectedType === 'whatsapp') {
      setShowWhatsAppInstructions(true);
      return;
    }
    
    setLoading(true);

    try {
      const config: any = {
        platform: selectedType
      };

      // Add platform-specific config based on Hermes CLI requirements
      if (selectedType === 'telegram' || selectedType === 'discord' || selectedType === 'slack') {
        if (!formData.bot_token) {
          onError('Bot token is required');
          setLoading(false);
          return;
        }
        config.bot_token = formData.bot_token;
      }

      const response = await fetch('/api/hermes/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(`${selectedChannel?.name} gateway configured successfully!`);
      } else {
        const error = await response.json();
        onError(error.error || 'Failed to configure channel');
      }
    } catch (error) {
      console.error('Failed to configure channel:', error);
      onError('Failed to configure channel. Please try again.');
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
          "1. Click 'Show QR Code' button below",
          "2. A QR code will be displayed in the modal",
          "3. Open WhatsApp on your phone",
          "4. Go to Settings → Linked Devices",
          "5. Tap 'Link a Device' and scan the QR code"
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
            {showWhatsAppInstructions ? 'WhatsApp Setup Instructions' : `Configure ${selectedChannel?.name || 'Channel'}`}
          </h2>
          <button
            onClick={() => {
              if (showWhatsAppInstructions) {
                setShowWhatsAppInstructions(false);
              } else {
                onClose();
              }
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        {showWhatsAppInstructions ? (
          // WhatsApp Setup Instructions
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="text-blue-400 font-medium mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                WhatsApp Setup Instructions
              </h3>
              
              <div className="space-y-4 text-muted-foreground text-sm">
                <p>WhatsApp requires interactive QR code scanning. Please follow these steps:</p>
                
                <div className="bg-accent/30 border border-border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 1: Connect to Server</p>
                    <code className="block bg-black/30 p-3 rounded text-xs font-mono text-green-400">
                      ssh root@159.65.141.68
                    </code>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 2: Run WhatsApp Setup</p>
                    <code className="block bg-black/30 p-3 rounded text-xs font-mono text-green-400">
                      hermes --profile user-{session?.user?.id} whatsapp
                    </code>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 3: Scan QR Code</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>A QR code will appear in your terminal</li>
                      <li>Open WhatsApp on your phone</li>
                      <li>Go to Settings → Linked Devices</li>
                      <li>Tap "Link a Device"</li>
                      <li>Scan the QR code from your terminal</li>
                    </ol>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">Step 4: Verify Connection</p>
                    <p>Once connected, the gateway will automatically start receiving messages.</p>
                    <p className="mt-2">You can check status with:</p>
                    <code className="block bg-black/30 p-3 rounded text-xs font-mono text-green-400 mt-2">
                      hermes --profile user-{session?.user?.id} gateway status
                    </code>
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-400 font-medium mb-2">⚠️ Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-400/80">
                    <li>WhatsApp setup requires SSH access to the server</li>
                    <li>The QR code must be scanned within 60 seconds</li>
                    <li>Make sure your phone has internet connection</li>
                    <li>You can only link one WhatsApp account per profile</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowWhatsAppInstructions(false)}
                className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowWhatsAppInstructions(false);
                  onSuccess('Please follow the SSH instructions to setup WhatsApp');
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        ) : !selectedType ? (
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
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm mb-3">
                      {selectedType === 'whatsapp' 
                        ? '📱 WhatsApp requires SSH access for QR code scanning. Click below to view detailed setup instructions.'
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
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-foreground py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Configuring...
                      </>
                    ) : (
                      selectedType === 'whatsapp' ? 'View Setup Instructions' : `Configure ${selectedChannel?.name}`
                    )}
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
