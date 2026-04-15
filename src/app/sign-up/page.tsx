'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Shield, Zap, Wallet, Gift } from 'lucide-react';
import Image from 'next/image';

export default function SignUpPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/onboarding');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <Image src="/logo.jpg" alt="ReAgent" width={64} height={64} className="rounded-xl" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Get Started with ReAgent</h1>
          <p className="text-gray-400">Create your account and start building AI agents</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-8"
        >
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-orange-400">Free to Start</span>
            </div>
            <p className="text-sm text-orange-400/80">
              Get 2,000 free credits • No credit card required
            </p>
          </div>

          <button
            onClick={login}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Create Account
          </button>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Wallet className="w-4 h-4 text-orange-400" />
              <span>Connect with any Web3 wallet</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-orange-400" />
              <span>Or use Google, Twitter, Discord, Email</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Wallet auto-created & secured for you</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Already have an account?{' '}
          <button
            onClick={() => router.push('/sign-in')}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            Sign In
          </button>
        </motion.p>
      </div>
    </div>
  );
}
