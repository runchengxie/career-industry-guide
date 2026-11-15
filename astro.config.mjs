import { defineConfig } from "astro/config";

const rawBase = process.env.BASE_PATH ?? "/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  output: "static",
  base,
  trailingSlash: "always",
  ...(process.env.SITE ? { site: process.env.SITE } : {}),
  build: {
    format: "directory",
  },
});
