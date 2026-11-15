export interface FilterResult {
  visibleIndustries: string[];
  empty: boolean;
}

export function applyDirectionFilter(root: ParentNode, direction: string): FilterResult {
  const industryElements = [...root.querySelectorAll<HTMLElement>("[data-industry]")].filter(
    (element) => !element.hasAttribute("data-role"),
  );
  const visible = new Set<string>();

  for (const element of industryElements) {
    const id = element.dataset.industry ?? "";
    const directions = (element.dataset.directions ?? "").split(/\s+/).filter(Boolean);
    const show = direction === "all" || directions.includes(direction);
    setHidden(element, !show);
    if (show && id) visible.add(id);
  }

  const empty = direction !== "all" && visible.size === 0;
  const emptyState = root.querySelector<HTMLElement>("[data-empty-state]");
  if (emptyState) setHidden(emptyState, !empty);
  for (const board of root.querySelectorAll<HTMLElement>("[data-board]")) {
    setHidden(board, empty);
  }

  const matchList = root.querySelector<HTMLElement>("[data-match-list]");
  if (matchList) setHidden(matchList, direction === "all" || empty);

  for (const role of root.querySelectorAll<HTMLElement>("[data-role]")) {
    const show = direction === "all" || role.dataset.direction === direction;
    setHidden(role, !show);
  }

  return { visibleIndustries: [...visible], empty };
}

function setHidden(element: HTMLElement, hidden: boolean): void {
  if (hidden) element.setAttribute("hidden", "");
  else element.removeAttribute("hidden");
}
