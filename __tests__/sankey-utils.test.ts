import {
  computeSankeyInsights,
  getSankeyHighlightSet,
  pruneSankeyData,
} from "@/app/lib/sankey-utils";
import type { SankeyData } from "@/app/types/calculation";

describe("pruneSankeyData", () => {
  it("entfernt unverbundene Knoten", () => {
    const data: SankeyData = {
      nodes: [
        { name: "A" },
        { name: "B" },
        { name: "C" },
      ],
      links: [{ source: 0, target: 1, value: 100 }],
    };
    const pruned = pruneSankeyData(data);
    expect(pruned.nodes).toHaveLength(2);
    expect(pruned.links[0]).toEqual({ source: 0, target: 1, value: 100 });
  });
});

describe("computeSankeyInsights", () => {
  const sample: SankeyData = {
    nodes: [
      { name: "Netzstrom" },
      { name: "PV-Erzeugung" },
      { name: "Strombedarf" },
      { name: "Einspeisung" },
    ],
    links: [
      { source: 0, target: 2, value: 6000 },
      { source: 1, target: 2, value: 4000 },
      { source: 1, target: 3, value: 2000 },
    ],
  };

  it("berechnet Zufluss-Anteile für Strombedarf", () => {
    const { nodes } = computeSankeyInsights(sample, { autarkyPercent: 40 });
    const load = nodes.get(2);
    expect(load?.incoming).toHaveLength(2);
    expect(load?.incoming[0]?.shortLabel).toBe("Netz");
    expect(load?.incoming[0]?.percent).toBeCloseTo(60, 0);
    expect(load?.tip).toContain("Autarkie");
  });

  it("berechnet Link-Anteile", () => {
    const { links } = computeSankeyInsights(sample);
    const pvToLoad = links.get(1);
    expect(pvToLoad?.percentOfSourceOut).toBeCloseTo(66.7, 0);
    expect(pvToLoad?.percentOfTargetIn).toBeCloseTo(40, 0);
  });
});

describe("getSankeyHighlightSet", () => {
  const data: SankeyData = {
    nodes: [{ name: "A" }, { name: "B" }, { name: "C" }],
    links: [
      { source: 0, target: 1, value: 100 },
      { source: 1, target: 2, value: 80 },
    ],
  };

  it("markiert verbundene Pfade beim Knoten-Hover", () => {
    const highlight = getSankeyHighlightSet(data, { kind: "node", index: 1 });
    expect(highlight?.nodeIndices.has(0)).toBe(true);
    expect(highlight?.nodeIndices.has(1)).toBe(true);
    expect(highlight?.nodeIndices.has(2)).toBe(true);
    expect(highlight?.linkIndices.size).toBe(2);
  });
});
