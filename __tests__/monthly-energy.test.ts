import { buildMonthlyEnergyFlows, monthlyTotalsMatchAnnual } from "@/app/lib/monthly-energy";
import { calculateProject } from "@/app/lib/calculations";
import { createShowcaseProject } from "@/app/lib/demo-project";

describe("buildMonthlyEnergyFlows", () => {
  it("liefert 12 Monate mit Saisonprofil", () => {
    const project = createShowcaseProject();
    const result = calculateProject(project);
    const monthly = buildMonthlyEnergyFlows(project, result);

    expect(monthly).toHaveLength(12);
    expect(monthly[0].month).toBe("Jan");
    expect(monthly[11].month).toBe("Dez");
  });

  it("Summen entsprechen Jahreswerten", () => {
    const project = createShowcaseProject();
    const result = calculateProject(project);
    const monthly = buildMonthlyEnergyFlows(project, result);

    expect(
      monthlyTotalsMatchAnnual(
        monthly,
        result.annual.pvGenerationKwh,
        "pvGenerationKwh",
      ),
    ).toBe(true);
    expect(
      monthlyTotalsMatchAnnual(monthly, project.heatKwh, "heatDemandKwh"),
    ).toBe(true);
  });

  it("PV im Sommer höher als im Winter", () => {
    const project = createShowcaseProject();
    const result = calculateProject(project);
    const monthly = buildMonthlyEnergyFlows(project, result);

    const jan = monthly[0].pvGenerationKwh;
    const jul = monthly[6].pvGenerationKwh;
    expect(jul).toBeGreaterThan(jan);
  });

  it("Wärme im Winter höher als im Sommer", () => {
    const project = createShowcaseProject();
    const result = calculateProject(project);
    const monthly = buildMonthlyEnergyFlows(project, result);

    expect(monthly[0].heatDemandKwh).toBeGreaterThan(monthly[6].heatDemandKwh);
  });
});
