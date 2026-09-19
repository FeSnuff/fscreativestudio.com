/* Modo Gestión — agregar, editar y organizar actividades desde el celular. */

import * as U from "./comun.js";
import * as datos from "./datos.js";
import * as clima from "./clima.js";
import * as arranque from "./arranque.js";

const $ = (id) => document.getElementById(id);

const estado = {
  config: null,
  categorias: [],
  ocurrencias: [],
  vista: "agenda",
  ancla: U.hoyIso(),      // primer día de la ventana que se muestra
  dias: 14,
  filtro: { categoria: "todas", soloAlta: false, ocultarHechas: false },
  busqueda: "",
  pendientes: [],         // vencidas sin cerrar
  editando: null,         // ocurrencia en edición, o null si es nueva
};

const PRIORIDADES = [
  { id: "alta",  nombre: "Alta",  tono: "#E11D48", tinte: "#FEECEF" },
  { id: "media", nombre: "Media", tono: "#0891A5", tinte: "#DBF1F6" },
  { id: "baja",  nombre: "Baja",  tono: "#565961", tinte: "#F0EFEC" },
];

const REPETICIONES = [
  { id: "ninguna", nombre: "No se repite" },
  { id: "diaria",  nombre: "Cada día" },
  { id: "semanal", nombre: "Cada semana" },
  { id: "mensual", nombre: "Cada mes" },
  { id: "anual",   nombre: "Cada año" },
];

const RECORDATORIOS = [
  { v: "", nombre: "Sin aviso" }, { v: 5, nombre: "5 min antes" },
  { v: 15, nombre: "15 min antes" }, { v: 30, nombre: "30 min antes" },
  { v: 60, nombre: "1 hora antes" }, { v: 1440, nombre: "1 día antes" },
];

/* ---------- tamaño del texto en este dispositivo -------------------------- */

const TEXTO_POR_DEFECTO = 15;

function textoLocal() {
  try {
    const g = parseFloat(localStorage.getItem("gestionTxt"));
    if (g >= 12 && g <= 24) return g;
  } catch {}
  return TEXTO_POR_DEFECTO;
}

function aplicarTextoLocal(px) {
  document.documentElement.style.setProperty("--txt", px + "px");
  try { localStorage.setItem("gestionTxt", px); } catch {}
}

aplicarTextoLocal(textoLocal());

/* ---------- avisos ------------------------------------------------------- */

let tiempoBrindis;
function brindis(texto, mal = false) {
  const b = $("brindis");
  b.textContent = texto;
  b.classList.toggle("mal", mal);
  b.classList.add("ver");
  clearTimeout(tiempoBrindis);
  tiempoBrindis = setTimeout(() => b.classList.remove("ver"), 2600);
}

/* ---------- datos -------------------------------------------------------- */

async function cargarConfig() {
  const config = datos.configVista();
  estado.config = config;
  estado.categorias = config.categorias || [];
  U.aplicarTema(config.pantalla?.tema);
  U.aplicarCategorias(estado.categorias);
}

async function cargarActividades() {
  const desde = U.sumarDias(estado.ancla, -1);
  const hasta = U.sumarDias(estado.ancla, estado.dias);
  const [{ actividades }, pend] = await Promise.all([
    Promise.resolve({ actividades: datos.expandir(desde, hasta) }),
    Promise.resolve({ pendientes: datos.pendientes(45) }),
  ]);
  estado.ocurrencias = actividades;
  estado.pendientes = pend.pendientes || [];
}

/* ---------- lista -------------------------------------------------------- */

function visibles() {
  const f = estado.filtro;
  return estado.ocurrencias.filter((a) => {
    if (a.fecha < estado.ancla || a.fecha > U.sumarDias(estado.ancla, estado.dias - 1)) return false;
    if (f.categoria !== "todas" && a.categoria !== f.categoria) return false;
    if (f.soloAlta && a.prioridad !== "alta") return false;
    if (f.ocultarHechas && a.completada) return false;
    return true;
  });
}

/* Aviso de tareas sin cerrar, arriba de todo, con acciones rápidas. */
function bloquePendientes() {
  const pend = estado.pendientes;
  if (!pend.length) return "";
  return `<div class="alerta-pend">
      <div class="cab">
        <b>${pend.length === 1 ? "1 tarea sin cerrar" : `${pend.length} tareas sin cerrar`}</b>
        <button data-ver-pend>Ver el apartado</button>
      </div>
      ${pend.slice(0, 3).map((a) => `<div class="fila" data-id="${a.id}" data-fecha="${a.fecha}">
          <button class="marca-ok chico" data-accion="completar" aria-label="Marcar como hecha">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>
          </button>
          <span class="txt">${U.escapar(a.titulo)}</span>
          <em>${U.etiquetaRelativa(a.fecha)}${a.inicio ? " " + a.inicio : ""}</em>
          <button class="posponer" data-accion="posponer">Hoy</button>
        </div>`).join("")}
    </div>`;
}

function pintarLista() {
  const lista = $("lista");
  const items = visibles();
  const alerta = bloquePendientes();

  if (!items.length) {
    if (alerta) { lista.innerHTML = alerta; return; }
    lista.innerHTML = `<div class="vacio-lista">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4M9 15h6"/></svg>
      <div>No hay actividades en estos días.<br>Toca el botón <b>+</b> para agregar una.</div></div>`;
    return;
  }

  const porFecha = new Map();
  for (const a of items) {
    if (!porFecha.has(a.fecha)) porFecha.set(a.fecha, []);
    porFecha.get(a.fecha).push(a);
  }

  const hoy = U.hoyIso();
  let html = alerta;
  for (const [fecha, grupo] of [...porFecha.entries()].sort()) {
    html += `<div class="grupo-fecha ${fecha === hoy ? "es-hoy" : ""}">
        <b>${U.etiquetaRelativa(fecha)}</b><span>${U.fechaLarga(fecha)}</span></div>`;
    html += grupo.map(tarjeta).join("");
  }
  lista.innerHTML = html;
}

function tarjeta(a) {
  const color = U.colorDe(a.categoria);
  const hora = a.todoElDia
    ? "Todo el día"
    : `${a.inicio} – ${a.fin}`;
  const rep = a.repetida
    ? `<span class="etiqueta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a7 7 0 0 1 12-4l3 3M20 15a7 7 0 0 1-12 4l-3-3"/><path d="M19 4v4h-4M5 20v-4h4"/></svg>se repite</span>`
    : "";
  const aviso = a.recordatorio
    ? `<span class="etiqueta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20.5h4"/></svg>${a.recordatorio} min</span>`
    : "";

  const clases = ["tarea", a.completada ? "hecha" : "", a.vencida ? "vencida" : ""].join(" ");

  return `<article class="${clases}" style="--c:${color}" data-id="${a.id}" data-fecha="${a.fecha}">
      <button class="marca-ok" data-accion="completar" aria-label="Marcar como hecha">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11"/></svg>
      </button>
      <div class="cuerpo" data-accion="editar">
        <div class="titulo">${U.escapar(a.titulo)}</div>
        <div class="meta">
          <span class="hora">${hora}</span>
          ${a.vencida ? `<span class="insignia pend">sin cerrar</span>` : ""}
          <span class="etiqueta"><i></i>${U.escapar(U.nombreCategoria(estado.categorias, a.categoria))}</span>
          ${a.prioridad !== "media" ? `<span class="insignia ${a.prioridad}">${a.prioridad}</span>` : ""}
          ${rep}${aviso}
          ${a.detalle ? `<span>${U.escapar(a.detalle)}</span>` : ""}
        </div>
      </div>
      ${a.vencida ? `<button class="posponer" data-accion="posponer" title="Mover a hoy">Hoy</button>` : ""}
    </article>`;
}

/* ---------- búsqueda ------------------------------------------------------ */

async function pintarBusqueda() {
  const lista = $("lista");
  const q = estado.busqueda.trim();
  if (q.length < 2) {
    lista.innerHTML = `<div class="vacio-lista">Escribe al menos dos letras para buscar.</div>`;
    return;
  }
  const actividades = buscarEnBase(q);
  if (!actividades.length) {
    lista.innerHTML = `<div class="vacio-lista">Nada coincide con “${U.escapar(q)}”.</div>`;
    return;
  }
  lista.innerHTML = `<div class="grupo-fecha"><b>${actividades.length} resultado${actividades.length > 1 ? "s" : ""}</b></div>` +
    actividades.map((a) => tarjeta({ ...a, completada: false, repetida: (a.repetir || {}).tipo !== "ninguna" })).join("");
}

/* ---------- apartado de tareas sin cerrar --------------------------------- */

function pintarPendientes() {
  const lista = $("lista");
  const items = estado.pendientes;

  if (!items.length) {
    lista.innerHTML = `<div class="vacio-lista">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-5"/></svg>
      <div>No dejaste nada sin cerrar.<br>Aquí van las tareas cuya hora pasó sin marcarlas.</div></div>`;
    return;
  }

  const porFecha = new Map();
  for (const a of items) {
    if (!porFecha.has(a.fecha)) porFecha.set(a.fecha, []);
    porFecha.get(a.fecha).push(a);
  }

  let html = `<div class="nota-pend">Márcalas como hechas si ya las hiciste, muévelas a
    hoy con <b>Hoy</b>, o descártalas. Lo que sí se hizo se archiva solo al terminar el día.</div>`;
  for (const [fecha, grupo] of [...porFecha.entries()].sort().reverse()) {
    html += `<div class="grupo-fecha"><b>${U.etiquetaRelativa(fecha)}</b><span>${U.fechaLarga(fecha)}</span></div>`;
    html += grupo.map(tarjeta).join("");
  }
  lista.innerHTML = html;
}

/* ---------- cabecera y filtros -------------------------------------------- */

function pintarCabecera() {
  const fin = U.sumarDias(estado.ancla, estado.dias - 1);
  if (estado.vista === "agenda") {
    $("tituloVista").textContent = "Agenda";
    $("subtitulo").textContent = `${U.fechaCorta(estado.ancla)} — ${U.fechaCorta(fin)}`;
  } else if (estado.vista === "buscar") {
    $("tituloVista").textContent = "Buscar";
    $("subtitulo").textContent = "En todas tus actividades";
  } else if (estado.vista === "pendientes") {
    $("tituloVista").textContent = "Sin cerrar";
    $("subtitulo").textContent = estado.pendientes.length
      ? `${estado.pendientes.length} ${estado.pendientes.length === 1 ? "tarea" : "tareas"} esperando`
      : "todo al día";
  } else {
    $("tituloVista").textContent = "Ajustes";
    $("subtitulo").textContent = estado.config?.lugar?.nombre || "";
  }

  construirFiltros();
  marcarFiltros();
}

/* Los filtros se construyen una sola vez; al alternar solo cambia aria-pressed,
   que es lo que dispara la animación del CSS. Repintar el HTML la mataba. */
function construirFiltros() {
  const caja = $("filtros");
  const firma = estado.categorias.map((c) => c.id + c.color + c.nombre).join("|");
  if (caja.dataset.firma === firma) return;
  caja.dataset.firma = firma;
  caja.innerHTML = [
    `<button class="pastilla" data-filtro="todas" style="--tono:var(--ink);--tono-1:var(--ink);--tono-txt:#fff">Todas</button>`,
    ...estado.categorias.map((c) => `<button class="pastilla" data-filtro="${c.id}"
       style="--tono:${c.color};--tono-1:${c.color};--tono-txt:#fff">${U.escapar(c.nombre)}</button>`),
    `<button class="pastilla" data-alta style="--tono:#E11D48;--tono-1:#E11D48;--tono-txt:#fff">Solo alta</button>`,
    `<button class="pastilla" data-hechas style="--tono:var(--ink-2);--tono-1:var(--ink-2);--tono-txt:#fff">Ocultar hechas</button>`,
  ].join("");
}

function marcarFiltros() {
  const f = estado.filtro;
  for (const b of $("filtros").children) {
    let activo = false;
    if (b.dataset.filtro) activo = f.categoria === b.dataset.filtro;
    else if (b.hasAttribute("data-alta")) activo = f.soloAlta;
    else if (b.hasAttribute("data-hechas")) activo = f.ocultarHechas;
    b.setAttribute("aria-pressed", activo);
  }
}

/* ---------- hoja de edición ------------------------------------------------ */

function abrirHoja(actividad) {
  estado.editando = actividad || null;
  const a = actividad || {
    titulo: "", detalle: "", fecha: estado.ancla > U.hoyIso() ? estado.ancla : U.hoyIso(),
    inicio: proximaHora(), fin: proximaHora(1), todoElDia: false,
    categoria: estado.categorias[0]?.id, prioridad: "media",
    repetir: { tipo: "ninguna", dias: [], hasta: null, intervalo: 1 },
    recordatorio: null,
  };
  const rep = a.repetir || { tipo: "ninguna", dias: [] };
  // La regla del pasado solo estorba al crear o al mover; editar algo viejo se permite.
  const bloquea = estado.config?.reglas?.bloquear_pasado !== false && !actividad;

  $("hojaTitulo").textContent = actividad ? "Editar actividad" : "Nueva actividad";
  $("forma").innerHTML = `
    <div class="campo">
      <label for="f-titulo">Título</label>
      <input id="f-titulo" value="${U.escapar(a.titulo)}" maxlength="120" placeholder="¿Qué vas a hacer?" required>
    </div>

    <div class="campo">
      <label for="f-detalle">Detalle o lugar</label>
      <input id="f-detalle" value="${U.escapar(a.detalle || "")}" maxlength="200" placeholder="Opcional">
    </div>

    <div class="campo">
      <label for="f-fecha">Fecha</label>
      <input id="f-fecha" type="date" value="${a.fecha}" ${bloquea ? `min="${U.hoyIso()}"` : ""} required>
    </div>

    <button type="button" class="interruptor" id="f-todoeldia" aria-pressed="${!!a.todoElDia}">
      <span>Todo el día<small>Sin hora de inicio ni de término</small></span>
      <span class="palanca" aria-hidden="true" aria-pressed="${!!a.todoElDia}"></span>
    </button>

    <div class="dos ${a.todoElDia ? "oculto" : ""}" id="f-horas">
      <div class="campo"><label for="f-inicio">Empieza</label><input id="f-inicio" type="time" value="${a.inicio || "09:00"}"></div>
      <div class="campo"><label for="f-fin">Termina</label><input id="f-fin" type="time" value="${a.fin || "10:00"}"></div>
    </div>
    <div class="duraciones ${a.todoElDia ? "oculto" : ""}" id="f-duraciones">
      ${[30, 60, 90, 120, 180].map((m) => `<button type="button" data-dur="${m}">${U.duracionTexto(m)}</button>`).join("")}
    </div>
    <div id="f-error"></div>

    <div class="campo">
      <label>Categoría</label>
      <div class="opciones" id="f-categoria">
        ${estado.categorias.map((c) => `<button type="button" class="opcion" data-v="${c.id}"
            aria-pressed="${a.categoria === c.id}" style="--tono:${c.color};--tono-1:${U.tinte(c.color, 0.14)}">
            <i></i>${U.escapar(c.nombre)}</button>`).join("")}
      </div>
    </div>

    <div class="campo">
      <label>Prioridad</label>
      <div class="opciones" id="f-prioridad">
        ${PRIORIDADES.map((p) => `<button type="button" class="opcion" data-v="${p.id}"
            aria-pressed="${a.prioridad === p.id}" style="--tono:${p.tono};--tono-1:${p.tinte}">${p.nombre}</button>`).join("")}
      </div>
      <div class="nota" style="font-size:12px;color:var(--ink-3)">Solo las de prioridad alta aparecen en la pantalla de la TV.</div>
    </div>

    <div class="campo">
      <label for="f-repetir">Repetir</label>
      <select id="f-repetir">
        ${REPETICIONES.map((r) => `<option value="${r.id}" ${rep.tipo === r.id ? "selected" : ""}>${r.nombre}</option>`).join("")}
      </select>
    </div>

    <div class="campo ${rep.tipo === "semanal" ? "" : "oculto"}" id="f-caja-dias">
      <label>¿Qué días?</label>
      <div class="dias-semana" id="f-dias">
        ${U.DIAS_CORTOS.map((d, i) => `<button type="button" data-d="${i}"
            aria-pressed="${(rep.dias || []).includes(i)}">${d}</button>`).join("")}
      </div>
    </div>

    <div class="campo ${rep.tipo === "ninguna" ? "oculto" : ""}" id="f-caja-hasta">
      <label for="f-hasta">Repetir hasta (opcional)</label>
      <input id="f-hasta" type="date" value="${rep.hasta || ""}">
    </div>

    <div class="campo">
      <label for="f-recordatorio">Recordatorio</label>
      <select id="f-recordatorio">
        ${RECORDATORIOS.map((r) => `<option value="${r.v}" ${String(a.recordatorio ?? "") === String(r.v) ? "selected" : ""}>${r.nombre}</option>`).join("")}
      </select>
    </div>

    <div class="acciones">
      ${actividad ? `<button type="button" class="boton claro icono-boton" id="f-duplicar" title="Duplicar">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 5.5h-11a2 2 0 0 0-2 2v11"/></svg></button>
        <button type="button" class="boton peligro icono-boton" id="f-borrar" title="Eliminar">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16M9 6.5V4.5h6v2M6.5 6.5l1 14h9l1-14M10 10v7M14 10v7"/></svg></button>` : ""}
      <button type="submit" class="boton" id="f-guardar">${actividad ? "Guardar cambios" : "Agregar"}</button>
    </div>`;

  cablearHoja(actividad);
  validar(actividad);
  $("velo").classList.add("abierta");
  setTimeout(() => $("f-titulo").focus(), 60);
}

function proximaHora(mas = 0) {
  const d = new Date();
  const m = Math.ceil((d.getHours() * 60 + d.getMinutes()) / 30) * 30 + mas * 60;
  return U.aHora(Math.min(23 * 60 + 30, m));
}

function cerrarHoja() {
  $("velo").classList.remove("abierta");
  estado.editando = null;
}

let duracionActual = 60;

/** Revisa el formulario y muestra el problema debajo de las horas.
    Devuelve el mensaje de error, o null si todo está bien. */
function validar(actividad) {
  const caja = $("f-error");
  const boton = $("f-guardar");
  const todoElDia = $("f-todoeldia").getAttribute("aria-pressed") === "true";
  const bloquea = estado.config?.reglas?.bloquear_pasado !== false && !actividad;
  let error = null;

  if (!$("f-fecha").value) {
    error = "Elige una fecha";
  } else if (!todoElDia && U.aMinutos($("f-fin").value) <= U.aMinutos($("f-inicio").value)) {
    error = "La hora de término tiene que ser posterior a la de inicio";
  } else if (bloquea) {
    const hoy = U.hoyIso();
    if ($("f-fecha").value < hoy) {
      error = "Ese día ya pasó";
    } else if ($("f-fecha").value === hoy && !todoElDia) {
      const ahora = new Date();
      const margen = estado.config?.reglas?.margen_minutos ?? 5;
      if (U.aMinutos($("f-inicio").value) < ahora.getHours() * 60 + ahora.getMinutes() - margen) {
        error = `Esa hora ya pasó. Ahora son las ${U.aHora(ahora.getHours() * 60 + ahora.getMinutes())}`;
      }
    }
  }

  caja.innerHTML = error ? `<div class="aviso-error">${error}</div>` : "";
  boton.disabled = !!error;
  return error;
}

function cablearHoja(actividad) {
  const forma = $("forma");
  duracionActual = (actividad && actividad.inicio)
    ? U.aMinutos(actividad.fin) - U.aMinutos(actividad.inicio) : 60;

  // grupos de botones tipo "elige uno"
  for (const id of ["f-categoria", "f-prioridad"]) {
    $(id).addEventListener("click", (e) => {
      const b = e.target.closest(".opcion");
      if (!b) return;
      $(id).querySelectorAll(".opcion").forEach((o) => o.setAttribute("aria-pressed", o === b));
    });
  }

  // días de la semana: varios a la vez
  $("f-dias").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
  });

  // todo el día
  const palanca = $("f-todoeldia");
  palanca.addEventListener("click", () => {
    const nuevo = palanca.getAttribute("aria-pressed") !== "true";
    palanca.setAttribute("aria-pressed", nuevo);
    palanca.querySelector(".palanca").setAttribute("aria-pressed", nuevo);
    $("f-horas").classList.toggle("oculto", nuevo);
    $("f-duraciones").classList.toggle("oculto", nuevo);
    validar(actividad);
  });

  // el fin nunca puede quedar antes del inicio
  $("f-inicio").addEventListener("change", () => {
    const ini = U.aMinutos($("f-inicio").value || "09:00");
    const fin = U.aMinutos($("f-fin").value || "00:00");
    if (fin <= ini) $("f-fin").value = U.aHora(Math.min(23 * 60 + 59, ini + Math.max(30, duracionActual)));
    else duracionActual = fin - ini;
    validar(actividad);
  });
  $("f-fin").addEventListener("change", () => {
    const ini = U.aMinutos($("f-inicio").value || "09:00");
    let fin = U.aMinutos($("f-fin").value || "00:00");
    if (fin <= ini) {                       // lo empujamos en vez de dejarlo inválido
      fin = Math.min(23 * 60 + 59, ini + 30);
      $("f-fin").value = U.aHora(fin);
      brindis("El término tiene que ser después del inicio", true);
    }
    duracionActual = fin - ini;
    validar(actividad);
  });
  $("f-fecha").addEventListener("change", () => validar(actividad));

  // duraciones rápidas
  $("f-duraciones").addEventListener("click", (e) => {
    const b = e.target.closest("[data-dur]");
    if (!b) return;
    duracionActual = +b.dataset.dur;
    $("f-fin").value = U.aHora(Math.min(23 * 60 + 59, U.aMinutos($("f-inicio").value || "09:00") + duracionActual));
    [...$("f-duraciones").children].forEach((x) => x.setAttribute("aria-pressed", x === b));
    validar(actividad);
  });

  // mostrar/ocultar campos de repetición
  $("f-repetir").addEventListener("change", (e) => {
    $("f-caja-dias").classList.toggle("oculto", e.target.value !== "semanal");
    $("f-caja-hasta").classList.toggle("oculto", e.target.value === "ninguna");
  });

  // El <form> sobrevive al repintado, así que va con alUnico: con
  // addEventListener se acumulaba uno por cada vez que se abría la hoja.
  U.alUnico(forma, "submit", (e) => { e.preventDefault(); guardar(actividad); });
  $("f-duplicar")?.addEventListener("click", () => duplicar(actividad));
  $("f-borrar")?.addEventListener("click", () => borrar(actividad));
}

function leerFormulario() {
  const elegido = (id) => $(id).querySelector('[aria-pressed="true"]')?.dataset.v;
  const todoElDia = $("f-todoeldia").getAttribute("aria-pressed") === "true";
  const tipo = $("f-repetir").value;

  return {
    titulo: $("f-titulo").value.trim(),
    detalle: $("f-detalle").value.trim(),
    fecha: $("f-fecha").value,
    todoElDia,
    inicio: todoElDia ? null : $("f-inicio").value,
    fin: todoElDia ? null : $("f-fin").value,
    categoria: elegido("f-categoria"),
    prioridad: elegido("f-prioridad"),
    recordatorio: $("f-recordatorio").value || null,
    repetir: {
      tipo,
      intervalo: 1,
      dias: [...$("f-dias").querySelectorAll('[aria-pressed="true"]')].map((b) => +b.dataset.d),
      hasta: $("f-hasta").value || null,
    },
  };
}

let guardando = false;

async function guardar(actividad) {
  if (guardando) return;            // un envío a la vez, pase lo que pase
  const problema = validar(actividad);
  if (problema) return brindis(problema, true);
  const valores = leerFormulario();
  if (!valores.titulo) return brindis("Ponle un título a la actividad", true);
  const boton = $("f-guardar");
  guardando = true;
  boton.disabled = true;
  try {
    if (actividad) await datos.editarActividad(actividad.id, valores);
    else await datos.crearActividad(valores);
    cerrarHoja();
    await refrescar();
    brindis(actividad ? "Cambios guardados" : "Actividad agregada");
  } catch (e) {
    brindis(e.message, true);
    boton.disabled = false;
  } finally {
    guardando = false;
  }
}

async function duplicar(actividad) {
  try {
    await datos.duplicar(actividad.id);
    cerrarHoja();
    await refrescar();
    brindis("Copia creada");
  } catch (e) { brindis(e.message, true); }
}

async function borrar(actividad) {
  const repetida = (actividad.repetir || {}).tipo !== "ninguna";
  let soloEsteDia = null;
  if (repetida) {
    const soloEsta = confirm(
      "Esta actividad se repite.\n\nAceptar: borrar solo el día " + U.fechaCorta(actividad.fecha) +
      "\nCancelar: borrar la serie completa");
    if (soloEsta) soloEsteDia = actividad.fecha;
  } else if (!confirm(`¿Eliminar “${actividad.titulo}”?`)) {
    return;
  }
  try {
    await datos.borrarActividad(actividad.id, soloEsteDia);
    cerrarHoja();
    await refrescar();
    brindis("Eliminada · queda en la papelera");
  } catch (e) { brindis(e.message, true); }
}

/** Mueve una tarea vencida a hoy, respetando su duración. */
async function posponer(id, fecha) {
  const ahora = new Date();
  const enPunto = U.aHora((Math.floor((ahora.getHours() * 60 + ahora.getMinutes()) / 30) + 1) * 30);
  try {
    await datos.posponer(id,
                     { fecha, hasta: U.hoyIso(), inicio: enPunto });
    await refrescar();
    brindis(`Movida a hoy ${enPunto}`);
  } catch (e) { brindis(e.message, true); }
}

async function completar(id, fecha, hecha) {
  try {
    await datos.completar(id, fecha, !hecha);
    await refrescar();
  } catch (e) { brindis(e.message, true); }
}

/* ---------- ajustes -------------------------------------------------------- */

/** La búsqueda ya no viaja: las actividades están todas en memoria. */
function buscarEnBase(q) {
  const t = (q || "").trim().toLowerCase();
  const lista = datos.leer().actividades.filter((a) => !a.archivada);
  if (!t) return lista;
  return lista.filter((a) => a.titulo.toLowerCase().includes(t)
                          || (a.detalle || "").toLowerCase().includes(t));
}

/** El pronóstico se pide directo a Open-Meteo, sin intermediario. */
async function cargarClima(forzar = false) {
  const c = estado.config?.clima || {};
  if (!c.activo) { estado.clima = {}; return estado.clima; }
  if (!forzar && estado.clima?.actual) return estado.clima;
  try {
    estado.clima = await clima.traer({ ...estado.config.lugar, umbral: c.umbral_lluvia });
  } catch { estado.clima = clima.recordado() || {}; }
  return estado.clima;
}

async function pintarAjustes() {
  const c = estado.config;
  const hojaUrl = arranque.urlHoja(arranque.hojaRecordada() || "");
  const papelera = datos.leer().papelera;
  const grupos = datos.duplicados();
  if (!estado.clima?.actual) await cargarClima();
  const clima = estado.clima || {};

  const a = clima.actual || {};
  const u = c.clima?.unidad || "C";
  const estadoClima = a
    ? `${U.iconoClima(a.cond)} <div><b>${U.temp(a.temp, u)}${U.gradoss(u)} ${U.escapar(a.texto)}</b><br>
       <small style="color:var(--ink-3)">Actualizado ${new Date((clima.actualizado || 0) * 1000).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</small></div>`
    : `<div style="color:var(--ink-3)">${clima.error
         ? "No pude conectar con el servicio de clima. Revisa tu internet."
         : "Todavía no hay datos del pronóstico."}</div>`;

  const uni = c.clima?.unidad || "C";
  $("ajustes").innerHTML = `
    <section class="seccion">
      <h2>Clima</h2>
      <div class="estado-clima">${estadoClima}</div>

      <div class="campo">
        <label>Unidad de temperatura</label>
        <div class="opciones" id="s-unidad">
          <button type="button" class="opcion" data-v="C" aria-pressed="${uni === "C"}"
                  style="--tono:var(--azul);--tono-1:var(--azul-1)">Celsius °C</button>
          <button type="button" class="opcion" data-v="F" aria-pressed="${uni === "F"}"
                  style="--tono:var(--azul);--tono-1:var(--azul-1)">Fahrenheit °F</button>
        </div>
      </div>

      <div class="campo">
        <label for="s-buscar-lugar">Ubicación</label>
        <div class="buscador">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
          <input id="s-buscar-lugar" type="search" placeholder="Escribe una ciudad: Cusco, Lima, Arequipa…" autocomplete="off">
        </div>
        <div id="s-resultados" class="resultados"></div>
      </div>

      <div class="mapa-caja">
        <div id="s-mapa" class="mapa"><div class="mapa-cargando">Cargando el mapa…</div></div>
        <div class="mapa-pie">
          <div class="lugar-actual">
            <b id="s-lugar-nombre">${U.escapar(c.lugar.nombre)}</b>
            <small id="s-lugar-coords">${(+c.lugar.lat).toFixed(4)}, ${(+c.lugar.lon).toFixed(4)}</small>
          </div>
          <div class="botones-ubicacion">
            <button class="boton claro" id="s-mi-ubicacion" type="button">Usar mi ubicación</button>
            <button class="boton claro" id="s-ubicacion-red" type="button">Detectar por la conexión</button>
          </div>
        </div>
      </div>
      <div id="s-aviso-ubicacion"></div>
      <p class="nota">Toca el mapa para elegir el punto, o busca la ciudad por nombre. Los datos vienen de
        <b>Open-Meteo</b>: es gratuito, no pide clave de API y lo consulta tu propio navegador.</p>

      <details class="avanzado">
        <summary>Coordenadas exactas</summary>
        <div class="dos">
          <div class="campo"><label for="s-lat">Latitud</label><input id="s-lat" type="number" step="0.0001" value="${c.lugar.lat}"></div>
          <div class="campo"><label for="s-lon">Longitud</label><input id="s-lon" type="number" step="0.0001" value="${c.lugar.lon}"></div>
        </div>
        <div class="campo"><label for="s-lugar">Nombre que se muestra</label><input id="s-lugar" value="${U.escapar(c.lugar.nombre)}"></div>
        <div class="campo"><label for="s-zona">Zona horaria</label><input id="s-zona" value="${U.escapar(c.lugar.zona)}"></div>
      </details>

      <button class="boton claro" id="s-refrescar-clima">Actualizar el pronóstico ahora</button>
    </section>

    <section class="seccion">
      <h2>Estilo</h2>
      <p class="nota">Se guarda en la cuenta: al cambiarlo, la TV y los demás
        dispositivos se repintan solos, sin recargar.</p>
      <div class="temas" id="s-temas">
        ${U.TEMAS.map((t) => `
          <button type="button" class="tema" data-tema="${t.id}"
                  aria-pressed="${(c.pantalla.tema || "nitido") === t.id}">
            <span class="muestra" style="background:${t.muestra[0]}">
              <i style="background:${t.muestra[1]}"></i>
              <i style="background:${t.muestra[2]}"></i>
              <i style="background:${t.muestra[3]}"></i>
            </span>
            <span class="nombre">${t.nombre}</span>
            <span class="que">${t.que}</span>
          </button>`).join("")}
      </div>
    </section>

    <section class="seccion">
      <h2>Tamaño del texto</h2>
      <div class="regulador">
        <span class="chica">A</span>
        <input id="s-texto-local" type="range" min="12" max="24" step="0.5" value="${textoLocal()}">
        <span class="grande">A</span>
      </div>
      <p class="nota">Solo para esta pantalla, en este dispositivo. Se guarda aquí mismo.</p>

      <div class="regulador">
        <span class="chica">A</span>
        <input id="s-texto-tv" type="range" min="10" max="26" step="0.5" value="${c.pantalla.texto_tv || 15}">
        <span class="grande">A</span>
        <b id="s-texto-tv-val">${c.pantalla.texto_tv || 15}px</b>
      </div>
      <p class="nota">Tamaño con el que arranca la TV. En la propia TV puedes afinarlo con
        <b>Ctrl</b> + rueda; ese ajuste manda hasta que pulses <b>Ctrl 0</b>.</p>
    </section>

    <section class="seccion">
      <h2>Pantalla de la TV</h2>
      <div class="dos">
        <div class="campo"><label for="s-ini">La agenda empieza a las</label>
          <select id="s-ini">${horasOpciones(c.agenda.inicio)}</select></div>
        <div class="campo"><label for="s-fin">y termina a las</label>
          <select id="s-fin">${horasOpciones(c.agenda.fin)}</select></div>
      </div>
      ${interruptor("s-atenuar", "Atenuar de noche", "Baja el brillo en el horario que elijas", c.pantalla.atenuar)}
      <div class="dos ${c.pantalla.atenuar ? "" : "oculto"}" id="s-caja-atenuar">
        <div class="campo"><label for="s-desde">Desde</label><input id="s-desde" type="time" value="${c.pantalla.atenuar_desde}"></div>
        <div class="campo"><label for="s-hasta">Hasta</label><input id="s-hasta" type="time" value="${c.pantalla.atenuar_hasta}"></div>
      </div>
      ${interruptor("s-antiquemado", "Proteger la pantalla", "Mueve la imagen unos píxeles cada 10 minutos", c.pantalla.antiquemado)}
      ${interruptor("s-lunes", "La semana empieza el lunes", "Desactívalo para empezar en domingo", c.pantalla.semana_empieza_lunes)}
    </section>

    <section class="seccion">
      <h2>Los días del mes</h2>
      <p class="nota">Qué se ve dentro de cada casilla del calendario grande.</p>

      <div class="campo">
        <label>Cuántas tareas mostrar</label>
        <div class="opciones" id="s-cuantas">
          ${[1, 2, 3, 4].map((n) => `<button type="button" class="opcion" data-v="${n}"
              aria-pressed="${(c.pantalla.tareas_por_dia || 2) === n}"
              style="--tono:var(--azul);--tono-1:var(--azul-1)">${n}</button>`).join("")}
        </div>
        <div class="nota">Si no caben por el tamaño de letra, se muestran las que entren.</div>
      </div>

      <div class="campo">
        <label>Títulos largos</label>
        <div class="opciones" id="s-lineas">
          <button type="button" class="opcion" data-v="1" aria-pressed="${c.pantalla.lineas_titulo === 1}"
                  style="--tono:var(--azul);--tono-1:var(--azul-1)">Recortar con …</button>
          <button type="button" class="opcion" data-v="2" aria-pressed="${c.pantalla.lineas_titulo !== 1}"
                  style="--tono:var(--azul);--tono-1:var(--azul-1)">Usar dos líneas</button>
        </div>
      </div>

      ${interruptor("s-siguientes", "En el día de hoy, las que vienen",
        "Las ya pasadas dejan sitio a las próximas", c.pantalla.hoy_siguientes !== false)}
      ${interruptor("s-soloaltas", "Solo las de prioridad alta",
        "Las demás quedan como puntos de color", c.pantalla.solo_altas)}
    </section>

    <section class="seccion">
      <h2>Al terminar el día</h2>
      ${interruptor("s-limpieza", "Archivar lo que sí se hizo",
        "Sale de las listas para que no se acumule. Nada se borra: el respaldo lo sigue incluyendo.",
        c.limpieza?.activa !== false)}
      <p class="nota">Lo que quedó <b>sin cerrar</b> nunca se archiva: se queda en su
        apartado hasta que lo marques, lo muevas a hoy o lo elimines.</p>
    </section>

    <section class="seccion">
      <h2>Categorías</h2>
      <div id="s-categorias">${c.categorias.map(renglonCategoria).join("")}</div>
      <div class="alta-cat">
        <input type="color" id="s-cat-color" value="#0EA5E9" aria-label="Color de la categoría nueva">
        <input type="text" id="s-cat-nombre" placeholder="Nombre de la categoría" maxlength="30">
        <button class="boton" id="s-add-cat" type="button">Agregar</button>
      </div>
    </section>

    <section class="seccion">
      <h2>Tus datos</h2>
      <p class="nota">Todo vive en una hoja de cálculo de tu propio Google Drive.
        Puedes abrirla y editarla a mano: la app lee los cambios en cuanto los guardas.</p>
      <a class="boton claro" id="s-abrir-hoja" href="${hojaUrl}" target="_blank" rel="noopener"
         style="text-align:center;text-decoration:none">Abrir la hoja en Google Sheets</a>
      <p class="nota">Para guardarte una copia: en la hoja, <b>Archivo → Descargar → Excel</b>.
        Y si te equivocas, <b>Archivo → Historial de versiones</b> deja volver atrás a cualquier momento.</p>
      ${papelera.length ? `<button class="boton claro" id="s-papelera">Papelera (${papelera.length})</button>` : ""}
    </section>

    ${grupos.length ? `<section class="seccion">
      <h2>Actividades repetidas</h2>
      <p class="nota">Encontré ${grupos.length === 1 ? "una actividad idéntica a otra" :
        `${grupos.length} actividades que están más de una vez`}, con el mismo
        título, día y hora. Puedes quitar las copias y quedarte con una sola;
        van a la papelera, así que se pueden recuperar.</p>
      <ul class="lista-dup">
        ${grupos.slice(0, 12).map((g) => `<li><b>${U.escapar(g.titulo)}</b>
          <span>${U.fechaCorta(g.fecha)}${g.inicio ? " · " + g.inicio : ""} · ${g.copias} veces</span></li>`).join("")}
      </ul>
      ${grupos.length > 12 ? `<p class="nota">…y ${grupos.length - 12} más.</p>` : ""}
      <button class="boton claro" id="s-quitar-dup">Quitar las copias</button>
    </section>` : ""}

    <section class="seccion">
      <p class="nota" style="text-align:center">Conectado como <b id="s-correo">…</b></p>
      <button class="boton claro" id="s-salir">Salir de esta cuenta de Google</button>
      <p class="nota" style="text-align:center">Calendario de pared · datos guardados en tu propia máquina</p>
    </section>`;

  cablearAjustes(papelera);
}

const horasOpciones = (sel) => Array.from({ length: 25 }, (_, h) =>
  `<option value="${h}" ${h === sel ? "selected" : ""}>${String(h).padStart(2, "0")}:00</option>`).join("");

const interruptor = (id, titulo, nota, activo) => `
  <button type="button" class="interruptor" id="${id}" aria-pressed="${!!activo}">
    <span>${titulo}<small>${nota}</small></span>
    <span class="palanca" aria-hidden="true" aria-pressed="${!!activo}"></span>
  </button>`;

const renglonCategoria = (c) => `
  <div class="renglon" data-cat="${c.id}">
    <input type="color" value="${c.color}" aria-label="Color">
    <input type="text" value="${U.escapar(c.nombre)}" maxlength="30" aria-label="Nombre">
    <button class="mini" data-quitar-cat title="Quitar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>`;

function cablearAjustes(papelera) {
  const zona = $("ajustes");

  // Igual que el formulario: esta sección no se destruye al repintarse, así
  // que el manejador tiene que reemplazarse, no sumarse. Con dos manejadores
  // los interruptores se encendían y apagaban en el mismo clic.
  U.alUnico(zona, "click", async (e) => {
    const palanca = e.target.closest(".interruptor");
    if (palanca) {
      const nuevo = palanca.getAttribute("aria-pressed") !== "true";
      palanca.setAttribute("aria-pressed", nuevo);
      palanca.querySelector(".palanca").setAttribute("aria-pressed", nuevo);
      if (palanca.id === "s-atenuar") $("s-caja-atenuar").classList.toggle("oculto", !nuevo);
      return guardarAjustes();
    }
    const quitar = e.target.closest("[data-quitar-cat]");
    if (quitar) {
      if (zona.querySelectorAll("[data-cat]").length <= 1) return brindis("Necesitas al menos una categoría", true);
      quitar.closest("[data-cat]").remove();
      return guardarAjustes();
    }
  });

  zona.addEventListener("change", (e) => {
    if (e.target.matches("input[type=color], input[type=text], select, input[type=time], input[type=number], #s-lugar, #s-zona")) {
      guardarAjustes();
    }
  });

  const agregarCategoria = () => {
    const campo = $("s-cat-nombre");
    const nombre = campo.value.trim();
    if (!nombre) { campo.focus(); return brindis("Escribe el nombre de la categoría", true); }

    const existentes = [...zona.querySelectorAll("[data-cat] input[type=text]")]
      .map((i) => i.value.trim().toLowerCase());
    if (existentes.includes(nombre.toLowerCase())) {
      campo.select();
      return brindis(`Ya tienes una categoría llamada “${nombre}”`, true);
    }
    if (existentes.length >= 12) return brindis("Doce categorías es el máximo", true);

    $("s-categorias").insertAdjacentHTML("beforeend",
      renglonCategoria({ id: "", nombre, color: $("s-cat-color").value }));
    campo.value = "";
    const paleta = ["#0891A5", "#7C3AED", "#E4720C", "#12A150", "#E11D48", "#0EA5E9", "#DB2777", "#65A30D"];
    $("s-cat-color").value = paleta[(existentes.length + 1) % paleta.length];
    guardarAjustes();
    brindis(`Categoría “${nombre}” agregada`);
  };

  $("s-add-cat").addEventListener("click", agregarCategoria);
  $("s-cat-nombre").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); agregarCategoria(); }
  });

  // grupos de "elige uno" que guardan al vuelo
  for (const id of ["s-cuantas", "s-lineas"]) {
    $(id).addEventListener("click", (e) => {
      const b = e.target.closest(".opcion");
      if (!b) return;
      [...$(id).children].forEach((o) => o.setAttribute("aria-pressed", o === b));
      guardarAjustes();
    });
  }

  // unidad de temperatura: cambia el número de arriba en el momento
  $("s-unidad").addEventListener("click", (e) => {
    const b = e.target.closest(".opcion");
    if (!b) return;
    [...$("s-unidad").children].forEach((o) => o.setAttribute("aria-pressed", o === b));
    const u = b.dataset.v;
    const grados = zona.querySelector(".estado-clima b");
    const actual = (estado.clima?.actual || {}).temp;
    if (grados && actual != null) {
      grados.textContent = `${U.temp(actual, u)}${U.gradoss(u)} ${estado.clima.actual.texto}`;
    }
    guardarAjustes();
  });

  // selector de estilo: se ve al instante y viaja a los demás dispositivos
  $("s-temas").addEventListener("click", (e) => {
    const b = e.target.closest(".tema");
    if (!b) return;
    [...$("s-temas").children].forEach((n) => n.setAttribute("aria-pressed", n === b));
    U.aplicarTema(b.dataset.tema);
    U.aplicarCategorias(estado.categorias);   // los tintes se rehacen sobre el fondo nuevo
    guardarAjustes();
  });

  // reguladores de tamaño de letra
  $("s-texto-local").addEventListener("input", (e) => aplicarTextoLocal(+e.target.value));
  $("s-texto-tv").addEventListener("input", (e) => {
    $("s-texto-tv-val").textContent = e.target.value + "px";
    guardarAjustes();
  });

  cablearUbicacion();

  $("s-refrescar-clima").addEventListener("click", async (e) => {
    e.target.disabled = true; e.target.textContent = "Consultando…";
    try { await cargarClima(true); brindis("Pronóstico actualizado"); }
    catch { brindis("No pude conectar con el servicio de clima", true); }
    pintarAjustes();
  });

  arranque.auth.cuenta().then((c) => {
    const caja = $("s-correo");
    if (caja) caja.textContent = c || "tu cuenta de Google";
  });

  $("s-papelera")?.addEventListener("click", async () => {
    const cual = prompt("Escribe el número para restaurar:\n\n" +
      papelera.map((a, i) => `${i + 1}. ${a.titulo} (${a.fecha})`).join("\n"));
    const i = parseInt(cual, 10) - 1;
    if (!(i >= 0 && i < papelera.length)) return;
    await datos.restaurar(i);
    brindis("Actividad restaurada");
    refrescar();
  });

  $("s-quitar-dup")?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    try {
      const quitadas = await datos.limpiarDuplicados();
      brindis(quitadas ? `${quitadas} ${quitadas === 1 ? "copia quitada" : "copias quitadas"}`
                       : "No quedaban copias");
      await refrescar();
    } catch (err) { brindis(err.message, true); e.target.disabled = false; }
  });

  $("s-salir").addEventListener("click", () => {
    if (!confirm("¿Salir de esta cuenta?\n\nTus datos se quedan en tu Drive; solo se cierra la sesión en este dispositivo.")) return;
    arranque.auth.salir();
    arranque.olvidarHoja();
    location.reload();
  });
}

/* ---------- elegir la ubicación ------------------------------------------- */

let mapa = null, marcador = null;

function cargarLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((listo, falla) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => listo(window.L);
    js.onerror = () => falla(new Error("sin mapa"));
    document.head.appendChild(js);
    setTimeout(() => (window.L ? listo(window.L) : falla(new Error("tardó demasiado"))), 8000);
  });
}

function fijarLugar({ nombre, lat, lon, zona }, mover = true) {
  $("s-lat").value = (+lat).toFixed(4);
  $("s-lon").value = (+lon).toFixed(4);
  if (nombre) $("s-lugar").value = nombre;
  if (zona && zona !== "auto") $("s-zona").value = zona;
  $("s-lugar-nombre").textContent = $("s-lugar").value;
  $("s-lugar-coords").textContent = `${(+lat).toFixed(4)}, ${(+lon).toFixed(4)}`;
  if (mover && mapa) {
    mapa.setView([lat, lon], Math.max(mapa.getZoom(), 10));
    marcador.setLatLng([lat, lon]);
  }
  guardarAjustes();
}

/* El navegador solo entrega la ubicación en un origen seguro. En la versión
   anterior la app se abría por http en la red local y Chrome la rechazaba sin
   llegar a preguntar — por eso parecía que "no diste permiso". Ahora que vive
   en https el botón funciona de verdad; la comprobación se queda por si algún
   día alguien la abre desde un archivo local. */
function ubicacionDisponible() {
  if (!navigator.geolocation) return { ok: false, motivo: "Este navegador no puede compartir la ubicación." };
  if (!window.isSecureContext) {
    return {
      ok: false,
      motivo: "El GPS solo funciona si abres la página por <b>https</b>. " +
              "Usa <b>Detectar por la conexión</b>, que da precisión de ciudad y para el " +
              "clima alcanza de sobra.",
    };
  }
  return { ok: true };
}

async function pedirUbicacion() {
  const boton = $("s-mi-ubicacion");
  const puede = ubicacionDisponible();
  if (!puede.ok) return avisoUbicacion(puede.motivo);

  // Si ya fue denegado antes, el navegador no vuelve a preguntar: hay que decirlo.
  try {
    const permiso = await navigator.permissions?.query({ name: "geolocation" });
    if (permiso && permiso.state === "denied") {
      return avisoUbicacion("Bloqueaste la ubicación para esta página. Ábrela desde el " +
        "candado de la barra de direcciones y vuelve a permitirla.");
    }
  } catch { /* algunos navegadores no tienen permissions.query */ }

  boton.disabled = true;
  boton.textContent = "Esperando permiso…";
  const restaurar = () => { boton.disabled = false; boton.textContent = "Usar mi ubicación"; };

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const lugares = [await clima.lugarPorCoordenadas(coords.latitude, coords.longitude)];
        fijarLugar(lugares[0] || { nombre: "Mi ubicación", lat: coords.latitude, lon: coords.longitude });
        brindis("Ubicación tomada del dispositivo");
        $("s-aviso-ubicacion").innerHTML = "";
      } catch { brindis("No pude resolver el nombre del lugar", true); }
      restaurar();
    },
    (error) => {
      const textos = {
        1: "No diste permiso. Vuelve a tocar el botón y elige Permitir, o habilítalo desde el candado de la barra de direcciones.",
        2: "El dispositivo no pudo determinar dónde está. Prueba con el GPS encendido o usa el buscador.",
        3: "Tardó demasiado. Vuelve a intentarlo o busca la ciudad por nombre.",
      };
      avisoUbicacion(textos[error.code] || "No pude obtener la ubicación.");
      restaurar();
    },
    { timeout: 15000, enableHighAccuracy: true, maximumAge: 60000 });
}

function avisoUbicacion(texto) {
  $("s-aviso-ubicacion").innerHTML = `<div class="aviso-error">${texto}</div>`;
  brindis("No pude usar tu ubicación", true);
}

async function cablearUbicacion() {
  const c = estado.config;
  const caja = $("s-resultados");

  // -- buscador por nombre
  $("s-buscar-lugar").addEventListener("input", U.rebotar(async (e) => {
    const q = e.target.value.trim();
    if (q.length < 2) return (caja.innerHTML = "");
    caja.innerHTML = `<div class="buscando">Buscando…</div>`;
    try {
      const lugares = await clima.buscarLugares(q);
      caja.innerHTML = lugares.length
        ? lugares.map((l, i) => `<button class="resultado" data-i="${i}">
             <b>${U.escapar(l.nombre)}</b><small>${U.escapar(l.detalle)}</small></button>`).join("")
        : `<div class="buscando">Sin resultados. Revisa tu internet.</div>`;
      caja.onclick = (ev) => {
        const b = ev.target.closest(".resultado");
        if (!b) return;
        fijarLugar(lugares[+b.dataset.i]);
        caja.innerHTML = "";
        $("s-buscar-lugar").value = "";
        brindis("Ubicación actualizada");
      };
    } catch {
      caja.innerHTML = `<div class="buscando">No pude buscar ahora mismo.</div>`;
    }
  }, 400));

  // -- ubicación del navegador
  $("s-mi-ubicacion").addEventListener("click", pedirUbicacion);

  // -- ubicación por la conexión: funciona aunque el GPS esté bloqueado
  $("s-ubicacion-red").addEventListener("click", async (e) => {
    const boton = e.target;
    boton.disabled = true;
    boton.textContent = "Detectando…";
    try {
      const lugares = [await clima.lugarPorIp()];
      fijarLugar(lugares[0]);
      $("s-aviso-ubicacion").innerHTML = "";
      brindis(`Ubicación estimada: ${lugares[0].nombre}`);
    } catch (err) {
      avisoUbicacion("No pude estimarla. Revisa tu internet, " +
                     "o busca la ciudad por nombre.");
    }
    boton.disabled = false;
    boton.textContent = "Detectar por la conexión";
  });

  // -- mapa (opcional: si no carga, el buscador sigue sirviendo)
  try {
    const L = await cargarLeaflet();
    const div = $("s-mapa");
    if (!div) return;
    div.innerHTML = "";
    mapa = L.map(div, { attributionControl: false }).setView([+c.lugar.lat, +c.lugar.lon], 11);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(mapa);
    marcador = L.marker([+c.lugar.lat, +c.lugar.lon], { draggable: true }).addTo(mapa);

    const alSoltar = async (lat, lon) => {
      $("s-lugar-coords").textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      try {
        const lugares = [await clima.lugarPorCoordenadas(lat, lon)];
        fijarLugar(lugares[0] || { nombre: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, lat, lon }, false);
      } catch {
        fijarLugar({ nombre: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, lat, lon }, false);
      }
    };
    mapa.on("click", (e) => { marcador.setLatLng(e.latlng); alSoltar(e.latlng.lat, e.latlng.lng); });
    marcador.on("dragend", () => { const p = marcador.getLatLng(); alSoltar(p.lat, p.lng); });
    setTimeout(() => mapa.invalidateSize(), 200);
  } catch {
    $("s-mapa").innerHTML = `<div class="mapa-cargando">El mapa necesita internet.<br>
      Puedes buscar la ciudad por nombre o escribir las coordenadas abajo.</div>`;
  }
}

/* ---------- guardar ajustes ------------------------------------------------ */

const guardarAjustes = U.rebotar(async () => {
  const zona = $("ajustes");
  const categorias = [...zona.querySelectorAll("[data-cat]")].map((r) => ({
    id: r.dataset.cat || undefined,
    nombre: r.querySelector("input[type=text]").value,
    color: r.querySelector("input[type=color]").value,
  }));

  // nombres repetidos: avisamos y no guardamos
  const nombres = categorias.map((c) => c.nombre.trim().toLowerCase());
  const repetido = nombres.find((n, i) => n && nombres.indexOf(n) !== i);
  if (repetido) return brindis(`Tienes dos categorías llamadas “${repetido}”`, true);

  const nuevo = {
    lugar: {
      nombre: $("s-lugar").value, zona: $("s-zona").value,
      lat: parseFloat($("s-lat").value), lon: parseFloat($("s-lon").value),
    },
    agenda: { inicio: +$("s-ini").value, fin: +$("s-fin").value },
    clima: { unidad: $("s-unidad").querySelector('[aria-pressed="true"]')?.dataset.v || "C" },
    limpieza: { activa: $("s-limpieza").getAttribute("aria-pressed") === "true" },
    categorias,
    pantalla: {
      tema: $("s-temas").querySelector('[aria-pressed="true"]')?.dataset.tema || "nitido",
      texto_tv: +$("s-texto-tv").value,
      atenuar: $("s-atenuar").getAttribute("aria-pressed") === "true",
      atenuar_desde: $("s-desde").value,
      atenuar_hasta: $("s-hasta").value,
      antiquemado: $("s-antiquemado").getAttribute("aria-pressed") === "true",
      semana_empieza_lunes: $("s-lunes").getAttribute("aria-pressed") === "true",
      tareas_por_dia: +($("s-cuantas").querySelector('[aria-pressed="true"]')?.dataset.v || 2),
      lineas_titulo: +($("s-lineas").querySelector('[aria-pressed="true"]')?.dataset.v || 2),
      hoy_siguientes: $("s-siguientes").getAttribute("aria-pressed") === "true",
      solo_altas: $("s-soloaltas").getAttribute("aria-pressed") === "true",
    },
  };

  try {
    await datos.guardarVista(nuevo);
    const config = datos.configVista();
    estado.config = config;
    estado.categorias = config.categorias;
    U.aplicarCategorias(estado.categorias);
    brindis("Ajustes guardados");
  } catch (e) { brindis(e.message, true); }
}, 500);

/* ---------- vistas ---------------------------------------------------------- */

async function cambiarVista(vista) {
  estado.vista = vista;
  document.querySelectorAll(".barra button").forEach((b) =>
    b.setAttribute("aria-current", b.dataset.vista === vista));

  const ajustes = vista === "ajustes";
  $("ajustes").classList.toggle("oculto", !ajustes);
  $("lista").classList.toggle("oculto", ajustes);
  $("btnNueva").classList.toggle("oculto", ajustes);
  $("navFecha").classList.toggle("oculto", vista !== "agenda");
  $("cajaBuscar").classList.toggle("oculto", vista !== "buscar");
  $("filtros").classList.toggle("oculto", vista !== "agenda");

  scrollTo({ top: 0 });          // si no, la cabecera fija tapa el inicio
  pintarCabecera();
  if (ajustes) await pintarAjustes();
  else if (vista === "buscar") { pintarBusqueda(); $("buscar").focus(); }
  else await refrescar();
  location.hash = vista === "agenda" ? "" : vista;
}

async function refrescar() {
  if (estado.vista === "ajustes") return;
  if (estado.vista === "buscar") return pintarBusqueda();
  try {
    await cargarActividades();
    marcarGlobo();
    pintarCabecera();
    if (estado.vista === "pendientes") pintarPendientes();
    else pintarLista();
  } catch (e) { brindis("No pude guardar en la hoja: " + e.message, true); }
}

/** El puntito de la pestaña avisa sin tener que entrar. */
function marcarGlobo() {
  const g = $("globoPend");
  if (g) g.hidden = !estado.pendientes.length;
}

/* ---------- eventos globales -------------------------------------------------- */

$("lista").addEventListener("click", async (e) => {
  if (e.target.closest("[data-ver-pend]")) return cambiarVista("pendientes");

  const fila = e.target.closest(".tarea, .alerta-pend .fila");
  if (!fila) return;
  const { id, fecha } = fila.dataset;
  const accion = e.target.closest("[data-accion]")?.dataset.accion;

  if (accion === "completar") return completar(id, fecha, fila.classList.contains("hecha"));
  if (accion === "posponer") return posponer(id, fecha);

  const act = [...estado.ocurrencias, ...estado.pendientes].find((a) => a.id === id && a.fecha === fecha);
  if (act) return abrirHoja(act);
  const actividades = buscarEnBase("");
  const base = actividades.find((a) => a.id === id);
  if (base) abrirHoja({ ...base, completada: false });
});

$("filtros").addEventListener("click", (e) => {
  const b = e.target.closest(".pastilla");
  if (!b) return;
  const f = estado.filtro;
  if (b.dataset.filtro) f.categoria = b.dataset.filtro;
  else if (b.hasAttribute("data-alta")) f.soloAlta = !f.soloAlta;
  else if (b.hasAttribute("data-hechas")) f.ocultarHechas = !f.ocultarHechas;
  marcarFiltros();
  pintarLista();
});

document.querySelectorAll(".barra button").forEach((b) =>
  b.addEventListener("click", () => cambiarVista(b.dataset.vista)));

$("antes").addEventListener("click", () => { estado.ancla = U.sumarDias(estado.ancla, -estado.dias); refrescar(); });
$("despues").addEventListener("click", () => { estado.ancla = U.sumarDias(estado.ancla, estado.dias); refrescar(); });
$("irHoy").addEventListener("click", () => { estado.ancla = U.hoyIso(); refrescar(); });

$("btnNueva").addEventListener("click", () => abrirHoja(null));
$("cerrarHoja").addEventListener("click", cerrarHoja);
$("velo").addEventListener("click", (e) => { if (e.target === $("velo")) cerrarHoja(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarHoja(); });

$("buscar").addEventListener("input", U.rebotar((e) => {
  estado.busqueda = e.target.value;
  pintarBusqueda();
}, 300));

/* ---------- arranque ---------------------------------------------------------- */

/* Igual que la TV: primero hay que entrar con Google y abrir la hoja. De eso
   se encarga arranque.js, que llama aquí cuando ya hay datos. */
export async function arrancar() {
  await cargarConfig();
  await cambiarVista(location.hash.slice(1) || "agenda");

  // El repaso de fin de día lo hacía un hilo del servidor; ahora lo corre
  // Gestión al abrirse, que es el único momento en que hace falta.
  datos.pasarRevista().then((n) => { if (n) refrescar(); }).catch(() => {});

  datos.escuchar((que) => {
    if (que !== "datos" && que !== "config" && que !== "cache") return;
    // Si estás escribiendo en la hoja de edición, no te la movemos debajo.
    if (!$("velo").classList.contains("abierta")) refrescar();
  });
}
