import { ProjectsList } from "@/app/components/projekte/ProjectsList";

export const metadata = {
  title: "Meine Projekte | DezentralKonzeptPilot",
  description: "Gespeicherte Konzeptstudien im Überblick",
};

export default function ProjektePage() {
  return <ProjectsList />;
}
