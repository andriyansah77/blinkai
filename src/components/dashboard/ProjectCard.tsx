"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Trash2, ExternalLink, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  updatedAt: string;
  template?: string | null;
  onDelete: (id: string) => void;
}

export function ProjectCard({
  id,
  name,
  description,
  updatedAt,
  template,
  onDelete,
}: ProjectCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-card hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 overflow-hidden">
      {/* Preview area */}
      <div className="h-36 bg-gradient-to-br from-violet-950/50 via-purple-950/30 to-gray-950 flex items-center justify-center border-b border-border relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-purple-500/20 flex items-center justify-center">
          <Code2 className="w-6 h-6 text-purple-400" />
        </div>
        
        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button variant="gradient" size="sm" asChild>
            <Link href={`/builder/${id}`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Builder
            </Link>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-purple-400 transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1.5 hover:text-red-400 text-muted-foreground rounded-lg hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(updatedAt)}
          </span>
          {template && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {template}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
