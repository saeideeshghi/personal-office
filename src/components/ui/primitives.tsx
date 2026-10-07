"use client";

import Link from "next/link";
import {
  ArrowUpLeft,
  BrainCircuit,
  Code2,
  Megaphone,
  Coffee,
  FolderOpen,
  Inbox,
  Clock3,
  Check,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { faNumber, persianDate } from "@/domain/calculations";
import type { Priority, ProjectStatus, TaskStatus } from "@/domain/types";
import { workAreas } from "@/data/catalog";
import { Dialog, DialogContent, DialogHeader } from "./dialog";
import { Button } from "./button";

const icons: Record<string, LucideIcon> = {
  BrainCircuit,
  Code2,
  Megaphone,
  Coffee,
};
export function AreaIcon({
  areaId,
  size = 20,
  className,
}: {
  areaId: string;
  size?: number;
  className?: string;
}) {
  const area = workAreas.find((a) => a.id === areaId) ?? workAreas[0];
  const Icon = icons[area.icon] ?? FolderOpen;
  return (
    <span
      className={cn("area-icon", className)}
      style={{ "--area-color": area.color } as CSSProperties}
    >
      <Icon size={size} />
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("section-card", className)}>
      {title && (
        <header className="section-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  color = "blue",
}: {
  title: string;
  value: ReactNode;
  detail: ReactNode;
  icon: LucideIcon;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${color}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

const statusLabels = {
  todo: "برای انجام",
  doing: "در حال انجام",
  done: "انجام شده",
  planning: "برنامه‌ریزی",
  active: "فعال",
  paused: "متوقف",
  completed: "تکمیل شده",
};
export function StatusBadge({
  status,
}: {
  status: TaskStatus | ProjectStatus;
}) {
  return (
    <span className={`status-badge status-${status}`}>
      <i />
      {statusLabels[status]}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority}`}>
      <span>
        {priority === "high" ? "↑" : priority === "medium" ? "–" : "↓"}
      </span>
      {priority === "high" ? "بالا" : priority === "medium" ? "متوسط" : "کم"}
    </span>
  );
}
export function ProjectBadge({ name }: { name?: string }) {
  return name ? (
    <span className="project-badge">
      <FolderOpen size={13} />
      <bdi>{name}</bdi>
    </span>
  ) : null;
}
export function ProgressBar({
  value,
  color,
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label ?? "پیشرفت"}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="progress-track"
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
        }}
      />
    </div>
  );
}
export function EmptyState({
  title = "اینجا هنوز کاری نیست",
  description = "اولین کار را اضافه کن و شروع کن.",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span>
        <Inbox size={27} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      className="icon-button"
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  label = "حذف",
  danger = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  label?: string;
  danger?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-small">
        <DialogHeader title={title} description={description} />
        <div className="confirm-icon">
          <AlertCircle size={30} />
        </div>
        <div className="dialog-footer">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            variant={danger ? "danger" : "default"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function ViewLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="view-link" href={href}>
      {children}
      <ArrowUpLeft size={16} />
    </Link>
  );
}
export function DueDate({ date }: { date?: string }) {
  return date ? (
    <span className="muted-inline">
      <Clock3 size={13} />
      {persianDate(date)}
    </span>
  ) : (
    <span className="muted-inline">بدون سررسید</span>
  );
}
export function CountLabel({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  return (
    <span>
      {faNumber(count)} {children}
    </span>
  );
}
export function CompletedDot() {
  return (
    <span className="completed-dot">
      <Check size={13} />
    </span>
  );
}
