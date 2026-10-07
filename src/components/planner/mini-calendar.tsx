"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { dateKey } from "@/domain/calculations";
import { cn } from "@/lib/utils";

const jalaliDay = (date: Date) =>
  Number(
    new Intl.DateTimeFormat("en-US-u-ca-persian", { day: "numeric" }).format(
      date,
    ),
  );
const firstDay = (date: Date) => addDays(date, 1 - jalaliDay(date));

export function MiniCalendar({
  selected,
  onSelect,
  weekStartsOn = 6,
}: {
  selected: string;
  onSelect: (date: string) => void;
  weekStartsOn?: 6 | 1;
}) {
  const [anchor, setAnchor] = useState(() => new Date(`${selected}T12:00:00`));
  const start = firstDay(anchor);
  const next = firstDay(addDays(start, 32));
  const days = Math.round((next.getTime() - start.getTime()) / 86400000);
  const offset = (start.getDay() - weekStartsOn + 7) % 7;
  const labels =
    weekStartsOn === 6
      ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
      : ["د", "س", "چ", "پ", "ج", "ش", "ی"];
  return (
    <section className="mini-calendar">
      <header>
        <strong>
          {new Intl.DateTimeFormat("fa-IR", {
            month: "long",
            year: "numeric",
          }).format(anchor)}
        </strong>
        <div>
          <button
            aria-label="ماه قبل"
            onClick={() => setAnchor(firstDay(addDays(start, -1)))}
          >
            <ChevronRight size={17} />
          </button>
          <button aria-label="ماه بعد" onClick={() => setAnchor(next)}>
            <ChevronLeft size={17} />
          </button>
        </div>
      </header>
      <div className="calendar-grid">
        {labels.map((label) => (
          <span key={label} className="calendar-weekday">
            {label}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`empty-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = addDays(start, i);
          const key = dateKey(day);
          return (
            <button
              key={key}
              className={cn(
                key === selected && "calendar-selected",
                key === dateKey() && "calendar-today",
              )}
              onClick={() => onSelect(key)}
              aria-label={new Intl.DateTimeFormat("fa-IR", {
                day: "numeric",
                month: "long",
              }).format(day)}
              aria-pressed={key === selected}
            >
              {new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(day)}
            </button>
          );
        })}
      </div>
      <button
        className="calendar-go-today"
        onClick={() => {
          setAnchor(new Date());
          onSelect(dateKey());
        }}
      >
        برگشت به امروز
      </button>
    </section>
  );
}
