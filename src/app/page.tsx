"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
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
  Database,
  Sparkles,
  Gift,
  Crown,
  BookOpen
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar-scroll');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      codeExample: "// Chat with your AI agent\nconst response = await fetch('/api/hermes/chat', {\n  method: 'POST',\n  body: JSON.stringify({\n    message: 'Help me mint REAGENT tokens',\n    sessionId: 'user-session-123'\n  })\n});"
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
      codeExample: "// Mint REAGENT tokens\nconst mint = await fetch('/api/mining/inscribe', {\n  method: 'POST',\n  body: JSON.stringify({\n    walletId: 'wallet-123',\n    amount: 10000\n  })\n});"
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
      codeExample: "// Get wallet balance\nconst wallet = await fetch('/api/wallet');\nconst data = await wallet.json();\n\nconsole.log(data.ethBalance); // ETH balance\nconsole.log(data.reagentBalance); // REAGENT balance"
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
      codeExample: "// Configure Discord bot\nconst gateway = await fetch('/api/hermes/gateway', {\n  method: 'POST',\n  body: JSON.stringify({\n    platform: 'discord',\n    token: 'your-bot-token',\n    enabled: true\n  })\n});"
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
      codeExample: "// List available skills\nconst skills = await fetch('/api/hermes/skills');\nconst data = await skills.json();\n\n// Install a custom skill\nawait fetch('/api/hermes/skills', {\n  method: 'POST',\n  body: JSON.stringify({\n    name: 'my-custom-skill',\n    code: skillCode\n  })\n});"
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
      codeExample: "// All sensitive data is encrypted\nconst encryptedKey = encrypt(privateKey, {\n  algorithm: 'aes-256-gcm',\n  key: process.env.WALLET_ENCRYPTION_KEY\n});\n\n// Secure authentication\nconst session = await getServerSession(authOptions);"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 navbar-scroll">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
              <Image src="/logo.jpg" alt="ReAgent" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-lg">ReAgent</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-orange-400 transition-all duration-200 text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-orange-400 transition-all duration-200 text-sm font-medium">How it works</a>
              <a href="#pricing" className="text-gray-400 hover:text-orange-400 transition-all duration-200 text-sm font-medium">Pricing</a>
              <a href="https://explore.tempo.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-all duration-200 text-sm font-medium flex items-center gap-1">
                Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              {authenticated ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/sign-up")}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
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
      <section className="relative overflow-hidden pt-32 fade-in-section">{/* Code Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-orange-500 float-animation">
            <Code className="w-16 h-16" />
          </div>
          <div className="absolute top-32 right-20 text-orange-500 float-animation" style={{ animationDelay: '0.5s' }}>
            <Terminal className="w-12 h-12" />
          </div>
          <div className="absolute bottom-20 left-1/4 text-orange-500 float-animation" style={{ animationDelay: '1s' }}>
            <Database className="w-14 h-14" />
          </div>
          <div className="absolute top-1/2 right-1/3 text-orange-500 float-animation" style={{ animationDelay: '1.5s' }}>
            <Code className="w-10 h-10" />
          </div>
          <div className="absolute bottom-32 right-10 text-orange-500 float-animation" style={{ animationDelay: '2s' }}>
            <Terminal className="w-16 h-16" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-lg mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Built with</span>
              </div>
              <div className="h-4 w-px bg-orange-500/20"></div>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">Hermes AI</span>
              </div>
              <div className="h-4 w-px bg-orange-500/20"></div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-orange-400">Tempo Network</span>
              </div>
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
                onClick={() => router.push(authenticated ? "/dashboard" : "/sign-up")}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
              >
                <span>{authenticated ? "Go to Dashboard" : "Start Building"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/docs")}
                className="group px-8 py-4 bg-white/5 border border-white/10 rounded-lg font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Documentation</span>
                <ArrowRight className="w-3 h-3 opacity-50" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">Developer Workflow</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Ship in minutes, not days</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Deploy production-ready AI agents with blockchain integration using our streamlined developer workflow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-orange-400 font-bold text-sm">01</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Initialize Project</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Sign up via API or dashboard. Auto-provisioned HD wallet with AES-256 encryption and secure key management.</p>
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-gray-300">
                  <span className="text-orange-400">$</span> curl -X POST /api/auth/signup
                </div>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-orange-400 font-bold text-sm">02</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Configure Agent</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Deploy Hermes AI with 73+ skills, custom personality, and multi-channel gateway integration (Discord, Telegram, Slack).</p>
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-gray-300">
                  <span className="text-orange-400">$</span> hermes deploy --config agent.yml
                </div>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-orange-400 font-bold text-sm">03</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Start Mining</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">Execute TIP-20 token inscriptions on Tempo Network. 10K REAGENT per mint with automated gas estimation.</p>
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-gray-300">
                  <span className="text-orange-400">$</span> POST /api/mining/inscribe
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Badge */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tech Stack:</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300 font-mono">Next.js</span>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <span className="text-sm text-gray-300 font-mono">Hermes AI</span>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <span className="text-sm text-gray-300 font-mono">Tempo Chain</span>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <span className="text-sm text-gray-300 font-mono">TypeScript</span>
              </div>
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
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-orange-500/25"
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">Pricing Plans</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Start free, scale as you grow</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Deploy your AI agent with 2,000 free credits. No credit card required. Upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-orange-400" />
                    <h3 className="font-bold text-xl">Free</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Perfect for getting started</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">$0</span>
                    <span className="text-gray-400 text-lg">/month</span>
                  </div>
                  <p className="text-orange-400 text-sm mt-2 font-medium">2,000 credits included</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>2,000 AI credits per month</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Basic AI models (GPT-3.5, Llama)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Up to 2 connected channels</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>73+ built-in skills</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Token mining (10K REAGENT/mint)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Community support</span>
                  </li>
                </ul>
                
                <button
                  onClick={() => router.push("/sign-up")}
                  className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-semibold transition-all duration-200 group/btn"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Building
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Pro - Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-2 border-orange-500/30 rounded-xl p-8 pt-12 relative overflow-visible group"
            >
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/50">
                  COMING SOON
                </div>
              </div>

              {/* Animated glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-orange-400" />
                    <h3 className="font-bold text-xl">Pro</h3>
                  </div>
                  <p className="text-gray-400 text-sm">For power users & teams</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-500">$--</span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>
                  <p className="text-orange-400 text-sm mt-2 font-medium">Pricing TBA</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Higher credit limits</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Advanced AI models (GPT-4, Claude)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Unlimited connected channels</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Priority support & SLA</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Custom skill development</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                
                <button
                  disabled
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500/50 to-orange-600/50 text-white/50 rounded-lg font-semibold cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </motion.div>

            {/* Enterprise - Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300"></div>
              
              <div className="relative">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <h3 className="font-bold text-xl">Enterprise</h3>
                  </div>
                  <p className="text-gray-400 text-sm">For large-scale deployments</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-500">$--</span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>
                  <p className="text-orange-400 text-sm mt-2 font-medium">Custom pricing</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Unlimited credits</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>All AI models + custom models</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>White-label solution</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Custom SLA & compliance</span>
                  </li>
                </ul>
                
                <button
                  disabled
                  className="w-full py-3.5 bg-white/5 text-white/50 border border-white/10 rounded-lg font-semibold cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </motion.div>
          </div>

          {/* Additional info */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Auto-generated HD wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>AES-256 encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Token mining on Tempo</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Open source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">FAQ</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-gray-400">Everything you need to know about deploying AI agents on blockchain</p>
          </div>

          <div className="space-y-3">
            <motion.details 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer">
                <span className="font-semibold text-white">What is ReAgent?</span>
                <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                ReAgent is a production-ready AI agent deployment platform with native blockchain integration. Built on Hermes AI framework with 73+ skills, secure wallet management, and TIP-20 token mining on Tempo Network.
              </div>
            </motion.details>

            <motion.details 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer">
                <span className="font-semibold text-white">Is it really free?</span>
                <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                Yes. Free tier includes 2,000 AI credits per month with no credit card required. Bring your own OpenAI-compatible API key for unlimited usage at cost.
              </div>
            </motion.details>

            <motion.details 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer">
                <span className="font-semibold text-white">What is REAGENT token?</span>
                <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                REAGENT is a TIP-20 token on Tempo Network (Chain ID: 4217). Mine 10,000 REAGENT per inscription via AI agent commands or manual dashboard operations. Low gas fees (~$0.01-0.05 per mint).
              </div>
            </motion.details>

            <motion.details 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer">
                <span className="font-semibold text-white">Can I use my own API keys?</span>
                <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                Absolutely. Configure your own OpenAI, Groq, or Together AI API keys with zero markup. Full control over your AI provider and costs.
              </div>
            </motion.details>

            <motion.details 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer">
                <span className="font-semibold text-white">How secure is my wallet?</span>
                <ChevronDown className="w-5 h-5 text-orange-400 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                Your wallet is secured with AES-256 encryption. Private keys are encrypted at rest and never exposed. Export your keys anytime with full ownership and control.
              </div>
            </motion.details>
          </div>
        </div>
      </section>

      {/* Developer Guide */}
      <section className="py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <Code className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">Developer Guide</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Mint tokens from anywhere</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Use our CLI tool or API to mint REAGENT tokens from command line, scripts, or your own applications</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">NPX CLI Tool</h3>
                  <p className="text-sm text-gray-400">No installation required</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Mint tokens directly from your terminal using npx. Perfect for automation, scripts, and CI/CD pipelines.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Quick Start</p>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-4 font-mono text-sm">
                    <div className="text-gray-400 mb-1"># Check balance</div>
                    <div className="text-orange-400">npx @reagent/cli balance</div>
                    <div className="text-gray-400 mt-3 mb-1"># Mint 10K REAGENT</div>
                    <div className="text-orange-400">npx @reagent/cli mint</div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Available Commands</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">balance</code>
                      <span className="text-gray-400">Check USD, ETH, REAGENT balance</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">estimate</code>
                      <span className="text-gray-400">Estimate minting cost</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">mint</code>
                      <span className="text-gray-400">Mint 10,000 REAGENT tokens</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">history</code>
                      <span className="text-gray-400">View minting history</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">stats</code>
                      <span className="text-gray-400">Global mining statistics</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/docs/cli')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                View CLI Documentation
                <ArrowRight className="w-3 h-3 opacity-50" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                  <Code className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">REST API</h3>
                  <p className="text-sm text-gray-400">Direct HTTP access</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">
                Use our REST API with cURL or any HTTP client. Integrate minting into your applications with simple POST requests.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Example Request</p>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-orange-400">curl -X POST \</div>
                    <div className="text-gray-300 ml-2">&quot;https://reagent.eu.cc/api/hermes/skills/minting&quot; \</div>
                    <div className="text-gray-300 ml-2">-H &quot;Content-Type: application/json&quot; \</div>
                    <div className="text-gray-300 ml-2">-H &quot;X-User-ID: YOUR_USER_ID&quot; \</div>
                    <div className="text-gray-300 ml-2">-d &apos;{'{"action":"mint_tokens"}'}&apos;</div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Available Actions</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded text-xs">check_balance</code>
                      <span className="text-gray-400">Get wallet balances</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded text-xs">estimate_cost</code>
                      <span className="text-gray-400">Estimate gas cost</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded text-xs">mint_tokens</code>
                      <span className="text-gray-400">Execute minting</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded text-xs">get_history</code>
                      <span className="text-gray-400">Fetch mint history</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <code className="text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded text-xs">get_stats</code>
                      <span className="text-gray-400">Global statistics</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/docs/api')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                View API Documentation
                <ArrowRight className="w-3 h-3 opacity-50" />
              </button>
            </motion.div>
          </div>

          <div className="mt-12 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/20 rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <Sparkles className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">Automation Examples</h4>
                  <p className="text-gray-400 text-sm">Integrate minting into your workflows with these examples</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-orange-400" />
                    <h5 className="font-semibold text-sm">Bash Script</h5>
                  </div>
                  <div className="bg-black/40 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                    <div className="text-gray-500">#!/bin/bash</div>
                    <div className="text-orange-400">npx @reagent/cli mint</div>
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4 text-orange-400" />
                    <h5 className="font-semibold text-sm">Node.js</h5>
                  </div>
                  <div className="bg-black/40 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                    <div className="text-blue-400">const</div> <div className="text-gray-300">res = await</div>
                    <div className="text-gray-300">fetch(api)</div>
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-orange-400" />
                    <h5 className="font-semibold text-sm">Cron Job</h5>
                  </div>
                  <div className="bg-black/40 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                    <div className="text-orange-400">0 10 * * *</div>
                    <div className="text-gray-300">npx @reagent/cli mint</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/docs/examples')}
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2"
                >
                  View More Examples
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/10 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-orange-400 uppercase tracking-wider">Ready to Deploy</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Build the future of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">AI × Blockchain</span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Deploy production-ready AI agents with native blockchain integration. 
              Start mining tokens, connect channels, and scale in minutes—not months.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(authenticated ? "/dashboard" : "/sign-up")}
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
              >
                <span>Start Building Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push("/docs")}
                className="group px-8 py-4 bg-white/5 border border-white/10 rounded-lg font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200 inline-flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Documentation</span>
                <ArrowRight className="w-3 h-3 opacity-50" />
              </button>
            </div>
            
            <p className="mt-8 text-sm text-gray-500">
              2,000 free credits • No credit card required • Deploy in under 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Logo & Info */}
            <div className="flex items-center gap-3">
              <Image src="/logo.jpg" alt="ReAgent" width={40} height={40} className="rounded-lg" />
              <div>
                <span className="font-bold text-lg">ReAgent</span>
                <p className="text-gray-500 text-xs">AI Agents on Blockchain</p>
              </div>
            </div>

            {/* Powered By */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Powered by</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-gray-300">Hermes AI</span>
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-gray-300">Tempo Network</span>
                </div>
              </div>
            </div>

            {/* Social & License */}
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/docs')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                  aria-label="Documentation"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
                <a 
                  href="https://explore.tempo.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                  aria-label="Tempo Explorer"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
              <p className="text-xs text-gray-500">© 2026 MIT License</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}