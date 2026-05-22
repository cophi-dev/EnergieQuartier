"use client";

import { Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AdvisorTextStatus } from "@/app/hooks/useAdvisorText";

interface AdvisorTextBlockProps {
  text: string;
  status: AdvisorTextStatus;
  onRegenerate: () => void;
  className?: string;
  /** Mehrzeiliger Text (z. B. nächste Schritte) */
  multiline?: boolean;
  /** Erstes Laden ohne Cache */
  isInitialLoad?: boolean;
}

export function AdvisorTextBlock({
  text,
  status,
  onRegenerate,
  className,
  multiline = false,
  isInitialLoad = false,
}: AdvisorTextBlockProps) {
  const loading = status === "loading";

  return (
    <div className={cn("relative", className)}>
      <div className="absolute right-0 top-0">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-[#0F172A]/35 hover:text-[#06B6D4] dark:text-white/35"
                onClick={onRegenerate}
                disabled={loading}
                aria-label="Text neu formulieren"
              />
            }
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCw className="h-3.5 w-3.5" />
            )}
          </TooltipTrigger>
          <TooltipContent>Text neu formulieren</TooltipContent>
        </Tooltip>
      </div>

      {loading && isInitialLoad ? (
        <div className="space-y-2 pr-8">
          <div className="h-3 w-full animate-pulse rounded bg-[#0F172A]/8 dark:bg-white/10" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[#0F172A]/8 dark:bg-white/10" />
        </div>
      ) : multiline ? (
        <div className="space-y-2 pr-8 text-sm leading-relaxed text-[#0F172A]/75 dark:text-white/75">
          {text.split("\n").map((line) => (
            <p key={line.slice(0, 32)}>{line}</p>
          ))}
        </div>
      ) : (
        <p className="pr-8 text-sm leading-relaxed text-[#0F172A]/75 dark:text-white/75">
          {text}
        </p>
      )}
    </div>
  );
}
