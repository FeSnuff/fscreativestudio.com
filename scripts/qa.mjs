/**
 * QA del sitio compilado con Edge headless por CDP (sin dependencias).
 * - Levanta `astro preview` (puerto 4329) y lo apaga por PID al terminar.
 * - Escritorio 1440×900 y móvil 390×844 táctil; movimiento forzado a "no-preference" (Edge headless
 *   informa "reduce") y una pasada aparte con "reduce" para la versión estática.
 * - Recorre la home, cada página ES/EN, el menú móvil, el aviso de idioma (navegador en inglés) y las
 *   demos (PDF real, firma, pagado, asistente, tablero). Comprueba wa.me/tel:, consola y scroll horizontal.
 * - Capturas en test-output/capturas/.
 * Uso: npm run build && node scripts/qa.mjs [home|demos|pages|reduced|lang]
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { killPid, launch, sleep } from './cdp.mjs';

const HERE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(HERE, 'test-output', 'capturas');
const DL = join(HERE, 'test-output', 'descargas');
const PORT = Number(process.env.QA_PORT || 4329);
const BASE = `http://127.0.0.1:${PORT}`;
mkdirSync(OUT, { recursive: true });
rmSync(DL, { recursive: true, force: true });
mkdirSync(DL, { recursive: true });

let failed = 0;
const check = (ok, msg) => {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${msg}`);
  if (!ok) failed++;
};
const shotPath = (n) => join(OUT, `${n}.png`);

const preview = spawn(process.execPath, [join(HERE, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--port', String(PORT), '--host', '127.0.0.1'], { cwd: HERE, stdio: 'ignore' });
console.log(`preview pid ${preview.pid}`);
for (let i = 0; i < 80; i++) {
  try {
    if ((await fetch(`${BASE}/`)).ok) break;
  } catch {
    /* aún no */
  }
  await sleep(250);
}

const ES_PAGES = ['/servicios/', '/servicios/pagina-web/', '/servicios/todas-tus-redes/', '/servicios/oficina-en-linea/', '/servicios/asistente-de-whatsapp/', '/servicios/mantenimiento/', '/herramientas/cotizador/', '/herramientas/calculadora-de-precio/', '/trabajos/', '/sobre/', '/contacto/', '/privacidad/'];
const EN_PAGES = ['/en/', '/en/services/', '/en/services/website/', '/en/services/online-office/', '/en/services/whatsapp-assistant/', '/en/tools/quote-builder/', '/en/work/', '/en/about/', '/en/contact/', '/en/privacy/'];

async function pageChecks(p, tag) {
  const hs = await p.eval('document.documentElement.scrollWidth - document.documentElement.clientWidth');
  check(hs <= 0, `${tag}: sin scroll horizontal (${hs}px de más)`);
  const bad = await p.eval(`[...document.querySelectorAll('a[href*="wa.me"]')].filter(a => !/^https:\\/\\/wa\\.me\\/15713156093\\?text=.+/.test(a.href)).length`);
  const nWa = await p.eval(`document.querySelectorAll('a[href*="wa.me"]').length`);
  check(nWa > 0 && bad === 0, `${tag}: ${nWa} enlaces wa.me con número y mensaje prellenado`);
  const tel = await p.eval(`[...document.querySelectorAll('a[href^="tel:"]')].every(a => a.getAttribute('href') === 'tel:+15713156093')`);
  check(tel, `${tag}: enlaces tel: correctos`);
  const h1 = await p.eval(`document.querySelectorAll('h1').length`);
  check(h1 === 1, `${tag}: un solo h1 (${h1})`);
}

async function scrollTo(p, y, wait = 700) {
  await p.eval(`window.scrollTo({ top: ${y}, behavior: 'instant' })`);
  await sleep(wait);
}
const storyY = (p, k) => p.eval(`(() => { const s = document.getElementById('historia'), sc = document.getElementById('scene'); const span = s.offsetHeight - sc.offsetHeight; return Math.round(s.offsetTop + span * ((${k} - 1) + .88) / 5) })()`);
const topOf = (p, sel) => p.eval(`Math.round(document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY)`);

async function waitDownload(prefix, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const f = readdirSync(DL).find((n) => n.startsWith(prefix) && n.endsWith('.pdf'));
    if (f) {
      await sleep(300);
      return join(DL, f);
    }
    await sleep(150);
  }
  return null;
}
const isPdf = (f) => !!f && existsSync(f) && readFileSync(f).subarray(0, 5).toString() === '%PDF-';

async function home(b, mobile) {
  const pre = mobile ? 'm' : 'd';
  const p = await b.newPage(mobile ? { width: 390, height: 844, mobile: true } : { width: 1440, height: 900 });
  await p.goto(`${BASE}/`, 2600);
  check(await p.eval(`!document.documentElement.classList.contains('still')`), `${pre} home: animaciones activas (no-preference forzado)`);
  check(await p.eval(`getComputedStyle(document.getElementById('logo3d')).display === 'none'`), `${pre} home: el logo FS 3D ya se abrió en el teléfono`);
  await p.shot(shotPath(`${pre}-01-hero-web`));
  check(await p.waitFor(`document.getElementById('offer').classList.contains('off')`, 9000), `${pre} home: el teléfono del hero pasa de la web a la oficina`);
  await sleep(1200);
  await p.shot(shotPath(`${pre}-01b-hero-oficina`));
  // Pausa visible (WCAG 2.2.2)
  await p.eval(`document.getElementById('hero-pause').click()`);
  const scr0 = await p.eval(`[...document.querySelectorAll('#hscreen .scr2')].findIndex(e => e.classList.contains('on'))`);
  await sleep(5000);
  const scr1 = await p.eval(`[...document.querySelectorAll('#hscreen .scr2')].findIndex(e => e.classList.contains('on'))`);
  check(await p.eval(`document.getElementById('hero-pause').getAttribute('aria-pressed') === 'true' && document.documentElement.classList.contains('hero-paused')`) && scr0 === scr1, `${pre} hero: el botón de pausa detiene el bucle (pantalla ${scr0} → ${scr1} en 5 s)`);
  await p.shot(shotPath(`${pre}-01d-hero-pausa`));
  await p.eval(`document.getElementById('hero-pause').click()`);
  check(await p.eval(`document.getElementById('hero-pause').getAttribute('aria-pressed') === 'false'`), `${pre} hero: se puede reanudar`);
  await pageChecks(p, `${pre} home`);
  const names = ['paso1-web', 'paso2-cotiza', 'paso3-pdf', 'paso4-firma', 'paso5-pagado'];
  for (let k = 1; k <= 5; k++) {
    await scrollTo(p, await storyY(p, k), 900);
    const on = await p.eval(`document.querySelector('.st2.on')?.dataset.step`);
    check(on === String(k), `${pre} historia: paso ${k} activo (${on})`);
    await p.shot(shotPath(`${pre}-0${k + 1}-${names[k - 1]}`));
  }
  const acc = await p.eval(`getComputedStyle(document.getElementById('scene')).getPropertyValue('--acc').trim()`);
  check(/4ADE80/i.test(acc), `${pre} historia: acento del paso 5 = verde éxito (${acc})`);
  const chanTop = await topOf(p, '#chan');
  await scrollTo(p, chanTop - (mobile ? 640 : 760), 600);
  await p.shot(shotPath(`${pre}-07a-redes-antes`));
  await scrollTo(p, chanTop - (mobile ? 120 : 140), 900);
  check((await p.eval(`document.getElementById('chan').dataset.state`)) === 'after', `${pre} redes: pasa a "después" al bajar`);
  const icoMax = await p.eval(`Math.max(...[...document.querySelectorAll('#chan .ci svg')].map(s => Math.max(s.getBoundingClientRect().width, s.getBoundingClientRect().height)))`);
  check(icoMax <= 24, `${pre} redes: íconos de marca de tamaño normal (${Math.round(icoMax)} px)`);
  check(await p.eval(`[...document.querySelectorAll('#chan .sub .b')].every(e => e.getAttribute('aria-hidden') === 'true')`), `${pre} redes: el lector no lee "antes" y "después" a la vez`);
  await p.shot(shotPath(`${pre}-07b-redes-despues`));
  await scrollTo(p, (await topOf(p, '#herramientas')) - 80, 900);
  await p.shot(shotPath(`${pre}-08-incluido-a-medida`));
  await scrollTo(p, (await topOf(p, '#precios')) - 70, 900);
  await p.shot(shotPath(`${pre}-09-precios`));
  await scrollTo(p, (await topOf(p, '#cierre')) - (mobile ? 64 : 120), 900);
  check(await p.eval(`document.getElementById('hdr').classList.contains('hero-cta-visible')`), `${pre} cierre: el WhatsApp del header se oculta (un solo WhatsApp por pantalla)`);
  await p.shot(shotPath(`${pre}-10-cierre`));
  await scrollTo(p, 999999, 700);
  await p.shot(shotPath(`${pre}-11-footer`));
  check(p.errors.length === 0, `${pre} home: sin errores JS ${p.errors.join(' | ')}`);
  check(p.logs.length === 0, `${pre} home: consola limpia ${p.logs.join(' | ')}`);
  if (mobile) {
    await scrollTo(p, 0, 400);
    const r = await p.eval(`(() => { const r = document.getElementById('menu-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()`);
    await p.tap(r.x, r.y);
    await sleep(400);
    check(await p.eval(`!document.getElementById('mmenu').hidden && document.getElementById('menu-btn').getAttribute('aria-expanded') === 'true'`), 'm menú: se abre con un toque (aria-expanded=true)');
    check(await p.eval(`document.activeElement?.closest('#mmenu') !== null`), 'm menú: el foco entra al menú');
    await p.shot(shotPath('m-01d-menu'));
    await p.s('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(200);
    check(await p.eval(`document.getElementById('mmenu').hidden && document.activeElement?.id === 'menu-btn'`), 'm menú: Esc lo cierra y devuelve el foco');
  }
  await p.close();
}

async function demos(b, mobile) {
  const pre = mobile ? 'm' : 'd';
  const p = await b.newPage(mobile ? { width: 390, height: 844, mobile: true, downloadPath: DL } : { width: 1440, height: 900, downloadPath: DL });
  await p.goto(`${BASE}/#demo-cotizacion`, 800);
  check(await p.waitFor(`document.querySelector('#demo-modal[open] .fsd-quote .fsd-q-line')`, 10000), `${pre} demo cotización: abre por /#demo-cotizacion con datos`);
  const total = await p.eval(`document.querySelector('.fsd-q-total__v').textContent`);
  check(total === '$455.00', `${pre} demo cotización: total de la lista única ${total}`);
  await p.shot(shotPath(`${pre}-12-modal-cotizacion`));
  if (!mobile) {
    await p.eval(`document.querySelector('.fsd-q-actions .fsd-btn:not(.fsd-btn--primary)').click()`);
    const f = await waitDownload('cotizacion-1042-ejemplo');
    check(isPdf(f), `${pre} demo cotización: PDF real descargado (%PDF) ${f ? readFileSync(f).length + ' bytes' : ''}`);
  }
  await p.eval(`document.querySelector('.fsd-q-actions .fsd-btn--primary').click()`);
  await sleep(300);
  await p.eval(`document.querySelector('.fsd-q-actions .fsd-btn--primary').click()`);
  await sleep(200);
  check(await p.eval(`/Falta la firma|Signature missing/.test(document.querySelector('.fsd-q-err').textContent) && !!document.querySelector('.fsd-q-pad__canvas')`), `${pre} demo firma: no deja firmar con el lienzo vacío`);
  check(await p.eval(`getComputedStyle(document.querySelector('.fsd-q-pad__canvas')).touchAction === 'none'`), `${pre} demo firma: canvas con touch-action: none`);
  const c = await p.eval(`(() => { const e = document.querySelector('.fsd-q-pad__canvas'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width } })()`);
  const pts = Array.from({ length: 24 }, (_, i) => ({ x: c.x - c.w * 0.35 + (c.w * 0.7 * i) / 23, y: c.y + Math.sin(i / 2) * 22 }));
  if (mobile) {
    await p.s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pts[0]] });
    for (const q of pts.slice(1)) {
      await p.s('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [q] });
      await sleep(12);
    }
    await p.s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await p.s('Input.dispatchMouseEvent', { type: 'mousePressed', x: pts[0].x, y: pts[0].y, button: 'left', clickCount: 1 });
    for (const q of pts.slice(1)) await p.s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: q.x, y: q.y, button: 'left', buttons: 1 });
    const l = pts[pts.length - 1];
    await p.s('Input.dispatchMouseEvent', { type: 'mouseReleased', x: l.x, y: l.y, button: 'left', clickCount: 1 });
  }
  await sleep(200);
  check(await p.eval(`document.querySelector('.fsd-q-err').textContent === ''`), `${pre} demo firma: firmar con ${mobile ? 'el dedo' : 'el mouse'} quita el aviso`);
  await p.eval(`document.getElementById('fsd-q-agree').click()`);
  await p.eval(`document.querySelector('.fsd-q-actions .fsd-btn--primary').click()`);
  check(await p.waitFor(`document.querySelector('.fsd-q-signed__img')`), `${pre} demo firma: firmado y aceptado`);
  await p.eval(`document.querySelector('.fsd-q-actions .fsd-btn--primary').click()`);
  check(await p.waitFor(`/Pagado ✓|Paid ✓/.test(document.querySelector('.fsd-q-stamp')?.textContent ?? '')`), `${pre} demo: sello "Pagado ✓"`);
  await sleep(900);
  await p.shot(shotPath(`${pre}-13-modal-pagado`));
  if (!mobile) {
    await p.eval(`document.querySelector('.fsd-q-actions .fsd-btn:not(.fsd-btn--primary)').click()`);
    const f = await waitDownload('cotizacion-1042-firmada');
    check(isPdf(f), `${pre} demo: contrato firmado en PDF real (%PDF) ${f ? readFileSync(f).length + ' bytes' : ''}`);
  }
  await p.eval(`document.querySelector('[data-demo-close]').click()`);
  await sleep(200);
  check(await p.eval(`!document.getElementById('demo-modal').open && !location.hash`), `${pre} modal: se cierra y limpia el enlace`);
  await p.eval(`document.querySelector('[data-demo="asistente"]').click()`);
  check(await p.waitFor(`document.querySelectorAll('.fsd-c-chip').length === 3`, 10000), `${pre} demo asistente: guion con 3 preguntas`);
  await p.eval(`document.querySelectorAll('.fsd-c-chip')[0].click()`);
  check(await p.waitFor(`!document.querySelector('.fsd-c-end').hidden`, 12000), `${pre} demo asistente: pasa a una persona y cierra`);
  check(await p.eval(`/Una persona de Tu Negocio te confirma precio y fecha/.test(document.querySelector('.fsd-c-log').textContent)`), `${pre} demo asistente: "una persona de Tu Negocio te confirma precio y fecha"`);
  await sleep(300);
  await p.shot(shotPath(`${pre}-14-modal-asistente`));
  await p.eval(`document.querySelector('[data-demo-close]').click()`);
  await p.eval(`document.querySelector('[data-demo="tablero"]').click()`);
  check(await p.waitFor(`document.querySelectorAll('.fsd-j-card').length === 5`, 10000), `${pre} demo tablero: 5 trabajos`);
  await p.eval(`document.querySelector('[data-move="j5:1"]').click()`);
  check(await p.eval(`document.querySelector('[data-id="j5"]').closest('[data-col]').dataset.col === 'road'`), `${pre} demo tablero: mover un trabajo`);
  await p.shot(shotPath(`${pre}-15-modal-tablero`));
  check(p.errors.length === 0, `${pre} demos: sin errores JS ${p.errors.join(' | ')}`);
  check(p.logs.length === 0, `${pre} demos: consola limpia ${p.logs.join(' | ')}`);
  await p.close();
}

async function pages(b, mobile) {
  const pre = mobile ? 'm' : 'd';
  const p = await b.newPage(mobile ? { width: 390, height: 844, mobile: true } : { width: 1440, height: 900 });
  for (const path of [...ES_PAGES, ...EN_PAGES]) {
    p.errors.length = 0;
    p.logs.length = 0;
    await p.goto(`${BASE}${path}`, 500);
    const tag = `${pre} ${path}`;
    await pageChecks(p, tag);
    const lang = await p.eval('document.documentElement.lang');
    check(lang === (path.startsWith('/en/') ? 'en' : 'es'), `${tag}: lang=${lang}`);
    check(await p.eval(`document.querySelectorAll('link[rel=alternate][hreflang]').length === 3 && !!document.querySelector('link[rel=canonical]') && !!document.querySelector('meta[property="og:image"]')`), `${tag}: canonical, hreflang es/en/x-default y og:image`);
    if (path.startsWith('/en/')) check(await p.eval(`!document.getElementById('langnote')`), `${tag}: sin aviso de idioma en EN`);
    check(p.errors.length === 0 && p.logs.length === 0, `${tag}: consola limpia ${[...p.errors, ...p.logs].join(' | ')}`);
    await p.shot(shotPath(`${pre}-p-${path.replace(/^\/|\/$/g, '').replace(/\//g, '_')}`));
  }
  for (const path of ['/servicios/', '/trabajos/', '/sobre/', '/contacto/', '/en/services/']) {
    await p.goto(`${BASE}${path}`, 500);
    await p.eval(`document.querySelectorAll('.rv').forEach(e => { e.classList.add('in'); e.style.animation = 'none'; e.style.opacity = 1; e.style.transform = 'none' })`);
    await p.shot(shotPath(`${pre}-full-${path.replace(/^\/|\/$/g, '').replace(/\//g, '_')}`), { full: true });
  }
  await p.goto(`${BASE}/trabajos/`, 400);
  await p.eval(`document.querySelector('[data-kind="whatsapp"]').click()`);
  check((await p.eval(`[...document.querySelectorAll('[data-gal] > li')].filter(l => !l.hidden).length`)) === 1, `${pre} trabajos: filtro WhatsApp`);
  const r = await fetch(`${BASE}/no-existe/`);
  check(r.status === 404, `404: estado ${r.status}`);
  await p.goto(`${BASE}/no-existe/`, 400);
  check(await p.eval(`/Esta página se fue sin avisar/.test(document.body.textContent) && /This page left without notice/.test(document.body.textContent) && !!document.querySelector('meta[name=robots][content*=noindex]')`), `${pre} 404 bilingüe y noindex`);
  await p.shot(shotPath(`${pre}-p-404`));
  await p.close();
}

async function narrow(b) {
  const p = await b.newPage({ width: 320, height: 640, mobile: true });
  for (const path of ['/', '/en/', '/servicios/', '/en/services/', '/contacto/', '/trabajos/']) {
    await p.goto(`${BASE}${path}`, 500);
    const sw = await p.eval('document.documentElement.scrollWidth');
    const menu = await p.eval(`document.getElementById('menu-btn').getBoundingClientRect().right`);
    check(sw <= 320 && menu <= 320, `320 px ${path}: sin desborde (scrollWidth ${sw}, botón de menú termina en ${Math.round(menu)})`);
    const cut = await p.eval(`[...document.querySelectorAll('main :is(h1,h2,h3,p,li,a.btn,button)')].filter(e => !e.closest('[aria-hidden="true"],.jump,.chan,.m-demo') && e.getClientRects().length && e.getBoundingClientRect().right > innerWidth + 1).map(e => e.tagName + ':' + e.textContent.trim().slice(0, 30))`);
    check(cut.length === 0, `320 px ${path}: ningún texto recortado ${cut.slice(0, 3).join(' | ')}`);
    if (path === '/') await p.shot(shotPath('m-320-home'));
    if (path === '/servicios/') await p.shot(shotPath('m-320-servicios'));
  }
  await p.close();
}

async function backButton(b) {
  const p = await b.newPage({ width: 390, height: 844, mobile: true });
  await p.goto(`${BASE}/servicios/`, 400);
  await p.goto(`${BASE}/`, 800);
  await p.eval(`document.querySelector('[data-demo="tablero"]').click()`);
  check(await p.waitFor(`document.getElementById('demo-modal').open && location.hash === '#demo-tablero'`, 8000), 'Atrás: demo abierta');
  await p.eval('history.back()');
  await sleep(800);
  check(await p.eval(`!document.getElementById('demo-modal').open && location.pathname === '/' && !location.hash`), 'Atrás: el botón Atrás cierra la demo y se queda en la home');
  await p.eval(`document.querySelector('[data-demo="cotizacion"]').click()`);
  await p.waitFor(`document.getElementById('demo-modal').open`, 5000);
  await p.eval(`document.querySelector('[data-demo-close]').click()`);
  await sleep(600);
  await p.eval('history.back()');
  await sleep(1200);
  check(await p.eval(`location.pathname === '/servicios/'`), 'Atrás: cerrar con la X no deja una entrada de más en el historial');
  check(p.errors.length === 0, `Atrás: sin errores JS ${p.errors.join(' | ')}`);
  await p.close();
}

async function heroEn(b) {
  const p = await b.newPage({ width: 1440, height: 900 });
  await p.goto(`${BASE}/en/`, 2600);
  let spanish = false;
  for (let i = 0; i < 16; i++) {
    if (await p.eval(`!!document.querySelector('#hscreen .web.en-on') || [...document.querySelectorAll('#hscreen .scr2.on')].some(e => /Cotizaci|Servicio|Pagado|Firmar/.test(e.innerText))`)) spanish = true;
    await sleep(1000);
  }
  check(!spanish, 'hero EN: el teléfono nunca muestra español (16 s de bucle)');
  await p.shot(shotPath('d-01-hero-web-en'));
  await p.close();
}

async function reduced(b, mobile) {
  const pre = mobile ? 'm' : 'd';
  const p = await b.newPage(mobile ? { width: 390, height: 844, mobile: true, reducedMotion: 'reduce' } : { width: 1440, height: 900, reducedMotion: 'reduce' });
  await p.goto(`${BASE}/`, 800);
  check(await p.eval(`document.documentElement.classList.contains('still')`), `${pre} movimiento reducido: versión estática`);
  check(await p.eval(`document.querySelectorAll('.st2 .mini').length === 5 && getComputedStyle(document.getElementById('logo3d')).display === 'none'`), `${pre} movimiento reducido: sin logo animado; 5 pasos con su pantalla final`);
  check(await p.eval(`document.getElementById('chan').dataset.state === 'after'`), `${pre} movimiento reducido: redes en "después"`);
  await scrollTo(p, await topOf(p, '#historia'), 300);
  await p.shot(shotPath(`${pre}-16-estatico`));
  await pageChecks(p, `${pre} home estática`);
  check(p.errors.length === 0, `${pre} estática: sin errores JS ${p.errors.join(' | ')}`);
  await p.close();
}

async function langNotice() {
  const b = await launch({ port: 9466, lang: 'en-US' });
  try {
    const p = await b.newPage({ width: 1440, height: 900 });
    await p.goto(`${BASE}/`, 900);
    check(await p.eval(`navigator.languages[0].startsWith('en')`), 'aviso: navegador en inglés');
    check(await p.eval(`!document.getElementById('langnote').hidden`), 'aviso: aparece en ES con navegador en inglés');
    check(await p.eval(`(() => { const n = document.getElementById('langnote'); return getComputedStyle(n).position === 'fixed' && n.getAttribute('role') === 'region' && n.querySelector('[aria-live="polite"]')?.textContent === 'View this site in English?' })()`), 'aviso: superpuesto (sin CLS), role="region" y aria-live="polite"');
    await p.shot(shotPath('d-01c-aviso-idioma'));
    // Teclado: Tab NO lo cierra y se llega a "Yes, English"
    let reached = false;
    for (let i = 0; i < 4 && !reached; i++) {
      await p.s('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await p.s('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await sleep(150);
      reached = await p.eval(`document.activeElement?.classList.contains('ln-yes')`);
    }
    check(reached && (await p.eval(`!document.getElementById('langnote').hidden`)), 'aviso: con Tab se llega a "Yes, English" sin que se cierre');
    await sleep(8000);
    check(await p.eval(`!document.getElementById('langnote').hidden`), 'aviso: con el foco dentro, el tiempo se pausa');
    await p.shot(shotPath('d-01e-aviso-teclado'));
    await p.s('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(500);
    check(await p.eval(`document.getElementById('langnote').hidden && localStorage.getItem('fs_lang') === null && localStorage.getItem('fs_lang_notice') === '1'`), 'aviso: Esc lo cierra; sin elección no guarda fs_lang (solo "visto")');
    // Se oculta solo y no guarda idioma
    await p.eval(`localStorage.clear()`);
    await p.goto(`${BASE}/`, 900);
    check(await p.waitFor(`document.getElementById('langnote').hidden`, 9500), 'aviso: se oculta solo (~7 s)');
    check((await p.eval(`localStorage.getItem('fs_lang')`)) === null, 'aviso: al ocultarse solo NO guarda fs_lang');
    await p.goto(`${BASE}/servicios/`, 900);
    check(await p.eval(`document.getElementById('langnote').hidden`), 'aviso: no reaparece tras verlo (otra página)');
    await p.goto(`${BASE}/en/`, 500);
    check(await p.eval(`!document.getElementById('langnote')`), 'aviso: nunca existe en /en/');
    // "Seguir en español"
    await p.eval(`localStorage.clear()`);
    await p.goto(`${BASE}/sobre/`, 900);
    await p.eval(`document.querySelector('#langnote .ln-no').click()`);
    await sleep(500);
    check((await p.eval(`localStorage.getItem('fs_lang')`)) === 'es', '"Seguir en español": guarda fs_lang=es');
    // "Yes, English"
    await p.eval(`localStorage.clear()`);
    await p.goto(`${BASE}/contacto/`, 900);
    check(await p.eval(`!document.getElementById('langnote').hidden`), 'aviso: vuelve a salir sin preferencia guardada');
    await p.eval(`document.querySelector('#langnote .ln-yes').click()`);
    await sleep(1500);
    check((await p.eval('location.pathname')) === '/en/contact/' && (await p.eval(`localStorage.getItem('fs_lang')`)) === 'en', '"Yes, English": va a la página equivalente y guarda fs_lang=en');
    await p.goto(`${BASE}/`, 900);
    check(await p.eval(`document.getElementById('langnote').hidden`), 'aviso: tras elegir inglés no reaparece en ES');
    await p.eval(`localStorage.clear()`);
    const m = await b.newPage({ width: 390, height: 844, mobile: true });
    await m.goto(`${BASE}/`, 900);
    await m.shot(shotPath('m-01c-aviso-idioma'));
    check(await m.eval(`(() => { const r = document.getElementById('langnote').getBoundingClientRect(); return !document.getElementById('langnote').hidden && r.bottom > innerHeight - 140 })()`), 'aviso móvil: visible abajo, sin tapar el titular');
    await p.close();
    await m.close();
  } finally {
    await b.close();
  }
}

const only = process.argv[2];
try {
  const b = await launch({ port: 9465, lang: 'es-US' });
  try {
    if (!only || only === 'home') {
      await home(b, false);
      await home(b, true);
    }
    if (!only || only === 'demos') {
      await demos(b, false);
      await demos(b, true);
    }
    if (!only || only === 'pages') {
      await pages(b, false);
      await pages(b, true);
    }
    if (!only || only === 'reduced') {
      await reduced(b, false);
      await reduced(b, true);
    }
    if (!only || only === 'extra') {
      await narrow(b);
      await backButton(b);
      await heroEn(b);
    }
  } finally {
    await b.close();
  }
  if (!only || only === 'lang') await langNotice();
} catch (e) {
  console.error(e);
  failed++;
} finally {
  killPid(preview.pid);
}
console.log(failed ? `\n${failed} comprobaciones fallaron` : '\nQA: todas las comprobaciones pasaron');
console.log(`capturas en ${OUT}`);
process.exit(failed ? 1 : 0);
