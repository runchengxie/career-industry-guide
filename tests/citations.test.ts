import assert from "node:assert/strict";
import test from "node:test";
import { createCitations } from "../src/lib/citations.ts";
import { loadDataset } from "../src/lib/load.ts";
import type { Source } from "../src/lib/types.ts";

function source(id: string): Source {
  return {
    id,
    author: "机构",
    title: "标题",
    published: null,
    accessed: "2026-11-15",
    url: "https://example.com",
  };
}

const sources = [source("a"), source("b"), source("c")];

test("按第一次出现的顺序编号，重复引用复用同一编号", () => {
  const citations = createCitations(sources);
  assert.equal(citations.number("b"), 1);
  assert.equal(citations.number("a"), 2);
  assert.equal(citations.number("b"), 1);
  assert.equal(citations.number("c"), 3);
});

test("未知来源不编号，也不占号", () => {
  const citations = createCitations(sources);
  assert.equal(citations.number("missing"), 0);
  assert.equal(citations.number("a"), 1);
});

test("页末来源表按编号连续排列", () => {
  const citations = createCitations(sources);
  citations.number("c");
  citations.number("a");
  const entries = citations.referenced();
  assert.deepEqual(
    entries.map((entry) => `${entry.number}:${entry.source.id}`),
    ["1:c", "2:a"],
  );
});

test("ref() 只在第一次出现时标 first，供页末 ↩ 跳回", () => {
  const citations = createCitations(sources);
  assert.deepEqual(citations.ref("a"), { number: 1, first: true });
  assert.deepEqual(citations.ref("a"), { number: 1, first: false });
  assert.deepEqual(citations.ref("b"), { number: 2, first: true });
  assert.deepEqual(citations.ref("missing"), { number: 0, first: false });
});

test("真实数据里每个被引用的来源都能排上号", () => {
  const data = loadDataset();
  const citations = createCitations(data.sources);
  for (const metric of data.metrics) {
    for (const sourceId of metric.sourceIds) {
      assert.ok(citations.number(sourceId) > 0, `${sourceId} 没有编号`);
    }
  }
  const numbers = citations.referenced().map((entry) => entry.number);
  assert.deepEqual(
    numbers,
    numbers.map((_, index) => index + 1),
  );
});
