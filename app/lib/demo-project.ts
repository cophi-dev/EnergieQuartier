import { calculateProject } from "@/app/lib/calculations";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

/** Feste ID für das Beispielprojekt (idempotent in localStorage) */
export const SHOWCASE_PROJECT_ID = "energiequartier-showcase";

/** Kurzbeschreibung für UI-Banner */
export const SHOWCASE_SUMMARY =
  "12 WE · 850 m² · Baujahr 1998 · Kernsanierung 2022 · Hamburg-Hammerbrook";

/**
 * Kuratiertes Beispielprojekt für Demo und Erstkontakt.
 * Realistisches Mehrfamilienhaus in Hamburg mit vollsaniertem Gebäudehülle (2022).
 */
export function createShowcaseProject(): ProjectData {
  const now = new Date().toISOString();
  return {
    id: SHOWCASE_PROJECT_ID,
    name: "MFH Hammerbrook – Beispielprojekt",
    address: "Beim Strohhause 12",
    postalCode: "20097",
    buildingType: "mehrfamilienhaus",
    livingArea: 850,
    usableArea: 180,
    yearBuilt: 1998,
    renovationStatus: "vollständig",
    electricityKwh: 34_200,
    heatKwh: 58_500,
    priorities: { cost: 30, co2: 45, autarky: 25 },
    technologies: {
      pv: true,
      heatPumpAir: true,
      heatPumpGround: false,
      battery: true,
      solarThermal: true,
    },
    budget: 420_000,
    targetPaybackYears: 16,
    notes:
      "Beispielprojekt: 12 Wohneinheiten, 850 m² Wohnfläche, Baujahr 1998, " +
      "Kernsanierung 2022 (Fassade, Fenster, Heizungsvorbereitung). PV auf Flachdach, " +
      "Luft-WP im Technikraum, Batteriespeicher + Solarthermie für WW. " +
      "Schwerpunkt CO₂-Reduktion im Rahmen der Wärmewende.",
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
const _showcaseResult = calculateProject(createShowcaseProject());

export const SHOWCASE_KPI_PREVIEW = {
  paybackYears: formatDeNumber(_showcaseResult.economics.paybackYears, 1),
  co2Savings: `${formatDeNumber(_showcaseResult.environment.co2SavingsKg / 1000, 1)} t/a`,
  npv: `${formatDeNumber(_showcaseResult.economics.npvEur)} €`,
  autarky: `${_showcaseResult.annual.autarkyPercent} %`,
} as const;

/** Showcase-Berechnung für Demo-Dashboard */
export function getDemoCalculation(): CalculationResult {
  return calculateProject(createShowcaseProject());
}
