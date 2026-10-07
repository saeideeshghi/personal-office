"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { faIR } from "date-fns/locale";
import {
  Check,
  Focus,
  Plus,
  Pencil,
  Pause,
  LayoutDashboard,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { useActivityStore } from "@/stores/activity-store";
import { EmptyState } from "@/components/ui/primitives";
import type { Activity } from "@/domain/types";

function activityIcon(type: Activity["type"]) {
  if (type.includes("deleted")) return Trash2;
  if (type === "task_completed") return Check;
  if (type === "focus_paused") return Pause;
  if (type.includes("focus")) return Focus;
  if (type.includes("project")) return FolderOpen;
  if (type.includes("created")) return Plus;
  if (type.includes("office")) return LayoutDashboard;
  return Pencil;
}
export function ActivityList({
  limit = 4,
  projectId,
}: {
  limit?: number;
  projectId?: string;
}) {
  const activities = useActivityStore((s) => s.activities);
  const filtered = (
    projectId ? activities.filter((a) => a.projectId === projectId) : activities
  ).slice(0, limit);
  return filtered.length ? (
    <ol className="activity-list">
      {filtered.map((a) => {
        const Icon = activityIcon(a.type);
        return (
          <li key={a.id}>
            <span
              className={`activity-icon ${a.type === "task_completed" ? "green" : a.type.includes("focus") ? "purple" : "blue"}`}
            >
              <Icon size={15} />
            </span>
            <div>
              <p>{a.message}</p>
              <time dateTime={a.createdAt}>
                {formatDistanceToNowStrict(new Date(a.createdAt), {
                  addSuffix: true,
                  locale: faIR,
                })}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  ) : (
    <EmptyState
      title="فعالیت تازه‌ای ثبت نشده"
      description="با اولین کار، داستان این فضا شروع می‌شود."
    />
  );
}
