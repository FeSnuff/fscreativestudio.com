/**
 * Textos de interfaz (menú, botones, avisos, modal) de docs/05-textos.md §1, §10 y §11.
 * Reglas: voz de marca y tú en español; no nombrar rubros ni oficios; "asistente de WhatsApp".
 */
import type { Lang, Localized } from './langs';
import { BUSINESS } from '../config/site';

const ui = {
  es: {
    skip: 'Saltar al contenido',
    nav: { home: 'Inicio', services: 'Servicios y precios', work: 'Trabajo', about: 'Nosotros', contact: 'Contacto', privacy: 'Privacidad' },
    navLabel: 'Principal',
    mobileNavLabel: 'Menú móvil',
    logoLabel: 'FS Creative Studio, inicio',
    menu: 'Menú',
    menuClose: 'Cerrar menú',
    langSwitch: { label: 'EN: View this site in English', short: 'EN', long: 'View in English' },
    cta: {
      whatsapp: 'Escríbenos por WhatsApp',
      short: 'Escríbenos',
      call: `Llamar al ${BUSINESS.phoneDisplay}`,
      email: 'Enviar correo',
      seePrices: 'Ver precios',
      tryDemos: 'Prueba las demos',
      tryDemo: 'Pruébalo tú mismo',
      oneDemo: 'Pruébalo tú mismo',
      details: 'Ver detalles',
      askUs: 'Consúltanos',
      tellUs: 'Cuéntanos qué necesitas',
      want: 'La quiero',
    },
    breadcrumbsLabel: 'Ruta de navegación',
    stage: 'Etapa',
    includes: 'Qué incluye',
    terms: 'Condiciones',
    toolsIncluded: 'Herramientas incluidas',
    partOf: 'Forma parte de',
    includedIn: 'Incluida en',
    priceOnRequest: 'Consúltanos',
    sampleData: 'Datos de ejemplo',
    footer: {
      tagline: 'Automatización para tu negocio.',
      where: 'Para negocios de todo EE. UU., 100 % por internet · En español y en inglés · Base en Virginia.',
      site: 'Sitio',
      contact: 'Contacto',
      follow: 'Síguenos',
      rights: 'Todo lo que te armamos queda a tu nombre.',
      social: (name: string) => `${name} de FS Creative Studio`,
    },
    notice: { label: 'Aviso de idioma', text: 'View this site in English?', yes: 'Yes, English', no: 'Seguir en español' },
    modal: {
      label: 'Demo',
      close: 'Cerrar demo',
      loading: 'Abriendo la demo…',
      error: 'No se pudo abrir la demo. Revisa tu conexión y vuelve a intentarlo.',
      retry: 'Reintentar',
      sample: 'Datos de ejemplo. El tuyo tendría tus precios, tu logo y tus palabras.',
      want: 'Quiero esto para mi negocio',
    },
    waMessages: {
      default: 'Hola, vi la web de FS Creative Studio. Les cuento sobre mi negocio:',
      custom: 'Hola, quiero una herramienta a la medida de mi negocio. Necesito:',
      posts: 'Hola, quiero saber cuánto cuesta que publiquen por mí cada mes.',
      demo: (name: string) => `Hola, probé la demo de ${name} y quiero algo así para mi negocio.`,
    },
  },
  en: {
    skip: 'Skip to content',
    nav: { home: 'Home', services: 'Services & prices', work: 'Work', about: 'About', contact: 'Contact', privacy: 'Privacy' },
    navLabel: 'Main',
    mobileNavLabel: 'Mobile menu',
    logoLabel: 'FS Creative Studio, home',
    menu: 'Menu',
    menuClose: 'Close menu',
    langSwitch: { label: 'ES: Ver el sitio en español', short: 'ES', long: 'Ver en español' },
    cta: {
      whatsapp: 'Message us on WhatsApp',
      short: 'Message us',
      call: `Call ${BUSINESS.phoneDisplay}`,
      email: 'Send an email',
      seePrices: 'See prices',
      tryDemos: 'Try the demos',
      tryDemo: 'Try it yourself',
      oneDemo: 'Try it yourself',
      details: 'See details',
      askUs: 'Ask us',
      tellUs: 'Tell us what you need',
      want: 'I want it',
    },
    breadcrumbsLabel: 'Breadcrumb',
    stage: 'Stage',
    includes: "What's included",
    terms: 'Terms',
    toolsIncluded: 'Tools included',
    partOf: 'Part of',
    includedIn: 'Included in',
    priceOnRequest: 'Ask us',
    sampleData: 'Sample data',
    footer: {
      tagline: 'Automation for your business.',
      where: 'For businesses across the US, 100% online · In English and Spanish · Based in Virginia.',
      site: 'Site',
      contact: 'Contact',
      follow: 'Follow us',
      rights: 'Everything we build for you is in your name.',
      social: (name: string) => `FS Creative Studio on ${name}`,
    },
    notice: { label: 'Language notice', text: 'View this site in English?', yes: 'Yes, English', no: 'Seguir en español' },
    modal: {
      label: 'Demo',
      close: 'Close demo',
      loading: 'Opening the demo…',
      error: "Couldn't open the demo. Check your connection and try again.",
      retry: 'Try again',
      sample: 'Sample data. Yours would have your prices, your logo and your words.',
      want: 'I want this for my business',
    },
    waMessages: {
      default: "Hi, I saw the FS Creative Studio website. Here's a bit about my business:",
      custom: "Hi, I'd like a custom tool for my business. I need:",
      posts: "Hi, I'd like to know what monthly posting would cost.",
      demo: (name: string) => `Hi, I tried the ${name} demo and want something like it for my business.`,
    },
  },
} satisfies Localized<unknown>;

export type UI = (typeof ui)['es'];

export const useTranslations = (lang: Lang): UI => ui[lang];

/** Enlace de WhatsApp con mensaje pre-escrito (05 §11). */
export const waLink = (message: string): string =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

export const telLink = (): string => `tel:${BUSINESS.phoneE164}`;

/** Mensaje de texto (SMS): en EE. UU. mucha gente prefiere "text or call". */
export const smsLink = (): string => `sms:${BUSINESS.phoneE164}`;
