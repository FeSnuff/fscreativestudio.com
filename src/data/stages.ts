import type { Stage } from './types';

/** Etapas del negocio del cliente (textos de docs/05-textos.md §2.4 y §3). */
export const stages: Stage[] = [
  {
    id: 'encontrar',
    order: 1,
    number: 1,
    text: {
      es: { title: 'Para que te encuentren', summary: 'Antes de organizar tu negocio, la gente tiene que encontrarlo.' },
      en: { title: 'To get found', summary: 'Before you organize your business, people need to find it.' },
    },
  },
  {
    id: 'crecer',
    order: 2,
    number: 2,
    text: {
      es: { title: 'Para cotizar y cobrar', summary: 'Tu oficina en el celular: cotiza, haz firmar y cobra desde el celular, conectado a tu web.' },
      en: { title: 'To quote and get paid', summary: 'Your office on your phone: quote, get it signed and get paid, connected to your website.' },
    },
  },
  {
    id: 'empresa',
    order: 3,
    number: 3,
    flag: 'showEmpresa',
    text: {
      es: { title: 'Empresa', summary: 'Cuando tu negocio crece, las herramientas sueltas se quedan cortas.' },
      en: { title: 'Company', summary: 'As your business grows, separate tools start to fall short.' },
    },
  },
  {
    id: 'extras',
    order: 4,
    text: {
      es: { title: 'Para cualquier etapa', summary: 'Lo opcional, que sirve en cualquier proyecto.' },
      en: { title: 'For any stage', summary: 'Optional extras that work with any project.' },
    },
  },
];
