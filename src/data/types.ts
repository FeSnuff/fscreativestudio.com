import type { Localized } from '../i18n/langs';
import type { FlagName } from '../config/site';
import type { DemoId } from '../demos/registry';

export type StageId = 'encontrar' | 'crecer' | 'empresa' | 'extras';

export interface Stage {
  id: StageId;
  /** Orden de aparición. */
  order: number;
  /** Número visible ("Etapa 1"); sin número = bloque transversal (p. ej. extras). */
  number?: number;
  /** Si se indica, la etapa solo se muestra cuando FLAGS[flag] es true. */
  flag?: FlagName;
  text: Localized<{ title: string; summary: string }>;
}

/**
 * Precio en USD. Al menos uno de `setup` o `monthly`.
 * - setup: pago único (con `from: true` se muestra "Desde USD X").
 * - monthly: mensualidad. minMonths > 0 = obligatoria con permanencia mínima;
 *   minMonths 0 (o ausente) = opcional, mes a mes.
 * - limit: condición de volumen que se muestra con el mismo peso que el precio
 *   ("hasta 200 cotizaciones al mes").
 * Sin `price` en la entrada se muestra "Consúltanos" / "Ask us".
 */
export interface Price {
  setup?: number;
  from?: boolean;
  monthly?: number;
  minMonths?: number;
  limit?: Localized<string>;
  /** Condición de pago corta (p. ej. "USD 200 para empezar · USD 250 al terminar"). */
  note?: Localized<string>;
}

/** Captura con datos de ejemplo (nunca datos reales de clientes). */
export interface Capture {
  /** Ruta dentro de /public, p. ej. "/capturas/cotizador.webp". */
  src: string;
  width: number;
  height: number;
  alt: Localized<string>;
}

/** Tipos de herramienta: agrupan el catálogo. */
export type ToolCategory = 'oficina' | 'medida';

export interface ToolCategoryDef {
  id: ToolCategory;
  text: Localized<string>;
  /** Texto cuando una herramienta de esta categoría no tiene precio (por defecto "Consúltanos"). */
  noPriceLabel?: Localized<string>;
  intro?: Localized<string>;
}

export interface ServiceText {
  slug: string;
  name: string;
  summary: string;
  /** Qué incluye (lista corta). */
  includes: string[];
  /** Puntos de condiciones (pago, mínimo, qué no incluye) que se ven en la ficha. */
  terms?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Service {
  id: string;
  stage: StageId;
  /** false = no se publica (ni página, ni tarjeta, ni sitemap). */
  visible: boolean;
  /** Sin precio (undefined) se muestra "Consúltanos" / "Ask us". */
  price?: Price;
  demo?: DemoId;
  /** Herramientas que forman parte del servicio (ids de tools.ts). */
  tools?: string[];
  /** Ícono del sprite (u-* o b-*). */
  icon: string;
  /** Texto del botón y mensaje pre-escrito de WhatsApp (05 §10.1 y §11). */
  cta: Localized<string>;
  wa: Localized<string>;
  text: Localized<ServiceText>;
}

export interface ToolText {
  slug: string;
  name: string;
  summary: string;
  details?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Tool {
  id: string;
  stage: StageId;
  category: ToolCategory;
  visible: boolean;
  /** Página publicada pero sin indexar (y fuera del sitemap): herramientas sin demanda propia. */
  noindex?: boolean;
  /** Ícono del sprite (u-* o b-*). */
  icon: string;
  price?: Price;
  demo?: DemoId;
  capture?: Capture;
  text: Localized<ToolText>;
}

/** Tipo de ejemplo de la galería de Trabajo (filtros de 05 §4). */
export type GalleryKind = 'webs' | 'herramientas' | 'redes' | 'whatsapp';

/** Mini-interfaz HTML con datos de ejemplo que pinta cada tarjeta de la galería. */
export type MiniUi = 'web-one' | 'web-prices' | 'quote' | 'sign' | 'invoice' | 'schedule' | 'social' | 'before-after' | 'assistant' | 'review' | 'wa-send' | 'clients' | 'portal-edit';

export interface GalleryItem {
  id: string;
  kind: GalleryKind;
  mini: MiniUi;
  /** Herramienta o servicio relacionado (enlaza a su página). */
  tool?: string;
  service?: string;
  demo?: DemoId;
  text: Localized<{ title: string; line: string }>;
}
