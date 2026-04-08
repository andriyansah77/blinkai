import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function extractCodeFromMarkdown(text: string): {
  html: string;
  css: string;
  js: string;
  fullHtml: string;
} {
  // Try to extract from markers
  const htmlMatch = text.match(/```html\n([\s\S]*?)```/);
  const cssMatch = text.match(/```css\n([\s\S]*?)```/);
  const jsMatch = text.match(/```(?:javascript|js)\n([\s\S]*?)```/);
  
  // Also look for BLINK_CODE markers
  const blinkMatch = text.match(/<!--BLINK_START-->([\s\S]*?)<!--BLINK_END-->/);
  
  if (blinkMatch) {
    const fullHtml = blinkMatch[1].trim();
    return { html: fullHtml, css: "", js: "", fullHtml };
  }
  
  if (htmlMatch) {
    const html = htmlMatch[1].trim();
    const css = cssMatch ? cssMatch[1].trim() : "";
    const js = jsMatch ? jsMatch[1].trim() : "";
    
    // Combine into a full HTML document
    const fullHtml = buildFullHtml(html, css, js);
    return { html, css, js, fullHtml };
  }
  
  return { html: "", css: "", js: "", fullHtml: "" };
}

function buildFullHtml(html: string, css: string, js: string): string {
  // If html already has the full document structure, return it
  if (html.includes("<!DOCTYPE html>") || html.includes("<html")) {
    return html;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlinkAI App</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}
