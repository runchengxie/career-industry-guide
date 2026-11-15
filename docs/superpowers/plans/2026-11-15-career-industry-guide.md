# 职业行业研究网站初版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 在本地构建一个可预览的中文静态网站，用同一套结构比较广告营销服务、养老服务、国内旅游服务三个样本，并标明证据与缺口。

**Architecture:** Astro 在构建时读取 `src/data/` 的 JSON，经 TypeScript 校验后生成静态 HTML。筛选是页面上的少量客户端脚本，无脚本时仍显示完整比较。构建入口调用同一校验函数，缺来源的数值或缺少核验字段的“已完成活页核验”会使构建失败。

**Tech Stack:** Astro 5、TypeScript、Vitest、happy-dom。生产构建输出 `dist/`。不启用 GitHub Actions，不打开 GitHub Pages。

## Global Constraints

- 研究版本日期：2026-11-15（Asia/Shanghai）
- 三个样本用于比较，不是排名，也不是就业保证
- 仓库保持私有；不启用 GitHub Pages；不添加发布用 GitHub Actions；不修改仓库可见性；不部署
- 应用代码位于 `src/`；站点数据只用 JSON，不用 CSV；Parquet 不进入本阶段
- 不得编造薪资、集中度、在招职位、就业人数或文科岗位占比
- 有数值的指标必须有年份或起止年份、口径、来源 id；自行测算必须有公式
- 缺失渲染为“暂无可靠数据”或“尚未核实”，不得渲染成 0、空白或评分
- 核验状态只允许：已完成活页核验、仅见招聘或年报材料、尚未核验
- 已完成活页核验必须同时有雇主、标题、链接和核验日期；本版三个样本的岗位都不使用这一档
- 护理员等照护或技术岗位只标为相邻，不算文科对口
- 页脚和显著位置包含研究版本日期、尚未正式上线、不是就业保证、招聘活页核验尚未完整
- 路径：`/`、`/industries/advertising/`、`/industries/elderly-care/`、`/industries/domestic-tourism/`、`/roles/{slug}/`、`/methods/`、404
- 筛选方向只有：全部、营销传播、社会服务与社区活动、目的地与旅游产品；查询参数可为 `?direction=marketing|social-service|destination`
- 将来的 GitHub Pages 项目站可用 `BASE_PATH=/career-industry-guide/` 构建，本阶段不发布
- 不上传原始提示词、Word 原稿、密钥或隐私材料
- 实现分支单独开拉取请求，目标 `main`；不修改、不合并设计 PR #1

## 文件边界

- `src/data/*.json`：内容与引用，不含布局
- `src/lib/types.ts`：数据形状
- `src/lib/validate.ts`：构建失败条件
- `src/lib/format.ts`：缺失值与自行测算的显示
- `src/lib/filter.ts`：方向筛选，供测试和客户端脚本共用
- `src/lib/paths.ts`：base path 拼接
- `src/lib/catalog.ts`：读取 JSON 并调用校验，页面只从这里取数
- `src/layouts/BaseLayout.astro`：语言、地标、页头页脚、提示
- `src/components/`：比较区、筛选、指标、来源、证据与判断
- `src/pages/`：路由
- `src/styles/global.css`：响应式与焦点样式
- `src/scripts/filter-client.ts`：读取查询参数并调用筛选
- `tests/`：校验、筛选、格式、构建产物
- `astro.config.mjs`、`package.json`、`README.md`：工具链与本地预览说明

## 已核验证据（写入 JSON 时不得超出）

广告：2024 年事业单位和规模以上企业广告业务收入 15464.1 亿元、增长 17.9%；互联网广告发布收入占发布环节 86.5%；本科及以上学历人员占比 67.6%。来源为国新办网站的市场监管总局发布会实录，时间 2025-06-17，URL `http://www.scio.gov.cn/xwfb/bwxwfb/gbwfbh/gjscjgzj/202506/t20250619_900892.html`。2025 年新华社稿写全年广告业务收入 20502.1 亿元、增长 32.6%，URL `http://www.xinhuanet.com/fortune/20260623/cb51f27ea02c498e9f756b976288b0a2/c.html`，日期 2026-06-23。该句没有重复“事业单位和规模以上企业”，页面必须保留这个限制。

蓝色光标 2025 年年报（PDF `https://pdf.dfcfw.com/pdf/H2_AN202604151821244424_1.pdf`，2026 年 4 月）：营业收入 68,692,672,430.48 元，归母净利润 224,665,777.93 元。分行业收入与毛利率：全案推广服务 8,658,342,151.80 元、毛利率 7.55%；全案广告代理 3,538,651,888.66 元、毛利率 7.79%；出海广告投放 56,495,678,390.02 元、毛利率 1.56%。年报业务描述包含全案推广（数字营销、公共关系、活动管理）、全案广告代理和出海广告投放。净利率约 0.327% 只能作为归母净利润除以营业收入的自行测算。

养老：国家统计局 2025 年统计公报，2026-02-28，`https://www.stats.gov.cn/sj/zxfb/202602/t20260228_1962662.html`：60 周岁及以上 32338 万人、占 23.0%；提供住宿的养老机构 3.9 万个；养老服务床位 768.0 万张。2024 年同系列公报，2025-02-28，`https://www.stats.gov.cn/sj/zxfb/202502/t20250228_1958817.html`：养老机构 4.0 万个；养老服务床位 799.1 万张。下降原因不写死。不写床位使用率，不写全行业营业收入。

泰康之家岗位只依据南开大学就业网转载，`https://career.nankai.edu.cn/recruitment/content/type/2/id/6305.html`，访问日期 2026-11-15。材料列出管家、社工、文娱活动师、市场营销、品牌宣传等。页面未单列发布日期。不得标成已完成活页核验。护理、康复等只作相邻岗位。

国内旅游：文旅部 2024 年度国内旅游数据，2025-01-22，`https://zwgk.mct.gov.cn/zfxxgkml/tjxx/202501/t20250121_958012.html`：56.15 亿人次，5.75 万亿元。文旅部 2025 年国内居民出游数据，2026-01-26，`https://zwgk.mct.gov.cn/zfxxgkml/tjxx/202601/t20260126_964367.html`：65.22 亿人次，6.30 万亿元。统计局公报的 65.2 亿人次和 63003 亿元单独保留，不与文旅部数字平均。人均单次花费用文旅部配对自行测算。

宋城演艺 2025 年年报，2026-04-24，`https://static.cninfo.com.cn/finalpage/2026-04-24/1225164604.PDF`：营业收入 2,257,598,020.98 元，比上年 -6.61%。众信旅游 2025 年年报，2026-04-27，`https://static.cninfo.com.cn/finalpage/2026-04-27/1225176921.PDF`：营业收入 6,822,470,326.84 元、+5.69%；归母净利润 7,058,705.16 元、-93.34%。携程 2025 年全年业绩公告，2026-02-25，`https://investors.trip.com/static-files/da716603-67ae-477e-a9ff-fc9ebc203f19`：净营业收入 624 亿元、上升 17%；净利润增加同时写明投资利得 199 亿元。官方招聘入口 `https://job.ctrip.com/` 只证明入口可见，具体职位未核验。

## 自审

- 规格第 2 节 11 条分别落到数据校验、三个行业页、筛选、方法页、页脚和 README 的发布说明。
- 没有把样本扩到十个，没有登录、抓取、评分或 Actions。
- 床位使用率因缺少可复核的在住人数，本版明确不展示，并在缺口中写明。
- 2025 年广告收入不擅自改写成与 2024 年完全同一句口径。
- 类型名在各任务中统一为 `Catalog`、`Metric`、`RoleVerificationStatus`、`applyDirectionFilter`、`formatMetric`、`getCatalog`。

---

### Task 1: 工具链与失败测试

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Test: `tests/validate.test.ts`, `tests/format.test.ts`, `tests/filter.test.ts`

**Interfaces:**
- Produces: `validateCatalog(catalog): void` throws `Error`；`formatMetric(metric): string`；`applyDirectionFilter(root, direction): { visibleIndustries: string[]; empty: boolean }`

- [x] **Step 1: 写会失败的测试**

校验测试断言：有数值无来源抛错；`verified-posting` 缺链接抛错；不可用指标的 `formatMetric` 返回“暂无可靠数据”且不等于 `0`。筛选测试断言：`all` 保留三个行业；`social-service` 只留养老；无匹配时 `empty === true` 且空状态元素可见。

- [x] **Step 2: 运行测试并确认失败**

Run: `npx vitest run tests/validate.test.ts tests/format.test.ts tests/filter.test.ts`
Expected: FAIL，模块尚不存在

- [x] **Step 3: 提交测试与工具链**

### Task 2: 校验、格式与筛选

**Files:**
- Create: `src/lib/types.ts`, `src/lib/validate.ts`, `src/lib/format.ts`, `src/lib/filter.ts`, `src/lib/paths.ts`

- [x] **Step 1: 实现到测试通过**

`formatMetric`：`unavailable` → `暂无可靠数据`；`unverified` → `尚未核实`；`value` 才输出数字。`validateCatalog` 在数值缺 `sourceIds`、年份或口径时抛错；自行测算缺公式时抛错；`verified-posting` 缺雇主、标题、url 或 `verifiedOn` 时抛错。

- [x] **Step 2: 再跑上述 vitest，预期 PASS**

### Task 3: 三个样本的 JSON

**Files:**
- Create: `src/data/meta.json`, `industries.json`, `roles.json`, `metrics.json`, `sources.json`, `src/lib/catalog.ts`
- Test: `tests/catalog.test.ts`

- [x] **Step 1: 写入本计划“已核验证据”中的指标，并把薪资、集中度、养老服务全行业收入、广告从业人员完整时序、旅行社与景区用工结构标为 unavailable**
- [x] **Step 2: `getCatalog()` 对真实 JSON 调用校验；测试确认三个行业、约定岗位 slug、来源 URL 和不可用薪资**
- [x] **Step 3: 测试通过后提交**

### Task 4: 页面、样式与 base path

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/*.astro`, `src/pages/index.astro`, `src/pages/industries/[slug].astro`, `src/pages/roles/[slug].astro`, `src/pages/methods.astro`, `src/pages/404.astro`, `src/styles/global.css`, `src/scripts/filter-client.ts`
- Modify: `README.md`
- Test: `tests/dist.test.ts`

- [x] **Step 1: 页面从 catalog 渲染，不把正文写死在组件里**
- [x] **Step 2: 桌面为表格、窄屏为卡片；375px 不要求横向拖动**
- [x] **Step 3: `astro check` 与 `astro build` 通过；`REQUIRE_DIST=1` 的产物测试确认路由、版本日期、非就业保证、尚未上线、活页核验提示，以及不可用指标没有被渲染成数字**

### Task 5: 浏览器核对与拉取请求

- [x] **Step 1: 本地 preview，用浏览器打开首页、一个行业页、一个岗位页、方法页和 404**
- [x] **Step 2: 操作全部与三个方向；截 1280 与 375 宽度的桌面和手机图**
- [x] **Step 3: 推送 `cursor/career-industry-guide-impl-a907`，对 `main` 打开实现 PR，说明与未合并的设计 PR #1 的关系。不合并，不打开 Pages**
