import type { MetricNature, Verification } from "./types.ts";

export const natureLabel: Record<MetricNature, string> = {
  official: "官方统计",
  institution_estimate: "机构估算",
  company_disclosure: "企业披露",
  self_calculated: "自行测算",
  forecast: "预测",
  restatement: "转述",
};

export const verificationLabel: Record<Verification, string> = {
  verified: "已完成活页核验",
  materials: "仅见招聘或年报材料",
  unverified: "尚未核验",
};
