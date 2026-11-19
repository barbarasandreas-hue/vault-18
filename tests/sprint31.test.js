// Sprint 31 (18-nov-2026): asesorar y acompañar toda la compra.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const c = require('../js/calculos.js');
const app = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');

const base = { contrato: 'indefinido', mesesTrabajo: 24, deudasAtrasadas: false, sueldoPropio: 1400000, sueldoPareja: null, otrasCuotas: 0 };

test('S31-A: con todo en regla, está lista para el banco', () => {
  const r = c.listoParaBanco(base, 0);
  assert.strictEqual(r.listo, true);
  assert.ok(r.items.every(x => x.estado === 'ok'));
});
test('S31-A: con contrato, Bci pide 3 meses; dice en cuántos meses cumple', () => {
  const r = c.listoParaBanco(Object.assign({}, base, { mesesTrabajo: 1 }), 0);
  const t = r.items.find(x => x.id === 'trabajo');
  assert.strictEqual(t.estado, 'falta');
  assert.strictEqual(t.cumpleEnMeses, 2);
  assert.strictEqual(r.cumpleEnMeses, 2);
  assert.strictEqual(r.listo, false);
});
test('S31-A: independiente necesita 1 año', () => {
  const r = c.listoParaBanco(Object.assign({}, base, { contrato: 'independiente', mesesTrabajo: 8 }), 0);
  assert.strictEqual(r.items.find(x => x.id === 'trabajo').cumpleEnMeses, 4);
});
test('S31-A: plazo fijo cumple en Bci, con un aviso', () => {
  const r = c.listoParaBanco(Object.assign({}, base, { contrato: 'plazo-fijo' }), 0);
  assert.strictEqual(r.items.find(x => x.id === 'trabajo').estado, 'ojo');
  assert.strictEqual(r.listo, true);
});
test('S31-A: deudas atrasadas y sueldo bajo el mínimo bloquean', () => {
  assert.strictEqual(c.listoParaBanco(Object.assign({}, base, { deudasAtrasadas: true }), 0).items.find(x => x.id === 'historial').estado, 'falta');
  assert.strictEqual(c.listoParaBanco(Object.assign({}, base, { sueldoPropio: 500000 }), 0).items.find(x => x.id === 'renta').estado, 'falta');
});
test('S31-A: sin datos de trabajo ni historial, quedan pendientes (no se inventan)', () => {
  const r = c.listoParaBanco({ sueldoPropio: 1400000 }, 0);
  assert.strictEqual(r.pendiente, 2);
  assert.strictEqual(r.listo, false);
});
test('S31-A: si el crédito del rango no cabe, avisa con UF', () => {
  const r = c.listoParaBanco(base, 5000);
  assert.strictEqual(r.items.find(x => x.id === 'carga').estado, 'ojo');
});
test('S31-B: del sí a las llaves en el orden real: tasación y títulos antes de firmar; inscripción después', () => {
  const ids = c.DE_SI_A_LLAVES.map(x => x.id);
  assert.deepStrictEqual(ids, ['promesa', 'tasacion', 'titulos', 'aprobacion', 'firma', 'inscripcion', 'llaves']);
  assert.ok(ids.indexOf('tasacion') < ids.indexOf('firma') && ids.indexOf('inscripcion') > ids.indexOf('firma'));
  assert.doesNotMatch(app, /todo en un solo momento/);
  assert.match(app, /Del sí del banco a las llaves/);
});
test('S31-C: la carpeta suma carpeta tributaria (independientes) y declaración jurada (para vivir)', () => {
  assert.match(app, /id: 'tributaria'/);
  assert.match(app, /id: 'declaracion'/);
  assert.match(app, /function docsRequeridos/);
});
test('S31-D: con Registro Social hasta 60 % y UF 1.100, tramo 1 con UF 600', () => {
  assert.deepStrictEqual(c.ds1Para(1000, { rshTramo: 60 }), { tramo: 1, montoUF: 600, ahorroUF: 30, mesesCuenta: 12 });
});
test('S31-D: con Registro Social hasta 80 %, tramo 2 de UF 550 a 250', () => {
  const r = c.ds1Para(1500, { rshTramo: 80 });
  assert.strictEqual(r.tramo, 2);
  assert.strictEqual(r.ahorroUF, 40);
  assert.ok(r.montoUF >= 250 && r.montoUF <= 550);
  assert.strictEqual(c.montoDS1Tramo2(1600), 250);
  assert.strictEqual(c.montoDS1Tramo2(700), 550);
});
test('S31-D: sin tramo informado, todo sigue igual (tramo 3 o 4)', () => {
  assert.strictEqual(c.ds1Para(1500, null).tramo, 3);
  assert.strictEqual(c.ds1Para(1500, { rshTramo: 90, rshSobre90: false }).tramo, 3);
});
test('S31: app.js compila', () => { new (require('vm').Script)(app, { filename: 'app.js' }); });
