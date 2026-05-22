"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import {
  TECHNOLOGY_CATEGORIES,
  TECHNOLOGY_LIBRARY,
  getTechnologiesByCategory,
  getTechnologyById,
} from "@/app/lib/technology-library";
import type { TechnologyCategory } from "@/app/types/technology";
import type { TechnologyLibraryEntry } from "@/app/types/technology";
import { TechnologyCard } from "@/app/components/technologien/TechnologyCard";
import { TechnologyDetailModal } from "@/app/components/technologien/TechnologyDetailModal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TechnologyExplorer() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<TechnologyCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TechnologyLibraryEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const techId = searchParams.get("tech");
    if (!techId) return;
    const entry = getTechnologyById(techId);
    if (entry) {
      setSelected(entry);
      setModalOpen(true);
      setCategory(entry.category);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const list = getTechnologiesByCategory(category);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        t.bestFor.some((b) => b.toLowerCase().includes(q)),
    );
  }, [category, search]);

  const openDetail = (tech: TechnologyLibraryEntry) => {
    setSelected(tech);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#06B6D4]/25 bg-[#06B6D4]/8 px-4 py-1.5 text-sm text-[#06B6D4]">
          <BookOpen className="h-4 w-4" />
          Energie-Wissen für Entscheider
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl dark:text-white">
          Technologien entdecken
        </h1>
        <p className="mt-4 text-lg text-[#0F172A]/65 dark:text-white/70">
          Verstehen Sie die wichtigsten Technologien für dezentrale Energie in
          Hamburg – verständlich erklärt, mit echten Kosten und klaren
          Empfehlungen. Kein Ingenieurstudium nötig.
        </p>
      </motion.div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0F172A]/40" />
          <Input
            placeholder="Technologie suchen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[#0F172A]/10 pl-10"
          />
        </div>
        <p className="text-sm text-[#0F172A]/55 dark:text-white/55">
          {filtered.length} von {TECHNOLOGY_LIBRARY.length} Technologien
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            category === "all"
              ? "bg-[#0F172A] text-white dark:bg-[#06B6D4] dark:text-[#0F172A]"
              : "bg-[#0F172A]/5 text-[#0F172A]/70 hover:bg-[#06B6D4]/10 dark:bg-white/10 dark:text-white/80",
          )}
        >
          Alle
        </button>
        {TECHNOLOGY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === cat.id
                ? "bg-[#0F172A] text-white dark:bg-[#06B6D4] dark:text-[#0F172A]"
                : "bg-[#0F172A]/5 text-[#0F172A]/70 hover:bg-[#06B6D4]/10 dark:bg-white/10 dark:text-white/80",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {category !== "all" && (
        <p className="mt-4 text-sm text-[#0F172A]/60 dark:text-white/60">
          {TECHNOLOGY_CATEGORIES.find((c) => c.id === category)?.description}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-[#0F172A]/55">
          Keine Technologie gefunden. Versuchen Sie einen anderen Suchbegriff.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tech, i) => (
            <TechnologyCard
              key={tech.id}
              technology={tech}
              index={i}
              onSelect={openDetail}
            />
          ))}
        </div>
      )}

      <TechnologyDetailModal
        technology={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
