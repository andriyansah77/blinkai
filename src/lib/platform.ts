import { prisma } from "@/lib/prisma";

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  mode: "platform" | "byok";
}

export function getPlatformConfig(): AIConfig {
  return {
    apiKey: process.env.PLATFORM_API_KEY || "",
    baseUrl: process.env.PLATFORM_BASE_URL || "https://api.openai.com/v1",
    model: process.env.PLATFORM_MODEL || "gpt-4o-mini",
    mode: "platform",
  };
}

// Simple XOR obfuscation — not real encryption, just basic obfuscation
export function obfuscate(text: string, secret: string): string {
  if (!secret) return text;
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ secret.charCodeAt(i % secret.length)
    );
  }
  return Buffer.from(result, "binary").toString("base64");
}

export function deobfuscate(encoded: string, secret: string): string {
  if (!secret) return encoded;
  const decoded = Buffer.from(encoded, "base64").toString("binary");
  let result = "";
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(
      decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length)
    );
  }
  return result;
}

export async function getUserAIConfig(userId: string): Promise<AIConfig> {
  const apiKeyConfig = await prisma.apiKeyConfig.findUnique({
    where: { userId },
  });

  if (!apiKeyConfig || apiKeyConfig.mode !== "byok") {
    return getPlatformConfig();
  }

  const secret = process.env.NEXTAUTH_SECRET || "default-secret";
  const byokApiKey = apiKeyConfig.byokApiKey
    ? deobfuscate(apiKeyConfig.byokApiKey, secret)
    : "";

  return {
    apiKey: byokApiKey,
    baseUrl: apiKeyConfig.byokBaseUrl || "https://api.openai.com/v1",
    model: apiKeyConfig.byokModel || "gpt-4o-mini",
    mode: "byok",
  };
}
