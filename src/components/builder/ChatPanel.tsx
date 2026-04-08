"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Bot, User, Loader2, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { extractCodeFromMarkdown } from "@/lib/utils";
import Link from "next/link";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onCodeGenerated: (code: string) => void;
  projectId: string;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

export function ChatPanel({
  messages,
  onMessagesChange,
  onCodeGenerated,
  projectId,
  isGenerating,
  onGeneratingChange,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [noApiKey, setNoApiKey] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Check on mount if API key is configured
  useEffect(() => {
    const cfg = readHermesConfig();
    const hasKey = !!(cfg?.hermes?.apiKey || cfg?.apiKey);
    setNoApiKey(!hasKey);
  }, []);

  function readHermesConfig(): Record<string, any> | null {
    if (typeof window === "undefined") return null;
    try {
      // Prefer new Hermes config
      const hermes = localStorage.getItem("hermes_config");
      if (hermes) {
        const parsed = JSON.parse(hermes);
        if (parsed?.apiKey) return { hermes: parsed };
      }
    } catch (e) {
      console.warn("[Hermes] Failed to read hermes_config:", e);
    }
    try {
      // Fallback to legacy blinkai_settings
      const legacy = localStorage.getItem("blinkai_settings");
      if (legacy) {
        const s = JSON.parse(legacy);
        if (s?.apiKey) return { apiKey: s.apiKey, baseUrl: s.baseUrl, model: s.model };
      }
    } catch (e) {
      console.warn("[Hermes] Failed to read blinkai_settings:", e);
    }
    return null;
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    const config = readHermesConfig();

    // Check API key before sending
    const hasKey = !!(config?.hermes?.apiKey || config?.apiKey);
    if (!hasKey) {
      setNoApiKey(true);
      setError("API key belum dikonfigurasi. Buka Dashboard → AI Engine → Hermes untuk set API key.");
      return;
    }

    setInput("");
    setError(null);
    setNoApiKey(false);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    onMessagesChange(updatedMessages);
    onGeneratingChange(true);
    setStreamingContent("");

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          ...(config ?? {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Generation failed");
      }

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Accumulate into buffer to handle partial SSE lines
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep last incomplete line in buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data:")) continue;
          const data = trimmedLine.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setStreamingContent(fullContent);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith("data:")) {
        const data = buffer.trim().slice(5).trim();
        if (data && data !== "[DONE]") {
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) fullContent += delta;
          } catch {}
        }
      }

      // Extract code from final response
      const { fullHtml } = extractCodeFromMarkdown(fullContent);
      if (fullHtml) {
        onCodeGenerated(fullHtml);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullContent,
        timestamp: new Date(),
      };

      onMessagesChange([...updatedMessages, assistantMessage]);
      setStreamingContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      // Remove the user message if generation failed
      onMessagesChange(messages);
    } finally {
      onGeneratingChange(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  }

  function renderMessageContent(content: string) {
    let result = content;

    // Strip BLINK markers + code inside
    result = result.replace(
      /<!--BLINK_START-->[\s\S]*?<!--BLINK_END-->/g,
      "✅ Code generated — check the preview!"
    );

    // Strip any fenced code blocks (```html, ```css, ```js, etc.)
    result = result.replace(/```[\w]*\n[\s\S]*?```/g, "✅ Code generated — check the preview!");
    result = result.replace(/```[\s\S]*?```/g, "✅ Code generated — check the preview!");

    // Strip raw <!DOCTYPE / <html blocks that leaked through (safety net)
    result = result.replace(/<!DOCTYPE[\s\S]*?<\/html>/gi, "✅ Code generated — check the preview!");

    // Collapse multiple consecutive "✅ Code generated" lines into one
    result = result.replace(/(✅ Code generated — check the preview!\n?){2,}/g, "✅ Code generated — check the preview!\n");

    return result.trim();
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-orange-500/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-orange-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold">AI Assistant</h2>
          <p className="text-xs text-muted-foreground">Powered by Hermes ⚡</p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-orange-400 transition-colors flex items-center gap-1"
          title="Configure AI in Dashboard"
        >
          <Settings className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* No API key banner */}
      {noApiKey && (
        <div className="mx-3 mt-3 flex items-start gap-2 text-xs bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-orange-400 shrink-0" />
          <div>
            <p className="text-orange-300 font-medium">API Key belum diset</p>
            <p className="text-muted-foreground mt-0.5">
              Buka{" "}
              <Link href="/dashboard" className="text-orange-400 underline hover:text-orange-300">
                Dashboard → AI Engine
              </Link>{" "}
              untuk konfigurasi Hermes.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isGenerating && !noApiKey && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-sm font-medium mb-1">Start building</p>
            <p className="text-xs text-muted-foreground">
              Describe the app you want to create!
            </p>
            <div className="mt-4 space-y-2">
              {[
                "Build a todo app with dark mode",
                "Create a SaaS dashboard with charts",
                "Make a landing page for a startup",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-purple-600"
                  : "bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/20"
              )}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-white" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-orange-400" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "chat-bubble-user text-white"
                  : "chat-bubble-ai text-foreground"
              )}
            >
              <p className="whitespace-pre-wrap text-xs leading-relaxed">
                {renderMessageContent(msg.content)}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isGenerating && streamingContent && (
          <div className="flex gap-2 flex-row">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="max-w-[80%] chat-bubble-ai rounded-2xl px-3.5 py-2.5">
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {renderMessageContent(streamingContent)}
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isGenerating && !streamingContent && (
          <div className="flex gap-2 flex-row">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="chat-bubble-ai rounded-2xl px-4 py-3 flex gap-1.5 items-center">
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build…"
            rows={3}
            disabled={isGenerating}
            className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
          />
          <Button
            size="icon"
            className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 hover:opacity-90 text-white"
            onClick={sendMessage}
            disabled={!input.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}
