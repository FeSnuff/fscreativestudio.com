/* Construye la hoja de cálculo la primera vez.

   Arma el cuerpo de spreadsheets.create y, después, el batchUpdate que le
   pone formato: encabezados fijos, anchos, desplegables, formato de texto en
   las columnas de fecha (para que Sheets no las reinterprete según el idioma),
   colores por prioridad y notas de ayuda en los encabezados.

   Todo sale de esquema.js, así que agregar una columna allá se refleja aquí
   sin tocar este archivo.                                                   */

import * as E from "./esquema.js";

const TINTA = { red: 0.08, green: 0.09, blue: 0.11 };
const CABECERA = { red: 0.94, green: 0.95, blue: 0.96 };

/* ---------- 1. el cuerpo de spreadsheets.create ------------------------- */

export function cuerpoCrear(titulo = "Calendario") {
  return {
    properties: { title: titulo, locale: "es_ES", timeZone: "America/Lima" },
    sheets: E.NOMBRES_HOJAS.map((nombre, i) => ({
      properties: {
        sheetId: i + 1,
        title: nombre,
        index: i,
        gridProperties: {
          rowCount: nombre === "Actividades" ? 2000 : 1000,
          columnCount: E.anchoDe(nombre),
          frozenRowCount: E.HOJAS[nombre].congelar || 1,
        },
      },
    })),
  };
}

/* ---------- 2. el batchUpdate que le da forma --------------------------- */

export function peticionesFormato() {
  const peticiones = [];

  E.NOMBRES_HOJAS.forEach((nombre, i) => {
    const hoja = E.HOJAS[nombre];
    const sheetId = i + 1;
    const cols = hoja.columnas;

    // encabezados: texto, fondo gris, negrita, y la ayuda como nota de celda
    peticiones.push({
      updateCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: cols.length },
        fields: "userEnteredValue,userEnteredFormat,note",
        rows: [{
          values: cols.map((c) => ({
            userEnteredValue: { stringValue: c.h },
            note: c.ayuda || undefined,
            userEnteredFormat: {
              backgroundColor: CABECERA,
              textFormat: { bold: true, foregroundColor: TINTA, fontSize: 10 },
              verticalAlignment: "MIDDLE",
              wrapStrategy: "CLIP",
            },
          })),
        }],
      },
    });

    // anchos de columna
    cols.forEach((c, j) => {
      peticiones.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: "COLUMNS", startIndex: j, endIndex: j + 1 },
          properties: { pixelSize: c.w },
          fields: "pixelSize",
        },
      });
    });

    // fechas y horas como TEXTO puro: es lo que evita que Sheets las
    // reinterprete al cambiar de idioma o al pegar desde otro lado
    cols.forEach((c, j) => {
      if (c.t !== "fecha" && c.t !== "hora") return;
      peticiones.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: j, endColumnIndex: j + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: "TEXT" }, horizontalAlignment: "LEFT" } },
          fields: "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment",
        },
      });
    });

    // desplegables
    cols.forEach((c, j) => {
      const regla = reglaDeLista(c);
      if (!regla) return;
      peticiones.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: j, endColumnIndex: j + 1 },
          rule: regla,
        },
      });
      // las de sí/no también
    });
    cols.forEach((c, j) => {
      if (c.t !== "bool") return;
      peticiones.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, startColumnIndex: j, endColumnIndex: j + 1 },
          rule: {
            condition: { type: "ONE_OF_LIST", values: [
              { userEnteredValue: "VERDADERO" }, { userEnteredValue: "FALSO" }] },
            showCustomUi: true, strict: false,
          },
        },
      });
    });

    peticiones.push({
      updateSheetProperties: {
        properties: { sheetId, tabColor: colorPestana(nombre) },
        fields: "tabColor",
      },
    });
  });

  peticiones.push(...formatoPorPrioridad());
  return peticiones;
}

function reglaDeLista(c) {
  if (c.t !== "lista") return null;
  if (c.lista === "categorias") {
    return {
      condition: { type: "ONE_OF_RANGE", values: [{ userEnteredValue: "=Categorias!$A$2:$A" }] },
      showCustomUi: true, strict: false,
      inputMessage: "Tiene que existir en la pestaña Categorías",
    };
  }
  const valores = c.lista === "prioridades" ? E.PRIORIDADES : E.REPETICIONES;
  return {
    condition: { type: "ONE_OF_LIST", values: valores.map((v) => ({ userEnteredValue: v })) },
    showCustomUi: true, strict: true,
  };
}

/** Pinta la fila según la prioridad, para que la hoja se lea de un vistazo. */
function formatoPorPrioridad() {
  const sheetId = 1;                                   // Actividades
  const ancho = E.anchoDe("Actividades");
  const iPrioridad = E.HOJAS.Actividades.columnas.findIndex((c) => c.k === "prioridad");
  const col = E.letraColumna(iPrioridad);
  const rango = [{ sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: ancho }];

  const regla = (valor, fondo, indice) => ({
    addConditionalFormatRule: {
      index: indice,
      rule: {
        ranges: rango,
        booleanRule: {
          condition: { type: "CUSTOM_FORMULA", values: [
            { userEnteredValue: `=$${col}2="${valor}"` }] },
          format: { backgroundColor: fondo },
        },
      },
    },
  });

  return [
    regla("alta",  { red: 1,    green: 0.92, blue: 0.92 }, 0),
    regla("baja",  { red: 0.97, green: 0.97, blue: 0.97 }, 1),
    {   // archivadas: en gris y tachadas
      addConditionalFormatRule: {
        index: 2,
        rule: {
          ranges: rango,
          booleanRule: {
            condition: { type: "CUSTOM_FORMULA", values: [
              { userEnteredValue: '=$N2="VERDADERO"' }] },
            format: { textFormat: { strikethrough: true,
                                    foregroundColor: { red: 0.6, green: 0.6, blue: 0.6 } } },
          },
        },
      },
    },
  ];
}

const PESTANAS = {
  Actividades: { red: 0.03, green: 0.57, blue: 0.65 },
  Completadas: { red: 0.02, green: 0.59, blue: 0.41 },
  Excepciones: { red: 0.85, green: 0.65, blue: 0.13 },
  Categorias:  { red: 0.49, green: 0.23, blue: 0.93 },
  Config:      { red: 0.42, green: 0.45, blue: 0.5 },
  Papelera:    { red: 0.75, green: 0.27, blue: 0.27 },
};
const colorPestana = (n) => PESTANAS[n] || { red: 0.5, green: 0.5, blue: 0.5 };

/* ---------- 3. los datos iniciales -------------------------------------- */

/** Filas de contenido (sin encabezados) para las pestañas que nacen con
    datos. Las demás nacen vacías. */
export function valoresIniciales() {
  return {
    Categorias: E.COLORES_INICIALES.map((c) => E.objetoAFila("Categorias", c)),
    Config: E.CONFIG_INICIAL,
  };
}
