/**
 * Plexus network background (canvas).
 * - Two depth layers: a soft far mesh and a brighter near mesh with nodes of varying size.
 * - The mesh topology is fixed (each node joins its nearest neighbours), so lines never pop in or out.
 * - Nodes "breathe" around their home position; the whole mesh glides with the mouse and with scroll.
 * - Small pulses travel along some near lines, like data moving through the system.
 * - Pauses when off screen; draws one static frame when the visitor prefers reduced motion.
 */

type P = { hx: number; hy: number; x: number; y: number; r: number; ph: number; amp: number; sp: number; hub: boolean };
type Layer = { pts: P[]; edges: [number, number, number][]; par: number };
type Pulse = { e: number; t: number; v: number };

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.tx = e.clientX / window.innerWidth - 0.5;
  pointer.ty = e.clientY / window.innerHeight - 0.5;
}, { passive: true });

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function makeLayer(n: number, w: number, h: number, rnd: () => number, near: boolean): Layer {
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const hub = near && rnd() < 0.12;
    const hx = -0.06 * w + rnd() * 1.12 * w;
    const hy = -0.08 * h + rnd() * 1.16 * h;
    pts.push({
      hx, hy, x: hx, y: hy, hub,
      r: hub ? 5.5 + rnd() * 3 : near ? 2 + rnd() * 2.6 : 1.4 + rnd() * 2,
      ph: rnd() * Math.PI * 2,
      amp: (near ? 10 : 6) + rnd() * (near ? 14 : 8),
      sp: 0.00018 + rnd() * 0.00025,
    });
  }
  // connect each node to its 3 nearest neighbours (deduplicated), skipping very long links
  const maxD = Math.max(w, h) * (near ? 0.2 : 0.14);
  const seen = new Set<string>();
  const edges: [number, number, number][] = [];
  pts.forEach((a, i) => {
    pts
      .map((b, j) => [j, Math.hypot(a.hx - b.hx, a.hy - b.hy)] as [number, number])
      .filter(([j]) => j !== i)
      .sort((p, q) => p[1] - q[1])
      .slice(0, near ? 4 : 3)
      .forEach(([j, d]) => {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (d < maxD && !seen.has(k)) { seen.add(k); edges.push([i, j, d]); }
      });
  });
  return { pts, edges, par: near ? 1 : 0.45 };
}

function setup(cv: HTMLCanvasElement) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const seed = Number(cv.dataset.seed || 7);
  let w = 0, h = 0;
  let far: Layer, near: Layer;
  let pulses: Pulse[] = [];
  let visible = true;
  let raf = 0;

  const build = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rnd = rng(seed);
    const area = w * h;
    far = makeLayer(Math.min(170, Math.max(50, Math.round(area / 7000))), w, h, rnd, false);
    near = makeLayer(Math.min(95, Math.max(28, Math.round(area / 13500))), w, h, rnd, true);
    pulses = Array.from({ length: Math.min(8, near.edges.length) }, () => ({ e: Math.floor(rnd() * near.edges.length), t: rnd(), v: 0.0025 + rnd() * 0.003 }));
    if (reduce) draw(0);
  };

  const place = (L: Layer, t: number, ox: number, oy: number) => {
    for (const p of L.pts) {
      p.x = p.hx + Math.sin(t * p.sp + p.ph) * p.amp + ox * L.par;
      p.y = p.hy + Math.cos(t * p.sp * 0.8 + p.ph) * p.amp + oy * L.par;
    }
  };

  const lineColor = (x: number, a: number) => {
    // indigo on the left → violet → a touch of cyan on the far right
    const k = Math.min(1, Math.max(0, x / w));
    const r = k < 0.75 ? 91 + (182 - 91) * (k / 0.75) : 182 - (182 - 26) * ((k - 0.75) / 0.25) * 0.5;
    const g = k < 0.75 ? 75 + (82 - 75) * (k / 0.75) : 82 + (212 - 82) * ((k - 0.75) / 0.25) * 0.5;
    const b = k < 0.75 ? 240 - (240 - 212) * (k / 0.75) : 212 + (217 - 212) * ((k - 0.75) / 0.25);
    return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
  };

  const drawLayer = (L: Layer, nearLayer: boolean) => {
    const maxD = Math.max(w, h) * (nearLayer ? 0.2 : 0.14);
    for (const [i, j, d] of L.edges) {
      const a = L.pts[i], b = L.pts[j];
      const alpha = (nearLayer ? 0.75 : 0.3) * (1 - d / maxD * 0.5);
      ctx.strokeStyle = lineColor((a.x + b.x) / 2, Math.round(alpha * 1000) / 1000);
      ctx.lineWidth = nearLayer ? 1.2 : 0.8;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (const p of L.pts) {
      if (p.hub) {
        ctx.fillStyle = 'rgba(182,82,212,0.22)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(216,180,254,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 1.6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#c084fc';
      } else {
        ctx.fillStyle = nearLayer ? 'rgba(233,213,255,0.95)' : 'rgba(167,139,250,0.55)';
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  };

  const draw = (t: number) => {
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    const top = cv.getBoundingClientRect().top;
    const ox = -pointer.x * 50;
    const oy = -pointer.y * 30 + top * 0.18;
    ctx.clearRect(0, 0, w, h);
    place(far, t, ox, oy); place(near, t, ox, oy);
    drawLayer(far, false);
    drawLayer(near, true);
    // data pulses along near lines
    for (const pu of pulses) {
      const [i, j] = near.edges[pu.e];
      const a = near.pts[i], b = near.pts[j];
      const x = a.x + (b.x - a.x) * pu.t, y = a.y + (b.y - a.y) * pu.t;
      ctx.fillStyle = 'rgba(103,232,249,0.95)';
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(103,232,249,0.18)';
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      if (!reduce) {
        pu.t += pu.v;
        if (pu.t >= 1) { pu.t = 0; pu.e = (pu.e * 7 + 3) % near.edges.length; }
      }
    }
  };

  const loop = (t: number) => {
    if (visible && !document.hidden) draw(t);
    raf = requestAnimationFrame(loop);
  };

  build();
  new ResizeObserver(() => build()).observe(cv);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(cv);
  if (!reduce) raf = requestAnimationFrame(loop);
}

export function initPlexus() {
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-plexus]').forEach(setup);
}
