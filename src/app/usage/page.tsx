export default function UsagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Usage Guide</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-gray-300 mb-4">
              Welcome to ReAgent! Here's how to get started with creating and managing your AI agents:
            </p>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>Complete the onboarding process to set up your first agent</li>
              <li>Configure your agent's personality and capabilities</li>
              <li>Connect channels for deployment (Discord, Telegram, etc.)</li>
              <li>Start chatting with your agent to train and improve it</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Agent Features</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Learning & Memory: Agents remember conversations and improve over time</li>
              <li>Custom Skills: Add Python skills to extend agent capabilities</li>
              <li>Multi-Channel: Deploy to Discord, Telegram, and other platforms</li>
              <li>Hermes Integration: Powered by advanced AI framework</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Credit System</h2>
            <p className="text-gray-300">
              New users receive 1,000 free credits. Credits are consumed based on AI usage and can be topped up as needed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Support</h2>
            <p className="text-gray-300">
              Need help? Check our documentation or contact support through the dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}