import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistenceOptions } from "@/lib/persistence";
import type { Activity } from "@/domain/types";
import { seed } from "./seed-state";

type State = {
  activities: Activity[];
  add: (activity: Activity) => void;
  replace: (activities: Activity[]) => void;
};
export const useActivityStore = create<State>()(
  persist(
    (set) => ({
      activities: seed.activities,
      add: (activity) =>
        set((s) => ({ activities: [activity, ...s.activities] })),
      replace: (activities) => set({ activities }),
    }),
    persistenceOptions<State>("activity"),
  ),
);
