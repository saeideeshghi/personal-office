import type {
  OfficeAsset,
  OfficeConfig,
  OfficeRoomConfig,
  RoomTemplate,
  ThemeId,
  WorkArea,
  RoomWidgetInstance,
} from "@/domain/types";
import { defaultStations } from "@/domain/room-layout";
import { publicAsset } from "@/lib/urls";

export const workAreas: WorkArea[] = [
  {
    id: "area-ai",
    name: "هوش مصنوعی",
    slug: "ai",
    icon: "BrainCircuit",
    color: "#8c72dc",
    description: "از ایده تا مدل؛ فضای تحقیق و آزمایش",
  },
  {
    id: "area-coding",
    name: "کدنویسی",
    slug: "coding",
    icon: "Code2",
    color: "#5f87d9",
    description: "بساز، تست کن و منتشر کن",
  },
  {
    id: "area-marketing",
    name: "مارکتینگ",
    slug: "marketing",
    icon: "Megaphone",
    color: "#e5a05b",
    description: "داستان‌ها، کمپین‌ها و رشد",
  },
  {
    id: "area-personal",
    name: "شخصی",
    slug: "personal",
    icon: "Coffee",
    color: "#62ab91",
    description: "فضایی برای یادگیری و زندگی",
  },
];

export const themes: {
  id: ThemeId;
  name: string;
  description: string;
  floor: string;
  wall: string;
  back: string;
  dot: string;
}[] = [
  {
    id: "modern",
    name: "مدرن",
    description: "روشن، منظم و آرام",
    floor: "#e5eaf4",
    wall: "#f7f9ff",
    back: "#f0f4fa",
    dot: "#6d8ecb",
  },
  {
    id: "dark-tech",
    name: "تکنولوژی",
    description: "شب‌های ساختن",
    floor: "#354055",
    wall: "#556078",
    back: "#e1e6ef",
    dot: "#263653",
  },
  {
    id: "cozy",
    name: "دنج",
    description: "چوب و نور گرم",
    floor: "#e6d3bd",
    wall: "#f7eee2",
    back: "#f4efe7",
    dot: "#c49565",
  },
  {
    id: "minimal",
    name: "مینیمال",
    description: "فقط چیزهای ضروری",
    floor: "#e4e5e6",
    wall: "#fafafa",
    back: "#f4f4f3",
    dot: "#c1c4c7",
  },
];

export const roomTemplates: { id: RoomTemplate; name: string }[] = [
  { id: "software", name: "توسعه نرم‌افزار" },
  { id: "research", name: "تحقیق هوش مصنوعی" },
  { id: "marketing", name: "استودیوی مارکتینگ" },
  { id: "personal", name: "فضای شخصی" },
  { id: "blank", name: "اتاق خالی" },
];

export const widgetCatalog = [
  { type: "current-task" as const, name: "کار فعلی" },
  { type: "tasks" as const, name: "لیست کارها" },
  { type: "focus" as const, name: "تایمر تمرکز" },
  { type: "progress" as const, name: "پیشرفت پروژه" },
];
export const defaultWidgets = (prefix: string): RoomWidgetInstance[] =>
  widgetCatalog.map((w) => ({
    id: `${prefix}-${w.type}`,
    type: w.type,
    enabled: true,
  }));

const asset = (
  id: string,
  type: OfficeAsset["type"],
  name: string,
  path: string,
  width: number,
  height: number,
): OfficeAsset => ({
  id,
  type,
  name,
  src: publicAsset(`/office/${path}.svg`),
  width,
  height,
  anchorX: 0.5,
  anchorY: 1,
  tags: [type],
});

export const officeAssets: OfficeAsset[] = [
  asset(
    "desk-minimal",
    "desk",
    "میز مینیمال",
    "furniture/desks/minimal",
    138,
    98,
  ),
  asset("desk-wood", "desk", "میز چوبی", "furniture/desks/wood", 138, 98),
  asset("desk-dark", "desk", "میز تیره", "furniture/desks/dark", 138, 98),
  asset(
    "monitor-single",
    "monitor",
    "مانیتور تکی",
    "furniture/monitors/single",
    68,
    63,
  ),
  asset(
    "monitor-dual",
    "monitor",
    "دو مانیتور",
    "furniture/monitors/dual",
    100,
    65,
  ),
  asset("chair-blue", "chair", "صندلی", "furniture/chairs/blue", 60, 72),
  asset("plant", "plant", "گیاه", "furniture/plants/plant", 50, 80),
  asset("lamp", "lamp", "چراغ مطالعه", "furniture/lamps/lamp", 50, 80),
  asset("books", "decoration", "کتاب‌ها", "decorations/books", 55, 62),
  asset("neon", "decoration", "تابلوی نئون", "decorations/neon", 68, 44),
];

export function roomAssets(
  prefix: string,
  desk = "desk-minimal",
  monitor = "monitor-dual",
  decor = "plant",
): OfficeRoomConfig["assets"] {
  return [
    {
      id: `${prefix}-desk`,
      assetId: desk,
      x: 51,
      y: 80,
      scale: 1,
      rotation: 0,
      zIndex: 2,
    },
    {
      id: `${prefix}-monitor`,
      assetId: monitor,
      x: 50,
      y: 57,
      scale: 0.9,
      rotation: 0,
      zIndex: 3,
    },
    {
      id: `${prefix}-chair`,
      assetId: "chair-blue",
      x: 54,
      y: 98,
      scale: 0.85,
      rotation: 0,
      zIndex: 4,
    },
    {
      id: `${prefix}-decor`,
      assetId: decor,
      x: 79,
      y: 65,
      scale: 0.9,
      rotation: 0,
      zIndex: 2,
    },
    {
      id: `${prefix}-lamp`,
      assetId: "lamp",
      x: 22,
      y: 66,
      scale: 0.7,
      rotation: 0,
      zIndex: 2,
    },
  ];
}

export const layouts = {
  campus: [
    { x: 4, y: 5, width: 37, height: 42 },
    { x: 59, y: 5, width: 37, height: 42 },
    { x: 4, y: 53, width: 37, height: 42 },
    { x: 59, y: 53, width: 37, height: 42 },
  ],
  studio: [
    { x: 3, y: 15, width: 26, height: 39 },
    { x: 71, y: 15, width: 26, height: 39 },
    { x: 18, y: 55, width: 29, height: 40 },
    { x: 53, y: 55, width: 29, height: 40 },
  ],
};

export function defaultOffice(): OfficeConfig {
  return {
    id: "office-personal",
    themeId: "dark-tech",
    layoutId: "campus",
    rooms: workAreas.map((area, i) => ({
      id: `room-${area.slug}`,
      workAreaId: area.id,
      name: area.name,
      ...layouts.campus[i],
      themeId: i === 2 ? "cozy" : "dark-tech",
      floorStyle: i === 2 ? "wood" : "grid",
      lighting: "night",
      stations: defaultStations(area.slug),
      assets: roomAssets(
        area.slug,
        i === 2 ? "desk-wood" : "desk-minimal",
        i === 3 ? "monitor-single" : "monitor-dual",
        i === 0 ? "books" : "plant",
      ),
      widgets: defaultWidgets(area.slug),
    })),
  };
}
