import { Suspense } from "react";
import { DashboardView } from "@/app/components/dashboard/DashboardView";
import { DashboardSkeleton } from "@/app/components/dashboard/DashboardSkeleton";

export const metadata = {
  title: "Ihr Energie-Konzept | EnergieQuartier",
  description:
    "Ergebnis-Report mit Szenario-Vergleich, Kosten, CO₂ und nächsten Schritten – verständlich für Entscheider.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
