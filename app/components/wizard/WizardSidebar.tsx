"use client";

import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WIZARD_STEPS } from "@/app/lib/constants";
import { cn } from "@/lib/utils";

interface WizardSidebarProps {
  currentStep: number;
  maxReachedStep: number;
  onStepClick?: (step: number) => void;
  onLoadDemo?: () => void;
}

export function WizardSidebar({
  currentStep,
  maxReachedStep,
  onStepClick,
  onLoadDemo,
}: WizardSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-[#0F172A]/8 glass lg:flex">
      <div className="border-b border-[#0F172A]/8 p-6">
        <h2 className="font-heading text-sm font-semibold text-[#0F172A] dark:text-white">
          Konfigurator
        </h2>
        <p className="mt-1 text-xs text-[#06B6D4]">
          Schritt {currentStep} von {WIZARD_STEPS.length}
        </p>
      </div>

      <ol className="flex-1 space-y-1 p-4">
        {WIZARD_STEPS.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const reachable = step.id <= maxReachedStep;

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable || !onStepClick}
                onClick={() => reachable && onStepClick?.(step.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                  active && "bg-[#0F172A] text-white shadow-md dark:bg-[#06B6D4] dark:text-[#0F172A]",
                  !active && reachable && "text-[#0F172A] hover:bg-[#06B6D4]/10",
                  !active && !reachable && "cursor-not-allowed text-[#0F172A]/40 opacity-40",
                  done && !active && "text-[#06B6D4]",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                    active && "border-[#22C55E] bg-[#22C55E]/20 text-white dark:text-[#0F172A]",
                    done && !active && "border-[#22C55E] bg-[#22C55E] text-[#0F172A]",
                    !done && !active && "border-[#0F172A]/15 bg-[#F8FAFC] dark:bg-[#0F172A]/40",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight">{step.title}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      active ? "text-white/70 dark:text-[#0F172A]/70" : "text-[#06B6D4]",
                    )}
                  >
                    {step.short}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="space-y-3 border-t border-[#0F172A]/8 p-4">
        {onLoadDemo && (
          <Button
            type="button"
            variant="outline"
            onClick={onLoadDemo}
            className="w-full border-[#06B6D4] text-[#0F172A] hover:bg-[#06B6D4]/10 dark:text-[#06B6D4]"
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            Demo Wilhelmsburg laden
          </Button>
        )}
        <div className="h-1.5 overflow-hidden rounded-full bg-[#0F172A]/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22C55E]"
            initial={false}
            animate={{
              width: `${(currentStep / WIZARD_STEPS.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </aside>
  );
}
