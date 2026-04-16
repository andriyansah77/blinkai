"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Zap,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  PauseCircle,
  Share2,
  Coins,
  CreditCard,
  Key,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isPublic: boolean;
  status: string;
  totalMessages: number;
  totalTokens: number;
  template: string;
  createdAt: string;
}

interface AgentSession {
  id: string;
  visitorId: string | null;
  title: string | null;
  tokenUsed: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiKeyConfig {
  mode: "platform" | "byok";
  byokApiKey: string | null;
  byokBaseUrl: string | null;
  byokModel: string | null;
}

type Tab = "overview" | "settings" | "apikey" | "share";

const AVATAR_OPTIONS = ["🤖", "🧠", "⚡", "🎯", "💡", "🔮", "🛡️", "🚀", "🌟", "🎨", "🔬", "💬"];

const tabList: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "settings", label: "Settings" },
  { id: "apikey", label: "API Key" },
  { id: "share", label: "Share" },
];

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    avatar: "🤖",
    systemPrompt: "",
    model: "",
    temperature: 0.7,
    maxTokens: 1000,
    isPublic: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // API Key form
  const [apikeyForm, setApikeyForm] = useState({
    mode: "platform" as "platform" | "byok",
    byokApiKey: "",
    byokBaseUrl: "",
    byokModel: "",
  });
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) router.push("/sign-in");
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (authenticated) fetchAll();
  }, [authenticated, params.id]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  async function fetchAll() {
    try {
      const [agentRes, sessionsRes, apikeyRes] = await Promise.all([
        fetch(`/api/agents/${params.id}`),
        fetch(`/api/agents/${params.id}/sessions`),
        fetch("/api/user/apikey"),
      ]);

      if (!agentRes.ok) {
        router.push("/dashboard");
        return;
      }

      const agentData = (await agentRes.json()) as Agent;
      setAgent(agentData);
      setEditNameValue(agentData.name);
      setSettingsForm({
        name: agentData.name,
        description: agentData.description || "",
        avatar: agentData.avatar || "🤖",
        systemPrompt: agentData.systemPrompt,
        model: agentData.model,
        temperature: agentData.temperature,
        maxTokens: agentData.maxTokens ?? 1000,
        isPublic: agentData.isPublic,
      });

      if (sessionsRes.ok) {
        setSessions((await sessionsRes.json()) as AgentSession[]);
      }

      if (apikeyRes.ok) {
        const cfg = (await apikeyRes.json()) as ApiKeyConfig;
        setApiKeyConfig(cfg);
        setApikeyForm({
          mode: cfg.mode,
          byokApiKey: cfg.byokApiKey || "",
          byokBaseUrl: cfg.byokBaseUrl || "",
          byokModel: cfg.byokModel || "",
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!agent) return;
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = (await res.json()) as Agent;
      setAgent(updated);
      setSettingsSaved(true);
      toast.success("Settings saved!");
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveApiKey(e: React.FormEvent) {
    e.preventDefault();
    setSavingApiKey(true);
    try {
      const res = await fetch("/api/user/apikey", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apikeyForm),
      });
      if (!res.ok) throw new Error("Failed to save");
      setApiKeySaved(true);
      toast.success("API settings saved!");
      setTimeout(() => setApiKeySaved(false), 2000);
    } catch {
      toast.error("Failed to save API settings");
    } finally {
      setSavingApiKey(false);
    }
  }

  async function commitNameEdit() {
    if (!agent || !editNameValue.trim() || editNameValue === agent.name) {
      setEditingName(false);
      setEditNameValue(agent?.name || "");
      return;
    }
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editNameValue.trim() }),
      });
      if (!res.ok) throw new Error();
      const updated = (await res.json()) as Agent;
      setAgent(updated);
      setSettingsForm((f) => ({ ...f, name: updated.name }));
      toast.success("Name updated");
    } catch {
      toast.error("Failed to update name");
      setEditNameValue(agent.name);
    }
    setEditingName(false);
  }

  function copyShareLink() {
    if (!agent) return;
    const url = `${window.location.origin}/agent/${agent.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyEmbed() {
    if (!agent) return;
    const code = `<iframe src="https://reagent.com/agent/${agent.slug}" width="400" height="600" frameborder="0" allow="microphone"></iframe>`;
    navigator.clipboard.writeText(code).then(() => {
      setEmbedCopied(true);
      toast.success("Embed code copied!");
      setTimeout(() => setEmbedCopied(false), 2000);
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!agent) return null;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://reagent.com"}/agent/${agent.slug}`;
  const publicUrl = `https://reagent.com/agent/${agent.slug}`;
  const embedCode = `<iframe src="${publicUrl}" width="400" height="600" frameborder="0" allow="microphone"></iframe>`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{agent.avatar || "🤖"}</span>
            <span className="font-semibold text-sm text-white truncate">{agent.name}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
            </button>
            <Link
              href={`/agent/${agent.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-900 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Chat</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Agent Hero ──────────────────────────────────────────────── */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-8 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl shrink-0">
            {agent.avatar || "🤖"}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input
                ref={nameInputRef}
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                onBlur={commitNameEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitNameEdit();
                  if (e.key === "Escape") { setEditingName(false); setEditNameValue(agent.name); }
                }}
                className="text-2xl font-bold bg-transparent border-b border-amber-500/50 text-white focus:outline-none w-full max-w-xs"
              />
            ) : (
              <h1
                className="text-2xl font-bold text-white cursor-text hover:text-amber-400/80 transition-colors inline-block"
                onDoubleClick={() => { setEditingName(true); setEditNameValue(agent.name); }}
                title="Double-click to edit"
              >
                {agent.name}
              </h1>
            )}
            {agent.description && (
              <p className="text-sm text-zinc-400 mt-1">{agent.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium",
                  agent.status === "active"
                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                    : "bg-zinc-700/50 border-zinc-600/50 text-zinc-400"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", agent.status === "active" ? "bg-emerald-400" : "bg-zinc-500")} />
                {agent.status === "active" ? "Active" : "Paused"}
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {agent.totalMessages} messages
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {agent.totalTokens.toLocaleString()} tokens
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="relative flex gap-0 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-8">
          {tabList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors z-10",
                activeTab === tab.id ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* ── Overview ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Sessions", value: sessions.length, icon: <MessageSquare className="w-4 h-4 text-amber-400" /> },
                  { label: "Total Messages", value: agent.totalMessages, icon: <MessageSquare className="w-4 h-4 text-amber-400" /> },
                  { label: "Tokens Used", value: agent.totalTokens.toLocaleString(), icon: <Zap className="w-4 h-4 text-amber-400" /> },
                  { label: "Credits Spent", value: "—", icon: <Coins className="w-4 h-4 text-amber-400" /> },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    custom={i}
                    variants={statCardVariants}
                    initial="hidden"
                    animate="visible"
                    className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        {s.icon}
                      </div>
                      <span className="text-xs text-zinc-500">{s.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Sessions list */}
              <h2 className="text-base font-semibold text-white mb-4">Recent Sessions</h2>
              {sessions.length === 0 ? (
                <div className="border border-dashed border-white/[0.06] rounded-2xl p-12 text-center">
                  <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm mb-2">No sessions yet</p>
                  {agent.isPublic && (
                    <Link
                      href={`/agent/${agent.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open public chat to start
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] rounded-xl px-4 py-3 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {s.title || "Untitled Session"}
                        </p>
                        <p className="text-xs text-zinc-600 flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(s.updatedAt)}
                          <span className="text-zinc-700">·</span>
                          {s.tokenUsed} tokens
                        </p>
                      </div>
                      <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors shrink-0 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Settings ─────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <form onSubmit={saveSettings} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    required
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                  <input
                    type="text"
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    placeholder="What does this agent do?"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  />
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, avatar: emoji })}
                        className={cn(
                          "w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all",
                          settingsForm.avatar === emoji
                            ? "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30 scale-110"
                            : "bg-white/[0.04] border-white/[0.08] hover:border-amber-500/40"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">System Prompt</label>
                  <textarea
                    value={settingsForm.systemPrompt}
                    onChange={(e) => setSettingsForm({ ...settingsForm, systemPrompt: e.target.value })}
                    placeholder="You are a helpful assistant that…"
                    rows={6}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all resize-none"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Model <span className="text-zinc-600 text-xs">(leave blank for default)</span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.model}
                    onChange={(e) => setSettingsForm({ ...settingsForm, model: e.target.value })}
                    placeholder="gpt-4o-mini"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Temperature{" "}
                    <span className="text-amber-400 text-xs font-mono">{settingsForm.temperature.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settingsForm.temperature}
                    onChange={(e) => setSettingsForm({ ...settingsForm, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>Precise (0)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Max Tokens</label>
                  <input
                    type="number"
                    value={settingsForm.maxTokens}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maxTokens: parseInt(e.target.value) || 1000 })}
                    min="100"
                    max="32000"
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                  />
                </div>

                {/* Visibility */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Visibility</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {settingsForm.isPublic ? "Public — anyone with the link can chat" : "Private — only you can access"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, isPublic: !settingsForm.isPublic })}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-all duration-200",
                      settingsForm.isPublic ? "bg-amber-500" : "bg-white/[0.1]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                        settingsForm.isPublic ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-zinc-900 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                >
                  {savingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : settingsSaved ? (
                    <><Check className="w-4 h-4" /> Saved!</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>

                {/* Danger zone */}
                <div className="border border-red-500/20 rounded-2xl p-5 mt-6">
                  <h3 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h3>
                  <p className="text-xs text-zinc-600 mb-4">These actions are irreversible. Proceed with caution.</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Pause this agent? It will stop accepting new chats.")) {
                          toast("Pause functionality coming soon", { icon: "⏸" });
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                    >
                      <PauseCircle className="w-4 h-4" />
                      Pause Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Delete this agent permanently? This cannot be undone.")) {
                          toast("Delete functionality coming soon", { icon: "🗑" });
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Agent
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── API Key ──────────────────────────────────────────────── */}
          {activeTab === "apikey" && (
            <motion.div
              key="apikey"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <form onSubmit={saveApiKey} className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">AI Provider Mode</h3>
                  <p className="text-xs text-zinc-500 mb-4">
                    Choose whether to use ReAgent platform credits or your own API key.
                  </p>
                </div>

                {/* Mode cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApikeyForm({ ...apikeyForm, mode: "platform" })}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      apikeyForm.mode === "platform"
                        ? "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-amber-500/30"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-3">
                      <CreditCard className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className={cn("text-sm font-semibold mb-1", apikeyForm.mode === "platform" ? "text-amber-400" : "text-zinc-300")}>
                      Platform Credits
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Use ReAgent platform credits. 100 credits free, then pay-as-you-go.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApikeyForm({ ...apikeyForm, mode: "byok" })}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      apikeyForm.mode === "byok"
                        ? "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10"
                        : "bg-white/[0.03] border-white/[0.08] hover:border-amber-500/30"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-3">
                      <Key className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className={cn("text-sm font-semibold mb-1", apikeyForm.mode === "byok" ? "text-amber-400" : "text-zinc-300")}>
                      Bring Your Own Key (BYOK)
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Use your own API key. No credit deduction from ReAgent.
                    </p>
                  </button>
                </div>

                <AnimatePresence>
                  {apikeyForm.mode === "byok" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* API Key */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">API Key</label>
                        <div className="relative">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={apikeyForm.byokApiKey}
                            onChange={(e) => setApikeyForm({ ...apikeyForm, byokApiKey: e.target.value })}
                            placeholder="sk-..."
                            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {apiKeyConfig?.byokApiKey && (
                          <p className="text-xs text-zinc-600 mt-1">
                            Existing key on file: {apiKeyConfig.byokApiKey.slice(0, 8)}...
                          </p>
                        )}
                      </div>

                      {/* Base URL */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                          Base URL <span className="text-zinc-600 text-xs">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={apikeyForm.byokBaseUrl}
                          onChange={(e) => setApikeyForm({ ...apikeyForm, byokBaseUrl: e.target.value })}
                          placeholder="https://api.openai.com/v1"
                          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                        />
                      </div>

                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                          Model <span className="text-zinc-600 text-xs">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={apikeyForm.byokModel}
                          onChange={(e) => setApikeyForm({ ...apikeyForm, byokModel: e.target.value })}
                          placeholder="gpt-4o-mini"
                          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={savingApiKey}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-zinc-900 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                >
                  {savingApiKey ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : apiKeySaved ? (
                    <><Check className="w-4 h-4" /> Saved!</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save API Settings</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Share ────────────────────────────────────────────────── */}
          {activeTab === "share" && (
            <motion.div
              key="share"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Public URL */}
              <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Public URL</h3>
                <p className="text-xs text-zinc-500 mb-3">Share this link with anyone to let them chat with your agent</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-zinc-400 font-mono truncate">
                    {publicUrl}
                  </div>
                  <button
                    onClick={copyShareLink}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* QR Code placeholder */}
              <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-1">QR Code</h3>
                <p className="text-xs text-zinc-500 mb-3">Scan to open the chat on mobile</p>
                <div className="w-40 h-40 border-2 border-dashed border-white/[0.1] rounded-2xl flex items-center justify-center text-zinc-600 text-xs">
                  QR Code
                </div>
              </div>

              {/* Embed code */}
              <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Embed Code</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Add this iframe to your website</p>
                  </div>
                  <button
                    onClick={copyEmbed}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
                  >
                    {embedCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {embedCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={embedCode}
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-zinc-400 font-mono focus:outline-none resize-none"
                />
              </div>

              {/* Visibility toggle */}
              <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">Agent Visibility</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {agent.isPublic ? "Public — shareable link is active" : "Private — link is disabled"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const newPublic = !agent.isPublic;
                    try {
                      const res = await fetch(`/api/agents/${agent.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isPublic: newPublic }),
                      });
                      if (!res.ok) throw new Error();
                      const updated = (await res.json()) as Agent;
                      setAgent(updated);
                      setSettingsForm((f) => ({ ...f, isPublic: updated.isPublic }));
                      toast.success(updated.isPublic ? "Agent is now public" : "Agent is now private");
                    } catch {
                      toast.error("Failed to update visibility");
                    }
                  }}
                  className={cn(
                    "w-11 h-6 rounded-full relative transition-all duration-200",
                    agent.isPublic ? "bg-amber-500" : "bg-white/[0.1]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                      agent.isPublic ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
