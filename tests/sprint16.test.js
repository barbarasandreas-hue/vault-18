// Pruebas del Sprint 16: avatar, Tu equipo y la carrera a la puerta.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

test('Carrera: el camino que llega antes queda más cerca de la puerta', () => {
  assert.strictEqual(c.posicionCarrera(0, 20), 1);
  assert.ok(c.posicionCarrera(6, 20) > c.posicionCarrera(12, 20));
  // El más lento igual avanza un poco.
  assert.ok(c.posicionCarrera(20, 20) > 0 && c.posicionCarrera(20, 20) < 0.25);
  // Sin plazo (falta el ahorro) queda en la partida; nunca sale del carril.
  assert.strictEqual(c.posicionCarrera(null, 20), 0);
  assert.strictEqual(c.posicionCarrera(80, 20), 0);
});

test('Tu equipo: las relaciones se pueden repetir (dos mamás, dos papás)', () => {
  let e = [];
  e = c.agregarMiembro(e, 'mamá', { piel: 1, pelo: 'largo' });
  e = c.agregarMiembro(e, 'mamá', { piel: 3, pelo: 'rapado' });
  e = c.agregarMiembro(e, 'papá', null);
  e = c.agregarMiembro(e, 'papá', null);
  assert.strictEqual(e.filter((m) => m.relacion === 'mamá').length, 2);
  assert.strictEqual(e.filter((m) => m.relacion === 'papá').length, 2);
  assert.strictEqual(new Set(e.map((m) => m.id)).size, 4);
  // Una relación que no existe no se agrega.
  assert.strictEqual(c.agregarMiembro(e, 'novia', {}).length, 4);
  // La pareja es "pareja", sin género.
  assert.ok(c.RELACIONES_EQUIPO.includes('pareja'));
  assert.ok(!c.RELACIONES_EQUIPO.some((r) => /novi|espos|marido/.test(r)));
});

test('Tu equipo: cuenta personas y mascotas, sin contar a la usuaria', () => {
  const e = [{ relacion: 'pareja' }, { relacion: 'mamá' }, { relacion: 'mamá' }, { relacion: 'mascota' }];
  assert.deepStrictEqual(c.contarEquipo(e, false), { personas: 3, mascotas: 1 });
  assert.deepStrictEqual(c.contarEquipo(e, 'perro'), { personas: 3, mascotas: 2 });
  assert.deepStrictEqual(c.contarEquipo([], false), { personas: 0, mascotas: 0 });
});

test('Avatar: sin género y sin valores sugeridos', () => {
  const a = c.normalizarAvatar({ genero: 'mujer', piel: 9, pelo: 'largo', accesorios: ['lentes', 'corona'], mascota: 'loro' });
  assert.ok(!('genero' in a));
  assert.strictEqual(a.piel, null);
  assert.strictEqual(a.pelo, 'largo');
  assert.deepStrictEqual(a.accesorios, ['lentes']);
  assert.strictEqual(a.mascota, '');
  // Un avatar nuevo parte vacío: nada elegido de antemano.
  assert.deepStrictEqual(c.normalizarAvatar({}), { piel: null, pelo: null, colorPelo: null, ropa: null, accesorios: [], mascota: '' });
  // Todos los peinados están disponibles para todos.
  assert.deepStrictEqual(c.AVATAR_PELOS, ['corto', 'largo', 'moño', 'rizado', 'rapado', 'ondulado']);
});
