import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const required = process.env.REQUIRE_DIST === "1";
const roleSlugs = [
  "client-execution",
  "strategy",
  "public-relations",
  "event-management",
  "brand-content",
  "social-work",
  "recreation",
  "house-butler",
  "eldercare-marketing",
  "destination-operations",
  "tourism-product",
  "scenic-marketing",
  "tourism-content",
];

describe("static build", () => {
  it("writes the agreed routes and keeps missing figures out of the numbers", () => {
    if (!required && !existsSync("dist/index.html")) return;

    const files = [
      "dist/index.html",
      "dist/industries/advertising/index.html",
      "dist/industries/elderly-care/index.html",
      "dist/industries/domestic-tourism/index.html",
      "dist/methods/index.html",
      "dist/404.html",
      ...roleSlugs.map((slug) => `dist/roles/${slug}/index.html`),
    ];
    for (const file of files) {
      expect(existsSync(file), file).toBe(true);
    }

    const home = readFileSync("dist/index.html", "utf8");
    expect(home).toContain("2026-11-15");
    expect(home).toContain("不是就业保证");
    expect(home).toContain("尚未正式上线");
    expect(home).toContain("活页核验尚未完整");
    expect(home).toContain("不是名次");
    expect(home).not.toContain("推荐指数");
    expect(home).not.toContain("综合评分");
    expect(home).toContain('href="/industries/advertising/"');
    expect(home).toContain('href="/roles/social-work/"');

    const elder = readFileSync("dist/industries/elderly-care/index.html", "utf8");
    expect(elder).toContain("暂无可靠数据");
    expect(elder).toContain("相邻而非对口");
    expect(elder).toContain("尚未核实");
    expect(elder).not.toContain("45.4");
    expect(elder).toContain('href="/roles/social-work/"');

    const social = readFileSync("dist/roles/social-work/index.html", "utf8");
    expect(social).toContain("仅见招聘或年报材料");
    expect(social).toContain("不是已完成活页核验");
    expect(social).toContain("career.nankai.edu.cn");
    expect(social).toContain('href="/industries/elderly-care/"');

    const missing = readFileSync("dist/404.html", "utf8");
    expect(missing).toContain('href="/"');
    expect(missing).toContain('href="/methods/"');
  });
});
