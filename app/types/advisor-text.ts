import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

/** Strategische Text-Slots für Beratungstexte */
export type AdvisorTextSlot =
  | "co2-comparison"
  | "personal-summary"
  | "next-steps"
  | "technology-explanation"
  | "report-executive-summary";

export interface AdvisorContext {
  project: Pick<
    ProjectData,
    | "id"
    | "name"
    | "postalCode"
    | "buildingType"
    | "livingArea"
    | "priorities"
    | "technologies"
    | "targetPaybackYears"
    | "updatedAt"
  >;
  result: Pick<
    CalculationResult,
    | "annual"
    | "environment"
    | "economics"
    | "investment"
    | "sizing"
  >;
  /** Optional: Technologie-ID für Technologie-Erklärungen */
  technologyId?: string;
  technologyName?: string;
}

export interface AdvisorTextRequest {
  slot: AdvisorTextSlot;
  cacheKey: string;
  context: AdvisorContext;
  forceRefresh?: boolean;
}

export interface AdvisorTextResponse {
  text: string;
  source: "llm" | "fallback" | "cache";
  slot: AdvisorTextSlot;
  cacheKey: string;
  generatedAt: string;
}

export interface CachedAdvisorText {
  slot: AdvisorTextSlot;
  cacheKey: string;
  text: string;
  source: "llm" | "fallback";
  createdAt: string;
}
