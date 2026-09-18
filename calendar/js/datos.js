/* La capa de datos: entre la hoja de cálculo y las pantallas.

   Hace cuatro cosas:

   - Traduce. En la hoja una actividad es una fila plana y sus días marcados
     viven en otra pestaña; en memoria es el mismo objeto anidado que usaba la
     versión con servidor. Gracias a eso las vistas no se enteraron del cambio.

   - Guarda una copia local. Lo último que se leyó queda en localStorage, así
     que la TV pinta el día completo apenas abre, antes de hablar con Google, y
     sigue mostrando algo si la red se cae.

   - Escribe de forma optimista. El cambio se ve al instante y viaja después;
     si Google lo rechaza, se revierte y te avisa. Las escrituras van en fila
     india para que dos toques seguidos no se pisen.

   - Sondea. Sin servidor no hay quien empuje avisos, así que se relee cada
     tantos segundos. Una lectura completa es una sola petición.            */

import * as sheets from "./sheets.js";
import * as M from "./modelos.js";
import { CONFIG_INICIAL } from "./esquema.js";

const NOTAS = Object.fromEntries(CONFIG_INICIAL.map(([k, , n]) => [k, n]));

const CACHE = "calendario_cache_v1";

const estado = {
  id: null,                 // spreadsheetId
  actividades: [],
  categorias: [],
  config: {},
  papelera: [],
  cargado: false,
  sincronizando: false,
  ultimoError: null,
  ultimaLectura: 0,
};

let oyentes = new Set();
let sondeo = null;
let cola = Promise.resolve();

/* ---------- avisos a las pantallas -------------------------------------- */

export function escuchar(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }
const avisar = (que = "datos") => oyentes.forEach((f) => { try { f(que, estado); } catch {} });

export const leer = () => estado;

/* ---------- traducción hoja <-> memoria --------------------------------- */

function hidratar(crudo) {
  const completadas = new Map();
  const excepciones = new Map();
  for (const c of crudo.Completadas || []) {
    if (!completadas.has(c.actividadId)) completadas.set(c.actividadId, []);
    completadas.get(c.actividadId).push(c.fecha);
  }
  for (const e of crudo.Excepciones || []) {
    if (!excepciones.has(e.actividadId)) excepciones.set(e.actividadId, []);
    excepciones.get(e.actividadId).push(e.fecha);
  }

  const actividades = (crudo.Actividades || []).filter((f) => f.id && f.titulo).map((f) => ({
    id: f.id,
    titulo: f.titulo,
    detalle: f.detalle,
    fecha: f.fecha,
    inicio: f.todoElDia ? null : (f.inicio || "09:00"),
    fin: f.todoElDia ? null : (f.fin || "10:00"),
    todoElDia: f.todoElDia,
    categoria: f.categoria,
    prioridad: M.PRIORIDADES.includes(f.prioridad) ? f.prioridad : "media",
    repetir: M.normalizarRepeticion({
      tipo: f.repetir,
      intervalo: f.intervalo || 1,
      dias: String(f.dias || "").split(",").map((s) => s.trim()).filter(Boolean),
      hasta: f.hasta || null,
    }, f.fecha),
    recordatorio: f.recordatorio,
    archivada: f.archivada,
    completadas: (completadas.get(f.id) || []).sort(),
    excepciones: (excepciones.get(f.id) || []).sort(),
    creada: f.creada,
    editada: f.editada,
  }));

  const config = {};
  for (const fila of crudo.Config || []) {
    if (fila.clave) config[fila.clave] = fila.valor;
  }

  return {
    actividades,
    categorias: (crudo.Categorias || [])
      .filter((c) => c.id)
      .sort((a, b) => (a.orden || 99) - (b.orden || 99)),
    config,
    papelera: crudo.Papelera || [],
  };
}

/** De memoria a filas, para escribir. */
function deshidratar() {
  const Actividades = estado.actividades.map((a) => ({
    id: a.id, titulo: a.titulo, detalle: a.detalle, fecha: a.fecha,
    inicio: a.todoElDia ? "" : a.inicio,
    fin: a.todoElDia ? "" : a.fin,
    todoElDia: a.todoElDia,
    categoria: a.categoria, prioridad: a.prioridad,
    repetir: (a.repetir || {}).tipo || "ninguna",
    dias: ((a.repetir || {}).dias || []).join(","),
    intervalo: (a.repetir || {}).intervalo || 1,
    hasta: (a.repetir || {}).hasta || "",
    recordatorio: a.recordatorio,
    archivada: a.archivada,
    creada: a.creada, editada: a.editada,
  }));

  const Completadas = [];
  const Excepciones = [];
  for (const a of estado.actividades) {
    for (const f of a.completadas || []) Completadas.push({ actividadId: a.id, fecha: f, marcada: "" });
    for (const f of a.excepciones || []) Excepciones.push({ actividadId: a.id, fecha: f });
  }
  return { Actividades, Completadas, Excepciones };
}

/* ---------- caché local --------------------------------------------------- */

function guardarCache() {
  try {
    localStorage.setItem(CACHE, JSON.stringify({
      id: estado.id, actividades: estado.actividades, categorias: estado.categorias,
      config: estado.config, cuando: Date.now(),
    }));
  } catch {}
}

export function cargarCache(id) {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (!c || c.id !== id) return false;
    estado.actividades = c.actividades || [];
    estado.categorias = c.categorias || [];
    estado.config = c.config || {};
    estado.cargado = true;
    avisar("cache");
    return true;
  } catch { return false; }
}

/* ---------- arranque y sincronización ------------------------------------ */

export async function iniciar(spreadsheetId) {
  estado.id = spreadsheetId;
  cargarCache(spreadsheetId);
  await sincronizar();
  arrancarSondeo();
}

export async function sincronizar() {
  if (estado.sincronizando) return;
  estado.sincronizando = true;
  avisar("estado");
  try {
    const crudo = await sheets.leerTodo(estado.id);
    Object.assign(estado, hidratar(crudo));
    estado.cargado = true;
    estado.ultimoError = null;
    estado.ultimaLectura = Date.now();
    guardarCache();
    avisar("datos");
  } catch (e) {
    estado.ultimoError = e.message;
    avisar("error");
    if (!estado.cargado) throw e;       // sin caché no hay nada que mostrar
  } finally {
    estado.sincronizando = false;
    avisar("estado");
  }
}

export function arrancarSondeo() {
  detenerSondeo();
  const seg = Math.max(15, Number(estado.config.sondeo_segundos) || 45);
  sondeo = setInterval(() => { if (!document.hidden) sincronizar(); }, seg * 1000);
  document.addEventListener("visibilitychange", alVolver);
}
export function detenerSondeo() {
  clearInterval(sondeo); sondeo = null;
  document.removeEventListener("visibilitychange", alVolver);
}
function alVolver() {
  if (!document.hidden && Date.now() - estado.ultimaLectura > 10000) sincronizar();
}

/* ---------- escritura ----------------------------------------------------- */

/** Aplica el cambio en memoria, avisa a la pantalla y lo manda a Google.
    Si Google lo rechaza, deja las cosas como estaban. */
function escribir(mutar, hojas = ["Actividades", "Completadas", "Excepciones"]) {
  const respaldo = {
    actividades: JSON.parse(JSON.stringify(estado.actividades)),
    papelera: JSON.parse(JSON.stringify(estado.papelera)),
  };
  const resultado = mutar();
  avisar("datos");
  guardarCache();

  cola = cola.then(async () => {
    try {
      const todo = { ...deshidratar(), Papelera: estado.papelera };
      const mapa = {};
      for (const h of hojas) if (todo[h]) mapa[h] = todo[h];
      await sheets.guardarVarias(estado.id, mapa);
      estado.ultimoError = null;
    } catch (e) {
      estado.actividades = respaldo.actividades;
      estado.papelera = respaldo.papelera;
      estado.ultimoError = e.message;
      avisar("datos");
      avisar("error");
      throw e;
    }
  });
  return cola.then(() => resultado);
}

const buscar = (id) => estado.actividades.find((a) => a.id === id);

export function crearActividad(datos) {
  const reglas = { bloquear_pasado: esVerdad(estado.config.bloquear_pasado), margen_minutos: 5 };
  const act = M.normalizar(datos, null, estado.categorias, reglas);
  return escribir(() => { estado.actividades.push(act); return act; });
}

export function editarActividad(id, datos) {
  const base = buscar(id);
  if (!base) throw new M.DatoInvalido("Esa actividad ya no existe");
  const movida = (datos.fecha && datos.fecha !== base.fecha)
              || (datos.inicio && datos.inicio !== base.inicio);
  const reglas = movida && esVerdad(estado.config.bloquear_pasado)
    ? { bloquear_pasado: true, margen_minutos: 5 } : null;
  const act = M.normalizar(datos, base, estado.categorias, reglas);
  act.id = base.id;
  return escribir(() => {
    estado.actividades[estado.actividades.indexOf(base)] = act;
    return act;
  });
}

/** Sin fecha borra la actividad entera; con fecha salta solo ese día. */
export function borrarActividad(id, fecha = null) {
  const act = buscar(id);
  if (!act) return Promise.resolve();
  if (fecha && (act.repetir || {}).tipo !== "ninguna") {
    return escribir(() => {
      act.excepciones = [...new Set([...(act.excepciones || []), fecha])].sort();
      return { modo: "ocurrencia" };
    });
  }
  return escribir(() => {
    estado.papelera.unshift({
      id: act.id, titulo: act.titulo, fecha: act.fecha, inicio: act.inicio || "",
      datos: JSON.stringify(act), borrada: new Date().toISOString(),
    });
    estado.papelera = estado.papelera.slice(0, 50);
    estado.actividades = estado.actividades.filter((a) => a.id !== id);
    return { modo: "completa" };
  }, ["Actividades", "Completadas", "Excepciones", "Papelera"]);
}

export function completar(id, fecha, valor) {
  const act = buscar(id);
  if (!act) return Promise.resolve();
  return escribir(() => {
    const ya = new Set(act.completadas || []);
    if (valor) ya.add(fecha); else ya.delete(fecha);
    act.completadas = [...ya].sort();
  }, ["Completadas"]);
}

export function posponer(id, nuevaFecha) {
  const act = buscar(id);
  if (!act) return Promise.resolve();
  return escribir(() => {
    if ((act.repetir || {}).tipo !== "ninguna") {
      // una serie no se mueve entera: se salta ese día y se crea una suelta
      act.excepciones = [...new Set([...(act.excepciones || []), act.fecha])].sort();
      const suelta = { ...act, id: M.nuevoId(), fecha: nuevaFecha,
                       repetir: { tipo: "ninguna", intervalo: 1, dias: [], hasta: null },
                       completadas: [], excepciones: [] };
      estado.actividades.push(suelta);
      return suelta;
    }
    act.fecha = nuevaFecha;
    act.editada = new Date().toISOString();
    return act;
  });
}

export function duplicar(id) {
  const act = buscar(id);
  if (!act) return Promise.resolve();
  const copia = { ...JSON.parse(JSON.stringify(act)), id: M.nuevoId(),
                  titulo: `${act.titulo} (copia)`, completadas: [], excepciones: [],
                  archivada: false, creada: new Date().toISOString() };
  return escribir(() => { estado.actividades.push(copia); return copia; });
}

export function restaurar(indice) {
  const fila = estado.papelera[indice];
  if (!fila) return Promise.resolve();
  let act;
  try { act = JSON.parse(fila.datos); } catch { return Promise.resolve(); }
  return escribir(() => {
    estado.papelera.splice(indice, 1);
    estado.actividades.push(act);
    return act;
  }, ["Actividades", "Completadas", "Excepciones", "Papelera"]);
}

/* ---------- configuración y categorías ----------------------------------- */

export function guardarConfig(cambios) {
  Object.assign(estado.config, cambios);
  avisar("config");
  guardarCache();
  cola = cola.then(async () => {
    const filas = Object.entries(estado.config).map(([clave, valor]) => ({
      clave, valor: String(valor), nota: NOTAS[clave] || "",
    }));
    await sheets.guardarHoja(estado.id, "Config", filas);
  });
  return cola;
}

export function guardarCategorias(lista) {
  estado.categorias = lista.map((c, i) => ({ ...c, orden: i + 1 }));
  avisar("datos");
  guardarCache();
  cola = cola.then(() => sheets.guardarHoja(estado.id, "Categorias", estado.categorias));
  return cola;
}

/* ---------- la configuración, con la forma que esperan las vistas -------- */

/* En la hoja Config todo es plano (clave, valor) porque así se edita a mano
   sin pelear. Las vistas, en cambio, vienen de la versión con servidor y
   esperan un objeto anidado. Esta función traduce de uno al otro, y es el
   único lugar donde conviven las dos formas. */
export function configVista() {
  const c = estado.config;
  const n = (k, d) => { const v = Number(c[k]); return Number.isFinite(v) ? v : d; };
  return {
    titulo: "Calendario",
    categorias: estado.categorias,
    pantalla: {
      tema: c.tema || "nitido",
      texto_tv: Math.max(8, Math.min(40, n("texto_tv", 15))),   // píxeles
      lineas_titulo: n("lineas_titulo", 1),
      tareas_por_dia: Math.max(1, Math.min(4, n("tareas_por_dia", 2))),
      solo_altas: esVerdad(c.solo_altas),
      hoy_siguientes: esVerdad(c.hoy_siguientes),
      semana_empieza_lunes: esVerdad(c.semana_empieza_lunes),
      atenuar: esVerdad(c.atenuar),
      atenuar_desde: c.atenuar_desde || "22:00",
      atenuar_hasta: c.atenuar_hasta || "06:00",
      antiquemado: esVerdad(c.antiquemado),
    },
    agenda: { inicio: n("agenda_inicio", 0), fin: n("agenda_fin", 23) },
    clima: {
      activo: esVerdad(c.clima_activo),
      unidad: (c.clima_unidad || "C").toUpperCase() === "F" ? "F" : "C",
      umbral_lluvia: n("clima_umbral_lluvia", 45),
    },
    lugar: {
      nombre: c.clima_lugar || "",
      lat: n("clima_lat", -13.5319),
      lon: n("clima_lon", -71.9675),
      zona: c.clima_zona || "auto",
    },
    reglas: { bloquear_pasado: esVerdad(c.bloquear_pasado), margen_minutos: 5 },
    limpieza: { activa: esVerdad(c.archivar_al_terminar), dias_gracia: n("dias_gracia", 1) },
  };
}

/** El camino inverso: de lo que toca la interfaz a claves planas. */
export function guardarVista(parcial) {
  const plano = {};
  const p = parcial.pantalla || {};
  const cl = parcial.clima || {};
  const lu = parcial.lugar || {};
  const re = parcial.reglas || {};
  const li = parcial.limpieza || {};
  const poner = (k, v) => { if (v !== undefined) plano[k] = typeof v === "boolean" ? (v ? "VERDADERO" : "FALSO") : v; };

  poner("tema", p.tema); poner("texto_tv", p.texto_tv);
  poner("lineas_titulo", p.lineas_titulo); poner("tareas_por_dia", p.tareas_por_dia);
  poner("solo_altas", p.solo_altas); poner("hoy_siguientes", p.hoy_siguientes);
  poner("semana_empieza_lunes", p.semana_empieza_lunes);
  poner("atenuar", p.atenuar); poner("atenuar_desde", p.atenuar_desde);
  poner("atenuar_hasta", p.atenuar_hasta); poner("antiquemado", p.antiquemado);
  if (parcial.agenda) { poner("agenda_inicio", parcial.agenda.inicio); poner("agenda_fin", parcial.agenda.fin); }
  poner("clima_activo", cl.activo); poner("clima_unidad", cl.unidad);
  poner("clima_umbral_lluvia", cl.umbral_lluvia);
  poner("clima_lugar", lu.nombre); poner("clima_lat", lu.lat);
  poner("clima_lon", lu.lon); poner("clima_zona", lu.zona);
  poner("bloquear_pasado", re.bloquear_pasado);
  poner("archivar_al_terminar", li.activa); poner("dias_gracia", li.dias_gracia);
  return guardarConfig(plano);
}

/* ---------- consultas ----------------------------------------------------- */

export const expandir = (desde, hasta, archivadas = false) =>
  M.expandir(estado.actividades, desde, hasta, archivadas);

/** Las que ya pasaron de hora y nadie cerró. dias = 0 -> solo hoy. */
export function pendientes(dias = 0) {
  const hoy = M.hoyIso();
  const desde = M.sumarDias(hoy, -Math.max(0, Math.min(180, dias)));
  return expandir(desde, hoy).filter((e) => e.vencida);
}

/* ---------- mantenimiento ------------------------------------------------- */

/* Esto lo hacía un hilo del servidor. Ahora lo corre Gestión al abrirse: es
   el único momento en que hace falta, y la TV no tiene por qué escribir. */

/** Archiva lo que ya se hizo y quedó atrás, para que no se acumule.
    Lo que quedó SIN cerrar no se toca nunca. */
export function pasarRevista() {
  if (!esVerdad(estado.config.archivar_al_terminar)) return Promise.resolve(0);
  const gracia = Math.max(0, Number(estado.config.dias_gracia) || 0);
  const limite = M.sumarDias(M.hoyIso(), -gracia);
  let tocadas = 0;

  for (const a of estado.actividades) {
    if ((a.repetir || {}).tipo !== "ninguna") continue;      // las series no se archivan
    if (a.archivada || a.fecha >= limite) continue;
    if ((a.completadas || []).includes(a.fecha)) { a.archivada = true; tocadas++; }
  }
  if (!tocadas) return Promise.resolve(0);
  return escribir(() => tocadas).then(() => tocadas);
}

/* ---------- duplicados ---------------------------------------------------- */

const huella = (a) => [
  (a.titulo || "").trim().toLowerCase(), a.fecha, a.inicio, a.fin,
  !!a.todoElDia, a.categoria, (a.repetir || {}).tipo,
  ((a.repetir || {}).dias || []).join("-"), (a.repetir || {}).hasta,
].join("|");

/** Grupos de actividades idénticas. Devuelve [{titulo, fecha, inicio, copias, sobrantes[]}] */
export function duplicados() {
  const por = new Map();
  for (const a of estado.actividades) {
    if (a.archivada) continue;
    if (!por.has(huella(a))) por.set(huella(a), []);
    por.get(huella(a)).push(a);
  }
  const grupos = [];
  for (const iguales of por.values()) {
    if (iguales.length < 2) continue;
    // se queda la que ya tiene historial, y entre esas la más antigua
    iguales.sort((x, y) => (y.completadas?.length || 0) - (x.completadas?.length || 0)
                        || String(x.creada).localeCompare(String(y.creada)));
    grupos.push({
      titulo: iguales[0].titulo, fecha: iguales[0].fecha, inicio: iguales[0].inicio,
      copias: iguales.length, sobrantes: iguales.slice(1).map((a) => a.id),
    });
  }
  grupos.sort((a, b) => a.fecha.localeCompare(b.fecha) || String(a.inicio).localeCompare(String(b.inicio)));
  return grupos;
}

export function limpiarDuplicados() {
  const fuera = new Set(duplicados().flatMap((g) => g.sobrantes));
  if (!fuera.size) return Promise.resolve(0);
  return escribir(() => {
    const ahora = new Date().toISOString();
    for (const a of estado.actividades) {
      if (fuera.has(a.id)) {
        estado.papelera.unshift({ id: a.id, titulo: a.titulo, fecha: a.fecha,
          inicio: a.inicio || "", datos: JSON.stringify(a), borrada: ahora });
      }
    }
    estado.papelera = estado.papelera.slice(0, 50);
    estado.actividades = estado.actividades.filter((a) => !fuera.has(a.id));
    return fuera.size;
  }, ["Actividades", "Completadas", "Excepciones", "Papelera"]).then(() => fuera.size);
}

export const esVerdad = (v) =>
  ["true", "verdadero", "sí", "si", "1", "x"].includes(String(v ?? "").trim().toLowerCase());

export const categoriaPorId = (id) =>
  estado.categorias.find((c) => c.id === id) || { id, nombre: "Sin categoría", color: "#888888" };
