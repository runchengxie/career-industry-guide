import { emptyFilterMessage } from "../lib/filter.ts";

const allowed = new Set(["all", "marketing", "community", "destination"]);

export function applyDirection(root: ParentNode, direction: string): number {
  const seen = new Set<string>();
  root.querySelectorAll<HTMLElement>("[data-industry]").forEach((cell) => {
    const directions = (cell.dataset.directions ?? "").split(/\s+/).filter(Boolean);
    const show = direction === "all" || directions.includes(direction);
    cell.hidden = !show;
    if (show && cell.dataset.industry) seen.add(cell.dataset.industry);
    cell.querySelectorAll<HTMLElement>("[data-role-direction]").forEach((role) => {
      const match = direction === "all" || role.dataset.roleDirection === direction;
      role.hidden = !match;
    });
  });
  const empty = root.querySelector<HTMLElement>("[data-empty]");
  if (empty) empty.hidden = seen.size !== 0;
  return seen.size;
}

function selected(radios: HTMLInputElement[]): string {
  return radios.find((radio) => radio.checked)?.value ?? "all";
}

export function setupHomeFilter(doc: Document): void {
  const radios = [...doc.querySelectorAll<HTMLInputElement>('input[name="direction"]')];
  if (radios.length === 0) return;
  const requested = new URLSearchParams(doc.defaultView?.location.search ?? "").get("direction") ?? "all";
  const initial = allowed.has(requested) ? requested : "all";

  const sync = (direction: string, updateUrl: boolean) => {
    radios.forEach((radio) => {
      radio.checked = radio.value === direction;
    });
    applyDirection(doc, direction);
    if (updateUrl && doc.defaultView) {
      const url = new URL(doc.defaultView.location.href);
      if (direction === "all") url.searchParams.delete("direction");
      else url.searchParams.set("direction", direction);
      doc.defaultView.history.replaceState(null, "", url);
    }
  };

  radios.forEach((radio) => {
    radio.addEventListener("change", () => sync(selected(radios), true));
  });
  doc.querySelector("[data-reset]")?.addEventListener("click", () => sync("all", true));
  sync(initial, false);
}

export { emptyFilterMessage };
