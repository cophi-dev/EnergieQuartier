import {
  normalizePriorities,
  wizardFormSchema,
  WIZARD_STEP_FIELDS,
} from "@/app/lib/wizard-schema";

describe("wizardFormSchema", () => {
  const valid = {
    name: "Test Projekt",
    address: "Musterweg 1",
    postalCode: "20095",
    buildingType: "einfamilienhaus" as const,
    livingArea: 120,
    usableArea: 0,
    yearBuilt: 1990,
    renovationStatus: "teilweise" as const,
    electricityKwh: 3500,
    heatKwh: 15000,
    priorities: { cost: 50, co2: 30, autarky: 20 },
    technologies: {
      pv: true,
      heatPumpAir: false,
      heatPumpGround: false,
      battery: false,
      solarThermal: false,
    },
    budget: 50000,
    targetPaybackYears: 12,
    notes: "",
  };

  it("akzeptiert gültige Wizard-Daten", () => {
    expect(wizardFormSchema.safeParse(valid).success).toBe(true);
  });

  it("lehnt ungültige PLZ ab", () => {
    const parsed = wizardFormSchema.safeParse({
      ...valid,
      postalCode: "2009",
    });
    expect(parsed.success).toBe(false);
  });

  it("verlangt mindestens eine Technologie", () => {
    const parsed = wizardFormSchema.safeParse({
      ...valid,
      technologies: {
        pv: false,
        heatPumpAir: false,
        heatPumpGround: false,
        battery: false,
        solarThermal: false,
      },
    });
    expect(parsed.success).toBe(false);
  });

  it("definiert Felder für alle 5 Schritte", () => {
    expect(Object.keys(WIZARD_STEP_FIELDS)).toHaveLength(5);
  });
});

describe("normalizePriorities", () => {
  it("normalisiert Prioritäten auf 100 %", () => {
    const result = normalizePriorities({ cost: 50, co2: 30, autarky: 20 });
    expect(result.cost + result.co2 + result.autarky).toBe(100);
  });

  it("verteilt gleich bei Summe 0", () => {
    const result = normalizePriorities({ cost: 0, co2: 0, autarky: 0 });
    expect(result.cost + result.co2 + result.autarky).toBe(100);
  });
});
