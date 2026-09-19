/* Un Google Sheets de mentira, suficiente para probar la app de verdad.

   Implementa los seis endpoints que usa sheets.js sobre una cuadrícula en
   memoria, y sirve además los archivos estáticos. No es parte de la
   aplicación: vive en prueba/ y no se sube a ningún lado.                   */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = Number(process.argv[2] || 8123);

const libros = new Map();        // id -> { titulo, hojas: Map(nombre -> celdas) }
let siguiente = 1;

const TIPOS = { ".html": "text/html", ".js": "application/javascript",
                ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

/* ---------- rangos -------------------------------------------------------- */

function partirRango(rango) {
  const i = rango.indexOf("!");
  const hoja = i < 0 ? null : rango.slice(0, i).replace(/^'|'$/g, "");
  const celdas = i < 0 ? rango : rango.slice(i + 1);
  const m = /^([A-Z]+)(\d+)?:([A-Z]+)(\d+)?$/.exec(celdas);
  if (!m) return { hoja, c1: 0, f1: 0, c2: 25, f2: null };
  return {
    hoja,
    c1: num(m[1]), f1: m[2] ? Number(m[2]) - 1 : 0,
    c2: num(m[3]), f2: m[4] ? Number(m[4]) - 1 : null,
  };
}
const num = (letras) => [...letras].reduce((a, c) => a * 26 + (c.charCodeAt(0) - 64), 0) - 1;

/* ---------- operaciones --------------------------------------------------- */

function libro(id) {
  const l = libros.get(id);
  if (!l) { const e = new Error("Requested entity was not found."); e.codigo = 404; throw e; }
  return l;
}

function escribir(l, rango, valores) {
  const { hoja, c1, f1 } = partirRango(rango);
  const celdas = l.hojas.get(hoja);
  if (!celdas) { const e = new Error(`Unable to parse range: ${rango}`); e.codigo = 400; throw e; }
  valores.forEach((fila, i) => {
    const f = f1 + i;
    while (celdas.length <= f) celdas.push([]);
    fila.forEach((v, j) => { celdas[f][c1 + j] = v; });
  });
}

function limpiar(l, rango) {
  const { hoja, c1, f1, c2, f2 } = partirRango(rango);
  const celdas = l.hojas.get(hoja);
  if (!celdas) return;
  const hasta = f2 === null ? celdas.length - 1 : f2;
  for (let f = f1; f <= hasta && f < celdas.length; f++) {
    for (let c = c1; c <= c2; c++) if (celdas[f]) celdas[f][c] = "";
  }
}

function leer(l, rango) {
  const { hoja, c1, f1, c2, f2 } = partirRango(rango);
  const celdas = l.hojas.get(hoja) || [];
  const hasta = f2 === null ? celdas.length - 1 : Math.min(f2, celdas.length - 1);
  const salida = [];
  for (let f = f1; f <= hasta; f++) {
    const fila = [];
    for (let c = c1; c <= c2; c++) fila.push(celdas[f]?.[c] ?? "");
    salida.push(fila);
  }
  while (salida.length && salida.at(-1).every((v) => v === "")) salida.pop();
  return salida;
}

/* ---------- servidor ------------------------------------------------------ */

const servidor = http.createServer(async (pet, res) => {
  const url = new URL(pet.url, `http://localhost:${PUERTO}`);
  const responder = (codigo, obj) => {
    res.writeHead(codigo, { "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "*",
                            "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS" });
    res.end(JSON.stringify(obj));
  };

  if (pet.method === "OPTIONS") return responder(204, {});

  if (url.pathname.startsWith("/drive/v3/files")) {      // buscarExistente
    return responder(200, { files: [...libros.entries()].map(([id, l]) => ({
      id, name: l.titulo, modifiedTime: new Date().toISOString() })) });
  }

  if (url.pathname.startsWith("/v4/spreadsheets")) {
    let cuerpo = {};
    if (pet.method !== "GET") {
      const trozos = [];
      for await (const t of pet) trozos.push(t);
      try { cuerpo = JSON.parse(Buffer.concat(trozos).toString() || "{}"); } catch {}
    }
    try {
      return responder(200, await manejar(pet.method, url, cuerpo));
    } catch (e) {
      return responder(e.codigo || 500, { error: { message: e.message, code: e.codigo || 500 } });
    }
  }

  // archivos estáticos
  let p = url.pathname === "/" ? "/prueba/tv.html" : url.pathname;
  const archivo = path.join(RAIZ, p);
  if (!archivo.startsWith(RAIZ) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
    res.writeHead(404); return res.end("no está");
  }
  let cuerpo = fs.readFileSync(archivo);

  // Con ?prueba=1 inyectamos el desvío hacia el simulador y el auth de
  // mentira. Así las páginas reales se prueban sin tocarles una línea.
  if (path.extname(archivo) === ".html" && url.searchParams.get("prueba") === "1") {
    // La clave del import map es la URL ya resuelta, así que depende de en qué
    // carpeta esté la página. Se calcula sola para poder probar la app tanto en
    // la raíz como dentro de una subcarpeta.
    const dir = url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1);
    const mapa = { [`${dir}js/auth.js`]: "/prueba/auth-falso.js",
                   "/js/auth.js": "/prueba/auth-falso.js" };
    cuerpo = cuerpo.toString().replace("<head>", `<head>
<script>
  (() => { const real = window.fetch, o = location.origin;
    window.fetch = (e, op) => real((typeof e === "string" ? e : e.url)
      .replace("https://sheets.googleapis.com", o)
      .replace("https://www.googleapis.com", o), op); })();
</script>
<script type="importmap">${JSON.stringify({ imports: mapa })}</script>`);
  }

  res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] || "text/plain" });
  res.end(cuerpo);
});

async function manejar(metodo, url, cuerpo) {
  const resto = url.pathname.replace("/v4/spreadsheets", "");

  if (metodo === "POST" && resto === "") {                       // create
    const id = `hoja-${siguiente++}`;
    const hojas = new Map();
    for (const h of cuerpo.sheets || []) hojas.set(h.properties.title, []);
    libros.set(id, { titulo: cuerpo.properties?.title, hojas, formato: [] });
    return { spreadsheetId: id, spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit` };
  }

  const m = /^\/([^/:]+)(.*)$/.exec(resto);
  if (!m) { const e = new Error("ruta rara"); e.codigo = 400; throw e; }
  const l = libro(m[1]);
  const cola = m[2];

  if (cola === ":batchUpdate") {                                  // formato
    l.formato.push(...(cuerpo.requests || []));
    return { spreadsheetId: m[1], replies: (cuerpo.requests || []).map(() => ({})) };
  }

  if (cola === "/values:batchUpdate") {
    for (const d of cuerpo.data || []) escribir(l, d.range, d.values);
    return { totalUpdatedSheets: (cuerpo.data || []).length };
  }

  if (cola === "/values:batchClear") {
    for (const r of cuerpo.ranges || []) limpiar(l, r);
    return { clearedRanges: cuerpo.ranges };
  }

  if (cola === "/values:batchGet") {
    const rangos = url.searchParams.getAll("ranges");
    return { valueRanges: rangos.map((r) => ({ range: r, values: leer(l, r) })) };
  }

  const mv = /^\/values\/([^:]+)(:clear)?$/.exec(cola);
  if (mv) {
    const rango = decodeURIComponent(mv[1]);
    if (mv[2]) { limpiar(l, rango); return { clearedRange: rango }; }
    escribir(l, rango, cuerpo.values || []);
    return { updatedRange: rango, updatedRows: (cuerpo.values || []).length };
  }

  const e = new Error(`sin implementar: ${metodo} ${resto}`); e.codigo = 400; throw e;
}

servidor.listen(PUERTO, "127.0.0.1", () => {
  console.log(`Sheets de mentira en http://127.0.0.1:${PUERTO}`);
});
