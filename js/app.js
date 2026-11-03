// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  // Ruta → pantalla que se muestra y botón de la barra que queda activo.
  var RUTAS = {
    'inicio': { pantalla: 'inicio', seccion: 'inicio' },
    'proyectos': { pantalla: 'proyectos', seccion: 'proyectos' },
    'proyecto': { pantalla: 'proyecto', seccion: 'proyectos' },
    'mis-proyectos': { pantalla: 'mis-proyectos', seccion: 'mis-proyectos' },
    'perfil': { pantalla: 'perfil', seccion: 'perfil' }
  };

  var CLAVE_COMPRA = 'primer-peldano-compra';

  var estado = {
    modo: 'arrendar',        // 'arrendar' o 'vivir'
    pestana: 'conjunto',     // pestaña de Proyectos: 'conjunto' o 'financiamiento'
    compra: leerCompra(),    // { proyectoId, departamentoId } o null
    pestanaMis: null,        // pestaña de Mis proyectos: 'compra' o 'inversiones'
    sueldoPropio: null,      // sueldo líquido del usuario, en pesos
    sueldoPareja: null,      // sueldo líquido de la pareja, en pesos
    arriendoActual: null,    // lo que paga hoy de arriendo, en pesos
    ahorroMensual: null,     // cuánto ahorra al mes para su 5\u00a0%
    tipoAhorro: 'propio',    // 'propio' o 'grupal'
    ahorrado: 0,             // lo que lleva juntado (simulado)
    ahorroIniciado: false,   // si ya tocó "Empezar a ahorrar"
    meAlcanza: false         // filtro "Me alcanza" de Proyectos
  };

  // ---------- Elecciones que se recuerdan entre visitas (S3-F3) ----------
  var CLAVE_ESTADO = 'primer-peldano-estado';
  var GUARDADOS = ['modo', 'sueldoPropio', 'sueldoPareja', 'arriendoActual',
    'ahorroMensual', 'tipoAhorro', 'ahorrado', 'ahorroIniciado'];
  var VALORES_POR_DEFECTO = { modo: 'arrendar', sueldoPropio: null, sueldoPareja: null, arriendoActual: null,
    ahorroMensual: null, tipoAhorro: 'propio', ahorrado: 0, ahorroIniciado: false, meAlcanza: false };

  function montoValido(n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? n : null; }

  // Lee lo guardado y descarta lo que no tenga sentido (por si el dato se dañó).
  function leerEstado() {
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE_ESTADO));
      if (!g || typeof g !== 'object') return;
      if (g.modo === 'arrendar' || g.modo === 'vivir') estado.modo = g.modo;
      estado.sueldoPropio = montoValido(g.sueldoPropio);
      estado.sueldoPareja = montoValido(g.sueldoPareja);
      estado.arriendoActual = montoValido(g.arriendoActual);
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
    } catch (e) { /* nada guardado */ }
    Object.keys(VALORES_POR_DEFECTO).forEach(function (k) { estado[k] = VALORES_POR_DEFECTO[k]; });
    estado.compra = null;
    estado.pestana = 'conjunto';
    estado.pestanaMis = null;
  }

  leerEstado();

  function $(id) { return document.getElementById(id); }

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

  // ---------- Textos de apoyo ----------
  // Espacio que no se corta: el número y su unidad quedan siempre juntos.
  var NBSP = '\u00a0';
  function plural(n, uno, varios) { return n + NBSP + (n === 1 ? uno : varios); }

  // Separador "·" con el mismo aire a ambos lados (en Overpass el punto queda cargado a un lado).
  var SEP = '<span class="sep" aria-hidden="true">·</span>';

  function ficha(d) {
    return plural(d.dormitorios, 'dormitorio', 'dormitorios') + SEP +
      plural(d.banos, 'baño', 'baños') + SEP + d.m2 + NBSP + 'm²';
  }

  var NOMBRE_TIPO = { conjunto: 'Compra en conjunto', financiamiento: 'Financiamiento del pie' };

  function cuposExtra(proyecto) {
    return estado.compra && estado.compra.proyectoId === proyecto.id ? 1 : 0;
  }

  function resumen(proyecto) {
    return resumenProyecto(proyecto, departamentosDe(proyecto.id), cuposExtra(proyecto));
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
    return barraAvance('15\u00a0% reunido con inversionistas', formatoPorcentaje(r.avanceFinanciamiento, 0), r.avanceFinanciamiento);
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
        accion: estado.ahorroIniciado ? 'Seguir ahorrando' : 'Ir a Tu 5\u00a0%'
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
      detalle: m.excedente > 0 ? 'El arriendo alcanzó para todo: no pusiste nada.'
        : (estado.modo === 'arrendar' ? 'El arriendo cubrió ' + formatoPesos(m.cascada.neto) + ' y tú completaste el resto.'
          : 'Dividendo más la cuota a los inversionistas.'),
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
        : 'Ya se reunió el ' + formatoPorcentaje(r.avanceFinanciamiento, 0) + ' de tu 15\u00a0% con inversionistas.'
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
      if (m.puedeAbonar) {
        avisos.push('Este mes te sobraron ' + formatoPesos(m.excedente) +
          ': conviene abonarlos a la deuda con inversionistas, que tiene la tasa más alta.');
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
    // Las inversiones (lo cobrado a la fecha) se agregan en el Sprint 6.
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
        '<h1 id="titulo-inicio" class="h2">Tu departamento con el 5\u00a0%</h1>' +
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
      r.addEventListener('change', function () { estado.modo = r.value; guardarEstado(); });
    });
    var habia = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja) !== null;
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
      if (capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja) === null) {
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
      ? capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja) : null;
    var resultado = $('capacidad-resultado');
    $('btn-me-alcanza').setAttribute('aria-disabled', String(cap === null));

    if (cap === null) {
      resultado.innerHTML = '<p class="sin-numero">Escribe los sueldos para saber cuánto puedes comprar.</p>';
      return false;
    }
    var e = escenario(cap, 'individual');
    resultado.innerHTML =
      '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Puedes comprar hasta</p>' +
        '<strong class="numero display-2">' + formatoUF(cap) + '</strong>' +
        '<p class="texto-apoyo">Es decir, ' + formatoPesos(e.precio) + ', poniendo <strong>' + formatoPesos(e.alEscriturar) +
          '</strong> al escriturar y <strong>' + formatoPesos(e.totalMes) + '</strong> al mes.</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
        '<button type="button" class="enlace desplegar" id="btn-reparto" aria-expanded="false" aria-controls="reparto">' +
          '¿De dónde sale el resto?<svg aria-hidden="true"><use href="#i-flecha"/></svg></button>' +
        '<div class="reparto" id="reparto" hidden>' +
          '<div class="reparto-barra" aria-hidden="true"><span></span><span></span><span></span></div>' +
          '<ul class="lista-check">' +
            filaReparto('80\u00a0% lo presta Bci', 'Crédito hipotecario a 30 años, junto a tu pareja', e.reparto.bci) +
            filaReparto('15\u00a0% lo reúnes con inversionistas', 'A 10 años, con segunda hipoteca', e.reparto.inversionistas) +
            filaReparto('5\u00a0% lo pones tú', 'Con tu ahorro, propio o grupal', e.reparto.usuario) +
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
    var conCompra = !!estado.compra;
    $('inicio-capacidad').hidden = conCompra;
    $('inicio-camino').hidden = !conCompra;
    // Solo un bloque existe a la vez, para que no se repita el título de la pantalla.
    if (conCompra) { $('inicio-capacidad').innerHTML = ''; renderCamino(); }
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
    $('proyectos-explica').textContent = estado.pestana === 'conjunto'
      ? 'Compran varios juntos un lote y cada uno paga 10\u00a0% menos.'
      : 'Un departamento a precio de lista; reúnes tu 15\u00a0% con inversionistas.';

    // Filtro "Me alcanza" (S5-F0): solo si hay sueldos para calcular la capacidad.
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja);
    var filtro = $('filtro-alcanza');
    filtro.hidden = cap === null;
    var usarAlcanza = estado.meAlcanza && cap !== null;
    filtro.setAttribute('aria-pressed', String(usarAlcanza));
    filtro.innerHTML = usarAlcanza
      ? 'Me alcanza: hasta ' + formatoUF(cap) + ' <span class="quitar" aria-hidden="true">×</span><span class="oculto-visual">. Toca para quitar el filtro.</span>'
      : 'Ver solo los que me alcanzan';

    var delTipo = PROYECTOS.filter(function (p) {
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
    $('vacio-titulo').textContent = porAlcanza ? 'Ninguno de este tipo te alcanza hoy' : 'Ningún proyecto rinde 4,5\u00a0% hoy';
    $('vacio-texto').textContent = porAlcanza
      ? 'Con sus sueldos pueden comprar hasta ' + formatoUF(cap) + '. Prueba la otra pestaña o quita el filtro.'
      : 'Para arrendar, la IA solo muestra departamentos que rinden 4,5\u00a0% o más al año.';
    $('btn-vacio-accion').textContent = porAlcanza ? 'Quitar el filtro Me alcanza' : 'Cambiar a modo vivir';
    $('btn-vacio-accion').dataset.accion = porAlcanza ? 'alcanza' : 'vivir';
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
      if ($('btn-vacio-accion').dataset.accion === 'alcanza') estado.meAlcanza = false;
      else { estado.modo = 'vivir'; guardarEstado(); }
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
        '<p class="texto-apoyo">10\u00a0% menos por comprar en conjunto. Ahorras ' + formatoPesos(r.ahorro) + '.</p>'
      : '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>';

    var rinde = estado.modo === 'arrendar'
      ? '<p class="texto-apoyo bloque">Arrendándolo rinde <strong>' + formatoPorcentaje(r.rentabilidad, 1) + '</strong> al año' +
        (r.pasaFiltro ? ', sobre el 4,5\u00a0% que pide la IA.' : ', bajo el 4,5\u00a0% que pide la IA.') + '</p>'
      : '';

    var frase = conjunto
      ? 'Si el grupo no se completa: puedes pasar a compra individual o salir sin costo.'
      : 'Si no se reúne el 15\u00a0%: puedes esperar o salir sin costo.';

    var comprar;
    if (esMiCompra) {
      comprar = '<p class="aviso">Ya te uniste a este proyecto.</p>' +
        '<a href="#mis-proyectos" class="btn btn-primario btn-lg btn-bloque">Ver mi compra</a>';
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
        '<span class="chip">' + NOMBRE_TIPO[p.tipo] + '</span>' +
        '<h1 id="titulo-proyecto" class="h2">' + esc(p.nombre) + '</h1>' +
        '<p class="texto-apoyo">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '</header>' +

      '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Precio del departamento</p>' + precio +
        '<p class="secundario">Y luego <strong>' + formatoPesos(e.totalMes) + '</strong> al mes</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</div>' +
      rinde +

      '<div class="tarjeta bloque">' +
        '<h2 class="h5">De dónde sale el precio</h2>' +
        '<ul class="lista-check">' +
          filaReparto('80\u00a0% lo presta Bci', 'Crédito hipotecario a 30 años, junto a tu pareja', e.reparto.bci) +
          filaReparto('15\u00a0% lo reúnes con inversionistas', 'A 10 años, con segunda hipoteca', e.reparto.inversionistas) +
          filaReparto('5\u00a0% lo pones tú', 'Con tu ahorro, propio o grupal', e.reparto.usuario) +
        '</ul>' +
        '<p class="reparto-total">Más ' + formatoPesos(e.gastos) + ' de gastos de escritura: pones <strong>' +
          formatoPesos(e.alEscriturar) + '</strong> al escriturar.</p>' +
        '<p class="reparto-total">Al mes: dividendo ' + formatoPesos(e.dividendo) + ' + inversionistas ' +
          formatoPesos(e.cuotaInversionistas) + ' = <strong>' + formatoPesos(e.totalMes) + '</strong>.</p>' +
      '</div>' +

      '<div class="tarjeta bloque">' +
        avanceDe(p, r) +
        (conjunto ? '' : '<p class="cierre">' + formatoPesos(r.financiado) + ' de ' + formatoPesos(r.porFinanciar) + '</p>') +
        '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
        '<p class="frase-cierre">' + frase + '</p>' +
      '</div>' +

      '<div class="acciones">' +
        comprar +
        '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-invertir" aria-controls="aviso-invertir">Invertir aquí</button>' +
        '<p class="aviso" id="aviso-invertir" aria-live="polite" hidden>Disponible pronto: invertir llega en una próxima versión.</p>' +
      '</div>';

    var botonComprar = $('btn-comprar');
    if (botonComprar) {
      botonComprar.addEventListener('click', function () {
        guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
        location.hash = '#mis-proyectos';
      });
    }
    var botonCambiar = $('btn-cambiar-compra');
    if (botonCambiar) {
      botonCambiar.addEventListener('click', function () {
        guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
        location.hash = '#mis-proyectos';
      });
    }
    $('btn-invertir').addEventListener('click', function () {
      $('aviso-invertir').hidden = false;
    });
  }

  // ---------- Mis proyectos ----------
  var PASOS = [
    { titulo: 'Postula', apoyo: 'Revisamos si tú y tu pareja califican.' },
    { titulo: 'Tu 5\u00a0%', apoyo: 'Juntas lo que pones al escriturar.' },
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
      return x.id !== p.id && resumen(x).cuposLibres > 0 && (estado.modo !== 'arrendar' || resumen(x).pasaFiltro);
    }).map(function (x) { return { id: x.id, totalMes: resumen(x).escenario.totalMes }; });
    var mejor = mejorAlternativa(cargaActual, opciones, estado.sueldoPropio, estado.sueldoPareja);

    if (mejor && mejor.nivel !== 'no-aprueba') {
      var otro = buscarProyecto(mejor.id);
      var frase = otro.tipo === 'conjunto'
        ? 'Si te unes a la compra en conjunto de ' + esc(otro.nombre) + ', tu carga baja a '
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
        '<p class="etiqueta">Tu carga</p>' +
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

  function renderPostula(p, d) {
    var e = resumen(p).escenario;
    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Total al mes', e.totalMes) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-postula">' +
        '<h2 class="h3" id="titulo-postula">Postula <span class="texto-apoyo titulo-apoyo">con los sueldos líquidos</span></h2>' +
        '<div class="formulario">' +
          campoDinero('sueldo-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          campoDinero('sueldo-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
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

    $('btn-postular').addEventListener('click', function () {
      tocados = { propio: true, pareja: true };
      renderCarga(p, tocados);
      if ($('btn-postular').disabled) return;
      var k = carga(e.totalMes, estado.sueldoPropio, estado.sueldoPareja);
      guardarCompra(Object.assign({}, estado.compra, { paso: pasoTrasPostular(e.alEscriturar), carga: k }));
      renderMisProyectos();
      window.scrollTo(0, 0);
    });
    $('btn-salir').addEventListener('click', salirDeCompra);

    // Si ya había sueldos guardados, se muestra la carga de inmediato.
    habiaCarga = renderCarga(p, { propio: estado.sueldoPropio !== null, pareja: estado.sueldoPareja !== null });
  }

  // ---------- Paso 2: Tu 5\u00a0% (S4-F2, S4-F3 y S4-F4) ----------
  var TIPOS_AHORRO = {
    propio: 'Ahorras solo, en tu propia cuenta.',
    grupal: 'Ahorras junto a un grupo con una meta común, para motivarse. Cada persona junta su propio 5\u00a0% ' +
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
    var cabecera = tarjetaCompacta(p, 'Meta al escriturar', meta) + listaPasos(2) +
      '<h2 class="h3 bloque" id="titulo-tu5">Tu 5\u00a0% <span class="texto-apoyo titulo-apoyo">más gastos, lo juntas tú</span></h2>';

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
    var custodia = estado.modo === 'arrendar'
      ? 'El arriendo entra a una cuenta de Bci que paga primero el dividendo, después a los inversionistas, y tú completas la diferencia.'
      : 'Cada mes, desde una cuenta de Bci, se paga primero el dividendo y después a los inversionistas.';

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pones al escriturar', e.alEscriturar) + listaPasos(3) +
      '<div class="logro bloque"' + (recienLlegado ? ' role="status"' : '') + '>' +
        '<svg aria-hidden="true"><use href="#i-ok"/></svg>' +
        '<p><strong>¡Juntaste tu 5\u00a0%!</strong> Ya tienes ' + formatoPesos(e.alEscriturar) + ' para escriturar.</p>' +
      '</div>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-firma">' +
        '<h2 class="h3" id="titulo-firma">Lo que firmas</h2>' +
        '<ul class="lista-check">' +
          filaFirma('Crédito hipotecario Bci',
            'Bci presta el 80\u00a0% (' + formatoPesos(e.reparto.bci) + ') a 30 años al 4,5\u00a0%. Lo pagan tú y tu pareja: ' +
            formatoPesos(e.dividendo) + ' al mes, con seguros.') +
          filaFirma('Segunda hipoteca con los inversionistas',
            'Ellos prestan el 15\u00a0% (' + formatoPesos(e.reparto.inversionistas) + ') a 10 años, a UF + 8\u00a0%: pagas ' +
            formatoPesos(e.cuotaInversionistas) + ' al mes. Si no pagas, cobran después de Bci.') +
          filaFirma('Cuenta custodia Bci', custodia) +
        '</ul>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-firmar">Firmar</button></div>' +
        '<div class="acciones">' +
        '<p class="texto-apoyo">Es una firma simulada: en este prototipo no se firma nada real.</p>' +
      '</div>';

    $('btn-firmar').addEventListener('click', function () {
      // El ahorro se usó para escriturar: queda en cero.
      estado.ahorrado = 0;
      estado.ahorroIniciado = false;
      guardarEstado();
      guardarCompra(Object.assign({}, estado.compra, { paso: 4, mes: 1, arriendoMes: d.arriendoBruto, abonos: [] }));
      renderMiCompra();
      window.scrollTo(0, 0);
    });
  }

  function filaFirma(titulo, texto) {
    return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + titulo + '<small>' + texto + '</small></span></li>';
  }

  // ---------- Después de firmar: Mi departamento (S5-F2 a S5-F5) ----------

  // Abonos de la compra como lista { mes, uf }. Acepta el formato anterior (abonadoUF + abonoMes).
  function abonosDe(c) {
    if (c.abonos) return c.abonos;
    return c.abonadoUF ? [{ mes: c.abonoMes || 1, uf: c.abonadoUF }] : [];
  }

  // Los números del mes actual, todos desde calculos.js.
  function mesDelDepartamento(p, d) {
    var e = resumen(p).escenario;
    var c = estado.compra;
    var mes = c.mes || 1;
    var arriendo = c.arriendoMes === undefined || c.arriendoMes === null ? d.arriendoBruto : c.arriendoMes;
    var cascada = cascadaMes(e.dividendo, e.cuotaInversionistas, arriendo);
    var arrendar = estado.modo === 'arrendar';
    return {
      e: e,
      mes: mes,
      arriendo: arriendo,
      cascada: cascada,
      pone: arrendar ? cascada.pone : e.totalMes,
      excedente: arrendar ? cascada.excedente : 0,
      puedeAbonar: arrendar && cascada.excedente > 0 && !abonosDe(c).some(function (x) { return x.mes === mes; }),
      saldoBci: ufAPesos(saldoBciUF(e.precioUF, mes)),
      saldoInversionistas: ufAPesos(saldoInversionistasUF(e.precioUF, mes, abonosDe(c))),
      avanceBci: avance(mes, 360),
      avanceInversionistas: avance(mes, 120)
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

  function renderMiDepartamento(p, d) {
    var m = mesDelDepartamento(p, d);
    var c = m.cascada;
    var arrendar = estado.modo === 'arrendar';
    var cuerpo;

    if (arrendar) {
      // S5-F2: cascada de la cuenta custodia.
      cuerpo =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">' + (m.excedente > 0 ? 'Este mes te sobraron' : 'Este mes pusiste') + '</p>' +
          '<strong class="numero display-3">' + formatoPesos(m.excedente > 0 ? m.excedente : m.pone) + '</strong>' +
          '<p class="texto-apoyo">' + (m.excedente > 0
            ? 'El arriendo alcanzó para todo: no pusiste nada.'
            : 'El arriendo cubrió ' + formatoPesos(c.neto) + ' y tú completaste la diferencia.') + '</p>' +
        '</div>' +
        campoDinero('arriendo-mes', 'Arriendo que entró este mes', m.arriendo) +
        '<section class="tarjeta bloque" aria-labelledby="titulo-cascada">' +
          '<h2 class="h4" id="titulo-cascada">Cómo se movió tu dinero</h2>' +
          '<p class="texto-apoyo">En la cuenta custodia de Bci, en este orden:</p>' +
          '<ol class="cascada">' +
            pasoCascada(1, 'Entra el arriendo', null, formatoPesos(c.bruto)) +
            pasoCascada(2, 'Se descuentan administración y el mes vacío',
              'Administración (10\u00a0%): ' + formatoPesos(c.administracion) + '. Un mes vacío al año, por mes: ' + formatoPesos(c.vacancia) + '.',
              '−' + formatoPesos(c.administracion + c.vacancia)) +
            pasoCascada(3, 'Se paga el dividendo a Bci',
              'El arriendo cubre ' + formatoPesos(c.cubreDividendo) + '.', formatoPesos(c.dividendo)) +
            pasoCascada(4, 'Se paga a los inversionistas',
              'El arriendo cubre ' + formatoPesos(c.cubreCuota) + '.', formatoPesos(c.cuotaInversionistas)) +
            (m.excedente > 0
              ? pasoCascada(5, 'Te sobra', 'Lo puedes abonar a tu deuda.', formatoPesos(m.excedente), 'cascada-final')
              : pasoCascada(5, 'Tú completas la diferencia', null, formatoPesos(m.pone), 'cascada-final')) +
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
          '<p class="texto-apoyo">Dividendo ' + formatoPesos(m.e.dividendo) + ' + inversionistas ' +
            formatoPesos(m.e.cuotaInversionistas) + '.</p>' +
          comparacion +
        '</div>' +
        campoDinero('arriendo-antes', 'Lo que pagabas de arriendo', antes);
    }

    // S5-F5: aviso de abono, solo con excedente.
    var abono = '';
    if (m.puedeAbonar) {
      abono =
        '<section class="sugerencia sugerencia-ok bloque" aria-labelledby="titulo-abono">' +
          '<h2 class="h5" id="titulo-abono">La IA recomienda abonar</h2>' +
          '<p>Te sobraron ' + formatoPesos(m.excedente) + '. Conviene abonarlos a la deuda con inversionistas, ' +
            'porque tiene la tasa más alta: UF + 8\u00a0%, contra 4,5\u00a0% del crédito Bci.</p>' +
        '</section>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-abonar">Abonar ' +
          formatoPesos(m.excedente) + '</button></div>';
    } else if (abonosDe(estado.compra).some(function (x) { return x.mes === m.mes; })) {
      abono = '<p class="aviso aviso-ok bloque">Abonaste a la deuda con inversionistas este mes (simulado).</p>';
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Total al mes', m.e.totalMes) + listaPasos(4) +
      '<h2 class="h3 bloque" id="titulo-departamento">Mi departamento <span class="texto-apoyo titulo-apoyo">mes ' + m.mes + ' desde que firmaste</span></h2>' +
      cuerpo + abono +
      // S5-F4: avance de las dos deudas.
      '<section class="tarjeta bloque" aria-labelledby="titulo-deudas">' +
        '<h2 class="h4" id="titulo-deudas">Avance de tu deuda</h2>' +
        barraDeuda('Crédito Bci (30 años)', m.mes, 360, m.saldoBci, m.avanceBci) +
        barraDeuda('Inversionistas (10 años)', m.mes, 120, m.saldoInversionistas, m.avanceInversionistas) +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      '<div class="acciones">' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-otro-mes">Simular otro mes</button>' +
        '<p class="texto-apoyo">Es una simulación: suma una cuota pagada a cada deuda.</p>' +
      '</div>';

    if (arrendar) {
      $('arriendo-mes').addEventListener('change', function () {
        var monto = formatearCampo($('arriendo-mes'));
        guardarCompra(Object.assign({}, estado.compra, { arriendoMes: monto === null ? 0 : monto }));
        renderMiCompra();
        $('arriendo-mes').focus();
      });
      $('arriendo-mes').addEventListener('input', function () { formatearCampo($('arriendo-mes')); });
    } else {
      $('arriendo-antes').addEventListener('change', function () {
        estado.arriendoActual = formatearCampo($('arriendo-antes'));
        guardarEstado();
        renderMiCompra();
        $('arriendo-antes').focus();
      });
      $('arriendo-antes').addEventListener('input', function () { formatearCampo($('arriendo-antes')); });
    }
    var botonAbonar = $('btn-abonar');
    if (botonAbonar) {
      botonAbonar.addEventListener('click', function () {
        guardarCompra(Object.assign({}, estado.compra, {
          abonos: abonosDe(estado.compra).concat([{ mes: m.mes, uf: pesosAUF(m.excedente) }]),
          abonadoUF: null, abonoMes: null
        }));
        renderMiCompra();
        anunciar('Abonaste ' + formatoPesos(m.excedente) + ' a la deuda con inversionistas.');
      });
    }
    $('btn-otro-mes').addEventListener('click', function () {
      guardarCompra(Object.assign({}, estado.compra, { mes: Math.min(360, m.mes + 1) }));
      renderMiCompra();
      anunciar('Mes ' + (m.mes + 1) + '. Este mes pusiste ' + formatoPesos(mesDelDepartamento(p, d).pone) + '.');
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

  // Después de postular: va a Tu 5\u00a0%, o directo a la firma si el ahorro ya alcanza la meta.
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
    var tieneInversiones = false; // Las inversiones llegan en el Sprint 6.
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
      '<section class="tarjeta bloque" aria-labelledby="titulo-reinicio">' +
        '<h2 class="h4" id="titulo-reinicio">Empezar de nuevo</h2>' +
        '<p class="texto-apoyo">Borra tu compra y tus datos de este teléfono, y vuelve al simulador.</p>' +
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
    var destino = RUTAS[ruta.nombre];

    if (destino.pantalla === 'inicio') renderInicio();
    if (destino.pantalla === 'proyectos') renderProyectos();
    if (destino.pantalla === 'proyecto') renderDetalle(ruta.param);
    if (destino.pantalla === 'mis-proyectos') { estado.pestanaMis = null; renderMisProyectos(); }
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
  mostrar();
})();
