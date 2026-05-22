import { calculateProject } from "@/app/lib/calculations";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

/** Feste ID für das HEW-Vorstellungsprojekt (idempotent in localStorage) */
export const HEW_SHOWCASE_PROJECT_ID = "hew-showcase-2026";

/**
 * Kuratiertes Demo-Objekt für Bewerbungsgespräche bei den Hamburger Energiewerken.
 * Werte sind bewusst stabil und erzählen eine überzeugende Geschichte.
 */
export function createHewShowcaseProject(): ProjectData {
  const now = new Date().toISOString();
  return {
    id: HEW_SHOWCASE_PROJECT_ID,
    name: "MFH Elbchaussee – HEW Vertriebsdemo",
    address: "Elbchaussee 42",
    postalCode: "22763",
    buildingType: "mehrfamilienhaus",
    livingArea: 480,
    usableArea: 120,
    yearBuilt: 1968,
    renovationStatus: "teilweise",
    electricityKwh: 12500,
    heatKwh: 72000,
    priorities: { cost: 35, co2: 40, autarky: 25 },
    technologies: {
      pv: true,
      heatPumpAir: true,
      heatPumpGround: false,
      battery: true,
      solarThermal: true,
    },
    budget: 185000,
    targetPaybackYears: 14,
    notes:
      "HEW-Vertriebsdemo: 6 WE, teilsaniert, PV auf Flachdach, Luft-WP im Innenhof, " +
      "Solarthermie für WW. Kunde priorisiert CO₂-Reduktion bei kommunaler Förderung.",
    createdAt: now,
    updatedAt: now,
  };
}

function formatDeNumber(value: number, decimals = 0): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** KPI-Vorschau aus echter Berechnung – Hero & Banner bleiben synchron */
const _showcaseResult = calculateProject(createHewShowcaseProject());

export const HEW_SHOWCASE_KPI_PREVIEW = {
  paybackYears: formatDeNumber(_showcaseResult.economics.paybackYears, 1),
  co2Savings: `${formatDeNumber(_showcaseResult.environment.co2SavingsKg / 1000, 1)} t/a`,
  npv: `${formatDeNumber(_showcaseResult.economics.npvEur)} €`,
  autarky: `${_showcaseResult.annual.autarkyPercent} %`,
} as const;

/** HEW-Showcase-Berechnung für Demo-Dashboard */
export function getDemoCalculation(): CalculationResult {
  return calculateProject(createHewShowcaseProject());
}
