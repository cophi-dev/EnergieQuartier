"use client";

import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/store";

/** Lädt das HEW-Showcase-Projekt und öffnet das Dashboard */
export function ShowcaseCta() {
  const router = useRouter();
  const loadShowcaseProject = useProjectStore((s) => s.loadShowcaseProject);

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="outline"
        size="lg"
        className="h-12 border-[#06B6D4] bg-[#06B6D4]/5 text-[#0F172A] hover:bg-[#06B6D4]/15 dark:border-[#06B6D4] dark:text-[#06B6D4] dark:hover:bg-[#06B6D4]/10"
        onClick={() => {
          loadShowcaseProject();
          router.push("/dashboard");
        }}
      >
        <Play className="mr-2 h-4 w-4 fill-current" />
        Demo Projekt laden
      </Button>
    </motion.div>
  );
}
