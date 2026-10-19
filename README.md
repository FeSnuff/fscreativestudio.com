# FS Creative Studio: sitio web

Sitio bilingüe (inglés por defecto, español en `/es/`) hecho con **Astro 7.4 + Tailwind 4.3** (Vite 8).
Animaciones con **GSAP + ScrollTrigger + Flip** (licencia gratuita) y scroll suave con **Lenis**.
Es un sitio estático: no necesita servidor ni base de datos.

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Nombre, teléfono, WhatsApp, ubicación, clave del formulario | `src/data/site.ts` |
| Textos de todas las páginas (EN y ES) | `src/i18n/ui.ts` |
| Las 5 soluciones (EN y ES) | `src/data/solutions.ts` |
| Colores y tipografías | `src/styles/global.css` (bloque `@theme`) |
| Animaciones | `src/scripts/motion.ts` |
| Logo, favicon e imagen para redes | `public/brand/`, `public/favicon.png` |
| Dominio | `public/CNAME` |

## Pendientes antes de publicar

1. Escribe tu nombre en `ownerName` dentro de `src/data/site.ts`.
2. Formulario de contacto: si dejas `web3formsKey` vacío, el formulario abre WhatsApp con el mensaje ya escrito.
   Si quieres recibirlo por correo, crea una clave gratuita en https://web3forms.com y pégala ahí.
3. Revisa el horario de atención en `src/i18n/ui.ts` (busca `hours:`).
4. Revisa las páginas de Privacidad y Términos. Son una base general, no asesoría legal.

## Ver el sitio en tu PC

Requiere **Node.js 22.22 o superior** (Astro 7 lo exige). Recomendado: Node 24 LTS.

```
npm install
npm run dev
```

Abre http://localhost:4321

## Publicar en GitHub Pages (recomendado)

1. Sube el contenido de esta carpeta a tu repositorio `fscreativestudio.com`, reemplazando el sitio anterior.
   Antes, guarda el sitio viejo en otra rama o carpeta de respaldo.
2. En GitHub, ve a **Settings → Pages → Source** y elige **GitHub Actions**.
3. Crea la carpeta `.github/workflows/` y mueve ahí el archivo `MOVER-a-.github-workflows-deploy.yml` con el nombre `deploy.yml`.
   No pude crearla directamente porque tu PC protege las carpetas que empiezan con punto.
4. Cada vez que subas cambios a `main`, ese archivo compila y publica el sitio solo.
5. El dominio se mantiene gracias a `public/CNAME`.

## Publicar a mano (sin GitHub Actions)

`npm run build` genera la carpeta `dist/`. Sube el contenido de `dist/` a cualquier hosting estático.
El archivo `sitio-compilado.zip` ya trae esa carpeta lista.
