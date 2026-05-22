import { buildCustomerInsights } from "@/app/lib/customer-insights";
import {
  buildScenarioComparison,
  formatScenarioTechLabels,
} from "@/app/lib/scenarios";
import { calculateProject } from "@/app/lib/calculations";
import { createShowcaseProject } from "@/app/lib/demo-project";
import type { ProjectData } from "@/app/types/project";

function baseProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return { ...createShowcaseProject(), id: "test", ...overrides };
}

describe("buildScenarioComparison", () => {
  it("liefert bis zu drei vergleichbare Szenarien", () => {
    const scenarios = buildScenarioComparison(createShowcaseProject());
    expect(scenarios.length).toBeGreaterThanOrEqual(2);
    expect(scenarios.length).toBeLessThanOrEqual(3);
    for (const s of scenarios) {
      expect(s.result.investment.net).toBeGreaterThan(0);
      expect(s.name.length).toBeGreaterThan(0);
    }
  });

  it("markiert das aktuelle Projektkonzept", () => {
    const scenarios = buildScenarioComparison(createShowcaseProject());
    expect(scenarios.some((s) => s.isCurrent)).toBe(true);
  });

  it("markiert genau ein empfohlenes Szenario", () => {
    const scenarios = buildScenarioComparison(createShowcaseProject());
    expect(scenarios.filter((s) => s.isRecommended)).toHaveLength(1);
  });

  it("erzeugt Wärmepumpen-Szenarien bei Heizungsprojekten", () => {
    const scenarios = buildScenarioComparison(
      baseProject({
        technologies: {
          pv: false,
          heatPumpAir: true,
          heatPumpGround: false,
          battery: false,
          solarThermal: false,
        },
      }),
    );
    const names = scenarios.map((s) => s.name);
    expect(names.some((n) => n.includes("Wärmepumpe"))).toBe(true);
  });
});

describe("formatScenarioTechLabels", () => {
  it("formatiert Technologie-Kürzel", () => {
    expect(
      formatScenarioTechLabels({
        pv: true,
        heatPumpAir: true,
        heatPumpGround: false,
        battery: true,
        solarThermal: false,
      }),
    ).toBe("PV · Luft-WP · Speicher");
  });
});

describe("buildCustomerInsights", () => {
  it("liefert verständliche Abschnitte für Kunden", () => {
    const project = createShowcaseProject();
    const result = calculateProject(project);
    const insights = buildCustomerInsights(project, result);

    expect(insights.solutionHeadline).toContain("empfohlene Lösung");
    expect(insights.solutionTagline.length).toBeGreaterThan(20);
    expect(insights.costHeadline).toContain("kostet");
    expect(insights.co2Headline).toContain("CO₂");
    expect(insights.solutionParagraphs.length).toBeGreaterThanOrEqual(2);
    expect(insights.costHighlights).toHaveLength(3);
    expect(insights.nextSteps.length).toBeGreaterThanOrEqual(3);
  });
});
