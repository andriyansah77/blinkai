"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, MessageSquare, Code2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ChatPanel, Message } from "@/components/builder/ChatPanel";
import { CodeEditor } from "@/components/builder/CodeEditor";
import { PreviewPanel } from "@/components/builder/PreviewPanel";
import { Toolbar } from "@/components/builder/Toolbar";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type PanelId = "chat" | "code" | "preview";

interface Project {
  id: string;
  name: string;
  code: string;
  messages: Message[];
}

export default function BuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>("chat");
  const savedRecentlyTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && projectId) fetchProject();
  }, [status, projectId]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Project not found");
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to load project");
      }
      const data = await res.json();
      setProject(data);
      setCode(data.code || "");
      // Parse messages — they come back as objects but timestamps are strings
      const msgs: Message[] = (data.messages || []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(msgs);
    } catch (err) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  async function saveProject() {
    if (!project) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name,
          code,
          messages: messages.map((m) => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSavedRecently(true);
      if (savedRecentlyTimer.current) clearTimeout(savedRecentlyTimer.current);
      savedRecentlyTimer.current = setTimeout(() => setSavedRecently(false), 2000);
    } catch (err) {
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  }

  function handleNameChange(name: string) {
    if (!project) return;
    setProject({ ...project, name });
    // Persist immediately
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => toast.error("Failed to rename project"));
  }

  function handleCodeGenerated(newCode: string) {
    setCode(newCode);
    // Auto-switch to preview on mobile/tablet
    if (window.innerWidth < 1024) setActivePanel("preview");
  }

  // Auto-save when messages change (debounced)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!project || messages.length === 0) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          messages: messages.map((m) => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
        }),
      }).catch(() => {});
    }, 3000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [messages, code]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        projectName={project.name}
        onNameChange={handleNameChange}
        onSave={saveProject}
        code={code}
        isSaving={isSaving}
        savedRecently={savedRecently}
      />

      {/* Mobile panel tabs */}
      <div className="flex lg:hidden border-b border-border bg-card shrink-0">
        {(
          [
            { id: "chat", icon: MessageSquare, label: "Chat" },
            { id: "code", icon: Code2, label: "Code" },
            { id: "preview", icon: Eye, label: "Preview" },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2",
              activePanel === id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop: three-column layout */}
        {/* On mobile: show only the active panel */}

        {/* Chat Panel — single instance, shown/hidden via CSS only */}
        <div
          className={cn(
            "flex-col border-r border-border lg:w-[320px] xl:w-[360px] shrink-0",
            activePanel === "chat" ? "flex w-full lg:w-[320px] xl:w-[360px]" : "hidden lg:flex"
          )}
        >
          <ChatPanel
            messages={messages}
            onMessagesChange={setMessages}
            onCodeGenerated={handleCodeGenerated}
            projectId={projectId}
            isGenerating={isGenerating}
            onGeneratingChange={setIsGenerating}
          />
        </div>

        {/* Code Editor — single instance */}
        <div
          className={cn(
            "flex-col border-r border-border lg:w-[380px] xl:w-[420px] shrink-0",
            activePanel === "code" ? "flex w-full lg:w-[380px] xl:w-[420px]" : "hidden lg:flex"
          )}
        >
          <CodeEditor code={code} onChange={setCode} />
        </div>

        {/* Preview Panel — single instance */}
        <div
          className={cn(
            "flex-col flex-1 min-w-0",
            activePanel === "preview" ? "flex" : "hidden lg:flex"
          )}
        >
          <PreviewPanel code={code} />
        </div>
      </div>
    </div>
  );
}
