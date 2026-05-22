"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Euro,
  Leaf,
  Percent,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/app/components/ui/AnimatedNumber";
import { KpiProgressRing } from "@/app/components/dashboard/KpiProgressRing";
import type { CalculationResult } from "@/app/types/calculation";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  result: CalculationResult;
  targetPaybackYears: number;
}

interface KpiItem {
  id: string;
  label: string;
  icon: LucideIcon;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  highlight: boolean;
  sub: string;
  showRing?: boolean;
  ringPercent?: number;
  ringColor?: string;
  renderValue: () => React.ReactNode;
}

function buildKpis(result: CalculationResult, target: number): KpiItem[] {
  const paybackOk = result.economics.paybackYears <= target;
  const autarky = result.annual.autarkyPercent;

  return [
    {
      id: "payback",
      label: "Amortisation",
      icon: Clock,
      accentFrom: "#0F172A",
      accentTo: "#06B6D4",
      glowColor: "#06B6D4",
      highlight: paybackOk,
      sub: paybackOk ? `Ziel ≤ ${target} J. ✓` : `Ziel ${target} J.`,
      showRing: true,
      ringPercent: paybackOk
        ? 100
        : Math.min(100, (target / result.economics.paybackYears) * 100),
      ringColor: paybackOk ? "#22C55E" : "#06B6D4",
      renderValue: () => (
        <>
          <AnimatedNumber
            value={result.economics.paybackYears}
            decimals={1}
          />
          {" J."}
        </>
      ),
    },
    {
      id: "co2",
      label: "CO₂-Einsparung",
      icon: Leaf,
      accentFrom: "#06B6D4",
      accentTo: "#22C55E",
      glowColor: "#22C55E",
      highlight: true,
      sub: `vorher ${(result.environment.co2BaselineKg / 1000).toFixed(1)} t/a`,
      renderValue: () => (
        <>
          <AnimatedNumber
            value={result.environment.co2SavingsKg / 1000}
            decimals={1}
          />
          {" t/a"}
        </>
      ),
    },
    {
      id: "npv",
      label: "NPV (20 J.)",
      icon: TrendingUp,
      accentFrom: "#0F172A",
      accentTo: "#22C55E",
      glowColor: "#22C55E",
      highlight: result.economics.npvEur > 0,
      sub: `4 % Diskont · ROI ${result.economics.roiPercent} %`,
      renderValue: () => (
        <>
          <AnimatedNumber value={result.economics.npvEur} decimals={0} />
          {" €"}
        </>
      ),
    },
    {
      id: "autarky",
      label: "Autarkie",
      icon: Percent,
      accentFrom: "#06B6D4",
      accentTo: "#0F172A",
      glowColor: "#06B6D4",
      highlight: autarky >= 50,
      sub: `Eigenverbrauch ${result.annual.selfConsumptionKwh.toLocaleString("de-DE")} kWh`,
      showRing: true,
      ringPercent: autarky,
      ringColor: autarky >= 50 ? "#22C55E" : "#06B6D4",
      renderValue: () => (
        <>
          <AnimatedNumber value={autarky} decimals={0} />
          {" %"}
        </>
      ),
    },
  ];
}

export function KpiCards({ result, targetPaybackYears }: KpiCardsProps) {
  const items = buildKpis(result, targetPaybackYears);

  return (
    <div className="space-y-3">
      {items.map((kpi, i) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="group"
        >
          <Card
            className={cn(
              "gradient-border glass-card overflow-hidden transition-shadow duration-300",
              "group-hover:shadow-lg group-hover:shadow-[#06B6D4]/10",
              kpi.highlight && "ring-1 ring-[#22C55E]/30",
            )}
            style={
              kpi.highlight
                ? { boxShadow: `0 0 24px ${kpi.glowColor}15` }
                : undefined
            }
          >
            <div
              className="h-0.5 bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${kpi.accentFrom}, ${kpi.accentTo})`,
              }}
            />
            <CardHeader className="pb-1 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-[#06B6D4]">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className="h-3.5 w-3.5 text-[#0F172A]/40 dark:text-white/40" />
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 pb-3">
              <div>
                <p className="text-2xl font-bold tabular-nums text-[#0F172A] dark:text-[#06B6D4]">
                  {kpi.renderValue()}
                </p>
                <p className="mt-0.5 text-[11px] text-[#0F172A]/55 dark:text-white/55">
                  {kpi.sub}
                </p>
              </div>
              {kpi.showRing && kpi.ringPercent !== undefined && (
                <div className="relative flex items-center justify-center">
                  <KpiProgressRing
                    percent={kpi.ringPercent}
                    color={kpi.ringColor ?? "#06B6D4"}
                  />
                  <span className="absolute text-[9px] font-semibold text-[#0F172A]/60 dark:text-white/60">
                    {Math.round(kpi.ringPercent)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        whileHover={{ y: -2, scale: 1.01 }}
      >
        <Card className="gradient-border glass border-[#22C55E]/20 bg-[#22C55E]/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-[#0F172A] dark:text-white">
              <Euro className="h-4 w-4 text-[#22C55E]" />
              <span className="font-medium">Jährl. Einsparung</span>
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-[#22C55E]">
              <AnimatedNumber value={result.economics.annualSavingsEur} decimals={0} />
              {" €/a"}
            </p>
            <p className="mt-1 text-xs text-[#0F172A]/50">
              Invest netto{" "}
              {result.investment.net.toLocaleString("de-DE")} €
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
