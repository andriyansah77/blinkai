"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Database, MessageSquare, Settings, Globe, Lock, Activity, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  type: string;
  name: string;
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
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchChannels();
    }
  }, [status, router]);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
    }
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

  const CHANNEL_TYPES = [
    { 
      id: "telegram", 
      name: "Telegram", 
      icon: "✈️", 
      description: "Telegram bot integration with groups and channels",
      color: "from-blue-500 to-cyan-600",
      features: ["Private chats", "Groups", "Channels", "Inline queries"],
      enabled: true,
      setupFields: ["botToken", "username"]
    },
    { 
      id: "discord", 
      name: "Discord", 
      icon: "🎮", 
      description: "Connect to Discord servers and channels",
      color: "from-indigo-500 to-purple-600",
      features: ["Text channels", "Voice channels", "Slash commands", "Webhooks"],
      enabled: true,
      setupFields: ["botToken", "serverId"]
    },
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: "📱", 
      description: "WhatsApp Business API integration",
      color: "from-green-600 to-green-700",
      features: ["Business messaging", "Templates", "Media sharing", "Groups"],
      enabled: true,
      setupFields: ["phoneNumber", "apiKey", "webhookUrl"]
    },
    { 
      id: "slack", 
      name: "Slack", 
      icon: "💼", 
      description: "Slack workspace bot for team collaboration",
      color: "from-green-500 to-emerald-600",
      features: ["Channels", "Direct messages", "Slash commands", "Interactive messages"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "twitter", 
      name: "Twitter/X", 
      icon: "🐦", 
      description: "Twitter bot for automated posting and replies",
      color: "from-blue-400 to-blue-600",
      features: ["Tweet posting", "Reply automation", "DM handling", "Mentions tracking"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "facebook", 
      name: "Facebook", 
      icon: "📘", 
      description: "Facebook Messenger and Page integration",
      color: "from-blue-600 to-indigo-600",
      features: ["Messenger bot", "Page posts", "Comments", "Live chat"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "instagram", 
      name: "Instagram", 
      icon: "📷", 
      description: "Instagram bot for DMs and comments",
      color: "from-pink-500 to-purple-600",
      features: ["Direct messages", "Comment replies", "Story interactions", "Media posting"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "linkedin", 
      name: "LinkedIn", 
      icon: "💼", 
      description: "LinkedIn automation for professional networking",
      color: "from-blue-700 to-blue-800",
      features: ["Connection requests", "Message automation", "Post engagement", "Lead generation"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "email", 
      name: "Email", 
      icon: "📧", 
      description: "Email automation and smart replies",
      color: "from-red-500 to-orange-600",
      features: ["Auto-reply", "Email classification", "Smart forwarding", "Template responses"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "sms", 
      name: "SMS", 
      icon: "💬", 
      description: "SMS messaging and automation",
      color: "from-green-400 to-green-600",
      features: ["Bulk messaging", "Auto-replies", "Keyword triggers", "Two-way conversations"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "webhook", 
      name: "Webhook", 
      icon: "🔗", 
      description: "Custom webhook integrations",
      color: "from-gray-500 to-gray-700",
      features: ["HTTP endpoints", "Custom payloads", "Event triggers", "API integrations"],
      enabled: false,
      comingSoon: true
    },
    { 
      id: "api", 
      name: "REST API", 
      icon: "🔌", 
      description: "Direct API access for custom integrations",
      color: "from-purple-500 to-purple-700",
      features: ["RESTful endpoints", "Authentication", "Rate limiting", "Custom responses"],
      enabled: false,
      comingSoon: true
    }
  ];

  const getChannelIcon = (type: string) => {
    const channelType = CHANNEL_TYPES.find(t => t.id === type);
    return channelType?.icon || "💬";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-400';
      case 'disconnected': return 'bg-gray-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="h-screen bg-[#0A0A0A] text-white overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              Channels
            </h1>
            <p className="text-white/60 mt-1">Connect your AI agent to Discord, Telegram, and other platforms</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </div>

        {/* Available Channel Types */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Available Platforms</h2>
            <span className="text-sm text-white/40">{CHANNEL_TYPES.length} platforms available</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CHANNEL_TYPES.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => type.enabled ? setShowAddModal(true) : null}
                className={cn(
                  "p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-left group relative overflow-hidden transition-colors",
                  type.enabled 
                    ? "hover:bg-white/[0.06] cursor-pointer" 
                    : "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">{type.icon}</div>
                    {type.comingSoon && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                    {type.enabled && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-white text-sm mb-2">{type.name}</h3>
                  <p className="text-xs text-white/40 mb-3 line-clamp-2">{type.description}</p>
                  
                  {/* Features preview */}
                  <div className="space-y-1 mb-3">
                    {type.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs text-white/30">
                        <div className="w-1 h-1 bg-white/30 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {type.features.length > 2 && (
                      <div className="text-xs text-white/20">
                        +{type.features.length - 2} more features
                      </div>
                    )}
                  </div>
                  
                  {type.enabled ? (
                    <div className="flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Connect</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-orange-400">
                      <span>Coming Soon</span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Connected Channels */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Connected Channels</h2>
          
          {channels.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <div className="w-16 h-16 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No channels connected</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Connect your first channel to start chatting with your AI agent on different platforms
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Connect Your First Channel
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel, index) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center text-2xl">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-white">{channel.name}</h3>
                          <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-1 rounded capitalize">
                            {channel.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot(channel.status)}`} />
                            <span className={`text-xs font-medium ${getStatusColor(channel.status)} capitalize`}>
                              {channel.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{channel.messageCount.toLocaleString()} messages</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>Last: {new Date(channel.lastActivity).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="text-white/40 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Channel Modal */}
      {showAddModal && (
        <AddChannelModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchChannels();
          }}
          channelTypes={CHANNEL_TYPES}
        />
      )}
    </div>
  );
}

interface AddChannelModalProps {
  onClose: () => void;
  onSuccess: () => void;
  channelTypes: any[];
}

function AddChannelModal({ onClose, onSuccess, channelTypes }: AddChannelModalProps) {
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    botToken: "",
    serverId: "",
    username: "",
    phoneNumber: "",
    apiKey: "",
    webhookUrl: ""
  });
  const [loading, setLoading] = useState(false);

  const selectedChannel = channelTypes.find(t => t.id === selectedType);
  const enabledChannels = channelTypes.filter(t => t.enabled);

  const getFieldLabel = (field: string) => {
    const labels = {
      botToken: "Bot Token",
      serverId: "Server ID (Optional)",
      username: "Bot Username",
      phoneNumber: "Phone Number",
      apiKey: "API Key",
      webhookUrl: "Webhook URL"
    };
    return labels[field as keyof typeof labels] || field;
  };

  const getFieldPlaceholder = (field: string, channelType: string) => {
    const placeholders: Record<string, Record<string, string>> = {
      telegram: {
        botToken: "123456789:EXAMPLE_BOT_TOKEN_PLACEHOLDER",
        username: "@your_bot_username"
      },
      discord: {
        botToken: "MTIzNDU2Nzg5MDEyMzQ1Njc4OTA.Gh7Ijk.EXAMPLE_TOKEN_PLACEHOLDER",
        serverId: "123456789012345678"
      },
      whatsapp: {
        phoneNumber: "+1234567890",
        apiKey: "your-whatsapp-api-key",
        webhookUrl: "https://your-domain.com/webhook"
      }
    };
    return placeholders[channelType]?.[field] || `Enter ${field}`;
  };

  const getSetupInstructions = (channelType: string) => {
    const instructions: Record<string, { title: string; steps: string[] }> = {
      telegram: {
        title: "Setup Telegram Bot",
        steps: [
          "1. Message @BotFather on Telegram",
          "2. Send /newbot and follow instructions",
          "3. Copy the bot token provided",
          "4. Optionally set bot username with /setusername"
        ]
      },
      discord: {
        title: "Setup Discord Bot",
        steps: [
          "1. Go to Discord Developer Portal",
          "2. Create new application and bot",
          "3. Copy the bot token from Bot section",
          "4. Get server ID from Discord (Developer Mode)"
        ]
      },
      whatsapp: {
        title: "Setup WhatsApp Business",
        steps: [
          "1. Register WhatsApp Business Account",
          "2. Get API credentials from provider",
          "3. Set up webhook endpoint",
          "4. Verify phone number ownership"
        ]
      }
    };
    return instructions[channelType];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config: any = {
        name: formData.name,
        type: selectedType
      };

      // Add platform-specific config
      if (selectedType === 'telegram') {
        config.botToken = formData.botToken;
        config.username = formData.username;
      } else if (selectedType === 'discord') {
        config.botToken = formData.botToken;
        config.serverId = formData.serverId;
      } else if (selectedType === 'whatsapp') {
        config.phoneNumber = formData.phoneNumber;
        config.apiKey = formData.apiKey;
        config.webhookUrl = formData.webhookUrl;
      }

      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Failed to create channel:', error);
        alert('Failed to create channel: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
      alert('Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] border border-white/[0.08] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Connect New Channel</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {!selectedType ? (
          <div>
            <p className="text-white/60 text-sm mb-6">Choose a platform to connect:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enabledChannels.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{type.name}</h3>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Available
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mb-3">{type.description}</p>
                  <div className="space-y-1">
                    {type.features.slice(0, 2).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 text-xs text-white/40">
                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Disabled platforms */}
            <div className="mt-8">
              <h3 className="text-white/60 text-sm mb-4">Coming Soon</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {channelTypes.filter(t => !t.enabled).map((type) => (
                  <div
                    key={type.id}
                    className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg text-center opacity-60"
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-white/40 text-xs">{type.name}</div>
                    <div className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full mt-2">
                      Soon
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Setup Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Channel Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder={`My ${selectedChannel?.name} Bot`}
                    required
                  />
                </div>

                {selectedChannel?.setupFields?.map((field: string) => (
                  <div key={field}>
                    <label className="block text-white/60 text-sm mb-2">
                      {getFieldLabel(field)}
                      {field === 'serverId' && <span className="text-white/40"> (Optional)</span>}
                    </label>
                    <input
                      type={field.includes('token') || field.includes('key') ? 'password' : 'text'}
                      value={formData[field as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder={getFieldPlaceholder(field, selectedType)}
                      required={field !== 'serverId'}
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedType("")}
                    className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name || !formData.botToken}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {loading ? "Connecting..." : "Connect"}
                  </button>
                </div>
              </form>
            </div>

            {/* Setup Instructions */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4">
              <h3 className="text-white font-medium mb-4">
                {getSetupInstructions(selectedType)?.title}
              </h3>
              <div className="space-y-2">
                {getSetupInstructions(selectedType)?.steps.map((step, idx) => (
                  <div key={idx} className="text-white/60 text-sm">
                    {step}
                  </div>
                ))}
              </div>
              
              {selectedType === 'telegram' && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-400 text-xs">
                    💡 Tip: After creating your bot, send it a message to activate it, then add it to groups if needed.
                  </p>
                </div>
              )}
              
              {selectedType === 'discord' && (
                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-400 text-xs">
                    💡 Tip: Make sure to give your bot the necessary permissions in your Discord server settings.
                  </p>
                </div>
              )}
              
              {selectedType === 'whatsapp' && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-xs">
                    💡 Tip: WhatsApp Business API requires approval and may take 1-2 business days to activate.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}