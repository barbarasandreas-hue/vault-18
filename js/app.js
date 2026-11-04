// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  // Ruta → pantalla que se muestra y botón de la barra que queda activo.
  var RUTAS = {
    'bienvenida': { pantalla: 'intro', seccion: null },
    'inicio': { pantalla: 'inicio', seccion: 'inicio' },
    'proyectos': { pantalla: 'proyectos', seccion: 'proyectos' },
    'proyecto': { pantalla: 'proyecto', seccion: 'proyectos' },
    'mis-proyectos': { pantalla: 'mis-proyectos', seccion: 'mis-proyectos' },
    'invertir': { pantalla: 'invertir', seccion: 'proyectos' },
    'perfil': { pantalla: 'perfil', seccion: 'perfil' }
  };

  var CLAVE_COMPRA = 'primer-peldano-compra';
  var CLAVE_INVERSIONES = 'primer-peldano-inversiones';

  var estado = {
    modo: 'arrendar',        // 'arrendar' o 'vivir'
    pestana: 'conjunto',     // pestaña de Proyectos: 'conjunto' o 'financiamiento'
    compra: leerCompra(),    // { proyectoId, departamentoId } o null
    pestanaMis: null,        // pestaña de Mis proyectos: 'compra' o 'inversiones'
    sueldoPropio: null,      // sueldo líquido del usuario, en pesos
    sueldoPareja: null,      // sueldo líquido de la pareja, en pesos
    arriendoActual: null,    // lo que paga hoy de arriendo, en pesos
    otrasCuotas: null,       // S8-F2: otras cuotas al mes (auto, consumo), en pesos
    contrato: 'indefinido',  // S8-F2: 'indefinido', 'plazo-fijo' o 'independiente'
    ahorroMensual: null,     // cuánto ahorra al mes para su pie
    tipoAhorro: 'propio',    // 'propio' o 'grupal'
    ahorrado: 0,             // lo que lleva juntado (simulado)
    ahorroIniciado: false,   // si ya tocó "Empezar a ahorrar"
    meAlcanza: false,        // filtro "Me alcanza" de Proyectos
    inversiones: leerInversiones(), // [{ id, proyectoId, montoUF, fecha, cuotasCobradas }]
    introVista: false        // S7-F6: si ya vio la introducción
  };

  // ---------- Elecciones que se recuerdan entre visitas (S3-F3) ----------
  var CLAVE_ESTADO = 'primer-peldano-estado';
  var GUARDADOS = ['modo', 'sueldoPropio', 'sueldoPareja', 'arriendoActual', 'otrasCuotas', 'contrato',
    'ahorroMensual', 'tipoAhorro', 'ahorrado', 'ahorroIniciado'];
  var VALORES_POR_DEFECTO = { modo: 'arrendar', sueldoPropio: null, sueldoPareja: null, arriendoActual: null,
    otrasCuotas: null, contrato: 'indefinido',
    ahorroMensual: null, tipoAhorro: 'propio', ahorrado: 0, ahorroIniciado: false, meAlcanza: false };

  function montoValido(n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? n : null; }

  var CONTRATOS = { 'indefinido': 'Indefinido', 'plazo-fijo': 'Plazo fijo', 'independiente': 'Independiente' };

  // Lee lo guardado y descarta lo que no tenga sentido (por si el dato se dañó).
  function leerEstado() {
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE_ESTADO));
      if (!g || typeof g !== 'object') return;
      if (g.modo === 'arrendar' || g.modo === 'vivir') estado.modo = g.modo;
      estado.sueldoPropio = montoValido(g.sueldoPropio);
      estado.sueldoPareja = montoValido(g.sueldoPareja);
      estado.arriendoActual = montoValido(g.arriendoActual);
      estado.otrasCuotas = montoValido(g.otrasCuotas);
      if (CONTRATOS[g.contrato]) estado.contrato = g.contrato;
      estado.ahorroMensual = montoValido(g.ahorroMensual);
      if (g.tipoAhorro === 'propio' || g.tipoAhorro === 'grupal') estado.tipoAhorro = g.tipoAhorro;
      estado.ahorrado = montoValido(g.ahorrado) || 0;
      estado.ahorroIniciado = g.ahorroIniciado === true && estado.ahorroMensual > 0;
    } catch (e) { /* sin localStorage: valores por defecto */ }
  }

  function guardarEstado() {
    var g = {};
    GUARDADOS.forEach(function (k) { g[k] = estado[k]; });
    try { localStorage.setItem(CLAVE_ESTADO, JSON.stringify(g)); } catch (e) { /* queda en memoria */ }
  }

  // "Empezar de nuevo": borra todo lo guardado y vuelve a los valores por defecto.
  function borrarTodo() {
    try {
      localStorage.removeItem(CLAVE_ESTADO);
      localStorage.removeItem(CLAVE_COMPRA);
      localStorage.removeItem(CLAVE_INVERSIONES);
      localStorage.removeItem(CLAVE_INTRO);
    } catch (e) { /* nada guardado */ }
    Object.keys(VALORES_POR_DEFECTO).forEach(function (k) { estado[k] = VALORES_POR_DEFECTO[k]; });
    estado.compra = null;
    estado.inversiones = [];
    estado.introVista = false;
    estado.pestana = 'conjunto';
    estado.pestanaMis = null;
  }

  leerEstado();

  function $(id) { return document.getElementById(id); }

  // S7-F1: estado de carga del Bci Kit. El botón mantiene su tamaño y color, su texto cambia a
  // "Cargando…" y, después de un momento, se hace la acción. Evita que se toque dos veces.
  var ESPERA_CARGA = 700;
  function conCarga(boton, accion) {
    if (boton.classList.contains('is-cargando')) return;
    boton.style.minWidth = boton.offsetWidth + 'px';
    boton.classList.add('is-cargando');
    boton.setAttribute('aria-busy', 'true');
    boton.setAttribute('aria-disabled', 'true');
    boton.textContent = 'Cargando…';
    anunciar('Cargando…');
    setTimeout(accion, ESPERA_CARGA);
  }

  // Avisa a los lectores de pantalla sin mover el foco (región aria-live fija en index.html).
  function anunciar(texto) {
    var r = $('anuncio');
    r.textContent = '';
    setTimeout(function () { r.textContent = texto; }, 50);
  }
  function poner(id, pesos) { $(id).textContent = formatoPesos(pesos); }

  // Escapa texto antes de ponerlo dentro de HTML.
  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- Lo que se guarda en el teléfono ----------
  // Si localStorage no está disponible, la app sigue funcionando en memoria.
  function leerCompra() {
    try {
      var guardada = JSON.parse(localStorage.getItem(CLAVE_COMPRA));
      if (guardada && buscarProyecto(guardada.proyectoId)) return guardada;
    } catch (e) { /* sin localStorage o dato dañado */ }
    return null;
  }

  function guardarCompra(compra) {
    estado.compra = compra;
    try {
      if (compra) localStorage.setItem(CLAVE_COMPRA, JSON.stringify(compra));
      else localStorage.removeItem(CLAVE_COMPRA);
    } catch (e) { /* queda solo en memoria */ }
  }

  // Inversiones guardadas en el teléfono (S6-F4). Se descartan las que no tengan sentido.
  function leerInversiones() {
    try {
      var lista = JSON.parse(localStorage.getItem(CLAVE_INVERSIONES));
      if (Array.isArray(lista)) {
        return lista.filter(function (x) {
          return x && buscarProyecto(x.proyectoId) && typeof x.montoUF === 'number' && x.montoUF > 0;
        }).map(function (x) {
          return Object.assign({}, x, { cuotasCobradas: Math.max(0, Math.min(600, Number(x.cuotasCobradas) || 0)) });
        });
      }
    } catch (e) { /* sin localStorage o dato dañado */ }
    return [];
  }

  function guardarInversiones() {
    try { localStorage.setItem(CLAVE_INVERSIONES, JSON.stringify(estado.inversiones)); } catch (e) { /* queda en memoria */ }
  }

  function agregarInversion(inv) {
    estado.inversiones = estado.inversiones.concat([inv]);
    guardarInversiones();
  }

  // Lo que el usuario invirtió en un proyecto desde este teléfono, en UF.
  function invertidoEn(proyectoId) {
    return estado.inversiones.reduce(function (s, x) { return s + (x.proyectoId === proyectoId ? x.montoUF : 0); }, 0);
  }

  // Datos para calcular lo cobrado por cada inversión: su parte de la participación del departamento
  // y el arriendo neto estimado de ese departamento (modelo v3).
  function datosCobro(lista) {
    return (lista || []).map(function (x) {
      var r = resumen(buscarProyecto(x.proyectoId));
      return { montoUF: x.montoUF, participacionUF: r.porFinanciarUF, netoUF: r.netoMensualUF, cuotasCobradas: x.cuotasCobradas || 0 };
    });
  }

  // Barra del reparto del precio, con los anchos del modo (90 / 10 o 80 / 15 / 5).
  function barraReparto(e) {
    return '<div class="reparto-barra" aria-hidden="true">' +
      '<span style="width:' + Math.round(e.pctCredito * 100) + '%"></span>' +
      '<span style="width:' + Math.round(e.pctInversionistas * 100) + '%"></span>' +
      '<span style="width:' + Math.round(e.pctUsuario * 100) + '%"></span></div>';
  }

  // ---------- Textos de apoyo ----------
  // Espacio que no se corta: el número y su unidad quedan siempre juntos.
  var NBSP = '\u00a0';
  function plural(n, uno, varios) { return n + NBSP + (n === 1 ? uno : varios); }

  // Separador "·" con el mismo aire a ambos lados (en Overpass el punto queda cargado a un lado).
  var SEP = '<span class="sep" aria-hidden="true">·</span>';

  function ficha(d) {
    return (d.dormitorios === 0 ? 'Estudio' : plural(d.dormitorios, 'dormitorio', 'dormitorios')) + SEP +
      plural(d.banos, 'baño', 'baños') + SEP + d.m2 + NBSP + 'm²';
  }

  var NOMBRE_TIPO = { conjunto: 'Compra en grupo', financiamiento: 'Pie compartido' };

  function cuposExtra(proyecto) {
    return estado.compra && estado.compra.proyectoId === proyecto.id ? 1 : 0;
  }

  function resumen(proyecto) {
    return resumenProyecto(proyecto, departamentosDe(proyecto.id), cuposExtra(proyecto), invertidoEn(proyecto.id), estado.modo);
  }

  function barraAvance(texto, detalle, fraccion) {
    var pct = porcentajeEntero(fraccion);
    return '<div class="avance">' +
      '<p class="avance-texto"><span>' + texto + '</span><strong>' + detalle + '</strong></p>' +
      '<div class="avance-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + esc(texto) + '">' +
      '<span style="width:' + pct + '%"></span></div></div>';
  }

  function avanceDe(proyecto, r) {
    if (proyecto.tipo === 'conjunto') {
      return barraAvance('Cupos tomados', r.cuposTomados + ' de ' + r.cupos, r.avanceCupos);
    }
    return barraAvance('Participación de 15\u00a0% reunida', formatoPorcentaje(r.avanceFinanciamiento, 0), r.avanceFinanciamiento);
  }

  // ---------- S7-F4: explicaciones a un toque ----------
  // Una frase por término, sin jerga. Las mismas se reúnen en Perfil › Ayuda.
  var GLOSARIO = {
    'dividendo': { termino: 'Dividendo', pregunta: '¿Qué es el dividendo?',
      texto: 'Es la cuota que pagas cada mes a Bci por el crédito hipotecario, con los seguros incluidos.' },
    'pie': { termino: 'Pie', pregunta: '¿Qué es el pie?',
      texto: 'Es la parte del precio que pones tú al comprar: 10 % si es para vivir, 5 % si es para arrendar, más los gastos de escritura.' },
    'carga': { termino: 'Carga', pregunta: '¿Qué es la carga?',
      texto: 'Es la parte de lo que ganan tú y tu pareja que se va cada mes en el dividendo. Bci pide que no pase de 25 %.' },
    'participacion': { termino: 'Participación', pregunta: '¿Qué es la participación de los inversionistas?',
      texto: 'Es el 15 % del departamento que ponen inversionistas. No es un préstamo: no te cobran una cuota, y el arriendo se los va recomprando.' },
    'cuenta-custodia': { termino: 'Cuenta custodia', pregunta: '¿Qué es la cuenta custodia?',
      texto: 'Es una cuenta de Bci donde entra el arriendo y desde la que se paga a los inversionistas y se recompra su parte.' },
    'compra-conjunto': { termino: 'Compra en grupo', pregunta: '¿Qué es la compra en grupo?',
      texto: 'Varias personas compran juntas en un proyecto y todas pagan menos: 3 % desde 5 unidades y 5 % desde 10.' },
    'financiamiento-pie': { termino: 'Pie compartido', pregunta: '¿Qué es el pie compartido?',
      texto: 'Pones el 5 % y unos inversionistas el 15 %. El arriendo les paga una renta y te devuelve su parte de a poco.' }
  };

  // Botón de ayuda (44 × 44 px) para un término del glosario.
  function ayuda(clave) {
    return '<button type="button" class="btn-ayuda" data-ayuda="' + clave + '" aria-expanded="false" aria-label="' +
      GLOSARIO[clave].pregunta + '"><svg aria-hidden="true"><use href="#i-ayuda"/></svg></button>';
  }

  // Un solo manejador para todos los botones de ayuda: abre o cierra la explicación debajo del término.
  var contadorAyuda = 0;
  function iniciarAyudas() {
    document.addEventListener('click', function (ev) {
      var boton = ev.target.closest('.btn-ayuda');
      if (!boton) return;
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      if (abierto) {
        var viejo = $(boton.getAttribute('aria-controls'));
        if (viejo) viejo.remove();
        boton.setAttribute('aria-expanded', 'false');
        return;
      }
      var id = 'ayuda-' + (++contadorAyuda);
      var globo = document.createElement('span');
      globo.className = 'ayuda-globo';
      globo.id = id;
      globo.textContent = GLOSARIO[boton.dataset.ayuda].texto;
      // La explicación va al final del elemento que contiene el término (párrafo, ítem o título).
      var contenedor = boton.closest('li, p, h1, h2, h3, .chip-fila') || boton.parentNode;
      contenedor.appendChild(globo);
      boton.setAttribute('aria-controls', id);
      boton.setAttribute('aria-expanded', 'true');
    });
  }

  function glosarioCompleto() {
    return '<dl class="glosario">' + Object.keys(GLOSARIO).map(function (k) {
      return '<div><dt>' + GLOSARIO[k].termino + '</dt><dd>' + GLOSARIO[k].texto + '</dd></div>';
    }).join('') + '</dl>';
  }

  // ---------- S7-F6: introducción (solo la primera vez, antes de Inicio) ----------
  var CLAVE_INTRO = 'primer-peldano-intro';
  function leerIntroVista() {
    try { return localStorage.getItem(CLAVE_INTRO) === '1'; } catch (e) { return false; }
  }
  function marcarIntroVista() {
    estado.introVista = true;
    try { localStorage.setItem(CLAVE_INTRO, '1'); } catch (e) { /* queda en memoria */ }
  }
  function iniciarIntro() {
    $('btn-empezar-intro').addEventListener('click', function () {
      marcarIntroVista();
      location.hash = '#inicio';
    });
  }

  // ---------- Inicio: Mi camino (S5-F6, sobre el próximo paso de S4-F6) ----------
  // Lo que se muestra según el paso de la compra: un solo número y la acción del paso.
  function proximoPaso() {
    var p = buscarProyecto(estado.compra.proyectoId);
    var e = resumen(p).escenario;
    var paso = pasoEfectivo();

    if (paso === 1) {
      var k = carga(e.totalMes, estado.sueldoPropio, estado.sueldoPareja);
      var nivel = nivelCarga(k);
      return {
        p: p, paso: 1, etapa: 'Paso 2 de 5' + SEP + 'Postula',
        etiqueta: nivel ? 'Tu carga' : 'Revisa si califican',
        numero: nivel ? formatoPorcentaje(cargaRedondeada(k), 1) : null,
        detalle: nivel ? SEMAFORO[nivel].palabra : 'Escribe los sueldos de los dos para ver tu carga.',
        accion: 'Ir a Postula'
      };
    }
    if (paso === 2) {
      var meta = e.alEscriturar;
      var n = mesesRestantes(meta, estado.ahorrado, estado.ahorroMensual);
      return {
        p: p, paso: 2, etapa: 'Paso 3 de 5' + SEP + 'Ahorra',
        etiqueta: n === null ? 'Tu meta al escriturar' : 'Te faltan',
        numero: n === null ? formatoPesos(meta) : textoMeses(n),
        detalle: n === null ? 'Calcula en cuántos meses la juntas.'
          : 'Llevas ' + formatoPesos(estado.ahorrado) + ' de ' + formatoPesos(meta) + '.',
        accion: estado.ahorroIniciado ? 'Seguir ahorrando' : 'Ir a Tu pie'
      };
    }
    if (paso === 3) {
      return {
        p: p, paso: 3, etapa: 'Paso 4 de 5' + SEP + 'Firma',
        etiqueta: 'Ya juntaste', numero: formatoPesos(e.alEscriturar),
        detalle: 'Revisa lo que firmas en palabras simples.',
        accion: 'Ir a firmar'
      };
    }
    var m = mesDelDepartamento(p, departamentoDeMiCompra(p));
    return {
      p: p, paso: 4, etapa: 'Paso 5 de 5' + SEP + 'Departamento, mes ' + m.mes,
      etiqueta: m.excedente > 0 ? 'Este mes te sobraron' : (estado.modo === 'arrendar' ? 'Este mes pusiste' : 'Este mes pagaste'),
      numero: formatoPesos(m.excedente > 0 ? m.excedente : m.pone),
      detalle: estado.modo !== 'arrendar' ? 'Tu dividendo, en vez del arriendo que pagabas.'
        : (m.porcentajeTuyo < 100 ? 'Ya es tuyo el ' + m.porcentajeTuyo + '\u00a0% del departamento.'
          : (m.excedente > 0 ? 'El arriendo alcanzó para todo el dividendo.' : 'El arriendo cubrió ' + formatoPesos(m.cascada.aUsuario) + ' del dividendo.')),
      accion: 'Ver mi departamento'
    };
  }

  // Recorrido de 5 pasos de Mi camino.
  var CAMINO = ['Únete', 'Postula', 'Ahorra', 'Firma', 'Departamento'];

  function recorridoCamino(paso) {
    // El paso de la compra (1 a 4) corresponde a los puntos 2 a 5 del camino; "Únete" siempre está hecho.
    var actual = paso + 1;
    return '<ol class="camino" aria-label="Tu camino">' + CAMINO.map(function (nombre, i) {
      var n = i + 1;
      var estadoPaso = n < actual ? 'hecho' : (n === actual ? 'actual' : 'pendiente');
      var icono = estadoPaso === 'hecho' ? '<svg aria-hidden="true"><use href="#i-ok"/></svg>'
        : (estadoPaso === 'actual' ? '<svg aria-hidden="true"><use href="#i-aqui"/></svg>' : '<span aria-hidden="true">' + n + '</span>');
      var texto = estadoPaso === 'hecho' ? 'listo' : (estadoPaso === 'actual' ? 'estás aquí' : '');
      return '<li class="' + estadoPaso + '"' + (estadoPaso === 'actual' ? ' aria-current="step"' : '') + '>' +
        '<span class="camino-icono">' + icono + '</span>' +
        '<span class="camino-nombre">' + nombre + '</span>' +
        (texto ? '<span class="camino-estado">' + texto + '</span>' : '') +
      '</li>';
    }).join('') + '</ol>';
  }

  // Avisos de la IA: máximo 2, calculados con datos reales del proyecto y del ahorro.
  function avisosIA(x) {
    var p = x.p;
    var r = resumen(p);
    var avisos = [];
    var dias = diasEntre(FECHA_REFERENCIA, p.cierre);
    var aviso = {
      cierre: dias > 0 ? 'El proyecto cierra en ' + plural(dias, 'día', 'días') + ', el ' + formatoFecha(p.cierre) + '.' : null,
      cupos: p.tipo === 'conjunto'
        ? (r.cuposLibres > 0
          ? 'El grupo lleva ' + r.cuposTomados + ' de ' + r.cupos + ' cupos: ' + (r.cuposLibres === 1 ? 'falta 1' : 'faltan ' + r.cuposLibres) + ' para completarlo.'
          : 'El grupo ya está completo.')
        : 'Ya se reunió el ' + formatoPorcentaje(r.avanceFinanciamiento, 0) + ' de la participación de 15\u00a0% con inversionistas.'
    };
    if (x.paso === 2 && estado.ahorroIniciado) {
      var meta = r.escenario.alEscriturar;
      var siguiente = HITOS_AHORRO.filter(function (h) { return avance(estado.ahorrado, meta) < h; })[0];
      if (siguiente) {
        avisos.push('Te faltan ' + formatoPesos(Math.ceil(meta * siguiente - estado.ahorrado)) +
          ' para llegar al ' + porcentajeEntero(siguiente) + '\u00a0% de tu meta.');
      }
      if (aviso.cierre) avisos.push(aviso.cierre);
    } else if (x.paso === 4) {
      var m = mesDelDepartamento(p, departamentoDeMiCompra(p));
      if (estado.modo === 'arrendar' && m.porcentajeTuyo < 100 && m.faltanRecompra) {
        avisos.push('Con este arriendo, en ' + textoMeses(m.faltanRecompra) + ' el departamento es 100\u00a0% tuyo.');
      }
    } else {
      if (aviso.cierre) avisos.push(aviso.cierre);
      avisos.push(aviso.cupos);
    }
    return avisos.slice(0, 2);
  }

  function renderCamino() {
    var x = proximoPaso();
    var avisos = avisosIA(x);
    $('inicio-camino').innerHTML =
      '<header class="encabezado">' + FIGURAS +
        '<h1 id="titulo-inicio" class="h2">Mi camino</h1>' +
        '<p class="texto-apoyo">' + esc(x.p.nombre) + SEP + esc(x.p.comuna) + '</p>' +
      '</header>' +
      '<section class="tarjeta proximo" aria-label="Dónde vas">' +
        '<p class="chip">' + x.etapa + '</p>' +
        '<p class="etiqueta">' + x.etiqueta + '</p>' +
        (x.numero ? '<strong class="numero display-2">' + x.numero + '</strong>' : '') +
        '<p class="texto-apoyo">' + x.detalle + '</p>' +
      '</section>' +
      '<div class="accion">' +
        '<a href="#mis-proyectos" class="btn btn-primario btn-lg btn-bloque">' + x.accion + '</a>' +
      '</div>' +
      recorridoCamino(x.paso) +
      (avisos.length
        ? '<section class="tarjeta bloque avisos" aria-labelledby="titulo-avisos">' +
            '<h2 class="h5" id="titulo-avisos">Avisos de la IA</h2>' +
            '<ul class="lista-check">' + avisos.map(function (a) {
              return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + a + '</span></li>';
            }).join('') + '</ul>' +
          '</section>'
        : '');
    if (estado.inversiones.length) {
      $('inicio-camino').insertAdjacentHTML('beforeend',
        '<a class="linea-inversiones bloque" href="#mis-proyectos/inversiones"><span>Tus inversiones: cobrado a la fecha</span> <strong>' +
        formatoPesos(ufAPesos(cobradoUF(datosCobro(estado.inversiones)))) + '</strong>' +
        '<span class="linea-ver">Ver <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span></a>');
    }
  }

  // Solo inversiones, sin compra: el número es lo cobrado a la fecha (S6-F4).
  function renderSoloInversiones() {
    var lista = estado.inversiones;
    $('inicio-camino').innerHTML =
      '<header class="encabezado">' + FIGURAS +
        '<h1 id="titulo-inicio" class="h2">Tus inversiones</h1>' +
        '<p class="texto-apoyo">Tienes parte del 15\u00a0% de departamentos de otros compradores: 6\u00a0% al año en UF.</p>' +
      '</header>' +
      '<section class="tarjeta proximo" aria-label="Lo cobrado">' +
        '<p class="etiqueta">Cobrado a la fecha</p>' +
        '<strong class="numero display-2">' + formatoPesos(ufAPesos(cobradoUF(datosCobro(lista)))) + '</strong>' +
        '<p class="texto-apoyo">' + plural(lista.length, 'inversión', 'inversiones') + SEP + 'el próximo mes recibes ' +
          formatoPesos(ufAPesos(cuotaMensualTotalUF(datosCobro(lista)))) + '.</p>' +
      '</section>' +
      '<div class="accion">' +
        '<a href="#mis-proyectos/inversiones" class="btn btn-primario btn-lg btn-bloque">Ver mis inversiones</a>' +
      '</div>' +
      '<p class="texto-centro"><a class="enlace" href="#proyectos">Ver proyectos para comprar</a></p>';
  }

  // ---------- Inicio: ¿Cuánto puedo comprar? (S5-F0) ----------
  var FIGURAS = '<div class="figuras" aria-hidden="true"><span class="f-cuadrado"></span><span class="f-circulo"></span>' +
    '<span class="f-triangulo"></span><span class="f-rectangulo"></span></div>';

  function renderCapacidad() {
    var opcion = function (valor, texto) {
      return '<input type="radio" name="modo" id="modo-' + valor + '" value="' + valor + '"' +
        (estado.modo === valor ? ' checked' : '') + '><label for="modo-' + valor + '">' + texto + '</label>';
    };
    $('inicio-capacidad').innerHTML =
      '<header class="encabezado">' + FIGURAS +
        '<h1 id="titulo-inicio" class="h2">Tu primer departamento</h1>' +
        '<p class="texto-apoyo">Escribe sus sueldos y te decimos hasta cuánto pueden comprar.</p>' +
      '</header>' +
      '<fieldset class="selector"><legend class="oculto-visual">¿Para vivir o para arrendar?</legend>' +
        '<div class="selector-opciones">' + opcion('arrendar', 'Para arrendar') + opcion('vivir', 'Para vivir') + '</div>' +
      '</fieldset>' +
      '<div class="campos-dos">' +
        campoDinero('inicio-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
        campoDinero('inicio-pareja', 'Sueldo de tu pareja', estado.sueldoPareja) +
      '</div>' +
      '<div id="capacidad-resultado" aria-live="polite"></div>' +
      '<div class="accion-fija"><a href="#proyectos" class="btn btn-primario btn-lg btn-bloque" id="btn-me-alcanza">Ver proyectos que me alcanzan</a></div>' +
      '<p class="texto-centro"><a href="#proyectos" class="enlace" id="btn-todos">Ver todos los proyectos</a></p>';

    document.querySelectorAll('input[name="modo"]').forEach(function (r) {
      r.addEventListener('change', function () { estado.modo = r.value; guardarEstado(); renderResultadoCapacidad(false); });
    });
    var habia = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo) !== null;
    [['inicio-propio', 'sueldoPropio'], ['inicio-pareja', 'sueldoPareja']].forEach(function (c) {
      var input = $(c[0]);
      input.addEventListener('input', function () {
        estado[c[1]] = formatearCampo(input);
        guardarEstado();
        var hay = renderResultadoCapacidad(false);
        if (hay && !habia) $('capacidad-resultado').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        habia = hay;
      });
      input.addEventListener('blur', function () { renderResultadoCapacidad(false); });
    });
    $('btn-me-alcanza').addEventListener('click', function (ev) {
      if (capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo) === null) {
        ev.preventDefault();
        renderResultadoCapacidad(true);
        $(estado.sueldoPropio ? 'inicio-pareja' : 'inicio-propio').focus();
        return;
      }
      estado.meAlcanza = true;
    });
    $('btn-todos').addEventListener('click', function () { estado.meAlcanza = false; });
    renderResultadoCapacidad(false);
  }

  // Dibuja solo el resultado (para no perder el foco de los campos). Devuelve true si hay número.
  function renderResultadoCapacidad(mostrarVacios) {
    validarSueldo($('inicio-propio'), estado.sueldoPropio, mostrarVacios);
    validarSueldo($('inicio-pareja'), estado.sueldoPareja, mostrarVacios);
    var cap = estado.sueldoPropio > 0 || estado.sueldoPareja > 0
      ? capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo) : null;
    var resultado = $('capacidad-resultado');
    $('btn-me-alcanza').setAttribute('aria-disabled', String(cap === null));

    if (cap === null) {
      resultado.innerHTML = '<p class="sin-numero">Escribe los sueldos para saber cuánto puedes comprar.</p>';
      return false;
    }
    var e = escenario(cap, 'individual', estado.modo);
    var vivir = estado.modo === 'vivir';
    resultado.innerHTML =
      '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Puedes comprar hasta</p>' +
        '<strong class="numero display-2">' + formatoUF(cap) + '</strong>' +
        '<p class="texto-apoyo">Es decir, ' + formatoPesos(e.precio) + ', poniendo <strong>' + formatoPesos(e.alEscriturar) +
          '</strong> al escriturar y <strong>' + formatoPesos(e.totalMes) + '</strong> al mes de dividendo. ' + ayuda('pie') + '</p>' +
        '<p class="texto-apoyo">Con el subsidio a la tasa (3,9\u00a0%). Sin subsidio: ' + formatoPesos(e.dividendoSinSubsidio) + ' al mes.</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
        '<button type="button" class="enlace desplegar" id="btn-reparto" aria-expanded="false" aria-controls="reparto">' +
          '¿De dónde sale el resto?<svg aria-hidden="true"><use href="#i-flecha"/></svg></button>' +
        '<div class="reparto" id="reparto" hidden>' +
          barraReparto(e) +
          '<ul class="lista-check">' +
            (vivir
              ? filaReparto('90\u00a0% lo presta Bci', 'Con la garantía del Estado (FOGAES), a 30 años, junto a tu pareja', e.reparto.bci) +
                filaReparto('10\u00a0% lo pones tú', 'Con tu ahorro, en cuotas mientras se construye', e.reparto.usuario)
              : filaReparto('80\u00a0% lo presta Bci', 'Crédito hipotecario a 30 años, junto a tu pareja', e.reparto.bci) +
                filaReparto('15\u00a0% lo ponen inversionistas', 'Sin cuota para ti: el arriendo les recompra su parte', e.reparto.inversionistas) +
                filaReparto('5\u00a0% lo pones tú', 'Con tu ahorro, propio o grupal', e.reparto.usuario)) +
          '</ul>' +
          '<p class="reparto-total">Además pones ' + formatoPesos(e.gastos) + ' de gastos de escritura (≈ 2\u00a0%).</p>' +
        '</div>' +
      '</div>';
    var boton = $('btn-reparto');
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      $('reparto').hidden = abierto;
    });
    return true;
  }

  function renderInicio() {
    var conCompra = !!estado.compra || estado.inversiones.length > 0;
    $('inicio-capacidad').hidden = conCompra;
    $('inicio-camino').hidden = !conCompra;
    // Solo un bloque existe a la vez, para que no se repita el título de la pantalla.
    if (conCompra) { $('inicio-capacidad').innerHTML = ''; estado.compra ? renderCamino() : renderSoloInversiones(); }
    else { $('inicio-camino').innerHTML = ''; renderCapacidad(); }
  }

  // ---------- Proyectos: el marketplace ----------
  function tarjetaProyecto(p) {
    var r = resumen(p);
    var d = departamentosDe(p.id)[0];
    var numero = p.tipo === 'conjunto'
      ? '<p class="etiqueta">Ahorras al unirte</p><strong class="numero display-4">' + formatoPesos(r.ahorro) + '</strong>'
      : '<p class="etiqueta">Precio del departamento</p><strong class="numero display-4">' + formatoPesos(r.escenario.precio) + '</strong>';
    return '<li><a class="tarjeta tarjeta-proyecto" href="#proyecto/' + esc(p.id) + '">' +
      '<h2 class="h4">' + esc(p.nombre) + '</h2>' +
      '<p class="texto-apoyo ficha">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      numero +
      avanceDe(p, r) +
      '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
      '<span class="ver">Ver proyecto <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span>' +
      '</a></li>';
  }

  function renderProyectos() {
    var arrendar = estado.modo === 'arrendar';
    $('proyectos-ia').hidden = !arrendar;
    $('proyectos-modo').textContent = arrendar ? 'Para arrendar' : 'Para vivir: todos';

    document.querySelectorAll('.pestanas [role="tab"]').forEach(function (tab) {
      var activa = tab.dataset.pestana === estado.pestana;
      tab.setAttribute('aria-selected', String(activa));
      tab.tabIndex = activa ? 0 : -1;
    });
    $('panel-proyectos').setAttribute('aria-labelledby', 'tab-' + estado.pestana);
    $('proyectos-explica').innerHTML = (estado.pestana === 'conjunto'
      ? 'Compran varios juntos y todos pagan menos: 3\u00a0% desde 5 unidades, 5\u00a0% desde 10. ' + ayuda('compra-conjunto')
      : 'Pones el 5\u00a0% y unos inversionistas el 15\u00a0%; el arriendo les recompra su parte. ' + ayuda('financiamiento-pie'));

    // Filtro "Me alcanza" (S5-F0): solo si hay sueldos para calcular la capacidad.
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo);
    var filtro = $('filtro-alcanza');
    filtro.hidden = cap === null;
    var usarAlcanza = estado.meAlcanza && cap !== null;
    filtro.setAttribute('aria-pressed', String(usarAlcanza));
    filtro.innerHTML = usarAlcanza
      ? 'Me alcanza: hasta ' + formatoUF(cap) + ' <span class="quitar" aria-hidden="true">×</span><span class="oculto-visual">. Toca para quitar el filtro.</span>'
      : 'Ver solo los que me alcanzan';

    // El pie compartido es para comprar para arrendar: en modo vivir esa pestaña queda vacía.
    var soloArrendar = !arrendar && estado.pestana === 'financiamiento';
    var delTipo = soloArrendar ? [] : PROYECTOS.filter(function (p) {
      return p.tipo === estado.pestana && (!arrendar || resumen(p).pasaFiltro);
    });
    var visibles = delTipo.filter(function (p) {
      return !usarAlcanza || resumen(p).escenario.precioUF <= cap;
    });
    $('lista-proyectos').innerHTML = visibles.map(tarjetaProyecto).join('');
    $('lista-proyectos').hidden = visibles.length === 0;
    $('proyectos-explica').hidden = visibles.length === 0;
    $('proyectos-vacio').hidden = visibles.length > 0;

    // El estado vacío explica la causa y ofrece la salida que corresponde.
    var porAlcanza = usarAlcanza && delTipo.length > 0;
    $('vacio-titulo').textContent = soloArrendar ? 'El pie compartido es para arrendar'
      : (porAlcanza ? 'Ninguno de este tipo te alcanza hoy' : 'Ningún proyecto rinde 3,9\u00a0% hoy');
    $('vacio-texto').textContent = soloArrendar
      ? 'Los inversionistas recuperan su parte con el arriendo. Para vivir, mira la compra en grupo.'
      : (porAlcanza
        ? 'Con sus sueldos pueden comprar hasta ' + formatoUF(cap) + '. Prueba la otra pestaña o quita el filtro.'
        : 'Para arrendar, la IA solo muestra departamentos cuyo arriendo neto rinde 3,9\u00a0% o más al año, la tasa del crédito.');
    $('btn-vacio-accion').textContent = soloArrendar ? 'Cambiar a modo arrendar'
      : (porAlcanza ? 'Quitar el filtro Me alcanza' : 'Cambiar a modo vivir');
    $('btn-vacio-accion').dataset.accion = soloArrendar ? 'arrendar' : (porAlcanza ? 'alcanza' : 'vivir');
  }

  function iniciarProyectos() {
    document.querySelectorAll('.pestanas [role="tab"]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        estado.pestana = tab.dataset.pestana;
        renderProyectos();
      });
      // Flechas izquierda/derecha para moverse entre pestañas.
      tab.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
        estado.pestana = estado.pestana === 'conjunto' ? 'financiamiento' : 'conjunto';
        renderProyectos();
        $('tab-' + estado.pestana).focus();
      });
    });
    $('filtro-alcanza').addEventListener('click', function () {
      estado.meAlcanza = !estado.meAlcanza;
      renderProyectos();
    });
    $('btn-vacio-accion').addEventListener('click', function () {
      var accion = $('btn-vacio-accion').dataset.accion;
      if (accion === 'alcanza') estado.meAlcanza = false;
      else { estado.modo = accion === 'arrendar' ? 'arrendar' : 'vivir'; guardarEstado(); }
      renderProyectos();
    });
  }

  // ---------- Detalle de un proyecto ----------
  function filaReparto(texto, apoyo, monto) {
    return '<li><svg aria-hidden="true"><use href="#i-check"/></svg>' +
      '<span>' + texto + '<small>' + apoyo + '</small></span>' +
      '<span class="monto">' + formatoPesos(monto) + '</span></li>';
  }

  function renderDetalle(id) {
    var p = buscarProyecto(id);
    var contenedor = $('detalle-proyecto');
    if (!p) {
      contenedor.innerHTML = '<div class="vacio"><svg aria-hidden="true"><use href="#i-proyectos"/></svg>' +
        '<h1 id="titulo-proyecto" class="h3">No encontramos este proyecto</h1>' +
        '<p class="texto-apoyo">Puede que ya se haya cerrado.</p>' +
        '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div></div>';
      return;
    }

    var r = resumen(p);
    var e = r.escenario;
    var d = departamentosDe(p.id)[0];
    var conjunto = p.tipo === 'conjunto';
    var esMiCompra = estado.compra && estado.compra.proyectoId === p.id;

    var precio = conjunto
      ? '<p class="precio-lista">Precio de lista <s>' + formatoPesos(e.precioLista) + '</s></p>' +
        '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>' +
        '<p class="texto-apoyo">' + formatoPorcentaje(r.descuento, 0) + ' menos por comprar en grupo. Ahorras ' + formatoPesos(r.ahorro) + '.</p>'
      : '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>';

    var rinde = estado.modo === 'arrendar'
      ? '<p class="texto-apoyo bloque">Arriendo estimado por la IA: <strong>' + formatoPesos(r.arriendoBruto) + '</strong> al mes. ' +
        'Rinde <strong>' + formatoPorcentaje(r.rentabilidad, 1) + '</strong> neto al año' +
        (r.pasaFiltro ? ', sobre el 3,9\u00a0% del crédito.' : ', bajo el 3,9\u00a0% del crédito.') + '</p>'
      : '';

    var frase = conjunto
      ? 'Si el grupo no se completa: puedes pasar a compra individual o salir sin costo.'
      : 'Si no se reúne el 15\u00a0%: puedes esperar o salir sin costo.';

    var invertiste = invertidoEn(p.id) > 0;
    var comprar;
    if (!conjunto && estado.modo === 'vivir' && !esMiCompra) {
      comprar = '<p class="aviso">El pie compartido es para comprar para arrendar: los inversionistas recuperan su parte con el arriendo.</p>' +
        '<a href="#perfil" class="btn btn-terciario btn-bloque">Cambiar a modo arrendar en Perfil</a>';
    } else if (esMiCompra) {
      comprar = '<p class="aviso">Ya te uniste a este proyecto.</p>' +
        '<a href="#mis-proyectos" class="btn btn-primario btn-lg btn-bloque">Ver mi compra</a>';
    } else if (invertiste) {
      // El 15 % de un comprador lo financian otras personas: quien ya invirtió aquí no puede comprar aquí.
      comprar = '<p class="aviso">Ya invertiste en este proyecto, así que no puedes comprar aquí: el 15' + NBSP + '% de un comprador lo ponen otras personas.</p>' +
        '<a href="#mis-proyectos/inversiones" class="btn btn-terciario btn-bloque">Ver mis inversiones</a>';
    } else if (estado.compra && estado.compra.paso === 4) {
      comprar = '<p class="aviso">Ya firmaste tu compra en ' + esc(buscarProyecto(estado.compra.proyectoId).nombre) + '.</p>';
    } else if (estado.compra) {
      var actual = buscarProyecto(estado.compra.proyectoId);
      var reemplaza = (estado.compra.paso || 1) >= 2
        ? '<p class="texto-apoyo">Tu postulación en ' + esc(actual.nombre) + ' se reemplaza: vuelves a postular aquí.</p>'
        : '';
      comprar = '<p class="aviso">Ya tienes una compra en ' + esc(actual.nombre) + '.</p>' +
        (r.cuposLibres > 0
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-cambiar-compra">Cambiar mi compra a este proyecto</button>' + reemplaza
          : '');
    } else if (r.cuposLibres === 0) {
      comprar = '<p class="aviso">Sin cupos disponibles.</p>';
    } else {
      comprar = '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-comprar">Comprar aquí</button>';
    }

    contenedor.innerHTML =
      '<header class="detalle-cabecera">' +
        '<p class="chip-fila"><span class="chip">' + NOMBRE_TIPO[p.tipo] + '</span> ' +
          ayuda(conjunto ? 'compra-conjunto' : 'financiamiento-pie') + '</p>' +
        '<h1 id="titulo-proyecto" class="h2">' + esc(p.nombre) + '</h1>' +
        '<p class="texto-apoyo">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '</header>' +

      '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Precio del departamento</p>' + precio +
        '<p class="secundario">Y luego <strong>' + formatoPesos(e.totalMes) + '</strong> al mes de dividendo</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</div>' +
      rinde +

      '<div class="tarjeta bloque">' +
        '<h2 class="h5">De dónde sale el precio</h2>' +
        '<ul class="lista-check">' +
          (e.modo === 'vivir'
            ? filaReparto('90\u00a0% lo presta Bci', 'Con la garantía del Estado (FOGAES), a 30 años, junto a tu pareja', e.reparto.bci) +
              filaReparto('10\u00a0% lo pones tú', conjunto ? 'En cuotas mientras se construye' : 'Con tu ahorro', e.reparto.usuario)
            : filaReparto('80\u00a0% lo presta Bci', 'Crédito hipotecario a 30 años, junto a tu pareja', e.reparto.bci) +
              filaReparto('15\u00a0% lo ponen inversionistas', 'Sin cuota para ti: el arriendo les recompra su parte', e.reparto.inversionistas) +
              filaReparto('5\u00a0% lo pones tú', 'Con tu ahorro, propio o grupal', e.reparto.usuario)) +
        '</ul>' +
        '<p class="reparto-total">Más ' + formatoPesos(e.gastos) + ' de gastos de escritura: pones <strong>' +
          formatoPesos(e.alEscriturar) + '</strong> al escriturar.</p>' +
        '<p class="reparto-total">Al mes pagas solo el dividendo: <strong>' + formatoPesos(e.dividendo) + '</strong>, con subsidio a la tasa. ' +
          'Sin subsidio: ' + formatoPesos(e.dividendoSinSubsidio) + '. ' + ayuda('dividendo') + '</p>' +
      '</div>' +

      '<div class="tarjeta bloque">' +
        avanceDe(p, r) +
        '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
        '<p class="frase-cierre">' + frase + '</p>' +
      '</div>' +

      '<section class="tarjeta bloque" aria-labelledby="titulo-para-invertir">' +
        '<h2 class="h5" id="titulo-para-invertir">Para invertir</h2>' +
        '<ul class="datos-inversion">' +
          '<li><span>Rentabilidad</span><strong>6\u00a0% al año en UF</strong></li>' +
          '<li><span>Plazo</span><strong>≈ ' + textoMeses(mesesRecompra(r.porFinanciarUF, r.netoMensualUF, 1) || SUPUESTOS.topeRecompraMeses) + '</strong></li>' +
          '<li><span>Tu respaldo</span><strong>Parte del departamento ' + ayuda('participacion') + '</strong></li>' +
          '<li><span>Falta por financiar</span><strong>' + formatoUF(r.faltaUF) + ' = ' + formatoPesos(ufAPesos(r.faltaUF)) + '</strong></li>' +
        '</ul>' +
        (conjunto ? barraAvance('Participación de 15\u00a0% reunida', formatoPorcentaje(r.avanceFinanciamiento, 0), r.avanceFinanciamiento) : '') +
        '<p class="frase-cierre">Bci cobra el arriendo en una cuenta custodia: paga tu renta y te recompra tu parte cada mes. Ganancias y pérdidas se reparten según la parte de cada uno. ' + ayuda('cuenta-custodia') + '</p>' +
      '</section>' +

      '<div class="acciones">' +
        comprar +
        (r.faltaUF > 0 && !esMiCompra
          ? '<a href="#invertir/' + esc(p.id) + '" class="btn btn-secundario-dark btn-bloque">Invertir aquí</a>'
          : '<p class="texto-apoyo">' + (esMiCompra ? 'En tu propia compra no puedes invertir.'
            : 'Este proyecto ya reunió su 15\u00a0%.') + '</p>') +
      '</div>';

    var botonComprar = $('btn-comprar');
    if (botonComprar) {
      botonComprar.addEventListener('click', function () {
        conCarga(botonComprar, function () {
          guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
          location.hash = '#mis-proyectos';
        });
      });
    }
    var botonCambiar = $('btn-cambiar-compra');
    if (botonCambiar) {
      botonCambiar.addEventListener('click', function () {
        conCarga(botonCambiar, function () {
          guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
          location.hash = '#mis-proyectos';
        });
      });
    }
  }

  // ---------- Invertir (S6-F1 y S6-F3) ----------
  function renderInvertir(id) {
    var p = buscarProyecto(id);
    var contenedor = $('invertir-contenido');
    $('invertir-volver').setAttribute('href', p ? '#proyecto/' + encodeURIComponent(p.id) : '#proyectos');
    if (!p) {
      contenedor.innerHTML = '<div class="vacio"><h1 id="titulo-invertir" class="h3">No encontramos este proyecto</h1>' +
        '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div></div>';
      return;
    }
    var r = resumen(p);
    var esMiCompra = estado.compra && estado.compra.proyectoId === p.id;
    var cabecera =
      '<header class="encabezado">' +
        '<h1 id="titulo-invertir" class="h2">Invertir</h1>' +
        '<p class="texto-apoyo">' + esc(p.nombre) + SEP + esc(p.comuna) + '</p>' +
      '</header>' +
      '<p class="ficha-inversion"><span>6 % al año en UF</span>' + SEP + '<span>Recompra con el arriendo</span>' + SEP + '<span>Parte del departamento</span></p>';

    if (esMiCompra || validarInversion(0, r.faltaUF) === 'completo') {
      contenedor.innerHTML = cabecera +
        '<p class="aviso bloque">' + (esMiCompra
          ? 'Este es el proyecto de tu compra: aquí tu parte la juntas tú.'
          : 'Este proyecto ya reunió su 15 %: no queda nada por financiar.') + '</p>' +
        '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver otros proyectos</a></div>';
      return;
    }

    contenedor.innerHTML = cabecera +
      '<div class="campo">' +
        '<label for="monto-uf">¿Cuánto quieres invertir?</label>' +
        '<div class="campo-caja campo-uf"><span class="prefijo" aria-hidden="true">UF</span>' +
        '<input id="monto-uf" type="text" inputmode="decimal" autocomplete="off" aria-describedby="monto-uf-ayuda monto-uf-error"></div>' +
        '<p class="texto-apoyo ayuda-campo" id="monto-uf-ayuda">' + (r.faltaUF < INVERSION_MINIMA_UF
          ? 'Falta ' + formatoUF(r.faltaUF) + ' para completar el 15' + NBSP + '%: puedes invertir justo eso.'
          : 'Desde ' + formatoUF(INVERSION_MINIMA_UF) + ' hasta ' + formatoUF(r.faltaUF) + ', lo que falta por financiar.') + '</p>' +
        '<p class="error" id="monto-uf-error" hidden><svg aria-hidden="true"><use href="#i-no"/></svg><span></span></p>' +
      '</div>' +
      '<div id="invertir-resultado" aria-live="polite"></div>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-confirmar" aria-describedby="confirmar-explica">Confirmar</button></div>' +
      '<p class="texto-apoyo" id="confirmar-explica">Es una inversión simulada: no se mueve dinero real.</p>';

    var monto = null;
    var tocado = false;
    var dibujar = function () {
      var error = validarInversion(monto, r.faltaUF);
      var mensajes = {
        vacio: 'Escribe cuánto quieres invertir, desde ' + formatoUF(inversionMinimaUF(r.faltaUF)) + '.',
        minimo: r.faltaUF < INVERSION_MINIMA_UF
          ? 'Falta ' + formatoUF(r.faltaUF) + ' para completar el 15' + NBSP + '%: invierte justo eso.'
          : 'La inversión mínima es ' + formatoUF(INVERSION_MINIMA_UF) + '.',
        maximo: 'Falta financiar ' + formatoUF(r.faltaUF) + ': no puedes invertir más que eso.'
      };
      var mostrar = error && (error !== 'vacio' || tocado);
      var caja = $('monto-uf-error');
      caja.hidden = !mostrar;
      caja.querySelector('span').textContent = mostrar ? mensajes[error] : '';
      $('monto-uf').setAttribute('aria-invalid', String(!!mostrar));
      $('btn-confirmar').disabled = !!error;

      if (error) {
        $('invertir-resultado').innerHTML = '<p class="sin-numero">Escribe un monto para ver cuánto recibirás al mes.</p>';
        return;
      }
      var primero = flujoInversionUF(monto, r.porFinanciarUF, r.netoMensualUF, 1, 1);
      var meses = mesesRecompra(r.porFinanciarUF, r.netoMensualUF, 1);
      $('invertir-resultado').innerHTML =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">Recibirás el primer mes</p>' +
          '<strong class="numero display-2">' + formatoPesos(ufAPesos(primero)) + '</strong>' +
          '<p class="texto-apoyo">Por invertir ' + formatoUF(monto) + ' (' + formatoPesos(ufAPesos(monto)) + ' hoy). ' +
            'Va bajando a medida que el arriendo te recompra tu parte: recuperas tu dinero más 6\u00a0% al año en UF en ≈ ' +
            textoMeses(meses || SUPUESTOS.topeRecompraMeses) + ', sin contar plusvalía.</p>' +
        '</div>';
    };

    var habia = false;
    $('monto-uf').addEventListener('input', function () {
      var input = $('monto-uf');
      input.value = limpiarCampoUF(input.value);
      monto = leerMontoUF(input.value);
      dibujar();
      var hay = !validarInversion(monto, r.faltaUF);
      if (hay && !habia) $('invertir-resultado').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      habia = hay;
    });
    $('monto-uf').addEventListener('blur', function () { tocado = true; dibujar(); });
    $('btn-confirmar').addEventListener('click', function () {
      tocado = true;
      dibujar();
      if ($('btn-confirmar').disabled) { $('monto-uf').focus(); return; }
      var invertido = monto;
      conCarga($('btn-confirmar'), function () {
        agregarInversion({ id: 'inv-' + Date.now(), proyectoId: p.id, montoUF: invertido, fecha: FECHA_REFERENCIA, cuotasCobradas: 0 });
        anunciar('Invertiste ' + formatoUF(invertido) + ' en ' + p.nombre + '.');
        location.hash = '#mis-proyectos/inversiones';
      });
    });
    dibujar();
  }

  // ---------- Mis inversiones (S6-F4) ----------
  function renderMisInversiones() {
    var lista = estado.inversiones;
    if (!lista.length) {
      $('panel-inversiones').innerHTML =
        '<div class="vacio">' +
          '<svg aria-hidden="true"><use href="#i-pronto"/></svg>' +
          '<h2 class="h3">Aún no tienes inversiones</h2>' +
          '<p class="texto-apoyo">En cada proyecto puedes elegir "Invertir aquí".</p>' +
          '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div>' +
        '</div>';
      return;
    }
    var tarjetas = lista.map(function (x) {
      var p = buscarProyecto(x.proyectoId);
      var dc = datosCobro([x])[0];
      var total = mesesRecompra(dc.participacionUF, dc.netoUF, 1) || SUPUESTOS.topeRecompraMeses;
      var proximo = ufAPesos(cuotaMensualTotalUF([dc]));
      return '<li class="tarjeta inversion">' +
        '<a class="enlace" href="#proyecto/' + esc(p.id) + '">' + esc(p.nombre) + '</a>' +
        '<p class="inversion-fila"><span>Invertiste</span><strong>' + formatoUF(x.montoUF) + '</strong></p>' +
        '<p class="inversion-fila"><span>Recibes el próximo mes</span><strong>' + formatoPesos(proximo) + '</strong></p>' +
        barraAvance('Meses de recompra', Math.min(x.cuotasCobradas, total) + ' de ' + total, avance(x.cuotasCobradas, total)) +
      '</li>';
    }).join('');

    $('panel-inversiones').innerHTML =
      '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Cobrado a la fecha</p>' +
        '<strong class="numero display-3">' + formatoPesos(ufAPesos(cobradoUF(datosCobro(lista)))) + '</strong>' +
        '<p class="texto-apoyo">' + plural(lista.length, 'inversión', 'inversiones') + SEP + 'el próximo mes recibes ' +
          formatoPesos(ufAPesos(cuotaMensualTotalUF(datosCobro(lista)))) + '.</p>' +
      '</div>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-cobrar-mes">Simular un mes</button></div>' +
      '<p class="texto-apoyo">Es una simulación: cobras un mes de renta y recompra por cada inversión.</p>' +
      '<ul class="lista-inversiones">' + tarjetas + '</ul>' +
      '<p class="texto-centro"><a class="enlace" href="#proyectos">Invertir en otro proyecto</a></p>';

    $('btn-cobrar-mes').addEventListener('click', function () {
      estado.inversiones = estado.inversiones.map(function (x) {
        return Object.assign({}, x, { cuotasCobradas: Math.min(600, (x.cuotasCobradas || 0) + 1) });
      });
      guardarInversiones();
      renderMisInversiones();
      anunciar('Cobraste un mes. Llevas ' + formatoPesos(ufAPesos(cobradoUF(datosCobro(estado.inversiones)))) + ' a la fecha.');
      $('btn-cobrar-mes').focus();
    });
  }

  // ---------- Mis proyectos ----------
  var PASOS = [
    { titulo: 'Postula', apoyo: 'Revisamos si tú y tu pareja califican.' },
    { titulo: 'Tu pie', apoyo: 'Juntas lo que pones al escriturar.' },
    { titulo: 'Firma', apoyo: 'Firmas la escritura y recibes tu departamento.' }
  ];

  var SEMAFORO = {
    'holgado': { palabra: 'Holgado', icono: 'i-ok', explica: 'Tu carga está dentro de lo que Bci considera cómodo (hasta 25\u00a0%).' },
    'limite': { palabra: 'En el límite', icono: 'i-alerta', explica: 'Bci aprueba hasta 30\u00a0%, pero te queda poco margen.' },
    'no-aprueba': { palabra: 'No aprueba', icono: 'i-no', explica: 'Sobre 30\u00a0%, Bci no aprueba el crédito.' }
  };

  function departamentoDeMiCompra(p) {
    return departamentosDe(p.id).filter(function (x) { return x.id === estado.compra.departamentoId; })[0] ||
      departamentosDe(p.id)[0];
  }

  function listaPasos(pasoActual) {
    return '<ol class="pasos">' + PASOS.map(function (paso, i) {
      var n = i + 1;
      var clase = n === pasoActual ? 'actual' : (n < pasoActual ? 'hecho' : '');
      var marca = n < pasoActual ? '<svg aria-hidden="true"><use href="#i-ok"/></svg>' : n;
      return '<li' + (clase ? ' class="' + clase + '"' : '') + (n === pasoActual ? ' aria-current="step"' : '') + '>' +
        '<span class="num" aria-hidden="true">' + marca + '</span>' +
        '<span>' + paso.titulo +
        '<span class="oculto-visual">' + (n === pasoActual ? ', paso actual. ' : (n < pasoActual ? ', listo. ' : '. ')) + paso.apoyo + '</span>' +
        '</span></li>';
    }).join('') + '</ol>';
  }

  function campoDinero(id, etiqueta, valor) {
    return '<div class="campo">' +
      '<label for="' + id + '">' + etiqueta + '</label>' +
      '<div class="campo-caja"><span class="prefijo" aria-hidden="true">$</span>' +
      '<input id="' + id + '" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="next"' +
      ' aria-describedby="' + id + '-error" value="' + (valor ? formatoMiles(valor) : '') + '"></div>' +
      '<p class="error" id="' + id + '-error" hidden><svg aria-hidden="true"><use href="#i-no"/></svg><span></span></p>' +
      '</div>';
  }

  // Deja el campo con punto de miles mientras se escribe y devuelve el monto.
  function formatearCampo(input) {
    var monto = leerMonto(input.value);
    input.value = monto === null ? '' : formatoMiles(monto);
    return monto;
  }

  // Muestra u oculta el error de un campo de dinero. Devuelve true si el monto sirve.
  function validarMonto(input, monto, mostrarVacio, textoVacio, textoCero) {
    var caja = $(input.id + '-error');
    var mensaje = '';
    if (monto === 0) mensaje = textoCero;
    else if (monto === null && mostrarVacio) mensaje = textoVacio;
    caja.hidden = !mensaje;
    caja.querySelector('span').textContent = mensaje;
    input.setAttribute('aria-invalid', String(!!mensaje));
    return monto !== null && monto > 0;
  }

  function validarSueldo(input, monto, mostrarVacio) {
    return validarMonto(input, monto, mostrarVacio, 'Escribe el sueldo líquido del mes.', 'El sueldo tiene que ser mayor a $0.');
  }

  // Busca otro proyecto que deje la carga en verde o amarillo, con los mismos sueldos.
  // Si ninguno aprueba, dice cuánto ingreso falta para este proyecto.
  // Devuelve { html, aprueba } (aprueba = la sugerencia permite postular).
  function sugerencia(p, cargaActual) {
    var total = resumen(p).escenario.totalMes;
    var opciones = PROYECTOS.filter(function (x) {
      return x.id !== p.id && invertidoEn(x.id) === 0 && resumen(x).cuposLibres > 0 && (estado.modo !== 'arrendar' || resumen(x).pasaFiltro);
    }).map(function (x) { return { id: x.id, totalMes: resumen(x).escenario.totalMes }; });
    var mejor = mejorAlternativa(cargaActual, opciones, estado.sueldoPropio, estado.sueldoPareja);

    if (mejor && mejor.nivel !== 'no-aprueba') {
      var otro = buscarProyecto(mejor.id);
      var frase = otro.tipo === 'conjunto'
        ? 'Si te unes a la compra en grupo de ' + esc(otro.nombre) + ', tu carga baja a '
        : 'En ' + esc(otro.nombre) + ', tu carga baja a ';
      return {
        aprueba: true,
        html: '<div class="sugerencia"><p>' + frase + '<strong>' + formatoPorcentaje(cargaRedondeada(mejor.carga), 1) +
          '</strong> (' + SEMAFORO[mejor.nivel].palabra.toLowerCase() + ').</p>' +
          '<a class="enlace" href="#proyecto/' + esc(otro.id) + '">Ver ' + esc(otro.nombre) + '</a> ' +
          '<a class="enlace" href="#proyectos">Ver proyectos</a></div>'
      };
    }

    if (nivelCarga(cargaActual) === 'no-aprueba') {
      return {
        aprueba: false,
        html: '<div class="sugerencia"><p>Para postular aquí, a su ingreso le faltan <strong>' +
          formatoPesos(ingresoFaltante(total, estado.sueldoPropio, estado.sueldoPareja)) + '</strong> al mes: ' +
          'necesitan ' + formatoPesos(ingresoMinimo(total)) + ' entre los dos.</p>' +
          '<a class="enlace" href="#proyectos">Ver proyectos más baratos</a></div>'
      };
    }

    return {
      aprueba: true,
      html: '<div class="sugerencia"><p>Para bajar tu carga, suma otro ingreso o elige un departamento más barato.</p>' +
        '<a class="enlace" href="#proyectos">Ver proyectos</a></div>'
    };
  }

  // Recalcula la carga con lo que hay en los campos. No toca los campos (para no perder el foco).
  // Devuelve true si se pudo calcular.
  function renderCarga(p, mostrarVacios) {
    var total = resumen(p).escenario.totalMes;
    var okPropio = validarSueldo($('sueldo-propio'), estado.sueldoPropio, mostrarVacios.propio);
    var okPareja = validarSueldo($('sueldo-pareja'), estado.sueldoPareja, mostrarVacios.pareja);
    var boton = $('btn-postular');
    var resultado = $('carga-resultado');

    if (!okPropio || !okPareja) {
      resultado.innerHTML = '<p class="texto-apoyo">Escribe los dos sueldos para ver tu carga.</p>';
      boton.disabled = true;
      $('postular-explica').textContent = 'Para postular, completa los dos sueldos.';
      return false;
    }

    var k = carga(total, estado.sueldoPropio, estado.sueldoPareja);
    var nivel = nivelCarga(k);
    var s = SEMAFORO[nivel];
    var sug = nivel === 'holgado' ? null : sugerencia(p, k);
    resultado.innerHTML =
      '<div class="tarjeta semaforo semaforo-' + nivel + '">' +
        '<p class="etiqueta">Tu carga ' + ayuda('carga') + '</p>' +
        '<div class="semaforo-fila">' +
          '<strong class="numero display-2">' + formatoPorcentaje(cargaRedondeada(k), 1) + '</strong>' +
          '<p class="estado-semaforo"><svg aria-hidden="true"><use href="#' + s.icono + '"/></svg>' + s.palabra + '</p>' +
        '</div>' +
        '<p class="texto-apoyo">' + s.explica + ' Pagan ' + formatoPesos(total) + ' al mes de ' +
          formatoPesos(ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) + ' de ingreso.</p>' +
      '</div>' +
      (sug ? sug.html : '');

    boton.disabled = nivel === 'no-aprueba';
    $('postular-explica').textContent = nivel !== 'no-aprueba' ? ''
      : (sug && sug.aprueba
        ? 'Con una carga sobre 30\u00a0% no puedes postular aquí. Revisa la sugerencia de arriba.'
        : 'Con una carga sobre 30\u00a0% no puedes postular aquí: falta ingreso o un departamento más barato.');
    return true;
  }

  function campoContrato() {
    var opcion = function (valor) {
      return '<input type="radio" name="contrato" id="contrato-' + valor + '" value="' + valor + '"' +
        (estado.contrato === valor ? ' checked' : '') + '><label for="contrato-' + valor + '">' + CONTRATOS[valor] + '</label>';
    };
    return '<fieldset class="selector selector-tres"><legend>Tu tipo de contrato</legend>' +
      '<div class="selector-opciones">' + opcion('indefinido') + opcion('plazo-fijo') + opcion('independiente') + '</div>' +
      '</fieldset>';
  }

  // Postula tiene tres partes: Tus datos → Tus documentos → Resultado (S8-F2).
  function subpasoPostula() {
    var sp = estado.compra.subpaso;
    return sp === 'documentos' || sp === 'resultado' ? sp : 'datos';
  }

  function guardarSubpaso(sp) {
    guardarCompra(Object.assign({}, estado.compra, { subpaso: sp }));
  }

  var PARTES_POSTULA = ['Tus datos', 'Tus documentos', 'Resultado'];
  function partesPostula(actual) {
    var i = PARTES_POSTULA.indexOf(actual);
    return '<p class="partes-postula" aria-label="Parte ' + (i + 1) + ' de 3: ' + actual + '">' +
      PARTES_POSTULA.map(function (t, k) {
        return '<span class="' + (k === i ? 'actual' : (k < i ? 'hecha' : '')) + '" aria-hidden="true">' + t + '</span>';
      }).join('<span class="sep" aria-hidden="true">›</span>') + '</p>';
  }

  function renderPostula(p, d) {
    var sp = subpasoPostula();
    if (sp === 'documentos') return renderDocumentos(p, d);
    if (sp === 'resultado') return renderResultadoPreaprobacion(p, d);

    var e = resumen(p).escenario;
    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Dividendo al mes', e.totalMes) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-postula">' +
        '<h2 class="h3" id="titulo-postula">Postula <span class="texto-apoyo titulo-apoyo">con los sueldos líquidos</span></h2>' +
        partesPostula('Tus datos') +
        '<div class="formulario">' +
          campoDinero('sueldo-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          campoDinero('sueldo-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
          campoDinero('otras-cuotas', 'Otras cuotas al mes (auto, consumo)', estado.otrasCuotas) +
          '<p class="texto-apoyo ayuda-campo">Si no tienes, déjalo vacío. El banco las suma: dividendo más cuotas no puede pasar de 30 %.</p>' +
          campoContrato() +
        '</div>' +
        '<div id="carga-resultado" aria-live="polite"></div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-postular" aria-describedby="postular-explica">Postular</button></div>' +
          '<div class="acciones">' +
          '<p class="texto-apoyo" id="postular-explica"></p>' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-salir">Salir de esta compra</button>' +
        '</div>' +
      '</section>';

    var tocados = { propio: false, pareja: false };
    var habiaCarga = false;
    [['sueldo-propio', 'sueldoPropio', 'propio'], ['sueldo-pareja', 'sueldoPareja', 'pareja']].forEach(function (c) {
      var input = $(c[0]);
      input.addEventListener('input', function () {
        estado[c[1]] = formatearCampo(input);
        guardarEstado();
        var hayCarga = renderCarga(p, tocados);
        // La primera vez que aparece la carga, se trae a la vista (el teclado puede taparla).
        if (hayCarga && !habiaCarga) $('carga-resultado').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        habiaCarga = hayCarga;
      });
      input.addEventListener('blur', function () {
        tocados[c[2]] = true;
        renderCarga(p, tocados);
      });
    });
    $('otras-cuotas').addEventListener('input', function () {
      estado.otrasCuotas = formatearCampo($('otras-cuotas'));
      guardarEstado();
    });
    document.querySelectorAll('input[name="contrato"]').forEach(function (r) {
      r.addEventListener('change', function () { estado.contrato = r.value; guardarEstado(); });
    });

    $('btn-postular').addEventListener('click', function () {
      tocados = { propio: true, pareja: true };
      renderCarga(p, tocados);
      if ($('btn-postular').disabled) return;
      var k = carga(e.totalMes, estado.sueldoPropio, estado.sueldoPareja);
      conCarga($('btn-postular'), function () {
        guardarCompra(Object.assign({}, estado.compra, { subpaso: 'documentos', carga: k }));
        renderMiCompra();
        window.scrollTo(0, 0);
        anunciar('Datos listos. Ahora tus documentos.');
      });
    });
    $('btn-salir').addEventListener('click', salirDeCompra);

    // Si ya había sueldos guardados, se muestra la carga de inmediato.
    habiaCarga = renderCarga(p, { propio: estado.sueldoPropio !== null, pareja: estado.sueldoPareja !== null });
  }

  // ---------- Tus documentos: archivos de ejemplo precargados (S8-F3) ----------
  // Los archivos ya vienen en la app: nada se lee, se guarda ni se envía.
  var DOCUMENTOS = [
    { id: 'liquidaciones', nombre: 'Últimas 3 liquidaciones de sueldo', para: 'Muestran tu sueldo líquido de los últimos meses.',
      archivos: ['liquidacion_septiembre.pdf', 'liquidacion_agosto.pdf', 'liquidacion_julio.pdf'] },
    { id: 'afp', nombre: 'Certificado de cotizaciones de la AFP', para: 'Muestra 12 meses de cotizaciones: que tu ingreso es estable.',
      archivos: ['certificado_cotizaciones_12_meses.pdf', 'certificado_cotizaciones_24_meses.pdf'] },
    { id: 'contrato', nombre: 'Contrato de trabajo o certificado de antigüedad', para: 'Muestra tu tipo de contrato y desde cuándo trabajas.',
      archivos: ['contrato_de_trabajo.pdf', 'certificado_de_antiguedad.pdf'] },
    { id: 'carnet', nombre: 'Carnet de identidad por ambos lados', para: 'Confirma tu identidad.',
      archivos: ['carnet_ambos_lados.pdf', 'carnet_frente_y_reverso.jpg'] }
  ];

  // Miniatura dibujada: rectángulo, líneas grises, título y la marca "DOCUMENTO DE EJEMPLO".
  function miniaturaDoc(titulo) {
    return '<svg class="miniatura-doc" viewBox="0 0 60 78" aria-hidden="true">' +
      '<rect class="md-hoja" x="1" y="1" width="58" height="76" rx="4"/>' +
      '<rect class="md-titulo" x="8" y="9" width="30" height="4" rx="2"/>' +
      '<rect class="md-linea" x="8" y="18" width="44" height="3" rx="1.5"/>' +
      '<rect class="md-linea" x="8" y="25" width="40" height="3" rx="1.5"/>' +
      '<rect class="md-linea" x="8" y="32" width="44" height="3" rx="1.5"/>' +
      '<rect class="md-linea" x="8" y="39" width="34" height="3" rx="1.5"/>' +
      '<rect class="md-marca" x="4" y="52" width="52" height="12" rx="2"/>' +
      '<text class="md-texto" x="30" y="60" text-anchor="middle">DOCUMENTO DE EJEMPLO</text>' +
      '</svg><span class="oculto-visual">' + esc(titulo) + '</span>';
  }

  function documentosListos() {
    var docs = estado.compra.documentos || {};
    return DOCUMENTOS.every(function (x) { return !!docs[x.id]; });
  }

  function renderDocumentos(p) {
    var c = estado.compra;
    var docs = c.documentos || {};
    var eligio = c.cliente === true || c.cliente === false;

    var opciones =
      '<div class="opciones-cliente">' +
        '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-soy-cliente">Soy cliente Bci</button>' +
        '<p class="texto-apoyo">Bci ya conoce tus ingresos: no necesitas subir nada.</p>' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-subir-docs"' + (c.cliente === false ? ' aria-pressed="true"' : '') + '>No soy cliente: subir documentos</button>' +
      '</div>';

    var lista = '';
    if (c.cliente === false) {
      lista = '<ul class="lista-documentos">' + DOCUMENTOS.map(function (x) {
        var archivo = docs[x.id];
        return '<li class="documento' + (archivo ? ' listo' : '') + '" id="doc-' + x.id + '">' +
          '<div class="documento-fila">' +
            '<span class="documento-icono" aria-hidden="true">' + (archivo ? '<svg><use href="#i-ok"/></svg>' : '') + '</span>' +
            '<span class="documento-texto"><strong>' + x.nombre + '</strong><small>' +
              (archivo ? 'Listo: ' + esc(archivo) : x.para) + '</small></span>' +
            '<button type="button" class="btn btn-terciario btn-sm btn-subir" data-doc="' + x.id + '" aria-expanded="false" aria-controls="hoja-' + x.id + '">' +
              (archivo ? 'Cambiar' : 'Subir') + '<span class="oculto-visual"> ' + x.nombre + '</span></button>' +
          '</div>' +
          '<div class="hoja-archivos" id="hoja-' + x.id + '" hidden></div>' +
        '</li>';
      }).join('') + '</ul>';
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Dividendo al mes', resumen(p).escenario.totalMes) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-documentos">' +
        '<h2 class="h3" id="titulo-documentos">Tus documentos</h2>' +
        partesPostula('Tus documentos') +
        '<p class="aviso">En esta demo tus archivos no se guardan ni se envían: los documentos son de ejemplo y ya vienen en la app.</p>' +
        opciones + lista +
        (c.cliente === false
          ? '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-preaprobacion"' +
              (documentosListos() ? '' : ' disabled') + '>Ver mi preaprobación</button></div>'
          : '') +
        '<div class="acciones"><button type="button" class="enlace" id="btn-volver-datos">Volver a mis datos</button></div>' +
      '</section>';

    $('btn-soy-cliente').addEventListener('click', function () {
      conCarga($('btn-soy-cliente'), function () {
        guardarCompra(Object.assign({}, estado.compra, { cliente: true, subpaso: 'resultado' }));
        renderMiCompra();
        window.scrollTo(0, 0);
        anunciar('Listo. Esta es tu preaprobación.');
      });
    });
    $('btn-subir-docs').addEventListener('click', function () {
      guardarCompra(Object.assign({}, estado.compra, { cliente: false }));
      renderDocumentos(p);
      var primero = document.querySelector('.btn-subir');
      if (primero) primero.focus();
    });
    $('btn-volver-datos').addEventListener('click', function () {
      guardarSubpaso('datos');
      renderMiCompra();
    });
    document.querySelectorAll('.btn-subir').forEach(function (boton) {
      boton.addEventListener('click', function () { abrirHoja(p, boton); });
    });
    var ver = $('btn-ver-preaprobacion');
    if (ver) {
      ver.addEventListener('click', function () {
        if (!documentosListos()) return;
        conCarga(ver, function () {
          guardarSubpaso('resultado');
          renderMiCompra();
          window.scrollTo(0, 0);
          anunciar('Esta es tu preaprobación.');
        });
      });
    }
  }

  // Hoja con los archivos de ejemplo de un documento.
  function abrirHoja(p, boton) {
    var id = boton.dataset.doc;
    var x = DOCUMENTOS.filter(function (k) { return k.id === id; })[0];
    var hoja = $('hoja-' + id);
    var abierta = boton.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.hoja-archivos').forEach(function (h) { h.hidden = true; h.innerHTML = ''; });
    document.querySelectorAll('.btn-subir').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (abierta) return;
    hoja.innerHTML = '<p class="hoja-titulo">Elige un archivo de ejemplo</p>' +
      '<ul class="archivos">' + x.archivos.map(function (nombre) {
        return '<li><button type="button" class="archivo" data-archivo="' + esc(nombre) + '">' + miniaturaDoc(nombre) +
          '<span class="archivo-nombre">' + esc(nombre) + '</span></button></li>';
      }).join('') + '</ul>';
    hoja.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    hoja.querySelector('.archivo').focus();
    hoja.querySelectorAll('.archivo').forEach(function (a) {
      a.addEventListener('click', function () {
        var nombre = a.dataset.archivo;
        hoja.innerHTML = '<p class="subiendo" role="status">Subiendo ' + esc(nombre) + '…</p>' +
          '<div class="barra-subida" aria-hidden="true"><span></span></div>';
        setTimeout(function () {
          if (!estado.compra || subpasoPostula() !== 'documentos') return;
          var docs = Object.assign({}, estado.compra.documentos || {});
          docs[id] = nombre;
          guardarCompra(Object.assign({}, estado.compra, { documentos: docs }));
          renderDocumentos(p);
          if (documentosListos()) {
            $('btn-ver-preaprobacion').focus();
            anunciar('Subiste todos tus documentos. Ya puedes ver tu preaprobación.');
          } else {
            var siguiente = document.querySelector('.documento:not(.listo) .btn-subir');
            if (siguiente) siguiente.focus();
            anunciar(x.nombre + ': listo.');
          }
        }, ESPERA_CARGA + 300);
      });
    });
  }

  // ---------- Resultado de la preaprobación (S8-F4) ----------
  function renderResultadoPreaprobacion(p) {
    var e = resumen(p).escenario;
    var r = preaprobacion(estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);
    var creditoNecesario = e.precioUF * e.pctCredito;
    var cuerpo;
    var puedeSeguir = false;

    if (!r) {
      cuerpo = '<p class="sin-numero">Faltan tus sueldos para calcular la preaprobación.</p>';
    } else if (!r.cumple) {
      var queCambiar = r.motivo === 'renta'
        ? 'Con un sueldo propio bajo ' + formatoPesos(ufAPesos(23)) + ', el banco pide sumar la renta de tu pareja: entre los dos al menos ' +
          formatoPesos(ufAPesos(39)) + ', y tu pareja al menos ' + formatoPesos(ufAPesos(16)) + '.'
        : 'Tus otras cuotas (' + formatoPesos(estado.otrasCuotas || 0) + ') ya ocupan casi todo el 30 % de su ingreso. Terminar una de ellas libera espacio para el dividendo.';
      cuerpo =
        '<div class="tarjeta semaforo semaforo-limite">' +
          '<p class="etiqueta">Preaprobación (simulada)</p>' +
          '<p class="estado-semaforo"><svg aria-hidden="true"><use href="#i-alerta"/></svg>Todavía no</p>' +
          '<p class="texto-apoyo">' + queCambiar + '</p>' +
        '</div>';
    } else {
      puedeSeguir = true;
      var alcanza = r.creditoUF >= creditoNecesario - 1e-9;
      cuerpo =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">Preaprobado (simulado) hasta</p>' +
          '<strong class="numero display-2">' + formatoUF(r.creditoUF) + '</strong>' +
          '<p class="texto-apoyo">de crédito. Dividendo de hasta <strong>' + formatoPesos(r.dividendo) + '</strong> al mes, con subsidio a la tasa.</p>' +
        '</div>' +
        '<p class="' + (alcanza ? 'aviso aviso-ok' : 'aviso') + ' bloque">' + (alcanza
          ? 'Tu departamento en ' + esc(p.nombre) + ' necesita ' + formatoUF(creditoNecesario) + ' de crédito: te alcanza.'
          : 'Tu departamento en ' + esc(p.nombre) + ' necesita ' + formatoUF(creditoNecesario) + ' de crédito: es más de lo preaprobado. Revisa un departamento más barato.') + '</p>';
      puedeSeguir = alcanza;
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Dividendo al mes', e.totalMes) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-resultado">' +
        '<h2 class="h3" id="titulo-resultado">Tu preaprobación</h2>' +
        partesPostula('Resultado') +
        cuerpo +
        '<section class="tarjeta bloque" aria-labelledby="titulo-falta">' +
          '<h3 class="h5" id="titulo-falta">La aprobación final depende del departamento</h3>' +
          '<p class="texto-apoyo">La aprobación final depende de la tasación y del estudio de títulos del departamento. Lo que falta:</p>' +
          '<ol class="lista-numerada"><li>Tasación: el banco confirma que el precio calza con el mercado.</li>' +
            '<li>Estudio de títulos: sus abogados revisan que el departamento no tenga problemas legales.</li>' +
            '<li>Escritura: firmas y el departamento queda a tu nombre.</li></ol>' +
        '</section>' +
        (puedeSeguir
          ? '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-seguir-pie">Seguir a Tu pie</button></div>'
          : '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div>') +
        '<div class="acciones"><button type="button" class="enlace" id="btn-editar-datos">Editar mis datos</button></div>' +
      '</section>';

    var seguir = $('btn-seguir-pie');
    if (seguir) {
      seguir.addEventListener('click', function () {
        conCarga(seguir, function () {
          guardarCompra(Object.assign({}, estado.compra, { paso: pasoTrasPostular(e.alEscriturar) }));
          renderMisProyectos();
          window.scrollTo(0, 0);
          anunciar('Preaprobación lista. Sigue Tu pie.');
        });
      });
    }
    $('btn-editar-datos').addEventListener('click', function () {
      guardarSubpaso('datos');
      renderMiCompra();
    });
  }

  // ---------- Paso 2: Tu pie (S4-F2, S4-F3 y S4-F4) ----------
  var TIPOS_AHORRO = {
    propio: 'Ahorras solo, en tu propia cuenta.',
    grupal: 'Ahorras junto a un grupo con una meta común, para motivarse. Cada persona junta su propio pie ' +
      'y retira exactamente lo que aportó: nadie aporta por otro ni queda debiendo.'
  };

  // Barra de avance con hitos al 25\u00a0%, 50\u00a0%, 75\u00a0% y 100\u00a0%.
  function barraHitos(ahorrado, meta) {
    var pct = porcentajeEntero(avance(ahorrado, meta));
    var logrados = hitosAlcanzados(ahorrado, meta);
    var marcas = HITOS_AHORRO.map(function (h) {
      var ok = logrados.indexOf(h) !== -1;
      return '<li class="hito hito-' + porcentajeEntero(h) + (ok ? ' logrado' : '') + '">' +
        '<span class="hito-punto" aria-hidden="true">' + (ok ? '<svg><use href="#i-ok"/></svg>' : '') + '</span>' +
        '<span class="hito-texto">' + porcentajeEntero(h) + NBSP + '%' +
        '<span class="oculto-visual">' + (ok ? ', logrado' : ', pendiente') + '</span></span></li>';
    }).join('');
    return '<div class="hitos">' +
      '<p class="avance-texto"><span>Llevas ' + formatoPesos(ahorrado) + ' de ' + formatoPesos(meta) + '</span>' +
        '<strong>' + pct + NBSP + '%</strong></p>' +
      '<div class="avance-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Avance de tu ahorro">' +
        '<span style="width:' + pct + '%"></span></div>' +
      '<ol class="hitos-marcas" aria-label="Hitos">' + marcas + '</ol>' +
    '</div>';
  }

  function selectorAhorro() {
    var opcion = function (valor, texto) {
      return '<input type="radio" name="tipo-ahorro" id="ahorro-' + valor + '" value="' + valor + '"' +
        (estado.tipoAhorro === valor ? ' checked' : '') + '><label for="ahorro-' + valor + '">' + texto + '</label>';
    };
    return '<fieldset class="selector"><legend class="oculto-visual">¿Cómo vas a ahorrar?</legend>' +
      '<div class="selector-opciones">' + opcion('propio', 'Ahorro propio') + opcion('grupal', 'Ahorro grupal') + '</div>' +
      '</fieldset>' +
      '<p class="texto-apoyo explica-ahorro" id="explica-ahorro" aria-live="polite">' + TIPOS_AHORRO[estado.tipoAhorro] + '</p>';
  }

  function textoMeses(n) { return n === 1 ? '1 mes' : n + ' meses'; }

  function renderTu5(p, d) {
    var meta = resumen(p).escenario.alEscriturar;
    // Si ya se juntó todo (por ejemplo, al cambiar a un proyecto más barato), se pasa a la firma.
    var pctPie = estado.modo === 'vivir' ? '10' : '5';
    var cabecera = tarjetaCompacta(p, 'Meta al escriturar', meta) + listaPasos(2) +
      '<h2 class="h3 bloque" id="titulo-tu5">Tu pie <span class="texto-apoyo titulo-apoyo">' + pctPie + '\u00a0% más gastos, lo juntas tú</span> ' + ayuda('pie') + '</h2>';

    if (!estado.ahorroIniciado) {
      $('panel-compra').innerHTML = cabecera +
        '<section aria-labelledby="titulo-tu5">' +
          selectorAhorro() +
          campoDinero('ahorro-mensual', '¿Cuánto puedes ahorrar al mes?', estado.ahorroMensual) +
          '<div id="meses-resultado" aria-live="polite"></div>' +
          '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-empezar">Empezar a ahorrar</button></div>' +
            '<div class="acciones">' +
            '<button type="button" class="btn btn-terciario btn-bloque" id="btn-salir">Salir de esta compra</button>' +
          '</div>' +
        '</section>';

      var tocado = false;
      var dibujarMeses = function () {
        var ok = validarMonto($('ahorro-mensual'), estado.ahorroMensual, tocado,
          'Escribe cuánto puedes ahorrar al mes.', 'El ahorro tiene que ser mayor a $0.');
        $('btn-empezar').disabled = !ok;
        if (!ok) {
          $('meses-resultado').innerHTML = '<p class="texto-apoyo">Escribe tu ahorro mensual para ver en cuántos meses llegas.</p>';
          return;
        }
        var n = mesesRestantes(meta, estado.ahorrado, estado.ahorroMensual);
        $('meses-resultado').innerHTML =
          '<div class="tarjeta resultado-meses">' +
            '<p class="etiqueta">Llegas a tu meta en</p>' +
            '<strong class="numero display-2">' + textoMeses(n) + '</strong>' +
            '<p class="texto-apoyo">Juntas ' + formatoPesos(meta) + ' ahorrando ' + formatoPesos(estado.ahorroMensual) + ' al mes.</p>' +
            barraHitos(estado.ahorrado, meta) +
          '</div>';
      };

      document.querySelectorAll('input[name="tipo-ahorro"]').forEach(function (r) {
        r.addEventListener('change', function () {
          estado.tipoAhorro = r.value;
          guardarEstado();
          $('explica-ahorro').textContent = TIPOS_AHORRO[estado.tipoAhorro];
        });
      });
      var habiaMeses = estado.ahorroMensual > 0;
      $('ahorro-mensual').addEventListener('input', function () {
        estado.ahorroMensual = formatearCampo($('ahorro-mensual'));
        guardarEstado();
        dibujarMeses();
        var hayMeses = estado.ahorroMensual > 0;
        if (hayMeses && !habiaMeses) $('meses-resultado').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        habiaMeses = hayMeses;
      });
      $('ahorro-mensual').addEventListener('blur', function () { tocado = true; dibujarMeses(); });
      $('btn-empezar').addEventListener('click', function () {
        tocado = true;
        dibujarMeses();
        if ($('btn-empezar').disabled) { $('ahorro-mensual').focus(); return; }
        estado.ahorroIniciado = true;
        guardarEstado();
        renderMiCompra();
        window.scrollTo(0, 0);
      });
      $('btn-salir').addEventListener('click', salirDeCompra);
      dibujarMeses();
      return;
    }

    // Ya empezó a ahorrar: el número es lo que falta, y la acción es simular un mes.
    var faltan = mesesRestantes(meta, estado.ahorrado, estado.ahorroMensual);
    $('panel-compra').innerHTML = cabecera +
      '<section aria-labelledby="titulo-tu5">' +
        '<div class="tarjeta resultado-meses">' +
          '<p class="etiqueta">Te faltan</p>' +
          '<strong class="numero display-2">' + textoMeses(faltan) + '</strong>' +
          '<p class="texto-apoyo">' + (estado.tipoAhorro === 'grupal' ? 'Ahorro grupal' : 'Ahorro propio') +
            ' de ' + formatoPesos(estado.ahorroMensual) + ' al mes.</p>' +
          barraHitos(estado.ahorrado, meta) +
          '<p class="aviso aviso-ok" id="aviso-hito" hidden></p>' +
        '</div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-simular-mes">Simular un mes</button></div>' +
          '<div class="acciones">' +
          '<p class="texto-apoyo">Es una simulación: suma tu ahorro de un mes al avance.</p>' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-cambiar-ahorro">Cambiar mi ahorro mensual</button>' +
        '</div>' +
      '</section>';

    $('btn-simular-mes').addEventListener('click', function () {
      var antes = hitosAlcanzados(estado.ahorrado, meta);
      estado.ahorrado = sumarMes(estado.ahorrado, estado.ahorroMensual, meta);
      guardarEstado();
      if (estado.ahorrado >= meta) {
        guardarCompra(Object.assign({}, estado.compra, { paso: 3 }));
        renderFirma(p, d, true);
        window.scrollTo(0, 0);
        return;
      }
      var nuevos = hitosAlcanzados(estado.ahorrado, meta).filter(function (h) { return antes.indexOf(h) === -1; });
      renderTu5(p, d);
      var faltanAhora = mesesRestantes(meta, estado.ahorrado, estado.ahorroMensual);
      var mensaje = 'Sumaste un mes. Te faltan ' + textoMeses(faltanAhora) + '.';
      if (nuevos.length) {
        $('aviso-hito').textContent = '¡Llegaste al ' + porcentajeEntero(nuevos[nuevos.length - 1]) + '\u00a0% de tu meta! Sigue así.';
        $('aviso-hito').hidden = false;
        mensaje = $('aviso-hito').textContent + ' ' + mensaje;
      }
      anunciar(mensaje);
      $('btn-simular-mes').focus();
    });
    $('btn-cambiar-ahorro').addEventListener('click', function () {
      estado.ahorroIniciado = false;
      guardarEstado();
      renderMiCompra();
    });
  }

  // ---------- Paso 3: Firma (S4-F5) ----------
  function renderFirma(p, d, recienLlegado) {
    var e = resumen(p).escenario;
    var arrendar = estado.modo === 'arrendar';
    var credito = filaFirma('Crédito hipotecario Bci ' + ayuda('dividendo'),
      'Bci presta el ' + Math.round(e.pctCredito * 100) + ' % (' + formatoPesos(e.reparto.bci) + ') a 30 años, al 3,9 % con subsidio a la tasa. ' +
      'Lo pagan tú y tu pareja: ' + formatoPesos(e.dividendo) + ' al mes, con seguros.');
    var segunda = arrendar
      ? filaFirma('Participación de los inversionistas ' + ayuda('participacion'),
          'Ellos ponen el 15 % (' + formatoPesos(e.reparto.inversionistas) + '). No te cobran cuota: el arriendo les paga una renta de 6 % al año en UF y te recompra su parte. Si vendes, cada uno recibe según su parte.') +
        filaFirma('Cuenta custodia Bci ' + ayuda('cuenta-custodia'),
          'El arriendo entra a una cuenta de Bci que paga la renta de los inversionistas y recompra su parte. Tú pagas el dividendo.')
      : filaFirma('Garantía del Estado (FOGAES)',
          'El Estado garantiza parte del crédito para que tu pie sea de 10 %. Es para tu primera vivienda y se usa una sola vez.');

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pones al escriturar', e.alEscriturar) + listaPasos(3) +
      '<div class="logro bloque"' + (recienLlegado ? ' role="status"' : '') + '>' +
        '<svg aria-hidden="true"><use href="#i-ok"/></svg>' +
        '<p><strong>¡Juntaste tu pie!</strong> Ya tienes ' + formatoPesos(e.alEscriturar) + ' para escriturar.</p>' +
      '</div>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-firma">' +
        '<h2 class="h3" id="titulo-firma">Lo que firmas</h2>' +
        '<ul class="lista-check">' + credito + segunda + '</ul>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-firmar">Firmar</button></div>' +
        '<div class="acciones">' +
        '<p class="texto-apoyo">Es una firma simulada: en este prototipo no se firma nada real.</p>' +
      '</div>';

    $('btn-firmar').addEventListener('click', function () {
      conCarga($('btn-firmar'), function () {
        // El ahorro se usó para escriturar: queda en cero.
        estado.ahorrado = 0;
        estado.ahorroIniciado = false;
        guardarEstado();
        guardarCompra(Object.assign({}, estado.compra, {
          paso: 4, mes: 1, arriendoMes: d.arriendoBruto, saldoParticipacionUF: e.participacionUF, fraccion: 1
        }));
        renderMiCompra();
        window.scrollTo(0, 0);
        anunciar('¡Firmaste! Ahora ves Mi departamento.');
      });
    });
  }

  function filaFirma(titulo, texto) {
    return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + titulo + '<small>' + texto + '</small></span></li>';
  }

  // ---------- Después de firmar: Mi departamento (S5-F2 a S5-F5) ----------

  // Los números del mes actual, todos desde calculos.js.
  // En modo arrendar, la compra guarda lo que aún es de los inversionistas (saldoParticipacionUF):
  // cada mes simulado se descuenta lo que se recompró ese mes.
  function mesDelDepartamento(p, d) {
    var e = resumen(p).escenario;
    var c = estado.compra;
    var mes = c.mes || 1;
    var arriendo = c.arriendoMes === undefined || c.arriendoMes === null ? d.arriendoBruto : c.arriendoMes;
    var arrendar = estado.modo === 'arrendar';
    var saldo = arrendar ? (typeof c.saldoParticipacionUF === 'number' ? c.saldoParticipacionUF : e.participacionUF) : 0;
    var fraccion = c.fraccion === 0.8 ? 0.8 : 1;
    var cascada = cascadaMes(e.dividendo, saldo, arriendo, fraccion);
    var netoUF = arriendoNeto(arriendo) / SUPUESTOS.uf;
    return {
      e: e,
      mes: mes,
      arriendo: arriendo,
      cascada: cascada,
      fraccion: fraccion,
      saldoParticipacionUF: saldo,
      porcentajeTuyo: Math.floor(100 * (1 - saldo / e.precioUF) + 1e-9),
      faltanRecompra: saldo > 0 ? mesesRecompra(saldo, netoUF, fraccion) : 0,
      pone: arrendar ? cascada.pone : e.totalMes,
      excedente: arrendar ? cascada.excedente : 0,
      saldoBci: ufAPesos(saldoBciUF(e.precioUF, mes, estado.modo)),
      avanceBci: avance(mes, SUPUESTOS.mesesBci)
    };
  }

  function pasoCascada(n, texto, detalle, monto, clase) {
    return '<li class="' + (clase || '') + '"><span class="cascada-num" aria-hidden="true">' + n + '</span>' +
      '<span class="cascada-texto">' + texto + (detalle ? '<small>' + detalle + '</small>' : '') + '</span>' +
      '<span class="cascada-monto">' + monto + '</span></li>';
  }

  function barraDeuda(titulo, mes, total, saldo, fraccion) {
    var pct = porcentajeEntero(fraccion);
    return '<div class="deuda">' +
      '<p class="avance-texto"><span><strong>' + titulo + '</strong></span><span>Mes ' + mes + ' de ' + total + '</span></p>' +
      '<div class="avance-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + esc(titulo) + '">' +
        '<span style="width:' + Math.max(pct, 1) + '%"></span></div>' +
      '<p class="cierre">Te queda por pagar ' + formatoPesos(saldo) + '</p>' +
    '</div>';
  }

  // Cuánto del departamento ya es tuyo (modo arrendar): la parte de los inversionistas se recompra con el arriendo.
  function barraParticipacion(m) {
    var pct = Math.max(0, Math.min(100, m.porcentajeTuyo));
    var faltan = m.faltanRecompra === null ? 'El arriendo de hoy no alcanza para recomprar: revisa el arriendo.'
      : (m.faltanRecompra > 0 ? 'Te faltan ' + textoMeses(m.faltanRecompra) + ' para que sea 100 % tuyo.' : 'Ya es 100 % tuyo.');
    return '<div class="deuda">' +
      '<p class="avance-texto"><span><strong>Ya es tuyo</strong></span><span>' + pct + ' %</span></p>' +
      '<div class="avance-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Parte del departamento que ya es tuya">' +
        '<span style="width:' + Math.max(pct, 1) + '%"></span></div>' +
      '<p class="cierre">Parte de los inversionistas: ' + formatoPesos(ufAPesos(m.saldoParticipacionUF)) + '. ' + faltan + '</p>' +
    '</div>';
  }

  function renderMiDepartamento(p, d) {
    var m = mesDelDepartamento(p, d);
    var c = m.cascada;
    var arrendar = estado.modo === 'arrendar';
    var conParticipacion = arrendar && m.saldoParticipacionUF > 1e-9;
    var cuerpo;

    if (arrendar) {
      var pasos = conParticipacion
        ? pasoCascada(3, 'Renta de los inversionistas', '6 % al año sobre la parte que aún es de ellos.', formatoPesos(c.renta)) +
          pasoCascada(4, 'Recompras su parte', 'Con el resto del arriendo, el departamento es un poco más tuyo.', formatoPesos(c.recompra)) +
          (m.fraccion < 1 ? pasoCascada(5, 'Te ayuda con el dividendo', 'El 20 % del arriendo neto que elegiste dejar para ti.', formatoPesos(c.aUsuario)) : '') +
          pasoCascada(m.fraccion < 1 ? 6 : 5, 'Pagas tu dividendo', 'Con tu sueldo' + (m.fraccion < 1 ? ', menos lo que te dejó el arriendo.' : '.'), formatoPesos(m.pone), 'cascada-final')
        : pasoCascada(3, 'Va a tu dividendo', 'El departamento ya es 100 % tuyo.', formatoPesos(c.aUsuario)) +
          (m.excedente > 0
            ? pasoCascada(4, 'Te sobra', null, formatoPesos(m.excedente), 'cascada-final')
            : pasoCascada(4, 'Tú completas el dividendo', null, formatoPesos(m.pone), 'cascada-final'));
      cuerpo =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">' + (m.excedente > 0 ? 'Este mes te sobraron' : 'Este mes pusiste') + '</p>' +
          '<strong class="numero display-3">' + formatoPesos(m.excedente > 0 ? m.excedente : m.pone) + '</strong>' +
          '<p class="texto-apoyo">' + (conParticipacion
            ? 'Pagaste tu dividendo. El arriendo fue a los inversionistas: ' + formatoPesos(c.renta) + ' de renta y ' +
              formatoPesos(c.recompra) + ' para recomprar su parte.'
            : (m.excedente > 0 ? 'El arriendo alcanzó para todo el dividendo.' : 'El arriendo cubrió ' + formatoPesos(c.aUsuario) + ' del dividendo.')) + '</p>' +
        '</div>' +
        campoDinero('arriendo-mes', 'Arriendo que entró este mes', m.arriendo) +
        (conParticipacion
          ? '<fieldset class="selector"><legend>¿Cuánto del arriendo va a la recompra?</legend><div class="selector-opciones">' +
              '<input type="radio" name="fraccion" id="fraccion-100" value="1"' + (m.fraccion === 1 ? ' checked' : '') + '><label for="fraccion-100">100 %</label>' +
              '<input type="radio" name="fraccion" id="fraccion-80" value="0.8"' + (m.fraccion === 0.8 ? ' checked' : '') + '><label for="fraccion-80">80 %</label>' +
            '</div></fieldset>' +
            '<p class="texto-apoyo">Con 80 %, el otro 20 % te ayuda con el dividendo y la recompra toma más meses.</p>'
          : '') +
        '<section class="tarjeta bloque" aria-labelledby="titulo-cascada">' +
          '<h2 class="h4" id="titulo-cascada">Cómo se movió tu dinero</h2>' +
          '<p class="texto-apoyo">En la cuenta custodia de Bci, en este orden: ' + ayuda('cuenta-custodia') + '</p>' +
          '<ol class="cascada">' +
            pasoCascada(1, 'Entra el arriendo', null, formatoPesos(c.bruto)) +
            pasoCascada(2, 'Se descuentan administración y el mes vacío',
              'Administración (10 %): ' + formatoPesos(c.administracion) + '. Un mes vacío al año, por mes: ' + formatoPesos(c.vacancia) + '.',
              '−' + formatoPesos(c.administracion + c.vacancia)) +
            pasos +
          '</ol>' +
        '</section>';
    } else {
      // S5-F3: modo vivir, comparado con el arriendo que pagaba.
      var antes = estado.arriendoActual;
      var comparacion = '';
      if (antes !== null && antes !== undefined) {
        var dif = m.e.totalMes - antes;
        comparacion = '<p class="comparacion">' + (dif > 0
          ? 'Antes pagabas ' + formatoPesos(antes) + ' de arriendo: ahora pagas <strong>' + formatoPesos(dif) + ' más</strong> al mes, pero en algo que es tuyo.'
          : (dif < 0
            ? 'Antes pagabas ' + formatoPesos(antes) + ' de arriendo: ahora pagas <strong>' + formatoPesos(-dif) + ' menos</strong> al mes.'
            : 'Pagas lo mismo que antes de arriendo, pero en algo que es tuyo.')) + '</p>';
      }
      cuerpo =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">Este mes pagaste</p>' +
          '<strong class="numero display-3">' + formatoPesos(m.e.totalMes) + '</strong>' +
          '<p class="texto-apoyo">Tu dividendo, con subsidio a la tasa y seguros.</p>' +
          comparacion +
        '</div>' +
        campoDinero('arriendo-antes', 'Lo que pagabas de arriendo', antes);
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Dividendo al mes', m.e.totalMes) + listaPasos(4) +
      '<h2 class="h3 bloque" id="titulo-departamento">Mi departamento <span class="texto-apoyo titulo-apoyo">mes ' + m.mes + ' desde que firmaste</span></h2>' +
      cuerpo +
      '<section class="tarjeta bloque" aria-labelledby="titulo-deudas">' +
        '<h2 class="h4" id="titulo-deudas">Tu avance</h2>' +
        (arrendar ? barraParticipacion(m) : '') +
        barraDeuda('Crédito Bci (30 años)', m.mes, SUPUESTOS.mesesBci, m.saldoBci, m.avanceBci) +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      '<div class="acciones">' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-otro-mes">Simular otro mes</button>' +
        '<p class="texto-apoyo">Es una simulación: suma un mes de dividendo' + (conParticipacion ? ' y de recompra' : '') + '.</p>' +
      '</div>';

    if (arrendar) {
      $('arriendo-mes').addEventListener('change', function () {
        var monto = formatearCampo($('arriendo-mes'));
        guardarCompra(Object.assign({}, estado.compra, { arriendoMes: monto === null ? 0 : monto }));
        renderMiCompra();
        $('arriendo-mes').focus();
      });
      $('arriendo-mes').addEventListener('input', function () { formatearCampo($('arriendo-mes')); });
      document.querySelectorAll('input[name="fraccion"]').forEach(function (r) {
        r.addEventListener('change', function () {
          guardarCompra(Object.assign({}, estado.compra, { fraccion: Number(r.value) }));
          renderMiCompra();
          $(r.id).focus();
        });
      });
    } else {
      $('arriendo-antes').addEventListener('change', function () {
        estado.arriendoActual = formatearCampo($('arriendo-antes'));
        guardarEstado();
        renderMiCompra();
        $('arriendo-antes').focus();
      });
      $('arriendo-antes').addEventListener('input', function () { formatearCampo($('arriendo-antes')); });
    }
    $('btn-otro-mes').addEventListener('click', function () {
      guardarCompra(Object.assign({}, estado.compra, {
        mes: Math.min(SUPUESTOS.mesesBci, m.mes + 1),
        saldoParticipacionUF: arrendar ? c.saldoDespuesUF : 0
      }));
      renderMiCompra();
      var nuevo = mesDelDepartamento(p, d);
      anunciar('Mes ' + nuevo.mes + '. ' + (arrendar ? 'Ya es tuyo el ' + nuevo.porcentajeTuyo + ' % del departamento.' : 'Pagaste tu dividendo.'));
      $('btn-otro-mes').focus();
    });
  }

  // Versión corta para los pasos: nombre del proyecto (enlace) y una cifra, en una fila.
  function tarjetaCompacta(p, etiqueta, pesos) {
    return '<div class="tarjeta compacta">' +
      '<a class="enlace" href="#proyecto/' + esc(p.id) + '">' + esc(p.nombre) + '</a>' +
      '<p class="compacta-cifra"><span>' + etiqueta + '</span><strong>' + formatoPesos(pesos) + '</strong></p>' +
    '</div>';
  }

  function salirDeCompra() {
    guardarCompra(null);
    renderMisProyectos();
  }

  // En qué paso está la compra, sin guardar nada (lo usan Mi compra e Inicio).
  // Sin postulación guardada se vuelve a Postula; con la meta ya juntada se pasa a la firma.
  function pasoEfectivo() {
    var c = estado.compra;
    var paso = c.paso || 1;
    if (paso >= 2 && paso < 4 && !c.carga) return 1;
    if (paso === 2 && estado.ahorroIniciado &&
        estado.ahorrado >= resumen(buscarProyecto(c.proyectoId)).escenario.alEscriturar) return 3;
    return paso;
  }

  // Después de postular: va a Tu pie, o directo a la firma si el ahorro ya alcanza la meta.
  function pasoTrasPostular(meta) {
    return estado.ahorroIniciado && estado.ahorrado >= meta ? 3 : 2;
  }

  function renderMiCompra() {
    var p = buscarProyecto(estado.compra.proyectoId);
    var d = departamentoDeMiCompra(p);
    var paso = pasoEfectivo();
    if (paso === 4) renderMiDepartamento(p, d);
    else if (paso === 3) renderFirma(p, d, estado.compra.paso === 2);
    else if (paso === 2) renderTu5(p, d);
    else renderPostula(p, d);
  }

  function renderMisProyectos() {
    var tieneCompra = !!estado.compra;
    var tieneInversiones = estado.inversiones.length > 0;
    var tieneAlgo = tieneCompra || tieneInversiones;

    $('mis-vacio').hidden = tieneAlgo;
    $('mis-contenido').hidden = !tieneAlgo;
    if (!tieneAlgo) return;

    if (!estado.pestanaMis) estado.pestanaMis = tieneCompra ? 'compra' : 'inversiones';
    document.querySelectorAll('[data-mis]').forEach(function (tab) {
      var activa = tab.dataset.mis === estado.pestanaMis;
      tab.setAttribute('aria-selected', String(activa));
      tab.tabIndex = activa ? 0 : -1;
    });
    $('panel-compra').hidden = estado.pestanaMis !== 'compra';
    $('panel-inversiones').hidden = estado.pestanaMis !== 'inversiones';

    renderMisInversiones();
    if (tieneCompra) renderMiCompra();
    else $('panel-compra').innerHTML = '<div class="vacio"><h2 class="h3">Aún no tienes una compra</h2>' +
      '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div></div>';
  }

  function iniciarMisProyectos() {
    document.querySelectorAll('[data-mis]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        estado.pestanaMis = tab.dataset.mis;
        renderMisProyectos();
      });
      tab.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
        estado.pestanaMis = estado.pestanaMis === 'compra' ? 'inversiones' : 'compra';
        renderMisProyectos();
        $('tab-' + estado.pestanaMis).focus();
      });
    });
  }

  // ---------- Perfil (S3-F5) ----------
  function renderPerfil() {
    var opcion = function (valor, texto) {
      return '<input type="radio" name="perfil-modo" id="perfil-' + valor + '" value="' + valor + '"' +
        (estado.modo === valor ? ' checked' : '') + '><label for="perfil-' + valor + '">' + texto + '</label>';
    };
    $('perfil-contenido').innerHTML =
      '<form id="form-perfil" novalidate>' +
        '<fieldset class="selector"><legend>¿Para qué quieres el departamento?</legend>' +
          '<div class="selector-opciones">' + opcion('arrendar', 'Para arrendar') + opcion('vivir', 'Para vivir') + '</div>' +
        '</fieldset>' +
        campoDinero('perfil-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
        campoDinero('perfil-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
        campoDinero('perfil-arriendo', 'Lo que pagas hoy de arriendo', estado.arriendoActual) +
        '<p class="texto-apoyo ayuda-campo">Opcional. Sirve para comparar lo que pagarías si lo compras para vivir.</p>' +
        '<div class="acciones">' +
          '<button type="submit" class="btn btn-primario btn-lg btn-bloque">Guardar cambios</button>' +
          '<p class="aviso aviso-ok" id="perfil-guardado" aria-live="polite" hidden></p>' +
        '</div>' +
      '</form>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-ayuda">' +
        '<h2 class="h4" id="titulo-ayuda">Ayuda</h2>' +
        '<p class="texto-apoyo">Las palabras de la app, en una frase.</p>' +
        glosarioCompleto() +
        '<a class="enlace" href="#bienvenida">Ver de nuevo la introducción</a>' +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-reinicio">' +
        '<h2 class="h4" id="titulo-reinicio">Empezar de nuevo</h2>' +
        '<p class="texto-apoyo">Borra tu compra, tus inversiones y tus datos de este teléfono, y vuelve al inicio.</p>' +
        '<div class="acciones">' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-reiniciar" aria-expanded="false" aria-controls="confirmar-reinicio">Empezar de nuevo</button>' +
          '<div id="confirmar-reinicio" class="confirmar" hidden>' +
            '<p><strong>¿Seguro?</strong> Esto no se puede deshacer.</p>' +
            '<button type="button" class="btn btn-peligro btn-bloque" id="btn-reiniciar-si">Sí, borrar todo</button>' +
            '<button type="button" class="enlace" id="btn-reiniciar-no">Cancelar</button>' +
          '</div>' +
        '</div>' +
      '</section>';

    ['perfil-propio', 'perfil-pareja', 'perfil-arriendo'].forEach(function (id) {
      $(id).addEventListener('input', function () {
        formatearCampo($(id));
        $('perfil-guardado').hidden = true;
      });
    });

    $('form-perfil').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var propio = leerMonto($('perfil-propio').value);
      var pareja = leerMonto($('perfil-pareja').value);
      var arriendo = leerMonto($('perfil-arriendo').value);
      // Los sueldos pueden quedar vacíos, pero no en $0. El arriendo puede ser $0.
      var okPropio = validarSueldo($('perfil-propio'), propio, false);
      var okPareja = validarSueldo($('perfil-pareja'), pareja, false);
      if ((!okPropio && propio !== null) || (!okPareja && pareja !== null)) {
        (propio === 0 ? $('perfil-propio') : $('perfil-pareja')).focus();
        return;
      }
      estado.modo = document.querySelector('input[name="perfil-modo"]:checked').value;
      estado.sueldoPropio = propio;
      estado.sueldoPareja = pareja;
      estado.arriendoActual = arriendo;
      guardarEstado();
      recalcularPostulacion();
      $('perfil-guardado').textContent = 'Cambios guardados. Todo se recalculó con tus datos nuevos.';
      $('perfil-guardado').hidden = false;
    });

    var confirmar = $('confirmar-reinicio');
    $('btn-reiniciar').addEventListener('click', function () {
      confirmar.hidden = false;
      $('btn-reiniciar').setAttribute('aria-expanded', 'true');
      $('btn-reiniciar-si').focus();
    });
    $('btn-reiniciar-no').addEventListener('click', function () {
      confirmar.hidden = true;
      $('btn-reiniciar').setAttribute('aria-expanded', 'false');
      $('btn-reiniciar').focus();
    });
    $('btn-reiniciar-si').addEventListener('click', function () {
      borrarTodo();
      location.hash = '#inicio';
    });
  }

  // Si el usuario ya postuló y cambia sus sueldos, la carga guardada se vuelve a
  // calcular; si ya no le alcanza para postular, vuelve al paso 1.
  function recalcularPostulacion() {
    if (!estado.compra || (estado.compra.paso !== 2 && estado.compra.paso !== 3)) return;
    var p = buscarProyecto(estado.compra.proyectoId);
    var k = carga(resumen(p).escenario.totalMes, estado.sueldoPropio, estado.sueldoPareja);
    var nivel = nivelCarga(k);
    if (!nivel || nivel === 'no-aprueba') guardarCompra(Object.assign({}, estado.compra, { paso: 1, carga: null }));
    else guardarCompra(Object.assign({}, estado.compra, { carga: k }));
  }

  // ---------- Navegación ----------
  // Lee la dirección: "#proyecto/alto-nunoa" → { nombre: 'proyecto', param: 'alto-nunoa' }.
  function leerRuta() {
    var partes = location.hash.replace('#', '').split('/');
    var nombre = RUTAS[partes[0]] ? partes[0] : 'inicio';
    return { nombre: nombre, param: partes[1] ? decodeURIComponent(partes[1]) : null };
  }

  function mostrar() {
    var ruta = leerRuta();
    // S7-F6: la primera vez, antes de Inicio, se muestra la introducción.
    if (ruta.nombre === 'inicio' && !estado.introVista) {
      location.replace('#bienvenida');
      ruta = leerRuta();
    }
    var destino = RUTAS[ruta.nombre];
    document.body.classList.toggle('en-intro', destino.pantalla === 'intro');

    if (destino.pantalla === 'inicio') renderInicio();
    if (destino.pantalla === 'proyectos') renderProyectos();
    if (destino.pantalla === 'proyecto') renderDetalle(ruta.param);
    if (destino.pantalla === 'mis-proyectos') {
      estado.pestanaMis = ruta.param === 'inversiones' || ruta.param === 'compra' ? ruta.param : null;
      renderMisProyectos();
    }
    if (destino.pantalla === 'invertir') renderInvertir(ruta.param);
    if (destino.pantalla === 'perfil') renderPerfil();

    document.querySelectorAll('main > .pantalla').forEach(function (s) {
      s.hidden = s.id !== 'pantalla-' + destino.pantalla;
    });
    document.querySelectorAll('.barra a').forEach(function (a) {
      if (a.dataset.seccion === destino.seccion) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', mostrar);
  iniciarProyectos();
  iniciarMisProyectos();
  iniciarAyudas();
  iniciarIntro();
  estado.introVista = leerIntroVista() || !!estado.compra || estado.inversiones.length > 0;
  mostrar();
})();
