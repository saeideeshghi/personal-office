"use client";
import { useState } from "react";
import { Plus, Search, Folders } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { ProjectDialog } from "./project-dialog";
import { useProjectStore } from "@/stores/project-store";
import { workAreas } from "@/data/catalog";
import { faNumber } from "@/domain/calculations";

export function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const [area, setArea] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [add, setAdd] = useState(false);
  const filtered = projects.filter(
    (p) =>
      (area === "all" || p.workAreaId === area) &&
      (status === "all" || p.status === status) &&
      p.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="از ایده تا چیزی که ساخته می‌شود"
        title="پروژه‌های من"
        subtitle="هر پروژه یک مسیر دارد؛ فضای خودش را به آن بده."
      >
        <Button onClick={() => setAdd(true)}>
          <Plus size={17} />
          پروژه جدید
        </Button>
      </PageHeader>
      <div className="projects-toolbar">
        <div className="area-tabs">
          <button
            className={area === "all" ? "active" : ""}
            onClick={() => setArea("all")}
          >
            <Folders size={15} />
            همه پروژه‌ها <span>{faNumber(projects.length)}</span>
          </button>
          {workAreas.map((a) => (
            <button
              key={a.id}
              className={area === a.id ? "active" : ""}
              onClick={() => setArea(a.id)}
            >
              <i style={{ background: a.color }} />
              {a.name}
            </button>
          ))}
        </div>
        <div className="project-filters">
          <div className="inline-search">
            <Search size={17} />
            <input
              aria-label="جست‌وجوی پروژه"
              placeholder="پیدا کردن پروژه…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="فیلتر وضعیت پروژه"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="planning">برنامه‌ریزی</option>
            <option value="active">فعال</option>
            <option value="paused">متوقف</option>
            <option value="completed">تکمیل شده</option>
          </select>
        </div>
      </div>
      <div className="project-count">
        {faNumber(filtered.length)} پروژه در دفترت
      </div>
      {filtered.length ? (
        <div className="projects-grid">
          {filtered.map((p) => (
            <ProjectCard project={p} key={p.id} />
          ))}
          <button className="new-project-card" onClick={() => setAdd(true)}>
            <span>
              <Plus size={24} />
            </span>
            <strong>ایده بعدی تو</strong>
            <p>یک پروژه تازه بساز.</p>
          </button>
        </div>
      ) : (
        <EmptyState
          title="پروژه‌ای پیدا نشد"
          description="فیلترها را تغییر بده یا یک پروژه تازه بساز."
        >
          <Button onClick={() => setAdd(true)}>ساخت پروژه</Button>
        </EmptyState>
      )}
      {add && <ProjectDialog open={add} onOpenChange={setAdd} />}
    </>
  );
}
