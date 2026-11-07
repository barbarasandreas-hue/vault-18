// Pruebas del Sprint 20: tasa de ejemplo (S20-T1) y beneficios validados (S20-T2).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const c = require('../js/calculos.js');

test('S20-T1: tasa de ejemplo de Bci (nov-2026) y peor caso de Hacienda', () => {
  assert.strictEqual(c.SUPUESTOS.tasaBci, 0.0346);
  assert.strictEqual(c.SUPUESTOS.tasaSinSubsidio, 0.0406);
  assert.strictEqual(c.SUPUESTOS.tasaPeorCaso, 0.0445);
  // Sin subsidio = con subsidio + 0,6 puntos, y no pasa del tope de Hacienda (si lo pasara, no habría subsidio).
  assert.ok(Math.abs(c.SUPUESTOS.tasaSinSubsidio - c.SUPUESTOS.tasaBci - 0.006) < 1e-12);
  assert.ok(c.SUPUESTOS.tasaSinSubsidio <= c.SUPUESTOS.tasaPeorCaso);
  // El filtro de rentabilidad del modo invertir sigue a la tasa con subsidio.
  assert.strictEqual(c.RENTABILIDAD_MINIMA, c.SUPUESTOS.tasaBci);
});

test('S20-T1: el peor caso usa 4,45 %', () => {
  const e = c.escenario(2500, 'individual', 'vivir');
  assert.strictEqual(e.dividendoSinSubsidio, c.ufAPesos(c.dividendoUF(2500, 'vivir', 0.0445)));
  assert.strictEqual(c.numerosCamino('individual-vivir', 2500).dividendoSinSubsidio, e.dividendoSinSubsidio);
});

test('S20-T1: ninguna tasa en pantalla sin su botón "i"', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const lineas = app.split('\n').filter((l) => /formatoPorcentaje\((SUPUESTOS\.tasaBci|s\.tasa)\b/.test(l));
  assert.ok(lineas.length >= 3, 'se esperaban al menos 3 lugares con la tasa');
  for (const l of lineas) assert.match(l, /info\('tasa-ejemplo'\)/, 'tasa sin "i": ' + l.trim().slice(0, 80));
  assert.doesNotMatch(app, /3,9 %|3,9' \+ NBSP/, 'queda una tasa fija de 3,9 %');
});

// ---------- S20-T2: beneficios validados ----------

test('S20-T2: DS1 tramo 3, monto por precio entre UF 250 y 400', () => {
  assert.strictEqual(c.montoDS1Tramo3(1200), 400);
  assert.strictEqual(c.montoDS1Tramo3(1400), 325);
  assert.strictEqual(c.montoDS1Tramo3(1600), 250);
  assert.strictEqual(c.montoDS1Tramo3(2200), 250);
  const t3 = c.ds1Para(2000, null);
  assert.deepStrictEqual(t3, { tramo: 3, montoUF: 250, ahorroUF: 80, mesesCuenta: 12 });
});

test('S20-T2: DS1 tramo 4, de UF 2.200 a 4.000, con UF 410 y sin 12 meses de cuenta', () => {
  assert.deepStrictEqual(c.ds1Para(2500, null), { tramo: 4, montoUF: 410, ahorroUF: 200, mesesCuenta: 0 });
  assert.strictEqual(c.ds1Para(4000, null).tramo, 4);
  assert.strictEqual(c.ds1Para(4001, null).bloqueo.razon, 'Sobre UF 4.000');
});

test('S20-T2: un departamento de UF 2.500 muestra el DS1 tramo 4 con UF 410', () => {
  const pf = { ahorroActual: 3000000, ahorroMensual: 600000 };
  const d = { listaUF: 2500, enObra: false, mesesEntrega: 0 };
  const r = c.calcularPiezas(pf, { subsidio: true }, d, '2026-11-03');
  assert.strictEqual(r.on.subsidio, true);
  assert.strictEqual(r.ds1.tramo, 4);
  assert.strictEqual(r.subsidioUF, 410);
  // Pie = el ahorro mínimo (UF 200); crédito = precio − ahorro − subsidio, nunca sobre 90 %.
  assert.strictEqual(r.pie, c.ufAPesos(200));
  assert.strictEqual(r.creditoUF, 2500 - 410 - 200);
  assert.ok(r.pctCredito <= 0.9);
  // Sin los 12 meses de cuenta, la fecha no la frena la cuenta de vivienda.
  assert.notStrictEqual(r.freno, 'cuenta-vivienda');
});

test('S20-T2: tope de sueldo del DS1 (sobre el 90 % del Registro Social)', () => {
  // Tramo 4, pareja: tope $3.496.130.
  assert.ok(c.ds1Para(2500, { sueldoPropio: 1800000, sueldoPareja: 1700000 }).bloqueo);
  assert.strictEqual(c.ds1Para(2500, { sueldoPropio: 1800000, sueldoPareja: 1600000 }).tramo, 4);
  // Tramo 3, persona sola: tope $1.992.086.
  assert.strictEqual(c.ds1Para(2000, { sueldoPropio: 2000000, sueldoPareja: null }).bloqueo.razon, 'Sobre tope de sueldo');
  // Quien está en el 90 % del Registro Social no tiene tope.
  assert.strictEqual(c.ds1Para(2000, { sueldoPropio: 2000000, sueldoPareja: null, rshSobre90: false }).tramo, 3);
  // En Llega antes, la pieza queda bloqueada con su razón.
  const d = { listaUF: 2500, enObra: false, mesesEntrega: 0 };
  assert.strictEqual(c.bloqueoPieza('subsidio', {}, d, { sueldoPropio: 2500000, sueldoPareja: 1500000 }).razon, 'Sobre tope de sueldo');
});

test('S20-T2: el DS1 no sirve para invertir (exige no tener vivienda)', () => {
  assert.strictEqual(c.ds1Para(2000, { modo: 'arrendar' }).bloqueo.razon, 'Para invertir');
});

test('S20-T2: textos de las piezas con los datos validados', () => {
  assert.match(c.PIEZAS_VIVIR.subsidio.cond, /UF 4\.000/);
  assert.match(c.PIEZAS_VIVIR.iva.cond, /17 de octubre de 2026/);
  assert.match(c.PIEZAS_VIVIR.iva.cond, /promesa/);
  assert.match(c.PIEZAS_VIVIR.regalo.cond, /mitad del impuesto/);
});
