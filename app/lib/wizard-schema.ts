import { z } from "zod";

const buildingType = z.enum([
  "einfamilienhaus",
  "mehrfamilienhaus",
  "gewerbe",
  "öffentlich",
]);

const renovationStatus = z.enum([
  "unsaniert",
  "teilweise",
  "vollständig",
  "neubau",
]);

const technologiesSchema = z
  .object({
    pv: z.boolean(),
    heatPumpAir: z.boolean(),
    heatPumpGround: z.boolean(),
    battery: z.boolean(),
    solarThermal: z.boolean(),
  })
  .refine((t) => Object.values(t).some(Boolean), {
    message: "Mindestens eine Technologie auswählen",
  });

export const wizardFormSchema = z.object({
  name: z.string().min(2, "Projektname erforderlich (min. 2 Zeichen)"),
  address: z.string().min(3, "Adresse erforderlich"),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Gültige deutsche PLZ (5 Ziffern)"),
  buildingType,
  livingArea: z.number().min(20, "Mindestens 20 m²"),
  usableArea: z.number().min(0),
  yearBuilt: z
    .number()
    .min(1800, "Baujahr unrealistisch")
    .max(new Date().getFullYear() + 2),
  renovationStatus,
  electricityKwh: z.number().min(500, "Mindestens 500 kWh/a"),
  heatKwh: z.number().min(1000, "Mindestens 1.000 kWh/a"),
  priorities: z.object({
    cost: z.number().min(0).max(100),
    co2: z.number().min(0).max(100),
    autarky: z.number().min(0).max(100),
  }),
  technologies: technologiesSchema,
  budget: z.number().min(1000, "Budget mindestens 1.000 €"),
  targetPaybackYears: z
    .number()
    .min(3, "Mindestens 3 Jahre")
    .max(30, "Maximal 30 Jahre"),
  notes: z.string().max(2000),
});

export type WizardFormValues = z.infer<typeof wizardFormSchema>;

/** Felder pro Wizard-Schritt für partielle Validierung */
export const WIZARD_STEP_FIELDS: Record<
  number,
  (keyof WizardFormValues)[]
> = {
  1: [
    "name",
    "address",
    "postalCode",
    "buildingType",
    "livingArea",
    "usableArea",
    "yearBuilt",
    "renovationStatus",
  ],
  2: ["electricityKwh", "heatKwh"],
  3: ["priorities"],
  4: ["technologies"],
  5: ["budget", "targetPaybackYears", "notes"],
};

export function normalizePriorities(
  priorities: WizardFormValues["priorities"],
): WizardFormValues["priorities"] {
  const sum = priorities.cost + priorities.co2 + priorities.autarky;
  if (sum === 0) return { cost: 34, co2: 33, autarky: 33 };
  return {
    cost: Math.round((priorities.cost / sum) * 100),
    co2: Math.round((priorities.co2 / sum) * 100),
    autarky: Math.round((priorities.autarky / sum) * 100),
  };
}
