import type { Dataset, Industry, Meta, Metric, Role, Source } from "./types.ts";
import meta from "../data/meta.json";
import sources from "../data/sources.json";
import metrics from "../data/metrics.json";
import industries from "../data/industries.json";
import roles from "../data/roles.json";

export function loadDataset(): Dataset {
  return {
    meta: meta as Meta,
    sources: sources as Source[],
    metrics: metrics as Metric[],
    industries: industries as Industry[],
    roles: roles as Role[],
  };
}
