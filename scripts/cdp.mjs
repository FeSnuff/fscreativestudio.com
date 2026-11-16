/**
 * Cliente mínimo de Chrome DevTools Protocol para Edge headless (sin dependencias).
 * Lo usan scripts/og.mjs (imágenes og:image) y scripts/qa.mjs (pruebas y capturas).
 * Edge se lanza con un perfil temporal propio y se cierra SIEMPRE por PID (nunca por nombre).
 */
import { spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const EDGE = process.env.EDGE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function killPid(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(pid);
  } catch {
    /* ya terminó */
  }
}

/** Lanza Edge headless y devuelve { send, newPage, close }. `lang` fija el idioma del navegador. */
export async function launch({ port = 9444, lang = 'es-US' } = {}) {
  const profile = join(tmpdir(), `fs-site-edge-${process.pid}-${port}`);
  const edge = spawn(
    EDGE,
    ['--headless=new', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--lang=${lang}`, `--accept-lang=${lang}`, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-features=Translate', 'about:blank'],
    { stdio: 'ignore' },
  );
  let ws;
  let seq = 0;
  const pending = new Map();
  const listeners = [];
  const send = (method, params = {}, sessionId) => {
    const id = ++seq;
    ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((res, rej) => pending.set(id, { res, rej, method }));
  };
  const on = (method, fn) => listeners.push({ method, fn });
  for (let i = 0; i < 60; i++) {
    try {
      const v = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      ws = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
      break;
    } catch {
      await sleep(250);
    }
  }
  if (!ws) throw new Error('No se pudo conectar con Edge');
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.rej(new Error(`${p.method}: ${m.error.message}`)) : p.res(m.result);
    } else if (m.method) for (const l of listeners) if (l.method === m.method) l.fn(m.params, m.sessionId);
  };

  async function newPage({ width, height, mobile = false, reducedMotion = 'no-preference', downloadPath }) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    const errors = [];
    const logs = [];
    let loadedResolve = null;
    on('Runtime.exceptionThrown', (p, sid) => sid === sessionId && errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
    on('Runtime.consoleAPICalled', (p, sid) => sid === sessionId && (p.type === 'error' || p.type === 'warning') && logs.push(`${p.type}: ${p.args.map((a) => a.value ?? a.description).join(' ')}`));
    on('Log.entryAdded', (p, sid) => sid === sessionId && p.entry.level === 'error' && logs.push(`log: ${p.entry.text} ${p.entry.url ?? ''}`));
    on('Page.loadEventFired', (_p, sid) => sid === sessionId && loadedResolve?.());
    await s('Page.enable');
    await s('Runtime.enable');
    await s('Log.enable');
    await s('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
    if (mobile) await s('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    // Edge headless informa prefers-reduced-motion: reduce. Se fuerza el valor pedido.
    await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reducedMotion }, { name: 'prefers-color-scheme', value: 'light' }] });
    if (downloadPath) await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath, eventsEnabled: true });
    const page = {
      s,
      targetId,
      errors,
      logs,
      async goto(url, settle = 600) {
        const loaded = new Promise((r) => (loadedResolve = r));
        await s('Page.navigate', { url });
        await Promise.race([loaded, sleep(15000)]);
        await sleep(settle);
      },
      async eval(expr) {
        const r = await s('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error(`eval: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}\n${expr}`);
        return r.result.value;
      },
      async waitFor(expr, ms = 8000) {
        const t0 = Date.now();
        while (Date.now() - t0 < ms) {
          if (await page.eval(`!!(${expr})`)) return true;
          await sleep(100);
        }
        return false;
      },
      async shot(file, { full = false, clip } = {}) {
        const r = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full, ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
        const { writeFileSync } = await import('node:fs');
        writeFileSync(file, Buffer.from(r.data, 'base64'));
      },
      async tap(x, y) {
        await s('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await s('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      },
      async click(x, y) {
        await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await s('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      },
      async close() {
        await send('Target.closeTarget', { targetId }).catch(() => {});
      },
    };
    return page;
  }

  async function close() {
    try {
      await send('Browser.close');
    } catch {
      /* ignorado */
    }
    killPid(edge.pid);
    await sleep(400);
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      /* perfil en uso */
    }
  }
  return { send, newPage, close, pid: edge.pid };
}
