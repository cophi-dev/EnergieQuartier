"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { calculateProject } from "@/app/lib/calculations";
import { HEW_SHOWCASE_PROJECT_ID } from "@/app/lib/demo-project";
import { useProjectStore } from "@/lib/store";
import type { ProjectData } from "@/app/types/project";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function techBadges(project: ProjectData): string[] {
  const { technologies } = project;
  return [
    technologies.pv && "PV",
    technologies.heatPumpAir && "Luft-WP",
    technologies.heatPumpGround && "Sole-WP",
    technologies.battery && "Speicher",
    technologies.solarThermal && "Solarthermie",
  ].filter((b): b is string => Boolean(b));
}

export function ProjectsList() {
  const router = useRouter();
  const {
    savedProjects,
    loadProject,
    loadShowcaseProject,
    deleteProject,
    resetCurrentProject,
  } = useProjectStore();
  const [hydrated, setHydrated] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => setHydrated(true), []);

  const sorted = useMemo(
    () =>
      [...savedProjects].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [savedProjects],
  );

  const handleOpen = (id: string) => {
    loadProject(id);
    router.push("/dashboard");
  };

  const handleEdit = (id: string) => {
    loadProject(id);
    router.push("/wizard");
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteProject(deleteId);
      setDeleteId(null);
    }
  };

  const handleNewProject = () => {
    resetCurrentProject();
    router.push("/wizard");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#0A4D68]">
        Projekte werden geladen …
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A4D68] dark:text-white">
            Meine Projekte
          </h1>
          <p className="mt-1 text-sm text-[#0A4D68]/60 dark:text-white/60">
            Gespeicherte Konzeptstudien · localStorage
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadShowcaseProject();
              router.push("/dashboard");
            }}
            className="border-[#0A4D68] text-[#0A4D68]"
          >
            HEW-Demo
          </Button>
          <Button
            onClick={handleNewProject}
            className="bg-[#088395] hover:bg-[#0A4D68] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="border-[#0A4D68]/10 border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-[#088395]/40 mb-4" />
            <p className="text-lg font-medium text-[#0A4D68] dark:text-white">
              Noch keine Projekte gespeichert
            </p>
            <p className="mt-2 max-w-sm text-sm text-[#0A4D68]/60">
              Starten Sie den Konfigurator und klicken Sie am Ende auf
              „Berechnen“ – das Projekt erscheint hier automatisch.
            </p>
            <ButtonLink
              href="/wizard"
              className="mt-6 bg-[#0A4D68] text-white"
            >
              Erstes Projekt starten
            </ButtonLink>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {sorted.map((project, index) => {
            const result = calculateProject(project);
            const badges = techBadges(project);

            return (
              <motion.li
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-[#0A4D68]/10 hover:border-[#088395]/40 hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-[#0A4D68] dark:text-white flex items-center gap-2">
                          {project.name}
                          {project.id === HEW_SHOWCASE_PROJECT_ID && (
                            <Badge className="bg-[#00FFCA]/30 text-[#0A4D68] text-[10px]">
                              HEW-Demo
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.address}, {project.postalCode}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <Badge
                            key={b}
                            variant="secondary"
                            className="bg-[#088395]/15 text-[#0A4D68]"
                          >
                            {b}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-4 text-sm mb-4">
                      <div>
                        <p className="text-xs text-[#088395]">Amortisation</p>
                        <p className="font-semibold text-[#0A4D68] dark:text-[#00FFCA]">
                          {result.economics.paybackYears} J.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#088395]">NPV (20 J.)</p>
                        <p className="font-semibold text-[#0A4D68] dark:text-[#00FFCA]">
                          {result.economics.npvEur.toLocaleString("de-DE")} €
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#088395]">CO₂-Einsparung</p>
                        <p className="font-semibold text-[#0A4D68] dark:text-[#00FFCA]">
                          {(result.environment.co2SavingsKg / 1000).toFixed(1)}{" "}
                          t/a
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#088395]">Autarkie</p>
                        <p className="font-semibold text-[#0A4D68] dark:text-[#00FFCA]">
                          {result.annual.autarkyPercent} %
                        </p>
                      </div>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-[#0A4D68]/50 mb-4">
                      <Calendar className="h-3 w-3" />
                      Zuletzt bearbeitet: {formatDate(project.updatedAt)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-[#0A4D68] hover:bg-[#088395] text-white"
                        onClick={() => handleOpen(project.id)}
                      >
                        Dashboard öffnen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#088395] text-[#0A4D68]"
                        onClick={() => handleEdit(project.id)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Löschen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#0A4D68]">Projekt löschen?</DialogTitle>
            <DialogDescription>
              Dieser Eintrag wird dauerhaft aus dem lokalen Speicher entfernt.
              Die Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
