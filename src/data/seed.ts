import { addDays, subDays, set } from "date-fns";
import { dateKey } from "@/domain/calculations";
import { defaultWidgets } from "./catalog";
import type {
  Activity,
  FocusSession,
  Project,
  Settings,
  Task,
} from "@/domain/types";

export const defaultSettings: Settings = {
  userName: "سعید",
  language: "fa",
  weekStartsOn: 6,
  timeFormat: "24",
  focusMinutes: 50,
  breakMinutes: 10,
  dailyGoalMinutes: 240,
};

/** Created once on first launch; persisted arrays replace this seed on hydration. */
export function createSeed(now = new Date()) {
  const createdAt = subDays(now, 14).toISOString();
  const today = dateKey(now);
  const projects: Project[] = [
    {
      id: "project-ai-platform",
      name: "پلتفرم هوش مصنوعی",
      description: "یک فضای هوشمند برای آزمایش مدل‌ها و ارائه سرویس‌های AI.",
      workAreaId: "area-ai",
      status: "active",
      progress: 0,
      createdAt,
      dueDate: dateKey(addDays(now, 12)),
      notes:
        "ابتدا API و معیارهای ارزیابی را مشخص کنیم. نسخه اول روی یک مدل و یک جریان کار متمرکز است.",
      visibility: "private",
      phases: phases("ai"),
      roomConfig: {
        themeId: "modern",
        templateId: "research",
        decorations: ["plant", "books"],
        widgets: defaultWidgets("pai"),
      },
    },
    {
      id: "project-smart-city",
      name: "Smart City Vision",
      description: "تشخیص و تحلیل ترافیک شهری با بینایی ماشین.",
      workAreaId: "area-ai",
      status: "active",
      progress: 0,
      createdAt,
      dueDate: dateKey(addDays(now, 25)),
      notes: "دیتاست باید با شرایط واقعی دوربین‌ها مقایسه شود.",
      visibility: "private",
      phases: phases("cv"),
      roomConfig: {
        themeId: "dark-tech",
        templateId: "research",
        decorations: ["neon"],
        widgets: defaultWidgets("pcv"),
      },
    },
    {
      id: "project-website",
      name: "Personal Website",
      description: "پورتفولیوی شخصی با تمرکز بر پروژه‌ها و تجربه‌های ساختن.",
      workAreaId: "area-coding",
      status: "active",
      progress: 0,
      createdAt,
      dueDate: dateKey(addDays(now, 7)),
      notes: "نسخه اول: معرفی، پروژه‌ها و ارتباط. طراحی ساده و محتوای دقیق.",
      visibility: "private",
      phases: phases("web"),
      roomConfig: {
        themeId: "modern",
        templateId: "software",
        decorations: ["plant"],
        widgets: defaultWidgets("pweb"),
      },
    },
    {
      id: "project-campaign",
      name: "کمپین مارکتینگ پاییزی",
      description: "طراحی پیام، لندینگ و محتوا برای کمپین فصل جدید.",
      workAreaId: "area-marketing",
      status: "planning",
      progress: 0,
      createdAt,
      dueDate: dateKey(addDays(now, 18)),
      notes: "هدف کمپین: جذب لید باکیفیت؛ معیار اصلی نرخ تبدیل است.",
      visibility: "private",
      phases: phases("mk"),
      roomConfig: {
        themeId: "cozy",
        templateId: "marketing",
        decorations: ["books", "plant"],
        widgets: defaultWidgets("pmk"),
      },
    },
  ];
  const specs: [
    string,
    string | undefined,
    string,
    Task["status"],
    Task["priority"],
    number,
    string?,
    string?,
  ][] = [
    [
      "نوشتن مستندات API",
      projects[0].id,
      "area-ai",
      "doing",
      "high",
      60,
      "09:00",
      "API",
    ],
    [
      "Train YOLO Model",
      projects[1].id,
      "area-ai",
      "todo",
      "high",
      90,
      "11:00",
      "Computer Vision",
    ],
    [
      "طراحی Landing Page",
      projects[2].id,
      "area-coding",
      "todo",
      "medium",
      75,
      "14:00",
      "UI",
    ],
    [
      "مطالعه مقالات LLM",
      projects[0].id,
      "area-ai",
      "todo",
      "medium",
      45,
      "16:00",
      "Research",
    ],
    [
      "بررسی کامنت کاربران",
      projects[3].id,
      "area-marketing",
      "done",
      "low",
      30,
      "08:00",
      "Feedback",
    ],
    [
      "رفع باگ Authentication",
      projects[2].id,
      "area-coding",
      "doing",
      "high",
      50,
      "10:00",
      "Bug",
    ],
    [
      "طراحی کمپین پاییزی",
      projects[3].id,
      "area-marketing",
      "todo",
      "medium",
      60,
      "15:00",
      "Campaign",
    ],
    [
      "مطالعه و یادداشت روزانه",
      undefined,
      "area-personal",
      "todo",
      "low",
      25,
      "17:00",
      "یادگیری",
    ],
    [
      "تعریف معیارهای ارزیابی مدل",
      projects[1].id,
      "area-ai",
      "done",
      "high",
      45,
    ],
    [
      "ساخت کامپوننت‌های پایه",
      projects[2].id,
      "area-coding",
      "done",
      "medium",
      90,
    ],
    ["آماده‌سازی دیتاست شهری", projects[1].id, "area-ai", "done", "high", 120],
    [
      "تحقیق مخاطبان کمپین",
      projects[3].id,
      "area-marketing",
      "done",
      "medium",
      45,
    ],
  ];
  const tasks: Task[] = specs.map((s, i) => ({
    id: `task-demo-${i + 1}`,
    title: s[0],
    projectId: s[1],
    workAreaId: s[2],
    status: s[3],
    priority: s[4],
    estimatedMinutes: s[5],
    plannedDate: i < 8 ? today : dateKey(subDays(now, i - 7)),
    plannedTime: s[6],
    tags: s[7] ? [s[7]] : ["پروژه"],
    createdAt,
    completedAt:
      s[3] === "done"
        ? set(subDays(now, i < 8 ? 0 : i - 7), {
            hours: 8,
            minutes: 30,
            seconds: 0,
          }).toISOString()
        : undefined,
  }));
  const sessions: FocusSession[] = Array.from({ length: 18 }, (_, i) => {
    const task = tasks[[0, 5, 1, 6, 7, 3][i % 6]];
    const start = set(subDays(now, Math.floor(i / 3)), {
      hours: 7 + (i % 3),
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const minutes = [45, 50, 30, 75, 60, 25][i % 6];
    const end = new Date(start.getTime() + minutes * 60_000);
    return {
      id: `session-demo-${i}`,
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      workAreaId: task.workAreaId,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      durationSeconds: minutes * 60,
      segments: [
        { startedAt: start.toISOString(), endedAt: end.toISOString() },
      ],
    };
  }).filter((s) => Date.parse(s.endedAt!) <= now.getTime());
  const activities: Activity[] = [
    {
      id: "activity-demo-1",
      type: "task_started",
      entityId: tasks[0].id,
      projectId: tasks[0].projectId,
      message: "کار «نوشتن مستندات API» شروع شد",
      createdAt: now.toISOString(),
    },
    {
      id: "activity-demo-2",
      type: "task_completed",
      entityId: tasks[4].id,
      projectId: tasks[4].projectId,
      message: "کار «بررسی کامنت کاربران» تکمیل شد",
      createdAt: new Date(now.getTime() - 45 * 60_000).toISOString(),
    },
    {
      id: "activity-demo-3",
      type: "project_created",
      entityId: projects[3].id,
      projectId: projects[3].id,
      message: "پروژه «کمپین مارکتینگ پاییزی» ایجاد شد",
      createdAt: subDays(now, 1).toISOString(),
    },
  ];
  return { projects, tasks, sessions, activities };
}

export function phases(prefix: string) {
  return [
    "تحقیق و برنامه‌ریزی",
    "طراحی و توسعه",
    "تست و بهینه‌سازی",
    "انتشار",
  ].map((name, i) => ({
    id: `${prefix}-phase-${i}`,
    name,
    completed: i === 0,
  }));
}
