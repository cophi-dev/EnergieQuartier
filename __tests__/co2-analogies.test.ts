import {
  buildCo2Analogies,
  formatCo2AnalogiesForPrompt,
  pickCo2AnalogySentence,
} from "@/app/lib/co2-analogies";
import { getAdvisorFallbackText } from "@/app/lib/llm/fallbacks";
import { createShowcaseProject, getDemoCalculation } from "@/app/lib/demo-project";
import { buildAdvisorContext } from "@/app/lib/llm/context";

describe("co2 analogies", () => {
  it("liefert sinnvolle Alltagsvergleiche für 12,7 t", () => {
    const a = buildCo2Analogies(12_700);
    expect(a.shortHaulFlights).toBeGreaterThan(10);
    expect(a.carYears).toBeGreaterThanOrEqual(5);
    expect(pickCo2AnalogySentence(12_700)).toMatch(/Vergleich|Hamburg/i);
  });

  it("formatiert Analogien für LLM-Kontext", () => {
    const text = formatCo2AnalogiesForPrompt(5_000);
    expect(text).toMatch(/Autobahn/);
    expect(text).toMatch(/Flüge/);
  });

  it("nutzt Analogie im CO₂-Fallback", () => {
    const project = createShowcaseProject();
    const result = getDemoCalculation();
    const context = buildAdvisorContext(project, result);
    const text = getAdvisorFallbackText("co2-comparison", context);

    expect(text).toMatch(/CO₂|Tonnen/i);
    expect(text).toMatch(/Vergleich|Hamburg|Flüge|Pkw|Bäume|km/i);
  });
});
