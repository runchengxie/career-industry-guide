/**
 * 来源链接存活检查：每月由 .github/workflows/link-check.yml 跑一次。
 *
 * 用 GET + 浏览器 UA 请求，而不是 HEAD——不少机构站点会拒绝只问不拿的请求。
 * 结果分三类：
 *   ok       2xx/3xx，正常
 *   blocked  401/403/429，多半是防爬虫，不算失效
 *   broken   404/410/5xx/超时/DNS 失败，才算失效
 *
 * 只有 broken 会触发 issue；脚本本身永远以 0 退出，不红构建。
 *
 * 环境变量：
 *   REPORT_PATH   报告写到哪里，默认 link-report.md
 *   SUMMARY_PATH  摘要 JSON，默认 link-summary.json
 *   TIMEOUT_MS    单条请求超时，默认 15000
 */

import { readFile, writeFile } from "node:fs/promises";

const reportPath = process.env.REPORT_PATH ?? "link-report.md";
const summaryPath = process.env.SUMMARY_PATH ?? "link-summary.json";
const timeoutMs = Number(process.env.TIMEOUT_MS ?? 15000);
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

process.stdout.on("error", (error) => {
  if (error.code !== "EPIPE") throw error;
});

const sources = JSON.parse(await readFile("src/data/sources.json", "utf8"));
const ignore = new Map(
  JSON.parse(await readFile("scripts/link-check-ignore.json", "utf8")).map((entry) => [entry.url, entry]),
);

async function probe(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": userAgent, accept: "text/html,application/pdf,*/*" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const status = response.status;
    // 读掉响应体，避免连接悬挂；大文件只读一小段
    await response.body?.cancel();
    if (status < 400) return { state: "ok", status };
    if (status === 401 || status === 403 || status === 429) return { state: "blocked", status };
    return { state: "broken", status };
  } catch (error) {
    return { state: "broken", status: 0, error: error.message };
  }
}

const results = [];
for (const source of sources) {
  const known = ignore.get(source.url);
  const result = await probe(source.url);
  const state = known && result.state === "blocked" ? "ignored" : result.state;
  results.push({ id: source.id, url: source.url, ...result, state, reason: known?.reason });
  const label = state === "ok" ? "ok     " : state === "ignored" ? "ignored" : `FAIL   `;
  console.log(`${label} ${String(result.status).padStart(3)}  ${source.id}`);
}

const count = (state) => results.filter((result) => result.state === state).length;
const summary = {
  checkedAt: new Date().toISOString(),
  total: results.length,
  ok: count("ok"),
  blocked: count("blocked"),
  ignored: count("ignored"),
  broken: count("broken"),
  brokenSources: results.filter((result) => result.state === "broken").map((result) => result.id),
};

const rows = results
  .map((result) => {
    const status = result.status === 0 ? "无响应" : String(result.status);
    const note =
      result.state === "ignored"
        ? `已在白名单：${result.reason}`
        : result.state === "blocked"
          ? "拒绝自动访问，建议人工确认后加入白名单"
          : result.state === "broken"
            ? (result.error ?? "链接失效")
            : "";
    return `| ${result.id} | ${status} | ${result.state} | ${note || "—"} |`;
  })
  .join("\n");

const report = `来源链接检查（${summary.checkedAt}）

- 检查 ${summary.total} 条：正常 ${summary.ok}，白名单 ${summary.ignored}，拒绝自动访问 ${summary.blocked}，失效 ${summary.broken}

| 来源 | 状态码 | 结果 | 说明 |
| --- | --- | --- | --- |
${rows}

只有“失效”需要处理：换地址、补存档，或确认是站点防爬虫后加入 scripts/link-check-ignore.json。
`;

await writeFile(reportPath, report, "utf8");
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`\n汇总：正常 ${summary.ok}，忽略 ${summary.ignored}，失效 ${summary.broken}`);
