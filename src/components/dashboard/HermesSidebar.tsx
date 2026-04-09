"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  Zap, 
  Settings, 
  Calendar, 
  Folder, 
  Terminal, 
  User, 
  CreditCard,
  ChevronDown,
  Bot,
  Sparkles,
  Workflow,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useUserAgent } from "@/hooks/useUserAgent";

interface SidebarProps {
  credits?: number;
  planType?: string;
}

const MAIN_ITEMS = [
  {
    icon: MessageSquare,
    label: "Chat",
    href: "/dashboard/chat",
    badge: null,
  },
];

const AUTOMATION_ITEMS = [
  {
    icon: Sparkles,
    label: "Skills",
    href: "/dashboard/skills",
  },
  {
    icon: Database,
    label: "Channels",
    href: "/dashboard/channels",
  },
  {
    icon: Workflow,
    label: "Features",
    href: "/dashboard/features",
  },
  {
    icon: Calendar,
    label: "Scheduled Jobs",
    href: "/dashboard/jobs",
  },
  {
    icon: Folder,
    label: "Workspace",
    href: "/dashboard/workspace",
  },
  {
    icon: Terminal,
    label: "Terminal",
    href: "/dashboard/terminal",
  },
];

const ACCOUNT_ITEMS = [
  {
    icon: CreditCard,
    label: "Usage",
    href: "/dashboard/usage",
  },
];

export default function HermesSidebar({ credits = 10000, planType = "Free Plan" }: SidebarProps) {
  const pathname = usePathname();
  const [isAccountExpanded, setIsAccountExpanded] = useState(false);
  const { agent, hasAgent, loading } = useUserAgent();

  return (
    <div className="w-64 h-screen bg-[#0A0A0A] border-r border-white/[0.06] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
            <img 
              src="/logo.jpg" 
              alt="ReAgent Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">R</div>';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-sm">ReAgent</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${hasAgent ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className={`text-xs font-medium ${hasAgent ? 'text-green-400' : 'text-gray-400'}`}>
                {loading ? 'Loading...' : hasAgent ? 'Running' : 'Setup Required'}
              </span>
            </div>
            {agent?.name && (
              <div className="text-xs text-white/60 truncate mt-0.5">
                {agent.name}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Section */}
        <div className="p-3">
          <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 px-2">
            Main
          </div>
          <nav className="space-y-1">
            {MAIN_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Automation Section */}
        <div className="p-3">
          <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2 px-2">
            Automation
          </div>
          <nav className="space-y-1">
            {AUTOMATION_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Section */}
        <div className="p-3">
          <button
            onClick={() => setIsAccountExpanded(!isAccountExpanded)}
            className="flex items-center gap-3 px-2 py-1 w-full text-left"
          >
            <div className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Account
            </div>
            <ChevronDown 
              className={cn(
                "w-3 h-3 text-white/40 transition-transform ml-auto",
                isAccountExpanded && "rotate-180"
              )} 
            />
          </button>
          
          <motion.div
            initial={false}
            animate={{ height: isAccountExpanded ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <nav className="space-y-1 mt-2">
              {ACCOUNT_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/[0.06] space-y-3">
        {/* Plan Info */}
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/60">{planType}</span>
            <span className="text-xs text-white/40">$0/mo</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-3 h-3 text-white/40" />
            <span className="text-xs text-white/60">
              {agent?.model || 'No model'}
            </span>
          </div>
          <div className="text-xs text-white/40 mb-3">
            Credits: {credits.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors">
              Upgrade
            </button>
            <button className="text-xs text-white/60 hover:text-white py-1.5 px-3 transition-colors">
              Top Up
            </button>
          </div>
        </div>

        {/* User Profile */}
        <Link 
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">User</div>
            <div className="text-xs text-white/40">Free Plan</div>
          </div>
          <Settings className="w-4 h-4 text-white/40" />
        </Link>
      </div>
    </div>
  );
}