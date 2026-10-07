import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistenceOptions } from "@/lib/persistence";
import { defaultOffice, layouts } from "@/data/catalog";
import type { OfficeConfig, OfficeRoomConfig } from "@/domain/types";

type State = {
  config: OfficeConfig;
  update: (patch: Partial<OfficeConfig>) => void;
  updateRoom: (id: string, patch: Partial<OfficeRoomConfig>) => void;
  setLayout: (id: OfficeConfig["layoutId"]) => void;
};
export const useOfficeStore = create<State>()(
  persist(
    (set) => ({
      config: defaultOffice(),
      update: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
      updateRoom: (id, patch) =>
        set((s) => ({
          config: {
            ...s.config,
            rooms: s.config.rooms.map((room) =>
              room.id === id ? { ...room, ...patch } : room,
            ),
          },
        })),
      setLayout: (layoutId) =>
        set((s) => ({
          config: {
            ...s.config,
            layoutId,
            rooms: s.config.rooms.map((r, i) => ({
              ...r,
              ...layouts[layoutId][i],
            })),
          },
        })),
    }),
    persistenceOptions<State>("office"),
  ),
);
