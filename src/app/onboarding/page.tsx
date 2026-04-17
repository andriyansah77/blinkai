"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Crown,
  Gift,
  Wallet
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const steps: OnboardingStep[] = [
  {
    id: "agent-setup",
    title: "Create Your AI Agent",
    description: "Give your AI agent a name and personality",
    component: AgentSetupStep
  },
  {
    id: "wallet",
    title: "Setup Your Wallet",
    description: "Generate or import your blockchain wallet",
    component: WalletSetupStep
  },
  {
    id: "channels",
    title: "Connect Channels",
    description: "Connect Discord, Telegram, or other platforms",
    component: ChannelsStep
  },
  {
    id: "plan",
    title: "Choose Your Plan",
    description: "Select a plan that fits your needs",
    component: PlanStep
  },
  {
    id: "deploy",
    title: "Deploy Your Agent",
    description: "We're setting up your AI agent",
    component: DeployStep
  }
];

export default function OnboardingPage() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState({
    agentName: "",
    agentPersonality: "",
    channels: [] as string[],
    plan: "free",
    agentId: "",
    walletAddress: ""
  });

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/sign-in");
    } else if (ready && authenticated) {
      checkOnboardingStatus();
    }
  }, [ready, authenticated, router]);

  const checkOnboardingStatus = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/onboarding/status', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const status = await response.json();
        
        if (status.completed) {
          // User already completed onboarding, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        // Find first incomplete step
        const stepKeys = ['agentSetup', 'walletSetup', 'channels', 'plan', 'deployment'];
        let firstIncompleteStep = 0;
        
        for (let i = 0; i < stepKeys.length; i++) {
          if (!status.steps[stepKeys[i]]) {
            firstIncompleteStep = i;
            break;
          }
        }

        // Pre-fill data if available
        if (status.agent) {
          setOnboardingData(prev => ({
            ...prev,
            agentName: status.agent.name,
            agentId: status.agent.id
          }));
        }

        if (status.wallet) {
          setOnboardingData(prev => ({
            ...prev,
            walletAddress: status.wallet.address
          }));
        }

        setCurrentStep(firstIncompleteStep);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="ReAgent" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold">ReAgent Setup</span>
            </div>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  index <= currentStep 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors ${
                    index < currentStep ? 'bg-orange-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-8 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{steps[currentStep].title}</h1>
                <p className="text-gray-400">{steps[currentStep].description}</p>
              </div>

              <CurrentStepComponent
                data={onboardingData}
                updateData={updateData}
                nextStep={nextStep}
                prevStep={prevStep}
                isLastStep={currentStep === steps.length - 1}
                isFirstStep={currentStep === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Step Components
function AgentSetupStep({ data, updateData, nextStep, isFirstStep }: any) {
  const [agentName, setAgentName] = useState(data.agentName || "");
  const [agentPersonality, setAgentPersonality] = useState(data.agentPersonality || "");

  const handleNext = () => {
    if (agentName.trim()) {
      updateData({ agentName, agentPersonality });
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-3">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g., Alex, Maya, or your custom name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-3">Personality (Optional)</label>
            <textarea
              value={agentPersonality}
              onChange={(e) => setAgentPersonality(e.target.value)}
              placeholder="Describe your agent's personality... e.g., 'Friendly and helpful assistant who loves to help with coding projects'"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {["Helpful", "Creative", "Professional"].map((trait) => (
              <button
                key={trait}
                onClick={() => setAgentPersonality((prev: string) => 
                  prev ? `${prev}, ${trait.toLowerCase()}` : trait.toLowerCase()
                )}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                {trait}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!agentName.trim()}
          className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-500 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function WalletSetupStep({ data, updateData, nextStep, prevStep }: any) {
  const { getAccessToken } = usePrivy();
  const [walletMode, setWalletMode] = useState<'generate' | 'import' | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const handleGenerateWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/wallet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const result = await response.json();

      if (result.success) {
        setWalletAddress(result.address);
        updateData({ walletAddress: result.address, walletImported: false });
        // Auto-proceed to next step after 2 seconds
        setTimeout(() => nextStep(), 2000);
      } else {
        setError(result.error?.message || 'Failed to generate wallet');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey.trim()) {
      setError('Please enter your private key');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = await getAccessToken();
      const response = await fetch('/api/wallet/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ privateKey })
      });

      const result = await response.json();

      if (result.success) {
        setWalletAddress(result.address);
        updateData({ walletAddress: result.address, walletImported: true });
        // Auto-proceed to next step after 2 seconds
        setTimeout(() => nextStep(), 2000);
      } else {
        setError(result.error?.message || 'Failed to import wallet');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!walletMode && !walletAddress && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="text-center mb-6">
            <Wallet className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Setup Your Wallet</h3>
            <p className="text-gray-400">
              Choose how you want to setup your blockchain wallet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setWalletMode('generate')}
              className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">Generate New Wallet</h3>
                  <p className="text-sm text-gray-400">
                    Create a new secure wallet automatically
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                    <Check className="w-4 h-4" />
                    <span>Recommended for new users</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setWalletMode('import')}
              className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1">Import Existing Wallet</h3>
                  <p className="text-sm text-gray-400">
                    Use your existing wallet with private key
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-400">
                    <Check className="w-4 h-4" />
                    <span>For experienced users</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-300">
              Your wallet will be used for mining REAGENT tokens and managing your assets on Tempo Network
            </p>
          </div>
        </div>
      )}

      {walletMode === 'generate' && !walletAddress && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate New Wallet</h3>
            <p className="text-gray-400 mb-6">
              We'll create a secure wallet for you automatically
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateWallet}
              disabled={loading}
              className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-500 px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Wallet
                </>
              )}
            </button>

            <button
              onClick={() => setWalletMode(null)}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to options
            </button>
          </div>
        </div>
      )}

      {walletMode === 'import' && !walletAddress && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="text-center mb-6">
            <Wallet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Import Existing Wallet</h3>
            <p className="text-gray-400">
              Enter your private key to import your wallet
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-3">Private Key</label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="0x..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <span className="text-yellow-400 text-xl flex-shrink-0">⚠️</span>
              <p className="text-sm text-yellow-300">
                Never share your private key with anyone. We encrypt and store it securely.
              </p>
            </div>

            <button
              onClick={handleImportWallet}
              disabled={loading || !privateKey.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-500 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Import Wallet
                </>
              )}
            </button>

            <button
              onClick={() => setWalletMode(null)}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to options
            </button>
          </div>
        </div>
      )}

      {walletAddress && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Wallet Setup Complete!</h3>
            <p className="text-gray-400 mb-6">Your wallet is ready to use</p>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Wallet Address</p>
              <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Proceeding to next step...</span>
            </div>
          </div>
        </div>
      )}

      {!walletAddress && (
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}
    </div>
  );
}

function ChannelsStep({ data, updateData, nextStep, prevStep }: any) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(data.channels || []);

  const channels = [
    {
      id: "discord",
      name: "Discord",
      icon: MessageSquare,
      color: "from-indigo-500 to-purple-500",
      description: "Connect to Discord servers and channels"
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      description: "Chat via Telegram bot"
    },
    {
      id: "slack",
      name: "Slack",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      description: "Integrate with Slack workspaces"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      description: "Connect via WhatsApp Business API (Coming Soon)",
      disabled: true
    }
  ];

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleNext = () => {
    updateData({ channels: selectedChannels });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => {
            const IconComponent = channel.icon;
            return (
              <button
                key={channel.id}
                onClick={() => !channel.disabled && toggleChannel(channel.id)}
                disabled={channel.disabled}
                className={`p-4 rounded-lg border transition-all text-left ${
                  channel.disabled
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                    : selectedChannels.includes(channel.id)
                    ? 'bg-orange-500/20 border-orange-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{channel.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{channel.description}</p>
                  </div>
                  {selectedChannels.includes(channel.id) && !channel.disabled && (
                    <Check className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-300">
            You can always add more channels later from your dashboard
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PlanStep({ data, updateData, nextStep, prevStep }: any) {
  const [selectedPlan, setSelectedPlan] = useState(data.plan || "free");

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "/mo",
      credits: "1,000",
      features: [
        "1,000 credits/mo",
        "Basic AI models",
        "2 connected channels",
        "Community support"
      ],
      badge: "Perfect for getting started",
      badgeIcon: Gift
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      period: "/mo",
      credits: "10,000",
      features: [
        "10,000 credits/mo",
        "Advanced AI models",
        "Unlimited channels",
        "Priority support",
        "Custom skills"
      ],
      badge: "Most Popular",
      badgeIcon: Crown,
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      period: "/mo",
      credits: "100,000",
      features: [
        "100,000 credits/mo",
        "All AI models",
        "White-label solution",
        "Dedicated support",
        "SLA guarantee"
      ],
      badge: "For teams",
      badgeIcon: Zap
    }
  ];

  const handleNext = () => {
    updateData({ plan: selectedPlan });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`p-6 rounded-xl border transition-all text-left relative ${
              selectedPlan === plan.id
                ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{plan.credits} credits</p>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              {plan.badgeIcon && <plan.badgeIcon className="w-4 h-4 text-gray-400" />}
              <span className="text-xs text-gray-400">{plan.badge}</span>
            </div>

            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DeployStep({ data }: any) {
  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const [deployStatus, setDeployStatus] = useState<'deploying' | 'success' | 'error'>('deploying');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [gatewayInfo, setGatewayInfo] = useState<any>({ installed: false, running: false, error: null });

  const deployTasks = [
    'Creating your AI agent...',
    'Setting up personality and skills...',
    'Configuring AI model and provider...',
    'Installing gateway service...',
    'Starting gateway for messaging platforms...',
    'Connecting channels...',
    'Configuring plan and credits...',
    'Deploying to cloud infrastructure...',
    'Running final tests...',
    'Your agent is ready!'
  ];

  useEffect(() => {
    deployAgent();
  }, []);

  const deployAgent = async () => {
    try {
      // Get Privy access token
      const token = await getAccessToken();
      
      console.log('Deploying with token:', token ? 'Token present' : 'No token');
      
      const response = await fetch('/api/onboarding/deploy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Deploy error:', response.status, errorData);
        throw new Error('Failed to deploy agent');
      }

      const result = await response.json();
      
      // Store gateway status
      if (result.gateway) {
        setGatewayInfo(result.gateway);
      }
      
      try {
        const walletResponse = await fetch('/api/wallet', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWalletInfo(walletData);
        }
      } catch (error) {
        console.error('Failed to fetch wallet info:', error);
      }
      
      for (let i = 0; i < deployTasks.length; i++) {
        setCurrentTask(deployTasks[i]);
        setProgress(((i + 1) / deployTasks.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setDeployStatus('success');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Deployment failed:', error);
      setDeployStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        {deployStatus === 'deploying' && (
          <>
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Setting up your agent</h3>
            <p className="text-gray-400 mb-6">{currentTask}</p>
            
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
          </>
        )}

        {deployStatus === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-semibold">Agent deployed successfully!</h3>
            </div>
            <p className="text-gray-400 mb-6">
              {data.agentName} is now live and ready to chat!
            </p>
            
            {walletInfo && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" />
                  Your Wallet is Ready
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Wallet Address</p>
                    <p className="text-white font-mono text-sm break-all">{walletInfo.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">ETH Balance</p>
                      <p className="text-white font-semibold">{walletInfo.ethBalance || '0'} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">REAGENT Balance</p>
                      <p className="text-white font-semibold">{walletInfo.reagentBalance || '0'} REAGENT</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-300">
                      Your AI agent can help you manage your wallet and mint REAGENT tokens!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 text-left">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Gateway Service Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Service Installed</span>
                  <div className="flex items-center gap-2">
                    {gatewayInfo.installed ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Yes</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-400 text-xl">✕</span>
                        <span className="text-sm text-red-400">No</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Service Running</span>
                  <div className="flex items-center gap-2">
                    {gatewayInfo.running ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-gray-400">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
                {gatewayInfo.error && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-yellow-400">
                      Note: {gatewayInfo.error}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t border-white/10 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300">
                    Gateway allows your agent to connect with Telegram, Discord, and other messaging platforms
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Welcome to ReAgent!</span>
            </div>
            
            <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
          </>
        )}

        {deployStatus === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-400 text-2xl">✕</span>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Deployment failed</h3>
            <p className="text-gray-400 mb-6">
              Something went wrong. Please try again or contact support.
            </p>
            
            <button
              onClick={deployAgent}
              className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {deployStatus === 'deploying' && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start gap-3">
          <Loader2 className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5 animate-spin" />
          <p className="text-sm text-orange-300">
            This usually takes 1-2 minutes. Please don't close this page.
          </p>
        </div>
      )}
    </div>
  );
}