import { z } from "zod";

const optionalDate = z
  .string()
  .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "تاریخ معتبر وارد کن");

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "عنوان باید حداقل ۲ حرف داشته باشد")
    .max(180, "عنوان بیش از حد طولانی است"),
  description: z.string().max(3000, "حداکثر ۳۰۰۰ حرف"),
  projectId: z.string(),
  workAreaId: z.string().min(1, "حوزه کاری را انتخاب کن"),
  status: z.enum(["todo", "doing", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  estimatedMinutes: z.coerce
    .number()
    .int()
    .min(0, "زمان نمی‌تواند منفی باشد")
    .max(1440, "حداکثر ۱۴۴۰ دقیقه"),
  plannedDate: optionalDate,
  plannedTime: z
    .string()
    .refine(
      (v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
      "زمان معتبر وارد کن",
    ),
  dueDate: optionalDate,
  tags: z.string().max(300, "برچسب‌ها بیش از حد طولانی هستند"),
});

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ حرف داشته باشد")
    .max(100, "حداکثر ۱۰۰ حرف"),
  description: z.string().max(3000),
  workAreaId: z.string().min(1),
  status: z.enum(["planning", "active", "paused", "completed"]),
  dueDate: optionalDate,
});

export const settingsSchema = z.object({
  userName: z.string().trim().min(1, "نام را وارد کن").max(50),
  language: z.literal("fa"),
  weekStartsOn: z.union([z.literal(6), z.literal(1)]),
  timeFormat: z.enum(["24", "12"]),
  focusMinutes: z.number().int().min(1).max(180),
  breakMinutes: z.number().int().min(1).max(60),
  dailyGoalMinutes: z.number().int().min(15).max(960),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
