/**
 * Configuración global del sitio: URL, datos reales del negocio y flags.
 * Todo lo que aparece en el JSON-LD sale de aquí (una sola fuente).
 */

export const SITE_URL = 'https://fscreativestudio.com';

/**
 * Flags de visibilidad.
 * - showEmpresa: activa la etapa 3 "Empresa" (sus servicios y herramientas,
 *   sus páginas, su entrada en el sitemap y en el menú de etapas).
 *   Hoy está construida pero oculta.
 */
export const FLAGS = {
  showEmpresa: false,
} as const;

export type FlagName = keyof typeof FLAGS;

/**
 * Formulario de contacto: lo recibe el Worker propio (carpeta `formulario/`) y lo reenvía a info@.
 * turnstileSiteKey es pública (va en el HTML); el secreto vive solo en el Worker.
 */
export const FORM = {
  endpoint: 'https://contacto.fscreativelab.com/enviar',
  turnstileSiteKey: '0x4AAAAAAGDbCHtSMeDjhtFH',
} as const;

/** Datos reales del negocio (brief). No agregar dirección: no hay una pública. */
export const BUSINESS = {
  name: 'FS Creative Studio',
  phoneE164: '+15713156093',
  phoneDisplay: '+1 (571) 315-6093',
  phoneSchema: '+1-571-315-6093',
  /** Número para https://wa.me/<número> (sin + ni espacios). */
  whatsapp: '15713156093',
  region: 'VA',
  regionName: 'Virginia',
  country: 'US',
  email: 'info@fscreativestudio.com',
  /**
   * Redes del estudio. Si una URL queda vacía, no se muestra en la web
   * ni entra en el `sameAs` del JSON-LD.
   */
  social: {
    facebook: 'https://www.facebook.com/FSstudio',
    instagram: 'https://www.instagram.com/fs.creativestudio/',
  } as Record<'facebook' | 'instagram', string>,
} as const;

const SOCIAL_NAMES = { facebook: 'Facebook', instagram: 'Instagram' } as const;

/** Redes con URL configurada: [nombre visible, url]. Vacío = no se muestra nada. */
export const activeSocials = (): [string, string][] =>
  (Object.keys(SOCIAL_NAMES) as (keyof typeof SOCIAL_NAMES)[])
    .filter((k) => BUSINESS.social[k])
    .map((k) => [SOCIAL_NAMES[k], BUSINESS.social[k]]);

/** Clave de localStorage donde se recuerda la elección de idioma. */
export const LANG_STORAGE_KEY = 'fs_lang';
