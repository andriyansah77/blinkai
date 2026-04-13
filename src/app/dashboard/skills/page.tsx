"use client";

import { useSession } from "next-auth/react";
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
  Download
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchSkills();
    }
  }, [status, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        fetchSkills(true); // Silent refresh
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

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

  if (status === "loading" || loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="text-muted-foreground text-sm">Loading skills...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
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
              onClick={() => window.open('https://github.com/NousResearch/hermes-agent', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-foreground font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Browse Hub
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
                    className="flex-1 bg-accent hover:bg-accent/80 text-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    title="View details"
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
    </div>
  );
}







