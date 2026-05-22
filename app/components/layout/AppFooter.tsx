import Link from "next/link";
import { BRAND } from "@/app/lib/constants";

export function AppFooter() {
  return (
    <footer className="border-t border-[#0F172A]/20 bg-[#0F172A] text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-semibold text-[#06B6D4]">
              {BRAND.name}
            </p>
            <p className="mt-2 text-sm text-white/70">{BRAND.slogan}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-[#22C55E]">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <Link href="/wizard" className="hover:text-white">
                  Konfigurator
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Simulation & Report
                </Link>
              </li>
              <li>
                <Link href="/projekte" className="hover:text-white">
                  Meine Projekte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-[#22C55E]">Hinweis</p>
            <p className="mt-3 text-xs leading-relaxed text-white/60">
              MVP-Demonstration für Konzeptstudien dezentraler Energieversorgung.
              Berechnungen sind vereinfachte Modelle – keine verbindliche
              Planungsgrundlage.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {BRAND.name} · {BRAND.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
