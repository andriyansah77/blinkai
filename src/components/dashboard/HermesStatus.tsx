"use client";

import { useState, useEffect } from "react";
import { Bot, Zap, Brain, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface HermesStatusProps {
  className?: string;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'learning' | 'idle';
  sessions: number;
  memories: number;
  skills: number;
}

export default function HermesStatus({ className }: HermesStatusProps) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const response = await fetch('/api/hermes/agents');
      if (response.ok) {
        const data = await response.json();
        const agentStatus = data.agents.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          status: agent.sessions > 0 ? 'active' : 'idle',
          sessions: agent.sessions,
          memories: agent.memory.total,
          skills: agent.skills
        }));
        setAgents(agentStatus);
      }
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const totalMemories = agents.reduce((sum, a) => sum + a.memories, 0);
  const totalSkills = agents.reduce((sum, a) => sum + a.skills, 0);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        <span className="text-white/40 text-xs">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Agent Status Indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            scale: activeAgents > 0 ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: activeAgents > 0 ? Infinity : 0,
            ease: "easeInOut"
          }}
          className={`w-2 h-2 rounded-full ${
            activeAgents > 0 ? 'bg-green-400' : 'bg-gray-400'
          }`}
        />
        <span className="text-white/60 text-xs font-medium">
          {activeAgents > 0 ? 'Running' : 'Ready'}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-3 text-xs text-white/40">
        <div className="flex items-center gap-1">
          <Bot className="w-3 h-3" />
          <span>{totalAgents}</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3" />
          <span>{totalMemories}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          <span>{totalSkills}</span>
        </div>
      </div>

      {/* Active Agent Indicator */}
      {activeAgents > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-xs text-green-400"
        >
          <Activity className="w-3 h-3" />
          <span>{activeAgents} active</span>
        </motion.div>
      )}
    </div>
  );
}