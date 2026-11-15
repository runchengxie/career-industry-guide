import type { Dataset, Metric, Role } from "./types.ts";
import { metricCategories } from "./types.ts";
import { allClaims } from "./support.ts";

const BANNED_KEYS = ["score", "rank", "rating", "recommendationIndex", "综合评分", "推荐指数"];

function blank(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}

function walkKeys(value: unknown, found: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) walkKeys(item, found);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (BANNED_KEYS.includes(key)) found.push(key);
      walkKeys(child, found);
    }
  }
}

function checkMetric(metric: Metric, sourceIds: Set<string>, errors: string[]): void {
  if (metric.availability === "value") {
    if (metric.value == null) errors.push(`指标 ${metric.id} 有数值状态但没有 value`);
    if (blank(metric.unit)) errors.push(`指标 ${metric.id} 有数值但缺少单位`);
    if (!Number.isInteger(metric.decimals) || metric.decimals < 0) {
      errors.push(`指标 ${metric.id} 的展示精度不合法`);
    }
    if (blank(metric.year)) errors.push(`指标 ${metric.id} 有数值但缺少年份`);
    if (blank(metric.scope)) errors.push(`指标 ${metric.id} 有数值但缺少口径`);
    if (blank(metric.geography)) errors.push(`指标 ${metric.id} 有数值但缺少地理范围`);
    if (metric.sourceIds.length === 0) errors.push(`指标 ${metric.id} 有数值但没有来源`);
    if (metric.nature === "self_calculated" && blank(metric.formula)) {
      errors.push(`指标 ${metric.id} 是自行测算但没有公式`);
    }
    if (metric.nature === "self_calculated" && (!metric.inputs || metric.inputs.length === 0)) {
      errors.push(`指标 ${metric.id} 是自行测算但没有输入值`);
    }
  } else {
    if (metric.value != null) errors.push(`指标 ${metric.id} 不是数值状态，不能带 value`);
  }
  if (!metricCategories.includes(metric.category)) {
    errors.push(`指标 ${metric.id} 的分类 ${metric.category} 不在规定类别里`);
  }
  for (const sourceId of metric.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`指标 ${metric.id} 引用了不存在的来源 ${sourceId}`);
  }
}

function checkRole(role: Role, sourceIds: Set<string>, industryIds: Set<string>, errors: string[]): void {
  if (role.verification === "verified") {
    if (blank(role.employer)) errors.push(`岗位 ${role.id} 已完成活页核验但缺少雇主`);
    if (blank(role.postingTitle)) errors.push(`岗位 ${role.id} 已完成活页核验但缺少职位标题`);
    if (blank(role.postingUrl)) errors.push(`岗位 ${role.id} 已完成活页核验但缺少链接`);
    if (blank(role.verifiedOn)) errors.push(`岗位 ${role.id} 已完成活页核验但缺少核验日期`);
  }
  if (role.verification === "materials" && blank(role.materialNature)) {
    errors.push(`岗位 ${role.id} 仅见材料但没有说明材料性质`);
  }
  if (role.verification === "unverified" && role.verifiedOn != null) {
    errors.push(`岗位 ${role.id} 尚未核验，不能填写核验日期`);
  }
  if (role.verification !== "unverified" && role.sourceIds.length === 0) {
    errors.push(`岗位 ${role.id} 缺少来源`);
  }
  for (const sourceId of role.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`岗位 ${role.id} 引用了不存在的来源 ${sourceId}`);
  }
  for (const industryId of role.industryIds) {
    if (!industryIds.has(industryId)) errors.push(`岗位 ${role.id} 引用了不存在的行业 ${industryId}`);
  }
}

export function validateDataset(data: Dataset): string[] {
  const errors: string[] = [];
  const banned: string[] = [];
  walkKeys(data, banned);
  for (const key of banned) errors.push(`数据含有排名字段 ${key}`);

  if (data.meta.researchVersion !== "2026-11-15") {
    errors.push("研究版本日期必须是 2026-11-15");
  }
  if (data.meta.timezone !== "Asia/Shanghai") {
    errors.push("研究时区必须是 Asia/Shanghai");
  }

  const sourceIds = new Set(data.sources.map((source) => source.id));
  if (sourceIds.size !== data.sources.length) errors.push("来源 id 重复");
  for (const source of data.sources) {
    if (!/^https?:\/\//.test(source.url)) errors.push(`来源 ${source.id} 的 URL 不是 http(s)`);
    if (blank(source.author) || blank(source.title) || blank(source.accessed)) {
      errors.push(`来源 ${source.id} 缺少机构、标题或访问日期`);
    }
  }

  const industryIds = new Set(data.industries.map((industry) => industry.id));
  const roleIds = new Set(data.roles.map((role) => role.id));
  if (industryIds.size !== data.industries.length) errors.push("行业 id 重复");
  if (roleIds.size !== data.roles.length) errors.push("岗位 id 重复");

  const metricIds = new Set<string>();
  for (const metric of data.metrics) {
    if (metricIds.has(metric.id)) errors.push(`指标 id 重复 ${metric.id}`);
    metricIds.add(metric.id);
    if (!industryIds.has(metric.subjectId) && !roleIds.has(metric.subjectId)) {
      errors.push(`指标 ${metric.id} 的主体 ${metric.subjectId} 不是已录入的行业或岗位`);
    }
    checkMetric(metric, sourceIds, errors);
  }

  const directionIds = new Set(data.meta.directions.map((direction) => direction.id));
  if (directionIds.size !== data.meta.directions.length) errors.push("方向 id 重复");
  for (const direction of data.meta.directions) {
    if (blank(direction.label)) errors.push(`方向 ${direction.id} 缺少名称`);
  }
  for (const role of data.roles) {
    if (!directionIds.has(role.direction)) {
      errors.push(`岗位 ${role.id} 的方向 ${role.direction} 不在 meta.directions 里`);
    }
    for (const industryId of role.industryIds) {
      const industry = data.industries.find((item) => item.id === industryId);
      if (industry && !industry.roleIds.includes(role.id)) {
        errors.push(`岗位 ${role.id} 属于 ${industryId}，但该行业的 roleIds 没有列出它`);
      }
    }
  }

  for (const role of data.roles) checkRole(role, sourceIds, industryIds, errors);

  for (const industry of data.industries) {
    for (const roleId of industry.roleIds) {
      if (!roleIds.has(roleId)) errors.push(`行业 ${industry.id} 引用了不存在的岗位 ${roleId}`);
    }
    const referencedMetrics = [
      ...industry.metricIds,
      ...industry.homeMetricIds.demand,
      ...industry.homeMetricIds.profit,
    ];
    for (const metricId of referencedMetrics) {
      if (!metricIds.has(metricId)) errors.push(`行业 ${industry.id} 引用了不存在的指标 ${metricId}`);
    }
    for (const metricId of [...industry.homeMetricIds.demand, ...industry.homeMetricIds.profit]) {
      if (!industry.metricIds.includes(metricId)) {
        errors.push(`行业 ${industry.id} 的首页指标 ${metricId} 不在它的 metricIds 里`);
      }
    }
    for (const metricId of industry.metricIds) {
      const metric = data.metrics.find((item) => item.id === metricId);
      if (metric && metric.subjectId !== industry.id) {
        errors.push(`行业 ${industry.id} 列出了指标 ${metricId}，但该指标主体是 ${metric.subjectId}`);
      }
    }
    const blocks = [
      ...industry.definition,
      ...industry.demand,
      ...industry.dailyWork,
      ...industry.thresholds,
      ...industry.geographyLimits,
      ...industry.profit,
      ...industry.risks,
    ];
    for (const claim of blocks) {
      if (claim.kind === "evidence" && claim.sourceIds.length === 0) {
        errors.push(`行业 ${industry.id} 的证据 ${claim.id} 没有来源`);
      }
      for (const sourceId of claim.sourceIds) {
        if (!sourceIds.has(sourceId)) errors.push(`段落 ${claim.id} 引用了不存在的来源 ${sourceId}`);
      }
    }
  }

  const claimIds = new Set<string>();
  for (const claim of allClaims(data)) {
    if (claimIds.has(claim.id)) errors.push(`段落 id 重复 ${claim.id}`);
    claimIds.add(claim.id);
  }

  return errors;
}

export function assertValid(data: Dataset): void {
  const errors = validateDataset(data);
  if (errors.length > 0) {
    const error = new Error(errors.join("\n"));
    error.name = "DatasetValidationError";
    throw error;
  }
}
