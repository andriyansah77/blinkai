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
    image: "/api/placeholder/800/400", // Placeholder for skills screenshot
    category: "skills"
  },
  {
    id: "connect-apps",
    title: "Connect Your Apps",
    description: "Link Telegram, WhatsApp, Discord, and other services so ReAgent can act on your behalf.",
    image: "/api/placeholder/800/400", // Placeholder for connections screenshot
    category: "connections"
  },
  {
    id: "schedule-cron",
    title: "Schedule Cron Jobs",
    description: "Automate recurring tasks — check emails, post updates, monitor prices, all on autopilot.",
    image: "/api/placeholder/800/400", // Placeholder for cron jobs screenshot
    category: "automation"
  },
  {
    id: "change-model",
    title: "Change Your AI Model",
    description: "Switch between models right from the dashboard — pick the best one for speed, quality, or cost.",
    image: "/api/placeholder/800/400", // Placeholder for settings screenshot
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
                <div className="aspect-video bg-[#0a0a0a] rounded-xl p-4 flex items-center justify-center">
                  {/* Placeholder for actual screenshots */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/[0.06] rounded-xl flex items-center justify-center mx-auto mb-4">
                      {currentTipData.category === "skills" && <Lightbulb className="w-8 h-8 text-purple-400" />}
                      {currentTipData.category === "connections" && <Zap className="w-8 h-8 text-blue-400" />}
                      {currentTipData.category === "automation" && <Calendar className="w-8 h-8 text-green-400" />}
                      {currentTipData.category === "settings" && <Settings className="w-8 h-8 text-orange-400" />}
                    </div>
                    <p className="text-white/40 text-sm">Screenshot placeholder for {currentTipData.title}</p>
                  </div>
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