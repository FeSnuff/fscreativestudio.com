/**
 * Proyectos reales (con permiso de cada dueño). Capturas en /public/proyectos, sin enlaces.
 * Los datos de ejemplo de cada web (teléfonos 555, direcciones) quedan desenfocados o fuera del recorte.
 */
import type { Localized } from '../i18n/langs';

export type ProjectStatus = 'live' | 'dev';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  own?: boolean;
  text: Localized<{ trade: string; place: string; did: string }>;
}

export const projects: Project[] = [
  {
    id: 'ninos',
    name: "Nino's Landscaping",
    status: 'live',
    text: {
      es: { trade: 'Jardinería y paisajismo', place: 'Virginia, EE. UU.', did: 'Web bilingüe + portal para el equipo' },
      en: { trade: 'Lawn care & landscaping', place: 'Virginia, USA', did: 'Bilingual website + team portal' },
    },
  },
  {
    id: 'columbus',
    name: 'Columbus Construction',
    status: 'dev',
    text: {
      es: { trade: 'Construcción y electricidad', place: 'Virginia, EE. UU.', did: 'Web + portal para cotizar y hacer firmar contratos' },
      en: { trade: 'Construction & electrical', place: 'Virginia, USA', did: 'Website + portal to quote and get contracts signed' },
    },
  },
  {
    id: 'qori',
    name: 'Qori Wayra',
    status: 'live',
    own: true,
    text: {
      es: { trade: 'Agencia de viajes', place: 'Cusco, Perú', did: 'Web bilingüe de tours + intranet' },
      en: { trade: 'Travel agency', place: 'Cusco, Peru', did: 'Bilingual tour website + intranet' },
    },
  },
];

/** Tamaños reales de los WebP de /public/proyectos. */
export const SHOT = { m: { w: 420, h: 786 }, d: { w: 960, h: 540 } } as const;
export const shotSrc = (id: string, kind: 'm' | 'd') => `/proyectos/${id}-${kind === 'm' ? 'movil' : 'escritorio'}.webp`;
