"use client";

import { useMemo, useState } from "react";
import { BarChart3, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergySankey } from "@/app/components/dashboard/EnergySankey";
import { ConceptSizingStrip } from "@/app/components/dashboard/ConceptSizingStrip";
import { MonthlyEnergyChart } from "@/app/components/dashboard/MonthlyEnergyChart";
import { buildMonthlyEnergyFlows } from "@/app/lib/monthly-energy";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { cn } from "@/lib/utils";

type FlowView = "annual" | "monthly";

interface EnergyFlowSectionProps {
  project: ProjectData;
  result: CalculationResult;
}

export function EnergyFlowSection({ project, result }: EnergyFlowSectionProps) {
  const [view, setView] = useState<FlowView>("annual");

  const monthly = useMemo(
    () => buildMonthlyEnergyFlows(project, result),
    [project, result],
  );

  return (
    <Card className="glass-card border-[#0F172A]/8">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex flex-wrap items-center gap-2 text-[#0F172A] dark:text-white">
            Energieflüsse
            <span className="text-xs font-normal text-[#06B6D4]">
              kWh · Strom / Wärme
            </span>
          </CardTitle>
          <div className="flex rounded-lg border border-[#0F172A]/10 p-0.5">
            <button
              type="button"
              onClick={() => setView("annual")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === "annual"
                  ? "bg-[#0F172A] text-white dark:bg-[#06B6D4] dark:text-[#0F172A]"
                  : "text-[#0F172A]/65 hover:bg-[#06B6D4]/10 dark:text-white/70",
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Jahres-Sankey
            </button>
            <button
              type="button"
              onClick={() => setView("monthly")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === "monthly"
                  ? "bg-[#0F172A] text-white dark:bg-[#06B6D4] dark:text-[#0F172A]"
                  : "text-[#0F172A]/65 hover:bg-[#06B6D4]/10 dark:text-white/70",
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Monatsverlauf
            </button>
          </div>
        </div>
        <p className="text-sm text-[#0F172A]/55 dark:text-white/55">
          {view === "annual"
            ? "Wo fließt die Energie im Jahr hin? Die Strichstärke zeigt die Menge."
            : "Wie verteilen sich Erzeugung und Verbrauch über das Jahr? Sommer-PV und Winter-Wärme im Blick."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConceptSizingStrip project={project} result={result} />
        {view === "annual" ? (
          <EnergySankey data={result.sankey} annual={result.annual} />
        ) : (
          <MonthlyEnergyChart data={monthly} />
        )}
      </CardContent>
    </Card>
  );
}
