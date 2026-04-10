"use client";

import { useRef } from "react";
import Link from "next/link";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: 0,
    period: "forever",
    description: "Get started for free. Explore the platform with no commitment.",
    badge: null,
    cta: "Get Started Free",
    href: "/sign-up",
    highlighted: false,
    features: [
      "1 agent",
      "100 credits / month",
      "Public agent link",
      "Community support",
      "Real-time streaming",
    ],
  },
  {
    name: "Pro",
    icon: Crown,
    price: 19,
    period: "per month",
    description: "For developers and makers ready to scale their AI deployments.",
    badge: "Most Popular",
    cta: "Start Pro",
    href: "/sign-up?plan=pro",
    highlighted: true,
    features: [
      "10 agents",
      "2,000 credits / month",
      "BYOK (OpenAI/Groq/Anthropic)",
      "Custom system prompts",
      "Real-time streaming",
      "Priority support",
      "Analytics dashboard",
    ],
  },
  {
    name: "Scale",
    icon: Rocket,
    price: 99,
    period: "per month",
    description: "For teams and businesses deploying agents at scale.",
    badge: null,
    cta: "Contact Sales",
    href: "mailto:sales@reagent.com",
    highlighted: false,
    features: [
      "Unlimited agents",
      "Unlimited credits",
      "White-label branding",
      "API access",
      "BYOK for all users",
      "Dedicated support",
      "Custom domains",
      "SLA guarantee",
    ],
  },
];

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Simple,{" "}
            <span className="gradient-text-amber">transparent pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free. Upgrade when you need more power. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        >
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-card border-amber-500/50 shadow-2xl shadow-amber-500/[0.15]"
                    : "bg-card border-border hover:border-amber-500/30"
                }`}
              >
                {/* Most Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold shadow-lg shadow-amber-500/30">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      plan.highlighted
                        ? "bg-gradient-to-br from-amber-500 to-orange-500"
                        : "bg-accent"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        plan.highlighted ? "text-black" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <div className="text-xs text-muted-foreground">{plan.period}</div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <Button
                  variant={plan.highlighted ? "gradient" : "outline"}
                  className="w-full mb-8 rounded-xl"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                {/* Features */}
                <div className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.highlighted
                            ? "bg-amber-500/20"
                            : "bg-accent"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            plan.highlighted
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-muted-foreground text-sm">
          🔒 No credit card required for Starter · 14-day money-back on Pro
        </div>
      </div>
    </section>
  );
}
