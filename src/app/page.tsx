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
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">ReAgent</h1>
                <p className="text-gray-400 text-xs">AI Agent Platform</p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                Features
              </a>
              <a href="#stats" className="text-gray-400 hover:text-white transition-colors text-sm">
                Stats
              </a>
              <a href="https://explore.tempo.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {session ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push("/sign-up")}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all"
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
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-sm">Powered by Hermes & Tempo Network</span>
            </div>

            <h1 className="text-6xl font-bold text-white mb-6">
              Deploy AI Agents
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                On Blockchain
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Create intelligent AI agents with blockchain integration. Mine tokens, 
              connect to messaging platforms, and deploy custom skills in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(session ? "/dashboard" : "/sign-up")}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
              >
                {session ? "Go to Dashboard" : "Start Building"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => window.open("https://github.com/andriyansah77/blinkai", "_blank")}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">73+</div>
              <div className="text-sm text-gray-400">Built-in Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K</div>
              <div className="text-sm text-gray-400">REAGENT per Mint</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <div className="text-sm text-gray-400">Gateway Channels</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4217</div>
              <div className="text-sm text-gray-400">Tempo Chain ID</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg">
              Powerful features for building and deploying AI agents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Agent Framework
              </h3>
              <p className="text-gray-400 mb-4">
                Built on Hermes with memory, learning, and 73+ pre-installed skills
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Learn more
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Token Mining
              </h3>
              <p className="text-gray-400 mb-4">
                Mine 10K REAGENT tokens on Tempo Network with auto or manual mining
              </p>
              <div className="flex items-center text-green-400 text-sm font-medium">
                Start mining
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Secure Wallet
              </h3>
              <p className="text-gray-400 mb-4">
                Auto-generated HD wallet with AES-256 encrypted private key storage
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View details
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Multi-Channel Gateway
              </h3>
              <p className="text-gray-400 mb-4">
                Connect your agent to Telegram, Discord, and Slack platforms
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium">
                Configure
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Extensible Skills
              </h3>
              <p className="text-gray-400 mb-4">
                73+ built-in skills with ability to install and create custom skills
              </p>
              <div className="flex items-center text-orange-400 text-sm font-medium">
                Browse skills
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Enterprise Security
              </h3>
              <p className="text-gray-400 mb-4">
                Bank-grade security with encrypted storage and secure authentication
              </p>
              <div className="flex items-center text-red-400 text-sm font-medium">
                Security docs
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built With Best-in-Class Technology
            </h2>
            <p className="text-gray-400 text-lg">
              Powered by cutting-edge frameworks and networks
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Hermes */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Hermes</h3>
                  <p className="text-sm text-gray-400">AI Agent Framework</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Advanced AI agent framework with memory, learning capabilities, and extensible skill system.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">Memory System</span>
                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">73+ Skills</span>
                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">Multi-Provider</span>
              </div>
            </div>

            {/* Tempo */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Tempo Network</h3>
                  <p className="text-sm text-gray-400">Blockchain Layer</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                High-performance blockchain with TIP-20 tokens. Fast transactions and full EVM compatibility.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">Chain ID: 4217</span>
                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">TIP-20</span>
                <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">EVM Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Deploy Your AI Agent?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join the future of AI-powered blockchain applications
            </p>
            <button
              onClick={() => router.push(session ? "/dashboard" : "/sign-up")}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
            >
              {session ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">ReAgent</h1>
                <p className="text-gray-400 text-xs">© 2026 MIT License</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/andriyansah77/blinkai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://explore.tempo.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
