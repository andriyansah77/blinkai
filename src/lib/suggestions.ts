// Suggestion generator for ReAgent chat interface

export interface Suggestion {
  id: string;
  text: string;
  category: "creative" | "productivity" | "technical" | "business" | "learning";
  icon?: string;
}

const SUGGESTION_TEMPLATES = {
  creative: [
    "Create a {item} for {purpose} with {style} style",
    "Generate {number} ideas for {topic}",
    "Write a {type} about {subject}",
    "Design a {format} that explains {concept}",
    "Brainstorm {category} concepts for {industry}"
  ],
  productivity: [
    "Create a {timeframe} plan for {goal}",
    "Organize my {item} and prioritize by {criteria}",
    "Set up a workflow for {process}",
    "Track my {metric} and alert me if {condition}",
    "Automate {task} using {method}"
  ],
  technical: [
    "Build a {technology} app that {function}",
    "Explain {concept} like I'm {level}",
    "Debug this {language} code: {problem}",
    "Create a {framework} component for {purpose}",
    "Optimize {system} for {performance}"
  ],
  business: [
    "Analyze {market} trends for {industry}",
    "Create a business plan for {idea}",
    "Draft a {document} for {purpose}",
    "Calculate ROI for {investment}",
    "Research competitors in {market}"
  ],
  learning: [
    "Teach me {subject} step by step",
    "Create a study guide for {topic}",
    "Explain the difference between {concept1} and {concept2}",
    "Quiz me on {subject}",
    "Summarize {content} in {format}"
  ]
};

const VARIABLES = {
  item: ["website", "app", "presentation", "document", "report", "dashboard", "tool", "system"],
  purpose: ["my business", "education", "entertainment", "productivity", "marketing", "analysis"],
  style: ["modern", "minimalist", "professional", "creative", "technical", "friendly"],
  number: ["5", "10", "3", "7", "15"],
  topic: ["marketing strategies", "product features", "content ideas", "business improvements", "automation"],
  type: ["blog post", "email", "proposal", "summary", "guide", "tutorial"],
  subject: ["AI technology", "productivity tips", "business growth", "web development", "data analysis"],
  format: ["infographic", "flowchart", "checklist", "template", "framework"],
  concept: ["machine learning", "blockchain", "cloud computing", "API design", "user experience"],
  category: ["product", "service", "feature", "campaign", "strategy"],
  industry: ["tech", "healthcare", "finance", "education", "e-commerce", "SaaS"],
  timeframe: ["daily", "weekly", "monthly", "quarterly", "project"],
  goal: ["learning Python", "growing my business", "improving productivity", "building an app"],
  criteria: ["importance", "urgency", "impact", "effort", "deadline"],
  process: ["content creation", "project management", "customer support", "data analysis"],
  metric: ["website traffic", "sales performance", "user engagement", "system performance"],
  condition: ["drops below threshold", "exceeds target", "shows anomaly", "needs attention"],
  task: ["email responses", "data entry", "report generation", "social media posting"],
  method: ["AI tools", "scripts", "workflows", "integrations"],
  technology: ["React", "Python", "Node.js", "mobile", "web", "desktop"],
  function: ["manages tasks", "analyzes data", "connects users", "automates workflows"],
  level: ["5 years old", "a beginner", "10 years old", "someone new to tech"],
  language: ["JavaScript", "Python", "TypeScript", "React", "Node.js"],
  problem: ["not working as expected", "throwing errors", "performance issues"],
  framework: ["React", "Vue", "Angular", "Next.js", "Express"],
  system: ["database queries", "API responses", "loading times", "memory usage"],
  performance: ["speed", "efficiency", "scalability", "reliability"],
  market: ["emerging", "current", "future", "competitive"],
  idea: ["SaaS product", "mobile app", "online service", "AI tool"],
  document: ["contract", "proposal", "report", "presentation"],
  investment: ["new software", "marketing campaign", "team expansion", "infrastructure"],
  content: ["this article", "research paper", "documentation", "meeting notes"],
  concept1: ["AI and ML", "frontend and backend", "SQL and NoSQL"],
  concept2: ["machine learning", "full-stack development", "database types"]
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function fillTemplate(template: string): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const options = VARIABLES[key as keyof typeof VARIABLES];
    return options ? getRandomItem(options) : match;
  });
}

export function generateSuggestions(count: number = 4): Suggestion[] {
  const categories = Object.keys(SUGGESTION_TEMPLATES) as Array<keyof typeof SUGGESTION_TEMPLATES>;
  const suggestions: Suggestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = getRandomItem(categories);
    const template = getRandomItem(SUGGESTION_TEMPLATES[category]);
    const text = fillTemplate(template);
    
    suggestions.push({
      id: `suggestion-${i}-${Date.now()}`,
      text,
      category,
    });
  }
  
  return suggestions;
}

export function generateSuggestionsByCategory(category: keyof typeof SUGGESTION_TEMPLATES, count: number = 2): Suggestion[] {
  const templates = SUGGESTION_TEMPLATES[category];
  const suggestions: Suggestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = getRandomItem(templates);
    const text = fillTemplate(template);
    
    suggestions.push({
      id: `${category}-suggestion-${i}-${Date.now()}`,
      text,
      category,
    });
  }
  
  return suggestions;
}

// Predefined high-quality suggestions for immediate use
export const FEATURED_SUGGESTIONS: Suggestion[] = [
  {
    id: "quantum-explanation",
    text: "Explain quantum computing like I'm 10 years old",
    category: "learning"
  },
  {
    id: "meal-plan",
    text: "Create a meal plan for the week — vegetarian, high protein, easy to cook",
    category: "productivity"
  },
  {
    id: "notion-summary",
    text: "Create a Notion page summarizing today's meeting notes",
    category: "productivity"
  },
  {
    id: "portfolio-tracker",
    text: "Track my portfolio and alert me if any stock drops more than 5%",
    category: "business"
  }
];