// Scroll-in entrances for the whole site. app/layout.tsx inlines this function as a
// script in <head>, so it runs before React loads and keeps working across client
// navigations (it watches the DOM for new elements).
//
// Markup:
//   data-reveal[="rise|fade|pop|settle|photo"]   the element enters once it scrolls into view
//   data-stagger[="rise|fade|pop"]               each direct child enters on its own
//   data-reveal-delay="120"               extra delay in ms
// Elements that come into view together enter one after another, in reading order.
//
// The hidden starting state is held with a Web Animation the moment an element is
// inserted (before the first paint), never with CSS and never by writing to the DOM.
// So without this script the page is simply static, and React hydration sees no change.
//
// Must stay self-contained: it is serialised with Function.prototype.toString().
export function initReveal() {
  if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const KINDS: Record<string, { from: Keyframe; ms: number; easing?: string }> = {
    rise: { from: { opacity: 0, translate: "0 28px" }, ms: 900 },
    fade: { from: { opacity: 0 }, ms: 800 },
    pop: { from: { opacity: 0, scale: "0.96" }, ms: 700 },
    // A photo inside a card (which clips it) fades in while easing back from a slight zoom.
    settle: { from: { opacity: 0, scale: "1.06" }, ms: 1300, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
    // Opens from the bottom edge like a shutter while the photo inside settles.
    photo: { from: { clipPath: "inset(0 0 100% 0)" }, ms: 1100, easing: "cubic-bezier(0.76, 0, 0.24, 1)" },
  };
  const STEP = 80; // ms between elements that enter together
  const MAX_STEPS = 6;
  const SELECTOR = "[data-reveal],[data-stagger]>*";

  const holds = new WeakMap<Element, Animation>();
  const done = new WeakSet<Element>();

  function kindOf(el: Element) {
    const name = el.hasAttribute("data-reveal")
      ? el.getAttribute("data-reveal")
      : el.parentElement?.getAttribute("data-stagger");
    return KINDS[name || ""] || KINDS.rise;
  }

  function enter(entries: IntersectionObserverEntry[], fullyVisibleOnly: boolean) {
    const entering = entries
      .filter((e) => e.isIntersecting && (!fullyVisibleOnly || e.intersectionRatio > 0.99))
      .map((e) => e.target)
      .filter((el) => !done.has(el))
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    // Reading order: top-level elements follow one another; an element inside one that
    // is entering too (a card's photo, a checklist row) follows its own container.
    const batch = new Set(entering);
    const start = new Map<Element, number>();
    const inner = new Map<Element, number>();
    let topLevel = 0;
    entering.forEach((el) => {
      let outer = el.parentElement;
      while (outer && !batch.has(outer)) outer = outer.parentElement;
      if (!outer) {
        start.set(el, Math.min(topLevel++, MAX_STEPS) * STEP);
      } else {
        const n = (inner.get(outer) || 0) + 1;
        inner.set(outer, n);
        start.set(el, (start.get(outer) || 0) + Math.min(n, MAX_STEPS) * STEP);
      }
    });
    entering.forEach((el) => {
      nearView.unobserve(el);
      fullView.unobserve(el);
      done.add(el);
      const kind = kindOf(el);
      const delay = (start.get(el) || 0) + (Number(el.getAttribute("data-reveal-delay")) || 0);
      el.animate([kind.from, {}], {
        duration: kind.ms,
        delay,
        easing: kind.easing || EASE,
        fill: "backwards",
      });
      if (kind === KINDS.photo) {
        el.querySelectorAll("img").forEach((img) =>
          img.animate([{ scale: "1.12" }, { scale: "1" }], {
            duration: 1600,
            delay,
            easing: "cubic-bezier(0.33, 1, 0.68, 1)",
            fill: "backwards",
          }),
        );
      }
      holds.get(el)?.cancel();
      holds.delete(el);
    });
  }

  // Enter once the top edge is a little way into the screen (threshold 0, so an element
  // taller than the screen fires too)…
  const nearView = new IntersectionObserver((e) => enter(e, false), {
    rootMargin: "0px 0px -6% 0px",
  });
  // …or as soon as it is entirely on screen, so a short element in that bottom strip
  // that can't scroll any higher (the end of a pop-up) is never left hidden.
  const fullView = new IntersectionObserver((e) => enter(e, true), { threshold: 1 });

  function hold(el: Element) {
    if (holds.has(el) || done.has(el)) return;
    const from = kindOf(el).from;
    holds.set(el, el.animate([from, from], { duration: 1, fill: "forwards" }));
    nearView.observe(el);
    fullView.observe(el);
  }

  function scan(node: Node) {
    if (!(node instanceof Element)) return;
    if (node.matches(SELECTOR)) hold(node);
    node.querySelectorAll(SELECTOR).forEach(hold);
  }

  new MutationObserver((records) =>
    records.forEach((r) => r.addedNodes.forEach(scan)),
  ).observe(document.documentElement, { childList: true, subtree: true });
  scan(document.documentElement);
}
