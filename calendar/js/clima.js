/* Clima, ahora directo desde el navegador.

   Open-Meteo es gratuito, no pide clave y responde con CORS abierto, así que
   la página puede consultarlo sin intermediario: el servidor Python que hacía
   esto ya no existe.

   La forma del objeto que devuelve es idéntica a la que entregaba el servidor
   —actual, aviso, horas, dias, pron— para que las vistas no cambien.

   Lo que se consulta se guarda en localStorage. Si abres la TV sin internet,
   muestra el último pronóstico en vez de un hueco.                          */

const URL_PRON = "https://api.open-meteo.com/v1/forecast";
const URL_BUSCAR = "https://geocoding-api.open-meteo.com/v1/search";
const URL_INVERSO = "https://nominatim.openstreetmap.org/reverse";
const CACHE = "clima_cache_v1";

/* Códigos WMO agrupados en las condiciones que dibuja la interfaz. */
const CODIGOS = {
  0: ["sol", "Despejado"], 1: ["sol", "Mayormente despejado"],
  2: ["parcial", "Parcialmente nublado"], 3: ["nubes", "Nublado"],
  45: ["niebla", "Niebla"], 48: ["niebla", "Niebla con escarcha"],
  51: ["lluvia", "Llovizna ligera"], 53: ["lluvia", "Llovizna"], 55: ["lluvia", "Llovizna intensa"],
  56: ["lluvia", "Llovizna helada"], 57: ["lluvia", "Llovizna helada intensa"],
  61: ["lluvia", "Lluvia ligera"], 63: ["lluvia", "Lluvia"], 65: ["lluvia", "Lluvia fuerte"],
  66: ["lluvia", "Lluvia helada"], 67: ["lluvia", "Lluvia helada fuerte"],
  71: ["nieve", "Nevada ligera"], 73: ["nieve", "Nevada"], 75: ["nieve", "Nevada fuerte"],
  77: ["nieve", "Granizo fino"],
  80: ["lluvia", "Chubascos ligeros"], 81: ["lluvia", "Chubascos"], 82: ["lluvia", "Chubascos fuertes"],
  85: ["nieve", "Chubascos de nieve"], 86: ["nieve", "Chubascos de nieve fuertes"],
  95: ["tormenta", "Tormenta eléctrica"], 96: ["tormenta", "Tormenta con granizo"],
  99: ["tormenta", "Tormenta fuerte con granizo"],
};
const LLUVIOSOS = new Set(["lluvia", "tormenta", "nieve"]);
const traducir = (c) => CODIGOS[Number(c) || 0] || ["nubes", "Sin datos"];

function consejo(cond, prob, tormenta) {
  if (tormenta) return "Evita zonas abiertas y desconecta los equipos sensibles";
  if (cond === "nieve") return "Abrígate y calcula más tiempo para moverte";
  if (prob >= 80) return "Lleva impermeable, es casi seguro que llueve";
  if (prob >= 60) return "Lleva casaca impermeable por si acaso";
  return "Puede caer algo de lluvia, lleva paraguas";
}

const num = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n === Math.trunc(n) ? Math.trunc(n) : Math.round(n * 10) / 10;
};

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* ---------- consulta ------------------------------------------------------ */

export async function traer({ lat, lon, zona = "auto", nombre = "", umbral = 45 }) {
  const p = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: "temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    timezone: zona || "auto",
    forecast_days: "7",
  });

  let crudo;
  try {
    const r = await fetch(`${URL_PRON}?${p}`);
    if (!r.ok) throw new Error(`Open-Meteo respondió ${r.status}`);
    crudo = await r.json();
  } catch (e) {
    const viejo = recordado();
    if (viejo) return { ...viejo, error: "Sin conexión: se muestra el último pronóstico" };
    return { error: "No pude consultar el clima. ¿Hay internet?", actual: {}, horas: [], dias: [], pron: {} };
  }

  const datos = procesar(crudo, nombre, umbral);
  try { localStorage.setItem(CACHE, JSON.stringify(datos)); } catch {}
  return datos;
}

export function recordado() {
  try {
    const d = JSON.parse(localStorage.getItem(CACHE) || "null");
    if (!d || Date.now() - (d.actualizado || 0) > 12 * 3600 * 1000) return null;
    return d;
  } catch { return null; }
}

function procesar(crudo, nombre, umbral) {
  const actual = crudo.current || {};
  const [cond, texto] = traducir(actual.weather_code);

  const diario = crudo.daily || {};
  const fechas = diario.time || [];
  const pron = {};
  const dias = fechas.map((f, i) => {
    const [c, t] = traducir((diario.weather_code || [])[i]);
    pron[f] = c;
    return {
      fecha: f, cond: c, texto: t,
      max: num((diario.temperature_2m_max || [])[i]),
      min: num((diario.temperature_2m_min || [])[i]),
      prob: num((diario.precipitation_probability_max || [])[i]),
    };
  });

  // Hoy y mañana: la franja de la TV se desplaza con el reloj y tiene que
  // poder cruzar la medianoche sin quedarse sin datos.
  const horario = crudo.hourly || {};
  const hoy = iso(new Date());
  const manana = iso(new Date(Date.now() + 86400000));
  const horas = [];
  (horario.time || []).forEach((marca, i) => {
    const dia = marca.startsWith(hoy) ? 0 : marca.startsWith(manana) ? 1 : null;
    if (dia === null) return;
    const [c, t] = traducir((horario.weather_code || [])[i]);
    horas.push({
      dia, h: Number(marca.slice(11, 13)),
      temp: num((horario.temperature_2m || [])[i]),
      prob: num((horario.precipitation_probability || [])[i]) || 0,
      cond: c, texto: t,
    });
  });

  const hoyDatos = dias.find((d) => d.fecha === hoy) || dias[0] || {};

  return {
    lugar: nombre,
    actualizado: Date.now(),
    actual: {
      temp: num(actual.temperature_2m),
      sensacion: num(actual.apparent_temperature),
      humedad: num(actual.relative_humidity_2m),
      viento: num(actual.wind_speed_10m),
      cond, texto,
      min: hoyDatos.min ?? null, max: hoyDatos.max ?? null,
    },
    aviso: calcularAviso(horas, umbral),
    horas, dias, pron,
    amanecer: (diario.sunrise || [])[0] || null,
    atardecer: (diario.sunset || [])[0] || null,
    error: null,
  };
}

/** Primer tramo continuo de lluvia o tormenta que queda por delante hoy. */
function calcularAviso(todas, umbral) {
  const ahora = new Date().getHours();
  const horas = todas.filter((h) => h.dia === 0);
  const malas = horas.filter((h) =>
    h.h >= ahora - 1 && (h.prob >= umbral || h.cond === "tormenta" || h.cond === "nieve"));
  if (!malas.length) return null;

  const inicio = malas[0].h;
  let fin = inicio;
  for (const h of malas) {
    if (h.h <= fin + 1) fin = h.h; else break;
  }

  const tramo = horas.filter((h) => h.h >= inicio && h.h <= fin);
  const prob = tramo.reduce((m, h) => Math.max(m, h.prob), 0);
  const tormenta = tramo.some((h) => h.cond === "tormenta");
  const peor = tramo.reduce((mejor, h) => {
    if (!mejor) return h;
    const puntos = (x) => (LLUVIOSOS.has(x.cond) ? 1 : 0) * 1000 + x.prob;
    return puntos(h) >= puntos(mejor) ? h : mejor;
  }, null);

  return {
    ini: inicio,
    fin: Math.min(23, fin + 1),
    cond: tormenta ? "tormenta" : (peor?.cond || "lluvia"),
    prob,
    titulo: `${peor?.texto || "Lluvia"} · ${prob}% de probabilidad`,
    consejo: consejo(peor?.cond || "lluvia", prob, tormenta),
  };
}

/* ---------- elegir el lugar ---------------------------------------------- */

export async function buscarLugares(texto) {
  const q = (texto || "").trim();
  if (q.length < 2) return [];
  try {
    const p = new URLSearchParams({ name: q, count: "8", language: "es", format: "json" });
    const r = await fetch(`${URL_BUSCAR}?${p}`);
    const crudo = await r.json();
    return (crudo.results || []).map((x) => ({
      nombre: x.name || "",
      detalle: [x.admin1, x.country].filter(Boolean).join(", "),
      lat: x.latitude, lon: x.longitude, zona: x.timezone || "auto",
    }));
  } catch { return []; }
}

export async function lugarPorCoordenadas(lat, lon) {
  const generico = { nombre: `${(+lat).toFixed(3)}, ${(+lon).toFixed(3)}`, detalle: "",
                     lat: +lat, lon: +lon, zona: "auto" };
  try {
    const p = new URLSearchParams({ lat, lon, format: "json", zoom: "10", "accept-language": "es" });
    const r = await fetch(`${URL_INVERSO}?${p}`);
    const crudo = await r.json();
    const d = crudo.address || {};
    const nombre = d.city || d.town || d.village || d.county || d.state || crudo.name;
    if (!nombre) return generico;
    return { nombre, detalle: [d.state, d.country].filter(Boolean).join(", "),
             lat: +lat, lon: +lon, zona: "auto" };
  } catch { return generico; }
}

/** Ubicación aproximada por la conexión a internet. Sirve cuando el GPS está
    negado o el dispositivo no tiene: da precisión de ciudad, que para el
    clima alcanza de sobra. Se prueban dos servicios por si uno está caído. */
export async function lugarPorIp() {
  const intentos = [
    ["https://ipapi.co/json/",
     (d) => [d.city, d.region, d.country_name, d.latitude, d.longitude, d.timezone]],
    ["https://ipwho.is/",
     (d) => [d.city, d.region, d.country, d.latitude, d.longitude, d.timezone?.id]],
  ];
  for (const [url, mapear] of intentos) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const [ciudad, region, pais, lat, lon, zona] = mapear(await r.json());
      if (lat === undefined || lat === null) continue;
      return {
        nombre: ciudad || "Mi zona",
        detalle: [region, pais].filter(Boolean).join(", "),
        lat: Number(lat), lon: Number(lon), zona: zona || "auto",
      };
    } catch { /* probamos el siguiente */ }
  }
  throw new Error("No pude estimar tu ciudad por la conexión. Búscala por nombre.");
}

/** El GPS del dispositivo. Ahora sí funciona: la app vive en https.
    Devuelve el lugar ya resuelto, o lanza un error explicado. */
export function miUbicacion() {
  return new Promise((ok, mal) => {
    if (!navigator.geolocation) return mal(new Error("Este navegador no tiene GPS."));
    if (!window.isSecureContext)
      return mal(new Error("El GPS solo funciona en https. Busca la ciudad por nombre."));
    navigator.geolocation.getCurrentPosition(
      async (pos) => ok(await lugarPorCoordenadas(pos.coords.latitude, pos.coords.longitude)),
      (e) => {
        if (e.code === 1) mal(new Error("No diste permiso de ubicación. Puedes activarlo en el candado de la barra de direcciones."));
        else if (e.code === 2) mal(new Error("No pude determinar dónde estás. Prueba buscando la ciudad."));
        else mal(new Error("La ubicación tardó demasiado. Prueba otra vez."));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });
}
