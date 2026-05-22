import { calculateProject } from "@/app/lib/calculations";
import { createShowcaseProject } from "@/app/lib/demo-project";
import type { ProjectData } from "@/app/types/project";

function baseProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    ...createShowcaseProject(),
    id: "test-project",
    ...overrides,
  };
}

describe("calculateProject", () => {
  it("berechnet PV-Ertrag im Hamburger Korridor (1050–1150 kWh/kWp)", () => {
    const result = calculateProject(
      baseProject({
        technologies: {
          pv: true,
          heatPumpAir: false,
          heatPumpGround: false,
          battery: false,
          solarThermal: false,
        },
      }),
    );
    expect(result.sizing.pvKwp).toBeGreaterThan(0);
    const specificYield =
      result.annual.pvGenerationKwh / result.sizing.pvKwp;
    expect(specificYield).toBeGreaterThanOrEqual(1050);
    expect(specificYield).toBeLessThanOrEqual(1150);
  });

  it("wendet PV-Förderung (~20 %) und WP-Förderung (~30 %) an", () => {
    const result = calculateProject(createShowcaseProject());
    expect(result.investment.gross).toBeGreaterThan(result.investment.net);
    expect(result.investment.subsidies).toBeGreaterThan(0);
    const subsidyShare =
      result.investment.subsidies / result.investment.gross;
    expect(subsidyShare).toBeGreaterThan(0.15);
    expect(subsidyShare).toBeLessThan(0.45);
  });

  it("liefert positive Einsparung und NPV für Beispielprojekt", () => {
    const result = calculateProject(createShowcaseProject());
    expect(result.economics.annualSavingsEur).toBeGreaterThan(0);
    expect(result.economics.paybackYears).toBeLessThan(25);
    expect(result.environment.co2SavingsKg).toBeGreaterThan(0);
    expect(result.annual.autarkyPercent).toBeGreaterThan(0);
    expect(result.annual.autarkyPercent).toBeLessThanOrEqual(95);
  });

  it("erzeugt gültige Sankey-Daten ohne isolierte Knoten", () => {
    const result = calculateProject(createShowcaseProject());
    expect(result.sankey.nodes.length).toBeGreaterThan(0);
    expect(result.sankey.links.length).toBeGreaterThan(0);
    for (const link of result.sankey.links) {
      expect(link.value).toBeGreaterThan(0);
      expect(link.source).toBeLessThan(result.sankey.nodes.length);
      expect(link.target).toBeLessThan(result.sankey.nodes.length);
    }
  });

  it("Cashflow startet mit negativer Investition in Jahr 0", () => {
    const result = calculateProject(createShowcaseProject());
    expect(result.cashflowYears[0].year).toBe(0);
    expect(result.cashflowYears[0].savings).toBeLessThan(0);
    expect(result.cashflowYears).toHaveLength(21);
  });

  it("Batterie erhöht Eigenverbrauch gegenüber PV-only", () => {
    const base = baseProject({
      technologies: {
        pv: true,
        heatPumpAir: false,
        heatPumpGround: false,
        battery: false,
        solarThermal: false,
      },
    });
    const withBattery = baseProject({
      technologies: {
        pv: true,
        heatPumpAir: false,
        heatPumpGround: false,
        battery: true,
        solarThermal: false,
      },
    });
    const pvOnly = calculateProject(base);
    const pvBattery = calculateProject(withBattery);
    expect(pvBattery.annual.selfConsumptionKwh).toBeGreaterThanOrEqual(
      pvOnly.annual.selfConsumptionKwh,
    );
  });
});
