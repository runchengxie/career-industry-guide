import assert from "node:assert/strict";
import test from "node:test";
import { loadDataset } from "../src/lib/load.ts";
import { allClaims, claimBlocks, supportIndex } from "../src/lib/support.ts";

test("来源的支撑列表覆盖正文里的每一条引用", () => {
  const data = loadDataset();
  const index = supportIndex(data);

  for (const metric of data.metrics) {
    for (const sourceId of metric.sourceIds) {
      assert.ok(index.get(sourceId)?.includes(metric.id), `${sourceId} 没记下指标 ${metric.id}`);
    }
  }
  for (const role of data.roles) {
    for (const sourceId of role.sourceIds) {
      assert.ok(index.get(sourceId)?.includes(role.id), `${sourceId} 没记下岗位 ${role.id}`);
    }
  }
  for (const claim of allClaims(data)) {
    for (const sourceId of claim.sourceIds) {
      assert.ok(index.get(sourceId)?.includes(claim.id), `${sourceId} 没记下段落 ${claim.id}`);
    }
  }
});

test("只在段落里出现的来源也进入支撑列表", () => {
  const data = loadDataset();
  const index = supportIndex(data);
  // 这一条此前要靠手工维护 sources.json 的 supports，已经漏了。
  assert.ok(index.get("src-bluefocus-2025")?.includes("ad-definition"));
  assert.ok(index.get("src-nankai-taikang")?.includes("elder-threshold"));
});

test("行业段落与来源列表可以互相定位", () => {
  const data = loadDataset();
  const index = supportIndex(data);

  for (const industry of data.industries) {
    for (const claim of claimBlocks(industry)) {
      for (const sourceId of claim.sourceIds) {
        assert.ok(index.has(sourceId), `${sourceId} 不在任何支撑列表里`);
      }
    }
  }
  for (const industry of data.industries) {
    const ids = claimBlocks(industry).map((claim) => claim.id);
    assert.equal(new Set(ids).size, ids.length, `${industry.id} 的段落 id 有重复`);
  }
});
