/**
 * 目录的两件小事：窄屏默认折叠，宽屏滚动时高亮当前小节。
 * 没有脚本时目录仍然可用，只是不会折叠、不会高亮。
 */
export function setupToc(doc: Document): void {
  const wrap = doc.querySelector<HTMLDetailsElement>(".toc-wrap");
  const view = doc.defaultView;
  if (wrap && view?.matchMedia("(max-width: 999px)").matches) {
    wrap.open = false;
  }

  const links = [...doc.querySelectorAll<HTMLAnchorElement>(".toc a[href^='#']")];
  if (links.length === 0 || typeof IntersectionObserver === "undefined") return;

  const byId = new Map<string, HTMLAnchorElement>();
  for (const link of links) byId.set(link.hash.slice(1), link);

  const active = (id: string): void => {
    for (const [key, link] of byId) {
      if (key === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  const order = [...byId.keys()];
  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      const first = order.find((id) => visible.has(id));
      if (first) active(first);
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
  );

  for (const id of order) {
    const section = doc.getElementById(id);
    if (section) observer.observe(section);
  }
}
