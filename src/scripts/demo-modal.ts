/**
 * Punto de enchufe de las demos reales (public/demos/*.js).
 * - Botones [data-demo="<id>"] abren el modal; la demo se carga con import() dinámico.
 * - Precarga al pasar el puntero o el foco por el botón.
 * - Enlace profundo: /#demo-<id> abre la demo al cargar la página.
 * - Cierre: botón, Esc (evento "cancel" nativo), clic en el fondo o el botón Atrás del navegador
 *   (al abrir se agrega una entrada al historial con pushState; popstate la cierra).
 *   Al cerrar se llama unmount() y el foco vuelve al botón que la abrió.
 */
import { demos, isDemoId, loadDemo, type DemoId } from '../demos/registry';
import type { DemoModule } from '../demos/types';
import type { Lang } from '../i18n/langs';
import { waLink } from '../i18n/ui';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const dialog = document.getElementById('demo-modal') as HTMLDialogElement | null;
let mounted: DemoModule | null = null;
let opener: HTMLElement | null = null;
let openToken = 0;
/** true si al abrir se agregó una entrada al historial (el botón Atrás cierra el modal). */
let pushed = false;
let closingFromPop = false;
/** Mientras el history.back() del cierre no termina, no se abre otra demo (evita que ese "Atrás" la cierre). */
let backDone: Promise<void> | null = null;

const pageLang = (): Lang => (document.documentElement.lang === 'en' ? 'en' : 'es');
const urlFor = (id: DemoId | null): URL => {
  const url = new URL(location.href);
  url.hash = id ? `demo-${id}` : '';
  return url;
};

/** Solo los mensajes de estado (cargando / error) van a la región viva, no el cuerpo entero de la demo. */
function status(text: string): void {
  const el = dialog?.querySelector<HTMLElement>('#demo-modal-status');
  if (el) el.textContent = text;
}

function stateMsg(body: HTMLElement, text: string, retry?: () => void): void {
  const box = document.createElement('div');
  box.className = 'm-state';
  const p = document.createElement('p');
  p.textContent = text;
  box.append(p);
  if (retry && dialog) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn-secondary btn-sm';
    b.textContent = dialog.dataset.retry ?? '';
    b.addEventListener('click', retry);
    box.append(b);
  }
  body.replaceChildren(box);
  status(text);
}

function unmountCurrent(): void {
  try {
    mounted?.unmount();
  } catch (error) {
    console.error(error);
  }
  mounted = null;
}

async function openDemo(id: DemoId, trigger: HTMLElement | null): Promise<void> {
  if (!dialog) return;
  if (backDone) await backDone;
  const body = dialog.querySelector<HTMLElement>('#demo-modal-body')!;
  const title = dialog.querySelector<HTMLElement>('#demo-modal-title')!;
  const wa = dialog.querySelector<HTMLAnchorElement>('#demo-modal-wa');
  const lang = pageLang();
  const token = ++openToken;
  const name = demos[id].title[lang];

  if (!opener) opener = trigger ?? (document.activeElement as HTMLElement | null);
  title.textContent = name;
  if (wa?.dataset.waTemplate) wa.href = waLink(wa.dataset.waTemplate.replace('{name}', name));
  unmountCurrent();
  stateMsg(body, dialog.dataset.loading ?? '');
  if (history.state?.fsDemo) history.replaceState({ fsDemo: id }, '', urlFor(id));
  else {
    if (location.hash.startsWith('#demo-')) history.replaceState(history.state, '', urlFor(null)); // llegada por enlace directo
    history.pushState({ fsDemo: id }, '', urlFor(id));
    pushed = true;
  }
  if (!dialog.open) dialog.showModal();
  dialog.querySelector<HTMLElement>('[data-demo-close]')?.focus();

  try {
    const mod = await loadDemo(id);
    if (token !== openToken || !dialog.open) return; // se cerró mientras cargaba
    body.replaceChildren();
    mounted = mod; // antes del montaje: si se cierra mientras monta, cleanup() la desmonta
    await mod.mountDemo(body, { lang });
    status('');
    if (token !== openToken || !dialog.open) unmountCurrent();
  } catch (error) {
    console.error(error);
    if (token === openToken) stateMsg(body, dialog.dataset.error ?? '', () => void openDemo(id, null));
  }
}

function cleanup(): void {
  // El evento "close" llega en una tarea aparte: si ya se abrió otra demo, no hay nada que limpiar.
  if (dialog?.open) return;
  openToken++;
  unmountCurrent();
  dialog?.querySelector('#demo-modal-body')?.replaceChildren();
  status('');
  if (pushed && !closingFromPop && history.state?.fsDemo) {
    // Quita la entrada de la demo del historial.
    backDone = new Promise<void>((res) => addEventListener('popstate', () => res(), { once: true })).then(() => {
      backDone = null;
    });
    history.back();
  }
  else if (location.hash.startsWith('#demo-')) history.replaceState(null, '', urlFor(null));
  pushed = false;
  closingFromPop = false;
  // Llegada por enlace directo: no hay botón que la abrió; el foco va al contenido.
  const fromButton = !!opener && opener !== document.body && opener.isConnected;
  (fromButton ? opener : document.getElementById('main'))?.focus({ preventScroll: !fromButton });
  opener = null;
}

function trapFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !dialog) return;
  const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

if (dialog) {
  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-demo]');
    const id = trigger?.dataset.demo;
    if (trigger && id && isDemoId(id)) {
      event.preventDefault();
      opener = trigger;
      void openDemo(id, trigger);
    }
  });

  const prefetch = (event: Event) => {
    const id = (event.target as Element | null)?.closest?.<HTMLElement>('[data-demo]')?.dataset.demo;
    if (id && isDemoId(id)) void loadDemo(id).catch(() => {});
  };
  document.addEventListener('pointerover', prefetch, { passive: true });
  document.addEventListener('focusin', prefetch);

  dialog.addEventListener('close', cleanup);
  dialog.addEventListener('keydown', trapFocus);
  // Clic en el fondo: solo si el gesto empezó y terminó fuera del contenido (no al soltar tras seleccionar texto).
  let downOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => (downOnBackdrop = event.target === dialog));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog && downOnBackdrop) dialog.close();
    downOnBackdrop = false;
  });
  dialog.querySelector('[data-demo-close]')?.addEventListener('click', () => dialog.close());

  // Botón Atrás (o gesto Atrás en el celular) con la demo abierta: cierra el modal y se queda en la página.
  addEventListener('popstate', () => {
    if (backDone) return; // es el "Atrás" que hizo el propio cierre
    if (dialog.open && !history.state?.fsDemo) {
      closingFromPop = true;
      dialog.close();
    }
  });

  const match = location.hash.match(/^#demo-(.+)$/);
  if (match && isDemoId(match[1])) void openDemo(match[1], null);
  addEventListener('hashchange', () => {
    const m = location.hash.match(/^#demo-(.+)$/);
    if (m && isDemoId(m[1]) && !dialog.open && !history.state?.fsDemo) void openDemo(m[1], null);
  });
}
