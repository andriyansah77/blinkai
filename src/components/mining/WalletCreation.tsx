"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Copy,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  Shield,
  Lock,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface WalletCreationProps {
  onWalletCreated: () => void;
}

export function WalletCreation({ onWalletCreated }: WalletCreationProps) {
  const [step, setStep] = useState<'intro' | 'creating' | 'display' | 'verify' | 'complete'>('intro');
  const [walletData, setWalletData] = useState<{
    address: string;
    mnemonic: string;
    privateKey: string;
  } | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [verificationInput, setVerificationInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const handleCreateWallet = async () => {
    try {
      setStep('creating');
      
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setWalletData(data.wallet);
        setStep('display');
        toast.success('Wallet created successfully!');
      } else {
        toast.error(data.error?.message || 'Failed to create wallet');
        setStep('intro');
      }
    } catch (error) {
      console.error('Wallet creation error:', error);
      toast.error('Failed to create wallet');
      setStep('intro');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDownload = () => {
    if (!walletData) return;

    const content = `REAGENT WALLET BACKUP
======================

⚠️ KEEP THIS FILE SECURE AND PRIVATE ⚠️

Address: ${walletData.address}

Mnemonic Phrase (12 words):
${walletData.mnemonic}

Private Key:
${walletData.privateKey}

Network: Tempo Network (Chain ID: 4217)

IMPORTANT:
- Never share your mnemonic or private key with anyone
- Store this file in a secure location
- You will need this to access your wallet
- If you lose this, you lose access to your funds forever

Generated: ${new Date().toISOString()}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reagent-wallet-${walletData.address.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Wallet backup downloaded');
  };

  const handleVerify = async () => {
    if (!walletData || !verificationInput.trim()) {
      toast.error('Please enter your mnemonic phrase');
      return;
    }

    try {
      setVerifying(true);

      const response = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic: verificationInput.trim() }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        toast.success('Mnemonic verified successfully!');
        setStep('complete');
        setTimeout(() => {
          onWalletCreated();
        }, 2000);
      } else {
        toast.error('Mnemonic does not match. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify mnemonic');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Your Wallet</h1>
                <p className="text-muted-foreground">
                  Secure wallet for REAGENT token minting on Tempo Network
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-500 mb-1">Important Security Notice</p>
                    <p className="text-muted-foreground">
                      You will receive a 12-word mnemonic phrase and private key. 
                      <span className="font-semibold text-foreground"> You must save these securely</span> - 
                      they cannot be recovered if lost.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Secure Storage</p>
                      <p className="text-xs text-muted-foreground">
                        Your keys are never stored on our servers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Full Control</p>
                      <p className="text-xs text-muted-foreground">
                        You own and control your wallet completely
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Key className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Easy Recovery</p>
                      <p className="text-xs text-muted-foreground">
                        Restore wallet anytime with your mnemonic
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateWallet}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg transition-colors"
              >
                Create Wallet
              </button>
            </div>
          </motion.div>
        )}

        {step === 'creating' && (
          <motion.div
            key="creating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Creating Your Wallet...</h2>
            <p className="text-muted-foreground">Please wait a moment</p>
          </motion.div>
        )}

        {step === 'display' && walletData && (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl w-full"
          >
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Wallet Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Save your mnemonic phrase and private key securely
                </p>
              </div>

              <div className="space-y-6">
                {/* Wallet Address */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Wallet Address</label>
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <code className="flex-1 text-sm font-mono break-all">{walletData.address}</code>
                    <button
                      onClick={() => handleCopy(walletData.address, 'Address')}
                      className="p-2 hover:bg-background rounded transition-colors flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mnemonic Phrase */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold">Mnemonic Phrase (12 words)</label>
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {showMnemonic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showMnemonic ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative p-4 bg-muted rounded-lg">
                    {showMnemonic ? (
                      <div className="flex items-start gap-2">
                        <code className="flex-1 text-sm font-mono break-all">{walletData.mnemonic}</code>
                        <button
                          onClick={() => handleCopy(walletData.mnemonic, 'Mnemonic')}
                          className="p-2 hover:bg-background rounded transition-colors flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Click "Show" to reveal your mnemonic phrase</p>
                    )}
                  </div>
                </div>

                {/* Private Key */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold">Private Key</label>
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPrivateKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative p-4 bg-muted rounded-lg">
                    {showPrivateKey ? (
                      <div className="flex items-start gap-2">
                        <code className="flex-1 text-sm font-mono break-all">{walletData.privateKey}</code>
                        <button
                          onClick={() => handleCopy(walletData.privateKey, 'Private Key')}
                          className="p-2 hover:bg-background rounded transition-colors flex-shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Click "Show" to reveal your private key</p>
                    )}
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-500 mb-1">Critical: Save Your Keys Now!</p>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>This is the ONLY time you'll see your mnemonic and private key</li>
                      <li>Write them down or download the backup file</li>
                      <li>Store them in a secure location (password manager, safe, etc.)</li>
                      <li>Never share them with anyone</li>
                      <li>If you lose them, you lose access to your wallet forever</li>
                    </ul>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="saved-confirm"
                    checked={savedConfirmed}
                    onChange={(e) => setSavedConfirmed(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="saved-confirm" className="text-sm cursor-pointer">
                    I have saved my mnemonic phrase and private key in a secure location. 
                    I understand that I cannot recover them if I lose them.
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Backup
                  </button>
                  <button
                    onClick={() => setStep('verify')}
                    disabled={!savedConfirmed}
                    className={cn(
                      "flex-1 font-semibold py-3 rounded-lg transition-colors",
                      savedConfirmed
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    Continue to Verification
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'verify' && walletData && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Verify Your Mnemonic</h2>
                <p className="text-muted-foreground">
                  Enter your 12-word mnemonic phrase to confirm you've saved it
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Mnemonic Phrase (12 words, separated by spaces)
                  </label>
                  <textarea
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder="Enter your 12-word mnemonic phrase..."
                    className="w-full p-4 bg-muted rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('display')}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={verifying || !verificationInput.trim()}
                    className={cn(
                      "flex-1 font-semibold py-3 rounded-lg transition-colors",
                      verifying || !verificationInput.trim()
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    {verifying ? 'Verifying...' : 'Verify & Complete'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Wallet Setup Complete!</h2>
            <p className="text-muted-foreground mb-4">Redirecting to mining dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
