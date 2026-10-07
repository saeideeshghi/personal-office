"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Palette,
  LayoutGrid,
  DoorOpen,
  Armchair,
  Flower2,
  PanelsTopLeft,
  Check,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import {
  PageHeader,
  SectionCard,
  AreaIcon,
  ConfirmDialog,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { OfficeScene } from "@/components/office/office-scene";
import { useOfficeStore } from "@/stores/office-store";
import {
  themes,
  officeAssets,
  widgetCatalog,
  defaultOffice,
} from "@/data/catalog";
import { recordOfficeChange } from "@/lib/commands";
import { useNotice } from "@/components/app-shell/providers";
import type { OfficeRoomConfig, ThemeId } from "@/domain/types";

const categories = [
  { id: "theme", name: "تم", icon: Palette },
  { id: "layout", name: "چیدمان", icon: LayoutGrid },
  { id: "room", name: "اتاق‌ها", icon: DoorOpen },
  { id: "furniture", name: "مبلمان", icon: Armchair },
  { id: "decor", name: "دکور", icon: Flower2 },
  { id: "widgets", name: "ویجت‌ها", icon: PanelsTopLeft },
];

export function CustomizePage() {
  const config = useOfficeStore((s) => s.config);
  const update = useOfficeStore((s) => s.update);
  const updateRoom = useOfficeStore((s) => s.updateRoom);
  const setLayout = useOfficeStore((s) => s.setLayout);
  const [category, setCategory] = useState("theme");
  const [selected, setSelected] = useState(
    config.selectedRoomId ?? config.rooms[0].id,
  );
  const [reset, setReset] = useState(false);
  const [all, setAll] = useState(false);
  const notify = useNotice();
  const room = config.rooms.find((r) => r.id === selected) ?? config.rooms[0];
  function changeRoom(patch: Partial<OfficeRoomConfig>) {
    if (all)
      update({
        rooms: config.rooms.map((r) => ({
          ...r,
          ...patch,
          assets: patch.assets
            ? patch.assets.map((a) => ({ ...a, id: `${r.id}-${a.assetId}` }))
            : r.assets,
          widgets: patch.widgets
            ? patch.widgets.map((w) => ({ ...w, id: `${r.id}-${w.type}` }))
            : r.widgets,
        })),
      });
    else updateRoom(room.id, patch);
    recordOfficeChange();
  }
  function furniture(type: "desk" | "monitor" | "decoration", assetId: string) {
    const affected = all ? config.rooms : [room];
    update({
      rooms: config.rooms.map((r) =>
        affected.some((a) => a.id === r.id)
          ? {
              ...r,
              assets: r.assets.map((a) => {
                const asset = officeAssets.find((def) => def.id === a.assetId);
                const match =
                  type === "decoration"
                    ? ["plant", "books", "neon"].includes(a.assetId)
                    : asset?.type === type;
                return match ? { ...a, assetId } : a;
              }),
            }
          : r,
      ),
    });
    recordOfficeChange();
  }
  const activeAsset = (type: string) =>
    room.assets.find((a) =>
      type === "decoration"
        ? ["plant", "books", "neon"].includes(a.assetId)
        : officeAssets.find((def) => def.id === a.assetId)?.type === type,
    )?.assetId;
  return (
    <>
      <PageHeader
        eyebrow="دفترت، به سبک خودت"
        title="برای ایده‌هایت فضا بساز."
        subtitle="حال‌وهوا، اتاق‌ها و ابزارها را تغییر بده؛ نتیجه را همین لحظه ببین."
      >
        <Button variant="outline" onClick={() => setReset(true)}>
          <RotateCcw size={15} />
          چیدمان اولیه
        </Button>
        <span className="saved-badge">
          <Check size={14} />
          ذخیره خودکار
        </span>
      </PageHeader>
      <div className="customize-layout">
        <aside className="customize-panel">
          <div className="customize-categories">
            {categories.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={category === id ? "selected" : ""}
              >
                <Icon size={18} />
                {name}
              </button>
            ))}
          </div>
          <div className="customize-controls">
            {category === "theme" && (
              <>
                <h2>حال‌وهوای دفتر</h2>
                <p>فضایی انتخاب کن که تمرکز در آن راحت‌تر است.</p>
                <div className="theme-options">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-option ${config.themeId === theme.id ? "selected" : ""}`}
                      onClick={() => {
                        update({
                          themeId: theme.id,
                          rooms: config.rooms.map((r) => ({
                            ...r,
                            themeId: theme.id,
                          })),
                        });
                        recordOfficeChange();
                      }}
                    >
                      <span
                        className="theme-swatch"
                        style={{ background: theme.back }}
                      >
                        <span style={{ background: theme.wall }} />
                        <span style={{ background: theme.floor }} />
                        <i style={{ background: theme.dot }} />
                        {config.themeId === theme.id && (
                          <b>
                            <Check size={12} />
                          </b>
                        )}
                      </span>
                      <strong>{theme.name}</strong>
                      <small>{theme.description}</small>
                    </button>
                  ))}
                </div>
              </>
            )}
            {category === "layout" && (
              <>
                <h2>چیدمان دفتر</h2>
                <p>همان اتاق‌ها، با دو شیوه کنار هم بودن.</p>
                <div className="layout-options">
                  {[
                    {
                      id: "campus" as const,
                      name: "چهار اتاق مستقل",
                      description: "متوازن، با میز مرکزی",
                    },
                    {
                      id: "studio" as const,
                      name: "استودیوی باز",
                      description: "فضای باز برای جریان ایده‌ها",
                    },
                  ].map((l) => (
                    <button
                      key={l.id}
                      className={config.layoutId === l.id ? "selected" : ""}
                      onClick={() => {
                        setLayout(l.id);
                        recordOfficeChange();
                      }}
                    >
                      <div className={`layout-mini layout-mini-${l.id}`}>
                        <i />
                        <i />
                        <i />
                        <i />
                        <b />
                      </div>
                      <strong>{l.name}</strong>
                      <small>{l.description}</small>
                      {config.layoutId === l.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </>
            )}
            {["room", "furniture", "decor", "widgets"].includes(category) && (
              <>
                <h2>{categories.find((c) => c.id === category)?.name}</h2>
                <p>تغییرها روی اتاق انتخاب‌شده اعمال می‌شوند.</p>
                <div className="field">
                  <label htmlFor="selected-room">اتاق انتخاب‌شده</label>
                  <select
                    id="selected-room"
                    value={room.id}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      update({ selectedRoomId: e.target.value });
                    }}
                  >
                    {config.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="checkbox-label apply-all">
                  <input
                    type="checkbox"
                    checked={all}
                    onChange={(e) => setAll(e.target.checked)}
                  />
                  اعمال برای همه اتاق‌ها
                </label>
              </>
            )}
            {category === "room" && (
              <>
                <div className="field">
                  <label htmlFor="room-name">نام اتاق</label>
                  <input
                    id="room-name"
                    maxLength={32}
                    value={room.name}
                    onChange={(e) =>
                      updateRoom(room.id, { name: e.target.value })
                    }
                    onBlur={recordOfficeChange}
                  />
                </div>
                <h3>تم اتاق</h3>
                <div className="room-theme-options">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      className={room.themeId === t.id ? "selected" : ""}
                      onClick={() => changeRoom({ themeId: t.id as ThemeId })}
                    >
                      <i style={{ background: t.dot }} />
                      {t.name}
                      {room.themeId === t.id && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </>
            )}
            {category === "furniture" && (
              <>
                {[
                  { type: "desk" as const, title: "میز کار" },
                  { type: "monitor" as const, title: "مانیتور" },
                ].map((group) => (
                  <div className="furniture-group" key={group.type}>
                    <h3>{group.title}</h3>
                    <div className="furniture-options">
                      {officeAssets
                        .filter((a) => a.type === group.type)
                        .map((asset) => (
                          <button
                            key={asset.id}
                            className={
                              activeAsset(group.type) === asset.id
                                ? "selected"
                                : ""
                            }
                            onClick={() => furniture(group.type, asset.id)}
                          >
                            <span className="furniture-thumbnail">
                              <Image
                                src={asset.src}
                                fill
                                sizes="79px"
                                alt=""
                                unoptimized
                              />
                            </span>
                            <span>{asset.name}</span>
                            {activeAsset(group.type) === asset.id && (
                              <Check size={13} />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </>
            )}
            {category === "decor" && (
              <>
                <h3>یک جزئیات کوچک، یک حس تازه</h3>
                <div className="furniture-options decor-options">
                  {officeAssets
                    .filter((a) => ["plant", "books", "neon"].includes(a.id))
                    .map((asset) => (
                      <button
                        key={asset.id}
                        className={
                          activeAsset("decoration") === asset.id
                            ? "selected"
                            : ""
                        }
                        onClick={() => furniture("decoration", asset.id)}
                      >
                        <span className="furniture-thumbnail">
                          <Image
                            src={asset.src}
                            fill
                            sizes="79px"
                            alt=""
                            unoptimized
                          />
                        </span>
                        <span>{asset.name}</span>
                        {activeAsset("decoration") === asset.id && (
                          <Check size={13} />
                        )}
                      </button>
                    ))}
                </div>
              </>
            )}
            {category === "widgets" && (
              <>
                <h3>اطلاعات داخل اتاق</h3>
                <p>این ویجت‌ها در فضای مستقل هر اتاق نمایش داده می‌شوند.</p>
                <div className="widget-toggles">
                  {widgetCatalog.map((w) => (
                    <label key={w.type}>
                      <span>{w.name}</span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={room.widgets.some(
                          (x) => x.type === w.type && x.enabled,
                        )}
                        onChange={() =>
                          changeRoom({
                            widgets: room.widgets.map((widget) =>
                              widget.type === w.type
                                ? { ...widget, enabled: !widget.enabled }
                                : widget,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="customize-save-note">
              <Save size={15} />
              <span>تغییرها در همین مرورگر ذخیره می‌شوند.</span>
            </div>
          </div>
        </aside>
        <div className="customize-preview">
          <SectionCard
            title="پیش‌نمایش زنده دفتر"
            subtitle="برای انتخاب اتاق، روی آن کلیک کن"
            action={
              <span className="quiet-badge">
                <Sparkles size={13} />
                زنده
              </span>
            }
          >
            <OfficeScene
              config={config}
              preview
              onRoomClick={(id) => {
                setSelected(id);
                update({ selectedRoomId: id });
                setCategory("room");
              }}
            />
          </SectionCard>
          <div className="selected-room-strip">
            <AreaIcon areaId={room.workAreaId} />
            <div>
              <strong>{room.name}</strong>
              <p>
                اتاق انتخاب‌شده ·{" "}
                {themes.find((t) => t.id === room.themeId)?.name}
              </p>
            </div>
            <span className="saved-badge">
              <Check size={13} />
              ذخیره شده
            </span>
          </div>
          <Button asChild>
            <Link href={`/office/${room.id}?tab=customize`}>
              <Armchair size={17} />
              ورود به کاستومایزر کامل این اتاق
            </Link>
          </Button>
          <div className="customize-tip">
            <Sparkles size={20} />
            <div>
              <strong>فضا روی کار تو اثر دارد.</strong>
              <p>
                یک دفتر ساده با ابزارهای درست، جای خوبی برای شروع است. هر وقت
                خواستی تغییرش بده.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={reset}
        onOpenChange={setReset}
        danger={false}
        title="چیدمان اولیه برگردد؟"
        description="فقط ظاهر دفتر بازنشانی می‌شود؛ پروژه‌ها و کارها حفظ می‌شوند."
        label="بازنشانی ظاهر"
        onConfirm={() => {
          update(defaultOffice());
          recordOfficeChange();
          notify("ظاهر دفتر به حالت اولیه برگشت");
        }}
      />
    </>
  );
}
