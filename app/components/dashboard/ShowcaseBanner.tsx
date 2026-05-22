"use client";

import { Sparkles } from "lucide-react";
import { SHOWCASE_SUMMARY } from "@/app/lib/demo-project";

export function ShowcaseBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#06B6D4]/25 bg-[#06B6D4]/8 px-4 py-3">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" />
      <div>
        <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
          Beispielprojekt · MFH Wilhelmsburg
        </p>
        <p className="mt-0.5 text-xs text-[#0F172A]/65 dark:text-white/65">
          {SHOWCASE_SUMMARY} · PV + Luft-WP + Speicher
        </p>
      </div>
    </div>
  );
}
