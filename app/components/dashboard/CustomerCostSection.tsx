"use client";

import { motion } from "framer-motion";
import { Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerInsights } from "@/app/lib/customer-insights";

interface CustomerCostSectionProps {
  insights: CustomerInsights;
}

export function CustomerCostSection({ insights }: CustomerCostSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="glass-card h-full border-[#0F172A]/8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#0F172A] dark:text-white">
            <Euro className="h-5 w-5 text-[#22C55E]" />
            {insights.costHeadline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {insights.costHighlights.map((h) => (
              <div
                key={h.label}
                className="rounded-lg border border-[#0F172A]/6 bg-[#F8FAFC]/80 p-3 dark:bg-[#0F172A]/30"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#06B6D4]">
                  {h.label}
                </p>
                <p className="mt-1 text-lg font-bold text-[#0F172A] dark:text-white">
                  {h.value}
                </p>
                {h.hint && (
                  <p className="text-[11px] text-[#0F172A]/50">{h.hint}</p>
                )}
              </div>
            ))}
          </div>
          {insights.costParagraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="text-sm leading-relaxed text-[#0F172A]/75 dark:text-white/75"
            >
              {p}
            </p>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
