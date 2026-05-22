"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatScenarioTechLabels } from "@/app/lib/scenarios";
import type { ScenarioWithResult } from "@/app/types/scenario";
import { useProjectStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ScenarioComparisonProps {
  scenarios: ScenarioWithResult[];
}

/** Aktuelles Konzept in die Mitte – klassisches Vergleichsmuster */
function orderForComparison(
  scenarios: ScenarioWithResult[],
): ScenarioWithResult[] {
  const current = scenarios.find((s) => s.isCurrent);
  const others = scenarios
    .filter((s) => !s.isCurrent)
    .sort((a, b) => a.result.investment.net - b.result.investment.net);

  if (!current) return others;
  const insertAt = Math.floor(others.length / 2);
  return [...others.slice(0, insertAt), current, ...others.slice(insertAt)];
}

function buildInsight(scenarios: ScenarioWithResult[]): string | null {
  const current = scenarios.find((s) => s.isCurrent);
  if (!current) return null;

  const baseline = [...scenarios].sort(
    (a, b) => a.result.investment.net - b.result.investment.net,
  )[0];
  if (!baseline || baseline.id === current.id) return null;

  const extraSavings =
    current.result.economics.annualSavingsEur -
    baseline.result.economics.annualSavingsEur;

  return `Gegenüber „${baseline.name}" sparen Sie ${extraSavings.toLocaleString("de-DE")} € mehr pro Jahr – bei ${current.result.economics.paybackYears.toFixed(1)} Jahren Amortisation.`;
}

interface ScenarioCardProps {
  scenario: ScenarioWithResult;
  index: number;
  onTry: () => void;
}

function ScenarioCard({ scenario, index, onTry }: ScenarioCardProps) {
  const { result } = scenario;
  const techLabel = formatScenarioTechLabels(scenario.technologies);
  const savings = result.economics.annualSavingsEur;

  const stats = [
    {
      label: "Investition (netto)",
      value: `${result.investment.net.toLocaleString("de-DE")} €`,
    },
    {
      label: "Amortisation",
      value: `${result.economics.paybackYears.toFixed(1)} Jahre`,
    },
    {
      label: "CO₂ weniger",
      value: `${(result.environment.co2SavingsKg / 1000).toFixed(1)} t/a`,
    },
    {
      label: "Autarkie",
      value: `${result.annual.autarkyPercent} %`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn(
        "flex h-full flex-col rounded-2xl border p-4 sm:p-5",
        scenario.isCurrent
          ? "border-[#06B6D4]/35 bg-gradient-to-b from-[#06B6D4]/10 to-white shadow-md dark:from-[#06B6D4]/15 dark:to-[#0F172A]/40 lg:scale-[1.02]"
          : "border-[#0F172A]/10 bg-white dark:border-white/10 dark:bg-[#0F172A]/30",
      )}
    >
      <div className="flex flex-wrap gap-1.5">
        {scenario.isCurrent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#06B6D4]/20 px-2 py-0.5 text-[11px] font-semibold text-[#0E7490]">
            <Check className="h-3 w-3" />
            Ihr Konzept
          </span>
        ) : null}
        {scenario.isRecommended ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-semibold text-[#15803D]">
            <Star className="h-3 w-3" />
            Empfohlen
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 text-base font-bold text-[#0F172A] dark:text-white">
        {scenario.name}
      </h3>
      <p className="mt-0.5 text-sm text-[#0F172A]/55 dark:text-white/55">
        {techLabel}
      </p>

      <div
        className={cn(
          "mt-4 rounded-xl px-4 py-3",
          scenario.isCurrent ? "bg-[#22C55E]/12" : "bg-[#F8FAFC] dark:bg-[#0F172A]/40",
        )}
      >
        <p className="text-xs font-medium text-[#0F172A]/60 dark:text-white/60">
          Jährliche Einsparung
        </p>
        <p
          className={cn(
            "mt-0.5 text-2xl font-bold tabular-nums sm:text-3xl",
            scenario.isCurrent ? "text-[#15803D]" : "text-[#0F172A] dark:text-white",
          )}
        >
          {savings.toLocaleString("de-DE")} €
        </p>
      </div>

      <dl className="mt-4 flex-1 space-y-2.5 border-t border-[#0F172A]/8 pt-4 dark:border-white/10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="text-sm text-[#0F172A]/65 dark:text-white/65">
              {stat.label}
            </dt>
            <dd className="shrink-0 text-sm font-semibold tabular-nums text-[#0F172A] dark:text-white">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 pt-1">
        {scenario.isCurrent ? (
          <p className="text-center text-xs font-medium text-[#0E7490]">
            ✓ Ihre aktive Konfiguration
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-full border-[#0F172A]/12 text-sm text-[#0F172A]/75 hover:bg-[#F8FAFC] dark:text-white/75"
            onClick={onTry}
          >
            Variante ausprobieren
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const router = useRouter();
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  const ordered = useMemo(
    () => orderForComparison(scenarios),
    [scenarios],
  );
  const insight = useMemo(() => buildInsight(scenarios), [scenarios]);

  const applyScenario = (scenario: ScenarioWithResult) => {
    setCurrentProject({ technologies: scenario.technologies });
    router.push("/wizard?step=4");
  };

  if (scenarios.length === 0) return null;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">
          Szenario-Vergleich
        </h2>
        {insight ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[#0F172A]/70 dark:text-white/70">
            {insight}
          </p>
        ) : (
          <p className="mt-1 text-sm text-[#0F172A]/55 dark:text-white/55">
            Drei Ausbaustufen – von der Minimalvariante bis zum Komplett-Konzept
          </p>
        )}
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
        {ordered.map((scenario, i) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            index={i}
            onTry={() => applyScenario(scenario)}
          />
        ))}
      </div>
    </section>
  );
}
