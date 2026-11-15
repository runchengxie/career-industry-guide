import { describe, expect, it } from "vitest";
import { validateCatalog } from "../src/lib/validate";
import { catalog, metric, role } from "./helpers";

describe("validateCatalog", () => {
  it("rejects a numeric metric that has no source", () => {
    const data = catalog({
      metrics: [
        metric({
          id: "m1",
          status: "value",
          value: 15464.1,
          unit: "亿元",
          year: "2024",
          geography: "中国大陆",
          scope: "事业单位和规模以上企业广告业务收入",
          nature: "official",
          sourceIds: [],
        }),
      ],
    });

    expect(() => validateCatalog(data)).toThrow(/来源/);
  });

  it("rejects a verified posting that has no link or date", () => {
    const data = catalog({
      roles: [
        role({
          id: "social-work",
          verification: {
            status: "verified-posting",
            materialNature: null,
            limitation: "",
            employer: "泰康之家",
            postingTitle: "社工",
            url: null,
            verifiedOn: null,
          },
        }),
      ],
    });

    expect(() => validateCatalog(data)).toThrow(/核验/);
  });

  it("rejects a self-calculated metric that has no formula", () => {
    const data = catalog({
      metrics: [
        metric({
          id: "m-margin",
          status: "value",
          value: null,
          unit: "%",
          year: "2025",
          geography: "蓝色光标合并报表",
          scope: "归母净利润除以营业收入",
          nature: "self-calculated",
          sourceIds: ["s1"],
          formula: null,
          computed: {
            op: "ratio-percent",
            numerator: 224665777.93,
            denominator: 68692672430.48,
            digits: 3,
          },
        }),
      ],
    });

    expect(() => validateCatalog(data)).toThrow(/公式/);
  });

  it("rejects an unavailable metric stored as zero", () => {
    const data = catalog({
      metrics: [metric({ id: "m-zero", status: "unavailable", value: 0 })],
    });

    expect(() => validateCatalog(data)).toThrow(/暂无可靠数据|缺失/);
  });

  it("accepts an unavailable metric with a null value", () => {
    const data = catalog({
      metrics: [
        metric({
          id: "m-salary",
          name: "可靠薪资",
          status: "unavailable",
          value: null,
          note: "没有找到可靠的公开薪资口径。",
        }),
      ],
    });

    expect(() => validateCatalog(data)).not.toThrow();
  });
});
