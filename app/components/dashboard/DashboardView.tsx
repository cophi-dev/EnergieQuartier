"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfExportButton } from "@/app/components/dashboard/PdfExportButton";
import { DashboardProjectSidebar } from "@/app/components/dashboard/DashboardProjectSidebar";
import { HewInterviewBanner } from "@/app/components/dashboard/HewInterviewBanner";
import { KpiCards } from "@/app/components/dashboard/KpiCards";
import { EnergySankey } from "@/app/components/dashboard/EnergySankey";
import { CashflowChart } from "@/app/components/dashboard/CashflowChart";
import { CostComparisonChart } from "@/app/components/dashboard/CostComparisonChart";
import { TechnologyCards } from "@/app/components/dashboard/TechnologyCards";
import { SpeicherpilotDialog } from "@/app/components/dashboard/SpeicherpilotDialog";
import { calculateProject } from "@/app/lib/calculations";
import {
  createHewShowcaseProject,
  HEW_SHOWCASE_PROJECT_ID,
} from "@/app/lib/demo-project";
import { useProjectStore } from "@/lib/store";

export function DashboardView() {
  const searchParams = useSearchParams();
  const { currentProject, saveCurrentProject, loadShowcaseProject } =
    useProjectStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && searchParams.get("demo") === "hew") {
      loadShowcaseProject();
    }
  }, [hydrated, searchParams, loadShowcaseProject]);

  const isShowcase =
    currentProject.id === HEW_SHOWCASE_PROJECT_ID ||
    searchParams.get("demo") === "hew";
  const hasUserProject =
    Boolean(currentProject.name?.trim()) && !isShowcase;

  const activeProject = useMemo(() => {
    if (hasUserProject) return currentProject;
    if (isShowcase || !currentProject.name?.trim()) {
      return createHewShowcaseProject();
    }
    return currentProject;
  }, [hasUserProject, isShowcase, currentProject]);

  const result = useMemo(() => {
    if (!hydrated) return null;
    return calculateProject(activeProject);
  }, [hydrated, activeProject]);

  const canExportPdf = hasUserProject || isShowcase;

  if (!hydrated || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#0A4D68]">
        Simulation wird berechnet …
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col xl:flex-row">
      <DashboardProjectSidebar project={activeProject} result={result} />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {isShowcase && <HewInterviewBanner />}

          {!hasUserProject && !isShowcase && (
            <div className="rounded-lg border border-[#00FFCA]/50 bg-[#00FFCA]/10 px-4 py-3 text-sm text-[#0A4D68]">
              <Link href="/wizard" className="font-semibold underline">
                Neues Projekt starten
              </Link>{" "}
              oder{" "}
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => loadShowcaseProject()}
              >
                HEW-Demo laden
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-[#0A4D68] dark:text-white"
              >
                Simulation & Report
              </motion.h1>
              <p className="text-sm text-[#0A4D68]/60 dark:text-white/60">
                Energiefluss · Wirtschaftlichkeit · CO₂-Bilanz
              </p>
            </div>
            <div id="report" className="flex flex-wrap gap-2 scroll-mt-24">
              <SpeicherpilotDialog />
              <PdfExportButton
                project={activeProject}
                result={result}
                disabled={!canExportPdf}
                disabledReason="Projekt oder HEW-Demo laden"
                onBeforeExport={
                  canExportPdf ? saveCurrentProject : undefined
                }
              />
            </div>
          </div>

          <Card className="border-[#0A4D68]/10">
            <CardHeader>
              <CardTitle className="text-[#0A4D68] dark:text-white flex items-center justify-between gap-2 flex-wrap">
                Energiefluss (Sankey)
                <span className="text-xs font-normal text-[#088395]">
                  kWh/a · Strom / Wärme / Kälte
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnergySankey data={result.sankey} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-[#0A4D68]/10">
              <CardHeader>
                <CardTitle className="text-base text-[#0A4D68] dark:text-white">
                  Kumulierter Cashflow (20 J.)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CashflowChart data={result.cashflowYears} />
              </CardContent>
            </Card>

            <Card className="border-[#0A4D68]/10">
              <CardHeader>
                <CardTitle className="text-base text-[#0A4D68] dark:text-white">
                  Investition vs. Einsparung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostComparisonChart result={result} />
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#0A4D68] dark:text-white mb-4">
              Technologie-Details
            </h2>
            <TechnologyCards details={result.technologyDetails} />
          </div>

          <div className="xl:hidden">
            <h2 className="text-lg font-semibold text-[#0A4D68] mb-4">KPIs</h2>
            <KpiCards
              result={result}
              targetPaybackYears={activeProject.targetPaybackYears}
            />
          </div>
        </div>

        <div className="hidden xl:block w-72 shrink-0 border-l border-[#0A4D68]/10 bg-[#F5F8FA]/50 dark:bg-[#0A4D68]/10 p-4">
          <h2 className="text-sm font-semibold text-[#088395] mb-4">
            Kennzahlen
          </h2>
          <KpiCards
            result={result}
            targetPaybackYears={activeProject.targetPaybackYears}
          />
          <div className="mt-6 space-y-2">
            <ButtonLink
              href="/wizard"
              className="w-full bg-[#0A4D68] text-white"
            >
              Konzept anpassen
            </ButtonLink>
            {!isShowcase && (
              <ButtonLink
                href="/dashboard?demo=hew"
                variant="outline"
                className="w-full border-[#088395] text-[#0A4D68]"
              >
                HEW-Demo laden
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
