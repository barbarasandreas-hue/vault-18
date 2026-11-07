// Pruebas del Sprint 17: un solo plazo, números según lo decidido y piezas que se suman.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const HOY = '2026-11-03';
const pareja = { ahorroActual: 3000000, ahorroMensual: 600000 };
const terminado = { listaUF: 2150, enObra: false, mesesEntrega: 0 };
const enObra = { listaUF: 2450, enObra: true, mesesEntrega: 16, descuento: 0.05 };

test('Plazo: el mayor entre juntar lo que falta y las fechas mínimas', () => {
  assert.deepStrictEqual(c.plazoConPisos(0, 600000, []), { meses: 0, freno: 'ninguno', basta: 0, mesesAhorro: 0 });
  const r = c.plazoConPisos(6000000, 600000, [{ meses: 16, freno: 'entrega' }]);
  assert.strictEqual(r.meses, 16);
  assert.strictEqual(r.freno, 'entrega');
  assert.strictEqual(Math.round(r.basta), 375000); // basta con juntar menos al mes
  assert.strictEqual(c.plazoConPisos(9000000, 600000, [{ meses: 12, freno: 'cuenta-vivienda' }]).freno, 'ahorro');
  assert.strictEqual(c.mesesEntre('2026-11-03', '2027-12-15'), 14);
  assert.strictEqual(c.fechaLlaves(13, HOY), 'diciembre de 2027');
});

test('Lo ya ahorrado cuenta desde el primer día', () => {
  const sin = c.calcularPiezas({ ahorroActual: 0, ahorroMensual: 600000 }, {}, terminado, HOY);
  const con = c.calcularPiezas(pareja, {}, terminado, HOY);
  assert.ok(con.meses < sin.meses);
  assert.ok(con.avance > 0.25 && con.avance < 0.3);
});

test('Números según lo decidido: rango, redondeado o exacto', () => {
  assert.strictEqual(c.formatoSegunEtapa({ desde: 8200000, hasta: 10300000 }, 'rango'), 'entre $8 y $11 millones');
  assert.strictEqual(c.formatoSegunEtapa({ desde: 380000, hasta: 470000 }, 'rango'), 'entre $380 y $470 mil');
  assert.strictEqual(c.formatoSegunEtapa(9752938, 'redondeado'), '$9,8 millones');
  assert.strictEqual(c.formatoSegunEtapa(442759, 'redondeado'), '$443 mil');
  assert.strictEqual(c.formatoSegunEtapa(9752938, 'exacto'), '$9.752.938');
});

test('Piezas: lo que no se suma y por qué', () => {
  assert.deepStrictEqual(c.bloqueoPieza('iva', {}, enObra), { razon: 'En obra', como: 'Elige uno terminado.' });
  assert.strictEqual(c.bloqueoPieza('grupo', {}, terminado).razon, 'Terminado');
  // S20-T2: el DS1 llega a UF 4.000 (tramo 4); sobre eso se bloquea.
  assert.strictEqual(c.bloqueoPieza('subsidio', { grupo: true }, enObra), null);
  assert.strictEqual(c.bloqueoPieza('subsidio', {}, { listaUF: 4200, enObra: false, mesesEntrega: 0 }).razon, 'Sobre UF 4.000');
  assert.strictEqual(c.bloqueoPieza('subsidio', {}, terminado), null);
  // Sin departamento, comprar en grupo implica en obra: grupo y sin IVA no se suman.
  assert.strictEqual(c.bloqueoPieza('iva', { grupo: true }, null).razon, 'En obra');
});

test('Con grupo, las llaves las fija la entrega y baja lo que juntas al mes', () => {
  const sin = c.calcularPiezas(pareja, {}, enObra, HOY);
  const con = c.calcularPiezas(pareja, { grupo: true }, enObra, HOY);
  assert.strictEqual(con.meses, 16);
  assert.strictEqual(con.freno, 'entrega');
  assert.ok(con.basta < sin.basta);
  assert.strictEqual(c.efectoPieza('grupo', pareja, {}, enObra, HOY).texto, '−$5 millones');
});

test('Con subsidio, el plazo es de al menos 12 meses y el pie baja al ahorro mínimo', () => {
  const r = c.calcularPiezas(pareja, { subsidio: true }, terminado, HOY);
  assert.ok(r.meses >= 12);
  assert.strictEqual(r.freno, 'cuenta-vivienda');
  assert.strictEqual(r.pie, c.ufAPesos(80));
});

test('Sin IVA se marca si las llaves llegan después del 1 de diciembre de 2027', () => {
  const lento = c.calcularPiezas({ ahorroActual: 0, ahorroMensual: 200000 }, { iva: true }, terminado, HOY);
  assert.strictEqual(lento.ivaTarde, true);
  assert.strictEqual(c.calcularPiezas(pareja, { iva: true }, terminado, HOY).ivaTarde, false);
});

test('La mejor pieza nunca es el respaldo familiar', () => {
  const m = c.mejorPieza({ ahorroActual: 0, ahorroMensual: 300000 }, {}, terminado, HOY);
  assert.notStrictEqual(m, 'respaldo');
  assert.ok(['subsidio', 'iva', 'regalo'].includes(m));
});
