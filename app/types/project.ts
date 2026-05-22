/** Gebäudetypen für Schätzungen und Normwerte */
export type BuildingType =
  | "einfamilienhaus"
  | "mehrfamilienhaus"
  | "gewerbe"
  | "öffentlich";

/** Sanierungsstand – beeinflusst Wärmeverbrauchsschätzung */
export type RenovationStatus =
  | "unsaniert"
  | "teilweise"
  | "vollständig"
  | "neubau";

/** Ausgewählte Technologien im Konfigurator */
export interface TechnologySelection {
  pv: boolean;
  heatPumpAir: boolean;
  heatPumpGround: boolean;
  battery: boolean;
  solarThermal: boolean;
}

/** Prioritäten-Slider (0–100, Summe wird im Wizard normalisiert) */
export interface ProjectPriorities {
  cost: number;
  co2: number;
  autarky: number;
}

/** Vollständiges Projektdatenmodell – wird im Wizard befüllt */
export interface ProjectData {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  buildingType: BuildingType;
  livingArea: number;
  usableArea: number;
  yearBuilt: number;
  renovationStatus: RenovationStatus;
  electricityKwh: number;
  heatKwh: number;
  priorities: ProjectPriorities;
  technologies: TechnologySelection;
  budget: number;
  targetPaybackYears: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const defaultTechnologies: TechnologySelection = {
  pv: true,
  heatPumpAir: false,
  heatPumpGround: false,
  battery: false,
  solarThermal: false,
};

export const defaultPriorities: ProjectPriorities = {
  cost: 50,
  co2: 30,
  autarky: 20,
};

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyProject(): ProjectData {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    address: "",
    postalCode: "",
    buildingType: "einfamilienhaus",
    livingArea: 120,
    usableArea: 0,
    yearBuilt: 1990,
    renovationStatus: "teilweise",
    electricityKwh: 3500,
    heatKwh: 15000,
    priorities: { ...defaultPriorities },
    technologies: { ...defaultTechnologies },
    budget: 50000,
    targetPaybackYears: 12,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}
