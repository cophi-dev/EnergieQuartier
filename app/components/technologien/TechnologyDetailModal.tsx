"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  MinusCircle,
  Sparkles,
  Target,
} from "lucide-react";
import type { TechnologyLibraryEntry } from "@/app/types/technology";
import { TechnologyAdvisorNote } from "@/app/components/advisor/TechnologyAdvisorNote";
import { calculateProject } from "@/app/lib/calculations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useProjectStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface TechnologyDetailModalProps {
  technology: TechnologyLibraryEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TechnologyDetailModal({
  technology,
  open,
  onOpenChange,
}: TechnologyDetailModalProps) {
  const router = useRouter();
  const currentProject = useProjectStore((s) => s.currentProject);
  const startWizardWithTechnologies = useProjectStore(
    (s) => s.startWizardWithTechnologies,
  );

  const hasPersonalizedContext = Boolean(
    currentProject.name?.trim() && currentProject.postalCode?.trim(),
  );
  const projectResult = useMemo(() => {
    if (!hasPersonalizedContext) return null;
    return calculateProject(currentProject);
  }, [hasPersonalizedContext, currentProject]);

  if (!technology) return null;

  const Icon = technology.icon;

  const handleWizardStart = () => {
    if (technology.wizardMapping) {
      startWizardWithTechnologies(technology.wizardMapping);
      router.push("/wizard?step=4");
    } else {
      router.push("/wizard");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                technology.accent,
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 pr-6">
              <Badge
                variant="outline"
                className="border-[#06B6D4]/30 text-[#06B6D4]"
              >
                {technology.categoryLabel}
              </Badge>
              <DialogTitle className="text-xl">{technology.name}</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {technology.shortDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC]/80 p-4 dark:bg-[#0F172A]/40">
              <p className="text-xs font-medium uppercase tracking-wide text-[#06B6D4]">
                Investition 2026
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A] dark:text-white">
                {technology.costs.investment}
              </p>
            </div>
            <div className="rounded-xl border border-[#0F172A]/8 bg-[#F8FAFC]/80 p-4 dark:bg-[#0F172A]/40">
              <p className="text-xs font-medium uppercase tracking-wide text-[#06B6D4]">
                Betrieb pro Jahr
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A] dark:text-white">
                {technology.costs.operating}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-4">
            <p className="text-sm font-medium text-[#0F172A] dark:text-white">
              {technology.efficiency.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#22C55E]">
              {technology.efficiency.value}
            </p>
            {technology.efficiency.hint && (
              <p className="mt-1 text-xs text-[#0F172A]/60 dark:text-white/60">
                {technology.efficiency.hint}
              </p>
            )}
          </section>

          {hasPersonalizedContext && projectResult ? (
            <TechnologyAdvisorNote
              project={currentProject}
              result={projectResult}
              technologyId={technology.id}
              technologyName={technology.name}
            />
          ) : (
            <div className="rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 p-4">
              <p className="text-sm text-[#0F172A]/80 dark:text-white/80">
                Legen Sie im{" "}
                <Link href="/wizard" className="font-medium text-[#06B6D4] underline">
                  Konfigurator
                </Link>{" "}
                ein Projekt an – dann erhalten Sie hier eine personalisierte
                Einschätzung, ob {technology.name} zu Ihrem Objekt passt.
              </p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F172A] dark:text-white">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                Vorteile
              </h3>
              <ul className="space-y-2">
                {technology.advantages.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-[#0F172A]/80 dark:text-white/80"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F172A] dark:text-white">
                <MinusCircle className="h-4 w-4 text-[#64748B]" />
                Nachteile
              </h3>
              <ul className="space-y-2">
                {technology.disadvantages.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-[#0F172A]/80 dark:text-white/80"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#64748B]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <Separator />

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F172A] dark:text-white">
              <Target className="h-4 w-4 text-[#06B6D4]" />
              Wann besonders sinnvoll
            </h3>
            <ul className="space-y-2">
              {technology.bestFor.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-[#0F172A]/6 bg-white/50 px-3 py-2 text-sm dark:bg-[#0F172A]/30"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F172A] dark:text-white">
              <Sparkles className="h-4 w-4 text-[#06B6D4]" />
              Typische Anwendungsfälle
            </h3>
            <ul className="space-y-2">
              {technology.useCases.map((item) => (
                <li
                  key={item}
                  className="text-sm text-[#0F172A]/75 dark:text-white/75"
                >
                  · {item}
                </li>
              ))}
            </ul>
          </section>

          {!technology.configurableInWizard && (
            <div className="flex gap-3 rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#06B6D4]" />
              <p className="text-sm text-[#0F172A]/80 dark:text-white/80">
                Diese Technologie ist derzeit nicht im Konfigurator
                durchrechenbar – ideal für die Erstberatung und
                Quartiersplanung. Im Konfigurator können Sie ergänzende
                Technologien kombinieren.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#0F172A]/15"
          >
            Schließen
          </Button>
          <Button
            onClick={handleWizardStart}
            className="bg-[#06B6D4] text-[#0F172A] hover:bg-[#22C55E]"
          >
            Passt das zu mir?
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
