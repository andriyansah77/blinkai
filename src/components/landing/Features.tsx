"use client";

import { useRef } from "react";
import { Zap, Key, Globe, Activity, Layers, Coins } from "lucide-react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Deploy in Seconds",
    description:
      "From idea to live agent in under 60 seconds. No infra setup, no DevOps headaches.",
  },
  {
    icon: Coins,
    title: "Credit System",
    description:
      "Give users 100 free credits. They can top up or bring their own API key.",
  },
  {
    icon: Key,
    title: "BYOK Support",
    description:
      "Users bring their own OpenAI/Groq/Anthropic key. Full flexibility, zero lock-in.",
  },
  {
    icon: Globe,
    title: "Public Agent Links",
    description:
      "Every agent gets a shareable URL. Embed it, share it, or keep it private.",
  },
  {
    icon: Activity,
    title: "Real-time Streaming",
    description:
      "Token-by-token streaming responses for a snappy, alive chat experience.",
  },
  {
    icon: Layers,
    title: "Multi-Provider",
    description:
      "OpenAI, Groq, Together AI, Ollama — switch providers in one click.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-32 relative bg-[#0a0a0a]">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Everything you need to{" "}
            <span className="gradient-text-amber">ship AI agents</span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            ReAgent gives you the full stack to host, scale, and monetize AI
            agents — without managing any infrastructure.
          </p>
        </div>

        {/* Feature grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="group relative rounded-2xl bg-white/[0.03] backdrop-blur border border-white/[0.07] p-8 hover:bg-amber-500/[0.04] hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/[0.08] transition-all duration-300 cursor-default"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/20">
                  <Icon className="w-6 h-6 text-black" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
