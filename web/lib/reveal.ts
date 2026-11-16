// Scroll-in entrances for the whole site. app/layout.tsx inlines this function as a
// script in <head>, so it runs before React loads and keeps working across client
// navigations (it watches the DOM for new elements).
//
// Markup:
//   data-reveal[="rise|fade|pop|settle|photo"]   the element enters once it scrolls into view
//                                                (settle/photo wait for their picture to load)
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
  const SOFT = "cubic-bezier(0.33, 1, 0.68, 1)";
  type Kind = {
    from: Keyframe;
    ms: number;
    easing?: string;
    hasPhoto?: boolean; // wait for its picture to load, so a frame never enters empty
    zoomPhoto?: boolean; // the picture inside also eases back from a slight zoom
  };
  // Every move starts at once and decelerates (ease-out): a curve that starts slowly reads
  // as lag. Only opacity, translate and scale, which the GPU animates smoothly.
  const KINDS: Record<string, Kind> = {
    rise: { from: { opacity: 0, translate: "0 28px" }, ms: 900 },
    fade: { from: { opacity: 0 }, ms: 800 },
    pop: { from: { opacity: 0, scale: "0.96" }, ms: 700 },
    // A photo inside a card (which clips it) fades in while easing back from a slight zoom.
    settle: { from: { opacity: 0, scale: "1.06" }, ms: 1300, easing: SOFT, hasPhoto: true },
    // A framed photo rises in with the text beside it while the picture settles inside.
    photo: { from: { opacity: 0, translate: "0 24px" }, ms: 900, hasPhoto: true, zoomPhoto: true },
  };
  const STEP = 80; // ms between elements that enter together
  const MAX_STEPS = 6;
  const SELECTOR = "[data-reveal],[data-stagger]>*";

  const holds = new WeakMap<Element, Animation>();
  const done = new WeakSet<Element>();

  // Resolves once the element's pictures are decoded, or after a short wait at most.
  function photosReady(el: Element): Promise<unknown> {
    const loading = Array.from(el.querySelectorAll("img")).filter((img) => !img.complete);
    if (!loading.length) return Promise.resolve();
    return Promise.race([
      Promise.all(loading.map((img) => img.decode().catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, 700)),
    ]);
  }

  function kindOf(el: Element): Kind {
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
      const play = (wait: number) => {
        el.animate([kind.from, {}], {
          duration: kind.ms,
          delay: wait,
          easing: kind.easing || EASE,
          fill: "backwards",
        });
        if (kind.zoomPhoto) {
          el.querySelectorAll("img").forEach((img) =>
            img.animate([{ scale: "1.08" }, { scale: "1" }], {
              duration: 1400,
              delay: wait,
              easing: SOFT,
              fill: "backwards",
            }),
          );
        }
        holds.get(el)?.cancel();
        holds.delete(el);
      };
      if (!kind.hasPhoto) return play(delay);
      // Time spent waiting for the picture counts towards its place in the sequence.
      const asked = performance.now();
      photosReady(el).then(() => play(Math.max(0, delay - (performance.now() - asked))));
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
