"use client";
import dynamic from "next/dynamic";
import { addDays, startOfWeek } from "date-fns";
import {
  Clock3,
  CheckCircle2,
  Folders,
  Target,
  CalendarDays,
  Award,
  Sparkles,
  ArrowUpLeft,
} from "lucide-react";
import Link from "next/link";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useFocusStore } from "@/stores/focus-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  PageHeader,
  SectionCard,
  StatCard,
  AreaIcon,
} from "@/components/ui/primitives";
import { workAreas } from "@/data/catalog";
import {
  dateKey,
  faNumber,
  focusLabel,
  persianDate,
  projectProgress,
  sessionSecondsOnDay,
  weeklyAnalytics,
} from "@/domain/calculations";
import { ActivityList } from "@/components/office/activity-list";

const WeeklyChart = dynamic(
  () => import("./focus-charts").then((m) => m.WeeklyFocusChart),
  {
    ssr: false,
    loading: () => <div className="chart-loading">نمودار آماده می‌شود…</div>,
  },
);
const DonutChart = dynamic(
  () => import("./focus-charts").then((m) => m.DistributionChart),
  {
    ssr: false,
    loading: () => <div className="chart-loading">نمودار آماده می‌شود…</div>,
  },
);

export function AnalyticsPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const sessions = useFocusStore((s) => s.sessions);
  const settings = useSettingsStore((s) => s.settings);
  const weekly = weeklyAnalytics(
    tasks,
    sessions,
    new Date(),
    settings.weekStartsOn,
  );
  const start = startOfWeek(new Date(), {
    weekStartsOn: settings.weekStartsOn,
  });
  const weekSeconds = (workAreaId?: string, projectId?: string) =>
    sessions
      .filter(
        (s) =>
          (!workAreaId || s.workAreaId === workAreaId) &&
          (!projectId || s.projectId === projectId),
      )
      .reduce(
        (sum, s) =>
          sum +
          Array.from({ length: 7 }, (_, i) =>
            sessionSecondsOnDay(s, addDays(start, i)),
          ).reduce((a, b) => a + b, 0),
        0,
      );
  const distribution = workAreas.map((a) => ({
    name: a.name,
    color: a.color,
    seconds: weekSeconds(a.id),
    id: a.id,
  }));
  const mostArea = [...distribution].sort((a, b) => b.seconds - a.seconds)[0];
  const mostProject = projects
    .map((p) => ({ ...p, seconds: weekSeconds(undefined, p.id) }))
    .sort((a, b) => b.seconds - a.seconds)[0];
  const unfinished = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.plannedDate &&
      t.plannedDate >= dateKey(start) &&
      t.plannedDate <= dateKey(),
  ).length;
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  return (
    <>
      <PageHeader
        eyebrow="به قدم‌هایی که برداشتی نگاه کن"
        title="پیشرفت، از نزدیک."
        subtitle="گزارش واقعی کارها و زمان تمرکزت؛ هر جلسه یک اثر می‌گذارد."
      >
        <span className="date-range">
          <CalendarDays size={16} />
          {persianDate(start)} تا {persianDate(addDays(start, 6))}
        </span>
      </PageHeader>
      <div className="stats-grid">
        <StatCard
          title="مجموع زمان تمرکز"
          value={focusLabel(totalSeconds)}
          detail={`${faNumber(sessions.length)} جلسه ثبت‌شده`}
          icon={Clock3}
          color="blue"
        />
        <StatCard
          title="کارهای تکمیل‌شده"
          value={`${faNumber(tasks.filter((t) => t.status === "done").length)} کار`}
          detail={`${faNumber(weekly.completed)} کار در این هفته`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="پروژه‌های فعال"
          value={`${faNumber(projects.filter((p) => p.status === "active").length)} پروژه`}
          detail={`${faNumber(projects.length)} پروژه در دفتر`}
          icon={Folders}
          color="purple"
        />
        <StatCard
          title="نرخ تکمیل کارها"
          value={`${faNumber(projectProgress(tasks))}٪`}
          detail="نسبت کارهای انجام‌شده به همه کارها"
          icon={Target}
          color="orange"
        />
      </div>
      <div className="analytics-charts">
        <SectionCard
          title="ریتم تمرکز این هفته"
          subtitle="زمان کار واقعی، بدون زمان مکث"
          action={
            <span className="chart-total">
              {focusLabel(weekly.totalSeconds)}
            </span>
          }
        >
          <WeeklyChart data={weekly.days} />
        </SectionCard>
        <SectionCard
          title="تمرکز در اتاق‌ها"
          subtitle="این هفته بیشتر کجا بودی؟"
        >
          <DonutChart data={distribution} />
          <div className="distribution-legend">
            {distribution.map((d) => (
              <div key={d.id}>
                <span>
                  <i style={{ background: d.color }} />
                  {d.name}
                </span>
                <strong>
                  {faNumber(
                    weekly.totalSeconds
                      ? Math.round((d.seconds / weekly.totalSeconds) * 100)
                      : 0,
                  )}
                  ٪
                </strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <SectionCard
        className="weekly-review"
        title="مرور هفته"
        subtitle="چند نشانه ساده از مسیری که طی کردی"
        action={
          <span className="review-badge">
            <Sparkles size={14} />
            از داده‌های همین دفتر
          </span>
        }
      >
        <div className="review-grid">
          <div>
            <span className="review-icon">
              <Award size={22} />
            </span>
            <small>روز پربازده</small>
            <strong>
              {weekly.bestDay
                ? new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(
                    new Date(`${weekly.bestDay.date}T12:00:00`),
                  )
                : "هنوز ثبت نشده"}
            </strong>
            <p>
              {weekly.bestDay
                ? focusLabel(weekly.bestDay.seconds)
                : "یک جلسه، نقطه شروع است"}
            </p>
          </div>
          <div>
            <span className="review-icon purple">
              <Folders size={22} />
            </span>
            <small>فعال‌ترین پروژه</small>
            <strong>
              <bdi>
                {mostProject?.seconds ? mostProject.name : "هنوز ثبت نشده"}
              </bdi>
            </strong>
            <p>
              {mostProject?.seconds
                ? focusLabel(mostProject.seconds)
                : "تمرکز را به یک پروژه وصل کن"}
            </p>
          </div>
          <div>
            {mostArea?.seconds ? (
              <AreaIcon areaId={mostArea.id} size={22} />
            ) : (
              <span className="review-icon">
                <Target size={22} />
              </span>
            )}
            <small>فعال‌ترین اتاق</small>
            <strong>
              {mostArea?.seconds ? mostArea.name : "هنوز ثبت نشده"}
            </strong>
            <p>
              {mostArea?.seconds
                ? focusLabel(mostArea.seconds)
                : "اتاقت منتظر اولین جلسه است"}
            </p>
          </div>
          <div>
            <span className="review-icon green">
              <CheckCircle2 size={22} />
            </span>
            <small>قدم‌های این هفته</small>
            <strong>{faNumber(weekly.completed)} کار انجام شده</strong>
            <p>{faNumber(unfinished)} کار برنامه‌ریزی‌شده باقی مانده</p>
          </div>
        </div>
      </SectionCard>
      <div className="analytics-bottom">
        <SectionCard
          title="رد قدم‌ها در دفتر"
          subtitle="کارها، تمرکز و تغییرهای اخیر"
        >
          <ActivityList limit={7} />
        </SectionCard>
        <SectionCard
          title="فضای هفته بعد را باز کن"
          subtitle="مرور خوب، به تصمیم بعدی می‌رسد."
        >
          <div className="review-next">
            <Target size={35} />
            <h3>یک اولویت روشن انتخاب کن.</h3>
            <p>
              کارهای باقی‌مانده را بررسی کن. آن‌هایی را که واقعاً مهم‌اند به روز
              بعد ببر و برایشان زمان مشخص کن.
            </p>
            <Link className="button button-outline" href="/planner">
              رفتن به پلنر
              <ArrowUpLeft size={16} />
            </Link>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
