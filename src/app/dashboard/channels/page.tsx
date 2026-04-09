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
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchChannels();
    }
  }, [status, router]);

  const fetchChannels = async () => {
    try {
      // Fetch channels
      const channelsResponse = await fetch('/api/channels');
      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json();
        setChannels(channelsData.channels || []);
      }

      // Fetch user agents
      const agentsResponse = await fetch('/api/hermes/agents');
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      icon: "📱", // Changed from ✈️ to 📱 for better representation
      description: "Bot API via grammY, supports groups",
      color: "from-blue-500 to-cyan-600",
      features: ["Private chats", "Groups", "Channels", "Inline queries"],
      enabled: true,
      setupFields: ["botToken", "username"],
      status: "NOT CONNECTED"
    },
    { 
      id: "discord", 
      name: "Discord", 
      icon: "🎮", 
      description: "Servers, channels, and DMs",
      color: "from-indigo-500 to-purple-600",
      features: ["Text channels", "Voice channels", "Slash commands", "Webhooks"],
      enabled: true,
      setupFields: ["botToken", "serverId"],
      status: "NOT CONNECTED"
    },
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: "💬", // Changed from 📱 to 💬 to differentiate from Telegram
      description: "QR code pairing via Hermes framework",
      color: "from-green-600 to-green-700",
      features: ["QR code setup", "Business messaging", "Media sharing", "Groups"],
      enabled: true,
      setupFields: [], // WhatsApp uses QR code, no manual fields needed
      status: "NOT CONNECTED"
    },
    { 
      id: "slack", 
      name: "Slack", 
      icon: "🔧", // More appropriate icon for Slack
      description: "Bolt SDK, workspace apps",
      color: "from-green-500 to-emerald-600",
      features: ["Channels", "Direct messages", "Slash commands", "Interactive messages"],
      enabled: false,
      comingSoon: true,
      status: "COMING SOON"
    },
    { 
      id: "signal", 
      name: "Signal", 
      icon: "🔒", // Privacy-focused icon
      description: "Privacy-focused via signal-cli",
      color: "from-blue-400 to-blue-600",
      features: ["End-to-end encryption", "Groups", "Disappearing messages", "Voice calls"],
      enabled: false,
      comingSoon: true,
      status: "SOON"
    },
    { 
      id: "imessage", 
      name: "iMessage", 
      icon: "💬", 
      description: "Via BlueBubbles macOS server",
      color: "from-green-400 to-green-600",
      features: ["iPhone integration", "Group chats", "Media sharing", "Read receipts"],
      enabled: false,
      comingSoon: true,
      status: "SOON"
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
            <p className="text-white/60 mt-1">Connect your AI agent to Discord, Telegram, and other platforms using Hermes framework</p>
          </div>
          <button 
            onClick={() => {
              setSelectedType("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </button>
        </div>

        {/* Available Channel Types */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Channels
                <span className="text-sm text-white/40 font-normal">{CHANNEL_TYPES.length} channels</span>
              </h2>
              <p className="text-white/60 text-sm mt-1">Powered by Hermes framework - setup and manage channels through integrated CLI.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHANNEL_TYPES.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-6 bg-white/[0.03] border border-white/[0.08] rounded-xl transition-all duration-300",
                  type.enabled 
                    ? "hover:bg-white/[0.06] cursor-pointer hover:border-white/[0.12]" 
                    : "opacity-60"
                )}
                onClick={() => {
                  if (type.enabled) {
                    setSelectedType(type.id);
                    setShowAddModal(true);
                  }
                }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 hover:opacity-5 transition-opacity rounded-xl`} />
                
                {/* Coming Soon Badge */}
                {type.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-medium">
                      {type.status}
                    </span>
                  </div>
                )}
                
                <div className="relative">
                  {/* Icon and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                      type.enabled ? "bg-white/[0.08]" : "bg-white/[0.04]"
                    )}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-1">{type.name}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{type.description}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        type.enabled && type.status === "NOT CONNECTED" ? "bg-gray-400" :
                        type.enabled && type.status === "CONNECTED" ? "bg-green-400" :
                        "bg-orange-400"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        type.enabled && type.status === "NOT CONNECTED" ? "text-gray-400" :
                        type.enabled && type.status === "CONNECTED" ? "text-green-400" :
                        "text-orange-400"
                      )}>
                        {type.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {type.enabled ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedType(type.id);
                        setShowAddModal(true);
                      }}
                      className="w-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg py-2.5 px-4 text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      Click to configure →
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg py-2.5 px-4 text-white/40 text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Ask your bot to configure →
                    </button>
                  )}
                </div>
              </motion.div>
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
                Connect your first channel using Hermes framework integration for seamless platform management
              </p>
              <button
                onClick={() => {
                  setSelectedType("");
                  setShowAddModal(true);
                }}
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
                          {channel.agentName && (
                            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                              → {channel.agentName}
                            </span>
                          )}
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
          agents={agents}
        />
      )}
    </div>
  );
}

interface AddChannelModalProps {
  onClose: () => void;
  onSuccess: () => void;
  channelTypes: any[];
  selectedType?: string;
  agents: any[];
}

function AddChannelModal({ onClose, onSuccess, channelTypes, selectedType: initialType, agents }: AddChannelModalProps) {
  const [selectedType, setSelectedType] = useState(initialType || "");
  const [selectedAgent, setSelectedAgent] = useState("");
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

  // Auto-select first agent if only one exists
  useEffect(() => {
    if (agents.length === 1 && !selectedAgent) {
      setSelectedAgent(agents[0].id);
    }
  }, [agents, selectedAgent]);

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
        title: "Setup WhatsApp via Hermes",
        steps: [
          "1. Click 'Connect to WhatsApp' below",
          "2. Hermes will generate a QR code",
          "3. Open WhatsApp on your phone",
          "4. Scan the QR code to pair your account"
        ]
      }
    };
    return instructions[channelType];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgent) {
      alert('Please select an agent to connect this channel to.');
      return;
    }
    
    setLoading(true);

    try {
      const config: any = {
        name: formData.name,
        type: selectedType,
        agentId: selectedAgent
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
        const result = await response.json();
        alert(`✅ ${selectedChannel?.name} channel connected successfully to your agent!`);
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
                {/* Agent Selection */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Select Agent to Connect
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  {agents.length === 0 ? (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <p className="text-orange-400 text-sm">
                        No agents found. Please create an agent first in the Agents section.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    >
                      <option value="" className="bg-[#1a1a1a]">Choose an agent...</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id} className="bg-[#1a1a1a]">
                          {agent.name} ({agent.model})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

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
                    disabled={loading || !formData.name || !selectedAgent || (selectedType !== 'whatsapp' && !formData.botToken)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {loading ? "Connecting..." : `Connect to ${selectedChannel?.name}`}
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
                    💡 Tip: WhatsApp setup uses QR code pairing through Hermes framework - no API keys needed!
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