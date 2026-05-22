import { Suspense } from "react";
import { TechnologyExplorer } from "@/app/components/technologien/TechnologyExplorer";

export const metadata = {
  title: "Technologien entdecken | EnergieQuartier",
  description:
    "Energie-Technologien verständlich erklärt: Wärmepumpen, PV, Solarthermie, Nahwärme und mehr – für Hamburg und den Norden.",
};

function TechnologienFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center text-[#0F172A]/55">
      Technologien werden geladen …
    </div>
  );
}

export default function TechnologienPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#F8FAFC] via-white to-[#06B6D4]/5 dark:from-[#020617] dark:via-[#020617] dark:to-[#06B6D4]/5">
      <Suspense fallback={<TechnologienFallback />}>
        <TechnologyExplorer />
      </Suspense>
    </div>
  );
}
