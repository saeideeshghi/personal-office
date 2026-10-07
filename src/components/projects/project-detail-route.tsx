"use client";

import { useSearchParams } from "next/navigation";
import { ProjectDetailPage } from "./project-detail-page";

export function ProjectDetailRoute() {
  const projectId = useSearchParams().get("projectId") ?? "";
  return <ProjectDetailPage key={projectId} projectId={projectId} />;
}
