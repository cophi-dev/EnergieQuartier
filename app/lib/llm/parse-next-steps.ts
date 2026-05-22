export interface ParsedNextStep {
  title: string;
  description: string;
}

/** Nummerierte LLM-/Fallback-Zeilen in Schritt-Karten umwandeln */
export function parseNextStepsText(text: string): ParsedNextStep[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const numbered = line.replace(/^\d+\.\s*/, "");
    const colonSplit = numbered.split(/:\s+/);
    if (colonSplit.length >= 2 && colonSplit[0].length <= 40) {
      return {
        title: colonSplit[0].trim(),
        description: colonSplit.slice(1).join(": ").trim(),
      };
    }

    const dashSplit = numbered.split(/\s+[–—]\s+/);
    if (dashSplit.length >= 2 && dashSplit[0].length <= 45) {
      return {
        title: dashSplit[0].trim(),
        description: dashSplit.slice(1).join(" – ").trim(),
      };
    }

    const words = numbered.split(/\s+/);
    const title =
      words.length > 6
        ? `${words.slice(0, 4).join(" ")}…`
        : `Schritt ${index + 1}`;

    return {
      title,
      description: numbered,
    };
  });
}
