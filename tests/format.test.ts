import assert from "node:assert/strict";
import test from "node:test";
import { formatMetric } from "../src/lib/format.ts";
import type { Metric } from "../src/lib/types.ts";

function metric(overrides: Partial<Metric>): Metric {
  return {
    id: "m",
    subjectId: "advertising",
    name: "薪资",
    availability: "unavailable",
    display: null,
    unit: null,
    year: null,
    geography: "中国大陆",
    scope: null,
    nature: "official",
    sourceIds: [],
    formula: null,
    inputs: null,
    note: null,
    category: "薪资",
    ...overrides,
  };
}

test("没有可靠数据时不渲染数字或零", () => {
  const text = formatMetric(metric({ availability: "unavailable" }));
  assert.equal(text, "暂无可靠数据");
  assert.equal(/\d/.test(text), false);
});

test("尚未核实的线索不渲染成数字", () => {
  const text = formatMetric(metric({ availability: "unverified", name: "集中度" }));
  assert.equal(text, "尚未核实");
  assert.equal(text.includes("0"), false);
});

test("有数值时保留展示字符串并附年份", () => {
  const text = formatMetric(
    metric({
      availability: "value",
      display: "15464.1亿元",
      year: "2024",
      scope: "事业单位和规模以上企业",
      sourceIds: ["s1"],
    }),
  );
  assert.match(text, /15464\.1亿元/);
  assert.match(text, /2024/);
});
