/* Validación de actividades y expansión de repeticiones.

   Es el modelos.py de la versión anterior, traducido a JavaScript. Ahora corre
   en el navegador porque ya no hay servidor, pero la forma de los objetos es
   la misma de antes a propósito: así las vistas de TV y Gestión siguen
   funcionando sin tocarles la lógica.

   Todas las fechas van como texto ISO (2026-09-18). Las Date de JavaScript
   solo aparecen adentro de los cálculos, nunca guardadas, porque construirlas
   desde texto arrastra problemas de zona horaria.                           */

export const PRIORIDADES = ["alta", "media", "baja"];
export const REPETICIONES = ["ninguna", "diaria", "semanal", "mensual", "anual"];

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const TOPE = 400;

export class DatoInvalido extends Error {}

export const nuevoId = () => {
  const b = new Uint8Array(6);
  (crypto || window.crypto).getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

/* ---------- fechas sin sorpresas de zona horaria ------------------------ */

export const aIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const deIso = (s) => { const [a, m, d] = s.split("-").map(Number); return new Date(a, m - 1, d); };
export const hoyIso = () => aIso(new Date());
export const sumarDias = (iso, n) => { const d = deIso(iso); d.setDate(d.getDate() + n); return aIso(d); };
/** 0 = lunes, como en Python. */
export const diaSemana = (iso) => (deIso(iso).getDay() + 6) % 7;

export const minutos = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
export const horaDeMinutos = (t) => {
  const v = Math.max(0, Math.min(24 * 60 - 1, Math.round(t)));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
};

/* ---------- validación --------------------------------------------------- */

const texto = (v, max = 200, campo = "texto") => {
  if (v === null || v === undefined) return "";
  return String(v).trim().slice(0, max);
};

function fechaValida(v, campo = "La fecha") {
  const s = texto(v, 10, campo);
  if (!RE_FECHA.test(s)) throw new DatoInvalido(`${campo} debe tener el formato AAAA-MM-DD`);
  const d = deIso(s);
  if (Number.isNaN(d.getTime()) || aIso(d) !== s)
    throw new DatoInvalido(`${campo} no existe en el calendario`);
  return s;
}

function horaValida(v, campo = "La hora") {
  const s = texto(v, 5, campo);
  if (!RE_HORA.test(s)) throw new DatoInvalido(`${campo} debe tener el formato HH:MM`);
  return s;
}

export function normalizar(entrada, base = null, categorias = [], reglas = null) {
  const dato = { ...(base || {}), ...entrada };
  const ids = categorias.map((c) => c.id);
  const porDefecto = ids[0] || "general";

  const titulo = texto(dato.titulo, 120, "El título");
  if (!titulo) throw new DatoInvalido("El título no puede estar vacío");

  const todoElDia = !!dato.todoElDia;
  const fecha = fechaValida(dato.fecha);

  let inicio = null, fin = null;
  if (!todoElDia) {
    inicio = horaValida(dato.inicio || "09:00", "La hora de inicio");
    fin = horaValida(dato.fin || horaDeMinutos(minutos(inicio) + 60), "La hora de término");
    if (minutos(fin) <= minutos(inicio))
      throw new DatoInvalido("La hora de término tiene que ser posterior a la de inicio");
  }

  revisarPasado(reglas, fecha, inicio, todoElDia);

  let categoria = texto(dato.categoria, 40) || porDefecto;
  if (ids.length && !ids.includes(categoria)) categoria = porDefecto;

  let prioridad = texto(dato.prioridad, 10) || "media";
  if (!PRIORIDADES.includes(prioridad)) prioridad = "media";

  let recordatorio = dato.recordatorio;
  if (recordatorio === "" || recordatorio === null || recordatorio === undefined || recordatorio === false) {
    recordatorio = null;
  } else {
    const n = parseInt(recordatorio, 10);
    recordatorio = Number.isFinite(n) ? Math.max(0, Math.min(1440, n)) : null;
  }

  const ahora = new Date().toISOString();
  return {
    id: texto(dato.id, 32) || nuevoId(),
    titulo,
    detalle: texto(dato.detalle, 200, "El detalle"),
    fecha, inicio, fin, todoElDia, categoria, prioridad,
    repetir: normalizarRepeticion(dato.repetir, fecha),
    recordatorio,
    completadas: (dato.completadas || []).filter((f) => RE_FECHA.test(String(f))).slice(0, 400),
    excepciones: (dato.excepciones || []).filter((f) => RE_FECHA.test(String(f))).slice(0, 400),
    archivada: !!dato.archivada,
    creada: (base && base.creada) || ahora,
    editada: ahora,
  };
}

function revisarPasado(reglas, fecha, inicio, todoElDia) {
  if (!reglas || !reglas.bloquear_pasado) return;
  const ahora = new Date();
  const hoy = hoyIso();
  if (fecha < hoy) throw new DatoInvalido("No puedes agendar en un día que ya pasó");
  if (fecha === hoy && !todoElDia && inicio) {
    const margen = Number(reglas.margen_minutos ?? 5);
    if (minutos(inicio) < ahora.getHours() * 60 + ahora.getMinutes() - margen) {
      throw new DatoInvalido(
        `Esa hora ya pasó. Ahora son las ${horaDeMinutos(ahora.getHours() * 60 + ahora.getMinutes())}`);
    }
  }
}

export function normalizarRepeticion(valor, fechaBase) {
  if (!valor || typeof valor !== "object") return { tipo: "ninguna", intervalo: 1, dias: [], hasta: null };
  const tipo = String(valor.tipo || "ninguna");
  if (!REPETICIONES.includes(tipo) || tipo === "ninguna")
    return { tipo: "ninguna", intervalo: 1, dias: [], hasta: null };

  let intervalo = parseInt(valor.intervalo, 10);
  intervalo = Number.isFinite(intervalo) ? Math.max(1, Math.min(52, intervalo)) : 1;

  let dias = [];
  if (tipo === "semanal") {
    for (const d of valor.dias || []) {
      const n = parseInt(d, 10);
      if (Number.isFinite(n) && n >= 0 && n <= 6 && !dias.includes(n)) dias.push(n);
    }
    dias.sort((a, b) => a - b);
    if (!dias.length) dias = [diaSemana(fechaBase)];
  }

  let hasta = valor.hasta || null;
  if (hasta && !RE_FECHA.test(String(hasta))) hasta = null;

  return { tipo, intervalo, dias, hasta };
}

/* ---------- expansión de repeticiones ------------------------------------ */

/** Las fechas concretas en que cae una actividad dentro del rango. */
export function ocurrencias(act, desdeIso, hastaIso) {
  const rep = act.repetir || { tipo: "ninguna" };
  const tipo = rep.tipo || "ninguna";
  const inicio = act.fecha;
  let hasta = hastaIso;
  if (rep.hasta && rep.hasta < hasta) hasta = rep.hasta;
  if (hasta < desdeIso || hasta < inicio) return [];

  const excepciones = new Set(act.excepciones || []);
  const salida = [];
  const anadir = (iso) => {
    if (iso >= desdeIso && iso <= hasta && !excepciones.has(iso)) salida.push(iso);
  };

  if (tipo === "ninguna") { anadir(inicio); return salida; }

  const intervalo = Math.max(1, Number(rep.intervalo) || 1);

  if (tipo === "diaria") {
    let actual = inicio;
    if (actual < desdeIso) {
      const saltos = Math.floor(dias(inicio, desdeIso) / intervalo);
      actual = sumarDias(inicio, saltos * intervalo);
    }
    while (actual <= hasta && salida.length < TOPE) {
      anadir(actual);
      actual = sumarDias(actual, intervalo);
    }

  } else if (tipo === "semanal") {
    const cuales = rep.dias?.length ? rep.dias : [diaSemana(inicio)];
    let semana = sumarDias(inicio, -diaSemana(inicio));       // lunes de esa semana
    const anclaAtras = sumarDias(desdeIso, -7);
    if (semana < anclaAtras) {
      const saltos = Math.floor(Math.floor(dias(semana, desdeIso) / 7) / intervalo);
      semana = sumarDias(semana, saltos * intervalo * 7);
    }
    while (semana <= hasta && salida.length < TOPE) {
      for (const d of cuales) {
        const f = sumarDias(semana, d);
        if (f >= inicio) anadir(f);
      }
      semana = sumarDias(semana, intervalo * 7);
    }

  } else if (tipo === "mensual") {
    const base = deIso(inicio);
    let ano = base.getFullYear(), mes = base.getMonth() + 1;
    const dia = base.getDate();
    const anoTope = deIso(hasta).getFullYear();
    for (let n = 0; n < TOPE; n++) {
      const f = fechaSiExiste(ano, mes, dia);
      if (f) {
        if (f > hasta) break;
        anadir(f);
      }
      mes += intervalo;
      while (mes > 12) { mes -= 12; ano += 1; }
      if (ano > anoTope + 1) break;
    }

  } else if (tipo === "anual") {
    const base = deIso(inicio);
    const anoTope = deIso(hasta).getFullYear();
    for (let ano = base.getFullYear(); ano <= anoTope && salida.length < TOPE; ano += intervalo) {
      const f = fechaSiExiste(ano, base.getMonth() + 1, base.getDate());
      if (f) anadir(f);
    }
  }

  salida.sort();
  return salida;
}

/** null si ese mes no tiene ese día (31 de febrero). */
function fechaSiExiste(ano, mes, dia) {
  const d = new Date(ano, mes - 1, dia);
  return d.getMonth() === mes - 1 && d.getDate() === dia ? aIso(d) : null;
}

const dias = (a, b) => Math.round((deIso(b) - deIso(a)) / 86400000);

/** Ya pasó su hora y nadie la marcó como hecha. */
export function vencida(fecha, fin, todoElDia, completada, ahora = null) {
  if (completada) return false;
  ahora = ahora || new Date();
  const hoy = aIso(ahora);
  if (fecha < hoy) return true;
  if (fecha > hoy || todoElDia) return false;
  return minutos(fin || "23:59") < ahora.getHours() * 60 + ahora.getMinutes();
}

/** Lista plana de ocurrencias, lista para pintar. */
export function expandir(actividades, desde, hasta, incluirArchivadas = false) {
  const ahora = new Date();
  const salida = [];
  for (const act of actividades) {
    if (act.archivada && !incluirArchivadas) continue;
    for (const fecha of ocurrencias(act, desde, hasta)) {
      const hecha = (act.completadas || []).includes(fecha);
      salida.push({
        ...act,
        fecha,
        fechaBase: act.fecha,
        repetida: (act.repetir || {}).tipo !== "ninguna",
        completada: hecha,
        vencida: vencida(fecha, act.fin, act.todoElDia, hecha, ahora),
      });
    }
  }
  salida.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
    const ha = a.todoElDia ? "00:00" : (a.inicio || "00:00");
    const hb = b.todoElDia ? "00:00" : (b.inicio || "00:00");
    return ha < hb ? -1 : ha > hb ? 1 : 0;
  });
  return salida;
}
