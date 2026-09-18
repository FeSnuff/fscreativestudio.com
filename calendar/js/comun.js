/* Utilidades compartidas: fechas, temperatura, colores, temas e iconos. */

/* Ya no hay servidor propio: los datos viven en Google Sheets y se manejan
   desde datos.js. Aquí solo quedan las utilidades puras — fechas, colores,
   temas e iconos — que usan las dos pantallas.                              */

/* ---------- fechas ------------------------------------------------------ */

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const deIso = (s) => { const [a, m, d] = s.split("-").map(Number); return new Date(a, m - 1, d); };
export const hoyIso = () => iso(new Date());
export const sumarDias = (s, n) => { const d = deIso(s); d.setDate(d.getDate() + n); return iso(d); };

export function fechaLarga(s) {
  const d = deIso(s);
  return `${DIAS[(d.getDay() + 6) % 7]} ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`;
}
export function fechaCorta(s) {
  const d = deIso(s);
  return `${DIAS_CORTOS[(d.getDay() + 6) % 7]} ${d.getDate()}`;
}
export function etiquetaRelativa(s) {
  const dif = Math.round((deIso(s) - deIso(hoyIso())) / 86400000);
  if (dif === 0) return "Hoy";
  if (dif === 1) return "Mañana";
  if (dif === -1) return "Ayer";
  return fechaCorta(s);
}

export const aMinutos = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
export const aHora = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m) % 60).padStart(2, "0")}`;
export const decimal = (h) => aMinutos(h) / 60;

export function duracionTexto(min) {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

/* ---------- temperatura -------------------------------------------------- */

/** El servidor siempre entrega Celsius; aquí se convierte para mostrar. */
export function temp(valor, unidad = "C") {
  if (valor === null || valor === undefined) return "--";
  return unidad === "F" ? Math.round(valor * 9 / 5 + 32) : Math.round(valor);
}
export const gradoss = (unidad = "C") => (unidad === "F" ? "°F" : "°C");

/* ---------- colores ----------------------------------------------------- */

const aRgb = (hex) => {
  const n = parseInt((hex || "#888888").replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const aHex = (rgb) => "#" + rgb.map((c) =>
  Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");

/** Mezcla un color con el fondo del tema. fuerza 0 = solo fondo, 1 = solo color.
    Al mezclar contra el fondo real, los tintes salen claros en los temas
    claros y oscuros en el tema oscuro, sin lógica aparte. */
export function tinte(hex, fuerza, fondo) {
  const c = aRgb(hex);
  const f = aRgb(fondo || fondoActual());
  return aHex(c.map((v, i) => f[i] + (v - f[i]) * fuerza));
}

function fondoActual() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v : "#ffffff";
}

/** Publica --cat-<id>, --cat-<id>-1 y -2 para todas las categorías. */
export function aplicarCategorias(categorias) {
  const raiz = document.documentElement.style;
  const fondo = fondoActual();
  for (const c of categorias) {
    raiz.setProperty(`--cat-${c.id}`, c.color);
    raiz.setProperty(`--cat-${c.id}-0`, tinte(c.color, 0.32, fondo));
    raiz.setProperty(`--cat-${c.id}-1`, tinte(c.color, 0.24, fondo));
    raiz.setProperty(`--cat-${c.id}-2`, tinte(c.color, 0.11, fondo));
  }
}

/* ---------- estilos visuales --------------------------------------------- */

export const TEMAS = [
  { id: "nitido", nombre: "Nítido",  que: "Blanco, líneas finas, color solo donde informa",
    muestra: ["#FFFFFF", "#14151A", "#0891A5", "#E11D48"] },
  { id: "papel",  nombre: "Papel",   que: "Crema y serif, sobrio y formal",
    muestra: ["#FCFBF7", "#221F1A", "#7A5C2E", "#A8342A"] },
  { id: "smart",  nombre: "Smart",   que: "Fondo oscuro con acentos que brillan",
    muestra: ["#0F1216", "#EEF3F8", "#22D3EE", "#FB7185"] },
  { id: "vivo",   nombre: "Vivo",    que: "Redondeado y colorido, más alegre",
    muestra: ["#FFFFFF", "#1B1233", "#7C3AED", "#F43F5E"] },
  { id: "mono",   nombre: "Mono",    que: "Monoespaciada, sin curvas, alto contraste",
    muestra: ["#FFFFFF", "#0A0A0A", "#111111", "#D40D2C"] },
];

/** Se aplica en el acto y se recuerda en este dispositivo, para que al
    recargar no haya un parpadeo mientras llega la configuración. */
export function aplicarTema(id) {
  const tema = TEMAS.some((t) => t.id === id) ? id : "nitido";
  document.documentElement.dataset.tema = tema;
  try { localStorage.setItem("tema", tema); } catch {}
  return tema;
}

export function temaRecordado() {
  try { return localStorage.getItem("tema") || "nitido"; } catch { return "nitido"; }
}

export const colorDe = (id) => `var(--cat-${id}, var(--ink-3))`;
export const tinte0De = (id) => `var(--cat-${id}-0, var(--wash))`;
export const tinte1De = (id) => `var(--cat-${id}-1, var(--wash))`;
export const tinte2De = (id) => `var(--cat-${id}-2, var(--wash))`;

export function nombreCategoria(categorias, id) {
  return (categorias.find((c) => c.id === id) || {}).nombre || "Sin categoría";
}

/* ---------- iconos del clima -------------------------------------------- */

const TRAZOS = {
  sol: `<circle cx="12" cy="12" r="4.3" fill="#FFD24A" stroke="#E9A800" stroke-width="1.4"/>
        <path d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12h-2.1M18.5 5.5l-1.5 1.5M7 17l-1.5 1.5M18.5 18.5L17 17M7 7L5.5 5.5" stroke="#E9A800" stroke-width="1.6" stroke-linecap="round"/>`,
  parcial: `<circle cx="9" cy="9.5" r="3.4" fill="#FFD24A" stroke="#E9A800" stroke-width="1.3"/>
        <path d="M9.6 18.6h7.9a3.1 3.1 0 0 0 .3-6.2 4.5 4.5 0 0 0-8.5-1 3.4 3.4 0 0 0 .3 7.2Z" fill="#EDF1F5" stroke="#7C8794" stroke-width="1.4" stroke-linejoin="round"/>`,
  nubes: `<path d="M7.4 18h9.8a3.6 3.6 0 0 0 .3-7.2 5.2 5.2 0 0 0-9.9-1.2A3.9 3.9 0 0 0 7.4 18Z" fill="#E9EDF2" stroke="#7C8794" stroke-width="1.5" stroke-linejoin="round"/>`,
  niebla: `<path d="M7.4 14.5h9.8a3.6 3.6 0 0 0 .3-7.2 5.2 5.2 0 0 0-9.9-1.2 3.9 3.9 0 0 0-.2 8.4Z" fill="#E9EDF2" stroke="#7C8794" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M4.5 18h15M7 21h11" stroke="#7C8794" stroke-width="1.6" stroke-linecap="round"/>`,
  lluvia: `<path d="M7.6 14.6h9.2a3.4 3.4 0 0 0 .3-6.8 5 5 0 0 0-9.5-1.1 3.7 3.7 0 0 0 0 7.9Z" fill="#DDE9FB" stroke="#1D6FE0" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M9 17.4l-.9 3M13 17.4l-.9 3M17 17.4l-.9 3" stroke="#1D6FE0" stroke-width="1.7" stroke-linecap="round"/>`,
  nieve: `<path d="M7.6 14.6h9.2a3.4 3.4 0 0 0 .3-6.8 5 5 0 0 0-9.5-1.1 3.7 3.7 0 0 0 0 7.9Z" fill="#EAF1FA" stroke="#5B8DC9" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M9 19h.01M13 20.5h.01M17 19h.01" stroke="#5B8DC9" stroke-width="2.6" stroke-linecap="round"/>`,
  tormenta: `<path d="M7.6 14.2h9.2a3.4 3.4 0 0 0 .3-6.8 5 5 0 0 0-9.5-1.1 3.7 3.7 0 0 0 0 7.9Z" fill="#DDE9FB" stroke="#1D6FE0" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M13.4 15.4l-3.5 4.4h2.6l-1 3.4 3.9-4.9h-2.6l1.3-2.9Z" fill="#FFC93C" stroke="#E9A800" stroke-width="1.1" stroke-linejoin="round"/>`,
  viento: `<path d="M3.5 9.5h9.6a2.6 2.6 0 1 0-2.6-2.6M3.5 14h13a2.6 2.6 0 1 1-2.6 2.6" fill="none" stroke="#7C8794" stroke-width="1.7" stroke-linecap="round"/>`,
};

export const iconoClima = (cond, clase = "") =>
  `<svg class="${clase}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${TRAZOS[cond] || TRAZOS.nubes}</svg>`;

/* ---------- varios ------------------------------------------------------ */

export const escapar = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function rebotar(fn, ms = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** addEventListener que NO se acumula.

    Los elementos que viven dentro de un innerHTML se destruyen al repintar y
    se llevan sus manejadores. Pero los que sobreviven al repintado (el <form>,
    la sección de ajustes) se quedan con el manejador viejo, así que volver a
    cablearlos les suma uno más cada vez: a la segunda visita el formulario
    enviaba dos veces y creaba la actividad duplicada.

    Con esto, poner el manejador quita primero el anterior de la misma llave. */
export function alUnico(el, evento, fn, llave = evento) {
  if (!el) return;
  const puestos = el._manejadores || (el._manejadores = {});
  if (puestos[llave]) el.removeEventListener(evento, puestos[llave]);
  puestos[llave] = fn;
  el.addEventListener(evento, fn);
}

/** Identificador de un envío concreto. Viaja con la actividad nueva; si el
    servidor ve la misma clave dos veces, devuelve la que ya creó en vez de
    crear otra. Cubre el doble toque y los reintentos de red. */
export function claveUnica() {
  try { return crypto.randomUUID(); } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
