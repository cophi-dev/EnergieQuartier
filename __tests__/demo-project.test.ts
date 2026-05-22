import {
  createShowcaseProject,
  getDemoCalculation,
  SHOWCASE_KPI_PREVIEW,
  SHOWCASE_PROJECT_ID,
  SHOWCASE_SUMMARY,
} from "@/app/lib/demo-project";

describe("showcase project Wilhelmsburg", () => {
  it("hat stabile Projekt-ID", () => {
    expect(createShowcaseProject().id).toBe(SHOWCASE_PROJECT_ID);
  });

  it("ist in Hamburg-Wilhelmsburg angesiedelt", () => {
    const p = createShowcaseProject();
    expect(p.postalCode).toBe("21109");
    expect(p.address.toLowerCase()).toContain("wilhelmsburg");
    expect(SHOWCASE_SUMMARY).toMatch(/Wilhelmsburg/i);
  });

  it("KPI-Vorschau entspricht Berechnung", () => {
    const result = getDemoCalculation();
    expect(SHOWCASE_KPI_PREVIEW.autarky).toBe(
      `${result.annual.autarkyPercent} %`,
    );
    expect(result.technologyDetails.length).toBeGreaterThanOrEqual(2);
  });
});
