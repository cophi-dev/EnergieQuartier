"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Euro,
  Leaf,
  Percent,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalculationResult } from "@/app/types/calculation";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  result: CalculationResult;
  targetPaybackYears: number;
}

const kpis = (result: CalculationResult, target: number) => [
  {
    id: "payback",
    label: "Amortisation",
    value: `${result.economics.paybackYears} J.`,
    sub:
      result.economics.paybackYears <= target
        ? `Ziel ≤ ${target} J. ✓`
        : `Ziel ${target} J.`,
    icon: Clock,
    accent: "from-[#0A4D68] to-[#088395]",
    highlight: result.economics.paybackYears <= target,
  },
  {
    id: "co2",
    label: "CO₂-Einsparung",
    value: `${(result.environment.co2SavingsKg / 1000).toFixed(1)} t/a`,
    sub: `vorher ${(result.environment.co2BaselineKg / 1000).toFixed(1)} t/a`,
    icon: Leaf,
    accent: "from-[#088395] to-[#00FFCA]",
    highlight: true,
  },
  {
    id: "npv",
    label: "NPV (20 J.)",
    value: `${result.economics.npvEur.toLocaleString("de-DE")} €`,
    sub: `4 % Diskont · ROI ${result.economics.roiPercent} %`,
    icon: TrendingUp,
    accent: "from-[#0A4D68] to-[#00FFCA]",
    highlight: result.economics.npvEur > 0,
  },
  {
    id: "autarky",
    label: "Autarkie",
    value: `${result.annual.autarkyPercent} %`,
    sub: `Eigenverbrauch ${result.annual.selfConsumptionKwh.toLocaleString("de-DE")} kWh`,
    icon: Percent,
    accent: "from-[#088395] to-[#0A4D68]",
    highlight: result.annual.autarkyPercent >= 50,
  },
];

export function KpiCards({ result, targetPaybackYears }: KpiCardsProps) {
  const items = kpis(result, targetPaybackYears);

  return (
    <div className="space-y-4">
      {items.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card
            className={cn(
              "border-[#0A4D68]/10 overflow-hidden",
              kpi.highlight && "ring-1 ring-[#00FFCA]/40",
            )}
          >
            <div className={cn("h-1 bg-gradient-to-r", kpi.accent)} />
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-[#088395] uppercase tracking-wide">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-[#0A4D68]/50" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-2xl font-bold text-[#0A4D68] dark:text-[#00FFCA]">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-[#0A4D68]/60 dark:text-white/60">
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Card className="border-[#0A4D68]/10 bg-[#F5F8FA] dark:bg-[#0A4D68]/40">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 text-sm text-[#0A4D68] dark:text-white">
            <Euro className="h-4 w-4 text-[#088395]" />
            <span className="font-medium">Jährl. Einsparung</span>
          </div>
          <p className="mt-1 text-xl font-bold text-[#088395]">
            {result.economics.annualSavingsEur.toLocaleString("de-DE")} €/a
          </p>
          <p className="text-xs text-[#0A4D68]/50 mt-1">
            Invest netto {result.investment.net.toLocaleString("de-DE")} €
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
