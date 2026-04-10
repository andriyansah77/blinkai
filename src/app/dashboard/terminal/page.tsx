"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Terminal as TerminalIcon, Play, Square, Trash2, Settings, Send } from "lucide-react";
import { motion } from "framer-motion";

interface TerminalLine {
  id: string;
  type: "command" | "output" | "error" | "system";
  content: string;
  timestamp: Date;
}

export default function TerminalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated") {
      // Add welcome message
      addLine("system", "ReAgent Hermes Terminal initialized");
      addLine("system", "Type 'help' for available Hermes commands");
    }
  }, [status, router]);

  useEffect(() => {
    // Auto-scroll to bottom when new lines are added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (type: TerminalLine["type"], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeHermesCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsRunning(true);
    addLine("command", `hermes ${command}`);
    
    // Add to command history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    try {
      // Execute Hermes command via API
      const response = await fetch("/api/hermes/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Stream output line by line
          const outputLines = data.output.split('\n').filter((line: string) => line.trim());
          for (const line of outputLines) {
            addLine("output", line);
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
          }
          
          if (data.error && data.error.trim()) {
            const errorLines = data.error.split('\n').filter((line: string) => line.trim());
            for (const line of errorLines) {
              addLine("error", line);
            }
          }
        } else {
          addLine("error", data.error || "Command execution failed");
        }
      } else {
        addLine("error", "Failed to execute Hermes command");
      }
    } catch (error) {
      addLine("error", `Network error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const executeBuiltinCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    switch (cmd) {
      case "help":
        addLine("output", "Available Hermes Commands:");
        addLine("output", "  status           - Show Hermes agent status");
        addLine("output", "  chat <message>   - Send a chat message");
        addLine("output", "  skills list      - List available skills");
        addLine("output", "  gateway status   - Check gateway status");
        addLine("output", "  sessions list    - List chat sessions");
        addLine("output", "  config show      - Show configuration");
        addLine("output", "  memory status    - Check memory system");
        addLine("output", "  cron list        - List scheduled jobs");
        addLine("output", "  clear            - Clear terminal");
        addLine("output", "");
        addLine("output", "Built-in Commands:");
        addLine("output", "  help             - Show this help");
        addLine("output", "  clear            - Clear terminal");
        addLine("output", "  history          - Show command history");
        break;
        
      case "clear":
        setLines([]);
        addLine("system", "Terminal cleared");
        break;
        
      case "history":
        addLine("output", "Command History:");
        commandHistory.forEach((cmd, index) => {
          addLine("output", `  ${index + 1}: ${cmd}`);
        });
        break;
        
      default:
        // Execute as Hermes command
        await executeHermesCommand(command);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !isRunning) {
      executeBuiltinCommand(currentCommand);
      setCurrentCommand("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setLines([]);
    addLine("system", "Terminal cleared");
  };

  const quickCommand = (cmd: string) => {
    if (!isRunning) {
      setCurrentCommand(cmd);
      executeBuiltinCommand(cmd);
      setCurrentCommand("");
    }
  };

  if (status === "loading") {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border/60">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TerminalIcon className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold">Hermes Terminal</h1>
              <p className="text-muted-foreground text-sm">Direct access to Hermes CLI commands</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearTerminal}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Terminal Window */}
        <div className="flex-1 bg-gray-900 border border-gray-700 m-6 rounded-lg overflow-hidden flex flex-col">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-400">ReAgent Hermes Terminal</div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <Settings className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          >
            {/* Welcome Message */}
            {lines.length === 0 && (
              <div className="text-green-400 mb-4">
                <div>Welcome to ReAgent Hermes Terminal</div>
                <div>Connected to Hermes CLI with user isolation</div>
                <div>Type 'help' for available commands</div>
                <div className="mt-2 text-gray-500">
                  User: {session?.user?.email}
                </div>
              </div>
            )}

            {/* Terminal Lines */}
            {lines.map((line) => (
              <div key={line.id} className="mb-1">
                <span
                  className={
                    line.type === "command"
                      ? "text-green-400"
                      : line.type === "error"
                      ? "text-red-400"
                      : line.type === "system"
                      ? "text-primary"
                      : "text-gray-300"
                  }
                >
                  {line.content}
                </span>
              </div>
            ))}

            {/* Current Input */}
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-green-400 mr-2">hermes$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRunning}
                className="flex-1 bg-transparent text-foreground outline-none font-mono"
                placeholder={isRunning ? "Executing..." : "Enter Hermes command..."}
                autoFocus
              />
              {isRunning && (
                <div className="ml-2 text-yellow-400">
                  <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => quickCommand("status")}
              disabled={isRunning}
              className="flex items-center justify-center space-x-2 p-3 bg-primary/20 hover:bg-primary/30 border border-blue-500/30 text-primary rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>Status</span>
            </button>
            
            <button
              onClick={() => quickCommand("skills list")}
              disabled={isRunning}
              className="flex items-center justify-center space-x-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <TerminalIcon className="h-4 w-4" />
              <span>Skills</span>
            </button>
            
            <button
              onClick={() => quickCommand("gateway status")}
              disabled={isRunning}
              className="flex items-center justify-center space-x-2 p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <Square className="h-4 w-4" />
              <span>Gateway</span>
            </button>
            
            <button
              onClick={() => quickCommand("help")}
              disabled={isRunning}
              className="flex items-center justify-center space-x-2 p-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <Settings className="h-4 w-4" />
              <span>Help</span>
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-muted-foreground text-xs">
              Use arrow keys to navigate command history • Ctrl+C to interrupt • Tab for autocomplete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




