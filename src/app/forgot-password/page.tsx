'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-300">
            Enter your email to receive reset instructions
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Email address"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Send Reset Link
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="text-purple-400 hover:text-purple-300"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
              <p className="text-green-300">
                If an account with that email exists, we've sent you a reset link.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="mt-4 inline-block text-purple-400 hover:text-purple-300"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}