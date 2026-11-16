# FS Creative Studio: sitio web (v3 integrado)

Astro 7.4 + TypeScript, salida estática para GitHub Pages con el dominio `fscreativestudio.com` (`public/CNAME`).
Diseño v3 (`design/maqueta/index.html`, `design/tokens.css`), textos de `docs/05-textos.md` y SEO de `docs/03-seo.md`.

## Integración v3 (16/11)

- Estilos: `src/styles/tokens.css` (copia de `design/tokens.css`) + `maqueta.css` (CSS de la maqueta v3, sin lo exclusivo de la maqueta) + `global.css` (fuentes Geist autoalojadas, páginas internas, galería, modal).
- Home: `src/views/Home.astro` + `src/components/PhoneScreens.astro` + `src/scripts/home.ts` (hero logo→teléfono, historia de 5 pasos, redes). Común: `src/scripts/site.ts` (WhatsApp único por pantalla, menú móvil, aviso de idioma `fs_lang` solo en ES, revelado). Movimiento reducido: clase `.still` puesta en `<head>`.
- View Transitions: regla CSS `@view-transition { navigation: auto; }` (sin JS; ya no se usa `ClientRouter`).
- Logo, favicon e íconos: SVG oficiales en `public/logo/`, `public/favicon.svg`, `public/icons/` (sprite de `design/iconos/sprite.svg`). PWA: `public/manifest.webmanifest` (theme `#6D4AFF`) + PNG 180/192/512.
- og:image 1200×630 por idioma: `public/og/og-es.png` y `og-en.png`, generadas con `node scripts/og.mjs`.
- Demos reales: `cd ../demos && npm run build`, luego copiar `../demos/dist/*` a `public/demos/` (ids `cotizacion`, `tablero`, `asistente`; enlaces `/#demo-<id>`).
- QA: `npm run build && node scripts/qa.mjs` (Edge headless por CDP, escritorio 1440×900 y móvil 390×844; capturas en `test-output/capturas/`). El servidor de vista previa y Edge se cierran por PID.
- El asistente de WhatsApp es un SERVICIO (`/servicios/asistente-de-whatsapp/`); ya no hay ficha de herramienta duplicada. Las herramientas sin demanda propia (`subir-fotos`, `editar-web`) se publican con `noindex` y fuera del sitemap.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # tipos (astro check)
npm run build     # genera dist/
npm run preview   # sirve dist/
```

Necesita Node 22.23.4 o superior (probado con Node 24.14).

## Estructura

```
src/
  config/site.ts        URL, datos reales del negocio (teléfono, correo, redes) y FLAGS
  config/redirects.ts   URLs del sitio viejo -> nuevas
  i18n/langs.ts         idiomas: es (principal, en /) y en (en /en/), x-default
  i18n/routes.ts        mapa ÚNICO de rutas por idioma (slugs traducidos)
  i18n/ui.ts            textos de interfaz + enlaces de WhatsApp/teléfono
  i18n/pages.ts         textos de cada página (provisionales)
  i18n/alternates.ts    todas las páginas con su par es/en (sitemap)
  data/                 etapas, servicios, herramientas, galería, pagos (tipados en types.ts)
  data/index.ts         acceso a los datos con los flags de visibilidad ya aplicados
  demos/                registro de demos + interfaz + demos de prueba (stubs/)
  lib/schema.ts         JSON-LD (ProfessionalService, WebSite, Service, BreadcrumbList)
  layouts/Base.astro    <head> SEO, View Transitions, cabecera, pie, aviso de idioma, modal
  components/ views/    componentes y cuerpos de página compartidos por los dos idiomas
  pages/                rutas finas: es en la raíz y en en pages/en/
  scripts/              JS de cliente: idioma, modal de demos, registro del service worker
  styles/               tokens.css (provisional) + global.css
public/                 CNAME, robots.txt, manifest, íconos SVG, sw.js
```

## Rutas

| Página | Español | Inglés |
|---|---|---|
| Inicio | `/` | `/en/` |
| Servicios y precios | `/servicios/` | `/en/services/` |
| Servicio (generado) | `/servicios/<slug>/` | `/en/services/<slug>/` |
| Herramienta (generada) | `/herramientas/<slug>/` | `/en/tools/<slug>/` |
| Trabajo | `/trabajos/` | `/en/work/` |
| Sobre | `/sobre/` | `/en/about/` |
| Contacto | `/contacto/` | `/en/contact/` |
| Privacidad | `/privacidad/` | `/en/privacy/` |

- Todas las URLs terminan en barra (`trailingSlash: 'always'`).
- Los slugs de servicios/herramientas salen de los datos.
- `/herramientas/` y `/en/tools/` redirigen a `servicios#herramientas`.
- Cada página tiene canonical a sí misma, hreflang `es`/`en` y `x-default` (que apunta al español, el idioma principal; se cambia en `X_DEFAULT_LANG`). El sitemap (`/sitemap-index.xml`) lleva los mismos hreflang.

## Idioma (sin redirección automática)

- El selector de idioma es un `<a href>` real a la página equivalente.
- Si el navegador está en el otro idioma y no hay preferencia guardada, aparece un aviso discreto: "View this site in English?" en las páginas en español y "¿Ver este sitio en español?" en las páginas en inglés.
- "Sí", "No, gracias" y el selector guardan la elección en `localStorage` (`fs_lang`, siempre dentro de try/catch). Esa elección solo oculta el aviso: el sitio nunca redirige solo.

## Agregar un servicio o una herramienta

1. Agrega una entrada en `src/data/services.ts` (o en `tools.ts`) con `id`, `stage`, `visible`, `text.es` y `text.en`; cada uno lleva `slug`, `name`, `summary` e `includes`.
2. Campos opcionales:
   - `price: { setup?, from?, monthly? | monthlyFrom?, minMonths?, note? }`. Todos los montos se ven en la tarjeta. Ejemplos:

     | Servicio | `price` | Se muestra |
     |---|---|---|
     | Web | `{ setup: 250, from: true }` | "Desde USD 250" |
     | Redes | `{ setup: 450, note }` | "USD 450" |
     | Portal | `{ setup: 250, monthlyFrom: 25, minMonths: 12, note }` | "USD 250 + desde USD 25/mes (mínimo 12 meses)" |
     | Mantenimiento | `{ monthly: 25, minMonths: 0 }` | "USD 25/mes (mes a mes)" |

   - Sin `price`:
     - una herramienta que forma parte de un paquete con precio muestra "Incluida en <paquete>";
     - una herramienta de la categoría `medida` muestra "A cotizar" / "Custom quote" (`noPriceLabel` de la categoría);
     - lo demás muestra "Consúltanos" / "Ask us".

     Para publicar un precio después, basta con agregar `price`.
   - Una categoría con `afterStage` (como "Herramientas a tu medida") se muestra como bloque propio después de esa etapa en Servicios y precios.
   - `featured` (aparece en la home).
   - `demo` (id del registro de demos).
   - `tools` (ids de herramientas que incluye el servicio).
   - `capture` (solo herramientas: captura con datos de ejemplo).
3. Listo. La página, la tarjeta en Servicios, el sitemap, el hreflang y el JSON-LD `Service`/`Offer` se generan solos.

Si pones `visible: false`, la entrada no se publica en ninguna parte.

**Etapa "Empresa":** está construida pero oculta. Para activarla, cambia `FLAGS.showEmpresa` a `true` en `src/config/site.ts`; eso publica sus servicios, sus páginas y sus entradas del sitemap. Las etapas sin `number` (por ejemplo, "Para cualquier etapa") son bloques transversales.

## Integrar los tokens del diseñador (`design/tokens.css`)

`src/styles/tokens.css` es provisional, pero usa los **mismos nombres semánticos** que `design/tokens.css` v1. El mapeo es 1:1:

| Uso | Variable |
|---|---|
| Fondo, superficie | `--bg`, `--surface`, `--surface-2` |
| Líneas | `--line`, `--line-strong` |
| Texto | `--text`, `--text-2`, `--text-3` |
| Acento, botones, enlaces | `--accent`, `--accent-hover`, `--on-accent`, `--accent-soft` |
| Foco | `--focus` |
| Cabecera | `--header-bg` |
| Escenario (marcadores de capturas) | `--stage-bg`, `--stage-text` |
| Tipografía | `--font`, `--mono`, `--t-display`, `--t-h2`, `--t-h3`, `--t-lead`, `--t-small`, `--t-label`, `--lh-body`, `--lh-heading` |
| Espaciado y layout | `--s-*`, `--section-y`, `--gutter`, `--container`, `--measure` |
| Radios, sombra, movimiento, capas | `--r-*`, `--sh-2`, `--d-2`, `--ease-out`, `--z-header`, `--z-modal` |

Para integrar:

1. Copia `design/tokens.css` encima de `src/styles/tokens.css` (o reemplaza su contenido por `@import '../../../design/tokens.css';`).
2. Ejecuta `npm run build`.

Si el diseñador renombra alguna variable, ajusta la tabla y busca usos con `grep -r "var(--" src`.

Las fuentes Geist / Geist Mono todavía no se cargan (se usa la de sistema como respaldo). Cuando lleguen, se pueden autoalojar en WOFF2 con `preload`.

**Logo e íconos:** `src/components/Logo.astro` y `public/icons/*.svg` son provisionales; se reemplazan por los de `design/logo`. Además, conviene agregar PNG de 192 y 512 px, `apple-touch-icon` y una imagen OG de 1200×630.

## Integrar las demos (`demos/`)

Cada demo es un módulo que exporta esta interfaz (definida en `src/demos/types.ts`):

```ts
export function mountDemo(el: HTMLElement, opts: { lang: 'es' | 'en' }): void | Promise<void>;
export function unmount(): void; // limpiar temporizadores, listeners y nodos
```

Para integrar una demo:

1. Copia la demo a `src/demos/<id>/index.ts`, o impórtala desde `../../demos/...` si se mantiene allí.
2. En `src/demos/registry.ts`, cambia su `load: () => import('./<id>')`. Los ids actuales son `cotizacion`, `tablero` y `chatbot`, que hoy cargan los stubs de prueba de `src/demos/stubs/`. Para agregar una demo nueva, suma su id al tipo `DemoId` y su entrada en el registro.
3. Usa un botón `<DemoButton lang demo="<id>" />`, o cualquier `<button data-demo="<id>">`.

Comportamiento del modal (`<dialog>` con `showModal()`):

- El foco queda atrapado con Tab y Shift+Tab.
- Esc, el botón × y un clic en el fondo cierran el modal. Al cerrar se llama a `unmount()` y el foco vuelve al botón que lo abrió.
- La demo se descarga solo al abrir, con `import()` dinámico; se precarga al pasar el puntero o el foco por el botón.
- Enlace directo: `/#demo-<id>`.

Reglas para cada demo:

- Solo datos de ejemplo, sin llamadas de red reales.
- Estilos con prefijo propio o en Shadow DOM.
- `prefers-reduced-motion` respetado.

## Integrar los textos (`docs/05-textos.md`)

- Textos de páginas: `src/i18n/pages.ts`.
- Interfaz (menú, botones, aviso, modal, mensajes de WhatsApp): `src/i18n/ui.ts`.
- Servicios y herramientas: `text.es` / `text.en` en `src/data/*.ts`.
- Etapas: `src/data/stages.ts`.
- Formas de pago: `src/data/payments.ts`.

Reglas: voz de marca y tú en español; **no nombrar rubros ni oficios**; sin nombres de clientes; sin cifras inventadas. Si cambias un slug, la redirección del sitio viejo lo sigue sola. Revisa también los títulos SEO (`seoTitle`/`seoDescription`).

Para las capturas de la galería (Trabajo), pon los archivos en `public/capturas/` y completa `capture` en `src/data/gallery.ts` o `tools.ts`. Solo datos de ejemplo: sin nombres, teléfonos ni enlaces de clientes.

## Redirecciones del sitio viejo

El sitio viejo (`fs-publicar`) tenía el inglés en `/` y el español en `/es/`, con las rutas `contact`, `how-we-work`, `privacy`, `terms`, `work`, `solutions/` y `solutions/<management-systems|team-collaboration|process-automation|digital-platform|support-continuity>`.

GitHub Pages no permite 301 de servidor. Por eso `src/config/redirects.ts` hace que Astro genere, para cada URL vieja, una página con `<meta http-equiv="refresh" content="0;url=…">` + `canonical` + `noindex`. Google la trata como redirección permanente. Estas páginas no entran en el sitemap.

| Vieja | Nueva |
|---|---|
| `/contact/`, `/privacy/`, `/work/` | `/en/contact/`, `/en/privacy/`, `/en/work/` |
| `/terms/` | `/en/privacy/` |
| `/how-we-work/` | `/en/` |
| `/solutions/` | `/en/services/` |
| `/solutions/management-systems/`, `team-collaboration`, `process-automation` | `/en/services/online-office/` |
| `/solutions/digital-platform/` | `/en/services/website/` |
| `/solutions/support-continuity/` | `/en/services/maintenance/` |
| `/es/` | `/` |
| `/es/…` (las mismas) | equivalentes en español (`/contacto/`, `/privacidad/`, `/trabajos/`, `/servicios/…`) |

**Límite:** la home vieja `/` (inglés) no se puede redirigir, porque ahora es la home en español. Quien llegue con el navegador en inglés verá el aviso de idioma. Si hiciera falta un 301 real, se puede poner Cloudflare delante.

## PWA y service worker

- `public/manifest.webmanifest` con íconos SVG provisionales.
- `public/sw.js` (se registra solo en producción) es seguro para GitHub Pages:
  - páginas: red primero, con la última copia como respaldo sin conexión;
  - `/_astro/*` (archivos con hash): caché primero;
  - todo lo demás pasa directo a la red.
- Si cambias la estrategia, sube `VERSION` para borrar las cachés viejas.
- **Apagar el service worker:** reemplaza `sw.js` por uno que en `activate` borre las cachés y llame a `self.registration.unregister()`, y quita el import de `sw-register` en `Base.astro`.

## Publicar (no hecho; nada se publicó)

1. `npm run build` y revisa `dist/` (incluye `CNAME`, `robots.txt`, `sitemap-index.xml` y `404.html`).
2. Publica `dist/` en la rama o acción de GitHub Pages del repo del dominio (hoy lo sirve `fs-publicar`). Lo recomendable es una GitHub Action con `withastro/action` y `actions/deploy-pages`, con "Source: GitHub Actions" en la configuración de Pages.
3. Activa "Enforce HTTPS" y comprueba que `www` redirija al dominio sin www.
4. En Search Console, envía `https://fscreativestudio.com/sitemap-index.xml` y prueba un par de URLs viejas.

## Pendientes conocidos

- Textos finales, tokens, logo, fuentes, capturas y demos reales: los entregan los otros agentes.
- El JSON-LD usa `logo` en SVG. Google prefiere PNG de 112 px o más: agregarlo cuando exista el logo final.
- Sin analítica (la página de privacidad lo dice así; actualizarla si se agrega).
