"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-card border-r border-border">
        {/* Amber gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/[0.12] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/[0.08] rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-amber-600/[0.1] rounded-full blur-3xl" />

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
            <span className="font-bold text-xl text-foreground">
              Re<span className="text-amber-400">Agent</span>
            </span>
          </Link>

          {/* Feature highlight */}
          <div className="space-y-8">
            <div>
              <p className="text-foreground/40 text-sm font-medium uppercase tracking-wider mb-3">
                Trusted by developers
              </p>
              <blockquote className="text-2xl font-semibold text-foreground leading-relaxed">
                &ldquo;ReAgent cut our agent deployment time from days to
                seconds.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center text-sm font-bold text-amber-400 border border-amber-500/20">
                  SK
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Sarah K.
                  </div>
                  <div className="text-xs text-foreground/40">CTO, Streamline AI</div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "500+", label: "Agents Deployed" },
                { value: "< 2s", label: "Response Time" },
                { value: "99.9%", label: "Uptime SLA" },
                { value: "Free", label: "100 Credits" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="text-xl font-black text-amber-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-foreground/40 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-sm text-foreground/30">
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
              className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/70 mb-8 transition-colors"
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
              <span className="font-bold text-xl text-foreground">
                Re<span className="text-amber-400">Agent</span>
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-foreground/40">Sign in to your ReAgent account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-accent border-border text-foreground placeholder:text-foreground/25 focus:border-amber-500/50 focus:ring-amber-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/70">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-accent border-border text-foreground placeholder:text-foreground/25 focus:border-amber-500/50 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-foreground/30 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

