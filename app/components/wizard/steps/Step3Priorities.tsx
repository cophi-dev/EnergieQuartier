"use client";

import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import { FormField } from "@/app/components/wizard/FormField";
import type { WizardFormValues } from "@/app/lib/wizard-schema";

interface StepProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
  normalizedPreview: WizardFormValues["priorities"];
}

const PRIORITY_CONFIG = [
  {
    key: "cost" as const,
    label: "Kosten minimieren",
    description: "Fokus auf niedrige Investition und kurze Amortisation",
    color: "bg-[#0F172A]",
  },
  {
    key: "co2" as const,
    label: "CO₂ minimieren",
    description: "Maximale Treibhausgas-Einsparung im System",
    color: "bg-[#06B6D4]",
  },
  {
    key: "autarky" as const,
    label: "Autarkie maximieren",
    description: "Hoher Eigenverbrauch und Unabhängigkeit vom Netz",
    color: "bg-[#22C55E]",
  },
];

export function Step3Priorities({
  control,
  errors,
  normalizedPreview,
}: StepProps) {
  const prioritiesError = errors.priorities?.message;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
          Ziele & Prioritäten
        </h2>
        <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
          Gewichtung für die automatische Technologie-Empfehlung (wird auf 100 %
          normalisiert).
        </p>
      </div>

      <div className="space-y-8">
        {PRIORITY_CONFIG.map((item) => (
          <FormField
            key={item.key}
            label={item.label}
            hint={item.description}
            error={
              prioritiesError && item.key === "cost"
                ? String(prioritiesError)
                : undefined
            }
          >
            <Controller
              name={`priorities.${item.key}`}
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[field.value]}
                    onValueChange={(v) =>
                      field.onChange(Array.isArray(v) ? (v[0] ?? 0) : v)
                    }
                    className="[&_[data-slot=slider-range]]:bg-[#06B6D4]"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F172A]/50">Niedrig</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#22C55E]">
                      {field.value} %
                    </span>
                    <span className="text-[#0F172A]/50">Hoch</span>
                  </div>
                </div>
              )}
            />
          </FormField>
        ))}
      </div>

      <div className="rounded-xl border border-[#0F172A]/10 bg-[#F8FAFC] p-4 dark:bg-[#0F172A]/40">
        <p className="text-xs font-medium text-[#06B6D4] mb-3">
          Normalisierte Gewichtung (Vorschau)
        </p>
        <div className="flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-[#0F172A] transition-all"
            style={{ width: `${normalizedPreview.cost}%` }}
            title={`Kosten ${normalizedPreview.cost}%`}
          />
          <div
            className="bg-[#06B6D4] transition-all"
            style={{ width: `${normalizedPreview.co2}%` }}
            title={`CO₂ ${normalizedPreview.co2}%`}
          />
          <div
            className="bg-[#22C55E] transition-all"
            style={{ width: `${normalizedPreview.autarky}%` }}
            title={`Autarkie ${normalizedPreview.autarky}%`}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#0F172A]/70 dark:text-white/70">
          <span>Kosten {normalizedPreview.cost}%</span>
          <span>CO₂ {normalizedPreview.co2}%</span>
          <span>Autarkie {normalizedPreview.autarky}%</span>
        </div>
      </div>
    </div>
  );
}
