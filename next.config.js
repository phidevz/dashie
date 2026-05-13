// noinspection ES6PreferShortImport
import { env } from "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["node_modules/lucide-react/dist/esm/**"],
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins:
    env.NODE_ENV !== "production" && env.ALLOWED_DEV_ORIGINS !== undefined
      ? env.ALLOWED_DEV_ORIGINS.split(",")
      : undefined,
};

export default config;
