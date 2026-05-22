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
  Haushalt: { category: "strom", color: "#475569", shortLabel: "Haushalt" },
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

export interface SankeyFlowBreakdown {
  nodeIndex: number;
  name: string;
  shortLabel: string;
  value: number;
  percent: number;
  color: string;
}

export interface SankeyNodeInsight {
  nodeIndex: number;
  name: string;
  shortLabel: string;
  category: SankeyCategory;
  categoryMeta: { label: string; color: string };
  color: string;
  throughputKwh: number;
  incoming: SankeyFlowBreakdown[];
  outgoing: SankeyFlowBreakdown[];
  totalIncoming: number;
  totalOutgoing: number;
  tip: string | null;
}

export interface SankeyLinkInsight {
  linkIndex: number;
  sourceName: string;
  targetName: string;
  sourceShortLabel: string;
  targetShortLabel: string;
  value: number;
  category: SankeyCategory;
  categoryMeta: { label: string; color: string };
  percentOfSourceOut: number;
  percentOfTargetIn: number;
  tip: string | null;
}

export interface SankeyInsightContext {
  autarkyPercent?: number;
}

function sumLinkValues(links: SankeyData["links"], pick: "source" | "target", index: number): number {
  return links
    .filter((l) => l[pick] === index)
    .reduce((sum, l) => sum + l.value, 0);
}

function buildFlowBreakdown(
  data: SankeyData,
  direction: "incoming" | "outgoing",
  nodeIndex: number,
): SankeyFlowBreakdown[] {
  const isIncoming = direction === "incoming";
  const relevant = data.links.filter((l) =>
    isIncoming ? l.target === nodeIndex : l.source === nodeIndex,
  );
  const total = relevant.reduce((sum, l) => sum + l.value, 0);
  if (total <= 0) return [];

  return relevant
    .map((link) => {
      const peerIndex = isIncoming ? link.source : link.target;
      const peerName = data.nodes[peerIndex]?.name ?? "";
      const meta = getNodeMeta(peerName);
      return {
        nodeIndex: peerIndex,
        name: peerName,
        shortLabel: meta.shortLabel,
        value: link.value,
        percent: (link.value / total) * 100,
        color: meta.color,
      };
    })
    .sort((a, b) => b.value - a.value);
}

function incomingFrom(data: SankeyData, nodeIndex: number, ...names: string[]): number {
  return data.links
    .filter((l) => l.target === nodeIndex && names.includes(data.nodes[l.source]?.name ?? ""))
    .reduce((sum, l) => sum + l.value, 0);
}

function outgoingTo(data: SankeyData, nodeIndex: number, ...names: string[]): number {
  return data.links
    .filter((l) => l.source === nodeIndex && names.includes(data.nodes[l.target]?.name ?? ""))
    .reduce((sum, l) => sum + l.value, 0);
}

function sharePercent(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

function buildNodeTip(
  data: SankeyData,
  nodeIndex: number,
  name: string,
  totalIncoming: number,
  totalOutgoing: number,
  context?: SankeyInsightContext,
): string | null {
  switch (name) {
    case "Strombedarf": {
      const local = incomingFrom(data, nodeIndex, "PV-Erzeugung", "Batterie");
      const localShare = sharePercent(local, totalIncoming);
      const toHp = sharePercent(
        outgoingTo(data, nodeIndex, "Wärmepumpe"),
        totalOutgoing,
      );
      if (context?.autarkyPercent !== undefined) {
        return `${context.autarkyPercent.toFixed(0)} % Autarkie · ${localShare.toFixed(0)} % ohne Netzbezug · ${toHp.toFixed(0)} % für WP`;
      }
      return `${localShare.toFixed(0)} % aus PV & Speicher · ${toHp.toFixed(0)} % für Wärmepumpe`;
    }
    case "PV-Erzeugung": {
      const toLoad = outgoingTo(data, nodeIndex, "Strombedarf", "Batterie");
      const toGrid = outgoingTo(data, nodeIndex, "Einspeisung");
      const total = toLoad + toGrid;
      if (total <= 0) return null;
      return `${sharePercent(toLoad, total).toFixed(0)} % direkt genutzt · ${sharePercent(toGrid, total).toFixed(0)} % eingespeist`;
    }
    case "Netzstrom": {
      const toLoad = outgoingTo(data, nodeIndex, "Strombedarf");
      return `Deckt ${sharePercent(toLoad, totalOutgoing).toFixed(0)} % des Strombedarfs`;
    }
    case "Einspeisung": {
      const fromPv = incomingFrom(data, nodeIndex, "PV-Erzeugung");
      const pvOut = sumLinkValues(
        data.links,
        "source",
        data.nodes.findIndex((n) => n.name === "PV-Erzeugung"),
      );
      if (pvOut <= 0) return null;
      return `${sharePercent(fromPv, pvOut).toFixed(0)} % der PV-Erzeugung · Mittags-Überschuss ohne gleichzeitigen Verbrauch`;
    }
    case "Batterie": {
      const inflow = totalIncoming;
      const outflow = totalOutgoing;
      if (inflow <= 0 || outflow <= 0) return null;
      return `Speichert PV-Überschuss für Abend/WP statt Einspeisung · ${Math.round(outflow).toLocaleString("de-DE")} kWh/a Entladung`;
    }
    case "Wärmepumpe": {
      const heatOut = outgoingTo(data, nodeIndex, "Wärmebedarf");
      if (totalIncoming <= 0 || heatOut <= 0) return null;
      return `JAZ ≈ ${(heatOut / totalIncoming).toFixed(1)} (Wärme / Strom)`;
    }
    case "Wärmebedarf": {
      const renewable = incomingFrom(data, nodeIndex, "Wärmepumpe", "Solarthermie");
      const fossil = incomingFrom(data, nodeIndex, "Gas/Wärme (Referenz)");
      const total = renewable + fossil;
      if (total <= 0) return null;
      return `${sharePercent(renewable, total).toFixed(0)} % erneuerbar · ${sharePercent(fossil, total).toFixed(0)} % Referenz/Gas`;
    }
    case "Gas/Wärme (Referenz)":
      return "Restbedarf vs. Referenzsystem (Gas)";
    case "Solarthermie":
      return "Solarthermische Wärmeerzeugung";
    case "Kühlung (Neben)":
      return "Nebenverbrauch aus dem Strommix";
    case "Haushalt":
      return "Allgemeinstrom: Beleuchtung, Steckdosen, Aufzug, etc.";
    default:
      return null;
  }
}

function buildLinkTip(
  data: SankeyData,
  sourceName: string,
  targetName: string,
  percentOfSourceOut: number,
  percentOfTargetIn: number,
): string | null {
  if (sourceName === "PV-Erzeugung" && targetName === "Einspeisung") {
    return "Überschuss geht ins Netz";
  }
  if (sourceName === "PV-Erzeugung" && targetName === "Strombedarf") {
    return "Direkter PV-Eigenverbrauch";
  }
  if (sourceName === "Batterie" && targetName === "Strombedarf") {
    return "Entladung in den Haushalt";
  }
  if (sourceName === "Netzstrom" && targetName === "Strombedarf") {
    return "Netzbezug für den Gebäude-Strommix";
  }
  if (sourceName === "Strombedarf" && targetName === "Wärmepumpe") {
    return "Strom für Wärmepumpe aus dem Gebäude-Strommix";
  }
  if (sourceName === "Strombedarf" && targetName === "Haushalt") {
    return "Allgemeinstrom im Gebäude";
  }
  if (sourceName === "Wärmepumpe" && targetName === "Wärmebedarf") {
    return "Wärmepumpe deckt den Hauptwärmebedarf";
  }
  if (sourceName === "Gas/Wärme (Referenz)" && targetName === "Wärmebedarf") {
    return "Restwärme / Referenzsystem";
  }
  if (percentOfSourceOut >= 40) {
    return `${percentOfSourceOut.toFixed(0)} % des Abflusses von ${getNodeMeta(sourceName).shortLabel}`;
  }
  if (percentOfTargetIn >= 40) {
    return `${percentOfTargetIn.toFixed(0)} % des Zuflusses zu ${getNodeMeta(targetName).shortLabel}`;
  }
  return null;
}

/** Berechnet Hover-Insights für alle Knoten und Links */
export function computeSankeyInsights(
  data: SankeyData,
  context?: SankeyInsightContext,
): { nodes: Map<number, SankeyNodeInsight>; links: Map<number, SankeyLinkInsight> } {
  const nodes = new Map<number, SankeyNodeInsight>();
  const links = new Map<number, SankeyLinkInsight>();

  for (let i = 0; i < data.nodes.length; i++) {
    const name = data.nodes[i]?.name ?? "";
    const meta = getNodeMeta(name);
    const incoming = buildFlowBreakdown(data, "incoming", i);
    const outgoing = buildFlowBreakdown(data, "outgoing", i);
    const totalIncoming = incoming.reduce((sum, row) => sum + row.value, 0);
    const totalOutgoing = outgoing.reduce((sum, row) => sum + row.value, 0);
    const throughputKwh = Math.max(totalIncoming, totalOutgoing);

    nodes.set(i, {
      nodeIndex: i,
      name,
      shortLabel: meta.shortLabel,
      category: meta.category,
      categoryMeta: SANKEY_CATEGORY_LABELS[meta.category],
      color: meta.color,
      throughputKwh,
      incoming,
      outgoing,
      totalIncoming,
      totalOutgoing,
      tip: buildNodeTip(data, i, name, totalIncoming, totalOutgoing, context),
    });
  }

  for (let i = 0; i < data.links.length; i++) {
    const link = data.links[i];
    const sourceName = data.nodes[link.source]?.name ?? "";
    const targetName = data.nodes[link.target]?.name ?? "";
    const sourceMeta = getNodeMeta(sourceName);
    const targetMeta = getNodeMeta(targetName);
    const sourceOut = sumLinkValues(data.links, "source", link.source);
    const targetIn = sumLinkValues(data.links, "target", link.target);
    const percentOfSourceOut = sharePercent(link.value, sourceOut);
    const percentOfTargetIn = sharePercent(link.value, targetIn);

    links.set(i, {
      linkIndex: i,
      sourceName,
      targetName,
      sourceShortLabel: sourceMeta.shortLabel,
      targetShortLabel: targetMeta.shortLabel,
      value: link.value,
      category: sourceMeta.category,
      categoryMeta: SANKEY_CATEGORY_LABELS[sourceMeta.category],
      percentOfSourceOut,
      percentOfTargetIn,
      tip: buildLinkTip(data, sourceName, targetName, percentOfSourceOut, percentOfTargetIn),
    });
  }

  return { nodes, links };
}

/** Ermittelt hervorgehobene Knoten/Links beim Hover */
export function getSankeyHighlightSet(
  data: SankeyData,
  hover: { kind: "node" | "link"; index: number } | null,
): { nodeIndices: Set<number>; linkIndices: Set<number> } | null {
  if (!hover) return null;

  const nodeIndices = new Set<number>();
  const linkIndices = new Set<number>();

  if (hover.kind === "node") {
    nodeIndices.add(hover.index);
    data.links.forEach((link, linkIndex) => {
      if (link.source === hover.index || link.target === hover.index) {
        linkIndices.add(linkIndex);
        nodeIndices.add(link.source);
        nodeIndices.add(link.target);
      }
    });
    return { nodeIndices, linkIndices };
  }

  const link = data.links[hover.index];
  if (!link) return null;

  linkIndices.add(hover.index);
  nodeIndices.add(link.source);
  nodeIndices.add(link.target);
  return { nodeIndices, linkIndices };
}
