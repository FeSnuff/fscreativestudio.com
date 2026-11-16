/**
 * Acceso a los datos con las reglas de visibilidad aplicadas.
 * Las páginas, el sitemap y el JSON-LD usan SOLO estas funciones,
 * así un flag apagado oculta todo de una vez.
 */
import { FLAGS } from '../config/site';
import type { Lang, Localized } from '../i18n/langs';
import { collectionBase } from '../i18n/routes';
import { stages } from './stages';
import { services } from './services';
import { tools, toolCategories } from './tools';
import { gallery } from './gallery';
import type { Price, Service, Stage, StageId, Tool, ToolCategory } from './types';

export { toolCategories };

const stageById = new Map(stages.map((s) => [s.id, s]));

export const isStageVisible = (id: StageId): boolean => {
  const stage = stageById.get(id);
  return !!stage && (!stage.flag || FLAGS[stage.flag]);
};

export const getStages = (): Stage[] =>
  stages.filter((s) => isStageVisible(s.id)).sort((a, b) => a.order - b.order);

export const getServices = (stage?: StageId): Service[] =>
  services.filter((s) => s.visible && isStageVisible(s.stage) && (!stage || s.stage === stage));

export const getService = (id: string): Service | undefined => getServices().find((s) => s.id === id);

export const getTools = (filter: { stage?: StageId; category?: ToolCategory } = {}): Tool[] =>
  tools.filter(
    (t) =>
      t.visible &&
      isStageVisible(t.stage) &&
      (!filter.stage || t.stage === filter.stage) &&
      (!filter.category || t.category === filter.category),
  );

export const categoryOf = (tool: Tool) => toolCategories.find((c) => c.id === tool.category);

export const getTool = (id: string): Tool | undefined => getTools().find((t) => t.id === id);

/** Herramientas visibles de un servicio. */
export const toolsOfService = (service: Service): Tool[] =>
  (service.tools ?? []).map(getTool).filter((t): t is Tool => !!t);

/** Servicios visibles que incluyen una herramienta. */
export const servicesWithTool = (tool: Tool): Service[] =>
  getServices().filter((s) => s.tools?.includes(tool.id));

/**
 * Texto a mostrar cuando la herramienta no tiene precio propio:
 * "Incluida en <servicio con precio>" si forma parte de un paquete;
 * si no, la etiqueta de su categoría ("A cotizar") o, por defecto, "Consúltanos".
 */
export const toolNoPriceLabel = (tool: Tool, lang: Lang, includedIn: string): string | undefined => {
  const pkg = servicesWithTool(tool).find((s) => s.price);
  if (pkg) return `${includedIn} ${pkg.text[lang].name.toLowerCase()}`;
  return categoryOf(tool)?.noPriceLabel?.[lang];
};

export const getGallery = () => {
  const visibleTools = new Set(getTools().map((t) => t.id));
  const visibleServices = new Set(getServices().map((s) => s.id));
  return gallery.filter((g) => (!g.tool || visibleTools.has(g.tool)) && (!g.service || visibleServices.has(g.service)));
};

// ---- Rutas generadas desde datos ----
export const servicePath = (s: Service, lang: Lang): string => `${collectionBase.service[lang]}${s.text[lang].slug}/`;
export const toolPath = (t: Tool, lang: Lang): string => `${collectionBase.tool[lang]}${t.text[lang].slug}/`;
export const serviceAlternates = (s: Service): Localized<string> => ({ es: servicePath(s, 'es'), en: servicePath(s, 'en') });
export const toolAlternates = (t: Tool): Localized<string> => ({ es: toolPath(t, 'es'), en: toolPath(t, 'en') });

// ---- Precios (siempre con la moneda escrita: "USD 250" en ES, "$250" en EN) ----
const PRICE_WORDS: Localized<{ from: string; month: string; min: (n: number) => string; flexible: string; optional: string }> = {
  es: { from: 'Desde', month: '/mes', min: (n) => `mínimo ${n} meses`, flexible: 'mes a mes', optional: 'opcional y mes a mes' },
  en: { from: 'From', month: '/mo', min: (n) => `${n}-month minimum`, flexible: 'month to month', optional: 'optional, month to month' },
};

export const money = (n: number, lang: Lang): string =>
  lang === 'es' ? `USD ${n.toLocaleString('es-US')}` : `$${n.toLocaleString('en-US')}`;

/** Partes visibles del precio: pago único, mensualidad, condición y límite. */
export const priceParts = (price: Price, lang: Lang): { setup?: string; monthly?: string; term?: string; limit?: string } => {
  const w = PRICE_WORDS[lang];
  return {
    setup: price.setup !== undefined ? `${price.from ? `${w.from} ` : ''}${money(price.setup, lang)}` : undefined,
    monthly: price.monthly !== undefined ? `${money(price.monthly, lang)}${w.month}` : undefined,
    term: price.monthly !== undefined ? (price.minMonths ? w.min(price.minMonths) : price.setup === undefined ? w.optional : w.flexible) : undefined,
    limit: price.limit?.[lang],
  };
};

/** Precio en una línea: "USD 250 + USD 25/mes · mínimo 12 meses · hasta 200 cotizaciones al mes". */
export const priceLine = (price: Price, lang: Lang): string => {
  const p = priceParts(price, lang);
  const amount = [p.setup, p.monthly].filter(Boolean).join(' + ');
  return [amount, p.term, p.limit].filter(Boolean).join(' · ');
};
