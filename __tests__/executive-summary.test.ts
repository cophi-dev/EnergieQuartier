import { getAdvisorFallbackText } from "@/app/lib/llm/fallbacks";
import { createShowcaseProject, getDemoCalculation } from "@/app/lib/demo-project";
import { buildAdvisorContext } from "@/app/lib/llm/context";

describe("report executive summary fallback", () => {
  it("liefert sachliche Zusammenfassung mit Kennzahlen", () => {
    const project = createShowcaseProject();
    const result = getDemoCalculation();
    const context = buildAdvisorContext(project, result);
    const text = getAdvisorFallbackText("report-executive-summary", context);

    expect(text).toMatch(/Investition/i);
    expect(text).toMatch(/CO₂|Autarkie/i);
    expect(text.length).toBeGreaterThan(80);
  });
});
