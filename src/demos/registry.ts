/**
 * Registro de demos interactivas (se abren en el modal, bajo demanda).
 *
 * Las demos reales viven en ../demos (repo hermano): `npm run build` allí genera dist/,
 * que se copia a public/demos/ (ver README, "Integrar las demos"). Aquí solo se cargan
 * con import() dinámico desde /demos/*.js: su JS (y jsPDF, local) NO entra en la carga
 * inicial; se descarga al abrir la demo (o al pasar el puntero/foco por el botón).
 *
 * CONTRATO de cada módulo (src/demos/types.ts):
 *   export function mountDemo(el: HTMLElement, opts: { lang: 'es' | 'en' }): void
 *   export function unmount(): void
 *
 * Enlace directo: /#demo-<id> (cotizacion, tablero, asistente).
 */
import type { Localized } from '../i18n/langs';
import type { DemoModule } from './types';

export type DemoId = 'cotizacion' | 'tablero' | 'asistente';

export interface DemoEntry {
  title: Localized<string>;
  /** Ruta pública del módulo compilado. */
  src: string;
}

export const demos: Record<DemoId, DemoEntry> = {
  cotizacion: { title: { es: 'De la cotización al "pagado"', en: 'From quote to "paid"' }, src: '/demos/quote.js' },
  tablero: { title: { es: 'Tu semana de trabajos, en orden', en: 'Your week of jobs, in order' }, src: '/demos/jobs.js' },
  asistente: { title: { es: 'Tu asistente de WhatsApp', en: 'Your WhatsApp assistant' }, src: '/demos/chat.js' },
};

export const isDemoId = (id: string): id is DemoId => Object.hasOwn(demos, id);

const cache = new Map<DemoId, Promise<DemoModule>>();

/** Carga (una sola vez) el módulo de la demo; si falla, el siguiente intento lo vuelve a pedir. */
export function loadDemo(id: DemoId): Promise<DemoModule> {
  let p = cache.get(id);
  if (!p) {
    p = (import(/* @vite-ignore */ `${demos[id].src}?v=${__DEMOS_V__}`) as Promise<DemoModule>).catch((error: unknown) => {
      cache.delete(id);
      throw error;
    });
    cache.set(id, p);
  }
  return p;
}
