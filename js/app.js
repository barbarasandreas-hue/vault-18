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
    compra: leerCompra()     // { proyectoId, departamentoId } o null
  };

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
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  function ficha(d) {
    return plural(d.dormitorios, 'dormitorio', 'dormitorios') + ' · ' +
      plural(d.banos, 'baño', 'baños') + ' · ' + d.m2 + ' m²';
  }

  var NOMBRE_TIPO = { conjunto: 'Compra en conjunto', financiamiento: 'Financiamiento del pie' };

  function cuposExtra(proyecto) {
    return estado.compra && estado.compra.proyectoId === proyecto.id ? 1 : 0;
  }

  function resumen(proyecto) {
    return resumenProyecto(proyecto, departamentosDe(proyecto.id), cuposExtra(proyecto));
  }

  function barraAvance(texto, detalle, fraccion) {
    var pct = Math.round(fraccion * 100);
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
      '<span class="ver">Ver proyecto <svg aria-hidden="true" width="20" height="20" style="transform:rotate(-90deg)"><use href="#i-flecha"/></svg></span>' +
      '</a></li>';
  }

  function renderProyectos() {
    var arrendar = estado.modo === 'arrendar';
    $('proyectos-ia').hidden = !arrendar;
    $('proyectos-modo').textContent = arrendar
      ? 'Para arrendar: rinden 4,5 % o más al año.'
      : 'Para vivir: todos los proyectos.';

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
      comprar = '<p class="aviso">Ya tienes una compra en curso.</p>';
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
        guardarCompra({ proyectoId: p.id, departamentoId: d.id });
        location.hash = '#mis-proyectos';
      });
    }
    $('btn-invertir').addEventListener('click', function () {
      $('aviso-invertir').hidden = false;
    });
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
  mostrar();
})();
