import { test } from "node:test";
import assert from "node:assert/strict";
import { htmlToText, sanitizeHtml } from "@/lib/html";

// Shaped like what the admin's rich-text editor stored after pasting from ChatGPT.
const PASTED =
  '<div data-message-author-role="assistant"><p dir="auto" data-start="42">Voor fanatieke ski&euml;rs.</p>\r\n' +
  '<p>&nbsp;</p><ul data-start="511"><li data-section-id="x">Lengte: 170 cm</li></ul>' +
  '<div><div id="code-block-viewer"><div>&nbsp;</div></div></div></div>';

test("htmlToText: strips markup, decodes entities, keeps paragraph breaks", () => {
  assert.equal(htmlToText(PASTED), "Voor fanatieke skiërs.\nLengte: 170 cm");
  assert.equal(htmlToText("<p>Ski&rsquo;s &amp; boards&nbsp;&nbsp;</p>"), "Ski’s & boards");
  assert.equal(htmlToText(""), "");
});

test("sanitizeHtml: keeps formatting, drops attributes, junk and empty blocks", () => {
  assert.equal(
    sanitizeHtml(PASTED),
    "<p>Voor fanatieke ski&euml;rs.</p><ul><li>Lengte: 170 cm</li></ul>",
  );
});

test("sanitizeHtml: no script or attribute XSS survives", () => {
  const out = sanitizeHtml(
    '<p onclick="x()">hi</p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:x()">link</a>',
  );
  assert.equal(out, "<p>hi</p>link");
});
