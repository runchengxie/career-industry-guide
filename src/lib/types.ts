export type DirectionId = "all" | "marketing" | "community" | "destination";

export type Availability = "value" | "unavailable" | "unverified";

export type MetricNature =
  "official" | "institution_estimate" | "company_disclosure" | "self_calculated" | "forecast" | "restatement";

export type Verification = "verified" | "materials" | "unverified";

/** 指标分类：数据页的“数据地图”按它排列，顺序即求职时想知道的顺序。 */
export const metricCategories = [
  "需求规模",
  "增长",
  "人均花费",
  "结构",
  "公司财务",
  "薪资",
  "市场集中度",
  "在招职位",
  "用工结构",
  "从业人员时序",
  "变动原因",
] as const;

export type MetricCategory = (typeof metricCategories)[number];

export type HumanitiesFit = "match" | "adjacent";

export interface Source {
  id: string;
  author: string;
  title: string;
  published: string | null;
  accessed: string;
  url: string;
}

export interface Metric {
  id: string;
  subjectId: string;
  name: string;
  availability: Availability;
  display: string | null;
  unit: string | null;
  year: string | null;
  geography: string | null;
  scope: string | null;
  nature: MetricNature;
  sourceIds: string[];
  formula: string | null;
  inputs: number[] | null;
  note: string | null;
  /** 指标分类，数据页的数据地图按它排列。 */
  category: MetricCategory;
}

export interface Role {
  id: string;
  slug: string;
  name: string;
  direction: Exclude<DirectionId, "all">;
  humanitiesFit: HumanitiesFit;
  industryIds: string[];
  summary: string;
  dailyWork: string;
  preparation: string[];
  verification: Verification;
  materialNature: string | null;
  limits: string;
  employer: string | null;
  postingTitle: string | null;
  postingUrl: string | null;
  verifiedOn: string | null;
  sourceIds: string[];
}

export interface Claim {
  id: string;
  text: string;
  kind: "evidence" | "judgment" | "gap";
  sourceIds: string[];
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  comparison: {
    definition: string;
    demand: string;
    roles: string;
    entry: string;
    profit: string;
    risks: string;
    gaps: string;
  };
  definition: Claim[];
  demand: Claim[];
  dailyWork: Claim[];
  thresholds: Claim[];
  portfolio: string[];
  geographyLimits: Claim[];
  profit: Claim[];
  risks: Claim[];
  openQuestions: string[];
  roleIds: string[];
  metricIds: string[];
  homeMetricIds: { demand: string[]; profit: string[] };
}

export interface DirectionOption {
  id: DirectionId;
  label: string;
  detail: string | null;
}

export interface Meta {
  researchVersion: string;
  timezone: string;
  locale: string;
  title: string;
  sampleNote: string;
  disclaimer: string;
  publicationStatus: string;
  verificationLimit: string;
  geography: string;
  directions: DirectionOption[];
  method: Claim[];
  unverifiedItems: string[];
}

export interface Dataset {
  meta: Meta;
  sources: Source[];
  metrics: Metric[];
  industries: Industry[];
  roles: Role[];
}
