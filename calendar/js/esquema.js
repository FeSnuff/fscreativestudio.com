/* La estructura de la hoja de cálculo, en un solo lugar.

   Este archivo es la fuente de verdad: describe cada pestaña, sus columnas y
   sus validaciones. De aquí salen tanto el JSON que crea la hoja la primera
   vez como las funciones que convierten fila <-> objeto. Si algún día agregas
   una columna, la agregas aquí y nada más.

   Sobre los tipos: las fechas se guardan como TEXTO en formato ISO
   (2026-09-18) y las horas como "HH:MM". Podría guardarlas como fechas reales
   de Sheets, pero entonces la API las devuelve como número de serie o como
   texto según el idioma de la cuenta, y al escribir las interpreta según la
   configuración regional. En ISO no hay ambigüedad posible, ordena bien
   alfabéticamente, y se lee igual en Cusco que en Virginia. Para agrupar por
   mes en la hoja: =IZQUIERDA(D2;7).                                         */

export const COLORES_INICIALES = [
  { id: "general",  nombre: "General",    color: "#0891A5", orden: 1 },
  { id: "trabajo",  nombre: "Trabajo",    color: "#2563EB", orden: 2 },
  { id: "estudio",  nombre: "Estudio",    color: "#7C3AED", orden: 3 },
  { id: "personal", nombre: "Personal",   color: "#059669", orden: 4 },
  { id: "salud",    nombre: "Salud",      color: "#DB2777", orden: 5 },
];

export const PRIORIDADES = ["alta", "media", "baja"];
export const REPETICIONES = ["ninguna", "diaria", "semanal", "mensual", "anual"];

/* ---------- definición de las pestañas ---------------------------------- */

/** Cada columna: clave interna, encabezado visible, tipo y ancho en píxeles.
    tipo: texto | fecha | hora | bool | entero | color | lista            */
export const HOJAS = {
  Actividades: {
    nota: "Una fila por actividad. No borres la fila 1.",
    congelar: 1,
    columnas: [
      { k: "id",          h: "ID",            t: "texto",  w: 110 },
      { k: "titulo",      h: "Título",        t: "texto",  w: 240 },
      { k: "detalle",     h: "Detalle",       t: "texto",  w: 260 },
      { k: "fecha",       h: "Fecha",         t: "fecha",  w: 100 },
      { k: "inicio",      h: "Inicio",        t: "hora",   w: 70 },
      { k: "fin",         h: "Fin",           t: "hora",   w: 70 },
      { k: "todoElDia",   h: "Todo el día",   t: "bool",   w: 95 },
      { k: "categoria",   h: "Categoría",     t: "lista",  w: 110, lista: "categorias" },
      { k: "prioridad",   h: "Prioridad",     t: "lista",  w: 90,  lista: "prioridades" },
      { k: "repetir",     h: "Repetir",       t: "lista",  w: 95,  lista: "repeticiones" },
      { k: "dias",        h: "Días",          t: "texto",  w: 90,
        ayuda: "Solo para repetición semanal. Números 0-6 separados por coma, 0 = lunes." },
      { k: "intervalo",   h: "Cada",          t: "entero", w: 60,
        ayuda: "Cada cuántos días, semanas, meses o años se repite. Vacío o 1 = todos. La app no lo edita, pero si lo pones aquí lo respeta." },
      { k: "hasta",       h: "Repetir hasta", t: "fecha",  w: 110 },
      { k: "recordatorio", h: "Recordatorio", t: "entero", w: 105,
        ayuda: "Minutos antes de empezar. Vacío = sin recordatorio." },
      { k: "archivada",   h: "Archivada",     t: "bool",   w: 90,
        ayuda: "Se marca sola al terminar el día si ya estaba hecha." },
      { k: "creada",      h: "Creada",        t: "texto",  w: 150 },
      { k: "editada",     h: "Editada",       t: "texto",  w: 150 },
    ],
  },

  Completadas: {
    nota: "Una fila por día marcado como hecho. Así una actividad que se repite guarda su historial sin amontonar nada en una celda.",
    congelar: 1,
    columnas: [
      { k: "actividadId", h: "ID actividad", t: "texto", w: 130 },
      { k: "fecha",       h: "Fecha",        t: "fecha", w: 110 },
      { k: "marcada",     h: "Marcada el",   t: "texto", w: 150 },
    ],
  },

  Excepciones: {
    nota: "Días sueltos que se borraron de una serie que se repite.",
    congelar: 1,
    columnas: [
      { k: "actividadId", h: "ID actividad", t: "texto", w: 130 },
      { k: "fecha",       h: "Fecha",        t: "fecha", w: 110 },
    ],
  },

  Categorias: {
    nota: "Edita aquí los colores si quieres; la app los toma tal cual.",
    congelar: 1,
    columnas: [
      { k: "id",     h: "ID",     t: "texto", w: 120 },
      { k: "nombre", h: "Nombre", t: "texto", w: 180 },
      { k: "color",  h: "Color",  t: "color", w: 100 },
      { k: "orden",  h: "Orden",  t: "entero", w: 70 },
    ],
  },

  Config: {
    nota: "Ajustes de la aplicación. La columna Nota es solo para ti.",
    congelar: 1,
    columnas: [
      { k: "clave", h: "Clave", t: "texto", w: 200 },
      { k: "valor", h: "Valor", t: "texto", w: 200 },
      { k: "nota",  h: "Nota",  t: "texto", w: 420 },
    ],
  },

  Papelera: {
    nota: "Lo que borras cae aquí. Puedes vaciarla a mano cuando quieras.",
    congelar: 1,
    columnas: [
      { k: "id",       h: "ID",       t: "texto", w: 110 },
      { k: "titulo",   h: "Título",   t: "texto", w: 240 },
      { k: "fecha",    h: "Fecha",    t: "fecha", w: 100 },
      { k: "inicio",   h: "Inicio",   t: "hora",  w: 70 },
      { k: "datos",    h: "Datos",    t: "texto", w: 400,
        ayuda: "La actividad completa, para poder restaurarla." },
      { k: "borrada",  h: "Borrada el", t: "texto", w: 150 },
    ],
  },
};

export const NOMBRES_HOJAS = Object.keys(HOJAS);

/* ---------- valores iniciales de Config --------------------------------- */

export const CONFIG_INICIAL = [
  ["tema", "nitido", "Estilo visual: nitido, papel, smart, vivo o mono."],
  ["texto_tv", "15", "Tamaño con el que arranca la letra de la TV, en píxeles (de 10 a 26). En la TV se afina con Ctrl + rueda."],
  ["tareas_por_dia", "2", "Cuántas actividades se ven en cada casilla del mes (1 a 4)."],
  ["lineas_titulo", "1", "1 = recortar el título con «…». 2 = partirlo en dos líneas."],
  ["solo_altas", "FALSO", "VERDADERO = en el mes solo se ven las de prioridad alta."],
  ["hoy_siguientes", "VERDADERO", "En el día de hoy, mostrar las que vienen en vez de las primeras."],
  ["semana_empieza_lunes", "VERDADERO", "FALSO para empezar la semana en domingo."],
  ["agenda_inicio", "0", "Primera hora que se ve en la línea del día (0 a 23)."],
  ["agenda_fin", "23", "Última hora que se ve en la línea del día."],
  ["atenuar", "FALSO", "Bajar el brillo de la TV en un horario."],
  ["atenuar_desde", "22:00", "Hora en que empieza a atenuar."],
  ["atenuar_hasta", "06:00", "Hora en que deja de atenuar."],
  ["antiquemado", "VERDADERO", "Mover la imagen unos píxeles cada 10 min para cuidar la pantalla."],
  ["clima_activo", "VERDADERO", "Consultar el pronóstico."],
  ["clima_unidad", "C", "C para Celsius, F para Fahrenheit."],
  ["clima_lat", "-13.5319", "Latitud del lugar."],
  ["clima_lon", "-71.9675", "Longitud del lugar."],
  ["clima_lugar", "Cusco, Perú", "Nombre del lugar, solo para mostrarlo."],
  ["clima_umbral_lluvia", "45", "A partir de qué probabilidad de lluvia (%) avisar."],
  ["bloquear_pasado", "VERDADERO", "Impedir crear actividades en días u horas que ya pasaron."],
  ["archivar_al_terminar", "VERDADERO", "Archivar solas las actividades hechas al terminar el día."],
  ["dias_gracia", "1", "Cuántos días esperar antes de archivar."],
  ["sondeo_segundos", "45", "Cada cuánto la TV vuelve a leer la hoja."],
];

/* ---------- conversión fila <-> objeto ---------------------------------- */

const VERDADEROS = new Set(["true", "verdadero", "sí", "si", "1", "x", "vrai"]);

function desdeCelda(valor, tipo) {
  const s = valor === null || valor === undefined ? "" : String(valor).trim();
  if (tipo === "bool") return VERDADEROS.has(s.toLowerCase());
  if (tipo === "entero") {
    if (s === "") return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  }
  return s;
}

function aCelda(valor, tipo) {
  if (tipo === "bool") return valor ? "VERDADERO" : "FALSO";
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

/** Filas crudas de la API -> objetos, usando la fila 1 solo como referencia. */
export function filasAObjetos(hoja, filas) {
  const cols = HOJAS[hoja].columnas;
  const salida = [];
  for (let i = 1; i < filas.length; i++) {        // la 0 son los encabezados
    const fila = filas[i] || [];
    if (fila.every((c) => String(c ?? "").trim() === "")) continue;   // fila vacía
    const obj = { _fila: i + 1 };                 // número de fila real en la hoja
    cols.forEach((c, j) => { obj[c.k] = desdeCelda(fila[j], c.t); });
    salida.push(obj);
  }
  return salida;
}

/** Objeto -> arreglo de celdas, en el orden de las columnas. */
export function objetoAFila(hoja, obj) {
  return HOJAS[hoja].columnas.map((c) => aCelda(obj[c.k], c.t));
}

export const encabezados = (hoja) => HOJAS[hoja].columnas.map((c) => c.h);
export const anchoDe = (hoja) => HOJAS[hoja].columnas.length;

/** "Actividades!A1:P" — el rango completo de una pestaña. */
export function rangoDe(hoja) {
  const n = anchoDe(hoja);
  return `${hoja}!A1:${letraColumna(n - 1)}`;
}

export function letraColumna(i) {
  let s = "";
  for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) {
    s = String.fromCharCode(65 + (n % 26)) + s;
  }
  return s;
}
