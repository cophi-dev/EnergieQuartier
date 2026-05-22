"use client";

import { motion } from "framer-motion";
import { Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerInsights } from "@/app/lib/customer-insights";
import type { CalculationResult } from "@/app/types/calculation";

interface CustomerCostSectionProps {
  result: CalculationResult;
  insights: CustomerInsights;
}

export function CustomerCostSection({
  result,
  insights,
}: CustomerCostSectionProps) {
  const { investment, economics } = result;
  const subsidyPct =
    investment.gross > 0
      ? Math.round((investment.subsidies / investment.gross) * 100)
      : 0;
  const netPct =
    investment.gross > 0
      ? Math.round((investment.net / investment.gross) * 100)
      : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="glass-card h-full overflow-hidden border-[#0F172A]/8">
        <div className="h-0.5 bg-[#22C55E]" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-[#0F172A] dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/12">
              <Euro className="h-4 w-4 text-[#16A34A]" />
            </span>
            {insights.costHeadline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-[#22C55E]/8 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#15803D]">
              Jährliche Einsparung
            </p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums text-[#15803D]">
              {economics.annualSavingsEur.toLocaleString("de-DE")} €
              <span className="text-lg font-semibold">/a</span>
            </p>
            <p className="mt-1 text-xs text-[#0F172A]/60 dark:text-white/60">
              Amortisation in{" "}
              <strong className="text-[#0F172A] dark:text-white">
                {economics.paybackYears.toFixed(1)} Jahren
              </strong>
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-[#0F172A]/70 dark:text-white/70">
              Investitionsübersicht
            </p>
            <div className="space-y-1.5">
              <InvestBar
                label="Brutto"
                value={investment.gross}
                widthPct={100}
                color="bg-[#0F172A]/80"
              />
              <InvestBar
                label={`Förderung (−${subsidyPct} %)`}
                value={investment.subsidies}
                widthPct={subsidyPct}
                color="bg-[#06B6D4]"
              />
              <InvestBar
                label="Netto (Ihre Investition)"
                value={investment.net}
                widthPct={netPct}
                color="bg-[#22C55E]"
                bold
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InvestBar({
  label,
  value,
  widthPct,
  color,
  bold = false,
}: {
  label: string;
  value: number;
  widthPct: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <p className="w-28 shrink-0 text-[11px] text-[#0F172A]/65 dark:text-white/65">
        {label}
      </p>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-[#0F172A]/5 dark:bg-white/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-md ${color}`}
          style={{ width: `${Math.max(widthPct, 4)}%` }}
        />
      </div>
      <p
        className={`w-20 shrink-0 text-right text-xs tabular-nums ${
          bold
            ? "font-bold text-[#0F172A] dark:text-white"
            : "font-medium text-[#0F172A]/75 dark:text-white/75"
        }`}
      >
        {value.toLocaleString("de-DE")} €
      </p>
    </div>
  );
}
