"use client";

import { Sparkles } from "lucide-react";
import {
  HEW_SHOWCASE_KPI_PREVIEW,
  HEW_SHOWCASE_SUMMARY,
} from "@/app/lib/demo-project";

export function HewInterviewBanner() {
  return (
    <div className="rounded-xl border border-[#06B6D4]/30 bg-gradient-to-r from-[#0F172A] to-[#0F172A]/90 px-4 py-4 text-white shadow-md sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
          <div>
            <p className="font-semibold">HEW-Vertriebsdemo aktiv</p>
            <p className="mt-0.5 text-sm text-white/75">
              {HEW_SHOWCASE_SUMMARY} · PV + Luft-WP + Speicher + Solarthermie
            </p>
          </div>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-white/55">Amortisation</dt>
            <dd className="font-bold text-[#06B6D4]">
              {HEW_SHOWCASE_KPI_PREVIEW.paybackYears}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-white/55">CO₂</dt>
            <dd className="font-bold text-[#22C55E]">
              {HEW_SHOWCASE_KPI_PREVIEW.co2Savings}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-white/55">NPV</dt>
            <dd className="font-bold text-[#06B6D4]">
              {HEW_SHOWCASE_KPI_PREVIEW.npv}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-white/55">Autarkie</dt>
            <dd className="font-bold text-[#22C55E]">
              {HEW_SHOWCASE_KPI_PREVIEW.autarky}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
