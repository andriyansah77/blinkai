"use client";

import { useState, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  Download,
  Settings,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  projectName: string;
  onNameChange: (name: string) => void;
  onSave: () => Promise<void>;
  code: string;
  isSaving: boolean;
  savedRecently: boolean;
}

export function Toolbar({
  projectName,
  onNameChange,
  onSave,
  code,
  isSaving,
  savedRecently,
}: ToolbarProps) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);

  function startEdit() {
    setNameValue(projectName);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitName() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== projectName) {
      onNameChange(trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitName();
    if (e.key === "Escape") {
      setNameValue(projectName);
      setEditing(false);
    }
  }

  async function handleExport() {
    if (!code.trim()) return;
    setExporting(true);
    try {
      // Dynamically import JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Add standalone index.html
      zip.file("index.html", code);

      // Also try to parse out separate files
      const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      const scriptMatch = code.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);

      if (styleMatch || scriptMatch) {
        let cleanHtml = code;
        if (styleMatch) {
          cleanHtml = cleanHtml.replace(
            styleMatch[0],
            '<link rel="stylesheet" href="styles.css">'
          );
          zip.file("styles.css", styleMatch[1].trim());
        }
        if (scriptMatch) {
          cleanHtml = cleanHtml.replace(scriptMatch[0], '<script src="script.js"></script>');
          zip.file("script.js", scriptMatch[1].trim());
        }
        zip.file("index-split.html", cleanHtml);
      }

      // Add a README
      zip.file(
        "README.md",
        `# ${projectName}\n\nExported from BlinkAI.\n\nOpen \`index.html\` in your browser to view the app.\n`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-2 shrink-0">
      {/* Back */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {/* Divider */}
      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      {/* Logo */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Project name */}
      <div className="flex-1 min-w-0 mx-2">
        {editing ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xs bg-background border border-ring rounded-md px-2 py-0.5 text-sm font-medium focus:outline-none"
          />
        ) : (
          <button
            onClick={startEdit}
            className="text-sm font-medium truncate max-w-xs hover:text-primary transition-colors block"
            title="Click to rename"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            "h-7 px-2.5 text-xs",
            savedRecently && "border-green-500/30 text-green-400"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : savedRecently ? (
            <Check className="w-3.5 h-3.5 mr-1" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          {savedRecently ? "Saved" : "Save"}
        </Button>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting || !code.trim()}
          className="h-7 px-2.5 text-xs"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-1" />
          )}
          Export
        </Button>

        {/* Settings */}
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Settings">
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
