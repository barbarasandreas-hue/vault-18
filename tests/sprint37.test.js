// Sprint 37: cambios del 23 de noviembre (caminos, DS19 y DS1, pregunta de Departamentos).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const c = require('../js/calculos.js');

test('E1: el crédito individual se llama Compra directa y la garantía no es un camino', () => {
  assert.strictEqual(c.CAMINOS['individual-vivir'].nombre, 'Compra directa');
  assert.ok(!Object.values(c.CAMINOS).some((x) => x.nombre === 'Crédito con garantía del Estado'));
});

test('E2: el DS19 se explica como proyectos específicos con cupos y Registro Social', () => {
  assert.match(app, /solo en proyectos DS19 específicos, que tienen cupos limitados/);
  assert.match(app, /Registro Social de Hogares/);
  assert.doesNotMatch(app, /Desde UF 350/);
});

test('E2: el DS1 se marca como acelerador', () => {
  assert.match(app, /Es un acelerador: se suma a un camino/);
});

test('E3: arriba de la lista de caminos una tarjeta pregunta qué te importa; la respuesta se guarda', () => {
  assert.match(app, /¿Qué es lo que más te importa\?/);
  assert.match(app, /lineaPrioridad \+ preguntaHtml \+ heroHtml/);
  assert.doesNotMatch(app, /if \(!estado\.prioridadRespondida\) \{\n      cont\.innerHTML/);
  assert.match(app, /'prioridad', 'prioridadRespondida'/);
  assert.match(app, /Ahora no/);
  assert.match(app, /Cambiar mi respuesta/);
  assert.match(app, /btn-cambiar-prioridad-perfil/);
  assert.match(app, /'Otros caminos' : 'Los caminos'/);
});

test('La app tiene el ancho de un iPhone (393 px)', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
  assert.match(css, /--ancho-telefono: 393px/);
  assert.doesNotMatch(css, /max-width: 480px/);
});

test('E4: ficha estándar de la compra en grupo marcada como ejemplo simulado', () => {
  assert.match(app, /function fichaGrupoHtml/);
  assert.match(app, /Necesitas ' \+ \(p\.cupos \|\| 10\) \+ ' compradores/);
  assert.match(app, /nadie queda amarrado/);
  assert.match(app, /Ejemplo simulado/);
});

test('E4: el filtro del estado del edificio dice Terminado', () => {
  assert.match(app, /chip\('estado', 'nuevo', 'Terminado'\)/);
});

test('E5: el detalle se llama «¿Cómo puedes llegar antes?» y Tu compra separa elegidos de los que puedes sumar', () => {
  assert.match(app, /abrirHojaContenido\('¿Cómo puedes llegar antes\?'/);
  assert.doesNotMatch(app, /<strong>Formas de pagar menos<\/strong>/);
  assert.match(app, /function aceleradoresCompraHtml/);
  assert.match(app, /Ya los sumaste/);
  assert.match(app, /Puedes sumar/);
  assert.match(app, /!f\.bloqueo/);
});

test('E6: Sumar a alguien al crédito es un acelerador con acuerdo entre personas, que se guarda', () => {
  assert.match(app, /nombre: 'Sumar a alguien al crédito'/);
  assert.match(app, /function abrirAcuerdoCredito/);
  assert.match(app, /Cada uno según su parte/);
  assert.match(app, /El otro compra su parte/);
  assert.match(app, /'acuerdoCredito'/);
  assert.match(app, /no reemplaza un contrato ni asesoría legal/);
  assert.doesNotMatch(app, /mancomunad/i);
});

test('E7: el familiar ve cuánto puede perder como máximo y acepta con casilla antes de ser respaldo', () => {
  assert.match(app, /Lo máximo que puedes perder/);
  assert.match(app, /Lo esperable si todo sigue bien/);
  assert.match(app, /id="cf-acepto"/);
  assert.match(app, /Acepto ser su respaldo/);
  assert.match(app, /aria-disabled/);
  assert.match(app, /'respaldoAceptado'/);
  assert.match(app, /propuesta a validar con Bci/);
});

test('Arriendo con opción de compra no tiene «Ayudas para llegar antes» y su ruta /como no vuelve en bucle', () => {
  assert.match(app, /vivir && id === 'arriendo-opcion' \? ''/);
  assert.match(app, /estado\.modo === 'vivir' && id !== 'arriendo-opcion'/);
  assert.match(app, /q\[2\] === 'como'\) location\.replace\('#compra\/caminos\/arriendo-opcion'\)/);
});

test('Las fechas dicen «Recibes tus llaves» y no «Es tuyo» (23-nov)', () => {
  assert.match(app, /Recibes tus llaves <strong>/);
  assert.match(app, /¿Cuándo recibes tus llaves con cada camino\?/);
  assert.match(app, /'Firmas' : 'Recibes tus llaves'/);
  assert.doesNotMatch(app, /'Todavía no te alcanza' : 'Es tuyo <strong>/);
  assert.doesNotMatch(app, /chip\('orden', 'antes', 'Es tuyo antes'\)/);
});

test('Tu compra lleva a Departamentos para elegir el camino (para vivir)', () => {
  assert.match(app, /'Elegir en Departamentos'/);
  assert.match(app, /if \(sp\.id === 'camino'\) return estado\.modo === 'vivir' \? '#departamentos'/);
});

test('Cuatro arreglos pequeños (23-nov): pregunta guardada, ayudas que aplican, datos del grupo, un solo volver', () => {
  assert.match(app, /if \(estado\.prioridad\) estado\.prioridadRespondida = true;/);
  assert.match(app, /'usados': \['ds1', 'regalo'\]/);
  assert.match(app, /Postulaciones abiertas/);
  assert.match(app, /Postulaciones cerradas/);
  assert.doesNotMatch(app, /\n\s+ponerVolverAbajo\(visible\);/);
});
