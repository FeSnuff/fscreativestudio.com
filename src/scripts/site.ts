/**
 * Comportamiento común a todas las páginas (port de la maqueta v3):
 * - Un solo WhatsApp por pantalla: el botón del header se oculta mientras se ve otro botón de WhatsApp.
 * - Menú móvil accesible (aria-expanded, Esc, foco atrapado y devuelto al botón).
 * - Aviso de idioma temporal: solo en ES, solo si el navegador no está en español y no hay `fs_lang`.
 * - Revelado progresivo (.rv): CSS scroll-driven si existe; si no, IntersectionObserver.
 * localStorage siempre dentro de try/catch (modo privado o almacenamiento bloqueado).
 */
import { LANG_STORAGE_KEY } from '../config/site';

const d = document;
const root = d.documentElement;
const still = root.classList.contains('still');

function readPref(): string | null {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}
function savePref(lang: string): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* sin almacenamiento: el aviso podría volver a salir, nada más */
  }
}

// ---------- Selector de idioma: cualquier [data-set-lang] guarda la elección.
d.addEventListener('click', (e) => {
  const setter = (e.target as Element | null)?.closest<HTMLElement>('[data-set-lang]');
  if (setter?.dataset.setLang) savePref(setter.dataset.setLang);
});

// ---------- Revelado progresivo
if (!root.classList.contains('sda')) {
  const els = d.querySelectorAll<HTMLElement>('.rv');
  if (still || !('IntersectionObserver' in window)) els.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    els.forEach((el) => io.observe(el));
  }
}

// ---------- Header: un solo WhatsApp por pantalla + borde al desplazar
const hdr = d.getElementById('hdr');
if (hdr) {
  const waBtns = [...d.querySelectorAll<HTMLElement>('main .btn-wa')];
  let ticking = false;
  const upd = () => {
    ticking = false;
    const top = hdr.offsetHeight;
    const vis = waBtns.some((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.bottom > top && r.top < innerHeight;
    });
    hdr.classList.toggle('hero-cta-visible', vis);
    hdr.classList.toggle('scrolled', scrollY > 8);
  };
  const req = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(upd);
    }
  };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  upd();
}

// ---------- Menú móvil
const mb = d.getElementById('menu-btn');
const mm = d.getElementById('mmenu');
if (mb && mm) {
  const desk = matchMedia('(min-width: 960px)');
  const focusables = () => [mb, ...mm.querySelectorAll<HTMLElement>('a')];
  const menu = (open: boolean, focus = true) => {
    mm.hidden = !open;
    mb.setAttribute('aria-expanded', String(open));
    mb.setAttribute('aria-label', (open ? mb.dataset.openLabel : mb.dataset.closedLabel) ?? '');
    d.body.classList.toggle('menu-open', open);
    // Con el panel abierto, el resto de la página queda fuera del alcance del lector y del teclado.
    for (const el of d.querySelectorAll<HTMLElement>('main, footer, #langnote')) el.inert = open;
    if (!focus) return;
    if (open) mm.querySelector<HTMLElement>('a')?.focus();
    else mb.focus();
  };
  mb.addEventListener('click', () => menu(Boolean(mm.hidden)));
  mm.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) menu(false, false);
  });
  d.addEventListener('keydown', (e) => {
    if (mm.hidden) return;
    if (e.key === 'Escape') menu(false);
    if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(d.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
  desk.addEventListener('change', () => {
    if (desk.matches && !mm.hidden) menu(false, false);
  });
  // Al volver con el botón "atrás" (bfcache) el menú no debe quedar abierto.
  addEventListener('pageshow', () => {
    if (!mm.hidden) menu(false, false);
  });
}

// ---------- Aviso de idioma temporal (solo existe en las páginas en español)
// - Se va solo a los ~7 s, al hacer scroll o al tocar/hacer clic FUERA de él; Esc también lo cierra.
//   Tab NO lo cierra: con teclado se llega a "Yes, English". El tiempo se pausa con el foco o el puntero encima.
// - Solo una elección explícita guarda `fs_lang` ("Yes, English" = en, "Seguir en español" = es).
//   Si nadie elige, solo se recuerda que el aviso ya se vio (`fs_lang_notice`) para no repetirlo.
const NOTICE_SEEN = 'fs_lang_notice';
const ln = d.getElementById('langnote');
if (ln && root.lang === 'es') {
  const first = (navigator.languages?.[0] ?? navigator.language ?? 'es').toLowerCase();
  let seen: string | null = null;
  try {
    seen = localStorage.getItem(NOTICE_SEEN);
  } catch {
    /* sin almacenamiento */
  }
  if (!first.startsWith('es') && !readPref() && !seen) {
    const ms = still ? 10000 : 7000;
    let timer = 0;
    const hide = () => {
      if (ln.hidden) return;
      try {
        localStorage.setItem(NOTICE_SEEN, '1');
      } catch {
        /* sin almacenamiento */
      }
      clearTimeout(timer);
      const hadFocus = ln.contains(d.activeElement);
      ln.classList.add('out');
      setTimeout(() => {
        ln.hidden = true;
        if (hadFocus) d.getElementById('main')?.focus({ preventScroll: true });
      }, 300);
      removeEventListener('scroll', onScroll);
      d.removeEventListener('pointerdown', onPointer, true);
      d.removeEventListener('keydown', onKey, true);
    };
    const start = () => {
      clearTimeout(timer);
      ln.classList.remove('hold');
      timer = window.setTimeout(() => {
        if (!ln.matches(':hover, :focus-within')) hide();
      }, ms);
    };
    const hold = () => {
      clearTimeout(timer);
      ln.classList.add('hold');
    };
    const onScroll = () => {
      if (!ln.contains(d.activeElement)) hide();
    };
    const onPointer = (e: Event) => {
      if (!(e.target as Element | null)?.closest?.('#langnote')) hide();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    ln.style.setProperty('--ln-ms', `${ms}ms`);
    ln.hidden = false;
    // Se marca como visto apenas se muestra: no se repite aunque se navegue con teclado, Atrás o una URL escrita.
    try {
      localStorage.setItem(NOTICE_SEEN, '1');
    } catch {
      /* sin almacenamiento */
    }
    // El texto se escribe después de mostrar la región para que los lectores de pantalla lo anuncien.
    const msg = ln.querySelector<HTMLElement>('[data-msg]');
    if (msg) requestAnimationFrame(() => (msg.textContent = msg.dataset.msg ?? ''));
    start();
    ln.addEventListener('focusin', hold);
    ln.addEventListener('mouseenter', hold);
    ln.addEventListener('focusout', () => {
      if (!ln.matches(':hover')) start();
    });
    ln.addEventListener('mouseleave', () => {
      if (!ln.contains(d.activeElement)) start();
    });
    setTimeout(() => {
      addEventListener('scroll', onScroll, { passive: true });
      d.addEventListener('pointerdown', onPointer, true);
      d.addEventListener('keydown', onKey, true);
    }, 600);
    ln.querySelector('.ln-no')?.addEventListener('click', () => {
      savePref('es');
      hide();
    });
  }
}
