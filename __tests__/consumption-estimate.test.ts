import { estimateConsumption } from "@/app/lib/consumption-estimate";

describe("estimateConsumption", () => {
  it("schätzt höheren Wärmebedarf bei unsaniertem Gebäude", () => {
    const unsaniert = estimateConsumption({
      buildingType: "einfamilienhaus",
      livingArea: 120,
      usableArea: 0,
      yearBuilt: 1960,
      renovationStatus: "unsaniert",
    });
    const neubau = estimateConsumption({
      buildingType: "einfamilienhaus",
      livingArea: 120,
      usableArea: 0,
      yearBuilt: 2020,
      renovationStatus: "neubau",
    });
    expect(unsaniert.heatKwh).toBeGreaterThan(neubau.heatKwh);
  });

  it("liefert plausible Strom- und Wärmewerte für MFH", () => {
    const result = estimateConsumption({
      buildingType: "mehrfamilienhaus",
      livingArea: 480,
      usableArea: 120,
      yearBuilt: 1968,
      renovationStatus: "teilweise",
    });
    expect(result.electricityKwh).toBeGreaterThan(3000);
    expect(result.heatKwh).toBeGreaterThan(10000);
  });
});
