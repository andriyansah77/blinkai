"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Sparkles, Code, Zap, Settings, Search, Play, Star, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  usage: number;
  rating: number;
  agentId?: string;
  agentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function SkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const [skillsRes, agentsRes] = await Promise.all([
        fetch("/api/hermes/skills"),
        fetch("/api/hermes/agents")
      ]);

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData.skills || []);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
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

  const categories = ["all", ...Array.from(new Set(skills.map(skill => skill.category)))];
  
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'web': return '🌐';
      case 'analysis': return '📊';
      case 'text': return '📝';
      case 'code': return '💻';
      case 'data': return '🗄️';
      default: return '⚡';
    }
  };

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Skills
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage AI agent capabilities</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-foreground font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Skill
          </button>
        </div>

        {/* Featured Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold text-lg mb-1">
                  Earn Money by Creating Skills!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create and sell your own skills on Agent Place and earn money. No catch.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-green-600 hover:bg-green-700 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Create
              </button>
              <button className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Earn Money
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.05] border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/[0.05] border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-card">
                {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-semibold text-lg mb-2">
              {skills.length === 0 ? "No skills yet" : "No skills found"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {skills.length === 0 
                ? "Create your first skill to extend your AI agent's capabilities"
                : "Try adjusting your search or create a new skill"
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Skill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:bg-accent transition-colors"
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-xl">
                      {getCategoryIcon(skill.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{skill.name}</h3>
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{skill.description}</p>

                {/* Tags */}
                {skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {skill.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {skill.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{skill.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{skill.usage} uses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{skill.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Agent Info */}
                {skill.agentName && (
                  <div className="text-xs text-muted-foreground mb-4">
                    Agent: {skill.agentName}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    <Play className="w-3 h-3" />
                    Test
                  </button>
                  <button className="bg-accent hover:bg-accent/80 text-foreground py-2 px-3 rounded-lg text-sm transition-colors">
                    <Code className="w-4 h-4" />
                  </button>
                </div>

                {/* Created Date */}
                <p className="text-muted-foreground/60 text-xs mt-3">
                  Created {new Date(skill.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Skill Modal */}
      {showCreateModal && (
        <CreateSkillModal
          agents={agents}
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

interface CreateSkillModalProps {
  agents: Agent[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateSkillModal({ agents, onClose, onSuccess }: CreateSkillModalProps) {
  const [formData, setFormData] = useState({
    agentId: "",
    name: "",
    description: "",
    category: "general",
    tags: "",
    code: `async function mySkill(params) {
  // Your skill code here
  const { input } = params;
  
  return {
    success: true,
    result: "Hello from skill!",
    input
  };
}

return mySkill(params);`
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/hermes/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        console.error("Failed to create skill:", error);
      }
    } catch (error) {
      console.error("Failed to create skill:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-foreground font-semibold text-lg mb-4">Create New Skill</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-muted-foreground text-sm mb-2">Agent</label>
            <select
              value={formData.agentId}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            >
              <option value="">Select an agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground text-sm mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="My Skill"
                required
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="general">General</option>
                <option value="web">Web</option>
                <option value="analysis">Analysis</option>
                <option value="text">Text</option>
                <option value="code">Code</option>
                <option value="data">Data</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground text-sm mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              rows={3}
              placeholder="Describe what this skill does..."
            />
          </div>

          <div>
            <label className="block text-muted-foreground text-sm mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="web, scraping, data"
            />
          </div>

          <div>
            <label className="block text-muted-foreground text-sm mb-2">Code</label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
              rows={12}
              placeholder="Enter your skill code..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.agentId}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-foreground py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? "Creating..." : "Create Skill"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}




