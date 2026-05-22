"use client";

import { motion } from "framer-motion";
import { ArrowRight, ListChecks } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerInsights } from "@/app/lib/customer-insights";

interface NextStepsSectionProps {
  insights: CustomerInsights;
}

export function NextStepsSection({ insights }: NextStepsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="glass-card border-[#0F172A]/8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#0F172A] dark:text-white">
            <ListChecks className="h-5 w-5 text-[#06B6D4]" />
            Nächste Schritte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-4 sm:grid-cols-2">
            {insights.nextSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-lg border border-[#0F172A]/6 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white dark:bg-[#06B6D4] dark:text-[#0F172A]">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-[#0F172A] dark:text-white">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-[#0F172A]/65 dark:text-white/65">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink
              href="/wizard"
              className="bg-[#0F172A] text-white hover:bg-[#06B6D4] hover:text-[#0F172A]"
            >
              Konzept anpassen
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/kontakt"
              className="bg-[#22C55E] text-[#0F172A] hover:bg-[#06B6D4]"
            >
              Kontakt aufnehmen
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/technologien"
              variant="outline"
              className="border-[#06B6D4] text-[#0F172A] dark:text-[#06B6D4]"
            >
              Technologien entdecken
            </ButtonLink>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
