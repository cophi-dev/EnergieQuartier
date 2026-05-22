import { z } from "zod";
import { generateAdvisorText } from "@/app/lib/llm/client";
import type {
  AdvisorContext,
  AdvisorTextRequest,
  AdvisorTextResponse,
} from "@/app/types/advisor-text";

const advisorContextSchema = z.object({
  project: z.object({
    id: z.string(),
    name: z.string(),
    postalCode: z.string(),
    buildingType: z.enum([
      "einfamilienhaus",
      "mehrfamilienhaus",
      "gewerbe",
      "öffentlich",
    ]),
    livingArea: z.number(),
    priorities: z.object({
      cost: z.number(),
      co2: z.number(),
      autarky: z.number(),
    }),
    technologies: z.object({
      pv: z.boolean(),
      heatPumpAir: z.boolean(),
      heatPumpGround: z.boolean(),
      battery: z.boolean(),
      solarThermal: z.boolean(),
    }),
    targetPaybackYears: z.number(),
    updatedAt: z.string(),
  }),
  result: z.object({
    annual: z.object({
      pvGenerationKwh: z.number(),
      selfConsumptionKwh: z.number(),
      gridExportKwh: z.number(),
      gridImportKwh: z.number(),
      heatPumpElectricityKwh: z.number(),
      solarThermalKwh: z.number(),
      autarkyPercent: z.number(),
    }),
    environment: z.object({
      co2BaselineKg: z.number(),
      co2AfterKg: z.number(),
      co2SavingsKg: z.number(),
    }),
    economics: z.object({
      baselineCostEur: z.number(),
      annualSavingsEur: z.number(),
      paybackYears: z.number(),
      npvEur: z.number(),
      roiPercent: z.number(),
    }),
    investment: z.object({
      gross: z.number(),
      subsidies: z.number(),
      net: z.number(),
      byComponent: z.record(z.string(), z.number()),
    }),
    sizing: z.object({
      pvKwp: z.number(),
      batteryKwh: z.number(),
      heatPumpKw: z.number(),
      solarThermalM2: z.number(),
    }),
  }),
  technologyId: z.string().optional(),
  technologyName: z.string().optional(),
});

const requestSchema = z.object({
  slot: z.enum([
    "co2-comparison",
    "personal-summary",
    "next-steps",
    "technology-explanation",
    "report-executive-summary",
  ]),
  cacheKey: z.string().min(8),
  context: advisorContextSchema,
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as AdvisorTextRequest;
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Ungültige Anfrage", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slot, context, cacheKey } = parsed.data;
    const { text, source } = await generateAdvisorText(
      slot,
      context as AdvisorContext,
    );

    const response: AdvisorTextResponse = {
      text,
      source,
      slot,
      cacheKey,
      generatedAt: new Date().toISOString(),
    };

    return Response.json(response);
  } catch {
    return Response.json({ error: "Beratungstext konnte nicht erstellt werden" }, {
      status: 500,
    });
  }
}
