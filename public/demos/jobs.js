import { d as O, c as X, b as N, h as n, m as S, s as D } from "./chunks/dom-ByL28LBG.js";
const U = ".fsd-jobs{padding:16px}.fsd-j-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:8px}.fsd-j-title{font-size:20px;letter-spacing:-.01em;margin-top:6px}.fsd-j-help{font-size:14px;color:var(--fsd-text-2);margin-bottom:14px}.fsd-j-summary{display:grid;gap:8px;padding:12px 14px;border-radius:var(--fsd-r-md);background:var(--fsd-bg-2);margin-bottom:16px}.fsd-j-bar{height:8px;border-radius:999px;background:var(--fsd-bg);overflow:hidden}.fsd-j-bar__fill{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#6d4aff,#3b82f6 55%,#e255c8);transition:width .6s var(--fsd-ease)}.fsd-j-bar__label{font-size:14px;color:var(--fsd-text-2)}.fsd-j-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0}.fsd-j-stats div{display:grid}.fsd-j-stats dt{font-size:12px;color:var(--fsd-text-2)}.fsd-j-stats dd{margin:0;font-size:17px}.fsd-j-board{display:grid;gap:14px}.fsd-j-col{border-radius:var(--fsd-r-md);padding:10px;background:var(--fsd-page);border:1px solid var(--fsd-line);transition:background-color var(--fsd-d),border-color var(--fsd-d),box-shadow var(--fsd-d)}.fsd-j-col.is-over{border-color:var(--fsd-accent-deco);box-shadow:0 0 0 3px color-mix(in srgb,var(--fsd-accent-deco) 35%,transparent)}.fsd-j-col__title{display:flex;align-items:center;gap:8px;font-size:15px;margin:2px 4px 10px}.fsd-j-dot{width:10px;height:10px;border-radius:50%;background:var(--dot)}.fsd-j-col--todo{--dot: #e0a03a}.fsd-j-col--road{--dot: #3b82f6}.fsd-j-col--done{--dot: var(--fsd-ok)}.fsd-j-count{margin-left:auto;min-width:26px;padding:0 8px;border-radius:999px;background:var(--fsd-bg);font-size:13px;text-align:center;color:var(--fsd-text-2)}.fsd-j-list{list-style:none;padding:0;display:grid;gap:8px;min-height:56px}.fsd-j-list:empty:before{content:attr(data-empty);display:grid;place-items:center;min-height:56px;border:2px dashed var(--fsd-line-strong);border-radius:var(--fsd-r-sm);color:var(--fsd-text-3);font-size:14px}.fsd-j-card{background:var(--fsd-bg);border:1px solid var(--fsd-line);border-radius:var(--fsd-r-sm);padding:10px 10px 10px 4px;display:grid;gap:8px;box-shadow:var(--fsd-shadow)}.fsd-j-card.is-done .fsd-j-card__title{text-decoration:line-through;text-decoration-color:color-mix(in srgb,var(--fsd-text) 40%,transparent)}.fsd-j-card.is-dragging{opacity:.35;box-shadow:none;border-style:dashed}.fsd-j-card.is-grabbed{outline:3px solid var(--fsd-focus);outline-offset:2px;transform:scale(1.015);box-shadow:var(--fsd-shadow-lift)}.fsd-j-card__top{display:flex;align-items:flex-start;gap:4px}.fsd-j-handle{flex:none;display:grid;place-items:center;width:36px;height:44px;border:0;border-radius:8px;background:transparent;color:var(--fsd-text-3);cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none}.fsd-j-handle:hover{background:var(--fsd-bg-2);color:var(--fsd-text)}.fsd-j-handle:active{cursor:grabbing}.fsd-j-card__main{flex:1;min-width:0;display:grid}.fsd-j-time{font:600 12px var(--fsd-mono);color:var(--fsd-text-2)}.fsd-j-card__title{line-height:1.3}.fsd-j-meta{font-size:14px;color:var(--fsd-text-2)}.fsd-j-amount{font-weight:600;font-size:15px;padding-top:14px}.fsd-j-photos{display:flex;gap:6px;padding-left:40px}.fsd-j-photo{margin:0;width:64px;border-radius:6px;overflow:hidden;background:var(--fsd-bg-2);position:relative}.fsd-j-photo svg{display:block;width:100%;height:auto}.fsd-j-photo figcaption{position:absolute;left:3px;bottom:3px;padding:0 4px;border-radius:4px;font-size:10px;line-height:15px;background:#0009;color:#fff}.fsd-j-photo.is-new{animation:fsd-j-pop .42s var(--fsd-spring)}@keyframes fsd-j-pop{0%{opacity:0;transform:scale(.6)}}.fsd-j-card__actions{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-left:40px}.fsd-j-photo-btn svg{flex:none}.fsd-j-arrows{display:flex;gap:6px}.fsd-j-arrows .fsd-icon-btn{width:40px;height:40px;font-size:18px}.fsd-j-celebrate{animation:fsd-j-done .7s var(--fsd-spring)}@keyframes fsd-j-done{0%{transform:scale(.96);box-shadow:0 0 #6d4aff80}60%{transform:scale(1.02);box-shadow:0 0 0 10px #6d4aff00}}.fsd-j-ghostwrap{position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:transparent;padding:0;border-radius:0}.fsd-j-ghost{position:fixed;margin:0;list-style:none;box-shadow:var(--fsd-shadow-lift);opacity:.96;will-change:transform}@container (min-width: 700px){.fsd-j-board{grid-template-columns:repeat(3,1fr);align-items:start}.fsd-j-photos,.fsd-j-card__actions{padding-left:0}.fsd-j-card__actions{flex-wrap:wrap}}", v = ["todo", "road", "done"], q = () => [
  { id: "j1", time: "8:00", title: { es: "Visita inicial", en: "Initial visit" }, client: "Ana Ríos", zone: { es: "Zona norte", en: "North side" }, amount: 60, col: "done", photos: ["8:52"] },
  { id: "j2", time: "9:30", title: { es: "Servicio completo", en: "Full service" }, client: "Pedro Luna", zone: { es: "Centro", en: "Downtown" }, amount: 350, col: "road", photos: [] },
  { id: "j3", time: "11:00", title: { es: "Hora adicional", en: "Extra hour" }, client: "Lucía Vega", zone: { es: "Zona oeste", en: "West side" }, amount: 45, col: "todo", photos: [] },
  { id: "j4", time: "13:00", title: { es: "Producto", en: "Product" }, client: "Sara Mora", zone: { es: "Zona sur", en: "South side" }, amount: 80, col: "todo", photos: [] },
  { id: "j5", time: "15:30", title: { es: "Servicio completo", en: "Full service" }, client: "Juan Paz", zone: { es: "Zona este", en: "East side" }, amount: 350, col: "todo", photos: [] }
], H = {
  es: {
    demo: "Demo · datos de ejemplo",
    title: "Trabajos de hoy",
    cols: { todo: "Pendiente", road: "En camino", done: "Terminado" },
    help: "Arrastra una tarjeta desde su asa, o usa las flechas. Con teclado: Espacio para tomar, flechas para mover, Espacio para soltar, Escape para cancelar.",
    handle: (r) => `Mover ${r}`,
    handleDesc: "Espacio para tomar la tarjeta; luego flechas izquierda y derecha para cambiar de columna, arriba y abajo para ordenar, Espacio para soltar.",
    moveTo: (r) => `Mover a ${r}`,
    grabbed: (r, c) => `${r} tomada en ${c}. Usa las flechas y suelta con Espacio.`,
    moved: (r, c, i, l) => `${r}: ${c}, posición ${i} de ${l}.`,
    dropped: (r, c) => `${r} quedó en ${c}.`,
    cancelled: (r) => `Movimiento de ${r} cancelado.`,
    addPhoto: "Foto de avance",
    addPhotoFor: (r) => `Agregar foto de avance de ${r}`,
    photoAdded: (r, c) => `Foto de avance ${c} agregada a ${r}.`,
    photoAlt: (r, c, i) => `Foto de avance ${c} de ${r}, ${i} (simulada)`,
    maxPhotos: "Máximo 3 fotos en la demo",
    empty: "Suelta aquí una tarjeta",
    summary: "Resumen del día",
    jobs: "trabajos",
    collected: "Terminado hoy",
    pending: "Por terminar",
    photos: "Fotos",
    progress: (r, c) => `${r} de ${c} terminados`,
    reset: "Reiniciar",
    stages: ["Antes", "Durante", "Después"]
  },
  en: {
    demo: "Demo · sample data",
    title: "Today's jobs",
    cols: { todo: "To do", road: "On the way", done: "Done" },
    help: "Drag a card by its handle, or use the arrows. Keyboard: Space to pick up, arrow keys to move, Space to drop, Escape to cancel.",
    handle: (r) => `Move ${r}`,
    handleDesc: "Space to pick up the card; then left and right arrows change column, up and down reorder, Space drops it.",
    moveTo: (r) => `Move to ${r}`,
    grabbed: (r, c) => `${r} picked up in ${c}. Use the arrow keys and drop with Space.`,
    moved: (r, c, i, l) => `${r}: ${c}, position ${i} of ${l}.`,
    dropped: (r, c) => `${r} is now in ${c}.`,
    cancelled: (r) => `Move of ${r} cancelled.`,
    addPhoto: "Progress photo",
    addPhotoFor: (r) => `Add progress photo for ${r}`,
    photoAdded: (r, c) => `Progress photo ${c} added to ${r}.`,
    photoAlt: (r, c, i) => `Progress photo ${c} for ${r}, ${i} (simulated)`,
    maxPhotos: "Up to 3 photos in the demo",
    empty: "Drop a card here",
    summary: "Day summary",
    jobs: "jobs",
    collected: "Done today",
    pending: "Still to do",
    photos: "Photos",
    progress: (r, c) => `${r} of ${c} done`,
    reset: "Reset",
    stages: ["Before", "During", "After"]
  }
};
function Z(r, c) {
  const i = [28, 64, 100][Math.min(r, 2)], l = r >= 2;
  return D(`<svg viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<rect width="96" height="72" fill="hsl(${c} 45% 86%)"/><rect y="52" width="96" height="20" fill="hsl(${c} 25% 70%)"/>
<rect x="14" y="16" width="68" height="40" rx="3" fill="#fff" opacity=".9"/>
<rect x="14" y="16" width="${68 * i / 100}" height="40" rx="3" fill="hsl(${(c + 150) % 360} 45% 55%)"/>
${r < 2 ? '<path d="M18 28h60M18 40h60" stroke="#0003" stroke-width="2" stroke-dasharray="4 4"/>' : ""}
${l ? '<circle cx="76" cy="18" r="9" fill="#136C35"/><path d="M71.5 18l3 3 6-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : ""}
</svg>`);
}
const V = '<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><g fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></g></svg>', G = '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function J(r, c) {
  const i = H[c], l = X(r, "jobs", N + U, c);
  let f = q();
  const y = (t) => `${t.title[c]} · ${t.client}`, I = () => new Intl.DateTimeFormat(c === "es" ? "es-US" : "en-US", { hour: "numeric", minute: "2-digit" }).format(/* @__PURE__ */ new Date()), R = "fsd-j-help", C = "fsd-j-desc", P = n("div", { class: "fsd-j-board" }), w = {}, k = {};
  for (const t of v)
    w[t] = n("ul", { class: "fsd-j-list", "data-col": t, "aria-labelledby": `fsd-j-h-${t}`, "data-empty": i.empty }), k[t] = n("span", { class: "fsd-j-count fsd-num" }), P.append(n("section", { class: `fsd-j-col fsd-j-col--${t}`, "data-col": t }, n("h4", { id: `fsd-j-h-${t}`, class: "fsd-j-col__title" }, n("span", { class: "fsd-j-dot", "aria-hidden": "true" }), i.cols[t], k[t]), w[t]));
  const b = {
    done: n("strong", { class: "fsd-num" }),
    pend: n("strong", { class: "fsd-num" }),
    photos: n("strong", { class: "fsd-num" }),
    bar: n("span", { class: "fsd-j-bar__fill" }),
    label: n("span", { class: "fsd-j-bar__label" })
  };
  l.root.append(
    n(
      "div",
      { class: "fsd-j-head" },
      n("div", null, n("span", { class: "fsd-badge" }, i.demo), n("h3", { class: "fsd-j-title" }, i.title)),
      n("button", { type: "button", class: "fsd-btn fsd-btn--sm", onclick: () => {
        f = q(), x(), l.say(i.reset);
      } }, i.reset)
    ),
    n("p", { class: "fsd-j-help", id: R }, i.help),
    n("p", { class: "fsd-sr", id: C }, i.handleDesc),
    n(
      "section",
      { class: "fsd-j-summary", "aria-label": i.summary },
      n("div", { class: "fsd-j-bar", role: "presentation" }, b.bar),
      b.label,
      n(
        "dl",
        { class: "fsd-j-stats" },
        n("div", null, n("dt", null, i.collected), n("dd", null, b.done)),
        n("div", null, n("dt", null, i.pending), n("dd", null, b.pend)),
        n("div", null, n("dt", null, i.photos), n("dd", null, b.photos))
      )
    ),
    P
  );
  function T(t) {
    const e = v.indexOf(t.col), d = y(t), o = n("button", { type: "button", class: "fsd-j-handle", "aria-label": i.handle(d), "aria-describedby": C, "data-handle": t.id }, D(V)), s = n(
      "div",
      { class: "fsd-j-photos" },
      ...t.photos.map((h, u) => n("figure", { class: "fsd-j-photo", role: "img", "aria-label": i.photoAlt(t.client, u + 1, h) }, Z(u, t.id.charCodeAt(1) * 47 % 360), n("figcaption", { "aria-hidden": "true" }, i.stages[u])))
    ), p = t.photos.length >= 3;
    return n(
      "li",
      { class: `fsd-j-card${t.col === "done" ? " is-done" : ""}`, "data-id": t.id },
      n(
        "div",
        { class: "fsd-j-card__top" },
        o,
        n("div", { class: "fsd-j-card__main" }, n("span", { class: "fsd-j-time fsd-num" }, t.time), n("strong", { class: "fsd-j-card__title" }, t.title[c]), n("span", { class: "fsd-j-meta" }, `${t.client} · ${t.zone[c]}`)),
        n("span", { class: "fsd-j-amount fsd-num" }, S(t.amount))
      ),
      t.photos.length ? s : null,
      n(
        "div",
        { class: "fsd-j-card__actions" },
        n("button", { type: "button", class: "fsd-btn fsd-btn--sm fsd-j-photo-btn", "aria-label": p ? i.maxPhotos : i.addPhotoFor(d), disabled: p, "data-photo": t.id }, D(G), i.addPhoto),
        n(
          "span",
          { class: "fsd-j-arrows" },
          n("button", { type: "button", class: "fsd-icon-btn", "aria-label": e > 0 ? i.moveTo(i.cols[v[e - 1]]) + ` · ${t.client}` : void 0, disabled: e === 0, "data-move": `${t.id}:-1` }, "←"),
          n("button", { type: "button", class: "fsd-icon-btn", "aria-label": e < 2 ? i.moveTo(i.cols[v[e + 1]]) + ` · ${t.client}` : void 0, disabled: e === 2, "data-move": `${t.id}:1` }, "→")
        )
      )
    );
  }
  function x(t) {
    for (const o of v) {
      const s = f.filter((p) => p.col === o);
      w[o].replaceChildren(...s.map(T)), k[o].textContent = String(s.length);
    }
    const e = f.filter((o) => o.col === "done"), d = Math.round(e.length / f.length * 100);
    b.done.textContent = S(e.reduce((o, s) => o + s.amount, 0)), b.pend.textContent = S(f.filter((o) => o.col !== "done").reduce((o, s) => o + s.amount, 0)), b.photos.textContent = String(f.reduce((o, s) => o + s.photos.length, 0)), b.bar.style.width = `${d}%`, b.label.textContent = i.progress(e.length, f.length), t && l.root.querySelector(t)?.focus({ preventScroll: !1 });
  }
  function z(t, e, d) {
    const o = f.find((g) => g.id === t), s = f.filter((g) => g !== o), p = s.filter((g) => g.col === e);
    o.col = e;
    const h = p[d], u = h ? s.indexOf(h) : s.length;
    s.splice(u, 0, o), f = s;
  }
  const _ = (t) => {
    const e = f.find((o) => o.id === t), d = f.filter((o) => o.col === e.col);
    return { job: e, index: d.indexOf(e), n: d.length };
  }, E = (t) => {
    const e = l.root.querySelector(`[data-id="${t}"]`);
    e && e.classList.add("fsd-j-celebrate");
  };
  l.root.addEventListener("click", (t) => {
    const e = t.target, d = e.closest("[data-move]");
    if (d && !d.hasAttribute("disabled")) {
      const [s, p] = d.dataset.move.split(":"), { job: h } = _(s), u = v.indexOf(h.col) + Number(p), g = v[u];
      z(s, g, f.filter(($) => $.col === g && $.id !== s).length);
      const j = Number(p) > 0 && u < 2 || Number(p) < 0 && u > 0;
      x(`[data-move="${s}:${j ? p : -Number(p)}"]`), g === "done" && E(s), l.say(i.dropped(y(h), i.cols[g]));
      return;
    }
    const o = e.closest("[data-photo]");
    if (o && !o.hasAttribute("disabled")) {
      const s = f.find((h) => h.id === o.dataset.photo);
      s.photos.push(I()), x(`[data-photo="${s.id}"]`), l.root.querySelector(`[data-id="${s.id}"] .fsd-j-photo:last-child`)?.classList.add("is-new"), l.say(i.photoAdded(s.client, s.photos.length)), s.photos.length >= 3 && l.root.querySelector(`[data-handle="${s.id}"]`)?.focus();
    }
  }, { signal: l.signal });
  let m = null;
  const B = (t) => t.map((e) => ({ ...e, photos: [...e.photos] })), L = () => {
    if (l.root.querySelectorAll(".fsd-j-card.is-grabbed").forEach((e) => e.classList.remove("is-grabbed")), !m) return;
    const t = l.root.querySelector(`[data-handle="${m.id}"]`);
    t?.setAttribute("aria-pressed", "true"), t?.closest(".fsd-j-card")?.classList.add("is-grabbed");
  };
  l.root.addEventListener("keydown", (t) => {
    const e = t.target.closest("[data-handle]");
    if (!e) return;
    const d = e.dataset.handle, { job: o, index: s, n: p } = _(d);
    if (!m) {
      (t.key === " " || t.key === "Enter") && (t.preventDefault(), m = { id: d, snapshot: B(f) }, L(), l.say(i.grabbed(y(o), i.cols[o.col])));
      return;
    }
    if (m.id !== d) return;
    let h = o.col, u = s;
    switch (t.key) {
      case "ArrowLeft":
      case "ArrowRight": {
        const j = v.indexOf(o.col) + (t.key === "ArrowRight" ? 1 : -1);
        if (j < 0 || j > 2) return t.preventDefault();
        h = v[j], u = Math.min(s, f.filter(($) => $.col === h).length);
        break;
      }
      case "ArrowUp":
        u = Math.max(0, s - 1);
        break;
      case "ArrowDown":
        u = Math.min(p - 1, s + 1);
        break;
      case " ":
      case "Enter": {
        t.preventDefault(), m = null, x(`[data-handle="${d}"]`), o.col === "done" && E(d), l.say(i.dropped(y(o), i.cols[o.col]));
        return;
      }
      case "Escape":
      case "Tab": {
        t.preventDefault(), f = m.snapshot, m = null, x(`[data-handle="${d}"]`), l.say(i.cancelled(y(o)));
        return;
      }
      default:
        return;
    }
    t.preventDefault(), z(d, h, u), x(`[data-handle="${d}"]`), L();
    const g = _(d);
    l.say(i.moved(y(o), i.cols[h], g.index + 1, g.n));
  }, { signal: l.signal }), l.root.addEventListener("focusout", (t) => {
    if (!m) return;
    const e = t.relatedTarget;
    e && l.root.contains(e) || l.later(() => {
      m && !l.root.contains(document.activeElement) && (f = m.snapshot, m = null, x());
    }, 0);
  }, { signal: l.signal });
  let a = null;
  const Y = (t) => {
    for (let e = t?.parentElement; e; e = e.parentElement) {
      const d = getComputedStyle(e).overflowY;
      if ((d === "auto" || d === "scroll") && e.scrollHeight > e.clientHeight) return e;
    }
    return null;
  }, M = () => {
    if (!a?.ghost) return;
    const t = a.scroller, e = t ? t.getBoundingClientRect().top : 0, d = t ? t.getBoundingClientRect().bottom : window.innerHeight, o = 64;
    let s = 0;
    a.y < e + o ? s = -Math.ceil((e + o - a.y) / 6) : a.y > d - o && (s = Math.ceil((a.y - (d - o)) / 6)), s && (t ? t.scrollTop += s : window.scrollBy(0, s), F()), a.raf = requestAnimationFrame(M);
  }, F = () => {
    if (!a?.ghost) return;
    const e = document.elementFromPoint(a.x, a.y)?.closest(".fsd-j-col");
    if (l.root.querySelectorAll(".fsd-j-col.is-over").forEach((p) => p !== e && p.classList.remove("is-over")), !e || !l.root.contains(e)) return;
    e.classList.add("is-over");
    const d = e.querySelector("ul"), s = [...d.children].filter((p) => p !== a.el).find((p) => {
      const h = p.getBoundingClientRect();
      return a.y < h.top + h.height / 2;
    });
    s ? a.el.nextElementSibling !== s && d.insertBefore(a.el, s) : d.lastElementChild !== a.el && d.append(a.el);
  }, A = (t) => {
    if (!a) return;
    const e = a;
    if (a = null, cancelAnimationFrame(e.raf), l.root.querySelectorAll(".fsd-j-col.is-over").forEach((d) => d.classList.remove("is-over")), e.ghost?.remove(), e.el.classList.remove("is-dragging"), !!e.ghost)
      if (t) {
        const d = [];
        for (const s of v) for (const p of w[s].children) {
          const h = f.find((u) => u.id === p.dataset.id);
          h && (h.col = s, d.push(h));
        }
        f = d;
        const o = f.find((s) => s.id === e.id);
        x(), o.col === "done" && E(o.id), l.say(i.dropped(y(o), i.cols[o.col]));
      } else x();
  };
  return l.root.addEventListener("pointerdown", (t) => {
    const e = t.target.closest("[data-handle]");
    if (!e || t.button > 0 || a) return;
    const d = e.closest(".fsd-j-card");
    try {
      e.setPointerCapture(t.pointerId);
    } catch {
    }
    a = { id: e.dataset.handle, pointerId: t.pointerId, el: d, startX: t.clientX, startY: t.clientY, dx: 0, dy: 0, x: t.clientX, y: t.clientY, raf: 0, scroller: Y(l.root) };
  }, { signal: l.signal }), window.addEventListener("pointermove", (t) => {
    if (!a || t.pointerId !== a.pointerId) return;
    if (a.x = t.clientX, a.y = t.clientY, !a.ghost) {
      if (Math.hypot(t.clientX - a.startX, t.clientY - a.startY) < 6) return;
      const d = a.el.getBoundingClientRect(), o = a.el.cloneNode(!0);
      o.classList.add("fsd-j-ghost"), o.setAttribute("aria-hidden", "true"), o.style.width = `${d.width}px`, o.style.left = `${d.left}px`, o.style.top = `${d.top}px`, a.dx = a.startX - d.left, a.dy = a.startY - d.top;
      const s = n("div", { class: "fsd fsd-jobs fsd-j-ghostwrap", "aria-hidden": "true" }, o);
      document.body.append(s), a.ghost = s, a.el.classList.add("is-dragging"), a.raf = requestAnimationFrame(M);
    }
    t.preventDefault();
    const e = a.ghost.firstElementChild;
    e.style.transform = `translate(${t.clientX - a.dx - parseFloat(e.style.left)}px, ${t.clientY - a.dy - parseFloat(e.style.top)}px) rotate(2deg)`, F();
  }, { signal: l.signal }), window.addEventListener("pointerup", (t) => a && t.pointerId === a.pointerId && A(!0), { signal: l.signal }), window.addEventListener("pointercancel", (t) => a && t.pointerId === a.pointerId && A(!1), { signal: l.signal }), window.addEventListener("keydown", (t) => t.key === "Escape" && a?.ghost && A(!1), { signal: l.signal }), x(), () => {
    a && (cancelAnimationFrame(a.raf), a.ghost?.remove()), l.destroy();
  };
}
const { mountDemo: W, unmount: Q } = O(J);
export {
  W as mountDemo,
  Q as unmount
};
