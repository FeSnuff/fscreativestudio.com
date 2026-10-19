import type { Lang } from './site';

export type Solution = {
  slug: string;
  mock: 'board' | 'thread' | 'flow' | 'platform' | 'status';
  title: string;
  short: string;
  lead: string;
  problems: string[];
  builds: { t: string; d: string }[];
  examples: string[];
  outcome: string;
};

const en: Solution[] = [
  {
    slug: 'management-systems',
    mock: 'board',
    title: 'Custom management systems',
    short: 'One system for clients, orders, schedules and inventory, shaped around the way your company already works.',
    lead: 'Most companies run on a patchwork of spreadsheets, inboxes and memory. We replace it with a single system your team actually wants to use, built around your process instead of forcing you into someone else’s.',
    problems: [
      'Client information lives in spreadsheets, email threads and people’s heads.',
      'The same data gets typed two or three times, in different places.',
      'Nobody can say, at a glance, where an order or project stands.',
      'Off-the-shelf software covers 70% of what you need and fights you on the rest.',
    ],
    builds: [
      { t: 'Client and account management', d: 'Every client with their full history: contacts, quotes, jobs, documents, payments and conversations in one record.' },
      { t: 'Orders, jobs and projects', d: 'Your real stages, your real statuses. Assign owners, set due dates and see the whole pipeline at once.' },
      { t: 'Scheduling and resources', d: 'Appointments, crews, rooms or equipment booked without double-booking and with automatic reminders.' },
      { t: 'Inventory and purchasing', d: 'Stock levels, suppliers and purchase orders tied to the jobs that consume them.' },
      { t: 'Roles and permissions', d: 'Each person sees what they need. Managers see everything. Every change is logged.' },
      { t: 'Reports that answer questions', d: 'Revenue, workload, overdue items and margins, updated as work happens.' },
    ],
    examples: ['Client portal for an insurance broker', 'Repair and maintenance tracking for industrial equipment', 'Job management for a contractor with field crews'],
    outcome: 'One source of truth. Less retyping, fewer dropped balls, and decisions made on current numbers.',
  },
  {
    slug: 'team-collaboration',
    mock: 'thread',
    title: 'Internal collaboration',
    short: 'Conversations, tasks and approvals attached to the client, order or project they belong to.',
    lead: 'Another chat app is not the answer. What teams need is for the conversation to live next to the work, so anyone can open a client or a job and see what was said, decided and pending.',
    problems: [
      'Decisions get lost in group chats that mix ten topics.',
      'New team members can’t find the history of a client.',
      'Approvals happen by message and nobody can prove who approved what.',
      'Work depends on one person remembering to follow up.',
    ],
    builds: [
      { t: 'Threads on every record', d: 'Discuss a client, order or project right where its data lives, with files and mentions.' },
      { t: 'Tasks and hand-offs', d: 'Turn any message into a task with an owner and a date. Hand-offs between departments are tracked.' },
      { t: 'Approvals with a trail', d: 'Discounts, purchases, time off and documents approved in one click, with a permanent record.' },
      { t: 'Employee portal', d: 'Policies, forms, requests and announcements in one internal place.' },
      { t: 'Notifications that matter', d: 'People are alerted about their work only, by email, mobile or desktop.' },
    ],
    examples: ['Department hand-offs for a payroll operation', 'Approval flow for purchase requests', 'Internal portal for a multi-location team'],
    outcome: 'Context stays with the work, approvals are traceable, and follow-ups stop depending on memory.',
  },
  {
    slug: 'process-automation',
    mock: 'flow',
    title: 'Process automation and integration',
    short: 'From quote to contract to signature to invoice without retyping, and the tools you already use, finally connected.',
    lead: 'The hours disappear in the steps between systems: copying a quote into a contract, chasing a signature, re-entering an invoice, reminding a client. We automate those steps and connect the tools you already pay for.',
    problems: [
      'Quotes and contracts are built by hand from old documents.',
      'Signed paperwork sits in someone’s inbox for days.',
      'Invoices go out late and payments are chased manually.',
      'Your accounting, email, calendar and spreadsheets don’t talk to each other.',
    ],
    builds: [
      { t: 'Quote to cash', d: 'Generate the quote from your price list, turn it into a contract, collect the e-signature and issue the invoice automatically.' },
      { t: 'Document generation', d: 'Proposals, contracts, work orders and reports filled in from your data, in your format.' },
      { t: 'Follow-ups and reminders', d: 'Automatic messages for pending signatures, upcoming appointments and overdue payments.' },
      { t: 'Integrations', d: 'Connect accounting, email, calendars, forms and spreadsheets so data moves on its own.' },
      { t: 'Scheduled reports', d: 'The numbers you check every Monday, delivered to your inbox before you ask.' },
      { t: 'Automatic replies', d: 'Common customer questions answered instantly inside your system, with a person taking over when needed.' },
    ],
    examples: ['Payroll and electronic invoicing automation', 'Contract and signature workflow for a services firm', 'Insurance request intake and evaluation'],
    outcome: 'Faster quotes, faster signatures, faster payment, and your team back on work that needs a person.',
  },
  {
    slug: 'digital-platform',
    mock: 'platform',
    title: 'Digital platform',
    short: 'Your public website, connected to your system: requests, bookings and client portals that feed your operation directly.',
    lead: 'A website that only shows information is a brochure. A digital platform captures requests, bookings and payments and sends them straight into your system, so nothing is retyped and nothing is missed. If you don’t have one yet, we build it.',
    problems: [
      'Website forms land in an inbox and get copied by hand.',
      'Clients call to ask for the status of something your system already knows.',
      'Your site doesn’t reflect the size and seriousness of the company.',
      'English and Spanish speaking clients get different levels of service.',
    ],
    builds: [
      { t: 'Corporate website', d: 'Fast, bilingual and built to rank, with your services explained clearly.' },
      { t: 'Requests that create records', d: 'Quote requests and inquiries become clients and jobs in your system automatically.' },
      { t: 'Online booking', d: 'Clients pick a time that is actually available, and reminders go out on their own.' },
      { t: 'Client portal', d: 'Clients log in to see status, download documents, sign and pay.' },
    ],
    examples: ['Bilingual product platform with technical datasheets', 'Multi-service contractor platform with lead intake', 'Service company platform with project galleries'],
    outcome: 'A professional front door that works for your operation, not just for your image.',
  },
  {
    slug: 'support-continuity',
    mock: 'status',
    title: 'Support and continuity',
    short: 'Monitoring, backups, security updates, a help desk for your team and steady monthly improvements.',
    lead: 'Software is never finished. Your process changes, your team grows and new needs appear. A monthly plan keeps your systems secure, backed up and improving, with a direct line to the people who built them.',
    problems: [
      'The person who built your system is no longer reachable.',
      'Nobody knows if backups actually work.',
      'Small improvements wait months because each one needs a new project.',
      'Computers and accounts are set up differently for every employee.',
    ],
    builds: [
      { t: 'Monitoring and backups', d: 'Uptime checks, daily backups and tested restores.' },
      { t: 'Security updates', d: 'Dependencies, access and accounts reviewed and kept current.' },
      { t: 'Help desk', d: 'Remote support for your team’s systems, computers and software.' },
      { t: 'Monthly improvements', d: 'A set number of hours each month for changes and new features.' },
    ],
    examples: ['Ongoing support for internal business systems', 'Remote IT support for small offices', 'Workstation setup and software standardization'],
    outcome: 'Predictable cost, systems that keep up with your company, and someone accountable when something needs attention.',
  },
];

const es: Solution[] = [
  {
    slug: 'management-systems',
    mock: 'board',
    title: 'Sistemas de gestión a medida',
    short: 'Un solo sistema para clientes, pedidos, agenda e inventario, adaptado a cómo ya trabaja tu empresa.',
    lead: 'La mayoría de las empresas funciona con una mezcla de hojas de cálculo, correos y memoria. La reemplazamos por un solo sistema que tu equipo realmente quiere usar, construido alrededor de tu proceso y no al revés.',
    problems: [
      'La información de clientes está repartida entre hojas de cálculo, correos y la cabeza de algunas personas.',
      'Los mismos datos se escriben dos o tres veces, en lugares distintos.',
      'Nadie puede decir de un vistazo en qué estado está un pedido o proyecto.',
      'El software genérico cubre el 70% de lo que necesitas y te complica el resto.',
    ],
    builds: [
      { t: 'Gestión de clientes y cuentas', d: 'Cada cliente con todo su historial: contactos, cotizaciones, trabajos, documentos, pagos y conversaciones en un solo registro.' },
      { t: 'Pedidos, trabajos y proyectos', d: 'Tus etapas y estados reales. Asigna responsables, fechas y ve todo el flujo de un vistazo.' },
      { t: 'Agenda y recursos', d: 'Citas, cuadrillas, salas o equipos reservados sin cruces y con recordatorios automáticos.' },
      { t: 'Inventario y compras', d: 'Existencias, proveedores y órdenes de compra conectados a los trabajos que los consumen.' },
      { t: 'Roles y permisos', d: 'Cada persona ve lo que necesita. La gerencia ve todo. Cada cambio queda registrado.' },
      { t: 'Reportes que responden preguntas', d: 'Ingresos, carga de trabajo, pendientes vencidos y márgenes, actualizados en tiempo real.' },
    ],
    examples: ['Portal de clientes para un corredor de seguros', 'Control de reparaciones y mantenimiento de equipos industriales', 'Gestión de trabajos para un contratista con cuadrillas'],
    outcome: 'Una sola fuente de verdad. Menos doble digitación, menos olvidos y decisiones con números al día.',
  },
  {
    slug: 'team-collaboration',
    mock: 'thread',
    title: 'Colaboración interna',
    short: 'Conversaciones, tareas y aprobaciones dentro del cliente, pedido o proyecto al que pertenecen.',
    lead: 'Otra aplicación de chat no es la solución. Lo que un equipo necesita es que la conversación viva junto al trabajo, para que cualquiera abra un cliente o un pedido y vea qué se dijo, qué se decidió y qué falta.',
    problems: [
      'Las decisiones se pierden en grupos de chat que mezclan diez temas.',
      'Las personas nuevas no encuentran el historial de un cliente.',
      'Las aprobaciones se dan por mensaje y nadie puede demostrar quién aprobó qué.',
      'El trabajo depende de que alguien se acuerde de hacer seguimiento.',
    ],
    builds: [
      { t: 'Conversaciones en cada registro', d: 'Habla de un cliente, pedido o proyecto justo donde están sus datos, con archivos y menciones.' },
      { t: 'Tareas y traspasos', d: 'Convierte cualquier mensaje en tarea con responsable y fecha. Los traspasos entre áreas quedan registrados.' },
      { t: 'Aprobaciones con historial', d: 'Descuentos, compras, permisos y documentos aprobados con un clic y con registro permanente.' },
      { t: 'Portal del empleado', d: 'Políticas, formularios, solicitudes y comunicados en un solo lugar interno.' },
      { t: 'Avisos que importan', d: 'Cada persona recibe alertas solo de su trabajo, por correo, celular o escritorio.' },
    ],
    examples: ['Traspasos entre áreas en una operación de planillas', 'Flujo de aprobación de solicitudes de compra', 'Portal interno para un equipo con varias sedes'],
    outcome: 'El contexto se queda con el trabajo, las aprobaciones se pueden rastrear y el seguimiento deja de depender de la memoria.',
  },
  {
    slug: 'process-automation',
    mock: 'flow',
    title: 'Automatización e integración de procesos',
    short: 'De la cotización al contrato, la firma y la factura sin volver a escribir nada, y tus herramientas por fin conectadas.',
    lead: 'Las horas se pierden en los pasos entre sistemas: copiar una cotización a un contrato, perseguir una firma, volver a ingresar una factura, recordarle al cliente. Automatizamos esos pasos y conectamos las herramientas que ya pagas.',
    problems: [
      'Las cotizaciones y contratos se arman a mano desde documentos viejos.',
      'Los documentos firmados se quedan días en una bandeja de entrada.',
      'Las facturas salen tarde y los cobros se persiguen a mano.',
      'Tu contabilidad, correo, calendario y hojas de cálculo no se comunican.',
    ],
    builds: [
      { t: 'De la cotización al cobro', d: 'Genera la cotización desde tu lista de precios, conviértela en contrato, obtén la firma electrónica y emite la factura automáticamente.' },
      { t: 'Generación de documentos', d: 'Propuestas, contratos, órdenes de trabajo y reportes llenados con tus datos, en tu formato.' },
      { t: 'Seguimiento y recordatorios', d: 'Mensajes automáticos para firmas pendientes, citas próximas y pagos vencidos.' },
      { t: 'Integraciones', d: 'Conecta contabilidad, correo, calendarios, formularios y hojas de cálculo para que los datos fluyan solos.' },
      { t: 'Reportes programados', d: 'Los números que revisas cada lunes, en tu correo antes de que los pidas.' },
      { t: 'Respuestas automáticas', d: 'Las preguntas frecuentes de clientes se responden al instante dentro de tu sistema, y una persona toma el control cuando hace falta.' },
    ],
    examples: ['Automatización de planillas y facturación electrónica', 'Flujo de contratos y firmas para una empresa de servicios', 'Recepción y evaluación de solicitudes de seguros'],
    outcome: 'Cotizaciones, firmas y cobros más rápidos, y tu equipo de vuelta en el trabajo que necesita a una persona.',
  },
  {
    slug: 'digital-platform',
    mock: 'platform',
    title: 'Plataforma digital',
    short: 'Tu sitio web conectado a tu sistema: solicitudes, reservas y portales de clientes que alimentan tu operación directamente.',
    lead: 'Un sitio que solo muestra información es un folleto. Una plataforma digital recibe solicitudes, reservas y pagos y los envía directo a tu sistema, sin volver a escribir nada y sin que se pierda nada. Si aún no la tienes, la construimos.',
    problems: [
      'Los formularios del sitio llegan a un correo y se copian a mano.',
      'Los clientes llaman a preguntar el estado de algo que tu sistema ya sabe.',
      'Tu sitio no refleja el tamaño ni la seriedad de la empresa.',
      'Los clientes que hablan inglés y español reciben un servicio distinto.',
    ],
    builds: [
      { t: 'Sitio corporativo', d: 'Rápido, bilingüe y preparado para buscadores, con tus servicios bien explicados.' },
      { t: 'Solicitudes que crean registros', d: 'Las solicitudes de cotización y consultas se convierten en clientes y trabajos dentro de tu sistema.' },
      { t: 'Reservas en línea', d: 'El cliente elige un horario realmente disponible y los recordatorios salen solos.' },
      { t: 'Portal de clientes', d: 'Tus clientes entran para ver el estado, descargar documentos, firmar y pagar.' },
    ],
    examples: ['Plataforma bilingüe de productos con fichas técnicas', 'Plataforma de contratista multiservicio con captación de solicitudes', 'Plataforma de empresa de servicios con galerías de proyectos'],
    outcome: 'Una entrada profesional que trabaja para tu operación, no solo para tu imagen.',
  },
  {
    slug: 'support-continuity',
    mock: 'status',
    title: 'Soporte y continuidad',
    short: 'Monitoreo, respaldos, actualizaciones de seguridad, mesa de ayuda para tu equipo y mejoras mensuales constantes.',
    lead: 'El software nunca está terminado. Tu proceso cambia, tu equipo crece y aparecen necesidades nuevas. Un plan mensual mantiene tus sistemas seguros, respaldados y mejorando, con línea directa con quienes los construyeron.',
    problems: [
      'Quien construyó tu sistema ya no responde.',
      'Nadie sabe si los respaldos realmente funcionan.',
      'Las mejoras pequeñas esperan meses porque cada una requiere un proyecto nuevo.',
      'Cada computadora y cuenta está configurada de forma distinta.',
    ],
    builds: [
      { t: 'Monitoreo y respaldos', d: 'Control de disponibilidad, respaldos diarios y restauraciones probadas.' },
      { t: 'Actualizaciones de seguridad', d: 'Dependencias, accesos y cuentas revisados y al día.' },
      { t: 'Mesa de ayuda', d: 'Soporte remoto para los sistemas, computadoras y programas de tu equipo.' },
      { t: 'Mejoras mensuales', d: 'Horas fijas cada mes para cambios y nuevas funciones.' },
    ],
    examples: ['Soporte continuo de sistemas internos', 'Soporte técnico remoto para oficinas pequeñas', 'Configuración de equipos y estandarización de software'],
    outcome: 'Costo predecible, sistemas que crecen con tu empresa y alguien responsable cuando algo necesita atención.',
  },
];

export const solutions: Record<Lang, Solution[]> = { en, es };

/** Color identity of each solution: c = bright accent, ink = readable on light backgrounds, tint = soft background. */
export const solColor: Record<string, { c: string; ink: string; tint: string }> = {
  'management-systems': { c: '#1ad4d9', ink: '#0a8b90', tint: '#ebf8f9' },
  'team-collaboration': { c: '#b652d4', ink: '#8a33aa', tint: '#f6eefa' },
  'process-automation': { c: '#5b4bf0', ink: '#4a3bd6', tint: '#eeedfd' },
  'digital-platform': { c: '#17b890', ink: '#0e8566', tint: '#e9f7f2' },
  'support-continuity': { c: '#f2a33a', ink: '#a8650a', tint: '#fdf3e4' },
};
