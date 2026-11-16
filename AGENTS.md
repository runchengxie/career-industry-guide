# AGENTS.md

本文件只写这个仓库特有的约束。通用开发规范在工作区根目录的 `AGENTS.md`。

## 项目

中文静态研究站点，Astro 在构建时把 `src/data/*.json` 渲染成 HTML。页面模板不写死数字，数据校验不过就构建失败。

## 命令

| 命令 | 用途 |
| --- | --- |
| `npm ci` | 按 lockfile 安装 |
| `npm run verify` | 与 CI 同一条链：格式检查 → 测试 → 类型检查 → 构建 → 产物检查 → HTML/WCAG。提交前跑这个 |
| `npm test` | 只跑单元测试（`node:test` + `tsx`） |
| `npm run check:data` | 只跑数据校验 |
| `npm run check:dist` | 只检查构建产物（必需文件、断链、页内锚点、sitemap） |
| `npm run check:html` | 只跑 HTML/WCAG 规则 |
| `npm run check:browser` | 浏览器冒烟测试，需要先 `npm run build && npm run preview`；不进 CI |
| `npm run check:links` | 检查 16 条来源链接是否还能打开；每月由 `Link check` 工作流跑一次，失效时开 issue，不红构建 |
| `npm run dev` / `preview` | 本地开发与预览 |

`BASE_PATH` 与 `SITE` 影响构建路径；CI 固定为 `/career-industry-guide/` 与 `https://runchengxie.github.io`。

## 数据与内容边界

- 新增数字必须同时写 `value`、`unit`、`year`、`scope` 与 `sourceIds`。缺任何一项 `check-data` 会让构建失败。
- 取不到的数据标 `availability: "unavailable"`（找不到）或 `"unverified"`（尚未核实），并按 `category` 归入已有分类。不要用 0、估算或示例数据填充。
- 自行测算的指标要写 `formula` 与 `inputs`，测试会用 `inputs` 复算并比对 `value`。
- 同组可比性写在 `comparison`，标为 `comparable: false` 的不要连成序列或计算变化幅度。
- 来源只引公开可核验材料；新闻转述要写明转述关系；付费报告摘要只能作线索。
- 研究版本日期只在 `src/data/meta.json` 改，代码里不写死。

## 不要做的事

- 不要为了通过检查而放宽 `scripts/check-dist.ts` 的内容断言、`src/lib/validate.ts` 的校验或 `html-validate` 规则。
- 不要新增排名、评分或推荐指数类的字段与文案，站点的定位是"不是排名、不是就业保证"。
- 不要在页面模板里直接写数字或口径，一律走 `src/data/` 与 `src/lib/`。
- 不要提交原始 `.docx`、日志、`dist/`、`node_modules/`（`.gitignore` 已覆盖）。

## 文档

- `README.md` 是英文 canonical，`README.zh-CN.md` 是中文版，两版顶栏互链，事实必须一致。
- `docs/prompts/` 收录两份研究提示词及转换说明；改内容时同步说明。
- `docs/superpowers/specs|plans/` 是 2026-11-15 的设计与计划记录，保留历史表述，状态变更用注明的方式追加，不改写原文。

## 交付

- 一个任务一个分支，PR 合并到 `main` 后由 `Site` 工作流自动部署到 GitHub Pages。
- 合并前要求 `Site` 工作流的 `check` 任务通过；不要绕过检查直接推送 `main`。
