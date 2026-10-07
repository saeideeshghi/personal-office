"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Paintbrush,
  ArrowUpLeft,
  Clock3,
  CheckCircle2,
  Folders,
  Target,
  CircleDot,
} from "lucide-react";
import Link from "next/link";
import {
  PageHeader,
  SectionCard,
  StatCard,
  ViewLink,
  ProgressBar,
  EmptyState,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { OfficeScene } from "./office-scene";
import { RoomWorkspace } from "./room-workspace";
import { ActivityList } from "./activity-list";
import { FocusPanel } from "@/components/focus/focus-panel";
import { TaskList } from "@/components/tasks/task-card";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useOfficeStore } from "@/stores/office-store";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useFocusStore } from "@/stores/focus-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  dateKey,
  faNumber,
  focusLabel,
  sessionSecondsOnDay,
} from "@/domain/calculations";

export function OfficePage() {
  const query = useSearchParams();
  return <OfficeContent key={query.toString()} />;
}

function OfficeContent() {
  const query = useSearchParams();
  const config = useOfficeStore((s) => s.config);
  const update = useOfficeStore((s) => s.update);
  const router = useRouter();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const sessions = useFocusStore((s) => s.sessions);
  const settings = useSettingsStore((s) => s.settings);
  const legacyRoomId = query.get("room")
    ? `room-${query.get("room")}`
    : undefined;
  const [newTask, setNewTask] = useState(false);
  const todayTasks = tasks.filter((t) => t.plannedDate === dateKey());
  const pendingToday = todayTasks.filter((t) => t.status !== "done");
  const completedToday = tasks.filter(
    (t) => t.completedAt && dateKey(t.completedAt) === dateKey(),
  ).length;
  const focusToday = sessions.reduce(
    (sum, s) => sum + sessionSecondsOnDay(s, new Date()),
    0,
  );
  const goal = Math.min(
    100,
    Math.round((focusToday / (settings.dailyGoalMinutes * 60)) * 100),
  );
  const selectRoom = (id: string) => {
    update({ selectedRoomId: id });
    router.push(`/office/${id}`);
  };
  const openFocus = () => {
    const target = document.getElementById("office-focus");
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
    target
      ?.querySelector<HTMLElement>("select, button")
      ?.focus({ preventScroll: true });
  };
  if (legacyRoomId && config.rooms.some((r) => r.id === legacyRoomId))
    return <RoomWorkspace roomId={legacyRoomId} />;
  return (
    <div className="spatial-office-page">
      <PageHeader
        eyebrow="PERSONAL WORKSPACE / ۰۲"
        title="هر کار، یک فضای مخصوص."
        subtitle="وارد اتاقت شو، کار را انتخاب کن و شروع کن به ساختن."
      >
        <Button variant="outline" asChild>
          <Link href="/customize">
            <Paintbrush size={16} />
            شخصی‌سازی دفتر
          </Link>
        </Button>
        <Button onClick={() => setNewTask(true)}>
          <Plus size={17} />
          کار جدید
        </Button>
      </PageHeader>
      <div className="stats-grid">
        <StatCard
          title="تمرکز امروز"
          value={focusLabel(focusToday)}
          detail={
            <>
              <span className="tiny-dot green-dot" />
              زمان ثبت‌شده در دفتر
            </>
          }
          icon={Clock3}
          color="blue"
        />
        <StatCard
          title="کارهای انجام‌شده"
          value={
            <>
              {faNumber(completedToday)} <small>کار</small>
            </>
          }
          detail={`${faNumber(todayTasks.length)} کار در پلن امروز`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="پروژه‌های فعال"
          value={
            <>
              {faNumber(projects.filter((p) => p.status === "active").length)}{" "}
              <small>پروژه</small>
            </>
          }
          detail="ایده‌هایی که در حال ساختن‌اند"
          icon={Folders}
          color="purple"
        />
        <StatCard
          title="هدف روزانه"
          value={
            <>
              {faNumber(goal)}
              <small>٪</small>
            </>
          }
          detail={<ProgressBar value={goal} label="هدف تمرکز روزانه" />}
          icon={Target}
          color="orange"
        />
      </div>
      <div className="office-main-grid">
        <SectionCard
          className="office-scene-card"
          title="دفتر کار من"
          subtitle="چهار فضای مستقل برای پروژه‌ها و کارهای تو"
          action={
            <span className="quiet-badge">
              <CircleDot size={12} />
              نمای زنده
            </span>
          }
        >
          <OfficeScene
            config={config}
            onRoomClick={selectRoom}
            onChooseTask={openFocus}
          />
          <div className="office-scene-footer">
            <span>
              <i className="live-dot" />
              همه چیز برای شروع آماده است
            </span>
            <Link href="/customize">
              دفترت را به سبک خودت بچین
              <ArrowUpLeft size={15} />
            </Link>
          </div>
        </SectionCard>
      </div>
      <div className="office-bottom-grid">
        <div id="office-focus">
          <FocusPanel />
        </div>
        <SectionCard
          title="کارهای امروز"
          subtitle="قدم‌های کوچک برای ایده‌های بزرگ"
          action={<ViewLink href="/planner">رفتن به پلنر</ViewLink>}
        >
          {pendingToday.length ? (
            <TaskList tasks={pendingToday.slice(0, 3)} compact />
          ) : (
            <EmptyState
              title={todayTasks.length ? "کارهای امروزت تمام شدند" : undefined}
            />
          )}
        </SectionCard>
        <SectionCard
          title="داستان امروز دفتر"
          subtitle="آخرین قدم‌هایی که برداشتی"
          action={<ViewLink href="/analytics">مرور فعالیت‌ها</ViewLink>}
        >
          <ActivityList limit={4} />
        </SectionCard>
      </div>
      {newTask && <TaskDialog open={newTask} onOpenChange={setNewTask} />}
    </div>
  );
}
