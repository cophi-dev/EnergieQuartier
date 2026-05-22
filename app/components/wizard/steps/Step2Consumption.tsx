"use client";

import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/app/components/wizard/FormField";
import { estimateConsumption } from "@/app/lib/consumption-estimate";
import type { WizardFormValues } from "@/app/lib/wizard-schema";

interface StepProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
  setValue: UseFormSetValue<WizardFormValues>;
}

export function Step2Consumption({ control, errors, setValue }: StepProps) {
  const building = useWatch({
    control,
    name: [
      "buildingType",
      "livingArea",
      "usableArea",
      "yearBuilt",
      "renovationStatus",
    ],
  });

  const handleEstimate = () => {
    const [buildingType, livingArea, usableArea, yearBuilt, renovationStatus] =
      building;
    const result = estimateConsumption({
      buildingType,
      livingArea,
      usableArea,
      yearBuilt,
      renovationStatus,
    });
    setValue("electricityKwh", result.electricityKwh, { shouldValidate: true });
    setValue("heatKwh", result.heatKwh, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
            Energieverbrauch
          </h2>
          <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
            Jahresverbräuche Strom und Wärme – Basis für Dimensionierung.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleEstimate}
          className="shrink-0 border-[#06B6D4] text-[#0F172A] hover:bg-[#06B6D4]/10"
        >
          <Calculator className="mr-2 h-4 w-4" />
          Verbrauch schätzen
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Stromverbrauch (kWh/a)"
          htmlFor="electricityKwh"
          error={errors.electricityKwh?.message}
          tooltip="Haushaltsstrom inkl. ggf. vorhandener elektrischer Heizung."
        >
          <Controller
            name="electricityKwh"
            control={control}
            render={({ field }) => (
              <Input
                id="electricityKwh"
                type="number"
                min={500}
                className="w-full border-[#0F172A]/20"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Wärmeverbrauch (kWh/a)"
          htmlFor="heatKwh"
          error={errors.heatKwh?.message}
          tooltip="Heizenergie (Gas/Öl/Fernwärme) – Umrechnung in kWh thermisch."
        >
          <Controller
            name="heatKwh"
            control={control}
            render={({ field }) => (
              <Input
                id="heatKwh"
                type="number"
                min={1000}
                className="w-full border-[#0F172A]/20"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            )}
          />
        </FormField>
      </div>

      <p className="rounded-lg bg-[#06B6D4]/10 px-4 py-3 text-sm text-[#0F172A]/80 dark:text-white/80">
        Die Schätzung nutzt Gebäudetyp, Fläche, Baujahr und Sanierungsstand –
        typische Werte für Hamburger Bestandsgebäude.
      </p>
    </div>
  );
}
