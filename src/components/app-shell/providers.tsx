"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { CheckCircle2, X } from "lucide-react";
import { hydrateStores } from "@/stores/hydrate";

const NoticeContext = createContext<(message: string) => void>(() => {});
export const useNotice = () => useContext(NoticeContext);

export function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const notify = useCallback((message: string) => setNotice(message), []);
  useEffect(() => {
    let live = true;
    hydrateStores()
      .then(() => {
        if (live) setReady(true);
      })
      .catch(() => {
        if (live) {
          setError(
            "ذخیره‌سازی مرورگر در دسترس نیست؛ تغییرها ممکن است پس از بستن صفحه باقی نمانند.",
          );
          setReady(true);
        }
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  return (
    <MotionConfig reducedMotion="user">
      <NoticeContext.Provider value={notify}>
        {!ready ? (
          <div className="app-loading">
            <div className="brand-mark">
              P<span>O</span>
            </div>
            <p>دفترت آماده می‌شود…</p>
            <div className="loading-line" />
          </div>
        ) : (
          <>
            {error && (
              <div role="alert" className="storage-error">
                {error}
              </div>
            )}
            {children}
          </>
        )}
        {notice && (
          <div className="toast" role="status">
            <CheckCircle2 size={20} />
            <span>{notice}</span>
            <button aria-label="بستن پیام" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}
      </NoticeContext.Provider>
    </MotionConfig>
  );
}
