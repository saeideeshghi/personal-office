import { addDays, format, startOfDay, startOfWeek } from "date-fns";
import type { ActiveFocus, FocusSession, Task, TaskStatus } from "./types";

/** Wall-clock calculation survives reload, sleeping tabs and delayed intervals. */
export function focusElapsedSeconds(
  active: ActiveFocus | null,
  now = Date.now(),
): number {
  if (!active) return 0;
  const currentPause =
    active.status === "paused" && active.pausedAt
      ? Math.max(0, now - Date.parse(active.pausedAt))
      : 0;
  return Math.max(
    0,
    Math.floor(
      (now -
        Date.parse(active.startedAt) -
        active.pausedDurationMs -
        currentPause) /
        1000,
    ),
  );
}

export function projectProgress(tasks: Task[]): number {
  return tasks.length
    ? Math.round(
        (tasks.filter((t) => t.status === "done").length / tasks.length) * 100,
      )
    : 0;
}

export function moveTask(
  task: Task,
  status: TaskStatus,
  now = new Date().toISOString(),
): Task {
  return {
    ...task,
    status,
    completedAt: status === "done" ? (task.completedAt ?? now) : undefined,
  };
}

export function dateKey(date: Date | string = new Date()): string {
  return format(typeof date === "string" ? new Date(date) : date, "yyyy-MM-dd");
}

/** Intersect work segments with each day; paused time never enters analytics. */
export function sessionSecondsOnDay(session: FocusSession, day: Date): number {
  const start = startOfDay(day).getTime();
  const end = addDays(startOfDay(day), 1).getTime();
  const segments = session.segments.length
    ? session.segments
    : [
        {
          startedAt: session.startedAt,
          endedAt: new Date(
            Date.parse(session.startedAt) + session.durationSeconds * 1000,
          ).toISOString(),
        },
      ];
  return Math.floor(
    segments.reduce(
      (total, part) =>
        total +
        Math.max(
          0,
          Math.min(end, Date.parse(part.endedAt)) -
            Math.max(start, Date.parse(part.startedAt)),
        ),
      0,
    ) / 1000,
  );
}

export function weeklyAnalytics(
  tasks: Task[],
  sessions: FocusSession[],
  now = new Date(),
  weekStartsOn: 6 | 1 = 6,
) {
  const start = startOfWeek(now, { weekStartsOn });
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    const key = dateKey(day);
    const seconds = sessions.reduce(
      (sum, session) => sum + sessionSecondsOnDay(session, day),
      0,
    );
    return {
      date: key,
      day: new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(day),
      minutes: Math.round(seconds / 60),
      seconds,
      completed: tasks.filter(
        (task) => task.completedAt && dateKey(task.completedAt) === key,
      ).length,
    };
  });
  const bestDay = days.reduce(
    (best, d) => (d.seconds > best.seconds ? d : best),
    days[0],
  );
  return {
    days,
    bestDay: bestDay.seconds ? bestDay : null,
    totalSeconds: days.reduce((sum, d) => sum + d.seconds, 0),
    completed: days.reduce((sum, d) => sum + d.completed, 0),
  };
}

export function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export function focusLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60
    ? `${faNumber(Math.floor(minutes / 60))} ساعت${minutes % 60 ? ` و ${faNumber(minutes % 60)} دقیقه` : ""}`
    : `${faNumber(minutes)} دقیقه`;
}

export function faNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function persianDate(
  value: Date | string = new Date(),
  full = false,
): string {
  const date =
    typeof value === "string"
      ? new Date(`${value.slice(0, 10)}T12:00:00`)
      : value;
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: full ? "long" : "short",
    ...(full ? { weekday: "long" as const } : {}),
  }).format(date);
}
