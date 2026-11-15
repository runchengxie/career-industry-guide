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
    value: null,
    unit: null,
    decimals: 0,
    group: false,
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

test("有数值时由 value 与单位生成显示", () => {
  const text = formatMetric(
    metric({
      availability: "value",
      value: 15464.1,
      unit: "亿元",
      decimals: 1,
      group: false,
      year: "2024",
      scope: "事业单位和规模以上企业",
      sourceIds: ["s1"],
    }),
  );
  assert.equal(text, "15464.1亿元");
});

test("千分位与小数位按指标设置", () => {
  assert.equal(
    formatMetric(metric({ availability: "value", value: 68692672430.48, unit: "元", decimals: 2, group: true })),
    "68,692,672,430.48元",
  );
  assert.equal(
    formatMetric(metric({ availability: "value", value: 768, unit: "万张", decimals: 1, group: false })),
    "768.0万张",
  );
  assert.equal(
    formatMetric(metric({ availability: "value", value: 17.9, unit: "%", decimals: 1, group: false })),
    "17.9%",
  );
});
