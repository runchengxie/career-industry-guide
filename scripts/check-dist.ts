import { readFileSync, existsSync } from "node:fs";
import { loadDataset } from "../src/lib/load.ts";

const data = loadDataset();
const required = [
  "dist/index.html",
  "dist/methods/index.html",
  "dist/404.html",
  ...data.industries.map((industry) => `dist/industries/${industry.slug}/index.html`),
  ...data.roles.map((role) => `dist/roles/${role.slug}/index.html`),
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error(missing.join("\n"));
  process.exit(1);
}

const home = readFileSync("dist/index.html", "utf8");
const phrases = [
  "不是最佳行业名单",
  "不是就业保证",
  "尚未正式上线",
  "尚未完整",
  "当前方向在已录入的三个样本中没有匹配岗位",
  "广告营销服务",
  "养老服务",
  "国内旅游服务",
  "暂无可靠数据",
];
for (const phrase of phrases) {
  if (!home.includes(phrase)) {
    console.error(`首页缺少：${phrase}`);
    process.exit(1);
  }
}
if (home.includes("综合评分：") || home.includes("推荐指数：")) {
  console.error("首页出现了评分或推荐指数");
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
  if (role.verification === "verified") {
    console.error(`${role.slug} 不应标成已完成活页核验`);
    process.exit(1);
  }
}

console.log(`dist ok: ${required.length} pages`);
