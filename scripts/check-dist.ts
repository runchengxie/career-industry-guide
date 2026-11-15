import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadDataset } from "../src/lib/load.ts";

const data = loadDataset();
const rawBase = process.env.BASE_PATH ?? "/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;

const required = [
  "dist/index.html",
  "dist/data/index.html",
  "dist/data/metrics.csv",
  "dist/data/roles.csv",
  "dist/methods/index.html",
  "dist/404.html",
  "dist/favicon.svg",
  ...data.industries.map((industry) => `dist/industries/${industry.slug}/index.html`),
  ...data.roles.map((role) => `dist/roles/${role.slug}/index.html`),
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error(missing.join("\n"));
  process.exit(1);
}

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...walk(path));
    else if (path.endsWith(".html")) found.push(path);
  }
  return found;
}

function hrefToFile(href: string): string | null {
  if (!href.startsWith(base) || href.startsWith("//")) return null;
  const relative = href.slice(base.length).split(/[?#]/)[0] ?? "";
  if (relative === "" || relative.endsWith("/")) return join("dist", relative, "index.html");
  return join("dist", relative);
}

const home = readFileSync("dist/index.html", "utf8");
const phrases = [
  "不是最佳行业名单",
  "不是就业保证",
  "现为公开的初步研究版本",
  "尚未完整",
  "当前方向在已录入的三个样本中没有匹配岗位",
  "广告营销服务",
  "养老服务",
  "国内旅游服务",
  "暂无可靠数据",
  "不计算床位使用率",
  "不是可比序列",
];
for (const phrase of phrases) {
  if (!home.includes(phrase)) {
    console.error(`首页缺少：${phrase}`);
    process.exit(1);
  }
}
for (const banned of ["45.4%", "约下降6.4%", "综合评分：", "推荐指数：", "已完成活页核验"]) {
  if (home.includes(banned)) {
    console.error(`首页含有不应出现的内容：${banned}`);
    process.exit(1);
  }
}
const sitemapIndex = "dist/sitemap-index.xml";
if (!existsSync(sitemapIndex)) {
  console.error("缺少 sitemap-index.xml");
  process.exit(1);
}
if (!existsSync("dist/robots.txt")) {
  console.error("缺少 robots.txt");
  process.exit(1);
}
for (const page of required.filter((file) => file.endsWith("index.html"))) {
  const route = `${base}${page.replace(/^dist\//, "").replace(/index\.html$/, "")}`;
  const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
  if (!sitemap.includes(route)) console.error(`sitemap 缺少 ${route}`);
}

if (base !== "/" && !home.includes(`href="${base}"`)) {
  console.error(`首页链接没有使用前缀 ${base}`);
  process.exit(1);
}

const pages = walk("dist");
const broken: string[] = [];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  if (html.includes("45.4%") || html.includes("约下降6.4%")) {
    broken.push(`${page} 含有已删除的比率`);
  }
  const hrefs = html.match(/(?:href|src)="([^"]+)"/g) ?? [];
  for (const raw of hrefs) {
    const href = raw.replace(/^(?:href|src)="/, "").replace(/"$/, "");
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const file = hrefToFile(href);
    if (!file) {
      broken.push(`${page} -> ${href} 没有使用站点前缀`);
      continue;
    }
    if (!existsSync(file)) broken.push(`${page} -> ${href}`);
  }
  // 页内锚点（目录、脚注）必须能落到本页的 id
  for (const raw of hrefs) {
    const href = raw.replace(/^(?:href|src)="/, "").replace(/"$/, "");
    if (!href.startsWith("#") || href === "#") continue;
    if (!html.includes(`id="${href.slice(1)}"`)) broken.push(`${page} -> ${href} 没有对应的锚点`);
  }
}
if (broken.length > 0) {
  console.error(broken.join("\n"));
  process.exit(1);
}

const notFound = readFileSync("dist/404.html", "utf8");
if (!notFound.includes("methods/") || !notFound.includes("没有找到这个页面")) {
  console.error("404 没有链回来源与方法或缺少说明");
  process.exit(1);
}

for (const role of data.roles) {
  const html = readFileSync(`dist/roles/${role.slug}/index.html`, "utf8");
  if (!html.includes(`/industries/`)) {
    console.error(`${role.slug} 没有链回行业`);
    process.exit(1);
  }
  if (!html.includes("仅见招聘或年报材料") && !html.includes("尚未核验")) {
    console.error(`${role.slug} 没有标明未完成的核验状态`);
    process.exit(1);
  }
}

console.log(`dist ok: ${required.length} 个必需文件，${pages.length} 个 HTML，base ${base}`);
