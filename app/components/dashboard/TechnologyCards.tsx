"use client";

import { motion } from "framer-motion";
import {
  Battery,
  Droplets,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TechnologyDetail } from "@/app/types/calculation";

const ICONS: Record<string, typeof Sun> = {
  pv: Sun,
  "hp-air": Wind,
  "hp-ground": Thermometer,
  battery: Battery,
  "solar-thermal": Droplets,
};

interface TechnologyCardsProps {
  details: TechnologyDetail[];
}

export function TechnologyCards({ details }: TechnologyCardsProps) {
  if (details.length === 0) {
    return (
      <p className="text-sm text-[#0F172A]/55">
        Keine Technologien ausgewählt.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {details.map((tech, i) => {
        const Icon = ICONS[tech.id] ?? Sun;
        return (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3, scale: 1.01 }}
          >
            <Card className="gradient-border glass-card h-full border-[#0F172A]/8">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F172A] to-[#06B6D4] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-[#0F172A] dark:text-white">
                    {tech.name}
                  </CardTitle>
                  <p className="text-xs text-[#06B6D4]">{tech.headline}</p>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1.5">
                  {tech.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex justify-between text-sm"
                    >
                      <dt className="text-[#0F172A]/55">{spec.label}</dt>
                      <dd className="font-medium text-[#0F172A] dark:text-white">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
