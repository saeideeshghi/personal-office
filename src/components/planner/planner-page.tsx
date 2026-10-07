"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDays } from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Columns3,
  CalendarDays,
  ListFilter,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  ProgressBar,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { FocusPanel } from "@/components/focus/focus-panel";
import { useTaskStore } from "@/stores/task-store";
import { useSettingsStore } from "@/stores/settings-store";
import { workAreas } from "@/data/catalog";
import {
  dateKey,
  faNumber,
  persianDate,
  projectProgress,
} from "@/domain/calculations";
import { KanbanBoard } from "./kanban-board";
import { MiniCalendar } from "./mini-calendar";
import { DailyTimeline } from "./daily-timeline";
import type { TaskStatus } from "@/domain/types";

export function PlannerPage() {
  const params = useSearchParams();
  return <PlannerContent key={params.toString()} />;
}
function PlannerContent() {
  const params = useSearchParams();
  const tasks = useTaskStore((s) => s.tasks);
  const settings = useSettingsStore((s) => s.settings);
  const highlighted = params.get("task") ?? undefined;
  const searchedTask = tasks.find((t) => t.id === highlighted);
  const [selectedDate, setDate] = useState(
    searchedTask?.plannedDate ?? dateKey(),
  );
  const [area, setArea] = useState(params.get("area") ?? "all");
  const [view, setView] = useState<"kanban" | "timeline">("kanban");
  const [add, setAdd] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo");
  const [all, setAll] = useState(!!searchedTask && !searchedTask.plannedDate);
  const filtered = tasks.filter(
    (t) =>
      (all || t.plannedDate === selectedDate) &&
      (area === "all" || area === t.workAreaId),
  );
  const openAdd = (status: TaskStatus = "todo") => {
    setInitialStatus(status);
    setAdd(true);
  };
  const changeDate = (offset: number) => {
    setDate(dateKey(addDays(new Date(`${selectedDate}T12:00:00`), offset)));
    setAll(false);
  };
  return (
    <>
      <PageHeader
        eyebrow="برای روزت جا باز کن"
        title={
          selectedDate === dateKey() && !all
            ? "پلن امروز"
            : all
              ? "تمام کارها"
              : "پلن روزانه"
        }
        subtitle="قدم بعدی را مشخص کن؛ روی یک کار تمرکز کن."
      >
        <Button onClick={() => openAdd()}>
          <Plus size={17} />
          افزودن کار جدید
        </Button>
      </PageHeader>
      <div className="planner-layout">
        <div className="planner-main">
          <div className="planner-toolbar">
            <div className="planner-date">
              <button aria-label="روز قبل" onClick={() => changeDate(-1)}>
                <ChevronRight size={18} />
              </button>
              <CalendarDays size={18} />
              <strong>{persianDate(selectedDate, true)}</strong>
              <button aria-label="روز بعد" onClick={() => changeDate(1)}>
                <ChevronLeft size={18} />
              </button>
            </div>
            <div className="segmented">
              <button
                className={view === "kanban" ? "selected" : ""}
                onClick={() => setView("kanban")}
              >
                <Columns3 size={16} />
                برد کارها
              </button>
              <button
                className={view === "timeline" ? "selected" : ""}
                onClick={() => setView("timeline")}
              >
                <CalendarDays size={16} />
                زمان‌بندی
              </button>
            </div>
          </div>
          <div className="planner-filters">
            <div className="area-tabs">
              <button
                className={area === "all" ? "active" : ""}
                onClick={() => setArea("all")}
              >
                همه اتاق‌ها
              </button>
              {workAreas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArea(a.id)}
                  className={area === a.id ? "active" : ""}
                >
                  <i style={{ background: a.color }} />
                  {a.name}
                </button>
              ))}
            </div>
            <button
              className={`all-tasks-toggle ${all ? "active" : ""}`}
              onClick={() => setAll(!all)}
            >
              <ListFilter size={15} />
              {all ? "نمایش همین روز" : "تمام کارها"}
            </button>
          </div>
          <div className="daily-progress">
            <span>
              {faNumber(filtered.filter((t) => t.status === "done").length)} از{" "}
              {faNumber(filtered.length)} کار انجام شده
            </span>
            <ProgressBar value={projectProgress(filtered)} />
            <strong>{faNumber(projectProgress(filtered))}٪</strong>
          </div>
          {view === "kanban" ? (
            <KanbanBoard
              tasks={filtered}
              onAdd={openAdd}
              highlighted={highlighted}
            />
          ) : (
            <SectionCard>
              <DailyTimeline tasks={filtered} />
            </SectionCard>
          )}
          <p className="board-hint">
            کارها را با دستگیره جابه‌جا کن؛ با کیبورد: Space، کلیدهای جهت،
            Space.
          </p>
        </div>
        <aside className="planner-side">
          <SectionCard>
            <MiniCalendar
              key={selectedDate}
              selected={selectedDate}
              onSelect={(date) => {
                setDate(date);
                setAll(false);
              }}
              weekStartsOn={settings.weekStartsOn}
            />
          </SectionCard>
          <FocusPanel compact />
          <div className="planner-note">
            <span>یک کار در یک زمان.</span>
            <p>
              چند کار کمتر، توجه بیشتر. برنامه‌ای بچین که واقعاً قابل انجام
              باشد.
            </p>
          </div>
        </aside>
      </div>
      {add && (
        <TaskDialog
          open={add}
          onOpenChange={setAdd}
          areaId={area === "all" ? undefined : area}
          plannedDate={selectedDate}
          initialStatus={initialStatus}
        />
      )}
    </>
  );
}
