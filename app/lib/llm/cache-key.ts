import type { AdvisorContext, AdvisorTextSlot } from "@/app/types/advisor-text";

function techFingerprint(ctx: AdvisorContext): string {
  const t = ctx.project.technologies;
  return [
    t.pv ? "pv" : "",
    t.heatPumpAir ? "hpa" : "",
    t.heatPumpGround ? "hpg" : "",
    t.battery ? "bat" : "",
    t.solarThermal ? "st" : "",
  ].join("");
}

/** Stabiler Cache-Key – ändert sich bei relevanten Projekt-/Ergebnis-Updates */
export function buildAdvisorCacheKey(
  slot: AdvisorTextSlot,
  ctx: AdvisorContext,
): string {
  const { project, result } = ctx;
  const base = [
    slot,
    project.id,
    project.updatedAt,
    project.postalCode,
    project.buildingType,
    project.livingArea,
    project.priorities.cost,
    project.priorities.co2,
    project.priorities.autarky,
    techFingerprint(ctx),
    result.environment.co2SavingsKg,
    result.economics.paybackYears,
    result.annual.autarkyPercent,
    result.investment.net,
  ];

  if (slot === "technology-explanation" && ctx.technologyId) {
    base.push(ctx.technologyId);
  }

  return base.join(":");
}
