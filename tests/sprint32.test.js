// Sprint 32 (19-nov-2026): la nueva navegación. Pasos según el camino.
const test = require('node:test');
const assert = require('node:assert');
const c = require('../js/calculos.js');

const HOY = new Date('2026-11-19T12:00:00');
const foto = (extra) => Object.assign({ grupo: false, arriendo: false, numeros: true, cuentaVivienda: false, ahorrado: 0, meta: 1e7,
  preaprobado: false, asegurado: false, esTuyo: false, ds1: null, eligio: false, caminoElegido: false }, extra);

test('S32-B1: sin camino, solo elegirlo y tus llaves', () => {
  const h = c.hitoActual(foto());
  assert.deepStrictEqual(h.hitos.map((x) => x.id), ['camino', 'es-tuyo']);
  assert.strictEqual(h.id, 'camino');
});
test('S32-B1: cada camino arma sus pasos', () => {
  assert.deepStrictEqual(c.hitoActual(foto({ caminoElegido: true })).hitos.map((x) => x.id), ['camino', 'depto', 'pie', 'preaprobacion', 'asegurar', 'es-tuyo']);
  assert.deepStrictEqual(c.hitoActual(foto({ caminoElegido: true, grupo: true })).hitos.map((x) => x.id), ['camino', 'depto', 'preaprobacion', 'pie', 'aprobacion', 'es-tuyo']);
  assert.deepStrictEqual(c.hitoActual(foto({ caminoElegido: true, arriendo: true })).hitos.map((x) => x.id), ['camino', 'depto', 'entrada', 'contrato', 'pie', 'preaprobacion', 'es-tuyo']);
});
test('S32-B1: "Tus números" y "Tu cuenta" ya no son pasos', () => {
  ['individual', 'grupo', 'arriendo', 'sinCamino'].forEach((k) => {
    assert.ok(!c.HITOS_CAMINO[k].includes('numeros'));
    assert.ok(!c.HITOS_CAMINO[k].includes('cuenta'));
  });
});
test('S32-B1: en grupo el paso del departamento es tu edificio', () => {
  const h = c.hitoActual(foto({ caminoElegido: true, grupo: true }));
  assert.strictEqual(h.id, 'depto');
  assert.strictEqual(h.nombre, 'Elige tu departamento'); // S34: un solo nombre (antes «Tu edificio»)
});
test('S32-B1: las misiones no repiten pasos (elegir ya no es misión)', () => {
  const ids = c.misiones(foto({ caminoElegido: true, ds1: { montoUF: 410 }, cuentaVivienda: true }), HOY).map((x) => x.id);
  assert.ok(!ids.includes('elegir'));
  assert.ok(ids.includes('ds1'));
});
test('S32-B1: si el DS1 vence pronto y falta la cuenta, la tarjeta pide abrirla', () => {
  const p = c.siguientePaso(foto({ caminoElegido: true, eligio: true, ds1: { montoUF: 410 } }), HOY);
  assert.deepStrictEqual([p.tipo, p.id], ['hito', 'cuenta']);
});

// ---------- B2 y B3 ----------
const fs32 = require('fs');
const path32 = require('path');
const app32 = fs32.readFileSync(path32.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const html32 = fs32.readFileSync(path32.join(__dirname, '..', 'index.html'), 'utf8');
test('S32-B2: la barra tiene Mi compra, Mi pie, Departamentos y Perfil', () => {
  ['#compra" data-seccion="compra"', '#pie" data-seccion="pie"', '#departamentos" data-seccion="deptos"', '#perfil" data-seccion="perfil"']
    .forEach(x => assert.ok(html32.includes(x), x));
  // S33-C1 (E1): la barra te habla de «tú».
  assert.match(app32, /RAICES_PESTANA = \{ '#compra': 'Tu compra', '#pie': 'Tu pie', '#departamentos': 'Departamentos', '#perfil': 'Perfil' \}/);
});
test('S32-B2: el código ya no usa las direcciones viejas (solo las redirige)', () => {
  assert.doesNotMatch(app32, /['"]#(camino|pasos|explorar)(['"\/])/);
  assert.match(app32, /case 'explorar': return '#departamentos\/comparar'/); // 23-nov: Comparar vive en Departamentos
});
test('S32-B3: Mi compra: camino horizontal, «Ahora», recorrido con fechas y sin obra ni deslizador', () => {
  assert.match(app32, /function caminoJuego\(h, celebra\)/);
  assert.match(app32, /function bloqueRecorrido\((extra)?\)/);
  assert.match(app32, /function renderRecorrido\(\)/);
  // S33-C2: «Ver con fechas ›» va dentro de «Tus pasos».
  assert.match(app32, /Ver con fechas ›/);
  assert.match(app32, /¡Avanzaste un paso!/);
  assert.doesNotMatch(app32, /¡Subiste un escalón!/);
  const i = app32.indexOf('  function renderTuCaminoVivir(');
  const cuerpo = app32.slice(i, app32.indexOf('\n  }\n', i));
  assert.doesNotMatch(cuerpo, /obraGrande\(\)|rango-mensual|tarjetaMuchoTiempo/);
});
test('S32-B3: sin camino, «Ahora» es elegirlo aunque una misión venza pronto', () => {
  const sp = c.siguientePaso({ caminoElegido: false, eligio: false }, '2026-11-03');
  assert.equal(sp.id, 'camino');
});

// ---------- B4 ----------
test('S32-B4: comparar caminos: prioridades, carrera, lado a lado, «i» y Deshacer', () => {
  assert.match(app32, /function renderComparar\(\)/);
  assert.match(app32, /if \(p\[1\] === 'comparar'\) return r\('caminos', 'deptos', renderComparar\)/); // 23-nov
  assert.match(app32, /¿Qué te importa más\?/);
  assert.match(app32, /Elige dos para verlos lado a lado/); // S34: antes «Carrera hacia tus llaves»
  assert.match(app32, /class="lado-a-lado"/);
  assert.match(app32, /function abrirInfoCamino\(id, boton\)/);
  assert.match(app32, /id="btn-elegido-deshacer"/); // 23-nov: Deshacer vive en la confirmación
  assert.match(app32, /Antes ibas por <strong>/);
  assert.match(app32, /'caminoAnterior', 'prioridad'/);
});
test('S32-B4: el crédito tradicional es un camino para vivir (80 % de crédito, 20 % de pie)', () => {
  assert.equal(c.CAMINOS.usados.modo, 'vivir');
  assert.equal(c.CAMINOS.usados.credito, 0.80);
  assert.equal(c.CAMINOS.usados.usuario, 0.20);
  assert.ok(!c.caminosDelModo('vivir').includes('usados'), 'no cambia lo que recomienda la app');
});

// ---------- B5 ----------
test('S32-B5: Departamentos: una lista con Camino ▾ y Filtros; usados y arriendo adentro', () => {
  assert.match(app32, /function renderDepartamentos\(\)/);
  assert.match(app32, /return r\('proyectos', 'deptos', function \(\) \{ vistaDeptos = null; renderDepartamentos\(\); \}\)/); // 23-nov: Caminos | Edificios
  assert.match(app32, /function abrirCaminoDeptos\(boton\)/);
  assert.match(app32, /function abrirFiltrosDeptos\(boton\)/);
  ['Comuna', 'Precio', 'Dormitorios', 'Estado', 'Ordenar por', 'Solo mis favoritos'].forEach(t => assert.ok(app32.includes(t), t));
  assert.match(app32, /#departamentos\/usado\//);
  assert.match(app32, /#departamentos\/arriendo\//);
  assert.match(app32, /Mirar otro camino no cambia tu plan/);
});
test('S32-B5 (D5): elegir un departamento no lo reserva y vuelve a Mi compra', () => {
  assert.match(app32, /function confirmarDeptoMeta\(item, boton\)/);
  assert.match(app32, /No lo reservas: con él calculamos tu fecha/);
  // 20-nov: el cambio de camino va en una línea sobre el botón (notaCambioCamino).
  assert.match(app32, /Con este, tu camino pasa a <strong>' \+ CAMINOS\[cam\]\.corto/);
  const i = app32.indexOf('  function confirmarDeptoMeta(');
  const cuerpo = app32.slice(i, app32.indexOf('\n  }\n', i));
  assert.match(cuerpo, /location\.hash = '#compra'/);
  assert.doesNotMatch(cuerpo, /irAPostular/);
});

// ---------- B6 ----------
test('S32-B6: Mi pie es pestaña, con el deslizador y su efecto en la fecha', () => {
  assert.match(app32, /<h1 id="titulo-tu-pie" class="h2" tabindex="-1">Tu pie<\/h1>/);
  // S33-C4: el deslizador puede ir dentro de la tarjeta de la cuota.
  assert.match(app32, /function deslizadorPie\(dentro\)/);
  assert.match(app32, /function tuyoConMensual\(v\)/);
  assert.match(app32, /return r\('pie', 'pie',/);
  assert.match(app32, /id="btn-abrir-cuenta">Abrir mi cuenta/);
});

// ---------- B7 y B8 ----------
test('S32-B7: «¿Me aprueban?» muestra «¿Listo para el banco?» también con departamento meta', () => {
  assert.match(app32, /if \(!hecho\) \{\n        texto \+= '<\/p><h3 class="h4 banco-titulo">¿Listo para el banco\?<\/h3>'/);
});
test('S32-B8: sin restos de Inicio, Tus pasos ni Explorar; funciones sin uso borradas', () => {
  assert.doesNotMatch(app32, /<\/svg>Explorar<\/a>/);
  assert.doesNotMatch(app32, /<\/svg>Inicio<\/a>/);
  assert.doesNotMatch(app32, /Ver mi camino</);
  ['renderTusPasos', 'tarjetaMuchoTiempo', 'obraGrande', 'filaCaminoPasos'].forEach(f => assert.doesNotMatch(app32, new RegExp('function ' + f + '\\(')));
});

// ---------- B9 ----------
test('S32-B9: el crédito tradicional llega a «Es tuyo» (reserva y escritura del usado)', () => {
  assert.match(app32, /function usadoMeta\(\)/);
  assert.match(app32, /'Reservar y firmar la promesa'/);
  assert.match(app32, /marcarPaso\('usadoTuyo'/);
});
test('S32-B9: asegurar es después de la postulación; con el edificio en obra, la firma espera la entrega', () => {
  // S33-C0: en grupo, después del pie (paso 3).
  assert.match(app32, /asegurado: !!\(c && c\.carga && paso >= \(c\.sinGrupo \|\| !esGrupo\(\) \? 2 : 3\)\)/);
  // S33-C9: ahora se puede avanzar hasta la entrega (simulación).
  assert.match(app32, /firmas cuando terminen tu edificio/); // S34: «terminen», como en Tu edificio real
  assert.match(app32, /Avanzar hasta la entrega/);
});

test('23-nov: Departamentos tiene Caminos | Edificios; sin camino abre Caminos y con camino Edificios', () => {
  assert.match(app32, /function tabsDeptos\(v\)/);
  assert.match(app32, /var vista = vistaDeptos \|\| \(estado\.caminoElegido \? 'edificios' : 'caminos'\)/);
  assert.match(app32, /p\[1\] === 'caminos' \|\| p\[1\] === 'edificios'/);
  assert.match(app32, /location\.replace\('#departamentos\/comparar'\)/);
  assert.doesNotMatch(app32, /href="#compra\/caminos"/);
});

test('23-nov: Tu compra sin camino muestra «Entre [mes] y [mes]», según el camino', () => {
  assert.match(app32, /function rangoLlavesCaminos\(\)/);
  assert.match(app32, /'Entre <span class="sin-corte">'/);
  assert.match(app32, /según el camino que elijas/);
});

test('23-nov: tres hitos: Tu pie y Tus pasos muestran «Pie listo» aparte de las llaves', () => {
  assert.match(app32, /'Pie listo <strong>'/);
  assert.match(app32, /m - MESES_SI_A_LLAVES/);
  assert.match(app32, /x\.id === 'pie' && x\.estado === 'hecho' \? 'Pie listo'/);
  assert.match(app32, /'Pie listo ' \+ f\.pie/);
});

test('23-nov: aceleradores a la vista en el detalle, con estado abierto/cerrado y avisos', () => {
  assert.match(app32, /var ACELERADORES_ABIERTOS_DEMO = true/);
  assert.match(app32, /function aceleradoresDetalleHtml\(p, solo, caminoVista\)/);
  assert.match(app32, /ayudasDetalleFila\(p, solo, caminoVista\) \+/);
  assert.match(app32, /nombre: 'Sumar a alguien al crédito'/);
  assert.match(app32, /No es el DS19/);
  assert.match(app32, /id="btn-acel-avisos"/);
  assert.match(app32, /function cuerpoFormaHtml\(f\)/); // 23-nov: desplegable dentro de Números
  assert.match(app32, /aria-controls="acel-cuerpo-/);
  assert.match(app32, /function siglaForma\(f\)/);
});

test('23-nov: al elegir camino se ve una confirmación y luego «Abrir mi cuenta»', () => {
  assert.match(app32, /location\.hash = '#compra\/elegido'/);
  assert.match(app32, /if \(p\[1\] === 'elegido'\) return r\('pasos', 'compra', renderCaminoElegido\)/);
  assert.match(app32, /id="btn-elegido-cuenta">Abrir mi cuenta</);
});

test('23-nov: caminos en «Tú solo / Con otras personas», usados dentro de Compra directa, DS19 propio, Perfil ordenado', () => {
  // S43: el DS19 pasó a ser una ayuda.
  assert.match(app32, /\['Tú solo', 'Con tu propio crédito\.', \['individual-vivir', 'arriendo-opcion'\]\]/);
  assert.match(app32, /id: 'ds19', sigla: 'DS19', nombre: 'Subsidio DS19'/);
  assert.match(app32, /id !== 'usados' \|\| estado\.caminoElegido === 'usados'/);
  assert.match(app32, /if \(p\[1\] === 'ds19'\) return r\('caminos', 'deptos', renderDS19\)/);
  assert.match(app32, /estado\.pasos\.facilitadora \?/);
  assert.match(app32, /estado\.modo === 'arrendar' \|\| estado\.inversiones\.length \? fila\('a', '#inversiones'/);
});

test('23-nov: los días que quedan para que cierre un grupo cuentan desde la fecha real', () => {
  assert.match(app32, /function hoyGrupo\(\)/);
  assert.doesNotMatch(app32, /diasEntre\(hoyDemo\(\), p\.cierre\)/);
});

test('23-nov: los filtros de Departamentos son desplegables con su valor actual', () => {
  assert.match(app32, /data-filtro-grupo="/);
  assert.match(app32, /var resumenFiltro = function \(g\)/);
  assert.match(app32, /id="filtro-cuerpo-'/);
});

test('23-nov: «¿Cómo puedes llegar antes?» es un desplegable que muestra cuántas ayudas están abiertas', () => {
  assert.match(app32, /id="btn-acel-titulo" aria-expanded="false" aria-controls="acel-bloque"/);
  assert.match(app32, /id="acel-bloque" hidden>/);
  assert.match(app32, /abiertas<\/small>/);
});
