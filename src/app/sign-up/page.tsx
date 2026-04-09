"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, Loader2, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(
          "Account created but sign in failed. Please sign in manually."
        );
        router.push("/sign-in");
      } else {
        toast.success("Account created! Welcome to ReAgent 🎉");
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0d0d0d] border-r border-white/[0.05]">
        {/* Amber gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/[0.1] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-orange-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-400/[0.06] rounded-full blur-3xl" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center relative">
              <Image
                src="/logo.jpg"
                alt="ReAgent"
                width={32}
                height={32}
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            <span className="font-bold text-xl text-white">
              Re<span className="text-amber-400">Agent</span>
            </span>
          </Link>

          {/* Feature highlight */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                Deploy AI agents{" "}
                <span className="gradient-text-amber">10× faster</span>
              </h2>
              <div className="space-y-3.5">
                {[
                  "Live agent in under 60 seconds",
                  "BYOK — bring your own API key",
                  "Public shareable agent URLs",
                  "Real-time streaming responses",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "500+", label: "Agents Deployed" },
                { value: "< 2s", label: "Avg Response" },
                { value: "99.9%", label: "Uptime" },
                { value: "100", label: "Free Credits" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                >
                  <div className="text-xl font-black text-amber-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-sm text-white/30">
              Join 500+ developers deploying AI agents with ReAgent
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center relative">
                <Image
                  src="/logo.jpg"
                  alt="ReAgent"
                  width={32}
                  height={32}
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              <span className="font-bold text-xl text-white">
                Re<span className="text-amber-400">Agent</span>
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Start deploying agents
            </h1>
            <p className="text-white/40">
              Create your account — no credit card required
            </p>
          </div>

          {/* Free credits note */}
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 flex items-center gap-3">
            <span className="text-lg">🎁</span>
            <p className="text-sm text-amber-400 font-medium">
              Get 100 free credits on signup
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/70">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength >= level
                            ? strengthColors[strength]
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/30">
                    Password strength:{" "}
                    <span
                      className={`font-medium ${
                        strength >= 3
                          ? "text-green-400"
                          : strength >= 2
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {strengthLabels[strength]}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full h-11 rounded-xl text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-white/25 mt-6">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-amber-400/70 hover:text-amber-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-amber-400/70 hover:text-amber-400">
              Privacy Policy
            </Link>
          </p>

          <p className="text-center text-sm text-white/30 mt-4">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
