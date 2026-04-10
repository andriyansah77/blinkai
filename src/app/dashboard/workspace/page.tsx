"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Folder, File, Plus, Upload, Download, Settings, Search, Grid, List, FileText, Code, Database, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface WorkspaceItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  path: string;
  category: "hermes" | "config" | "sessions" | "skills" | "logs" | "user";
  description?: string;
}

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      fetchWorkspaceData();
    }
  }, [status, router]);

  const fetchWorkspaceData = async () => {
    try {
      setLoading(true);
      
      // Fetch Hermes workspace data
      const [statusRes, sessionsRes, skillsRes, configRes] = await Promise.all([
        fetch("/api/hermes/status"),
        fetch("/api/hermes/sessions"),
        fetch("/api/hermes/skills"),
        fetch("/api/hermes/config")
      ]);

      const [statusData, sessionsData, skillsData, configData] = await Promise.all([
        statusRes.ok ? statusRes.json() : null,
        sessionsRes.ok ? sessionsRes.json() : null,
        skillsRes.ok ? skillsRes.json() : null,
        configRes.ok ? configRes.json() : null
      ]);

      // Build workspace items from Hermes data
      const workspaceItems: WorkspaceItem[] = [];

      // Hermes Profile Directory
      if (statusData?.profile) {
        workspaceItems.push({
          id: 'hermes-profile',
          name: 'Hermes Profile',
          type: 'folder',
          modified: 'Active',
          path: statusData.profile.home || '/tmp/hermes-profiles/user-profile',
          category: 'hermes',
          description: 'Your isolated Hermes agent profile directory'
        });

        // Configuration files
        workspaceItems.push({
          id: 'hermes-config',
          name: 'config.yaml',
          type: 'file',
          size: '2.1 KB',
          modified: '1 hour ago',
          path: `${statusData.profile.home}/config.yaml`,
          category: 'config',
          description: 'Hermes agent configuration'
        });

        workspaceItems.push({
          id: 'hermes-env',
          name: '.env',
          type: 'file',
          size: '0.8 KB',
          modified: '2 hours ago',
          path: `${statusData.profile.home}/.env`,
          category: 'config',
          description: 'Environment variables and API keys'
        });

        workspaceItems.push({
          id: 'hermes-soul',
          name: 'SOUL.md',
          type: 'file',
          size: '1.5 KB',
          modified: '30 minutes ago',
          path: `${statusData.profile.home}/SOUL.md`,
          category: 'config',
          description: 'Agent personality and behavior configuration'
        });
      }

      // Sessions
      if (sessionsData?.sessions) {
        workspaceItems.push({
          id: 'sessions-folder',
          name: 'Chat Sessions',
          type: 'folder',
          modified: 'Recently active',
          path: '/hermes/sessions',
          category: 'sessions',
          description: `${sessionsData.sessions.length} conversation sessions`
        });

        sessionsData.sessions.slice(0, 5).forEach((session: any, index: number) => {
          workspaceItems.push({
            id: `session-${session.id}`,
            name: session.title || `Session ${session.id}`,
            type: 'file',
            size: `${session.messageCount || 0} messages`,
            modified: session.lastActivity || session.created,
            path: `/hermes/sessions/${session.id}.json`,
            category: 'sessions',
            description: 'Chat conversation history'
          });
        });
      }

      // Skills
      if (skillsData?.skills) {
        const installedSkills = skillsData.skills.filter((s: any) => s.installed);
        
        if (installedSkills.length > 0) {
          workspaceItems.push({
            id: 'skills-folder',
            name: 'Installed Skills',
            type: 'folder',
            modified: 'Recently updated',
            path: '/hermes/skills',
            category: 'skills',
            description: `${installedSkills.length} installed skills`
          });

          installedSkills.slice(0, 8).forEach((skill: any) => {
            workspaceItems.push({
              id: `skill-${skill.name}`,
              name: `${skill.name}.py`,
              type: 'file',
              size: '5.2 KB',
              modified: '1 day ago',
              path: `/hermes/skills/${skill.name}.py`,
              category: 'skills',
              description: skill.description || 'Hermes skill module'
            });
          });
        }
      }

      // Logs and system files
      workspaceItems.push(
        {
          id: 'logs-folder',
          name: 'Logs',
          type: 'folder',
          modified: 'Live updates',
          path: '/hermes/logs',
          category: 'logs',
          description: 'System and chat logs'
        },
        {
          id: 'hermes-log',
          name: 'hermes.log',
          type: 'file',
          size: '156 KB',
          modified: '2 minutes ago',
          path: '/hermes/logs/hermes.log',
          category: 'logs',
          description: 'Main Hermes agent log file'
        },
        {
          id: 'chat-log',
          name: 'chat.log',
          type: 'file',
          size: '89 KB',
          modified: '5 minutes ago',
          path: '/hermes/logs/chat.log',
          category: 'logs',
          description: 'Chat conversation logs'
        },
        {
          id: 'gateway-log',
          name: 'gateway.log',
          type: 'file',
          size: '23 KB',
          modified: '10 minutes ago',
          path: '/hermes/logs/gateway.log',
          category: 'logs',
          description: 'Platform gateway connection logs'
        }
      );

      // User data
      workspaceItems.push(
        {
          id: 'user-data',
          name: 'User Data',
          type: 'folder',
          modified: 'Active',
          path: '/user',
          category: 'user',
          description: 'Your personal files and uploads'
        },
        {
          id: 'user-uploads',
          name: 'uploads',
          type: 'folder',
          modified: '1 hour ago',
          path: '/user/uploads',
          category: 'user',
          description: 'Uploaded files and documents'
        }
      );

      setItems(workspaceItems);
    } catch (error) {
      console.error("Failed to fetch workspace data:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (item: WorkspaceItem) => {
    if (item.type === "folder") {
      switch (item.category) {
        case "hermes": return <Folder className="w-5 h-5 text-purple-400" />;
        case "config": return <Folder className="w-5 h-5 text-primary" />;
        case "sessions": return <Folder className="w-5 h-5 text-green-400" />;
        case "skills": return <Folder className="w-5 h-5 text-orange-400" />;
        case "logs": return <Folder className="w-5 h-5 text-red-400" />;
        case "user": return <Folder className="w-5 h-5 text-cyan-400" />;
        default: return <Folder className="w-5 h-5 text-gray-400" />;
      }
    } else {
      if (item.name.endsWith('.yaml') || item.name.endsWith('.yml')) {
        return <Settings className="w-5 h-5 text-primary" />;
      } else if (item.name.endsWith('.md')) {
        return <FileText className="w-5 h-5 text-green-400" />;
      } else if (item.name.endsWith('.py') || item.name.endsWith('.js')) {
        return <Code className="w-5 h-5 text-orange-400" />;
      } else if (item.name.endsWith('.log')) {
        return <FileText className="w-5 h-5 text-red-400" />;
      } else if (item.name.endsWith('.json')) {
        return <Database className="w-5 h-5 text-purple-400" />;
      } else if (item.name.endsWith('.env')) {
        return <Settings className="w-5 h-5 text-yellow-400" />;
      } else {
        return <File className="w-5 h-5 text-gray-400" />;
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "hermes": return "bg-purple-500/20 text-purple-400";
      case "config": return "bg-blue-500/20 text-primary";
      case "sessions": return "bg-green-500/20 text-green-400";
      case "skills": return "bg-orange-500/20 text-orange-400";
      case "logs": return "bg-red-500/20 text-red-400";
      case "user": return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-gray-500/20 text-gray-400";
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

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "All Files", count: items.length },
    { id: "hermes", name: "Hermes", count: items.filter(i => i.category === "hermes").length },
    { id: "config", name: "Config", count: items.filter(i => i.category === "config").length },
    { id: "sessions", name: "Sessions", count: items.filter(i => i.category === "sessions").length },
    { id: "skills", name: "Skills", count: items.filter(i => i.category === "skills").length },
    { id: "logs", name: "Logs", count: items.filter(i => i.category === "logs").length },
    { id: "user", name: "User Data", count: items.filter(i => i.category === "user").length },
  ];

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Folder className="w-6 h-6 text-orange-400" />
              Hermes Workspace
            </h1>
            <p className="text-muted-foreground mt-1">Manage your Hermes agent files and data</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/80 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-foreground font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New File
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-orange-600 text-foreground"
                  : "bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80"
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs bg-white/[0.2] px-1.5 py-0.5 rounded">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.05] border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" 
                  ? "bg-white/[0.1] text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" 
                  ? "bg-white/[0.1] text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File List */}
        {viewMode === "list" ? (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-card hover:bg-accent border border-border rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  {getItemIcon(item)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.description || item.path}</p>
                </div>
                
                <div className="text-right">
                  {item.size && (
                    <p className="text-sm text-muted-foreground">{item.size}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{item.modified}</p>
                </div>
                
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-card hover:bg-accent border border-border rounded-lg transition-colors cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                  {getItemIcon(item)}
                </div>
                
                <h3 className="font-medium text-foreground text-sm truncate mb-1">{item.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)} mb-2 inline-block`}>
                  {item.category}
                </span>
                {item.size && (
                  <p className="text-xs text-muted-foreground">{item.size}</p>
                )}
                <p className="text-xs text-muted-foreground">{item.modified}</p>
              </motion.div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery ? "No files found" : "Workspace is empty"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {searchQuery 
                ? "Try adjusting your search terms or category filter" 
                : "Your Hermes workspace will populate as you use the agent"
              }
            </p>
            {!searchQuery && (
              <button
                onClick={fetchWorkspaceData}
                className="bg-orange-600 hover:bg-orange-700 text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Workspace
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}





