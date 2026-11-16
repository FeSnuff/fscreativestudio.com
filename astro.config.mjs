// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { SITE_URL } from './src/config/site.ts';
import { redirects } from './src/config/redirects.ts';
import { allPageAlternates, noindexPaths } from './src/i18n/alternates.ts';
import { X_DEFAULT_LANG } from './src/i18n/langs.ts';

/** URL absoluta → { es, en } (para hreflang en el sitemap con slugs traducidos). */
const alternatesByUrl = new Map();
for (const alt of allPageAlternates()) {
  const abs = { es: new URL(alt.es, SITE_URL).href, en: new URL(alt.en, SITE_URL).href };
  alternatesByUrl.set(abs.es, abs);
  alternatesByUrl.set(abs.en, abs);
}

/** URLs absolutas que no van al sitemap (páginas noindex). */
const noindex = new Set(noindexPaths().map((p) => new URL(p, SITE_URL).href));

/** Versión de las demos (hash de public/demos/*.js): va en la URL del import para no mezclar cachés tras un despliegue. */
const demosDir = new URL('./public/demos/', import.meta.url);
const demosHash = createHash('sha256');
for (const f of readdirSync(demosDir).filter((n) => n.endsWith('.js')).sort()) demosHash.update(readFileSync(new URL(f, demosDir)));
const DEMOS_V = demosHash.digest('hex').slice(0, 10);

export default defineConfig({
  vite: { define: { __DEMOS_V__: JSON.stringify(DEMOS_V) } },
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects,
  integrations: [
    sitemap({
      filter: (page) => !noindex.has(page),
      serialize(item) {
        const alt = alternatesByUrl.get(item.url);
        if (alt) {
          item.links = [
            { lang: 'es', url: alt.es },
            { lang: 'en', url: alt.en },
            { lang: 'x-default', url: alt[X_DEFAULT_LANG] },
          ];
        }
        return item;
      },
    }),
  ],
});
