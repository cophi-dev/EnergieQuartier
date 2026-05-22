/** Server-seitige LLM-Konfiguration (xAI / Grok – per Env umschaltbar) */

export interface LlmConfig {
  provider: string;
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export function getLlmConfig(): LlmConfig {
  return {
    provider: process.env.LLM_PROVIDER ?? "grok",
    apiKey: process.env.XAI_API_KEY ?? process.env.LLM_API_KEY,
    baseUrl: process.env.LLM_BASE_URL ?? "https://api.x.ai/v1",
    model: process.env.LLM_MODEL ?? "grok-4.3",
    timeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 12_000),
  };
}

export function isLlmConfigured(): boolean {
  const key = process.env.XAI_API_KEY ?? process.env.LLM_API_KEY;
  return Boolean(key && key.length > 10);
}
