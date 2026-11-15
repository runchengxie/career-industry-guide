import { describe, expect, it } from "vitest";
import { applyDirectionFilter } from "../src/lib/filter";

function mount(): HTMLElement {
  document.body.innerHTML = `
    <div id="root">
      <p data-empty-state hidden>当前方向在已录入的三个样本中没有匹配岗位</p>
      <div data-board></div>
      <button type="button" data-reset-direction>恢复全部</button>
      <div data-match-list hidden></div>
      <article data-industry="advertising" data-directions="marketing">广告</article>
      <article data-industry="elderly-care" data-directions="social-service marketing">养老</article>
      <article data-industry="domestic-tourism" data-directions="destination marketing">旅游</article>
      <a data-role data-direction="marketing" data-industry="advertising">客户执行</a>
      <a data-role data-direction="social-service" data-industry="elderly-care">社工</a>
      <a data-role data-direction="destination" data-industry="domestic-tourism">目的地运营</a>
    </div>
  `;
  return document.getElementById("root")!;
}

describe("applyDirectionFilter", () => {
  it("keeps all three samples for the all direction", () => {
    const root = mount();
    const result = applyDirectionFilter(root, "all");

    expect(result.visibleIndustries.sort()).toEqual([
      "advertising",
      "domestic-tourism",
      "elderly-care",
    ]);
    expect(result.empty).toBe(false);
    expect(root.querySelector("[data-empty-state]")?.hasAttribute("hidden")).toBe(true);
    expect(root.querySelector("[data-match-list]")?.hasAttribute("hidden")).toBe(true);
  });

  it("keeps only industries and roles in the selected direction", () => {
    const root = mount();
    const result = applyDirectionFilter(root, "social-service");

    expect(result.visibleIndustries).toEqual(["elderly-care"]);
    expect(result.empty).toBe(false);
    expect(root.querySelector('[data-industry="advertising"]')?.hasAttribute("hidden")).toBe(true);
    expect(root.querySelector('[data-industry="domestic-tourism"]')?.hasAttribute("hidden")).toBe(true);
    expect(root.querySelector('[data-role][data-direction="social-service"]')?.hasAttribute("hidden")).toBe(
      false,
    );
    expect(root.querySelector('[data-role][data-direction="marketing"]')?.hasAttribute("hidden")).toBe(true);
    expect(root.querySelector("[data-match-list]")?.hasAttribute("hidden")).toBe(false);
  });

  it("shows the empty state when the direction matches no recorded role", () => {
    const root = mount();
    const result = applyDirectionFilter(root, "not-recorded");

    expect(result.visibleIndustries).toEqual([]);
    expect(result.empty).toBe(true);
    expect(root.querySelector("[data-empty-state]")?.hasAttribute("hidden")).toBe(false);
    expect(root.querySelector("[data-board]")?.hasAttribute("hidden")).toBe(true);
    expect(root.querySelector("[data-empty-state]")?.textContent).toContain("没有匹配岗位");
    expect(root.querySelector("[data-match-list]")?.hasAttribute("hidden")).toBe(true);
  });

  it("filters marketing and destination to the samples that actually contain them", () => {
    const root = mount();

    expect(applyDirectionFilter(root, "marketing").visibleIndustries.sort()).toEqual([
      "advertising",
      "domestic-tourism",
      "elderly-care",
    ]);
    expect(applyDirectionFilter(root, "destination").visibleIndustries).toEqual(["domestic-tourism"]);
  });
});
