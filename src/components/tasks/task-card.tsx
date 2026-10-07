"use client";

import { useState, type ReactNode } from "react";
import { Clock3, Play, Pencil, Trash2, Check, RotateCcw } from "lucide-react";
import type { Task, TaskStatus } from "@/domain/types";
import { useProjectStore } from "@/stores/project-store";
import { useFocusStore } from "@/stores/focus-store";
import { changeTaskStatus, deleteTask, startFocus } from "@/lib/commands";
import { faNumber } from "@/domain/calculations";
import { workAreas } from "@/data/catalog";
import {
  AreaIcon,
  ConfirmDialog,
  PriorityBadge,
  ProjectBadge,
} from "@/components/ui/primitives";
import { TaskDialog } from "./task-dialog";
import { useNotice } from "@/components/app-shell/providers";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  handle,
  overlay = false,
  compact = false,
  highlighted = false,
}: {
  task: Task;
  handle?: ReactNode;
  overlay?: boolean;
  compact?: boolean;
  highlighted?: boolean;
}) {
  const projects = useProjectStore((s) => s.projects);
  const active = useFocusStore((s) => s.active);
  const project = projects.find((p) => p.id === task.projectId);
  const area = workAreas.find((a) => a.id === task.workAreaId)!;
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  const notify = useNotice();
  return (
    <article
      className={cn(
        "task-card",
        compact && "task-card-compact",
        task.status === "done" && "task-done",
        highlighted && "task-highlighted",
        active?.taskId === task.id && "task-focusing",
      )}
      data-task-id={task.id}
    >
      <div className="task-card-top">
        <PriorityBadge priority={task.priority} />
        {handle}
        <div className="task-card-menu">
          {!overlay && (
            <>
              <button
                aria-label={`ویرایش ${task.title}`}
                title="ویرایش"
                onClick={() => setEdit(true)}
              >
                <Pencil size={14} />
              </button>
              <button
                aria-label={`حذف ${task.title}`}
                title="حذف"
                onClick={() => setRemove(true)}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="task-title-row">
        <button
          className={cn("task-checkbox", task.status === "done" && "checked")}
          aria-label={
            task.status === "done"
              ? `بازکردن ${task.title}`
              : `تکمیل ${task.title}`
          }
          disabled={overlay}
          onClick={() =>
            changeTaskStatus(task.id, task.status === "done" ? "todo" : "done")
          }
        >
          {task.status === "done" && <Check size={13} />}
        </button>
        <button
          className="task-title"
          disabled={overlay}
          onClick={() => setEdit(true)}
        >
          <bdi>{task.title}</bdi>
        </button>
      </div>
      <ProjectBadge name={project?.name} />
      {!compact && (
        <div className="task-tags">
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag}>
              <bdi>{tag}</bdi>
            </span>
          ))}
        </div>
      )}
      <div className="task-card-bottom">
        <div className="task-area">
          <AreaIcon areaId={task.workAreaId} size={13} />
          <span>{area.name}</span>
        </div>
        {task.estimatedMinutes && (
          <span className="task-duration">
            <Clock3 size={12} />
            {faNumber(task.estimatedMinutes)} دقیقه
          </span>
        )}
      </div>
      {!overlay && (
        <div className="task-card-actions">
          <select
            aria-label={`وضعیت ${task.title}`}
            value={task.status}
            onChange={(e) =>
              changeTaskStatus(task.id, e.target.value as TaskStatus)
            }
          >
            <option value="todo">برای انجام</option>
            <option value="doing">در حال انجام</option>
            <option value="done">انجام شده</option>
          </select>
          {task.status !== "done" ? (
            <button
              className="task-start"
              disabled={!!active}
              onClick={() => {
                if (startFocus(task.id)) notify("جلسه تمرکز شروع شد");
              }}
            >
              <Play size={12} fill="currentColor" />
              {active?.taskId === task.id ? "در حال تمرکز" : "تمرکز"}
            </button>
          ) : (
            <button
              className="task-reopen"
              onClick={() => changeTaskStatus(task.id, "todo")}
            >
              <RotateCcw size={12} />
              بازکردن
            </button>
          )}
        </div>
      )}
      {edit && <TaskDialog task={task} open={edit} onOpenChange={setEdit} />}
      <ConfirmDialog
        open={remove}
        onOpenChange={setRemove}
        title="این کار حذف شود؟"
        description={`«${task.title}» حذف می‌شود. زمان تمرکز ثبت‌شده حفظ می‌شود.`}
        onConfirm={() => {
          deleteTask(task.id);
          notify("کار حذف شد");
        }}
      />
    </article>
  );
}

export function TaskList({
  tasks,
  compact = false,
}: {
  tasks: Task[];
  compact?: boolean;
}) {
  return (
    <div className={cn("task-list", compact && "task-list-compact")}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} compact={compact} />
      ))}
    </div>
  );
}
