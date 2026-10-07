import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistenceOptions } from "@/lib/persistence";
import type { Task } from "@/domain/types";
import { seed } from "./seed-state";

type State = {
  tasks: Task[];
  upsert: (task: Task) => void;
  remove: (id: string) => void;
  replace: (tasks: Task[]) => void;
};
export const useTaskStore = create<State>()(
  persist(
    (set) => ({
      tasks: seed.tasks,
      upsert: (task) =>
        set((s) => ({
          tasks: s.tasks.some((t) => t.id === task.id)
            ? s.tasks.map((t) => (t.id === task.id ? task : t))
            : [task, ...s.tasks],
        })),
      remove: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      replace: (tasks) => set({ tasks }),
    }),
    persistenceOptions<State>("tasks"),
  ),
);
