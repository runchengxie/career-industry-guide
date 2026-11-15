import type { Catalog, Industry, Metric, Role, Source } from "./types";
import { validateCatalog } from "./validate";
import meta from "../data/meta.json";
import methods from "../data/methods.json";
import industries from "../data/industries.json";
import roles from "../data/roles.json";
import metrics from "../data/metrics.json";
import sources from "../data/sources.json";

export function getCatalog(): Catalog {
  const catalog = {
    meta,
    methods,
    industries,
    roles,
    metrics,
    sources,
  } as Catalog;
  validateCatalog(catalog);
  return catalog;
}

export function directionsForIndustry(catalog: Catalog, industryId: string): string {
  const ids = new Set(
    catalog.roles.filter((role) => role.industryIds.includes(industryId)).map((role) => role.directionId),
  );
  return [...ids].join(" ");
}

export function rolesForIndustry(catalog: Catalog, industryId: string): Role[] {
  const industry = catalog.industries.find((item) => item.id === industryId);
  if (!industry) return [];
  return industry.roleIds
    .map((roleId) => catalog.roles.find((role) => role.id === roleId))
    .filter((role): role is Role => Boolean(role));
}

export function metricsByIds(catalog: Catalog, ids: string[]): Metric[] {
  return ids
    .map((id) => catalog.metrics.find((metric) => metric.id === id))
    .filter((metric): metric is Metric => Boolean(metric));
}

export function sourcesByIds(catalog: Catalog, ids: string[]): Source[] {
  const unique = [...new Set(ids)];
  return unique
    .map((id) => catalog.sources.find((source) => source.id === id))
    .filter((source): source is Source => Boolean(source));
}

export function sourcesForIndustry(catalog: Catalog, industry: Industry): Source[] {
  const metricIds = Object.values(industry.metricIds).flat();
  const fromMetrics = metricsByIds(catalog, metricIds).flatMap((metric) => metric.sourceIds);
  const fromRoles = rolesForIndustry(catalog, industry.id).flatMap((role) => role.sourceIds);
  return sourcesByIds(catalog, [...fromMetrics, ...fromRoles]);
}

export function industryBySlug(catalog: Catalog, slug: string): Industry | undefined {
  return catalog.industries.find((industry) => industry.slug === slug);
}

export function roleBySlug(catalog: Catalog, slug: string): Role | undefined {
  return catalog.roles.find((role) => role.slug === slug);
}
