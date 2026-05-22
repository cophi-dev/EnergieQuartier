import type { CalculationResult } from "@/app/types/calculation";
import type { TechnologySelection } from "@/app/types/project";

export interface ProjectScenario {
  id: string;
  name: string;
  shortDescription: string;
  technologies: TechnologySelection;
  /** Entspricht exakt der aktuellen Projektkonfiguration */
  isCurrent: boolean;
  /** Empfohlenes Szenario laut Prioritäten */
  isRecommended: boolean;
}

export interface ScenarioWithResult extends ProjectScenario {
  result: CalculationResult;
}
