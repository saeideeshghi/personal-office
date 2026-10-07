"use client";
import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ArrowUpLeft, CheckSquare, Clock3 } from "lucide-react";
import {
  AreaIcon,
  StatusBadge,
  ProgressBar,
  DueDate,
  ConfirmDialog,
} from "@/components/ui/primitives";
import { ProjectDialog } from "./project-dialog";
import type { Project } from "@/domain/types";
import { useTaskStore } from "@/stores/task-store";
import { useFocusStore } from "@/stores/focus-store";
import { projectProgress, faNumber, focusLabel } from "@/domain/calculations";
import { workAreas } from "@/data/catalog";
import { deleteProject } from "@/lib/commands";
import { useNotice } from "@/components/app-shell/providers";
import type { CSSProperties } from "react";
import { projectHref } from "@/lib/urls";

export function ProjectCard({ project }: { project: Project }) {
  const allTasks = useTaskStore((s) => s.tasks);
  const sessions = useFocusStore((s) => s.sessions);
  const tasks = allTasks.filter((t) => t.projectId === project.id);
  const area = workAreas.find((a) => a.id === project.workAreaId)!;
  const progress = projectProgress(tasks);
  const seconds = sessions
    .filter((s) => s.projectId === project.id)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  const notify = useNotice();
  return (
    <article
      className="project-card"
      style={{ "--area-color": area.color } as CSSProperties}
    >
      <header>
        <AreaIcon areaId={project.workAreaId} size={25} />
        <div className="project-menu">
          <button
            title="ویرایش"
            aria-label={`ویرایش ${project.name}`}
            onClick={() => setEdit(true)}
          >
            <Pencil size={16} />
          </button>
          <button
            title="حذف"
            aria-label={`حذف ${project.name}`}
            onClick={() => setRemove(true)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>
      <div className="project-area-name">{area.name}</div>
      <Link className="project-name" href={projectHref(project.id)}>
        <h2>
          <bdi>{project.name}</bdi>
        </h2>
      </Link>
      <p className="project-description">
        {project.description || "برای این ایده هنوز توضیحی نوشته نشده."}
      </p>
      <StatusBadge status={project.status} />
      <div className="project-progress">
        <span>پیشرفت پروژه</span>
        <strong>{faNumber(progress)}٪</strong>
        <ProgressBar
          value={progress}
          color={area.color}
          label={`پیشرفت ${project.name}`}
        />
      </div>
      <div className="project-metrics">
        <span>
          <CheckSquare size={15} />
          {faNumber(tasks.filter((t) => t.status === "done").length)} /{" "}
          {faNumber(tasks.length)} کار
        </span>
        <span>
          <Clock3 size={15} />
          {focusLabel(seconds)}
        </span>
      </div>
      <footer>
        <DueDate date={project.dueDate} />
        <Link href={projectHref(project.id)}>
          ورود به پروژه
          <ArrowUpLeft size={16} />
        </Link>
      </footer>
      {edit && (
        <ProjectDialog project={project} open={edit} onOpenChange={setEdit} />
      )}
      <ConfirmDialog
        open={remove}
        onOpenChange={setRemove}
        title="پروژه حذف شود؟"
        description="کارهای پروژه مستقل می‌شوند؛ کارها و تاریخچه تمرکز حفظ می‌شوند."
        onConfirm={() => {
          deleteProject(project.id);
          notify("پروژه حذف شد؛ کارها حفظ شدند");
        }}
      />
    </article>
  );
}
