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
