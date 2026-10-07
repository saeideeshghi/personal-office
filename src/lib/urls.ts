/** Public files need the prefix explicitly; Next Link/router add it themselves. */
export function publicAsset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

/** One exported HTML page can display any locally created project after refresh. */
export function projectHref(projectId: string) {
  return `/projects/detail?projectId=${encodeURIComponent(projectId)}`;
}
