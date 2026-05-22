"use client";

import { useMemo } from "react";
import { Ruler } from "lucide-react";
import { buildConceptSizingItems } from "@/app/lib/concept-sizing";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

interface ConceptSizingStripProps {
  project: ProjectData;
  result: CalculationResult;
  compact?: boolean;
}

export function ConceptSizingStrip({
  project,
  result,
  compact = false,
}: ConceptSizingStripProps) {
  const items = useMemo(
    () => buildConceptSizingItems(project, result),
    [project, result],
  );

  if (items.length === 0) return null;

  return (
    <div
      className={
        compact
          ? "rounded-lg border border-[#0F172A]/6 bg-[#F8FAFC]/60 px-3 py-2.5 dark:border-white/10 dark:bg-[#0F172A]/25"
          : "rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC]/80 p-3 dark:border-white/10 dark:bg-[#0F172A]/30"
      }
    >
      <div className="flex items-center gap-1.5">
        <Ruler className="h-3.5 w-3.5 text-[#06B6D4]" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#06B6D4]">
          Konzept-Dimensionierung
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[8.5rem] rounded-lg border border-[#0F172A]/8 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-[#0F172A]/40"
          >
            <p className="text-[10px] font-medium text-[#0F172A]/50 dark:text-white/50">
              {item.label}
            </p>
            <p className="text-sm font-bold tabular-nums text-[#0F172A] dark:text-white">
              {item.value}
            </p>
            {item.detail ? (
              <p className="mt-0.5 text-[10px] leading-snug text-[#0F172A]/55 dark:text-white/55">
                {item.detail}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {!compact ? (
        <p className="text-[10px] text-[#0F172A]/45 dark:text-white/45">
          Auslegung nach Verbrauch, verfügbarer Dachfläche und Ihren Prioritäten
          (Kosten · CO₂ · Autarkie).
        </p>
      ) : null}
    </div>
  );
}
