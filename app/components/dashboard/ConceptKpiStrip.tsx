"use client";

import { motion } from "framer-motion";
import { Clock, Leaf, Percent, TrendingUp, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/app/components/ui/AnimatedNumber";
import type { CalculationResult } from "@/app/types/calculation";
import { cn } from "@/lib/utils";

interface ConceptKpiStripProps {
  result: CalculationResult;
  targetPaybackYears: number;
  embedded?: boolean;
}

interface KpiConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  tile: string;
  iconBg: string;
  valueColor: string;
}

const KPI_CONFIG: KpiConfig[] = [
  {
    id: "payback",
    label: "Amortisation",
    icon: Clock,
    tile: "bg-[#06B6D4]/8 border-[#06B6D4]/20",
    iconBg: "bg-[#06B6D4]/15 text-[#0891B2]",
    valueColor: "text-[#0E7490]",
  },
  {
    id: "co2",
    label: "CO₂-Einsparung",
    icon: Leaf,
    tile: "bg-[#22C55E]/8 border-[#22C55E]/20",
    iconBg: "bg-[#22C55E]/15 text-[#16A34A]",
    valueColor: "text-[#15803D]",
  },
  {
    id: "npv",
    label: "NPV (20 J.)",
    icon: TrendingUp,
    tile: "bg-[#0F172A]/[0.04] border-[#0F172A]/10",
    iconBg: "bg-[#0F172A]/8 text-[#0F172A]/70",
    valueColor: "text-[#0F172A] dark:text-white",
  },
  {
    id: "autarky",
    label: "Autarkie",
    icon: Percent,
    tile: "bg-[#06B6D4]/8 border-[#06B6D4]/20",
    iconBg: "bg-[#06B6D4]/15 text-[#0891B2]",
    valueColor: "text-[#0E7490]",
  },
];

export function ConceptKpiStrip({
  result,
  targetPaybackYears,
  embedded = false,
}: ConceptKpiStripProps) {
  const paybackOk = result.economics.paybackYears <= targetPaybackYears;

  const data: Record<
    string,
    { value: React.ReactNode; hint: string; highlight?: boolean }
  > = {
    payback: {
      value: (
        <>
          <AnimatedNumber value={result.economics.paybackYears} decimals={1} /> J.
        </>
      ),
      hint: paybackOk
        ? `✓ Ziel ≤ ${targetPaybackYears} J.`
        : `Ziel ${targetPaybackYears} J.`,
      highlight: paybackOk,
    },
    co2: {
      value: (
        <>
          <AnimatedNumber
            value={result.environment.co2SavingsKg / 1000}
            decimals={1}
          />{" "}
          t/a
        </>
      ),
      hint: `vorher ${(result.environment.co2BaselineKg / 1000).toFixed(1)} t/a`,
    },
    npv: {
      value: (
        <>
          <AnimatedNumber value={result.economics.npvEur} decimals={0} /> €
        </>
      ),
      hint: `${result.economics.annualSavingsEur.toLocaleString("de-DE")} €/a`,
    },
    autarky: {
      value: (
        <>
          <AnimatedNumber value={result.annual.autarkyPercent} decimals={0} /> %
        </>
      ),
      hint: `${result.annual.selfConsumptionKwh.toLocaleString("de-DE")} kWh Eigenverbrauch`,
    },
  };

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-4",
        !embedded && "sm:gap-3",
      )}
    >
      {KPI_CONFIG.map((kpi, i) => {
        const d = data[kpi.id];
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "rounded-xl border px-3 py-3 dark:border-white/10",
              kpi.tile,
              d.highlight && "ring-1 ring-[#22C55E]/30",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  kpi.iconBg,
                )}
              >
                <kpi.icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-[11px] font-semibold leading-tight text-[#0F172A]/70 dark:text-white/70">
                {kpi.label}
              </p>
            </div>
            <p
              className={cn(
                "mt-2 text-xl font-bold tabular-nums sm:text-2xl",
                kpi.valueColor,
              )}
            >
              {d.value}
            </p>
            <p
              className={cn(
                "mt-1 text-[11px] font-medium",
                d.highlight
                  ? "text-[#16A34A]"
                  : "text-[#0F172A]/55 dark:text-white/55",
              )}
            >
              {d.hint}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
