// Pruebas del Sprint 18, Bloque 1: descuento real del grupo y un solo reloj.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');
const datos = require('../js/datos.js');

const mirador = datos.buscarProyecto('mirador-independencia'); // 6 de 10 cupos

test('precioUF sin unidades no supone el grupo completo', () => {
  assert.strictEqual(c.precioUF(2500, 'lote'), 2500);
  assert.strictEqual(c.precioUF(2500, 'lote', 10), 2375);
});

test('Descuento de hoy: cupos tomados más el tuyo', () => {
  assert.strictEqual(c.unidadesHoy(mirador, 0, false), 7);
  assert.strictEqual(c.unidadesHoy(mirador, 1, true), 7); // ya estás: no se cuenta dos veces
  assert.strictEqual(c.unidadesHoy(mirador, 9, true), 10); // nunca más que los cupos
  const r = c.resumenProyecto(mirador, datos.departamentosDe(mirador.id), 0, 0, 'vivir', { descuentoHoy: true, yaEstas: false });
  assert.strictEqual(r.descuento, 0.03);
  assert.strictEqual(r.escenario.precioUF, 2425);
  assert.strictEqual(r.ahorro, 3079875);
  assert.strictEqual(r.ahorroCompleto, 5133125); // el 5 % queda como posibilidad
  assert.strictEqual(r.descuentoCompleto, 0.05);
});

test('Si el grupo se completa, el precio baja al 5 %', () => {
  const r = c.resumenProyecto(mirador, datos.departamentosDe(mirador.id), 4, 0, 'vivir', { descuentoHoy: true, yaEstas: true });
  assert.strictEqual(r.descuento, 0.05);
  assert.strictEqual(r.escenario.precioUF, 2375);
});

test('Sin opciones (modo arrendar) se mantiene el cálculo de siempre', () => {
  const r = c.resumenProyecto(mirador, datos.departamentosDe(mirador.id), 0, 0, 'arrendar');
  assert.strictEqual(r.descuento, 0.05);
});

test('Un solo reloj: la fecha de la demo avanza mes a mes', () => {
  assert.strictEqual(c.fechaMasMeses('2026-11-03', 0), '2026-11-03');
  assert.strictEqual(c.fechaMasMeses('2026-11-03', 2), '2027-01-03');
  assert.strictEqual(c.fechaMasMeses('2026-01-31', 1), '2026-02-28');
  // La entrega de Mirador (15-dic-2027) queda a 14 meses de hoy (se cuenta el mes empezado) y a 0 al llegar a ese mes.
  assert.strictEqual(c.mesesEntre('2026-11-03', mirador.entregaEstimada), 14);
  assert.strictEqual(c.mesesEntre(c.fechaMasMeses('2026-11-03', 14), mirador.entregaEstimada), 0);
});
