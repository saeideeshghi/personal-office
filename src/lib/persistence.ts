import { createJSONStorage, type StateStorage } from "zustand/middleware";

/** Replace this adapter to change storage; presentation never touches localStorage. */
export const localPersistence: StateStorage = {
  getItem: (name) =>
    typeof window === "undefined" ? null : window.localStorage.getItem(name),
  setItem: (name, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(name);
  },
};

export function persistenceOptions<T>(name: string) {
  return {
    name: `personal-office:${name}`,
    version: 1,
    storage: createJSONStorage<T>(() => localPersistence),
    skipHydration: true,
  };
}
