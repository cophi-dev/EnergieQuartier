import type {
  BuildingType,
  RenovationStatus,
} from "@/app/types/project";

interface EstimateInput {
  buildingType: BuildingType;
  livingArea: number;
  usableArea: number;
  yearBuilt: number;
  renovationStatus: RenovationStatus;
}

/** Vereinfachte Verbrauchsschätzung für Erstkonzepte (Hamburg / Wohngebäude) */
export function estimateConsumption(input: EstimateInput): {
  electricityKwh: number;
  heatKwh: number;
} {
  const area = Math.max(input.livingArea + input.usableArea, input.livingArea);

  const heatPerM2: Record<RenovationStatus, number> = {
    unsaniert: 165,
    teilweise: 115,
    vollständig: 75,
    neubau: 45,
  };

  const buildingFactor: Record<BuildingType, number> = {
    einfamilienhaus: 1,
    mehrfamilienhaus: 0.85,
    gewerbe: 1.35,
    öffentlich: 1.2,
  };

  let heatKwh = area * heatPerM2[input.renovationStatus] * buildingFactor[input.buildingType];

  if (input.yearBuilt < 1970) heatKwh *= 1.12;
  if (input.yearBuilt >= 2010) heatKwh *= 0.92;

  const elecPerM2: Record<BuildingType, number> = {
    einfamilienhaus: 28,
    mehrfamilienhaus: 22,
    gewerbe: 45,
    öffentlich: 38,
  };

  let electricityKwh =
    area * elecPerM2[input.buildingType] +
    (input.buildingType === "einfamilienhaus" ? 800 : 1200);

  if (input.renovationStatus === "neubau") electricityKwh *= 0.9;

  return {
    electricityKwh: Math.round(electricityKwh),
    heatKwh: Math.round(heatKwh),
  };
}
