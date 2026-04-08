"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREVIEW_MODES } from "@/types";

interface PreviewPanelProps {
  code: string;
}

const ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
} as const;

export function PreviewPanel({ code }: PreviewPanelProps) {
  const [mode, setMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [key, setKey] = useState(0); // force iframe refresh
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentMode = PREVIEW_MODES.find((m) => m.mode === mode) || PREVIEW_MODES[0];

  function refresh() {
    setKey((k) => k + 1);
  }

  const isEmpty = !code.trim();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
        {/* Mode toggles */}
        <div className="flex items-center gap-0.5 bg-background border border-border rounded-lg p-0.5">
          {PREVIEW_MODES.map((m) => {
            const Icon = ICONS[m.mode];
            return (
              <button
                key={m.mode}
                onClick={() => setMode(m.mode)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  mode === m.mode
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={`${m.mode} (${m.width}px)`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline capitalize">{m.mode}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-muted-foreground ml-1">
          {currentMode.width === 1280 ? "Full width" : `${currentMode.width}px`}
        </span>

        <div className="ml-auto">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-zinc-200 dark:bg-zinc-800 flex items-start justify-center p-4 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
              <Monitor className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Preview will appear here</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Ask the AI to generate code to see a live preview
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300",
              mode === "desktop" ? "w-full" : ""
            )}
            style={{
              width: mode === "desktop" ? "100%" : `${currentMode.width}px`,
              minHeight: "100%",
            }}
          >
            <iframe
              key={key}
              ref={iframeRef}
              srcDoc={code}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              className="w-full border-0"
              style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}
              onLoad={() => setLoading(false)}
              title="Live Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
