"use client";

import { useState, useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Code, FileCode, Braces } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type EditorTab = "html" | "css" | "js";

interface ParsedCode {
  html: string;
  css: string;
  js: string;
}

function parseHtmlIntoTabs(fullHtml: string): ParsedCode {
  if (!fullHtml.trim()) return { html: "", css: "", js: "" };

  // Extract CSS from <style> tags
  const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const css = styleMatch ? styleMatch[1].trim() : "";

  // Extract JS from <script> tags (non-src)
  const scriptMatch = fullHtml.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);
  const js = scriptMatch ? scriptMatch[1].trim() : "";

  // For the HTML tab, return the full document (easier to understand the structure)
  return { html: fullHtml, css, js };
}

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const TAB_CONFIG: { id: EditorTab; label: string; icon: React.ReactNode; language: string }[] = [
  { id: "html", label: "HTML", icon: <FileCode className="w-3.5 h-3.5" />, language: "html" },
  { id: "css", label: "CSS", icon: <Braces className="w-3.5 h-3.5" />, language: "css" },
  { id: "js", label: "JS", icon: <Code className="w-3.5 h-3.5" />, language: "javascript" },
];

export function CodeEditor({ code, onChange }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const { resolvedTheme } = useTheme();
  const [parsed, setParsed] = useState<ParsedCode>({ html: "", css: "", js: "" });
  const isInternalUpdate = useRef(false);

  // When code prop changes (AI generated), re-parse
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setParsed(parseHtmlIntoTabs(code));
  }, [code]);

  function handleEditorChange(value: string | undefined, tab: EditorTab) {
    if (value === undefined) return;
    isInternalUpdate.current = true;

    const next = { ...parsed, [tab]: value };
    setParsed(next);

    // If editing the HTML tab, use its value directly as full code
    if (tab === "html") {
      onChange(value);
    } else {
      // When editing CSS/JS tabs separately, we can't easily re-inject back
      // so just propagate the full HTML as-is (user should edit HTML tab for full control)
      onChange(next.html);
    }
  }

  const currentValue =
    activeTab === "html" ? parsed.html : activeTab === "css" ? parsed.css : parsed.js;

  const currentLanguage =
    TAB_CONFIG.find((t) => t.id === activeTab)?.language || "html";

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-card shrink-0">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground border border-border shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          {code.length > 0 ? `${code.length.toLocaleString()} chars` : "No code yet"}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          language={currentLanguage}
          value={currentValue}
          theme={editorTheme}
          onChange={(value) => handleEditorChange(value, activeTab)}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "line",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-background">
              <div className="text-muted-foreground text-sm">Loading editor…</div>
            </div>
          }
        />
      </div>

      {/* Status bar */}
      <div className="px-4 py-1.5 border-t border-border bg-card shrink-0 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{currentLanguage.toUpperCase()}</span>
        <span>•</span>
        <span>UTF-8</span>
        {activeTab !== "html" && (
          <>
            <span>•</span>
            <span className="text-yellow-500/70">Edit the HTML tab for full control</span>
          </>
        )}
      </div>
    </div>
  );
}
