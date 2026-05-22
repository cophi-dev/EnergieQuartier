import { parseNextStepsText } from "@/app/lib/llm/parse-next-steps";

describe("parseNextStepsText", () => {
  it("parst nummerierte Zeilen", () => {
    const steps = parseNextStepsText(
      "1. Förderung prüfen: BAFA-Antrag vor Baubeginn stellen.\n2. Vor-Ort-Termin: Dach und Heizungsraum begutachten.",
    );
    expect(steps).toHaveLength(2);
    expect(steps[0].title).toBe("Förderung prüfen");
    expect(steps[0].description).toContain("BAFA");
  });

  it("parst Fallback-Format ohne Doppelpunkt", () => {
    const steps = parseNextStepsText(
      "1. Lassen Sie Dach und Heizungsraum prüfen.\n2. Stellen Sie Förderanträge rechtzeitig.",
    );
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].description.length).toBeGreaterThan(10);
  });
});
