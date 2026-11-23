// Sprint 38 (B2): lectura de papeles simulada al subir un documento.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

test('B2: la hoja de lectura dice que es simulada y se abre al terminar de subir', () => {
  assert.match(app, /Esto leímos de tu documento/);
  assert.match(app, /Simulado en la demo/);
  assert.match(app, /abrirLecturaDocumento\(x, nombre,/);
});

test('B2: cada archivo de ejemplo tiene su lectura', () => {
  const docs = [...app.matchAll(/archivos: \[([^\]]+)\]/g)].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((k) => k[1]));
  assert.ok(docs.length >= 11);
  docs.forEach((nombre) => assert.ok(app.includes("'" + nombre + "': { leido:"), 'falta la lectura de ' + nombre));
});

test('B2: la lectura no trae RUT ni nombres de personas', () => {
  const bloque = app.slice(app.indexOf('function lecturaDocumento'), app.indexOf('function abrirLecturaDocumento'));
  assert.doesNotMatch(bloque, /\d{1,2}\.\d{3}\.\d{3}-[\dkK]/);
  assert.doesNotMatch(bloque, /RUT/i);
});

test('B2: «Te falta» solo avisa; el documento queda listo igual', () => {
  assert.match(app, /No te falta nada/);
  assert.match(app, /docs\[id\] = nombre;/);
});

test('B2: «Subir mis documentos» en Pedir preaprobación lleva a la ventana de documentos', () => {
  assert.match(app, /id="btn-subir-docs">Subir mis documentos/);
  assert.match(app, /guardarSubpaso\('documentos'\); cerrarHoja\(false\); location\.hash = '#compra\/postular\/documentos'/);
});

test('Misiones: «documentos» y «elegir» ya no son misiones y no quedan restos en el código', () => {
  const calc = fs.readFileSync(path.join(__dirname, '..', 'js', 'calculos.js'), 'utf8');
  const textos = app.slice(app.indexOf('var MISIONES_TEXTO'), app.indexOf('var MISION_SITIO'));
  assert.doesNotMatch(textos, /documentos:|elegir:/);
  assert.doesNotMatch(app, /id === 'elegir'/);
  assert.doesNotMatch(calc, /documentos: '5 minutos'|elegir: '10 minutos'|elegir: 'elegir tu departamento'/);
});

const c = require('../js/calculos.js');
const fotoBase = (x) => Object.assign({ caminoElegido: true, grupo: false, arriendo: false, cuentaVivienda: true, equipo: false, ahorroAutomatico: false }, x);
const ids = (s) => c.misiones(s, '2026-11-03').map((m) => m.id);

test('Misión nueva: firmar el acuerdo aparece solo si sumaste a alguien al crédito', () => {
  assert.ok(!ids(fotoBase({})).includes('acuerdo'));
  const ms = c.misiones(fotoBase({ acuerdo: true }), '2026-11-03');
  assert.ok(ms.some((m) => m.id === 'acuerdo' && !m.hecho));
  assert.ok(c.misiones(fotoBase({ acuerdo: true, acuerdoFirmado: true }), '2026-11-03').find((m) => m.id === 'acuerdo').hecho);
});

test('Misión nueva: el informe de deudas aparece con camino elegido y se marca con la preaprobación', () => {
  assert.ok(!ids(fotoBase({ caminoElegido: false })).includes('deudas'));
  assert.ok(ids(fotoBase({})).includes('deudas'));
  assert.ok(c.misiones(fotoBase({ informeDeudas: true }), '2026-11-03').find((m) => m.id === 'deudas').hecho);
  assert.match(app, /fichas\/2614-informe-de-deudas/);
});

test('Misión nueva: visitar el departamento, solo sin grupo; queda hecha al visitar o al elegir', () => {
  assert.ok(ids(fotoBase({ visitar: true })).includes('visita'));
  assert.ok(!ids(fotoBase({ visitar: false })).includes('visita'));
  assert.ok(c.misiones(fotoBase({ visitar: true, visito: true }), '2026-11-03').find((m) => m.id === 'visita').hecho);
  assert.match(app, /visitar: !!estado\.caminoElegido && !esArriendo\(\) && !esGrupo\(\)/);
});

test('Las marcas de aceleradores y misiones se guardan al recargar', () => {
  ['ds1Agregado', 'tasaAgregado', 'fogaesAgregado', 'tasaPedido', 'garantiaFamiliar', 'fogaesCalifica', 'acuerdoFirmado', 'informeDeudas']
    .forEach((k) => assert.ok(app.slice(0, app.indexOf('];', app.indexOf('var CLAVES_PASOS'))).includes("'" + k + "'"), k));
});
