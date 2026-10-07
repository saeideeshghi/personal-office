"use client";

import { useState } from "react";
import { Pause, Play, Square, Focus, Check, Coffee } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useFocusClock } from "@/hooks/use-focus-clock";
import { formatTimer, faNumber } from "@/domain/calculations";
import {
  startFocus,
  pauseFocus,
  resumeFocus,
  finishFocus,
  cancelFocus,
} from "@/lib/commands";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/primitives";
import { useNotice } from "@/components/app-shell/providers";
import { cn } from "@/lib/utils";

export function FocusPanel({
  compact = false,
  areaId,
}: {
  compact?: boolean;
  areaId?: string;
}) {
  const { active, seconds } = useFocusClock();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const settings = useSettingsStore((s) => s.settings);
  const eligible = tasks.filter(
    (t) => t.status !== "done" && (!areaId || t.workAreaId === areaId),
  );
  const [selected, setSelected] = useState(eligible[0]?.id ?? "");
  const selectedId = eligible.some((t) => t.id === selected)
    ? selected
    : (eligible[0]?.id ?? "");
  const [finish, setFinish] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [complete, setComplete] = useState(true);
  const notify = useNotice();
  const project = projects.find((p) => p.id === active?.projectId);
  const target = (active?.goalMinutes ?? settings.focusMinutes) * 60;
  const progress = Math.min(1, seconds / target);
  return (
    <section
      className={cn("focus-panel", compact && "focus-panel-compact")}
      aria-label="تمرکز"
    >
      <div className="focus-panel-header">
        <span>
          <Focus size={17} /> فضای تمرکز
        </span>
        <span
          className={cn(
            "focus-state",
            active?.status === "running" && "is-running",
          )}
        >
          <i />
          {active
            ? active.status === "running"
              ? "در حال کار"
              : "مکث"
            : "آماده"}
        </span>
      </div>
      <div className="timer-ring">
        <svg viewBox="0 0 190 190" aria-hidden="true">
          <circle cx="95" cy="95" r="86" className="timer-ring-bg" />
          <circle
            cx="95"
            cy="95"
            r="86"
            className="timer-ring-progress"
            strokeDasharray={540.35}
            strokeDashoffset={540.35 * (1 - progress)}
          />
        </svg>
        <div className="timer-ring-content">
          <span>{active ? "زمان تمرکز" : "جلسه بعدی"}</span>
          <strong className="timer" dir="ltr" data-testid="focus-timer">
            {active
              ? formatTimer(seconds)
              : `${String(settings.focusMinutes).padStart(2, "0")}:00`}
          </strong>
          <small>
            {active
              ? `هدف ${faNumber(active.goalMinutes)} دقیقه`
              : "یک کار، تمام توجه تو"}
          </small>
        </div>
      </div>
      <h3>
        <bdi>{active?.taskTitle ?? "آماده شروع کار؟"}</bdi>
      </h3>
      <p className="focus-project">
        <bdi>
          {active ? (project?.name ?? "کار مستقل") : "از یک قدم کوچک شروع کن."}
        </bdi>
      </p>
      {active && areaId && active.workAreaId !== areaId && (
        <p className="focus-other-room">
          جلسه فعال در اتاق دیگری است؛ بعد از پایانش می‌توانی اینجا شروع کنی.
        </p>
      )}
      {active ? (
        <>
          <div className="focus-controls">
            <Button
              variant="secondary"
              onClick={() =>
                active.status === "running" ? pauseFocus() : resumeFocus()
              }
            >
              {active.status === "running" ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
              {active.status === "running" ? "مکث" : "ادامه"}
            </Button>
            <Button onClick={() => setFinish(true)}>
              <Square size={13} fill="currentColor" />
              پایان جلسه
            </Button>
          </div>
          <button className="cancel-focus" onClick={() => setCancel(true)}>
            لغو جلسه
          </button>
          {seconds >= target && (
            <div className="break-hint">
              <Coffee size={16} />
              هدف جلسه تمام شد؛ {faNumber(settings.breakMinutes)} دقیقه استراحت
              کن.
            </div>
          )}
        </>
      ) : (
        <>
          <select
            className="focus-task-select"
            aria-label="انتخاب کار برای تمرکز"
            value={selectedId}
            onChange={(e) => setSelected(e.target.value)}
          >
            {eligible.length ? (
              eligible.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))
            ) : (
              <option value="">ابتدا یک کار اضافه کن</option>
            )}
          </select>
          <Button
            className="start-focus-button"
            disabled={!selectedId}
            onClick={() => {
              if (startFocus(selectedId)) notify("جلسه تمرکز شروع شد");
            }}
          >
            <Play size={16} fill="currentColor" />
            شروع تمرکز
          </Button>
        </>
      )}
      <Dialog open={finish} onOpenChange={setFinish}>
        <DialogContent className="dialog-small">
          <DialogHeader
            title="جلسه‌ات را ثبت کن"
            description="زمان تمرکز به گزارش‌ها اضافه می‌شود."
          />
          <div className="finish-summary">
            <Check size={26} />
            <strong dir="ltr">{formatTimer(seconds)}</strong>
            <span>
              تمرکز روی <bdi>{active?.taskTitle}</bdi>
            </span>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={complete}
              onChange={(e) => setComplete(e.target.checked)}
            />
            این کار هم انجام شد
          </label>
          <div className="dialog-footer">
            <Button variant="outline" onClick={() => setFinish(false)}>
              ادامه کار
            </Button>
            <Button
              onClick={() => {
                finishFocus(complete);
                setFinish(false);
                notify("جلسه تمرکز ثبت شد");
              }}
            >
              ثبت جلسه
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={cancel}
        onOpenChange={setCancel}
        title="جلسه لغو شود؟"
        description="زمان این جلسه در گزارش تمرکز ثبت نمی‌شود. وضعیت کار حفظ می‌شود."
        label="لغو جلسه"
        onConfirm={() => {
          cancelFocus();
          notify("جلسه لغو شد");
        }}
      />
    </section>
  );
}

export function FocusTime({ showStatus = false }: { showStatus?: boolean }) {
  const { active, seconds } = useFocusClock();
  return (
    <span className="focus-time-inline">
      <strong dir="ltr">{formatTimer(seconds)}</strong>
      {showStatus && (
        <small>
          {active?.status === "running"
            ? "در حال تمرکز"
            : active
              ? "در مکث"
              : "آماده شروع"}
        </small>
      )}
    </span>
  );
}
