"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Thermometer,
  Hash,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  HERMES_PROVIDERS,
  HERMES_DEFAULTS,
  HERMES_VERSION,
  HermesConfig,
  getProviderById,
  resolveBaseUrl,
} from "@/lib/hermes";
import toast from "react-hot-toast";

const STORAGE_KEY = "hermes_config";

function loadConfig(): HermesConfig {
  if (typeof window === "undefined") return HERMES_DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...HERMES_DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return HERMES_DEFAULTS;
}

function saveConfig(cfg: HermesConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function HermesPanel() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<HermesConfig>(HERMES_DEFAULTS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    setCfg(loadConfig());
  }, []);

  const provider = getProviderById(cfg.providerId);

  function update<K extends keyof HermesConfig>(key: K, val: HermesConfig[K]) {
    setCfg((prev) => {
      const next = { ...prev, [key]: val };
      // Auto-fill baseUrl and default model when provider changes
      if (key === "providerId") {
        const p = getProviderById(val as string);
        if (p && p.id !== "custom") {
          next.baseUrl = p.baseUrl;
          next.model = p.defaultModel;
        }
      }
      return next;
    });
    setSaved(false);
    setTestResult(null);
  }

  function handleSave() {
    saveConfig(cfg);
    setSaved(true);
    toast.success("Hermes config saved!");
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setCfg(HERMES_DEFAULTS);
    saveConfig(HERMES_DEFAULTS);
    toast("Reset to defaults");
  }

  async function handleTest() {
    if (!cfg.apiKey) {
      toast.error("Please enter an API key first");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: 'Reply with only: {"hermes":"ok"}' }],
          hermes: cfg,
        }),
      });
      if (res.ok) {
        setTestResult("ok");
        toast.success("Connection successful!");
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult("fail");
        toast.error(data.error || "Connection failed");
      }
    } catch {
      setTestResult("fail");
      toast.error("Connection error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          {/* Hermes logo badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">AI Engine</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                v{HERMES_VERSION}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {provider?.badge} {provider?.name ?? "Custom"} ·{" "}
              <span className="font-mono">{cfg.model || "–"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {testResult === "ok" && (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
          {testResult === "fail" && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-orange-500/5 border border-orange-500/15 rounded-lg px-3 py-2.5">
            <Info className="w-3.5 h-3.5 mt-0.5 text-orange-400 shrink-0" />
            <span>
              ReAgent's AI orchestration engine. Config is saved locally and sent with
              each generation request. Server-side env vars are used as fallback.
            </span>
          </div>

          {/* Provider selector */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <Cpu className="w-3.5 h-3.5" /> Provider
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HERMES_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => update("providerId", p.id)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                    cfg.providerId === p.id
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                      : "border-border hover:border-orange-500/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="mr-1">{p.badge}</span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <Label htmlFor="hermes-apikey" className="text-xs font-medium">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="hermes-apikey"
                type={showKey ? "text" : "password"}
                placeholder="sk-... or your provider key"
                value={cfg.apiKey}
                onChange={(e) => update("apiKey", e.target.value)}
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div className="space-y-1.5">
            <Label htmlFor="hermes-baseurl" className="text-xs font-medium">
              Base URL
            </Label>
            <Input
              id="hermes-baseurl"
              type="text"
              placeholder="https://api.openai.com/v1"
              value={cfg.baseUrl}
              onChange={(e) => update("baseUrl", e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label htmlFor="hermes-model" className="text-xs font-medium">
              Model
            </Label>
            {provider && provider.models.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {provider.models.map((m) => (
                    <button
                      key={m}
                      onClick={() => update("model", m)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all font-mono ${
                        cfg.model === m
                          ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                          : "border-border hover:border-orange-500/30 text-muted-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Input
                  id="hermes-model"
                  type="text"
                  placeholder="or type a custom model name"
                  value={cfg.model}
                  onChange={(e) => update("model", e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            ) : (
              <Input
                id="hermes-model"
                type="text"
                placeholder="model name"
                value={cfg.model}
                onChange={(e) => update("model", e.target.value)}
                className="font-mono text-xs"
              />
            )}
          </div>

          {/* Temperature + Max Tokens (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <Thermometer className="w-3.5 h-3.5" /> Temperature
              </Label>
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={cfg.temperature}
                  onChange={(e) => update("temperature", parseFloat(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span className="text-orange-400 font-mono font-semibold">
                    {cfg.temperature.toFixed(2)}
                  </span>
                  <span>2</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <Hash className="w-3.5 h-3.5" /> Max Tokens
              </Label>
              <Input
                type="number"
                min={256}
                max={128000}
                step={256}
                value={cfg.maxTokens}
                onChange={(e) => update("maxTokens", parseInt(e.target.value, 10))}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* System Prompt Override */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium">
              <FileText className="w-3.5 h-3.5" /> System Prompt Override
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              placeholder="Leave blank to use the default Hermes system prompt..."
              value={cfg.systemPromptOverride || ""}
              onChange={(e) => update("systemPromptOverride", e.target.value)}
              rows={3}
              className="text-xs font-mono resize-none"
            />
          </div>

          {/* Streaming toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="text-xs font-medium">Streaming</p>
              <p className="text-xs text-muted-foreground">Token-by-token live output</p>
            </div>
            <button
              onClick={() => update("streamingEnabled", !cfg.streamingEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                cfg.streamingEnabled ? "bg-orange-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  cfg.streamingEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing || !cfg.apiKey}
              className="text-xs"
            >
              {testing ? (
                <>
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                  Testing…
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              className={`text-xs transition-all ${
                saved
                  ? "bg-green-600 hover:bg-green-600"
                  : "bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Config
                </>
              )}
            </Button>

            <button
              onClick={handleReset}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
