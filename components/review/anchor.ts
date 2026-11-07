/**
 * Pins comments to text. A comment stores the selected words plus a few characters either side,
 * so it can be found again after a redeploy; a page offset would break on the first copy edit.
 *
 * Text is compared with whitespace collapsed because the DOM's line breaks and indentation
 * aren't what the reader sees and can change between builds.
 */

export type TextAnchor = { quote: string; prefix: string; suffix: string };

export type TextIndex = {
  text: string;
  nodes: Text[];
  /** For each character of `text`: its position in `nodes`, and its offset within that node. */
  nodeAt: number[];
  offsetAt: number[];
};

const CONTEXT_CHARS = 32;
const SHOW_TEXT = 4;
const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);

export function buildTextIndex(root: Element): TextIndex {
  const walker = root.ownerDocument.createTreeWalker(root, SHOW_TEXT);
  const chars: string[] = [];
  const nodes: Text[] = [];
  const nodeAt: number[] = [];
  const offsetAt: number[] = [];
  let lastWasSpace = true;

  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (node.parentElement && SKIPPED_TAGS.has(node.parentElement.tagName)) continue;
    const nodeIndex = nodes.push(node) - 1;
    const value = node.data;
    for (let offset = 0; offset < value.length; offset += 1) {
      const isSpace = /\s/.test(value[offset]);
      if (isSpace && lastWasSpace) continue;
      chars.push(isSpace ? " " : value[offset]);
      nodeAt.push(nodeIndex);
      offsetAt.push(offset);
      lastWasSpace = isSpace;
    }
  }

  return { text: chars.join(""), nodes, nodeAt, offsetAt };
}

/** Turns a live selection into stored form, or null when it holds no text inside the index. */
export function describeRange(index: TextIndex, range: Range): TextAnchor | null {
  const selected = index.nodes.flatMap((node, i) => (range.intersectsNode(node) ? [i] : []));
  if (selected.length === 0) return null;
  const firstNode = selected[0];
  const lastNode = selected[selected.length - 1];

  let start = -1;
  let end = -1;
  for (let i = 0; i < index.text.length; i += 1) {
    const nodeIndex = index.nodeAt[i];
    if (nodeIndex < firstNode || nodeIndex > lastNode) continue;
    const node = index.nodes[nodeIndex];
    const offset = index.offsetAt[i];
    const afterStart = node !== range.startContainer || offset >= range.startOffset;
    const beforeEnd = node !== range.endContainer || offset < range.endOffset;
    if (afterStart && beforeEnd) {
      if (start === -1) start = i;
      end = i + 1;
    }
  }
  if (start === -1) return null;

  while (start < end && index.text[start] === " ") start += 1;
  while (end > start && index.text[end - 1] === " ") end -= 1;
  if (start === end) return null;

  return {
    quote: index.text.slice(start, end),
    prefix: index.text.slice(Math.max(0, start - CONTEXT_CHARS), start),
    suffix: index.text.slice(end, end + CONTEXT_CHARS),
  };
}

function sharedEndLength(a: string, b: string) {
  let length = 0;
  while (length < a.length && length < b.length && a[a.length - 1 - length] === b[b.length - 1 - length]) {
    length += 1;
  }
  return length;
}

function sharedStartLength(a: string, b: string) {
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) length += 1;
  return length;
}

/** Where the quote now sits. With repeated wording, the surrounding text picks the right one. */
export function findQuote(text: string, anchor: TextAnchor): { start: number; end: number } | null {
  let best: { start: number; end: number } | null = null;
  let bestScore = -1;
  for (
    let start = text.indexOf(anchor.quote);
    start !== -1;
    start = text.indexOf(anchor.quote, start + 1)
  ) {
    const end = start + anchor.quote.length;
    const score =
      sharedEndLength(text.slice(Math.max(0, start - anchor.prefix.length), start), anchor.prefix) +
      sharedStartLength(text.slice(end, end + anchor.suffix.length), anchor.suffix);
    if (score > bestScore) {
      best = { start, end };
      bestScore = score;
    }
  }
  return best;
}

export function locateAnchor(index: TextIndex, anchor: TextAnchor, document: Document): Range | null {
  const found = findQuote(index.text, anchor);
  if (!found) return null;
  const range = document.createRange();
  const last = found.end - 1;
  range.setStart(index.nodes[index.nodeAt[found.start]], index.offsetAt[found.start]);
  range.setEnd(index.nodes[index.nodeAt[last]], index.offsetAt[last] + 1);
  return range;
}
