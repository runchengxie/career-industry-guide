import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (path) => readFileSync(`dist/${path}index.html`, "utf8");
const roles = JSON.parse(readFileSync("src/data/roles.json", "utf8"));
const industries = JSON.parse(readFileSync("src/data/industries.json", "utf8"));
const verified = roles.filter((role) => role.verification === "verified").length;

// 首页：导读入口与边界；筛选与完整对照在 /compare/
const home = read("");
assert.ok(home.includes('id="industry-guide"'), "首页缺少行业导读入口");
assert.ok(home.includes(`官网在招活页核验：${verified} / ${roles.length}`), "首页的核验计数应与数据一致");
assert.ok(home.includes("不是最佳行业名单"), "首页缺少范围声明");
assert.ok(home.includes('href="/compare/"') || home.includes("compare/"), "首页缺少对照页入口");

const compare = read("compare/");
assert.ok(compare.includes("<table"), "对照页缺少对照表");
assert.ok(compare.includes('name="direction"'), "对照页缺少方向筛选");
assert.ok(compare.includes("data-status"), "对照页缺少筛选结果播报");
assert.ok(compare.includes("不是排名"), "对照页缺少非排名声明");

// 三个行业页都要有速读区与阅读路径，不能只有样本页有
for (const industry of industries) {
  const html = read(`industries/${industry.slug}/`);
  assert.ok(html.includes('id="overview-title"'), `${industry.slug} 缺少速读区`);
  for (const anchor of ["#roles", "#demand", "#questions", "#sources"]) {
    assert.ok(html.includes(`href="${anchor}"`), `${industry.slug} 缺少 ${anchor} 链接`);
  }
  assert.ok(html.includes("不是招聘结论"), `${industry.slug} 速读区缺少边界说明`);
}

// 护理/医疗提示只属于养老页
assert.ok(read("industries/elderly-care/").includes("护理、康复和医疗技术岗位"), "养老页缺少相邻岗位提示");
for (const slug of ["advertising", "domestic-tourism"]) {
  assert.ok(!read(`industries/${slug}/`).includes("护理、康复和医疗技术岗位"), `${slug} 不应出现护理提示`);
}

// 所有岗位页都要有探索路径、证据边界和四个锚点
for (const role of roles) {
  const html = read(`roles/${role.slug}/`);
  assert.ok(html.includes("这是一条研究线索，不是一则招聘"), `${role.slug} 缺少证据边界`);
  for (const id of ["work", "prepare", "verification", "role-sources"]) {
    assert.ok(html.includes(`id="${id}"`), `${role.slug} 缺少 ${id} 小节`);
    assert.ok(html.includes(`href="#${id}"`), `${role.slug} 缺少 ${id} 导航`);
  }
  assert.ok(html.includes("这些是练习，不是已核验的雇主要求"), `${role.slug} 缺少练习边界`);
}

// 文章页数量与数据集一致，避免漏渲染
const industryPages = readdirSync("dist/industries").filter((name) => !name.endsWith(".html"));
assert.equal(industryPages.length, industries.length, "行业页数量与数据不一致");
console.log("Editorial rollout: home, 3 industry pages and 13 role pages share the same structure.");
