import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    db(),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  adapter: node({
    mode: "standalone",
  }),
});