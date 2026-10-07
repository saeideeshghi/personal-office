"use client";
import {
  roomTemplates,
  themes,
  widgetCatalog,
  roomAssets,
  defaultWidgets,
} from "@/data/catalog";
import type {
  Project,
  ProjectRoomConfig,
  ThemeId,
  RoomTemplate,
} from "@/domain/types";
import { RoomArtwork } from "@/components/office/office-scene";
import { updateProject } from "@/lib/commands";
import { useTaskStore } from "@/stores/task-store";
import { useFocusStore } from "@/stores/focus-store";
import { projectProgress, faNumber, focusLabel } from "@/domain/calculations";
import { FocusTime } from "@/components/focus/focus-panel";
import { ProgressBar } from "@/components/ui/primitives";

export function ProjectRoom({ project }: { project: Project }) {
  const tasks = useTaskStore((s) => s.tasks).filter(
    (t) => t.projectId === project.id,
  );
  const active = useFocusStore((s) => s.active);
  const sessions = useFocusStore((s) => s.sessions);
  const config = project.roomConfig ?? {
    themeId: "modern" as const,
    templateId: "software" as const,
    decorations: ["plant"],
    widgets: defaultWidgets(project.id),
  };
  const update = (patch: Partial<ProjectRoomConfig>) =>
    updateProject(project.id, { roomConfig: { ...config, ...patch } });
  const furniture = roomAssets(
    project.id,
    config.templateId === "marketing" || config.templateId === "personal"
      ? "desk-wood"
      : "desk-minimal",
    config.templateId === "personal" ? "monitor-single" : "monitor-dual",
  ).filter((a) => !["plant", "books", "neon"].includes(a.assetId));
  const decorations = config.decorations.map((assetId, i) => ({
    id: `${project.id}-decoration-${assetId}`,
    assetId,
    x: [86, 27, 76][i % 3],
    y: [74, 78, 40][i % 3],
    scale: 0.7,
    rotation: 0,
    zIndex: 3,
  }));
  const assets =
    config.templateId === "blank" ? [] : [...furniture, ...decorations];
  const enabled = (type: string) =>
    config.widgets.some((w) => w.type === type && w.enabled);
  const seconds = sessions
    .filter((s) => s.projectId === project.id)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  return (
    <div className="project-room">
      <div className={`project-room-art theme-${config.themeId}`}>
        <RoomArtwork
          room={{
            id: project.id,
            workAreaId: project.workAreaId,
            name: project.name,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            themeId: config.themeId,
            assets,
            widgets: config.widgets,
          }}
        />
        <span className="project-room-template">
          {roomTemplates.find((t) => t.id === config.templateId)?.name}
        </span>
      </div>
      <div className="room-widget-grid">
        {enabled("current-task") && (
          <div className="room-widget">
            <small>کار فعلی</small>
            <strong>
              <bdi>
                {active?.projectId === project.id
                  ? active.taskTitle
                  : "آماده شروع"}
              </bdi>
            </strong>
          </div>
        )}
        {enabled("tasks") && (
          <div className="room-widget">
            <small>کارهای باز</small>
            <strong>
              {faNumber(tasks.filter((t) => t.status !== "done").length)} کار
            </strong>
          </div>
        )}
        {enabled("focus") && (
          <div className="room-widget">
            <small>تمرکز پروژه</small>
            {active?.projectId === project.id ? (
              <FocusTime />
            ) : (
              <strong>{focusLabel(seconds)}</strong>
            )}
          </div>
        )}
        {enabled("progress") && (
          <div className="room-widget">
            <small>پیشرفت</small>
            <strong>{faNumber(projectProgress(tasks))}٪</strong>
            <ProgressBar value={projectProgress(tasks)} />
          </div>
        )}
      </div>
      <div className="project-room-controls">
        <div className="field">
          <label htmlFor={`template-${project.id}`}>قالب اتاق</label>
          <select
            id={`template-${project.id}`}
            value={config.templateId}
            onChange={(e) =>
              update({ templateId: e.target.value as RoomTemplate })
            }
          >
            {roomTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`theme-${project.id}`}>حال‌وهوای اتاق</label>
          <select
            id={`theme-${project.id}`}
            value={config.themeId}
            onChange={(e) => update({ themeId: e.target.value as ThemeId })}
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="project-decoration-options">
        <span>دکور</span>
        {[
          { id: "plant", name: "گیاه" },
          { id: "books", name: "کتاب‌ها" },
          { id: "neon", name: "نئون" },
        ].map((d) => (
          <label key={d.id}>
            <input
              type="checkbox"
              checked={config.decorations.includes(d.id)}
              onChange={() =>
                update({
                  decorations: config.decorations.includes(d.id)
                    ? config.decorations.filter((x) => x !== d.id)
                    : [...config.decorations, d.id],
                })
              }
            />
            {d.name}
          </label>
        ))}
      </div>
      <div className="widget-options">
        {widgetCatalog.map((w) => (
          <label key={w.type}>
            <input
              type="checkbox"
              checked={enabled(w.type)}
              onChange={() =>
                update({
                  widgets: config.widgets.map((widget) =>
                    widget.type === w.type
                      ? { ...widget, enabled: !widget.enabled }
                      : widget,
                  ),
                })
              }
            />
            {w.name}
          </label>
        ))}
      </div>
    </div>
  );
}
