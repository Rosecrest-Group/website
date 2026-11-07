import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { buildTextIndex, describeRange, findQuote, locateAnchor } from "./anchor";

function page(html: string) {
  const { document } = new JSDOM(`<div id="root">${html}</div>`).window;
  return { document, root: document.getElementById("root")! };
}

describe("buildTextIndex", () => {
  it("collapses source whitespace and skips scripts and styles", () => {
    const { root } = page(`<p>Hello
        world</p><script>var hidden = 1;</script><style>p { color: red }</style>`);
    assert.equal(buildTextIndex(root).text, "Hello world");
  });
});

describe("describeRange", () => {
  it("captures a selection that crosses elements, with the text around it", () => {
    const { document, root } = page("<p>A level <strong>two survey</strong> costs less</p>");
    const paragraph = root.querySelector("p")!;
    const range = document.createRange();
    range.setStart(paragraph.firstChild!, 2);
    range.setEnd(paragraph.lastChild!, 6);

    assert.deepEqual(describeRange(buildTextIndex(root), range), {
      quote: "level two survey costs",
      prefix: "A ",
      suffix: " less",
    });
  });

  it("returns null for a selection outside the root", () => {
    const { document, root } = page("<p>Inside</p>");
    const outside = document.createElement("p");
    outside.textContent = "Outside";
    document.body.appendChild(outside);
    const range = document.createRange();
    range.selectNodeContents(outside);

    assert.equal(describeRange(buildTextIndex(root), range), null);
  });
});

describe("findQuote", () => {
  const text = "Call us today. We survey homes. Call us today for a quote.";

  it("uses the surrounding text to pick between repeated wording", () => {
    const found = findQuote(text, { quote: "Call us today", prefix: "homes. ", suffix: " for a" });
    assert.equal(found?.start, text.lastIndexOf("Call us today"));
  });

  it("still finds the quote when the surrounding copy has changed", () => {
    const found = findQuote("Fresh intro. We survey homes.", {
      quote: "We survey homes",
      prefix: "Old intro. ",
      suffix: " Old ending",
    });
    assert.equal(found?.start, 13);
  });

  it("returns null once the quoted words have been edited", () => {
    assert.equal(findQuote(text, { quote: "Phone us today", prefix: "", suffix: "" }), null);
  });
});

describe("locateAnchor", () => {
  it("rebuilds a range across elements that reads back as the quote", () => {
    const { document, root } = page(`<p>A level <strong>two
      survey</strong> costs less</p>`);
    const index = buildTextIndex(root);
    const range = locateAnchor(
      index,
      { quote: "level two survey costs", prefix: "", suffix: "" },
      document,
    );

    assert.equal(range?.toString().replace(/\s+/g, " "), "level two survey costs");
  });
});
