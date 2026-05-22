"use client";

import { motion } from "framer-motion";
import { WIZARD_STEPS } from "@/app/lib/constants";

export function HowItWorksSection() {
  return (
    <section className="bg-[#F5F8FA] py-20 dark:bg-[#0A4D68]/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-[#0A4D68] dark:text-white">
          In 5 Schritten zum Konzept
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-[#0A4D68]/70 dark:text-white/70">
          Der Wizard führt Sie strukturiert von der Gebäudeerfassung bis zur
          Technologieauswahl.
        </p>

        <div className="mt-14 relative">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-[#0A4D68] via-[#088395] to-[#00FFCA] lg:block" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {WIZARD_STEPS.map((step, index) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A4D68] text-xl font-bold text-[#00FFCA] shadow-lg ring-4 ring-[#F5F8FA] dark:ring-[#0A4D68]">
                  {step.id}
                </div>
                <p className="mt-4 font-semibold text-[#0A4D68] dark:text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-[#088395]">{step.short}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
