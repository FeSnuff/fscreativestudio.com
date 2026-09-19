/* Cliente de la API de Google Sheets.

   Todo lo que toca la red vive aquí. Tres ideas que guían el diseño:

   1. Leer todo de una sola vez. values.batchGet trae las seis pestañas en una
      petición, así que una sincronización completa cuesta lo mismo que leer
      una sola. Con eso la TV puede refrescar cada 45 segundos sin acercarse
      a las cuotas (60 lecturas por minuto y usuario).

   2. Escribir una pestaña entera en vez de filas sueltas. Suena derrochador,
      pero evita el problema real: si dos pantallas escriben a la vez por
      número de fila, una pisa a la otra en la fila equivocada y el resultado
      queda mezclado. Reescribir la pestaña completa hace que el peor caso sea
      "gana el último", que se entiende y no corrompe nada. Con cientos de
      actividades son unos pocos miles de celdas: una sola petición.

   3. Un reintento y nada más. Si el token venció se renueva y se repite; si
      Google pide calma (429) se espera y se repite. Más allá de eso, el error
      sube a la interfaz en lugar de quedarse dando vueltas.                 */

import * as auth from "./auth.js";
import * as E from "./esquema.js";
import { cuerpoCrear, peticionesFormato, valoresIniciales } from "./construir.js";

const BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE = "https://www.googleapis.com/drive/v3/files";

/* ---------- transporte --------------------------------------------------- */

async function pedir(url, opciones = {}, reintento = true) {
  const t = await auth.vigente();
  const r = await fetch(url, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : opciones.body,
  });

  if (r.ok) return r.status === 204 ? {} : r.json();

  const texto = await r.text();
  let detalle = texto;
  try { detalle = JSON.parse(texto)?.error?.message || texto; } catch {}

  if ((r.status === 401 || r.status === 403) && reintento && /credential|token|auth/i.test(detalle)) {
    // El token guardado puede estar revocado aunque no haya caducado: se tira
    // y se pide uno nuevo, en vez de reintentar con el mismo.
    auth.invalidar();
    return pedir(url, opciones, false);
  }
  if (r.status === 429 && reintento) {
    await esperar(2500);
    return pedir(url, opciones, false);
  }
  throw new ErrorSheets(detalle, r.status);
}

export class ErrorSheets extends Error {
  constructor(mensaje, codigo) {
    super(traducir(mensaje, codigo));
    this.codigo = codigo;
    this.crudo = mensaje;
  }
}

function traducir(mensaje, codigo) {
  if (codigo === 404) return "No encuentro la hoja de cálculo. ¿La borraste de tu Drive?";
  if (codigo === 403 && /quota|rate/i.test(mensaje))
    return "Google pidió esperar un momento: demasiadas consultas seguidas.";
  if (codigo === 403) return "Google no me deja tocar esa hoja. Vuelve a entrar y acepta el permiso.";
  if (codigo === 429) return "Demasiadas consultas seguidas. Se reintenta solo en unos segundos.";
  if (codigo >= 500) return "Google está teniendo problemas. Se reintenta solo.";
  return mensaje;
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** "Actividades!A1:P24" — un rango con el alto exacto que vamos a escribir. */
const bloque = (nombre, alto) =>
  `${nombre}!A1:${E.letraColumna(E.anchoDe(nombre) - 1)}${Math.max(1, alto)}`;

/* ---------- crear la hoja la primera vez -------------------------------- */

export async function crear(titulo = "Calendario de pared") {
  const hoja = await pedir(BASE, { method: "POST", cuerpo: cuerpoCrear(titulo) });
  const id = hoja.spreadsheetId;

  await pedir(`${BASE}/${id}:batchUpdate`, {
    method: "POST",
    cuerpo: { requests: peticionesFormato() },
  });

  // Los encabezados de todas las pestañas, más las filas iniciales de
  // Categorías y Config, en una sola escritura.
  const iniciales = valoresIniciales();                 // { hoja: [filas...] }
  const data = E.NOMBRES_HOJAS.map((n) => {
    const filas = [E.encabezados(n), ...(iniciales[n] || [])];
    return { range: bloque(n, filas.length), values: filas };
  });

  await pedir(`${BASE}/${id}/values:batchUpdate`, {
    method: "POST",
    cuerpo: { valueInputOption: "RAW", data },
  });

  return { id, url: hoja.spreadsheetUrl };
}

/** Busca una hoja creada antes por esta misma app. drive.file solo deja ver
    lo que la app creó, así que esta búsqueda nunca toca el resto del Drive. */
export async function buscarExistente() {
  const q = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const r = await pedir(
    `${DRIVE}?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=10`);
  return r.files || [];
}

export async function urlDe(id) {
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}

/* ---------- leer --------------------------------------------------------- */

/** Las seis pestañas en una sola petición. */
export async function leerTodo(id) {
  const rangos = E.NOMBRES_HOJAS.map((n) => `ranges=${encodeURIComponent(E.rangoDe(n))}`).join("&");
  const r = await pedir(
    `${BASE}/${id}/values:batchGet?${rangos}&valueRenderOption=UNFORMATTED_VALUE&majorDimension=ROWS`);

  const salida = {};
  (r.valueRanges || []).forEach((vr, i) => {
    const nombre = E.NOMBRES_HOJAS[i];
    salida[nombre] = E.filasAObjetos(nombre, vr.values || []);
  });
  return salida;
}

/* ---------- escribir ----------------------------------------------------- */

/** Reemplaza una pestaña entera. Limpia lo que sobra para que no queden
    restos de cuando había más filas. */
export async function guardarHoja(id, nombre, objetos) {
  const filas = objetos.map((o) => E.objetoAFila(nombre, o));
  const cuerpo = [E.encabezados(nombre), ...filas];

  await pedir(`${BASE}/${id}/values/${encodeURIComponent(E.rangoDe(nombre))}:clear`,
              { method: "POST", cuerpo: {} });

  const rango = bloque(nombre, cuerpo.length);
  await pedir(`${BASE}/${id}/values/${encodeURIComponent(rango)}?valueInputOption=RAW`,
              { method: "PUT", cuerpo: { values: cuerpo } });
}

/** Varias pestañas a la vez, en una sola petición de escritura. */
export async function guardarVarias(id, mapa) {
  const nombres = Object.keys(mapa);
  if (!nombres.length) return;

  await pedir(`${BASE}/${id}/values:batchClear`, {
    method: "POST",
    cuerpo: { ranges: nombres.map((n) => E.rangoDe(n)) },
  });

  const data = nombres.map((n) => {
    const cuerpo = [E.encabezados(n), ...mapa[n].map((o) => E.objetoAFila(n, o))];
    return { range: bloque(n, cuerpo.length), values: cuerpo };
  });

  await pedir(`${BASE}/${id}/values:batchUpdate`, {
    method: "POST",
    cuerpo: { valueInputOption: "RAW", data },
  });
}
