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

let cliente = null;
let token = null;
let caducaEn = 0;
let correo = null;
let temporizador = null;
let alCambiar = () => {};

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
  programarRenovacion();
  alCambiar({ dentro: true });
}

function programarRenovacion() {
  clearTimeout(temporizador);
  const falta = Math.max(30_000, caducaEn - Date.now() - MARGEN_MS);
  temporizador = setTimeout(() => renovar().catch(() => {}), falta);
}

/** Pide un token sin mostrar ventana. Falla si Google ya no reconoce la
    sesión, y en ese caso hay que volver a entrar con un clic. */
function renovar() {
  return new Promise((ok, mal) => {
    if (!cliente) return mal(new Error("sin cliente"));
    cliente.callback = (r) => {
      if (r.error) { alCambiar({ dentro: false, motivo: r.error }); return mal(new Error(r.error)); }
      guardarToken(r); ok(token);
    };
    try { cliente.requestAccessToken({ prompt: "" }); }
    catch (e) { mal(e); }
  });
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
  // Si ya entró antes en este navegador, intentamos revivir la sesión sola.
  let previo = false;
  try { previo = localStorage.getItem("entro_alguna_vez") === "1"; } catch {}
  if (previo) {
    try { await renovar(); return true; } catch { return false; }
  }
  return false;
}

/** Con un clic del usuario. La primera vez muestra el consentimiento. */
export function entrar() {
  return new Promise((ok, mal) => {
    if (!cliente) return mal(new Error("Llama a iniciar() primero"));
    cliente.callback = (r) => {
      if (r.error) return mal(new Error(descripcion(r.error)));
      guardarToken(r); ok(token);
    };
    cliente.requestAccessToken({ prompt: "consent" });
  });
}

export function salir() {
  const t = token;
  token = null; caducaEn = 0; correo = null;
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

/** Correo de la cuenta, solo para mostrarlo. Se pide una vez. */
export async function cuenta() {
  if (correo) return correo;
  const t = await vigente();
  try {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo",
                          { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) return null;
    correo = (await r.json()).email || null;
  } catch { correo = null; }
  return correo;
}

function descripcion(codigo) {
  if (codigo === "popup_closed_by_user") return "Cerraste la ventana de Google sin entrar.";
  if (codigo === "access_denied") return "No diste el permiso, así que no puedo abrir tu calendario.";
  if (codigo === "popup_failed_to_open")
    return "El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio.";
  return `Google respondió: ${codigo}`;
}
