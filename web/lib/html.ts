// Converts rich-text/HTML (from the PocketBase editor) into clean plain text.
// The admin's WYSIWYG editor stores markup, and pasting from other apps drags in
// stray tags, nested empty <div>s and HTML entities. When a field is rendered as
// plain text (e.g. a service description on a card), that markup would otherwise
// leak onto the page as literal "<p>" tags and "&euml;". This strips it to the
// readable text: block tags become line breaks, other tags are removed, and the
// common entities are decoded. Runs server-side where this data is fetched.

const ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  euro: "€", cent: "¢", pound: "£", hellip: "…", middot: "·", bull: "•",
  ndash: "–", mdash: "—", deg: "°", times: "×", divide: "÷",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  laquo: "«", raquo: "»",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë",
  aacute: "á", agrave: "à", acirc: "â", auml: "ä", aring: "å",
  iacute: "í", igrave: "ì", iuml: "ï", icirc: "î",
  oacute: "ó", ograve: "ò", ouml: "ö", ocirc: "ô", oslash: "ø",
  uacute: "ú", ugrave: "ù", uuml: "ü", ucirc: "û",
  ccedil: "ç", ntilde: "ñ", szlig: "ß",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => codePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => codePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function codePoint(n: number): string {
  return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
}

// Formatting tags we keep when a field is rendered as HTML (product descriptions).
// Everything else is unwrapped (its text is kept) and ALL attributes are dropped,
// which removes editor/ChatGPT tracking junk (data-*, dir, ids) and any event
// handler or href, so there's no script/attribute XSS surface from pasted markup.
const ALLOWED_TAGS = new Set(["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "h3", "h4"]);

/** Sanitises rich text to a safe formatting subset, stripping junk and empty blocks. */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  let s = html
    .replace(/\r\n?/g, "\n")
    .replace(/<(script|style|iframe|noscript|svg|head)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  // Keep allowed tags (name only, no attributes); unwrap everything else.
  s = s.replace(/<(\/?)([a-z0-9]+)\b[^>]*?(\/?)>/gi, (m, slash, tag, selfClose) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return "";
    return t === "br" ? "<br>" : `<${slash}${t}>`;
  });
  // Drop blocks that are empty or whitespace/nbsp only, and loose whitespace/nbsp
  // left between tags or at the edges — repeatedly, to handle nesting.
  const empty = /<(p|li|ul|ol|h3|h4)>(?:\s|&nbsp;| |<br>)*<\/\1>/gi;
  const loose = /(^|>)(?:\s|&nbsp;| )+(<|$)/g;
  let prev: string;
  do {
    prev = s;
    s = s.replace(empty, "").replace(loose, "$1$2");
  } while (s !== prev);
  return s
    .replace(/^[ \t]*(?:&nbsp;| )+[ \t]*$/gim, "") // lone-nbsp lines → gone
    .replace(/(?:<br>\s*){2,}/gi, "<br>") // collapse stacked line breaks
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Rich-text/HTML → clean plain text, with block tags preserved as line breaks. */
export function htmlToText(html: string): string {
  if (!html) return "";
  const withBreaks = html
    .replace(/\r\n?/g, "\n")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6]|ul|ol|blockquote|tr|table|section)\s*>/gi, "\n");
  const decoded = decodeEntities(withBreaks.replace(/<[^>]+>/g, ""));
  return decoded
    .replace(/[^\S\n]+/g, " ") // collapse runs of spaces/tabs/nbsp, keep newlines
    .replace(/ *\n */g, "\n") // trim spaces around line breaks
    .replace(/\n{2,}/g, "\n") // collapse blank lines
    .trim();
}
