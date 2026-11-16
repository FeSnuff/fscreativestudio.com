export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** Idioma principal: vive en la raíz `/`. El otro idioma vive en `/en/`. */
export const DEFAULT_LANG: Lang = 'es';

/** Versión a la que apunta hreflang="x-default" (la principal). */
export const X_DEFAULT_LANG: Lang = 'es';

/** Texto localizado: un valor por idioma. */
export type Localized<T> = Record<Lang, T>;

export const LANG_META: Localized<{ htmlLang: string; ogLocale: string; label: string; short: string }> = {
  es: { htmlLang: 'es', ogLocale: 'es_US', label: 'Español', short: 'ES' },
  en: { htmlLang: 'en', ogLocale: 'en_US', label: 'English', short: 'EN' },
};

export const otherLang = (lang: Lang): Lang => (lang === 'es' ? 'en' : 'es');
