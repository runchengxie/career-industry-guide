import assert from "node:assert/strict";
import test from "node:test";
import { emptyFilterMessage, filterIndustries, matchingRoles } from "../src/lib/filter.ts";
import type { Industry, Role } from "../src/lib/types.ts";

function industry(id: string, roleIds: string[]): Industry {
  return {
    id,
    slug: id,
    name: id,
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
    roleIds,
    metricIds: [],
    homeMetricIds: { demand: [], profit: [] },
  };
}

function role(id: string, industryId: string, direction: Role["direction"]): Role {
  return {
    id,
    slug: id,
    name: id,
    direction,
    humanitiesFit: "match",
    industryIds: [industryId],
    summary: "",
    dailyWork: "",
    preparation: [],
    verification: "unverified",
    materialNature: null,
    limits: "",
    employer: null,
    postingTitle: null,
    postingUrl: null,
    verifiedOn: null,
    sourceIds: [],
  };
}

const industries = [
  industry("advertising", ["ad-pr"]),
  industry("elderly-care", ["care-social", "care-marketing"]),
  industry("domestic-tourism", ["tour-dest"]),
];

const roles = [
  role("ad-pr", "advertising", "marketing"),
  role("care-social", "elderly-care", "community"),
  role("care-marketing", "elderly-care", "marketing"),
  role("tour-dest", "domestic-tourism", "destination"),
];

test("全部方向保留三个行业", () => {
  assert.deepEqual(
    filterIndustries(industries, roles, "all").map((item) => item.id),
    ["advertising", "elderly-care", "domestic-tourism"],
  );
});

test("营销传播保留广告和养老", () => {
  assert.deepEqual(
    filterIndustries(industries, roles, "marketing").map((item) => item.id),
    ["advertising", "elderly-care"],
  );
  assert.deepEqual(
    matchingRoles(roles, "elderly-care", "marketing").map((item) => item.id),
    ["care-marketing"],
  );
});

test("社会服务只保留养老", () => {
  assert.deepEqual(
    filterIndustries(industries, roles, "community").map((item) => item.id),
    ["elderly-care"],
  );
});

test("目的地与旅游产品只保留国内旅游", () => {
  assert.deepEqual(
    filterIndustries(industries, roles, "destination").map((item) => item.id),
    ["domestic-tourism"],
  );
});

test("没有匹配岗位时返回空列表和固定文案", () => {
  const onlyMarketing = roles.map((item) => ({ ...item, direction: "marketing" as const }));
  const matched = filterIndustries(industries, onlyMarketing, "destination");
  assert.deepEqual(matched, []);
  assert.equal(emptyFilterMessage, "当前方向在已录入的三个样本中没有匹配岗位");
});

test("相邻岗位不把行业留在筛选结果里", () => {
  const adjacent = roles.map((item) =>
    item.id === "tour-dest" ? { ...item, humanitiesFit: "adjacent" as const } : item,
  );
  assert.deepEqual(
    filterIndustries(industries, adjacent, "destination").map((item) => item.id),
    [],
  );
});
