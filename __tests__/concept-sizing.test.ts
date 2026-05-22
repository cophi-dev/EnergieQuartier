import { buildConceptSizingItems } from "@/app/lib/concept-sizing";
import { calculateProject } from "@/app/lib/calculations";
import { createShowcaseProject } from "@/app/lib/demo-project";

describe("buildConceptSizingItems", () => {
  it("listet Dimensionen für aktive Technologien", () => {
    const project = createShowcaseProject();
    const result = calculateProject(project);
    const items = buildConceptSizingItems(project, result);

    expect(items.some((item) => item.id === "pv" && item.value.includes("kWp"))).toBe(
      true,
    );
    expect(items.some((item) => item.id === "battery")).toBe(true);
    expect(items.some((item) => item.id === "hp-air")).toBe(true);
    expect(items.every((item) => item.label && item.value)).toBe(true);
  });
});
