"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  CheckSquare,
  Clock3,
  Target,
  CircleDot,
  Save,
  Check,
  Lightbulb,
  Code2,
  FlaskConical,
  Rocket,
} from "lucide-react";
import { useProjectStore } from "@/stores/project-store";
import { useTaskStore } from "@/stores/task-store";
import { useFocusStore } from "@/stores/focus-store";
import {
  AreaIcon,
  DueDate,
  EmptyState,
  StatusBadge,
  SectionCard,
  StatCard,
  ProgressBar,
  ConfirmDialog,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskList } from "@/components/tasks/task-card";
import { ProjectDialog } from "./project-dialog";
import { ProjectRoom } from "./project-room";
import { ActivityList } from "@/components/office/activity-list";
import { deleteProject, updateProject } from "@/lib/commands";
import { faNumber, focusLabel, projectProgress } from "@/domain/calculations";
import { useNotice } from "@/components/app-shell/providers";
import { workAreas } from "@/data/catalog";

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const projects = useProjectStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks).filter(
    (t) => t.projectId === projectId,
  );
  const sessions = useFocusStore((s) => s.sessions);
  const project = projects.find((p) => p.id === projectId);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  const [filter, setFilter] = useState("all");
  const [notes, setNotes] = useState(project?.notes ?? "");
  const router = useRouter();
  const notify = useNotice();
  if (!project)
    return (
      <EmptyState
        title="پروژه پیدا نشد"
        description="ممکن است این پروژه حذف شده باشد."
      >
        <Button asChild>
          <Link href="/projects">برگشت به پروژه‌ها</Link>
        </Button>
      </EmptyState>
    );
  const area = workAreas.find((a) => a.id === project.workAreaId)!;
  const progress = projectProgress(tasks);
  const completed = tasks.filter((t) => t.status === "done").length;
  const seconds = sessions
    .filter((s) => s.projectId === projectId)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const phaseIcons = [Lightbulb, Code2, FlaskConical, Rocket];
  return (
    <>
      <Link className="back-link" href="/projects">
        <ArrowRight size={16} />
        همه پروژه‌ها
      </Link>
      <header className="project-detail-header">
        <AreaIcon areaId={project.workAreaId} size={30} />
        <div>
          <div className="eyebrow">{area.name} · فضای پروژه</div>
          <h1>
            <bdi>{project.name}</bdi>
          </h1>
          <p>{project.description}</p>
          <div className="project-meta">
            <StatusBadge status={project.status} />
            <DueDate date={project.dueDate} />
            <span className="private-badge">فضای خصوصی</span>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil size={16} />
            ویرایش
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="حذف پروژه"
            onClick={() => setRemove(true)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </header>
      <div className="stats-grid">
        <StatCard
          title="پیشرفت پروژه"
          value={`${faNumber(progress)}٪`}
          detail={<ProgressBar value={progress} color={area.color} />}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="کارهای تکمیل‌شده"
          value={`${faNumber(completed)} از ${faNumber(tasks.length)}`}
          detail="هر کار یک قدم به جلو"
          icon={CheckSquare}
          color="green"
        />
        <StatCard
          title="زمان تمرکز"
          value={focusLabel(seconds)}
          detail="مجموع جلسه‌های ثبت‌شده"
          icon={Clock3}
          color="blue"
        />
        <StatCard
          title="در حال انجام"
          value={`${faNumber(tasks.filter((t) => t.status === "doing").length)} کار`}
          detail="روی یک کار در هر لحظه تمرکز کن"
          icon={CircleDot}
          color="orange"
        />
      </div>
      <div className="project-detail-grid">
        <div className="project-detail-main">
          <SectionCard
            title="اتاق‌های مسیر پروژه"
            subtitle="مراحل را با پیشرفت واقعی پروژه علامت بزن؛ وضعیت اجرا از کارها می‌آید."
          >
            <div className="phase-rooms">
              {project.phases.map((phase, i) => {
                const Icon = phaseIcons[i % 4];
                return (
                  <button
                    key={phase.id}
                    className={`phase-room ${phase.completed ? "phase-complete" : ""}`}
                    aria-pressed={phase.completed}
                    onClick={() =>
                      updateProject(projectId, {
                        phases: project.phases.map((p) =>
                          p.id === phase.id
                            ? { ...p, completed: !p.completed }
                            : p,
                        ),
                      })
                    }
                  >
                    <span className="phase-room-number">{faNumber(i + 1)}</span>
                    <span className="phase-room-icon">
                      <Icon size={24} />
                    </span>
                    <strong>{phase.name}</strong>
                    <small>
                      {phase.completed ? (
                        <>
                          <Check size={12} />
                          مرحله تکمیل شد
                        </>
                      ) : (
                        "برای تکمیل کلیک کن"
                      )}
                    </small>
                  </button>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard
            title="کارهای پروژه"
            subtitle={`${faNumber(tasks.length)} قدم برای ساخت این ایده`}
            action={
              <Button size="sm" onClick={() => setAdd(true)}>
                <Plus size={15} />
                کار جدید
              </Button>
            }
          >
            <div className="task-filter-tabs">
              {[
                { id: "all", name: "همه" },
                { id: "todo", name: "برای انجام" },
                { id: "doing", name: "در حال انجام" },
                { id: "done", name: "انجام شده" },
              ].map((f) => (
                <button
                  key={f.id}
                  className={filter === f.id ? "active" : ""}
                  onClick={() => setFilter(f.id)}
                >
                  {f.name}
                </button>
              ))}
            </div>
            {tasks.filter((t) => filter === "all" || t.status === filter)
              .length ? (
              <TaskList
                tasks={tasks.filter(
                  (t) => filter === "all" || t.status === filter,
                )}
              />
            ) : (
              <EmptyState />
            )}
          </SectionCard>
          <SectionCard
            title="یادداشت‌های پروژه"
            subtitle="تصمیم‌ها، ایده‌ها و چیزهایی که نباید فراموش شوند"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  updateProject(projectId, { notes });
                  notify("یادداشت پروژه ذخیره شد");
                }}
              >
                <Save size={14} />
                ذخیره
              </Button>
            }
          >
            <label className="sr-only" htmlFor="project-notes">
              یادداشت پروژه
            </label>
            <textarea
              id="project-notes"
              className="project-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ایده‌ها و تصمیم‌های پروژه را اینجا بنویس…"
              rows={6}
              maxLength={10000}
            />
            {notes !== project.notes && (
              <p className="form-note">تغییرها هنوز ذخیره نشده‌اند.</p>
            )}
          </SectionCard>
        </div>
        <aside className="project-detail-side">
          <SectionCard
            title="اتاق اختصاصی پروژه"
            subtitle="این فضا را متناسب با ایده‌ات بچین"
          >
            <ProjectRoom project={project} />
          </SectionCard>
          <SectionCard title="فعالیت‌های پروژه">
            <ActivityList projectId={projectId} limit={6} />
          </SectionCard>
        </aside>
      </div>
      {add && (
        <TaskDialog open={add} onOpenChange={setAdd} projectId={projectId} />
      )}
      {edit && (
        <ProjectDialog project={project} open={edit} onOpenChange={setEdit} />
      )}
      <ConfirmDialog
        open={remove}
        onOpenChange={setRemove}
        title="پروژه حذف شود؟"
        description="کارها مستقل می‌شوند و تاریخچه تمرکز باقی می‌ماند."
        onConfirm={() => {
          deleteProject(projectId);
          router.push("/projects");
          notify("پروژه حذف شد");
        }}
      />
    </>
  );
}
