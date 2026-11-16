/**
 * Datos estructurados (JSON-LD). Solo hechos reales (config/site.ts):
 * sin dirección postal (no hay una pública), sin reseñas, sin horarios.
 */
import { BUSINESS, SITE_URL } from '../config/site';
import type { Lang } from '../i18n/langs';
import { absoluteUrl } from '../i18n/routes';
import type { Price } from '../data/types';

export const BUSINESS_ID = `${SITE_URL}/#business`;

export type JsonLdNode = Record<string, unknown>;

/** Solo las redes con URL configurada. */
export const socialUrls = (): string[] => Object.values(BUSINESS.social).filter(Boolean);

export const businessNode = (): JsonLdNode => ({
  '@type': 'ProfessionalService',
  '@id': BUSINESS_ID,
  name: BUSINESS.name,
  url: `${SITE_URL}/`,
  logo: absoluteUrl('/icons/icon-512.png'),
  image: absoluteUrl('/og/og-es.png'),
  telephone: BUSINESS.phoneSchema,
  address: { '@type': 'PostalAddress', addressRegion: BUSINESS.region, addressCountry: BUSINESS.country },
  areaServed: [
    { '@type': 'State', name: BUSINESS.regionName },
    { '@type': 'Country', name: 'United States' },
  ],
  email: BUSINESS.email,
  knowsLanguage: ['es', 'en'],
  ...(socialUrls().length > 0 ? { sameAs: socialUrls() } : {}),
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: BUSINESS.phoneSchema,
    contactType: 'customer service',
    email: BUSINESS.email,
    availableLanguage: ['Spanish', 'English'],
  },
});

/** Una entidad WebSite por idioma (03-seo §7.1): `@id` y `url` del idioma. */
export const websiteNode = (lang: Lang): JsonLdNode => ({
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website-${lang}`,
  url: absoluteUrl(lang === 'es' ? '/' : '/en/'),
  name: BUSINESS.name,
  inLanguage: lang,
  publisher: { '@id': BUSINESS_ID },
});

export const serviceNode = (opts: { name: string; description: string; path: string; lang: Lang; price?: Price }): JsonLdNode => {
  const node: JsonLdNode = {
    '@type': 'Service',
    '@id': `${absoluteUrl(opts.path)}#service`,
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    inLanguage: opts.lang,
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'Country', name: 'United States' },
  };
  if (opts.price) {
    const specs: JsonLdNode[] = [];
    const { setup, from, monthly, minMonths } = opts.price;
    if (setup !== undefined) {
      specs.push({ '@type': 'PriceSpecification', priceCurrency: 'USD', ...(from ? { minPrice: setup } : { price: setup }) });
    }
    if (monthly !== undefined) {
      specs.push({
        '@type': 'UnitPriceSpecification',
        price: monthly,
        priceCurrency: 'USD',
        unitCode: 'MON',
        ...(minMonths ? { billingDuration: { '@type': 'QuantitativeValue', minValue: minMonths, unitCode: 'MON' } } : {}),
      });
    }
    node.offers = { '@type': 'Offer', priceCurrency: 'USD', priceSpecification: specs.length === 1 ? specs[0] : specs };
  }
  return node;
};

export interface Crumb {
  name: string;
  path: string;
}

export const breadcrumbNode = (crumbs: Crumb[]): JsonLdNode => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

export const graph = (nodes: JsonLdNode[]): string =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
