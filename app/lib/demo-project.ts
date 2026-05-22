import { calculateProject } from "@/app/lib/calculations";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

/** Feste ID für das Beispielprojekt (idempotent in localStorage) */
export const SHOWCASE_PROJECT_ID = "energiequartier-showcase";

/** Kurzbeschreibung für UI-Banner */
export const SHOWCASE_SUMMARY =
  "8 WE · 620 m² · Baujahr 1978 · Teilsaniert 2020 · Hamburg-Wilhelmsburg";

/** Einzeiler für Buttons und Hero */
export const SHOWCASE_SUMMARY_SHORT =
  "MFH Wilhelmsburg – 8 Wohneinheiten, realistisches Hamburger Beispiel";

/**
 * Kuratiertes Beispielprojekt für Demo und Erstkontakt.
 * Mehrfamilienhaus in Hamburg-Wilhelmsburg – typisch für Bestand + Wärmewende.
 */
export function createShowcaseProject(): ProjectData {
  const now = new Date().toISOString();
  return {
    id: SHOWCASE_PROJECT_ID,
    name: "MFH Wilhelmsburg – Demo-Projekt",
    address: "Koopstraße 42, Wilhelmsburg",
    postalCode: "21109",
    buildingType: "mehrfamilienhaus",
    livingArea: 620,
    usableArea: 95,
    yearBuilt: 1978,
    renovationStatus: "teilweise",
    electricityKwh: 28_400,
    heatKwh: 52_800,
    priorities: { cost: 35, co2: 40, autarky: 25 },
    technologies: {
      pv: true,
      heatPumpAir: true,
      heatPumpGround: false,
      battery: true,
      solarThermal: false,
    },
    budget: 285_000,
    targetPaybackYears: 14,
    notes:
      "Demo-Projekt: 8 Wohneinheiten in Wilhelmsburg (21109), Baujahr 1978, " +
      "Teilsanierung 2020 (Fassade, Fenster). Gasheizung soll ersetzt werden. " +
      "Flachdach für PV geeignet, Luft-Wärmepumpe im Keller, Batteriespeicher " +
      "für Mieterstrom-Modell in Planung. Typisches Objekt der Hamburger Wärmewende.",
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
