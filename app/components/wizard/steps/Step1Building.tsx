"use client";

import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/app/components/wizard/FormField";
import type { WizardFormValues } from "@/app/lib/wizard-schema";

const BUILDING_TYPES = [
  { value: "einfamilienhaus", label: "Einfamilienhaus" },
  { value: "mehrfamilienhaus", label: "Mehrfamilienhaus" },
  { value: "gewerbe", label: "Gewerbe" },
  { value: "öffentlich", label: "Öffentlich" },
] as const;

const RENOVATION_OPTIONS = [
  { value: "unsaniert", label: "Unsaniert" },
  { value: "teilweise", label: "Teilsaniert" },
  { value: "vollständig", label: "Vollsaniert" },
  { value: "neubau", label: "Neubau" },
] as const;

interface StepProps {
  control: Control<WizardFormValues>;
  errors: FieldErrors<WizardFormValues>;
}

export function Step1Building({ control, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
          Projekt & Gebäude
        </h2>
        <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
          Grunddaten für die Konzeptstudie und Verbrauchsschätzung.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Projektname"
          htmlFor="name"
          error={errors.name?.message}
          className="sm:col-span-2"
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="z. B. MFH Musterstraße – HEW Kunde"
                className="w-full border-[#0F172A]/20"
                {...field}
              />
            )}
          />
        </FormField>

        <FormField
          label="Adresse"
          htmlFor="address"
          error={errors.address?.message}
        >
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                id="address"
                placeholder="Musterstraße 12"
                className="w-full border-[#0F172A]/20"
                {...field}
              />
            )}
          />
        </FormField>

        <FormField
          label="PLZ"
          htmlFor="postalCode"
          error={errors.postalCode?.message}
          tooltip="Hamburg: 20xxx–22xxx – für regionale PV-Erträge und Netzentgelte."
        >
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <Input
                id="postalCode"
                placeholder="20095"
                maxLength={5}
                className="w-full border-[#0F172A]/20"
                {...field}
              />
            )}
          />
        </FormField>

        <FormField
          label="Gebäudetyp"
          error={errors.buildingType?.message}
          tooltip="Beeinflusst typische Flächen- und Verbrauchsannahmen."
        >
          <Controller
            name="buildingType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full border-[#0F172A]/20">
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  {BUILDING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Sanierungsstand"
          error={errors.renovationStatus?.message}
          tooltip="Relevant für GEG-Anforderungen und Wärmeverbrauchsschätzung."
        >
          <Controller
            name="renovationStatus"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full border-[#0F172A]/20">
                  <SelectValue placeholder="Stand wählen" />
                </SelectTrigger>
                <SelectContent>
                  {RENOVATION_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Wohnfläche (m²)"
          htmlFor="livingArea"
          error={errors.livingArea?.message}
        >
          <Controller
            name="livingArea"
            control={control}
            render={({ field }) => (
              <Input
                id="livingArea"
                type="number"
                min={20}
                className="w-full border-[#0F172A]/20"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Nutzfläche (m²)"
          htmlFor="usableArea"
          error={errors.usableArea?.message}
          hint="Optional, z. B. Gewerbefläche"
        >
          <Controller
            name="usableArea"
            control={control}
            render={({ field }) => (
              <Input
                id="usableArea"
                type="number"
                min={0}
                className="w-full border-[#0F172A]/20"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            )}
          />
        </FormField>

        <FormField
          label="Baujahr"
          htmlFor="yearBuilt"
          error={errors.yearBuilt?.message}
        >
          <Controller
            name="yearBuilt"
            control={control}
            render={({ field }) => (
              <Input
                id="yearBuilt"
                type="number"
                min={1800}
                max={new Date().getFullYear() + 2}
                className="w-full border-[#0F172A]/20"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            )}
          />
        </FormField>
      </div>
    </div>
  );
}
