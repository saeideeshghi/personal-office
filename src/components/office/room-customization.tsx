"use client";

import { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Move,
  Monitor,
  Armchair,
  Leaf,
  Lightbulb,
  BookOpen,
  Code2,
} from "lucide-react";
import {
  officeAssets,
  themes,
  widgetCatalog,
  defaultOffice,
} from "@/data/catalog";
import { roomStations, floorPoint } from "@/domain/room-layout";
import type {
  OfficeRoomConfig,
  RoomAssetInstance,
  RoomWorkstation,
  Task,
} from "@/domain/types";
import { useOfficeStore } from "@/stores/office-store";
import { recordOfficeChange } from "@/lib/commands";
import { newId } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import type { RoomObject } from "./isometric-artwork";

export function RoomCustomization({
  room,
  tasks,
  selected,
  onSelect,
}: {
  room: OfficeRoomConfig;
  tasks: Task[];
  selected?: RoomObject;
  onSelect: (object?: RoomObject) => void;
}) {
  const updateRoom = useOfficeStore((s) => s.updateRoom);
  const [reset, setReset] = useState(false);
  const stations = roomStations(room);
  const instance =
    selected?.kind === "station"
      ? stations.find((s) => s.id === selected.id)
      : room.assets.find((a) => a.id === selected?.id);
  const decorations = room.assets.filter((a) =>
    ["plant", "lamp", "books", "neon"].includes(a.assetId),
  );
  const roomTasks = tasks.filter((task) => task.workAreaId === room.workAreaId);
  function patch(p: Partial<OfficeRoomConfig>, log = true) {
    updateRoom(room.id, p);
    if (log) recordOfficeChange();
  }
  function changeObject(
    p: Partial<RoomAssetInstance & RoomWorkstation>,
    log = true,
  ) {
    if (!selected) return;
    if (selected.kind === "station")
      patch(
        {
          stations: stations.map((s) =>
            s.id === selected.id ? { ...s, ...p } : s,
          ),
        },
        log,
      );
    else
      patch(
        {
          assets: room.assets.map((a) =>
            a.id === selected.id ? { ...a, ...p } : a,
          ),
        },
        log,
      );
  }
  function setFurniture(type: "desk" | "monitor", assetId: string) {
    const has = room.assets.some(
      (a) => officeAssets.find((def) => def.id === a.assetId)?.type === type,
    );
    const assets = has
      ? room.assets.map((a) =>
          officeAssets.find((def) => def.id === a.assetId)?.type === type
            ? { ...a, assetId }
            : a,
        )
      : [
          ...room.assets,
          {
            id: newId(),
            assetId,
            x: 50,
            y: 60,
            scale: 1,
            rotation: 0,
            zIndex: 2,
          },
        ];
    patch({ assets });
  }
  return (
    <div className="room-custom-controls">
      <div className="room-edit-hint">
        <Move size={17} />
        <span>
          روی میز یا دکور کلیک کن و بکش. کلیدهای جهت هم آن را جابه‌جا می‌کنند.
        </span>
      </div>
      <div className="field">
        <label htmlFor="space-name">نام فضای کاری</label>
        <input
          id="space-name"
          maxLength={32}
          value={room.name}
          onChange={(e) => patch({ name: e.target.value }, false)}
          onBlur={() => {
            if (!room.name.trim()) patch({ name: "فضای کاری" });
            else recordOfficeChange();
          }}
        />
      </div>
      <h3>حال‌وهوای اتاق</h3>
      <div className="space-theme-grid">
        {themes.map((t) => (
          <button
            key={t.id}
            className={room.themeId === t.id ? "selected" : ""}
            onClick={() => patch({ themeId: t.id })}
            aria-pressed={room.themeId === t.id}
          >
            <i style={{ background: t.dot }} />
            {t.name}
            {room.themeId === t.id && <Check size={13} />}
          </button>
        ))}
      </div>
      <div className="space-two-fields">
        <div className="field">
          <label htmlFor="space-floor">کف اتاق</label>
          <select
            id="space-floor"
            value={room.floorStyle ?? "grid"}
            onChange={(e) =>
              patch({
                floorStyle: e.target.value as OfficeRoomConfig["floorStyle"],
              })
            }
          >
            <option value="grid">شبکه‌ای</option>
            <option value="wood">چوب</option>
            <option value="plain">ساده</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="space-light">نور محیط</label>
          <select
            id="space-light"
            value={room.lighting ?? "night"}
            onChange={(e) =>
              patch({
                lighting: e.target.value as OfficeRoomConfig["lighting"],
              })
            }
          >
            <option value="night">شب</option>
            <option value="day">روز</option>
          </select>
        </div>
      </div>
      <h3>میز و مانیتور</h3>
      {(["desk", "monitor"] as const).map((type) => (
        <div key={type} className="space-furniture-options">
          {officeAssets
            .filter((a) => a.type === type)
            .map((asset) => (
              <button
                key={asset.id}
                className={
                  room.assets.some((a) => a.assetId === asset.id)
                    ? "selected"
                    : ""
                }
                onClick={() => setFurniture(type, asset.id)}
                aria-pressed={room.assets.some((a) => a.assetId === asset.id)}
              >
                {type === "desk" ? (
                  <Armchair size={17} />
                ) : (
                  <Monitor size={17} />
                )}
                {asset.name}
              </button>
            ))}
        </div>
      ))}
      <div className="space-section-title">
        <h3>میزهای کار</h3>
        <button
          disabled={stations.length >= 5}
          onClick={() => {
            const id = newId();
            const point = floorPoint(39 + stations.length * 3, 65);
            patch({
              stations: [
                ...stations,
                {
                  id,
                  name: `میز ${stations.length + 1}`,
                  ...point,
                  scale: 0.8,
                  rotation: 0,
                },
              ],
            });
            onSelect({ kind: "station", id });
          }}
        >
          <Plus size={14} />
          افزودن میز
        </button>
      </div>
      <div className="space-object-list">
        {stations.map((s) => (
          <button
            key={s.id}
            className={selected?.id === s.id ? "selected" : ""}
            onClick={() => onSelect({ kind: "station", id: s.id })}
          >
            <Armchair size={15} />
            <span>{s.name}</span>
            <Move size={13} />
          </button>
        ))}
      </div>
      <h3>افزودن دکور</h3>
      <div className="space-decor-options">
        {[
          { id: "plant", label: "گیاه", icon: Leaf },
          { id: "lamp", label: "چراغ", icon: Lightbulb },
          { id: "books", label: "کتابخانه", icon: BookOpen },
          { id: "neon", label: "نئون", icon: Code2 },
        ].map(({ id: assetId, label, icon: Icon }) => (
          <button
            key={assetId}
            disabled={decorations.length >= 12}
            onClick={() => {
              const id = newId();
              const point = floorPoint(72 - decorations.length * 3, 66);
              patch({
                assets: [
                  ...room.assets,
                  { id, assetId, ...point, scale: 0.9, rotation: 0, zIndex: 2 },
                ],
              });
              onSelect({ kind: "asset", id });
            }}
          >
            <Icon size={18} />
            {label}
            <Plus size={12} />
          </button>
        ))}
      </div>
      {!!decorations.length && (
        <div className="space-object-list space-decor-list">
          {decorations.map((a, i) => (
            <button
              key={a.id}
              className={selected?.id === a.id ? "selected" : ""}
              onClick={() => onSelect({ kind: "asset", id: a.id })}
            >
              <span>
                {officeAssets.find((def) => def.id === a.assetId)?.name} {i + 1}
              </span>
              <Move size={13} />
            </button>
          ))}
        </div>
      )}
      {instance && selected && (
        <section
          className="object-inspector"
          aria-label="تنظیمات شیء انتخاب‌شده"
        >
          <h3>
            {"name" in instance
              ? instance.name
              : officeAssets.find((a) => a.id === instance.assetId)?.name}
          </h3>
          {selected.kind === "station" && "name" in instance && (
            <>
              <div className="field">
                <label htmlFor="station-name">نام میز</label>
                <input
                  id="station-name"
                  value={instance.name}
                  maxLength={24}
                  onChange={(e) =>
                    changeObject({ name: e.target.value }, false)
                  }
                  onBlur={recordOfficeChange}
                />
              </div>
              <div className="field">
                <label htmlFor="station-task">کار متصل به میز</label>
                <select
                  id="station-task"
                  value={instance.taskId ?? ""}
                  onChange={(e) => {
                    const taskId = e.target.value || undefined;
                    patch({
                      stations: stations.map((s) =>
                        s.id === instance.id
                          ? { ...s, taskId }
                          : taskId && s.taskId === taskId
                            ? { ...s, taskId: undefined }
                            : s,
                      ),
                    });
                  }}
                >
                  <option value="">خودکار از صف کارها</option>
                  {roomTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                      {t.status === "done" ? " (تکمیل‌شده)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="space-two-fields">
            {(["x", "y"] as const).map((axis) => (
              <div key={axis} className="field">
                <label htmlFor={`object-${axis}`}>
                  {axis === "x" ? "جای افقی" : "جای عمودی"}
                </label>
                <input
                  id={`object-${axis}`}
                  type="number"
                  min={axis === "x" ? 14 : 42}
                  max={axis === "x" ? 86 : 78}
                  step={1}
                  value={Math.round(instance[axis])}
                  onChange={(e) =>
                    changeObject(
                      floorPoint(
                        axis === "x" ? Number(e.target.value) : instance.x,
                        axis === "y" ? Number(e.target.value) : instance.y,
                      ),
                      false,
                    )
                  }
                  onBlur={recordOfficeChange}
                />
              </div>
            ))}
          </div>
          <div className="field">
            <label htmlFor="object-scale">
              اندازه <b dir="ltr">{Math.round(instance.scale * 100)}%</b>
            </label>
            <input
              id="object-scale"
              type="range"
              min={0.5}
              max={1.3}
              step={0.05}
              value={instance.scale}
              onChange={(e) =>
                changeObject({ scale: Number(e.target.value) }, false)
              }
              onPointerUp={recordOfficeChange}
              onKeyUp={recordOfficeChange}
            />
          </div>
          <div className="field">
            <label htmlFor="object-rotation">
              چرخش <b dir="ltr">{instance.rotation}°</b>
            </label>
            <input
              id="object-rotation"
              type="range"
              min={-30}
              max={30}
              step={5}
              value={instance.rotation}
              onChange={(e) =>
                changeObject({ rotation: Number(e.target.value) }, false)
              }
              onPointerUp={recordOfficeChange}
              onKeyUp={recordOfficeChange}
            />
          </div>
          <Button
            variant="danger"
            size="sm"
            disabled={selected.kind === "station" && stations.length <= 1}
            onClick={() => {
              if (selected.kind === "station")
                patch({
                  stations: stations.filter((s) => s.id !== selected.id),
                });
              else
                patch({
                  assets: room.assets.filter((a) => a.id !== selected.id),
                });
              onSelect(undefined);
            }}
          >
            <Trash2 size={14} />
            حذف از اتاق
          </Button>
        </section>
      )}
      <h3>نمایش اطلاعات</h3>
      <div className="space-widget-options">
        {widgetCatalog.map((w) => (
          <label key={w.type}>
            <span>{w.name}</span>
            <input
              type="checkbox"
              checked={room.widgets.some((i) => i.type === w.type && i.enabled)}
              onChange={() =>
                patch({
                  widgets: room.widgets.map((i) =>
                    i.type === w.type ? { ...i, enabled: !i.enabled } : i,
                  ),
                })
              }
            />
          </label>
        ))}
      </div>
      <Button
        variant="outline"
        className="space-reset"
        onClick={() => setReset(true)}
      >
        <RotateCcw size={14} />
        بازنشانی ظاهر این اتاق
      </Button>
      <ConfirmDialog
        open={reset}
        onOpenChange={setReset}
        title="ظاهر این اتاق بازنشانی شود؟"
        description="نام، مبلمان و تنظیمات ظاهر به مقدار اولیه برمی‌گردند. تسک‌ها و پروژه‌ها حفظ می‌شوند."
        label="بازنشانی اتاق"
        danger={false}
        onConfirm={() => {
          const original = defaultOffice().rooms.find(
            (r) => r.workAreaId === room.workAreaId,
          );
          if (original)
            patch({
              ...original,
              id: room.id,
              x: room.x,
              y: room.y,
              width: room.width,
              height: room.height,
            });
          onSelect(undefined);
        }}
      />
    </div>
  );
}
