import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

export interface ConceptSizingItem {
  id: string;
  label: string;
  value: string;
  detail?: string;
}

/** Dimensionierte Größen je aktivierter Technologie fürs Konzept */
export function buildConceptSizingItems(
  project: ProjectData,
  result: CalculationResult,
): ConceptSizingItem[] {
  const { sizing, annual } = result;
  const { technologies } = project;
  const items: ConceptSizingItem[] = [];

  if (technologies.pv && sizing.pvKwp > 0) {
    items.push({
      id: "pv",
      label: "Photovoltaik",
      value: `${sizing.pvKwp} kWp`,
      detail: `≈ ${annual.pvGenerationKwh.toLocaleString("de-DE")} kWh/a Ertrag`,
    });
  }

  if (technologies.battery && sizing.batteryKwh > 0) {
    items.push({
      id: "battery",
      label: "Batteriespeicher",
      value: `${sizing.batteryKwh} kWh`,
      detail: "Auslegung nach Tages-PV-Ertrag",
    });
  }

  if (technologies.heatPumpAir && sizing.heatPumpKw > 0) {
    items.push({
      id: "hp-air",
      label: "Luft-Wärmepumpe",
      value: `${sizing.heatPumpKw} kW`,
      detail: `${annual.heatPumpElectricityKwh.toLocaleString("de-DE")} kWh/a Strombedarf`,
    });
  }

  if (technologies.heatPumpGround && sizing.heatPumpKw > 0) {
    items.push({
      id: "hp-ground",
      label: "Sole-Wärmepumpe",
      value: `${sizing.heatPumpKw} kW`,
      detail: `${annual.heatPumpElectricityKwh.toLocaleString("de-DE")} kWh/a Strombedarf`,
    });
  }

  if (technologies.solarThermal && sizing.solarThermalM2 > 0) {
    items.push({
      id: "solar-thermal",
      label: "Solarthermie",
      value: `${sizing.solarThermalM2} m²`,
      detail: `≈ ${annual.solarThermalKwh.toLocaleString("de-DE")} kWh/a Wärme`,
    });
  }

  return items;
}
