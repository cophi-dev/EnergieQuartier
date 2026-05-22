"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { TechnologyLibraryEntry } from "@/app/types/technology";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TechnologyCardProps {
  technology: TechnologyLibraryEntry;
  onSelect: (technology: TechnologyLibraryEntry) => void;
  index?: number;
}

export function TechnologyCard({
  technology,
  onSelect,
  index = 0,
}: TechnologyCardProps) {
  const Icon = technology.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelect(technology)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(technology);
          }
        }}
        className={cn(
          "gradient-border glass-card group h-full cursor-pointer border-[#0F172A]/8 transition-shadow",
          "hover:shadow-lg hover:shadow-[#06B6D4]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]",
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
                technology.accent,
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <Badge
              variant="outline"
              className="border-[#06B6D4]/30 text-[10px] text-[#06B6D4]"
            >
              {technology.categoryLabel}
            </Badge>
          </div>
          <CardTitle className="mt-3 text-lg text-[#0F172A] dark:text-white">
            {technology.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {technology.shortDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#0F172A]/5 text-[#0F172A] dark:bg-white/10 dark:text-white">
              {technology.efficiency.label}: {technology.efficiency.value}
            </Badge>
            {technology.configurableInWizard && (
              <Badge className="bg-[#22C55E]/15 text-[#15803D] dark:text-[#22C55E]">
                Im Konfigurator
              </Badge>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm font-medium text-[#06B6D4] opacity-0 transition-opacity group-hover:opacity-100">
            Mehr erfahren
            <ArrowRight className="h-4 w-4" />
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
