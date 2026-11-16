/**
 * Redirecciones de las URLs del sitio VIEJO (fs-publicar: inglés en `/`, español en `/es/`)
 * a las nuevas (español en `/`, inglés en `/en/`).
 *
 * GitHub Pages no permite 301 de servidor: Astro genera para cada clave una página
 * HTML con <meta http-equiv="refresh" content="0;url=..."> + <link rel="canonical">
 * + noindex. Google la trata como redirección permanente.
 *
 * LÍMITE: la home vieja `/` (inglés) no se puede redirigir porque ahora es la home
 * en español; quien llegue con el navegador en inglés ve el aviso de idioma.
 *
 * Las URLs nuevas se calculan desde los datos: si cambia un slug, la redirección lo sigue.
 */
import { services } from '../data/services';
import { routes } from '../i18n/routes';
import type { Lang } from '../i18n/langs';
import { collectionBase } from '../i18n/routes';

const svc = (id: string, lang: Lang): string => {
  const s = services.find((x) => x.id === id);
  if (!s) throw new Error(`redirects: servicio inexistente "${id}"`);
  return `${collectionBase.service[lang]}${s.text[lang].slug}/`;
};

/**
 * Servicios viejos (/solutions/<slug>) → destino más cercano. Los tres de software a medida
 * van al hub de servicios (03-seo §8.2: apuntarlos a la oficina sería un soft 404).
 */
const oldSolutions: Record<string, string | null> = {
  'management-systems': null,
  'team-collaboration': null,
  'process-automation': null,
  'digital-platform': 'web',
  'support-continuity': 'mantenimiento',
};

const build = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const lang of ['en', 'es'] as const) {
    const old = lang === 'en' ? '' : '/es';
    map[`${old}/contact/`] = routes.contact[lang];
    map[`${old}/how-we-work/`] = routes.home[lang];
    map[`${old}/privacy/`] = routes.privacy[lang];
    map[`${old}/terms/`] = routes.privacy[lang];
    map[`${old}/work/`] = routes.work[lang];
    map[`${old}/solutions/`] = routes.services[lang];
    for (const [slug, id] of Object.entries(oldSolutions)) map[`${old}/solutions/${slug}/`] = id ? svc(id, lang) : routes.services[lang];
  }
  map['/es/'] = routes.home.es;
  // Prefijos de páginas generadas que no tienen índice propio.
  map[collectionBase.tool.es] = `${routes.services.es}#herramientas`;
  map[collectionBase.tool.en] = `${routes.services.en}#herramientas`;
  return map;
};

export const redirects = build();
