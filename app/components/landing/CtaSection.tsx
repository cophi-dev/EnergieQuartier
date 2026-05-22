"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { BRAND } from "@/app/lib/constants";

export function CtaSection() {
  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-[#0A4D68] to-[#088395] px-8 py-14 text-center shadow-xl sm:px-12"
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Bereit für Ihre erste Konzeptstudie?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/80">
          Starten Sie jetzt mit {BRAND.name} – PV, Wärmepumpe, Speicher und
          Wirtschaftlichkeit in einem Durchgang.
        </p>
        <ButtonLink
          href="/wizard"
          size="lg"
          className="mt-8 bg-[#00FFCA] text-[#0A4D68] hover:bg-[#00FFCA]/90 font-semibold h-12 px-8"
        >
          Neues Projekt starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </ButtonLink>
      </motion.div>
    </section>
  );
}
