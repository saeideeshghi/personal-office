"use client";

import { useId, useState, type FormEvent } from "react";
import { Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { taskSchema, type TaskInput } from "@/domain/schemas";
import type { Task, TaskStatus } from "@/domain/types";
import { dateKey } from "@/domain/calculations";
import { workAreas } from "@/data/catalog";
import { useProjectStore } from "@/stores/project-store";
import { saveTask } from "@/lib/commands";
import { useNotice } from "@/components/app-shell/providers";

export function TaskDialog({
  task,
  open,
  onOpenChange,
  projectId,
  areaId,
  lockArea = false,
  plannedDate,
  initialStatus = "todo",
}: {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  areaId?: string;
  lockArea?: boolean;
  plannedDate?: string;
  initialStatus?: TaskStatus;
}) {
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === (task?.projectId ?? projectId));
  const [form, setForm] = useState<TaskInput>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    projectId: task?.projectId ?? projectId ?? "",
    workAreaId:
      project?.workAreaId ?? task?.workAreaId ?? areaId ?? "area-coding",
    status: task?.status ?? initialStatus,
    priority: task?.priority ?? "medium",
    estimatedMinutes: task?.estimatedMinutes ?? 30,
    plannedDate: task?.plannedDate ?? plannedDate ?? dateKey(),
    plannedTime: task?.plannedTime ?? "",
    dueDate: task?.dueDate ?? "",
    tags: task?.tags.join("، ") ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const notify = useNotice();
  const prefix = useId();
  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const field = (
    key: string,
    label: string,
    children: React.ReactNode,
    full = false,
  ) => (
    <div className={`field ${full ? "field-full" : ""}`}>
      <label htmlFor={`${prefix}-${key}`}>{label}</label>
      {children}
      {errors[key] && <small className="field-error">{errors[key]}</small>}
    </div>
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    const result = taskSchema.safeParse(form);
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((i) => [String(i.path[0]), i.message]),
        ),
      );
      return;
    }
    saveTask(result.data, task?.id);
    notify(task ? "تغییرات کار ذخیره شد" : "کار جدید به دفتر اضافه شد");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="task-dialog">
        <DialogHeader
          title={task ? "ویرایش کار" : "یک کار تازه"}
          description="یک قدم مشخص برای پیش بردن ایده‌ات تعریف کن."
        />
        <form onSubmit={submit} className="form-grid">
          {field(
            "title",
            "عنوان کار *",
            <input
              id={`${prefix}-title`}
              autoFocus
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="مثلاً طراحی صفحه اصلی"
              aria-invalid={!!errors.title}
            />,
            true,
          )}
          {field(
            "description",
            "توضیحات",
            <textarea
              id={`${prefix}-description`}
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="خروجی این کار چه چیزی است؟"
            />,
            true,
          )}
          {field(
            "projectId",
            "پروژه",
            <select
              id={`${prefix}-projectId`}
              value={form.projectId}
              onChange={(e) => {
                const p = projects.find((p) => p.id === e.target.value);
                setForm((f) => ({
                  ...f,
                  projectId: e.target.value,
                  workAreaId: p?.workAreaId ?? f.workAreaId,
                }));
              }}
            >
              <option value="">کار مستقل</option>
              {projects
                .filter((p) => !lockArea || p.workAreaId === areaId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>,
          )}
          {field(
            "workAreaId",
            "حوزه کاری",
            <select
              id={`${prefix}-workAreaId`}
              disabled={!!form.projectId || lockArea}
              value={form.workAreaId}
              onChange={(e) => set("workAreaId", e.target.value)}
            >
              {workAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>,
          )}
          {field(
            "priority",
            "اولویت",
            <select
              id={`${prefix}-priority`}
              value={form.priority}
              onChange={(e) =>
                set("priority", e.target.value as TaskInput["priority"])
              }
            >
              <option value="low">کم</option>
              <option value="medium">متوسط</option>
              <option value="high">بالا</option>
            </select>,
          )}
          {field(
            "status",
            "وضعیت",
            <select
              id={`${prefix}-status`}
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as TaskInput["status"])
              }
            >
              <option value="todo">برای انجام</option>
              <option value="doing">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>,
          )}
          {field(
            "estimatedMinutes",
            "زمان تخمینی (دقیقه)",
            <input
              id={`${prefix}-estimatedMinutes`}
              type="number"
              min={0}
              max={1440}
              value={form.estimatedMinutes}
              onChange={(e) => set("estimatedMinutes", Number(e.target.value))}
              dir="ltr"
            />,
          )}
          {field(
            "plannedTime",
            "ساعت برنامه‌ریزی",
            <input
              id={`${prefix}-plannedTime`}
              type="time"
              value={form.plannedTime}
              onChange={(e) => set("plannedTime", e.target.value)}
              dir="ltr"
            />,
          )}
          {field(
            "plannedDate",
            "تاریخ برنامه‌ریزی",
            <input
              id={`${prefix}-plannedDate`}
              type="date"
              value={form.plannedDate}
              onChange={(e) => set("plannedDate", e.target.value)}
              dir="ltr"
            />,
          )}
          {field(
            "dueDate",
            "تاریخ سررسید",
            <input
              id={`${prefix}-dueDate`}
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              dir="ltr"
            />,
          )}
          {field(
            "tags",
            "برچسب‌ها",
            <input
              id={`${prefix}-tags`}
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="مثلاً UI، تحقیق، MVP"
            />,
            true,
          )}
          <div className="form-note field-full">
            تاریخ ورودی میلادی است؛ تاریخ‌ها در دفتر به شمسی نمایش داده می‌شوند.
          </div>
          <div className="dialog-footer field-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit">
              {task ? <Check size={17} /> : <Plus size={17} />}
              {task ? "ذخیره تغییرات" : "افزودن کار"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
