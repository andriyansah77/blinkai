"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Github, ExternalLink } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            ReAgent
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            AI Agent Deployment Platform
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Hermes & Tempo Network
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">About</h2>
              <p className="text-muted-foreground">
                Deploy AI agents with blockchain integration. Features include token mining, 
                multi-channel messaging, and 73+ built-in skills powered by Hermes framework.
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Features</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• AI Agent with memory and learning</li>
                <li>• REAGENT token mining on Tempo Network</li>
                <li>• Encrypted wallet management</li>
                <li>• Gateway for Telegram, Discord, Slack</li>
                <li>• 73+ extensible skills</li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-accent text-foreground text-sm rounded">Next.js</span>
                <span className="px-3 py-1 bg-accent text-foreground text-sm rounded">Hermes</span>
                <span className="px-3 py-1 bg-accent text-foreground text-sm rounded">Tempo</span>
                <span className="px-3 py-1 bg-accent text-foreground text-sm rounded">TypeScript</span>
                <span className="px-3 py-1 bg-accent text-foreground text-sm rounded">Prisma</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {session ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-foreground rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push("/sign-in")}
                className="px-6 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-foreground rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Links */}
        <div className="flex justify-center gap-6">
          <a
            href="https://github.com/andriyansah77/blinkai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">GitHub</span>
          </a>
          <a
            href="https://explore.tempo.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="text-sm">Tempo Explorer</span>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>© 2026 ReAgent. MIT License.</p>
        </div>
      </div>
    </div>
  );
}
