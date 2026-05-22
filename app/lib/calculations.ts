import { pruneSankeyData } from "@/app/lib/sankey-utils";
import type { ProjectData } from "@/app/types/project";
import type {
  CalculationResult,
  SankeyData,
  TechnologySizing,
} from "@/app/types/calculation";

// —— Energiepreise & Parameter (MVP 2026) ——
const PRICES = {
  electricity: 0.32,
  gas: 0.11,
  feedIn: 0.08,
} as const;

const ECONOMIC = {
  discountRate: 0.04,
  horizonYears: 20,
  pvDegradation: 0.005,
} as const;

const PV = {
  yieldKwhPerKwp: 1100, // Hamburg 1.050–1.150
  costPerKwp: 1200,
  subsidyRate: 0.2,
} as const;

const HEAT_PUMP = {
  air: { jaz: 3.8, costMin: 12000, costMax: 18000, subsidy: 0.3 },
  ground: { jaz: 4.5, costMin: 25000, costMax: 35000, subsidy: 0.3 },
  tempFactor: 0.95, // vereinfachte Temperaturkorrektur Hamburg
} as const;

const BATTERY = {
  costPerKwh: 800,
  roundTrip: 0.7,
  selfConsumptionBoost: 0.22, // +22 % Eigenverbrauch mit Speicher
} as const;

const SOLAR_THERMAL = {
  costBase: 7500,
  kwhPerM2: 400,
  coverageShare: 0.25, // Anteil am Wärmebedarf
} as const;

const CO2 = {
  gridKgPerKwh: 0.4,
  gasKgPerKwh: 0.2,
} as const;

/** Dimensionierung anhand Projekt & Prioritäten */
function sizeTechnologies(project: ProjectData): TechnologySizing {
  const { technologies, priorities, electricityKwh, heatKwh, livingArea } =
    project;
  const area = livingArea + project.usableArea;

  let pvKwp = 0;
  if (technologies.pv) {
    const byConsumption = electricityKwh / PV.yieldKwhPerKwp;
    const byRoof = area / 12;
    pvKwp = Math.min(Math.max(byConsumption * 1.1, byRoof * 0.8), byRoof);
    pvKwp = Math.max(3, Math.round(pvKwp * 10) / 10);
    if (priorities.autarky > 40) pvKwp *= 1.15;
    pvKwp = Math.round(pvKwp * 10) / 10;
  }

  let batteryKwh = 0;
  if (technologies.battery && pvKwp > 0) {
    const dailyPv = (pvKwp * PV.yieldKwhPerKwp) / 365;
    batteryKwh = Math.round(Math.min(Math.max(dailyPv * 1.2, 5), 15));
  }

  let heatPumpKw = 0;
  if (technologies.heatPumpAir || technologies.heatPumpGround) {
    heatPumpKw = Math.round((heatKwh / 2000) * 10) / 10;
    heatPumpKw = Math.max(5, Math.min(heatPumpKw, 18));
  }

  let solarThermalM2 = 0;
  if (technologies.solarThermal) {
    const targetKwh = heatKwh * SOLAR_THERMAL.coverageShare;
    solarThermalM2 = Math.round(targetKwh / SOLAR_THERMAL.kwhPerM2);
    solarThermalM2 = Math.max(4, Math.min(solarThermalM2, 25));
  }

  return { pvKwp, batteryKwh, heatPumpKw, solarThermalM2 };
}

function interpolateCost(min: number, max: number, kw: number): number {
  const t = Math.min(1, Math.max(0, (kw - 5) / 13));
  return Math.round(min + (max - min) * t);
}

/** Investition inkl. BAFA-Förderung 2026 (vereinfacht) */
function calcInvestment(
  project: ProjectData,
  sizing: TechnologySizing,
): CalculationResult["investment"] {
  const { technologies } = project;
  const byComponent: Record<string, number> = {};
  let gross = 0;
  let subsidies = 0;

  if (technologies.pv && sizing.pvKwp > 0) {
    const g = sizing.pvKwp * PV.costPerKwp;
    const s = g * PV.subsidyRate;
    byComponent.pv = g;
    gross += g;
    subsidies += s;
  }

  if (technologies.heatPumpAir && sizing.heatPumpKw > 0) {
    const g = interpolateCost(
      HEAT_PUMP.air.costMin,
      HEAT_PUMP.air.costMax,
      sizing.heatPumpKw,
    );
    const s = g * HEAT_PUMP.air.subsidy;
    byComponent.heatPumpAir = g;
    gross += g;
    subsidies += s;
  }

  if (technologies.heatPumpGround && sizing.heatPumpKw > 0) {
    const g = interpolateCost(
      HEAT_PUMP.ground.costMin,
      HEAT_PUMP.ground.costMax,
      sizing.heatPumpKw,
    );
    const s = g * HEAT_PUMP.ground.subsidy;
    byComponent.heatPumpGround = g;
    gross += g;
    subsidies += s;
  }

  if (technologies.battery && sizing.batteryKwh > 0) {
    const g = sizing.batteryKwh * BATTERY.costPerKwh;
    byComponent.battery = g;
    gross += g;
  }

  if (technologies.solarThermal && sizing.solarThermalM2 > 0) {
    const g =
      SOLAR_THERMAL.costBase + sizing.solarThermalM2 * 120;
    const s = g * 0.25;
    byComponent.solarThermal = g;
    gross += g;
    subsidies += s;
  }

  return {
    gross: Math.round(gross),
    subsidies: Math.round(subsidies),
    net: Math.round(gross - subsidies),
    byComponent,
  };
}

/** Jahresbilanz Strom / Wärme */
function calcAnnualBalance(
  project: ProjectData,
  sizing: TechnologySizing,
): CalculationResult["annual"] {
  const { technologies, electricityKwh, heatKwh } = project;

  const pvGenerationKwh = sizing.pvKwp * PV.yieldKwhPerKwp;
  let selfConsumptionRate = 0.35;
  if (technologies.battery && sizing.batteryKwh > 0) {
    selfConsumptionRate += BATTERY.selfConsumptionBoost;
    selfConsumptionRate *= 1 + (sizing.batteryKwh / 20) * 0.05;
    selfConsumptionRate = Math.min(selfConsumptionRate, 0.75);
  }
  if (project.priorities.autarky > 50) selfConsumptionRate += 0.05;

  const pvSelfUse = Math.min(
    electricityKwh * 0.85,
    pvGenerationKwh * selfConsumptionRate,
  );
  const gridExportKwh = Math.max(0, pvGenerationKwh - pvSelfUse);

  const jaz = technologies.heatPumpGround
    ? HEAT_PUMP.ground.jaz
    : HEAT_PUMP.air.jaz;
  const hpShare = technologies.heatPumpAir || technologies.heatPumpGround ? 0.92 : 0;
  const heatPumpHeatKwh = heatKwh * hpShare;
  const heatPumpElectricityKwh =
    heatPumpHeatKwh > 0
      ? (heatPumpHeatKwh / jaz) * HEAT_PUMP.tempFactor
      : 0;

  const solarThermalKwh =
    sizing.solarThermalM2 * SOLAR_THERMAL.kwhPerM2;

  const totalDemand =
    electricityKwh + heatPumpElectricityKwh + heatKwh * 0.1;
  const selfSupplied =
    pvSelfUse +
    solarThermalKwh +
    (technologies.battery ? pvSelfUse * 0.15 * BATTERY.roundTrip : 0);
  const autarkyPercent = Math.min(
    95,
    Math.round((selfSupplied / totalDemand) * 100),
  );

  const gridImportKwh =
    electricityKwh -
    pvSelfUse +
    heatPumpElectricityKwh +
    Math.max(0, heatKwh - heatPumpHeatKwh - solarThermalKwh) * 0.02;

  return {
    pvGenerationKwh: Math.round(pvGenerationKwh),
    selfConsumptionKwh: Math.round(pvSelfUse),
    gridExportKwh: Math.round(gridExportKwh),
    gridImportKwh: Math.round(Math.max(0, gridImportKwh)),
    heatPumpElectricityKwh: Math.round(heatPumpElectricityKwh),
    solarThermalKwh: Math.round(solarThermalKwh),
    autarkyPercent,
  };
}

function calcEconomics(
  project: ProjectData,
  sizing: TechnologySizing,
  investment: CalculationResult["investment"],
  annual: CalculationResult["annual"],
): CalculationResult["economics"] {
  const { electricityKwh, heatKwh } = project;

  const baselineCostEur =
    electricityKwh * PRICES.electricity + heatKwh * PRICES.gas;

  const elecSavings =
    annual.selfConsumptionKwh * PRICES.electricity +
    annual.gridExportKwh * PRICES.feedIn;

  const gasDisplaced =
    (project.technologies.heatPumpAir || project.technologies.heatPumpGround
      ? heatKwh * 0.92
      : 0) + annual.solarThermalKwh;
  const heatSavings =
    gasDisplaced * PRICES.gas -
    annual.heatPumpElectricityKwh * PRICES.electricity;

  const annualSavingsEur = Math.round(elecSavings + heatSavings);
  const paybackYears =
    annualSavingsEur > 0
      ? Math.round((investment.net / annualSavingsEur) * 10) / 10
      : 99;

  let npv = -investment.net;
  for (let y = 1; y <= ECONOMIC.horizonYears; y++) {
    const degradation = Math.pow(1 - ECONOMIC.pvDegradation, y - 1);
    const yearSavings = annualSavingsEur * degradation;
    npv += yearSavings / Math.pow(1 + ECONOMIC.discountRate, y);
  }

  const roiPercent =
    investment.net > 0
      ? Math.round(
          ((annualSavingsEur * ECONOMIC.horizonYears - investment.net) /
            investment.net) *
            100,
        )
      : 0;

  return {
    baselineCostEur: Math.round(baselineCostEur),
    annualSavingsEur,
    paybackYears,
    npvEur: Math.round(npv),
    roiPercent,
  };
}

function calcEnvironment(
  project: ProjectData,
  annual: CalculationResult["annual"],
): CalculationResult["environment"] {
  const { electricityKwh, heatKwh } = project;

  const co2BaselineKg = Math.round(
    electricityKwh * CO2.gridKgPerKwh + heatKwh * CO2.gasKgPerKwh,
  );

  const co2AfterKg = Math.round(
    annual.gridImportKwh * CO2.gridKgPerKwh +
      (heatKwh - annual.solarThermalKwh) *
        (project.technologies.heatPumpAir || project.technologies.heatPumpGround
          ? 0.05
          : CO2.gasKgPerKwh),
  );

  return {
    co2BaselineKg,
    co2AfterKg,
    co2SavingsKg: Math.max(0, co2BaselineKg - co2AfterKg),
  };
}

function buildCashflow(
  investmentNet: number,
  annualSavings: number,
): CalculationResult["cashflowYears"] {
  const years: CalculationResult["cashflowYears"] = [];
  let cumulative = -investmentNet;

  years.push({ year: 0, savings: -investmentNet, cumulative });

  for (let y = 1; y <= ECONOMIC.horizonYears; y++) {
    const degradation = Math.pow(1 - ECONOMIC.pvDegradation, y - 1);
    const savings = Math.round(annualSavings * degradation);
    cumulative += savings;
    years.push({ year: y, savings, cumulative });
  }

  return years;
}

/** Sankey: Strom / Wärme / Kälte Flüsse (kWh/a) */
function buildSankey(
  project: ProjectData,
  sizing: TechnologySizing,
  annual: CalculationResult["annual"],
): SankeyData {
  const nodes: SankeyData["nodes"] = [
    { name: "Netzstrom" },
    { name: "PV-Erzeugung" },
    { name: "Batterie" },
    { name: "Strombedarf" },
    { name: "Einspeisung" },
    { name: "Gas/Wärme (Referenz)" },
    { name: "Wärmepumpe" },
    { name: "Solarthermie" },
    { name: "Wärmebedarf" },
    { name: "Kühlung (Neben)" },
  ];

  const links: SankeyData["links"] = [];
  const add = (source: number, target: number, value: number) => {
    if (value > 50) links.push({ source, target, value: Math.round(value) });
  };

  const gridToLoad = Math.max(
    0,
    project.electricityKwh - annual.selfConsumptionKwh,
  );
  const pvToLoad = annual.selfConsumptionKwh;
  const pvToGrid = annual.gridExportKwh;
  const batteryFlow =
    project.technologies.battery && sizing.batteryKwh > 0
      ? pvToLoad * 0.2
      : 0;

  add(0, 3, gridToLoad);
  add(1, 3, pvToLoad - batteryFlow);
  add(1, 4, pvToGrid);
  if (batteryFlow > 0) {
    add(1, 2, batteryFlow);
    add(2, 3, batteryFlow * BATTERY.roundTrip);
  }

  const gasRemain = Math.max(
    0,
    project.heatKwh * 0.08,
  );
  const hpHeat = project.heatKwh * 0.84;
  const stHeat = annual.solarThermalKwh;

  add(5, 8, gasRemain);
  add(6, 8, hpHeat);
  add(7, 8, stHeat);
  add(0, 6, annual.heatPumpElectricityKwh);
  add(3, 6, annual.heatPumpElectricityKwh * 0.1);

  const cooling = project.livingArea * 2;
  add(3, 9, cooling);

  return { nodes, links };
}

function buildTechnologyDetails(
  project: ProjectData,
  sizing: TechnologySizing,
  annual: CalculationResult["annual"],
  investment: CalculationResult["investment"],
): CalculationResult["technologyDetails"] {
  const { technologies } = project;
  const details: CalculationResult["technologyDetails"] = [];

  if (technologies.pv) {
    const gross = investment.byComponent.pv ?? 0;
    details.push({
      id: "pv",
      name: "Photovoltaik",
      enabled: true,
      headline: `${sizing.pvKwp} kWp · ${annual.pvGenerationKwh.toLocaleString("de-DE")} kWh/a`,
      specs: [
        { label: "Spez. Ertrag", value: `${PV.yieldKwhPerKwp} kWh/kWp (HH)` },
        { label: "Investition", value: `${gross.toLocaleString("de-DE")} € brutto` },
        { label: "Förderung", value: `${(PV.subsidyRate * 100).toFixed(0)} %` },
      ],
    });
  }

  if (technologies.heatPumpAir) {
    details.push({
      id: "hp-air",
      name: "Luft-Wärmepumpe",
      enabled: true,
      headline: `${sizing.heatPumpKw} kW · JAZ ${HEAT_PUMP.air.jaz}`,
      specs: [
        { label: "Strombedarf WP", value: `${annual.heatPumpElectricityKwh.toLocaleString("de-DE")} kWh/a` },
        { label: "JAZ (Luft)", value: String(HEAT_PUMP.air.jaz) },
        { label: "Förderung BAFA", value: "30 %" },
      ],
    });
  }

  if (technologies.heatPumpGround) {
    details.push({
      id: "hp-ground",
      name: "Sole-Wärmepumpe",
      enabled: true,
      headline: `${sizing.heatPumpKw} kW · JAZ ${HEAT_PUMP.ground.jaz}`,
      specs: [
        { label: "Erdsonden", value: "Inkl. (vereinfacht)" },
        { label: "JAZ (Sole)", value: String(HEAT_PUMP.ground.jaz) },
        { label: "Förderung BAFA", value: "30 %" },
      ],
    });
  }

  if (technologies.battery) {
    details.push({
      id: "battery",
      name: "Batteriespeicher",
      enabled: true,
      headline: `${sizing.batteryKwh} kWh`,
      specs: [
        { label: "Wirkungsgrad", value: `${BATTERY.roundTrip * 100} % Roundtrip` },
        { label: "Eigenverbrauch", value: "Optimiert" },
        { label: "Investition", value: `${(investment.byComponent.battery ?? 0).toLocaleString("de-DE")} €` },
      ],
    });
  }

  if (technologies.solarThermal) {
    details.push({
      id: "solar-thermal",
      name: "Solarthermie",
      enabled: true,
      headline: `${sizing.solarThermalM2} m² Kollektor`,
      specs: [
        { label: "Wärmeertrag", value: `${annual.solarThermalKwh.toLocaleString("de-DE")} kWh/a` },
        { label: "Deckung", value: `~${(SOLAR_THERMAL.coverageShare * 100).toFixed(0)} % Wärme` },
      ],
    });
  }

  return details;
}

/** Hauptfunktion: Projekt → vollständiges Ergebnis */
export function calculateProject(project: ProjectData): CalculationResult {
  const sizing = sizeTechnologies(project);
  const investment = calcInvestment(project, sizing);
  const annual = calcAnnualBalance(project, sizing);
  const economics = calcEconomics(project, sizing, investment, annual);
  const environment = calcEnvironment(project, annual);
  const sankey = pruneSankeyData(buildSankey(project, sizing, annual));
  const cashflowYears = buildCashflow(
    investment.net,
    economics.annualSavingsEur,
  );
  const technologyDetails = buildTechnologyDetails(
    project,
    sizing,
    annual,
    investment,
  );

  return {
    sizing,
    investment,
    annual,
    economics,
    environment,
    sankey,
    cashflowYears,
    technologyDetails,
  };
}
