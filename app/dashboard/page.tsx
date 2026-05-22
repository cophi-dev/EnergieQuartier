import { Suspense } from "react";
import { DashboardView } from "@/app/components/dashboard/DashboardView";

export const metadata = {
  title: "Simulation & Report | EnergieQuartier",
  description: "Ergebnis-Dashboard mit Sankey, KPIs und Wirtschaftlichkeit",
};

function DashboardFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-[#0A4D68]">
      Simulation wird geladen …
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardView />
    </Suspense>
  );
}
