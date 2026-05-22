import { pruneSankeyData } from "@/app/lib/sankey-utils";
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
