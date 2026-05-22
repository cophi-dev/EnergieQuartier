"use client";

import { motion } from "framer-motion";
import {
  Battery,
  Calculator,
  FileText,
  Gauge,
  Home,
  Sun,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Home,
    title: "Gebäude & Verbrauch",
    description:
      "Erfassen Sie Objektdaten und Energieverbräuche – mit intelligenten Schätzwerten für schnelle Erstkonzepte.",
    accent: "from-[#0F172A] to-[#06B6D4]",
  },
  {
    icon: Sun,
    title: "Technologie-Mix",
    description:
      "PV, Luft- und Sole-Wärmepumpe, Batteriespeicher und Solarthermie flexibel kombinieren.",
    accent: "from-[#06B6D4] to-[#22C55E]",
  },
  {
    icon: Calculator,
    title: "Wirtschaftlichkeit",
    description:
      "Investition, Förderung (BAFA 2026), Amortisation und NPV über 20 Jahre – transparent für den Kunden.",
    accent: "from-[#0F172A] to-[#22C55E]",
  },
  {
    icon: Gauge,
    title: "Sankey & KPIs",
    description:
      "Interaktive Energiefluss-Darstellung plus Amortisation, CO₂, NPV und Autarkie auf einen Blick.",
    accent: "from-[#06B6D4] to-[#0F172A]",
  },
  {
    icon: Battery,
    title: "Speicherpilot",
    description:
      "Optional Batteriespeicher-Dimensionierung mit Anbindung an Ihre Speicherpilot-App.",
    accent: "from-[#22C55E] to-[#06B6D4]",
  },
  {
    icon: FileText,
    title: "PDF-Report",
    description:
      "Professioneller Export mit Technik, Wirtschaftlichkeit und CO₂-Bilanz für das Kundengespräch.",
    accent: "from-[#0F172A] to-[#06B6D4]",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#F8FAFC] py-24 dark:bg-[#020617]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0F172A] dark:text-white">
            Alles für die Konzeptentwicklung im Vertrieb
          </h2>
          <p className="mt-4 text-[#0F172A]/65 dark:text-white/70">
            Von der Erstberatung bis zum PDF-Report – ein Tool für
            Immobilienkunden der Hamburger Energiewerke.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="gradient-border glass-card h-full transition-shadow hover:shadow-lg hover:shadow-[#06B6D4]/10">
                <CardHeader>
                  <div
                    className={`mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${feature.accent} text-white shadow-md`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-[#0F172A] dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#0F172A]/65 dark:text-white/65">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
