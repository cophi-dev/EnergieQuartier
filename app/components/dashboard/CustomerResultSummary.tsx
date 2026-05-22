"use client";

import { motion } from "framer-motion";
import { Lightbulb, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerInsights } from "@/app/lib/customer-insights";

interface CustomerResultSummaryProps {
  insights: CustomerInsights;
}

export function CustomerResultSummary({ insights }: CustomerResultSummaryProps) {
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
          {insights.solutionParagraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="text-sm leading-relaxed text-[#0F172A]/80 dark:text-white/80"
            >
              {p}
            </p>
          ))}
          <div className="mt-2 flex gap-2 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 px-3 py-2.5 text-xs text-[#0F172A]/75 dark:text-white/75">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
            <span>
              <strong className="text-[#0F172A] dark:text-white">
                Was bedeutet das für mich?
              </strong>{" "}
              Sie erhalten eine erste Orientierung – keine verbindliche Planung.
              Die Zahlen helfen beim Gespräch mit Berater, Verwaltung oder
              Eigentümergemeinschaft.
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
