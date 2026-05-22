"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerInsights } from "@/app/lib/customer-insights";

interface CustomerCo2SectionProps {
  insights: CustomerInsights;
}

export function CustomerCo2Section({ insights }: CustomerCo2SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-card h-full border-[#22C55E]/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[#0F172A] dark:text-white">
            <Leaf className="h-5 w-5 text-[#22C55E]" />
            {insights.co2Headline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between gap-4 rounded-xl bg-gradient-to-r from-[#64748B]/15 via-[#06B6D4]/10 to-[#22C55E]/15 p-4">
            {insights.co2Highlights.map((h, i) => (
              <div key={h.label} className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-[#0F172A]/55">
                  {h.label}
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    i === 2
                      ? "text-[#22C55E]"
                      : "text-[#0F172A] dark:text-white"
                  }`}
                >
                  {h.value}
                </p>
              </div>
            ))}
          </div>
          {insights.co2Paragraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="text-sm leading-relaxed text-[#0F172A]/75 dark:text-white/75"
            >
              {p}
            </p>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
