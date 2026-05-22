import { getSpeicherpilotUrl, isSpeicherpilotConfigured } from "@/app/lib/env";

describe("env", () => {
  const original = process.env.NEXT_PUBLIC_SPEICHERPILOT_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SPEICHERPILOT_URL = original;
  });

  it("nutzt Fallback-URL ohne Env", () => {
    delete process.env.NEXT_PUBLIC_SPEICHERPILOT_URL;
    expect(getSpeicherpilotUrl()).toMatch(/^https?:\/\//);
    expect(isSpeicherpilotConfigured()).toBe(false);
  });

  it("erkennt konfigurierte Produktions-URL", () => {
    process.env.NEXT_PUBLIC_SPEICHERPILOT_URL =
      "https://app.speicherpilot.de";
    expect(getSpeicherpilotUrl()).toBe("https://app.speicherpilot.de");
    expect(isSpeicherpilotConfigured()).toBe(true);
  });
});
