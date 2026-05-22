"use client";

import { useRouter } from "next/navigation";
import { Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/store";

/** Lädt das HEW-Showcase-Projekt und öffnet das Dashboard */
export function ShowcaseCta() {
  const router = useRouter();
  const loadShowcaseProject = useProjectStore((s) => s.loadShowcaseProject);

  return (
    <Button
      variant="outline"
      size="lg"
      className="border-[#0A4D68] text-[#0A4D68] hover:bg-[#0A4D68]/5 h-12"
      onClick={() => {
        loadShowcaseProject();
        router.push("/dashboard");
      }}
    >
      <Presentation className="mr-2 h-4 w-4" />
      HEW-Demo laden
    </Button>
  );
}
