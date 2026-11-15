import { applyDirectionFilter } from "../lib/filter";

export function initDirectionFilter(doc: Document = document): void {
  const root = doc.querySelector<HTMLElement>("[data-comparison]");
  const form = doc.querySelector<HTMLFormElement>("[data-direction-filter]");
  if (!root || !form) return;

  const sync = (direction: string) => {
    applyDirectionFilter(root, direction);
    const url = new URL(doc.location.href);
    if (direction === "all") url.searchParams.delete("direction");
    else url.searchParams.set("direction", direction);
    doc.defaultView?.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    const radio = form.querySelector<HTMLInputElement>(`input[value="${direction}"]`);
    if (radio) radio.checked = true;
  };

  form.addEventListener("change", () => {
    const selected = new FormData(form).get("direction");
    sync(typeof selected === "string" ? selected : "all");
  });

  doc.querySelector("[data-reset-direction]")?.addEventListener("click", () => {
    sync("all");
  });

  sync(new URL(doc.location.href).searchParams.get("direction") ?? "all");
}
