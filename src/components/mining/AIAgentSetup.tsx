"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Copy,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Terminal,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function AIAgentSetup() {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/mining-key");
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      } else {
        toast.error("Failed to fetch API key");
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
      toast.error("Failed to fetch API key");
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async () => {
    try {
      setRegenerating(true);
      const response = await fetch("/api/user/mining-key", {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
        toast.success("API key regenerated successfully");
      } else {
        toast.error("Failed to regenerate API key");
      }
    } catch (error) {
      console.error("Error regenerating API key:", error);
      toast.error("Failed to regenerate API key");
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast.success("API key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast.success("Command copied to clipboard");
  };

  const maskApiKey = (key: string) => {
    if (!key) return "";
    return `${key.slice(0, 8)}${"*".repeat(48)}${key.slice(-8)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-foreground font-semibold text-lg">AI Agent Auto Mining</h2>
          <p className="text-muted-foreground text-sm">
            Let your AI agent automatically mint REAGENT tokens
          </p>
        </div>
      </div>

      {/* API Key Section */}
      <div className="mb-6">
        <label className="text-muted-foreground text-sm font-medium mb-2 block">
          Your Mining API Key
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 p-3 bg-accent rounded-lg border border-border">
            <code className="flex-1 text-foreground text-sm font-mono break-all">
              {loading ? "Loading..." : showKey ? apiKey : maskApiKey(apiKey)}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0"
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={handleCopyKey}
              disabled={loading}
              className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
              title="Copy key"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <button
            onClick={regenerateApiKey}
            disabled={loading || regenerating}
            className="p-3 bg-accent hover:bg-accent/80 disabled:opacity-50 rounded-lg transition-colors"
            title="Regenerate key"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", regenerating && "animate-spin")} />
          </button>
        </div>
        <p className="text-muted-foreground text-xs mt-2">
          Keep this key secure. It allows your AI agent to mint tokens on your behalf.
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="space-y-4">
        <h3 className="text-foreground font-medium text-sm">Setup Instructions:</h3>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">1</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-2">
                Set Environment Variable
              </p>
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border">
                <code className="flex-1 text-xs font-mono text-muted-foreground break-all">
                  export REAGENT_API_KEY="{apiKey || "your_api_key_here"}"
                </code>
                <button
                  onClick={() => handleCopyCommand(`export REAGENT_API_KEY="${apiKey}"`)}
                  disabled={!apiKey}
                  className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">2</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-2">
                Install Skill (if not already installed)
              </p>
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border">
                <Terminal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <code className="flex-1 text-xs font-mono text-muted-foreground">
                  hermes skills install auto_mining
                </code>
                <button
                  onClick={() => handleCopyCommand("hermes skills install auto_mining")}
                  className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0"
                >
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">3</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-2">
                Start Auto Mining
              </p>
              <p className="text-muted-foreground text-xs mb-2">
                Simply tell your AI agent to start mining:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                  <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">"Start mining REAGENT"</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                  <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">"Mint 5 REAGENT tokens"</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                  <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">"Check my mining balance"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Bot className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-blue-400 text-sm font-medium mb-1">
              Why Use AI Agent Auto Mining?
            </p>
            <ul className="text-blue-400/80 text-xs space-y-1">
              <li>• Automatic minting with simple voice/text commands</li>
              <li>• 50% cheaper (0.5 PATHUSD vs 1.0 PATHUSD manual)</li>
              <li>• No need to open dashboard every time</li>
              <li>• AI agent monitors balance and executes when ready</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
