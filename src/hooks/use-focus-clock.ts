"use client";
import { useEffect, useState } from "react";
import { useFocusStore } from "@/stores/focus-store";
import { focusElapsedSeconds } from "@/domain/calculations";

export function useFocusClock() {
  const active = useFocusStore((s) => s.active);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 250);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return { active, seconds: focusElapsedSeconds(active, now) };
}
