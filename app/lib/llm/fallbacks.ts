import { formatScenarioTechLabels } from "@/app/lib/scenarios";
import type { AdvisorContext, AdvisorTextSlot } from "@/app/types/advisor-text";

const BUILDING_LABELS: Record<
  AdvisorContext["project"]["buildingType"],
  string
> = {
  einfamilienhaus: "Einfamilienhaus",
  mehrfamilienhaus: "Mehrfamilienhaus",
  gewerbe: "Gewerbegebäude",
  öffentlich: "Öffentliches Gebäude",
};

export function getAdvisorFallbackText(
  slot: AdvisorTextSlot,
  ctx: AdvisorContext,
): string {
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
  const tech = formatScenarioTechLabels(project.technologies);
  const building = BUILDING_LABELS[project.buildingType];

  switch (slot) {
    case "co2-comparison":
      return `Heute verursacht Ihr ${building} etwa ${co2Before} Tonnen CO₂ pro Jahr. Mit ${tech} sinkt das auf rund ${co2After} Tonnen – das sind ${co2Saved} Tonnen weniger (${co2Pct} %), ein spürbarer Schritt für Klima und Wärmewende in Hamburg.`;

    case "personal-summary":
      return `Ihr Konzept mit ${tech} passt gut zu einem ${building} in ${project.postalCode}: Sie senken laufende Energiekosten und werden unabhängiger vom Netz (Autarkie ca. ${result.annual.autarkyPercent} %). Damit haben Sie eine solide Basis für die Entscheidung – ob Sanierung, Vermietung oder Verkauf.`;

    case "next-steps":
      return [
        "1. Vor-Ort-Termin: Dach, Heizungsraum und Anschlussleistung vor Ort prüfen lassen.",
        "2. Förderung sichern: BAFA/KfW-Anträge rechtzeitig vor Baubeginn stellen.",
        "3. Varianten vergleichen: Szenario-Vergleich nutzen und Umsetzungsphase festlegen.",
        "4. Beratung anfragen: Verbindliches Angebot für Ihr Objekt einholen.",
      ].join("\n");

    case "technology-explanation":
      return ctx.technologyName
        ? `${ctx.technologyName} passt zu Ihrem Projekt, weil Sie ${tech} planen und Ihre Prioritäten (Kosten ${project.priorities.cost} %, CO₂ ${project.priorities.co2} %, Autarkie ${project.priorities.autarky} %) berücksichtigt werden.`
        : `Der gewählte Technologie-Mix (${tech}) adressiert Ihre Ziele bei vertretbarer Investition von ${result.investment.net.toLocaleString("de-DE")} € netto.`;

    case "report-executive-summary":
      return `Für ${project.name || "das Objekt"} in ${project.postalCode} wurde ein dezentrales Energiekonzept mit ${tech} erstellt. Die Investition beträgt netto ${result.investment.net.toLocaleString("de-DE")} € bei einer erwarteten Amortisation von ${result.economics.paybackYears} Jahren. CO₂-Emissionen sinken um ${co2Saved} t/a, die Autarkie liegt bei ${result.annual.autarkyPercent} %. Das Konzept eignet sich als Entscheidungsgrundlage für die weitere Planung.`;

    default:
      return "";
  }
}
