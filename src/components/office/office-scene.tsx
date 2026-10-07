"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpLeft, Focus, Minus, Plus, Scan, Network } from "lucide-react";
import type { OfficeConfig } from "@/domain/types";
import { workAreas } from "@/data/catalog";
import { useTaskStore } from "@/stores/task-store";
import { useFocusStore } from "@/stores/focus-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  faNumber,
  focusLabel,
  sessionSecondsOnDay,
} from "@/domain/calculations";
import { AreaIcon } from "@/components/ui/primitives";
import { FocusTime } from "@/components/focus/focus-panel";
import { RoomArtwork } from "./isometric-artwork";
import { cn } from "@/lib/utils";

export { RoomArtwork } from "./isometric-artwork";

export function OfficeScene({
  config,
  onRoomClick,
  preview = false,
  onChooseTask,
}: {
  config: OfficeConfig;
  onRoomClick?: (roomId: string) => void;
  preview?: boolean;
  onChooseTask?: () => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const sessions = useFocusStore((s) => s.sessions);
  const active = useFocusStore((s) => s.active);
  const name = useSettingsStore((s) => s.settings.userName);
  const [zoom, setZoom] = useState(100);
  return (
    <div
      className={cn(
        "spatial-campus",
        preview && "campus-preview",
        `campus-${config.themeId}`,
      )}
    >
      <div className="campus-toolbar">
        <span>
          <Network size={15} />
          <b>نمای دفتر</b>
          <i />
          {name}
        </span>
        <div className="canvas-tools">
          <button
            aria-label="کوچک‌نمایی دفتر"
            disabled={zoom <= 80}
            onClick={() => setZoom(Math.max(80, zoom - 10))}
          >
            <Minus size={14} />
          </button>
          <span dir="ltr">{zoom}%</span>
          <button
            aria-label="بزرگ‌نمایی دفتر"
            disabled={zoom >= 140}
            onClick={() => setZoom(Math.min(140, zoom + 10))}
          >
            <Plus size={14} />
          </button>
          <button aria-label="بازنشانی نمای دفتر" onClick={() => setZoom(100)}>
            <Scan size={15} />
          </button>
        </div>
      </div>
      <div className="campus-viewport">
        <div
          className="campus-world"
          style={{ width: `${zoom}%` }}
          role="group"
          aria-label="دفتر ایزومتریک با چهار فضای کاری"
        >
          <div className="campus-starfield" />
          <svg
            className="campus-connections"
            viewBox="0 0 1000 610"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {config.rooms.map((room) => {
              const area = workAreas.find((a) => a.id === room.workAreaId)!;
              const x = (room.x + room.width / 2) * 10;
              const y = (room.y + room.height * 0.7) * 6.1;
              return (
                <g
                  key={room.id}
                  style={{ "--line-color": area.color } as CSSProperties}
                  className={cn(
                    active?.workAreaId === area.id && "connection-running",
                  )}
                >
                  <path
                    d={`M500 302 Q${x} 302 ${x} ${y}`}
                    stroke={area.color}
                    strokeOpacity=".16"
                    strokeWidth="8"
                    fill="none"
                  />
                  <path
                    className="connection-track"
                    d={`M500 302 Q${x} 302 ${x} ${y}`}
                    stroke={area.color}
                    strokeOpacity=".55"
                    strokeWidth="1.1"
                    strokeDasharray="3 6"
                    fill="none"
                  />
                  <circle cx={x} cy={y} r="3" fill={area.color} />
                  <circle cx="500" cy="302" r="3" fill={area.color} />
                </g>
              );
            })}
          </svg>
          {config.rooms.map((room, index) => {
            const area = workAreas.find((a) => a.id === room.workAreaId)!;
            const roomTasks = tasks.filter((t) => t.workAreaId === area.id);
            const pending = roomTasks.filter((t) => t.status !== "done").length;
            const done = roomTasks.filter((t) => t.status === "done").length;
            const seconds = sessions
              .filter((s) => s.workAreaId === area.id)
              .reduce((sum, s) => sum + sessionSecondsOnDay(s, new Date()), 0);
            const working = active?.workAreaId === area.id;
            return (
              <button
                key={room.id}
                className={cn(
                  "campus-room",
                  working && "campus-room-working",
                  config.selectedRoomId === room.id && "campus-room-selected",
                )}
                style={
                  {
                    left: `${room.x}%`,
                    top: `${room.y}%`,
                    width: `${room.width}%`,
                    height: `${room.height}%`,
                    "--room-color": area.color,
                  } as CSSProperties
                }
                onClick={() => onRoomClick?.(room.id)}
                aria-label={`ورود به اتاق ${room.name}، ${faNumber(pending)} کار باز`}
              >
                <div className="campus-room-heading">
                  <AreaIcon areaId={area.id} size={16} />
                  <strong>{room.name}</strong>
                  <span dir="ltr">0{index + 1}</span>
                  <ArrowUpLeft size={15} />
                </div>
                <RoomArtwork
                  room={room}
                  tasks={tasks}
                  activeTaskId={active?.taskId}
                  paused={active?.status === "paused"}
                />
                <div className="campus-room-info">
                  <span
                    className={cn(
                      "station-dot",
                      working &&
                        active.status === "running" &&
                        "station-dot-running",
                    )}
                  />
                  {working
                    ? active.status === "paused"
                      ? "جلسه در مکث"
                      : "در حال تمرکز"
                    : `${faNumber(pending)} کار باز`}
                  <span>{focusLabel(seconds)}</span>
                </div>
                <div className="campus-room-progress">
                  <i
                    style={{
                      width: `${roomTasks.length ? (done / roomTasks.length) * 100 : 0}%`,
                      background: area.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
          <button
            className="campus-hub"
            onClick={onChooseTask}
            disabled={preview}
            aria-label="بازکردن پنل تمرکز"
          >
            <div className={cn("hub-orb", active && "hub-orb-active")}>
              <Focus size={25} />
              <i />
              <i />
            </div>
            <span>مرکز تمرکز</span>
            {active ? (
              <>
                <strong>
                  <bdi>{active.taskTitle}</bdi>
                </strong>
                <FocusTime showStatus />
              </>
            ) : (
              <small>یک کار، تمام توجه</small>
            )}
          </button>
          <div className="campus-coordinate" dir="ltr">
            PERSONAL WORKSPACE / {config.layoutId.toUpperCase()}
          </div>
        </div>
      </div>
      <div className="campus-footer">
        <span>
          <i className="live-dot" />
          وضعیت‌ها از تسک‌ها و تایمر خوانده می‌شوند
        </span>
        <span>
          برای ورود روی فضا کلیک کن
          <ArrowUpLeft size={13} />
        </span>
      </div>
    </div>
  );
}
