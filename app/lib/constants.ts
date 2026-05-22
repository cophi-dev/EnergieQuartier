/** Marken- und UI-Konstanten für EnergieQuartier */
export const BRAND = {
  name: "EnergieQuartier",
  slogan: "Intelligente Konzepte für Hamburgs Energiezukunft",
  colors: {
    primary: "#0A4D68",
    secondary: "#088395",
    accent: "#00FFCA",
    background: "#F5F8FA",
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
