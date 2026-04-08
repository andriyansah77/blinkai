export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By accessing and using BlinkAI, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-gray-300">
              Permission is granted to temporarily use BlinkAI for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. AI Agent Usage</h2>
            <p className="text-gray-300">
              You are responsible for the AI agents you create and their interactions. Use responsibly and ethically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Privacy</h2>
            <p className="text-gray-300">
              Your privacy is important to us. Please review our Privacy Policy for information on how we collect and use data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitations</h2>
            <p className="text-gray-300">
              BlinkAI is provided "as is" without any representations or warranties, express or implied.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}