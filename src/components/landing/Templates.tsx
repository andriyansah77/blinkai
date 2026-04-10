"use client";

import Link from "next/link";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES } from "@/types";

const categoryColors: Record<string, string> = {
  "Dashboard": "purple",
  "Landing Page": "blue",
  "E-Commerce": "green",
  "Blog": "purple",
  "Portfolio": "blue",
  "Productivity": "green",
};

export function Templates() {
  return (
    <section id="templates" className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6">
            <LayoutTemplate className="w-4 h-4" />
            Template Gallery
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Start from a{" "}
            <span className="gradient-text">proven template</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our library of professionally designed templates and customize them with AI.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Preview area */}
              <div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300 float-animation">
                  {template.preview}
                </span>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="gradient" size="sm" asChild>
                    <Link href={`/sign-up?template=${template.id}`}>
                      Use Template
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <Badge variant={categoryColors[template.category] as "purple" | "blue" | "green" || "purple"}>
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <Link href="/sign-up">
              Browse All Templates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

