"use client";

import Link from "next/link";
import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import { ExternalLink } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getTechnologyById,
  WIZARD_FIELD_TO_LIBRARY,
} from "@/app/lib/technology-library";
import type { WizardFormValues } from "@/app/lib/wizard-schema";
import type { TechnologySelection } from "@/app/types/project";
import { cn } from "@/lib/utils";

/** Wizard-Optionen: PV und Speicher getrennt, Daten aus Bibliothek */
const WIZARD_TECH_OPTIONS: {
  key: keyof TechnologySelection;
  libraryId: string;
  label: string;
  subsidy?: string;
}[] = [
  {
    key: "pv",
    libraryId: "pv-battery",
    label: "Photovoltaik",
    subsidy: "20 % KfW/EEG (vereinfacht)",
  },
  {
    key: "heatPumpAir",
    libraryId: "heat-pump-air",
    label: "Luft-Wärmepumpe",
    subsidy: "30 % BAFA 2026 (vereinfacht)",
  },
  {
    key: "heatPumpGround",
    libraryId: "heat-pump-ground",
    label: "Sole-Wärmepumpe",
    subsidy: "30 % BAFA + höhere Investition",
  },
  {
    key: "battery",
    libraryId: "pv-battery",
    label: "Batteriespeicher",
    subsidy: "Optional mit Speicherpilot",
  },
  {
    key: "solarThermal",
    libraryId: "solar-thermal",
    label: "Solarthermie",
    subsidy: "Förderfähig nach BEG",
  },
];

interface StepProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
  setValue: UseFormSetValue<WizardFormValues>;
}

export function Step4Technology({ control, errors, setValue }: StepProps) {
  const techError =
    errors.technologies?.message ?? errors.technologies?.root?.message;

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
        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
          Welche Technologien passen zu Ihrem Projekt?
        </h2>
        <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
          Wählen Sie mindestens eine Option. Luft- und Sole-Wärmepumpe schließen
          sich gegenseitig aus – Sie entscheiden sich für eine Heizungsart.
        </p>
        <p className="mt-2 text-sm text-[#0F172A]/55 dark:text-white/55">
          <span className="font-medium text-[#06B6D4]">Warum fragen wir das?</span>{" "}
          Ihre Auswahl bestimmt, welche Energieflüsse und Kosten wir für Ihr
          Objekt berechnen.
        </p>
      </div>

      {techError && (
        <p className="text-sm font-medium text-destructive">{techError}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {WIZARD_TECH_OPTIONS.map((tech) => {
          const libraryEntry = getTechnologyById(tech.libraryId);
          const Icon = libraryEntry?.icon;
          const description = libraryEntry?.shortDescription ?? "";
          const efficiency = libraryEntry
            ? `${libraryEntry.efficiency.label}: ${libraryEntry.efficiency.value}`
            : "";

          return (
            <Controller
              key={tech.key}
              name={`technologies.${tech.key}`}
              control={control}
              render={({ field }) => {
                const heatPumpKey =
                  tech.key === "heatPumpAir"
                    ? ("heatPumpAir" as const)
                    : tech.key === "heatPumpGround"
                      ? ("heatPumpGround" as const)
                      : null;
                return (
                  <Card
                    className={cn(
                      "cursor-pointer border-[#0F172A]/10 transition-all",
                      field.value &&
                        "border-[#06B6D4] ring-2 ring-[#22C55E]/30 shadow-md",
                    )}
                    onClick={() => {
                      const next = !field.value;
                      if (heatPumpKey) {
                        handleHeatPumpToggle(heatPumpKey, next);
                      } else {
                        field.onChange(next);
                      }
                    }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                      <div className="flex items-center gap-3">
                        {Icon && (
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              field.value
                                ? "bg-[#0F172A] text-[#22C55E]"
                                : "bg-[#F8FAFC] text-[#06B6D4]",
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base text-[#0F172A] dark:text-white">
                            {tech.label}
                          </CardTitle>
                          {tech.subsidy && (
                            <CardDescription className="text-xs">
                              {tech.subsidy}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Toggle
                        pressed={field.value}
                        onPressedChange={(pressed) => {
                          if (heatPumpKey) {
                            handleHeatPumpToggle(heatPumpKey, pressed);
                          } else {
                            field.onChange(pressed);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        variant="outline"
                        className={cn(
                          field.value &&
                            "border-[#06B6D4] bg-[#06B6D4] text-white",
                        )}
                        aria-label={`${tech.label} aktivieren`}
                      />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="line-clamp-2 text-sm text-[#0F172A]/70 dark:text-white/70">
                        {description}
                      </p>
                      {efficiency && (
                        <p className="text-xs text-[#06B6D4]">{efficiency}</p>
                      )}
                      <Link
                        href={`/technologien?tech=${WIZARD_FIELD_TO_LIBRARY[tech.key]}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#0F172A]/55 hover:text-[#06B6D4] dark:text-white/55"
                      >
                        Mehr erfahren
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                );
              }}
            />
          );
        })}
      </div>

      <p className="rounded-lg border border-[#06B6D4]/15 bg-[#06B6D4]/5 px-4 py-3 text-sm text-[#0F172A]/75 dark:text-white/75">
        Weitere Technologien wie Nahwärme, Abwärme oder tiefe Geothermie finden
        Sie unter{" "}
        <Link href="/technologien" className="font-medium text-[#06B6D4] hover:underline">
          Technologien entdecken
        </Link>
        .
      </p>
    </div>
  );
}
