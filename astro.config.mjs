import { defineConfig } from "astro/config";

const raw = process.env.BASE_PATH ?? "/";
const base = raw === "/" ? "/" : `/${raw.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  output: "static",
  outDir: "dist",
  base,
  trailingSlash: "always",
});
