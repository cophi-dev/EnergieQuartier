import {
  TECHNOLOGY_LIBRARY,
  getTechnologyById,
  getTechnologiesByCategory,
  wizardMappingFromLibraryId,
} from "@/app/lib/technology-library";

describe("technology-library", () => {
  it("enthält alle 8 geforderten Technologien", () => {
    expect(TECHNOLOGY_LIBRARY).toHaveLength(8);
    const ids = TECHNOLOGY_LIBRARY.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "heat-pump-air",
        "heat-pump-ground",
        "deep-geothermal",
        "solar-thermal",
        "pv-battery",
        "waste-heat",
        "heat-storage",
        "district-heating",
      ]),
    );
  });

  it("liefert vollständige Metadaten pro Technologie", () => {
    for (const tech of TECHNOLOGY_LIBRARY) {
      expect(tech.shortDescription.length).toBeGreaterThan(20);
      expect(tech.advantages.length).toBeGreaterThanOrEqual(3);
      expect(tech.disadvantages.length).toBeGreaterThanOrEqual(3);
      expect(tech.costs.investment).toBeTruthy();
      expect(tech.costs.operating).toBeTruthy();
      expect(tech.efficiency.value).toBeTruthy();
      expect(tech.bestFor.length).toBeGreaterThanOrEqual(2);
      expect(tech.useCases.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("filtert nach Kategorie", () => {
    const waerme = getTechnologiesByCategory("waerme");
    expect(waerme.length).toBeGreaterThanOrEqual(4);
    expect(waerme.every((t) => t.category === "waerme")).toBe(true);
  });

  it("mappt konfigurierbare Technologien auf Wizard-Felder", () => {
    expect(wizardMappingFromLibraryId("heat-pump-air")).toEqual({
      heatPumpAir: true,
    });
    expect(wizardMappingFromLibraryId("pv-battery")).toEqual({
      pv: true,
      battery: true,
    });
    expect(wizardMappingFromLibraryId("deep-geothermal")).toBeNull();
  });

  it("findet Technologie per ID", () => {
    expect(getTechnologyById("district-heating")?.name).toBe(
      "Kleines Nahwärmenetz",
    );
  });
});
