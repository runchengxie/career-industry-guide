import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(`dist/${path}index.html`, "utf8");
const home = read("");
const advertising = read("industries/advertising/");
const role = read("roles/digital-marketing/");
const roles = JSON.parse(readFileSync("src/data/roles.json", "utf8"));
const verified = roles.filter((role) => role.verification === "verified").length;
assert.match(home, new RegExp(`官网在招活页核验：${verified} / ${roles.length}`));
for (const id of ["industry-guide", "comparison"]) assert.ok(home.includes(`id="${id}"`));
assert.ok(home.includes("不是最佳行业名单"));
assert.ok(home.includes('name="direction"'));
assert.ok(home.includes("data-status"));
assert.ok(advertising.includes("先了解业务，再看岗位线索"));
assert.ok(!advertising.includes("护理、康复和医疗技术岗位"));
assert.ok(read("industries/elderly-care/").includes("护理、康复和医疗技术岗位"));
for (const id of ["work", "prepare", "verification", "role-sources"]) {
  assert.ok(role.includes(`id="${id}"`));
  assert.ok(role.includes(`href="#${id}"`));
}
assert.ok(role.includes("这是一条研究线索，不是一则招聘"));
assert.ok(role.includes("这些是练习，不是已核验的雇主要求"));
console.log("Editorial samples: rendered evidence boundaries, navigation and sample scoping passed.");
