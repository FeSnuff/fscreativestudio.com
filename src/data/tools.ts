import type { Tool, ToolCategoryDef } from './types';

/** Dos grupos (07-correcciones §8): incluidas en la oficina en línea vs. a tu medida (se cotizan aparte). */
export const toolCategories: ToolCategoryDef[] = [
  {
    id: 'oficina',
    text: { es: 'Incluidas en tu oficina en el celular', en: 'Included in your office on your phone' },
    intro: {
      es: 'Hasta 200 cotizaciones al mes. Contratos, facturas y clientes, sin límite.',
      en: 'Up to 200 quotes a month. Contracts, invoices and customers, unlimited.',
    },
  },
  {
    id: 'medida',
    text: { es: 'Herramientas a tu medida', en: 'Custom tools' },
    noPriceLabel: { es: 'A cotizar', en: 'Custom quote' },
    intro: {
      es: 'Si tu negocio lo necesita, se construye. Además del paquete, puedes pedir herramientas hechas para tu forma de trabajar, con costo adicional. Te damos el precio por escrito antes de empezar.',
      en: 'If your business needs it, we can build it. On top of the package, you can ask for tools built around how you work, at an additional cost. You get the price in writing before we start.',
    },
  },
];

/**
 * Herramientas (existen en proyectos reales del dueño; brief "CONCEPTO APROBADO").
 * Agregar una herramienta = agregar una entrada. Su página se genera sola.
 * Títulos/metas: docs/03-seo.md §4.3 (el sufijo " | FS Creative Studio" se agrega por código).
 */
export const tools: Tool[] = [
  {
    id: 'cotizador',
    stage: 'crecer',
    category: 'oficina',
    visible: true,
    icon: 'u-cotizacion',
    demo: 'cotizacion',
    text: {
      es: {
        slug: 'cotizador',
        name: 'Cotizador con PDF al instante',
        summary: 'Eliges de tu lista de precios y sale el PDF al instante, con tu logo.',
        details: [
          'Tu lista de precios queda guardada: tocas los servicios y el total se arma solo.',
          'El PDF sale con tu logo, tus datos y tus condiciones, listo para mandar por WhatsApp.',
          'El anticipo se calcula solo (por ejemplo, 30 %).',
          'Cada cotización queda en la ficha del cliente.',
        ],
        seoTitle: 'Cotizador con PDF al instante',
        seoDescription: 'Elige partidas de tu lista de precios y sale la cotización en PDF con tu logo, lista para enviar. Parte de tu oficina en el celular.',
      },
      en: {
        slug: 'quote-builder',
        name: 'Quote builder with instant PDF',
        summary: 'Pick from your price list and get a PDF on the spot, with your logo.',
        details: [
          'Your price list is saved: tap the services and the total adds itself up.',
          'The PDF comes out with your logo, your details and your terms, ready to send on WhatsApp.',
          'The deposit is calculated for you (for example, 30%).',
          'Every quote is saved in the customer file.',
        ],
        seoTitle: 'Quote Builder with Instant PDF',
        seoDescription: 'Pick items from your price list and get a PDF quote with your logo, ready to send. Part of your office on your phone.',
      },
    },
  },
  {
    id: 'contratos-firma',
    stage: 'crecer',
    category: 'oficina',
    visible: true,
    icon: 'u-firma',
    demo: 'cotizacion',
    text: {
      es: {
        slug: 'contratos-con-firma',
        name: 'Contratos con firma desde el celular',
        summary: 'Tu cliente abre un enlace, lee y firma con el dedo. Queda registrada la hora.',
        details: [
          'El contrato sale de la cotización aceptada: no vuelves a escribir nada.',
          'Tu cliente marca "Leí y acepto" y firma con el dedo o el mouse.',
          'Sin firma no se puede aceptar: el contrato nunca queda en blanco.',
          'El PDF firmado queda guardado en la ficha del cliente.',
        ],
        seoTitle: 'Contratos con firma desde el celular',
        seoDescription: 'Tu cliente abre un enlace, lee y firma con el dedo. Queda registrada la hora y el contrato sale de la cotización aceptada.',
      },
      en: {
        slug: 'e-signature-contracts',
        name: 'Contracts signed on a phone',
        summary: 'Your customer opens a link, reads and signs with a finger. The time gets recorded.',
        details: [
          'The contract comes from the accepted quote: no retyping.',
          'Your customer checks "I’ve read and accept" and signs with a finger or a mouse.',
          'It can’t be accepted without a signature: the contract is never left blank.',
          'The signed PDF is saved in the customer file.',
        ],
        seoTitle: 'E-Signature Contracts from Your Phone',
        seoDescription: 'Your customer opens a link, reads and signs with a finger. The time is recorded, and the contract comes from the accepted quote.',
      },
    },
  },
  {
    id: 'facturas',
    stage: 'crecer',
    category: 'oficina',
    visible: true,
    icon: 'u-factura',
    text: {
      es: {
        slug: 'facturas-con-recordatorio',
        name: 'Facturas con recordatorio de cobro',
        summary: 'La factura sale de la cotización aceptada y el recordatorio de cobro queda listo para enviar.',
        details: [
          'La factura se arma sola con lo que ya cotizaste.',
          'Estados claros: borrador, enviada, vence pronto, vencida, pagada.',
          'El recordatorio queda escrito y listo para enviar: tú solo tocas "enviar".',
          'Cuando te pagan, marcas "pagado" y queda en la ficha del cliente.',
        ],
        seoTitle: 'Facturas con recordatorio de cobro',
        seoDescription: 'La factura sale del trabajo hecho y el recordatorio de pago queda listo para enviar. Se acabó el "¿ya me pagaste?".',
      },
      en: {
        slug: 'invoices-with-reminders',
        name: 'Invoices with payment reminders',
        summary: 'The invoice comes from the accepted quote and the payment reminder is ready to send.',
        details: [
          'The invoice builds itself from what you already quoted.',
          'Clear statuses: draft, sent, due soon, overdue, paid.',
          'The reminder is written and ready to send: you just tap "send".',
          'When the money lands, tap "paid" and it’s saved in the customer file.',
        ],
        seoTitle: 'Invoices with Payment Reminders',
        seoDescription: 'The invoice comes from the finished job and the payment reminder is ready to send. No more "did you pay yet?"',
      },
    },
  },
  {
    id: 'envio-whatsapp',
    stage: 'crecer',
    category: 'oficina',
    visible: true,
    icon: 'b-whatsapp',
    text: {
      es: {
        slug: 'envio-por-whatsapp',
        name: 'Envío por WhatsApp',
        summary: 'Cotizaciones y facturas con el mensaje de WhatsApp ya escrito: tú solo tocas "enviar".',
        details: [
          'Se abre WhatsApp con el mensaje y el enlace listos, desde tu propio número.',
          'Sirve para cotizaciones, contratos por firmar, facturas y recordatorios.',
          'No hace envíos automáticos: siempre decides tú cuándo se manda.',
        ],
        seoTitle: 'Envío de cotizaciones por WhatsApp',
        seoDescription: 'Cotizaciones y facturas con el mensaje de WhatsApp ya escrito: tú solo tocas "enviar". Ahorra tiempo con cada cliente.',
      },
      en: {
        slug: 'send-by-whatsapp',
        name: 'Send by WhatsApp',
        summary: 'Quotes and invoices with the WhatsApp message already written: you just tap "send".',
        details: [
          'WhatsApp opens with the message and the link ready, from your own number.',
          'Works for quotes, contracts to sign, invoices and reminders.',
          'No automatic sending: you always decide when it goes out.',
        ],
        seoTitle: 'Send Quotes and Invoices by WhatsApp',
        seoDescription: 'Quotes and invoices with the WhatsApp message already written: you just tap send. Saves time with every customer.',
      },
    },
  },
  {
    id: 'clientes',
    stage: 'crecer',
    category: 'oficina',
    visible: true,
    icon: 'u-clientes',
    demo: 'tablero',
    text: {
      es: {
        slug: 'ficha-de-clientes',
        name: 'Ficha de clientes',
        summary: 'Cada cliente con su historial de trabajos, cotizaciones y pagos, en un solo lugar.',
        details: [
          'Quién es, cómo prefiere que le escriban y qué le has hecho.',
          'Sus cotizaciones, contratos firmados y facturas, juntos.',
          'Lo que te ha pagado y lo que está pendiente.',
        ],
        seoTitle: 'Ficha de clientes: historial y pagos',
        seoDescription: 'Cada cliente con su historial de trabajos, cotizaciones y pagos en un solo lugar, en vez de libretas y chats. Parte de tu oficina en el celular.',
      },
      en: {
        slug: 'customer-records',
        name: 'Customer files',
        summary: 'Each customer with their history of jobs, quotes and payments, in one place.',
        details: [
          'Who they are, how they like to be contacted and what you’ve done for them.',
          'Their quotes, signed contracts and invoices, together.',
          'What they’ve paid and what’s still pending.',
        ],
        seoTitle: 'Customer Records: History and Payments',
        seoDescription: 'Each customer with their history of jobs, quotes and payments in one place, instead of notebooks and chats. Part of your office on your phone.',
      },
    },
  },
  {
    id: 'agenda',
    stage: 'crecer',
    category: 'oficina',
    visible: true,
    icon: 'u-agenda',
    demo: 'tablero',
    text: {
      es: {
        slug: 'agenda-del-dia',
        name: 'Agenda de trabajos',
        summary: 'Todos tus trabajos en una agenda: qué toca hoy, a qué hora, dónde y en qué estado va cada uno.',
        details: [
          'Por cotizar, firmado, agendado, en curso, terminado y cobrado: de un vistazo.',
          'Arrastras un trabajo de una columna a otra, con el dedo o el mouse.',
          'Fotos de avance en cada trabajo, para no perderlas en la galería del celular.',
        ],
        seoTitle: 'Agenda de trabajos del día',
        seoDescription: 'Todos tus trabajos en una agenda: qué toca hoy, dónde y en qué estado va cada uno. Parte de tu oficina en el celular.',
      },
      en: {
        slug: 'daily-schedule',
        name: 'Job schedule',
        summary: 'Every job in one schedule: what’s on today, when, where, and how each one is going.',
        details: [
          'To quote, signed, scheduled, in progress, done and paid: at a glance.',
          'Drag a job from one column to another, with your finger or a mouse.',
          'Progress photos on each job, so they don’t get lost in your camera roll.',
        ],
        seoTitle: 'Daily Job Schedule for Your Phone',
        seoDescription: 'Every job in one schedule: what is on today, where, and how each one is going. Part of your office on your phone.',
      },
    },
  },
  // ---- Herramientas a tu medida (sin precio: "A cotizar") ----
  {
    id: 'calculadora-web',
    stage: 'crecer',
    category: 'medida',
    visible: true,
    icon: 'u-calculadora',
    text: {
      es: {
        slug: 'calculadora-de-precio',
        name: 'Calculadora de precio en tu web',
        summary: 'El visitante calcula un precio aproximado y te llega el pedido con sus datos.',
        details: [
          'Se arma con tu lista de precios y tus reglas.',
          'El visitante ve un precio aproximado, no un compromiso: el precio final lo confirmas tú.',
          'El pedido te llega con sus datos para que le escribas.',
        ],
        seoTitle: 'Calculadora de precio para tu web',
        seoDescription: 'Quien visita tu web calcula un precio aproximado y te llega el pedido con sus datos. Se arma según tu lista de precios. Consúltanos.',
      },
      en: {
        slug: 'price-calculator',
        name: 'Price calculator on your website',
        summary: 'Visitors get a ballpark price, and you get the request with their details.',
        details: [
          'Built around your price list and your rules.',
          'Visitors see a ballpark price, not a promise: you confirm the final price.',
          'The request reaches you with their details so you can follow up.',
        ],
        seoTitle: 'Price Calculator for Your Website',
        seoDescription: 'Visitors get a ballpark price on your website and you receive the request with their details. Built around your price list. Ask us.',
      },
    },
  },
  {
    id: 'imagenes-redes',
    stage: 'crecer',
    category: 'medida',
    visible: true,
    icon: 'u-imagen',
    text: {
      es: {
        slug: 'imagenes-para-redes',
        name: 'Imágenes para redes',
        summary: 'Tus fotos de antes y después convertidas en publicaciones con tu marca.',
        details: [
          'Con tus fotos reales, nunca de catálogo.',
          'Con tu logo y tus colores, en español y en inglés.',
          'Listas para Facebook, Instagram y tus estados de WhatsApp.',
        ],
        seoTitle: 'Imágenes de antes y después para redes',
        seoDescription: 'Publicaciones de antes y después hechas con tus fotos reales, con tu marca y en español e inglés. Se ven profesionales sin diseñador.',
      },
      en: {
        slug: 'social-media-images',
        name: 'Social media images',
        summary: 'Your before-and-after photos turned into branded posts.',
        details: [
          'Made from your real photos, never stock pictures.',
          'With your logo and colors, in English and Spanish.',
          'Ready for Facebook, Instagram and your WhatsApp status.',
        ],
        seoTitle: 'Before-and-After Posts for Social Media',
        seoDescription: 'Before-and-after posts made from your real photos, with your brand and in English and Spanish. Look professional without a designer.',
      },
    },
  },
  {
    id: 'resenas-google',
    stage: 'crecer',
    category: 'medida',
    visible: true,
    icon: 'u-resena',
    text: {
      es: {
        slug: 'pedir-resenas',
        name: 'Pedir reseñas',
        summary: 'El mensaje para pedir la reseña en Google sale al cerrar cada trabajo.',
        details: [
          'Llega justo cuando tu cliente está contento: al terminar el trabajo.',
          'Con el enlace directo a tu perfil, para que dejar la reseña sea fácil.',
          'En español o en inglés, según tu cliente.',
        ],
        seoTitle: 'Cómo pedir reseñas en Google',
        seoDescription: 'Un mensaje listo para pedir la reseña en Google justo cuando tu cliente está contento. Más fácil para él, sin incomodidad para ti.',
      },
      en: {
        slug: 'google-review-requests',
        name: 'Ask for reviews',
        summary: 'The Google review request is ready every time you close a job.',
        details: [
          'It goes out right when your customer is happy: when the job is done.',
          'With the direct link to your profile, so leaving a review is easy.',
          'In English or Spanish, depending on your customer.',
        ],
        seoTitle: 'Ask for Google Reviews the Easy Way',
        seoDescription: 'A ready-made message to ask for a Google review right when your customer is happy. Easier for them, no awkwardness for you.',
      },
    },
  },
  {
    id: 'subir-fotos',
    stage: 'crecer',
    category: 'medida',
    visible: true,
    noindex: true,
    icon: 'u-imagen',
    text: {
      es: {
        slug: 'subir-fotos-desde-el-portal',
        name: 'Subir fotos desde tu oficina',
        summary: 'Las fotos de cada trabajo, guardadas en su lugar y no en la galería del celular.',
        seoTitle: 'Subir fotos de tus trabajos a tu oficina',
        seoDescription: 'Sube fotos desde el celular y quedan ordenadas por trabajo en tu oficina. Herramienta a la medida: consúltanos.',
      },
      en: {
        slug: 'upload-photos-from-the-portal',
        name: 'Upload photos from your office',
        summary: 'Photos from each job, filed where they belong, not lost in your camera roll.',
        seoTitle: 'Upload Job Photos to Your Office',
        seoDescription: 'Upload photos from your phone and keep them organized by job. Custom tool: ask us.',
      },
    },
  },
  {
    id: 'editar-web',
    stage: 'crecer',
    category: 'medida',
    visible: true,
    noindex: true,
    icon: 'u-globo',
    text: {
      es: {
        slug: 'editar-tu-web-desde-el-portal',
        name: 'Editar tu web desde tu oficina',
        summary: 'Cambias tus precios, tus servicios o tu galería tú mismo, sin esperar a nadie.',
        seoTitle: 'Edita tu web desde tu oficina',
        seoDescription: 'Cambia tus precios, servicios y galería sin esperar a nadie. Herramienta a la medida: consúltanos.',
      },
      en: {
        slug: 'edit-your-website-from-the-portal',
        name: 'Edit your website from your office',
        summary: 'Update your prices, services or gallery yourself, without waiting on anyone.',
        seoTitle: 'Edit Your Website from Your Office',
        seoDescription: 'Update your prices, services and gallery yourself. Custom tool: ask us.',
      },
    },
  },
  {
    id: 'otras-a-medida',
    stage: 'crecer',
    category: 'medida',
    visible: true,
    icon: 'u-llave',
    text: {
      es: {
        slug: 'otras-herramientas-a-medida',
        name: 'Otras herramientas a medida',
        summary: '¿Otra cosa, según cómo trabajas? Cuéntanos y lo armamos.',
        details: [
          'Primero entendemos cómo trabajas. Después construimos.',
          'Si una app que ya existe te conviene más, te lo decimos.',
          'Precio por escrito antes de empezar.',
        ],
        seoTitle: 'Herramientas a medida para tu negocio',
        seoDescription: '¿Necesitas algo que no está en la lista? Cuéntanos cómo trabajas y lo armamos. Precio por escrito antes de empezar.',
      },
      en: {
        slug: 'other-custom-tools',
        name: 'Other custom tools',
        summary: 'Something else, based on how you work? Tell us and we’ll build it.',
        details: [
          'First we understand how you work. Then we build.',
          'If an existing app suits you better, we’ll say so.',
          'Price in writing before we start.',
        ],
        seoTitle: 'Custom Tools for Your Business',
        seoDescription: 'Need something that is not on the list? Tell us how you work and we will build it. Price in writing before we start.',
      },
    },
  },
];
