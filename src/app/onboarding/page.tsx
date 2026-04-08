"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Gift
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    agentName: "",
    agentPersonality: "",
    channels: [] as string[],
    plan: "free",
    agentId: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Ampere.sh Setup</span>
            </div>
            <span className="text-sm text-white/60">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/[0.06] text-white/40'
                }`}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors ${
                    index < currentStep ? 'bg-blue-600' : 'bg-white/[0.06]'
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
                <p className="text-white/60">{steps[currentStep].description}</p>
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
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-white font-medium mb-3">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g., Alex, Maya, or your custom name"
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-3">Personality (Optional)</label>
            <textarea
              value={agentPersonality}
              onChange={(e) => setAgentPersonality(e.target.value)}
              placeholder="Describe your agent's personality... e.g., 'Friendly and helpful assistant who loves to help with coding projects'"
              rows={4}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {["Helpful", "Creative", "Professional"].map((trait) => (
              <button
                key={trait}
                onClick={() => setAgentPersonality((prev: string) => 
                  prev ? `${prev}, ${trait.toLowerCase()}` : trait.toLowerCase()
                )}
                className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg px-4 py-2 text-sm transition-colors"
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ChannelsStep({ data, updateData, nextStep, prevStep }: any) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(data.channels || []);

  const channels = [
    {
      id: "discord",
      name: "Discord",
      icon: "🎮",
      description: "Connect to Discord servers and channels"
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: "✈️",
      description: "Chat via Telegram bot"
    },
    {
      id: "slack",
      name: "Slack",
      icon: "💼",
      description: "Integrate with Slack workspaces"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "📱",
      description: "Connect via WhatsApp Business API"
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
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => toggleChannel(channel.id)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selectedChannels.includes(channel.id)
                  ? 'bg-blue-600/20 border-blue-500/50'
                  : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{channel.icon}</span>
                <div>
                  <h3 className="font-medium text-white">{channel.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{channel.description}</p>
                </div>
                {selectedChannels.includes(channel.id) && (
                  <Check className="w-5 h-5 text-blue-400 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 You can always add more channels later from your dashboard
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
      name: "Free Plan",
      price: "$0",
      period: "/month",
      credits: "1,000",
      features: [
        "1,000 message credits",
        "Basic AI models",
        "2 connected channels",
        "Community support"
      ],
      badge: "🎁 Perfect for getting started",
      popular: false
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "$19",
      period: "/month",
      credits: "10,000",
      features: [
        "10,000 message credits",
        "Advanced AI models (GPT-4)",
        "Unlimited channels",
        "Priority support",
        "Custom skills",
        "Analytics dashboard"
      ],
      badge: "👑 Most Popular",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99",
      period: "/month",
      credits: "100,000",
      features: [
        "100,000 message credits",
        "All AI models",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      badge: "🚀 For teams",
      popular: false
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
                ? 'bg-blue-600/20 border-blue-500/50 ring-2 ring-blue-500/30'
                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="font-semibold text-white text-lg">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-white/60">{plan.period}</span>
              </div>
              <p className="text-sm text-white/60 mt-1">{plan.credits} credits</p>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-white/80">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <span className="text-xs text-white/60">{plan.badge}</span>
            </div>

            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
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
          className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
  const [deployStatus, setDeployStatus] = useState<'deploying' | 'success' | 'error'>('deploying');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const deployTasks = [
    'Creating your AI agent...',
    'Setting up personality and skills...',
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
      // Actually deploy the agent
      const response = await fetch('/api/onboarding/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to deploy agent');
      }

      const result = await response.json();
      
      // Simulate deployment process with real backend call
      for (let i = 0; i < deployTasks.length; i++) {
        setCurrentTask(deployTasks[i]);
        setProgress(((i + 1) / deployTasks.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setDeployStatus('success');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Deployment failed:', error);
      setDeployStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8 text-center">
        {deployStatus === 'deploying' && (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">Setting up your agent</h3>
            <p className="text-white/60 mb-6">{currentTask}</p>
            
            <div className="w-full bg-white/[0.06] rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-sm text-white/40">{Math.round(progress)}% complete</p>
          </>
        )}

        {deployStatus === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">🎉 Agent deployed successfully!</h3>
            <p className="text-white/60 mb-6">
              {data.agentName} is now live and ready to chat. Redirecting to your dashboard...
            </p>
            
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Welcome to Ampere.sh!</span>
            </div>
          </>
        )}

        {deployStatus === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">Deployment failed</h3>
            <p className="text-white/60 mb-6">
              Something went wrong. Please try again or contact support.
            </p>
            
            <button
              onClick={deployAgent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>

      {deployStatus === 'deploying' && (
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            ⏱️ This usually takes 1-2 minutes. Please don't close this page.
          </p>
        </div>
      )}
    </div>
  );
}