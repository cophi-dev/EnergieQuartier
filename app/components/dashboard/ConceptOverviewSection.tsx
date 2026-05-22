"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Battery,
  Sparkles,
  Sun,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import { ConceptKpiStrip } from "@/app/components/dashboard/ConceptKpiStrip";
import { buildConceptSizingItems } from "@/app/lib/concept-sizing";
import type { CustomerInsights } from "@/app/lib/customer-insights";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

interface ConceptOverviewSectionProps {
  project: ProjectData;
  result: CalculationResult;
  insights: CustomerInsights;
}

const SIZING_ICONS: Record<string, LucideIcon> = {
  pv: Sun,
  battery: Battery,
  "hp-air": Thermometer,
  "hp-ground": Thermometer,
  "solar-thermal": Sun,
};

export function ConceptOverviewSection({
  project,
  result,
  insights,
}: ConceptOverviewSectionProps) {
  const sizingItems = useMemo(
    () => buildConceptSizingItems(project, result),
    [project, result],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[#0F172A]/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#0F172A]/40"
    >
      <div className="h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#0F172A]" />

      <div className="space-y-5 p-4 sm:p-5">
        <ConceptKpiStrip
          result={result}
          targetPaybackYears={project.targetPaybackYears}
          embedded
        />

        {sizingItems.length > 0 ? (
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#06B6D4]">
              Ihr Technologie-Mix
            </p>
            <div className="flex flex-wrap gap-2">
              {sizingItems.map((item) => {
                const Icon = SIZING_ICONS[item.id] ?? Sun;
                return (
                  <div
                    key={item.id}
                    className="flex min-w-[9rem] flex-1 items-center gap-2.5 rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC] px-3 py-2.5 dark:border-white/10 dark:bg-[#0F172A]/30"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F172A]/5 dark:bg-white/10">
                      <Icon className="h-4 w-4 text-[#06B6D4]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#0F172A]/60 dark:text-white/60">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold tabular-nums text-[#0F172A] dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4]/8 to-[#22C55E]/8 px-3.5 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" />
          <p className="text-sm leading-snug text-[#0F172A]/80 dark:text-white/80">
            {insights.solutionTagline}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
