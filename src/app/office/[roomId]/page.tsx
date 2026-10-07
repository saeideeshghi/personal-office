import { Suspense } from "react";
import { RoomRoute } from "@/components/office/room-route";
import { workAreas } from "@/data/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return workAreas.map((area) => ({ roomId: `room-${area.slug}` }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return (
    <Suspense fallback={<p>فضای کارت آماده می‌شود…</p>}>
      <RoomRoute roomId={roomId} />
    </Suspense>
  );
}
