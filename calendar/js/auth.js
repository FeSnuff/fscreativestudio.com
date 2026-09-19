/* Entrar con Google, sin servidor.

   Usa Google Identity Services en el modelo de token: el navegador pide un
   token de acceso directamente y nadie guarda secretos. El token dura una
   hora, así que lo renovamos en silencio antes de que caduque; mientras el
   navegador conserve la sesión de Google y ya hayas dado el permiso una vez,
   la renovación no muestra ninguna ventana. Eso es lo que permite dejar la
   TV encendida días sin tocarla.

   El permiso que pide es drive.file y nada más: la aplicación solo puede ver
   y modificar los archivos que ella misma creó. No tiene acceso al resto de
   tu Drive, ni puede listarlo.                                              */

const GIS = "https://accounts.google.com/gsi/client";
const ALCANCE = [
  "https://www.googleapis.com/auth/drive.file",
  "openid",
  "email",
].join(" ");

const MARGEN_MS = 5 * 60 * 1000;      // renovar 5 minutos antes de que caduque

/* Respuestas de Google que significan "no hay sesión, hace falta un clic".
   No son errores que valga la pena reintentar. */
const SIN_SESION = new Set([
  "interaction_required", "login_required", "consent_required",
  "account_selection_required", "immediate_failed",
]);

const RECORDAR = "calendario_correo";     // para el login_hint tras recargar
const GUARDADO = "calendario_token";      // el token vigente, para no repedirlo

/* Google entrega un token que dura una hora, pero antes yo lo tiraba al
   recargar la página y pedía otro — y pedir otro exige un gesto tuyo, de ahí
   el botón en cada carga. Guardándolo, mientras siga vigente la página abre
   directo, sin hablar con Google siquiera.

   El intercambio: el token queda en el navegador. Solo sirve para los archivos
   que esta app creó (permiso drive.file), caduca solo en una hora, y se borra
   al salir. Para un calendario personal en tu propio dominio es un trato
   razonable; si prefieres que no se guarde, borra estas tres funciones y
   volverás a tener el clic en cada carga. */
function guardarEnDisco() {
  try {
    localStorage.setItem(GUARDADO, JSON.stringify({ token, caducaEn }));
  } catch {}
}

function recuperarDeDisco() {
  try {
    const g = JSON.parse(localStorage.getItem(GUARDADO) || "null");
    // Con menos de dos minutos por delante no vale la pena: se usa y caduca.
    if (!g || !g.token || g.caducaEn - Date.now() < 120000) return false;
    token = g.token;
    caducaEn = g.caducaEn;
    return true;
  } catch { return false; }
}

const olvidarDeDisco = () => { try { localStorage.removeItem(GUARDADO); } catch {} };

/** Lo último que respondió Google a un intento silencioso. Se muestra en la
    pantalla de entrada para poder diagnosticar sin abrir la consola. */
export let ultimoMotivo = null;

let cliente = null;
let token = null;
let caducaEn = 0;
let correo = null;
let temporizador = null;
let alCambiar = () => {};

/* El modelo de token no guarda el token en ningún lado: cada vez que se carga
   la página hay que pedir uno nuevo. Lo que sí se puede es pedirlo SIN molestar
   al usuario, y para eso Google necesita dos cosas:

     prompt: ""    pregunta solo la primera vez, nunca más
     login_hint    de qué cuenta se trata, para no pedir que la elija

   Si falta el login_hint, Google no sabe qué cuenta usar y vuelve a mostrar el
   selector en cada recarga. Por eso el correo se recuerda en este dispositivo:
   no es un dato sensible, es solo la pista para no volver a preguntar. */
const correoRecordado = () => {
  try { return localStorage.getItem(RECORDAR) || null; } catch { return null; }
};
const recordarCorreo = (c) => {
  correo = c;
  try { c ? localStorage.setItem(RECORDAR, c) : localStorage.removeItem(RECORDAR); } catch {}
};

/* ---------- carga del script de Google ---------------------------------- */

let cargando = null;
function cargarGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (cargando) return cargando;
  cargando = new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = GIS; s.async = true; s.defer = true;
    s.onload = ok;
    s.onerror = () => mal(new Error("No pude cargar el acceso de Google. ¿Hay internet?"));
    document.head.appendChild(s);
  });
  return cargando;
}

/* ---------- ciclo del token --------------------------------------------- */

function guardarToken(respuesta) {
  token = respuesta.access_token;
  caducaEn = Date.now() + (Number(respuesta.expires_in) || 3600) * 1000;
  try { localStorage.setItem("entro_alguna_vez", "1"); } catch {}
  guardarEnDisco();
  programarRenovacion();
  alCambiar({ dentro: true });
  // La primera vez averiguamos el correo y lo guardamos: es la pista que hace
  // que las siguientes entradas no pregunten nada.
  if (!correoRecordado()) cuenta().catch(() => {});
}

function programarRenovacion() {
  clearTimeout(temporizador);
  const falta = Math.max(30_000, caducaEn - Date.now() - MARGEN_MS);
  temporizador = setTimeout(() => {
    // Si la renovación falla hay que avisar, no tragárselo: la pantalla tiene
    // que poder mostrar que perdió la sesión en vez de quedarse muda.
    renovar().catch((e) => alCambiar({ dentro: false, motivo: e.message }));
  }, falta);
}

/* Google no garantiza responder a una petición silenciosa: si no hay sesión,
   si un bloqueador tumbó el iframe o si simplemente decide no contestar, el
   callback no se llama nunca. Sin un tiempo de espera la promesa se queda
   colgada y la pantalla se congela en "Conectando…" para siempre. Por eso
   toda llamada a Google pasa por aquí, con plazo y con error_callback. */
/* El valor de prompt decide POR DÓNDE va la petición, y eso lo cambia todo:

     "none"  Google usa un iframe oculto. No muestra nada y ningún bloqueador
             de ventanas lo estorba. Es el único apto para reconectar solo.
     ""      Puede abrir una ventana emergente. No vuelve a pedir permiso si
             ya lo diste, pero necesita un clic tuyo detrás.

   Antes usaba "" también para reconectar: la ventana no abría (bloqueador),
   Google no respondía, y acababa mostrando el botón en cada recarga. */
function pedirToken({ silencioso, plazo }) {
  return new Promise((ok, mal) => {
    if (!cliente) return mal(new Error("sin cliente"));

    let cerrado = false;
    const terminar = (fn, valor) => {
      if (cerrado) return;
      cerrado = true;
      clearTimeout(reloj);
      fn(valor);
    };

    const reloj = setTimeout(() => {
      terminar(mal, Object.assign(
        new Error(silencioso
          ? "Google no respondió al intento de reconectar."
          : "Google no respondió. Si tienes un bloqueador de anuncios, desactívalo para esta página: suele impedir que se abra la ventana de Google."),
        { tiempoAgotado: true }));
    }, plazo);

    cliente.callback = (r) => {
      if (r.error) {
        if (!silencioso) alCambiar({ dentro: false, motivo: r.error });
        return terminar(mal, Object.assign(new Error(descripcion(r.error)), { codigo: r.error }));
      }
      guardarToken(r);
      terminar(ok, token);
    };
    // Lo llama GIS cuando la ventana no abre o el usuario la cierra.
    cliente.error_callback = (e) => terminar(mal, new Error(descripcion(e?.type || "popup_failed_to_open")));

    try {
      const opciones = { prompt: silencioso ? "none" : "" };
      const pista = correo || correoRecordado();
      if (pista) opciones.login_hint = pista;
      cliente.requestAccessToken(opciones);
    } catch (e) {
      terminar(mal, e);
    }
  });
}

/** Reconecta sin mostrar nada. Se intenta varias veces antes de rendirse:
    el iframe de Google a veces tarda en levantar justo al abrir la página, y
    vale mucho más un segundo de espera que obligarte a dar un clic. */
async function renovar(intentos = 2) {
  let ultimo;
  for (let i = 0; i < intentos; i++) {
    try {
      return await pedirToken({ silencioso: true, plazo: i === 0 ? 5000 : 8000 });
    } catch (e) {
      ultimo = e;
      // Si Google dice explícitamente que hace falta interacción, insistir no
      // sirve de nada: no hay sesión que revivir.
      if (SIN_SESION.has(e.codigo)) break;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  throw ultimo;
}

/* ---------- API pública -------------------------------------------------- */

export async function iniciar(clientId, cuandoCambie) {
  if (!clientId || clientId.startsWith("PON_")) {
    throw new Error("Falta poner tu ID de cliente de Google en config.js");
  }
  alCambiar = cuandoCambie || alCambiar;
  await cargarGis();
  cliente = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: ALCANCE,
    callback: () => {},         // se reemplaza en cada petición
  });
  // 1. ¿Hay un token guardado que siga vigente? Entonces no hay nada que
  //    pedirle a Google: se entra directo.
  if (recuperarDeDisco()) {
    programarRenovacion();
    alCambiar({ dentro: true });
    return true;
  }

  // 2. Si no, se intenta revivir la sesión en silencio.
  let previo = false;
  try { previo = localStorage.getItem("entro_alguna_vez") === "1"; } catch {}
  if (previo) {
    try {
      await renovar();
      ultimoMotivo = null;
      return true;
    } catch (e) {
      // Nos guardamos el porqué: la pantalla de entrada lo muestra, así se
      // puede diagnosticar sin abrir las herramientas del navegador.
      ultimoMotivo = e.codigo ? `${e.codigo} · ${e.message}` : e.message;
      return false;
    }
  }
  return false;
}

/** Con un clic del usuario. Solo la primera vez muestra la pantalla de
    permiso; después Google la salta. Plazo largo porque aquí la persona
    tiene que elegir cuenta y aceptar. */
export function entrar() {
  return pedirToken({ silencioso: false, plazo: 120000 });
}

export function salir() {
  const t = token;
  token = null; caducaEn = 0;
  recordarCorreo(null);
  olvidarDeDisco();
  clearTimeout(temporizador);
  try { localStorage.removeItem("entro_alguna_vez"); } catch {}
  if (t && window.google?.accounts?.oauth2) {
    try { google.accounts.oauth2.revoke(t, () => {}); } catch {}
  }
  alCambiar({ dentro: false });
}

export const dentro = () => !!token && Date.now() < caducaEn;

/** El token vigente; si está por vencer lo renueva antes de devolverlo. */
export async function vigente() {
  if (token && Date.now() < caducaEn - 30_000) return token;
  return renovar();
}

/** Lo llama sheets.js cuando Google rechaza el token: puede estar revocado
    aunque no haya caducado, y entonces guardarlo ya no sirve de nada. */
export function invalidar() {
  token = null; caducaEn = 0;
  olvidarDeDisco();
}

/** Correo de la cuenta. Sirve para mostrarlo y, sobre todo, como login_hint
    para que las siguientes entradas no pregunten nada. Se pide una vez. */
export async function cuenta() {
  if (correo) return correo;
  const guardado = correoRecordado();
  if (guardado) { correo = guardado; return correo; }
  const t = await vigente();
  try {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo",
                          { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) return null;
    recordarCorreo((await r.json()).email || null);
  } catch { /* sin correo se sigue pudiendo usar la app, solo preguntará más */ }
  return correo;
}

function descripcion(codigo) {
  // Estos son la respuesta normal de un intento silencioso cuando no hay
  // sesión que revivir. No son fallos: significan "hace falta un clic".
  if (SIN_SESION.has(codigo)) return "Google necesita que entres a mano esta vez.";
  if (codigo === "popup_closed_by_user") return "Cerraste la ventana de Google sin entrar.";
  if (codigo === "access_denied") return "No diste el permiso, así que no puedo abrir tu calendario.";
  if (codigo === "popup_failed_to_open")
    return "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio.";
  return `Google respondió: ${codigo}`;
}
