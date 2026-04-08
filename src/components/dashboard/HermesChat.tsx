"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, Plus, Lightbulb, Users, History, Bot, Zap, Sparkles, TrendingUp, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserAgent } from "@/hooks/useUserAgent";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatProps {
  className?: string;
}

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: "Suggestions",
    description: "Get AI-powered recommendations",
  },
  {
    icon: Users,
    title: "Explore agents",
    description: "Browse available AI agents",
  },
  {
    icon: History,
    title: "Pro tips",
    description: "Learn advanced techniques",
  },
  {
    icon: Bot,
    title: "Connect bot",
    description: "Connect external bots",
  },
];

const FEATURED_CARD = {
  title: "Earn Money by Creating Skills!",
  description: "Create and sell your own skills on Agent Place and earn money. No catch.",
  action: "Create",
  secondaryAction: "Earn Money"
};

export default function HermesChat({ className }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { agent, hasAgent, loading: agentLoading } = useUserAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasAgent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/hermes/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          agentId: agent?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: msg.content + content }
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isEmpty = messages.length === 0;

  if (agentLoading) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-[#0A0A0A]", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!hasAgent) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-[#0A0A0A]", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No agent found</h3>
          <p className="text-white/60 mb-6">
            You need to complete the onboarding process to create your AI agent.
          </p>
          <button
            onClick={() => window.location.href = '/onboarding'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-[#0A0A0A]", className)}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            {/* Welcome Message */}
            <div className="text-center mb-12 max-w-2xl">
              <h1 className="text-4xl font-bold text-white mb-4">
                What would you like to do?
              </h1>
              <p className="text-white/60 text-lg">
                {agent?.name} is ready
              </p>
            </div>

            {/* Input Area - Moved to center for empty state */}
            <div className="w-full max-w-2xl mb-8">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-end gap-3">
                  {/* Add Button */}
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything... (type / for commands)"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 pr-20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                      rows={1}
                      style={{
                        minHeight: "48px",
                        maxHeight: "120px",
                      }}
                    />
                    
                    {/* Right side buttons */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-white/[0.06] disabled:text-white/30 flex items-center justify-center text-white transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      <Zap className="w-3 h-3" />
                      Plan
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <button className="hover:text-white/60 transition-colors">
                      Feedback
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
              {SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  key={suggestion.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-left transition-colors group"
                >
                  <suggestion.icon className="w-5 h-5 text-white/60 mb-3 group-hover:text-white transition-colors" />
                  <h3 className="text-white font-medium text-sm mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-white/40 text-xs">
                    {suggestion.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Featured Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {FEATURED_CARD.title}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {FEATURED_CARD.description}
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {FEATURED_CARD.action}
                    </button>
                    <button className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {FEATURED_CARD.secondaryAction}
                    </button>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-white/[0.06] text-white border border-white/[0.08]"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">U</span>
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area for conversation state */}
      {!isEmpty && (
        <div className="border-t border-white/[0.06] p-6">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-3">
              {/* Add Button */}
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Input Field */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... (type / for commands)"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 pr-20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                  rows={1}
                  style={{
                    minHeight: "48px",
                    maxHeight: "120px",
                  }}
                />
                
                {/* Right side buttons */}
                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-white/[0.06] disabled:text-white/30 flex items-center justify-center text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Plan
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-white/40">
                <button className="hover:text-white/60 transition-colors">
                  Feedback
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}