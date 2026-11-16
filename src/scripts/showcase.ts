/**
 * Vitrinas de proyectos ([data-vit], components/Showcase.astro):
 * - Cambia de pantalla cada 4 s, solo mientras la vitrina está en pantalla (IntersectionObserver).
 * - Se detiene mientras el mouse o el foco están encima; al tocar una pestaña o el celular queda en pausa
 *   (se reanuda con el botón de pausa/reanudar).
 * - Pestañas con ←/→/Inicio/Fin. Inclinación 3D (máx. 6°) solo con puntero fino (escritorio).
 * Solo transform/opacity. Estado legible para pruebas: data-idx y data-state en cada [data-vit].
 */
const STEP = 4000;
const MAX_TILT = 6;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

function setup(root: HTMLElement) {
  const imgs = [...root.querySelectorAll<HTMLImageElement>('[data-vit-img]')];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-vit-tab]')];
  const cap = root.querySelector<HTMLElement>('[data-vit-cap]');
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-vit-pause]');
  const dev = root.querySelector<HTMLElement>('[data-vit-dev]');
  const tablist = root.querySelector<HTMLElement>('[data-vit-tabs]');
  if (imgs.length < 2) return;

  let idx = 0;
  let visible = false;
  let hovering = false;
  let focused = false;
  let userPaused = false;
  let timer = 0;

  if (tablist) tablist.hidden = false;
  if (pauseBtn) pauseBtn.hidden = false;

  const running = () => visible && !hovering && !focused && !userPaused;
  const sync = () => {
    root.dataset.idx = String(idx);
    root.dataset.state = running() ? 'running' : 'paused';
    clearInterval(timer);
    if (running()) timer = window.setInterval(() => go(idx + 1), STEP);
  };

  function go(n: number, focusTab = false) {
    const next = (n + imgs.length) % imgs.length;
    if (next === idx) return;
    imgs[idx].classList.remove('is-on');
    imgs[idx].classList.add('is-out');
    imgs[idx].setAttribute('aria-hidden', 'true');
    const prev = imgs[idx];
    window.setTimeout(() => prev.classList.remove('is-out'), 700);
    idx = next;
    imgs[idx].classList.remove('is-out');
    imgs[idx].classList.add('is-on');
    imgs[idx].removeAttribute('aria-hidden');
    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === idx));
      t.tabIndex = i === idx ? 0 : -1;
    });
    if (cap) cap.textContent = tabs[idx]?.dataset.cap ?? cap.textContent;
    if (focusTab) tabs[idx]?.focus();
    root.dataset.idx = String(idx);
  }

  const setUserPaused = (v: boolean) => {
    userPaused = v;
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', String(v));
      pauseBtn.setAttribute('aria-label', (v ? pauseBtn.dataset.play : pauseBtn.dataset.pause) ?? '');
      root.classList.toggle('vit-held', v);
    }
    sync();
  };

  tabs.forEach((t, i) =>
    t.addEventListener('click', () => {
      go(i);
      setUserPaused(true);
    }),
  );
  tablist?.addEventListener('keydown', (e) => {
    const k = e.key;
    const to = k === 'ArrowRight' ? idx + 1 : k === 'ArrowLeft' ? idx - 1 : k === 'Home' ? 0 : k === 'End' ? imgs.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    go(to, true);
    setUserPaused(true);
  });
  pauseBtn?.addEventListener('click', () => setUserPaused(!userPaused));
  // Tocar el celular (móvil) = interactuar: pausa.
  dev?.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') setUserPaused(true);
  });

  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      hovering = true;
      sync();
    }
  });
  root.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      hovering = false;
      sync();
    }
    if (dev) dev.style.transform = '';
  });
  root.addEventListener('focusin', () => {
    focused = true;
    sync();
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) {
      focused = false;
      sync();
    }
  });

  // Inclinación 3D siguiendo el mouse (solo escritorio).
  if (dev) {
    let raf = 0;
    root.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        dev.style.transform = `perspective(900px) rotateX(${(-y * 2 * MAX_TILT).toFixed(2)}deg) rotateY(${(x * 2 * MAX_TILT).toFixed(2)}deg)`;
      });
    });
  }

  new IntersectionObserver(
    ([en]) => {
      visible = en.isIntersecting;
      sync();
    },
    { threshold: 0.35 },
  ).observe(root);
  sync();
}

document.querySelectorAll<HTMLElement>('[data-vit]').forEach(setup);
