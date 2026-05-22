"use client";

import { cn } from "@/lib/utils";
import type { AdvisorTextStatus } from "@/app/hooks/useAdvisorText";

interface AdvisorTextBlockProps {
  text: string;
  status: AdvisorTextStatus;
  className?: string;
  /** Mehrzeiliger Text (z. B. nächste Schritte) */
  multiline?: boolean;
  /** Erstes Laden ohne Cache */
  isInitialLoad?: boolean;
}

export function AdvisorTextBlock({
  text,
  status,
  className,
  multiline = false,
  isInitialLoad = false,
}: AdvisorTextBlockProps) {
  const loading = status === "loading";

  if (loading && isInitialLoad) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-3 w-full animate-pulse rounded bg-[#0F172A]/8 dark:bg-white/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-[#0F172A]/8 dark:bg-white/10" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-[#0F172A]/8 dark:bg-white/10" />
      </div>
    );
  }

  if (multiline) {
    return (
      <div
        className={cn(
          "space-y-2 text-sm leading-relaxed text-[#0F172A]/75 dark:text-white/75",
          className,
        )}
      >
        {text.split("\n").map((line) => (
          <p key={line.slice(0, 32)}>{line}</p>
        ))}
      </div>
    );
  }

  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-[#0F172A]/75 dark:text-white/75",
        className,
      )}
    >
      {text}
    </p>
  );
}
