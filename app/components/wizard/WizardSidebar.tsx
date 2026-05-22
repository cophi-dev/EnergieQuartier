"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { WIZARD_STEPS } from "@/app/lib/constants";
import { cn } from "@/lib/utils";

interface WizardSidebarProps {
  currentStep: number;
  maxReachedStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardSidebar({
  currentStep,
  maxReachedStep,
  onStepClick,
}: WizardSidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-[#0A4D68]/10 bg-white dark:bg-[#0A4D68]/30">
      <div className="p-6 border-b border-[#0A4D68]/10">
        <h2 className="text-sm font-semibold text-[#0A4D68] dark:text-white">
          Konfigurator
        </h2>
        <p className="mt-1 text-xs text-[#088395]">
          Schritt {currentStep} von {WIZARD_STEPS.length}
        </p>
      </div>

      <ol className="flex-1 p-4 space-y-1">
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
                  "w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                  active && "bg-[#0A4D68] text-white shadow-md",
                  !active && reachable && "hover:bg-[#088395]/10 text-[#0A4D68]",
                  !active && !reachable && "opacity-40 cursor-not-allowed text-[#0A4D68]/50",
                  done && !active && "text-[#088395]",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold border-2",
                    active && "border-[#00FFCA] bg-[#00FFCA]/20 text-white",
                    done && !active && "border-[#00FFCA] bg-[#00FFCA] text-[#0A4D68]",
                    !done && !active && "border-[#0A4D68]/20 bg-[#F5F8FA]",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight">{step.title}</p>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      active ? "text-white/70" : "text-[#088395]",
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

      <div className="p-4 border-t border-[#0A4D68]/10">
        <div className="h-1.5 rounded-full bg-[#0A4D68]/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#088395] to-[#00FFCA]"
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
