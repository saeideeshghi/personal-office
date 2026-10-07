"use client";

import { useId, useRef, type CSSProperties, type PointerEvent } from "react";
import { officeAssets, workAreas } from "@/data/catalog";
import type { OfficeRoomConfig, Task } from "@/domain/types";
import { floorPoint, stationTasks } from "@/domain/room-layout";
import { cn } from "@/lib/utils";

export type RoomObject = { kind: "station" | "asset"; id: string };

function Monitor({
  color,
  kind,
  running,
}: {
  color: string;
  kind: string;
  running: boolean;
}) {
  return (
    <g transform="translate(-24 -107) skewY(26)">
      <path d="M26 5v20l-10 5 35 1 9-5-27-4V5" fill="#364152" />
      <rect
        x="-15"
        y="-65"
        width="97"
        height="66"
        rx="4"
        fill="#111821"
        stroke="#536277"
        strokeWidth="1.4"
      />
      <rect x="-10" y="-60" width="87" height="53" rx="1.5" fill="#121c2b" />
      <rect x="-10" y="-60" width="87" height="7" fill={color} opacity=".75" />
      <circle cx="-5" cy="-56" r="1.2" fill="#f1f3f9" />
      <circle cx="0" cy="-56" r="1.2" fill="#f1f3f9" opacity=".5" />
      <rect x="-6" y="-49" width="15" height="38" rx="1" fill="#1d2940" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x="-3"
          y={-46 + i * 6}
          width={i % 2 ? 8 : 10}
          height="1.6"
          rx=".8"
          fill="#728498"
          opacity=".8"
        />
      ))}
      {kind === "area-marketing" ? (
        <>
          <rect x="15" y="-48" width="54" height="21" rx="1" fill="#394657" />
          <path d="m15-27 15-15 12 9 9-12 18 18" fill={color} opacity=".7" />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x="15"
              y={-23 + i * 4}
              width={48 - i * 6}
              height="2.4"
              rx="1"
              fill={i === 1 ? color : "#627688"}
            />
          ))}
        </>
      ) : kind === "area-ai" ? (
        <>
          <path
            d="m17-19 6-10 7 4 7-13 8 6 9-10 15-3"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <path d="M16-15h53M16-48v33" fill="none" stroke="#475974" />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={18 + i * 17}
              y="-11"
              width="13"
              height="2"
              fill="#6d839b"
            />
          ))}
        </>
      ) : (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <rect
                x={15 + (i % 3) * 3}
                y={-47 + i * 6}
                width={12 + (i % 2) * 9}
                height="2"
                rx="1"
                fill={i % 2 ? "#92c6b4" : color}
              />
              <rect
                x={42 + (i % 2) * 4}
                y={-47 + i * 6}
                width={22 - (i % 3) * 4}
                height="2"
                rx="1"
                fill="#6b849d"
              />
            </g>
          ))}
        </>
      )}
      <circle cx="33" cy="-3" r="1.3" fill={running ? "#99efb4" : "#8094ae"} />
    </g>
  );
}

function Workstation({
  color,
  areaId,
  desk,
  dual,
  running,
  paused,
}: {
  color: string;
  areaId: string;
  desk: string;
  dual: boolean;
  running: boolean;
  paused: boolean;
}) {
  const wood = desk === "desk-wood";
  const dark = desk === "desk-dark";
  return (
    <g
      className={cn(
        "iso-workstation",
        running && "iso-working",
        paused && "iso-paused",
      )}
    >
      <ellipse cx="7" cy="6" rx="102" ry="27" fill="#000" opacity=".25" />
      {running && (
        <ellipse
          className="iso-active-aura"
          cx="0"
          cy="-8"
          rx="109"
          ry="41"
          fill={color}
          opacity=".12"
        />
      )}
      <path
        d="M-67-62v55l10 6v-57m121-60v81l10-5v-80M-4-54V3l10 4v-60"
        fill={dark ? "#222d3b" : "#647387"}
      />
      <path
        d="m-100-87 102-51 105 54L4-31Z"
        fill={wood ? "#c39970" : dark ? "#3b4658" : "#d3d0c5"}
        stroke={wood ? "#e5bb8b" : "#8998a7"}
        strokeWidth=".8"
      />
      <path
        d="m-100-87 104 56v8l-104-55Z"
        fill={wood ? "#906d4f" : dark ? "#273141" : "#969c9e"}
      />
      <path
        d="m4-31 103-53v8L4-23Z"
        fill={wood ? "#ab835d" : dark ? "#313b4b" : "#b1b6b6"}
      />
      {wood && (
        <path
          d="m-87-87 90 45m-65-64 91 45m-64-59 89 45m-64-58 90 44"
          stroke="#9b714a"
          opacity=".3"
          fill="none"
        />
      )}
      {dual && (
        <g transform="translate(-53 -27) scale(.68)">
          <Monitor color={color} kind={areaId} running={running} />
        </g>
      )}
      <Monitor color={color} kind={areaId} running={running} />
      <path d="m-36-77 27-14 34 18-26 14Z" fill="#435063" stroke="#65758d" />
      <path
        d="m-29-76 22-10m-15 14 22-11m-14 15 22-10"
        stroke="#9aa9bd"
        strokeWidth="1.8"
      />
      <ellipse
        cx="45"
        cy="-67"
        rx="8"
        ry="5"
        fill="#435063"
        transform="rotate(25 45 -67)"
      />
      <g transform="translate(69 -82)">
        <ellipse rx="7" ry="4" cy="8" fill="#303e4d" opacity=".5" />
        <path d="M-5-5v11q5 5 10 0V-5" fill="#dddcd3" />
        <ellipse rx="5" ry="2.5" cy="-5" fill="#a9afa7" />
        <path d="M5-2q8-1 5 6H5" stroke="#dddcd3" strokeWidth="2" fill="none" />
      </g>
      <g transform="translate(-14 -4)">
        <path
          d="M0-8v14m0 0-17 5m17-5 18 6m-18-6 0 12"
          stroke="#718095"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="-17" cy="12" rx="4" ry="2.5" fill="#202935" />
        <ellipse cx="18" cy="13" rx="4" ry="2.5" fill="#202935" />
        <path d="M-18-25q19-15 38 0v11q-19 11-38-1Z" fill="#38495d" />
        <path
          d="m-12-29-9 5 1 12m36-18 11 5v12"
          stroke="#617288"
          strokeWidth="3"
          fill="none"
        />
      </g>
      <g className="iso-person">
        <path
          d="m-31-30 8 19 9 4 7-6-10-23m19 1 9 18 11-1 3-7-8-18"
          fill="#222b3a"
        />
        <path d="m-16-19 6 6-4 8-15-6m48-8 5 4-3 7-13 1" fill="#111821" />
        <path d="M-33-56q18-13 38 0l13 28-47 9-11-23Z" fill={color} />
        <path
          d="m-30-49-14-10 9-18m37 27 19-13-10-11"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="m-35-77 5-5m41 8-4-4"
          stroke="#ddb494"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="-18" y="-72" width="14" height="17" rx="5" fill="#c49378" />
        <ellipse cx="-11" cy="-86" rx="17" ry="20" fill="#e0b498" />
        <path
          d="M-28-88q-3-24 17-22 22-1 20 25l-5 8-6-12-14 4-10 9Z"
          fill="#2d292e"
        />
        <path
          d="M-29-83q1 14 12 15"
          stroke="#27232a"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M-17-56q10 6 23 0"
          fill="none"
          stroke="#ffffff"
          opacity=".2"
          strokeWidth="2"
        />
      </g>
      {running && (
        <g className="iso-screen-activity">
          <circle cx="83" cy="-108" r="4" fill="#a2edb9" />
          <path
            d="m80-108 2 2 4-4"
            stroke="#215f40"
            strokeWidth="1.3"
            fill="none"
          />
        </g>
      )}
    </g>
  );
}

function Decoration({ assetId, color }: { assetId: string; color: string }) {
  if (assetId === "plant")
    return (
      <g>
        <ellipse cx="0" cy="4" rx="24" ry="8" fill="#000" opacity=".22" />
        <path d="m-16-24 5 29q13 10 26-1l4-28" fill="#b1aa9e" />
        <ellipse cy="-24" rx="19" ry="9" fill="#d0c5b5" />
        <ellipse cy="-23" rx="15" ry="6" fill="#514632" />
        <path
          d="M0-23v-61m0 42-17-19m17 13 20-24"
          stroke="#3c785a"
          strokeWidth="3"
        />
        <ellipse
          cx="-13"
          cy="-63"
          rx="9"
          ry="21"
          fill="#509b75"
          transform="rotate(-39 -13 -63)"
        />
        <ellipse
          cx="17"
          cy="-74"
          rx="9"
          ry="23"
          fill="#65ae7d"
          transform="rotate(37 17 -74)"
        />
        <ellipse cy="-87" rx="8" ry="20" fill="#74b68b" />
      </g>
    );
  if (assetId === "lamp")
    return (
      <g>
        <ellipse cx="0" cy="2" rx="17" ry="6" fill="#000" opacity=".2" />
        <ellipse rx="15" ry="6" fill="#737789" />
        <path
          d="M0 0v-89m0 0 24-12"
          fill="none"
          stroke="#9da0ae"
          strokeWidth="3"
        />
        <path d="m10-96 10-23 24 16-9 18Z" fill="#d8c38c" />
        <ellipse cx="24" cy="-93" rx="13" ry="6" fill="#ffe5a1" />
        <path d="m13-88-23 57 50 5-9-66" fill="#ffdf8c" opacity=".055" />
      </g>
    );
  if (assetId === "books")
    return (
      <g>
        <ellipse cx="0" cy="3" rx="30" ry="9" fill="#000" opacity=".2" />
        <path d="m-27-70 30-15 30 16v66L3 12-27-4Z" fill="#775d49" />
        <path d="M3-69v81L33-3v-66Z" fill="#4d4038" />
        <path
          d="m-24-48 26 14 27-14m-53 22L2-12l27-14"
          stroke="#b58f66"
          strokeWidth="4"
          fill="none"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`m${-22 + i * 5} ${-62 + i * 2.5}v16l4 2v-16Z`}
            fill={[color, "#babc9c", "#90b5b4", "#cb9b7b", "#c8b993"][i]}
          />
        ))}
        <path d="m-19-24 18 10 21-11v10L-1-4l-18-10Z" fill={color} />
      </g>
    );
  return (
    <g>
      <ellipse cy="5" rx="36" ry="10" fill="#000" opacity=".2" />
      <path
        d="m-33-71 64 33v43L-33-28Z"
        fill="#162234"
        stroke="#485973"
        strokeWidth="2"
      />
      <path
        d="m-23-54 16 8-16 8m42 4-16 8 16 8"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <path d="m2-50-10 37" stroke={color} strokeWidth="3" />
      <path
        d="m-23-54 16 8-16 8m42 4-16 8 16 8"
        stroke={color}
        strokeWidth="9"
        opacity=".15"
        fill="none"
      />
    </g>
  );
}

export function RoomArtwork({
  room,
  className,
  tasks = [],
  activeTaskId,
  paused = false,
  editing = false,
  selected,
  onSelect,
  onMove,
  onMoveEnd,
  onTaskClick,
  onEmptyStation,
}: {
  room: OfficeRoomConfig;
  className?: string;
  tasks?: Task[];
  activeTaskId?: string;
  paused?: boolean;
  editing?: boolean;
  selected?: RoomObject;
  onSelect?: (object: RoomObject) => void;
  onMove?: (object: RoomObject, point: { x: number; y: number }) => void;
  onMoveEnd?: () => void;
  onTaskClick?: (task: Task) => void;
  onEmptyStation?: () => void;
}) {
  const uid = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    object: RoomObject;
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const area = workAreas.find((a) => a.id === room.workAreaId) ?? workAreas[0];
  const color = room.themeId === "minimal" ? "#9aa6b5" : area.color;
  const light = room.lighting === "day";
  const floor =
    room.themeId === "cozy"
      ? "#594337"
      : room.themeId === "modern"
        ? "#43526a"
        : room.themeId === "minimal"
          ? "#3f454d"
          : "#222c40";
  const desk =
    room.assets.find(
      (a) => officeAssets.find((def) => def.id === a.assetId)?.type === "desk",
    )?.assetId ?? "desk-minimal";
  const dual = room.assets.some((a) => a.assetId === "monitor-dual");
  const furniture = [
    ...(room.stations ||
    room.assets.some(
      (a) =>
        officeAssets.find((definition) => definition.id === a.assetId)?.type ===
        "desk",
    )
      ? stationTasks(room, tasks, activeTaskId)
      : []
    ).map(({ station, task }) => ({
      object: { kind: "station" as const, id: station.id },
      instance: station,
      task,
    })),
    ...room.assets
      .filter((a) => ["plant", "lamp", "books", "neon"].includes(a.assetId))
      .map((instance) => ({
        object: { kind: "asset" as const, id: instance.id },
        instance,
        task: undefined,
      })),
  ].sort((a, b) => a.instance.y - b.instance.y);

  function pointerDown(
    event: PointerEvent<SVGGElement>,
    object: RoomObject,
    x: number,
    y: number,
  ) {
    if (!editing) return;
    event.preventDefault();
    onSelect?.(object);
    suppressClick.current = false;
    drag.current = {
      object,
      x,
      y,
      clientX: event.clientX,
      clientY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGGElement>) {
    const current = drag.current;
    const bounds = svg.current?.getBoundingClientRect();
    if (!current || !bounds) return;
    const dx = event.clientX - current.clientX;
    const dy = event.clientY - current.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 4) current.moved = true;
    onMove?.(
      current.object,
      floorPoint(
        current.x + (dx / bounds.width) * 100,
        current.y + (dy / bounds.height) * 100,
      ),
    );
  }
  function pointerEnd() {
    if (drag.current?.moved) {
      suppressClick.current = true;
      onMoveEnd?.();
    }
    drag.current = null;
  }

  return (
    <div
      className={cn("room-artwork iso-artwork", className)}
      style={{ "--iso-accent": color } as CSSProperties}
    >
      <svg
        ref={svg}
        viewBox="0 0 900 650"
        className="iso-room-svg"
        aria-hidden={onSelect || onTaskClick ? undefined : true}
      >
        <defs>
          <radialGradient id={`${uid}-aura`}>
            <stop stopColor={color} stopOpacity={light ? ".23" : ".15"} />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={floor} />
            <stop offset="1" stopColor={light ? "#5f6a7b" : "#171e2c"} />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <path d="m450 205 355 176L450 564 95 381Z" />
          </clipPath>
        </defs>
        <ellipse
          cx="450"
          cy="416"
          rx="427"
          ry="207"
          fill={`url(#${uid}-aura)`}
        />
        <path d="m95 381 355 183v14L95 395Z" fill="#131b27" />
        <path d="m450 564 355-183v14L450 578Z" fill="#1b2636" />
        <path
          d="m450 205 355 176L450 564 95 381Z"
          fill={`url(#${uid}-floor)`}
          stroke={color}
          strokeOpacity=".45"
          strokeWidth="1.5"
        />
        <g
          clipPath={`url(#${uid}-clip)`}
          stroke={color}
          strokeWidth=".7"
          opacity={room.floorStyle === "plain" ? ".035" : ".13"}
        >
          {Array.from({ length: 19 }, (_, i) => (
            <path key={`a${i}`} d={`M${-300 + i * 65} 195l800 410`} />
          ))}
          {room.floorStyle !== "wood" &&
            Array.from({ length: 19 }, (_, i) => (
              <path key={`b${i}`} d={`M${180 + i * 65} 185l-800 413`} />
            ))}
        </g>
        <path
          d="m95 381 355 183 355-183"
          stroke={color}
          strokeWidth="2.5"
          opacity=".65"
          fill="none"
        />
        <path
          d="m125 396 326 167 324-166"
          stroke={color}
          strokeWidth="8"
          opacity=".055"
          fill="none"
        />
        <path d="m450 541 30-15 29 15-29 16Z" fill={color} opacity=".13" />
        {furniture.map(({ object, instance, task }) => {
          const isSelected =
            selected?.id === object.id && selected.kind === object.kind;
          const interactive =
            editing || (object.kind === "station" && !!onTaskClick);
          const point =
            object.kind === "asset"
              ? floorPoint(instance.x, instance.y)
              : instance;
          return (
            <g
              key={object.id}
              transform={`translate(${point.x * 9} ${point.y * 6.5}) rotate(${instance.rotation}) scale(${instance.scale})`}
              className={cn(
                "iso-object",
                editing && "iso-draggable",
                isSelected && "iso-object-selected",
              )}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={
                object.kind === "station"
                  ? `${editing ? "جابه‌جایی" : "بازکردن"} ${"name" in instance ? instance.name : "میز"}${task ? `، ${task.title}` : "، بدون کار"}`
                  : `جابه‌جایی ${officeAssets.find((a) => a.id === ("assetId" in instance ? instance.assetId : ""))?.name}`
              }
              onPointerDown={(event) =>
                pointerDown(event, object, point.x, point.y)
              }
              onPointerMove={pointerMove}
              onPointerUp={pointerEnd}
              onPointerCancel={pointerEnd}
              onClick={() => {
                if (suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                if (editing) onSelect?.(object);
                else if (task) onTaskClick?.(task);
                else if (object.kind === "station") onEmptyStation?.();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (editing) onSelect?.(object);
                  else if (task) onTaskClick?.(task);
                  else onEmptyStation?.();
                }
                if (
                  editing &&
                  ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
                    event.key,
                  )
                ) {
                  event.preventDefault();
                  onSelect?.(object);
                  onMove?.(
                    object,
                    floorPoint(
                      point.x +
                        (event.key === "ArrowLeft"
                          ? -1
                          : event.key === "ArrowRight"
                            ? 1
                            : 0),
                      point.y +
                        (event.key === "ArrowUp"
                          ? -1
                          : event.key === "ArrowDown"
                            ? 1
                            : 0),
                    ),
                  );
                  onMoveEnd?.();
                }
              }}
            >
              {isSelected && (
                <ellipse
                  cx="0"
                  cy="2"
                  rx={object.kind === "station" ? 111 : 40}
                  ry={object.kind === "station" ? 42 : 16}
                  fill={color}
                  fillOpacity=".1"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              )}
              {object.kind === "station" ? (
                <Workstation
                  color={color}
                  areaId={area.id}
                  desk={desk}
                  dual={dual}
                  running={!!task && task.id === activeTaskId && !paused}
                  paused={!!task && task.id === activeTaskId && paused}
                />
              ) : (
                <Decoration
                  color={color}
                  assetId={"assetId" in instance ? instance.assetId : "plant"}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
