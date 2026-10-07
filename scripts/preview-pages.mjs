import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
let metadata;
try {
  metadata = JSON.parse(await readFile(resolve(root, "version.json"), "utf8"));
} catch {
  console.error("Build the static site first: npm run build:pages");
  process.exit(1);
}
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(
  portIndex === -1 ? (process.env.PORT ?? 4173) : args[portIndex + 1],
);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid port.");
}
const basePath = metadata.basePath;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  try {
    const url = new URL(req.url, "http://localhost");
    if ((basePath && url.pathname === "/") || url.pathname === basePath) {
      res.writeHead(308, { Location: `${basePath}/${url.search}` });
      res.end();
      return;
    }
    let pathname = decodeURIComponent(url.pathname);
    if (basePath && !pathname.startsWith(`${basePath}/`)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    pathname = pathname.slice(basePath.length);
    let path = resolve(root, `.${pathname}`);
    if (path !== root.slice(0, -1) && !path.startsWith(root)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    try {
      if ((await stat(path)).isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          res.writeHead(308, { Location: `${url.pathname}/${url.search}` });
          res.end();
          return;
        }
        path = resolve(path, "index.html");
      }
      const body = await readFile(path);
      res.writeHead(200, {
        "Content-Type":
          contentTypes[extname(path)] ?? "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      const body = await readFile(resolve(root, "404.html"));
      res.writeHead(404, { "Content-Type": contentTypes[".html"] });
      res.end(req.method === "HEAD" ? undefined : body);
    }
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(
    `Static preview: http://localhost:${port}${basePath}/ (v${metadata.version})`,
  );
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
