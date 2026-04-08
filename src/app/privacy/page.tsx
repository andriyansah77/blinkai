export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-300">
              We collect information you provide directly to us, such as when you create an account, use our AI agents, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-300">
              We use the information we collect to provide, maintain, and improve our services, including AI agent functionality and user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">AI Agent Data</h2>
            <p className="text-gray-300">
              Conversations with AI agents are stored to improve agent learning and memory capabilities. This data is associated with your account and kept secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-gray-300">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy, please contact us through our support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}