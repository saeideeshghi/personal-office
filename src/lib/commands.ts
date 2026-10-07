import type {
  ActivityType,
  Project,
  Task,
  TaskStatus,
  ProjectRoomConfig,
} from "@/domain/types";
import {
  taskSchema,
  projectSchema,
  type TaskInput,
  type ProjectInput,
} from "@/domain/schemas";
import { moveTask, focusLabel } from "@/domain/calculations";
import { phases, createSeed, defaultSettings } from "@/data/seed";
import { defaultOffice, defaultWidgets } from "@/data/catalog";
import { newId } from "./utils";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useActivityStore } from "@/stores/activity-store";
import { useFocusStore } from "@/stores/focus-store";
import { useOfficeStore } from "@/stores/office-store";
import { useSettingsStore } from "@/stores/settings-store";

/** Application boundary: validation, cross-entity invariants and event recording. */
function log(
  type: ActivityType,
  message: string,
  entityId?: string,
  projectId?: string,
) {
  useActivityStore.getState().add({
    id: newId(),
    type,
    message,
    entityId,
    projectId,
    createdAt: new Date().toISOString(),
  });
}

export function saveTask(input: TaskInput, id?: string) {
  const data = taskSchema.parse(input);
  const previous = id
    ? useTaskStore.getState().tasks.find((t) => t.id === id)
    : undefined;
  const project = useProjectStore
    .getState()
    .projects.find((p) => p.id === data.projectId);
  const task: Task = moveTask(
    {
      id: previous?.id ?? newId(),
      title: data.title,
      description: data.description || undefined,
      projectId: project?.id,
      workAreaId: project?.workAreaId ?? data.workAreaId,
      status: data.status,
      priority: data.priority,
      estimatedMinutes: data.estimatedMinutes || undefined,
      plannedDate: data.plannedDate || undefined,
      plannedTime: data.plannedTime || undefined,
      dueDate: data.dueDate || undefined,
      tags: [
        ...new Set(
          data.tags
            .split(/[,،]/)
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ],
      createdAt: previous?.createdAt ?? new Date().toISOString(),
      completedAt: previous?.completedAt,
    },
    data.status,
  );
  useTaskStore.getState().upsert(task);
  if (useFocusStore.getState().active?.taskId === task.id) {
    const active = useFocusStore.getState().active!;
    useFocusStore.setState({
      active: {
        ...active,
        taskTitle: task.title,
        projectId: task.projectId,
        workAreaId: task.workAreaId,
      },
    });
  }
  log(
    previous ? "task_updated" : "task_created",
    `کار «${task.title}» ${previous ? "ویرایش" : "ایجاد"} شد`,
    task.id,
    task.projectId,
  );
  if (previous && previous.status !== task.status)
    logStatus(task, previous.status);
  return task;
}

function logStatus(task: Task, previous: TaskStatus) {
  const type =
    task.status === "done"
      ? "task_completed"
      : task.status === "doing"
        ? "task_started"
        : previous === "done"
          ? "task_reopened"
          : "task_updated";
  log(
    type,
    `کار «${task.title}» ${task.status === "done" ? "تکمیل شد" : task.status === "doing" ? "شروع شد" : "به صف انجام برگشت"}`,
    task.id,
    task.projectId,
  );
}

export function changeTaskStatus(id: string, status: TaskStatus) {
  const task = useTaskStore.getState().tasks.find((t) => t.id === id);
  if (!task || task.status === status) return;
  useTaskStore.getState().upsert(moveTask(task, status));
  logStatus({ ...task, status }, task.status);
}

export function deleteTask(id: string) {
  const task = useTaskStore.getState().tasks.find((t) => t.id === id);
  if (!task) return;
  if (useFocusStore.getState().active?.taskId === id) finishFocus(false);
  useTaskStore.getState().remove(id);
  log("task_deleted", `کار «${task.title}» حذف شد`, id, task.projectId);
}

export function saveProject(input: ProjectInput, id?: string) {
  const data = projectSchema.parse(input);
  const previous = useProjectStore.getState().projects.find((p) => p.id === id);
  const projectId = previous?.id ?? newId();
  const project: Project = {
    ...data,
    id: projectId,
    dueDate: data.dueDate || undefined,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    progress: 0,
    visibility: previous?.visibility ?? "private",
    notes: previous?.notes ?? "",
    phases:
      previous?.phases ??
      phases(projectId).map((p) => ({ ...p, completed: false })),
    roomConfig: previous?.roomConfig ?? {
      themeId: "modern",
      templateId: "software",
      decorations: ["plant"],
      widgets: defaultWidgets(projectId),
    },
  };
  useProjectStore.getState().upsert(project);
  // Project and its tasks must remain in the same work area.
  if (previous?.workAreaId !== project.workAreaId) {
    useTaskStore
      .getState()
      .replace(
        useTaskStore
          .getState()
          .tasks.map((t) =>
            t.projectId === projectId
              ? { ...t, workAreaId: project.workAreaId }
              : t,
          ),
      );
    const active = useFocusStore.getState().active;
    if (active?.projectId === projectId)
      useFocusStore.setState({
        active: { ...active, workAreaId: project.workAreaId },
      });
  }
  log(
    previous ? "project_updated" : "project_created",
    `پروژه «${project.name}» ${previous ? "ویرایش" : "ایجاد"} شد`,
    projectId,
    projectId,
  );
  return project;
}

export function updateProject(
  id: string,
  patch: {
    notes?: string;
    phases?: Project["phases"];
    roomConfig?: ProjectRoomConfig;
  },
) {
  const project = useProjectStore.getState().projects.find((p) => p.id === id);
  if (!project) return;
  useProjectStore.getState().upsert({ ...project, ...patch });
  log("project_updated", `فضای پروژه «${project.name}» به‌روز شد`, id, id);
}

export function deleteProject(id: string) {
  const project = useProjectStore.getState().projects.find((p) => p.id === id);
  if (!project) return;
  const active = useFocusStore.getState().active;
  if (active?.projectId === id)
    useFocusStore.setState({ active: { ...active, projectId: undefined } });
  // Preserve work: deleting a project makes its tasks independent.
  useTaskStore
    .getState()
    .replace(
      useTaskStore
        .getState()
        .tasks.map((t) =>
          t.projectId === id ? { ...t, projectId: undefined } : t,
        ),
    );
  useProjectStore.getState().remove(id);
  log(
    "project_deleted",
    `پروژه «${project.name}» حذف شد؛ کارها مستقل شدند`,
    id,
    id,
  );
}

export function startFocus(taskId: string): boolean {
  const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
  if (!task || task.status === "done" || useFocusStore.getState().active)
    return false;
  const now = new Date().toISOString();
  const started = useFocusStore.getState().start({
    id: newId(),
    taskId,
    taskTitle: task.title,
    projectId: task.projectId,
    workAreaId: task.workAreaId,
    startedAt: now,
    status: "running",
    pausedAt: null,
    pausedDurationMs: 0,
    runningSince: now,
    segments: [],
    goalMinutes: useSettingsStore.getState().settings.focusMinutes,
  });
  if (started) {
    changeTaskStatus(taskId, "doing");
    log(
      "focus_started",
      `تمرکز روی «${task.title}» شروع شد`,
      taskId,
      task.projectId,
    );
  }
  return started;
}

export function pauseFocus() {
  const active = useFocusStore.getState().active;
  if (!active || active.status !== "running") return;
  useFocusStore.getState().pause();
  log("focus_paused", "جلسه تمرکز متوقف شد", active.taskId, active.projectId);
}
export function resumeFocus() {
  const active = useFocusStore.getState().active;
  if (!active || active.status !== "paused") return;
  useFocusStore.getState().resume();
  log(
    "focus_resumed",
    "جلسه تمرکز ادامه یافت",
    active.taskId,
    active.projectId,
  );
}
export function finishFocus(completeTask: boolean) {
  const session = useFocusStore.getState().finish();
  if (!session) return;
  if (completeTask && session.taskId) changeTaskStatus(session.taskId, "done");
  log(
    "focus_finished",
    `جلسه تمرکز ${focusLabel(session.durationSeconds)}‌ای پایان یافت`,
    session.taskId,
    session.projectId,
  );
}
export function cancelFocus() {
  const active = useFocusStore.getState().active;
  if (!active) return;
  useFocusStore.getState().cancel();
  log("focus_cancelled", "جلسه تمرکز لغو شد", active.taskId, active.projectId);
}

export function recordOfficeChange() {
  log("office_updated", "چیدمان دفتر کار به‌روز شد");
}

export function resetDemoData() {
  const seed = createSeed();
  useTaskStore.getState().replace(seed.tasks);
  useProjectStore.getState().replace(seed.projects);
  useActivityStore.getState().replace(seed.activities);
  useFocusStore.setState({
    active: null,
    sessions: seed.sessions,
    lastFinishedAt: null,
  });
  useOfficeStore.setState({ config: defaultOffice() });
  useSettingsStore.setState({ settings: defaultSettings });
}
