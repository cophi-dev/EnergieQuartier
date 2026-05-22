"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { pickCo2AnalogySentence } from "@/app/lib/co2-analogies";
import type { CustomerInsights } from "@/app/lib/customer-insights";
import type { CalculationResult } from "@/app/types/calculation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerCo2SectionProps {
  result: CalculationResult;
  insights: CustomerInsights;
}

export function CustomerCo2Section({
  result,
  insights,
}: CustomerCo2SectionProps) {
  const { environment } = result;
  const before = environment.co2BaselineKg / 1000;
  const after = environment.co2AfterKg / 1000;
  const saved = environment.co2SavingsKg / 1000;
  const reductionPct =
    before > 0 ? Math.round((saved / before) * 100) : 0;
  const afterPct = before > 0 ? (after / before) * 100 : 0;
  const analogy = pickCo2AnalogySentence(environment.co2SavingsKg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-card h-full overflow-hidden border-[#0F172A]/8">
        <div className="h-0.5 bg-gradient-to-r from-[#64748B] to-[#22C55E]" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-[#0F172A] dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/12">
              <Leaf className="h-4 w-4 text-[#16A34A]" />
            </span>
            {insights.co2Headline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0F172A]/55">
                Vorher
              </p>
              <p className="text-2xl font-bold tabular-nums text-[#64748B]">
                {before.toFixed(1)}
                <span className="text-sm font-semibold"> t/a</span>
              </p>
            </div>
            <div className="pb-1 text-[#22C55E]">
              <span className="text-lg font-bold">−{reductionPct} %</span>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#15803D]">
                Nachher
              </p>
              <p className="text-2xl font-bold tabular-nums text-[#22C55E]">
                {after.toFixed(1)}
                <span className="text-sm font-semibold"> t/a</span>
              </p>
            </div>
          </div>

          <div className="relative h-8 overflow-hidden rounded-full bg-[#64748B]/25">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#22C55E] transition-all"
              style={{ width: `${Math.max(afterPct, 8)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-[#0F172A]/75 px-2.5 py-0.5 text-[11px] font-bold text-white">
                {saved.toFixed(1)} t CO₂ weniger / Jahr
              </span>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[#0F172A]/65 dark:text-white/65">
            {analogy}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
