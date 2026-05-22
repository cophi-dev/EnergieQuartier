import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

/** Monatslabel (deutsch, kurz) */
export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
] as const;

/** PV-Ertrag Hamburg – monatliche Anteile (Summe = 1) */
const PV_SEASONAL = [
  0.03, 0.04, 0.07, 0.09, 0.11, 0.12, 0.12, 0.11, 0.09, 0.07, 0.04, 0.11,
];

/** Wärmebedarf – winterlastig (Summe = 1) */
const HEAT_SEASONAL = [
  0.14, 0.13, 0.11, 0.08, 0.05, 0.03, 0.02, 0.03, 0.05, 0.08, 0.11, 0.17,
];

/** Strombedarf leicht winterlastig */
const ELEC_SEASONAL = [
  0.09, 0.09, 0.08, 0.08, 0.08, 0.07, 0.07, 0.07, 0.08, 0.08, 0.09, 0.12,
];

export interface MonthlyEnergyPoint {
  month: string;
  monthIndex: number;
  pvGenerationKwh: number;
  selfConsumptionKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  heatDemandKwh: number;
  heatPumpElectricityKwh: number;
}

function distribute(
  annualTotal: number,
  weights: readonly number[],
): number[] {
  if (annualTotal <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => Math.round(annualTotal * w));
  const diff = annualTotal - raw.reduce((a, b) => a + b, 0);
  if (diff !== 0) raw[5] += diff;
  return raw;
}

/** Monatliche Energieflüsse aus Jahresbilanz ableiten (Hamburg-Saisonprofil) */
export function buildMonthlyEnergyFlows(
  project: ProjectData,
  result: CalculationResult,
): MonthlyEnergyPoint[] {
  const { annual } = result;

  const pvByMonth = distribute(annual.pvGenerationKwh, PV_SEASONAL);
  const selfUseByMonth = distribute(annual.selfConsumptionKwh, PV_SEASONAL);
  const exportByMonth = distribute(annual.gridExportKwh, PV_SEASONAL);
  const gridImportByMonth = distribute(annual.gridImportKwh, ELEC_SEASONAL);
  const heatByMonth = distribute(project.heatKwh, HEAT_SEASONAL);
  const hpElecByMonth = distribute(
    annual.heatPumpElectricityKwh,
    HEAT_SEASONAL,
  );

  return MONTH_LABELS.map((month, i) => ({
    month,
    monthIndex: i,
    pvGenerationKwh: pvByMonth[i],
    selfConsumptionKwh: selfUseByMonth[i],
    gridImportKwh: gridImportByMonth[i],
    gridExportKwh: exportByMonth[i],
    heatDemandKwh: heatByMonth[i],
    heatPumpElectricityKwh: hpElecByMonth[i],
  }));
}

/** Summe der Monatswerte = Jahreswert (Toleranz für Rundung) */
export function monthlyTotalsMatchAnnual(
  monthly: MonthlyEnergyPoint[],
  annualValue: number,
  key: keyof Pick<
    MonthlyEnergyPoint,
    "pvGenerationKwh" | "gridImportKwh" | "heatDemandKwh"
  >,
): boolean {
  const sum = monthly.reduce((s, m) => s + m[key], 0);
  return Math.abs(sum - annualValue) <= 2;
}
