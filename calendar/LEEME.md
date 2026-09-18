# Calendario de pared

Muestra tu calendario en la TV y lo administras desde el celular. Son
**archivos estáticos**: HTML, CSS y JavaScript. No hay servidor que mantener,
ni base de datos que pagar, ni máquina que dejar prendida.

Tus datos viven en **una hoja de cálculo de tu propio Google Drive**, que la
app crea sola la primera vez. Puedes abrirla cuando quieras.

---

## Montarlo

Son dos cosas: pedirle a Google una credencial, y subir la carpeta a un host.
La primera vez toma unos diez minutos. Después no se toca más.

### 1. La credencial de Google

Entra a [console.cloud.google.com](https://console.cloud.google.com) con tu
cuenta. Es gratis.

**a) Crea un proyecto.** Arriba a la izquierda, el selector de proyectos →
*Proyecto nuevo*. Ponle `Calendario`.

**b) Activa las dos APIs.** Busca en el buscador de arriba:

- `Google Sheets API` → **Habilitar**
- `Google Drive API` → **Habilitar**

**c) Configura la pantalla de consentimiento.** En el menú lateral,
**Google Auth Platform** → *Comenzar*. Te pide cuatro datos:

| Campo | Qué poner |
|---|---|
| Nombre de la app | Calendario |
| Correo de asistencia | el tuyo |
| Público | **Externo** |
| Datos de contacto | tu correo |

**d) Publica la app.** En **Google Auth Platform → Público**, botón
**Publicar app**. Debe quedar en **En producción**.

> Este paso parece opcional y no lo es. Mientras diga *Prueba*, Google caduca
> el permiso **cada 7 días** y tendrías que volver a entrar en la TV todas las
> semanas. Publicada, no caduca.
>
> No hace falta que Google verifique nada: la app solo pide el permiso
> `drive.file`, que está clasificado como **no sensible** y no pasa por
> revisión. Verás un aviso de "app no verificada" la primera vez que entres;
> le das a *Configuración avanzada → Ir a Calendario*. Es tu propia app.

**e) Crea el ID de cliente.** **Google Auth Platform → Clientes** →
*Crear cliente*:

- Tipo: **Aplicación web**
- Nombre: `Calendario web`
- **Orígenes de JavaScript autorizados**: la dirección donde vas a subir la
  app, sin barra al final. Por ejemplo `https://calendario.tudominio.com`.
  Puedes agregar varias.

Copia el ID que te da. Termina en `.apps.googleusercontent.com`.

**f) Pégalo en el código.** Abre `js/config.js` y reemplaza:

```js
export const CLIENT_ID = "PON_AQUI_TU_ID.apps.googleusercontent.com";
```

El ID de cliente **no es una contraseña**: es público por diseño y se ve en el
código de cualquier página que use el acceso de Google. Lo que lo protege es
la lista de orígenes autorizados del paso (e): solo tu dominio puede usarlo.

### 2. Subirlo

Sube el contenido de esta carpeta tal cual. Sirve cualquier host de archivos
estáticos; los planes gratuitos alcanzan de sobra porque no hay nada que
ejecutar del lado del servidor.

**Dos requisitos:**

1. **Tiene que ser `https`.** Google no entrega credenciales por `http`, y el
   GPS del botón "Usar mi ubicación" tampoco funciona sin él. Todos los hosts
   de abajo dan certificado solo.
2. **El dominio tiene que coincidir** exactamente con el que pusiste en los
   orígenes autorizados.

La carpeta `prueba/` es andamiaje para desarrollo; puedes subirla o no, da
igual, pero es más limpio no subirla.

---

## Cómo funciona

No hay servidor propio. Cada pantalla habla directamente con Google:

```
   TV  ──┐
         ├──►  Google Sheets  ◄── tu hoja, en tu Drive
Celular ─┘
```

- **La TV solo lee.** Nunca escribe, así que dos pantallas encendidas no se
  pueden pisar. Relee la hoja cada 45 segundos (configurable).
- **Gestión lee y escribe.** Los cambios se ven al instante y viajan después;
  si Google rechaza uno, se revierte y te avisa.
- **El clima** lo consulta tu propio navegador a Open-Meteo.
- **El pronóstico y lo último leído** quedan guardados en cada dispositivo, así
  que la TV pinta el día completo apenas abre y sigue mostrando algo si se cae
  la red.

### Qué permisos pide

Uno solo: `drive.file`. Significa que la app **solo puede ver y modificar los
archivos que ella misma creó**. No puede listar tu Drive, ni abrir tus otros
documentos, ni ver tu correo o tus fotos.

---

## La hoja de cálculo

La app la crea sola con seis pestañas. Puedes editarla a mano: la app lee los
cambios en la siguiente pasada.

| Pestaña | Qué guarda |
|---|---|
| **Actividades** | Una fila por actividad, con sus 17 columnas |
| **Completadas** | `ID actividad · fecha` — una fila por día marcado como hecho |
| **Excepciones** | Días sueltos que borraste de una serie que se repite |
| **Categorías** | ID, nombre, color y orden |
| **Config** | Los ajustes, con una columna *Nota* que explica cada uno |
| **Papelera** | Lo borrado, con la actividad completa para restaurarla |

Los días marcados y las excepciones están en **pestañas aparte a propósito**:
una tarea que se repite acumula decenas de fechas, y meterlas todas en una
celda separadas por comas las vuelve imposibles de filtrar o contar. Así son
filas normales y puedes hacerles una tabla dinámica.

**Las fechas se guardan como texto** en formato `2026-09-18`, y las horas como
`14:30`. No es descuido: si fueran fechas "de verdad", Sheets las interpreta
según el idioma de la cuenta y la misma celda se lee distinto en una máquina
configurada en español que en una en inglés. En ISO no hay ambigüedad. Para
agrupar por mes en la hoja: `=IZQUIERDA(D2;7)`.

La hoja viene con encabezados congelados, desplegables en categoría, prioridad
y repetición, y colores automáticos: las de prioridad alta en rojo suave, las
bajas en gris, las archivadas tachadas.

### Cargar muchas de golpe

Pega filas directamente en **Actividades**. Lo único obligatorio es el **ID**
(cualquier texto único), el **título** y la **fecha**. El resto se completa con
valores por defecto.

### Respaldos

No hace falta hacerlos: Google guarda el **historial de versiones** de la hoja,
así que puedes volver a cualquier momento anterior desde *Archivo → Historial
de versiones*. Si igual quieres una copia tuya: *Archivo → Descargar → Excel*.

---

## Los dos modos

**Modo Calendario** — la pantalla de la TV. El mes con las próximas tareas de
cada día, la línea del día, el clima y los avisos de lluvia. Se actualiza sola.

- `Ctrl` + rueda del mouse cambia **solo el tamaño de la letra**; la estructura
  no se mueve. También `Ctrl` `+` / `Ctrl` `−`, y `Ctrl` `0` para volver.
- El botón de abajo a la derecha activa pantalla completa y desaparece.
- La hora actual queda clavada al centro y la tira se desliza sola, sin saltos.
- Cada actividad ocupa **exactamente lo que dura**. Nada se marca con bordes ni
  aros: lo que está pasando lleva la barra más gruesa y el texto firme.
- Ayer y mañana se ven en la misma tira, atenuados.

**Modo Gestión** — para el celular. Agregar, editar, completar, duplicar y
eliminar; buscar; las tareas sin cerrar; y todos los ajustes.

---

## Cómo se organizan las actividades

Cada una tiene **prioridad** (alta, media, baja), **categoría** con su color,
**repetición** (diaria, semanal con días sueltos, mensual, anual, con fecha
límite opcional) y **recordatorio**.

En cada casilla del mes se ven las **dos primeras tareas del día**; en el día
de hoy, las **dos que vienen**. Todo eso se configura en *Ajustes → Los días
del mes*: cuántas mostrar (1 a 4), si los títulos se recortan con `…` o se
parten en dos líneas, y si quieres ver solo las de prioridad alta.

### Tareas sin cerrar

Si pasa la hora y nadie la marcó como hecha, queda **sin cerrar**.

- **En la TV**, el recuadro de arriba lista solo las de **hoy**. Los días
  anteriores que dejaron algo pendiente llevan una **marca ámbar** en su
  casilla del mes (`!`, o `3!` si son tres).
- **En Gestión** están todas, en su propio apartado *Sin cerrar*.

### Al terminar el día

Lo que **sí se hizo** se archiva solo, para que no se acumule. No se borra:
sigue en la hoja. Lo que quedó **sin cerrar no se toca nunca**.

El repaso corre cuando abres Gestión. Se desactiva en *Ajustes → Al terminar
el día*.

### Reglas al agendar

- No se pueden crear actividades en días u horas que ya pasaron. El aviso sale
  mientras escribes y el botón de guardar queda bloqueado.
- La hora de término nunca queda antes que la de inicio.
- Editar una actividad vieja sí se permite; la regla solo aplica al crear o al
  moverla de fecha.
- Se puede desactivar poniendo `bloquear_pasado` en `FALSO` en la pestaña
  Config.

### Actividades repetidas

Si alguna queda guardada dos veces, *Ajustes* te avisa: aparece la sección
**Actividades repetidas** con la lista y un botón para quitar las copias. Se
queda con la que ya tenga días marcados; las demás van a la papelera.

---

## Estilos

Cinco, en *Ajustes → Estilo*. Se guardan **en la hoja**, no en el dispositivo:
al cambiar uno, la TV se repinta sola en la siguiente pasada.

| Estilo | Cómo se ve |
|---|---|
| **Nítido** | Blanco, líneas finas, color solo donde informa |
| **Papel** | Crema y titulares con serif, sobrio |
| **Smart** | Fondo oscuro con acentos que brillan |
| **Vivo** | Redondeado y colorido, con degradados |
| **Mono** | Monoespaciada, sin curvas, alto contraste |

---

## Clima

De [Open-Meteo](https://open-meteo.com): gratuito y sin clave de API. Para
elegir el lugar, en *Ajustes → Clima*:

1. **Buscar por nombre** — escribes "Cusco" y eliges de la lista.
2. **Tocar el mapa** — arrastras el marcador.
3. **Usar mi ubicación** — el GPS del dispositivo. Ahora sí funciona: la app
   vive en `https`, que era justo lo que le faltaba antes.
4. **Detectar por la conexión** — estima la ciudad por tu salida a internet.

Cuando detecta lluvia o tormenta genera un aviso con la franja horaria y una
recomendación, y pinta esas horas en la agenda del día.

---

## Si algo falla

**"Falta poner tu ID de cliente"** — no editaste `js/config.js`.

**Google dice `redirect_uri_mismatch` o `origin_mismatch`** — el dominio desde
el que abres la página no está en *Orígenes de JavaScript autorizados*. Tiene
que coincidir exacto, con `https://` y sin barra al final.

**La TV pide entrar cada semana** — la app quedó en *Prueba*. Publícala:
Google Auth Platform → Público → **Publicar app**.

**"Google no me deja tocar esa hoja"** — sal de la cuenta desde Ajustes y
vuelve a entrar aceptando el permiso.

**Aparece "app no verificada"** — es normal y es tu propia app.
*Configuración avanzada → Ir a Calendario*.

**Borré la hoja del Drive** — la app se da cuenta y crea una nueva vacía. La
anterior está en la papelera de Drive por 30 días.

**"Demasiadas consultas seguidas"** — pasaste el límite de Google (60 lecturas
por minuto). Se reintenta solo. Si es constante, sube `sondeo_segundos` en la
pestaña Config.

**El mapa no carga** — se descarga de internet. El buscador por nombre y las
coordenadas manuales siguen funcionando sin él.

---

## Estructura del proyecto

```
index.html           inicio: elegir modo
calendario.html      la pantalla de la TV
gestion.html         la app del celular
js/
  config.js          ← lo único que editas
  esquema.js         la estructura de la hoja: pestañas, columnas, validaciones
  construir.js       crea la hoja la primera vez
  sheets.js          cliente de la API de Google Sheets
  auth.js            entrar con Google
  arranque.js        el arranque común de las pantallas
  portada.js         la pantalla de carga y entrada
  datos.js           entre la hoja y las pantallas: caché, escrituras, sondeo
  modelos.js         validación y repeticiones
  clima.js           Open-Meteo directo desde el navegador
  comun.js           fechas, colores, temas, iconos
  calendario.js      la vista de TV
  gestion.js         la vista del celular
css/                 estilos y los cinco temas
prueba/              simulador de Google Sheets para desarrollo (no se sube)
```

### Qué cambió respecto a la versión con servidor

| Antes | Ahora |
|---|---|
| `server.py` en tu PC o Termux | nada que ejecutar |
| `datos/*.json` | una hoja en tu Drive |
| Usuario y contraseña propios | entrar con Google |
| SSE empujando cambios | sondeo cada 45 s |
| Hilos de clima y limpieza | el navegador los hace |
| Solo en tu red WiFi | desde cualquier lado |

Lo que **no** cambió: las dos vistas, los cinco estilos, las repeticiones, las
reglas al agendar y el comportamiento de las tareas sin cerrar. La lógica de
repeticiones se tradujo de Python a JavaScript y se verificó caso por caso
contra la original.
