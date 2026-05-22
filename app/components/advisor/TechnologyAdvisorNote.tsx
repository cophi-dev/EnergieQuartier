"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { AdvisorTextBlock } from "@/app/components/dashboard/AdvisorTextBlock";
import { useAdvisorText } from "@/app/hooks/useAdvisorText";
import { buildAdvisorCacheKey } from "@/app/lib/llm/cache-key";
import { buildAdvisorContext } from "@/app/lib/llm/context";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { cn } from "@/lib/utils";

interface TechnologyAdvisorNoteProps {
  project: ProjectData;
  result: CalculationResult;
  technologyId: string;
  technologyName: string;
  compact?: boolean;
  className?: string;
}

export function TechnologyAdvisorNote({
  project,
  result,
  technologyId,
  technologyName,
  compact = false,
  className,
}: TechnologyAdvisorNoteProps) {
  const context = useMemo(
    () =>
      buildAdvisorContext(project, result, {
        technologyId,
        technologyName,
      }),
    [project, result, technologyId, technologyName],
  );
  const cacheKey = buildAdvisorCacheKey("technology-explanation", context);
  const { text, status, source, regenerate } = useAdvisorText({
    slot: "technology-explanation",
    cacheKey,
    context,
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-3 py-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#0F172A] dark:text-white">
        <Sparkles className="h-4 w-4 shrink-0 text-[#06B6D4]" />
        {compact ? "Warum passt das?" : "Passt das zu Ihrem Projekt?"}
      </div>
      <AdvisorTextBlock
        text={text}
        status={status}
        onRegenerate={regenerate}
        isInitialLoad={status === "loading" && source === null}
      />
    </div>
  );
}
