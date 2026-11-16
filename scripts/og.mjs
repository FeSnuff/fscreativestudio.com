/**
 * Genera las imágenes Open Graph 1200×630 (public/og/og-es.png y og-en.png) con la paleta v3,
 * el logotipo oficial y las fuentes del sitio, usando Edge headless por CDP.
 * Uso: node scripts/og.mjs
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';

const HERE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PUB = join(HERE, 'public');
const OUT = join(PUB, 'og');
mkdirSync(OUT, { recursive: true });
const u = (p) => pathToFileURL(join(PUB, p)).href;

const T = {
  es: { a: 'Cotiza, haz firmar y cobra', b: 'desde el celular.', sub: 'Tu web y tu oficina en línea,', subB: 'desde USD 250.', chips: ['Webs en español e inglés', 'Cotización → PDF → firma → pagado', 'Todo a tu nombre'] },
  en: { a: 'Quote, get it signed and get paid', b: 'from your phone.', sub: 'Your website and your online office,', subB: 'from $250.', chips: ['Websites in English and Spanish', 'Quote → PDF → signature → paid', 'All in your name'] },
};

const html = (lang) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face{font-family:Geist;font-weight:100 900;src:url(${u('fonts/geist-latin-wght-normal.woff2')}) format("woff2")}
@font-face{font-family:Geist;font-weight:100 900;src:url(${u('fonts/geist-latin-ext-wght-normal.woff2')}) format("woff2");unicode-range:U+0100-024F}
@font-face{font-family:"Geist Mono";font-weight:100 900;src:url(${u('fonts/geist-mono-latin-wght-normal.woff2')}) format("woff2")}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0B0B14;color:#EDEDF5;font-family:Geist,sans-serif;position:relative}
body::before{content:"";position:absolute;inset:0;background:radial-gradient(40% 60% at 85% 35%,rgb(109 74 255 / .55),transparent 70%),radial-gradient(30% 45% at 100% 100%,rgb(226 85 200 / .45),transparent 70%),radial-gradient(35% 50% at 60% 0%,rgb(59 130 246 / .35),transparent 70%)}
body::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgb(237 237 245 / .14) 1.2px,transparent 1.6px);background-size:28px 28px;-webkit-mask-image:radial-gradient(70% 90% at 80% 40%,#000,transparent 75%)}
.in{position:relative;z-index:1;padding:64px 72px;height:100%;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:16px;align-self:flex-start}.ico{height:56px;width:56px}.logo{height:46px;width:auto}
h1{margin-top:auto;font-size:68px;line-height:1.04;letter-spacing:-.035em;font-weight:600;color:#fff;max-width:860px}
.mark{position:relative;white-space:nowrap}
.mark::after{content:"";position:absolute;left:-.04em;right:-.04em;bottom:.02em;height:.13em;background:linear-gradient(100deg,#6D4AFF,#3B82F6 55%,#E255C8);border-radius:4px;z-index:-1}
p{margin-top:22px;font-size:30px;color:#A6A7BA}
p b{color:#fff;font-weight:600}
ul{display:flex;gap:12px;list-style:none;padding:0;margin-top:36px}
li{padding:10px 18px;border-radius:999px;border:1px solid rgb(155 135 255 / .45);background:rgb(20 20 31 / .8);font-size:19px;color:#EDEDF5}
.url{position:absolute;right:72px;top:76px;font-family:"Geist Mono",monospace;font-size:20px;letter-spacing:.06em;color:#9B87FF}
</style></head><body><div class="in">
<div class="brand"><img class="ico" src="${u('icons/icon.svg')}" alt=""><img class="logo" src="${u('logo/logotipo-W1-oscuro.svg')}" alt=""></div>
<h1>${T[lang].a} <span class="mark">${T[lang].b}</span></h1>
<p>${T[lang].sub} <b>${T[lang].subB}</b></p>
<ul>${T[lang].chips.map((c) => `<li>${c}</li>`).join('')}</ul>
<span class="url">fscreativestudio.com</span>
</div></body></html>`;

const b = await launch({ port: 9455 });
try {
  const page = await b.newPage({ width: 1200, height: 630 });
  for (const lang of ['es', 'en']) {
    const file = join(tmpdir(), `fs-og-${lang}-${process.pid}.html`);
    writeFileSync(file, html(lang));
    await page.goto(pathToFileURL(file).href, 900);
    await page.eval('document.fonts.ready.then(() => true)');
    await page.shot(join(OUT, `og-${lang}.png`));
    rmSync(file, { force: true });
    console.log(`og-${lang}.png listo`);
  }
} finally {
  await b.close();
}
