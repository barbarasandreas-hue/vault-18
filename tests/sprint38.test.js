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
