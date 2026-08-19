/** YouTube-style top bar for in-page saves (NextTopLoader only runs on route changes). */

const BAR_ID = "crm-inpage-top-progress";

function barEl(): HTMLDivElement | null {
  if (typeof document === "undefined") return null;
  let el = document.getElementById(BAR_ID) as HTMLDivElement | null;
  if (el) return el;
  el = document.createElement("div");
  el.id = BAR_ID;
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "z-index:99999",
    "height:3px",
    "width:0",
    "background:#6d28d9",
    "pointer-events:none",
    "transition:width 280ms ease",
  ].join(";");
  document.body.appendChild(el);
  return el;
}

export function startTopProgress() {
  const el = barEl();
  if (!el) return;
  el.style.opacity = "1";
  el.style.width = "0";
  requestAnimationFrame(() => {
    el.style.width = "72%";
  });
}

export function doneTopProgress() {
  const el = typeof document === "undefined" ? null : (document.getElementById(BAR_ID) as HTMLDivElement | null);
  if (!el) return;
  el.style.width = "100%";
  window.setTimeout(() => {
    el.style.opacity = "0";
    el.style.width = "0";
  }, 220);
}
