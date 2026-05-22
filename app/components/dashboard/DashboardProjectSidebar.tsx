"use client";

import { MapPin, Pencil } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WIZARD_STEPS } from "@/app/lib/constants";
import type { ProjectData } from "@/app/types/project";
import type { CalculationResult } from "@/app/types/calculation";

interface DashboardProjectSidebarProps {
  project: ProjectData;
  result: CalculationResult;
}

export function DashboardProjectSidebar({
  project,
  result,
}: DashboardProjectSidebarProps) {
  const techLabels = [
    project.technologies.pv && "PV",
    project.technologies.heatPumpAir && "Luft-WP",
    project.technologies.heatPumpGround && "Sole-WP",
    project.technologies.battery && "Speicher",
    project.technologies.solarThermal && "Solarthermie",
  ].filter(Boolean);

  return (
    <aside className="glass hidden w-64 shrink-0 space-y-4 border-r border-[#0F172A]/8 p-4 xl:block">
      <div>
        <h2 className="text-sm font-semibold text-[#06B6D4]">Projekt</h2>
        <p className="mt-1 text-lg font-bold leading-tight text-[#0F172A] dark:text-white">
          {project.name || "Unbenannt"}
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-[#0F172A]/65 dark:text-white/70">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {project.address}, {project.postalCode}
        </p>
      </div>

      <Separator className="bg-[#0F172A]/10" />

      <Card className="glass-card border-[#0F172A]/8 shadow-none">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-xs text-[#06B6D4]">Verbrauch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pb-3 pt-0 text-sm">
          <p>
            Strom:{" "}
            <span className="font-medium">
              {project.electricityKwh.toLocaleString("de-DE")} kWh/a
            </span>
          </p>
          <p>
            Wärme:{" "}
            <span className="font-medium">
              {project.heatKwh.toLocaleString("de-DE")} kWh/a
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-[#0F172A]/8 shadow-none">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-xs text-[#06B6D4]">Technik-Mix</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <p className="text-sm font-medium text-[#0F172A] dark:text-white">
            {techLabels.join(" · ") || "—"}
          </p>
          {result.sizing.pvKwp > 0 && (
            <p className="mt-2 text-xs text-[#0F172A]/55">
              {result.sizing.pvKwp} kWp ·{" "}
              {result.sizing.batteryKwh > 0
                ? `${result.sizing.batteryKwh} kWh Speicher`
                : "ohne Speicher"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-1 text-xs text-[#0F172A]/50">
        {WIZARD_STEPS.map((s) => (
          <p key={s.id} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            {s.short}
          </p>
        ))}
      </div>

      <ButtonLink
        href="/wizard"
        variant="outline"
        size="sm"
        className="w-full border-[#06B6D4] text-[#0F172A] dark:text-[#06B6D4]"
      >
        <Pencil className="mr-2 h-3.5 w-3.5" />
        Konzept bearbeiten
      </ButtonLink>
    </aside>
  );
}
