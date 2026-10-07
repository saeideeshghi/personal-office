"use client";

import { useSearchParams } from "next/navigation";
import { RoomWorkspace } from "./room-workspace";

export function RoomRoute({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const initialTab =
    tab === "customize" || tab === "focus" || tab === "projects"
      ? tab
      : "tasks";
  return (
    <RoomWorkspace
      key={`${roomId}:${initialTab}`}
      roomId={roomId}
      initialTab={initialTab}
    />
  );
}
