/** Öffentliche App-Konfiguration (NEXT_PUBLIC_*) */

const DEFAULT_SPEICHERPILOT_URL = "https://speicherpilot.example";

/** URL der Speicherpilot-App – per .env.local überschreibbar */
export function getSpeicherpilotUrl(): string {
  const url = process.env.NEXT_PUBLIC_SPEICHERPILOT_URL;
  if (url && url.startsWith("http")) return url;
  return DEFAULT_SPEICHERPILOT_URL;
}

export function isSpeicherpilotConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SPEICHERPILOT_URL;
  return Boolean(url && url.startsWith("http") && !url.includes("example"));
}
