"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, FolderOpen, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { AreaIcon, EmptyState, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { RoomArtwork } from "./office-scene";
import { TaskList } from "@/components/tasks/task-card";
import { FocusPanel } from "@/components/focus/focus-panel";
import { workAreas } from "@/data/catalog";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useFocusStore } from "@/stores/focus-store";
import {
  faNumber,
  dateKey,
  focusLabel,
  projectProgress,
  sessionSecondsOnDay,
} from "@/domain/calculations";
import type { OfficeRoomConfig, WidgetType } from "@/domain/types";

export function RoomDrawer({
  room,
  onClose,
}: {
  room: OfficeRoomConfig | undefined;
  onClose: () => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const sessions = useFocusStore((s) => s.sessions);
  const active = useFocusStore((s) => s.active);
  if (!room) return null;
  const area = workAreas.find((a) => a.id === room.workAreaId)!;
  const roomTasks = tasks.filter((t) => t.workAreaId === area.id);
  const todayTasks = roomTasks.filter((t) => t.plannedDate === dateKey());
  const roomProjects = projects.filter(
    (p) => p.workAreaId === area.id && p.status !== "completed",
  );
  const seconds = sessions
    .filter((s) => s.workAreaId === area.id)
    .reduce((sum, s) => sum + sessionSecondsOnDay(s, new Date()), 0);
  const enabled = (type: WidgetType) =>
    room.widgets.some((w) => w.type === type && w.enabled);
  return (
    <Dialog
      open={!!room}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent drawer>
        <DialogHeader
          title={
            <span className="drawer-title">
              <AreaIcon areaId={area.id} />
              {room.name}
            </span>
          }
          description={area.description ?? "فضای کاری شخصی"}
        />
        <div className="drawer-room-preview">
          <RoomArtwork room={room} />
        </div>
        <div className="room-stats">
          <div>
            <Clock3 size={17} />
            <strong>{focusLabel(seconds)}</strong>
            <span>تمرکز امروز</span>
          </div>
          <div>
            <CheckCircle2 size={17} />
            <strong>
              {faNumber(roomTasks.filter((t) => t.status === "done").length)}
            </strong>
            <span>کار تکمیل‌شده</span>
          </div>
        </div>
        <div className="drawer-section">
          <h3>
            <FolderOpen size={17} />
            پروژه‌های فعال
          </h3>
          {roomProjects.length ? (
            roomProjects.map((p) => (
              <Link
                className="room-project-link"
                key={p.id}
                href={`/projects/${p.id}`}
                onClick={onClose}
              >
                <strong>
                  <bdi>{p.name}</bdi>
                </strong>
                <span>
                  {faNumber(
                    projectProgress(tasks.filter((t) => t.projectId === p.id)),
                  )}
                  ٪
                </span>
                {enabled("progress") && (
                  <ProgressBar
                    value={projectProgress(
                      tasks.filter((t) => t.projectId === p.id),
                    )}
                    color={area.color}
                  />
                )}
              </Link>
            ))
          ) : (
            <EmptyState
              title="پروژه فعالی نداری"
              description="پروژه تازه‌ات می‌تواند از این اتاق شروع شود."
            />
          )}
        </div>
        {enabled("current-task") && active?.workAreaId === area.id && (
          <div className="room-current-task">
            <span className="live-dot" />
            کار فعلی: <bdi>{active.taskTitle}</bdi>
          </div>
        )}
        {enabled("tasks") && (
          <div className="drawer-section">
            <h3>
              کارهای امروز
              <span className="count-pill">{faNumber(todayTasks.length)}</span>
            </h3>
            {todayTasks.length ? (
              <TaskList tasks={todayTasks} compact />
            ) : (
              <EmptyState
                title="امروز را هنوز نچیده‌ای"
                description="کارهای این اتاق را در پلنر برنامه‌ریزی کن."
              />
            )}
          </div>
        )}
        {enabled("focus") && <FocusPanel compact />}
        <div className="drawer-footer">
          <Button asChild>
            <Link href={`/planner?area=${area.id}`} onClick={onClose}>
              ورود به فضای کاری
              <ArrowLeft size={17} />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
