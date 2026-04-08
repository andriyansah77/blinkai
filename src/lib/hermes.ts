/**
 * Hermes — BlinkAI AI Orchestration Framework
 *
 * A lightweight, configurable AI engine layer that manages:
 * - Multiple AI provider routing
 * - Prompt pipeline (pre/post processing)
 * - Streaming with token tracking
 * - Per-user model config with fallback to server defaults
 */

export const HERMES_VERSION = "1.0.0";

// ─── Provider Registry ────────────────────────────────────────────────────────

export interface HermesProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  badge?: string;
}

export const HERMES_PROVIDERS: HermesProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    badge: "🟢",
  },
  {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ],
    badge: "⚡",
  },
  {
    id: "together",
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    defaultModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    models: [
      "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "Qwen/Qwen2.5-72B-Instruct-Turbo",
    ],
    badge: "🤝",
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    models: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3"],
    badge: "🏠",
  },
  {
    id: "custom",
    name: "Custom Endpoint",
    baseUrl: "",
    defaultModel: "",
    models: [],
    badge: "⚙️",
  },
];

// ─── Hermes Config ────────────────────────────────────────────────────────────

export interface HermesConfig {
  providerId: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPromptOverride?: string;
  streamingEnabled: boolean;
}

export const HERMES_DEFAULTS: HermesConfig = {
  providerId: "openai",
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 16000,
  streamingEnabled: true,
};

export function getHermesConfig(overrides?: Partial<HermesConfig>): HermesConfig {
  const base: HermesConfig = {
    providerId: overrides?.providerId || process.env.AI_PROVIDER_ID || "openai",
    apiKey: overrides?.apiKey || process.env.AI_API_KEY || "",
    baseUrl: overrides?.baseUrl || process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
    model: overrides?.model || process.env.AI_MODEL || "gpt-4o",
    temperature:
      overrides?.temperature !== undefined
        ? overrides.temperature
        : parseFloat(process.env.AI_TEMPERATURE || "0.7"),
    maxTokens:
      overrides?.maxTokens !== undefined
        ? overrides.maxTokens
        : parseInt(process.env.AI_MAX_TOKENS || "16000", 10),
    streamingEnabled: overrides?.streamingEnabled !== undefined ? overrides.streamingEnabled : true,
    systemPromptOverride: overrides?.systemPromptOverride,
  };
  return base;
}

// ─── System Prompt Pipeline ───────────────────────────────────────────────────

export const HERMES_BASE_SYSTEM_PROMPT = `You are BlinkAI (powered by Hermes), an expert web application developer and friendly assistant.

CONVERSATION RULES:
- If the user is just chatting, greeting, or asking a general question (e.g. "hello", "hi", "how are you", "what can you do"), respond naturally and conversationally. Do NOT generate HTML for casual messages.
- Only generate HTML/code when the user explicitly asks you to build, create, make, or generate something.
- Keep conversational replies short and friendly (1-3 sentences).

WHEN GENERATING CODE:
1. Respond with a complete, working HTML file that includes ALL styles (inline or in <style> tags) and ALL JavaScript (in <script> tags).
2. Wrap your entire HTML output between these exact markers:
   <!--BLINK_START-->
   [your complete HTML here]
   <!--BLINK_END-->
3. The HTML must be standalone — works when opened directly in a browser (CDN links allowed).
4. Make it visually beautiful with modern design:
   - Clean, professional color scheme
   - Smooth animations and transitions
   - Responsive for all screen sizes
   - Proper typography and spacing
5. Include all functionality described — forms should work, buttons should do something.
6. Allowed CDN libraries:
   - Tailwind CSS: https://cdn.tailwindcss.com
   - Alpine.js: https://unpkg.com/alpinejs
   - Chart.js: https://cdn.jsdelivr.net/npm/chart.js
   - FontAwesome: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css
7. After the HTML block, briefly describe what you built (1-2 sentences).
8. If the user asks for changes, generate a COMPLETE updated version with all changes applied.

QUALITY STANDARDS:
- Clean, semantic HTML5
- Modern CSS with flexbox/grid layouts
- Vanilla JS or Alpine.js for interactivity
- Mobile-first responsive design
- Accessible markup with proper ARIA labels
- Professional startup/SaaS aesthetic`;

export function buildSystemPrompt(override?: string): string {
  return override && override.trim().length > 0 ? override : HERMES_BASE_SYSTEM_PROMPT;
}

// ─── Message Types ────────────────────────────────────────────────────────────

export interface HermesMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── Core Streaming Engine ────────────────────────────────────────────────────

export async function hermesStream(
  messages: HermesMessage[],
  config: HermesConfig
): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, baseUrl, model, temperature, maxTokens, streamingEnabled, systemPromptOverride } =
    config;

  if (!apiKey) {
    throw new Error(
      "Hermes: API key not configured. Please set your key in Dashboard → Hermes Settings."
    );
  }

  const allMessages: HermesMessage[] = [
    { role: "system", content: buildSystemPrompt(systemPromptOverride) },
    ...messages,
  ];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      stream: streamingEnabled,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hermes stream error [${response.status}]: ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Hermes: No response body from AI provider");
  }

  return response.body;
}

// ─── Provider Helpers ─────────────────────────────────────────────────────────

export function getProviderById(id: string): HermesProvider | undefined {
  return HERMES_PROVIDERS.find((p) => p.id === id);
}

export function resolveBaseUrl(providerId: string, customUrl?: string): string {
  if (providerId === "custom" && customUrl) return customUrl;
  return getProviderById(providerId)?.baseUrl || customUrl || "https://api.openai.com/v1";
}
