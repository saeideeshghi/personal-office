"use client";
import { useId, useState, type FormEvent } from "react";
import { Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { projectSchema, type ProjectInput } from "@/domain/schemas";
import type { Project } from "@/domain/types";
import { workAreas } from "@/data/catalog";
import { saveProject } from "@/lib/commands";
import { useNotice } from "@/components/app-shell/providers";

export function ProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<ProjectInput>({
    name: project?.name ?? "",
    description: project?.description ?? "",
    workAreaId: project?.workAreaId ?? "area-coding",
    status: project?.status ?? "planning",
    dueDate: project?.dueDate ?? "",
  });
  const [error, setError] = useState("");
  const prefix = useId();
  const notify = useNotice();
  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = projectSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    saveProject(result.data, project?.id);
    notify(project ? "پروژه به‌روز شد" : "پروژه جدید ساخته شد");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader
          title={project ? "ویرایش پروژه" : "یک ایده، یک پروژه تازه"}
          description="پروژه‌ات را به یکی از اتاق‌های دفتر وصل کن."
        />
        <form className="form-grid" onSubmit={submit}>
          <div className="field field-full">
            <label htmlFor={`${prefix}-name`}>نام پروژه *</label>
            <input
              id={`${prefix}-name`}
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="اسم ایده‌ای که می‌خواهی بسازی"
            />
          </div>
          <div className="field field-full">
            <label htmlFor={`${prefix}-description`}>توضیحات</label>
            <textarea
              rows={3}
              id={`${prefix}-description`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="این پروژه چه مسئله‌ای را حل می‌کند؟"
            />
          </div>
          <div className="field">
            <label htmlFor={`${prefix}-area`}>حوزه کاری</label>
            <select
              id={`${prefix}-area`}
              value={form.workAreaId}
              onChange={(e) => set("workAreaId", e.target.value)}
            >
              {workAreas.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${prefix}-status`}>وضعیت</label>
            <select
              id={`${prefix}-status`}
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as ProjectInput["status"])
              }
            >
              <option value="planning">برنامه‌ریزی</option>
              <option value="active">فعال</option>
              <option value="paused">متوقف</option>
              <option value="completed">تکمیل شده</option>
            </select>
          </div>
          <div className="field field-full">
            <label htmlFor={`${prefix}-due`}>سررسید (میلادی)</label>
            <input
              dir="ltr"
              id={`${prefix}-due`}
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="field-error field-full">
              {error}
            </p>
          )}
          <div className="dialog-footer field-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit">
              {project ? <Check size={17} /> : <Plus size={17} />}
              {project ? "ذخیره تغییرات" : "ساخت پروژه"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
