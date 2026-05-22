import { ContactForm } from "@/app/components/kontakt/ContactForm";

export const metadata = {
  title: "Kontakt | EnergieQuartier",
  description:
    "Beratungsanfrage stellen – Energiekonzept besprechen oder HEW kontaktieren.",
};

export default function KontaktPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#F8FAFC] via-white to-[#06B6D4]/5 px-4 py-10 sm:px-6 lg:px-8 dark:from-[#020617] dark:via-[#020617] dark:to-[#06B6D4]/5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-[#0F172A] dark:text-white">
            Kontakt aufnehmen
          </h1>
          <p className="mt-3 text-[#0F172A]/65 dark:text-white/65">
            Fragen zu Ihrem Energiekonzept? Schreiben Sie uns – oder wenden Sie
            sich direkt an die Hamburger Energiewerke.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
