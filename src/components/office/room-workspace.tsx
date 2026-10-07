"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpLeft,
  Plus,
  Paintbrush,
  ListTodo,
  Folders,
  Focus,
  Check,
  Clock3,
  Search,
  Pencil,
  Play,
  Minus,
  Scan,
  Move,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useOfficeStore } from "@/stores/office-store";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useFocusStore } from "@/stores/focus-store";
import { workAreas } from "@/data/catalog";
import type { OfficeRoomConfig, Task, TaskStatus } from "@/domain/types";
import { roomStations, stationTasks } from "@/domain/room-layout";
import {
  faNumber,
  focusLabel,
  projectProgress,
  sessionSecondsOnDay,
} from "@/domain/calculations";
import {
  recordOfficeChange,
  startFocus,
  changeTaskStatus,
  deleteTask,
} from "@/lib/commands";
import { Button } from "@/components/ui/button";
import {
  AreaIcon,
  ConfirmDialog,
  PriorityBadge,
  ProgressBar,
} from "@/components/ui/primitives";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { FocusPanel, FocusTime } from "@/components/focus/focus-panel";
import { useNotice } from "@/components/app-shell/providers";
import { RoomArtwork, type RoomObject } from "./isometric-artwork";
import { RoomCustomization } from "./room-customization";
import { cn } from "@/lib/utils";
import { projectHref } from "@/lib/urls";

type Tab = "tasks" | "projects" | "focus" | "customize";
const tabs = [
  { id: "tasks" as const, label: "کارها", icon: ListTodo },
  { id: "projects" as const, label: "پروژه‌ها", icon: Folders },
  { id: "focus" as const, label: "تمرکز", icon: Focus },
  { id: "customize" as const, label: "ظاهر", icon: Paintbrush },
];

export function RoomWorkspace({
  roomId,
  initialTab = "tasks",
}: {
  roomId: string;
  initialTab?: Tab;
}) {
  const rooms = useOfficeStore((s) => s.config.rooms);
  const room = rooms.find((r) => r.id === roomId);
  if (!room)
    return (
      <div className="room-not-found">
        <h1>این اتاق وجود ندارد.</h1>
        <Button asChild>
          <Link href="/office">برگشت به دفتر</Link>
        </Button>
      </div>
    );
  return <WorkspaceContent key={room.id} room={room} initialTab={initialTab} />;
}

function WorkspaceContent({
  room,
  initialTab,
}: {
  room: OfficeRoomConfig;
  initialTab: Tab;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const active = useFocusStore((s) => s.active);
  const sessions = useFocusStore((s) => s.sessions);
  const updateRoom = useOfficeStore((s) => s.updateRoom);
  const router = useRouter();
  const notify = useNotice();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [selectedObject, setSelectedObject] = useState<RoomObject>();
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [newTask, setNewTask] = useState(false);
  const [edit, setEdit] = useState<Task>();
  const [remove, setRemove] = useState<Task>();
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(100);
  const area = workAreas.find((a) => a.id === room.workAreaId)!;
  const roomTasks = tasks.filter((t) => t.workAreaId === room.workAreaId);
  const roomProjects = projects.filter((p) => p.workAreaId === room.workAreaId);
  const selectedTask = roomTasks.find((t) => t.id === selectedTaskId);
  const done = roomTasks.filter((t) => t.status === "done").length;
  const seconds = sessions
    .filter((s) => s.workAreaId === room.workAreaId)
    .reduce((sum, s) => sum + sessionSecondsOnDay(s, new Date()), 0);
  const visible = roomTasks.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      t.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  const enabled = (type: string) =>
    room.widgets.some((w) => w.type === type && w.enabled);
  function moveObject(object: RoomObject, point: { x: number; y: number }) {
    // Read the latest state so rapid pointer events never overwrite unrelated edits.
    const current = useOfficeStore
      .getState()
      .config.rooms.find((r) => r.id === room.id)!;
    updateRoom(
      room.id,
      object.kind === "station"
        ? {
            stations: roomStations(current).map((s) =>
              s.id === object.id ? { ...s, ...point } : s,
            ),
          }
        : {
            assets: current.assets.map((a) =>
              a.id === object.id ? { ...a, ...point } : a,
            ),
          },
    );
  }
  function chooseTask(task: Task) {
    setSelectedTaskId(task.id);
    setTab("tasks");
  }

  return (
    <div
      className="room-workspace"
      style={{ "--room-color": area.color } as CSSProperties}
    >
      <nav className="space-breadcrumb" aria-label="مسیر صفحه">
        <Link href="/office">
          <ArrowRight size={16} />
          دفتر کار
        </Link>
        <span>/</span>
        <span>{room.name}</span>
      </nav>
      <header className="space-page-header">
        <div className="space-title">
          <AreaIcon areaId={room.workAreaId} size={25} />
          <div>
            <span className="space-eyebrow" dir="ltr">
              {area.slug.toUpperCase()} WORKSPACE
            </span>
            <h1>{room.name}</h1>
            <p>{area.description}</p>
          </div>
        </div>
        <div className="space-header-actions">
          <span className="saved-badge">
            <Check size={14} />
            ذخیره خودکار
          </span>
          <Button
            variant="outline"
            onClick={() => setTab(tab === "customize" ? "tasks" : "customize")}
          >
            <Paintbrush size={16} />
            {tab === "customize" ? "پایان ویرایش" : "کاستومایز اتاق"}
          </Button>
          <Button onClick={() => setNewTask(true)}>
            <Plus size={16} />
            کار جدید
          </Button>
        </div>
      </header>
      <div className="workspace-layout">
        <section
          className={cn(
            "workspace-stage",
            `stage-light-${room.lighting ?? "night"}`,
          )}
          aria-label={`فضای تصویری ${room.name}`}
        >
          <div className="space-stage-toolbar">
            <span>
              <i className="station-dot station-dot-running" />
              {tab === "customize" ? "حالت چیدمان" : "فضای کاری"}
            </span>
            <div className="canvas-tools">
              <button
                aria-label="کوچک‌نمایی اتاق"
                disabled={zoom <= 75}
                onClick={() => setZoom(Math.max(75, zoom - 10))}
              >
                <Minus size={14} />
              </button>
              <span dir="ltr">{zoom}%</span>
              <button
                aria-label="بزرگ‌نمایی اتاق"
                disabled={zoom >= 150}
                onClick={() => setZoom(Math.min(150, zoom + 10))}
              >
                <Plus size={14} />
              </button>
              <button
                aria-label="بازنشانی نمای اتاق"
                onClick={() => setZoom(100)}
              >
                <Scan size={15} />
              </button>
            </div>
          </div>
          <div className="space-stage-scroll">
            <div className="space-stage-world" style={{ width: `${zoom}%` }}>
              <div className="space-room-caption">
                <span dir="ltr">ROOM / {area.slug.toUpperCase()}</span>
                <strong>{room.name}</strong>
                <small>
                  {faNumber(roomStations(room).length)} میز کار ·{" "}
                  {faNumber(roomProjects.length)} پروژه
                </small>
              </div>
              <RoomArtwork
                room={room}
                tasks={roomTasks}
                activeTaskId={active?.taskId}
                paused={active?.status === "paused"}
                editing={tab === "customize"}
                selected={tab === "customize" ? selectedObject : undefined}
                onSelect={setSelectedObject}
                onMove={moveObject}
                onMoveEnd={recordOfficeChange}
                onTaskClick={chooseTask}
                onEmptyStation={() => setNewTask(true)}
              />
              {tab !== "customize" &&
                stationTasks(room, roomTasks, active?.taskId).map(
                  ({ station, task }) => (
                    <button
                      key={station.id}
                      className={cn(
                        "space-task-pin",
                        task?.id === active?.taskId && task && "pin-active",
                        selectedTaskId === task?.id && task && "pin-selected",
                      )}
                      style={{
                        left: `${station.x}%`,
                        top: `${station.y - 41 * station.scale}%`,
                      }}
                      onClick={() =>
                        task ? chooseTask(task) : setNewTask(true)
                      }
                      aria-label={
                        task
                          ? `نمایش کار ${task.title}`
                          : `افزودن کار به ${station.name}`
                      }
                    >
                      <span>
                        <i
                          className={cn(
                            "station-dot",
                            task?.id === active?.taskId &&
                              task &&
                              "station-dot-running",
                          )}
                        />
                        {station.name}
                        <ArrowUpLeft size={11} />
                      </span>
                      <strong>
                        <bdi>{task?.title ?? "یک کار تعریف کن"}</bdi>
                      </strong>
                      <small>
                        {task
                          ? task.status === "done"
                            ? "تکمیل‌شده"
                            : task.status === "doing"
                              ? "در حال انجام"
                              : "آماده شروع"
                          : "میز آزاد"}
                      </small>
                    </button>
                  ),
                )}
            </div>
          </div>
          {tab === "customize" ? (
            <div className="space-canvas-hint">
              <Move size={16} />
              <span>مبلمان را بکش؛ تنظیمات دقیق در پنل کناری است.</span>
            </div>
          ) : (
            <div className="space-stage-stats">
              <span>
                <ListTodo size={15} />
                <b>{faNumber(roomTasks.length - done)}</b> کار باز
              </span>
              <span>
                <CheckCircle2 size={15} />
                <b>{faNumber(done)}</b> انجام‌شده
              </span>
              {enabled("focus") && (
                <span>
                  <Clock3 size={15} />
                  {focusLabel(seconds)} امروز
                </span>
              )}
            </div>
          )}
          {enabled("current-task") &&
            active?.workAreaId === room.workAreaId && (
              <button
                className="space-active-focus"
                onClick={() => setTab("focus")}
              >
                <Focus size={18} />
                <span>
                  <small>
                    {active.status === "paused"
                      ? "جلسه در مکث"
                      : "در حال تمرکز"}
                  </small>
                  <strong>
                    <bdi>{active.taskTitle}</bdi>
                  </strong>
                </span>
                <FocusTime />
                <ArrowUpLeft size={16} />
              </button>
            )}
        </section>
        <aside className="workspace-panel">
          <div
            className="workspace-tabs"
            role="tablist"
            aria-label="ابزارهای اتاق"
          >
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`space-tab-${id}`}
                role="tab"
                aria-selected={tab === id}
                aria-controls="space-panel"
                className={tab === id ? "selected" : ""}
                onClick={() => setTab(id)}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <div
            className="workspace-panel-content"
            id="space-panel"
            role="tabpanel"
            aria-labelledby={`space-tab-${tab}`}
          >
            {tab === "customize" && (
              <RoomCustomization
                room={room}
                tasks={roomTasks}
                selected={selectedObject}
                onSelect={setSelectedObject}
              />
            )}
            {tab === "focus" && (
              <>
                <h2>تمرکز در {room.name}</h2>
                <p className="space-panel-description">
                  کارهای همین اتاق را انتخاب کن و زمان کار را ثبت کن.
                </p>
                <FocusPanel compact areaId={room.workAreaId} />
              </>
            )}
            {tab === "projects" && (
              <>
                <div className="space-panel-heading">
                  <h2>پروژه‌های این اتاق</h2>
                  <span>{faNumber(roomProjects.length)}</span>
                </div>
                <div className="space-project-list">
                  {roomProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={projectHref(p.id)}
                      className="space-project"
                    >
                      <Folders size={18} />
                      <strong>
                        <bdi>{p.name}</bdi>
                      </strong>
                      <ArrowUpLeft size={15} />
                      <p>{p.description || "پروژه این فضای کاری"}</p>
                      {enabled("progress") && (
                        <>
                          <ProgressBar
                            value={projectProgress(
                              roomTasks.filter((t) => t.projectId === p.id),
                            )}
                            color={area.color}
                          />
                          <small>
                            {faNumber(
                              projectProgress(
                                roomTasks.filter((t) => t.projectId === p.id),
                              ),
                            )}
                            ٪ پیشرفت
                          </small>
                        </>
                      )}
                    </Link>
                  ))}
                  {!roomProjects.length && (
                    <p className="space-empty">
                      هنوز پروژه‌ای برای این اتاق تعریف نشده.
                    </p>
                  )}
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/projects?area=${room.workAreaId}`}>
                    مدیریت پروژه‌ها
                    <ArrowUpLeft size={14} />
                  </Link>
                </Button>
              </>
            )}
            {tab === "tasks" && (
              <>
                <div className="space-panel-heading">
                  <h2>کارهای این اتاق</h2>
                  <button
                    aria-label="افزودن کار در اتاق"
                    onClick={() => setNewTask(true)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <label className="space-task-search">
                  <Search size={15} />
                  <input
                    aria-label="جست‌وجوی کارهای اتاق"
                    placeholder="جست‌وجو در کارها…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="space-task-filters">
                  {[
                    { id: "all", label: "همه" },
                    { id: "todo", label: "برای انجام" },
                    { id: "doing", label: "در جریان" },
                    { id: "done", label: "تمام‌شده" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      className={filter === f.id ? "selected" : ""}
                      onClick={() => setFilter(f.id as typeof filter)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {selectedTask && (
                  <section
                    className="space-task-inspector"
                    aria-label="جزئیات کار انتخاب‌شده"
                  >
                    <div>
                      <PriorityBadge priority={selectedTask.priority} />
                      <button
                        aria-label="بستن جزئیات کار"
                        onClick={() => setSelectedTaskId(undefined)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <h3>
                      <bdi>{selectedTask.title}</bdi>
                    </h3>
                    <p>
                      {selectedTask.description ||
                        "برای این کار توضیحی ثبت نشده."}
                    </p>
                    {selectedTask.projectId && (
                      <Link
                        href={projectHref(selectedTask.projectId)}
                        className="space-task-project"
                      >
                        {
                          projects.find((p) => p.id === selectedTask.projectId)
                            ?.name
                        }
                        <ArrowUpLeft size={12} />
                      </Link>
                    )}
                    <label className="field">
                      <span>وضعیت کار</span>
                      <select
                        aria-label="وضعیت کار انتخاب‌شده"
                        value={selectedTask.status}
                        onChange={(e) =>
                          changeTaskStatus(
                            selectedTask.id,
                            e.target.value as TaskStatus,
                          )
                        }
                      >
                        <option value="todo">برای انجام</option>
                        <option value="doing">در حال انجام</option>
                        <option value="done">انجام شده</option>
                      </select>
                    </label>
                    <div className="space-inspector-actions">
                      <Button
                        size="sm"
                        disabled={!!active || selectedTask.status === "done"}
                        onClick={() => {
                          if (startFocus(selectedTask.id)) {
                            notify("جلسه تمرکز شروع شد");
                            setTab("focus");
                          }
                        }}
                      >
                        <Play size={13} />
                        شروع تمرکز
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEdit(selectedTask)}
                      >
                        <Pencil size={13} />
                        ویرایش
                      </Button>
                      <button
                        className="space-delete-task"
                        aria-label="حذف کار انتخاب‌شده"
                        onClick={() => setRemove(selectedTask)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </section>
                )}
                {enabled("tasks") ? (
                  <div className="space-task-list">
                    {visible.map((t) => (
                      <div
                        key={t.id}
                        className={cn(
                          "space-task-row",
                          t.status === "done" && "space-task-done",
                          selectedTaskId === t.id && "selected",
                        )}
                      >
                        <button
                          className="space-check"
                          aria-label={`${t.status === "done" ? "بازکردن" : "تکمیل"} ${t.title}`}
                          onClick={() =>
                            changeTaskStatus(
                              t.id,
                              t.status === "done" ? "todo" : "done",
                            )
                          }
                        >
                          {t.status === "done" && <Check size={13} />}
                        </button>
                        <button
                          className="space-task-open"
                          onClick={() => chooseTask(t)}
                        >
                          <strong>
                            <bdi>{t.title}</bdi>
                          </strong>
                          <span>
                            <i
                              className={cn(
                                "station-dot",
                                t.status === "doing" && "station-dot-running",
                              )}
                            />
                            {t.status === "done"
                              ? "انجام‌شده"
                              : t.status === "doing"
                                ? "در حال انجام"
                                : "برای انجام"}
                            {t.estimatedMinutes && (
                              <small>
                                <Clock3 size={10} />
                                {faNumber(t.estimatedMinutes)} دقیقه
                              </small>
                            )}
                          </span>
                        </button>
                        <ArrowUpLeft size={13} />
                      </div>
                    ))}
                    {!visible.length && (
                      <div className="space-empty">
                        <ListTodo size={26} />
                        <p>
                          {search
                            ? "کاری با این عنوان پیدا نشد."
                            : "در این بخش کاری نداری."}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setNewTask(true)}
                        >
                          <Plus size={14} />
                          افزودن کار
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="space-empty">
                    نمایش لیست کارها در تنظیمات ظاهر این اتاق غیرفعال است. با
                    کلیک روی میزها می‌توانی جزئیات کار را باز کنی.
                  </p>
                )}
                <Link
                  className="space-planner-link"
                  href={`/planner?area=${room.workAreaId}`}
                >
                  بازکردن پلنر این اتاق
                  <ArrowUpLeft size={14} />
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
      <div className="space-switcher">
        <span>فضاهای دفتر</span>
        {useOfficeStore.getState().config.rooms.map((r) => (
          <button
            key={r.id}
            className={r.id === room.id ? "selected" : ""}
            onClick={() => router.push(`/office/${r.id}`)}
          >
            <AreaIcon areaId={r.workAreaId} size={13} />
            {r.name}
          </button>
        ))}
      </div>
      {newTask && (
        <TaskDialog
          open
          onOpenChange={setNewTask}
          areaId={room.workAreaId}
          lockArea
        />
      )}
      {edit && (
        <TaskDialog
          key={edit.id}
          task={edit}
          open
          onOpenChange={(open) => {
            if (!open) setEdit(undefined);
          }}
          areaId={room.workAreaId}
          lockArea
        />
      )}
      <ConfirmDialog
        open={!!remove}
        onOpenChange={(open) => {
          if (!open) setRemove(undefined);
        }}
        title="این کار حذف شود؟"
        description={
          remove ? `«${remove.title}» حذف می‌شود. زمان ثبت‌شده حفظ می‌شود.` : ""
        }
        onConfirm={() => {
          if (remove) deleteTask(remove.id);
          setRemove(undefined);
          setSelectedTaskId(undefined);
          notify("کار حذف شد");
        }}
      />
    </div>
  );
}
