"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderOpen, CheckSquare, ArrowUpLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { AreaIcon } from "@/components/ui/primitives";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { workAreas } from "@/data/catalog";
import { projectHref } from "@/lib/urls";

export function SearchDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  const normalized = query
    .trim()
    .toLocaleLowerCase("fa")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");
  const matches = (v: string) =>
    v
      .toLocaleLowerCase("fa")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .includes(normalized);
  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="search-dialog">
        <DialogHeader
          title="جست‌وجو در دفتر"
          description="کارها، پروژه‌ها و اتاق‌ها را پیدا کن."
        />
        <div className="search-input">
          <Search size={21} />
          <input
            aria-label="جست‌وجو"
            placeholder="دنبال چه چیزی می‌گردی؟"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd dir="ltr">ESC</kbd>
        </div>
        <div className="search-results">
          <h3>پروژه‌ها</h3>
          {projects
            .filter((p) => matches(p.name))
            .slice(0, 5)
            .map((p) => (
              <button key={p.id} onClick={() => navigate(projectHref(p.id))}>
                <FolderOpen size={18} />
                <span>
                  <bdi>{p.name}</bdi>
                  <small>پروژه</small>
                </span>
                <ArrowUpLeft size={16} />
              </button>
            ))}
          <h3>کارها</h3>
          {tasks
            .filter((t) => matches(t.title))
            .slice(0, 6)
            .map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  navigate(`/planner?task=${encodeURIComponent(t.id)}`)
                }
              >
                <CheckSquare size={18} />
                <span>
                  <bdi>{t.title}</bdi>
                  <small>کار</small>
                </span>
                <ArrowUpLeft size={16} />
              </button>
            ))}
          <h3>اتاق‌ها</h3>
          {workAreas
            .filter((a) => matches(a.name))
            .map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/office?room=${a.slug}`)}
              >
                <AreaIcon areaId={a.id} />
                <span>
                  {a.name}
                  <small>حوزه کاری</small>
                </span>
                <ArrowUpLeft size={16} />
              </button>
            ))}
          {normalized &&
            ![
              ...projects.map((p) => p.name),
              ...tasks.map((t) => t.title),
              ...workAreas.map((a) => a.name),
            ].some(matches) && (
              <p className="search-empty">نتیجه‌ای پیدا نشد.</p>
            )}
        </div>
        <div className="search-footer">
          با Tab بین نتایج حرکت کن و با Enter باز کن.
        </div>
      </DialogContent>
    </Dialog>
  );
}
