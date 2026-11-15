import type { Catalog, Metric, Role } from "../src/lib/types";

export function metric(partial: Partial<Metric> & Pick<Metric, "id" | "status">): Metric {
  return {
    subjectType: "industry",
    subjectId: "advertising",
    name: "示例指标",
    value: null,
    unit: null,
    year: null,
    geography: null,
    scope: null,
    nature: null,
    sourceIds: [],
    formula: null,
    note: null,
    ...partial,
  };
}

export function role(partial: Partial<Role> & Pick<Role, "id">): Role {
  return {
    slug: partial.id,
    name: partial.id,
    directionId: "marketing",
    industryIds: ["advertising"],
    summary: "示例",
    dailyWork: ["示例"],
    preparation: ["示例"],
    sourceIds: [],
    verification: {
      status: "unverified",
      materialNature: null,
      limitation: "尚未核验具体职位。",
      employer: null,
      postingTitle: null,
      url: null,
      verifiedOn: null,
    },
    ...partial,
  };
}

export function catalog(overrides: Partial<Catalog> = {}): Catalog {
  return {
    meta: {
      researchVersionDate: "2026-11-15",
      timezone: "Asia/Shanghai",
      locale: "zh-CN",
      siteName: "职业行业研究指南",
      intro: ["示例"],
      directions: [
        { id: "all", label: "全部", description: "显示三个样本" },
        { id: "marketing", label: "营销传播", description: "客户执行、策略、公关、活动、内容、品牌宣传" },
        { id: "social-service", label: "社会服务与社区活动", description: "社工、文娱活动、生活管家、社区运营" },
        { id: "destination", label: "目的地与旅游产品", description: "目的地运营、旅游产品策划、景区营销、旅游内容" },
      ],
    },
    methods: {
      purpose: [],
      geography: [],
      timing: [],
      priority: [],
      rules: [],
      update: [],
      unverified: [],
    },
    industries: [],
    roles: [],
    metrics: [],
    sources: [{ id: "s1", organization: "示例", title: "示例", date: "2026-11-15", url: "https://example.com", supports: ["示例"] }],
    ...overrides,
  };
}
