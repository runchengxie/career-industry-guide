export type DirectionId = "all" | "marketing" | "social-service" | "destination";

export interface Direction {
  id: DirectionId | string;
  label: string;
  description: string;
}

export interface Meta {
  researchVersionDate: string;
  timezone: string;
  locale: string;
  siteName: string;
  intro: string[];
  directions: Direction[];
}

export type MetricStatus = "value" | "unavailable" | "unverified";

export type MetricNature =
  | "official"
  | "institution-estimate"
  | "company-disclosure"
  | "self-calculated"
  | "forecast";

export interface ComputedValue {
  op: "ratio-percent" | "divide" | "percent-change" | "percent-change-of-quotients" | "subtract-tenths";
  numerator?: number;
  denominator?: number;
  previousNumerator?: number;
  previousDenominator?: number;
  a?: number;
  b?: number;
  digits?: number;
}

export interface Metric {
  id: string;
  subjectType: "industry" | "role";
  subjectId: string;
  name: string;
  status: MetricStatus;
  value: number | string | null;
  unit: string | null;
  year: string | null;
  geography: string | null;
  scope: string | null;
  nature: MetricNature | null;
  sourceIds: string[];
  formula: string | null;
  note: string | null;
  computed?: ComputedValue;
}

export type RoleVerificationStatus = "verified-posting" | "materials-only" | "unverified";

export interface RoleVerification {
  status: RoleVerificationStatus;
  materialNature: string | null;
  limitation: string;
  employer: string | null;
  postingTitle: string | null;
  url: string | null;
  verifiedOn: string | null;
}

export interface Role {
  id: string;
  slug: string;
  name: string;
  directionId: "marketing" | "social-service" | "destination";
  industryIds: string[];
  summary: string;
  dailyWork: string[];
  preparation: string[];
  sourceIds: string[];
  verification: RoleVerification;
}

export interface Inference {
  topic: string;
  evidence: string;
  judgment: string;
}

export interface AdjacentRole {
  name: string;
  note: string;
}

export interface IndustryComparison {
  definition: string;
  demand: string;
  entry: string;
  profit: string;
  risks: string;
  gaps: string;
}

export interface Industry {
  id: string;
  slug: string;
  name: string;
  definition: string[];
  demand: string[];
  dailyWork: string[];
  entry: string[];
  portfolio: string[];
  geographyLimits: string[];
  profitability: string[];
  risks: string[];
  openQuestions: string[];
  roleIds: string[];
  adjacentRoles: AdjacentRole[];
  inferences: Inference[];
  comparison: IndustryComparison;
  metricIds: {
    demand: string[];
    entry: string[];
    profit: string[];
    gaps: string[];
  };
}

export interface Source {
  id: string;
  organization: string;
  title: string;
  date: string;
  url: string;
  supports: string[];
  note?: string;
}

export interface MethodsPage {
  purpose: string[];
  geography: string[];
  timing: string[];
  priority: string[];
  rules: string[];
  update: string[];
  unverified: string[];
}

export interface Catalog {
  meta: Meta;
  methods: MethodsPage;
  industries: Industry[];
  roles: Role[];
  metrics: Metric[];
  sources: Source[];
}
