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
    tipo: 'lote',            // 'lote' o 'individual'
    pestana: 'conjunto',     // pestaña de Proyectos: 'conjunto' o 'financiamiento'
    compra: leerCompra(),    // { proyectoId, departamentoId } o null
    pestanaMis: null,        // pestaña de Mis proyectos: 'compra' o 'inversiones'
    sueldoPropio: null,      // sueldo líquido del usuario, en pesos
    sueldoPareja: null,      // sueldo líquido de la pareja, en pesos
    arriendoActual: null     // lo que paga hoy de arriendo, en pesos
  };

  // ---------- Elecciones que se recuerdan entre visitas (S3-F3) ----------
  var CLAVE_ESTADO = 'primer-peldano-estado';
  var GUARDADOS = ['modo', 'tipo', 'sueldoPropio', 'sueldoPareja', 'arriendoActual'];
  var VALORES_POR_DEFECTO = { modo: 'arrendar', tipo: 'lote', sueldoPropio: null, sueldoPareja: null, arriendoActual: null };

  function montoValido(n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? n : null; }

  // Lee lo guardado y descarta lo que no tenga sentido (por si el dato se dañó).
  function leerEstado() {
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE_ESTADO));
      if (!g || typeof g !== 'object') return;
      if (g.modo === 'arrendar' || g.modo === 'vivir') estado.modo = g.modo;
      if (g.tipo === 'lote' || g.tipo === 'individual') estado.tipo = g.tipo;
      estado.sueldoPropio = montoValido(g.sueldoPropio);
      estado.sueldoPareja = montoValido(g.sueldoPareja);
      estado.arriendoActual = montoValido(g.arriendoActual);
    } catch (e) { /* sin localStorage: valores por defecto */ }
    estado.pestana = estado.tipo === 'lote' ? 'conjunto' : 'financiamiento';
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

  function ficha(d) {
    return plural(d.dormitorios, 'dormitorio', 'dormitorios') + ' · ' +
      plural(d.banos, 'baño', 'baños') + ' · ' + d.m2 + NBSP + 'm²';
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
    return barraAvance('15 % reunido con inversionistas', formatoPorcentaje(r.avanceFinanciamiento, 0), r.avanceFinanciamiento);
  }

  // ---------- Inicio: simulador ----------
  function renderInicio() {
    var lista = DEPARTAMENTO_REFERENCIA[estado.modo].listaUF;
    var e = escenario(lista, estado.tipo);
    poner('simula-escriturar', e.alEscriturar);
    poner('simula-mes', e.totalMes);
    poner('reparto-precio', e.precio);
    poner('reparto-bci', e.reparto.bci);
    poner('reparto-inversionistas', e.reparto.inversionistas);
    poner('reparto-usuario', e.reparto.usuario);
    poner('reparto-gastos', e.gastos);
  }

  function iniciarInicio() {
    document.querySelectorAll('input[name="modo"], input[name="tipo"]').forEach(function (input) {
      input.addEventListener('change', function () {
        estado[input.name] = input.value;
        // La pestaña de Proyectos sigue a cómo quiere comprar el usuario.
        if (input.name === 'tipo') estado.pestana = input.value === 'lote' ? 'conjunto' : 'financiamiento';
        guardarEstado();
        renderInicio();
      });
    });

    var boton = $('btn-reparto');
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      $('reparto').hidden = abierto;
    });
  }

  function sincronizarSelectores() {
    document.querySelectorAll('input[name="modo"], input[name="tipo"]').forEach(function (input) {
      input.checked = input.value === estado[input.name];
    });
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
      '<p class="texto-apoyo ficha">' + esc(p.comuna) + ' · ' + ficha(d) + '</p>' +
      numero +
      avanceDe(p, r) +
      '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
      '<span class="ver">Ver proyecto <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span>' +
      '</a></li>';
  }

  function renderProyectos() {
    var arrendar = estado.modo === 'arrendar';
    $('proyectos-ia').hidden = !arrendar;
    $('proyectos-modo').textContent = arrendar ? 'Para arrendar' : 'Para vivir · todos';

    document.querySelectorAll('.pestanas [role="tab"]').forEach(function (tab) {
      var activa = tab.dataset.pestana === estado.pestana;
      tab.setAttribute('aria-selected', String(activa));
      tab.tabIndex = activa ? 0 : -1;
    });
    $('panel-proyectos').setAttribute('aria-labelledby', 'tab-' + estado.pestana);
    $('proyectos-explica').textContent = estado.pestana === 'conjunto'
      ? 'Compran varios juntos un lote y cada uno paga 10 % menos.'
      : 'Un departamento a precio de lista; reúnes tu 15 % con inversionistas.';

    var visibles = PROYECTOS.filter(function (p) {
      return p.tipo === estado.pestana && (!arrendar || resumen(p).pasaFiltro);
    });
    $('lista-proyectos').innerHTML = visibles.map(tarjetaProyecto).join('');
    $('lista-proyectos').hidden = visibles.length === 0;
    $('proyectos-explica').hidden = visibles.length === 0;
    $('proyectos-vacio').hidden = visibles.length > 0;
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
    $('btn-modo-vivir').addEventListener('click', function () {
      estado.modo = 'vivir';
      guardarEstado();
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
        '<p class="texto-apoyo">10 % menos por comprar en conjunto. Ahorras ' + formatoPesos(r.ahorro) + '.</p>'
      : '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>';

    var rinde = estado.modo === 'arrendar'
      ? '<p class="texto-apoyo bloque">Arrendándolo rinde <strong>' + formatoPorcentaje(r.rentabilidad, 1) + '</strong> al año' +
        (r.pasaFiltro ? ', sobre el 4,5 % que pide la IA.' : ', bajo el 4,5 % que pide la IA.') + '</p>'
      : '';

    var frase = conjunto
      ? 'Si el grupo no se completa: puedes pasar a compra individual o salir sin costo.'
      : 'Si no se reúne el 15 %: puedes esperar o salir sin costo.';

    var comprar;
    if (esMiCompra) {
      comprar = '<p class="aviso">Ya te uniste a este proyecto.</p>' +
        '<a href="#mis-proyectos" class="btn btn-primario btn-lg btn-bloque">Ver mi compra</a>';
    } else if (estado.compra) {
      comprar = '<p class="aviso">Ya tienes una compra en curso.</p>' +
        (r.cuposLibres > 0 ? '<button type="button" class="btn btn-terciario btn-bloque" id="btn-cambiar-compra">Cambiar mi compra a este proyecto</button>' : '');
    } else if (r.cuposLibres === 0) {
      comprar = '<p class="aviso">Sin cupos disponibles.</p>';
    } else {
      comprar = '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-comprar">Comprar aquí</button>';
    }

    contenedor.innerHTML =
      '<header class="detalle-cabecera">' +
        '<span class="chip">' + NOMBRE_TIPO[p.tipo] + '</span>' +
        '<h1 id="titulo-proyecto" class="h2">' + esc(p.nombre) + '</h1>' +
        '<p class="texto-apoyo">' + esc(p.comuna) + ' · ' + ficha(d) + '</p>' +
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
          filaReparto('80 % lo presta Bci', 'Crédito hipotecario a 30 años, junto a tu pareja', e.reparto.bci) +
          filaReparto('15 % lo reúnes con inversionistas', 'A 10 años, con segunda hipoteca', e.reparto.inversionistas) +
          filaReparto('5 % lo pones tú', 'Con tu ahorro, propio o grupal', e.reparto.usuario) +
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
    { titulo: 'Tu 5 %', apoyo: 'Juntas lo que pones al escriturar.' },
    { titulo: 'Firma', apoyo: 'Firmas la escritura y recibes tu departamento.' }
  ];

  var SEMAFORO = {
    'holgado': { palabra: 'Holgado', icono: 'i-ok', explica: 'Tu carga está dentro de lo que Bci considera cómodo (hasta 25 %).' },
    'limite': { palabra: 'En el límite', icono: 'i-alerta', explica: 'Bci aprueba hasta 30 %, pero te queda poco margen.' },
    'no-aprueba': { palabra: 'No aprueba', icono: 'i-no', explica: 'Sobre 30 %, Bci no aprueba el crédito.' }
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

  // Muestra u oculta el error de un campo de sueldo. Devuelve true si el monto sirve.
  function validarSueldo(input, monto, mostrarVacio) {
    var caja = $(input.id + '-error');
    var mensaje = '';
    if (monto === 0) mensaje = 'El sueldo tiene que ser mayor a $0.';
    else if (monto === null && mostrarVacio) mensaje = 'Escribe el sueldo líquido del mes.';
    caja.hidden = !mensaje;
    caja.querySelector('span').textContent = mensaje;
    input.setAttribute('aria-invalid', String(!!mensaje));
    return monto !== null && monto > 0;
  }

  // Busca otro proyecto que baje la carga, con los mismos sueldos.
  function sugerencia(p, cargaActual) {
    var opciones = PROYECTOS.filter(function (x) {
      return x.id !== p.id && resumen(x).cuposLibres > 0 && (estado.modo !== 'arrendar' || resumen(x).pasaFiltro);
    }).map(function (x) { return { id: x.id, totalMes: resumen(x).escenario.totalMes }; });
    var mejor = mejorAlternativa(cargaActual, opciones, estado.sueldoPropio, estado.sueldoPareja);
    if (!mejor) {
      return '<div class="sugerencia"><p>Para bajar tu carga, suma otro ingreso o elige un departamento más barato.</p>' +
        '<a class="enlace" href="#proyectos">Ver proyectos</a></div>';
    }
    var otro = buscarProyecto(mejor.id);
    var frase = otro.tipo === 'conjunto'
      ? 'Si te unes a la compra en conjunto de ' + esc(otro.nombre) + ', tu carga baja a '
      : 'En ' + esc(otro.nombre) + ', tu carga baja a ';
    return '<div class="sugerencia"><p>' + frase + '<strong>' + formatoPorcentaje(mejor.carga, 1) + '</strong> (' +
      SEMAFORO[mejor.nivel].palabra.toLowerCase() + ').</p>' +
      '<a class="enlace" href="#proyecto/' + esc(otro.id) + '">Ver ' + esc(otro.nombre) + '</a> ' +
      '<a class="enlace" href="#proyectos">Ver proyectos</a></div>';
  }

  // Recalcula la carga con lo que hay en los campos. No toca los campos (para no perder el foco).
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
      return;
    }

    var k = carga(total, estado.sueldoPropio, estado.sueldoPareja);
    var nivel = nivelCarga(k);
    var s = SEMAFORO[nivel];
    resultado.innerHTML =
      '<div class="tarjeta semaforo semaforo-' + nivel + '">' +
        '<p class="etiqueta">Tu carga</p>' +
        '<strong class="numero display-2">' + formatoPorcentaje(k, 1) + '</strong>' +
        '<p class="estado-semaforo"><svg aria-hidden="true"><use href="#' + s.icono + '"/></svg>' + s.palabra + '</p>' +
        '<p class="texto-apoyo">' + s.explica + '</p>' +
        '<p class="texto-apoyo">Pagas ' + formatoPesos(total) + ' al mes de ' +
          formatoPesos(estado.sueldoPropio + estado.sueldoPareja) + ' de ingreso.</p>' +
      '</div>' +
      (nivel === 'holgado' ? '' : sugerencia(p, k));

    boton.disabled = nivel === 'no-aprueba';
    $('postular-explica').textContent = nivel === 'no-aprueba'
      ? 'Con una carga sobre 30 % no puedes postular. Prueba la sugerencia de arriba.'
      : '';
  }

  function renderPostula(p, d) {
    var e = resumen(p).escenario;
    $('panel-compra').innerHTML =
      tarjetaMiCompra(p, d, '<p class="texto-apoyo">Total al mes: <strong>' + formatoPesos(e.totalMes) + '</strong></p>') +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-postula">' +
        '<h2 class="h3" id="titulo-postula">Postula</h2>' +
        '<p class="texto-apoyo">Bci revisa cuánto de su ingreso pagarían al mes tú y tu pareja.</p>' +
        '<div class="formulario">' +
          campoDinero('sueldo-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          campoDinero('sueldo-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
        '</div>' +
        '<div id="carga-resultado" aria-live="polite"></div>' +
        '<div class="acciones">' +
          '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-postular" aria-describedby="postular-explica">Postular</button>' +
          '<p class="texto-apoyo" id="postular-explica"></p>' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-salir">Salir de esta compra</button>' +
        '</div>' +
      '</section>';

    var tocados = { propio: false, pareja: false };
    [['sueldo-propio', 'sueldoPropio', 'propio'], ['sueldo-pareja', 'sueldoPareja', 'pareja']].forEach(function (c) {
      var input = $(c[0]);
      input.addEventListener('input', function () {
        estado[c[1]] = formatearCampo(input);
        guardarEstado();
        renderCarga(p, tocados);
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
      guardarCompra(Object.assign({}, estado.compra, { paso: 2, carga: k }));
      renderMisProyectos();
      window.scrollTo(0, 0);
    });
    $('btn-salir').addEventListener('click', salirDeCompra);

    // Si ya había sueldos guardados, se muestra la carga de inmediato.
    renderCarga(p, { propio: estado.sueldoPropio !== null, pareja: estado.sueldoPareja !== null });
  }

  function renderPaso2(p, d) {
    var k = estado.compra.carga;
    var nivel = nivelCarga(k);
    $('panel-compra').innerHTML =
      tarjetaMiCompra(p, d, '') +
      listaPasos(2) +
      '<div class="bloque">' +
        '<p class="aviso aviso-ok">Postulación enviada (simulada): tu carga es ' + formatoPorcentaje(k, 1) + ', ' +
          SEMAFORO[nivel].palabra.toLowerCase() + '.</p>' +
        '<p class="aviso bloque">Disponible pronto: el paso 2, Tu 5 %, llega en la próxima versión.</p>' +
      '</div>' +
      '<div class="acciones">' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-repostular">Cambiar mis sueldos</button>' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-salir">Salir de esta compra</button>' +
      '</div>';
    $('btn-repostular').addEventListener('click', function () {
      guardarCompra(Object.assign({}, estado.compra, { paso: 1, carga: null }));
      renderMisProyectos();
    });
    $('btn-salir').addEventListener('click', salirDeCompra);
  }

  function tarjetaMiCompra(p, d, extra) {
    return '<a class="tarjeta tarjeta-proyecto" href="#proyecto/' + esc(p.id) + '">' +
      '<span class="chip">' + NOMBRE_TIPO[p.tipo] + '</span>' +
      '<h2 class="h4 con-chip">' + esc(p.nombre) + '</h2>' +
      '<p class="texto-apoyo ficha">' + esc(p.comuna) + ' · Piso ' + d.piso + ' · ' + ficha(d) + '</p>' +
      extra +
      '<span class="ver">Ver proyecto <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span>' +
    '</a>';
  }

  function salirDeCompra() {
    guardarCompra(null);
    renderMisProyectos();
  }

  function renderMiCompra() {
    var p = buscarProyecto(estado.compra.proyectoId);
    var d = departamentoDeMiCompra(p);
    if (estado.compra.paso === 2 && estado.compra.carga) renderPaso2(p, d);
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
      $('reparto').hidden = true;
      $('btn-reparto').setAttribute('aria-expanded', 'false');
      location.hash = '#inicio';
    });
  }

  // Si el usuario ya postuló y cambia sus sueldos, la carga guardada se vuelve a
  // calcular; si ya no le alcanza para postular, vuelve al paso 1.
  function recalcularPostulacion() {
    if (!estado.compra || estado.compra.paso !== 2) return;
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

    if (destino.pantalla === 'inicio') { sincronizarSelectores(); renderInicio(); }
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
  iniciarInicio();
  iniciarProyectos();
  iniciarMisProyectos();
  mostrar();
})();
