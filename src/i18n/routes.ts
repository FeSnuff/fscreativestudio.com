/**
 * Mapa único de rutas por idioma (slugs traducidos).
 * hreflang, canonical, selector de idioma y sitemap salen de aquí:
 * nunca se deducen rutas "cambiando el prefijo".
 */
import type { Lang, Localized } from './langs';
import { SITE_URL } from '../config/site';

export const routes = {
  home: { es: '/', en: '/en/' },
  services: { es: '/servicios/', en: '/en/services/' },
  work: { es: '/trabajos/', en: '/en/work/' },
  about: { es: '/sobre/', en: '/en/about/' },
  contact: { es: '/contacto/', en: '/en/contact/' },
  privacy: { es: '/privacidad/', en: '/en/privacy/' },
} as const satisfies Record<string, Localized<string>>;

export type RouteKey = keyof typeof routes;

/** Prefijos de las páginas generadas desde datos. */
export const collectionBase = {
  service: { es: '/servicios/', en: '/en/services/' },
  tool: { es: '/herramientas/', en: '/en/tools/' },
} as const satisfies Record<string, Localized<string>>;

export const pathFor = (key: RouteKey, lang: Lang): string => routes[key][lang];

/** Alternativas (es/en) de una ruta estática. */
export const alternatesFor = (key: RouteKey): Localized<string> => ({ ...routes[key] });

export const absoluteUrl = (path: string): string => new URL(path, SITE_URL).href;
