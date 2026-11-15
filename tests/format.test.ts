import { describe, expect, it } from "vitest";
import { formatDisplayedValue, formatMetric } from "../src/lib/format";
import { metric } from "./helpers";

describe("formatMetric", () => {
  it("renders a missing metric as unavailable text instead of a number", () => {
    const text = formatMetric(
      metric({
        id: "m-salary",
        status: "unavailable",
        value: null,
      }),
    );

    expect(text).toBe("暂无可靠数据");
    expect(text).not.toMatch(/[0-9]/);
  });

  it("renders an unverified lead as unverified text", () => {
    expect(
      formatMetric(
        metric({
          id: "m-hhi",
          status: "unverified",
          value: null,
        }),
      ),
    ).toBe("尚未核实");
  });

  it("formats a self-calculated net margin from the filing inputs", () => {
    expect(
      formatMetric(
        metric({
          id: "m-margin",
          status: "value",
          value: null,
          unit: "%",
          computed: {
            op: "ratio-percent",
            numerator: 224665777.93,
            denominator: 68692672430.48,
            digits: 3,
          },
        }),
      ),
    ).toBe("0.327%");
  });

  it("groups exact yuan filing amounts without changing the digits", () => {
    expect(
      formatDisplayedValue(
        metric({
          id: "m-bf-revenue",
          status: "value",
          value: "68692672430.48",
          unit: "元",
        }),
      ),
    ).toBe("68,692,672,430.48");
  });

  it("formats per-trip spending and its change from paired official totals", () => {
    expect(
      formatMetric(
        metric({
          id: "m-2025-per-trip",
          status: "value",
          value: null,
          computed: { op: "divide", numerator: 63000, denominator: 65.22, digits: 2 },
        }),
      ),
    ).toBe("965.96");

    expect(
      formatMetric(
        metric({
          id: "m-per-trip-change",
          status: "value",
          value: null,
          computed: {
            op: "percent-change",
            numerator: 63000 / 65.22,
            denominator: 57500 / 56.15,
            digits: 2,
          },
        }),
      ),
    ).toBe("-5.67%");
  });
});
