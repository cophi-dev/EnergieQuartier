import {
  Building2,
  Droplets,
  Factory,
  Flame,
  Layers,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import type {
  TechnologyCategory,
  TechnologyLibraryEntry,
} from "@/app/types/technology";
import type { TechnologySelection } from "@/app/types/project";

export const TECHNOLOGY_CATEGORIES: {
  id: TechnologyCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "strom",
    label: "Strom & Solar",
    description: "Stromerzeugung und -speicherung auf dem Objekt",
  },
  {
    id: "waerme",
    label: "Wärme & Kälte",
    description: "Heizung, Warmwasser und Kühlung nachhaltig decken",
  },
  {
    id: "speicher",
    label: "Speicher",
    description: "Energie zeitlich verschieben und Spitzen abfedern",
  },
  {
    id: "netz",
    label: "Netze & Quartier",
    description: "Mehrere Gebäude und Wärmequellen intelligent verbinden",
  },
];

export const TECHNOLOGY_LIBRARY: TechnologyLibraryEntry[] = [
  {
    id: "heat-pump-air",
    name: "Luft-Wärmepumpe",
    shortDescription:
      "Nutzt Wärme aus der Außenluft und hebt sie per Strom auf Heizungsniveau an – die gängigste Wärmepumpe für Bestandsgebäude in Hamburg.",
    category: "waerme",
    categoryLabel: "Wärme & Kälte",
    icon: Wind,
    accent: "from-[#06B6D4] to-[#0F172A]",
    advantages: [
      "Geringere Investition als Erdsonden-WP",
      "Schnell planbar, kein Bohrkonzept nötig",
      "Kombinierbar mit PV für niedrigeren Strombezug",
      "BAFA-Förderung bis 30 % möglich",
    ],
    disadvantages: [
      "Leistung sinkt bei sehr kalten Tagen (Auslegung wichtig)",
      "Außengerät benötigt Platz und Schallschutz",
      "Etwas niedrigere JAZ als Sole-WP",
    ],
    costs: {
      investment: "12.000–25.000 € (inkl. Installation, EFH/MFH)",
      operating: "800–1.400 €/a Strom (abhängig von Wärmebedarf)",
    },
    efficiency: {
      label: "Jahresarbeitszahl (JAZ)",
      value: "3,2–4,2",
      hint: "Hamburg-Klima, Heizung + Warmwasser",
    },
    bestFor: [
      "Bestandsgebäude mit moderater Sanierung",
      "Objekte ohne große Außenfläche für Erdsonden",
      "Schnelle Gasheizungs-Ersatzlösung",
    ],
    useCases: [
      "Mehrfamilienhaus in Wilhelmsburg mit Gasheizung",
      "Teilsaniertes Reihenhaus in Bergedorf",
      "Gewerbeobjekt mit mittlerem Wärmebedarf",
    ],
    configurableInWizard: true,
    wizardMapping: { heatPumpAir: true },
  },
  {
    id: "heat-pump-ground",
    name: "Sole-Wärmepumpe / Erdsonden",
    shortDescription:
      "Entzieht dem Erdreich über Erdsondenbohrungen stabil Wärme – besonders effizient, weil die Bodentemperatur ganzjährig konstant bleibt.",
    category: "waerme",
    categoryLabel: "Wärme & Kälte",
    icon: Thermometer,
    accent: "from-[#0F172A] to-[#22C55E]",
    advantages: [
      "Höchste JAZ unter den Wärmepumpen",
      "Sehr leise im Innenbereich (kein großes Außengerät)",
      "Passivkühlung über Erdsonden oft möglich",
      "Langlebig, geringer Wartungsaufwand",
    ],
    disadvantages: [
      "Höhere Investition durch Bohrungen",
      "Genehmigung und Grundstücksfläche erforderlich",
      "Planungsdauer länger als bei Luft-WP",
    ],
    costs: {
      investment: "25.000–45.000 € (inkl. Erdsonden, EFH/MFH)",
      operating: "650–1.100 €/a Strom",
    },
    efficiency: {
      label: "Jahresarbeitszahl (JAZ)",
      value: "4,0–5,0",
      hint: "Oberflächennahe Geothermie, Hamburg",
    },
    bestFor: [
      "Neubau und Kernsanierung mit Garten/Hof",
      "Hoher Wärmebedarf über viele Jahre",
      "Schallsensible Wohnlagen",
    ],
    useCases: [
      "Neubau-Quartier mit gemeinsamer Bohrplatz-Planung",
      "Denkmalgeschütztes MFH mit Innenaufstellung",
      "Einfamilienhaus mit 150 m² Wohnfläche",
    ],
    configurableInWizard: true,
    wizardMapping: { heatPumpGround: true },
  },
  {
    id: "deep-geothermal",
    name: "Tiefe Geothermie",
    shortDescription:
      "Nutzt Wärme aus Tiefen über 400 m – in Hamburg vor allem für Quartiere und große Wärmenetze interessant, nicht für Einzelgebäude.",
    category: "waerme",
    categoryLabel: "Wärme & Kälte",
    icon: Layers,
    accent: "from-[#0F172A] to-[#06B6D4]",
    advantages: [
      "Sehr hohe und stabile Wärmeleistung",
      "Grundlast für Nahwärme und Fernwärme",
      "Geringe Flächenbeanspruchung an der Oberfläche",
      "Langfristig planbare Wärmekosten",
    ],
    disadvantages: [
      "Sehr hohe Investition und lange Planung",
      "Standortabhängig (Geologie, Hydrogeologie)",
      "Nur für größere Anlagen wirtschaftlich",
      "Genehmigungsverfahren aufwendig",
    ],
    costs: {
      investment: "Ab 2 Mio. € (Tiefenbohrung + Anschluss)",
      operating: "Projektabhängig, oft unter Fernwärme-Niveau",
    },
    efficiency: {
      label: "COP / Wirkungsgrad",
      value: "4,5–6,0",
      hint: "Abhängig von Soletemperatur und Wärmenetz",
    },
    bestFor: [
      "Quartiersentwicklung mit städtischer Wärmeinfrastruktur",
      "Große Wärmenetze und industrielle Grundlast",
      "Langfristige kommunale Energieplanung",
    ],
    useCases: [
      "Hafencity-Erweiterung mit zentraler Wärmeversorgung",
      "Industriepark mit konstant hohem Wärmebedarf",
      "Neues Wohnquartier mit 500+ Wohneinheiten",
    ],
    configurableInWizard: false,
  },
  {
    id: "solar-thermal",
    name: "Solarthermie",
    shortDescription:
      "Solarthermische Kollektoren wandeln Sonnenlicht direkt in Wärme um – ideal für Warmwasser und als Ergänzung zur Heizung.",
    category: "waerme",
    categoryLabel: "Wärme & Kälte",
    icon: Droplets,
    accent: "from-[#22C55E] to-[#06B6D4]",
    advantages: [
      "Direkte Wärmeerzeugung ohne Stromumweg",
      "Gute Kombination mit Wärmepumpe",
      "Förderfähig über BEG",
      "Wartungsarm, lange Lebensdauer",
    ],
    disadvantages: [
      "Sommerüberschuss, Winterdefizit",
      "Benötigt Dachfläche und Speicher",
      "Allein oft nicht ausreichend für Vollheizung",
    ],
    costs: {
      investment: "6.000–14.000 € (4–15 m² Kollektorfläche)",
      operating: "150–350 €/a Wartung & Pumpenstrom",
    },
    efficiency: {
      label: "Jahresertrag",
      value: "350–450 kWh/m²",
      hint: "Hamburg, aufgeständerte Kollektoren",
    },
    bestFor: [
      "Hoher Warmwasserbedarf (MFH, Seniorenwohnen)",
      "Kombination mit Wärmepumpe oder Nahwärme",
      "Dachflächen ohne PV-Priorität",
    ],
    useCases: [
      "Mehrfamilienhaus mit zentraler Warmwasseraufbereitung",
      "Hotel oder Pflegeheim mit konstantem WW-Bedarf",
      "Ergänzung zu Sole-WP im Neubau",
    ],
    configurableInWizard: true,
    wizardMapping: { solarThermal: true },
  },
  {
    id: "pv-battery",
    name: "Photovoltaik + Batteriespeicher",
    shortDescription:
      "Solarmodule erzeugen Strom auf dem Dach – ein Speicher verschiebt Überschüsse in Abend- und Morgenstunden und erhöht den Eigenverbrauch deutlich.",
    category: "strom",
    categoryLabel: "Strom & Solar",
    icon: Sun,
    accent: "from-[#22C55E] to-[#0F172A]",
    advantages: [
      "Senkt Strombezug und Netzgebühren",
      "Speicher steigert Autarkie um 15–25 Prozentpunkte",
      "EEG-Einspeisevergütung für Überschüsse",
      "Wertsteigerung der Immobilie",
    ],
    disadvantages: [
      "Speicher erhöht Investition spürbar",
      "Dachausrichtung und Verschattung prüfen",
      "Batterie kapazitätsbegrenzt (nicht winterlang)",
    ],
    costs: {
      investment: "PV: 1.000–1.400 €/kWp · Speicher: 700–900 €/kWh",
      operating: "Minimal (ca. 100–200 €/a Versicherung & Wartung)",
    },
    efficiency: {
      label: "Spez. Ertrag / Speicher-Roundtrip",
      value: "~1.050 kWh/kWp · ~70 % Roundtrip",
      hint: "Hamburg, Südausrichtung",
    },
    bestFor: [
      "Gebäude mit hohem Tagsstromverbrauch",
      "Kombination mit Wärmepumpe (sg. PV-WP-Kopplung)",
      "Eigentümer mit Autarkie-Ziel",
    ],
    useCases: [
      "MFH mit gemeinschaftlichem Mieterstrommodell",
      "Gewerbe mit Produktion tagsüber",
      "EFH mit Wärmepumpe und E-Auto-Ladung",
    ],
    configurableInWizard: true,
    wizardMapping: { pv: true, battery: true },
  },
  {
    id: "waste-heat",
    name: "Abwärmenutzung",
    shortDescription:
      "Nutzt Wärme aus Industrie, Rechenzentren, Kläranlagen oder Gebäudeabluft – in Hamburg ein wichtiger Baustein für klimaneutrale Quartiere.",
    category: "waerme",
    categoryLabel: "Wärme & Kälte",
    icon: Factory,
    accent: "from-[#64748B] to-[#06B6D4]",
    advantages: [
      "Sehr niedrige CO₂-Emissionen",
      "Nutzt vorhandene Energie statt sie zu verwerfen",
      "Grundlast für Nahwärmenetze",
      "Wirtschaftlich bei großen Abwärmemengen",
    ],
    disadvantages: [
      "Abhängig von Wärmequelle und Verfügbarkeit",
      "Individuelle Planung und Anschluss nötig",
      "Nicht an jedem Standort verfügbar",
    ],
    costs: {
      investment: "50.000–500.000 € (projektabhängig)",
      operating: "Oft 30–50 % unter Fernwärme-Preis",
    },
    efficiency: {
      label: "Wärmerückgewinnung",
      value: "60–90 %",
      hint: "Abhängig von Quelltemperatur und Wärmenetz",
    },
    bestFor: [
      "Quartiere neben Industrie oder Kläranlage",
      "Großflächige Rechenzentren und Gewerbe",
      "Kommunale Wärmeplanung Hamburg",
    ],
    useCases: [
      "Gewerbegebiet mit Prozesswärme-Überschuss",
      "Wärmenetz mit Kläranlagen-Anbindung",
      "Bürogebäude mit Abluft-Wärmerückgewinnung",
    ],
    configurableInWizard: false,
  },
  {
    id: "heat-storage",
    name: "Wärmespeicher (dezentral)",
    shortDescription:
      "Speichert Wärme in Wasser- oder Phasenwechselspeichern – ermöglicht günstigen Strombezug und entlastet das Stromnetz bei Wärmepumpen.",
    category: "speicher",
    categoryLabel: "Speicher",
    icon: Flame,
    accent: "from-[#06B6D4] to-[#22C55E]",
    advantages: [
      "Wärmepumpe kann bei günstigem Strom laufen",
      "Puffert Spitzenlasten im Gebäude",
      "Kombinierbar mit PV und dynamischen Tarifen",
      "Erhöht Versorgungssicherheit",
    ],
    disadvantages: [
      "Benötigt Technikraum und Dämmung",
      "Wärmeverluste bei kleinen Speichern",
      "Dimensionierung oft unterschätzt",
    ],
    costs: {
      investment: "3.000–12.000 € (500 l – 5.000 l Pufferspeicher)",
      operating: "Gering (ca. 50–150 €/a)",
    },
    efficiency: {
      label: "Speicherwirkungsgrad",
      value: "85–95 %",
      hint: "Gut gedämmter Pufferspeicher, 24 h Zyklus",
    },
    bestFor: [
      "Wärmepumpen mit PV-Kopplung",
      "Gebäude mit schwankendem Wärmebedarf",
      "Dynamische Stromtarife nutzen",
    ],
    useCases: [
      "MFH mit zentraler WP und Pufferspeicher",
      "Einfamilienhaus mit PV-Überschuss-Heizen",
      "Gewerbe mit tag-/nachtbedingtem Wärmebedarf",
    ],
    configurableInWizard: false,
  },
  {
    id: "district-heating",
    name: "Kleines Nahwärmenetz",
    shortDescription:
      "Verbindet mehrere Gebäude über ein Wärmenetz – Wärme aus WP, Abwärme oder Geothermie wird zentral erzeugt und dezentral genutzt.",
    category: "netz",
    categoryLabel: "Netze & Quartier",
    icon: Building2,
    accent: "from-[#0F172A] to-[#64748B]",
    advantages: [
      "Skaleneffekte bei Erzeugung und Wartung",
      "Flexible Wärmequellen kombinierbar",
      "Ideal für Quartiersentwicklung",
      "Anschluss an kommunale Wärmenetze möglich",
    ],
    disadvantages: [
      "Hoher Planungs- und Koordinationsaufwand",
      "Wirtschaftlich erst ab ca. 3–5 Gebäuden",
      "Rechtliche Struktur (Wärmeversorgung) nötig",
    ],
    costs: {
      investment: "200–400 €/m² Wohnfläche (Netz + Übergabestation)",
      operating: "80–120 €/MWh Wärme (inkl. Betrieb)",
    },
    efficiency: {
      label: "Netzverluste",
      value: "< 10 %",
      hint: "Moderne Niedertemperatur-Nahwärme",
    },
    bestFor: [
      "Neubauquartiere mit mehreren Gebäuden",
      "Sanierungsgebiete mit gemeinsamer Strategie",
      "Kommunale oder genossenschaftliche Projekte",
    ],
    useCases: [
      "5 MFH in Bergedorf mit gemeinsamer Sole-WP",
      "Campus-Entwicklung mit zentraler Erzeugung",
      "Wilhelmsburg: Anschluss an bestehendes Wärmenetz",
    ],
    configurableInWizard: false,
  },
];

export function getTechnologyById(
  id: string,
): TechnologyLibraryEntry | undefined {
  return TECHNOLOGY_LIBRARY.find((t) => t.id === id);
}

export function getTechnologiesByCategory(
  category: TechnologyCategory | "all",
): TechnologyLibraryEntry[] {
  if (category === "all") return TECHNOLOGY_LIBRARY;
  return TECHNOLOGY_LIBRARY.filter((t) => t.category === category);
}

/** Wizard-Felder aus Bibliotheks-ID ableiten */
export function wizardMappingFromLibraryId(
  id: string,
): Partial<TechnologySelection> | null {
  const entry = getTechnologyById(id);
  if (!entry?.wizardMapping) return null;
  return entry.wizardMapping;
}

/** Kurzinfos für Wizard-Karten (nur konfigurierbare Technologien) */
export const WIZARD_TECH_IDS = [
  "heat-pump-air",
  "heat-pump-ground",
  "solar-thermal",
  "pv-battery",
] as const;

export function getWizardTechnologyOptions(): TechnologyLibraryEntry[] {
  return WIZARD_TECH_IDS.map((id) => getTechnologyById(id)!);
}

/** Einzelne Wizard-Feld-Keys für Step4 (pv/battery getrennt) */
export const WIZARD_FIELD_TO_LIBRARY: Record<
  keyof TechnologySelection,
  string
> = {
  pv: "pv-battery",
  heatPumpAir: "heat-pump-air",
  heatPumpGround: "heat-pump-ground",
  battery: "pv-battery",
  solarThermal: "solar-thermal",
};
