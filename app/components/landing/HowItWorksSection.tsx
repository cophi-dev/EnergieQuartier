"use client";

import { motion } from "framer-motion";
import { WIZARD_STEPS } from "@/app/lib/constants";

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-[#0F172A]/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#06B6D408,_transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0F172A] dark:text-white">
            In 5 Schritten zum Konzept
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#0F172A]/65 dark:text-white/70">
            Der Wizard führt Sie strukturiert von der Gebäudeerfassung bis zur
            Technologieauswahl – oder laden Sie das Beispielprojekt mit einem Klick.
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 lg:block">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0F172A] via-[#06B6D4] to-[#22C55E]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {WIZARD_STEPS.map((step, index) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative flex flex-col items-center text-center"
              >
                <motion.div
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#0F172A] text-xl font-bold text-[#06B6D4] shadow-lg ring-4 ring-[#F8FAFC] dark:bg-[#06B6D4] dark:text-[#0F172A] dark:ring-[#0F172A]"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {step.id}
                </motion.div>
                <p className="mt-4 font-semibold text-[#0F172A] dark:text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-[#06B6D4]">{step.short}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
