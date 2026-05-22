"use client";

import { Building2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Teaser für Quartiersmodellierung (geplant) */
export function QuartierComingSoon() {
  return (
    <Card className="border-dashed border-[#06B6D4]/35 bg-[#06B6D4]/5">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F172A]/10 text-[#06B6D4]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-[#0F172A] dark:text-white">
              Quartiersplanung – demnächst
            </p>
            <p className="text-sm text-[#0F172A]/60 dark:text-white/60">
              Mehrere Gebäude und kleine Nahwärmenetze in einem Modell – ideal
              für Projektentwickler und kommunale Wärmeplanung.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#06B6D4]/30 px-3 py-1 text-xs font-medium text-[#06B6D4]">
          <Clock className="h-3.5 w-3.5" />
          In Planung
        </span>
      </CardContent>
    </Card>
  );
}
