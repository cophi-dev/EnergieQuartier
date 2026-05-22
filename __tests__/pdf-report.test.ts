import { mapScenariosForPdf, orderScenariosForPdf } from "@/app/lib/pdf-report";
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

  it("ordnet aktuelles Szenario in die Mitte", () => {
    const ordered = orderScenariosForPdf(
      mapScenariosForPdf(buildScenarioComparison(createShowcaseProject())),
    );
    expect(ordered.length).toBeGreaterThanOrEqual(2);
    const currentIdx = ordered.findIndex((s) => s.isCurrent);
    expect(currentIdx).toBe(Math.floor((ordered.length - 1) / 2));
  });
});
