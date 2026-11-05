// Pruebas del Sprint 14: emoción, juego y grupo.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

test('Meta común del grupo: suma de lo que lleva cada uno', () => {
  // 6 compradores que llevan 4 meses con cuotas de $600.000, más lo tuyo.
  assert.strictEqual(c.totalGrupo(6, 600000, 4, 800000), 15200000);
  assert.strictEqual(c.totalGrupo(0, 600000, 4, 0), 0);
  assert.strictEqual(c.totalGrupo(3, 500000, 0, 100000), 100000);
});

test('Escalón de descuento cruzado al unirse alguien', () => {
  assert.deepStrictEqual(c.escalonCruzado(4, 5), { cupos: 5, descuento: 0.03 });
  assert.deepStrictEqual(c.escalonCruzado(9, 10), { cupos: 10, descuento: 0.05 });
  assert.strictEqual(c.escalonCruzado(5, 6), null);
  assert.strictEqual(c.escalonCruzado(2, 3), null);
});

test('Texto del hito del pie, con la obra', () => {
  assert.strictEqual(c.textoHito(0.5, 1), 'Vas en la mitad de tu pie. Tu edificio va en obra gruesa.');
  assert.strictEqual(c.textoHito(0.25), 'Llevas un cuarto de tu pie.');
  assert.strictEqual(c.textoHito(0.75, 2), 'Llevas tres cuartos de tu pie. Tu edificio va en terminaciones.');
});

test('Días hasta la entrega de las llaves', () => {
  assert.strictEqual(c.diasHasta('2027-12-15', new Date(2026, 10, 4)), 406);
  assert.strictEqual(c.diasHasta('2026-11-05', new Date(2026, 10, 4, 22, 30)), 1);
  assert.strictEqual(c.diasHasta('2026-01-01', new Date(2026, 10, 4)), 0);
});
