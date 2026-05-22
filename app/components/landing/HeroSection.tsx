"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Leaf,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/app/lib/constants";
import { HEW_SHOWCASE_KPI_PREVIEW } from "@/app/lib/demo-project";
import { ShowcaseCta } from "@/app/components/landing/ShowcaseCta";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F8FA] via-white to-[#00FFCA]/5 dark:from-[#0A4D68] dark:via-[#0A4D68] dark:to-[#088395]/30">
      {/* Dekorative Hintergrund-Elemente */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#00FFCA]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#088395]/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24 lg:px-8">
        <div>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <Badge className="mb-4 bg-[#088395]/15 text-[#0A4D68] border-[#088395]/30 hover:bg-[#088395]/20">
              Für den Vertrieb · Hamburger Energiewerke
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-bold tracking-tight text-[#0A4D68] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1] dark:text-white"
          >
            Dezentrale Energiekonzepte{" "}
            <span className="text-[#088395]">in Minuten</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-xl text-lg text-[#0A4D68]/70 dark:text-white/80"
          >
            {BRAND.slogan}. Erstellen Sie PV-, Wärmepumpen- und Speicherkonzepte
            mit Wirtschaftlichkeitsbetrachtung – direkt im Kundengespräch.
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
              className="bg-[#0A4D68] hover:bg-[#088395] text-white shadow-lg shadow-[#0A4D68]/25 h-12 px-8"
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
            className="mt-10 flex flex-wrap gap-6 text-sm text-[#0A4D68]/60 dark:text-white/70"
          >
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#00FFCA]" />
              5-Schritte-Wizard
            </li>
            <li className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#00FFCA]" />
              Sankey & KPIs
            </li>
            <li className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-[#00FFCA]" />
              CO₂ & NPV
            </li>
          </motion.ul>
        </div>

        {/* Hero-Visual: Mockup-Karten */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-2xl border border-[#0A4D68]/10 bg-white/90 p-6 shadow-2xl shadow-[#0A4D68]/10 backdrop-blur dark:bg-[#088395]/20 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-[#0A4D68]/10 pb-4 dark:border-white/10">
              <span className="text-sm font-semibold text-[#0A4D68] dark:text-white">
                MFH Elbchaussee · HEW-Demo
              </span>
              <span className="rounded-full bg-[#00FFCA]/30 px-2 py-0.5 text-xs font-medium text-[#0A4D68]">
                22763 HH
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Amortisation", value: `${HEW_SHOWCASE_KPI_PREVIEW.paybackYears} J.`, color: "bg-[#088395]" },
                { label: "CO₂-Einsparung", value: HEW_SHOWCASE_KPI_PREVIEW.co2Savings, color: "bg-[#00FFCA]" },
                { label: "NPV (20 J.)", value: HEW_SHOWCASE_KPI_PREVIEW.npv, color: "bg-[#0A4D68]" },
                { label: "Autarkie", value: HEW_SHOWCASE_KPI_PREVIEW.autarky, color: "bg-[#088395]" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-[#0A4D68]/5 bg-[#F5F8FA] p-3 dark:bg-[#0A4D68]/40"
                >
                  <div className={`h-1 w-8 rounded-full ${kpi.color} mb-2`} />
                  <p className="text-xs text-[#0A4D68]/60 dark:text-white/60">
                    {kpi.label}
                  </p>
                  <p className="text-lg font-bold text-[#0A4D68] dark:text-[#00FFCA]">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 h-28 rounded-xl bg-gradient-to-r from-[#0A4D68]/5 via-[#088395]/20 to-[#00FFCA]/30 flex items-end justify-around px-4 pb-3">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-6 rounded-t bg-[#088395] opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-[#0A4D68]/50 dark:text-white/50">
              Energiefluss · Wirtschaftlichkeit · Technikmix
            </p>
          </div>

          <div className="absolute -bottom-4 -left-4 rounded-lg bg-[#00FFCA] px-3 py-2 text-xs font-semibold text-[#0A4D68] shadow-lg">
            PDF-Report inklusive
          </div>
        </motion.div>
      </div>
    </section>
  );
}
