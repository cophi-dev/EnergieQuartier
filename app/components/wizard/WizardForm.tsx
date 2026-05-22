"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { WizardSidebar } from "@/app/components/wizard/WizardSidebar";
import { Step1Building } from "@/app/components/wizard/steps/Step1Building";
import { Step2Consumption } from "@/app/components/wizard/steps/Step2Consumption";
import { Step3Priorities } from "@/app/components/wizard/steps/Step3Priorities";
import { Step4Technology } from "@/app/components/wizard/steps/Step4Technology";
import { Step5Details } from "@/app/components/wizard/steps/Step5Details";
import { WIZARD_STEPS } from "@/app/lib/constants";
import {
  normalizePriorities,
  WIZARD_STEP_FIELDS,
  wizardFormSchema,
  type WizardFormValues,
} from "@/app/lib/wizard-schema";
import { useProjectStore } from "@/lib/store";
import type { ProjectData } from "@/app/types/project";

const TOTAL_STEPS = WIZARD_STEPS.length;

function projectToFormValues(project: ProjectData): WizardFormValues {
  return {
    name: project.name,
    address: project.address,
    postalCode: project.postalCode,
    buildingType: project.buildingType,
    livingArea: project.livingArea,
    usableArea: project.usableArea,
    yearBuilt: project.yearBuilt,
    renovationStatus: project.renovationStatus,
    electricityKwh: project.electricityKwh,
    heatKwh: project.heatKwh,
    priorities: { ...project.priorities },
    technologies: { ...project.technologies },
    budget: project.budget,
    targetPaybackYears: project.targetPaybackYears,
    notes: project.notes ?? "",
  };
}

function formValuesToProject(
  values: WizardFormValues,
  existing: ProjectData,
): ProjectData {
  return {
    ...existing,
    ...values,
    priorities: normalizePriorities(values.priorities),
    notes: values.notes ?? "",
    updatedAt: new Date().toISOString(),
  };
}

export function WizardForm() {
  const router = useRouter();
  const { currentProject, setCurrentProject, saveCurrentProject } =
    useProjectStore();
  const [step, setStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardFormSchema),
    defaultValues: projectToFormValues(currentProject),
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      reset(projectToFormValues(currentProject));
    }
    // Nur beim ersten Laden / Projektwechsel synchronisieren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, currentProject.id]);

  const prioritiesWatch = useWatch({ control, name: "priorities" });
  const normalizedPreview = useMemo(
    () =>
      normalizePriorities(
        prioritiesWatch ?? { cost: 50, co2: 30, autarky: 20 },
      ),
    [prioritiesWatch],
  );

  const syncToStore = useCallback(() => {
    const values = getValues();
    setCurrentProject(
      formValuesToProject(values, currentProject) as Partial<ProjectData>,
    );
  }, [getValues, setCurrentProject, currentProject]);

  const goToStep = async (target: number) => {
    if (target > step) {
      const valid = await trigger(WIZARD_STEP_FIELDS[step]);
      if (!valid) return;
      if (step === 3) {
        const normalized = normalizePriorities(getValues("priorities"));
        form.setValue("priorities", normalized);
      }
      syncToStore();
    }
    setStep(target);
    setMaxReachedStep((m) => Math.max(m, target));
  };

  const handleNext = async () => {
    const valid = await trigger(WIZARD_STEP_FIELDS[step]);
    if (!valid) return;

    if (step === 3) {
      const normalized = normalizePriorities(getValues("priorities"));
      form.setValue("priorities", normalized);
    }

    syncToStore();

    if (step < TOTAL_STEPS) {
      const next = step + 1;
      setStep(next);
      setMaxReachedStep((m) => Math.max(m, next));
    }
  };

  const handleBack = () => {
    syncToStore();
    if (step > 1) setStep(step - 1);
  };

  const onCalculate = handleSubmit((values) => {
    const project = formValuesToProject(values, currentProject);
    setCurrentProject(project);
    saveCurrentProject();
    router.push("/dashboard");
  });

  const progressPercent = (step / TOTAL_STEPS) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Building control={control} errors={errors} />;
      case 2:
        return (
          <Step2Consumption
            control={control}
            errors={errors}
            setValue={form.setValue}
          />
        );
      case 3:
        return (
          <Step3Priorities
            control={control}
            errors={errors}
            normalizedPreview={normalizedPreview}
          />
        );
      case 4:
        return (
          <Step4Technology
            control={control}
            errors={errors}
            setValue={form.setValue}
          />
        );
      case 5:
        return <Step5Details control={control} errors={errors} />;
      default:
        return null;
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#0A4D68]">
        Konfigurator wird geladen …
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <WizardSidebar
        currentStep={step}
        maxReachedStep={maxReachedStep}
        onStepClick={(s) => void goToStep(s)}
      />

      <div className="flex flex-1 flex-col">
        {/* Mobile Progress */}
        <div className="lg:hidden border-b border-[#0A4D68]/10 bg-white px-4 py-3 dark:bg-[#0A4D68]/30">
          <div className="flex justify-between text-xs text-[#088395] mb-2">
            <span>
              Schritt {step}/{TOTAL_STEPS}
            </span>
            <span>{WIZARD_STEPS[step - 1]?.title}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <form
          onSubmit={onCalculate}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Card className="max-w-3xl mx-auto border-[#0A4D68]/10 shadow-sm">
              <CardContent className="pt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="sticky bottom-0 border-t border-[#0A4D68]/10 bg-white/95 backdrop-blur px-4 py-4 sm:px-6 dark:bg-[#0A4D68]/90">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="border-[#0A4D68]/20 text-[#0A4D68]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>

              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={() => void handleNext()}
                  className="bg-[#088395] hover:bg-[#0A4D68] text-white"
                >
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#0A4D68] hover:bg-[#088395] text-white"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Berechnen
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
