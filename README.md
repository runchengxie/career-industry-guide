# 职业行业研究指南

这是一个公开的中文静态网站，用来对照广告营销服务、养老服务、国内旅游服务三个研究样本。它帮助查看需求、岗位入口、门槛、风险和证据，不是就业保证，也不是行业排名或求职中介。

研究版本日期：2026-11-15（Asia/Shanghai）。公开招聘岗位的活页核验尚未完整。两份研究提示词已脱敏收录于 `docs/prompts/`；个人隐私材料、原始对话和未公开附件不在本仓库中。

计划发布地址：<https://runchengxie.github.io/career-industry-guide/>

设计说明：`docs/superpowers/specs/2026-11-15-career-industry-guide-design.md`

实现计划：`docs/superpowers/plans/2026-11-15-career-industry-guide.md`

研究提示词：`docs/prompts/README.md`

## 本地预览

需要 Node.js 22。

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

`npm run verify` 依次跑数据校验、测试、类型检查、构建、产物检查（断链与必须出现/必须缺失的内容）和 HTML 规则检查（含无障碍），与 CI 的检查项一致。

不设置 `BASE_PATH` 时，站点前缀是 `/`，适合本地预览。

## GitHub Pages

发布工作流把前缀固定为 `/career-industry-guide/`，站点来源设为 `https://runchengxie.github.io`。可以用同样的变量在本地检查线上路径：

```bash
BASE_PATH=/career-industry-guide/ SITE=https://runchengxie.github.io npm run build
BASE_PATH=/career-industry-guide/ npm run check:dist
BASE_PATH=/career-industry-guide/ npm run preview
```

然后打开 `http://127.0.0.1:4321/career-industry-guide/`。构建前会校验数据：有数值却缺来源、年份或口径，或把岗位标成已完成活页核验却没有链接和日期，构建都会失败。

## 口径

页面不提供综合评分，也不编造薪资、市场集中度或在招职位。2024 与 2025 年广告收入的转述用词不同，养老床位的 767.9 万张和 768.0 万张并列保留。床位使用率没有计算，因为公报中的服务人数没有被定义成在住人数。国内旅游两次人均除法来自不同公报，不连成下降幅度。公司报表只说明该公司。高校就业网转载和招聘网站首页都不是已核验的在招活页。
