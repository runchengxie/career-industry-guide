# 职业行业研究指南

这是一份面向职业选择的中国大陆行业研究静态网站。当前仓库为私有，网站尚未上线，也尚未启用 GitHub Pages。

本项目用来比较广告营销服务、养老服务、国内旅游服务三个研究样本。它帮助对照需求、岗位、门槛、风险和证据，不是就业保证，也不是行业排名或求职中介。

## 当前状态

- 研究版本日期：2026-11-15（Asia/Shanghai）
- 已完成：三个行业样本的公开资料、设计说明，以及可在本地预览的静态站点
- 尚未完成：公开发布。不要把本仓库当作已上线产品
- 设计说明：`docs/superpowers/specs/2026-11-15-career-industry-guide-design.md`
- 实现计划：`docs/superpowers/plans/2026-11-15-career-industry-guide.md`

页面不提供综合评分，也不编造集中度、在招职位或薪资。公开招聘的活页核验尚未完整，站点会标明这一限制。原始研究提示词、个人隐私材料和未公开附件不应上传到本仓库。

## 本地预览

需要 Node.js 22 或与之兼容的当前版本。

```bash
npm install
npm test
npm run typecheck
npm run build
npm run preview
```

`npm run build` 会先校验 `src/data/`。指标有数值却缺来源、年份或口径，或者岗位被标成已完成活页核验却没有链接和日期时，构建失败。预览默认在本地端口打开，不发布到 GitHub Pages。

## 将来的 GitHub Pages 前缀

本阶段不启用 Pages，也不添加自动部署。如果以后单独批准发布到项目站点，可以在构建时传入仓库名作为前缀：

```bash
BASE_PATH=/career-industry-guide/ npm run build
```

`BASE_PATH` 默认为 `/`，适合本地预览和用户站根路径。只有在确认账号可以使用私有仓库 Pages、并且再次批准发布之后，才需要这个前缀。可选的 `SITE` 环境变量只用于将来生成绝对地址，现在留空。
