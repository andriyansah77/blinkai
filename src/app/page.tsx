"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
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
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
                    className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-sm">Powered by Hermes & Tempo Network</span>
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
                className="px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
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
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">01</span>
              </div>
              <h3 className="font-semibold mb-2">Create your account</h3>
              <p className="text-gray-400 text-sm">Sign up and get an auto-generated wallet with encrypted private keys</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">02</span>
              </div>
              <h3 className="font-semibold mb-2">Set up your agent</h3>
              <p className="text-gray-400 text-sm">Configure your AI agent with custom personality and connect channels</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold">03</span>
              </div>
              <h3 className="font-semibold mb-2">Start mining</h3>
              <p className="text-gray-400 text-sm">Mine REAGENT tokens automatically through your AI agent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-gray-400">We handle everything. You just use your agent.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">AI Agent Framework</h3>
              <p className="text-gray-400 text-sm">Built on Hermes with memory, learning, and 73+ pre-installed skills</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <Coins className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Token Mining</h3>
              <p className="text-gray-400 text-sm">Mine 10K REAGENT tokens on Tempo Network with auto or manual mining</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Secure Wallet</h3>
              <p className="text-gray-400 text-sm">Auto-generated HD wallet with AES-256 encrypted private key storage</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="font-semibold mb-2">Multi-Channel Gateway</h3>
              <p className="text-gray-400 text-sm">Connect your agent to Telegram, Discord, and Slack platforms</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Extensible Skills</h3>
              <p className="text-gray-400 text-sm">73+ built-in skills with ability to install and create custom skills</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-400 text-sm">Bank-grade security with encrypted storage and secure authentication</p>
            </div>
          </div>
        </div>
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
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
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
            className="px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
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