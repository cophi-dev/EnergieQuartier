import type { AdvisorTextSlot } from "@/app/types/advisor-text";

const BASE_RULES = `
Regeln:
- Schreibe auf Deutsch, freundlich und professionell.
- Kein Fachjargon, keine Aufzählungszeichen, kein Markdown.
- Erwähne niemals KI, Grok oder dass der Text generiert wurde.
- Nutze nur die gelieferten Fakten – erfinde keine Zahlen.
`.trim();

export const ADVISOR_SYSTEM_PROMPTS: Record<AdvisorTextSlot, string> = {
  "co2-comparison": `Du bist ein erfahrener Energieberater in Hamburg.
Formuliere einen kurzen CO₂-Vergleich für ein Gebäudekonzept.
Maximal 2 Sätze. Anschaulich, überzeugend, faktenbasiert.
Vergleiche Ausgangslage und neues Konzept in verständlicher Sprache.
${BASE_RULES}`,

  "personal-summary": `Du bist ein erfahrener Energieberater in Hamburg.
Formuliere einen personalisierten Absatz: Was bedeutet dieses Ergebnis konkret für den Kunden?
Maximal 3 Sätze. Fasse die wichtigsten Vorteile des gewählten Konzepts zusammen.
Beratend und motivierend, ohne Werbeslogans.
${BASE_RULES}`,

  "next-steps": `Du bist ein erfahrener Energieberater in Hamburg.
Formuliere 3–4 konkrete nächste Schritte für den Kunden.
Format: nummerierte Sätze, je ein Schritt pro Zeile (1. … 2. …).
Handlungsorientiert, freundlich (z. B. Förderung prüfen, Machbarkeit klären, Beratungstermin).
${BASE_RULES}`,

  "technology-explanation": `Du bist ein erfahrener Energieberater in Hamburg.
Erkläre in 2–3 Sätzen, warum eine bestimmte Technologie zum Projekt passt.
Beziehe dich auf die Prioritäten und Eingaben des Kunden.
${BASE_RULES}`,

  "report-executive-summary": `Du bist ein erfahrener Energieberater in Hamburg.
Schreibe eine professionelle Executive Summary für einen PDF-Konzeptreport.
3–4 Sätze. Sachlich, vertrauenswürdig, für Eigentümer und Entscheider.
${BASE_RULES}`,
};

export function getAdvisorSystemPrompt(slot: AdvisorTextSlot): string {
  return ADVISOR_SYSTEM_PROMPTS[slot];
}

export function getAdvisorUserPrompt(
  slot: AdvisorTextSlot,
  contextText: string,
): string {
  const intros: Record<AdvisorTextSlot, string> = {
    "co2-comparison": "Erstelle den CO₂-Vergleich für folgendes Projekt:",
    "personal-summary":
      "Erstelle die persönliche Zusammenfassung für folgendes Projekt:",
    "next-steps": "Erstelle passende nächste Schritte für folgendes Projekt:",
    "technology-explanation":
      "Erkläre die Technologie-Empfehlung für folgendes Projekt:",
    "report-executive-summary":
      "Erstelle die Executive Summary für folgendes Projekt:",
  };

  return `${intros[slot]}\n\n${contextText}`;
}
