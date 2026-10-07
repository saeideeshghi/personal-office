"use client";
import { useState, type FormEvent } from "react";
import {
  Save,
  UserRound,
  Clock3,
  Globe,
  RotateCcw,
  ShieldCheck,
  Database,
  Check,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  ConfirmDialog,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/settings-store";
import { settingsSchema } from "@/domain/schemas";
import { resetDemoData } from "@/lib/commands";
import { useNotice } from "./providers";
import { defaultSettings } from "@/data/seed";

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const [form, setForm] = useState(settings);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(false);
  const notify = useNotice();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = settingsSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    update(result.data);
    setError("");
    notify("تنظیمات دفتر ذخیره شد");
  };
  return (
    <>
      <PageHeader
        eyebrow="چیزهای کوچک، تجربه بهتر"
        title="تنظیمات دفتر"
        subtitle="این فضا را با ریتم روزهای خودت هماهنگ کن."
      />
      <form onSubmit={submit} className="settings-layout">
        <div className="settings-main">
          <SectionCard
            title="پروفایل شخصی"
            subtitle="دفتر به اسم توست."
            action={<UserRound size={20} />}
          >
            <div className="form-grid">
              <div className="field field-full">
                <label htmlFor="user-name">نام کاربر</label>
                <input
                  id="user-name"
                  value={form.userName}
                  onChange={(e) =>
                    setForm({ ...form, userName: e.target.value })
                  }
                  maxLength={50}
                />
              </div>
            </div>
          </SectionCard>
          <SectionCard
            title="نمایش و تقویم"
            subtitle="تاریخ‌ها شمسی و برنامه‌ها با روز محلی مرورگر تنظیم می‌شوند."
            action={<Globe size={20} />}
          >
            <div className="form-grid">
              <div className="field">
                <label htmlFor="language">زبان رابط</label>
                <select id="language" value={form.language} onChange={() => {}}>
                  <option value="fa">فارسی</option>
                </select>
                <small className="form-note">
                  نسخه فعلی با رابط فارسی ارائه شده.
                </small>
              </div>
              <div className="field">
                <label htmlFor="week-start">شروع هفته</label>
                <select
                  id="week-start"
                  value={form.weekStartsOn}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weekStartsOn: Number(e.target.value) as 6 | 1,
                    })
                  }
                >
                  <option value={6}>شنبه</option>
                  <option value={1}>دوشنبه</option>
                </select>
              </div>
              <div className="field field-full">
                <label htmlFor="time-format">فرمت نمایش ساعت</label>
                <select
                  id="time-format"
                  value={form.timeFormat}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      timeFormat: e.target.value as "24" | "12",
                    })
                  }
                >
                  <option value="24">۲۴ ساعته</option>
                  <option value="12">۱۲ ساعته</option>
                </select>
              </div>
            </div>
          </SectionCard>
          <SectionCard
            title="ریتم تمرکز"
            subtitle="هدف جلسه یک یادآور است؛ تایمر تا پایان دستی ادامه می‌یابد."
            action={<Clock3 size={20} />}
          >
            <div className="form-grid">
              <div className="field">
                <label htmlFor="focus-minutes">مدت هدف تمرکز (دقیقه)</label>
                <input
                  id="focus-minutes"
                  type="number"
                  min={1}
                  max={180}
                  value={form.focusMinutes}
                  onChange={(e) =>
                    setForm({ ...form, focusMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="break-minutes">زمان استراحت (دقیقه)</label>
                <input
                  id="break-minutes"
                  type="number"
                  min={1}
                  max={60}
                  value={form.breakMinutes}
                  onChange={(e) =>
                    setForm({ ...form, breakMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="field field-full">
                <label htmlFor="daily-goal">هدف روزانه تمرکز (دقیقه)</label>
                <input
                  id="daily-goal"
                  type="number"
                  min={15}
                  max={960}
                  value={form.dailyGoalMinutes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dailyGoalMinutes: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </SectionCard>
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <div className="settings-save">
            <Button type="submit">
              <Save size={16} />
              ذخیره تنظیمات
            </Button>
            {JSON.stringify(settings) === JSON.stringify(form) && (
              <span>
                <Check size={13} />
                همه تغییرها ذخیره شده
              </span>
            )}
          </div>
        </div>
        <aside className="settings-side">
          <SectionCard title="داده‌های تو" action={<ShieldCheck size={20} />}>
            <div className="settings-data">
              <Database size={32} />
              <strong>محلی و شخصی</strong>
              <p>
                پروژه‌ها، کارها و جلسه‌های تمرکز در همین مرورگر ذخیره می‌شوند.
                این نسخه حساب کاربری یا همگام‌سازی ابری ندارد.
              </p>
              <small>
                پاک‌کردن داده‌های سایت در مرورگر، اطلاعات دفتر را حذف می‌کند.
              </small>
            </div>
          </SectionCard>
          <SectionCard
            title="شروع دوباره"
            subtitle="برگشتن به نمونه اولیه دفتر"
          >
            <p className="reset-description">
              داده‌های فعلی با پروژه‌ها و کارهای نمونه جایگزین می‌شوند. ظاهر و
              تنظیمات هم بازنشانی می‌شوند.
            </p>
            <Button
              variant="danger"
              className="reset-demo-button"
              onClick={() => setReset(true)}
            >
              <RotateCcw size={15} />
              بازنشانی داده‌های نمونه
            </Button>
          </SectionCard>
        </aside>
      </form>
      <ConfirmDialog
        open={reset}
        onOpenChange={setReset}
        title="تمام داده‌ها بازنشانی شوند؟"
        description="پروژه‌ها، کارها، یادداشت‌ها، جلسه‌های تمرکز و تنظیمات فعلی حذف و با نمونه‌های اولیه جایگزین می‌شوند. این کار قابل برگشت نیست."
        label="بازنشانی کامل"
        onConfirm={() => {
          resetDemoData();
          setForm(defaultSettings);
          notify("دفتر با داده‌های نمونه بازنشانی شد");
        }}
      />
    </>
  );
}
