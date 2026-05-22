import { formatScenarioTechLabels } from "@/app/lib/scenarios";
import type { AdvisorContext } from "@/app/types/advisor-text";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

const BUILDING_LABELS: Record<ProjectData["buildingType"], string> = {
  einfamilienhaus: "Einfamilienhaus",
  mehrfamilienhaus: "Mehrfamilienhaus",
  gewerbe: "Gewerbegebäude",
  öffentlich: "Öffentliches Gebäude",
};

export function buildAdvisorContext(
  project: ProjectData,
  result: CalculationResult,
  extras?: Pick<AdvisorContext, "technologyId" | "technologyName">,
): AdvisorContext {
  return {
    project: {
      id: project.id,
      name: project.name,
      postalCode: project.postalCode,
      buildingType: project.buildingType,
      livingArea: project.livingArea,
      priorities: project.priorities,
      technologies: project.technologies,
      targetPaybackYears: project.targetPaybackYears,
      updatedAt: project.updatedAt,
    },
    result: {
      annual: result.annual,
      environment: result.environment,
      economics: result.economics,
      investment: result.investment,
      sizing: result.sizing,
    },
    ...extras,
  };
}

/** Menschenlesbare Kontext-Zusammenfassung für LLM-User-Prompts */
export function formatAdvisorContextForPrompt(ctx: AdvisorContext): string {
  const { project, result } = ctx;
  const co2Before = (result.environment.co2BaselineKg / 1000).toFixed(1);
  const co2After = (result.environment.co2AfterKg / 1000).toFixed(1);
  const co2Saved = (result.environment.co2SavingsKg / 1000).toFixed(1);
  const co2Pct =
    result.environment.co2BaselineKg > 0
      ? Math.round(
          (result.environment.co2SavingsKg / result.environment.co2BaselineKg) *
            100,
        )
      : 0;

  return [
    `Projekt: ${project.name || "Unbenannt"}`,
    `Standort: PLZ ${project.postalCode}, ${BUILDING_LABELS[project.buildingType]}, ${project.livingArea} m²`,
    `Technologie-Mix: ${formatScenarioTechLabels(project.technologies)}`,
    `Prioritäten (Kosten/CO₂/Autarkie): ${project.priorities.cost}/${project.priorities.co2}/${project.priorities.autarky}`,
    `Autarkie: ${result.annual.autarkyPercent} %`,
    `CO₂ vorher: ${co2Before} t/a · nachher: ${co2After} t/a · Einsparung: ${co2Saved} t/a (${co2Pct} %)`,
    `Investition netto: ${result.investment.net.toLocaleString("de-DE")} €`,
    `Jährliche Einsparung: ${result.economics.annualSavingsEur.toLocaleString("de-DE")} €`,
    `Amortisation: ${result.economics.paybackYears} Jahre (Ziel: ${project.targetPaybackYears})`,
    result.sizing.pvKwp > 0
      ? `PV: ${result.sizing.pvKwp} kWp, Ertrag ca. ${result.annual.pvGenerationKwh.toLocaleString("de-DE")} kWh/a`
      : null,
    ctx.technologyName ? `Technologie-Fokus: ${ctx.technologyName}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
