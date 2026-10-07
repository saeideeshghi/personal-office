import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);
const args = process.argv.slice(2);
const index = args.indexOf("--base-path");
if (index !== -1 && args[index + 1] === undefined) {
  throw new Error(
    "--base-path requires a value. Use / for a root-domain site.",
  );
}
const repository = process.env.GITHUB_REPOSITORY;
const [owner, repo] = repository?.split("/") ?? ["", pkg.name];
const defaultPath =
  owner && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? ""
    : `/${repo}`;
const input =
  index !== -1 ? args[index + 1] : (process.env.PAGES_BASE_PATH ?? defaultPath);
const basePath = input === "/" ? "" : input.replace(/\/$/, "");
if (basePath && !/^\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)*$/.test(basePath)) {
  throw new Error("Invalid base path; use /repository-name or /.");
}
if (basePath.split("/").some((part) => part === "." || part === "..")) {
  throw new Error("Base path cannot contain relative segments.");
}

console.log(`Building GitHub Pages at ${basePath || "/"} (v${pkg.version})`);
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "build"],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_STATIC_EXPORT: "true",
      NEXT_PUBLIC_BASE_PATH: basePath,
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
const code = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("exit", (exitCode) => resolve(exitCode ?? 1));
});
if (code !== 0) process.exit(code);

let commit = process.env.GITHUB_SHA ?? null;
if (!commit) {
  try {
    commit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    // A downloaded source ZIP has no Git history yet.
  }
}
writeFileSync(new URL("../out/.nojekyll", import.meta.url), "");
writeFileSync(
  new URL("../out/version.json", import.meta.url),
  JSON.stringify(
    {
      version: pkg.version,
      commit,
      builtAt: new Date().toISOString(),
      basePath,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Static site ready in out/. Preview it with npm run preview:pages.",
);
