# 职业行业研究指南

这是一份面向职业选择的中国大陆行业研究静态网站。当前仓库为私有，网站尚未上线，也尚未启用 GitHub Pages。

本项目用来比较广告营销服务、养老服务、国内旅游服务三个样本。它帮助对照需求、岗位、门槛、风险和证据，不是就业保证，也不是行业排名。

研究版本日期：2026-11-15（Asia/Shanghai）。截至这一天，公开招聘岗位的活页核验尚未完整。

## 和设计说明的关系

设计说明在 `docs/superpowers/specs/2026-11-15-career-industry-guide-design.md`，实现计划在 `docs/superpowers/plans/2026-11-15-career-industry-guide.md`。设计拉取请求 #1 仍单独开放。本实现包含那份尚未合并的设计文档，方便对照，但不合并 #1，也不把网站公开发布。

## 本地预览

需要 Node.js 20 或更新版本。

```bash
npm install
npm test
npm run typecheck
npm run build
npm run preview
```

`npm run verify` 会依次跑测试、类型检查、生产和产物路由检查。

浏览器里核对筛选和页面时，先在另一个终端运行 `npm run preview`，再执行：

```bash
node scripts/browser-check.mjs
```

该脚本使用本机 Chrome，不发布网站。

开发时：

```bash
npm run dev
```

浏览器打开命令行给出的本地地址。预览默认在 `http://127.0.0.1:4321/`。

## 以后放到 GitHub Pages 时的路径

本阶段不启用 Pages，也不添加自动发布。若以后单独批准发布为项目站点，构建时加上仓库名路径：

```bash
BASE_PATH=/career-industry-guide/ npm run build
```

产物在 `dist/`。不要把 `node_modules`、研究原始附件或密钥放进发布目录。

## 数据

行业、岗位、指标和来源是 `src/data/` 里的 JSON。页面从这些文件生成。没有可靠来源的数字会显示“暂无可靠数据”或“尚未核实”。有数值却缺少来源、年份或口径时，构建会失败。

更新研究时先改 JSON 和来源，再构建，并在 `src/data/meta.json` 更新研究版本日期。不要静默改掉旧口径。

原始研究提示词、个人隐私材料和未公开附件不要上传到本仓库。
