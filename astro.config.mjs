import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const rawBase = process.env.BASE_PATH ?? "/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  output: "static",
  base,
  trailingSlash: "always",
  // 站点地址用于 canonical、OG 与 sitemap；本地构建也指向线上地址
  site: process.env.SITE ?? "https://runchengxie.github.io",
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
});
