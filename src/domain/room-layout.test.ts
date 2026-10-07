import { describe, expect, it } from "vitest";
import { defaultOffice } from "@/data/catalog";
import { floorPoint, roomStations, stationTasks } from "./room-layout";
import type { Task } from "./types";

const task = (
  id: string,
  workAreaId = "area-ai",
  status: Task["status"] = "todo",
): Task => ({
  id,
  title: id,
  workAreaId,
  status,
  priority: "medium",
  tags: [],
  createdAt: "2026-10-07T08:00:00Z",
});

describe("spatial workspace task assignment", () => {
  it("reserves explicit assignments and places the active task first without mixing rooms", () => {
    const room = defaultOffice().rooms[0];
    const stations = roomStations(room);
    room.stations = stations.map((s, i) =>
      i === 2 ? { ...s, taskId: "reserved" } : s,
    );
    const bound = stationTasks(
      room,
      [
        task("first"),
        task("reserved"),
        task("active"),
        task("foreign", "area-coding"),
        task("finished", "area-ai", "done"),
      ],
      "active",
    );
    expect(bound.map((b) => b.task?.id)).toEqual([
      "active",
      "first",
      "reserved",
    ]);
  });

  it("keeps completed explicit tasks visible and tolerates deleted assignments and legacy rooms", () => {
    const room = defaultOffice().rooms[0];
    delete room.stations;
    const fallback = roomStations(room);
    room.stations = fallback.map((s, i) => ({
      ...s,
      taskId: i === 0 ? "finished" : i === 1 ? "deleted" : undefined,
    }));
    const bound = stationTasks(room, [
      task("finished", "area-ai", "done"),
      task("next"),
    ]);
    expect(bound.map((b) => b.task?.id)).toEqual([
      "finished",
      undefined,
      "next",
    ]);
    expect(room.assets.length).toBeGreaterThan(0);
  });

  it("constrains off-canvas pointer coordinates inside the floor diamond", () => {
    for (const x of [-1000, 50, 1000])
      for (const y of [-1000, 60, 1000]) {
        const point = floorPoint(x, y);
        expect(point.y).toBeGreaterThanOrEqual(42);
        expect(point.y).toBeLessThanOrEqual(78);
        expect(
          Math.abs(point.x - 50) / 36 + Math.abs(point.y - 58) / 30,
        ).toBeLessThanOrEqual(1.00001);
      }
  });
});
