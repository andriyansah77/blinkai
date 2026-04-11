"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DepositInstructionsProps {
  platformWalletAddress?: string;
  minimumDeposit?: number;
}

export function DepositInstructions({
  platformWalletAddress = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "0xbd6d0CC8F02f7A961b02cC451998748e761cDffE",
  minimumDeposit = 1.0,
}: DepositInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(platformWalletAddress);
    setCopied(true);
    toast.success("Wallet address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-foreground font-semibold text-lg">Deposit USD Balance</h2>
          <p className="text-muted-foreground text-sm">
            Add funds to start minting REAGENT tokens
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-blue-400 text-sm font-medium mb-1">
            Important: Use Tempo Network Only
          </p>
          <p className="text-blue-400/80 text-xs">
            Only send PATHUSD tokens on Tempo Network (Chain ID: 4217). Sending tokens from other networks will result in loss of funds.
          </p>
        </div>
      </div>

      {/* Deposit Address */}
      <div className="mb-6">
        <label className="text-muted-foreground text-sm font-medium mb-2 block">
          Platform Wallet Address
        </label>
        <div className="flex items-center gap-2 p-4 bg-accent rounded-lg border border-border">
          <code className="flex-1 text-foreground text-sm font-mono break-all">
            {platformWalletAddress}
          </code>
          <button
            onClick={handleCopyAddress}
            className="p-2 hover:bg-background rounded-lg transition-colors flex-shrink-0"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Deposit Instructions */}
      <div className="space-y-4 mb-6">
        <h3 className="text-foreground font-medium text-sm">How to Deposit:</h3>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">1</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-1">
                Get PATHUSD Tokens
              </p>
              <p className="text-muted-foreground text-xs">
                Acquire PATHUSD tokens on Tempo Network. You can get them from Tempo DEX or bridge from other networks.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">2</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-1">
                Copy Platform Wallet Address
              </p>
              <p className="text-muted-foreground text-xs">
                Click the copy button above to copy the platform wallet address to your clipboard.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">3</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-1">
                Send PATHUSD to Platform Wallet
              </p>
              <p className="text-muted-foreground text-xs">
                Use your Tempo wallet to send PATHUSD tokens to the platform wallet address. Minimum deposit: ${minimumDeposit.toFixed(2)} USD.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-bold">4</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-medium mb-1">
                Wait for Confirmation
              </p>
              <p className="text-muted-foreground text-xs">
                Your deposit will be credited to your USD balance after blockchain confirmation (usually 1-2 minutes).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimum Deposit Notice */}
      <div className="mb-6 p-4 bg-accent rounded-lg border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground text-sm">Minimum Deposit:</span>
          <span className="text-foreground font-semibold">${minimumDeposit.toFixed(2)} USD</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Network:</span>
          <span className="text-foreground font-semibold">Tempo (Chain ID: 4217)</span>
        </div>
      </div>

      {/* Warning */}
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-orange-400 text-sm font-medium mb-1">
            Double-Check Before Sending
          </p>
          <p className="text-orange-400/80 text-xs">
            Always verify the wallet address and network before sending. Transactions on blockchain are irreversible.
          </p>
        </div>
      </div>

      {/* Helpful Links */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-foreground font-medium text-sm mb-3">Helpful Links:</h3>
        <div className="space-y-2">
          <a
            href="https://explore.tempo.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Tempo Network Explorer
          </a>
          <a
            href="https://docs.tempo.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Tempo Network Documentation
          </a>
        </div>
      </div>
    </motion.div>
  );
}
