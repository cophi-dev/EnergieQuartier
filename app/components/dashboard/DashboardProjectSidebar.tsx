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
    <aside className="hidden xl:block w-64 shrink-0 border-r border-[#0A4D68]/10 bg-white dark:bg-[#0A4D68]/20 p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#088395]">Projekt</h2>
        <p className="mt-1 text-lg font-bold text-[#0A4D68] dark:text-white leading-tight">
          {project.name || "Unbenannt"}
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-[#0A4D68]/70 dark:text-white/70">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {project.address}, {project.postalCode}
        </p>
      </div>

      <Separator className="bg-[#0A4D68]/10" />

      <Card className="border-[#0A4D68]/10 shadow-none">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs text-[#088395]">Verbrauch</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0 text-sm space-y-1">
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

      <Card className="border-[#0A4D68]/10 shadow-none">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs text-[#088395]">Technik-Mix</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <p className="text-sm font-medium text-[#0A4D68] dark:text-white">
            {techLabels.join(" · ") || "—"}
          </p>
          {result.sizing.pvKwp > 0 && (
            <p className="text-xs text-[#0A4D68]/60 mt-2">
              {result.sizing.pvKwp} kWp · {result.sizing.batteryKwh > 0 ? `${result.sizing.batteryKwh} kWh Speicher` : "ohne Speicher"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-[#0A4D68]/50 space-y-1">
        {WIZARD_STEPS.map((s) => (
          <p key={s.id} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00FFCA]" />
            {s.short}
          </p>
        ))}
      </div>

      <ButtonLink
        href="/wizard"
        variant="outline"
        size="sm"
        className="w-full border-[#088395] text-[#0A4D68]"
      >
        <Pencil className="mr-2 h-3.5 w-3.5" />
        Konzept bearbeiten
      </ButtonLink>
    </aside>
  );
}
