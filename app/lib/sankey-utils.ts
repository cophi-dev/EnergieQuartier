import type { SankeyData, SankeyNode } from "@/app/types/calculation";

export type SankeyCategory = "strom" | "waerme" | "kaelte";

export interface SankeyNodeMeta {
  category: SankeyCategory;
  color: string;
  shortLabel: string;
}

/** Metadaten für Sankey-Knoten (Labels & Farben) – Premium-Palette */
export const SANKEY_NODE_META: Record<string, SankeyNodeMeta> = {
  Netzstrom: { category: "strom", color: "#0F172A", shortLabel: "Netz" },
  "PV-Erzeugung": { category: "strom", color: "#06B6D4", shortLabel: "PV" },
  Batterie: { category: "strom", color: "#22C55E", shortLabel: "Speicher" },
  Strombedarf: { category: "strom", color: "#334155", shortLabel: "Strombedarf" },
  Einspeisung: { category: "strom", color: "#0891B2", shortLabel: "Einspeisung" },
  "Gas/Wärme (Referenz)": {
    category: "waerme",
    color: "#64748B",
    shortLabel: "Gas (Ref.)",
  },
  Wärmepumpe: { category: "waerme", color: "#06B6D4", shortLabel: "WP" },
  Solarthermie: { category: "waerme", color: "#22C55E", shortLabel: "Solarth." },
  Wärmebedarf: { category: "waerme", color: "#0F172A", shortLabel: "Wärmebedarf" },
  "Kühlung (Neben)": {
    category: "kaelte",
    color: "#94A3B8",
    shortLabel: "Kühlung",
  },
};

export const SANKEY_CATEGORY_LABELS: Record<
  SankeyCategory,
  { label: string; color: string }
> = {
  strom: { label: "Strom", color: "#0F172A" },
  waerme: { label: "Wärme", color: "#06B6D4" },
  kaelte: { label: "Kälte", color: "#94A3B8" },
};

/** Entfernt ungenutzte Knoten und mappt Link-Indizes neu */
export function pruneSankeyData(data: SankeyData): SankeyData {
  const usedIndices = new Set<number>();
  for (const link of data.links) {
    usedIndices.add(link.source);
    usedIndices.add(link.target);
  }

  const sortedUsed = [...usedIndices].sort((a, b) => a - b);
  const indexMap = new Map(sortedUsed.map((oldIdx, newIdx) => [oldIdx, newIdx]));

  const nodes: SankeyNode[] = sortedUsed.map((i) => data.nodes[i]);
  const links = data.links.map((l) => ({
    source: indexMap.get(l.source)!,
    target: indexMap.get(l.target)!,
    value: l.value,
  }));

  return { nodes, links };
}

/** Summiert Zu- und Abgänge pro Knoten für Label-Anzeige */
export function computeNodeTotals(data: SankeyData): Map<number, number> {
  const totals = new Map<number, number>();
  for (const link of data.links) {
    totals.set(link.source, (totals.get(link.source) ?? 0) + link.value);
    totals.set(link.target, (totals.get(link.target) ?? 0) + link.value);
  }
  return totals;
}

export function getNodeMeta(name: string): SankeyNodeMeta {
  return (
    SANKEY_NODE_META[name] ?? {
      category: "strom",
      color: "#0F172A",
      shortLabel: name.slice(0, 12),
    }
  );
}

/** Link-Farbe aus Quellknoten mit Transparenz */
export function getLinkColor(sourceName: string, opacity = 0.35): string {
  const meta = getNodeMeta(sourceName);
  const hex = meta.color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
