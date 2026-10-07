import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistenceOptions } from "@/lib/persistence";
import { focusElapsedSeconds } from "@/domain/calculations";
import type { ActiveFocus, FocusSession } from "@/domain/types";
import { seed } from "./seed-state";

type State = {
  active: ActiveFocus | null;
  sessions: FocusSession[];
  lastFinishedAt: string | null;
  start: (active: ActiveFocus) => boolean;
  pause: (now?: string) => void;
  resume: (now?: string) => void;
  finish: (now?: string) => FocusSession | null;
  cancel: () => void;
};

export const useFocusStore = create<State>()(
  persist(
    (set, get) => ({
      active: null,
      sessions: seed.sessions,
      lastFinishedAt: null,
      start: (active) => {
        if (get().active) return false;
        set({ active });
        return true;
      },
      pause: (now = new Date().toISOString()) => {
        const active = get().active;
        if (!active || active.status !== "running") return;
        set({
          active: {
            ...active,
            status: "paused",
            pausedAt: now,
            runningSince: null,
            segments: active.runningSince
              ? [
                  ...active.segments,
                  { startedAt: active.runningSince, endedAt: now },
                ]
              : active.segments,
          },
        });
      },
      resume: (now = new Date().toISOString()) => {
        const active = get().active;
        if (!active || active.status !== "paused" || !active.pausedAt) return;
        set({
          active: {
            ...active,
            status: "running",
            pausedAt: null,
            runningSince: now,
            pausedDurationMs:
              active.pausedDurationMs +
              Math.max(0, Date.parse(now) - Date.parse(active.pausedAt)),
          },
        });
      },
      finish: (now = new Date().toISOString()) => {
        const active = get().active;
        if (!active) return null;
        const session: FocusSession = {
          id: active.id,
          taskId: active.taskId,
          taskTitle: active.taskTitle,
          projectId: active.projectId,
          workAreaId: active.workAreaId,
          startedAt: active.startedAt,
          endedAt: now,
          durationSeconds: focusElapsedSeconds(active, Date.parse(now)),
          segments: active.runningSince
            ? [
                ...active.segments,
                { startedAt: active.runningSince, endedAt: now },
              ]
            : active.segments,
        };
        set((s) => ({
          active: null,
          sessions: [session, ...s.sessions],
          lastFinishedAt: now,
        }));
        return session;
      },
      cancel: () => set({ active: null }),
    }),
    persistenceOptions<State>("focus"),
  ),
);
