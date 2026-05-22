import { mapScenariosForPdf } from "@/app/lib/pdf-report";
import { buildScenarioComparison } from "@/app/lib/scenarios";
import { createShowcaseProject } from "@/app/lib/demo-project";

describe("mapScenariosForPdf", () => {
  it("mappt Szenarien auf PDF-Tabellenzeilen", () => {
    const scenarios = buildScenarioComparison(createShowcaseProject());
    const rows = mapScenariosForPdf(scenarios);

    expect(rows.length).toBeGreaterThanOrEqual(2);
    for (const row of rows) {
      expect(row.investNet).toBeGreaterThan(0);
      expect(row.name.length).toBeGreaterThan(0);
      expect(typeof row.payback).toBe("number");
      expect(typeof row.autarky).toBe("number");
    }
  });

  it("kennzeichnet aktuelles und empfohlenes Szenario", () => {
    const rows = mapScenariosForPdf(
      buildScenarioComparison(createShowcaseProject()),
    );
    expect(rows.some((r) => r.isCurrent)).toBe(true);
    expect(rows.some((r) => r.isRecommended)).toBe(true);
  });
});
