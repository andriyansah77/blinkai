"use client";

import { useRef } from "react";
import { Settings2, Share2, TrendingUp } from "lucide-react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Settings2,
    title: "Create Your Agent",
    description:
      "Customize personality, model, and system prompt. Give your agent a name, a purpose, and deploy it in seconds.",
    detail: "GPT-4o · Groq · Claude · Ollama",
  },
  {
    number: "02",
    icon: Share2,
    title: "Share Your Link",
    description:
      "Get an instant public URL at reagent.com/agent/your-slug. Share it, embed it, or keep it behind auth.",
    detail: "reagent.com/agent/your-slug",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Users Chat & You Earn",
    description:
      "The platform handles billing, credits, and scaling. You focus on building — we handle the infrastructure.",
    detail: "Credits · BYOK · Auto-scale",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="py-32 relative bg-background overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,158,11,0.15), transparent)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Deploy in{" "}
            <span className="gradient-text-amber">three simple steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No complex setup, no DevOps. Just build your agent and let ReAgent
            handle the rest.
          </p>
        </div>

        {/* Steps */}
        <div ref={ref} className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connecting dashed line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[calc(33.3%-16px)] right-[calc(33.3%-16px)] pointer-events-none">
            <div
              className="h-px w-full"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(245,158,11,0.4) 0, rgba(245,158,11,0.4) 8px, transparent 8px, transparent 16px)",
              }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                {/* Step icon in amber circle */}
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-amber-500 flex items-center justify-center">
                    <span className="text-[9px] font-black text-amber-400">
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* Step number (decorative) */}
                <div className="text-5xl font-black text-muted-foreground/10 mb-2 leading-none select-none">
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Detail pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-amber-400 font-mono">
                  {step.detail}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

