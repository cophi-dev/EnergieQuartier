/** Marken- und UI-Konstanten für EnergieQuartier */
export const BRAND = {
  name: "EnergieQuartier",
  tagline: "Konzeptstudien für dezentrale Energie",
  slogan:
    "PV, Wärmepumpe und Speicher planen – mit Sankey, KPIs und PDF in Minuten",
  colors: {
    primary: "#0F172A",
    cyan: "#06B6D4",
    green: "#22C55E",
    background: "#F8FAFC",
  },
  pdf: {
    footerNote:
      "Erstellt mit EnergieQuartier · Vereinfachte Modellrechnung, keine verbindliche Planungsgrundlage.",
  },
} as const;

/** Chart-Farben (Recharts) */
export const CHART_COLORS = {
  primary: BRAND.colors.primary,
  cyan: BRAND.colors.cyan,
  green: BRAND.colors.green,
  grid: `${BRAND.colors.primary}1A`,
  tick: BRAND.colors.primary,
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
