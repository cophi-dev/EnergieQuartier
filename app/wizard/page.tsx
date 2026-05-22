import { Suspense } from "react";
import { WizardForm } from "@/app/components/wizard/WizardForm";
import { WizardFormSkeleton } from "@/app/components/wizard/WizardFormSkeleton";

export const metadata = {
  title: "Konfigurator | EnergieQuartier",
  description: "5-Schritte-Wizard für dezentrale Energiekonzepte",
};

export default function WizardPage() {
  return (
    <Suspense fallback={<WizardFormSkeleton />}>
      <WizardForm />
    </Suspense>
  );
}
