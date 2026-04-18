"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface MiningPromoModalProps {
  onClose?: () => void;
}

export default function MiningPromoModal({ onClose }: MiningPromoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if modal was shown in this session
    const modalShown = sessionStorage.getItem('miningPromoShown');
    
    if (!modalShown) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('miningPromoShown', 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleMintNow = () => {
    // Navigate to chat with /mine command
    router.push('/dashboard/chat?command=/mine');
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-gradient-to-br from-card via-card to-card/95 border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-green-500/10 animate-pulse" />
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-accent/80 hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </button>

              {/* Content */}
              <div className="relative p-6 sm:p-8">
                {/* Icon */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full blur-xl opacity-50"
                    />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Coins className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-4 sm:mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Start Mining REAGENT!
                    </h2>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Earn 10,000 REAGENT tokens per mint
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg border border-border">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Auto Mining</h3>
                      <p className="text-xs text-muted-foreground">
                        Only 0.5 PATHUSD + gas fees
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg border border-border">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Instant Rewards</h3>
                      <p className="text-xs text-muted-foreground">
                        Get 10,000 REAGENT tokens immediately
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg border border-border">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">Easy Process</h3>
                      <p className="text-xs text-muted-foreground">
                        Just type /mine in chat - AI handles the rest
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleMintNow}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Mine REAGENT Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full bg-accent hover:bg-accent/80 text-foreground font-medium py-2.5 sm:py-3 px-6 rounded-xl transition-all text-sm"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-4">
                  This popup shows once per session
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
