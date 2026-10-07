import type { OfficeRoomConfig, RoomWorkstation, Task } from "./types";

export function defaultStations(prefix: string): RoomWorkstation[] {
  return [
    {
      id: `${prefix}-station-1`,
      name: "میز اصلی",
      x: 50,
      y: 73,
      scale: 1,
      rotation: 0,
    },
    {
      id: `${prefix}-station-2`,
      name: "میز تحقیق",
      x: 29,
      y: 57,
      scale: 0.83,
      rotation: 0,
    },
    {
      id: `${prefix}-station-3`,
      name: "میز اجرا",
      x: 70,
      y: 56,
      scale: 0.83,
      rotation: 0,
    },
  ];
}

export function roomStations(room: OfficeRoomConfig) {
  return room.stations ?? defaultStations(room.id);
}

/** Keep a furniture anchor inside the diamond, with a margin at its edge. */
export function floorPoint(x: number, y: number) {
  const safeY = Math.max(42, Math.min(78, y));
  const halfWidth = 36 * (1 - Math.abs(safeY - 58) / 30);
  return { x: Math.max(50 - halfWidth, Math.min(50 + halfWidth, x)), y: safeY };
}

/** Explicit assignments win. Automatic stations never repeat an assigned task. */
export function stationTasks(
  room: OfficeRoomConfig,
  tasks: Task[],
  activeTaskId?: string,
) {
  const stations = roomStations(room);
  const roomTasks = tasks.filter((task) => task.workAreaId === room.workAreaId);
  const explicitIds = new Set(
    stations.map((station) => station.taskId).filter(Boolean),
  );
  const queue = roomTasks.filter(
    (task) => task.status !== "done" && !explicitIds.has(task.id),
  );
  if (activeTaskId)
    queue.sort(
      (a, b) => Number(b.id === activeTaskId) - Number(a.id === activeTaskId),
    );
  let next = 0;
  return stations.map((station) => ({
    station,
    task: station.taskId
      ? roomTasks.find((task) => task.id === station.taskId)
      : queue[next++],
  }));
}
