// Pruebas del Sprint 13: volver a la app.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

test('Más cupos, más descuento: lo asegurado hoy y cuántos faltan', () => {
  assert.deepStrictEqual(c.cuposParaMasDescuento(6, 10), { asegurado: 0.03, faltan: 4, descuentoSiguiente: 0.05 });
  assert.deepStrictEqual(c.cuposParaMasDescuento(9, 10), { asegurado: 0.03, faltan: 1, descuentoSiguiente: 0.05 });
  assert.deepStrictEqual(c.cuposParaMasDescuento(3, 10), { asegurado: 0, faltan: 2, descuentoSiguiente: 0.03 });
  // Un lote de 8 no llega a 10: con 5 o más ya no hay otro escalón
  assert.deepStrictEqual(c.cuposParaMasDescuento(5, 8), { asegurado: 0.03, faltan: 0, descuentoSiguiente: null });
  assert.deepStrictEqual(c.cuposParaMasDescuento(10, 10), { asegurado: 0.05, faltan: 0, descuentoSiguiente: null });
});

test('Lo tuyo hoy y cuánto creció, sin plusvalía', () => {
  const precio = 2375;
  const saldo1 = c.saldoBciUF(precio, 1, 'arrendar');
  assert.strictEqual(c.patrimonioUF(precio, saldo1, 356.25), precio - saldo1 - 356.25);
  assert.strictEqual(c.patrimonioUF(100, 200, 0), 0);
  const crecio = c.crecimientoMesUF(precio, 1, 'arrendar', 6.15);
  assert.ok(Math.abs(crecio - (6.15 + (precio * 0.8 - saldo1))) < 1e-9);
  // Para vivir, sin recompra: solo lo que bajó la deuda
  assert.ok(c.crecimientoMesUF(2500, 1, 'vivir', 0) > 0);
});

test('Avisos del mes: nombran la meta, uno por semana y la cuota el día 1', () => {
  const a = c.avisosDelMes({ etapa: 'pie', lugar: 'en Independencia', meses: 7, cuota: 800000, ultimoMes: 'pago',
    grupo: { faltan: 4, descuentoSiguiente: 0.05 }, obra: { etapa: 1 }, apagados: {} });
  assert.deepStrictEqual(a.map((x) => x.tipo), ['cuota', 'grupo', 'obra']);
  assert.deepStrictEqual(a.map((x) => x.dia), [1, 8, 15]);
  assert.match(a[0].titulo, /Nuevo mes: tu cuota de \$800\.000/);
  assert.match(a[0].texto, /Faltan 7 meses para tu departamento en Independencia/);
  assert.match(a[1].texto, /Con 4 personas más, el descuento sube a 5/);
  assert.match(a[2].texto, /obra gruesa/);
  for (const x of a) assert.doesNotMatch(x.titulo + x.texto, /Recuerda ahorrar/i);
});

test('Avisos: después de "Este mes no pude", nueva racha sin culpa', () => {
  const a = c.avisosDelMes({ etapa: 'pie', lugar: 'en Independencia', meses: 8, cuota: 800000, ultimoMes: 'reinicio', apagados: {} });
  assert.strictEqual(a[0].titulo, 'Nuevo mes, nueva racha');
});

test('Avisos: se apagan por tipo, y como máximo 4 al mes', () => {
  const base = { etapa: 'pie', lugar: 'en Independencia', meses: 7, cuota: 800000, grupo: { faltan: 1, descuentoSiguiente: 0.05 }, obra: { etapa: 2 },
    inversiones: [{ nombre: 'Edificio Jardín Independencia', pesos: 9204 }, { nombre: 'Edificio Plaza Estación', pesos: 5000 }] };
  assert.strictEqual(c.avisosDelMes({ ...base, apagados: {} }).length, 4);
  const sinGrupo = c.avisosDelMes({ ...base, apagados: { grupo: true, cuota: true } });
  assert.deepStrictEqual(sinGrupo.map((x) => x.tipo), ['obra', 'departamento', 'departamento']);
  assert.match(sinGrupo[1].titulo, /Recibiste \$9\.204/);
});

test('Avisos del departamento: lo tuyo creció', () => {
  const a = c.avisosDelMes({ etapa: 'departamento', crecioPesos: 300000, porcentajeTuyo: 85, apagados: {} });
  assert.match(a[0].titulo, /Lo tuyo creció \$300\.000 este mes/);
  assert.match(a[0].texto, /85 %/);
});

test('Registro: las dos preguntas nuevas van en el texto', () => {
  const t = c.textoRegistro({ volveria: 'Sí', avisoVolver: 'Tu cuota' }, '2026-11-04');
  assert.match(t, /¿Volvería el próximo mes\?: Sí/);
  assert.match(t, /Aviso que la haría volver: Tu cuota/);
});

test('Lista de regalos: cuántos meses adelanta un aporte', () => {
  // Meta $4.000.000, lleva $1.000.000, junta $500.000 al mes: faltan 6 meses.
  assert.strictEqual(c.mesesRestantes(4000000, 1000000, 500000), 6);
  assert.strictEqual(c.mesesQueAdelanta(4000000, 1000000, 500000, 500000), 1);
  assert.strictEqual(c.mesesQueAdelanta(4000000, 1000000, 500000, 1000000), 2);
  // Un aporte chico no alcanza a adelantar un mes.
  assert.strictEqual(c.mesesQueAdelanta(4000000, 1000000, 500000, 100000), 0);
  // Nunca adelanta más de lo que falta.
  assert.strictEqual(c.mesesQueAdelanta(4000000, 1000000, 500000, 9000000), 6);
});

test('Lista de regalos: a cuántos días de ahorro equivale un aporte', () => {
  assert.strictEqual(c.diasDeAhorro(200000, 800000), 8);
  assert.strictEqual(c.diasDeAhorro(1000, 800000), 1);
  assert.strictEqual(c.diasDeAhorro(200000, 0), 0);
});
