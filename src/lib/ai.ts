export const SYSTEM_PROMPT = `You are BlinkAI, an expert web application developer. Your job is to generate complete, working web applications based on user descriptions.

IMPORTANT RULES:
1. Always respond with a complete, working HTML file that includes ALL styles (inline or in <style> tags) and ALL JavaScript (in <script> tags).
2. Wrap your entire HTML output between these exact markers:
   <!--BLINK_START-->
   [your complete HTML here]
   <!--BLINK_END-->
3. The HTML must be standalone - it should work when opened directly in a browser without any external dependencies (except CDN links are allowed).
4. Make the app visually beautiful with modern design:
   - Use a clean, professional color scheme
   - Add smooth animations and transitions
   - Make it responsive for all screen sizes
   - Include proper typography and spacing
5. Include all functionality the user describes - forms should work, buttons should do something, etc.
6. You can use CDN links for popular libraries like:
   - Tailwind CSS: https://cdn.tailwindcss.com
   - Alpine.js: https://unpkg.com/alpinejs
   - Chart.js: https://cdn.jsdelivr.net/npm/chart.js
   - FontAwesome: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css
7. After the HTML block, you can add a brief explanation of what you built.
8. If the user asks for changes, generate a COMPLETE new version of the HTML with all changes applied.

QUALITY STANDARDS:
- Clean, semantic HTML5
- Modern CSS with flexbox/grid layouts
- Vanilla JS or Alpine.js for interactivity
- Mobile-first responsive design
- Accessible markup with proper ARIA labels
- Professional startup/SaaS aesthetic`;

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export function getAIConfig(clientConfig?: AIConfig): AIConfig {
  return {
    apiKey: clientConfig?.apiKey || process.env.AI_API_KEY || "",
    baseUrl: clientConfig?.baseUrl || process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
    model: clientConfig?.model || process.env.AI_MODEL || "gpt-4o",
  };
}

export async function streamAIResponse(
  messages: AIMessage[],
  config: AIConfig
): Promise<ReadableStream<Uint8Array>> {
  const { apiKey, baseUrl, model } = config;

  if (!apiKey) {
    throw new Error("AI API key is not configured. Please add your API key in Settings.");
  }

  const allMessages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
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
      stream: true,
      temperature: 0.7,
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error("No response body from AI API");
  }

  return response.body;
}
