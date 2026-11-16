/**
 * Proyectos reales (con permiso de cada dueño). Sin enlaces.
 * Lo principal es el sistema interno: capturas hechas en copias locales con datos ficticios ("Ejemplo"),
 * nunca en producción. La web pública va como captura secundaria (datos de prueba desenfocados).
 */
import type { Localized } from '../i18n/langs';

export type ProjectStatus = 'live' | 'dev';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  own?: boolean;
  text: Localized<{ trade: string; place: string; did: string; screens: [string, string, string]; tabs: [string, string, string] }>;
}

export const projects: Project[] = [
  {
    id: 'ninos',
    name: "Nino's Landscaping",
    status: 'live',
    text: {
      es: { trade: 'Jardinería y paisajismo', place: 'Virginia, EE. UU.', did: 'Portal del equipo para agendar, cotizar, facturar y cobrar. Con web bilingüe.', screens: ['Agenda del equipo y lo que falta cobrar', 'Calendario por equipo', 'Facturas: quién pagó y quién debe'], tabs: ['Hoy', 'Calendario', 'Facturas'] },
      en: { trade: 'Lawn care & landscaping', place: 'Virginia, USA', did: 'Team portal to schedule, quote, invoice and get paid. Plus a bilingual website.', screens: ['Team schedule and what’s left to collect', 'Calendar by crew', 'Invoices: who paid and who owes'], tabs: ['Today', 'Calendar', 'Invoices'] },
    },
  },
  {
    id: 'columbus',
    name: 'Columbus Construction',
    status: 'dev',
    text: {
      es: { trade: 'Construcción y electricidad', place: 'Virginia, EE. UU.', did: 'Portal para cotizar, hacer firmar contratos y llevar los pagos. Con web.', screens: ['Cotiza en segundos', 'Contrato firmado y pagos al día', 'Las visitas de hoy'], tabs: ['Cotiza', 'Contrato', 'Agenda'] },
      en: { trade: 'Construction & electrical', place: 'Virginia, USA', did: 'Portal to quote, get contracts signed and track payments. Plus a website.', screens: ['Quote in seconds', 'Signed contract, payments on track', 'Today’s visits'], tabs: ['Quote', 'Contract', 'Schedule'] },
    },
  },
  {
    id: 'qori',
    name: 'Qori Wayra',
    status: 'live',
    own: true,
    text: {
      es: { trade: 'Agencia de viajes', place: 'Cusco, Perú', did: 'Intranet de ventas: clientes, cotizaciones y cobros. Con web bilingüe de tours.', screens: ['Clientes por estado, de nuevo a vendido', 'Cotización por días, lista para WhatsApp', 'Venta y saldo por cobrar'], tabs: ['Clientes', 'Cotización', 'Venta'] },
      en: { trade: 'Travel agency', place: 'Cusco, Peru', did: 'Sales intranet: customers, quotes and payments. Plus a bilingual tour website.', screens: ['Customers by stage, from new to sold', 'Day-by-day quote, ready for WhatsApp', 'Sale and balance due'], tabs: ['Customers', 'Quote', 'Sale'] },
    },
  },
];

/** Tamaños reales de los WebP de /public/proyectos. */
export const SHOT = { sys: { w: 390, h: 844 }, web: { w: 960, h: 540 } } as const;
export const sysSrc = (id: string, n: number) => `/proyectos/${id}-sistema-${n}.webp`;
export const webSrc = (id: string) => `/proyectos/${id}-escritorio.webp`;
