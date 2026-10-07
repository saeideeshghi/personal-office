import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistenceOptions } from "@/lib/persistence";
import type { Project } from "@/domain/types";
import { seed } from "./seed-state";

type State = {
  projects: Project[];
  upsert: (project: Project) => void;
  remove: (id: string) => void;
  replace: (projects: Project[]) => void;
};
export const useProjectStore = create<State>()(
  persist(
    (set) => ({
      projects: seed.projects,
      upsert: (project) =>
        set((s) => ({
          projects: s.projects.some((p) => p.id === project.id)
            ? s.projects.map((p) => (p.id === project.id ? project : p))
            : [project, ...s.projects],
        })),
      remove: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      replace: (projects) => set({ projects }),
    }),
    persistenceOptions<State>("projects"),
  ),
);
