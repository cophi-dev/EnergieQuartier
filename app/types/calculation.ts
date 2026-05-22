/** Ergebnis einer vollständigen Konzeptberechnung */
export interface CalculationResult {
  sizing: TechnologySizing;
  investment: InvestmentBreakdown;
  annual: AnnualEnergyBalance;
  economics: EconomicResult;
  environment: EnvironmentResult;
  sankey: SankeyData;
  cashflowYears: CashflowYear[];
  technologyDetails: TechnologyDetail[];
}

export interface TechnologySizing {
  pvKwp: number;
  batteryKwh: number;
  heatPumpKw: number;
  solarThermalM2: number;
}

export interface InvestmentBreakdown {
  gross: number;
  subsidies: number;
  net: number;
  byComponent: Record<string, number>;
}

export interface AnnualEnergyBalance {
  pvGenerationKwh: number;
  selfConsumptionKwh: number;
  gridExportKwh: number;
  gridImportKwh: number;
  heatPumpElectricityKwh: number;
  solarThermalKwh: number;
  autarkyPercent: number;
}

export interface EconomicResult {
  baselineCostEur: number;
  annualSavingsEur: number;
  paybackYears: number;
  npvEur: number;
  roiPercent: number;
}

export interface EnvironmentResult {
  co2BaselineKg: number;
  co2AfterKg: number;
  co2SavingsKg: number;
}

export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface CashflowYear {
  year: number;
  savings: number;
  cumulative: number;
}

export interface TechnologyDetail {
  id: string;
  name: string;
  enabled: boolean;
  headline: string;
  specs: { label: string; value: string }[];
}
