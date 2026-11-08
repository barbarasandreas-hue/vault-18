// Pruebas del Sprint 23: el departamento se construye con los hitos y favoritos.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const base = (extra) => Object.assign({ grupo: false, numeros: false, cuentaVivienda: false, ahorrado: 0, meta: 1e7 }, extra);

test('S23-B: cada hito hecho suma una etapa; al final es tuyo', () => {
  assert.strictEqual(c.etapaConstruccion(c.hitoActual(base())), 0);
  assert.strictEqual(c.etapaConstruccion(c.hitoActual(base({ numeros: true }))), 1);
  assert.strictEqual(c.etapaConstruccion(c.hitoActual(base({ numeros: true, cuentaVivienda: true }))), 2);
  const fin = c.etapaConstruccion(c.hitoActual(base({ esTuyo: true })));
  assert.strictEqual(fin, 6);
  assert.strictEqual(c.ETAPAS_CONSTRUCCION[fin], 'Es tuyo');
  assert.strictEqual(c.ETAPAS_CONSTRUCCION.length, 7);
});

test('S23-C: guardar y sacar de favoritos', () => {
  let l = c.alternarFavorito([], 'a');
  assert.deepStrictEqual(l, ['a']);
  l = c.alternarFavorito(l, 'b');
  assert.deepStrictEqual(l, ['a', 'b']);
  assert.deepStrictEqual(c.alternarFavorito(l, 'a'), ['b']);
  assert.deepStrictEqual(c.alternarFavorito(['a', 'a'], 'b'), ['a', 'b']);
  assert.deepStrictEqual(c.alternarFavorito(null, 'x'), ['x']);
});
