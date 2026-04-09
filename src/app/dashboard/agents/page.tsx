"use client";

import { useState, useEffect } from "react";
import { Plus, Bot, Settings, Trash2, Play, Pause, Brain, Zap, MessageSquare, Download, Code, Star, Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  provider: string;
  skills: number;
  memory: {
    total: number;
    byType: Record<string, number>;
  };
  sessions: number;
  learningEnabled: boolean;
  createdAt: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  usage: number;
  code?: string;
  agentName?: string;
  agentId?: string;
}

type ViewMode = 'agents' | 'skills';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [skillTemplates, setSkillTemplates] = useState<Skill[]>([]);
  const [installedSkills, setInstalledSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('agents');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'productivity', 'data', 'marketing', 'analytics', 'communication'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch agents
      const agentsResponse = await fetch("/api/hermes/agents");
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents || []);
      }

      // Fetch skills
      const skillsResponse = await fetch("/api/hermes/skills");
      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkillTemplates(skillsData.templates || []);
        setInstalledSkills(skillsData.installed || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const installSkill = async (skillId: string, agentId: string) => {
    try {
      const response = await fetch("/api/hermes/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "install",
          skillId,
          agentId
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh data
        alert("Skill installed successfully!");
      }
    } catch (error) {
      console.error("Failed to install skill:", error);
      alert("Failed to install skill");
    }
  };

  const filteredSkills = skillTemplates.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-full bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0A0A0A] overflow-auto">
      {/* Header */}
      <div className="border-b border-white/[0.06] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {viewMode === 'agents' ? 'AI Agents' : 'Skills Marketplace'}
            </h1>
            <p className="text-white/60">
              {viewMode === 'agents' 
                ? 'Manage your Hermes-powered AI agents with learning capabilities'
                : 'Browse and install skills to enhance your agents'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white/[0.06] rounded-lg p-1">
              <button
                onClick={() => setViewMode('agents')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'agents'
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Bot className="w-4 h-4 inline mr-2" />
                Agents
              </button>
              <button
                onClick={() => setViewMode('skills')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'skills'
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Skills
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {viewMode === 'agents' ? 'Create Agent' : 'Create Skill'}
            </button>
          </div>
        </div>

        {/* Skills Filters */}
        {viewMode === 'skills' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-[#1a1a1a]">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'agents' ? (
          // Agents View
          agents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No agents yet</h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Create your first AI agent to get started. Agents can learn from conversations and improve over time.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Agent
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          )
        ) : (
          // Skills View
          <div>
            {/* Skills Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Available Skills</h3>
                    <p className="text-white/40 text-sm">Ready to install</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{skillTemplates.length}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Installed Skills</h3>
                    <p className="text-white/40 text-sm">Across all agents</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{installedSkills.length}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Categories</h3>
                    <p className="text-white/40 text-sm">Skill categories</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
              </div>
            </div>

            {/* Skills Grid */}
            {filteredSkills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No skills found</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Try adjusting your search or category filter to find skills.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill, index) => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    index={index} 
                    agents={agents}
                    onInstall={installSkill}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

interface CreateAgentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateAgentModal({ onClose, onSuccess }: CreateAgentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model: "gpt-4o",
    provider: "openai",
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 4000,
    learningEnabled: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/hermes/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        console.error("Failed to create agent:", error);
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
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
        <h2 className="text-white font-semibold text-lg mb-4">Create New Agent</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="My AI Assistant"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              rows={3}
              placeholder="Describe what this agent does..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-sm mb-2">Model</label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2">Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="openai">OpenAI</option>
                <option value="groq">Groq</option>
                <option value="together">Together AI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">System Prompt</label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              rows={4}
              placeholder="You are a helpful AI assistant..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="learningEnabled"
              checked={formData.learningEnabled}
              onChange={(e) => setFormData({ ...formData, learningEnabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-white/[0.06] border-white/[0.08] rounded focus:ring-blue-500"
            />
            <label htmlFor="learningEnabled" className="text-white/60 text-sm">
              Enable learning from conversations
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? "Creating..." : "Create Agent"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Agent Card Component
function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
    >
      {/* Agent Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{agent.name}</h3>
            <p className="text-white/40 text-sm">{agent.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agent.learningEnabled && (
            <div className="w-2 h-2 bg-green-400 rounded-full" title="Learning Enabled" />
          )}
          <button className="text-white/40 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/60 text-sm mb-4 line-clamp-2">
        {agent.description || "No description provided"}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Brain className="w-3 h-3 text-purple-400" />
            <span className="text-white font-semibold text-sm">{agent.skills}</span>
          </div>
          <p className="text-white/40 text-xs">Skills</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-white font-semibold text-sm">{agent.memory.total}</span>
          </div>
          <p className="text-white/40 text-xs">Memories</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageSquare className="w-3 h-3 text-green-400" />
            <span className="text-white font-semibold text-sm">{agent.sessions}</span>
          </div>
          <p className="text-white/40 text-xs">Sessions</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => window.location.href = `/dashboard/agents/${agent.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          Chat
        </button>
        <button className="bg-white/[0.06] hover:bg-white/[0.1] text-white py-2 px-3 rounded-lg text-sm transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Created Date */}
      <p className="text-white/30 text-xs mt-3">
        Created {new Date(agent.createdAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
}

// Skill Card Component
function SkillCard({ 
  skill, 
  index, 
  agents, 
  onInstall 
}: { 
  skill: Skill; 
  index: number; 
  agents: Agent[];
  onInstall: (skillId: string, agentId: string) => void;
}) {
  const [showInstallModal, setShowInstallModal] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      productivity: "bg-blue-500/20 text-blue-400",
      data: "bg-green-500/20 text-green-400",
      marketing: "bg-purple-500/20 text-purple-400",
      analytics: "bg-orange-500/20 text-orange-400",
      communication: "bg-pink-500/20 text-pink-400"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
      >
        {/* Skill Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getCategoryColor(skill.category))}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{skill.name}</h3>
              <p className="text-white/40 text-sm capitalize">{skill.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white/60 text-sm">{skill.rating}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm mb-4 line-clamp-2">
          {skill.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-white/[0.06] text-white/60 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/[0.06] text-white/60 text-xs rounded-md">
              +{skill.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3 text-white/40" />
              <span className="text-white/60 text-sm">{skill.usage}</span>
            </div>
            <div className="flex items-center gap-1">
              <Code className="w-3 h-3 text-white/40" />
              <span className="text-white/60 text-sm">JS</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button className="bg-white/[0.06] hover:bg-white/[0.1] text-white py-2 px-3 rounded-lg text-sm transition-colors">
            <Code className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInstallModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-lg mb-4">
                Install "{skill.name}"
              </h3>
              <p className="text-white/60 text-sm mb-6">
                Choose which agent to install this skill on:
              </p>

              <div className="space-y-3 mb-6">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onInstall(skill.id, agent.id);
                      setShowInstallModal(false);
                    }}
                    className="w-full p-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{agent.name}</p>
                        <p className="text-white/40 text-sm">{agent.skills} skills installed</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}