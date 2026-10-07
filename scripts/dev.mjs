import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// Accommodates preview supervisors that append Vite-style flags to dev scripts.
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.lastIndexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const child = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    "dev",
    "--hostname",
    value("--host", "0.0.0.0"),
    "--port",
    value("--port", "4173"),
  ],
  { stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" } },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
