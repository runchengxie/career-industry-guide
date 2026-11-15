import type { ComputedValue, Metric, MetricNature, RoleVerificationStatus } from "./types";

export const natureLabel: Record<MetricNature, string> = {
  official: "官方统计",
  "institution-estimate": "机构估算",
  "company-disclosure": "企业披露",
  "self-calculated": "自行测算",
  forecast: "预测",
};

export const verificationLabel: Record<RoleVerificationStatus, string> = {
  "verified-posting": "已完成活页核验",
  "materials-only": "仅见招聘或年报材料",
  unverified: "尚未核验",
};

export function formatDisplayedValue(metric: Metric): string {
  const text = formatMetric(metric);
  if (metric.status !== "value" || metric.unit !== "元") return text;
  if (!/^-?\d+(\.\d+)?$/.test(text)) return text;
  const negative = text.startsWith("-");
  const [whole, fraction] = text.replace("-", "").split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

export function formatMetric(metric: Metric): string {
  if (metric.status === "unavailable") return "暂无可靠数据";
  if (metric.status === "unverified") return "尚未核实";
  if (metric.computed) return formatComputed(metric.computed);
  if (metric.value === null || metric.value === "") {
    throw new Error(`指标 ${metric.id} 有数值状态但没有数值`);
  }
  return String(metric.value);
}

function formatComputed(computed: ComputedValue): string {
  const digits = computed.digits ?? 2;
  if (computed.op === "ratio-percent") {
    return `${percent(required(computed.numerator), required(computed.denominator)).toFixed(digits)}%`;
  }
  if (computed.op === "percent-change") {
    const current = required(computed.numerator);
    const previous = required(computed.denominator);
    return `${(((current - previous) / previous) * 100).toFixed(digits)}%`;
  }
  if (computed.op === "percent-change-of-quotients") {
    const current = required(computed.numerator) / required(computed.denominator);
    const previous = required(computed.previousNumerator) / required(computed.previousDenominator);
    return `${(((current - previous) / previous) * 100).toFixed(digits)}%`;
  }
  if (computed.op === "divide") {
    return (required(computed.numerator) / required(computed.denominator)).toFixed(digits);
  }
  if (computed.op === "subtract-tenths") {
    return (((computed.a ?? NaN) - (computed.b ?? NaN)) / 10).toFixed(1);
  }
  throw new Error("未知测算方式");
}

function percent(numerator: number, denominator: number): number {
  return (numerator / denominator) * 100;
}

function required(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) throw new Error("测算缺少分子或分母");
  return value;
}
