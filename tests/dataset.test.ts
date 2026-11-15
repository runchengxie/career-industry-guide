import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import test from "node:test";
import { loadDataset } from "../src/lib/load.ts";
import { siteRoutes } from "../src/lib/routes.ts";
import { assertValid } from "../src/lib/validate.ts";
import { filterIndustries } from "../src/lib/filter.ts";

test("已录入的三个样本通过校验", () => {
  const data = loadDataset();
  assertValid(data);
  assert.deepEqual(
    data.industries.map((item) => item.slug),
    ["advertising", "elderly-care", "domestic-tourism"],
  );
  assert.equal(data.roles.some((role) => role.verification === "verified"), false);
});

test("真实数据的三个方向都能筛到样本，且不是排名", () => {
  const data = loadDataset();
  assert.equal(filterIndustries(data.industries, data.roles, "all").length, 3);
  assert.equal(filterIndustries(data.industries, data.roles, "marketing").length, 2);
  assert.deepEqual(
    filterIndustries(data.industries, data.roles, "community").map((item) => item.id),
    ["elderly-care"],
  );
  assert.deepEqual(
    filterIndustries(data.industries, data.roles, "destination").map((item) => item.id),
    ["domestic-tourism"],
  );
});

test("自行测算与公式输入一致", () => {
  const data = loadDataset();
  const byId = new Map(data.metrics.map((metric) => [metric.id, metric]));
  const margin = byId.get("bf-net-margin-2025");
  const occupancy = byId.get("elder-bed-use-2024");
  const per2024 = byId.get("tour-per-capita-2024");
  const per2025 = byId.get("tour-per-capita-2025");
  const change = byId.get("tour-per-capita-change");
  assert.ok(margin?.inputs && occupancy?.inputs && per2024?.inputs && per2025?.inputs && change?.inputs);
  const marginInputs = margin.inputs;
  const occupancyInputs = occupancy.inputs;
  const per2024Inputs = per2024.inputs;
  const per2025Inputs = per2025.inputs;
  const changeInputs = change.inputs;
  assert.equal(`${((marginInputs[0] / marginInputs[1]) * 100).toFixed(2)}%`, margin.display);
  assert.equal(`${((occupancyInputs[0] / occupancyInputs[1]) * 100).toFixed(1)}%`, occupancy.display);
  assert.equal(`${Math.round(per2024Inputs[0] / per2024Inputs[1])}元/人次`, per2024.display);
  assert.equal(`${Math.round(per2025Inputs[0] / per2025Inputs[1])}元/人次`, per2025.display);
  const before = changeInputs[0] / changeInputs[1];
  const after = changeInputs[2] / changeInputs[3];
  assert.equal((((after - before) / before) * 100).toFixed(1), "-6.4");
  assert.match(change.display ?? "", /6\.4%/);
});

test("行业、岗位和来源可以互相定位", () => {
  const data = loadDataset();
  const industryIds = new Set(data.industries.map((item) => item.id));
  const routes = siteRoutes(data);
  assert.equal(new Set(routes).size, routes.length);
  assert.ok(routes.includes("/methods/"));
  for (const role of data.roles) {
    assert.ok(routes.includes(`/roles/${role.slug}/`));
    for (const industryId of role.industryIds) assert.ok(industryIds.has(industryId));
  }
  const files = readdirSync(new URL("../src/data/", import.meta.url));
  assert.equal(files.some((file: string) => file.endsWith(".csv") || file.endsWith(".parquet")), false);
});

test("薪资、集中度和在招规模保持缺失", () => {
  const data = loadDataset();
  const missing = data.metrics.filter((metric) =>
    ["ad-salary", "ad-concentration", "ad-openings", "elder-revenue", "elder-salary", "tour-salary", "tour-concentration", "tour-employment-structure"].includes(metric.id),
  );
  assert.equal(missing.length, 8);
  for (const metric of missing) {
    assert.notEqual(metric.availability, "value");
    assert.equal(metric.display, null);
  }
});
