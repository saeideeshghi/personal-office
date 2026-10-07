import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistenceOptions } from "@/lib/persistence";
import { defaultSettings } from "@/data/seed";
import type { Settings } from "@/domain/types";

type State = { settings: Settings; update: (patch: Partial<Settings>) => void };
export const useSettingsStore = create<State>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      update: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    persistenceOptions<State>("settings"),
  ),
);
