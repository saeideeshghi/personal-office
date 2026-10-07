import { describe, expect, it } from "vitest";
import {
  focusElapsedSeconds,
  projectProgress,
  moveTask,
  weeklyAnalytics,
  sessionSecondsOnDay,
  dateKey,
  formatTimer,
} from "./calculations";
import type { ActiveFocus, Task, FocusSession } from "./types";

const task = (status: Task["status"]): Task => ({
  id: "t1",
  title: "کار",
  workAreaId: "area-ai",
  status,
  priority: "medium",
  tags: [],
  createdAt: "2026-10-03T08:00:00Z",
});
const active: ActiveFocus = {
  id: "focus-1",
  taskId: "t1",
  taskTitle: "کار",
  workAreaId: "area-ai",
  startedAt: "2026-10-03T08:00:00Z",
  status: "running",
  pausedAt: null,
  pausedDurationMs: 0,
  runningSince: "2026-10-03T08:00:00Z",
  segments: [],
  goalMinutes: 50,
};

describe("timestamp focus timer", () => {
  it("derives elapsed time without depending on interval ticks", () => {
    expect(
      focusElapsedSeconds(active, Date.parse("2026-10-03T08:42:17Z")),
    ).toBe(2537);
  });
  it("subtracts completed pauses", () => {
    expect(
      focusElapsedSeconds(
        { ...active, pausedDurationMs: 300000 },
        Date.parse("2026-10-03T08:15:00Z"),
      ),
    ).toBe(600);
  });
  it("freezes a paused timer after a reload or a sleeping tab", () => {
    expect(
      focusElapsedSeconds(
        { ...active, status: "paused", pausedAt: "2026-10-03T08:10:00Z" },
        Date.parse("2026-10-04T12:00:00Z"),
      ),
    ).toBe(600);
  });
  it("clamps clock corrections and null sessions", () => {
    expect(
      focusElapsedSeconds(active, Date.parse("2026-10-03T07:59:00Z")),
    ).toBe(0);
    expect(focusElapsedSeconds(null)).toBe(0);
    expect(formatTimer(3661)).toBe("01:01:01");
  });
});

describe("task transitions and progress", () => {
  it("handles zero tasks and derives progress from completed tasks", () => {
    expect(projectProgress([])).toBe(0);
    expect(projectProgress([task("todo"), task("done"), task("doing")])).toBe(
      33,
    );
    expect(projectProgress([task("done")])).toBe(100);
  });
  it("sets completion timestamps and clears them on reopening", () => {
    const original = task("doing");
    const done = moveTask(original, "done", "2026-10-03T09:00:00Z");
    expect(done.completedAt).toBe("2026-10-03T09:00:00Z");
    expect(original.status).toBe("doing");
    expect(moveTask(done, "todo").completedAt).toBeUndefined();
  });
});

describe("day and week grouping", () => {
  it("splits sessions across local midnight and excludes pauses", () => {
    const a = new Date(2026, 9, 3, 23, 30);
    const b = new Date(2026, 9, 4, 0, 30);
    const c = new Date(2026, 9, 4, 1, 0);
    const d = new Date(2026, 9, 4, 1, 30);
    const s: FocusSession = {
      id: "s",
      startedAt: a.toISOString(),
      endedAt: d.toISOString(),
      durationSeconds: 5400,
      segments: [
        { startedAt: a.toISOString(), endedAt: b.toISOString() },
        { startedAt: c.toISOString(), endedAt: d.toISOString() },
      ],
    };
    expect(sessionSecondsOnDay(s, a)).toBe(1800);
    expect(sessionSecondsOnDay(s, d)).toBe(3600);
  });
  it("starts the default week on Saturday and groups completed tasks by local date", () => {
    const day = new Date(2026, 9, 4, 10, 0);
    const s: FocusSession = {
      id: "s",
      startedAt: day.toISOString(),
      endedAt: new Date(day.getTime() + 3600000).toISOString(),
      durationSeconds: 3600,
      segments: [],
    };
    const done = { ...task("done"), completedAt: day.toISOString() };
    const result = weeklyAnalytics([done], [s], day, 6);
    expect(result.days[0].date).toBe(dateKey(new Date(2026, 9, 3)));
    expect(result.bestDay?.date).toBe(dateKey(day));
    expect(result.totalSeconds).toBe(3600);
    expect(result.completed).toBe(1);
  });
});
