# 职业行业研究网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 在本地构建一个可预览的中文静态网站，用同一套结构比较广告营销服务、养老服务、国内旅游服务三个样本，并明示证据缺口。

**Architecture:** Astro 在构建时读取 `src/data/` 的 JSON，生成首页、三个行业页、岗位页、来源与方法页和 404。TypeScript 校验在 `astro build` 之前运行，有数值却缺来源、年份或口径，或“已完成活页核验”缺日期或链接时，构建失败。筛选是页面上的少量客户端脚本；无脚本时仍显示完整比较。

**Tech Stack:** Astro 5、TypeScript、Node.js 内置测试运行器（`node:test`）与 `tsx`。无 UI 框架，无 CSV，无部署工作流。

**Execution note:** 各任务共用同一套类型、id 和页面合约，不适合拆给并行实现者。本计划在同一会话内按 executing-plans 顺序执行。设计说明已获实现授权，不再重选框架。

## Global Constraints

- 研究版本日期固定为 `2026-11-15`（Asia/Shanghai）。
- 只做三个样本：广告营销服务、养老服务、国内旅游服务。这是比较，不是排名，不设总分、推荐指数或红绿灯。
- 应用代码位于 `src/`。站点数据只用 `src/data/*.json`。不使用 CSV。不读取 Parquet。
- 路由使用英文 slug：`/`、`/industries/advertising/`、`/industries/elderly-care/`、`/industries/domestic-tourism/`、`/roles/{role-slug}/`、`/methods/`，另有静态 404。
- 语言 `zh-CN`。窄屏以 375px 为阅读基准，比较区不能只靠横向表格。
- 缺失用 `unavailable`（页面写“暂无可靠数据”）或 `unverified`（页面写“尚未核实”），不得渲染成 `0` 或分数。
- 有数值的指标必须有年份、口径、地理范围和来源 id。自行测算必须写公式。
- 岗位核验只允许 `verified`（已完成活页核验）、`materials`（仅见招聘或年报材料）、`unverified`（尚未核验）。`verified` 必须同时有雇主、职位标题、链接和核验日期。本版数据不得把泰康之家、蓝色光标或携程具体职位标成 `verified`。
- 不编造薪资、市场集中度、在招职位数或文科岗位占比。来源冲突保留两种口径，不平均。
- 护理、康复等照护岗位只在行业页标为相邻，不建岗位页，不进入文科方向筛选。
- 页头或首页以及页脚写明：初步研究，不是就业保证；尚未正式上线；招聘活页核验尚未完整。
- 仓库保持私有。不启用 GitHub Pages，不添加 GitHub Actions，不改可见性，不合并，不推送 `main`，不修改设计 PR #1。
- 用 `BASE_PATH` 预留将来的 GitHub Pages 项目站前缀，默认 `/`。本阶段不发布。
- 不上传原始提示词、附件、凭证或隐私材料。

## File Structure

- `astro.config.mjs`：静态输出；`base` 来自 `BASE_PATH`，默认 `/`；`trailingSlash: always`。
- `package.json`：`test`、`check:data`、`build`（先校验再构建）、`typecheck`、`preview`。
- `src/lib/types.ts`：数据集类型。
- `src/lib/load.ts`：读取五份 JSON。
- `src/lib/validate.ts`：返回错误列表；`assertValid` 在有错误时抛出。
- `src/lib/filter.ts`：按岗位方向筛选行业和岗位。
- `src/lib/format.ts`：把指标格式化成中文，缺失不显示数字。
- `src/lib/routes.ts`：由数据生成内部路径，供链接测试使用。
- `scripts/check-data.ts`：构建前闸门，校验失败则以退出码 1 结束。
- `src/data/meta.json`：版本、免责声明、筛选方向、未核实清单、方法说明。
- `src/data/sources.json`：来源。
- `src/data/metrics.json`：指标。
- `src/data/industries.json`：三个行业的比较格和分页段落。
- `src/data/roles.json`：已录入岗位。
- `src/layouts/Base.astro`、`src/components/*`、`src/pages/*`、`src/styles/global.css`、`src/scripts/home-filter.ts`。
- `tests/*.test.ts`：校验、筛选、格式、链接和自行测算复核。
- `scripts/check-dist.ts`：构建后检查路由文件和关键中文。
- `README.md`：本地预览和将来的 base path。不改设计说明正文。

## Data contracts

`DirectionId` 为 `all | marketing | community | destination`。

`Metric.availability` 为 `value | unavailable | unverified`。`value` 时 `display`、`year`、`geography`、`scope` 非空，`sourceIds` 至少一条，且都存在于来源表。`nature === "self_calculated"` 时 `formula` 和 `inputs` 必填。`unavailable` 与 `unverified` 的 `display` 必须为 `null`。

`Role.verification` 为 `verified | materials | unverified`。`verified` 要求 `employer`、`postingTitle`、`postingUrl`、`verifiedOn`。`materials` 要求 `materialNature` 和非空 `sourceIds`。`unverified` 的 `verifiedOn` 必须为 `null`。`humanitiesFit === "adjacent"` 的岗位不参与方向筛选；本版不录入相邻岗位页。

行业 `roleIds` 必须指向岗位，岗位 `industryIds` 必须指向行业。禁止出现字段名 `score`、`rank`、`rating`、`recommendationIndex`。

筛选：`all` 返回全部三个行业。其他方向只保留至少有一个 `humanitiesFit === "match"` 且 `direction` 相等的岗位的行业。没有匹配时返回空数组，文案为“当前方向在已录入的三个样本中没有匹配岗位”。

## Self-review

- 规格第 2–10 节的页面、筛选、缺失值、构建失败、375px、免责声明和发布边界都有对应任务。
- 不扩展到十个行业，不接招聘接口，不添加 Actions。
- 数字只使用已核对的公开页面，并在数据里写明转述或自行测算。薪资、集中度、在招人数保持缺失。
- 泰康之家岗位来自南开大学就业网转载，状态为 `materials`。蓝色光标岗位来自年报业务构成，状态为 `materials`。旅游具体职位状态为 `unverified`。
- 2025 年养老床位同时保留老龄事业公报转述的 767.9 万张和统计公报的 768.0 万张，不取平均。

---

### Task 1: 项目骨架与校验闸门

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/env.d.ts`
- Create: `src/lib/types.ts`, `src/lib/validate.ts`, `src/lib/load.ts`, `scripts/check-data.ts`
- Test: `tests/validate.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: `validateDataset(data: Dataset): string[]`，`assertValid(data: Dataset): void`，`loadDataset(): Dataset`

- [x] **Step 1: Write the failing test**

测试真实数据一旦存在就能通过；在此之前先写“有数值无来源则失败”的纯函数测试，数据文件尚未被读取。

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { assertValid } from "../src/lib/validate.ts";
import type { Dataset } from "../src/lib/types.ts";

function base(): Dataset {
  return {
    meta: { researchVersion: "2026-11-15", timezone: "Asia/Shanghai" },
    sources: [{ id: "s1", author: "机构", title: "文献", published: "2026-02-28", accessed: "2026-11-15", url: "https://example.com/a", supports: ["m1"] }],
    metrics: [],
    industries: [],
    roles: [],
  };
}

test("有数值但没有来源时校验失败", () => {
  const data = base();
  data.metrics.push({
    id: "m1",
    subjectId: "advertising",
    name: "广告业务收入",
    availability: "value",
    display: "1",
    unit: "亿元",
    year: "2024",
    geography: "中国大陆",
    scope: "规模以上",
    nature: "restatement",
    sourceIds: [],
    formula: null,
    inputs: null,
    note: null,
  });
  assert.throws(() => assertValid(data), /来源/);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/validate.test.ts`
Expected: FAIL，因为模块尚不存在。

- [x] **Step 3: Write minimal implementation**

实现 `assertValid`：`availability === "value"` 且 `sourceIds` 为空时，错误信息包含“来源”。随后补上年份、口径、地理范围、自行测算公式、`verified` 缺链接或日期、缺失值却带 `display`、未知来源 id、断开的行业岗位引用，以及禁排名词。

- [x] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/validate.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json .gitignore src tests scripts
git commit -m "feat: add Astro scaffold and data validation gate"
```

### Task 2: 筛选、格式化与路由索引

**Files:**
- Create: `src/lib/filter.ts`, `src/lib/format.ts`, `src/lib/routes.ts`
- Test: `tests/filter.test.ts`, `tests/format.test.ts`

**Interfaces:**
- Consumes: `Dataset`, `DirectionId`
- Produces: `filterIndustries(industries, roles, direction)`, `matchingRoles(roles, industryId, direction)`, `emptyFilterMessage`, `formatMetric(metric)`, `siteRoutes(data)`

- [x] **Step 1: Write the failing test**

覆盖 `all`、`marketing`、`community`、`destination`，以及把全部岗位改成同一方向后另一方向为空。`formatMetric` 对 `unavailable` 返回“暂无可靠数据”，对 `unverified` 返回“尚未核实”，且结果不含独立数字 `0`。

- [x] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/filter.test.ts tests/format.test.ts`
Expected: FAIL，模块不存在。

- [x] **Step 3: Write minimal implementation**

`emptyFilterMessage` 固定为“当前方向在已录入的三个样本中没有匹配岗位”。相邻岗位不计入匹配。`formatMetric` 在缺失状态下不读 `display`。

- [x] **Step 4: Run test to verify it passes**

Expected: PASS

- [x] **Step 5: Commit**

```bash
git commit -m "feat: add comparison filter and missing-value formatting"
```

### Task 3: 写入三个样本的 JSON

**Files:**
- Create: `src/data/meta.json`, `sources.json`, `metrics.json`, `industries.json`, `roles.json`
- Test: `tests/validate.test.ts`, `tests/calculations.test.ts`, `tests/links.test.ts`

**Interfaces:**
- Consumes: Task 1–2 的校验和筛选
- Produces: 三个行业 id `advertising`、`elderly-care`、`domestic-tourism` 及其岗位 slug

- [x] **Step 1: Write the failing test**

对真实 `loadDataset()` 调用 `assertValid`。自行测算测试用指标里的 `inputs` 重算：蓝色光标净利率约 0.33%，2024 年注册养老机构床位使用率约 45.4%，国内旅游人均单次花费下降约 6.4%。链接测试确认每个内部路径唯一，行业与岗位互相引用，来源 URL 为 http(s)，数据目录没有 csv 或 parquet。

- [x] **Step 2: Run test to verify it fails**

Expected: FAIL，数据文件不存在或校验错误。

- [x] **Step 3: Write the JSON**

只录入已核对公开来源。广告 2024、2025 年收入使用新闻对市场监管总局报告的转述。养老人口和统计公报床位使用国家统计局 2025 年统计公报；机构和另一床位口径使用北京市民政局对 2025 年老龄事业公报的转述，并与 2024 年央视对公报的转述对照。下降原因标为尚未证实。旅游人次和花费同时保留统计局与部门公布的不同约数。公司数字分别链到巨潮摘要或年报、携程业绩公告，以及新浪财经对宋城年报的转载。薪资、集中度、在招职位、全行业养老收入、广告从业人员完整时序、旅行社与景区用工结构设为 `unavailable` 或写入未核实清单。

- [x] **Step 4: Run tests**

Run: `npx tsx --test tests/*.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git commit -m "feat: add cited JSON for three industry samples"
```

### Task 4: 页面、筛选脚本与样式

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/MetricList.astro`, `src/pages/index.astro`, `src/pages/industries/[slug].astro`, `src/pages/roles/[slug].astro`, `src/pages/methods.astro`, `src/pages/404.astro`, `src/scripts/home-filter.ts`, `src/styles/global.css`
- Modify: `README.md`
- Test: `scripts/check-dist.ts`

**Interfaces:**
- Consumes: `loadDataset`, `formatMetric`, `filter` 语义，`import.meta.env.BASE_URL`
- Produces: 静态 HTML。首页脚本读取 `?direction=`，只隐藏不匹配的行业，并在无匹配时显示空状态和恢复“全部”的按钮。

- [x] **Step 1: Write pages after the data tests are green**

页面从 JSON 渲染，不把指标数字写死在组件里。行业页顺序：定义与口径、需求证据、适合岗位、日常工作概况、入口门槛、小作品、地域与资历、盈利与稳定性、风险、尚未证实的问题、来源列表。证据段和判断段分开。每个指标带年份、口径和来源链接。

首页比较维度固定为：行业定义、需求证据、适合的文科岗位、入口与地域限制、盈利与稳定性、主要风险、证据缺口。桌面为表，窄屏为带字段名的卡片。

- [x] **Step 2: Build and check output**

Run: `npm run build && npx tsx scripts/check-dist.ts`
Expected: `dist` 含上述路由；首页含三个样本、“不是排名”“不是就业保证”“尚未正式上线”“尚未完整”；404 链到首页和方法页。

- [x] **Step 3: Commit**

```bash
git commit -m "feat: render Chinese comparison, industry, role, and methods pages"
```

### Task 5: 本地预览说明与浏览器核对

**Files:**
- Modify: `README.md`

- [x] **Step 1: Document preview and future base path**

`npm install`、`npm test`、`npm run typecheck`、`npm run build`、`npm run preview`。说明 `BASE_PATH=/career-industry-guide/ npm run build` 只用于将来的项目站，现在不发布。

- [x] **Step 2: Browser check**

在预览服务器上打开首页，切换三个方向，确认营销隐藏国内旅游、社会服务只留养老、目的地只留国内旅游，空状态文案存在于页面中。打开一条行业页、一条岗位页、方法页。桌面和 375px 各留截图。

- [x] **Step 3: Commit remaining docs if needed**

```bash
git commit -m "docs: add local preview and future base path notes"
```


## Revision after review

发布前删去了两类容易误读的数字：把 2024 年养老机构服务人数除以床位得到的约 45.4% 使用率，以及把两份不同公报的约数连成约下降 6.4% 的人均花费。服务人数和床位仍按原文分别保留。两次人均除法也分别保留，并标明不可比。依赖升级到 Astro 7.4.12，以处理审计给出的框架漏洞。

## Execution record

计划已在分支 `cursor/career-industry-site-8014` 执行。任务共用同一套数据类型和页面合约，因此在本会话内顺序实现，而不是拆给并行子任务。校验、筛选、自行测算、生产构建和浏览器筛选都已跑过。仓库保持私有，没有启用 Pages，没有添加 GitHub Actions，没有合并或修改设计 PR #1。
