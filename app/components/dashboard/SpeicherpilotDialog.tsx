"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSpeicherpilotUrl, isSpeicherpilotConfigured } from "@/app/lib/env";

export function SpeicherpilotDialog() {
  const [open, setOpen] = useState(false);
  const url = getSpeicherpilotUrl();
  const configured = isSpeicherpilotConfigured();

  return (
    <>
      <Button
        variant="outline"
        className="border-[#06B6D4] text-[#0F172A] hover:bg-[#06B6D4]/10 dark:text-[#06B6D4]"
        onClick={() => setOpen(true)}
      >
        Mit Speicherpilot optimieren
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0F172A]">
              Speicherpilot-Anbindung
            </DialogTitle>
            <DialogDescription>
              Für die feine Batteriespeicher-Dimensionierung und
              Lastgang-Optimierung können Sie Ihr Konzept in die
              Speicherpilot-App übergeben.
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm text-[#0F172A]/80 space-y-2 list-disc pl-4">
            <li>Lastprofil & PV-Erzeugung synchronisieren</li>
            <li>Optimale kWh-Kapazität und Wirtschaftlichkeit</li>
            <li>Ergebnis zurück in DezentralKonzeptPilot importieren (geplant)</li>
          </ul>
          {!configured && (
            <p className="rounded-md bg-[#22C55E]/15 px-3 py-2 text-xs text-[#0F172A]">
              Setzen Sie{" "}
              <code className="font-mono text-[10px]">
                NEXT_PUBLIC_SPEICHERPILOT_URL
              </code>{" "}
              in <code className="font-mono text-[10px]">.env.local</code> auf
              Ihre App-URL.
            </p>
          )}
          <Button
            className="w-full bg-[#06B6D4] hover:bg-[#0F172A] text-white"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            Speicherpilot öffnen
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center break-all">
            {url}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
