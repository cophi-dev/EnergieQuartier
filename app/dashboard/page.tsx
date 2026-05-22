import { Suspense } from "react";
import { DashboardView } from "@/app/components/dashboard/DashboardView";
import { DashboardSkeleton } from "@/app/components/dashboard/DashboardSkeleton";

export const metadata = {
  title: "Simulation & Report | EnergieQuartier",
  description: "Ergebnis-Dashboard mit Sankey, KPIs und Wirtschaftlichkeit",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
