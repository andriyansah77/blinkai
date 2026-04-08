"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Database, MessageSquare, Settings, Globe, Lock, Activity, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

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
      id: "discord", 
      name: "Discord", 
      icon: "🎮", 
      description: "Connect to Discord servers",
      color: "from-indigo-500 to-purple-600"
    },
    { 
      id: "telegram", 
      name: "Telegram", 
      icon: "✈️", 
      description: "Telegram bot integration",
      color: "from-blue-500 to-cyan-600"
    },
    { 
      id: "slack", 
      name: "Slack", 
      icon: "💼", 
      description: "Slack workspace bot",
      color: "from-green-500 to-emerald-600"
    },
    { 
      id: "whatsapp", 
      name: "WhatsApp", 
      icon: "📱", 
      description: "WhatsApp Business API",
      color: "from-green-600 to-green-700"
    },
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
          <h2 className="text-lg font-semibold text-white mb-4">Available Platforms</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CHANNEL_TYPES.map((type) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowAddModal(true)}
                className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] transition-colors text-left group"
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <h3 className="font-medium text-white text-sm mb-1">{type.name}</h3>
                <p className="text-xs text-white/40">{type.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Connect</span>
                  <ExternalLink className="w-3 h-3" />
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
    username: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          name: formData.name,
          config: {
            botToken: formData.botToken,
            serverId: formData.serverId,
            username: formData.username
          }
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        console.error('Failed to create channel');
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] border border-white/[0.08] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-white font-semibold text-lg mb-4">Connect New Channel</h2>
        
        {!selectedType ? (
          <div className="space-y-3">
            <p className="text-white/60 text-sm mb-4">Choose a platform to connect:</p>
            {channelTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h3 className="text-white font-medium">{type.name}</h3>
                    <p className="text-white/60 text-sm">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Channel Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder={`My ${selectedType} Bot`}
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Bot Token</label>
              <input
                type="password"
                value={formData.botToken}
                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Your bot token"
                required
              />
            </div>

            {selectedType === 'discord' && (
              <div>
                <label className="block text-white/60 text-sm mb-2">Server ID (Optional)</label>
                <input
                  type="text"
                  value={formData.serverId}
                  onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Discord server ID"
                />
              </div>
            )}

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
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
}