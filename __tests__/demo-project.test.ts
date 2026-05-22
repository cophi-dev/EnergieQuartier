import {
  createShowcaseProject,
  getDemoCalculation,
  SHOWCASE_KPI_PREVIEW,
  SHOWCASE_PROJECT_ID,
} from "@/app/lib/demo-project";

describe("showcase project", () => {
  it("hat stabile Projekt-ID", () => {
    expect(createShowcaseProject().id).toBe(SHOWCASE_PROJECT_ID);
  });

  it("KPI-Vorschau entspricht Berechnung", () => {
    const result = getDemoCalculation();
    expect(SHOWCASE_KPI_PREVIEW.autarky).toBe(
      `${result.annual.autarkyPercent} %`,
    );
    expect(result.technologyDetails.length).toBeGreaterThanOrEqual(3);
  });
});
