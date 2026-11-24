// Sprint 38 (B2): lectura de papeles simulada al subir un documento.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

test('B2: la hoja de lectura dice que es simulada y se abre al terminar de subir', () => {
  assert.match(app, /Esto leímos de tu documento/);
  assert.match(app, /Simulado en la demo/);
  assert.match(app, /abrirLecturaDocumento\(x, nombre,/);
});

test('B2: cada archivo de ejemplo tiene su lectura', () => {
  const docs = [...app.matchAll(/archivos: \[([^\]]+)\]/g)].flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((k) => k[1]));
  assert.ok(docs.length >= 11);
  docs.forEach((nombre) => assert.ok(app.includes("'" + nombre + "': { leido:"), 'falta la lectura de ' + nombre));
});

test('B2: la lectura no trae RUT ni nombres de personas', () => {
  const bloque = app.slice(app.indexOf('function lecturaDocumento'), app.indexOf('function abrirLecturaDocumento'));
  assert.doesNotMatch(bloque, /\d{1,2}\.\d{3}\.\d{3}-[\dkK]/);
  assert.doesNotMatch(bloque, /RUT/i);
});

test('B2: «Te falta» solo avisa; el documento queda listo igual', () => {
  assert.match(app, /No te falta nada/);
  assert.match(app, /docs\[id\] = nombre;/);
});

test('B2: «Subir mis documentos» en Pedir preaprobación lleva a la ventana de documentos', () => {
  assert.match(app, /id="btn-subir-docs">Subir mis documentos/);
  assert.match(app, /guardarSubpaso\('documentos'\); cerrarHoja\(false\); location\.hash = '#compra\/postular\/documentos'/);
});

test('Misiones: «documentos» y «elegir» ya no son misiones y no quedan restos en el código', () => {
  const calc = fs.readFileSync(path.join(__dirname, '..', 'js', 'calculos.js'), 'utf8');
  const textos = app.slice(app.indexOf('var MISIONES_TEXTO'), app.indexOf('var MISION_SITIO'));
  assert.doesNotMatch(textos, /documentos:|elegir:/);
  assert.doesNotMatch(app, /id === 'elegir'/);
  assert.doesNotMatch(calc, /documentos: '5 minutos'|elegir: '10 minutos'|elegir: 'elegir tu departamento'/);
});

const c = require('../js/calculos.js');
const fotoBase = (x) => Object.assign({ caminoElegido: true, grupo: false, arriendo: false, cuentaVivienda: true, equipo: false, ahorroAutomatico: false }, x);
const ids = (s) => c.misiones(s, '2026-11-03').map((m) => m.id);

test('Misión nueva: firmar el acuerdo aparece solo si sumaste a alguien al crédito', () => {
  assert.ok(!ids(fotoBase({})).includes('acuerdo'));
  const ms = c.misiones(fotoBase({ acuerdo: true }), '2026-11-03');
  assert.ok(ms.some((m) => m.id === 'acuerdo' && !m.hecho));
  assert.ok(c.misiones(fotoBase({ acuerdo: true, acuerdoFirmado: true }), '2026-11-03').find((m) => m.id === 'acuerdo').hecho);
});

test('Misión nueva: el informe de deudas aparece con camino elegido y se marca con la preaprobación', () => {
  assert.ok(!ids(fotoBase({ caminoElegido: false })).includes('deudas'));
  assert.ok(ids(fotoBase({})).includes('deudas'));
  assert.ok(c.misiones(fotoBase({ informeDeudas: true }), '2026-11-03').find((m) => m.id === 'deudas').hecho);
  assert.match(app, /fichas\/2614-informe-de-deudas/);
});

test('Misión nueva: visitar el departamento, solo sin grupo; queda hecha al visitar o al elegir', () => {
  assert.ok(ids(fotoBase({ visitar: true })).includes('visita'));
  assert.ok(!ids(fotoBase({ visitar: false })).includes('visita'));
  assert.ok(c.misiones(fotoBase({ visitar: true, visito: true }), '2026-11-03').find((m) => m.id === 'visita').hecho);
  assert.match(app, /visitar: !!estado\.caminoElegido && !esArriendo\(\) && !esGrupo\(\)/);
});

test('Las marcas de aceleradores y misiones se guardan al recargar', () => {
  ['ds1Agregado', 'tasaAgregado', 'fogaesAgregado', 'tasaPedido', 'garantiaFamiliar', 'fogaesCalifica', 'acuerdoFirmado', 'informeDeudas']
    .forEach((k) => assert.ok(app.slice(0, app.indexOf('];', app.indexOf('var CLAVES_PASOS'))).includes("'" + k + "'"), k));
});

test('Misiones: la frase dice que no hay orden fijo y que se empieza por la que vence', () => {
  assert.match(app, /Puedes hacerlas en el orden que quieras\. Empieza por la que vence\./);
  assert.doesNotMatch(app, /Hazlas en cualquier orden/);
});

test('Misiones: al completarlas todas hay festejo (confeti y mensaje), una vez por conjunto', () => {
  assert.match(app, /function festejarMisiones\(ms\)/);
  assert.match(app, /¡Completaste todas tus misiones!/);
  assert.match(app, /'usadoElegido', 'misionesFestejo'/);
});

test('Aceleradores de Tu compra: dicen «Está en tus misiones» y el DS1 coincide con su misión', () => {
  assert.match(app, /En tus misiones/); // S43
  assert.match(app, /ps\.ds1Agregado \|\| ps\.ds1Postulado \|\| ps\.rsh\), lista: !!ps\.ds1Postulado/);
});

test('La sigla FOGAES solo queda en el glosario', () => {
  const visibles = app.split('\n').filter((l) => /FOGAES/.test(l) && !/^\s*\/\//.test(l) && !/sigla: 'FOGAES'/.test(l));
  assert.strictEqual(visibles.length, 1);
  assert.match(visibles[0], /garantia: \{ nombre: 'Garantía del Estado \(FOGAES\)'/);
});

test('S39c: la barra inferior vuelve a como estaba (con nombres), sin la píldora flotante', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.doesNotMatch(css, /font-size: 0 !important/);
  assert.match(css, /la barra inferior vuelve a como estaba/);
  ['Tu compra', 'Tu pie', 'Departamentos', 'Perfil'].forEach((t) => assert.ok(html.includes('</svg>' + t + '</a>'), t));
})

test('S39b: el azul de Tu compra dice cuánto falta para tu pie en todos los caminos; el cupo va en una línea', () => {
  assert.match(app, /function faltaPieHtml\(falta, meta, linea\)/);
  assert.match(app, /sinObra \? cierreLineaHtml\(p\) \+ faltaPieHtml\(g\.falta, metaCompra\(p\)/);
  assert.match(app, /sinObra \? faltaPieHtml\(Math\.max\(0, meta - ahorradoTuPie\(meta\)\), meta/);
});

test('S39b: Tu equipo te anima en una fila; ¿Cómo puedes llegar antes? es un desplegable', () => {
  assert.match(app, /class="tarjeta animos animos-fila" aria-label="Tu equipo te anima"/);
  assert.match(app, /class="tarjeta aceleradores-compra ay-fila-compra"/); // S43: una fila
});

test('S39b: Caminos en filas con íconos, sin textos de relleno; Edificios sin «en tu rango»', () => {
  assert.match(app, /class="cam-fila/);
  assert.doesNotMatch(app, /caminos para llegar a tu departamento\. Conoce cada uno/);
  assert.doesNotMatch(app, /Con tu respuesta te recomendamos uno de estos caminos/);
  assert.doesNotMatch(app, /plural\(lista\.length, 'departamento', 'departamentos'\) \+ \(filtrosDeptos\.rango && rango \? ' en tu rango'/);
});

test('S39c bloque 1: botón «Ver tu pie» con anillo, «Ver con fechas» junto a «Ahora», Tu pie ordenado, Ayudas para tu compra, Edificios y Perfil', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(app, /class="pie-boton" href="#pie"/);
  assert.match(app, /Ver tu pie ›/);
  assert.match(app, /if \(sec\.querySelector\('\.pie-boton'\)\) return;/);
  assert.match(app, /function conFechasEnAhora\(ahora, sinCamino\)/);
  assert.ok(app.indexOf('id="btn-pedir-regalo"') < app.indexOf("grupoEnPieHtml() +"), 'el regalo va antes del grupo en Tu pie');
  assert.match(app, /<span class="pt-fila"><span>Para firmar \(/);
  assert.doesNotMatch(app, /¿Cómo puedes llegar antes\?<\/strong>|>Ayudas para llegar antes</);
  assert.match(app, /'Entrega ' \+ formatoFecha\(p\.entregaEstimada\)/);
  assert.match(css, /\.tarjeta-proyecto \.tp-ver \{ display: none; \}/);
  assert.match(app, /var TINTE_PERFIL = \{/);
  assert.match(html, /class="franja-bci"/);
});

const datos = fs.readFileSync(path.join(__dirname, '..', 'js', 'datos.js'), 'utf8');

test('S39 2.1: detalle con reglas del grupo en 4 tarjetitas dentro de «Grupo» y «Más opciones»', () => {
  assert.match(app, /regla\('t-azul', 'i-grupo'/);
  assert.match(app, /regla\('t-rojo', 'i-ok', 'Sales gratis'/);
  assert.match(app, /\['grupo', 'Grupo', \(pd\.on\.respaldo \? '' : fichaGrupoHtml\(p\)\)/);
  assert.doesNotMatch(app, /<details class="tarjeta mas-opciones"><summary>Más opciones/); // S43: se eliminó
  assert.match(app, /Recibes tus llaves en <strong>' \+ g\.fecha \+ '<\/strong>, todos el mismo día/);
});

test('S39 2.3 y 2.4: DS19 con descripción corta y tarjetitas; sus proyectos no son todos en obra ni en grupo', () => {
  assert.doesNotMatch(app, /En esta demo, los proyectos DS19/);
  assert.match(app, /¿Y el DS1\? No es lo mismo/);
  assert.match(app, /Te ' \+ \(faltan\.length === 1/);
  const ds19 = datos.split('\n').filter((l) => /ds19: true/.test(l));
  assert.ok(ds19.some((l) => /tipo: 'venta'/.test(l)), 'al menos un DS19 terminado y de compra individual');
  assert.ok(ds19.some((l) => /tipo: 'conjunto'/.test(l)), 'al menos un DS19 en grupo');
});

test('S39 2.2: la ficha del camino tiene descripción corta, 3 tarjetitas y «Cómo funciona» en fila; sin «Para quién»', () => {
  assert.match(app, /var FICHA_CORTA = \{/);
  assert.match(app, /rasgosCaminoHtml\(id\)/);
  assert.match(app, /pasosFilaHtml\(id\)/);
  assert.doesNotMatch(app, /<strong>Para quién<\/strong>/);
});

test('S39 2.5: las 3 preguntas recomiendan en el orden acordado y se usan en Caminos y Comparar', () => {
  assert.match(app, /¿Cuándo quieres mudarte\?/);
  assert.match(app, /¿Te sirve un departamento en construcción\?/);
  assert.match(app, /¿Tu familia te puede apoyar\?/);
  assert.match(app, /Quedan guardados un tiempo y los recupera/);
  const i = app.indexOf("estado.prioridad === 'ya' && hay('arriendo-opcion')");
  const j = app.indexOf("estado.respFamilia === 'ahorros' && hay('familiar-vivir')");
  const k = app.indexOf("(estado.respObra === 'si' || estado.prioridad === 'menos') && hay('grupo-vivir')");
  const l = app.indexOf("estado.respObra === 'terminado' && hay('individual-vivir')");
  assert.ok(i > 0 && i < j && j < k && k < l, 'orden de la regla');
  assert.match(app, /enlazarPreguntasCamino\(cont, renderDepartamentos\)/);
  assert.match(app, /enlazarPreguntasCamino\(cont, renderComparar\)/);
  assert.match(app, /'respObra', 'respFamilia'/);
});

test('S39 3.1: Comparar con línea de tiempo y casillas para marcar dos', () => {
  assert.match(app, /class="cmp-tl"/);
  assert.match(app, /De hoy a tus llaves/);
  assert.match(app, /class="cmp-btn" data-comparar="/);
  assert.doesNotMatch(app, /ojo: 'Solo departamentos nuevos'/);
});

test('S39 3.2: Tu grupo con foto, cifras, «Te toca», conversación, votaciones, vocero y reglas', () => {
  assert.match(app, /function tuGrupoHtml\(p\)/);
  assert.match(app, /data-vista-compra="/);
  assert.match(app, /class="tg-foto"/);
  ['chat', 'votos', 'vocero', 'reglas'].forEach((k) => assert.match(app, new RegExp("fila\\('" + k + "'")));
  assert.match(app, /La fecha de firma y de llaves no se vota/);
  assert.match(app, /No compartas tu RUT, tu dirección ni datos de tu cuenta/);
  assert.match(app, /'votoGrupo', 'voceroYo'(, 'grupoAvisoVisto')?\]/);
  assert.match(app, /enGrupoCompra\(\) \? '' : tuEdificioHtml\(s\)/);
  assert.match(app, /data-ir-grupo/);
});

test('S42: la app no muestra mensajes de prototipo ni de «propuesta» y la barra queda visible en las pantallas', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'estilos.css'), 'utf8');
  assert.doesNotMatch(app, /prototipo del Taller/);
  assert.doesNotMatch(app, /Propuesta para Bci/);
  assert.doesNotMatch(app, /hoy no existe/);
  assert.doesNotMatch(app, /Existe hoy/);
  assert.match(css, /body:has\(\.hoja-pantalla\) \.barra/);
});

test('S43: Ayudas con detalle (qué es, pasos como misiones, Volver abajo) y «primera compra»', () => {
  assert.match(app, /function abrirAyuda\(f, p, solo, caminoVista, boton\)/);
  assert.match(app, /Confirma que es tu primera compra/);
  assert.doesNotMatch(app, /Confirma que es tu primera vez/);
  assert.match(app, /data-ayuda-volver>Volver</);
  assert.match(app, />Agregar a misiones</);
});

test('S44: correcciones del recorrido (ayudas incluidas, sin IVA a tiempo, visita, plazos, salir del grupo)', () => {
  assert.match(app, /if \(f\.incluido\) return 'Ya va en tus números/);
  assert.match(app, /function ivaFueraDePlazo\(pd\)/);
  assert.doesNotMatch(app, /estado\.visitas\[k\]\.fue; \}\) \|\| !!c/);
  assert.match(app, /function abrirSalirGrupo\(boton\)/);
  assert.match(app, /Entiendo lo que pierdo yo y lo que pierde el grupo/);
  assert.match(app, /Lo que pierde el grupo/);
  assert.match(app, /chip-alcanza">Te alcanza/);
});
