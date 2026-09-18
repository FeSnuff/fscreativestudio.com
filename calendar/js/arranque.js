/* El arranque común de las dos pantallas.

   Antes de que la TV o Gestión puedan pintar nada hacen falta tres cosas:
   entrar con Google, saber cuál es la hoja de cálculo, y cargarla. Aquí se
   hacen en orden y se muestra por dónde va, porque la primera vez incluye
   crear la hoja y eso tarda un par de segundos.

   La hoja se recuerda en este dispositivo. Si no hay ninguna recordada, se
   busca entre los archivos que esta misma app creó (drive.file solo ve
   esos); si tampoco, se crea una nueva.                                     */

import * as auth from "./auth.js";
import * as sheets from "./sheets.js";
import * as datos from "./datos.js";
import { CLIENT_ID, NOMBRE_HOJA } from "./config.js";

const RECORDADA = "calendario_hoja_id";

export const hojaRecordada = () => {
  try { return localStorage.getItem(RECORDADA); } catch { return null; }
};
const recordar = (id) => { try { localStorage.setItem(RECORDADA, id); } catch {} };
export const olvidarHoja = () => { try { localStorage.removeItem(RECORDADA); } catch {} };

/** Prepara todo. `avisar(texto)` recibe por dónde va, para poder mostrarlo.
    Devuelve { id } o lanza un error ya explicado en español. */
export async function preparar(avisar = () => {}) {
  avisar("Conectando con Google…");
  const revivio = await auth.iniciar(CLIENT_ID, (e) => {
    if (!e.dentro) document.documentElement.dataset.sesion = "fuera";
  });
  if (!revivio) {
    const err = new Error("hace falta entrar");
    err.necesitaEntrar = true;
    throw err;
  }
  return abrir(avisar);
}

/** Después de que el usuario tocó "Entrar con Google". */
export async function entrarYAbrir(avisar = () => {}) {
  await auth.entrar();
  return abrir(avisar);
}

async function abrir(avisar) {
  let id = hojaRecordada();

  if (!id) {
    avisar("Buscando tu calendario…");
    const previas = await sheets.buscarExistente();
    if (previas.length) {
      id = previas[0].id;
    } else {
      avisar("Creando tu calendario en Drive… (solo pasa esta vez)");
      const nueva = await sheets.crear(NOMBRE_HOJA);
      id = nueva.id;
    }
    recordar(id);
  }

  avisar("Cargando tus actividades…");
  try {
    await datos.iniciar(id);
  } catch (e) {
    // Si la hoja recordada ya no existe (la borraron del Drive), empezamos de nuevo
    if (/no encuentro la hoja/i.test(e.message)) {
      olvidarHoja();
      return abrir(avisar);
    }
    throw e;
  }
  return { id };
}

export const urlHoja = (id) => `https://docs.google.com/spreadsheets/d/${id}/edit`;
export { auth, datos };
