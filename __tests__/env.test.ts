import { getSpeicherpilotUrl, getHewContactUrl, isSpeicherpilotConfigured, isHewContactConfigured } from "@/app/lib/env";

describe("env", () => {
  const originalSpeicher = process.env.NEXT_PUBLIC_SPEICHERPILOT_URL;
  const originalHew = process.env.NEXT_PUBLIC_HEW_CONTACT_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SPEICHERPILOT_URL = originalSpeicher;
    process.env.NEXT_PUBLIC_HEW_CONTACT_URL = originalHew;
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

  it("nutzt HEW-Kontakt-Fallback ohne Env", () => {
    delete process.env.NEXT_PUBLIC_HEW_CONTACT_URL;
    expect(getHewContactUrl()).toMatch(/hamburger-energiewerke/i);
    expect(isHewContactConfigured()).toBe(false);
  });

  it("erkennt konfigurierte HEW-URL", () => {
    process.env.NEXT_PUBLIC_HEW_CONTACT_URL = "https://hew.example/kontakt";
    expect(getHewContactUrl()).toBe("https://hew.example/kontakt");
    expect(isHewContactConfigured()).toBe(true);
  });
});
