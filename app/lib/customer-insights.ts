import { formatScenarioTechLabels } from "@/app/lib/scenarios";
import { pickCo2AnalogySentence } from "@/app/lib/co2-analogies";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

const BUILDING_LABELS: Record<ProjectData["buildingType"], string> = {
  einfamilienhaus: "Einfamilienhaus",
  mehrfamilienhaus: "Mehrfamilienhaus",
  gewerbe: "Gewerbegebäude",
  öffentlich: "Öffentliches Gebäude",
};

export interface CustomerInsights {
  solutionHeadline: string;
  /** Einzeiler für Hero-Bereich (statt langer Absätze oben) */
  solutionTagline: string;
  solutionParagraphs: string[];
  costHeadline: string;
  costParagraphs: string[];
  costHighlights: { label: string; value: string; hint?: string }[];
  co2Headline: string;
  co2Paragraphs: string[];
  co2Highlights: { label: string; value: string }[];
  nextSteps: { title: string; description: string }[];
}

function techSummary(project: ProjectData): string {
  return formatScenarioTechLabels(project.technologies);
}

function paybackAssessment(
  payback: number,
  target: number,
): { tone: "good" | "ok" | "long"; text: string } {
  if (payback <= target) {
    return {
      tone: "good",
      text: `Die Investition rechnet sich voraussichtlich in ${payback.toFixed(1)} Jahren – innerhalb Ihres Ziels von ${target} Jahren.`,
    };
  }
  if (payback < target * 1.5) {
    return {
      tone: "ok",
      text: `Mit ${payback.toFixed(1)} Jahren Amortisation liegt das Konzept etwas über Ihrem Wunsch (${target} J.), bringt aber langfristig spürbare Einsparungen.`,
    };
  }
  return {
    tone: "long",
    text: `Die Amortisation dauert etwa ${payback.toFixed(1)} Jahre – prüfen Sie Förderungen, Dimensionierung oder eine schrittweise Umsetzung.`,
  };
}

export function buildCustomerInsights(
  project: ProjectData,
  result: CalculationResult,
): CustomerInsights {
  const tech = techSummary(project);
  const payback = paybackAssessment(
    result.economics.paybackYears,
    project.targetPaybackYears,
  );
  const co2Before = (result.environment.co2BaselineKg / 1000).toFixed(1);
  const co2After = (result.environment.co2AfterKg / 1000).toFixed(1);
  const co2Saved = (result.environment.co2SavingsKg / 1000).toFixed(1);
  const co2ReductionPct =
    result.environment.co2BaselineKg > 0
      ? Math.round(
          (result.environment.co2SavingsKg / result.environment.co2BaselineKg) *
            100,
        )
      : 0;

  const solutionParagraphs = [
    `Für Ihr Objekt in ${project.postalCode} (${BUILDING_LABELS[project.buildingType]}, ${project.livingArea} m²) empfehlen wir: ${tech}.`,
    `Damit decken Sie einen Teil Ihres Energiebedarfs selbst – der Autarkiegrad liegt bei etwa ${result.annual.autarkyPercent} %.`,
    payback.text,
  ];

  if (result.sizing.pvKwp > 0) {
    solutionParagraphs.push(
      `Auf dem Dach sind rund ${result.sizing.pvKwp} kWp Photovoltaik vorgesehen – das entspricht etwa ${result.annual.pvGenerationKwh.toLocaleString("de-DE")} kWh Solarstrom pro Jahr.`,
    );
  }

  const monthlyEnergyBefore = Math.round(result.economics.baselineCostEur / 12);
  const monthlyEnergyAfter = Math.round(
    (result.economics.baselineCostEur - result.economics.annualSavingsEur) / 12,
  );

  const solutionTagline = `${tech} · ${result.annual.autarkyPercent} % Autarkie · ${result.economics.paybackYears.toFixed(1)} J. Amortisation · ${result.investment.net.toLocaleString("de-DE")} € netto`;

  return {
    solutionHeadline: "Ihre empfohlene Lösung – einfach erklärt",
    solutionTagline,
    solutionParagraphs,
    costHeadline: "Was kostet Sie das wirklich?",
    costParagraphs: [
      `Einmalig investieren Sie netto etwa ${result.investment.net.toLocaleString("de-DE")} € (nach Förderung). Davon übernehmen Förderprogramme rund ${result.investment.subsidies.toLocaleString("de-DE")} €.`,
      `Im laufenden Betrieb sparen Sie voraussichtlich ${result.economics.annualSavingsEur.toLocaleString("de-DE")} € pro Jahr gegenüber dem heutigen Energie-Mix – das sind rund ${monthlyEnergyBefore.toLocaleString("de-DE")} € auf ${monthlyEnergyAfter.toLocaleString("de-DE")} € im Monat.`,
      `Über 20 Jahre ergibt sich ein Kapitalwert (NPV) von ${result.economics.npvEur.toLocaleString("de-DE")} € – ein Indikator, ob sich das Konzept langfristig rechnet.`,
    ],
    costHighlights: [
      {
        label: "Investition (netto)",
        value: `${result.investment.net.toLocaleString("de-DE")} €`,
        hint: `brutto ${result.investment.gross.toLocaleString("de-DE")} €`,
      },
      {
        label: "Jährliche Einsparung",
        value: `${result.economics.annualSavingsEur.toLocaleString("de-DE")} €/a`,
      },
      {
        label: "Amortisation",
        value: `${result.economics.paybackYears.toFixed(1)} Jahre`,
        hint: `Ziel: ${project.targetPaybackYears} J.`,
      },
    ],
    co2Headline: "Wie viel CO₂ sparen Sie?",
    co2Paragraphs: [
      `Heute verursacht Ihr Gebäude etwa ${co2Before} Tonnen CO₂ pro Jahr durch Strom- und Wärmeverbrauch.`,
      `Mit dem gewählten Konzept sinkt das auf rund ${co2After} Tonnen – Sie sparen ${co2Saved} Tonnen CO₂ jährlich (ca. ${co2ReductionPct} % weniger).`,
      pickCo2AnalogySentence(result.environment.co2SavingsKg),
    ],
    co2Highlights: [
      { label: "Vorher", value: `${co2Before} t/a` },
      { label: "Nachher", value: `${co2After} t/a` },
      { label: "Einsparung", value: `${co2Saved} t/a` },
    ],
    nextSteps: [
      {
        title: "Technische Vorprüfung",
        description:
          "Dachfläche, Heizungsraum und Anschlussleistung vor Ort prüfen – ideal mit Energieberater oder Haustechniker.",
      },
      {
        title: "Förderung sichern",
        description:
          "BAFA/KfW-Anträge vor Baubeginn stellen. Förderquoten 2026 sind in der Berechnung bereits berücksichtigt.",
      },
      {
        title: "Varianten vergleichen",
        description:
          "Nutzen Sie den Szenario-Vergleich unten, um z. B. „nur Wärmepumpe“ vs. „Komplett-Paket“ gegenüberzustellen.",
      },
      {
        title: "Konzept verfeinern",
        description:
          "Passen Sie Annahmen im Konfigurator an oder laden Sie das Demo-Projekt als Referenz.",
      },
    ],
  };
}
