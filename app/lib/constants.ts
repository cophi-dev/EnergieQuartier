/** Marken- und UI-Konstanten für DezentralKonzeptPilot */
export const BRAND = {
  name: "DezentralKonzeptPilot",
  slogan: "Intelligente Konzepte für Hamburgs Energiezukunft",
  colors: {
    primary: "#0F172A",
    cyan: "#06B6D4",
    green: "#22C55E",
    background: "#F8FAFC",
  },
} as const;

export const NAV_ITEMS = [
  { id: "wizard", label: "Konfigurator", href: "/wizard" },
  { id: "simulation", label: "Simulation", href: "/dashboard" },
  { id: "report", label: "Report", href: "/dashboard#report" },
  { id: "projekte", label: "Meine Projekte", href: "/projekte" },
] as const;

export const WIZARD_STEPS = [
  { id: 1, title: "Projekt & Gebäude", short: "Gebäude" },
  { id: 2, title: "Energieverbrauch", short: "Verbrauch" },
  { id: 3, title: "Ziele & Prioritäten", short: "Ziele" },
  { id: 4, title: "Technologie", short: "Technik" },
  { id: 5, title: "Zusatzinfos", short: "Details" },
] as const;
