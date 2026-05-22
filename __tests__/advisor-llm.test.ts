import { buildAdvisorCacheKey } from "@/app/lib/llm/cache-key";
import { buildAdvisorContext } from "@/app/lib/llm/context";
import { getAdvisorFallbackText } from "@/app/lib/llm/fallbacks";
import { getAdvisorSystemPrompt } from "@/app/lib/llm/prompts";
import { createShowcaseProject, getDemoCalculation } from "@/app/lib/demo-project";

describe("advisor LLM foundation", () => {
  const project = createShowcaseProject();
  const result = getDemoCalculation();
  const context = buildAdvisorContext(project, result);

  it("liefert Fallback-Texte für alle Slots", () => {
    const slots = [
      "co2-comparison",
      "personal-summary",
      "next-steps",
      "technology-explanation",
      "report-executive-summary",
    ] as const;

    for (const slot of slots) {
      const text = getAdvisorFallbackText(slot, context);
      expect(text.length).toBeGreaterThan(30);
    }
  });

  it("erzeugt stabilen Cache-Key", () => {
    const key1 = buildAdvisorCacheKey("co2-comparison", context);
    const key2 = buildAdvisorCacheKey("co2-comparison", context);
    expect(key1).toBe(key2);
    expect(key1).toContain("co2-comparison");
  });

  it("unterscheidet Technologie-Erklärungen nach Technologie-ID", () => {
    const pvKey = buildAdvisorCacheKey(
      "technology-explanation",
      buildAdvisorContext(project, result, {
        technologyId: "pv",
        technologyName: "Photovoltaik",
      }),
    );
    const batteryKey = buildAdvisorCacheKey(
      "technology-explanation",
      buildAdvisorContext(project, result, {
        technologyId: "battery",
        technologyName: "Batteriespeicher",
      }),
    );
    expect(pvKey).not.toBe(batteryKey);
    expect(pvKey).toContain("pv");
  });

  it("hat System-Prompts ohne KI-Hinweis", () => {
    const prompt = getAdvisorSystemPrompt("co2-comparison");
    expect(prompt).toMatch(/CO₂/i);
    expect(prompt).not.toMatch(/generiert von Grok/i);
  });
});
