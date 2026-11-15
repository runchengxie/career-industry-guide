import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const base = process.env.PREVIEW_URL ?? "http://127.0.0.1:4321";
const out = "/opt/cursor/artifacts";
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

async function visibleIndustry(page, id) {
  const locator = page.locator(`[data-industry="${id}"]:visible`).first();
  return locator.count().then(async (count) => count > 0 && locator.isVisible());
}

async function exercise(width, height, label, mobile) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  assert(!(await overflow(page)), `${label} home overflows`);
  await page.screenshot({ path: `${out}/home-${label}.png`, fullPage: false });
  await page.screenshot({ path: `${out}/home-${label}-full.png`, fullPage: true });

  await page.getByRole("radio", { name: /社会服务与社区活动/ }).check();
  await page.waitForTimeout(150);
  assert(!(await visibleIndustry(page, "advertising")), `${label} social filter still shows advertising`);
  assert(await visibleIndustry(page, "elderly-care"), `${label} social filter hides eldercare`);
  assert(!(await visibleIndustry(page, "domestic-tourism")), `${label} social filter still shows tourism`);
  assert(page.url().includes("direction=social-service"), `${label} social filter did not update the URL`);
  await page.screenshot({ path: `${out}/home-${label}-social.png`, fullPage: false });

  await page.getByRole("radio", { name: /目的地与旅游产品/ }).check();
  await page.waitForTimeout(150);
  assert(!(await visibleIndustry(page, "advertising")), `${label} destination filter shows advertising`);
  assert(!(await visibleIndustry(page, "elderly-care")), `${label} destination filter shows eldercare`);
  assert(await visibleIndustry(page, "domestic-tourism"), `${label} destination filter hides tourism`);

  await page.getByRole("radio", { name: /营销传播/ }).check();
  await page.waitForTimeout(150);
  assert(await visibleIndustry(page, "advertising"), `${label} marketing filter hides advertising`);
  assert(await visibleIndustry(page, "elderly-care"), `${label} marketing filter hides eldercare`);
  assert(!(await visibleIndustry(page, "domestic-tourism")), `${label} marketing filter shows tourism`);

  await page.goto(`${base}/?direction=not-recorded`, { waitUntil: "networkidle" });
  await page.getByText("当前方向在已录入的三个样本中没有匹配岗位").waitFor();
  assert(!(await visibleIndustry(page, "advertising")), `${label} empty state still shows a sample`);
  await page.getByRole("button", { name: "恢复全部" }).click();
  await page.waitForTimeout(150);
  assert(await visibleIndustry(page, "advertising"), `${label} reset did not restore advertising`);
  assert(!page.url().includes("direction="), `${label} reset left a direction query`);

  await page.goto(`${base}/industries/elderly-care/`, { waitUntil: "networkidle" });
  assert(!(await overflow(page)), `${label} eldercare page overflows`);
  await page.getByRole("heading", { name: "养老服务" }).waitFor();
  await page.getByText("暂无可靠数据", { exact: true }).first().waitFor();
  await page.screenshot({ path: `${out}/eldercare-${label}.png`, fullPage: false });

  await page.goto(`${base}/roles/social-work/`, { waitUntil: "networkidle" });
  assert(!(await overflow(page)), `${label} role page overflows`);
  await page.getByText("仅见招聘或年报材料").first().waitFor();
  await page.screenshot({ path: `${out}/role-social-work-${label}.png`, fullPage: false });

  await page.goto(`${base}/methods/`, { waitUntil: "networkidle" });
  assert(!(await overflow(page)), `${label} methods page overflows`);
  await page.getByRole("heading", { name: "当前未核实清单" }).waitFor();
  await page.screenshot({ path: `${out}/methods-${label}.png`, fullPage: false });

  await page.goto(`${base}/missing-page/`, { waitUntil: "networkidle" });
  assert(!(await overflow(page)), `${label} 404 overflows`);
  await page.getByRole("heading", { name: "这个页面不存在" }).waitFor();
  await page.screenshot({ path: `${out}/missing-${label}.png`, fullPage: false });

  assert(errors.length === 0, `${label} page errors: ${errors.join(" | ")}`);
  await context.close();
}

await exercise(1280, 800, "desktop", false);
await exercise(375, 812, "mobile", true);
await browser.close();

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("browser checks passed");
