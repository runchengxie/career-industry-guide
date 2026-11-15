import { describe, expect, it } from "vitest";
import { directionsForIndustry, getCatalog } from "../src/lib/catalog";
import { formatMetric } from "../src/lib/format";

const data = getCatalog();

describe("recorded catalog", () => {
  it("keeps exactly three comparison samples in sample order", () => {
    expect(data.industries.map((industry) => industry.slug)).toEqual([
      "advertising",
      "elderly-care",
      "domestic-tourism",
    ]);
    expect(JSON.stringify(data)).not.toContain("推荐指数");
    expect(JSON.stringify(data)).not.toContain("综合评分");
  });

  it("leaves salaries, concentration, revenue and employment gaps without numbers", () => {
    const ids = [
      "m-ad-salary",
      "m-elder-salary",
      "m-tour-salary",
      "m-ad-concentration",
      "m-elder-concentration",
      "m-tour-concentration",
      "m-elder-revenue",
      "m-ad-employment-series",
      "m-tour-employment",
      "m-elder-occupancy",
    ];
    for (const id of ids) {
      const metric = data.metrics.find((item) => item.id === id);
      expect(metric?.status).toBe("unavailable");
      expect(formatMetric(metric!)).toBe("暂无可靠数据");
    }
    expect(formatMetric(data.metrics.find((item) => item.id === "m-elder-decline-reason")!)).toBe("尚未核实");
  });

  it("does not mark any role as a fully verified live posting", () => {
    expect(data.roles.every((role) => role.verification.status !== "verified-posting")).toBe(true);
    expect(data.roles.find((role) => role.slug === "social-work")?.verification.status).toBe("materials-only");
    expect(data.roles.find((role) => role.slug === "destination-operations")?.verification.status).toBe(
      "unverified",
    );
  });

  it("ties the 2024 advertising revenue to the regulator transcript", () => {
    const metric = data.metrics.find((item) => item.id === "m-ad-2024-revenue");
    expect(metric?.value).toBe(15464.1);
    expect(metric?.sourceIds).toContain("s-samr-2024");
    expect(data.sources.find((source) => source.id === "s-samr-2024")?.url).toContain("scio.gov.cn");
  });

  it("keeps the 2025 advertising scope limitation visible", () => {
    expect(data.metrics.find((item) => item.id === "m-ad-2025-revenue")?.note).toContain("事业单位和规模以上企业");
  });

  it("filters industries only from recorded role directions", () => {
    expect(directionsForIndustry(data, "advertising").split(" ")).toEqual(["marketing"]);
    expect(directionsForIndustry(data, "elderly-care").split(" ").sort()).toEqual(["marketing", "social-service"]);
    expect(directionsForIndustry(data, "domestic-tourism")).toBe("destination");
  });

  it("gives every value a source URL and every source a date", () => {
    for (const source of data.sources) {
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.date.length).toBeGreaterThan(0);
    }
  });
});
