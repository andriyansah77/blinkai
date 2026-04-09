"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Lightbulb, Zap, Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProTip {
  id: string;
  title: string;
  description: string;
  image: string;
  category: "skills" | "connections" | "automation" | "settings";
}

const PRO_TIPS: ProTip[] = [
  {
    id: "install-skills",
    title: "Install Skills",
    description: "Give ReAgent superpowers — browse and install skills like Gmail, Twitter, web scraping, and more.",
    image: "skills-marketplace",
    category: "skills"
  },
  {
    id: "connect-apps",
    title: "Connect Your Apps",
    description: "Link Telegram, WhatsApp, Discord, and other services so ReAgent can act on your behalf.",
    image: "connections-grid",
    category: "connections"
  },
  {
    id: "schedule-cron",
    title: "Schedule Cron Jobs",
    description: "Automate recurring tasks — check emails, post updates, monitor prices, all on autopilot.",
    image: "cron-scheduler",
    category: "automation"
  },
  {
    id: "change-model",
    title: "Change Your AI Model",
    description: "Switch between models right from the dashboard — pick the best one for speed, quality, or cost.",
    image: "model-settings",
    category: "settings"
  }
];

interface ProTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProTipsModal({ isOpen, onClose }: ProTipsModalProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % PRO_TIPS.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + PRO_TIPS.length) % PRO_TIPS.length);
  };

  const goToTip = (index: number) => {
    setCurrentTip(index);
  };

  const currentTipData = PRO_TIPS[currentTip];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-white/[0.12] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-2xl font-bold text-white">PRO TIPS</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Screenshot/Image Area */}
              <div className="relative mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <div className="aspect-video bg-[#0a0a0a] rounded-xl p-6 flex items-center justify-center">
                  {/* Dynamic content based on tip */}
                  {currentTipData.image === "skills-marketplace" && (
                    <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Skills Marketplace</h3>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                            <Lightbulb className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                            <Zap className="w-3 h-3 text-green-400" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {["Email Assistant", "Web Scraper", "Social Media", "Data Analyzer"].map((skill, idx) => (
                          <div key={idx} className="bg-white/[0.06] p-3 rounded-lg border border-white/[0.08]">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-4 h-4 bg-purple-500/20 rounded flex items-center justify-center">
                                <span className="text-purple-400 text-xs">⚡</span>
                              </div>
                              <span className="text-white text-xs font-medium">{skill}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/40 text-xs">★ 4.8</span>
                              <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Install</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTipData.image === "connections-grid" && (
                    <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Connect Platforms</h3>
                        <span className="text-white/40 text-xs">12 platforms available</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { name: "Telegram", icon: "✈️", status: "ready" },
                          { name: "Discord", icon: "🎮", status: "ready" },
                          { name: "WhatsApp", icon: "📱", status: "ready" },
                          { name: "Slack", icon: "💼", status: "soon" },
                          { name: "Twitter", icon: "🐦", status: "soon" },
                          { name: "Facebook", icon: "📘", status: "soon" },
                          { name: "Instagram", icon: "📷", status: "soon" },
                          { name: "Email", icon: "📧", status: "soon" }
                        ].map((platform, idx) => (
                          <div key={idx} className="bg-white/[0.06] p-2 rounded-lg border border-white/[0.08] text-center">
                            <div className="text-lg mb-1">{platform.icon}</div>
                            <div className="text-white text-xs font-medium mb-1">{platform.name}</div>
                            <div className={`text-xs px-1 py-0.5 rounded ${
                              platform.status === 'ready' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {platform.status === 'ready' ? 'Ready' : 'Soon'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTipData.image === "cron-scheduler" && (
                    <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Scheduled Jobs</h3>
                        <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded">+ New Job</button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: "Daily Email Check", schedule: "Every day at 9:00 AM", status: "active" },
                          { name: "Social Media Post", schedule: "Mon, Wed, Fri at 2:00 PM", status: "active" },
                          { name: "Price Monitor", schedule: "Every 30 minutes", status: "paused" },
                          { name: "Backup Reports", schedule: "Weekly on Sunday", status: "active" }
                        ].map((job, idx) => (
                          <div key={idx} className="bg-white/[0.06] p-3 rounded-lg border border-white/[0.08]">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white text-xs font-medium">{job.name}</div>
                                <div className="text-white/40 text-xs">{job.schedule}</div>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${
                                job.status === 'active' ? 'bg-green-400' : 'bg-orange-400'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTipData.image === "model-settings" && (
                    <div className="w-full h-full bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">AI Model Settings</h3>
                        <div className="text-white/40 text-xs">Current: GPT-4o</div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { name: "GPT-4o", provider: "OpenAI", speed: "Fast", quality: "High", cost: "$$", selected: true },
                          { name: "GPT-4o Mini", provider: "OpenAI", speed: "Very Fast", quality: "Good", cost: "$", selected: false },
                          { name: "Claude 3.5", provider: "Anthropic", speed: "Fast", quality: "High", cost: "$$", selected: false },
                          { name: "Llama 3.1", provider: "Meta", speed: "Fast", quality: "Good", cost: "$", selected: false }
                        ].map((model, idx) => (
                          <div key={idx} className={`p-3 rounded-lg border ${
                            model.selected 
                              ? 'bg-blue-500/20 border-blue-500/30' 
                              : 'bg-white/[0.06] border-white/[0.08]'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-xs font-medium">{model.name}</span>
                                  {model.selected && <span className="text-blue-400 text-xs">✓</span>}
                                </div>
                                <div className="text-white/40 text-xs">{model.provider}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white/60 text-xs">{model.speed}</div>
                                <div className="text-white/40 text-xs">{model.cost}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tip Content */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  {currentTipData.title}
                </h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  {currentTipData.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevTip}
                  className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                  {PRO_TIPS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToTip(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        index === currentTip
                          ? "bg-purple-500"
                          : "bg-white/[0.2] hover:bg-white/[0.4]"
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTip}
                  className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}