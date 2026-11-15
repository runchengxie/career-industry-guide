import type { Catalog, Metric, Role } from "./types";

export function validateCatalog(catalog: Catalog): void {
  const sourceIds = new Set(catalog.sources.map((source) => source.id));
  assertUnique(catalog.sources.map((source) => source.id), "来源");
  assertUnique(catalog.metrics.map((metric) => metric.id), "指标");
  assertUnique(catalog.roles.map((role) => role.id), "岗位");
  assertUnique(catalog.industries.map((industry) => industry.id), "行业");

  for (const metric of catalog.metrics) {
    validateMetric(metric, sourceIds);
  }

  for (const role of catalog.roles) {
    validateRole(role, sourceIds);
  }

  const industryIds = new Set(catalog.industries.map((industry) => industry.id));
  const roleIds = new Set(catalog.roles.map((role) => role.id));
  const metricIds = new Set(catalog.metrics.map((metric) => metric.id));

  for (const source of catalog.sources) {
    if (!/^https?:\/\//.test(source.url)) throw new Error(`来源 ${source.id} 缺少可打开的 URL`);
  }

  for (const industry of catalog.industries) {
    for (const roleId of industry.roleIds) {
      if (!roleIds.has(roleId)) throw new Error(`行业 ${industry.id} 引用了不存在的岗位 ${roleId}`);
    }
    for (const metricId of Object.values(industry.metricIds).flat()) {
      if (!metricIds.has(metricId)) throw new Error(`行业 ${industry.id} 引用了不存在的指标 ${metricId}`);
    }
  }

  for (const role of catalog.roles) {
    for (const industryId of role.industryIds) {
      if (!industryIds.has(industryId)) {
        throw new Error(`岗位 ${role.id} 引用了不存在的行业 ${industryId}`);
      }
    }
  }

  for (const metric of catalog.metrics) {
    const known =
      metric.subjectType === "industry" ? industryIds.has(metric.subjectId) : roleIds.has(metric.subjectId);
    if (!known && (catalog.industries.length > 0 || catalog.roles.length > 0)) {
      throw new Error(`指标 ${metric.id} 的主体 ${metric.subjectId} 不存在`);
    }
  }
}

function validateMetric(metric: Metric, sourceIds: Set<string>): void {
  if (metric.status === "unavailable" || metric.status === "unverified") {
    if (metric.value !== null || metric.computed) {
      throw new Error(`指标 ${metric.id} 为缺失或未核实状态，不能写入数值。页面应显示暂无可靠数据或尚未核实。`);
    }
    return;
  }

  if (!metric.year || !metric.geography || !metric.scope || !metric.nature) {
    throw new Error(`指标 ${metric.id} 有数值，但缺少年份、地理范围、口径或数据性质`);
  }
  if (metric.sourceIds.length === 0) {
    throw new Error(`指标 ${metric.id} 有数值但没有来源`);
  }
  for (const sourceId of metric.sourceIds) {
    if (!sourceIds.has(sourceId)) throw new Error(`指标 ${metric.id} 的来源 ${sourceId} 不存在`);
  }
  if (metric.nature === "self-calculated" && !metric.formula?.trim()) {
    throw new Error(`指标 ${metric.id} 是自行测算，但没有公式`);
  }
  if (!metric.computed && (metric.value === null || metric.value === "")) {
    throw new Error(`指标 ${metric.id} 有数值状态但没有数值`);
  }
}

function validateRole(role: Role, sourceIds: Set<string>): void {
  const verification = role.verification;
  if (verification.status === "verified-posting") {
    if (!verification.employer || !verification.postingTitle || !verification.url || !verification.verifiedOn) {
      throw new Error(`岗位 ${role.id} 写成了已完成活页核验，但缺少雇主、标题、链接或核验日期`);
    }
  }
  if (!verification.limitation?.trim()) {
    throw new Error(`岗位 ${role.id} 缺少核验限制说明`);
  }
  if (verification.status === "materials-only" && !verification.materialNature?.trim()) {
    throw new Error(`岗位 ${role.id} 只见材料，但没有写明材料性质`);
  }
  for (const sourceId of role.sourceIds) {
    if (!sourceIds.has(sourceId)) throw new Error(`岗位 ${role.id} 的来源 ${sourceId} 不存在`);
  }
}

function assertUnique(ids: string[], label: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`${label} id 重复：${id}`);
    seen.add(id);
  }
}
