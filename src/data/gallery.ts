import type { GalleryItem } from './types';

/**
 * Galería de la página Trabajo (docs/05-textos.md §4), por tipo de web o herramienta.
 * REGLAS: cada tarjeta es una mini-interfaz HTML con DATOS DE EJEMPLO (lista única de la maqueta v3);
 * sin nombres de clientes reales, sin teléfonos reales, sin enlaces y sin rubros.
 */
export const gallery: GalleryItem[] = [
  { id: 'web-una', kind: 'webs', mini: 'web-one', service: 'web', text: { es: { title: 'Web de una página', line: 'Servicios, fotos y botones de llamada y WhatsApp, pensada para el celular.' }, en: { title: 'One-page website', line: 'Services, photos, call and WhatsApp buttons, built for phones.' } } },
  { id: 'web-precios', kind: 'webs', mini: 'web-prices', service: 'web', text: { es: { title: 'Web con precios "desde"', line: 'Cada servicio muestra un precio de partida y un botón con el mensaje ya escrito.' }, en: { title: 'Website with starting prices', line: 'Every service shows a starting price and a button with the message already written.' } } },
  { id: 'cotizador', kind: 'herramientas', mini: 'quote', tool: 'cotizador', demo: 'cotizacion', text: { es: { title: 'Cotizador con PDF', line: 'De la lista de precios al PDF con logo, en segundos.' }, en: { title: 'Quote builder with PDF', line: 'From price list to branded PDF in seconds.' } } },
  { id: 'firma', kind: 'herramientas', mini: 'sign', tool: 'contratos-firma', demo: 'cotizacion', text: { es: { title: 'Firma desde el celular', line: 'El cliente abre un enlace, lee y firma con el dedo.' }, en: { title: 'Phone signature', line: 'Your customer opens a link, reads, and signs with a finger.' } } },
  { id: 'facturas', kind: 'herramientas', mini: 'invoice', tool: 'facturas', text: { es: { title: 'Facturas', line: 'La factura sale de la cotización, sin volver a escribir nada.' }, en: { title: 'Invoices', line: 'The invoice comes from the quote, no retyping.' } } },
  { id: 'agenda', kind: 'herramientas', mini: 'schedule', tool: 'agenda', demo: 'tablero', text: { es: { title: 'Agenda y ficha de clientes', line: 'El día de trabajo y el historial de cada cliente.' }, en: { title: 'Schedule and customer files', line: 'Your workday and each customer’s history.' } } },
  { id: 'redes', kind: 'redes', mini: 'social', service: 'redes', text: { es: { title: 'Redes unificadas', line: 'Un número, un logo y una imagen nueva hecha con fotos reales.' }, en: { title: 'Unified social accounts', line: 'One number, one logo, and a fresh look built on real photos.' } } },
  { id: 'antes-despues', kind: 'redes', mini: 'before-after', tool: 'imagenes-redes', text: { es: { title: 'Publicaciones de antes y después', line: 'Fotos reales convertidas en publicaciones bilingües.' }, en: { title: 'Before-and-after posts', line: 'Real photos turned into bilingual posts.' } } },
  { id: 'asistente', kind: 'whatsapp', mini: 'assistant', service: 'asistente', demo: 'asistente', text: { es: { title: 'Asistente de WhatsApp', line: 'Respuestas en dos idiomas que pasan a una persona.' }, en: { title: 'WhatsApp assistant', line: 'Replies in two languages that hand off to a person.' } } },
];
