import { ProjectDetailPage } from "@/components/projects/project-detail-page";
import { createSeed } from "@/data/seed";

// Keep the original demo URLs working. User-created projects use /projects/detail.
export const dynamicParams = false;

export function generateStaticParams() {
  return createSeed().projects.map((project) => ({ projectId: project.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailPage key={projectId} projectId={projectId} />;
}
