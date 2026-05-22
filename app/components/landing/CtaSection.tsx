"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { ShowcaseCta } from "@/app/components/landing/ShowcaseCta";
import { BRAND } from "@/app/lib/constants";

export function CtaSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="gradient-border relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#06B6D4]/30 px-8 py-14 text-center shadow-2xl shadow-[#0F172A]/20 sm:px-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#06B6D4]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#22C55E]/15 blur-3xl" />

        <div className="relative">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Bereit für Ihre erste Konzeptstudie?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">
            Starten Sie jetzt mit {BRAND.name} – PV, Wärmepumpe, Speicher und
            Wirtschaftlichkeit in einem Durchgang.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/wizard"
              size="lg"
              className="h-12 bg-[#06B6D4] px-8 font-semibold text-[#0F172A] hover:bg-[#22C55E]"
            >
              Neues Projekt starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonLink>
            <ShowcaseCta />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
