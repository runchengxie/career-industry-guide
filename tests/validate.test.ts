import assert from "node:assert/strict";
import test from "node:test";
import { assertValid } from "../src/lib/validate.ts";
import type { Dataset, Metric, Role } from "../src/lib/types.ts";

function metric(overrides: Partial<Metric> = {}): Metric {
  return {
    id: "m1",
    subjectId: "advertising",
    name: "广告业务收入",
    availability: "value",
    value: 15464.1,
    unit: "亿元",
    decimals: 1,
    group: false,
    year: "2024",
    geography: "中国大陆",
    scope: "事业单位和规模以上企业广告业务收入",
    nature: "restatement",
    sourceIds: ["s1"],
    formula: null,
    inputs: null,
    note: null,
    category: "薪资",
    comparison: null,
    ...overrides,
  };
}

function role(overrides: Partial<Role> = {}): Role {
  return {
    id: "role-1",
    slug: "public-relations",
    name: "公共关系",
    direction: "marketing",
    humanitiesFit: "match",
    industryIds: [],
    summary: "年报业务中出现的工作类型。",
    dailyWork: "本站没有已核验的职位说明书。",
    preparation: ["作品集"],
    verification: "materials",
    materialNature: "公司年度报告中的业务构成",
    limits: "不是在招活页。",
    employer: null,
    postingTitle: null,
    postingUrl: null,
    verifiedOn: null,
    sourceIds: ["s1"],
    ...overrides,
  };
}

function base(overrides: Partial<Dataset> = {}): Dataset {
  return {
    meta: {
      researchVersion: "2026-11-15",
      timezone: "Asia/Shanghai",
      locale: "zh-CN",
      title: "职业行业研究指南",
      sampleNote: "三个样本用于比较，不是排名。",
      disclaimer: "这是初步研究，不是就业保证。",
      publicationStatus: "尚未正式上线",
      verificationLimit: "截至 2026-11-15 的研究中，公开招聘岗位的活页核验尚未完整。",
      geography: "中国大陆",
      directions: [
        { id: "all", label: "全部", detail: null },
        { id: "marketing", label: "营销传播", detail: "客户执行等" },
        { id: "community", label: "社会服务", detail: "社工等" },
        { id: "destination", label: "目的地与旅游", detail: "目的地运营等" },
      ],
      method: [],
      unverifiedItems: [],
    },
    sources: [
      {
        id: "s1",
        author: "示例机构",
        title: "示例文献",
        published: "2026-02-28",
        accessed: "2026-11-15",
        url: "https://example.com/source",
      },
    ],
    metrics: [],
    industries: [],
    roles: [],
    ...overrides,
  };
}

test("有数值但没有 unit 或 value 时校验失败", () => {
  assert.throws(() => assertValid(base({ metrics: [metric({ unit: "" })] })), /单位/);
  assert.throws(() => assertValid(base({ metrics: [metric({ value: null })] })), /value/);
});

test("有数值但没有来源时校验失败", () => {
  const data = base({ metrics: [metric({ sourceIds: [] })] });
  assert.throws(() => assertValid(data), /来源/);
});

test("有数值但没有年份或口径时校验失败", () => {
  assert.throws(() => assertValid(base({ metrics: [metric({ year: "" })] })), /年份/);
  assert.throws(() => assertValid(base({ metrics: [metric({ scope: "" })] })), /口径/);
});

test("自行测算没有公式时校验失败", () => {
  const data = base({
    metrics: [metric({ nature: "self_calculated", formula: null, inputs: [1, 2] })],
  });
  assert.throws(() => assertValid(data), /公式/);
});

test("已完成活页核验但缺少链接或日期时校验失败", () => {
  const verified = role({
    verification: "verified",
    employer: "某雇主",
    postingTitle: "社工",
    postingUrl: null,
    verifiedOn: null,
  });
  assert.throws(() => assertValid(base({ roles: [verified] })), /链接|核验日期/);
});

test("缺失指标不能带可显示数字", () => {
  const data = base({
    metrics: [metric({ availability: "unavailable", value: 0, sourceIds: [] })],
  });
  assert.throws(() => assertValid(data), /不是数值状态，不能带 value/);
});

test("研究版本日期来自 meta，不写死在代码里", () => {
  const base0 = base();
  const moved = { ...base0, meta: { ...base0.meta, researchVersion: "2027-01-31" } };
  assert.doesNotThrow(() => assertValid(moved));

  const broken = { ...base0, meta: { ...base0.meta, researchVersion: "2026/11/15" } };
  assert.throws(() => assertValid(broken), /YYYY-MM-DD/);
});

test("排名字段被拒绝", () => {
  const data = base();
  (data as Dataset & { score?: number }).score = 90;
  assert.throws(() => assertValid(data), /score|排名/);
});

test("指标主体必须是已录入的行业或岗位", () => {
  assert.throws(
    () => assertValid(base({ metrics: [metric({ subjectId: "ghost-industry" })] })),
    /不是已录入的行业或岗位/,
  );
});

test("首页指标必须是该行业 metricIds 的子集", () => {
  const industry = {
    id: "advertising",
    slug: "advertising",
    name: "广告营销服务",
    comparison: {
      definition: "",
      demand: "",
      roles: "",
      entry: "",
      profit: "",
      risks: "",
      gaps: "",
    },
    definition: [],
    demand: [],
    dailyWork: [],
    thresholds: [],
    portfolio: [],
    geographyLimits: [],
    profit: [],
    risks: [],
    openQuestions: [],
    roleIds: [],
    metricIds: ["m1"],
    homeMetricIds: { demand: ["m2"], profit: [] },
  };
  assert.throws(
    () => assertValid(base({ metrics: [metric()], industries: [industry] })),
    /首页指标 m2 不在它的 metricIds 里/,
  );
});

test("岗位与行业的关联必须双向一致", () => {
  const industry = {
    id: "advertising",
    slug: "advertising",
    name: "广告营销服务",
    comparison: {
      definition: "",
      demand: "",
      roles: "",
      entry: "",
      profit: "",
      risks: "",
      gaps: "",
    },
    definition: [],
    demand: [],
    dailyWork: [],
    thresholds: [],
    portfolio: [],
    geographyLimits: [],
    profit: [],
    risks: [],
    openQuestions: [],
    roleIds: [],
    metricIds: [],
    homeMetricIds: { demand: [], profit: [] },
  };
  const linked = role({ industryIds: ["advertising"] });
  assert.throws(() => assertValid(base({ industries: [industry], roles: [linked] })), /该行业的 roleIds 没有列出它/);
});
