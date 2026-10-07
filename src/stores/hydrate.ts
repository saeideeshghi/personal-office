import { useTaskStore } from "./task-store";
import { useProjectStore } from "./project-store";
import { useFocusStore } from "./focus-store";
import { useOfficeStore } from "./office-store";
import { useActivityStore } from "./activity-store";
import { useSettingsStore } from "./settings-store";
import { localPersistence } from "@/lib/persistence";
import type { StoreApi } from "zustand";

async function hydrate<T>(
  store: StoreApi<T> & {
    persist: {
      getOptions: () => { name?: string };
      rehydrate: () => void | Promise<void>;
    };
  },
) {
  const name = store.persist.getOptions().name;
  if (!name) throw new Error("Persistence key is required");
  const exists = await localPersistence.getItem(name);
  await store.persist.rehydrate();
  // Establish first-launch seed immediately, even before the first action.
  if (!exists) store.setState({} as Partial<T>);
}

export async function hydrateStores() {
  await hydrate(useTaskStore);
  await hydrate(useProjectStore);
  await hydrate(useFocusStore);
  await hydrate(useOfficeStore);
  await hydrate(useActivityStore);
  await hydrate(useSettingsStore);
}
