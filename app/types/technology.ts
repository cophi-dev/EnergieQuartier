import type { LucideIcon } from "lucide-react";
import type { TechnologySelection } from "@/app/types/project";

/** Kategorien für Filter und Gruppierung */
export type TechnologyCategory = "strom" | "waerme" | "speicher" | "netz";

export interface TechnologyCosts {
  /** Typische Investition 2026 */
  investment: string;
  /** Laufende Kosten pro Jahr */
  operating: string;
}

export interface TechnologyEfficiency {
  label: string;
  value: string;
  hint?: string;
}

/** Vollständiger Eintrag in der Technologie-Bibliothek */
export interface TechnologyLibraryEntry {
  id: string;
  name: string;
  /** Kurze Erklärung in 1–2 Sätzen */
  shortDescription: string;
  category: TechnologyCategory;
  categoryLabel: string;
  icon: LucideIcon;
  accent: string;
  advantages: string[];
  disadvantages: string[];
  costs: TechnologyCosts;
  efficiency: TechnologyEfficiency;
  /** Wann besonders sinnvoll */
  bestFor: string[];
  /** Typische Anwendungsfälle */
  useCases: string[];
  /** Im Konfigurator direkt wählbar */
  configurableInWizard: boolean;
  /** Zuordnung zu Wizard-Feldern (falls konfigurierbar) */
  wizardMapping?: Partial<TechnologySelection>;
}
