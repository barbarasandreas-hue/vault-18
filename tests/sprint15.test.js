// Pruebas del Sprint 15: navegación y confianza.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const vivir = { modo: 'vivir', sueldoPropio: 1500000, sueldoPareja: 1000000, arriendoActual: 0, otrasCuotas: 0,
  ahorroActual: 3000000, ahorroMensual: 600000, hayGrupo: true, listaUF: 2500 };

test('Crédito base de cada modo', () => {
  assert.strictEqual(c.caminoBase('vivir'), 'individual-vivir');
  assert.strictEqual(c.caminoBase('arrendar'), 'individual-invertir');
});

test('Caminos: recomendado, siempre el base y a lo más uno más', () => {
  const rec = c.recomendarCamino(vivir);
  const s = c.caminosParaMostrar(vivir, rec);
  assert.strictEqual(s.mostrados[0], rec.id);
  assert.ok(s.mostrados.includes('individual-vivir'));
  assert.ok(s.mostrados.length <= 3);
  // Las fichas no son caminos.
  assert.ok(!s.mostrados.includes('arriendo-opcion') && !s.mostrados.includes('respaldo-familiar'));
  // Lo de otro modo se explica.
  assert.deepStrictEqual(s.noMostrados.at(-1), { id: 'pie-compartido', razon: 'otro-modo-arrendar' });
});

test('Sin grupo en el rango: la compra en grupo no aparece y dice por qué', () => {
  const p = Object.assign({}, vivir, { hayGrupo: false });
  const rec = c.recomendarCamino(p);
  assert.strictEqual(rec.id, 'individual-vivir');
  const s = c.caminosParaMostrar(p, rec);
  assert.deepStrictEqual(s.mostrados, ['individual-vivir']);
  assert.ok(s.noMostrados.some(x => x.id === 'grupo-vivir' && x.razon === 'sin-grupo'));
});

test('Arrendar: nunca más de 3 caminos', () => {
  const p = { modo: 'arrendar', sueldoPropio: 2500000, sueldoPareja: 1500000, arriendoActual: 300000, otrasCuotas: 0,
    ahorroActual: 2000000, ahorroMensual: 900000, hayGrupo: true, listaUF: 2500 };
  const rec = c.recomendarCamino(p);
  const s = c.caminosParaMostrar(p, rec);
  assert.ok(s.mostrados.length <= 3);
  assert.ok(s.mostrados.includes('individual-invertir'));
  assert.ok(s.noMostrados.some(x => x.razon === 'otro-modo-vivir'));
});

test('Diferencia con el crédito base', () => {
  const n = c.numerosCamino('grupo-vivir', 2500, vivir);
  const b = c.numerosCamino('individual-vivir', 2500, vivir);
  const d = c.diferenciaConBase('grupo-vivir', n, b);
  assert.ok(Math.abs(d.descuento - 0.05) < 1e-9);  // grupo de 10: 5 % más barato
  assert.ok(d.pieMenos > 0);
  assert.ok(d.mesesAntes >= 0);
  assert.strictEqual(d.enCuotas, true);
  const igual = c.diferenciaConBase('individual-vivir', b, b);
  assert.deepStrictEqual(igual, { descuento: 0, mesesAntes: 0, pieMenos: 0, enCuotas: false });
});

test('Hoja de Simulación: CAE mayor que la tasa y costo total coherente', () => {
  const s = c.simulacionCredito(2500, 0.9);
  assert.strictEqual(s.tasa, c.SUPUESTOS.tasaBci);
  assert.ok(s.cae > s.tasa && s.cae < 0.06, 'CAE ' + s.cae);
  assert.ok(s.dividendoConSeguros > s.dividendoSinSeguros);
  // El costo total es 360 dividendos con seguros más los gastos.
  assert.ok(Math.abs(s.costoTotal - (s.dividendoConSeguros * 360 + s.gastos)) < 400);
  const sin = c.simulacionCredito(2500, 0.9, c.SUPUESTOS.tasaPeorCaso);
  assert.ok(sin.cae > s.cae);
});
