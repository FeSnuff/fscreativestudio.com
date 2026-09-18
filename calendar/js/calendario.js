/* Modo Calendario — pantalla de solo lectura para la TV.
   Se actualiza sola: relee la hoja cada pocos segundos y el reloj corre en
   tiempo real. No hay nada que tocar aquí.

   Esta pantalla NUNCA escribe: solo lee. Así dos TVs encendidas no pueden
   pisarse entre ellas ni con el celular.                                  */

import * as U from "/js/comun.js";
import * as datos from "/js/datos.js";
import * as clima from "/js/clima.js";

const $ = (id) => document.getElementById(id);

const estado = {
  config: null,
  categorias: [],
  ocurrencias: [],
  clima: {},
  dia: U.hoyIso(),
  mes: null,          // primer día del mes visible
  pendientes: 0,      // vencidas sin cerrar de las últimas dos semanas
  INI: 6, FIN: 21,
};

/* ---------- tamaño del texto (Ctrl + rueda) ----------------------------- */

const TXT_MIN = 9, TXT_MAX = 30;

/* El punto de partida sale de Ajustes; si no está, se calcula por el alto de
   pantalla. Ctrl + rueda en esta TV manda por encima hasta pulsar Ctrl 0.  */
const txtPorDefecto = () => estado.config?.pantalla?.texto_tv ||
  Math.round(Math.min(22, Math.max(10.5, innerHeight * 0.0148)) * 2) / 2;

const txtGuardado = () => {
  try {
    const g = parseFloat(localStorage.getItem("calTxt"));
    return g >= TXT_MIN && g <= TXT_MAX ? g : null;
  } catch { return null; }
};

let TXT = txtGuardado() || txtPorDefecto();

let temporizadorBadge;
function aplicarTexto(avisar) {
  const raiz = document.documentElement.style;
  raiz.setProperty("--txt", TXT + "px");
  raiz.setProperty("--gut", `calc(${TXT}px * 2.7)`);
  pintarMes();
  pintarDia();
  tic();
  if (!avisar) return;
  try { localStorage.setItem("calTxt", TXT); } catch {}
  const b = $("badge");
  b.textContent = "Texto " + Math.round((TXT / txtPorDefecto()) * 100) + "%";
  b.classList.add("ver");
  clearTimeout(temporizadorBadge);
  temporizadorBadge = setTimeout(() => b.classList.remove("ver"), 1100);
}
const ajustarTexto = (paso) => {
  TXT = Math.min(TXT_MAX, Math.max(TXT_MIN, Math.round((TXT + paso) * 2) / 2));
  aplicarTexto(true);
};

addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  ajustarTexto(e.deltaY < 0 ? 0.5 : -0.5);
}, { passive: false });

addEventListener("keydown", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key === "+" || e.key === "=") { e.preventDefault(); ajustarTexto(0.5); }
  else if (e.key === "-" || e.key === "_") { e.preventDefault(); ajustarTexto(-0.5); }
  else if (e.key === "0") { e.preventDefault(); TXT = txtPorDefecto(); aplicarTexto(true); }
});

/* ---------- cuánto cabe en pantalla ------------------------------------- */

/** Cuántas tareas caben de verdad en la casilla de un día. Manda lo que
    pediste en Ajustes, pero nunca más de las que entran sin desbordar. */
function capacidad(semanas = 5) {
  const p = estado.config?.pantalla || {};
  const lineas = p.lineas_titulo === 1 ? 1 : 2;
  const alto = TXT * (lineas === 1 ? 1.55 : 2.3);   // alto de una tarjeta
  const celda = (innerHeight * 0.78) / semanas;
  const caben = Math.floor((celda - TXT * 1.9) / alto);
  const pedidas = Math.max(1, Math.min(4, Number(p.tareas_por_dia) || 2));
  return { chips: Math.max(1, Math.min(pedidas, caben)) };
}

/* ---------- carga de datos ---------------------------------------------- */

function rangoDelMes(base) {
  const lunes = estado.config?.pantalla?.semana_empieza_lunes !== false;
  const primero = new Date(base.getFullYear(), base.getMonth(), 1);
  const desplazo = lunes ? (primero.getDay() + 6) % 7 : primero.getDay();
  const inicio = new Date(primero);
  inicio.setDate(1 - desplazo);
  const diasMes = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const semanas = Math.ceil((desplazo + diasMes) / 7);   // 4, 5 o 6 según el mes
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + semanas * 7 - 1);
  return { inicio, fin, desplazo, lunes, semanas };
}

async function cargarTodo() {
  const config = datos.configVista();
  estado.config = config;
  estado.categorias = config.categorias || [];
  estado.INI = Number(config.agenda?.inicio ?? 6);
  estado.FIN = Number(config.agenda?.fin ?? 21);
  // El estilo va antes que las categorías: los tintes se mezclan contra el
  // fondo del tema, así que el orden importa.
  U.aplicarTema(config.pantalla?.tema);
  U.aplicarCategorias(estado.categorias);
  document.documentElement.style.setProperty(
    "--lineas-titulo", config.pantalla?.lineas_titulo === 1 ? "1" : "2");
  document.title = config.titulo || "Calendario";
  await Promise.all([cargarActividades(), cargarClima()]);
}

async function cargarActividades() {
  estado.dia = U.hoyIso();
  estado.mes = U.deIso(estado.dia);
  const { inicio, fin } = rangoDelMes(estado.mes);
  estado.ocurrencias = datos.expandir(U.iso(inicio), U.iso(fin));
  const pend = datos.pendientes(0);          // solo las de hoy
  estado.pendientes = pend.length;
  estado.listaPendientes = pend;
}

/* El pronóstico se pide directo a Open-Meteo. Entre consultas se reusa lo
   guardado, así que cambiar de pestaña o repintar no gasta una petición. */
let climaPedido = 0;

async function cargarClima(forzar = false) {
  const c = estado.config?.clima || {};
  if (!c.activo) { estado.clima = {}; return; }
  if (!forzar && Date.now() - climaPedido < 10 * 60000 && estado.clima?.actual) return;
  climaPedido = Date.now();
  try {
    estado.clima = await clima.traer({
      ...estado.config.lugar,
      umbral: c.umbral_lluvia,
    }) || {};
  } catch { estado.clima = clima.recordado() || {}; }
}

/* ---------- cabecera ----------------------------------------------------- */

function pintarCabecera() {
  const d = U.deIso(estado.dia);
  const semana = Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
  const lugar = estado.config?.lugar?.nombre || "";
  $("eyebrow").textContent = [lugar, `Semana ${semana}`].filter(Boolean).join(" · ");
  $("mes").innerHTML = `${U.MESES[d.getMonth()]} <span>${d.getFullYear()}</span>`;
  $("tituloDia").textContent = `${U.DIAS[(d.getDay() + 6) % 7]} ${d.getDate()}`;

  pintarClimaActual();
}

/** La temperatura de ESTA hora, la misma que sale en la franja, para que las
    dos cifras nunca se contradigan. Se refresca con el reloj. */
function pintarClimaActual() {
  const a = estado.clima.actual;
  if (!a) {
    $("wx").innerHTML = `<span style="color:var(--ink-3);font-size:.8rem">Clima no disponible</span>`;
    return;
  }
  const uni = estado.config?.clima?.unidad || "C";
  const deAhora = (estado.clima.horas || []).find((x) => x.h === new Date().getHours());
  const grados = deAhora?.temp ?? a.temp;

  $("wx").innerHTML =
    U.iconoClima(deAhora?.cond || a.cond, "ico") +
    `<b>${U.temp(grados, uni)}°</b> ${U.escapar(deAhora?.texto || a.texto || "")}` +
    (a.min != null ? ` <u>${U.temp(a.min, uni)}° / ${U.temp(a.max, uni)}°</u>` : "");
}

/* Franja del clima hora por hora. Igual que la línea del día: la hora actual
   queda en el centro y la tira avanza sola. */
function pintarTiraClima() {
  const horas = estado.clima.horas || [];
  const caja = $("tiraClima");
  if (!horas.length) return (caja.innerHTML = "");

  const uni = estado.config?.clima?.unidad || "C";
  caja.innerHTML = `<div class="clima-caja">
      <div class="clima-tira saltar" id="climaTira">${horas.map((h) => `
        <div class="h ${h.prob >= 50 ? "moja" : ""} ${h.dia === 1 ? "manana" : ""}"
             data-p="${(h.dia || 0) * 24 + h.h}">
          <u>${String(h.h).padStart(2, "0")}h</u>
          ${U.iconoClima(h.cond)}
          <b>${U.temp(h.temp, uni)}°</b>
          <span class="barra"><i style="width:${Math.min(100, h.prob)}%"></i></span>
        </div>`).join("")}</div>
    </div>`;
  moverClima(true);
}

function moverClima(instantaneo = false) {
  const tira = $("climaTira");
  if (!tira || !tira.firstElementChild) return;
  const caja = tira.parentElement;
  const ancho = tira.firstElementChild.offsetWidth || 1;
  const primera = Number(tira.firstElementChild.dataset.p || 0);

  const ahora = new Date();
  const pos = ahora.getHours() + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;

  // La tira es una línea de tiempo continua: la hora 15:40 cae al 67 % de la
  // celda de las 15h, y la marca la va cruzando conforme pasa la hora.
  tira.classList.toggle("saltar", instantaneo);
  tira.style.transform = `translateX(${caja.clientWidth / 2 - (pos - primera) * ancho}px)`;
  if (instantaneo) requestAnimationFrame(() => tira.classList.remove("saltar"));

  const actual = ahora.getHours();
  for (const n of tira.children) {
    const p = Number(n.dataset.p);
    n.classList.toggle("ahora", p === actual);
    n.classList.toggle("pasada", p < actual);
  }
}

/* ---------- rejilla del mes ---------------------------------------------- */

/** Qué actividades se ven en la casilla de un día.
    En un día cualquiera son las primeras; en el de hoy, las que todavía
    vienen — cuando ya no queda ninguna, las últimas del día. */
function elegirDelDia(evs, esHoy, tope) {
  const p = estado.config?.pantalla || {};
  let candidatas = p.solo_altas ? evs.filter((e) => e.prioridad === "alta") : evs.slice();

  if (esHoy && p.hoy_siguientes !== false) {
    const ahora = new Date();
    const h = ahora.getHours() + ahora.getMinutes() / 60;
    const porVenir = candidatas.filter((e) => e.todoElDia || U.decimal(e.fin) > h);
    if (porVenir.length) candidatas = porVenir;
    else candidatas = candidatas.slice(-tope);
  }

  const visibles = candidatas.slice(0, tope);
  const ocultas = evs.filter((e) => !visibles.includes(e));
  return { visibles, ocultas };
}

function pintarMes() {
  if (!estado.mes) return;
  const { inicio, lunes, semanas } = rangoDelMes(estado.mes);
  const max = capacidad(semanas).chips;
  const mesActual = estado.mes.getMonth();
  const pron = estado.clima.pron || {};

  const dias = lunes ? U.DIAS_CORTOS : [...U.DIAS_CORTOS.slice(6), ...U.DIAS_CORTOS.slice(0, 6)];
  $("dow").innerHTML = dias
    .map((d, i) => `<div class="${(lunes ? i >= 5 : i === 0 || i === 6) ? "fin" : ""}">${d}</div>`)
    .join("");

  // Agrupamos una sola vez por fecha en lugar de filtrar 42 veces.
  const porFecha = new Map();
  for (const o of estado.ocurrencias) {
    if (!porFecha.has(o.fecha)) porFecha.set(o.fecha, []);
    porFecha.get(o.fecha).push(o);
  }

  let html = "";
  for (let i = 0; i < semanas * 7; i++) {
    const f = new Date(inicio);
    f.setDate(inicio.getDate() + i);
    const clave = U.iso(f);
    const dentro = f.getMonth() === mesActual;
    const finde = lunes ? i % 7 >= 5 : i % 7 === 0 || i % 7 === 6;
    const clases = ["cell", dentro ? "" : "off", finde ? "fin" : "",
                    clave === estado.dia ? "today" : ""].join(" ");

    const evs = porFecha.get(clave) || [];
    const { visibles, ocultas } = elegirDelDia(evs, clave === estado.dia, max);
    // un día que dejó algo sin hacer lleva su marca, se vea o no la tarea
    const olvidos = evs.filter((e) => e.vencida).length;
    const marca = dentro && olvidos
      ? `<span class="olvido" title="${olvidos} sin cerrar">${olvidos > 1 ? olvidos : ""}!</span>`
      : "";

    const chips = visibles.map((e) => {
      const c = U.colorDe(e.categoria), b1 = U.tinte1De(e.categoria);
      const marcas = [e.completada ? "hecha" : "", e.vencida ? "vencida" : ""].join(" ");
      return e.todoElDia
        ? `<div class="chip all ${marcas}" style="--c:${c}"><span>${U.escapar(e.titulo)}</span></div>`
        : `<div class="chip ${marcas}" style="--c:${c};--b1:${b1}"><time>${e.inicio}</time><span>${U.escapar(e.titulo)}</span></div>`;
    }).join("");

    const extra = ocultas.length ? `<span class="more">+${ocultas.length}</span>` : "";
    const dots = ocultas.length
      ? `<div class="dots">${ocultas.slice(0, 8).map((e) =>
          `<i class="${e.completada ? "hecha" : ""}" style="--c:${e.vencida ? "var(--pend)" : U.colorDe(e.categoria)}"></i>`).join("")}</div>`
      : "";
    const fc = dentro && pron[clave] ? U.iconoClima(pron[clave], "fc") : "";

    html += `<div class="${clases}">
        <div class="head"><div class="num">${f.getDate()}</div><div class="hr">${marca}${extra}${fc}</div></div>
        ${chips}${dots}
      </div>`;
  }
  $("weeks").innerHTML = html;
}

/* ---------- la línea del día ----------------------------------------------
   Tres días seguidos, hora por hora, con las horas vacías incluidas. El
   origen de coordenadas es ayer a las 00:00 y todo se coloca en múltiplos
   del alto de una hora.                                                    */

const HORAS = 72;                       // ayer + hoy + mañana
const alturaHora = () => TXT * 3.1;     // hace juego con --hora del CSS
const AHORA_ORIGEN = 24;                // hoy empieza en la hora 24 de la tira

const GOTA = `<svg class="gota" viewBox="0 0 24 24" fill="none"><path d="M12 3.2s5.5 6.3 5.5 10a5.5 5.5 0 1 1-11 0c0-3.7 5.5-10 5.5-10Z" fill="#DDE9FB" stroke="#1D6FE0" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

/** Reparte en columnas las actividades que se pisan en el tiempo, para que
    dos a la misma hora se vean las dos y no una encima de la otra. */
function repartirColumnas(lista) {
  const salida = [];
  let grupo = [], finGrupo = null;

  const cerrar = () => {
    const columnas = [];                 // hora en que se libera cada columna
    for (const e of grupo) {
      let c = columnas.findIndex((libre) => libre <= U.decimal(e.inicio) + 1e-9);
      if (c < 0) { c = columnas.length; columnas.push(0); }
      columnas[c] = U.decimal(e.fin);
      e._col = c;
    }
    for (const e of grupo) salida.push({ ev: e, col: e._col, total: columnas.length });
    grupo = [];
  };

  for (const e of lista) {
    if (grupo.length && U.decimal(e.inicio) >= finGrupo) { cerrar(); finGrupo = null; }
    grupo.push(e);
    finGrupo = finGrupo === null ? U.decimal(e.fin) : Math.max(finGrupo, U.decimal(e.fin));
  }
  if (grupo.length) cerrar();
  return salida;
}

function pintarLinea() {
  const linea = $("linea");
  if (!linea) return;
  const px = alturaHora();
  const av = estado.clima.aviso;
  const dias = [U.sumarDias(estado.dia, -1), estado.dia, U.sumarDias(estado.dia, 1)];
  let html = "";

  // ayer y mañana quedan marcados como zona que no toca
  html += `<div class="zona antes" style="top:0;height:${24 * px}px"><span>ayer</span></div>`;
  html += `<div class="zona despues" style="top:${48 * px}px;height:${24 * px}px"><span>mañana</span></div>`;

  if (av && av.fin > av.ini) {
    html += `<div class="lluvia" style="top:${(AHORA_ORIGEN + av.ini) * px}px;height:${(av.fin - av.ini) * px}px"></div>`;
  }

  for (let i = 0; i <= HORAS; i++) {
    const hora = i % 24;
    html += `<div class="hlinea ${hora === 0 ? "enpunto" : ""}" data-h="${i}" style="top:${i * px}px">
               <b>${String(hora).padStart(2, "0")}:00</b></div>`;
  }

  let citas = 0;
  dias.forEach((fecha, d) => {
    const delDia = estado.ocurrencias
      .filter((e) => e.fecha === fecha && !e.todoElDia)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));

    repartirColumnas(delDia)
      .forEach(({ ev: e, col, total }) => {
        const ini = d * 24 + U.decimal(e.inicio);
        const dur = U.decimal(e.fin) - U.decimal(e.inicio);
        const alto = dur * px;   // exactamente lo que dura, sin mínimos
        const moja = av && d === 1 && U.decimal(e.inicio) < av.fin && U.decimal(e.fin) > av.ini;
        // dos que se pisan se reparten el ancho en vez de taparse
        const reparto = total > 1
          ? `left:calc(var(--gut) + (100% - var(--gut)) * ${(col / total).toFixed(4)});
             right:calc((100% - var(--gut)) * ${(1 - (col + 1) / total).toFixed(4)});
             margin-right:${col < total - 1 ? 3 : 0}px;`
          : "";
        const clases = ["cita", e.prioridad,
                        d !== 1 ? "otrodia" : "",
                        e.completada ? "hecha" : "",
                        d === 1 && e.vencida ? "vencida" : ""].filter(Boolean).join(" ");
        citas++;
        html += `<div class="${clases}" data-clave="${d}|${e.id}|${e.inicio}"
            style="top:${ini * px}px;height:${alto}px;${reparto}
                   --c:${U.colorDe(e.categoria)};
                   --b1:${U.tinte1De(e.categoria)};--b2:${U.tinte2De(e.categoria)}">
            <div class="cab"><time>${e.inicio}</time><span class="tit">${U.escapar(e.titulo)}</span></div>
            ${alto > px * 1.15 && e.detalle ? `<small>${U.escapar(e.detalle)}</small>` : ""}
            ${moja ? GOTA : ""}
          </div>`;
      });
  });

  linea.innerHTML = html;
  linea.style.height = `${HORAS * px}px`;
  $("lineaCaja").querySelector(".linea-vacia")?.remove();
  if (!citas) {
    $("lineaCaja").insertAdjacentHTML("beforeend",
      `<div class="linea-vacia">Nada agendado para hoy</div>`);
  }
  moverLinea(true);
}

/** Coloca la tira para que la hora actual quede en el centro. El movimiento
    es continuo: cada pocos segundos se recalcula con una transición larga,
    así sube despacio en vez de dar saltos. */
function moverLinea(instantaneo = false) {
  const caja = $("lineaCaja"), linea = $("linea");
  if (!caja || !linea) return;

  const ahora = new Date();
  const h = AHORA_ORIGEN + ahora.getHours() + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
  const px = alturaHora();

  linea.classList.toggle("saltar", instantaneo);
  linea.style.transform = `translateY(${caja.clientHeight / 2 - h * px}px)`;
  if (instantaneo) requestAnimationFrame(() => linea.classList.remove("saltar"));

  // hora en curso resaltada
  const actual = AHORA_ORIGEN + ahora.getHours();
  linea.querySelectorAll(".hlinea.actual").forEach((n) => n.classList.remove("actual"));
  linea.querySelector(`.hlinea[data-h="${actual}"]`)?.classList.add("actual");

  // qué cita está pasando y cuál está por avisar
  const hd = ahora.getHours() + ahora.getMinutes() / 60;
  linea.querySelectorAll(".cita.ahora, .cita.avisando").forEach((n) =>
    n.classList.remove("ahora", "avisando"));

  for (const e of estado.ocurrencias) {
    if (e.fecha !== estado.dia || e.todoElDia || e.completada) continue;
    const nodo = linea.querySelector(`.cita[data-clave="1|${e.id}|${e.inicio}"]`);
    if (!nodo) continue;
    const ini = U.decimal(e.inicio), fin = U.decimal(e.fin);
    if (hd >= ini && hd < fin) nodo.classList.add("ahora");
    else if (e.recordatorio && ini > hd && (ini - hd) * 60 <= e.recordatorio) nodo.classList.add("avisando");
  }
}

function pintarDia() {
  const delDia = estado.ocurrencias.filter((e) => e.fecha === estado.dia);
  const av = estado.clima.aviso;

  // aviso de clima
  $("avisoBox").innerHTML = av
    ? `<div class="aviso">${U.iconoClima(av.cond, "ico")}
         <div><b>${U.aHora(av.ini * 60)} – ${U.aHora(av.fin * 60)} · ${U.escapar(av.titulo)}</b>
              <small>${U.escapar(av.consejo)}</small></div>
       </div>`
    : "";

  // lo que ya pasó de hora y sigue abierto
  const pend = estado.listaPendientes || [];
  $("cajaPendientes").innerHTML = pend.length
    ? `<div class="pendientes">
         <div class="tit">${pend.length === 1 ? "1 tarea sin cerrar" : `${pend.length} tareas sin cerrar`}</div>
         ${pend.slice(0, 2).map((p) => `<div class="fila">
             <em>${p.fecha === estado.dia ? (p.inicio || "") : U.fechaCorta(p.fecha)}</em>
             <span>${U.escapar(p.titulo)}</span></div>`).join("")}
         ${pend.length > 2 ? `<div class="fila mas">y ${pend.length - 2} más</div>` : ""}
       </div>`
    : "";

  pintarLinea();

  const altas = delDia.filter((e) => e.prioridad === "alta").length;
  const hechas = delDia.filter((e) => e.completada).length;
  const partes = [];
  if (delDia.length) partes.push(`${delDia.length} ${delDia.length === 1 ? "tarea" : "tareas"}`);
  if (altas) partes.push(`${altas} de alta`);
  if (hechas) partes.push(`${hechas} ${hechas === 1 ? "hecha" : "hechas"}`);
  if (estado.pendientes) partes.push(`<b style="color:var(--pend)">${estado.pendientes} sin cerrar</b>`);
  $("cuenta").innerHTML = partes.join(" · ") || "día libre";

  $("legend").innerHTML =
    estado.categorias.map((c) => `<div style="--c:${c.color}"><i></i>${U.escapar(c.nombre)}</div>`).join("") +
    `<div class="pt"><i></i>tareas normales</div>` +
    (estado.pendientes ? `<div style="--c:var(--pend)"><i></i>sin cerrar</div>` : "");

  pintarTiraClima();
}

/* ---------- reloj -------------------------------------------------------- */

function tic() {
  const ahora = new Date();
  $("reloj").textContent =
    `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
  moverLinea();
  moverClima();
  pintarClimaActual();
  atenuar(ahora);
}


/* ---------- cuidados de una TV encendida todo el día ---------------------- */

function atenuar(ahora) {
  const p = estado.config?.pantalla || {};
  if (!p.atenuar) return $("app").classList.remove("atenuado");
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  const d = U.aMinutos(p.atenuar_desde || "23:00");
  const h = U.aMinutos(p.atenuar_hasta || "06:00");
  const dentro = d <= h ? m >= d && m < h : m >= d || m < h;
  $("app").classList.toggle("atenuado", dentro);
}

function antiQuemado() {
  if (!estado.config?.pantalla?.antiquemado) return;
  const paso = (Math.floor(Date.now() / 600000) % 5) - 2;   // -2..2 px cada 10 min
  document.documentElement.style.setProperty("--dx", `${paso}px`);
  document.documentElement.style.setProperty("--dy", `${(paso % 3) - 1}px`);
}

/* ---------- pantalla completa --------------------------------------------- */

(() => {
  const raiz = document.documentElement;
  const activa = () => document.fullscreenElement || document.webkitFullscreenElement;
  const marcar = () => document.body.classList.toggle("fs", !!activa());

  $("btnFs").addEventListener("click", () => {
    if (activa()) return;
    const pedir = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
    if (pedir) Promise.resolve(pedir.call(raiz)).catch(() => {});
  });
  $("btnInicio").addEventListener("click", () => (location.href = "/inicio"));
  document.addEventListener("fullscreenchange", marcar);
  document.addEventListener("webkitfullscreenchange", marcar);
  marcar();
})();

/* ---------- arranque ------------------------------------------------------- */

const sinConexion = (mal) => $("sinConexion").classList.toggle("ver", mal);

async function refrescar(quePaso) {
  try {
    if (quePaso === "clima") await cargarClima();
    else if (quePaso === "config") {
      await cargarTodo();
      if (!txtGuardado()) { TXT = txtPorDefecto(); aplicarTexto(false); }
    } else await Promise.all([cargarActividades(), cargarClima()]);
    sinConexion(false);
    pintarCabecera(); pintarMes(); pintarDia(); tic();
  } catch (e) {
    sinConexion(true);
  }
}

/* La pantalla ya no arranca sola: primero hay que entrar con Google y abrir
   la hoja. De eso se encarga arranque.js, que llama aquí cuando todo está
   listo. */
export async function arrancar() {
  try {
    await cargarTodo();
    if (!txtGuardado()) TXT = txtPorDefecto();   // ya tenemos el valor de Ajustes
    aplicarTexto(false);
    pintarCabecera(); pintarMes(); pintarDia(); tic();
    antiQuemado();
    sinConexion(false);
  } catch (e) {
    sinConexion(true);
  }

  // Sin servidor no hay quien empuje avisos: datos.js relee la hoja cada
  // pocos segundos y nos llama cuando algo cambió.
  datos.escuchar((que) => {
    if (que === "datos" || que === "cache") refrescar();
    else if (que === "config") refrescar("config");
    else if (que === "error") sinConexion(true);
  });

  arrancarRelojes();
}

function arrancarRelojes() {
setInterval(tic, 15000);
// La tira se recoloca cada 12 s con una transición de 12 s: el resultado es
// un desplazamiento continuo, sin saltos al cambiar de hora.
setInterval(() => { moverLinea(); moverClima(); }, 12000);
setInterval(antiQuemado, 600000);
setInterval(() => {                       // cambio de día a medianoche
  if (U.hoyIso() !== estado.dia) refrescar();
}, 30000);
setInterval(() => refrescar(), 15 * 60000);  // red de seguridad

setInterval(() => cargarClima(true).then(() => { pintarDia(); tic(); }), 10 * 60000);
}

let esperaTamano;
addEventListener("resize", () => {
  clearTimeout(esperaTamano);
  esperaTamano = setTimeout(() => aplicarTexto(false), 250);
});
