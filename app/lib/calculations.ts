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
  selfConsumptionBoost: 0.22, // legacy – allocatePv modelliert Speicher explizit
  cyclesPerYear: 0.55, // saisonale Vollzyklen (≈ 200 Tage/J.)
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

function totalElectricityDemandKwh(
  project: ProjectData,
  heatPumpElectricityKwh: number,
): number {
  return (
    project.electricityKwh +
    heatPumpElectricityKwh +
    Math.round(project.livingArea * 2)
  );
}

interface PvAllocation {
  pvGenerationKwh: number;
  directPvSelfUseKwh: number;
  batteryChargeKwh: number;
  batteryDischargeKwh: number;
  pvSelfUseKwh: number;
  gridExportKwh: number;
}

/**
 * Verteilt PV-Ertrag auf Direktverbrauch, Speicher (statt Einspeisung) und Export.
 * Überschuss mittags → Batterie (bis Kapazität/Zyklen), Rest → Einspeisung.
 */
function allocatePv(
  project: ProjectData,
  sizing: TechnologySizing,
  totalElecDemand: number,
): PvAllocation {
  const pvGenerationKwh = sizing.pvKwp * PV.yieldKwhPerKwp;

  let simultaneity = 0.36;
  if (project.technologies.heatPumpAir || project.technologies.heatPumpGround) {
    simultaneity += 0.05;
  }
  if (project.priorities.autarky > 50) simultaneity += 0.05;
  if (project.technologies.battery && sizing.batteryKwh > 0) {
    simultaneity += 0.03;
  }

  const directPvSelfUseKwh = Math.min(
    totalElecDemand,
    pvGenerationKwh * simultaneity,
  );
  const surplusPv = Math.max(0, pvGenerationKwh - directPvSelfUseKwh);

  let batteryChargeKwh = 0;
  let batteryDischargeKwh = 0;
  if (
    project.technologies.battery &&
    sizing.batteryKwh > 0 &&
    surplusPv > 0
  ) {
    const maxBatteryDischargeKwh =
      sizing.batteryKwh * 365 * BATTERY.roundTrip * BATTERY.cyclesPerYear;
    const remainingDemand = Math.max(0, totalElecDemand - directPvSelfUseKwh);
    batteryDischargeKwh = Math.min(
      surplusPv * 0.95,
      maxBatteryDischargeKwh,
      remainingDemand,
    );
    batteryChargeKwh = Math.min(surplusPv, batteryDischargeKwh / BATTERY.roundTrip);
    batteryDischargeKwh = batteryChargeKwh * BATTERY.roundTrip;
  }

  const gridExportKwh = Math.max(0, surplusPv - batteryChargeKwh);
  const pvSelfUseKwh = Math.min(
    totalElecDemand,
    directPvSelfUseKwh + batteryDischargeKwh,
  );

  return {
    pvGenerationKwh,
    directPvSelfUseKwh,
    batteryChargeKwh,
    batteryDischargeKwh,
    pvSelfUseKwh,
    gridExportKwh,
  };
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
  const { technologies, heatKwh } = project;

  const jaz = technologies.heatPumpGround
    ? HEAT_PUMP.ground.jaz
    : HEAT_PUMP.air.jaz;
  const hpShare = technologies.heatPumpAir || technologies.heatPumpGround ? 0.92 : 0;
  const heatPumpHeatKwh = heatKwh * hpShare;
  const heatPumpElectricityKwh =
    heatPumpHeatKwh > 0
      ? (heatPumpHeatKwh / jaz) * HEAT_PUMP.tempFactor
      : 0;

  const totalElecDemand = totalElectricityDemandKwh(
    project,
    heatPumpElectricityKwh,
  );
  const pv = allocatePv(project, sizing, totalElecDemand);

  const solarThermalKwh =
    sizing.solarThermalM2 * SOLAR_THERMAL.kwhPerM2;

  const totalDemand =
    project.electricityKwh + heatPumpElectricityKwh + heatKwh * 0.1;
  const selfSupplied = pv.pvSelfUseKwh + solarThermalKwh;
  const autarkyPercent = Math.min(
    95,
    Math.round((selfSupplied / totalDemand) * 100),
  );

  const gridImportKwh = Math.max(0, totalElecDemand - pv.pvSelfUseKwh);

  return {
    pvGenerationKwh: Math.round(pv.pvGenerationKwh),
    selfConsumptionKwh: Math.round(pv.pvSelfUseKwh),
    gridExportKwh: Math.round(pv.gridExportKwh),
    gridImportKwh: Math.round(gridImportKwh),
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
    { name: "Haushalt" },
  ];

  const links: SankeyData["links"] = [];
  const add = (source: number, target: number, value: number) => {
    if (value > 50) links.push({ source, target, value: Math.round(value) });
  };

  const householdElec = project.electricityKwh;
  const hpElec = annual.heatPumpElectricityKwh;
  const cooling = Math.round(project.livingArea * 2);
  const totalElecDemand = householdElec + hpElec + cooling;

  const pv = allocatePv(project, sizing, totalElecDemand);
  const gridToLoad = Math.max(0, totalElecDemand - pv.pvSelfUseKwh);

  add(0, 3, gridToLoad);
  add(1, 3, pv.directPvSelfUseKwh);
  add(1, 4, pv.gridExportKwh);
  if (pv.batteryChargeKwh > 0) {
    add(1, 2, pv.batteryChargeKwh);
    add(2, 3, pv.batteryDischargeKwh);
  }

  add(3, 10, householdElec);
  add(3, 6, hpElec);
  add(3, 9, cooling);

  const gasRemain = Math.max(0, project.heatKwh * 0.08);
  const hpHeat = project.heatKwh * 0.84;
  const stHeat = annual.solarThermalKwh;

  add(5, 8, gasRemain);
  add(6, 8, hpHeat);
  add(7, 8, stHeat);

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
