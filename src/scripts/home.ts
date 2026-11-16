/**
 * Home (port de la maqueta v3, sin parámetros de prueba):
 * - Hero: el logo FS 3D gira de canto y se abre en el teléfono, que muestra en bucle la web de ejemplo
 *   y la oficina (cotiza → PDF → firma → pagado). Las pantallas son copias de las de la historia.
 * - Historia: escena fija de 5 pasos ligada al scroll nativo (sin secuestrar el scroll), un acento por paso.
 * - Redes: panel antes → después ligado al scroll (o con el selector).
 * - Movimiento reducido (clase .still, puesta en <head>): sin logo, sin bucle ni escena fija; cada paso
 *   lleva su pantalla final en miniatura.
 * Un solo bucle rAF a 30 fps para hero (avance, inclinación y campo de puntos), pausado fuera de vista.
 */
const d = document;
const root = d.documentElement;
const still = root.classList.contains('still');
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const $ = <T extends HTMLElement = HTMLElement>(id: string) => d.getElementById(id) as T | null;

/**
 * Pinta una pantalla del teléfono según su avance s (0..1).
 * `swapLang`: solo la historia (paso 1, "en español e inglés") cambia el idioma de la web de ejemplo;
 * el hero la muestra siempre en el idioma de la página.
 */
function paint(sc: HTMLElement, s: number, swapLang = true): void {
  sc.style.setProperty('--s', s.toFixed(3));
  sc.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => el.classList.toggle('on', s >= Number(el.dataset.at)));
  if (sc.classList.contains('web')) sc.classList.toggle('en-on', swapLang && s >= 0.5);
  const t = sc.querySelector<HTMLElement>('.tot-v');
  if (t) {
    let sum = 0;
    sc.querySelectorAll<HTMLElement>('.it2.on').forEach((it) => (sum += Number(it.dataset.v)));
    t.textContent = `$${sum.toFixed(2)}`;
  }
}

const story = $('historia');
const scene = $('scene');
const hero = $('hero');
if (story && scene && hero) {
  const steps = [...d.querySelectorAll<HTMLElement>('.st2')];
  const scrs = [...d.querySelectorAll<HTMLElement>('#screen2 .scr2')];
  const bars = [...d.querySelectorAll<HTMLElement>('.prog2 i')];
  const N = steps.length;
  let cur = 0;
  // Índice lateral (escritorio): muestra el paso actual y salta a cualquiera.
  const idx = [...d.querySelectorAll<HTMLButtonElement>('.idx2 button')];
  idx.forEach((b) => b.addEventListener('click', () => {
    const k = Number(b.dataset.go);
    const span = story.offsetHeight - scene.offsetHeight;
    const top = story.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + span * ((k - 1) + 0.45) / N, behavior: 'smooth' });
  }));

  // ---------- Historia: 5 pasos con escena fija
  const setStory = (step: number, s: number) => {
    if (step !== cur) {
      cur = step;
      steps.forEach((li, i) => {
        li.classList.toggle('on', i === step - 1);
        li.classList.toggle('past', i < step - 1);
      });
      scrs.forEach((sc, i) => sc.classList.toggle('on', i === step - 1));
      idx.forEach((b, i) => {
        b.classList.toggle('on', i === step - 1);
        if (i === step - 1) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
      const acc = steps[step - 1].style.getPropertyValue('--acc');
      scene.style.setProperty('--acc', acc);
      scene.style.setProperty('--acc-bar', acc);
    }
    paint(scrs[step - 1], s);
    bars.forEach((b, i) => b.style.setProperty('--f', String(i < step - 1 ? 1 : i === step - 1 ? s : 0)));
  };
  const storyScroll = () => {
    const r = story.getBoundingClientRect();
    const span = story.offsetHeight - scene.offsetHeight;
    const p = clamp(-r.top / span, 0, 0.9999);
    const f = p * N;
    const step = Math.floor(f) + 1;
    setStory(step, clamp((f - (step - 1) - 0.08) / 0.7, 0, 1));
  };

  // ---------- Hero: las pantallas del teléfono son copias de las de la historia
  const hs = $('hscreen')!;
  const hscr = scrs.map((sc) => {
    const c = sc.cloneNode(true) as HTMLElement;
    c.classList.remove('on');
    hs.appendChild(c);
    return c;
  });
  const offer = $('offer')!;
  const wrap = $('hphone-wrap')!;
  const logo = $('logo3d')!;
  const morph = $('morph')!;
  // Movimiento calmo: cada pantalla del hero se queda más tiempo quieta.
  const HDUR = [4200, 3000, 2600, 2800, 3400];
  let hi = 0;
  let hstart = 0;
  let heroOn = true;
  const heroShow = (i: number) => {
    hi = i;
    hstart = performance.now();
    hscr.forEach((c, k) => c.classList.toggle('on', k === i));
    offer.classList.toggle('off', i > 0);
    paint(hscr[i], 0, false);
  };

  if (still) {
    // Estático: teléfono con la web de ejemplo; cada paso de la historia lleva su pantalla final.
    logo.style.display = 'none';
    heroShow(0);
    steps.forEach((li, i) => {
      const m = d.createElement('div');
      m.className = 'mini';
      m.setAttribute('aria-hidden', 'true');
      const sc = d.createElement('div');
      sc.className = 'screen2';
      const c = scrs[i].cloneNode(true) as HTMLElement;
      c.classList.add('on');
      sc.appendChild(c);
      m.appendChild(sc);
      li.insertBefore(m, li.firstChild);
      paint(c, 1);
      if (i === 0) c.classList.remove('en-on');
    });
  } else {
    let tick = false;
    addEventListener(
      'scroll',
      () => {
        if (!tick) {
          tick = true;
          requestAnimationFrame(() => {
            tick = false;
            storyScroll();
          });
        }
      },
      { passive: true },
    );
    addEventListener('resize', storyScroll);
    storyScroll();
    // Intro: el logo FS gira de canto y "se abre" en el teléfono.
    if (!logo.animate) {
      logo.style.display = 'none';
      heroShow(0);
    } else {
      wrap.style.opacity = '0';
      heroShow(0);
      // Intro 3D: el contenedor solo aparece/escala (la opacidad aplana el 3D si va en la pieza que gira);
      // la pieza 3D (#l3d) gira para lucir el relieve que se arma capa por capa (CSS .gly) y se "abre" de canto.
      logo.animate(
        [
          { transform: 'scale(.6)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1, offset: 0.12 },
          { transform: 'scale(1.05)', opacity: 1, offset: 0.86 },
          { transform: 'scale(1.25)', opacity: 0 },
        ],
        { duration: 4000, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' },
      );
      const giro = $('l3d')?.animate(
        [
          { transform: 'rotateY(0) rotateX(0)' },
          { transform: 'rotateY(-10deg) rotateX(6deg)', offset: 0.12 },
          { transform: 'rotateY(-16deg) rotateX(8deg)', offset: 0.4 },
          { transform: 'rotateY(-42deg) rotateX(14deg)', offset: 0.57 },
          { transform: 'rotateY(38deg) rotateX(-10deg)', offset: 0.78 },
          { transform: 'rotateY(0) rotateX(0)', offset: 0.86 },
          { transform: 'rotateY(90deg) rotateX(0)' },
        ],
        { duration: 4000, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' },
      );
      const a = wrap.animate(
        [
          { transform: 'rotateY(-90deg) scale(.55)', opacity: 0 },
          { transform: 'rotateY(0) scale(1)', opacity: 1 },
        ],
        { duration: 800, delay: 3500, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' },
      );
      a.onfinish = () => {
        wrap.style.opacity = '';
        logo.style.display = 'none';
        giro?.cancel();
        hstart = performance.now();
      };
      setTimeout(() => (wrap.style.opacity = ''), 3500);
      hstart = performance.now() + 3600;
    }
  }

  // ---------- Un solo bucle rAF (30 fps): avance del hero, inclinación y campo de puntos
  let tx = 0;
  let ty = 0;
  let rx = 0;
  let ry = 0;
  let ptr = false;
  let orient = false;
  let last = 0;
  let running = false;
  let paused = false;
  const t0 = performance.now();
  hero.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    ty = clamp(((e.clientX - (r.left + r.width / 2)) / innerWidth) * 16, -6, 6);
    tx = clamp((-(e.clientY - (r.top + r.height / 2)) / innerHeight) * 14, -5, 5);
    ptr = true;
    kick();
  });
  hero.addEventListener('pointerleave', () => (ptr = false));
  const listenTilt = () =>
    addEventListener('deviceorientation', (e) => {
      if (e.beta == null || e.gamma == null) return;
      orient = true;
      tx = clamp((e.beta - 45) * 0.2, -5, 5);
      ty = clamp(e.gamma * 0.2, -6, 6);
      kick();
    });
  type DOE = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
  morph.addEventListener('click', () => {
    // Permiso de iOS SOLO al tocar el teléfono.
    const DOE = (window as unknown as { DeviceOrientationEvent?: DOE }).DeviceOrientationEvent;
    if (orient || !DOE || still || paused) return;
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission()
        .then((s) => {
          if (s === 'granted') listenTilt();
        })
        .catch(() => {});
    } else listenTilt();
  });

  const fc = $<HTMLCanvasElement>('field')!;
  const fx = fc.getContext('2d');
  let W = 0;
  let H = 0;
  const fp = { on: false, x: 0, y: 0 };
  const sizeField = () => {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    fc.width = W * dpr;
    fc.height = H * dpr;
    fx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    fp.on = true;
    fp.x = e.clientX - r.left;
    fp.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => (fp.on = false));
  const drawField = (t: number, flat = false) => {
    if (!fx) return;
    fx.clearRect(0, 0, W, H);
    const gap = 28;
    const s = t / 1000;
    let px: number;
    let py: number;
    if (flat) {
      px = -999;
      py = -999;
    } else if (fp.on) {
      px = fp.x;
      py = fp.y;
    } else {
      px = W * 0.68 + Math.cos(s * 0.3) * W * 0.12;
      py = H * 0.5 + Math.sin(s * 0.4) * H * 0.18;
    }
    for (let y = gap / 2; y < H; y += gap)
      for (let x = gap / 2; x < W; x += gap) {
        const dx = x - px;
        const dy = y - py;
        const dd = Math.sqrt(dx * dx + dy * dy) || 1;
        let f = Math.max(0, 1 - dd / 150);
        f *= f;
        const z = 1.6 + f * 1.8;
        fx.fillStyle = f > 0.04 ? `${dx > 0 ? 'rgba(226,85,200,' : 'rgba(155,135,255,'}${(0.25 + f * 0.45).toFixed(2)})` : 'rgba(237,237,245,.10)';
        fx.fillRect(x + (dx / dd) * f * 18 - z / 2, y + (dy / dd) * f * 18 - z / 2, z, z);
      }
  };
  const frame = (t: number) => {
    if (!heroOn || d.hidden || paused) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
    if (t - last < 33) return;
    last = t;
    if (!ptr && !orient) {
      const k = (t - t0) / 1000;
      tx = Math.sin(k * 0.4) * 2;
      ty = Math.sin(k * 0.3) * 3.5;
    }
    rx += (tx - rx) * 0.12;
    ry += (ty - ry) * 0.12;
    wrap.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    wrap.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    const el = t - hstart;
    if (el >= 0) {
      const dur = HDUR[hi];
      paint(hscr[hi], clamp(el / (dur * 0.6), 0, 1), false);
      if (el > dur) heroShow((hi + 1) % hscr.length);
    }
    drawField(t);
  };
  function kick() {
    if (!running && !still && heroOn && !d.hidden && !paused) {
      running = true;
      requestAnimationFrame(frame);
    }
  }
  sizeField();
  addEventListener('resize', () => {
    sizeField();
    if (still) drawField(0, true);
  });
  // Pausa visible (WCAG 2.2.2): detiene el bucle del teléfono, la inclinación y el campo de puntos.
  const pauseBtn = $<HTMLButtonElement>('hero-pause');
  const setPaused = (v: boolean) => {
    paused = v;
    root.classList.toggle('hero-paused', v);
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', String(v));
    const label = (v ? pauseBtn.dataset.play : pauseBtn.dataset.pause) ?? '';
    pauseBtn.setAttribute('aria-label', label);
    const lbl = pauseBtn.querySelector('.lbl');
    if (lbl) lbl.textContent = label;
    if (v) {
      drawField(0, true);
      wrap.style.setProperty('--rx', '0deg');
      wrap.style.setProperty('--ry', '0deg');
      logo.getAnimations?.().forEach((a) => a.finish());
      wrap.getAnimations?.().forEach((a) => a.finish());
    } else {
      hstart = performance.now();
      kick();
    }
  };
  if (pauseBtn) {
    if (still) pauseBtn.hidden = true;
    else pauseBtn.addEventListener('click', () => setPaused(!paused));
  }
  if (still) drawField(0, true);
  else {
    new IntersectionObserver((es) => {
      heroOn = es[0].isIntersecting;
      kick();
    }).observe(hero);
    d.addEventListener('visibilitychange', kick);
    kick();
  }
}

// ---------- Canales: antes → después ligado al scroll (--k de 0 a 1)
const chan = $('chan');
if (chan) {
  let manual = false;
  let ticking = false;
  const setK = (k: number) => {
    chan.style.setProperty('--k', k.toFixed(3));
    const s = k > 0.5 ? 'after' : 'before';
    if (chan.dataset.state !== s) {
      chan.dataset.state = s;
      // El lector de pantalla oye solo la versión visible (antes o después), nunca las dos.
      chan.querySelectorAll<HTMLElement>('.big .b, .sub .b').forEach((el) => el.setAttribute('aria-hidden', String(s === 'after')));
      chan.querySelectorAll<HTMLElement>('.big .a, .sub .a').forEach((el) => el.setAttribute('aria-hidden', String(s === 'before')));
    }
  };
  /** aria-pressed solo cambia por una acción del usuario (no por el scroll). */
  const press = (s: string) => chan.querySelectorAll<HTMLElement>('[data-st]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.st === s)));
  const chanScroll = () => {
    ticking = false;
    if (manual) return;
    const r = chan.getBoundingClientRect();
    const vh = innerHeight;
    const p = (vh - r.top) / (vh + r.height);
    setK(clamp((p - 0.2) / 0.25, 0, 1));
  };
  chan.querySelectorAll<HTMLElement>('[data-st]').forEach((b) =>
    b.addEventListener('click', () => {
      manual = true;
      setK(b.dataset.st === 'after' ? 1 : 0);
      press(b.dataset.st ?? 'before');
    }),
  );
  if (still) {
    manual = true;
    setK(1);
    press('after');
  } else {
    addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(chanScroll);
        }
      },
      { passive: true },
    );
    chanScroll();
  }
}
