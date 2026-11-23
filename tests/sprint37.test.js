// Sprint 37: cambios del 23 de noviembre (caminos, DS19 y DS1, pregunta de Departamentos).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const c = require('../js/calculos.js');

test('E1: el crédito individual se llama Compra directa y la garantía no es un camino', () => {
  assert.strictEqual(c.CAMINOS['individual-vivir'].nombre, 'Compra directa');
  assert.ok(!Object.values(c.CAMINOS).some((x) => x.nombre === 'Crédito con garantía del Estado'));
});

test('E2: el DS19 se explica como proyectos específicos con cupos y Registro Social', () => {
  assert.match(app, /solo en proyectos DS19 específicos, que tienen cupos limitados/);
  assert.match(app, /Registro Social de Hogares/);
  assert.doesNotMatch(app, /Desde UF 350/);
});

test('E2: el DS1 se marca como acelerador', () => {
  assert.match(app, /Es un acelerador: se suma a un camino/);
});

test('E3: la pregunta de Departamentos aparece una vez y la respuesta se guarda', () => {
  assert.match(app, /¿Qué es lo que más te importa\?/);
  assert.match(app, /if \(!estado\.prioridadRespondida\)/);
  assert.match(app, /'prioridad', 'prioridadRespondida'/);
  assert.match(app, /No estoy seguro · ver todos/);
  assert.match(app, /Cambiar mi respuesta/);
  assert.match(app, /btn-cambiar-prioridad-perfil/);
});
