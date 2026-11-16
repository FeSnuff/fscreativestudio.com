const m = '.fsd{--fsd-bg: var(--surface, #ffffff);--fsd-bg-2: var(--surface-2, #ececf3);--fsd-page: var(--bg, #f6f6fa);--fsd-text: var(--text, #12121c);--fsd-text-2: var(--text-2, #4a4b5c);--fsd-text-3: var(--text-3, #646577);--fsd-line: var(--line, #e1e1ea);--fsd-line-strong: var(--line-strong, #8a8b9c);--fsd-accent: var(--accent-btn, #6d4aff);--fsd-accent-hover: var(--accent-hover, #5b36f0);--fsd-on-accent: var(--on-accent, #ffffff);--fsd-accent-soft: var(--accent-soft, #eeeaff);--fsd-accent-deco: var(--accent-deco, #6d4aff);--fsd-info: var(--info, #1d5fd6);--fsd-info-soft: var(--info-soft, #e6f0ff);--fsd-violet: var(--violet, #5a3df0);--fsd-violet-soft: var(--violet-soft, #eeeaff);--fsd-warn: var(--warn, #9a4a00);--fsd-warn-soft: var(--warn-soft, #fff1de);--fsd-danger: var(--danger, #b42318);--fsd-focus: var(--focus, #5a3df0);--fsd-link: var(--accent, #5a3df0);--fsd-ok: var(--success, #136c35);--fsd-ok-soft: var(--success-soft, #e7f6ec);--fsd-wa: var(--fs-wa, #25d366);--fsd-wa-ink: var(--fs-wa-ink, #04210f);--fsd-font: var(--font, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);--fsd-mono: var(--mono, ui-monospace, "SF Mono", Consolas, monospace);--fsd-r-sm: var(--r-sm, 10px);--fsd-r-md: var(--r-md, 14px);--fsd-r-lg: var(--r-lg, 20px);--fsd-shadow: var(--sh-2, 0 1px 2px rgb(20 22 26 / .04), 0 6px 20px rgb(20 22 26 / .06));--fsd-shadow-lift: var(--sh-3, 0 2px 6px rgb(20 22 26 / .06), 0 22px 50px -12px rgb(20 22 26 / .22));--fsd-d: var(--d-2, .25s);--fsd-ease: var(--ease-out, cubic-bezier(.2, .7, .2, 1));--fsd-spring: var(--ease-spring, cubic-bezier(.34, 1.36, .64, 1));font-family:var(--fsd-font);font-size:16px;line-height:1.5;color:var(--fsd-text);background:var(--fsd-bg);border-radius:var(--fsd-r-lg);container-type:inline-size;-webkit-text-size-adjust:100%;text-align:start}.fsd *,.fsd *:before,.fsd *:after{box-sizing:border-box}.fsd :where(h2,h3,h4,p,ul,ol){margin:0}.fsd :where(button,input,select,textarea){font:inherit;color:inherit}.fsd :where(input,select,textarea){font-size:16px}.fsd :focus-visible{outline:3px solid var(--fsd-focus);outline-offset:2px}.fsd-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}.fsd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 16px;border-radius:var(--fsd-r-sm);border:1px solid var(--fsd-line-strong);background:var(--fsd-bg);color:var(--fsd-text);font-weight:600;cursor:pointer;text-decoration:none;touch-action:manipulation;transition:background-color var(--fsd-d) var(--fsd-ease),border-color var(--fsd-d) var(--fsd-ease),transform .12s}.fsd-btn:hover{background:var(--fsd-bg-2)}.fsd-btn:active{transform:scale(.98)}.fsd-btn[disabled]{opacity:.5;cursor:not-allowed;transform:none}.fsd-btn--primary{background:var(--fsd-accent);border-color:var(--fsd-accent);color:var(--fsd-on-accent)}.fsd-btn--primary:hover{background:var(--fsd-accent-hover);border-color:var(--fsd-accent-hover)}.fsd-btn--ghost{border-color:transparent;background:transparent}.fsd-btn--sm{min-height:36px;padding:6px 10px;font-size:14px}.fsd-icon-btn{display:inline-grid;place-items:center;width:44px;height:44px;padding:0;border-radius:var(--fsd-r-sm);border:1px solid var(--fsd-line-strong);background:var(--fsd-bg);color:var(--fsd-text);cursor:pointer;touch-action:manipulation;font-size:20px;line-height:1}.fsd-icon-btn:hover{background:var(--fsd-bg-2)}.fsd-icon-btn[disabled]{opacity:.4;cursor:not-allowed}.fsd-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:999px;font:600 12px/20px var(--fsd-mono);letter-spacing:.06em;text-transform:uppercase;background:var(--fsd-accent-soft);color:var(--fsd-link)}.fsd-num{font-variant-numeric:tabular-nums}', p = (t) => t && t.toLowerCase().startsWith("en") ? "en" : "es";
function l(t, s = null, ...o) {
  const n = document.createElement(t);
  if (s)
    for (const [e, r] of Object.entries(s))
      r == null || r === !1 || (e === "class" ? n.className = String(r) : e.startsWith("on") && typeof r == "function" ? n.addEventListener(e.slice(2), r) : r === !0 ? n.setAttribute(e, "") : n.setAttribute(e, String(r)));
  for (const e of o) e != null && e !== !1 && n.append(typeof e == "number" ? String(e) : e);
  return n;
}
function g(t) {
  const s = document.createElement("template");
  return s.innerHTML = t.trim(), s.content.firstElementChild;
}
const b = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), x = (t) => b.format(Number.isFinite(t) ? t : 0), h = (t) => Math.round((t + Number.EPSILON) * 100) / 100;
function w(t, s, o, n) {
  const e = l("style");
  e.textContent = o;
  const r = l("div", { class: `fsd fsd-${s}`, lang: n }), f = l("div", { class: "fsd-sr", "aria-live": "polite", "aria-atomic": "true" });
  t.append(e, r, f);
  const u = new AbortController(), a = /* @__PURE__ */ new Set();
  let d = 0;
  return {
    root: r,
    signal: u.signal,
    /** Anuncio para lectores de pantalla (vaciar y volver a poner fuerza la relectura). */
    say(i) {
      f.textContent = "", clearTimeout(d), d = window.setTimeout(() => f.textContent = i, 60);
    },
    later(i, v) {
      const c = window.setTimeout(() => {
        a.delete(c), i();
      }, v);
      return a.add(c), c;
    },
    /** Cancela todo lo programado con later() (p. ej. al reiniciar una demo). */
    clearTimers() {
      a.forEach(clearTimeout), a.clear();
    },
    destroy() {
      u.abort(), a.forEach(clearTimeout), clearTimeout(d), e.remove(), r.remove(), f.remove();
    }
  };
}
function y(t) {
  let s = null;
  const o = () => {
    s?.(), s = null;
  };
  return { mountDemo: (e, r = {}) => (o(), s = t(e, p(r.lang ?? e.closest("[lang]")?.getAttribute("lang") ?? void 0)), { unmount: o }), unmount: o };
}
export {
  m as b,
  w as c,
  y as d,
  l as h,
  x as m,
  h as r,
  g as s
};
