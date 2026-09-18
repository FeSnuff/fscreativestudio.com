/* Reemplaza a auth.js durante las pruebas, vía import map.
   Devuelve siempre un token y nunca habla con Google.                       */

export async function iniciar() { return true; }
export function entrar() { return Promise.resolve("token-de-prueba"); }
export function salir() {}
export const dentro = () => true;
export async function vigente() { return "token-de-prueba"; }
export async function cuenta() { return "prueba@ejemplo.com"; }
