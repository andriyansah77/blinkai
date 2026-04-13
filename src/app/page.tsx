"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Coins, 
  Wallet, 
  MessageSquare, 
  Zap, 
  Shield,
  ArrowRight,
  Github,
  ExternalLink,
  Check,
  ChevronDown,
  X,
  Code,
  Terminal,
  Database
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const features = [
    {
      id: "ai-agent",
      icon: Bot,
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-400",
      title: "AI Agent Framework",
      description: "Built on Hermes with memory, learning, and 73+ pre-installed skills",
      details: [
        "Conversational AI with context awareness",
        "Persistent memory across sessions",
        "73+ pre-installed skills (minting, wallet, web search, etc.)",
        "Custom skill creation and installation",
        "Multi-provider AI support (OpenAI, Groq, Together AI)",
        "Learning from interactions over time"
      ],
      codeExample: `// Chat with your AI agent
const response = await fetch('/api/hermes/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Help me mint REAGENT tokens',
    sessionId: 'user-session-123'
  })
});`
    },
    {
      id: "token-mining",
      icon: Coins,
      bgColor: "bg-green-500/20",
      iconColor: "text-green-400",
      title: "Token Mining",
      description: "Mine 10K REAGENT tokens on Tempo Network with auto or manual mining",
      details: [
        "10,000 REAGENT per successful mint",
        "Auto mining via AI agent commands",
        "Manual mining through dashboard",
        "TIP-20 token standard on Tempo Network",
        "Low gas fees (~$0.01-0.05 per mint)",
        "Real-time balance updates"
      ],
      codeExample: `// Mint REAGENT tokens
const mint = await fetch('/api/mining/inscribe', {
  method: 'POST',
  body: JSON.stringify({
    walletId: 'wallet-123',
    amount: 10000
  })
});`
    },
    {
      id: "secure-wallet",
      icon: Wallet,
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-400",
      title: "Secure Wallet",
      description: "Auto-generated HD wallet with AES-256 encrypted private key storage",
      details: [
        "Auto-generated on signup",
        "AES-256 encryption for private keys",
        "HD wallet support",
        "Real-time ETH and REAGENT balance",
        "Send/receive tokens",
        "Export private key (encrypted)"
      ],
      codeExample: `// Get wallet balance
const wallet = await fetch('/api/wallet');
const data = await wallet.json();

console.log(data.ethBalance); // ETH balance
console.log(data.reagentBalance); // REAGENT balance`
    },
    {
      id: "gateway",
      icon: MessageSquare,
      bgColor: "bg-cyan-500/20",
      iconColor: "text-cyan-400",
      title: "Multi-Channel Gateway",
      description: "Connect your agent to Telegram, Discord, and Slack platforms",
      details: [
        "Telegram bot integration",
        "Discord bot with slash commands",
        "Slack workspace integration",
        "Real-time message sync",
        "Multi-platform support",
        "Easy configuration via dashboard"
      ],
      codeExample: `// Configure Discord bot
const gateway = await fetch('/api/hermes/gateway', {
  method: 'POST',
  body: JSON.stringify({
    platform: 'discord',
    token: 'your-bot-token',
    enabled: true
  })
});`
    },
    {
      id: "skills",
      icon: Zap,
      bgColor: "bg-orange-500/20",
      iconColor: "text-orange-400",
      title: "Extensible Skills",
      description: "73+ built-in skills with ability to install and create custom skills",
      details: [
        "73+ pre-installed skills",
        "Minting and wallet management skills",
        "Web search and browsing",
        "File operations",
        "Custom skill creation",
        "Skill marketplace (coming soon)"
      ],
      codeExample: `// List available skills
const skills = await fetch('/api/hermes/skills');
const data = await skills.json();

// Install a custom skill
await fetch('/api/hermes/skills', {
  method: 'POST',
  body: JSON.stringify({
    name: 'my-custom-skill',
    code: skillCode
  })
});`
    },
    {
      id: "security",
      icon: Shield,
      bgColor: "bg-red-500/20",
      iconColor: "text-red-400",
      title: "Enterprise Security",
      description: "Bank-grade security with encrypted storage and secure authentication",
      details: [
        "AES-256 encryption for sensitive data",
        "Secure JWT authentication",
        "Rate limiting and DDoS protection",
        "Encrypted database storage",
        "Audit logging",
        "Regular security updates"
      ],
      codeExample: `// All sensitive data is encrypted
const encryptedKey = encrypt(privateKey, {
  algorithm: 'aes-256-gcm',
  key: process.env.WALLET_ENCRYPTION_KEY
});

// Secure authentication
const session = await getServerSession(authOptions);`
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="ReAgent" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-lg">ReAgent</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How it works</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a>
              <a href="https://explore.tempo.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              {session ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/sign-up")}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Code Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-orange-500">
            <Code className="w-16 h-16" />
          </div>
          <div className="absolute top-32 right-20 text-orange-500">
            <Terminal className="w-12 h-12" />
          </div>
          <div className="absolute bottom-20 left-1/4 text-orange-500">
            <Database className="w-14 h-14" />
          </div>
          <div className="absolute top-1/2 right-1/3 text-orange-500">
            <Code className="w-10 h-10" />
          </div>
          <div className="absolute bottom-32 right-10 text-orange-500">
            <Terminal className="w-16 h-16" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-400 text-sm">Powered by Hermes & Tempo Network</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Deploy AI Agents
              <br />
              <span className="text-gray-500">On Blockchain</span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Create intelligent AI agents with blockchain integration. Mine tokens, 
              connect to messaging platforms, and deploy custom skills in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push(session ? "/dashboard" : "/sign-up")}
                className="px-8 py-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                {session ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open("https://github.com/andriyansah77/blinkai", "_blank")}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div>73+ agents deployed</div>
              <div>•</div>
              <div>Free to start</div>
              <div>•</div>
              <div>No credit card required</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-gray-400">Three steps. That's it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 font-bold">01</span>
              </div>
              <h3 className="font-semibold mb-2">Create your account</h3>
              <p className="text-gray-400 text-sm">Sign up and get an auto-generated wallet with encrypted private keys</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 font-bold">02</span>
              </div>
              <h3 className="font-semibold mb-2">Set up your agent</h3>
              <p className="text-gray-400 text-sm">Configure your AI agent with custom personality and connect channels</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-400 font-bold">03</span>
              </div>
              <h3 className="font-semibold mb-2">Start mining</h3>
              <p className="text-gray-400 text-sm">Mine REAGENT tokens automatically through your AI agent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-white/10 relative overflow-hidden">
        {/* Code Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-1/4 text-orange-500">
            <Code className="w-12 h-12" />
          </div>
          <div className="absolute bottom-20 right-1/4 text-orange-500">
            <Terminal className="w-14 h-14" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-gray-400">We handle everything. You just use your agent.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedFeature(feature)}
                className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
                <div className="mt-4 text-orange-400 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Feature Modal */}
        <AnimatePresence>
          {selectedFeature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedFeature(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${selectedFeature.bgColor} flex items-center justify-center`}>
                      <selectedFeature.icon className={`w-6 h-6 ${selectedFeature.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedFeature.title}</h3>
                      <p className="text-gray-400">{selectedFeature.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {selectedFeature.details.map((detail: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Check className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedFeature.codeExample && (
                    <div>
                      <h4 className="font-semibold mb-3">Example Usage</h4>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="text-gray-300">{selectedFeature.codeExample}</pre>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => router.push("/sign-up")}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">73+</div>
              <div className="text-gray-400 text-sm">Built-in Skills</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K</div>
              <div className="text-gray-400 text-sm">REAGENT per Mint</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <div className="text-gray-400 text-sm">Gateway Channels</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4217</div>
              <div className="text-gray-400 text-sm">Tempo Chain ID</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Everything you need to run your AI agent. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Free</h3>
                <p className="text-gray-400 text-sm">For personal projects</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  1,000 credits/mo
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Basic AI models
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  2 connected channels
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Community support
                </li>
              </ul>
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
              >
                Start Free
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white/5 border-2 border-blue-500/50 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Pro</h3>
                <p className="text-gray-400 text-sm">For power users</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  10,000 credits/mo
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Advanced AI models
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Unlimited channels
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Priority support
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Custom skills
                </li>
              </ul>
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors"
              >
                Get Pro
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">Enterprise</h3>
                <p className="text-gray-400 text-sm">For teams & heavy work</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  100,000 credits/mo
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  All AI models
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  White-label solution
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400" />
                  SLA guarantee
                </li>
              </ul>
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Got questions?</h2>
            <p className="text-gray-400">Everything you need to know about ReAgent</p>
          </div>

          <div className="space-y-4">
            <details className="group bg-white/5 border border-white/10 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <span className="font-medium">What is ReAgent?</span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                ReAgent is an AI agent deployment platform with blockchain integration. We host and manage your Hermes AI agent with token mining capabilities on Tempo Network.
              </div>
            </details>

            <details className="group bg-white/5 border border-white/10 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <span className="font-medium">Is it really free?</span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                Yes. Free tier includes 1,000 credits per month. Bring your own API key and it costs nothing. No credit card needed.
              </div>
            </details>

            <details className="group bg-white/5 border border-white/10 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <span className="font-medium">What is REAGENT token?</span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                REAGENT is a TIP-20 token on Tempo Network. You can mine 10,000 REAGENT per inscription through your AI agent or manually via dashboard.
              </div>
            </details>

            <details className="group bg-white/5 border border-white/10 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <span className="font-medium">Can I use my own API keys?</span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                Yes. Bring your own OpenAI-compatible API key, zero markup. Or use our included credits.
              </div>
            </details>

            <details className="group bg-white/5 border border-white/10 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer">
                <span className="font-medium">What about my data?</span>
                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                It's yours. Export everything with one click, anytime. No lock-in. Your wallet private keys are encrypted with AES-256.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Your agent should be running right now.</h2>
          <p className="text-gray-400 mb-8">Deploy your AI agent in minutes with blockchain integration.</p>
          <button
            onClick={() => router.push(session ? "/dashboard" : "/sign-up")}
            className="px-8 py-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
          >
            Deploy Your Agent
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="ReAgent" width={32} height={32} className="rounded-lg" />
              <div>
                <span className="font-semibold">ReAgent</span>
                <p className="text-gray-500 text-xs">© 2026 MIT License</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://github.com/andriyansah77/blinkai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://explore.tempo.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            Powered by Hermes & Tempo Network
          </div>
        </div>
      </footer>
    </div>
  );
}