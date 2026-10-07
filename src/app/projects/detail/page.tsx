import { Suspense } from "react";
import { ProjectDetailRoute } from "@/components/projects/project-detail-route";

export default function Page() {
  return (
    <Suspense fallback={<p>پروژه آماده می‌شود…</p>}>
      <ProjectDetailRoute />
    </Suspense>
  );
}
