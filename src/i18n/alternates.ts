/**
 * Lista de TODAS las páginas indexables con su par es/en.
 * La usan el sitemap (hreflang en xhtml:link) y cualquier verificación.
 * Las herramientas `noindex` quedan fuera (y su lista se usa para filtrar el sitemap).
 */
import type { Localized } from './langs';
import { routes } from './routes';
import { getServices, getTools, serviceAlternates, toolAlternates } from '../data';

export const allPageAlternates = (): Localized<string>[] => [
  ...Object.values(routes).map((r) => ({ ...r })),
  ...getServices().map(serviceAlternates),
  ...getTools().filter((t) => !t.noindex).map(toolAlternates),
];

/** Rutas publicadas pero no indexables (fuera del sitemap). */
export const noindexPaths = (): string[] => getTools().filter((t) => t.noindex).flatMap((t) => Object.values(toolAlternates(t)));
