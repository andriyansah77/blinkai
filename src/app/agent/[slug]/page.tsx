"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Send, Loader2, Lock, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AgentInfo {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  isPublic: boolean;
  template: string;
  userId: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const key = "hermesai_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const messageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function PublicAgentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditError, setCreditError] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadAgent() {
      try {
        const res = await fetch(`/api/agent-public/${slug}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = (await res.json()) as AgentInfo;
        setAgent(data);
        if (!data.isPublic) {
          setIsPrivate(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadAgent();
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxH = 4 * 24;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxH)}px`;
    }
  }, [input]);

  async function sendMessage() {
    if (!input.trim() || sending || !agent) return;
    const userText = input.trim();
    setInput("");
    setError(null);
    setCreditError(false);
    setSending(true);
    setStreamingContent("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
    };
    setMessages((prev) => [...prev, userMsg]);

    const visitorId = getOrCreateVisitorId();

    try {
      const res = await fetch(`/api/agents/${agent.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          sessionId: sessionId || undefined,
          visitorId,
        }),
      });

      if (res.status === 402) {
        setCreditError(true);
        throw new Error("This agent has run out of credits");
      }

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Failed to send message");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let newSessionId = sessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();

          try {
            const json = JSON.parse(data) as {
              type: string;
              content?: string;
              sessionId?: string;
              error?: string;
            };

            if (json.type === "session" && json.sessionId) {
              newSessionId = json.sessionId;
              setSessionId(json.sessionId);
            } else if (json.type === "delta" && json.content) {
              fullContent += json.content;
              setStreamingContent(fullContent);
            } else if (json.type === "error") {
              throw new Error(json.error || "Stream error");
            }
          } catch {
            // skip malformed
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullContent,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
      if (newSessionId) setSessionId(newSessionId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-5">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Agent not found</h1>
          <p className="text-zinc-500 text-sm">This agent doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // ── Private ────────────────────────────────────────────────────────────────
  if (isPrivate) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-center px-4">
        <div className="max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-4xl mx-auto mb-5">
            {agent?.avatar || "🔒"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{agent?.name}</h1>
          <div className="flex items-center justify-center gap-2 text-zinc-500 mb-3">
            <Lock className="w-4 h-4" />
            <span className="text-sm">This agent is private</span>
          </div>
          <p className="text-xs text-zinc-600">
            The owner has restricted access to this agent. Only the owner can chat with it.
          </p>
        </div>
      </div>
    );
  }

  // ── Main chat UI ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* ── Header (fixed, glass blur) ─────────────────────────────────── */}
      <header className="flex-none border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl px-4 py-3 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
            {agent?.avatar || "🤖"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-sm leading-tight">{agent?.name}</h1>
            {agent?.description && (
              <p className="text-xs text-zinc-500 truncate">{agent.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium shrink-0">
            <Zap className="w-3 h-3" />
            Powered by HermesAI
          </div>
        </div>
      </header>

      {/* ── Messages area ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Empty state / welcome */}
          {messages.length === 0 && !sending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl mx-auto mb-5">
                {agent?.avatar || "🤖"}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{agent?.name}</h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                Hi! I&apos;m {agent?.name}. How can I help you today?
              </p>
              {agent?.description && (
                <p className="text-zinc-600 text-xs mt-3 max-w-xs mx-auto">{agent.description}</p>
              )}
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                      : "bg-white/[0.06] border border-white/[0.08]"
                  )}
                >
                  {msg.role === "user" ? (
                    <span className="text-xs font-bold">U</span>
                  ) : (
                    <span>{agent?.avatar || "🤖"}</span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium rounded-tr-sm"
                      : "backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] text-zinc-100 rounded-tl-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming message */}
          {sending && streamingContent && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-3 flex-row"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-sm">
                <span>{agent?.avatar || "🤖"}</span>
              </div>
              <div className="max-w-[80%] backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] text-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{streamingContent}</p>
                <span className="inline-block w-1 h-4 bg-amber-400 animate-pulse ml-0.5 align-text-bottom" />
              </div>
            </motion.div>
          )}

          {/* Typing indicator */}
          {sending && !streamingContent && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-3 flex-row"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 text-sm">
                <span>{agent?.avatar || "🤖"}</span>
              </div>
              <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 items-center">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Credit error */}
          {creditError && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400"
            >
              <Zap className="w-4 h-4 shrink-0" />
              This agent has run out of credits and cannot respond at this time.
            </motion.div>
          )}

          {/* Generic error */}
          {error && !creditError && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input area (fixed bottom) ─────────────────────────────────── */}
      <div className="flex-none border-t border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-amber-500/30 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent?.name || "the agent"}…`}
              rows={1}
              disabled={sending}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-none disabled:opacity-50 max-h-24 leading-6"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="flex-none w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-amber-500/20 shrink-0"
            >
              {sending && !streamingContent ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-xs text-zinc-700">Ctrl+Enter to send</p>
            <p className="text-xs text-zinc-700">
              Powered by{" "}
              <span className="text-amber-500/60 font-medium">HermesAI</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
