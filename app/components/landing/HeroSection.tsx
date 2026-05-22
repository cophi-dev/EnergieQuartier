"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  MapPin,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { AnimatedNumber } from "@/app/components/ui/AnimatedNumber";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/app/lib/constants";
import { SHOWCASE_KPI_PREVIEW } from "@/app/lib/demo-project";
import { ShowcaseCta } from "@/app/components/landing/ShowcaseCta";
import { HeroBackground } from "@/app/components/landing/HeroBackground";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const heroKpis = [
  {
    label: "Amortisation",
    raw: parseFloat(SHOWCASE_KPI_PREVIEW.paybackYears.replace(",", ".")),
    suffix: " J.",
    color: "#06B6D4",
    decimals: 1,
  },
  {
    label: "CO₂-Einsparung",
    display: SHOWCASE_KPI_PREVIEW.co2Savings,
    color: "#22C55E",
  },
  {
    label: "NPV (20 J.)",
    display: SHOWCASE_KPI_PREVIEW.npv,
    color: "#0F172A",
  },
  {
    label: "Autarkie",
    raw: parseFloat(SHOWCASE_KPI_PREVIEW.autarky),
    suffix: " %",
    color: "#06B6D4",
    decimals: 0,
  },
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-white to-[#06B6D4]/8 dark:from-[#020617] dark:via-[#0F172A] dark:to-[#06B6D4]/15">
      <HeroBackground />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28 lg:px-8">
        <div>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Badge className="mb-4 glass border-[#06B6D4]/30 text-[#0F172A] dark:text-[#06B6D4] hover:bg-[#06B6D4]/10">
              <MapPin className="mr-1.5 h-3 w-3" />
              Konzeptstudien für Mehrfamilienhäuser & Quartiere
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-heading text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08] dark:text-white"
          >
            Dezentrale Energiekonzepte{" "}
            <span className="bg-gradient-to-r from-[#06B6D4] to-[#22C55E] bg-clip-text text-transparent">
              in Minuten
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-xl text-lg leading-relaxed text-[#0F172A]/70 dark:text-white/75"
          >
            {BRAND.slogan}. Von der Erstberatung bis zum PDF-Report – alles in
            einem Tool, ohne Excel und ohne Medienbruch.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <ButtonLink
              href="/wizard"
              size="lg"
              className="h-12 bg-[#0F172A] px-8 text-white shadow-lg shadow-[#0F172A]/20 hover:bg-[#06B6D4] hover:text-[#0F172A] transition-colors"
            >
              Neues Projekt starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ShowcaseCta />
          </motion.div>

          <motion.ul
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-wrap gap-6 text-sm text-[#0F172A]/55 dark:text-white/65"
          >
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#06B6D4]" />
              5-Schritte-Wizard
            </li>
            <li className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#22C55E]" />
              Sankey & KPIs
            </li>
            <li className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-[#22C55E]" />
              CO₂ & NPV
            </li>
          </motion.ul>
        </div>

        {/* Hero-Visual: Glassmorphism Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="relative"
        >
          <div className="gradient-border glass-card rounded-2xl p-6 shadow-2xl shadow-[#0F172A]/10">
            <div className="flex items-center justify-between border-b border-[#0F172A]/8 pb-4 dark:border-white/10">
              <span className="text-sm font-semibold text-[#0F172A] dark:text-white">
                MFH Hammerbrook · Beispielprojekt
              </span>
              <span className="rounded-full bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-medium text-[#22C55E] ring-1 ring-[#22C55E]/30">
                20097 HH
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {heroKpis.map((kpi) => (
                <motion.div
                  key={kpi.label}
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="glass rounded-xl p-3"
                >
                  <div
                    className="mb-2 h-1 w-8 rounded-full"
                    style={{ backgroundColor: kpi.color }}
                  />
                  <p className="text-xs text-[#0F172A]/55 dark:text-white/55">
                    {kpi.label}
                  </p>
                  <p className="text-lg font-bold text-[#0F172A] dark:text-[#06B6D4]">
                    {"display" in kpi ? (
                      kpi.display
                    ) : (
                      <>
                        <AnimatedNumber
                          value={kpi.raw}
                          decimals={kpi.decimals}
                        />
                        {kpi.suffix}
                      </>
                    )}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex h-28 items-end justify-around rounded-xl bg-gradient-to-r from-[#0F172A]/5 via-[#06B6D4]/15 to-[#22C55E]/20 px-4 pb-3">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-6 rounded-t bg-gradient-to-t from-[#06B6D4] to-[#22C55E]"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-[#0F172A]/45 dark:text-white/45">
              Energiefluss · Wirtschaftlichkeit · Technikmix
            </p>
          </div>

          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-4 rounded-lg bg-gradient-to-r from-[#06B6D4] to-[#22C55E] px-3 py-2 text-xs font-semibold text-[#0F172A] shadow-lg"
          >
            PDF-Report inklusive
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
