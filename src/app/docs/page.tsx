'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Book, 
  Code, 
  Download, 
  Terminal, 
  Wallet, 
  Zap, 
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Coins
} from 'lucide-react';

export default function DocsPage() {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Book className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-foreground text-2xl font-bold">ReAgent Mining Docs</h1>
                <p className="text-muted-foreground text-sm">Complete guide for REAGENT inscription on Tempo Network</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-8 space-y-2">
              <NavItem icon={<Zap className="w-4 h-4" />} label="Quick Start" href="#quick-start" />
              <NavItem icon={<Terminal className="w-4 h-4" />} label="Web Interface" href="#web-interface" />
              <NavItem icon={<Download className="w-4 h-4" />} label="AI Agent Skills" href="#ai-skills" />
              <NavItem icon={<Code className="w-4 h-4" />} label="API Integration" href="#api" />
              <NavItem icon={<Wallet className="w-4 h-4" />} label="Network Info" href="#network" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Quick Start */}
            <Section id="quick-start" title="🚀 Quick Start" icon={<Zap className="w-6 h-6" />}>
              <p className="text-muted-foreground mb-6">
                Get started with REAGENT mining in three simple ways:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <QuickStartCard
                  icon={<Terminal className="w-8 h-8" />}
                  title="Web Interface"
                  description="User-friendly UI for manual minting"
                  link="https://mining.reagent.eu.cc"
                  linkText="Open Mining UI"
                />
                <QuickStartCard
                  icon={<Download className="w-8 h-8" />}
                  title="AI Agent Skills"
                  description="Automated minting via CLI scripts"
                  link="#ai-skills"
                  linkText="Install Skills"
                />
                <QuickStartCard
                  icon={<Code className="w-8 h-8" />}
                  title="API Integration"
                  description="Direct API calls for custom apps"
                  link="#api"
                  linkText="View API Docs"
                />
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-blue-600/10 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-400" />
                  What is Inscription?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Inscription creates permanent on-chain records on Tempo Network. Each inscription mints REAGENT tokens directly to your wallet. 
                  It's a fair launch mechanism where everyone can participate equally.
                </p>
              </div>
            </Section>

            {/* Web Interface */}
            <Section id="web-interface" title="🖥️ Web Interface" icon={<Terminal className="w-6 h-6" />}>
              <p className="text-muted-foreground mb-6">
                The easiest way to mint REAGENT tokens through our web interface.
              </p>

              <div className="space-y-4">
                <StepCard
                  number="1"
                  title="Access Mining UI"
                  description="Navigate to the mining interface"
                >
                  <CodeBlock
                    code="https://mining.reagent.eu.cc"
                    language="url"
                    onCopy={() => copyToClipboard('https://mining.reagent.eu.cc', 'mining-url')}
                    copied={copiedCode === 'mining-url'}
                  />
                </StepCard>

                <StepCard
                  number="2"
                  title="Configure Amount"
                  description="Set the amount of REAGENT tokens to mint (1 - 10,000 per transaction)"
                >
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min Amount:</span>
                        <span className="text-foreground font-medium ml-2">1 REAGENT</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Amount:</span>
                        <span className="text-foreground font-medium ml-2">10,000 REAGENT</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Repeat:</span>
                        <span className="text-foreground font-medium ml-2">1 - 50 times</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Protocol Fee:</span>
                        <span className="text-foreground font-medium ml-2">~$0.25 pathUSD</span>
                      </div>
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  number="3"
                  title="Estimate & Mint"
                  description="Check gas costs and execute the minting transaction"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 bg-accent/50 border border-border rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Step 1</div>
                      <div className="text-foreground font-medium">Estimate Gas</div>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 bg-primary/20 border border-primary/30 rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Step 2</div>
                      <div className="text-foreground font-medium">Mint Tokens</div>
                    </div>
                  </div>
                </StepCard>
              </div>
            </Section>

            {/* AI Agent Skills */}
            <Section id="ai-skills" title="🤖 AI Agent Skills" icon={<Download className="w-6 h-6" />}>
              <p className="text-muted-foreground mb-6">
                Install command-line skills for automated minting via AI agents.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <SkillCard
                  title="Minting Skill"
                  description="Mint REAGENT tokens, check balance, estimate gas"
                  downloadUrl="https://mining.reagent.eu.cc/skills/minting.sh"
                  commands={['get_balance', 'estimate_gas', 'mint', 'get_stats']}
                />
                <SkillCard
                  title="Wallet Skill"
                  description="Manage wallet, send tokens, check balances"
                  downloadUrl="https://mining.reagent.eu.cc/skills/wallet.sh"
                  commands={['check_balance', 'get_address', 'send_reagent', 'history']}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-foreground font-semibold">Installation</h3>
                
                <CodeBlock
                  title="Download Skills"
                  code={`# Download minting skill
curl -O https://mining.reagent.eu.cc/skills/minting.sh
chmod +x minting.sh

# Download wallet skill
curl -O https://mining.reagent.eu.cc/skills/wallet.sh
chmod +x wallet.sh`}
                  language="bash"
                  onCopy={() => copyToClipboard(`curl -O https://mining.reagent.eu.cc/skills/minting.sh\nchmod +x minting.sh\ncurl -O https://mining.reagent.eu.cc/skills/wallet.sh\nchmod +x wallet.sh`, 'install-skills')}
                  copied={copiedCode === 'install-skills'}
                />

                <CodeBlock
                  title="Configure Environment"
                  code={`export REAGENT_USER_ID="your-user-id"
export REAGENT_API_BASE="https://mining.reagent.eu.cc"`}
                  language="bash"
                  onCopy={() => copyToClipboard(`export REAGENT_USER_ID="your-user-id"\nexport REAGENT_API_BASE="https://mining.reagent.eu.cc"`, 'config-env')}
                  copied={copiedCode === 'config-env'}
                />

                <CodeBlock
                  title="Test Installation"
                  code={`# Test minting skill
./minting.sh get_balance

# Test wallet skill
./wallet.sh check_balance`}
                  language="bash"
                  onCopy={() => copyToClipboard(`./minting.sh get_balance\n./wallet.sh check_balance`, 'test-skills')}
                  copied={copiedCode === 'test-skills'}
                />
              </div>

              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Book className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium mb-1">Get Your User ID</h4>
                    <p className="text-muted-foreground text-sm">
                      Login to <a href="https://reagent.eu.cc/dashboard" className="text-blue-400 hover:underline">your dashboard</a> and copy your User ID from the profile section.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* API Integration */}
            <Section id="api" title="⚡ API Integration" icon={<Code className="w-6 h-6" />}>
              <p className="text-muted-foreground mb-6">
                Integrate REAGENT minting directly into your applications.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-foreground font-semibold mb-3">Base URL</h3>
                  <CodeBlock
                    code="https://mining.reagent.eu.cc"
                    language="url"
                    onCopy={() => copyToClipboard('https://mining.reagent.eu.cc', 'api-base')}
                    copied={copiedCode === 'api-base'}
                  />
                </div>

                <div>
                  <h3 className="text-foreground font-semibold mb-3">Authentication</h3>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">Header:</span>
                        <code className="text-foreground bg-accent px-2 py-1 rounded">X-User-ID: your-user-id</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">Session:</span>
                        <span className="text-foreground">NextAuth cookie (web only)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-foreground font-semibold mb-3">Endpoints</h3>
                  
                  <div className="space-y-3">
                    <EndpointCard
                      method="POST"
                      path="/api/hermes/skills/minting"
                      description="Execute minting operations"
                      actions={['get_balance', 'estimate_gas', 'mint', 'get_stats']}
                    />
                    <EndpointCard
                      method="POST"
                      path="/api/hermes/skills/wallet"
                      description="Manage wallet operations"
                      actions={['check_balance', 'get_address', 'send_reagent', 'history']}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-foreground font-semibold mb-3">Example: Mint Tokens</h3>
                  
                  <div className="space-y-3">
                    <CodeBlock
                      title="JavaScript"
                      code={`const response = await fetch('https://mining.reagent.eu.cc/api/hermes/skills/minting', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': 'your-user-id'
  },
  body: JSON.stringify({
    action: 'mint',
    amount: 1000
  })
});

const data = await response.json();
console.log('Minted:', data.formatted.amount);`}
                      language="javascript"
                      onCopy={() => copyToClipboard(`const response = await fetch('https://mining.reagent.eu.cc/api/hermes/skills/minting', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'X-User-ID': 'your-user-id'\n  },\n  body: JSON.stringify({\n    action: 'mint',\n    amount: 1000\n  })\n});\n\nconst data = await response.json();\nconsole.log('Minted:', data.formatted.amount);`, 'api-js')}
                      copied={copiedCode === 'api-js'}
                    />

                    <CodeBlock
                      title="cURL"
                      code={`curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/minting \\
  -H "Content-Type: application/json" \\
  -H "X-User-ID: your-user-id" \\
  -d '{"action": "mint", "amount": 1000}'`}
                      language="bash"
                      onCopy={() => copyToClipboard(`curl -X POST https://mining.reagent.eu.cc/api/hermes/skills/minting \\\n  -H "Content-Type: application/json" \\\n  -H "X-User-ID: your-user-id" \\\n  -d '{"action": "mint", "amount": 1000}'`, 'api-curl')}
                      copied={copiedCode === 'api-curl'}
                    />
                  </div>
                </div>
              </div>
            </Section>

            {/* Network Info */}
            <Section id="network" title="🌐 Network Information" icon={<Wallet className="w-6 h-6" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Network Name" value="Tempo Network" />
                <InfoCard label="Chain ID" value="4217" />
                <InfoCard label="RPC URL" value="https://rpc.tempo.xyz" copyable />
                <InfoCard label="Explorer" value="https://explore.tempo.xyz" link />
                <InfoCard 
                  label="REAGENT Token" 
                  value="0x20C0...65Bc5" 
                  fullValue="0x20C000000000000000000000a59277C0c1d65Bc5"
                  copyable 
                />
                <InfoCard label="Token Decimals" value="6" />
              </div>
            </Section>

            {/* Resources */}
            <Section id="resources" title="📚 Additional Resources">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResourceCard
                  icon={<Book className="w-5 h-5" />}
                  title="Complete Mining Guide"
                  description="Detailed guide with examples and troubleshooting"
                  link="https://mining.reagent.eu.cc/docs/mining-guide.md"
                />
                <ResourceCard
                  icon={<Download className="w-5 h-5" />}
                  title="Skills README"
                  description="Full documentation for AI agent skills"
                  link="https://mining.reagent.eu.cc/skills/README.md"
                />
                <ResourceCard
                  icon={<Terminal className="w-5 h-5" />}
                  title="Mining Interface"
                  description="Web UI for manual token minting"
                  link="https://mining.reagent.eu.cc"
                />
                <ResourceCard
                  icon={<ExternalLink className="w-5 h-5" />}
                  title="Main Dashboard"
                  description="Manage your agents and deployments"
                  link="https://reagent.eu.cc/dashboard"
                />
              </div>
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}

// Components
function NavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors group"
    >
      <span className="text-muted-foreground group-hover:text-foreground">{icon}</span>
      <span className="text-sm">{label}</span>
    </a>
  );
}

function Section({ 
  id, 
  title, 
  icon, 
  children 
}: { 
  id?: string; 
  title: string; 
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-primary">{icon}</div>}
        <h2 className="text-foreground text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function QuickStartCard({ 
  icon, 
  title, 
  description, 
  link, 
  linkText 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string; 
  linkText: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-foreground font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <a
        href={link}
        className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description, 
  children 
}: { 
  number: string; 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-foreground font-semibold mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ 
  title, 
  code, 
  language, 
  onCopy, 
  copied 
}: { 
  title?: string; 
  code: string; 
  language: string; 
  onCopy: () => void; 
  copied: boolean;
}) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center justify-between">
          <span className="text-gray-400 text-xs font-medium">{title}</span>
          <span className="text-gray-500 text-xs">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-gray-300">{code}</code>
        </pre>
        <button
          onClick={onCopy}
          className="absolute top-2 right-2 p-2 bg-[#2d2d2d] hover:bg-[#3e3e3e] rounded-lg transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}

function SkillCard({ 
  title, 
  description, 
  downloadUrl, 
  commands 
}: { 
  title: string; 
  description: string; 
  downloadUrl: string; 
  commands: string[];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-foreground font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">Commands:</div>
        <div className="flex flex-wrap gap-2">
          {commands.map((cmd) => (
            <span key={cmd} className="px-2 py-1 bg-accent text-foreground text-xs rounded font-mono">
              {cmd}
            </span>
          ))}
        </div>
      </div>
      <a
        href={downloadUrl}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
      </a>
    </div>
  );
}

function EndpointCard({ 
  method, 
  path, 
  description, 
  actions 
}: { 
  method: string; 
  path: string; 
  description: string; 
  actions: string[];
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
          {method}
        </span>
        <div className="flex-1">
          <code className="text-foreground text-sm">{path}</code>
          <p className="text-muted-foreground text-xs mt-1">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <span key={action} className="px-2 py-1 bg-accent text-foreground text-xs rounded font-mono">
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ 
  label, 
  value, 
  fullValue, 
  copyable, 
  link 
}: { 
  label: string; 
  value: string; 
  fullValue?: string;
  copyable?: boolean; 
  link?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullValue || value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-muted-foreground text-xs mb-1">{label}</div>
      <div className="flex items-center justify-between gap-2">
        {link ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary text-sm font-mono hover:underline flex items-center gap-1"
          >
            {value}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-foreground text-sm font-mono">{value}</span>
        )}
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ 
  icon, 
  title, 
  description, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-foreground font-semibold mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  );
}
