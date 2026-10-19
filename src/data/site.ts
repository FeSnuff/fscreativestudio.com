// Datos generales del sitio. Edita aquí y se actualiza en todas las páginas.
export const site = {
  brand: 'FS Creative Studio',
  // TODO: escribe tu nombre tal como debe aparecer (contacto y pie de página). Vacío = no se muestra.
  ownerName: '',
  phoneDisplay: '+1 (571) 315-6093',
  phoneHref: 'tel:+15713156093',
  whatsapp: '15713156093',
  location: { en: 'Virginia, United States', es: 'Virginia, Estados Unidos' },
  // Opcional: clave gratuita de https://web3forms.com para recibir el formulario por correo.
  // Vacío = el formulario abre WhatsApp con el mensaje ya escrito.
  web3formsKey: '',
  year: new Date().getFullYear(),
};

export type Lang = 'en' | 'es';
export const otherLang = (l: Lang): Lang => (l === 'en' ? 'es' : 'en');

/** Builds a localized path. path must start with '/'. */
export const lp = (lang: Lang, path: string) => (lang === 'es' ? `/es${path === '/' ? '/' : path}` : path);
