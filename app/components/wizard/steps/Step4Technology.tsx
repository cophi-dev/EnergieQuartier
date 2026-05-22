"use client";

import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  Battery,
  Droplets,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WizardFormValues } from "@/app/lib/wizard-schema";
import { cn } from "@/lib/utils";

const TECH_OPTIONS = [
  {
    key: "pv" as const,
    label: "Photovoltaik",
    description: "Stromerzeugung auf dem Dach, Hamburg ~1.050 kWh/kWp",
    icon: Sun,
    subsidy: "20 % KfW/EEG (vereinfacht)",
  },
  {
    key: "heatPumpAir" as const,
    label: "Luft-Wärmepumpe",
    description: "JAZ ~3,8 – günstigere Installation",
    icon: Wind,
    subsidy: "30 % BAFA 2026 (vereinfacht)",
  },
  {
    key: "heatPumpGround" as const,
    label: "Sole-Wärmepumpe",
    description: "JAZ ~4,5 inkl. Erdsonden",
    icon: Thermometer,
    subsidy: "30 % BAFA + höhere Investition",
  },
  {
    key: "battery" as const,
    label: "Batteriespeicher",
    description: "Eigenverbrauchsoptimierung, 70 % Wirkungsgrad",
    icon: Battery,
    subsidy: "Optional mit Speicherpilot",
  },
  {
    key: "solarThermal" as const,
    label: "Solarthermie",
    description: "Warmwasser / Heizungsunterstützung",
    icon: Droplets,
    subsidy: "Förderfähig nach BEG",
  },
];

interface StepProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
  setValue: UseFormSetValue<WizardFormValues>;
}

export function Step4Technology({ control, errors, setValue }: StepProps) {
  const techError = errors.technologies?.message ?? errors.technologies?.root?.message;

  const handleHeatPumpToggle = (
    key: "heatPumpAir" | "heatPumpGround",
    pressed: boolean,
  ) => {
    setValue(`technologies.${key}`, pressed, { shouldValidate: true });
    if (pressed) {
      const other = key === "heatPumpAir" ? "heatPumpGround" : "heatPumpAir";
      setValue(`technologies.${other}`, false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#0A4D68] dark:text-white">
          Technologie-Auswahl
        </h2>
        <p className="mt-1 text-sm text-[#0A4D68]/60 dark:text-white/60">
          Kombinieren Sie Komponenten für das Erstkonzept (Luft- und Sole-WP
          schließen sich aus).
        </p>
      </div>

      {techError && (
        <p className="text-sm text-destructive font-medium">{techError}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {TECH_OPTIONS.map((tech) => (
          <Controller
            key={tech.key}
            name={`technologies.${tech.key}`}
            control={control}
            render={({ field }) => {
              const isHeatPump =
                tech.key === "heatPumpAir" || tech.key === "heatPumpGround";
              return (
                <Card
                  className={cn(
                    "border-[#0A4D68]/10 transition-all cursor-pointer",
                    field.value &&
                      "border-[#088395] ring-2 ring-[#00FFCA]/30 shadow-md",
                  )}
                  onClick={() => {
                    const next = !field.value;
                    if (isHeatPump) {
                      handleHeatPumpToggle(tech.key, next);
                    } else {
                      field.onChange(next);
                    }
                  }}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          field.value
                            ? "bg-[#0A4D68] text-[#00FFCA]"
                            : "bg-[#F5F8FA] text-[#088395]",
                        )}
                      >
                        <tech.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-[#0A4D68] dark:text-white">
                          {tech.label}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {tech.subsidy}
                        </CardDescription>
                      </div>
                    </div>
                    <Toggle
                      pressed={field.value}
                      onPressedChange={(pressed) => {
                        if (isHeatPump) {
                          handleHeatPumpToggle(tech.key, pressed);
                        } else {
                          field.onChange(pressed);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      variant="outline"
                      className={cn(
                        field.value &&
                          "bg-[#088395] text-white border-[#088395]",
                      )}
                      aria-label={`${tech.label} aktivieren`}
                    />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#0A4D68]/70 dark:text-white/70">
                      {tech.description}
                    </p>
                  </CardContent>
                </Card>
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
