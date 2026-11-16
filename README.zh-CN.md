# 职业行业研究指南

[English](README.md) | 简体中文

这是一个公开的中文静态网站，用来对照广告营销服务、养老服务、国内旅游服务三个研究样本。它帮助查看需求、岗位入口、门槛、风险和证据，不是就业保证，也不是行业排名或求职中介。

每个数字都带年份、口径和来源；取不到的数据会标明缺失，不用示例数据填补。

- 研究版本日期：2026-11-15（Asia/Shanghai），公开招聘岗位的活页核验尚未完整
- 发布地址：<https://runchengxie.github.io/career-industry-guide/>
- 两份研究提示词已脱敏收录于 `docs/prompts/`；个人隐私材料、原始对话和未公开附件不在本仓库中

## 页面

| 路径 | 内容 |
| --- | --- |
| `/` | 三个样本并排对照，可按岗位方向筛选 |
| `/industries/<slug>/` | 单个样本：定义、需求证据、岗位、门槛、风险、来源 |
| `/roles/<slug>/` | 单个岗位：做什么、可准备什么、核验状态 |
| `/data/` | 全部指标、哪些记了或没记的数据地图，以及数据文件 |
| `/methods/` | 来源、口径、核验规则与未核实清单 |

## 本地预览

需要 Node.js 22.23.4 或更新版本。

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

### 浏览器冒烟测试

`npm run check:browser` 在真实 Chrome 里跑一遍：方向筛选、`?direction=` 链接、420px 下是否横向溢出、深色模式，以及 CSV 导出。它不进 CI，因为依赖本机的 Chrome。

```bash
npm run build && npm run preview
npm run check:browser
```

默认连 `http://127.0.0.1:4321`、用 `/usr/bin/google-chrome`，截图写到系统临时目录；可以用 `PREVIEW_URL`、`CHROME_PATH`、`SMOKE_OUT` 覆盖。

`npm run verify` 与 CI 同一条链：数据校验、测试、类型检查、构建、产物检查（断链与必须出现/必须缺失的内容）和 HTML/WCAG 检查。

## 部署

GitHub Actions 在每次推送到 `main` 时构建并发布到 GitHub Pages。工作流固定 `BASE_PATH=/career-industry-guide/` 与 `SITE=https://runchengxie.github.io`；本地可以用同样的变量检查线上路径。

```bash
BASE_PATH=/career-industry-guide/ SITE=https://runchengxie.github.io npm run build
BASE_PATH=/career-industry-guide/ npm run check:dist
```

## 来源链接检查

`npm run check:links` 用浏览器 UA 请求每条来源链接，把结果分成正常、拒绝自动访问（401/403/429，多为防爬虫）和失效三类。`Link check` 工作流每月 1 号跑一次；出现失效时开或更新 issue，不让构建失败——外部站点是否可用不由本项目决定。已知会被拒的地址连同原因记在 `scripts/link-check-ignore.json`。

## 数据

站点内容放在 `src/data/*.json`，字段定义见 `src/lib/types.ts`。页面模板不写死数字；`scripts/check-data.ts` 会在数值缺来源、年份或口径，或者岗位声称已完成活页核验却没有链接和日期时让构建失败。

## 文档

- `docs/prompts/` —— 两份研究提示词，以及转换与脱敏说明
- `docs/superpowers/specs/` —— 设计说明与修订记录
- `docs/superpowers/plans/` —— 实现计划与执行记录

## 许可

- 文字与数据：[CC BY 4.0](LICENSE-content)
- 代码：[MIT](LICENSE)
