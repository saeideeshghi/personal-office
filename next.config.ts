import type { NextConfig } from "next";
import { version } from "./package.json";

const staticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["terminal.local"],
  env: { NEXT_PUBLIC_APP_VERSION: version },
  output: staticExport ? "export" : undefined,
  basePath,
  trailingSlash: staticExport,
  images: { unoptimized: staticExport },
};

export default config;
