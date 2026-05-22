import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createShowcaseProject } from "@/app/lib/demo-project";
import {
  createEmptyProject,
  defaultTechnologies,
  type ProjectData,
  type TechnologySelection,
} from "@/app/types/project";

interface ProjectStore {
  currentProject: ProjectData;
  savedProjects: ProjectData[];
  setCurrentProject: (project: Partial<ProjectData>) => void;
  resetCurrentProject: () => void;
  saveCurrentProject: () => void;
  loadProject: (id: string) => void;
  loadShowcaseProject: () => void;
  startWizardWithTechnologies: (technologies: Partial<TechnologySelection>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProject: createEmptyProject(),
      savedProjects: [],

      setCurrentProject: (partial) =>
        set((state) => ({
          currentProject: {
            ...state.currentProject,
            ...partial,
            updatedAt: new Date().toISOString(),
          },
        })),

      resetCurrentProject: () =>
        set({ currentProject: createEmptyProject() }),

      saveCurrentProject: () => {
        const { currentProject, savedProjects } = get();
        const existing = savedProjects.findIndex(
          (p) => p.id === currentProject.id,
        );
        const updated = { ...currentProject, updatedAt: new Date().toISOString() };
        if (existing >= 0) {
          const next = [...savedProjects];
          next[existing] = updated;
          set({ savedProjects: next, currentProject: updated });
        } else {
          set({
            savedProjects: [...savedProjects, updated],
            currentProject: updated,
          });
        }
      },

      loadProject: (id) => {
        const project = get().savedProjects.find((p) => p.id === id);
        if (project) set({ currentProject: project });
      },

      loadShowcaseProject: () => {
        const showcase = createShowcaseProject();
        const { savedProjects } = get();
        const exists = savedProjects.some((p) => p.id === showcase.id);
        set({
          currentProject: showcase,
          savedProjects: exists ? savedProjects : [...savedProjects, showcase],
        });
      },

      startWizardWithTechnologies: (technologies) => {
        const merged: TechnologySelection = {
          ...defaultTechnologies,
          ...technologies,
        };
        if (merged.heatPumpAir) merged.heatPumpGround = false;
        if (merged.heatPumpGround) merged.heatPumpAir = false;
        const fresh = createEmptyProject();
        set({
          currentProject: {
            ...fresh,
            technologies: merged,
          },
        });
      },

      deleteProject: (id) =>
        set((state) => ({
          savedProjects: state.savedProjects.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "energie-quartier-projects",
    },
  ),
);
