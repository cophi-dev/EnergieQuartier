import { getAdvisorCache, setAdvisorCache } from "@/app/lib/advisor-cache";
import { buildAdvisorCacheKey } from "@/app/lib/llm/cache-key";
import { getAdvisorFallbackText } from "@/app/lib/llm/fallbacks";
import type {
  AdvisorContext,
  AdvisorTextResponse,
  AdvisorTextSlot,
} from "@/app/types/advisor-text";

/** Client-seitiger Abruf für Beratungstexte (PDF, einmalige Aktionen) */
export async function fetchAdvisorText(
  slot: AdvisorTextSlot,
  context: AdvisorContext,
): Promise<{ text: string; source: "llm" | "fallback" | "cache" }> {
  const cacheKey = buildAdvisorCacheKey(slot, context);
  const cached = getAdvisorCache(slot, cacheKey);

  if (cached) {
    return { text: cached.text, source: "cache" };
  }

  try {
    const response = await fetch("/api/grok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, cacheKey, context }),
    });

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = (await response.json()) as AdvisorTextResponse;
    setAdvisorCache({
      slot,
      cacheKey,
      text: data.text,
      source: data.source === "llm" ? "llm" : "fallback",
      createdAt: data.generatedAt,
    });

    return { text: data.text, source: data.source };
  } catch {
    const fallback = getAdvisorFallbackText(slot, context);
    return { text: fallback, source: "fallback" };
  }
}
