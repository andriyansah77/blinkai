"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  RotateCcw,
  Sparkles,
  User,
  Key,
  Globe,
  Cpu,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import toast from "react-hot-toast";

const STORAGE_KEY = "reagent_settings";

const DEFAULTS = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o",
};

interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState<AISettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULTS, ...parsed });
        }
      } catch {}
    }
  }, []);

  function handleChange(key: keyof AISettings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 2000);
  }

  function resetSettings() {
    setSettings(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Settings reset to defaults");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                ReAgent
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your AI provider and account preferences.
          </p>
        </div>

        {/* Profile Section */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-semibold">Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={session?.user?.name || ""}
                readOnly
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Name is set during registration
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={session?.user?.email || ""}
                readOnly
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 hover:text-red-300 hover:border-red-400/30 hover:bg-red-400/5"
            >
              Sign Out
            </Button>
          </div>
        </section>

        {/* AI Configuration Section */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-semibold">AI Configuration</h2>
          </div>

          <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Using your own API key?</p>
            <p>
              Configure your OpenAI-compatible API key here. Settings are stored locally in your
              browser and never sent to our servers.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label htmlFor="apiKey" className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => handleChange("apiKey", e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key from OpenAI or compatible provider
            </p>
          </div>

          {/* Base URL */}
          <div className="space-y-1.5">
            <Label htmlFor="baseUrl" className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Base URL
            </Label>
            <Input
              id="baseUrl"
              type="url"
              value={settings.baseUrl}
              onChange={(e) => handleChange("baseUrl", e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
            <p className="text-xs text-muted-foreground">
              API base URL. Change for compatible providers (Groq, Together AI, Ollama, etc.)
            </p>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label htmlFor="model" className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Model
            </Label>
            <Input
              id="model"
              value={settings.model}
              onChange={(e) => handleChange("model", e.target.value)}
              placeholder="gpt-4o"
            />
            <p className="text-xs text-muted-foreground">
              Model name (e.g. gpt-4o, claude-3-5-sonnet-20241022, llama-3.3-70b-versatile)
            </p>
          </div>

          {/* Provider presets */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "OpenAI", url: "https://api.openai.com/v1", model: "gpt-4o" },
                {
                  label: "Groq",
                  url: "https://api.groq.com/openai/v1",
                  model: "llama-3.3-70b-versatile",
                },
                {
                  label: "Together AI",
                  url: "https://api.together.xyz/v1",
                  model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
                },
                {
                  label: "Ollama (local)",
                  url: "http://localhost:11434/v1",
                  model: "llama3.2",
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setSettings((prev) => ({
                      ...prev,
                      baseUrl: preset.url,
                      model: preset.model,
                    }));
                    setSaved(false);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-purple-400 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button
              variant="gradient"
              size="sm"
              onClick={saveSettings}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Settings
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={resetSettings}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Defaults
            </Button>
          </div>
        </section>

        {/* About */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-semibold">About ReAgent</h2>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>ReAgent is an AI-powered agent deployment platform.</p>
            <p>
              Describe the agent you want and ReAgent creates intelligent agents that
              learn, remember, and improve over time.
            </p>
            <div className="pt-2 flex gap-4 text-xs">
              <span className="text-purple-400">v0.1.0</span>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
