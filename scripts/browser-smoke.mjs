/**
 * 浏览器冒烟测试：在真实的 Chrome 里跑一遍页面的关键交互与布局。
 * 需要先起一个预览服务，默认 http://127.0.0.1:4321。
 *
 *   npm run build && npm run preview
 *   npm run check:browser
 *
 * 可用环境变量：
 *   PREVIEW_URL  预览地址，默认 http://127.0.0.1:4321
 *   CHROME_PATH  Chrome 可执行文件，默认 /usr/bin/google-chrome
 *   SMOKE_OUT    截图目录，默认用系统临时目录
 *
 * 这一项不进 CI：它依赖本机的 Chrome，也不该在每次 PR 上花几十秒。
 */

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const base = (process.env.PREVIEW_URL ?? "http://127.0.0.1:4321").replace(/\/$/, "");
const executablePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const outDir = process.env.SMOKE_OUT ?? (await mkdtemp(join(tmpdir(), "career-smoke-")));

const failures = [];
const notes = [];

function check(condition, message) {
  if (condition) {
    notes.push(`ok   ${message}`);
  } else {
    failures.push(message);
  }
}

async function shot(page, name) {
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: false });
}

async function overflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}

async function visibleIndustries(page) {
  return page.evaluate(() =>
    [...new Set([...document.querySelectorAll("[data-industry]")].map((el) => el.dataset.industry))]
      .filter((id) =>
        [...document.querySelectorAll(`[data-industry="${id}"]`)].some(
          (el) => getComputedStyle(el).display !== "none",
        ),
      )
      .sort(),
  );
}

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  // 1. 首页与筛选
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const response = await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
    check(response?.status() === 200, `首页返回 200（实际 ${response?.status()}）`);
    check((await page.title()).includes("职业行业研究指南"), "首页标题正确");

    check((await visibleIndustries(page)).length === 3, "默认显示三个样本");

    await page.getByRole("radio", { name: /社会服务/ }).check();
    const community = await visibleIndustries(page);
    check(
      community.length === 1 && community[0] === "elderly-care",
      `筛选社会服务只剩养老（实际 ${community.join(",")}）`,
    );
    const status = await page.locator("[data-status]").textContent();
    check(/已显示 1 \/ 3/.test(status ?? ""), `筛选状态可播报（实际 ${status}）`);

    await page.goto(`${base}/?direction=marketing`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(200);
    const marketing = await visibleIndustries(page);
    check(marketing.length === 2, `带 ?direction= 的链接直接显示两个样本（实际 ${marketing.join(",")}）`);
    await shot(page, "home-filtered");
    await context.close();
  }

  // 2. 移动端不横向溢出
  {
    const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
    const page = await context.newPage();
    for (const path of ["/", "/data/", "/industries/advertising/", "/roles/social-worker/"]) {
      await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
      check(!(await overflow(page)), `420px 下 ${path} 没有横向溢出`);
    }
    await shot(page, "mobile-role");
    await context.close();
  }

  // 3. 深色模式走的是自己的变量
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(`${base}/industries/advertising/`, { waitUntil: "domcontentloaded" });
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const [r, g, b] = background.match(/\d+/g).map(Number);
    check(r + g + b < 200, `深色模式下背景确实变暗（${background}）`);
    await shot(page, "dark");
    await context.close();
  }

  // 4. 数据页与导出
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/data/`, { waitUntil: "domcontentloaded" });
    check((await page.locator(".trend").count()) >= 3, "数据页有趋势图");
    check((await page.locator("tr[data-industry]").count()) > 40, "数据页有指标行");

    const csv = await page.request.get(`${base}/data/metrics.csv`);
    check(csv.status() === 200, `metrics.csv 返回 200（实际 ${csv.status()}）`);
    check((csv.headers()["content-type"] ?? "").includes("text/csv"), "metrics.csv 的 content-type 正确");
    check((await csv.text()).startsWith("\ufeff行业,"), "metrics.csv 带 BOM 与表头");
    await context.close();
  }
} finally {
  await browser.close();
}

for (const line of notes) console.log(line);
console.log(`截图目录：${outDir}`);

if (failures.length > 0) {
  console.error(`\n冒烟测试失败 ${failures.length} 项：`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`\n冒烟测试通过 ${notes.length} 项`);
}
