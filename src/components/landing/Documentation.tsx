"use client";

import { useRef } from "react";
import { Book, Code, Download, Terminal, ExternalLink, ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";

const docResources = [
  {
    icon: Book,
    title: "Complete Guide",
    description: "Comprehensive documentation with step-by-step tutorials, examples, and best practices.",
    link: "https://mining.reagent.eu.cc/docs",
    badge: "Interactive",
    color: "purple",
  },
  {
    icon: Terminal,
    title: "AI Agent Skills",
    description: "Download CLI scripts for automated minting and wallet operations via AI agents.",
    link: "https://mining.reagent.eu.cc/docs#ai-skills",
    badge: "Automation",
    color: "blue",
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Full API documentation with code examples in JavaScript, Python, and cURL.",
    link: "https://mining.reagent.eu.cc/docs#api",
    badge: "Integration",
    color: "green",
  },
  {
    icon: Download,
    title: "Quick Start",
    description: "Get started in minutes with our quick start guide and downloadable resources.",
    link: "https://mining.reagent.eu.cc/docs#quick-start",
    badge: "Beginner",
    color: "amber",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const getColorClasses = (color: string) => {
  const colors = {
    purple: {
      gradient: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/20",
      border: "border-purple-500/30",
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    blue: {
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      border: "border-blue-500/30",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      shadow: "shadow-green-500/20",
      border: "border-green-500/30",
      badge: "bg-green-500/10 text-green-400 border-green-500/30",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      border: "border-amber-500/30",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
  };
  return colors[color as keyof typeof colors] || colors.purple;
};

export function Documentation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="documentation" className="py-32 relative bg-background">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">
            <Book className="w-4 h-4" />
            Documentation
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              get started
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive guides, API references, and downloadable resources to help you mint REAGENT tokens and integrate with your applications.
          </p>
        </div>

        {/* Documentation grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {docResources.map((resource, i) => {
            const Icon = resource.icon;
            const colors = getColorClasses(resource.color);
            
            return (
              <motion.a
                key={resource.title}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className={`group relative rounded-2xl bg-card backdrop-blur border border-border p-8 hover:bg-accent hover:${colors.border} hover:shadow-xl hover:${colors.shadow} transition-all duration-300`}
              >
                {/* Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
                    {resource.badge}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-5 shadow-lg ${colors.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-purple-400 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {resource.description}
                </p>

                {/* Link indicator */}
                <div className="flex items-center gap-2 text-sm font-medium text-purple-400 group-hover:gap-3 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20 p-8 md:p-12 text-center overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to start minting?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access our complete documentation and start minting REAGENT tokens on Tempo Network today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://mining.reagent.eu.cc/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
              >
                <Book className="w-5 h-5" />
                View Documentation
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="https://mining.reagent.eu.cc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-accent hover:border-purple-500/30 hover:scale-105 transition-all duration-300"
              >
                <Terminal className="w-5 h-5" />
                Start Mining
              </a>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-4 text-sm"
        >
          <a
            href="https://mining.reagent.eu.cc/skills/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-purple-500/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Skills README
          </a>
          <a
            href="https://mining.reagent.eu.cc/docs/mining-guide.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-purple-500/30 transition-all"
          >
            <Book className="w-4 h-4" />
            Complete Guide
          </a>
          <a
            href="https://explore.tempo.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:border-purple-500/30 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Tempo Explorer
          </a>
        </motion.div>
      </div>
    </section>
  );
}
