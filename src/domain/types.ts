export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";
export type ProjectStatus = "planning" | "active" | "paused" | "completed";
export type ThemeId = "modern" | "dark-tech" | "cozy" | "minimal";
export type WidgetType = "current-task" | "tasks" | "focus" | "progress";
export type RoomTemplate =
  "software" | "research" | "marketing" | "personal" | "blank";

export type WorkArea = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
};

export type RoomWidgetInstance = {
  id: string;
  type: WidgetType;
  enabled: boolean;
};

export type ProjectRoomConfig = {
  themeId: ThemeId;
  templateId: RoomTemplate;
  decorations: string[];
  widgets: RoomWidgetInstance[];
};

export type ProjectPhase = { id: string; name: string; completed: boolean };

export type Project = {
  id: string;
  name: string;
  description?: string;
  workAreaId: string;
  status: ProjectStatus;
  /** A backend-compatible field; UI progress is always derived from tasks. */
  progress: number;
  createdAt: string;
  dueDate?: string;
  roomConfig?: ProjectRoomConfig;
  phases: ProjectPhase[];
  notes: string;
  visibility: "private" | "workspace" | "public";
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  workAreaId: string;
  status: TaskStatus;
  priority: Priority;
  estimatedMinutes?: number;
  plannedDate?: string;
  plannedTime?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
};

export type FocusSegment = { startedAt: string; endedAt: string };

export type FocusSession = {
  id: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  workAreaId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  segments: FocusSegment[];
};

export type ActiveFocus = {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId?: string;
  workAreaId: string;
  startedAt: string;
  status: "running" | "paused";
  pausedAt: string | null;
  pausedDurationMs: number;
  runningSince: string | null;
  segments: FocusSegment[];
  goalMinutes: number;
};

export type ActivityType =
  | "task_created"
  | "task_started"
  | "task_completed"
  | "task_updated"
  | "task_deleted"
  | "task_reopened"
  | "focus_started"
  | "focus_paused"
  | "focus_resumed"
  | "focus_finished"
  | "focus_cancelled"
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "office_updated";

export type Activity = {
  id: string;
  type: ActivityType;
  entityId?: string;
  projectId?: string;
  message: string;
  createdAt: string;
};

export type OfficeAsset = {
  id: string;
  type:
    | "desk"
    | "chair"
    | "monitor"
    | "plant"
    | "lamp"
    | "decoration"
    | "wall"
    | "floor";
  name: string;
  src: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  tags: string[];
};

export type RoomAssetInstance = {
  id: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
};

/** Coordinates are percentages of the isometric room canvas, not the viewport. */
export type RoomWorkstation = {
  id: string;
  name: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  /** An omitted assignment follows the room's task queue. */
  taskId?: string;
};

export type OfficeRoomConfig = {
  id: string;
  workAreaId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  themeId: ThemeId;
  assets: RoomAssetInstance[];
  widgets: RoomWidgetInstance[];
  floorStyle?: "grid" | "wood" | "plain";
  lighting?: "night" | "day";
  stations?: RoomWorkstation[];
};

export type OfficeConfig = {
  id: string;
  themeId: ThemeId;
  layoutId: "campus" | "studio";
  rooms: OfficeRoomConfig[];
  selectedRoomId?: string;
};

export type Settings = {
  userName: string;
  language: "fa";
  weekStartsOn: 6 | 1;
  timeFormat: "24" | "12";
  focusMinutes: number;
  breakMinutes: number;
  dailyGoalMinutes: number;
};
