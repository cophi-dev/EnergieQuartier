"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfExportButton } from "@/app/components/dashboard/PdfExportButton";
import { DashboardProjectSidebar } from "@/app/components/dashboard/DashboardProjectSidebar";
import { DashboardSkeleton } from "@/app/components/dashboard/DashboardSkeleton";
import { ShowcaseBanner } from "@/app/components/dashboard/ShowcaseBanner";
import { KpiCards } from "@/app/components/dashboard/KpiCards";
import { EnergySankey } from "@/app/components/dashboard/EnergySankey";
import { CashflowChart } from "@/app/components/dashboard/CashflowChart";
import { CostComparisonChart } from "@/app/components/dashboard/CostComparisonChart";
import { TechnologyCards } from "@/app/components/dashboard/TechnologyCards";
import { SpeicherpilotDialog } from "@/app/components/dashboard/SpeicherpilotDialog";
import { calculateProject } from "@/app/lib/calculations";
import {
  createShowcaseProject,
  SHOWCASE_PROJECT_ID,
} from "@/app/lib/demo-project";
import { useProjectStore } from "@/lib/store";

export function DashboardView() {
  const searchParams = useSearchParams();
  const { currentProject, saveCurrentProject, loadShowcaseProject } =
    useProjectStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && searchParams.get("demo") === "showcase") {
      loadShowcaseProject();
    }
  }, [hydrated, searchParams, loadShowcaseProject]);

  const isShowcase =
    currentProject.id === SHOWCASE_PROJECT_ID ||
    searchParams.get("demo") === "showcase";
  const hasUserProject =
    Boolean(currentProject.name?.trim()) && !isShowcase;

  const activeProject = useMemo(() => {
    if (hasUserProject) return currentProject;
    if (isShowcase || !currentProject.name?.trim()) {
      return createShowcaseProject();
    }
    return currentProject;
  }, [hasUserProject, isShowcase, currentProject]);

  const result = useMemo(() => {
    if (!hydrated) return null;
    return calculateProject(activeProject);
  }, [hydrated, activeProject]);

  const canExportPdf = hasUserProject || isShowcase;

  if (!hydrated || !result) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col xl:flex-row">
      <DashboardProjectSidebar project={activeProject} result={result} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {isShowcase && <ShowcaseBanner />}

          {!hasUserProject && !isShowcase && (
            <div className="rounded-lg border border-[#06B6D4]/30 bg-[#06B6D4]/8 px-4 py-3 text-sm text-[#0F172A] dark:text-white">
              <Link href="/wizard" className="font-semibold text-[#06B6D4] underline">
                Neues Projekt starten
              </Link>{" "}
              oder{" "}
              <button
                type="button"
                className="font-semibold text-[#22C55E] underline"
                onClick={() => loadShowcaseProject()}
              >
                Demo Projekt laden
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-heading text-2xl font-bold text-[#0F172A] dark:text-white"
              >
                Simulation & Report
              </motion.h1>
              <p className="text-sm text-[#0F172A]/55 dark:text-white/60">
                Energiefluss · Wirtschaftlichkeit · CO₂-Bilanz
              </p>
            </div>
            <div id="report" className="flex flex-wrap gap-2 scroll-mt-24">
              <SpeicherpilotDialog />
              <PdfExportButton
                project={activeProject}
                result={result}
                disabled={!canExportPdf}
                disabledReason="Projekt oder Beispielprojekt laden"
                onBeforeExport={
                  canExportPdf ? saveCurrentProject : undefined
                }
              />
            </div>
          </div>

          <Card className="glass-card border-[#0F172A]/8">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-[#0F172A] dark:text-white">
                Energiefluss (Sankey)
                <span className="text-xs font-normal text-[#06B6D4]">
                  kWh/a · Strom / Wärme / Kälte
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnergySankey data={result.sankey} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card border-[#0F172A]/8">
              <CardHeader>
                <CardTitle className="text-base text-[#0F172A] dark:text-white">
                  Kumulierter Cashflow (20 J.)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CashflowChart data={result.cashflowYears} />
              </CardContent>
            </Card>

            <Card className="glass-card border-[#0F172A]/8">
              <CardHeader>
                <CardTitle className="text-base text-[#0F172A] dark:text-white">
                  Investition vs. Einsparung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostComparisonChart result={result} />
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-[#0F172A] dark:text-white">
              Technologie-Details
            </h2>
            <TechnologyCards details={result.technologyDetails} />
          </div>

          <div className="xl:hidden">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">KPIs</h2>
            <KpiCards
              result={result}
              targetPaybackYears={activeProject.targetPaybackYears}
            />
          </div>
        </div>

        <div className="hidden w-72 shrink-0 border-l border-[#0F172A]/8 bg-[#F8FAFC]/50 p-4 dark:bg-[#0F172A]/20 xl:block">
          <h2 className="mb-4 text-sm font-semibold text-[#06B6D4]">
            Kennzahlen
          </h2>
          <KpiCards
            result={result}
            targetPaybackYears={activeProject.targetPaybackYears}
          />
          <div className="mt-6 space-y-2">
            <ButtonLink
              href="/wizard"
              className="w-full bg-[#0F172A] text-white hover:bg-[#06B6D4] hover:text-[#0F172A]"
            >
              Konzept anpassen
            </ButtonLink>
            {!isShowcase && (
              <ButtonLink
                href="/dashboard?demo=showcase"
                variant="outline"
                className="w-full border-[#06B6D4] text-[#0F172A] dark:text-[#06B6D4]"
              >
                Demo Projekt laden
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
