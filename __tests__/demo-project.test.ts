import {
  createHewShowcaseProject,
  getDemoCalculation,
  HEW_SHOWCASE_KPI_PREVIEW,
  HEW_SHOWCASE_PROJECT_ID,
} from "@/app/lib/demo-project";

describe("HEW showcase", () => {
  it("hat stabile Projekt-ID", () => {
    expect(createHewShowcaseProject().id).toBe(HEW_SHOWCASE_PROJECT_ID);
  });

  it("KPI-Vorschau entspricht Berechnung", () => {
    const result = getDemoCalculation();
    expect(HEW_SHOWCASE_KPI_PREVIEW.autarky).toBe(
      `${result.annual.autarkyPercent} %`,
    );
    expect(result.technologyDetails.length).toBeGreaterThanOrEqual(3);
  });
});
