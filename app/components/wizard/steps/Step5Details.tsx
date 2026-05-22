"use client";

import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FormField } from "@/app/components/wizard/FormField";
import type { WizardFormValues } from "@/app/lib/wizard-schema";

interface StepProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
}

export function Step5Details({ control, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
          Zusatzinfos
        </h2>
        <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
          Rahmenbedingungen für Wirtschaftlichkeit und Kundengespräch.
        </p>
      </div>

      <FormField
        label="Budget (€)"
        htmlFor="budget"
        error={errors.budget?.message}
        tooltip="Maximale Investitionsbereitschaft des Kunden – für Technologie-Filter."
      >
        <Controller
          name="budget"
          control={control}
          render={({ field }) => (
            <Input
              id="budget"
              type="number"
              min={1000}
              step={1000}
              className="w-full max-w-xs border-[#0F172A]/20"
              {...field}
              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
            />
          )}
        />
      </FormField>

      <FormField
        label="Gewünschte Amortisationszeit (Jahre)"
        error={errors.targetPaybackYears?.message}
        tooltip="Zielwert für die Wirtschaftlichkeitsbewertung im Dashboard."
      >
        <Controller
          name="targetPaybackYears"
          control={control}
          render={({ field }) => (
            <div className="space-y-3 max-w-md">
              <Slider
                min={3}
                max={25}
                step={1}
                value={[field.value]}
                onValueChange={(v) =>
                  field.onChange(Array.isArray(v) ? (v[0] ?? 12) : v)
                }
              />
              <p className="text-sm font-semibold text-[#0F172A] dark:text-[#22C55E]">
                {field.value} Jahre
              </p>
            </div>
          )}
        />
      </FormField>

      <FormField
        label="Bemerkungen"
        htmlFor="notes"
        error={errors.notes?.message}
        hint="Optional – z. B. Denkmalschutz, Dachausrichtung, Kundenziele"
      >
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <textarea
              id="notes"
              rows={4}
              placeholder="Besonderheiten zum Objekt …"
              className="flex w-full rounded-lg border border-[#0F172A]/20 bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 resize-y min-h-[100px]"
              {...field}
            />
          )}
        />
      </FormField>
    </div>
  );
}
