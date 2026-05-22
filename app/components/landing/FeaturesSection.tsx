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
  },
  {
    icon: Sun,
    title: "Technologie-Mix",
    description:
      "PV, Luft- und Sole-Wärmepumpe, Batteriespeicher und Solarthermie flexibel kombinieren.",
  },
  {
    icon: Calculator,
    title: "Wirtschaftlichkeit",
    description:
      "Investition, Förderung (BAFA 2026), Amortisation und NPV über 20 Jahre – transparent für den Kunden.",
  },
  {
    icon: Gauge,
    title: "Sankey & KPIs",
    description:
      "Interaktive Energiefluss-Darstellung plus Amortisation, CO₂, NPV und Autarkie auf einen Blick.",
  },
  {
    icon: Battery,
    title: "Speicherpilot",
    description:
      "Optional Batteriespeicher-Dimensionierung mit Anbindung an Ihre Speicherpilot-App.",
  },
  {
    icon: FileText,
    title: "PDF-Report",
    description:
      "Professioneller Export mit Technik, Wirtschaftlichkeit und CO₂-Bilanz für das Kundengespräch.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-white py-20 dark:bg-[#0A4D68]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0A4D68] dark:text-white">
            Alles für die Konzeptentwicklung im Vertrieb
          </h2>
          <p className="mt-4 text-[#0A4D68]/70 dark:text-white/70">
            Von der Erstberatung bis zum PDF-Report – ein Tool für
            Immobilienkunden der Hamburger Energiewerke.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="h-full border-[#0A4D68]/10 hover:border-[#088395]/40 hover:shadow-md transition-all dark:border-white/10">
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0A4D68] text-[#00FFCA]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-[#0A4D68] dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#0A4D68]/70 dark:text-white/70">
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
