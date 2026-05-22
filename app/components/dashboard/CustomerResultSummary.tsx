"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles } from "lucide-react";
import { AdvisorTextBlock } from "@/app/components/dashboard/AdvisorTextBlock";
import { useAdvisorText } from "@/app/hooks/useAdvisorText";
import { buildAdvisorCacheKey } from "@/app/lib/llm/cache-key";
import { buildAdvisorContext } from "@/app/lib/llm/context";
import type { CustomerInsights } from "@/app/lib/customer-insights";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerResultSummaryProps {
  project: ProjectData;
  result: CalculationResult;
  insights: CustomerInsights;
}

export function CustomerResultSummary({
  project,
  result,
  insights,
}: CustomerResultSummaryProps) {
  const context = useMemo(
    () => buildAdvisorContext(project, result),
    [project, result],
  );
  const cacheKey = buildAdvisorCacheKey("personal-summary", context);
  const { text, status, source, regenerate } = useAdvisorText({
    slot: "personal-summary",
    cacheKey,
    context,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="gradient-border glass-card overflow-hidden border-[#06B6D4]/20">
        <div className="h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#0F172A]" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#0F172A] dark:text-white">
            <Sparkles className="h-5 w-5 text-[#06B6D4]" />
            {insights.solutionHeadline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.solutionParagraphs.slice(0, 2).map((p) => (
            <p
              key={p.slice(0, 40)}
              className="text-sm leading-relaxed text-[#0F172A]/80 dark:text-white/80"
            >
              {p}
            </p>
          ))}

          <div className="rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#0F172A] dark:text-white">
              <Lightbulb className="h-4 w-4 text-[#22C55E]" />
              Was bedeutet das für Sie?
            </div>
            <AdvisorTextBlock
              text={text}
              status={status}
              onRegenerate={regenerate}
              isInitialLoad={status === "loading" && source === null}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
