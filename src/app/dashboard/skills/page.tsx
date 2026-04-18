"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Plus, 
  Sparkles, 
  Code, 
  Settings, 
  Search, 
  RefreshCw,
  Package,
  Globe,
  Database,
  FileText,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  Download,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

interface Skill {
  name: string;
  source: string;
  description: string;
  installed: boolean;
  enabled: boolean;
}

export default function SkillsPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/sign-in");
    } else if (ready && authenticated) {
      fetchSkills();
    }
  }, [ready, authenticated, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (ready && authenticated) {
      const interval = setInterval(() => {
        fetchSkills(true); // Silent refresh
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [ready, authenticated]);

  const fetchSkills = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      
      const response = await fetch("/api/hermes/skills");
      
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
      } else {
        console.error("Failed to fetch skills:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUninstall = async (skillName: string) => {
    if (!confirm(`Are you sure you want to uninstall "${skillName}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/hermes/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "uninstall",
          skillName
        }),
      });

      if (response.ok) {
        await fetchSkills();
      } else {
        const error = await response.json();
        alert(`Failed to uninstall skill: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to uninstall skill:", error);
      alert("Failed to uninstall skill");
    }
  };

  if (!ready || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-muted-foreground text-sm">Loading skills...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const sources = ["all", ...Array.from(new Set(skills.map(skill => skill.source)))];
  
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = selectedSource === "all" || skill.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'builtin': return <Package className="w-5 h-5 text-blue-400" />;
      case 'local': return <Cpu className="w-5 h-5 text-green-400" />;
      case 'hub': return <Globe className="w-5 h-5 text-purple-400" />;
      default: return <Zap className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getCategoryIcon = (description: string) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('web') || desc.includes('http')) return <Globe className="w-5 h-5" />;
    if (desc.includes('data') || desc.includes('database')) return <Database className="w-5 h-5" />;
    if (desc.includes('code') || desc.includes('programming')) return <Code className="w-5 h-5" />;
    if (desc.includes('text') || desc.includes('document')) return <FileText className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const installedCount = skills.filter(s => s.installed).length;
  const builtinCount = skills.filter(s => s.source === 'builtin').length;
  const localCount = skills.filter(s => s.source === 'local').length;

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Skills Management
            </h1>
            <p className="text-muted-foreground mt-1">
              {installedCount} skills installed • {builtinCount} builtin • {localCount} local
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchSkills()}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-foreground font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => router.push('/docs')}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-foreground font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Documentation
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Builtin Skills</p>
                <p className="text-foreground text-2xl font-bold">{builtinCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Local Skills</p>
                <p className="text-foreground text-2xl font-bold">{localCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Installed</p>
                <p className="text-foreground text-2xl font-bold">{installedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search skills by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.05] border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-white/[0.05] border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {sources.map(source => (
              <option key={source} value={source} className="bg-card">
                {source === "all" ? "All Sources" : source.charAt(0).toUpperCase() + source.slice(1)}
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
              {skills.length === 0 ? "No skills found" : "No matching skills"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {skills.length === 0 
                ? "Skills will appear here once they are installed via Hermes CLI"
                : "Try adjusting your search or filter"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-purple-500/50 transition-all group"
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(skill.description)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{skill.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getSourceIcon(skill.source)}
                        <span className="text-xs text-muted-foreground">
                          {skill.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  {skill.installed && (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {skill.description || 'No description available'}
                </p>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  {skill.enabled ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Disabled
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  {skill.source === 'local' && (
                    <button
                      onClick={() => handleUninstall(skill.name)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Uninstall
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedSkill(skill);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  {getCategoryIcon(selectedSkill.description)}
                </div>
                <div>
                  <h2 className="text-foreground font-semibold text-xl">{selectedSkill.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getSourceIcon(selectedSkill.source)}
                    <span className="text-sm text-muted-foreground">{selectedSkill.source}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSkill(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mb-6">
              {selectedSkill.installed && (
                <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Installed
                </span>
              )}
              {selectedSkill.enabled ? (
                <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Enabled
                </span>
              ) : (
                <span className="text-sm bg-gray-500/20 text-gray-400 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Disabled
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-foreground font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {selectedSkill.description || 'No description available'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Source</span>
                </div>
                <p className="text-foreground font-medium">{selectedSkill.source}</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Status</span>
                </div>
                <p className="text-foreground font-medium">
                  {selectedSkill.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            {/* Installation Info */}
            <div className="bg-accent/30 border border-border rounded-lg p-4 mb-6">
              <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Installation
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-sm">•</span>
                  <p className="text-muted-foreground text-sm">
                    This skill is managed by Hermes CLI
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground text-sm">•</span>
                  <p className="text-muted-foreground text-sm">
                    To use this skill, reference it in your agent configuration
                  </p>
                </div>
                {selectedSkill.source === 'local' && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground text-sm">•</span>
                    <p className="text-muted-foreground text-sm">
                      Local skills can be uninstalled from this interface
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedSkill.source === 'local' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleUninstall(selectedSkill.name);
                  }}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Uninstall Skill
                </button>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSkill(null);
                }}
                className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2.5 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}







