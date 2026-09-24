import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

const g = globalThis as typeof globalThis & {
  window: Window & typeof globalThis;
  document: Document;
  HTMLElement: typeof HTMLElement;
  Element: typeof Element;
  Node: typeof Node;
  navigator: Navigator;
  IS_REACT_ACT_ENVIRONMENT?: boolean;
  requestAnimationFrame: (cb: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
};

g.window = dom.window as unknown as Window & typeof globalThis;
g.document = dom.window.document;
g.HTMLElement = dom.window.HTMLElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.navigator = dom.window.navigator;
g.IS_REACT_ACT_ENVIRONMENT = true;
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
g.cancelAnimationFrame = (id) => clearTimeout(id);
dom.window.requestAnimationFrame = g.requestAnimationFrame;
dom.window.cancelAnimationFrame = g.cancelAnimationFrame;
dom.window.matchMedia = ((query: string) => ({
  matches: query.includes("reduce"),
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false;
  },
})) as typeof window.matchMedia;

type ReactNs = typeof import("react");
type Root = ReturnType<typeof import("react-dom/client").createRoot>;

let React: ReactNs;
let createRoot: typeof import("react-dom/client").createRoot;
let EmailChipInput: typeof import("./EmailChipInput").default;
let EmailToField: typeof import("./EmailToField").default;

const mounted: Root[] = [];

before(async () => {
  React = await import("react");
  ({ createRoot } = await import("react-dom/client"));
  ({ default: EmailChipInput } = await import("./EmailChipInput"));
  ({ default: EmailToField } = await import("./EmailToField"));
});

afterEach(async () => {
  await React.act(async () => {
    for (const root of mounted) root.unmount();
  });
  mounted.length = 0;
  document.body.replaceChildren();
});

async function mount(node: import("react").ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push(root);
  await React.act(async () => {
    root.render(node);
  });
  return container;
}

async function setValue(input: HTMLInputElement, text: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  await React.act(async () => {
    setter?.call(input, text);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

async function press(input: HTMLElement, key: string) {
  await React.act(async () => {
    input.dispatchEvent(
      new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
    );
  });
}

function CcHarness({
  onChange,
}: {
  onChange?: (addresses: string[]) => void;
}) {
  const [value, setValue] = React.useState<string[]>([]);
  return React.createElement(EmailChipInput, {
    id: "cc",
    value,
    onChange: (next) => {
      setValue(next);
      onChange?.(next);
    },
  });
}

describe("EmailChipInput", () => {
  it("turns Enter, space, and comma into pills and removes them", async () => {
    const changes: string[][] = [];
    const container = await mount(React.createElement(CcHarness, { onChange: (next) => changes.push(next) }));
    const input = container.querySelector("input");
    assert.ok(input);

    await setValue(input, "Ada@Example.com");
    await press(input, "Enter");
    assert.deepEqual(changes.at(-1), ["ada@example.com"]);
    assert.ok(container.querySelector('button[aria-label="Remove ada@example.com"]'));

    await setValue(input, "cc@example.com");
    await press(input, " ");
    assert.deepEqual(changes.at(-1), ["ada@example.com", "cc@example.com"]);

    await setValue(input, "third@example.com");
    await press(input, ",");
    assert.deepEqual(changes.at(-1), ["ada@example.com", "cc@example.com", "third@example.com"]);

    await press(input, "Backspace");
    assert.deepEqual(changes.at(-1), ["ada@example.com", "cc@example.com"]);

    const remove = container.querySelector('button[aria-label="Remove ada@example.com"]');
    assert.ok(remove instanceof window.HTMLButtonElement);
    await React.act(async () => {
      remove.click();
    });
    assert.deepEqual(changes.at(-1), ["cc@example.com"]);
  });

  it("commits a leftover draft on blur", async () => {
    const changes: string[][] = [];
    const container = await mount(React.createElement(CcHarness, { onChange: (next) => changes.push(next) }));
    const input = container.querySelector("input");
    assert.ok(input);
    await setValue(input, "blur@example.com");
    await React.act(async () => {
      input.dispatchEvent(new window.FocusEvent("focusout", { bubbles: true }));
    });
    assert.deepEqual(changes.at(-1), ["blur@example.com"]);
  });
});

describe("EmailToField", () => {
  it("shows the address beside Other and hides it for Client", async () => {
    function Harness() {
      const [kind, setKind] = React.useState<import("@/crm/lib/emailCompose").EmailToKind>("client");
      const [otherEmail, setOtherEmail] = React.useState("");
      return React.createElement(EmailToField, {
        id: "to",
        options: [{ kind: "client", label: "Client", email: "ada@example.com", name: "Ada" }],
        kind,
        otherEmail,
        onKindChange: setKind,
        onOtherEmailChange: setOtherEmail,
      });
    }

    const container = await mount(React.createElement(Harness));
    assert.equal(container.querySelector('input[aria-label="To address"]'), null);

    const select = container.querySelector("select");
    assert.ok(select);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
    await React.act(async () => {
      setter?.call(select, "other");
      select.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    const address = container.querySelector('input[aria-label="To address"]');
    assert.ok(address instanceof window.HTMLInputElement);

    await React.act(async () => {
      setter?.call(select, "client");
      select.dispatchEvent(new window.Event("change", { bubbles: true }));
    });
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(container.querySelector('input[aria-label="To address"]'), null);
  });
});
