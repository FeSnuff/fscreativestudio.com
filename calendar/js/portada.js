/* La pantalla que se ve mientras la app se prepara.

   Cubre los tres estados del arranque: revisando si ya habías entrado,
   pidiendo que entres, y cargando. Cuando todo está listo se desvanece y le
   cede el paso a la pantalla real.

   El botón de entrar tiene que responder a un clic tuyo: los navegadores
   bloquean la ventana de Google si aparece sola.                            */

import * as arranque from "./arranque.js";

export async function abrir(arrancarPantalla) {
  const capa = document.createElement("div");
  capa.className = "portada";
  capa.innerHTML = `
    <div class="portada-caja">
      <div class="portada-marca">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <rect x="3" y="4.5" width="18" height="16" rx="2.5"/>
          <path d="M3 9.5h18M8 2.8v3.4M16 2.8v3.4"/>
          <path d="M7.5 13.5h3M7.5 17h3M13.5 13.5h3M13.5 17h3" stroke-width="2"/>
        </svg>
        <h1>Calendario</h1>
      </div>
      <p class="portada-estado" id="portadaEstado">Conectando…</p>
      <button type="button" class="portada-boton" id="portadaEntrar" hidden>
        <svg viewBox="0 0 18 18" width="17" height="17" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z"/><path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"/></svg>
        Entrar con Google
      </button>
      <p class="portada-nota" id="portadaNota"></p>
    </div>`;
  document.body.appendChild(capa);

  const estado = capa.querySelector("#portadaEstado");
  const boton = capa.querySelector("#portadaEntrar");
  const nota = capa.querySelector("#portadaNota");
  const decir = (t) => { estado.textContent = t; };

  const listo = () => {
    capa.classList.add("fuera");
    setTimeout(() => capa.remove(), 450);
  };

  const fallo = (e) => {
    decir("No pude abrir tu calendario");
    nota.textContent = e.message;
    boton.hidden = false;
    boton.textContent = "Reintentar";
  };

  try {
    await arranque.preparar(decir);
    await arrancarPantalla();
    listo();
    return;
  } catch (e) {
    if (!e.necesitaEntrar) return fallo(e);
  }

  // Hace falta un clic para que Google abra su ventana.
  decir("Tu calendario vive en tu propio Google Drive");
  nota.innerHTML = "La app solo puede ver el archivo que ella misma crea. " +
                   "No tiene acceso al resto de tu Drive.";
  boton.hidden = false;

  boton.addEventListener("click", async () => {
    boton.disabled = true;
    nota.textContent = "";
    try {
      await arranque.entrarYAbrir(decir);
      await arrancarPantalla();
      listo();
    } catch (e) {
      boton.disabled = false;
      fallo(e);
    }
  });
}
