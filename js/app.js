// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  var PANTALLAS = ['simula', 'proyectos', 'postula', 'ahorro', 'departamento'];

  var estado = {
    modo: 'arrendar',  // 'arrendar' o 'vivir'
    tipo: 'lote'       // 'lote' o 'individual'
  };

  function $(id) { return document.getElementById(id); }
  function poner(id, pesos) { $(id).textContent = formatoPesos(pesos); }

  // ---------- Simula ----------
  function renderSimula() {
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

  function iniciarSimula() {
    document.querySelectorAll('input[name="modo"], input[name="tipo"]').forEach(function (input) {
      input.checked = input.value === estado[input.name];
      input.addEventListener('change', function () {
        estado[input.name] = input.value;
        renderSimula();
      });
    });

    var boton = $('btn-reparto');
    boton.addEventListener('click', function () {
      var abierto = boton.getAttribute('aria-expanded') === 'true';
      boton.setAttribute('aria-expanded', String(!abierto));
      $('reparto').hidden = abierto;
    });

    renderSimula();
  }

  // ---------- Navegación ----------
  function mostrar() {
    var actual = location.hash.replace('#', '');
    if (PANTALLAS.indexOf(actual) === -1) actual = 'simula';

    PANTALLAS.forEach(function (nombre) {
      $('pantalla-' + nombre).hidden = nombre !== actual;
    });
    document.querySelectorAll('.barra a').forEach(function (a) {
      if (a.dataset.pantalla === actual) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', mostrar);
  iniciarSimula();
  mostrar();
})();
