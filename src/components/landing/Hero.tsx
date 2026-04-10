"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-background">
      {/* NEW THEME BANNER */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold rounded-full shadow-lg animate-pulse">
        🎨 New UI/UX Design - Gold Theme Active!
      </div>
      
      {/* Radial gradient glow at center */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.04) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-[8%] w-80 h-80 bg-amber-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-[8%] w-64 h-64 bg-orange-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-amber-600/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          ✦ Now in Public Beta
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0.1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[96px] font-black tracking-tight mb-6 leading-[1.0]"
        >
          <span className="text-white">Deploy AI Agents</span>
          <br />
          <span className="gradient-text-amber">in Seconds.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg sm:text-xl md:text-2xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Build, deploy, and scale AI agents with ReAgent. Deploy your Agent in Minutes — with your branding, your rules.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={0.3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button
            variant="gradient"
            size="xl"
            asChild
            className="group text-base font-semibold rounded-xl"
          >
            <Link href="/sign-up">
              Start Free — 100 Credits
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="rounded-xl border-white/20 text-white/80 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/[0.06] bg-transparent"
            asChild
          >
            <Link href="#how-it-works">
              See Demo →
            </Link>
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          custom={0.4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center items-center gap-0 text-center mb-20"
        >
          {[
            { value: "500+", label: "Agents Deployed" },
            { value: "< 2s", label: "Response Time" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {i > 0 && (
                <div className="w-px h-8 bg-white/10 mx-8" />
              )}
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-0.5 tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Hero visual: Floating glass card mockup */}
        <motion.div
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative max-w-sm mx-auto"
        >
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-24 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Glass card */}
          <div className="relative glass-card p-5 shadow-2xl shadow-amber-500/10 float-animation">
            {/* Card header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Customer Support Bot</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                    <span className="text-xs text-white/40">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat bubbles */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-end">
                <div className="chat-bubble-user text-black text-xs px-3 py-2 max-w-[80%]">
                  What&apos;s my refund status?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="chat-bubble-ai text-white/80 text-xs px-3 py-2 max-w-[85%]">
                  Sure! Let me look that up for you. Order #12093 — your refund of $49 was processed 2 days ago 🎉
                </div>
              </div>
              <div className="flex justify-end">
                <div className="chat-bubble-user text-black text-xs px-3 py-2 max-w-[80%]">
                  Thank you!
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2">
              <span className="text-xs text-white/30 flex-1">Type a message…</span>
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-3 h-3 text-black" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/30">
              Powered by ReAgent ⚡
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
