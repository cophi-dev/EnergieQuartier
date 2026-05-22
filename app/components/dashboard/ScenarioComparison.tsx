"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  Euro,
  Leaf,
  Percent,
  Star,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatScenarioTechLabels } from "@/app/lib/scenarios";
import type { ScenarioWithResult } from "@/app/types/scenario";
import { useProjectStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ScenarioComparisonProps {
  scenarios: ScenarioWithResult[];
}

export function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
  const router = useRouter();
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  const applyScenario = (scenario: ScenarioWithResult) => {
    setCurrentProject({ technologies: scenario.technologies });
    router.push("/wizard?step=4");
  };

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">
          Szenario-Vergleich
        </h2>
        <p className="mt-1 text-sm text-[#0F172A]/60 dark:text-white/60">
          Drei Varianten für Ihr Objekt – vergleichen Sie Kosten, Klima und
          Unabhängigkeit auf einen Blick.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario, i) => {
          const { result } = scenario;
          const techLabel = formatScenarioTechLabels(scenario.technologies);

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                className={cn(
                  "glass-card relative h-full border-[#0F172A]/8 transition-shadow",
                  scenario.isCurrent && "ring-2 ring-[#06B6D4]/40",
                  scenario.isRecommended &&
                    !scenario.isCurrent &&
                    "ring-1 ring-[#22C55E]/30",
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {scenario.isCurrent && (
                      <Badge className="bg-[#06B6D4] text-[#0F172A]">
                        <Check className="mr-1 h-3 w-3" />
                        Ihr Konzept
                      </Badge>
                    )}
                    {scenario.isRecommended && (
                      <Badge
                        variant="outline"
                        className="border-[#22C55E]/40 text-[#15803D] dark:text-[#22C55E]"
                      >
                        <Star className="mr-1 h-3 w-3 fill-current" />
                        Empfohlen
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-base text-[#0F172A] dark:text-white">
                    {scenario.name}
                  </CardTitle>
                  <p className="text-xs text-[#06B6D4]">{techLabel}</p>
                  <p className="text-sm text-[#0F172A]/65 dark:text-white/65">
                    {scenario.shortDescription}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <MetricRow
                    icon={Euro}
                    label="Investition (netto)"
                    value={`${result.investment.net.toLocaleString("de-DE")} €`}
                  />
                  <MetricRow
                    icon={TrendingUp}
                    label="Einsparung / Jahr"
                    value={`${result.economics.annualSavingsEur.toLocaleString("de-DE")} €`}
                  />
                  <MetricRow
                    icon={Clock}
                    label="Amortisation"
                    value={`${result.economics.paybackYears.toFixed(1)} J.`}
                  />
                  <MetricRow
                    icon={Leaf}
                    label="CO₂-Einsparung"
                    value={`${(result.environment.co2SavingsKg / 1000).toFixed(1)} t/a`}
                  />
                  <MetricRow
                    icon={Percent}
                    label="Autarkie"
                    value={`${result.annual.autarkyPercent} %`}
                  />

                  {!scenario.isCurrent && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full border-[#06B6D4] text-[#0F172A] dark:text-[#06B6D4]"
                      onClick={() => applyScenario(scenario)}
                    >
                      Im Konfigurator öffnen
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Euro;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-[#0F172A]/60 dark:text-white/60">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-[#0F172A] dark:text-white">
        {value}
      </span>
    </div>
  );
}
