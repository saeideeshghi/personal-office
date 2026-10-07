import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { useTaskStore } from "./task-store";
import { useProjectStore } from "./project-store";
import { useFocusStore } from "./focus-store";
import { useActivityStore } from "./activity-store";
import { useSettingsStore } from "./settings-store";
import { localPersistence } from "@/lib/persistence";
import {
  changeTaskStatus,
  startFocus,
  pauseFocus,
  resumeFocus,
  finishFocus,
  saveTask,
  saveProject,
  deleteProject,
} from "@/lib/commands";
import { focusElapsedSeconds } from "@/domain/calculations";
import { defaultSettings } from "@/data/seed";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-03T08:00:00Z"));
  useTaskStore.setState({ tasks: [] });
  useProjectStore.setState({ projects: [] });
  useActivityStore.setState({ activities: [] });
  useFocusStore.setState({ active: null, sessions: [], lastFinishedAt: null });
  useSettingsStore.setState({ settings: defaultSettings });
});
afterEach(() => {
  vi.useRealTimers();
  useFocusStore.persist.setOptions({
    storage: createJSONStorage(() => localPersistence),
  });
});
function addTask(projectId = "") {
  return saveTask({
    title: "نوشتن API",
    description: "",
    workAreaId: "area-coding",
    projectId,
    status: "todo",
    priority: "high",
    estimatedMinutes: 30,
    plannedDate: "2026-10-03",
    plannedTime: "09:00",
    dueDate: "",
    tags: "API، UI، API",
  });
}

describe("real application commands", () => {
  it("moves tasks and creates activity records", () => {
    const task = addTask();
    changeTaskStatus(task.id, "doing");
    changeTaskStatus(task.id, "done");
    changeTaskStatus(task.id, "todo");
    expect(useTaskStore.getState().tasks[0].status).toBe("todo");
    expect(useTaskStore.getState().tasks[0].completedAt).toBeUndefined();
    expect(useTaskStore.getState().tasks[0].tags).toEqual(["API", "UI"]);
    expect(useActivityStore.getState().activities.map((a) => a.type)).toContain(
      "task_completed",
    );
  });
  it("allows one focus session and records only work time after pause/resume", () => {
    const task = addTask();
    const other = addTask();
    expect(startFocus(task.id)).toBe(true);
    expect(startFocus(other.id)).toBe(false);
    vi.advanceTimersByTime(10 * 60000);
    pauseFocus();
    vi.advanceTimersByTime(5 * 60000);
    resumeFocus();
    vi.advanceTimersByTime(15 * 60000);
    finishFocus(true);
    const focus = useFocusStore.getState();
    expect(focus.active).toBeNull();
    expect(focus.sessions[0].durationSeconds).toBe(1500);
    expect(focus.sessions[0].segments).toHaveLength(2);
    expect(
      useTaskStore.getState().tasks.find((t) => t.id === task.id)?.status,
    ).toBe("done");
  });
  it("preserves tasks when deleting a project and enforces its work area", () => {
    const p = saveProject({
      name: "پروژه AI",
      description: "",
      workAreaId: "area-ai",
      status: "active",
      dueDate: "",
    });
    const t = addTask(p.id);
    expect(t.workAreaId).toBe("area-ai");
    deleteProject(p.id);
    expect(useTaskStore.getState().tasks[0].projectId).toBeUndefined();
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });
  it("rehydrates the persisted focus timestamps correctly", async () => {
    const memory = new Map<string, string>();
    useFocusStore.persist.setOptions({
      storage: createJSONStorage(() => ({
        getItem: (key) => memory.get(key) ?? null,
        setItem: (key, value) => {
          memory.set(key, value);
        },
        removeItem: (key) => {
          memory.delete(key);
        },
      })),
    });
    const task = addTask();
    startFocus(task.id);
    vi.advanceTimersByTime(60000);
    pauseFocus();
    const key = useFocusStore.persist.getOptions().name!;
    const saved = memory.get(key)!;
    useFocusStore.setState({ active: null });
    memory.set(key, saved);
    vi.advanceTimersByTime(3600000);
    await useFocusStore.persist.rehydrate();
    expect(useFocusStore.getState().active?.status).toBe("paused");
    expect(focusElapsedSeconds(useFocusStore.getState().active)).toBe(60);
    resumeFocus();
    vi.advanceTimersByTime(60000);
    finishFocus(false);
    expect(useFocusStore.getState().sessions[0].durationSeconds).toBe(120);
  });
});
