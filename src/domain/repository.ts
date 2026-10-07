import type {
  Task,
  Project,
  FocusSession,
  Activity,
  OfficeConfig,
} from "./types";

/** Future remote adapters hydrate the same stores; commands own business rules. */
export interface WorkspaceRepository {
  load(): Promise<{
    tasks: Task[];
    projects: Project[];
    sessions: FocusSession[];
    activities: Activity[];
    office: OfficeConfig;
  }>;
  saveTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  saveFocusSession(session: FocusSession): Promise<void>;
  saveOffice(config: OfficeConfig): Promise<void>;
}
