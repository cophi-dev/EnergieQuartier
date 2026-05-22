"use client";

import { Sparkles } from "lucide-react";
import { HEW_SHOWCASE_KPI_PREVIEW } from "@/app/lib/demo-project";

export function HewInterviewBanner() {
  return (
    <div className="rounded-xl border border-[#00FFCA]/40 bg-gradient-to-r from-[#0A4D68] to-[#088395] px-4 py-4 text-white shadow-md sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[#00FFCA] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">HEW-Vertriebsdemo aktiv</p>
            <p className="mt-0.5 text-sm text-white/80">
              MFH Elbchaussee · PV + Luft-WP + Speicher + Solarthermie – festes
              Showcase für Ihr Gespräch.
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4 shrink-0">
          <div>
            <dt className="text-white/60 text-xs">Amortisation</dt>
            <dd className="font-bold text-[#00FFCA]">
              {HEW_SHOWCASE_KPI_PREVIEW.paybackYears}
            </dd>
          </div>
          <div>
            <dt className="text-white/60 text-xs">CO₂</dt>
            <dd className="font-bold text-[#00FFCA]">
              {HEW_SHOWCASE_KPI_PREVIEW.co2Savings}
            </dd>
          </div>
          <div>
            <dt className="text-white/60 text-xs">NPV</dt>
            <dd className="font-bold text-[#00FFCA]">
              {HEW_SHOWCASE_KPI_PREVIEW.npv}
            </dd>
          </div>
          <div>
            <dt className="text-white/60 text-xs">Autarkie</dt>
            <dd className="font-bold text-[#00FFCA]">
              {HEW_SHOWCASE_KPI_PREVIEW.autarky}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
