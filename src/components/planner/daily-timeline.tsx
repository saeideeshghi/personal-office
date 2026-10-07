"use client";
import type { Task } from "@/domain/types";
import { workAreas } from "@/data/catalog";
import { faNumber } from "@/domain/calculations";
import { useSettingsStore } from "@/stores/settings-store";

export function DailyTimeline({ tasks }: { tasks: Task[] }) {
  const format = useSettingsStore((s) => s.settings.timeFormat);
  const planned = tasks.filter((t) => t.plannedTime);
  return (
    <section className="daily-timeline">
      <div className="timeline-heading">
        <h3>مسیر روزت</h3>
        <span>۸ تا ۱۸ · زمان‌بندی پیشنهادی</span>
      </div>
      <div className="timeline-hours">
        {Array.from({ length: 11 }, (_, i) => {
          const hour = i + 8;
          const hourTasks = planned.filter(
            (t) => Number(t.plannedTime!.slice(0, 2)) === hour,
          );
          return (
            <div className="timeline-hour" key={hour}>
              <time dir="ltr">
                {String(format === "12" ? hour % 12 || 12 : hour).padStart(
                  2,
                  "0",
                )}
                :00{format === "12" ? (hour >= 12 ? " PM" : " AM") : ""}
              </time>
              <div className="timeline-slot">
                {hourTasks.map((t) => (
                  <div
                    className="timeline-block"
                    key={t.id}
                    style={{
                      borderInlineStartColor: workAreas.find(
                        (a) => a.id === t.workAreaId,
                      )?.color,
                    }}
                  >
                    <strong>
                      <bdi>{t.title}</bdi>
                    </strong>
                    <span>
                      <bdi>{t.plannedTime}</bdi> ·{" "}
                      {faNumber(t.estimatedMinutes ?? 30)} دقیقه
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {planned.some(
        (t) =>
          Number(t.plannedTime!.slice(0, 2)) < 8 ||
          Number(t.plannedTime!.slice(0, 2)) > 18,
      ) && (
        <p className="form-note">
          بعضی کارهای برنامه‌ریزی‌شده خارج از بازه نمایشی هستند.
        </p>
      )}
    </section>
  );
}
