// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  // Ruta → pantalla que se muestra y botón de la barra que queda activo.
  var RUTAS = {
    'inicio': { pantalla: 'inicio', seccion: 'inicio' },
    'proyectos': { pantalla: 'proyectos', seccion: 'proyectos' },
    'mis-proyectos': { pantalla: 'mis-proyectos', seccion: 'mis-proyectos' },
    'perfil': { pantalla: 'perfil', seccion: 'perfil' }
  };

  var estado = {
    modo: 'arrendar',  // 'arrendar' o 'vivir'
    tipo: 'lote'       // 'lote' o 'individual'
  };

  function $(id) { return document.getElementById(id); }
  function poner(id, pesos) { $(id).textContent = formatoPesos(pesos); }

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

  // ---------- Navegación ----------
  // Lee la dirección: "#proyecto/p1" → { nombre: 'proyecto', param: 'p1' }.
  function leerRuta() {
    var partes = location.hash.replace('#', '').split('/');
    var nombre = RUTAS[partes[0]] ? partes[0] : 'inicio';
    return { nombre: nombre, param: partes[1] || null };
  }

  function mostrar() {
    var ruta = leerRuta();
    var destino = RUTAS[ruta.nombre];

    document.querySelectorAll('main > .pantalla').forEach(function (s) {
      s.hidden = s.id !== 'pantalla-' + destino.pantalla;
    });
    document.querySelectorAll('.barra a').forEach(function (a) {
      if (a.dataset.seccion === destino.seccion) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    if (destino.pantalla === 'inicio') { sincronizarSelectores(); renderInicio(); }
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', mostrar);
  iniciarInicio();
  mostrar();
})();
