"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Terminal as TerminalIcon, Play, Square, Trash2, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface TerminalLine {
  id: string;
  type: "command" | "output" | "error";
  content: string;
  timestamp: Date;
}

export default function TerminalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
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
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsRunning(true);
    addLine("command", `$ ${command}`);

    try {
      // Simulate command execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock responses for different commands
      switch (command.toLowerCase().trim()) {
        case "help":
          addLine("output", "Available commands:");
          addLine("output", "  help     - Show this help message");
          addLine("output", "  status   - Show application status");
          addLine("output", "  logs     - Show recent logs");
          addLine("output", "  restart  - Restart application");
          addLine("output", "  clear    - Clear terminal");
          break;
        
        case "status":
          addLine("output", "Application Status: Running");
          addLine("output", "Port: 3000");
          addLine("output", "Environment: Production");
          addLine("output", "Uptime: 2h 15m");
          break;
        
        case "logs":
          addLine("output", "[2024-01-15 10:30:15] Application started");
          addLine("output", "[2024-01-15 10:30:16] Database connected");
          addLine("output", "[2024-01-15 10:30:17] Server listening on port 3000");
          break;
        
        case "restart":
          addLine("output", "Restarting application...");
          addLine("output", "Application restarted successfully");
          break;
        
        case "clear":
          setLines([]);
          break;
        
        default:
          addLine("error", `Command not found: ${command}`);
          addLine("output", "Type 'help' for available commands");
      }
    } catch (error) {
      addLine("error", `Error executing command: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() && !isRunning) {
      executeCommand(currentCommand);
      setCurrentCommand("");
    }
  };

  const clearTerminal = () => {
    setLines([]);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TerminalIcon className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl font-bold">Terminal</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearTerminal}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-400">BlinkAI Terminal</div>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="h-96 overflow-y-auto p-4 font-mono text-sm"
          >
            {/* Welcome Message */}
            {lines.length === 0 && (
              <div className="text-green-400 mb-4">
                <div>Welcome to BlinkAI Terminal</div>
                <div>Type 'help' for available commands</div>
                <div className="mt-2 text-gray-500">
                  Connected to: {session?.user?.email}
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
                      : "text-gray-300"
                  }
                >
                  {line.content}
                </span>
              </div>
            ))}

            {/* Current Input */}
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-green-400 mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                disabled={isRunning}
                className="flex-1 bg-transparent text-white outline-none font-mono"
                placeholder={isRunning ? "Executing..." : "Enter command..."}
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
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => executeCommand("status")}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            <span>Status</span>
          </button>
          
          <button
            onClick={() => executeCommand("logs")}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <TerminalIcon className="h-4 w-4" />
            <span>Logs</span>
          </button>
          
          <button
            onClick={() => executeCommand("restart")}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Square className="h-4 w-4" />
            <span>Restart</span>
          </button>
          
          <button
            onClick={() => executeCommand("help")}
            disabled={isRunning}
            className="flex items-center justify-center space-x-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Settings className="h-4 w-4" />
            <span>Help</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}