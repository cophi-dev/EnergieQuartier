import type { SankeyData, SankeyNode } from "@/app/types/calculation";

export type SankeyCategory = "strom" | "waerme" | "kaelte";

export interface SankeyNodeMeta {
  category: SankeyCategory;
  color: string;
  shortLabel: string;
}

/** Metadaten für Sankey-Knoten (Labels & Farben) */
export const SANKEY_NODE_META: Record<string, SankeyNodeMeta> = {
  Netzstrom: { category: "strom", color: "#0A4D68", shortLabel: "Netz" },
  "PV-Erzeugung": { category: "strom", color: "#088395", shortLabel: "PV" },
  Batterie: { category: "strom", color: "#00FFCA", shortLabel: "Speicher" },
  Strombedarf: { category: "strom", color: "#0A4D68", shortLabel: "Strombedarf" },
  Einspeisung: { category: "strom", color: "#5eb8c9", shortLabel: "Einspeisung" },
  "Gas/Wärme (Referenz)": {
    category: "waerme",
    color: "#6b7280",
    shortLabel: "Gas (Ref.)",
  },
  Wärmepumpe: { category: "waerme", color: "#088395", shortLabel: "WP" },
  Solarthermie: { category: "waerme", color: "#00FFCA", shortLabel: "Solarth." },
  Wärmebedarf: { category: "waerme", color: "#0A4D68", shortLabel: "Wärmebedarf" },
  "Kühlung (Neben)": {
    category: "kaelte",
    color: "#94a3b8",
    shortLabel: "Kühlung",
  },
};

export const SANKEY_CATEGORY_LABELS: Record<
  SankeyCategory,
  { label: string; color: string }
> = {
  strom: { label: "Strom", color: "#0A4D68" },
  waerme: { label: "Wärme", color: "#088395" },
  kaelte: { label: "Kälte", color: "#94a3b8" },
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
      color: "#0A4D68",
      shortLabel: name.slice(0, 12),
    }
  );
}
