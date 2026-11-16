import type { Lang } from '../i18n/langs';

export interface MountOptions {
  lang: Lang;
}

/**
 * Interfaz que debe exportar cada demo.
 * - mountDemo: pinta la demo dentro de `el` (un <div> vacío dentro del modal).
 *   Puede ser async. Debe usar solo datos de ejemplo y no hacer llamadas de red
 *   a servicios reales. Sus estilos deben ir con prefijo propio o en Shadow DOM.
 * - unmount: limpia temporizadores, listeners globales y nodos. Se llama al
 *   cerrar el modal (botón, Esc, clic fuera o cambio de página).
 */
export interface DemoModule {
  mountDemo(el: HTMLElement, opts: MountOptions): void | Promise<void>;
  unmount(): void;
}
