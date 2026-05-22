import { getLlmConfig, isLlmConfigured } from "@/app/lib/llm/config";
import {
  getAdvisorSystemPrompt,
  getAdvisorUserPrompt,
} from "@/app/lib/llm/prompts";
import { formatAdvisorContextForPrompt } from "@/app/lib/llm/context";
import type { AdvisorContext, AdvisorTextSlot } from "@/app/types/advisor-text";

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

function sanitizeLlmOutput(text: string, maxLength: number): string {
  return text
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

const MAX_OUTPUT: Record<AdvisorTextSlot, number> = {
  "co2-comparison": 320,
  "personal-summary": 480,
  "next-steps": 600,
  "technology-explanation": 420,
  "report-executive-summary": 650,
};

/** Server-seitiger LLM-Aufruf (OpenAI-kompatibel, xAI/Grok) */
export async function generateAdvisorText(
  slot: AdvisorTextSlot,
  context: AdvisorContext,
): Promise<{ text: string; source: "llm" | "fallback" }> {
  const { getAdvisorFallbackText } = await import("@/app/lib/llm/fallbacks");
  const fallback = getAdvisorFallbackText(slot, context);

  if (!isLlmConfigured()) {
    return { text: fallback, source: "fallback" };
  }

  const config = getLlmConfig();
  const systemPrompt = getAdvisorSystemPrompt(slot);
  const userPrompt = getAdvisorUserPrompt(
    slot,
    formatAdvisorContextForPrompt(context),
  );

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.55,
        max_tokens: 280,
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
    });

    if (!response.ok) {
      return { text: fallback, source: "fallback" };
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return { text: fallback, source: "fallback" };
    }

    const text = sanitizeLlmOutput(raw, MAX_OUTPUT[slot]);
    if (text.length < 20) {
      return { text: fallback, source: "fallback" };
    }

    return { text, source: "llm" };
  } catch {
    return { text: fallback, source: "fallback" };
  }
}
