import { calculateProject } from "@/app/lib/calculations";
import type { ScenarioWithResult, ProjectScenario } from "@/app/types/scenario";
import type { ProjectData, TechnologySelection } from "@/app/types/project";

const EMPTY_TECH: TechnologySelection = {
  pv: false,
  heatPumpAir: false,
  heatPumpGround: false,
  battery: false,
  solarThermal: false,
};

function heatPumpSelection(project: ProjectData): Partial<TechnologySelection> {
  if (project.technologies.heatPumpGround) return { heatPumpGround: true };
  if (project.technologies.heatPumpAir) return { heatPumpAir: true };
  return { heatPumpAir: true };
}

function techKey(tech: TechnologySelection): string {
  return [
    tech.pv ? "pv" : "",
    tech.heatPumpAir ? "hpa" : "",
    tech.heatPumpGround ? "hpg" : "",
    tech.battery ? "bat" : "",
    tech.solarThermal ? "st" : "",
  ].join("|");
}

function scenariosEqual(a: TechnologySelection, b: TechnologySelection): boolean {
  return techKey(a) === techKey(b);
}

function buildCandidateScenarios(project: ProjectData): ProjectScenario[] {
  const hp = heatPumpSelection(project);
  const current = { ...project.technologies };

  const minimal: TechnologySelection = { ...EMPTY_TECH, ...hp };
  const withPv: TechnologySelection = { ...minimal, pv: true };
  const withStorage: TechnologySelection = { ...withPv, battery: true };
  const complete: TechnologySelection = {
    ...withStorage,
    solarThermal: project.technologies.solarThermal,
  };

  const pvOnly: TechnologySelection = { ...EMPTY_TECH, pv: true };
  const pvBattery: TechnologySelection = { ...EMPTY_TECH, pv: true, battery: true };

  const hasHeat = minimal.heatPumpAir || minimal.heatPumpGround;

  const raw: Omit<ProjectScenario, "isCurrent" | "isRecommended">[] = hasHeat
    ? [
        {
          id: "heat-only",
          name: "Nur Wärmepumpe",
          shortDescription:
            "Fokus auf klimafreundliche Heizung – ohne Stromerzeugung auf dem Dach.",
          technologies: minimal,
        },
        {
          id: "heat-pv",
          name: "Wärmepumpe + PV",
          shortDescription:
            "Heizung umstellen und eigenen Solarstrom für WP und Haushalt nutzen.",
          technologies: withPv,
        },
        {
          id: "complete",
          name: "Komplett-Konzept",
          shortDescription:
            "Wärmepumpe, Photovoltaik, Speicher und ggf. Solarthermie kombiniert.",
          technologies: complete,
        },
      ]
    : [
        {
          id: "pv-only",
          name: "Nur Photovoltaik",
          shortDescription: "Stromkosten senken – der einfache Einstieg.",
          technologies: pvOnly,
        },
        {
          id: "pv-battery",
          name: "PV + Batteriespeicher",
          shortDescription: "Mehr Eigenverbrauch, weniger Netzbezug.",
          technologies: pvBattery,
        },
        {
          id: "heat-pv",
          name: "PV + Wärmepumpe",
          shortDescription:
            "Strom und Wärme gemeinsam denken – typischer Hamburg-Mix.",
          technologies: { ...withPv, ...hp },
        },
      ];

  const withFlags = raw.map((s) => ({
    ...s,
    isCurrent: scenariosEqual(s.technologies, current),
  }));

  if (!withFlags.some((s) => s.isCurrent)) {
    withFlags.push({
      id: "current",
      name: "Ihr Konzept",
      shortDescription: "Ihre aktuelle Auswahl im Konfigurator.",
      technologies: current,
      isCurrent: true,
    });
  }

  const unique = new Map<string, (typeof withFlags)[number]>();
  for (const s of withFlags) {
    const key = techKey(s.technologies);
    const existing = unique.get(key);
    if (!existing || s.isCurrent) {
      unique.set(key, s);
    }
  }

  let list = [...unique.values()];

  if (list.length > 3) {
    const currentScenario = list.find((s) => s.isCurrent);
    const others = list.filter((s) => !s.isCurrent);
    list = currentScenario
      ? [others[0], currentScenario, others[1] ?? others[0]].filter(Boolean)
      : list.slice(0, 3);
  }

  while (list.length < 3 && hasHeat) {
    const fallback = withFlags.find(
      (s) => !list.some((l) => techKey(l.technologies) === techKey(s.technologies)),
    );
    if (fallback) list.push(fallback);
    else break;
  }

  return list.slice(0, 3).map((s) => ({
    ...s,
    isCurrent: scenariosEqual(s.technologies, current),
    isRecommended: false,
  }));
}

/** Empfohlenes Szenario anhand Amortisation, CO₂ und Autarkie */
function pickRecommended(
  scenarios: ScenarioWithResult[],
  project: ProjectData,
): string {
  const { cost, co2, autarky } = project.priorities;
  let bestId = scenarios[0]?.id ?? "";
  let bestScore = -Infinity;

  for (const s of scenarios) {
    const payback = s.result.economics.paybackYears;
    const paybackScore =
      payback >= 99 ? 0 : Math.max(0, 100 - payback * 4);
    const co2Score = (s.result.environment.co2SavingsKg / 1000) * 10;
    const autarkyScore = s.result.annual.autarkyPercent;
    const score =
      (paybackScore * cost + co2Score * co2 + autarkyScore * autarky) / 100;
    if (score > bestScore) {
      bestScore = score;
      bestId = s.id;
    }
  }
  return bestId;
}

export function buildScenarioComparison(
  project: ProjectData,
): ScenarioWithResult[] {
  const candidates = buildCandidateScenarios(project);
  const withResults: ScenarioWithResult[] = candidates.map((scenario) => ({
    ...scenario,
    result: calculateProject({ ...project, technologies: scenario.technologies }),
  }));

  const recommendedId = pickRecommended(withResults, project);
  return withResults.map((s) => ({
    ...s,
    isRecommended: s.id === recommendedId,
  }));
}

export function formatScenarioTechLabels(tech: TechnologySelection): string {
  const labels = [
    tech.pv && "PV",
    tech.heatPumpAir && "Luft-WP",
    tech.heatPumpGround && "Sole-WP",
    tech.battery && "Speicher",
    tech.solarThermal && "Solarthermie",
  ].filter(Boolean);
  return labels.join(" · ") || "—";
}
