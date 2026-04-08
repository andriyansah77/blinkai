"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Folder, File, Plus, Upload, Download, Settings, Search, Grid, List } from "lucide-react";
import { motion } from "framer-motion";

interface WorkspaceItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  path: string;
}

const MOCK_WORKSPACE: WorkspaceItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    modified: "2 hours ago",
    path: "/workspace/documents",
  },
  {
    id: "2",
    name: "Scripts",
    type: "folder",
    modified: "1 day ago",
    path: "/workspace/scripts",
  },
  {
    id: "3",
    name: "config.json",
    type: "file",
    size: "2.4 KB",
    modified: "3 hours ago",
    path: "/workspace/config.json",
  },
  {
    id: "4",
    name: "README.md",
    type: "file",
    size: "1.2 KB",
    modified: "1 day ago",
    path: "/workspace/README.md",
  },
  {
    id: "5",
    name: "logs.txt",
    type: "file",
    size: "45.6 KB",
    modified: "5 minutes ago",
    path: "/workspace/logs.txt",
  },
];

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WorkspaceItem[]>(MOCK_WORKSPACE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#0A0A0A] text-white overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Folder className="w-6 h-6 text-orange-400" />
              Workspace
            </h1>
            <p className="text-white/60 mt-1">Manage files and folders in your workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white/60 hover:text-white transition-colors">
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list" 
                  ? "bg-white/[0.1] text-white" 
                  : "text-white/40 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid" 
                  ? "bg-white/[0.1] text-white" 
                  : "text-white/40 hover:text-white hover:bg-white/[0.06]"
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
                className="flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  {item.type === "folder" ? (
                    <Folder className="w-4 h-4 text-orange-400" />
                  ) : (
                    <File className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <p className="text-xs text-white/40">{item.path}</p>
                </div>
                
                <div className="text-right">
                  {item.size && (
                    <p className="text-sm text-white/60">{item.size}</p>
                  )}
                  <p className="text-xs text-white/40">{item.modified}</p>
                </div>
                
                <button className="text-white/40 hover:text-white transition-colors">
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
                className="p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-lg transition-colors cursor-pointer text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  {item.type === "folder" ? (
                    <Folder className="w-6 h-6 text-orange-400" />
                  ) : (
                    <File className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                
                <h3 className="font-medium text-white text-sm truncate mb-1">{item.name}</h3>
                {item.size && (
                  <p className="text-xs text-white/40">{item.size}</p>
                )}
                <p className="text-xs text-white/40">{item.modified}</p>
              </motion.div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">
              {searchQuery ? "No files found" : "Workspace is empty"}
            </h3>
            <p className="text-white/40 text-sm">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Upload files or create folders to get started"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}