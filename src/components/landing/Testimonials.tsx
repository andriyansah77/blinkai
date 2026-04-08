"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    company: "Figma",
    avatar: "SC",
    rating: 5,
    content:
      "ReAgent completely changed how I prototype. I can go from idea to working demo in under 5 minutes. My clients are blown away when I show them functional apps the same day they request them.",
    highlight: "5 minutes from idea to demo",
  },
  {
    name: "Marcus Rodriguez",
    role: "Indie Hacker",
    company: "MRR Labs",
    avatar: "MR",
    rating: 5,
    content:
      "I've shipped 3 micro-SaaS products using ReAgent this year. The code quality is surprisingly good, and I can customize it to my needs. This is a genuine superpower for non-developers.",
    highlight: "3 products shipped",
  },
  {
    name: "Emily Thompson",
    role: "Marketing Manager",
    company: "Stripe",
    avatar: "ET",
    rating: 5,
    content:
      "We use ReAgent to quickly build landing pages for new campaigns. Our time-to-launch dropped from 2 weeks to 2 days. The AI understands our brand guidelines when I describe them.",
    highlight: "2 weeks → 2 days",
  },
];

export function Testimonials() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Testimonials
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Loved by builders{" "}
            <span className="gradient-text">worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of designers, developers, and entrepreneurs building faster with ReAgent.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.name}
              className="relative rounded-2xl border border-border bg-card p-8 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/30 transition-all duration-300 group"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-purple-500/30 mb-6" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Highlight */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
                {testimonial.highlight}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Join 10,000+ builders already using ReAgent
          </p>
          <div className="flex justify-center">
            <div className="flex -space-x-2">
              {["JD", "KL", "AM", "PB", "RN", "SY", "TC", "VW"].map((initials) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold"
                >
                  {initials}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                +9k
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
