// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  // Ruta → pantalla que se muestra y botón de la barra que queda activo.
  // S15-F1: cuatro pestañas. La primera parte de la dirección dice la pestaña; el resto, la pantalla.
  var RUTAS = {
    'bienvenida': 'bienvenida', 'camino': 'camino', 'departamentos': 'departamentos',
    'inversiones': 'inversiones', 'perfil': 'perfil', 'registro': 'perfil', 'regalo': 'camino'
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
    introVista: false,       // S7-F6: si ya vio la introducción
    ahorroActual: null,      // S9: lo que tiene ahorrado hoy, en pesos
    caminoElegido: null,     // S9-F2: id del camino que eligió (ver CAMINOS en calculos.js)
    masBaratoTipo: null,     // S9-F5: 'estudio', '1d' o null
    masBaratoAjuste: null,   // S9-F5: 'usado', 'iva-cero' o null
    mesAhorro: 0,            // S10-F4: meses simulados de ahorro
    racha: 0,                // S10-F4: meses seguidos ahorrando
    ultimoProtector: null,   // S10-F4: mes en que usó "Este mes no pude"
    historialMeses: [],      // S11-F4: últimos 6 meses ('pago', 'protector' o 'reinicio')
    preguntasListas: false,  // S11-F0: si ya respondió las 3 preguntas de Inicio
    pregunta: 1,             // S11-F0: pregunta que se está mostrando (1 a 4)
    rangoPrecio: null,       // rango de precio que eligió la usuaria (RANGOS_PRECIO): el plazo se calcula con él
    filtroRango: false,      // Proyectos filtrado por su rango
    avisosApagados: {},      // S13-F1: tipos de aviso apagados en Perfil
    cuotaAutomatica: false,  // S13-F2: "Pagar mi cuota sola el día 5" (simulado)
    parejaInvitada: false,   // S13-F3: la pareja ve el mismo avance (simulado)
    regalos: [],             // S13-F3: aportes de la familia [{ relacion, monto, mensaje }] (simulado)
    listaRegalos: null,      // S13-F3: { ocasion, mostrarMontos } cuando la usuaria creó su lista
    unidosGrupo: {},         // S14-F2: compradores simulados que se unieron después, por proyecto
    avisosVistos: null,      // el mes cuyos avisos ya se vieron (apaga el número de la campana)
    avatar: null,            // S16-F1: avatar de la usuaria (normalizarAvatar); null = neutro
    equipo: [],              // S16-F4: Tu equipo [{ id, relacion, avatar }]; las relaciones se pueden repetir
    conQuien: null,          // S16-F2: 'solo', 'pareja' o 'familia'
    piezas: {},              // S17-F7: piezas sumadas en Llega antes { grupo, subsidio, iva, regalo, respaldo }
    modoElegido: false,      // S17-F3: la primera pregunta no viene marcada
    quiereInvertir: false    // S17-F11: en modo vivir, Inversiones aparece solo si lo pide
  };

  // ---------- Elecciones que se recuerdan entre visitas (S3-F3) ----------
  var CLAVE_ESTADO = 'primer-peldano-estado';
  var GUARDADOS = ['modo', 'sueldoPropio', 'sueldoPareja', 'arriendoActual', 'otrasCuotas', 'contrato',
    'ahorroMensual', 'tipoAhorro', 'ahorrado', 'ahorroIniciado', 'ahorroActual', 'caminoElegido', 'mesAhorro', 'racha', 'ultimoProtector', 'historialMeses', 'preguntasListas', 'rangoPrecio',
    'avisosApagados', 'cuotaAutomatica', 'parejaInvitada', 'regalos', 'listaRegalos', 'unidosGrupo', 'avisosVistos', 'avatar', 'equipo', 'conQuien', 'piezas', 'modoElegido', 'quiereInvertir'];
  var VALORES_POR_DEFECTO = { modo: 'arrendar', sueldoPropio: null, sueldoPareja: null, arriendoActual: null,
    otrasCuotas: null, contrato: 'indefinido',
    ahorroMensual: null, tipoAhorro: 'propio', ahorrado: 0, ahorroIniciado: false, meAlcanza: false,
    ahorroActual: null, caminoElegido: null, masBaratoTipo: null, masBaratoAjuste: null,
    mesAhorro: 0, racha: 0, ultimoProtector: null, historialMeses: [], preguntasListas: false, pregunta: 1, rangoPrecio: null, filtroRango: false,
    avisosApagados: {}, cuotaAutomatica: false, parejaInvitada: false, regalos: [], listaRegalos: null, unidosGrupo: {}, avisosVistos: null, avatar: null, conQuien: null, modoElegido: false, quiereInvertir: false };

  function montoValido(n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? n : null; }

  var CONTRATOS = { 'indefinido': 'Indefinido', 'plazo-fijo': 'Plazo fijo', 'independiente': 'Independiente' };

  // Lee lo guardado y descarta lo que no tenga sentido (por si el dato se dañó).
  // S13-F3: lista de regalos (se usan al leer el estado guardado).
  var RELACIONES = ['mamá', 'papá', 'hermana', 'hermano', 'abuela', 'abuelo', 'tía', 'tío', 'amiga', 'amigo'];
  var OCASIONES = ['Cumpleaños', 'Navidad', 'Titulación', 'Otra ocasión'];

  // ---------- S16: avatar y Tu equipo ----------
  // Sin género: todos los peinados, colores y accesorios son para todos. Lo no elegido se dibuja neutro (gris).
  var AV_PIEL = ['#F3D3B5', '#E8BFA0', '#C99572', '#9C6B47', '#6B4630'];
  var AV_COLOR_PELO = [['#2B2B2B', 'Pelo negro'], ['#6D4C41', 'Pelo castaño'], ['#A1774F', 'Pelo castaño claro'], ['#D9B26A', 'Pelo rubio'], ['#2772CC', 'Pelo azul'], ['#B0BEC5', 'Canas']];
  var AV_ROPA = [['#2772CC', 'Ropa azul'], ['#1D5699', 'Ropa azul oscuro'], ['#28892B', 'Ropa verde'], ['#37474F', 'Ropa gris oscuro'], ['#FFE300', 'Ropa amarilla'], ['#E2E8EA', 'Ropa gris claro']];
  var AV_NOMBRE_PELO = { corto: 'Corto', largo: 'Largo', 'moño': 'Moño', rizado: 'Rizado', rapado: 'Rapado', ondulado: 'Ondulado' };
  var AV_NOMBRE_ACC = { lentes: 'Lentes', audifonos: 'Audífonos', mochila: 'Mochila', gorro: 'Gorro', planta: 'Planta' };
  var AV_OSCURO = '#263238';
  var NOMBRE_RELACION = { pareja: 'Tu pareja', 'mamá': 'Tu mamá', 'papá': 'Tu papá', hermana: 'Tu hermana', hermano: 'Tu hermano',
    abuela: 'Tu abuela', abuelo: 'Tu abuelo', 'tía': 'Tu tía', 'tío': 'Tu tío', amiga: 'Tu amiga', amigo: 'Tu amigo', mascota: 'Tu mascota' };

  function avatarPelo(t, c) {
    var b = '', f = '';
    if (t === 'corto') f = '<path d="M33 41Q32 21 50 21Q68 21 67 41Q63 31 50 31Q38 31 33 41Z" fill="' + c + '"/>';
    if (t === 'largo') {
      b = '<path d="M31 40Q31 19 50 19Q69 19 69 40L71 72L29 72Z" fill="' + c + '"/>';
      f = '<path d="M33 40Q33 21 50 21Q67 21 67 40Q60 29 47 31Q38 33 33 40Z" fill="' + c + '"/>';
    }
    if (t === 'moño') f = '<circle cx="50" cy="18" r="8" fill="' + c + '"/><path d="M33 41Q32 22 50 22Q68 22 67 41Q63 30 50 30Q38 30 33 41Z" fill="' + c + '"/>';
    if (t === 'rizado') f = [[35, 32], [41, 24], [50, 20], [59, 24], [65, 32], [33, 41], [67, 41]].map(function (p, i) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i > 4 ? 6 : 8) + '" fill="' + c + '"/>';
    }).join('');
    if (t === 'rapado') f = '<path d="M34 38Q34 23 50 23Q66 23 66 38Q60 30 50 30Q40 30 34 38Z" fill="' + c + '" opacity=".6"/>';
    if (t === 'ondulado') {
      b = '<path d="M31 40Q30 19 50 19Q70 19 69 40Q73 52 67 60Q64 54 64 46L36 46Q36 54 33 60Q27 52 31 40Z" fill="' + c + '"/>';
      f = '<path d="M33 41Q33 21 52 21Q68 22 67 40Q60 28 44 32Q37 35 33 41Z" fill="' + c + '"/>';
    }
    return { b: b, f: f };
  }
  function mascotaFigura(t) {
    if (t === 'perro') return '<g><ellipse cx="14" cy="93" rx="10" ry="6" fill="#A1887F"/><circle cx="7" cy="85" r="6" fill="#A1887F"/>' +
      '<ellipse cx="4" cy="84" rx="2.5" ry="5" fill="#6D4C41"/><path d="M23 90q5-6 3-10" stroke="#A1887F" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
    if (t === 'gato') return '<g><ellipse cx="14" cy="93" rx="9" ry="6" fill="#546E7A"/><circle cx="8" cy="85" r="5.5" fill="#546E7A"/>' +
      '<path d="M3 82l1-7 4 4zM13 82l-1-7-4 4z" fill="#546E7A"/><path d="M22 92q8-2 6-12" stroke="#546E7A" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>';
    return '';
  }
  function avColores(a) {
    a = a || {};
    return {
      piel: a.piel === null || a.piel === undefined ? '#BBC5CA' : AV_PIEL[a.piel],
      pelo: AV_COLOR_PELO[a.colorPelo === null || a.colorPelo === undefined ? 1 : a.colorPelo][0],
      ropa: a.ropa === null || a.ropa === undefined ? '#546E7A' : AV_ROPA[a.ropa][0]
    };
  }
  // Busto plano sin cara (S16-F1). tam en px; aria-hidden: quien lo usa pone el texto.
  function avatarSVG(a, tam, clase) {
    a = a || {};
    var col = avColores(a);
    var acc = a.accesorios || [];
    var h = a.pelo ? avatarPelo(a.pelo, col.pelo) : { b: '', f: '' };
    var t = '<svg class="' + (clase || 'avatar-svg') + '" viewBox="0 0 100 100" width="' + tam + '" height="' + tam + '" aria-hidden="true" focusable="false">' +
      h.b +
      '<path d="M24 100Q24 70 50 68Q76 70 76 100Z" fill="' + col.ropa + '"/>' +
      '<rect x="45" y="52" width="10" height="16" rx="3" fill="' + col.piel + '"/>' +
      '<circle cx="50" cy="40" r="17" fill="' + col.piel + '"/>' + h.f;
    if (acc.indexOf('gorro') !== -1) t += '<path d="M32 34Q32 15 50 15Q68 15 68 34Z" fill="#1D5699"/><rect x="30" y="31" width="40" height="6" rx="3" fill="#2772CC"/>';
    if (acc.indexOf('mochila') !== -1) t += '<path d="M38 72L35 100M62 72L65 100" stroke="' + AV_OSCURO + '" stroke-width="3.5"/>';
    if (acc.indexOf('lentes') !== -1) t += '<g fill="none" stroke="' + AV_OSCURO + '" stroke-width="1.8"><circle cx="43.5" cy="42" r="4.6"/><circle cx="56.5" cy="42" r="4.6"/><path d="M48 42h4"/></g>';
    if (acc.indexOf('audifonos') !== -1) t += '<path d="M31 42Q31 16 50 16Q69 16 69 42" stroke="' + AV_OSCURO + '" stroke-width="3" fill="none"/>' +
      '<rect x="27" y="37" width="7" height="11" rx="3" fill="' + AV_OSCURO + '"/><rect x="66" y="37" width="7" height="11" rx="3" fill="' + AV_OSCURO + '"/>';
    if (acc.indexOf('planta') !== -1) t += '<ellipse cx="86" cy="80" rx="4" ry="8" fill="#28892B" transform="rotate(-25 86 80)"/>' +
      '<ellipse cx="91" cy="80" rx="4" ry="8" fill="#28892B" transform="rotate(25 91 80)"/><rect x="81" y="86" width="14" height="13" rx="2" fill="#C47A4A"/>';
    return t + mascotaFigura(a.mascota) + '</svg>';
  }
  function mascotaSVG(especie, tam, clase) {
    return '<svg class="' + (clase || 'avatar-svg') + '" viewBox="-6 63 42 42" width="' + tam + '" height="' + tam + '" aria-hidden="true" focusable="false">' +
      mascotaFigura(especie === 'gato' ? 'gato' : 'perro') + '</svg>';
  }
  function avatarMiembro(m, tam, clase) {
    return m.relacion === 'mascota' ? mascotaSVG(m.avatar && m.avatar.mascota, tam, clase) : avatarSVG(m.avatar, tam, clase);
  }
  // El personaje de la escalera, con los colores y el peinado del avatar.
  function personajeSVG() {
    var a = estado.avatar;
    if (!a) return PERSONAJE;
    var col = avColores(a);
    var h = a.pelo ? avatarPelo(a.pelo, col.pelo) : { b: '', f: '' };
    var t = 'translate(16 10) scale(.353) translate(-50 -40)';
    return '<svg class="personaje" viewBox="0 0 32 48">' +
      (h.b ? '<g transform="' + t + '">' + h.b + '</g>' : '') +
      ((a.accesorios || []).indexOf('mochila') !== -1 ? '<rect class="p-mochila" x="5" y="18" width="8" height="12" rx="3"/>' : '') +
      '<rect class="p-pierna" x="11" y="32" width="4.5" height="12" rx="2"/><rect class="p-pierna" x="17" y="32" width="4.5" height="12" rx="2"/>' +
      '<path class="p-zapato" d="M10 44 h7 v3 h-8 z M16.5 44 h7 l1 3 h-8 z"/>' +
      '<path d="M9 20 a7 7 0 0 1 14 0 v14 h-14 z" style="fill:' + col.ropa + '"/>' +
      '<path class="p-brazo" d="M22 22 l5 6" style="stroke:' + col.ropa + '"/>' +
      '<circle cx="16" cy="10" r="6" style="fill:' + col.piel + '"/>' +
      (h.f ? '<g transform="' + t + '">' + h.f + '</g>' : '') +
      '</svg>';
  }
  function miembrosCon(relaciones) {
    return estado.equipo.filter(function (m) { return relaciones.indexOf(m.relacion) !== -1; });
  }
  // Quienes viven con la usuaria (según "¿Con quién vas a vivir?").
  function companeros() {
    if (estado.conQuien === 'pareja') return miembrosCon(['pareja']).slice(0, 1);
    if (estado.conQuien === 'familia') return miembrosCon(['pareja', 'mamá', 'papá', 'hermana', 'hermano', 'abuela', 'abuelo', 'tía', 'tío']).slice(0, 3);
    return [];
  }
  // La escena: la usuaria y quienes viven con ella (la mascota va en su avatar).
  function escena(tam, clase) {
    return avatarSVG(estado.avatar, tam, clase) + companeros().map(function (m) { return avatarMiembro(m, Math.round(tam * 0.88), clase); }).join('');
  }
  function textoEquipo() {
    // S18-F8: dice a quién, no cuántos: "Con tu pareja y 2 personas más".
    var n = contarEquipo(estado.equipo, estado.avatar && estado.avatar.mascota);
    if (!n.personas && !n.mascotas) return '';
    var pareja = (estado.equipo || []).some(function (x) { return x.relacion === 'pareja'; });
    var otros = n.personas - (pareja ? 1 : 0);
    var partes = [];
    if (pareja) partes.push('tu pareja');
    if (otros) partes.push(pareja ? plural(otros, 'persona más', 'personas más') : plural(otros, 'persona', 'personas'));
    if (n.mascotas) partes.push(n.mascotas === 1 ? 'tu mascota' : plural(n.mascotas, 'mascota', 'mascotas'));
    return 'Con ' + partes.join(' y ').replace(/ y (?=[^y]* y )/, ', ');
  }

  // S16-F1: el creador, en una hoja. Sin opción de género; lo que no se elige queda neutro.
  // op: { titulo, avatar, relacion, elegirRelacion, boton, alGuardar(avatar, relacion) }
  function abrirCreador(op) {
    var a = normalizarAvatar(op.avatar) || normalizarAvatar({});
    var relacion = op.relacion || null;
    var grupo = function (titulo, html) { return '<fieldset class="creador-grupo"><legend>' + titulo + '</legend><div class="creador-ops">' + html + '</div></fieldset>'; };
    var boton = function (k, v, texto, extra) {
      var on = k === 'accesorios' ? a.accesorios.indexOf(v) !== -1 : String(a[k]) === String(v);
      return '<button type="button" class="creador-op' + (extra ? ' muestra' : '') + '" data-k="' + k + '" data-v="' + v + '" aria-pressed="' + on + '"' +
        (extra ? ' style="background:' + extra + '" aria-label="' + texto + '"' : '') + '>' + (extra ? '' : texto) + '</button>';
    };
    function opciones() {
      if (relacion === 'mascota') return grupo('Mascota', boton('mascota', 'perro', 'Perro') + boton('mascota', 'gato', 'Gato'));
      return grupo('Tono de piel', AV_PIEL.map(function (c, i) { return boton('piel', i, 'Tono ' + (i + 1), c); }).join('')) +
        grupo('Pelo', AVATAR_PELOS.map(function (p) { return boton('pelo', p, AV_NOMBRE_PELO[p]); }).join('')) +
        grupo('Color de pelo', AV_COLOR_PELO.map(function (c, i) { return boton('colorPelo', i, c[1], c[0]); }).join('')) +
        grupo('Ropa', AV_ROPA.map(function (c, i) { return boton('ropa', i, c[1], c[0]); }).join('')) +
        grupo('Accesorios', AVATAR_ACCESORIOS.map(function (x) { return boton('accesorios', x, AV_NOMBRE_ACC[x]); }).join('')) +
        (op.elegirRelacion || relacion ? '' : grupo('Mascota', boton('mascota', '', 'Sin mascota') + boton('mascota', 'perro', 'Perro') + boton('mascota', 'gato', 'Gato')));
    }
    function vista() { return relacion === 'mascota' ? mascotaSVG(a.mascota || 'perro', 132) : avatarSVG(a, 132); }
    var html = '<div class="creador">' +
      (op.elegirRelacion ? '<div class="campo"><label for="creador-relacion">¿Quién es?</label><select id="creador-relacion" class="campo-select">' +
        RELACIONES_EQUIPO.map(function (r) { return '<option value="' + r + '"' + (r === relacion ? ' selected' : '') + '>' + NOMBRE_RELACION[r] + '</option>'; }).join('') +
        '</select></div>' : '') +
      '<div class="creador-vista" id="creador-vista">' + vista() + '</div>' +
      '<div id="creador-opciones">' + opciones() + '</div>' +
      '<button type="button" class="btn btn-primario btn-bloque" id="btn-guardar-avatar">Guardar</button></div>';
    abrirHojaContenido(op.titulo, html, op.boton, function (hoja) {
      if (op.elegirRelacion && !relacion) relacion = $('creador-relacion').value;
      if (op.elegirRelacion) $('creador-relacion').addEventListener('change', function () {
        relacion = $('creador-relacion').value;
        a = normalizarAvatar({});
        $('creador-opciones').innerHTML = opciones();
        $('creador-vista').innerHTML = vista();
      });
      $('creador-opciones').addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-k]');
        if (!b) return;
        var k = b.dataset.k, v = b.dataset.v;
        if (k === 'accesorios') {
          var i = a.accesorios.indexOf(v);
          if (i === -1) a.accesorios.push(v); else a.accesorios.splice(i, 1);
        } else if (k === 'pelo' || k === 'mascota') a[k] = v;
        else a[k] = Number(v);
        $('creador-opciones').innerHTML = opciones();
        $('creador-vista').innerHTML = vista();
        var igual = hoja.querySelector('[data-k="' + k + '"][data-v="' + v + '"]');
        if (igual) igual.focus();
      });
      $('btn-guardar-avatar').addEventListener('click', function () {
        if (relacion === 'mascota' && !a.mascota) a.mascota = 'perro';
        cerrarHoja(true);
        op.alGuardar(normalizarAvatar(a), relacion);
      });
    });
  }
  // La usuaria crea o cambia su avatar.
  function editarMiAvatar(boton, despues) {
    abrirCreador({ titulo: 'Tu avatar', avatar: estado.avatar, boton: boton, alGuardar: function (av) {
      estado.avatar = av;
      guardarEstado();
      if (despues) despues(); else mostrar();
      toast('Tu avatar quedó listo.');
    } });
  }
  // Agregar a alguien a Tu equipo (relación + avatar). La pareja nunca trae un avatar sugerido.
  function agregarAlEquipo(boton, relacion, despues, inicial) {
    abrirCreador({ titulo: relacion === 'pareja' ? 'Tu pareja' : 'Agregar a alguien', relacion: relacion || inicial, elegirRelacion: !relacion, boton: boton,
      alGuardar: function (av, rel) {
        estado.equipo = agregarMiembro(estado.equipo, rel, av);
        guardarEstado();
        if (despues) despues(rel); else mostrar();
        toast(NOMBRE_RELACION[rel] + ' está en tu equipo.');
      } });
  }

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
      estado.ahorroActual = montoValido(g.ahorroActual);
      estado.mesAhorro = montoValido(g.mesAhorro) || 0;
      estado.racha = Math.min(montoValido(g.racha) || 0, estado.mesAhorro);
      estado.ultimoProtector = montoValido(g.ultimoProtector);
      estado.historialMeses = Array.isArray(g.historialMeses)
        ? g.historialMeses.filter(function (x) { return x === 'pago' || x === 'protector' || x === 'reinicio'; }).slice(-6) : [];
      if (buscarRango(g.rangoPrecio)) estado.rangoPrecio = g.rangoPrecio;
      if (g.avisosApagados && typeof g.avisosApagados === 'object') {
        TIPOS_AVISO.forEach(function (t) { if (g.avisosApagados[t] === true) estado.avisosApagados[t] = true; });
      }
      estado.cuotaAutomatica = g.cuotaAutomatica === true;
      estado.parejaInvitada = g.parejaInvitada === true;
      estado.regalos = Array.isArray(g.regalos) ? g.regalos.filter(function (x) { return x && RELACIONES.indexOf(x.relacion) !== -1 && montoValido(x.monto); })
        .map(function (x) { return { relacion: x.relacion, monto: x.monto, mensaje: typeof x.mensaje === 'string' ? x.mensaje.slice(0, 140) : '', avatar: normalizarAvatar(x.avatar) }; }).slice(0, 20) : [];
      if (typeof g.avisosVistos === 'string' && g.avisosVistos.length < 40) estado.avisosVistos = g.avisosVistos;
      if (g.unidosGrupo && typeof g.unidosGrupo === 'object') {
        Object.keys(g.unidosGrupo).forEach(function (id) {
          var n = g.unidosGrupo[id];
          if (buscarProyecto(id) && Number.isInteger(n) && n > 0 && n <= 20) estado.unidosGrupo[id] = n;
        });
      }
      if (g.listaRegalos && OCASIONES.indexOf(g.listaRegalos.ocasion) !== -1) {
        estado.listaRegalos = { ocasion: g.listaRegalos.ocasion, mostrarMontos: g.listaRegalos.mostrarMontos === true };
      }
      estado.avatar = normalizarAvatar(g.avatar);
      estado.piezas = {};
      if (g.piezas && typeof g.piezas === 'object') ORDEN_PIEZAS.forEach(function (id) { if (g.piezas[id] === true) estado.piezas[id] = true; });
      estado.modoElegido = g.modoElegido === true || g.preguntasListas === true;
      estado.quiereInvertir = g.quiereInvertir === true;
      if (['solo', 'pareja', 'familia'].indexOf(g.conQuien) !== -1) estado.conQuien = g.conQuien;
      estado.equipo = [];
      if (Array.isArray(g.equipo)) g.equipo.forEach(function (m) { if (m) estado.equipo = agregarMiembro(estado.equipo, m.relacion, m.avatar); });
      // Quien ya tenía sueldos y ahorro mensual guardados no repite las preguntas.
      estado.preguntasListas = g.preguntasListas === true ||
        (g.preguntasListas === undefined && estado.sueldoPropio > 0 && estado.ahorroMensual > 0);
      if (typeof CAMINOS !== 'undefined' && CAMINOS[g.caminoElegido] && !CAMINOS[g.caminoElegido].ficha) estado.caminoElegido = g.caminoElegido;
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
    estado.avisosApagados = {};
    estado.regalos = [];
    estado.unidosGrupo = {};
    estado.equipo = [];
    estado.piezas = {};
    estado.compra = null;
    estado.inversiones = [];
    estado.introVista = false;
    estado.pestana = 'conjunto';
    estado.pestanaMis = null;
  }

  leerEstado();
  // Saltar al contenido: lleva el foco al título de la pantalla visible (sin cambiar la ruta).
  if ($('saltar')) $('saltar').addEventListener('click', function (ev) {
    ev.preventDefault();
    var titulo = document.querySelector('main > .pantalla:not([hidden]) h1');
    if (titulo) { if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1'); titulo.focus(); }
  });

  function $(id) { return document.getElementById(id); }

  // S7-F1: estado de carga del Bci Kit. El botón mantiene su tamaño y color, su texto cambia a
  // "Cargando…" y, después de un momento, se hace la acción. Evita que se toque dos veces.
  var ESPERA_CARGA = 700;
  function conCarga(boton, accion) {
    if (boton.classList.contains('is-cargando')) return;
    boton.style.minWidth = boton.offsetWidth + 'px';
    boton.style.minHeight = boton.offsetHeight + 'px';
    var ruta = location.hash;
    boton.classList.add('is-cargando');
    boton.setAttribute('aria-busy', 'true');
    boton.setAttribute('aria-disabled', 'true');
    boton.textContent = 'Cargando…';
    anunciar('Cargando…');
    // Si el usuario se fue a otra pantalla mientras cargaba, la acción no lo devuelve.
    setTimeout(function () { if (location.hash === ruta) accion(); }, ESPERA_CARGA);
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
          return Object.assign({}, x, { cuotasCobradas: Math.max(0, Math.min(600, Number(x.cuotasCobradas) || 0)), respaldo: x.respaldo === true });
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

  var NOMBRE_TIPO = { conjunto: 'Compra en grupo', financiamiento: 'Pie compartido', venta: 'Terminado' };
  // S18-F6: los terminados se compran solos y solo para vivir.
  function paraVivir(p) { return p.tipo === 'conjunto' || p.tipo === 'venta'; }

  function cuposExtra(proyecto) {
    var tuyo = estado.compra && estado.compra.proyectoId === proyecto.id ? 1 : 0;
    var unidos = estado.unidosGrupo[proyecto.id] || 0;
    return Math.min(tuyo + unidos, proyecto.cupos - proyecto.cuposTomados);
  }
  function esMiProyecto(proyecto) { return !!(estado.compra && estado.compra.proyectoId === proyecto.id); }

  // S10: si para arrendar eligió un camino sin pie compartido (A solo o crédito al 80 %), en los proyectos
  // en grupo pone el 20 % y no hay inversionistas. El pie compartido siempre lleva inversionistas.
  var CAMINOS_PROPIOS = ['grupo-invertir', 'individual-invertir'];
  function modoFinanciero(proyecto) {
    if (estado.modo === 'arrendar' && proyecto.tipo === 'conjunto' && CAMINOS_PROPIOS.indexOf(estado.caminoElegido) !== -1) return 'propio';
    return estado.modo;
  }

  // S18-F1: para vivir, el precio usa el descuento que el grupo ya tiene (contándote); completar el grupo es posibilidad.
  function resumenBase(proyecto) {
    var op = estado.modo === 'vivir' ? { descuentoHoy: true, yaEstas: esMiProyecto(proyecto) } : null;
    return resumenProyecto(proyecto, departamentosDe(proyecto.id), cuposExtra(proyecto), invertidoEn(proyecto.id), modoFinanciero(proyecto), op);
  }
  // S18-F7: para vivir, el crédito de toda la compra (Postular, preaprobación, Firmar y Mi departamento)
  // sale de las mismas piezas que el Detalle y Tu pie: precio con descuento o sin IVA, subsidio y respaldo.
  function resumen(proyecto) {
    var r = resumenBase(proyecto);
    if (estado.modo === 'vivir' && paraVivir(proyecto)) r.escenario = escenarioConPiezas(proyecto, r.escenario);
    return r;
  }
  function escenarioConPiezas(p, e) {
    var pd = plazoDepartamento(p);
    var precio = ufAPesos(pd.precioUF), bci = ufAPesos(pd.creditoUF), subsidio = ufAPesos(pd.subsidioUF);
    return Object.assign({}, e, {
      precioUF: pd.precioUF, precio: precio,
      pctCredito: pd.creditoUF / pd.precioUF, pctUsuario: pd.pie / precio, pctInversionistas: 0, pctSubsidio: pd.subsidioUF / pd.precioUF,
      pie: pd.pie, gastos: pd.gastos, alEscriturar: pd.meta,
      dividendo: pd.dividendo, totalMes: pd.dividendo, dividendoSinSubsidio: pd.dividendoSinSubsidio,
      participacionUF: 0, subsidio: subsidio, conPiezas: pd.on,
      reparto: { bci: bci, inversionistas: 0, usuario: precio - bci - subsidio, subsidio: subsidio }
    });
  }
  // S18-F2: un solo reloj. Cada "mes" de la demo mueve la fecha de hoy para el ahorro, la obra, el cierre y los avisos.
  function hoyDemo() { return fechaMasMeses(FECHA_REFERENCIA, estado.mesAhorro || 0); }
  function grupoCerrado(p) { return p.tipo === 'conjunto' && !!p.cierre && diasEntre(hoyDemo(), p.cierre) <= 0; }
  // Meses que faltan para la entrega del edificio (0 si ya se entregó o no es en obra).
  function mesesParaEntrega(p) {
    if (p.tipo !== 'conjunto' || !p.entregaEstimada || (p.etapaObra || 0) >= 4) return 0;
    return Math.max(0, mesesEntre(hoyDemo(), p.entregaEstimada));
  }
  // S18-F6: lo que hay que esperar aunque el pie esté listo: la entrega del edificio o los 12 meses de la cuenta de vivienda.
  function esperaMinima(p) {
    if (estado.modo !== 'vivir') return { meses: 0, freno: null };
    var e = { meses: mesesParaEntrega(p), freno: 'entrega' };
    if (plazoDepartamento(p).on.subsidio) {
      var cuenta = Math.max(0, SUPUESTOS_PIEZAS.mesesCuentaVivienda - (estado.mesAhorro || 0));
      if (cuenta > e.meses) e = { meses: cuenta, freno: 'cuenta-vivienda' };
    }
    return e;
  }
  function entregaPendiente(p) { return esperaMinima(p).meses > 0; }

  function barraAvance(texto, detalle, fraccion) {
    var pct = porcentajeEntero(fraccion);
    return '<div class="avance">' +
      '<p class="avance-texto"><span>' + texto + '</span><strong>' + detalle + '</strong></p>' +
      '<div class="avance-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="' + esc(texto) + '">' +
      '<span style="width:' + pct + '%"></span></div></div>';
  }

  // S12-F1: los cupos como personas (tomadas en color, la tuya con borde y "Tú", las libres en contorno).
  function personasGrupo(proyecto, r) {
    var tuyo = esMiProyecto(proyecto);
    var items = '';
    for (var i = 0; i < r.cupos; i++) {
      var tomada = i < r.cuposTomados;
      var esTuya = tuyo && i === proyecto.cuposTomados;
      items += '<li class="persona-cupo ' + (esTuya ? 'tuya' : (tomada ? 'tomada' : 'libre')) + '" style="animation-delay:' + (i * 40) + 'ms">' +
        '<svg aria-hidden="true"><use href="#i-persona"/></svg>' + (esTuya ? '<span class="tu-etiqueta">Tú</span>' : '') + '</li>';
    }
    return '<div class="avance">' +
      '<p class="avance-texto"><span>' + icono('i-grupo') + '<strong>' + r.cuposTomados + ' de ' + r.cupos + '</strong></span></p>' +
      '<ol class="personas" role="img" aria-label="' + r.cuposTomados + ' de ' + r.cupos + ' cupos tomados' + (tuyo ? ', uno es tuyo' : '') + '">' + items + '</ol>' +
    '</div>';
  }

  // S14-F2: el grupo como un edificio con ventanas: cada comprador es una ventana encendida,
  // la tuya dice "Tú" y las libres están apagadas. Se llena de abajo hacia arriba.
  var grupoDestella = false;
  function edificioGrupo(proyecto, r) {
    var cols = r.cupos > 10 ? 3 : 2;
    var pisos = Math.ceil(r.cupos / cols);
    var tuyo = esMiProyecto(proyecto);
    var ventanas = '';
    for (var f = pisos - 1; f >= 0; f--) {
      for (var col = 0; col < cols; col++) {
        var i = f * cols + col;
        if (i >= r.cupos) { ventanas += '<li class="ventana vacia"></li>'; continue; }
        var esTuya = tuyo && i === proyecto.cuposTomados;
        var clase = esTuya ? 'tuya' : (i < r.cuposTomados ? 'encendida' : 'apagada');
        var planta = clase === 'encendida' && i % 3 === 1 ? ' con-planta' : '';
        ventanas += '<li class="ventana ' + clase + planta + '" style="animation-delay:' + (i * 50) + 'ms">' + (esTuya ? 'Tú' : '') + '</li>';
      }
    }
    var destella = grupoDestella;
    grupoDestella = false;
    return '<div class="edificio' + (destella ? ' destella' : '') + '" role="img" aria-label="' + r.cuposTomados + ' de ' + r.cupos + ' compradores' + (tuyo ? ', uno eres tú' : '') + '">' +
      '<span class="edificio-cielo" aria-hidden="true"><span class="luna"></span><span class="estrella e1"></span><span class="estrella e2"></span><span class="estrella e3"></span></span>' +
      '<svg class="edificio-techo" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect class="techo-estanque" x="14" y="4" width="18" height="12" rx="2"/><path class="techo-antena" d="M78 16 V2 M74 6 H82"/>' +
        '<circle class="techo-planta" cx="58" cy="12" r="5"/><rect class="techo-macetero" x="54" y="14" width="8" height="4" rx="1"/>' +
        '<rect class="techo-borde" x="0" y="17" width="100" height="5"/></svg>' +
      '<ol class="edificio-fachada" aria-hidden="true" style="--cols:' + cols + '">' + ventanas + '</ol>' +
      '<svg class="edificio-base" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">' +
        '<rect class="base-muro" x="0" y="0" width="100" height="22"/>' +
        '<path class="base-toldo" d="M36 4 H64 L67 9 H33 Z"/>' +
        '<rect class="base-puerta" x="40" y="9" width="20" height="13" rx="1"/><path class="base-marco" d="M50 9 V22"/>' +
        '<circle class="base-arbol" cx="12" cy="14" r="8"/><rect class="base-tronco" x="11" y="18" width="2" height="5"/>' +
        '<circle class="base-arbol" cx="88" cy="14" r="8"/><rect class="base-tronco" x="87" y="18" width="2" height="5"/>' +
        '<rect class="base-vereda" x="0" y="22" width="100" height="4"/></svg>' +
    '</div>';
  }

  function actividadGrupo(proyecto, r) {
    var g = proyecto.grupo || {};
    var unidos = estado.unidosGrupo[proyecto.id] || 0;
    var ultimo = (estado.historialMeses || []).slice(-1)[0];
    var pagaron = Math.min(r.cuposTomados, (g.pagaronMes || 0) + (esMiProyecto(proyecto) && ultimo === 'pago' ? 1 : 0));
    return '<ul class="actividad-grupo">' +
      '<li>' + icono('i-persona') + (unidos ? 'Se unió alguien hoy' : 'Se unió alguien hace ' + plural(g.unidoHaceDias || 1, 'día', 'días')) + '</li>' +
      '<li>' + icono('i-check') + pagaron + ' de ' + r.cuposTomados + ' pagaron su cuota este mes</li>' +
    '</ul>';
  }

  function grupoConEdificio(proyecto, r) {
    return '<div class="grupo-edificio">' + edificioGrupo(proyecto, r) +
      '<div class="grupo-datos">' +
        '<p class="etiqueta">' + icono('i-grupo') + 'Compradores</p>' +
        '<strong class="numero h3">' + r.cuposTomados + ' de ' + r.cupos + '</strong>' +
        actividadGrupo(proyecto, r) +
      '</div></div>';
  }

  // S12-F1: la participación reunida como el 15 % de la casa que se llena.
  function casaParticipacion(r) {
    var pct = porcentajeEntero(r.avanceFinanciamiento);
    var y0 = 80 - 76 * 0.95, alto = 76 * 0.15;
    return '<div class="avance avance-casa">' +
      '<svg class="casa-15" viewBox="0 0 100 84" aria-hidden="true">' +
        '<defs><clipPath id="clip-15-' + (++idCasa) + '"><path d="' + FORMA_CASA + '"/></clipPath></defs>' +
        '<path class="casa-fondo" d="' + FORMA_CASA + '"/>' +
        '<rect class="franja-hueco" x="0" y="' + y0.toFixed(1) + '" width="100" height="' + alto.toFixed(1) + '" clip-path="url(#clip-15-' + idCasa + ')"/>' +
        '<rect class="franja-reunida" x="0" y="' + y0.toFixed(1) + '" width="100" height="' + alto.toFixed(1) + '" clip-path="url(#clip-15-' + idCasa + ')" style="transform:scaleX(' + (pct / 100) + ')"/>' +
        '<path class="casa-borde" d="' + FORMA_CASA + '"/>' +
      '</svg>' +
      '<p class="avance-texto"><span>' + icono('i-inversionistas') + 'Participación de 15\u00a0% reunida</span><strong>' + pct + '\u00a0%</strong></p>' +
    '</div>';
  }

  function avanceDe(proyecto, r) {
    if (proyecto.tipo === 'venta') return '';
    return proyecto.tipo === 'conjunto' ? personasGrupo(proyecto, r) : casaParticipacion(r);
  }

  // ---------- S7-F4: explicaciones a un toque ----------
  // Una frase por término, sin jerga. Las mismas se reúnen en Perfil › Ayuda.
  var GLOSARIO = {
    'protector': { termino: 'Protector de racha', pregunta: '¿Qué es el protector de racha?',
      texto: 'Si un mes no puedes pagar tu cuota, tu racha sigue, una vez cada 6 meses. Lo ahorrado nunca se pierde.' },
    'garantia': { termino: 'Garantía del Estado', pregunta: '¿Qué es la garantía del Estado?',
      texto: 'Con la garantía FOGAES, Bci te presta el 90 % y pones solo el 10 % de pie. Sin ella, Bci presta el 80 % y juntas más tiempo.' },
    'dividendo': { termino: 'Dividendo', pregunta: '¿Qué es el dividendo?',
      texto: 'Es la cuota que pagas cada mes a Bci por el crédito hipotecario, con los seguros incluidos.' },
    'pie': { termino: 'Pie', pregunta: '¿Qué es el pie?',
      texto: 'Es la parte del precio que pones tú al comprar: 10 % si es para vivir, 5 % si es para arrendar, más los gastos de escritura.' },
    'tu-limite': { termino: 'Tu límite', pregunta: '¿Cuál es el límite?',
      texto: 'Lo que pagas al mes no puede pasar de 25 % de lo que ganan tú y tu pareja, y te tiene que quedar al menos 40 % para vivir.' },
    'carga': { termino: 'Carga', pregunta: '¿Qué es la carga?',
      texto: 'Es la parte de lo que ganan tú y tu pareja que se va cada mes en el dividendo. Bci pide que no pase de 25 %.' },
    'participacion': { termino: 'Participación', pregunta: '¿Qué es la participación de los inversionistas?',
      texto: 'Es el 15 % del departamento que ponen inversionistas. No es un préstamo: no te cobran una cuota, y el arriendo se los va recomprando.' },
    'cuenta-custodia': { termino: 'Cuenta custodia', pregunta: '¿Qué es la cuenta custodia?',
      texto: 'Es una cuenta de Bci donde entra el arriendo y desde la que se paga a los inversionistas y se recompra su parte.' },
    'terminado': { termino: 'Departamento terminado', pregunta: '¿Qué es un departamento terminado?',
      texto: 'Un departamento nuevo ya construido. Lo compras solo, sin grupo, y lo recibes al firmar.' },
    'compra-conjunto': { termino: 'Compra en grupo', pregunta: '¿Qué es la compra en grupo?',
      texto: 'Varias personas compran juntas en un proyecto y todas pagan menos: 3 % desde 5 unidades y 5 % desde 10.' },
    'comprador-respaldo': { termino: 'Comprador de respaldo', pregunta: '¿Qué es el comprador de respaldo?',
      texto: 'Si el comprador se baja antes de escriturar, puedes tomar su lugar y comprar ese departamento.' },
    'salida-sin-multa': { termino: 'Salida sin multa', pregunta: '¿Cuándo puedo salir sin multa?',
      texto: 'Si Bci no aprueba el crédito final o si la tasación sale menor que el precio, recuperas tus cuotas completas.' },
    'meta-comun': { termino: 'Entre todos llevan', pregunta: '¿Qué es lo que llevan entre todos?',
      texto: 'La suma de lo que cada comprador del grupo lleva en su propia cuenta Bci. No es un fondo común: cada uno tiene la suya.' },
    'cliente-bci': { termino: 'Inmobiliaria cliente de Bci', pregunta: '¿Qué significa que la inmobiliaria sea cliente de Bci?',
      texto: 'Bci le presta o le da servicios a esta inmobiliaria. Te lo decimos para que sepas que hay una relación entre ambos; tu crédito se evalúa con las mismas reglas.' },
    'simulacion': { termino: 'CAE', pregunta: '¿Qué es la CAE?',
      texto: 'La carga anual equivalente: el costo real del crédito en un año, con intereses, seguros y gastos. Sirve para comparar créditos entre bancos.' },
    'patrimonio': { termino: 'Tu patrimonio', pregunta: '¿Qué es tu patrimonio?',
      texto: 'Lo que vale tu departamento, sin plusvalía, menos lo que aún debes a Bci y la parte de los inversionistas.' },
    'regalo-pie': { termino: 'Regalo para tu pie', pregunta: '¿Cómo funciona el regalo para tu pie?',
      texto: 'Para un cumpleaños o una Navidad, tu familia aporta a tu cuenta Bci con un enlace, sin descargar la app. Tú eliges si ven los montos o solo el avance.' },
    'mas-barato': { termino: 'Comprar más barato', pregunta: '¿Cómo baja el precio?',
      texto: 'Un usado parecido cuesta cerca de 17,6 % menos, pero no tiene subsidio a la tasa. IVA cero baja cerca de 6,5 % los departamentos nuevos, del 1-dic-2026 al 1-dic-2027.' },
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
    // El "?" responde al primer toque: el campo con el cursor no pierde el foco, así no se vuelve
    // a dibujar el bloque (y el botón) antes del clic.
    document.addEventListener('mousedown', function (ev) {
      if (ev.target.closest('.btn-ayuda')) ev.preventDefault();
    });
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
      location.replace('#camino');
    });
  }

  // ---------- Inicio: Mi camino (S5-F6, sobre el próximo paso de S4-F6) ----------
  // Lo que se muestra según el paso de la compra: un solo número y la acción del paso.
  function proximoPaso() {
    var p = buscarProyecto(estado.compra.proyectoId);
    var e = resumen(p).escenario;
    var paso = pasoEfectivo();

    if (paso === 1) {
      var ev = evaluarCarga(e.totalMes, estado.otrasCuotas, estado.sueldoPropio, estado.sueldoPareja);
      return {
        p: p, paso: 1, etapa: 'Paso 2 de 5' + SEP + 'Postular',
        etiqueta: ev ? 'Parte de tu sueldo' : 'Revisa si califican',
        numero: ev ? formatoPorcentaje(ev.cargaTotal, 1) : null,
        detalle: ev ? SEMAFORO[ev.nivel].palabra : 'Escribe tu sueldo para ver tu carga.',
        accion: 'Seguir postulando'
      };
    }
    if (paso === 2) {
      var meta = e.alEscriturar;
      var n = mesesRestantes(meta, estado.ahorrado, estado.ahorroMensual);
      return {
        p: p, paso: 2, etapa: 'Paso 3 de 5' + SEP + 'Juntar el pie',
        etiqueta: n === null ? 'Tu meta al escriturar' : 'Te faltan',
        numero: n === null ? formatoPesos(meta) : textoMeses(n),
        visual: estado.ahorroIniciado ? '<strong class="numero display-2">' + textoMeses(n) + '</strong>' + barraHitos(estado.ahorrado, meta) : null,
        detalle: n === null ? 'Calcula en cuántos meses la juntas.' : '',
        accion: estado.ahorroIniciado ? 'Pagar mi cuota' : 'Calcular mi cuota'
      };
    }
    if (paso === 3) {
      return {
        p: p, paso: 3, etapa: 'Paso 4 de 5' + SEP + 'Firmar',
        etiqueta: 'Ya juntaste', numero: formatoPesos(metaCompra(p)),
        detalle: 'Revisa lo que firmas en palabras simples.',
        accion: 'Ir a firmar'
      };
    }
    var m = mesDelDepartamento(p, departamentoDeMiCompra(p));
    return {
      p: p, paso: 4, etapa: 'Paso 5 de 5' + SEP + 'Mi departamento, mes ' + m.mes,
      etiqueta: m.excedente > 0 ? 'Este mes te sobraron' : (estado.modo === 'arrendar' ? 'Este mes pusiste' : 'Este mes pagaste'),
      numero: formatoPesos(m.excedente > 0 ? m.excedente : m.pone),
      detalle: estado.modo !== 'arrendar' ? (estado.arriendoActual > 0 ? 'Antes pagabas ' + formatoRedondeado(estado.arriendoActual) + ' de arriendo.' : 'En algo que es tuyo.')
        : (m.porcentajeTuyo < 100 ? 'Ya es tuyo el ' + m.porcentajeTuyo + '\u00a0% del departamento.'
          : (m.excedente > 0 ? 'El arriendo alcanzó para todo el dividendo.' : 'El arriendo cubrió ' + formatoPesos(m.cascada.aUsuario) + ' del dividendo.')),
      accion: 'Ver mi departamento'
    };
  }

  // Recorrido de 5 pasos de Mi camino.
  var CAMINO = ['Elegir', 'Postular', 'Juntar el pie', 'Firmar', 'Mi departamento'];

  // S14-F1: los 5 pasos como una escalera. La figura está en el peldaño actual y sube cuando avanzas.
  var pasoEscaleraMostrado = null;
  // Personaje sin rasgos (estilo plano), con mochila: va subiendo hacia su departamento.
  var PERSONAJE = '<svg class="personaje" viewBox="0 0 32 48">' +
    '<rect class="p-mochila" x="5" y="18" width="8" height="12" rx="3"/>' +
    '<rect class="p-pierna" x="11" y="32" width="4.5" height="12" rx="2"/><rect class="p-pierna" x="17" y="32" width="4.5" height="12" rx="2"/>' +
    '<path class="p-zapato" d="M10 44 h7 v3 h-8 z M16.5 44 h7 l1 3 h-8 z"/>' +
    '<path class="p-chaqueta" d="M9 20 a7 7 0 0 1 14 0 v14 h-14 z"/>' +
    '<path class="p-brazo" d="M22 22 l5 6"/>' +
    '<circle class="p-cara" cx="16" cy="10" r="6"/>' +
    '<path class="p-pelo" d="M10 10 a6 6 0 0 1 12 -1 c-3 0 -6 -1 -8 -3 c-1 2 -2 3 -4 4 z"/>' +
    '</svg>';
  // La meta: la puerta de tu departamento, arriba del último peldaño.
  var PUERTA_META = '<svg class="puerta-meta" viewBox="0 0 30 40">' +
    '<rect class="pm-muro" x="2" y="4" width="26" height="36" rx="2"/>' +
    '<path class="pm-puerta" d="M8 40 V14 a7 7 0 0 1 14 0 V40 z"/>' +
    '<circle class="pm-pomo" cx="19" cy="28" r="1.6"/>' +
    '<rect class="pm-maceta" x="23" y="34" width="5" height="6" rx="1"/><circle class="pm-hoja" cx="25.5" cy="31" r="3.5"/>' +
    '</svg>';
  // S15-F2: adónde lleva cada peldaño. El actual abre su paso; uno hecho, su resumen.
  function rutaEscalon(n, estadoPaso) {
    if (n === 1) {
      if (estado.compra) return '#camino/proyecto/' + encodeURIComponent(estado.compra.proyectoId);
      return estado.caminoElegido ? '#camino/elegir' : '#camino/caminos';
    }
    if (estadoPaso === 'actual' && estado.compra) return '#camino/' + rutaPasoActual();
    return '#camino/' + ['', '', 'postular/datos', 'pie', 'firmar', 'mi-departamento'][n];
  }
  function recorridoCamino(paso) {
    // El paso de la compra (1 a 4) corresponde a los peldaños 2 a 5; sin compra (0), el actual es "Elegir".
    var actual = paso + 1;
    var subio = pasoEscaleraMostrado !== null && pasoEscaleraMostrado < actual ? actual - pasoEscaleraMostrado : 0;
    pasoEscaleraMostrado = actual;
    return '<ol class="escalera" aria-label="Tu camino">' + CAMINO.map(function (nombre, i) {
      var n = i + 1;
      var estadoPaso = n < actual ? 'hecho' : (n === actual ? 'actual' : 'pendiente');
      var texto = estadoPaso === 'hecho' ? ', listo' : (estadoPaso === 'actual' ? ', estás aquí' : '');
      var dentro = '<span class="peldano" aria-hidden="true">' + (estadoPaso === 'hecho' ? icono('i-check', 'peldano-check') : '') + '</span>' +
        '<span class="peldano-nombre">' + nombre + '<span class="oculto-visual">' + texto + '</span></span>';
      var enlace = estadoPaso === 'pendiente'
        ? '<button type="button" class="peldano-enlace futuro" aria-disabled="true" data-primero="' + CAMINO[actual - 1].toLowerCase() + '">' + dentro + '</button>'
        : '<a class="peldano-enlace" href="' + rutaEscalon(n, estadoPaso) + '">' + dentro + '</a>';
      return '<li class="' + estadoPaso + '" style="--n:' + i + '"' + (estadoPaso === 'actual' ? ' aria-current="step"' : '') + '>' +
        (estadoPaso === 'actual'
          ? '<span class="escalera-arriba">' +
              '<span class="escalera-figura' + (subio ? ' sube' : '') + '" style="--d:' + subio + '" aria-hidden="true">' + personajeSVG() + '</span>' +
              (n === CAMINO.length ? '<span class="escalera-meta" aria-hidden="true">' + PUERTA_META + '</span>' : '') +
            '</span>'
          : (n === CAMINO.length ? '<span class="escalera-meta" aria-hidden="true">' + PUERTA_META + '</span>' : '')) +
        enlace +
      '</li>';
    }).join('') + '</ol>';
  }

  // Avisos: máximo 2, calculados con reglas fijas sobre datos del proyecto y del ahorro.
  function avisosIA(x) {
    var p = x.p;
    var r = resumen(p);
    var avisos = [];
    var dias = p.cierre ? diasEntre(hoyDemo(), p.cierre) : 0;
    var aviso = {
      cierre: dias > 0 ? 'El proyecto cierra en ' + plural(dias, 'día', 'días') + ', el ' + formatoFecha(p.cierre) + '.' : null,
      cupos: p.tipo === 'conjunto'
        ? (grupoCerrado(p) && r.cuposLibres > 0
          ? 'El grupo cerró con ' + r.cuposTomados + ' de ' + r.cupos + ': tu descuento es ' + formatoPorcentaje(r.descuento, 0) + '.'
          : r.cuposLibres > 0
          ? 'El grupo lleva ' + r.cuposTomados + ' de ' + r.cupos + ' cupos: ' + (r.cuposLibres === 1 ? 'falta 1' : 'faltan ' + r.cuposLibres) + ' para completarlo.'
          : 'El grupo ya está completo.')
        : p.tipo === 'venta' ? null
        : 'Ya se reunió el ' + formatoPorcentaje(r.avanceFinanciamiento, 0) + ' de la participación de 15\u00a0% con inversionistas.'
    };
    if (x.paso === 2 && estado.ahorroIniciado) {
      var meta = metaCompra(p);
      var siguiente = HITOS_AHORRO.filter(function (h) { return avance(estado.ahorrado, meta) < h; })[0];
      if (siguiente) {
        avisos.push('Te faltan ' + formatoPesos(Math.ceil(meta * siguiente - estado.ahorrado)) +
          ' para llegar al ' + porcentajeEntero(siguiente) + '\u00a0% de tu meta.');
      }
      if (aviso.cierre) avisos.push(aviso.cierre);
    } else if (x.paso === 4) {
      var m = mesDelDepartamento(p, departamentoDeMiCompra(p));
      if (estado.modo === 'arrendar' && m.porcentajeTuyo < 100 && m.faltanRecompra && !m.plazo.superaTope) {
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
    $('inicio-principal').innerHTML =
      '<header class="encabezado">' + FIGURAS +
        campana() + '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tu camino</h1>' +
        '<p class="texto-apoyo">' + esc(x.p.nombre) + SEP + esc(x.p.comuna) + '</p>' +
      '</header>' +
      '<section class="tarjeta proximo" aria-label="Dónde vas">' +
        '<p class="chip">' + x.etapa + '</p>' +
        '<p class="etiqueta">' + x.etiqueta + '</p>' +
        (x.visual ? x.visual : (x.numero ? '<strong class="numero display-2">' + x.numero + '</strong>' : '')) +
        (x.detalle ? '<p class="texto-apoyo">' + x.detalle + '</p>' : '') +
      '</section>' +
      '<div class="accion">' +
        '<a href="#camino/' + rutaPasoActual() + '" class="btn btn-primario btn-lg btn-bloque">' + x.accion + '</a>' +
      '</div>' +
      recorridoCamino(x.paso) +
      (avisos.length
        ? '<section class="tarjeta bloque avisos" aria-labelledby="titulo-avisos">' +
            '<h2 class="h5" id="titulo-avisos">Avisos</h2>' +
            '<ul class="lista-check">' + avisos.map(function (a) {
              return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + a + '</span></li>';
            }).join('') + '</ul>' +
          '</section>'
        : '');
    $('inicio-principal').insertAdjacentHTML('beforeend', lineaInversiones());
  }

  // Solo inversiones, sin compra: el número es lo cobrado a la fecha (S6-F4).
  function renderSoloInversiones() {
    var lista = estado.inversiones;
    $('inicio-principal').innerHTML =
      '<header class="encabezado">' + FIGURAS +
        campana() + '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tus inversiones</h1>' +
        '<p class="texto-apoyo">Tienes parte del 15\u00a0% de departamentos de otros compradores: 6\u00a0% al año en UF.</p>' +
      '</header>' +
      '<section class="tarjeta proximo" aria-label="Lo cobrado">' +
        '<p class="etiqueta">Cobrado a la fecha</p>' +
        '<strong class="numero display-2">' + formatoPesos(ufAPesos(cobradoUF(datosCobro(lista)))) + '</strong>' +
        '<p class="texto-apoyo">' + plural(lista.length, 'inversión', 'inversiones') + SEP + 'el próximo mes recibes ' +
          formatoPesos(ufAPesos(cuotaMensualTotalUF(datosCobro(lista)))) + '.</p>' +
      '</section>' +
      '<div class="accion">' +
        '<a href="#inversiones" class="btn btn-primario btn-lg btn-bloque">Ver mis inversiones</a>' +
      '</div>' +
      '<p class="texto-centro"><button type="button" class="enlace" id="btn-mi-camino">Ver mi camino para comprar</button></p>';
    $('btn-mi-camino').addEventListener('click', function () { estado.preguntasListas = false; estado.pregunta = 1; renderPreguntas(); });
  }

  // ---------- Inicio = Tu camino (S11-F0 y S11-F2) ----------
  // Siempre responde "¿cuánto falta y cuándo llegas?", con un número y una acción según la etapa.
  // El logo de Bci sobre el título de Mi camino (reemplaza las cuatro figuras sueltas).
  var FIGURAS = '<img class="logo-bci" src="logo_bci_negro.svg" alt="Bci" width="52" height="24">';

  function icono(id, clase) { return '<svg class="' + (clase || 'icono') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  // S11-F1: número que cuenta (con movimiento reducido, va directo al valor final).
  function contarHasta(el, desde, hasta, formato) {
    if (!el) return;
    var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducir || desde === null || desde === undefined || desde === hasta || typeof hasta !== 'number') {
      el.textContent = formato(hasta);
      return;
    }
    var inicio = null;
    var paso = function (t) {
      if (inicio === null) inicio = t;
      var k = Math.min(1, (t - inicio) / 700);
      var suave = 1 - Math.pow(1 - k, 3);
      el.textContent = formato(Math.round(desde + (hasta - desde) * suave));
      if (k < 1 && document.body.contains(el)) requestAnimationFrame(paso);
    };
    el.textContent = formato(desde);
    requestAnimationFrame(paso);
  }

  // S11-F1: aviso flotante que confirma lo que pasó (role="status": también lo lee el lector de pantalla).
  var temporizadorToast = null;
  var toastDesde = 0;
  // S17-F4: al cambiar de pantalla, el toast se cierra si ya se alcanzó a leer (más de 1,5 s).
  function cerrarToastViejo() {
    var t = $('toast');
    if (t && !t.hidden && Date.now() - toastDesde > 1500) { t.hidden = true; clearTimeout(temporizadorToast); }
  }
  function toast(texto) {
    var t = $('toast');
    t.textContent = texto;
    t.hidden = false;
    toastDesde = Date.now();
    t.classList.remove('toast-entra');
    void t.offsetWidth;
    t.classList.add('toast-entra');
    clearTimeout(temporizadorToast);
    // 3,5 s para lo corto y 5 s para lo que se demora en leer.
    temporizadorToast = setTimeout(function () { t.hidden = true; }, texto.length > 40 ? 5000 : 3500);
  }

  function barraPreguntas(n) {
    return '<div class="barra-preguntas" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="' + n +
      '" aria-label="Pregunta ' + n + ' de 4">' +
      [1, 2, 3, 4].map(function (i) { return '<span class="' + (i <= n ? 'lleno' : '') + '"></span>'; }).join('') + '</div>';
  }

  function textoPlazoMeses(n) { return n === 0 ? 'Ya lo tienes' : textoMeses(n); }

  // Las 3 preguntas de la primera vez: para qué, sus ingresos y su ahorro.
  function renderPreguntas() {
    document.body.classList.add('en-preguntas');
    var n = estado.pregunta || 1;
    var c = $('inicio-principal');
    // S16-F2: arriba, tu escena. Cada respuesta le suma algo (tu pareja, tu familia, tu mascota).
    var cabeza = function (titulo) {
      return '<header class="encabezado">' + FIGURAS + barraPreguntas(n) +
        '<div class="escena-preguntas">' +
          '<div class="escena-figuras" aria-hidden="true">' + escena(84, 'escena-av') + '</div>' +
        '</div>' +
        '<h1 id="titulo-inicio" class="h2" tabindex="-1">' + titulo + '</h1></header>';
    };
    var atras = n > 1 ? '<p class="texto-centro"><button type="button" class="enlace" id="btn-atras-pregunta">Atrás</button></p>' : '';

    if (n === 1) {
      var opcion = function (modo, ic, texto) {
        return '<button type="button" class="opcion-grande" role="radio" aria-checked="' + (estado.modoElegido && estado.modo === modo) + '" data-modo="' + modo + '">' +
          icono(ic, 'opcion-icono') + '<span>' + texto + '</span></button>';
      };
      c.innerHTML = cabeza('¿Para qué quieres tu departamento?') +
        '<div class="opciones-grandes" role="radiogroup" aria-labelledby="titulo-inicio">' +
          opcion('vivir', 'i-casa', 'Para vivir') + opcion('arrendar', 'i-llave', 'Para arrendar') +
        '</div>';
      c.querySelectorAll('.opcion-grande').forEach(function (b) {
        b.addEventListener('click', function () {
          estado.modo = b.dataset.modo;
          estado.modoElegido = true;
          guardarEstado();
          estado.pregunta = 2;
          renderPreguntas();
          $('titulo-inicio').focus();
        });
      });
      return;
    }

    if (n === 2) {
      var quien = function (v, texto) {
        return '<button type="button" class="chip-opcion" role="radio" aria-checked="' + (estado.conQuien === v) + '" data-quien="' + v + '">' + texto + '</button>';
      };
      c.innerHTML = cabeza(estado.conQuien === 'solo' ? '¿Cuánto ganas?' : '¿Cuánto ganan?') +
        '<div class="con-quien">' +
          '<p class="etiqueta" id="titulo-con-quien">¿Con quién vas a vivir?</p>' +
          '<div class="chips-opcion" role="radiogroup" aria-labelledby="titulo-con-quien">' +
            quien('solo', 'Solo yo') + quien('pareja', 'Con mi pareja') + quien('familia', 'Con mi familia') +
          '</div>' +
          (estado.conQuien === 'familia' ? '<button type="button" class="enlace" id="btn-agregar-familia" aria-haspopup="dialog">Agregar a alguien de tu familia</button>' : '') +
        '</div>' +
        '<div class="formulario">' +
          campoDinero('q-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          (estado.conQuien === 'solo' ? '' : campoDinero('q-pareja', 'Sueldo de tu pareja', estado.sueldoPareja)) +
          campoDinero('q-otras', 'Otras cuotas al mes', estado.otrasCuotas) +
        '</div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-siguiente">Siguiente</button></div>' +
        atras;
      if (estado.conQuien === 'solo') { estado.sueldoPareja = null; guardarEstado(); }
      [['q-propio', 'sueldoPropio'], ['q-pareja', 'sueldoPareja'], ['q-otras', 'otrasCuotas']].forEach(function (x) {
        if (!$(x[0])) return;
        $(x[0]).addEventListener('input', function () {
          estado[x[1]] = formatearCampo($(x[0]));
          guardarEstado();
          if (x[1] !== 'otrasCuotas') validarSueldo($(x[0]), estado[x[1]], false);
        });
      });
      var volverA = function (sel) { renderPreguntas(); var el = document.querySelector(sel); if (el) el.focus(); };
      c.querySelectorAll('[data-quien]').forEach(function (b) {
        b.addEventListener('click', function () {
          estado.conQuien = b.dataset.quien;
          guardarEstado();
          volverA('[data-quien="' + b.dataset.quien + '"]');
        });
      });
      if ($('btn-agregar-familia')) $('btn-agregar-familia').addEventListener('click', function () {
        agregarAlEquipo($('btn-agregar-familia'), null, function () { volverA('#btn-agregar-familia'); }, 'mamá');
      });
      $('btn-siguiente').addEventListener('click', function () {
        if (!validarSueldo($('q-propio'), estado.sueldoPropio, true)) { temblar($('q-propio')); $('q-propio').focus(); return; }
        if (estado.sueldoPareja === 0 && $('q-pareja')) { validarSueldo($('q-pareja'), 0, false); $('q-pareja').focus(); return; }
        estado.pregunta = 3;
        renderPreguntas();
        $('titulo-inicio').focus();
      });
    } else if (n === 4) {
      return renderPreguntaRango(cabeza('¿Cuánto quieres que cueste?'), atras);
    } else {
      var arrendar = estado.modo === 'arrendar';
      c.innerHTML = cabeza('¿Cuánto ahorras?') +
        '<div class="formulario">' +
          campoDinero('q-ahorro', 'Lo que tienes ahorrado', estado.ahorroActual) +
          campoDinero('q-mensual', 'Lo que puedes juntar al mes', estado.ahorroMensual) +
          campoDinero('q-arriendo', arrendar ? 'Arriendo que pagas hoy' : 'Arriendo que pagas hoy (opcional)', estado.arriendoActual) +
        '</div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-camino">Siguiente</button></div>' +
        atras;
      [['q-ahorro', 'ahorroActual'], ['q-mensual', 'ahorroMensual'], ['q-arriendo', 'arriendoActual']].forEach(function (x) {
        if (!$(x[0])) return;
        $(x[0]).addEventListener('input', function () {
          estado[x[1]] = formatearCampo($(x[0]));
          guardarEstado();
          if (x[1] === 'ahorroMensual') validarMonto($('q-mensual'), estado.ahorroMensual, false, '', 'Tiene que ser mayor a $0.');
        });
      });
      $('btn-ver-camino').addEventListener('click', function () {
        if (!(estado.ahorroMensual > 0)) {
          validarMonto($('q-mensual'), estado.ahorroMensual, true, 'Escribe cuánto puedes juntar al mes.', 'Tiene que ser mayor a $0.');
          temblar($('q-mensual'));
          $('q-mensual').focus();
          return;
        }
        estado.pregunta = 4;
        guardarEstado();
        renderPreguntas();
        window.scrollTo(0, 0);
        $('titulo-inicio').focus();
      });
    }
    if (n !== 4 && $('btn-atras-pregunta')) $('btn-atras-pregunta').addEventListener('click', function () {
      estado.pregunta = n - 1;
      renderPreguntas();
      $('titulo-inicio').focus();
    });
  }

  // Pregunta 4: el rango de precio del departamento. Cada rango dice cuántos departamentos hay
  // (de los proyectos de su modo) y si le alcanza hoy.
  function proyectosDelModo() {
    return PROYECTOS.filter(function (p) {
      if (estado.modo === 'vivir' && p.tipo === 'financiamiento') return false;
      if (estado.modo === 'arrendar' && p.tipo === 'venta') return false;
      return estado.modo !== 'arrendar' || resumen(p).pasaFiltro;
    });
  }
  function departamentosEnRango(rango) {
    return proyectosDelModo().filter(function (p) { return enRango(departamentosDe(p.id)[0].listaUF, rango); });
  }
  function textoRango(rango) {
    return rango.id === 'hasta-1500' ? 'Hasta ' + formatoUF(rango.hasta) : formatoUF(rango.desde) + ' a ' + formatoMiles(rango.hasta);
  }
  function millones(uf) { return '$' + (ufAPesos(uf) / 1e6).toFixed(0) + ' millones'; }

  function renderPreguntaRango(cabeza, atras) {
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo);
    var c = $('inicio-principal');
    var conteos = RANGOS_PRECIO.map(function (rg) { return departamentosEnRango(rg).length; });
    var conteoIgual = conteos.every(function (x) { return x === conteos[0]; });
    c.innerHTML = cabeza +
      '<ul class="opciones-departamento" role="radiogroup" aria-labelledby="titulo-inicio">' + RANGOS_PRECIO.map(function (rg, i) {
        var n = conteos[i];
        var alcanza = cap !== null && rg.desde <= cap;
        return '<li><button type="button" class="opcion-departamento" role="radio" aria-checked="' + (estado.rangoPrecio === rg.id) + '" data-rango="' + rg.id + '"' +
          (n === 0 ? ' aria-disabled="true" disabled' : '') + '>' +
          icono('i-casa', 'icono-grande') +
          '<span class="opcion-texto"><strong>' + textoRango(rg) + '</strong>' +
            '<small>' + (rg.id === 'hasta-1500' ? 'Hasta ' + millones(rg.hasta) : millones(rg.desde).replace(' millones', '') + ' a ' + millones(rg.hasta)) + '</small>' +
            ((n === 0 || !conteoIgual || !alcanza) ? '<span class="chip-fila">' +
              (n === 0 || !conteoIgual ? '<span class="chip chip-propuesta">' + (n === 0 ? 'Sin departamentos hoy' : plural(n, 'departamento', 'departamentos')) + '</span>' : '') +
              (n > 0 && !alcanza ? ' <span class="chip chip-no-alcanza">No te alcanza hoy</span>' : '') + '</span>' : '') + '</span>' +
        '</button></li>';
      }).join('') + '</ul>' +
      atras;
    c.querySelectorAll('.opcion-departamento:not([disabled])').forEach(function (b) {
      b.addEventListener('click', function () {
        elegirRango(b.dataset.rango);
        estado.preguntasListas = true;
        estado.pregunta = 1;
        guardarEstado();
        renderInicio();
        window.scrollTo(0, 0);
        $('titulo-inicio').focus();
      });
    });
    if ($('btn-atras-pregunta')) $('btn-atras-pregunta').addEventListener('click', function () {
      estado.pregunta = 3;
      renderPreguntas();
      $('titulo-inicio').focus();
    });
  }

  // Cambiar el rango borra el camino elegido: el camino depende del precio.
  function elegirRango(id) {
    if (estado.rangoPrecio !== id) estado.caminoElegido = null;
    estado.rangoPrecio = id;
    guardarEstado();
  }

  // S12-F6 adelantado: el campo inválido tiembla (siempre junto a su mensaje de error).
  function temblar(el) {
    if (!el) return;
    var caja = el.closest('.campo') || el;
    caja.classList.remove('temblar');
    void caja.offsetWidth;
    caja.classList.add('temblar');
  }

  // Tu camino antes de comprar: el plazo del camino recomendado y la acción que toca.
  var plazoMostrado = null;
  // Opción A del inicio (etapa Elegir): tu edificio de noche con tu ventana, el plazo en grande
  // y "Si juntas al mes", que recalcula el plazo en vivo.
  function plazosCon(perfilBase, mensual) {
    var pf = Object.assign({}, perfilBase, { ahorroMensual: mensual });
    var rango = rangoActual();
    var rr = recomendarCamino(pf);
    var eligio = !!estado.caminoElegido && !CAMINOS[estado.caminoElegido].ficha;
    var idc = eligio ? estado.caminoElegido : rr.id;
    var nc = eligio ? numerosCamino(idc, listaMeta(), pf) : rr.numeros;
    var desde = eligio ? numerosCamino(idc, rango.desde, pf).meses : plazoRango(pf, rango).desde.numeros.meses;
    return { desde: desde, techo: rr.todaviaNo && !eligio ? desde : nc.meses };
  }
  function textoPlazos(x) {
    if (x.desde !== null && x.techo !== null && x.desde !== x.techo) return (x.desde === 0 ? 'Ya' : x.desde) + ' a ' + textoMeses(x.techo);
    return x.techo === null ? '—' : textoPlazoMeses(x.techo);
  }
  // S16-F3: tu ventana es más grande (2 columnas × 3 pisos) y adentro estás tú con quienes viven contigo.
  var VENTANAS_NOCHE = [1, 0, 1, 'tu', 1, 0, 1, 1, 1, 0];


  // ---------- Sprint 17: un solo plazo, piezas que se suman y texto mínimo (modo vivir) ----------
  function piezasOn() { return estado.piezas || {}; }
  function perfilPiezas() { return { ahorroActual: estado.ahorroActual || 0, ahorroMensual: estado.ahorroMensual }; }
  function deptoDeProyecto(p) {
    var d = departamentosDe(p.id)[0];
    return { listaUF: d.listaUF, enObra: p.tipo === 'conjunto' && (p.etapaObra || 0) < 4,
      mesesEntrega: mesesParaEntrega(p),
      descuento: p.tipo === 'conjunto' ? resumenBase(p).descuento : 0 };
  }
  // Los departamentos de verdad que hay para vivir en su rango.
  function candidatosVivir() {
    var r = rangoActual();
    return PROYECTOS.filter(function (p) { return paraVivir(p) && (!r || enRango(departamentosDe(p.id)[0].listaUF, r)); });
  }
  // Sin departamento elegido: el piso y el techo del rango, con la entrega más próxima y la más lejana.
  // S18-F6: los departamentos del rango que calzan con las piezas (grupo = en obra; sin IVA = terminados).
  // El piso es el caso más rápido (un terminado, si hay) y el techo el más lento (la entrega más lejana).
  function deptosRango(on) {
    on = on || {};
    var r = rangoActual() || { desde: 2000, hasta: LISTA_REFERENCIA_UF };
    var c = candidatosVivir().map(deptoDeProyecto);
    if (on.grupo) c = c.filter(function (x) { return x.enObra; });
    else if (on.iva) c = c.filter(function (x) { return !x.enObra; });
    var obras = c.filter(function (x) { return x.enObra; });
    var hayTerminado = c.some(function (x) { return !x.enObra; });
    var entregas = obras.map(function (x) { return x.mesesEntrega; });
    // S18-F1: el descuento en grupo es el que los grupos del rango ya tienen hoy, no el 5 % de completarlos.
    var desc = obras.length ? Math.max.apply(null, obras.map(function (x) { return x.descuento; })) : 0;
    var hasta = r.hasta;
    if (on.subsidio) hasta = Math.min(hasta, SUPUESTOS_PIEZAS.topeSubsidioUF / ((on.grupo ? 1 - desc : 1) * (on.iva ? 1 - SUPUESTOS_PIEZAS.bajaIVA : 1)));
    var conObra = obras.length > 0;
    return {
      desde: { listaUF: r.desde, enObra: conObra && !hayTerminado, mesesEntrega: conObra && !hayTerminado ? Math.min.apply(null, entregas) : 0, descuento: desc },
      hasta: { listaUF: hasta, enObra: conObra, mesesEntrega: conObra ? Math.max.apply(null, entregas) : 0, descuento: desc }
    };
  }
  // Bloqueos de la pieza contando lo que hay de verdad en su rango (la app solo ofrece lo que puede cumplir).
  function bloqueoApp(id, on) {
    var c = candidatosVivir();
    // S18-F6: el grupo compra en obra y sin IVA es solo para terminados: no se suman.
    if (id === 'iva' && on && on.grupo) return { razon: 'En obra', como: 'Sin IVA es para terminados, y el grupo compra en obra.' };
    if (id === 'grupo' && on && on.iva) return { razon: 'Terminado', como: 'El grupo compra en obra. Quita "Sin IVA" para sumarlo.' };
    if (id === 'iva' && !c.some(function (p) { return !deptoDeProyecto(p).enObra; }))
      return { razon: 'Sin terminados', como: 'Hoy no hay departamentos terminados en tu rango.' };
    if (id === 'subsidio' && !c.some(function (p) {
      var d = deptoDeProyecto(p);
      var o = Object.assign({}, on, { subsidio: false });
      if (o.grupo && !d.enObra || o.iva && d.enObra) return false;
      return precioConPiezas(d.listaUF, o, d.descuento) <= SUPUESTOS_PIEZAS.topeSubsidioUF + 1e-9;
    })) return { razon: 'Sobre UF 2.200', como: 'En tu rango no hay de hasta UF 2.200. Prueba otro rango.' };
    if (id === 'grupo' && !c.length) return { razon: 'Sin grupos', como: 'Hoy no hay grupos en tu rango.' };
    return null;
  }
  function piezasValidas(on) {
    var v = {};
    ORDEN_PIEZAS.forEach(function (id) { v[id] = !!on[id] && !bloqueoApp(id, on); });
    return v;
  }
  // El plazo de Mi camino: un rango (piso y techo) mientras no haya departamento.
  function plazoVivir(mensual, onForzado) {
    var on = piezasValidas(onForzado || piezasOn());
    var pf = perfilPiezas();
    if (mensual) pf.ahorroMensual = mensual;
    var d = deptosRango(on);
    return { on: on, desde: calcularPiezas(pf, on, d.desde, hoyDemo()), hasta: calcularPiezas(pf, on, d.hasta, hoyDemo()), deptos: d, perfil: pf };
  }
  // S18-F5: "Todavía no" con piezas. Justo = ni el más barato del rango cabe con las piezas que elegiste.
  function razonJusto(res) { return res && res.dividendo ? razonTodaviaNo(perfilActual(), res.dividendo) : null; }
  // ¿Algún departamento real del rango cabe con estas piezas? (no el piso teórico del rango:
  // "Así cabe" tiene que poder cumplirse al elegir). Devuelve { cabe, razon } con el más barato.
  function evaluarCabe(onEntrada) {
    var v = piezasValidas(onEntrada || piezasOn());
    var pf = perfilPiezas();
    var mejor = null;
    candidatosVivir().forEach(function (p) {
      var d = deptoDeProyecto(p);
      if (v.grupo && !d.enObra || v.iva && d.enObra) return;
      var res = calcularPiezas(pf, Object.assign({}, v, { grupo: p.tipo === 'conjunto' }), d, hoyDemo());
      if (!mejor || res.dividendo < mejor.dividendo) mejor = res;
    });
    if (!mejor) return { cabe: true, razon: null };
    var razon = razonJusto(mejor);
    return { cabe: !razon, razon: razon };
  }
  // ¿Esta pieza (sumada a las que ya están) hace que quepa?
  // 'sola' si basta con esta; 'con-otra' si cabe sumando una pieza más que también lo baja; si no, false.
  function cabeCon(id) {
    var on = Object.assign({}, piezasOn()); on[id] = true;
    if (!piezasValidas(on)[id]) return false;
    if (evaluarCabe(on).cabe) return 'sola';
    var otra = ['subsidio', 'iva', 'grupo'].some(function (o) {
      if (o === id || on[o]) return false;
      var on2 = Object.assign({}, on); on2[o] = true;
      var sinEsta = Object.assign({}, piezasOn()); sinEsta[o] = true;
      // Solo cuenta si esta pieza hace falta: con la otra sola no basta.
      return piezasValidas(on2)[o] && evaluarCabe(on2).cabe && !evaluarCabe(sinEsta).cabe;
    });
    return otra ? 'con-otra' : false;
  }
  // El plazo de una compra o de un departamento elegido (un solo número).
  function plazoDepartamento(p, mensual) {
    var on = Object.assign({}, piezasOn(), { grupo: p.tipo === 'conjunto' });
    var pf = perfilPiezas();
    if (mensual) pf.ahorroMensual = mensual;
    return calcularPiezas(pf, on, deptoDeProyecto(p), hoyDemo());
  }
  // Lo que hay que juntar antes de firmar en una compra: para vivir, con las piezas que aplican a ese departamento.
  function metaCompra(p) {
    return estado.modo === 'vivir' && paraVivir(p) ? plazoDepartamento(p).meta : resumen(p).escenario.alEscriturar;
  }
  function ahorradoTuPie(meta) { return estado.ahorroIniciado ? estado.ahorrado : Math.min(meta, estado.ahorroActual || 0); }
  // S17-F1: Tu pie usa la misma regla que Inicio: lo que falta y la entrega del edificio (si es en obra).
  function plazoTuPie(p, meta) {
    var pisos = [];
    if (estado.modo === 'vivir') {
      var d = deptoDeProyecto(p);
      if (d.enObra && d.mesesEntrega > 0) pisos.push({ meses: d.mesesEntrega, freno: 'entrega' });
      var esp = esperaMinima(p);
      if (esp.freno === 'cuenta-vivienda') pisos.push({ meses: esp.meses, freno: 'cuenta-vivienda' });
    }
    return plazoConPisos(meta - ahorradoTuPie(meta), estado.ahorroMensual, pisos);
  }
  function textoMesesRango(a, b) {
    if (a === null || b === null) return '—';
    if (a === b) return a === 0 ? 'Ya' : textoMeses(a);
    return (a === 0 ? 'Ya' : a) + ' a ' + textoMeses(b);
  }
  function textoLlavesRango(x) {
    if (x.desde.meses === null) return '';
    if (x.desde.meses === x.hasta.meses) return x.hasta.llaves;
    var a = x.desde.llaves.split(' de '), b = x.hasta.llaves.split(' de ');
    return 'Entre ' + (a[1] === b[1] ? a[0] : x.desde.llaves) + ' y ' + x.hasta.llaves;
  }
  var FRENO = { ahorro: 'Te frena: juntar tu pie', entrega: 'Te frena: la entrega', 'cuenta-vivienda': 'Te frena: tu cuenta de vivienda', ninguno: 'Nada te frena' };
  function vsArriendo(div) {
    if (!(estado.arriendoActual > 0)) return '';
    var max = Math.max(estado.arriendoActual, div);
    return '<div class="vs-arriendo" aria-hidden="true">' +
      '<span>Arriendo hoy</span><span class="b gris" style="transform:scaleX(' + (estado.arriendoActual / max).toFixed(3) + ')"></span><b>' + formatoRedondeado(estado.arriendoActual) + '</b>' +
      '<span>Tu departamento</span><span class="b azul" style="transform:scaleX(' + (div / max).toFixed(3) + ')"></span><b>' + formatoRedondeado(div) + '</b>' +
    '</div>';
  }

  // S17-F8: Tu camino en modo vivir: ahora (tus llaves) y después (lo que pagas al mes, junto a tu arriendo).
  function renderTuCaminoVivir() {
    var c = $('inicio-principal');
    var perfil = perfilActual();
    var rec = recomendarCamino(perfil);
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var minimo = 100000, paso = 50000;
    var maximo = Math.max(1000000, Math.ceil(ingreso * 0.4 / paso) * paso);
    var mensual = Math.min(maximo, Math.max(minimo, estado.ahorroMensual || 300000));
    var x = plazoVivir(mensual);
    var rango = rangoActual();
    var eligio = !!estado.caminoElegido;
    var siempre = plazoCreditoSiempre(x.perfil, x.deptos.hasta.listaUF);
    var razon = evaluarCabe().razon;
    var justo = !!razon;
    var techoJusto = !justo && !!razonJusto(x.hasta);

    c.innerHTML =
      '<header class="encabezado">' + FIGURAS + campana() +
        '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tu camino</h1>' +
        '<p class="texto-apoyo">' + textoRango(rango) + SEP + '<button type="button" class="enlace" id="btn-cambiar-departamento" aria-haspopup="dialog">Cambiar</button></p>' +
      '</header>' +
      (justo
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-plazo"><p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-plazo">' + razon + ' ' + ayuda('tu-limite') + '</h2></section>'
        : '<section class="noche" aria-labelledby="titulo-plazo">' +
            '<span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">Tus llaves</p>' +
            '<strong class="numero noche-plazo" id="numero-plazo" aria-live="polite">' + textoMesesRango(x.desde.meses, x.hasta.meses) + '</strong>' +
            '<p class="noche-sub" id="llaves-fecha">' + textoLlavesRango(x) + '</p>' +
            '<div class="noche-edificio" aria-hidden="true"><span class="noche-techo"></span><div class="noche-fachada">' +
              VENTANAS_NOCHE.map(function (v) { return v === 'tu' ? '<span class="nv tu" id="mi-ventana">' + escena(46, 'ventana-av') + '</span>' : '<span class="nv' + (v ? ' on' : '') + '"></span>'; }).join('') +
            '</div></div>' +
            '<span class="freno-llaves" id="freno-llaves">' + FRENO[x.hasta.freno] + '</span>' +
            (techoJusto ? '<p class="noche-aviso">' + icono('i-alerta') + 'Los de ' + formatoUF(x.deptos.hasta.listaUF) + ' te dejan poco para vivir.</p>' : '') +
          '</section>') +
      '<section class="tarjeta bloque si-juntas" aria-labelledby="titulo-si-juntas">' +
        '<p class="si-juntas-fila"><label for="rango-mensual" id="titulo-si-juntas">Si juntas al mes</label><strong class="numero" id="valor-mensual">' + formatoRedondeado(mensual) + '</strong></p>' +
        '<input type="range" id="rango-mensual" min="' + minimo + '" max="' + maximo + '" step="' + paso + '" value="' + mensual + '" aria-valuetext="' + formatoRedondeado(mensual) + ' al mes: ' + textoMesesRango(x.desde.meses, x.hasta.meses) + '">' +
      '</section>' +
      '<section class="tarjeta bloque despues" aria-labelledby="titulo-despues">' +
        '<p class="etiqueta" id="titulo-despues">Después, pagas al mes</p>' +
        '<strong class="numero h3">' + formatoRango(x.desde.dividendo, x.hasta.dividendo) + '</strong>' +
        vsArriendo(x.hasta.dividendo) +
      '</section>' +
      (siempre !== null ? '<p class="texto-apoyo linea-siempre">Sin garantía: ' + textoMeses(siempre) + ' ' + ayuda('garantia') + '</p>' : '') +
      '<div class="accion-fija">' + (eligio
        ? '<a href="#camino/elegir" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-departamentos">Elegir departamento</a>'
        : '<a href="#camino/caminos" class="btn btn-primario btn-lg btn-bloque">' + (justo ? 'Ver qué lo cambia' : 'Ver cómo llegar antes') + '</a>') +
      '</div>' +
      (eligio ? '<p class="texto-centro"><a href="#camino/caminos" class="enlace">Ver cómo llegar antes</a></p>' : '') +
      recorridoCamino(0) +
      lineaInversiones();

    var rm = $('rango-mensual');
    var pintar = function () { var v = Number(rm.value); rm.style.setProperty('--lleno', ((v - minimo) / (maximo - minimo) * 100).toFixed(1) + '%'); return v; };
    pintar();
    rm.addEventListener('input', function () {
      var v = pintar();
      var y = plazoVivir(v);
      $('valor-mensual').textContent = formatoRedondeado(v);
      if ($('numero-plazo')) {
        $('numero-plazo').textContent = textoMesesRango(y.desde.meses, y.hasta.meses);
        $('llaves-fecha').textContent = textoLlavesRango(y);
        $('freno-llaves').textContent = FRENO[y.hasta.freno];
        var ventana = $('mi-ventana'); ventana.classList.remove('brilla'); void ventana.offsetWidth; ventana.classList.add('brilla');
      }
      rm.setAttribute('aria-valuetext', formatoRedondeado(v) + ' al mes: ' + textoMesesRango(y.desde.meses, y.hasta.meses));
    });
    rm.addEventListener('change', function () { estado.ahorroMensual = Number(rm.value); guardarEstado(); });
    if ($('btn-ver-departamentos')) $('btn-ver-departamentos').addEventListener('click', function () { prepararProyectos(estado.caminoElegido); });
    $('btn-cambiar-departamento').addEventListener('click', function () { abrirCambiarRango($('btn-cambiar-departamento')); });
  }

  // S17-F9: Llega antes. Cada pieza es una fila: nombre, efecto, "?" e interruptor. La recomendada lleva ★.
  var piezaAbierta = null, mesesLlegaAntes = null;
  function renderLlegaAntes() {
    var cont = $('caminos-contenido');
    var x = plazoVivir();
    var on = x.on;
    var rango = rangoActual();
    var razon = evaluarCabe(on).razon;
    var justo = !!razon;
    var mejor = mejorPieza(x.perfil, on, x.deptos.hasta, hoyDemo());
    if (mejor && bloqueoApp(mejor, on)) mejor = null;
    // S18-F5: con "Todavía no", la recomendada es la primera que lo cambia (y que existe hoy).
    var cambia = {};
    if (justo) {
      ORDEN_PIEZAS.forEach(function (id) { cambia[id] = !on[id] && cabeCon(id); });
      mejor = ['subsidio', 'iva', 'grupo'].filter(function (id) { return cambia[id] === 'sola' && !bloqueoApp(id, on); })[0] ||
        ['subsidio', 'iva', 'grupo'].filter(function (id) { return cambia[id] && !bloqueoApp(id, on); })[0] || null;
    }
    var siempre = plazoCreditoSiempre(x.perfil, x.deptos.hasta.listaUF);
    // Si todas las piezas de un grupo son propuesta, el chip va una sola vez, en su título.
    var grupoPropuesta = {};
    ['menos', 'ayuda'].forEach(function (g) {
      grupoPropuesta[g] = ORDEN_PIEZAS.filter(function (id) { return PIEZAS_VIVIR[id].grupo === g; })
        .every(function (id) { return !PIEZAS_VIVIR[id].existeHoy; });
    });
    var fila = function (id) {
      var pz = PIEZAS_VIVIR[id];
      var b = bloqueoApp(id, on) || (id === 'iva' || id === 'subsidio' ? bloqueoPieza(id, on, x.deptos.desde) : null);
      var activo = !!on[id];
      var ef = b ? b.razon : justo && activo ? 'Sumado' : justo && !activo ? (cambia[id] === 'sola' ? 'Así cabe' : cambia[id] ? 'Con otra, cabe' : 'Aún no') : efectoPieza(id, x.perfil, on, x.deptos.hasta, hoyDemo()).texto;
      return '<li class="pieza-fila' + (activo ? ' on' : '') + (b ? ' bloq' : '') + (justo && !b && !activo ? (cambia[id] ? ' cabe' : ' aun') : '') + '">' +
        '<span class="pieza-nombre">' + (mejor === id ? '<span class="pieza-estrella" aria-label="Recomendado">★</span>' : '') + pz.nombre +
          (pz.existeHoy || grupoPropuesta[pz.grupo] ? '' : '<span class="chip-propuesta-mini">Propuesta</span>') + '</span>' +
        '<span class="pieza-efecto">' + ef + '</span>' +
        '<button type="button" class="pieza-q" data-q="' + id + '" aria-expanded="' + (piezaAbierta === id) + '" aria-controls="cond-' + id + '" aria-label="Condiciones: ' + pz.nombre + '">?</button>' +
        '<button type="button" class="pieza-sw" role="switch" data-pieza="' + id + '" aria-checked="' + activo + '" aria-label="' + pz.nombre + '"' + (b ? ' aria-disabled="true"' : '') + '></button>' +
        '<span class="pieza-cond" id="cond-' + id + '"' + (piezaAbierta === id ? '' : ' hidden') + '>' + pz.cond + (b ? ' ' + b.como : '') + '</span>' +
      '</li>';
    };
    var grupo = function (g, titulo) {
      return '<h2 class="grupo-piezas" id="titulo-' + g + '">' + titulo + (grupoPropuesta[g] ? '<span class="chip-propuesta-mini">Propuesta</span>' : '') + '</h2><ul class="lista-piezas" aria-labelledby="titulo-' + g + '">' +
        ORDEN_PIEZAS.filter(function (id) { return PIEZAS_VIVIR[id].grupo === g; }).map(fila).join('') + '</ul>';
    };
    var cambio = !justo && mesesLlegaAntes !== null && x.hasta.meses !== null && mesesLlegaAntes !== x.hasta.meses ? mesesLlegaAntes - x.hasta.meses : 0;
    mesesLlegaAntes = justo ? null : x.hasta.meses;
    cont.innerHTML =
      '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Mi camino</a>' +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2">Llega antes</h1>' +
        '<p class="texto-apoyo">' + (rango ? textoRango(rango) + SEP : '') + '<button type="button" class="enlace" id="btn-caminos-rango" aria-haspopup="dialog">Cambiar</button></p></header>' +
      (justo
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-llaves"><p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-llaves" aria-live="polite">' + razon + ' ' + ayuda('tu-limite') + '</h2></section>'
        // S19-B2: el plazo ya está en Tu camino; aquí, una línea que cambia con cada pieza.
        : '<section class="llaves-linea" aria-labelledby="titulo-llaves">' +
        '<p><span class="etiqueta" id="titulo-llaves">Tus llaves</span>' +
          '<strong class="numero" aria-live="polite">' + textoMesesRango(x.desde.meses, x.hasta.meses) + '</strong>' +
          (cambio ? '<span class="cambio-llaves" aria-hidden="true">' + (cambio > 0 ? '−' : '+') + plural(Math.abs(cambio), 'mes', 'meses') + '</span>' : '') + '</p>' +
        '<p class="texto-apoyo">' + (x.hasta.ivaTarde ? 'Sin IVA vence antes' + SEP : '') + FRENO[x.hasta.freno] + '</p>' +
      '</section>') +
      grupo('menos', 'Paga menos') + grupo('ayuda', 'Recibe ayuda') +
      (siempre !== null ? '<p class="texto-apoyo linea-siempre">Sin garantía: ' + textoMeses(siempre) + ' ' + ayuda('garantia') + '</p>' : '') +
      plegable('numeros-llega', 'Ver números', '',
        '<ul class="datos-inversion">' +
          '<li><span>Precio</span><strong>' + formatoRango(ufAPesos(x.desde.precioUF), ufAPesos(x.hasta.precioUF)) + '</strong></li>' +
          '<li><span>Bci presta</span><strong>' + Math.round(x.hasta.pctCredito * 100) + ' %</strong></li>' +
          (x.hasta.subsidioUF ? '<li><span>Subsidio</span><strong>' + formatoRedondeado(ufAPesos(x.hasta.subsidioUF)) + '</strong></li>' : '') +
          '<li><span>Pie y gastos</span><strong>' + formatoRango(x.desde.meta, x.hasta.meta) + '</strong></li>' +
          '<li><span>Ya tienes</span><strong>' + formatoRedondeado(x.hasta.tienes) + '</strong></li>' +
        '</ul>' +
        '<button type="button" class="btn btn-terciario btn-bloque" data-simular="' + (on.grupo ? 'grupo-vivir' : 'individual-vivir') + '" aria-haspopup="dialog">Ver simulación</button>') +
      '<p class="sello">' + icono('i-escudo') + 'Calculado sin plusvalía</p>' +
      (justo ? '<p class="texto-centro"><a class="enlace" href="#camino/ficha/arriendo-opcion">Mientras tanto: arriendo con opción de compra</a></p>' : '') +
      '<div class="accion-fija">' + (justo
        ? (registro.recordarme ? '<a href="#camino" class="btn btn-secundario-dark btn-lg btn-bloque">Volver a mi camino</a>'
          : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-recordarme" data-meses="' + mesesRecordar(perfilActual(), 'individual-vivir') + '">Recordarme en ' + mesesRecordar(perfilActual(), 'individual-vivir') + ' meses</button>')
        : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-llega-elegir">Elegir departamento</button>') + '</div>';

    iniciarPlegables();
    cont.querySelectorAll('[data-q]').forEach(function (b) {
      b.addEventListener('click', function () {
        piezaAbierta = piezaAbierta === b.dataset.q ? null : b.dataset.q;
        renderLlegaAntes();
        cont.querySelector('[data-q="' + b.dataset.q + '"]').focus();
      });
    });
    cont.querySelectorAll('[data-pieza]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-disabled') === 'true') { piezaAbierta = b.dataset.pieza; renderLlegaAntes(); cont.querySelector('[data-q="' + b.dataset.pieza + '"]').focus(); return; }
        var id = b.dataset.pieza;
        estado.piezas = Object.assign({}, piezasOn());
        estado.piezas[id] = !estado.piezas[id];
        guardarEstado();
        renderLlegaAntes();
        cont.querySelector('[data-pieza="' + id + '"]').focus();
        anunciar(PIEZAS_VIVIR[id].nombre + (estado.piezas[id] ? ' sumado. ' : ' quitado. ') + 'Tus llaves: ' + textoMesesRango(plazoVivir().desde.meses, plazoVivir().hasta.meses) + '.');
        if (estado.piezas[id] && navigator.vibrate) navigator.vibrate(20);
      });
    });
    cont.querySelectorAll('[data-simular]').forEach(function (b) { b.addEventListener('click', function () { abrirSimulacion(b.dataset.simular, b); }); });
    $('btn-caminos-rango').addEventListener('click', function () { abrirCambiarRango($('btn-caminos-rango')); });
    if ($('btn-recordarme')) $('btn-recordarme').addEventListener('click', function () {
      registro.recordarme = Number($('btn-recordarme').dataset.meses);
      guardarRegistro();
      toast('Listo: te avisamos en ' + registro.recordarme + ' meses (simulado).');
      renderLlegaAntes();
    });
    if ($('btn-llega-elegir')) $('btn-llega-elegir').addEventListener('click', function () {
      // El camino sale de las piezas: con grupo, compra en grupo; si no, el crédito con la garantía del Estado.
      elegirCamino(piezasValidas(piezasOn()).grupo ? 'grupo-vivir' : 'individual-vivir');
    });
  }

  function renderTuCamino() {
    var perfil = perfilActual();
    var r = recomendarCamino(perfil);
    var n = r.numeros;
    var c = $('inicio-principal');
    var eligio = !!estado.caminoElegido;
    var idCamino = eligio ? estado.caminoElegido : r.id;
    var esFicha = !!CAMINOS[idCamino].ficha;
    var numCamino = eligio && !esFicha ? numerosCamino(idCamino, listaMeta(), perfil) : n;
    var rango = rangoActual();
    var pr = plazoRango(perfil, rango);
    var desdeOk = !pr.desde.todaviaNo;
    var justo = r.todaviaNo && !eligio && !desdeOk;
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var minimo = 100000, paso = 50000;
    var maximo = Math.max(1000000, Math.ceil(ingreso * 0.4 / paso) * paso);
    var mensual = Math.min(maximo, Math.max(minimo, estado.ahorroMensual || 300000));
    var plazo = plazosCon(perfil, mensual);
    var base = caminoBase(perfil.modo);
    var dif = !esFicha && idCamino !== base ? diferenciaConBase(idCamino, numCamino, numerosCamino(base, listaMeta(), perfil)) : null;
    var subtitulo = (eligio ? 'Tu camino: ' : 'Te recomendamos ') + primeraMinuscula(CAMINOS[idCamino].corto) +
      (dif && dif.descuento > 0.001 ? SEP + formatoPorcentaje(dif.descuento, 0) + ' más barato' : '');
    var prest = preaprobacion(estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);

    var protagonista = justo
      ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-plazo">' +
          '<p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
          '<h2 class="h3" id="titulo-plazo">Hoy te dejaría muy justo</h2>' +
        '</section>'
      : '<section class="noche" aria-labelledby="titulo-plazo">' +
          '<span class="noche-luna" aria-hidden="true"></span>' +
          '<span class="noche-estrella" style="left:64%;top:12px" aria-hidden="true"></span><span class="noche-estrella" style="left:74%;top:30px" aria-hidden="true"></span><span class="noche-estrella" style="left:60%;top:32px" aria-hidden="true"></span>' +
          '<p class="noche-etiqueta" id="titulo-plazo">Tu ventana se enciende en</p>' +
          '<strong class="numero noche-plazo" id="numero-plazo" aria-live="polite"></strong>' +
          '<p class="noche-sub">' + subtitulo + '</p>' +
          (r.todaviaNo && !eligio ? '<p class="noche-aviso">' + icono('i-alerta') + 'Los de ' + formatoUF(rango.hasta) + ' te dejan poco para vivir.</p>' : '') +
          '<div class="noche-edificio" aria-hidden="true"><span class="noche-techo"></span><div class="noche-fachada">' +
            VENTANAS_NOCHE.map(function (v) {
              return v === 'tu' ? '<span class="nv tu" id="mi-ventana">' + escena(46, 'ventana-av') + '</span>' : '<span class="nv' + (v ? ' on' : '') + '"></span>';
            }).join('') +
          '</div></div>' +
        '</section>' +
        '<section class="tarjeta bloque si-juntas" aria-labelledby="titulo-si-juntas">' +
          '<p class="si-juntas-fila"><label for="rango-mensual" id="titulo-si-juntas">Si juntas al mes</label><strong class="numero" id="valor-mensual">' + formatoPesos(mensual) + '</strong></p>' +
          '<input type="range" id="rango-mensual" min="' + minimo + '" max="' + maximo + '" step="' + paso + '" value="' + mensual + '"' +
            ' aria-valuetext="' + formatoPesos(mensual) + ' al mes: ' + textoPlazos(plazo) + '">' +
          '<p class="si-juntas-extremos"><span><strong>' + formatoPesos(minimo) + '</strong>' + textoPlazos(plazosCon(perfil, minimo)) + '</span>' +
            '<span><strong>' + formatoPesos(maximo) + '</strong>' + textoPlazos(plazosCon(perfil, maximo)) + '</span></p>' +
        '</section>';

    var datos = '<div class="mini-datos">' +
        '<div><small>Dividendo después</small><strong class="numero">' + formatoPesos(numCamino.dividendo) + '</strong></div>' +
        (prest && prest.cumple ? '<div><small>Bci te podría prestar hasta</small><strong class="numero">' + formatoPesos(ufAPesos(prest.creditoUF)) + '</strong></div>' : '') +
      '</div>' +
      '<p class="chip-fila"><span class="sello">' + icono('i-escudo') + 'Calculado sin plusvalía</span> ' +
        (prest && prest.cumple ? '<span class="sello sello-bci">' + icono('i-banco') + 'Preaprobación simulada</span>' : '') + '</p>';

    c.innerHTML =
      '<header class="encabezado">' + FIGURAS +
        campana() + '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tu camino</h1>' +
        '<p class="texto-apoyo">' + textoRango(rango) + SEP +
          '<button type="button" class="enlace" id="btn-cambiar-departamento" aria-haspopup="dialog">Cambiar</button></p>' +
      '</header>' +
      protagonista +
      (justo ? '' : datos) +
      '<div class="accion-fija">' + (eligio
        ? '<a href="#camino/elegir" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-departamentos">Elegir departamento</a>'
        : '<a href="#camino/caminos" class="btn btn-primario btn-lg btn-bloque">' + (r.todaviaNo ? 'Ver qué lo cambia' : 'Elegir mi camino') + '</a>') +
      '</div>' +
      (eligio ? '<p class="texto-centro"><a href="#camino/caminos" class="enlace">Ver mis caminos</a></p>' : '') +
      recorridoCamino(0) +
      lineaInversiones();

    if ($('numero-plazo')) {
      if (plazo.desde !== null && plazo.techo !== null && plazo.desde !== plazo.techo) $('numero-plazo').textContent = textoPlazos(plazo);
      else contarHasta($('numero-plazo'), plazoMostrado, plazo.techo, function (v) { return v === null ? '—' : textoPlazoMeses(v); });
      plazoMostrado = plazo.techo;
    }
    var rangoMensual = $('rango-mensual');
    if (rangoMensual) {
      var pintar = function () {
        var v = Number(rangoMensual.value);
        rangoMensual.style.setProperty('--lleno', ((v - minimo) / (maximo - minimo) * 100).toFixed(1) + '%');
        return v;
      };
      pintar();
      rangoMensual.addEventListener('input', function () {
        var v = pintar();
        var x = plazosCon(perfil, v);
        $('valor-mensual').textContent = formatoPesos(v);
        $('numero-plazo').textContent = textoPlazos(x);
        rangoMensual.setAttribute('aria-valuetext', formatoPesos(v) + ' al mes: ' + textoPlazos(x));
        // La ventana brilla un instante cuando el plazo cambia.
        var ventana = $('mi-ventana');
        ventana.classList.remove('brilla'); void ventana.offsetWidth; ventana.classList.add('brilla');
      });
      rangoMensual.addEventListener('change', function () {
        estado.ahorroMensual = Number(rangoMensual.value);
        guardarEstado();
        plazoMostrado = plazosCon(perfil, estado.ahorroMensual).techo;
      });
    }
    if ($('btn-ver-departamentos')) $('btn-ver-departamentos').addEventListener('click', function () { prepararProyectos(estado.caminoElegido); });
    $('btn-cambiar-departamento').addEventListener('click', function () { abrirCambiarRango($('btn-cambiar-departamento')); });
  }

  function lineaInversiones() {
    if (!estado.inversiones.length) return '';
    return '<a class="linea-inversiones bloque" href="#inversiones"><span>Tus inversiones: cobrado a la fecha</span> <strong>' +
      formatoPesos(ufAPesos(cobradoUF(datosCobro(estado.inversiones)))) + '</strong>' +
      '<span class="linea-ver">Ver <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span></a>';
  }

  function renderInicio() {
    // Etapas: con compra → Tu camino de la compra; solo inversiones (sin preguntas) → lo cobrado;
    // primera vez → las 3 preguntas; si no → el plazo de su camino.
    var c = $('inicio-principal');
    c.innerHTML = '';
    document.body.classList.remove('en-preguntas');
    actualizarBarraInversiones();
    if (estado.compra) return renderCamino();
    if (estado.inversiones.length && !estado.preguntasListas) return renderSoloInversiones();
    if (!estado.preguntasListas) return renderPreguntas();
    if (!rangoActual()) { estado.pregunta = 4; return renderPreguntas(); }
    if (estado.modo === 'vivir') renderTuCaminoVivir(); else renderTuCamino();
  }

  // ---------- Proyectos: el marketplace ----------
  // S16-F7: cada proyecto con su edificio dibujado. La ventana de tu compra está encendida.
  // ---------- Fotos (referenciales) ----------
  // Solo se usa una foto si está anotada en js/fotos.js; si no, se dibuja el edificio. Así nunca hay una imagen rota.
  var ESPACIOS = { estudio: ['living', 'cocina', 'bano'], '1d': ['living', 'cocina', 'dormitorio'], '2d': ['living', 'cocina', 'dormitorio'], '2d2b': ['living', 'cocina', 'dormitorio'] };
  var NOMBRE_ESPACIO = { living: 'Living', cocina: 'Cocina', dormitorio: 'Dormitorio', bano: 'Baño' };
  // Pasa a minúscula solo la primera letra (no las siglas: FOGAES, IVA).
  function primeraMinuscula(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function hayFotos() { return typeof FOTOS !== 'undefined'; }
  function fotoEdificio(p) { return hayFotos() && FOTOS.edificios[p.id] ? 'fotos/edificios/' + encodeURI(FOTOS.edificios[p.id]) : null; }
  function tipologia(d) { return d.dormitorios === 0 ? 'estudio' : d.dormitorios === 1 ? '1d' : d.banos >= 2 ? '2d2b' : '2d'; }
  // Las fotos del detalle: la fachada y los interiores de su tipología que existan.
  function fotosDe(p, d) {
    var lista = [];
    var f = fotoEdificio(p);
    if (f) lista.push({ src: f, alt: 'Fachada del ' + p.nombre, nombre: 'Fachada' });
    var t = tipologia(d);
    ESPACIOS[t].forEach(function (e) {
      if (hayFotos() && FOTOS.interiores[t + '-' + e])
        lista.push({ src: 'fotos/interiores/' + encodeURI(FOTOS.interiores[t + '-' + e]), alt: NOMBRE_ESPACIO[e] + ' de un departamento de ' + ficha(d).replace(/·/g, ','), nombre: NOMBRE_ESPACIO[e] });
    });
    return lista;
  }
  // Galería deslizable (scroll-snap) con puntos y botones; un toque en el punto lleva a esa foto.
  var idGaleria = 0;
  function galeria(fotos) {
    if (!fotos.length) return '';
    var id = 'galeria-' + (++idGaleria);
    return '<div class="galeria" id="' + id + '">' +
      '<div class="galeria-pista" tabindex="0" aria-label="Fotos referenciales">' +
        fotos.map(function (x, i) {
          return '<figure class="galeria-foto"><img src="' + x.src + '" alt="' + esc(x.alt) + '" loading="' + (i ? 'lazy' : 'eager') + '" width="800" height="600">' +
            '<figcaption>' + x.nombre + '</figcaption></figure>';
        }).join('') +
      '</div>' +
      '<p class="galeria-sello">Fotos referenciales</p>' +
      (fotos.length > 1 ? '<div class="galeria-puntos">' + fotos.map(function (x, i) {
        return '<button type="button" class="galeria-punto" data-ir="' + i + '" aria-label="Ver ' + x.nombre.toLowerCase() + '"' + (i ? '' : ' aria-current="true"') + '></button>';
      }).join('') + '</div>' : '') +
    '</div>';
  }
  function iniciarGalerias(cont) {
    (cont || document).querySelectorAll('.galeria').forEach(function (g) {
      var pista = g.querySelector('.galeria-pista');
      var puntos = g.querySelectorAll('.galeria-punto');
      var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      puntos.forEach(function (b) {
        b.addEventListener('click', function () { pista.scrollTo({ left: Number(b.dataset.ir) * pista.clientWidth, behavior: reducir ? 'auto' : 'smooth' }); });
      });
      pista.addEventListener('scroll', function () {
        var i = Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
        puntos.forEach(function (b, j) { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      }, { passive: true });
    });
  }

  function fachada(p) {
    // Con foto, la tarjeta muestra la fachada real (referencial); sin foto, el edificio dibujado.
    var foto = fotoEdificio(p);
    if (foto) return '<span class="fachada fachada-foto"><img src="' + foto + '" alt="" loading="lazy" width="800" height="600">' +
      (esMiProyecto(p) ? '<span class="fachada-tuyo">Tu edificio</span>' : '') + '</span>';
    var f = p.fachada || { color: 'blue-normal', pisos: 5 };
    var tuyo = esMiProyecto(p);
    var alto = f.pisos * 16 + 14, ventanas = '';
    for (var piso = 0; piso < f.pisos; piso++) for (var col = 0; col < 3; col++) {
      var on = tuyo && piso === Math.floor(f.pisos / 2) && col === 1;
      ventanas += '<rect class="fachada-ventana' + (on ? ' on' : '') + '" x="' + (12 + col * 22) + '" y="' + (10 + piso * 16) + '" width="14" height="10" rx="2"/>';
    }
    return '<span class="fachada" aria-hidden="true"><svg viewBox="0 0 90 ' + alto + '" height="' + Math.min(alto, 96) + '">' +
      '<rect x="4" y="2" width="82" height="' + (alto - 2) + '" rx="4" style="fill:var(--' + f.color + ')"/>' + ventanas + '</svg>' +
      (tuyo ? '<span class="fachada-tuyo">Tu ventana</span>' : '') + '</span>';
  }
  function tarjetaProyecto(p, base) {
    var r = resumen(p);
    var d = departamentosDe(p.id)[0];
    // S18-F1 y F4: el ahorro de hoy, redondeado; el de completar el grupo, como posibilidad.
    var completo = r.ahorroCompleto > r.ahorro ? formatoRedondeado(r.ahorroCompleto) + ' si se completa' : '';
    var conIva = p.tipo === 'venta' && estado.modo === 'vivir' && piezasValidas(piezasOn()).iva;
    var numero = p.tipo !== 'conjunto'
      ? '<p class="etiqueta">Precio' + (conIva ? ' sin IVA' : ' del departamento') + '</p><strong class="numero display-4">' +
        formatoRedondeado(p.tipo === 'venta' && estado.modo === 'vivir' ? ufAPesos(plazoDepartamento(p).precioUF) : r.escenario.precio) + '</strong>'
      : r.ahorro > 0
      ? '<p class="etiqueta">Ahorras al unirte</p><strong class="numero display-4">' + formatoRedondeado(r.ahorro) + '</strong>' +
        (completo ? '<p class="texto-apoyo">' + completo + '</p>' : '')
      : '<p class="etiqueta">Si el grupo se completa</p><strong class="numero display-4">' + formatoRedondeado(r.ahorroCompleto) + '</strong>';
    return '<li><a class="tarjeta tarjeta-proyecto" href="' + (base || '#departamentos/') + esc(p.id) + '">' +
      fachada(p) +
      '<h2 class="h4">' + esc(p.nombre) + '</h2>' +
      '<p class="texto-apoyo ficha">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      numero +
      lineaMasBarato(p, r, d) +
      (estado.modo === 'vivir' && estado.preguntasListas && paraVivir(p) && razonJusto(plazoDepartamento(p))
        ? '<p class="texto-apoyo aviso-justo">' + icono('i-alerta') + 'Te queda poco para vivir</p>' : '') +
      avanceDe(p, r) +
      '<p class="cierre">' + (p.cierre ? 'Cierra el ' + formatoFecha(p.cierre) : 'Terminado' + SEP + 'lo recibes al firmar') + '</p>' +
      '<span class="ver">Ver proyecto <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span>' +
      '</a></li>';
  }

  // S9-F5: con un filtro de Comprar más barato, la tarjeta dice cuánto baja el pie.
  function lineaMasBarato(p, r, d) {
    if (!estado.masBaratoTipo && !estado.masBaratoAjuste) return '';
    var m = pieMasBarato(d.listaUF, r.tipoCompra, estado.modo, p.cupos, estado.masBaratoAjuste);
    return '<p class="mas-barato-linea">Tu pie <strong>' + formatoPesos(m.pie) + '</strong>' +
      (m.baja > 0 ? ' · ' + formatoPesos(m.baja) + ' menos' : '') +
      (m.sinSubsidio ? ' · sin subsidio a la tasa' : '') + '</p>';
  }

  // S15-F4 y S15-F5: la lista de departamentos. En Mi camino ("camino") muestra solo los del camino
  // elegido y del rango; en Departamentos ("explorar"), por defecto lo mismo, con "Ver todos".
  var DORMITORIOS = { estudio: 0, '1d': 1 };
  function proyectosVisibles(ctx) {
    var arrendar = estado.modo === 'arrendar';
    var lista = PROYECTOS.filter(function (p) {
      return arrendar ? p.tipo !== 'venta' && resumen(p).pasaFiltro : paraVivir(p);
    });
    var soloCamino = ctx === 'camino' || !estado.verTodos;
    var c = estado.caminoElegido && CAMINOS[estado.caminoElegido];
    if (soloCamino && c && !c.ficha) {
      if (c.grupo) lista = lista.filter(function (p) { return p.tipo === 'conjunto'; });
      // S18-F6: con "Sin IVA", solo los terminados (es donde aplica).
      else if (estado.modo === 'vivir' && piezasValidas(piezasOn()).iva) lista = lista.filter(function (p) { return p.tipo === 'venta'; });
      // Con el subsidio, solo los que quedan bajo el tope con las demás piezas.
      if (estado.modo === 'vivir' && piezasValidas(piezasOn()).subsidio) lista = lista.filter(function (p) { return plazoDepartamento(p).on.subsidio; });
      else if (c.inversionistas > 0) lista = lista.filter(function (p) { return p.tipo === 'financiamiento'; });
    }
    var rango = rangoActual();
    if (soloCamino && estado.filtroRango && rango) lista = lista.filter(function (p) { return enRango(departamentosDe(p.id)[0].listaUF, rango); });
    if (estado.masBaratoTipo !== null) lista = lista.filter(function (p) { return departamentosDe(p.id)[0].dormitorios === DORMITORIOS[estado.masBaratoTipo]; });
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo);
    if (estado.meAlcanza && cap !== null) lista = lista.filter(function (p) { return resumen(p).escenario.precioUF <= cap; });
    // S18-F5: para vivir, primero los que te caben con tus piezas.
    if (estado.modo === 'vivir' && estado.preguntasListas) {
      lista = lista.map(function (p, i) { return { p: p, i: i, justo: !!razonJusto(plazoDepartamento(p)) }; })
        .sort(function (a, b) { return (a.justo - b.justo) || (a.i - b.i); }).map(function (x) { return x.p; });
    }
    return lista;
  }
  function filtrosActivos() {
    return (estado.masBaratoTipo ? 1 : 0) + (estado.masBaratoAjuste ? 1 : 0) + (estado.meAlcanza ? 1 : 0);
  }

  function renderLista(ctx) {
    var camino = ctx === 'camino';
    if (camino && (!estado.preguntasListas || !estado.caminoElegido || CAMINOS[estado.caminoElegido].ficha)) {
      location.replace(estado.preguntasListas ? '#camino/caminos' : '#camino');
      return;
    }
    var rango = rangoActual();
    var arrendar = estado.modo === 'arrendar';
    var visibles = proyectosVisibles(ctx);
    var soloCamino = camino || !estado.verTodos;
    var n = filtrosActivos();
    $('lista-contenido').innerHTML =
      (camino ? '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Mi camino</a>' : '') +
      '<header class="encabezado">' + (camino ? '' : FIGURAS) +
        '<h1 id="titulo-proyectos" class="h2">' + (camino ? 'Elige tu departamento' : 'Departamentos') + '</h1>' +
        '<p class="texto-apoyo">' + (camino ? CAMINOS[estado.caminoElegido].nombre : (arrendar ? 'Para arrendar' : 'Para vivir')) + '</p>' +
      '</header>' +
      '<div class="controles-lista">' +
        (rango && soloCamino ? '<button type="button" class="chip chip-filtro" id="filtro-rango" aria-pressed="' + !!estado.filtroRango + '">' + textoRango(rango) +
          (estado.filtroRango ? ' <span class="quitar" aria-hidden="true">×</span>' : '') + '</button>' : '') +
        (!camino && estado.caminoElegido ? '<button type="button" class="chip chip-filtro" id="filtro-todos" aria-pressed="' + !estado.verTodos + '">' +
          (estado.verTodos ? 'Ver solo mi camino' : 'Solo mi camino <span class="quitar" aria-hidden="true">×</span>') + '</button>' : '') +
        '<button type="button" class="btn btn-terciario btn-sm" id="btn-filtrar" aria-haspopup="dialog">' + icono('i-filtro') + 'Filtrar' + (n ? ' (' + n + ')' : '') + '</button>' +
      '</div>' +
      (arrendar ? '<p class="chip chip-ia">' + icono('i-escudo') + 'Filtrado por IA: rinde 3,9' + NBSP + '% o más</p>' : '') +
      (visibles.length
        ? '<ul class="lista-proyectos" id="lista-proyectos">' + visibles.map(function (p) { return tarjetaProyecto(p, camino ? '#camino/proyecto/' : '#departamentos/'); }).join('') + '</ul>'
        : '<div class="vacio"><svg aria-hidden="true"><use href="#i-proyectos"/></svg>' +
            '<h2 class="h3">Ninguno con estos filtros</h2>' +
            '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-quitar-filtros">Quitar filtros</button></div></div>');
    if ($('filtro-rango')) $('filtro-rango').addEventListener('click', function () { estado.filtroRango = !estado.filtroRango; renderLista(ctx); });
    if ($('filtro-todos')) $('filtro-todos').addEventListener('click', function () { estado.verTodos = !estado.verTodos; renderLista(ctx); });
    $('btn-filtrar').addEventListener('click', function () { abrirFiltros(ctx, $('btn-filtrar')); });
    if ($('btn-quitar-filtros')) $('btn-quitar-filtros').addEventListener('click', function () {
      estado.masBaratoTipo = null; estado.masBaratoAjuste = null; estado.meAlcanza = false; estado.filtroRango = false;
      if (!camino) estado.verTodos = true;
      renderLista(ctx);
    });
  }

  // Hoja "Filtrar": tamaño, precio (comprar más barato) y "solo los que me alcanzan".
  function abrirFiltros(ctx, boton) {
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo);
    var chip = function (attr, valor, texto, activo) {
      return '<button type="button" class="chip chip-filtro" ' + attr + '="' + valor + '" aria-pressed="' + activo + '">' + texto + '</button>';
    };
    var html =
      '<p class="etiqueta">Comprar más barato ' + ayuda('mas-barato') + '</p>' +
      '<div class="chips-mas-barato">' +
        chip('data-tipo', 'estudio', 'Estudio', estado.masBaratoTipo === 'estudio') +
        chip('data-tipo', '1d', '1 dormitorio', estado.masBaratoTipo === '1d') +
        chip('data-ajuste', 'usado', 'Usado', estado.masBaratoAjuste === 'usado') +
        chip('data-ajuste', 'iva-cero', 'IVA cero', estado.masBaratoAjuste === 'iva-cero') +
      '</div>' +
      (cap !== null ? '<button type="button" class="interruptor bloque-chico" role="switch" id="filtro-alcanza" aria-checked="' + !!estado.meAlcanza + '">' +
        '<span>Solo los que me alcanzan</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>' : '') +
      '<button type="button" class="btn btn-primario btn-bloque bloque-chico" id="btn-ver-filtrados"></button>';
    abrirHojaContenido('Filtrar', html, boton, function (hoja) {
      var actualizar = function () {
        hoja.querySelectorAll('[data-tipo]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.tipo === estado.masBaratoTipo)); });
        hoja.querySelectorAll('[data-ajuste]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ajuste === estado.masBaratoAjuste)); });
        if ($('filtro-alcanza')) $('filtro-alcanza').setAttribute('aria-checked', String(!!estado.meAlcanza));
        var k = proyectosVisibles(ctx).length;
        $('btn-ver-filtrados').textContent = k ? 'Ver ' + plural(k, 'departamento', 'departamentos') : 'Ninguno con estos filtros';
      };
      hoja.querySelectorAll('[data-tipo]').forEach(function (b) {
        b.addEventListener('click', function () { estado.masBaratoTipo = estado.masBaratoTipo === b.dataset.tipo ? null : b.dataset.tipo; actualizar(); });
      });
      hoja.querySelectorAll('[data-ajuste]').forEach(function (b) {
        b.addEventListener('click', function () { estado.masBaratoAjuste = estado.masBaratoAjuste === b.dataset.ajuste ? null : b.dataset.ajuste; actualizar(); });
      });
      if ($('filtro-alcanza')) $('filtro-alcanza').addEventListener('click', function () { estado.meAlcanza = !estado.meAlcanza; actualizar(); });
      $('btn-ver-filtrados').addEventListener('click', function () { cerrarHoja(false); renderLista(ctx); $('titulo-proyectos').focus(); });
      actualizar();
    });
  }

  // Hoja genérica: sube desde abajo con fondo atenuado; se cierra con Esc, tocando afuera o con "Cerrar".
  function abrirHojaContenido(titulo, html, boton, alAbrir) {
    cerrarHoja(false);
    botonHoja = boton || null;
    var fondo = document.createElement('div');
    fondo.id = 'hoja-fondo'; fondo.className = 'hoja-fondo';
    var hoja = document.createElement('div');
    hoja.id = 'hoja-inferior'; hoja.className = 'hoja-inferior';
    hoja.setAttribute('role', 'dialog'); hoja.setAttribute('aria-modal', 'true'); hoja.setAttribute('aria-labelledby', 'hoja-titulo');
    hoja.innerHTML = '<span class="hoja-asa" aria-hidden="true"></span>' +
      '<h2 class="h4" id="hoja-titulo">' + titulo + '</h2>' + html +
      '<button type="button" class="btn btn-terciario btn-bloque bloque-chico" id="btn-cerrar-hoja">Cerrar</button>';
    document.body.appendChild(fondo);
    document.body.appendChild(hoja);
    document.body.classList.add('con-hoja');
    if (boton) boton.setAttribute('aria-expanded', 'true');
    fondo.addEventListener('click', function () { cerrarHoja(true); });
    $('btn-cerrar-hoja').addEventListener('click', function () { cerrarHoja(true); });
    document.addEventListener('keydown', escHoja);
    if (alAbrir) alAbrir(hoja);
    var primero = hoja.querySelector('input, button:not(.btn-ayuda), a');
    if (primero) primero.focus();
  }

  // S15-F6: "Mis datos" se edita en una hoja, desde Mi camino, Caminos o Perfil, sin salir de la pantalla.
  function abrirMisDatos(boton) {
    var opcion = function (valor, texto) {
      return '<input type="radio" name="datos-modo" id="datos-' + valor + '" value="' + valor + '"' +
        (estado.modo === valor ? ' checked' : '') + '><label for="datos-' + valor + '">' + texto + '</label>';
    };
    var html = '<form id="form-datos" novalidate>' +
      '<fieldset class="selector"><legend>¿Para qué quieres el departamento?</legend>' +
        '<div class="selector-opciones">' + opcion('vivir', 'Para vivir') + opcion('arrendar', 'Para arrendar') + '</div></fieldset>' +
      campoDinero('datos-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
      campoDinero('datos-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
      campoDinero('datos-otras', 'Otras cuotas al mes', estado.otrasCuotas) +
      campoDinero('datos-ahorro', 'Lo que tienes ahorrado', estado.ahorroActual) +
      campoDinero('datos-mensual', 'Lo que puedes juntar al mes', estado.ahorroMensual) +
      campoDinero('datos-arriendo', 'Lo que pagas hoy de arriendo', estado.arriendoActual) +
      '<button type="submit" class="btn btn-primario btn-bloque">Guardar</button>' +
    '</form>';
    abrirHojaContenido('Mis datos', html, boton, function () {
      ['datos-propio', 'datos-pareja', 'datos-otras', 'datos-ahorro', 'datos-mensual', 'datos-arriendo'].forEach(function (id) {
        $(id).addEventListener('input', function () { formatearCampo($(id)); });
      });
      $('form-datos').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var propio = leerMonto($('datos-propio').value);
        var pareja = leerMonto($('datos-pareja').value);
        var okPropio = validarSueldo($('datos-propio'), propio, true);
        var okPareja = pareja === null || validarSueldo($('datos-pareja'), pareja, false);
        if (!okPropio || !okPareja) { var malo = !okPropio ? $('datos-propio') : $('datos-pareja'); temblar(malo); malo.focus(); return; }
        var modo = document.querySelector('input[name="datos-modo"]:checked').value;
        if (modo !== estado.modo) estado.caminoElegido = null;
        estado.modo = modo;
        estado.sueldoPropio = propio;
        estado.sueldoPareja = pareja;
        estado.otrasCuotas = leerMonto($('datos-otras').value);
        estado.ahorroActual = leerMonto($('datos-ahorro').value) || 0;
        estado.ahorroMensual = leerMonto($('datos-mensual').value) || estado.ahorroMensual;
        estado.arriendoActual = leerMonto($('datos-arriendo').value);
        guardarEstado();
        recalcularPostulacion();
        cerrarHoja(false);
        mostrar();
        toast('Guardado. Todo se recalculó con tus datos.');
      });
    });
  }

  function abrirCambiarRango(boton) {
    var html = '<ul class="opciones-departamento">' + RANGOS_PRECIO.map(function (rg) {
      var n = departamentosEnRango(rg).length;
      return '<li><button type="button" class="opcion-departamento" aria-pressed="' + (estado.rangoPrecio === rg.id) + '" data-rango="' + rg.id + '"' +
        (n === 0 ? ' disabled' : '') + '>' + icono('i-casa', 'icono-grande') +
        '<span class="opcion-texto"><strong>' + textoRango(rg) + '</strong><small>' + (n === 0 ? 'Sin departamentos hoy' : plural(n, 'departamento', 'departamentos')) + '</small></span></button></li>';
    }).join('') + '</ul>';
    abrirHojaContenido('¿Cuánto quieres que cueste?', html, boton, function (hoja) {
      hoja.querySelectorAll('[data-rango]:not([disabled])').forEach(function (b) {
        b.addEventListener('click', function () { elegirRango(b.dataset.rango); cerrarHoja(false); mostrar(); toast('Rango: ' + textoRango(rangoActual()) + '.'); });
      });
    });
  }

  // S15-F7: cuánto le prestaría Bci con sus sueldos (la misma regla de carga de la preaprobación).
  function filaPrestaria() {
    var pre = preaprobacion(estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);
    if (!pre || !pre.cumple) return '';
    return '<li><span>' + icono('i-banco') + 'Bci te podría prestar hasta</span><strong>' + formatoPesos(ufAPesos(pre.creditoUF)) + '</strong></li>';
  }

  // S15-F5: Inversiones. Arriba lo cobrado y tus inversiones; abajo, las oportunidades de pie compartido.
  function tarjetaOportunidad(p) {
    var r = resumen(p);
    var d = departamentosDe(p.id)[0];
    return '<li><a class="tarjeta tarjeta-proyecto" href="#inversiones/' + esc(p.id) + '">' +
      '<h2 class="h4">' + esc(p.nombre) + '</h2>' +
      '<p class="texto-apoyo ficha">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '<p class="etiqueta">Falta por financiar</p><strong class="numero display-4">' + formatoPesos(ufAPesos(r.faltaUF)) + '</strong>' +
      '<p class="texto-apoyo">6' + NBSP + '% al año en UF' + SEP + textoPlazo(plazoRecompra(r.porFinanciarUF, r.netoMensualUF, 1)) + '</p>' +
      casaParticipacion(r) +
      '<span class="ver">Ver oportunidad <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span>' +
    '</a></li>';
  }
  function renderInversiones() {
    renderMisInversiones();
    var lista = PROYECTOS.filter(function (p) { return resumen(p).faltaUF > 0 && !esMiProyecto(p); });
    $('lista-oportunidades').innerHTML = lista.length ? lista.map(tarjetaOportunidad).join('')
      : '<li class="vacio"><h3 class="h4">Sin oportunidades abiertas</h3></li>';
  }

  // ---------- Detalle de un proyecto ----------
  function filaReparto(texto, apoyo, monto) {
    return '<li><svg aria-hidden="true"><use href="#i-check"/></svg>' +
      '<span>' + texto + (apoyo ? '<small>' + apoyo + '</small>' : '') + '</span>' +
      '<span class="monto">' + formatoPesos(monto) + '</span></li>';
  }

  function partesEscenario(e) {
    var partes = [{ clave: 'bci', icono: 'i-banco', nombre: 'Bci', pct: e.pctCredito, monto: e.reparto.bci }];
    if (e.pctInversionistas > 0) partes.push({ clave: 'inversionistas', icono: 'i-inversionistas', nombre: 'inversionistas', pct: e.pctInversionistas, monto: e.reparto.inversionistas });
    partes.push({ clave: 'tu', icono: 'i-persona', nombre: 'tú', pct: e.pctUsuario, monto: e.reparto.usuario });
    return partes;
  }

  // S18-F6: para vivir, el reparto sale de las piezas: Bci, el subsidio del Estado (si se suma) y tú.
  function partesPiezas(pd) {
    var precio = pd.precioUF;
    var partes = [{ clave: 'bci', icono: 'i-banco', nombre: 'Bci', pct: pd.creditoUF / precio, monto: ufAPesos(pd.creditoUF) }];
    if (pd.subsidioUF > 0) partes.push({ clave: 'estado', icono: 'i-escudo', nombre: 'subsidio', pct: pd.subsidioUF / precio, monto: ufAPesos(pd.subsidioUF) });
    partes.push({ clave: 'tu', icono: 'i-persona', nombre: 'tú', pct: pd.pie / ufAPesos(precio), monto: pd.pie });
    return partes;
  }

  // S15: el detalle muestra solo la acción de la pestaña desde la que se llegó.
  // ctx: 'camino' (Elegir este departamento), 'departamentos' (Llevar a mi camino) o 'inversiones' (Invertir aquí).
  var VOLVER_DETALLE = {
    camino: ['#camino/elegir', 'Elige tu departamento'], departamentos: ['#departamentos', 'Departamentos'], inversiones: ['#inversiones', 'Inversiones']
  };
  function caminoParaProyecto(p) {
    var c = estado.caminoElegido && CAMINOS[estado.caminoElegido];
    if (p.tipo === 'venta') return 'individual-vivir';
    if (p.tipo === 'conjunto') {
      if (c && c.grupo) return estado.caminoElegido;
      return estado.modo === 'vivir' ? 'grupo-vivir' : 'grupo-pie-compartido';
    }
    if (c && !c.grupo && !c.ficha) return estado.caminoElegido;
    return 'pie-compartido';
  }
  function renderDetalle(id, ctx) {
    ctx = ctx || 'departamentos';
    $('detalle-volver').setAttribute('href', VOLVER_DETALLE[ctx][0]);
    $('detalle-volver').lastChild.textContent = VOLVER_DETALLE[ctx][1];
    var p = buscarProyecto(id);
    var contenedor = $('detalle-proyecto');
    if (!p) {
      contenedor.innerHTML = '<div class="vacio"><svg aria-hidden="true"><use href="#i-proyectos"/></svg>' +
        '<h1 id="titulo-proyecto" class="h3">No encontramos este proyecto</h1>' +
        '<p class="texto-apoyo">Puede que ya se haya cerrado.</p>' +
        '<div class="acciones"><a href="' + VOLVER_DETALLE[ctx][0] + '" class="btn btn-primario btn-bloque">Volver</a></div></div>';
      return;
    }

    var r = resumen(p);
    var e = r.escenario;
    var d = departamentosDe(p.id)[0];
    var conjunto = p.tipo === 'conjunto';
    var esMiCompra = estado.compra && estado.compra.proyectoId === p.id;
    var vivirAqui = estado.modo === 'vivir' && paraVivir(p) && ctx !== 'inversiones' && estado.preguntasListas;
    var pd = vivirAqui ? plazoDepartamento(p) : null;

    var precio = conjunto
      ? '<p class="precio-lista">Precio de lista <s>' + formatoPesos(e.precioLista) + '</s></p>' +
        '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>' +
        '<p class="texto-apoyo">Ahorras ' + formatoPesos(r.ahorro) + ' (' + formatoPorcentaje(r.descuento, 0) + ')</p>'
      : '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>';

    var rinde = estado.modo === 'arrendar'
      ? '<p class="texto-apoyo bloque">Arriendo estimado por IA: <strong>' + formatoPesos(r.arriendoBruto) + '</strong> · rinde <strong>' +
        formatoPorcentaje(r.rentabilidad, 1) + '</strong> neto</p>'
      : '';

    var frase = conjunto
      ? 'Si no se completa, sales sin costo.'
      : 'Si no se reúne el 15\u00a0%, sales sin costo.';

    var invertiste = invertidoEn(p.id) > 0;
    var comprar;
    if (p.tipo === 'financiamiento' && estado.modo === 'vivir' && !esMiCompra) {
      comprar = '<p class="aviso">El pie compartido es para comprar para arrendar: los inversionistas recuperan su parte con el arriendo.</p>' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-detalle-datos">Cambiar mis datos</button>';
    } else if (esMiCompra) {
      comprar = '<p class="aviso">Ya te uniste a este proyecto.</p>' +
        '<a href="#camino/' + rutaPasoActual() + '" class="btn btn-primario btn-lg btn-bloque">Ver mi compra</a>';
    } else if (invertiste) {
      // El 15 % de un comprador lo financian otras personas: quien ya invirtió aquí no puede comprar aquí.
      comprar = '<p class="aviso">Ya invertiste en este proyecto, así que no puedes comprar aquí: el 15' + NBSP + '% de un comprador lo ponen otras personas.</p>' +
        '<a href="#inversiones" class="btn btn-terciario btn-bloque">Ver mis inversiones</a>';
    } else if (estado.compra && estado.compra.paso === 4) {
      comprar = '<p class="aviso">Ya firmaste tu compra en ' + esc(buscarProyecto(estado.compra.proyectoId).nombre) + '.</p>';
    } else if (estado.compra) {
      var actual = buscarProyecto(estado.compra.proyectoId);
      var reemplaza = (estado.compra.paso || 1) >= 2
        ? '<p class="texto-apoyo">Tu postulación en ' + esc(actual.nombre) + ' se reemplaza: vuelves a postular aquí.</p>'
        : '';
      comprar = '<p class="aviso">Ya estás comprando en ' + esc(actual.nombre) + '.</p>' +
        (ctx === 'camino' && r.cuposLibres > 0
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-cambiar-compra">Cambiar mi compra a este departamento</button>' + reemplaza
          : '<a href="#camino" class="btn btn-secundario-dark btn-bloque">Ver mi camino</a>');
    } else if (r.cuposLibres === 0) {
      comprar = '<p class="aviso">Sin cupos disponibles.</p>';
    } else {
      comprar = ctx === 'camino'
        ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-comprar">Elegir este departamento</button>'
        : (!estado.preguntasListas
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-me-alcanza">¿Me alcanza?</button>'
          : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-llevar" aria-haspopup="dialog">Llevar a mi camino</button>');
    }
    if (ctx === 'inversiones') {
      comprar = r.faltaUF > 0 && !esMiCompra
        ? '<a href="#inversiones/' + esc(p.id) + '/invertir" class="btn btn-primario btn-lg btn-bloque">Invertir aquí</a>'
        : '<p class="texto-apoyo">' + (esMiCompra ? 'En tu propia compra no puedes invertir.' : 'Este proyecto ya reunió su 15' + NBSP + '%.') + '</p>';
    }

    contenedor.innerHTML =
      '<header class="detalle-cabecera">' +
        '<p class="chip-fila"><span class="chip">' + NOMBRE_TIPO[p.tipo] + '</span> ' +
          ayuda(conjunto ? 'compra-conjunto' : p.tipo === 'venta' ? 'terminado' : 'financiamiento-pie') + '</p>' +
        '<h1 id="titulo-proyecto" class="h2">' + esc(p.nombre) + '</h1>' +
        '<p class="texto-apoyo">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '</header>' +
      galeria(fotosDe(p, d)) +

      (vivirAqui
        // S17-F1 y F2: para vivir, el mismo plazo que Inicio y Tu pie, con cifras redondeadas.
        ? '<div class="tarjeta protagonista">' +
            '<p class="etiqueta">Tus llaves</p>' +
            '<strong class="numero display-3">' + (pd.meses === 0 ? 'Ya' : textoMeses(pd.meses)) + '</strong>' +
            '<p class="texto-apoyo">' + pd.llaves + SEP + FRENO[pd.freno] + '</p>' +
            '<ul class="datos-inversion">' +
              '<li><span>Juntas antes de firmar</span><strong>' + formatoRedondeado(pd.meta) + '</strong></li>' +
              '<li><span>Después pagas al mes</span><strong>' + formatoRedondeado(pd.dividendo) + '</strong></li>' +
              '<li><span>Sin subsidio ' + ayuda('dividendo') + '</span><strong>' + formatoRedondeado(pd.dividendoSinSubsidio) + '</strong></li>' +
              '<li><span>Precio' + (conjunto ? ' con descuento' : p.tipo === 'venta' && piezasValidas(piezasOn()).iva ? ' sin IVA' : '') + '</span><strong>' + formatoRedondeado(ufAPesos(pd.precioUF)) + '</strong></li>' +
              (conjunto ? '<li><span>Ahorras en grupo hoy</span><strong>' + formatoRedondeado(r.ahorro) + '</strong></li>' : '') +
            '</ul>' +
            '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
          '</div>'
        : '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Precio del departamento</p>' + precio +
        '<p class="secundario">Y luego <strong>' + formatoPesos(e.totalMes) + '</strong> al mes de dividendo</p>' +
        '<p class="texto-apoyo">Sin subsidio: ' + formatoPesos(e.dividendoSinSubsidio) + ' al mes ' + ayuda('dividendo') + '</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</div>') +
      rinde +

      // S19-B1: el detalle del crédito queda plegado; a la vista, las filas que deciden.
      plegable('detalle-credito', 'Ver detalle del crédito', '',
        // S18-F4: para vivir, redondeado; los exactos quedan en la simulación, la preaprobación y Firmar.
        (vivirAqui ? repartoCasa(partesPiezas(pd), formatoRedondeado) : repartoCasa(partesEscenario(e))) +
        '<ul class="datos-inversion">' +
          '<li><span>Gastos al firmar</span><strong>' + (vivirAqui ? formatoRedondeado(pd.gastos) : formatoPesos(e.gastos)) + '</strong></li>' +
          (vivirAqui ? '' : '<li><span>Juntas antes de firmar</span><strong>' + formatoPesos(e.alEscriturar) + '</strong></li>') +
          (vivirAqui && conjunto && r.ahorroCompleto > r.ahorro ? '<li><span>Si el grupo se completa, ahorras</span><strong>' + formatoRedondeado(r.ahorroCompleto) + '</strong></li>' : '') +
        '</ul>') +

      (p.tipo === 'venta'
        ? '<div class="tarjeta bloque"><p class="llaves-en">' + icono('i-llave', 'icono-llave') + '<span><strong>Edificio terminado</strong>' + SEP + 'lo recibes al firmar</span></p></div>'
        : '<div class="tarjeta bloque">' +
        (p.tipo === 'conjunto' ? grupoConEdificio(p, r) : avanceDe(p, r)) +
        '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
        '<p class="frase-cierre">' + frase + '</p>' +
      '</div>') +

      (ctx !== 'inversiones' ? '' :
      '<section class="tarjeta bloque" aria-labelledby="titulo-para-invertir">' +
        '<h2 class="h5" id="titulo-para-invertir">Para invertir</h2>' +
        '<ul class="datos-inversion">' +
          '<li><span>Rentabilidad</span><strong>6\u00a0% al año en UF</strong></li>' +
          '<li><span>Plazo</span><strong>' + textoPlazo(plazoRecompra(r.porFinanciarUF, r.netoMensualUF, 1)) + '</strong></li>' +
          '<li><span>Tu respaldo</span><strong>Parte del departamento ' + ayuda('participacion') + '</strong></li>' +
          '<li><span>Falta por financiar</span><strong>' + formatoUF(r.faltaUF) + ' = ' + formatoPesos(ufAPesos(r.faltaUF)) + '</strong></li>' +
        '</ul>' +
        (conjunto ? casaParticipacion(r) : '') +
        '<p class="frase-cierre">Ganancias y pérdidas, según la parte de cada uno. ' + ayuda('cuenta-custodia') + '</p>' +
      '</section>') +

      '<div class="acciones">' + comprar + '</div>';

    iniciarGalerias(contenedor);
    iniciarPlegables();
    var botonComprar = $('btn-comprar');
    if (botonComprar) {
      botonComprar.addEventListener('click', function () {
        conCarga(botonComprar, function () {
          guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
          location.hash = '#camino/postular/datos';
        });
      });
    }
    var botonCambiar = $('btn-cambiar-compra');
    if (botonCambiar) {
      botonCambiar.addEventListener('click', function () {
        conCarga(botonCambiar, function () {
          guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
          location.hash = '#camino/postular/datos';
        });
      });
    }
    if ($('btn-detalle-datos')) $('btn-detalle-datos').addEventListener('click', function () { abrirMisDatos($('btn-detalle-datos')); });
    // Sin datos: "¿Me alcanza?" abre las preguntas con este departamento como meta.
    if ($('btn-me-alcanza')) $('btn-me-alcanza').addEventListener('click', function () {
      var rg = RANGOS_PRECIO.filter(function (x) { return enRango(d.listaUF, x); })[0];
      if (rg) estado.rangoPrecio = rg.id;
      estado.preguntasListas = false;
      estado.pregunta = 1;
      guardarEstado();
      location.hash = '#camino';
    });
    // El único cruce entre pestañas: se confirma en una hoja.
    if ($('btn-llevar')) $('btn-llevar').addEventListener('click', function () {
      abrirHojaContenido('¿Elegir ' + esc(p.nombre) + ' para tu camino?',
        '<p class="texto-apoyo">Pasas a postular en Mi camino.</p>' +
        '<button type="button" class="btn btn-primario btn-bloque" id="btn-llevar-si">Sí, elegir</button>', $('btn-llevar'), function () {
          $('btn-llevar-si').addEventListener('click', function () {
            cerrarHoja(false);
            estado.caminoElegido = caminoParaProyecto(p);
            guardarEstado();
            guardarCompra({ proyectoId: p.id, departamentoId: d.id, paso: 1 });
            location.hash = '#camino/postular/datos';
          });
        });
    });
  }

  // ---------- Invertir (S6-F1 y S6-F3) ----------
  function renderInvertir(id) {
    var p = buscarProyecto(id);
    var contenedor = $('invertir-contenido');
    $('invertir-volver').setAttribute('href', p ? '#inversiones/' + encodeURIComponent(p.id) : '#inversiones');
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
        (r.faltaUF > INVERSION_MINIMA_UF
          ? '<input type="range" id="monto-rango" min="' + INVERSION_MINIMA_UF + '" max="' + Math.floor(r.faltaUF) + '" step="1" value="' + INVERSION_MINIMA_UF +
            '" aria-label="¿Cuánto quieres invertir?" aria-valuetext="' + formatoUF(INVERSION_MINIMA_UF) + '">'
          : '') +
        '<p class="texto-apoyo ayuda-campo" id="monto-uf-ayuda">' + (r.faltaUF < INVERSION_MINIMA_UF
          ? 'Falta ' + formatoUF(r.faltaUF) + ' para completar el 15' + NBSP + '%: puedes invertir justo eso.'
          : '') + '</p>' +
        '<p class="error" id="monto-uf-error" hidden><svg aria-hidden="true"><use href="#i-no"/></svg><span></span></p>' +
      '</div>' +
      '<div id="invertir-resultado" aria-live="polite"></div>' +
      '<p class="casilla"><input type="checkbox" id="respaldo"><label for="respaldo">Quiero ser comprador de respaldo</label> ' + ayuda('comprador-respaldo') + '</p>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-confirmar" aria-describedby="confirmar-explica">Confirmar</button></div>' +
      '<p class="texto-apoyo" id="confirmar-explica">Inversión simulada.</p>';

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
      var pl = plazoRecompra(r.porFinanciarUF, r.netoMensualUF, 1);
      $('invertir-resultado').innerHTML =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">Recibirás el primer mes</p>' +
          '<strong class="numero display-2" id="primer-mes"></strong>' +
          '<p class="texto-apoyo">Recuperas ' + formatoUF(monto) + ' (' + formatoPesos(ufAPesos(monto)) + ') más 6\u00a0% al año en UF' +
            (pl.superaTope ? ' a más tardar en 84 meses, con refinanciamiento o venta.' : ' en ≈ ' + textoMeses(pl.meses) + '.') + '</p>' +
        '</div>';
      contarHasta($('primer-mes'), primerMostrado, ufAPesos(primero), formatoPesos);
      primerMostrado = ufAPesos(primero);
    };

    var habia = false;
    var primerMostrado = null;
    if ($('monto-rango')) $('monto-rango').addEventListener('input', function () {
      monto = Number($('monto-rango').value);
      $('monto-uf').value = String(monto);
      $('monto-rango').setAttribute('aria-valuetext', formatoUF(monto));
      tocado = true;
      dibujar();
    });
    $('monto-uf').addEventListener('input', function () {
      var input = $('monto-uf');
      input.value = limpiarCampoUF(input.value);
      monto = leerMontoUF(input.value);
      if ($('monto-rango') && monto) $('monto-rango').value = Math.min(Number($('monto-rango').max), Math.max(INVERSION_MINIMA_UF, monto));
      dibujar();
      var hay = !validarInversion(monto, r.faltaUF);
      if (hay && !habia) $('invertir-resultado').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      habia = hay;
    });
    $('monto-uf').addEventListener('blur', function () { tocado = true; dibujar(); });
    $('btn-confirmar').addEventListener('click', function () {
      tocado = true;
      dibujar();
      if ($('btn-confirmar').disabled) { temblar($('monto-uf')); $('monto-uf').focus(); return; }
      var invertido = monto;
      var respaldo = $('respaldo').checked;
      conCarga($('btn-confirmar'), function () {
        agregarInversion({ id: 'inv-' + Date.now(), proyectoId: p.id, montoUF: invertido, fecha: FECHA_REFERENCIA, cuotasCobradas: 0, respaldo: respaldo });
        toast('Invertiste ' + formatoUF(invertido) + ' en ' + p.nombre + '.');
        location.hash = '#inversiones';
      });
    });
    dibujar();
  }

  // ---------- Mis inversiones (S6-F4) ----------
  var cobradoMostrado = null;
  function renderMisInversiones() {
    var lista = estado.inversiones;
    if (!lista.length) {
      $('panel-inversiones').innerHTML =
        '<div class="vacio">' +
          '<svg aria-hidden="true"><use href="#i-pronto"/></svg>' +
          '<h2 class="h3">Aún no tienes inversiones</h2>' +
          '<p class="texto-apoyo">Elige una oportunidad más abajo.</p>' +
        '</div>';
      return;
    }
    var tarjetas = lista.map(function (x) {
      var p = buscarProyecto(x.proyectoId);
      var dc = datosCobro([x])[0];
      var pl = plazoRecompra(dc.participacionUF, dc.netoUF, 1);
      var total = pl.superaTope ? SUPUESTOS.topeRecompraMeses : pl.meses;
      var proximo = ufAPesos(cuotaMensualTotalUF([dc]));
      return '<li class="tarjeta inversion">' +
        '<a class="enlace" href="#inversiones/' + esc(p.id) + '">' + esc(p.nombre) + '</a>' +
        (x.respaldo ? '<p class="chip-fila"><span class="chip chip-propuesta">Comprador de respaldo</span></p>' : '') +
        '<p class="inversion-fila"><span>Invertiste</span><strong>' + formatoUF(x.montoUF) + '</strong></p>' +
        '<p class="inversion-fila"><span>Recibes el próximo mes</span><strong>' + formatoPesos(proximo) + '</strong></p>' +
        barraAvance('Meses de recompra', Math.min(x.cuotasCobradas, total) + ' de ' + total, avance(x.cuotasCobradas, total)) +
      '</li>';
    }).join('');

    $('panel-inversiones').innerHTML =
      '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Cobrado a la fecha</p>' +
        '<strong class="numero display-3" id="cobrado"></strong>' +
      '</div>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-cobrar-mes">Simular un mes</button></div>' +

      '<ul class="lista-inversiones">' + tarjetas + '</ul>';
    var cobrado = ufAPesos(cobradoUF(datosCobro(lista)));
    contarHasta($('cobrado'), cobradoMostrado, cobrado, formatoPesos);
    cobradoMostrado = cobrado;

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
  // Los mismos 5 pasos de Inicio (S11-F0). El paso de la compra (1 a 4) es el punto 2 a 5.
  var PASOS = [
    { titulo: 'Elegir', apoyo: 'Eliges tu camino y tu departamento.' },
    { titulo: 'Postular', apoyo: 'Revisamos si califican.' },
    { titulo: 'Juntar el pie', apoyo: 'Juntas lo que pones al escriturar.' },
    { titulo: 'Firmar', apoyo: 'Firmas la escritura.' },
    { titulo: 'Mi departamento', apoyo: 'Ya es tuyo.' }
  ];

  var SEMAFORO = {
    'holgado': { palabra: 'Holgado', icono: 'i-ok', explica: 'Dentro de lo cómodo.' },
    'limite': { palabra: 'En el límite', icono: 'i-alerta', explica: 'Con cuotas, hasta 30\u00a0%: poco margen.' },
    'no-aprueba': { palabra: 'No aprueba', icono: 'i-no', explica: 'Máximo: dividendo 25\u00a0% y con cuotas 30\u00a0%.' }
  };

  function departamentoDeMiCompra(p) {
    return departamentosDe(p.id).filter(function (x) { return x.id === estado.compra.departamentoId; })[0] ||
      departamentosDe(p.id)[0];
  }

  // S15-F1: un solo indicador de pasos (la escalera de Mi camino). Aquí basta una línea.
  function listaPasos(pasoCompra) {
    return '<p class="paso-de">Paso ' + (pasoCompra + 1) + ' de 5' + SEP + CAMINO[pasoCompra] + '</p>';
  }

  // S19-B3: un ejemplo en cada campo de dinero, para saber qué escribir.
  var EJEMPLOS_DINERO = { 'q-propio': '1.200.000', 'q-pareja': '1.000.000', 'q-ahorro': '3.000.000',
    'q-mensual': '300.000', 'q-arriendo': '450.000', 'ahorro-mensual': '300.000', 'datos-propio': '1.200.000', 'datos-pareja': '1.000.000',
    'datos-ahorro': '3.000.000', 'datos-mensual': '300.000', 'datos-arriendo': '450.000',
    'sueldo-propio': '1.200.000', 'sueldo-pareja': '1.000.000', 'arriendo-antes': '450.000', 'arriendo-mes': '450.000' };
  function campoDinero(id, etiqueta, valor) {
    return '<div class="campo">' +
      '<label for="' + id + '">' + etiqueta + '</label>' +
      '<div class="campo-caja"><span class="prefijo" aria-hidden="true">$</span>' +
      '<input id="' + id + '" name="' + id + '" type="text" inputmode="numeric" autocomplete="off" enterkeyhint="next"' +
      (EJEMPLOS_DINERO[id] ? ' placeholder="Ej.: ' + EJEMPLOS_DINERO[id] + '…"' : '') +
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
  function sugerencia(p, ev) {
    var cargaActual = ev.cargaTotal;
    var total = resumen(p).escenario.totalMes;
    var opciones = PROYECTOS.filter(function (x) {
      return x.id !== p.id && invertidoEn(x.id) === 0 && resumen(x).cuposLibres > 0 && (estado.modo !== 'arrendar' || resumen(x).pasaFiltro);
    }).map(function (x) { return { id: x.id, totalMes: resumen(x).escenario.totalMes }; });
    var mejor = mejorAlternativa(cargaActual, opciones, estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);

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

    if (ev.nivel === 'no-aprueba') {
      return {
        aprueba: false,
        html: '<div class="sugerencia"><p>Para postular aquí, a su ingreso le faltan <strong>' +
          formatoPesos(ingresoFaltante(total, estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas)) + '</strong> al mes.</p>' +
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
  // S12-F2: medidor de carga. Semicírculo de 0 a 40 % con zonas (hasta 25 %, de 25 a 30 % y sobre 30 %),
  // una aguja que gira desde el valor anterior y, con cuotas, una marca para el dividendo solo.
  var agujaMostrada = null;
  function puntoArco(v, radio) {
    var a = Math.PI * (1 - Math.min(Math.max(v, 0), 0.4) / 0.4);
    return [(100 + radio * Math.cos(a)).toFixed(1), (100 - radio * Math.sin(a)).toFixed(1)];
  }
  function arco(v0, v1, clase) {
    var a = puntoArco(v0, 80), b = puntoArco(v1, 80);
    return '<path class="zona ' + clase + '" d="M' + a[0] + ' ' + a[1] + ' A80 80 0 0 1 ' + b[0] + ' ' + b[1] + '"/>';
  }
  function medidorCarga(valor, marca) {
    var grados = 180 * Math.min(Math.max(valor, 0), 0.4) / 0.4;
    var desde = agujaMostrada === null ? 0 : agujaMostrada;
    agujaMostrada = grados;
    var m = marca === null ? '' : (function () {
      var a = puntoArco(marca, 92), b = puntoArco(marca, 68);
      return '<line class="marca-dividendo" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>';
    })();
    return '<svg class="medidor" viewBox="0 0 200 112" aria-hidden="true">' +
      arco(0, 0.25, 'zona-holgado') + arco(0.25, 0.30, 'zona-limite') + arco(0.30, 0.40, 'zona-no') + m +
      '<g class="aguja" style="--desde:' + desde + 'deg;transform:rotate(' + grados.toFixed(1) + 'deg)">' +
        '<line x1="100" y1="100" x2="34" y2="100"/><circle cx="100" cy="100" r="7"/></g>' +
      '<text x="20" y="111" class="medidor-texto">0</text><text x="172" y="111" class="medidor-texto">40 %</text>' +
    '</svg>';
  }

  function renderCarga(p, mostrarVacios) {
    var total = resumen(p).escenario.totalMes;
    var okPropio = validarSueldo($('sueldo-propio'), estado.sueldoPropio, mostrarVacios.propio);
    // La pareja es opcional: solo se marca error si escribió $0.
    var okPareja = estado.sueldoPareja === null || validarSueldo($('sueldo-pareja'), estado.sueldoPareja, false);
    if (estado.sueldoPareja === null) validarSueldo($('sueldo-pareja'), null, false);
    var boton = $('btn-postular');
    var resultado = $('carga-resultado');

    if (!okPropio || !okPareja) {
      resultado.innerHTML = '<p class="texto-apoyo">Escribe tu sueldo para ver tu carga.</p>';
      resultado.dataset.html = '';
      boton.disabled = true;
      $('postular-explica').textContent = 'Para postular, escribe tu sueldo.';
      return false;
    }

    var ev = evaluarCarga(total, estado.otrasCuotas, estado.sueldoPropio, estado.sueldoPareja);
    var s = SEMAFORO[ev.nivel];
    var hayCuotas = (estado.otrasCuotas || 0) > 0;
    var sug = ev.nivel === 'holgado' ? null : sugerencia(p, ev);
    var html =
      '<div class="tarjeta semaforo semaforo-' + ev.nivel + '">' +
        '<p class="etiqueta">Parte de tu sueldo ' + ayuda('carga') + '</p>' +
        medidorCarga(hayCuotas ? ev.cargaTotal : ev.cargaDividendo, hayCuotas ? ev.cargaDividendo : null) +
        '<div class="semaforo-fila">' +
          '<strong class="numero display-2">' + formatoPorcentaje(hayCuotas ? ev.cargaTotal : ev.cargaDividendo, 1) + '</strong>' +
          '<p class="estado-semaforo"><svg aria-hidden="true"><use href="#' + s.icono + '"/></svg>' + s.palabra + '</p>' +
        '</div>' +
        (hayCuotas ? '<p class="texto-apoyo">Dividendo solo: ' + formatoPorcentaje(ev.cargaDividendo, 1) + '</p>' : '') +
      '</div>' +
      (sug ? sug.html : '');
    // Solo se vuelve a dibujar si algo cambió: así, al salir de un campo, nada se mueve bajo el dedo
    // (un "?" abierto o el botón Postular quedan donde estaban).
    if (resultado.dataset.html !== html) { resultado.innerHTML = html; resultado.dataset.html = html; }

    boton.disabled = ev.nivel === 'no-aprueba';
    $('postular-explica').textContent = ev.nivel !== 'no-aprueba' ? ''
      : (sug && sug.aprueba ? 'Así no puedes postular aquí. Revisa la sugerencia.' : 'Así no puedes postular aquí.');
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
    return '<p class="partes-postula">' + (i + 1) + ' de 3' + SEP + actual + '</p>';
  }

  var editandoPostula = false;
  function renderPostula(p, d) {
    var sp = subpasoPostula();
    if (sp === 'documentos') return renderDocumentos(p, d);
    if (sp === 'resultado') return renderResultadoPreaprobacion(p, d);

    var e = resumen(p).escenario;
    var yaTiene = estado.sueldoPropio > 0 && !editandoPostula;
    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pagas al mes', e.totalMes, formatoRedondeado) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-postula">' +
        '<h2 class="h3" id="titulo-postula">Postula</h2>' +
        partesPostula('Tus datos') +
        // S17-F5: no se vuelve a pedir lo ya respondido: se muestra con "Cambiar".
        (yaTiene
          ? '<div class="tarjeta compacta resumen-datos" id="resumen-datos"><ul class="datos-inversion">' +
              '<li><span>Tu sueldo</span><strong>' + formatoPesos(estado.sueldoPropio) + '</strong></li>' +
              (estado.sueldoPareja ? '<li><span>Tu pareja</span><strong>' + formatoPesos(estado.sueldoPareja) + '</strong></li>' : '') +
              '<li><span>Otras cuotas</span><strong>' + formatoPesos(estado.otrasCuotas || 0) + '</strong></li>' +
            '</ul><button type="button" class="enlace" id="btn-cambiar-postula">Cambiar</button></div>'
          : '') +
        '<div class="formulario" id="form-postula"' + (yaTiene ? ' hidden' : '') + '>' +
          campoDinero('sueldo-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          campoDinero('sueldo-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
          campoDinero('otras-cuotas', 'Otras cuotas al mes', estado.otrasCuotas) +
        '</div>' +
        campoContrato() +
        '<div id="carga-resultado" aria-live="polite"></div>' +
        '<p class="sello sello-bci">' + icono('i-escudo') + 'Sin compromiso</p>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-postular" aria-describedby="postular-explica">Postular</button></div>' +
          '<div class="acciones">' +
          '<p class="texto-apoyo" id="postular-explica"></p>' +
          '<p class="texto-centro"><button type="button" class="enlace" id="btn-salir">Salir de esta compra</button></p>' +
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
    if ($('btn-cambiar-postula')) $('btn-cambiar-postula').addEventListener('click', function () {
      editandoPostula = true;
      $('resumen-datos').hidden = true;
      $('form-postula').hidden = false;
      $('sueldo-propio').focus();
    });
    $('otras-cuotas').addEventListener('input', function () {
      estado.otrasCuotas = formatearCampo($('otras-cuotas'));
      guardarEstado();
      renderCarga(p, tocados);
    });
    document.querySelectorAll('input[name="contrato"]').forEach(function (r) {
      r.addEventListener('change', function () { estado.contrato = r.value; guardarEstado(); });
    });

    $('btn-postular').addEventListener('click', function () {
      tocados = { propio: true, pareja: true };
      renderCarga(p, tocados);
      if ($('btn-postular').disabled) { if (!(estado.sueldoPropio > 0)) temblar($('sueldo-propio')); return; }
      var k = evaluarCarga(e.totalMes, estado.otrasCuotas, estado.sueldoPropio, estado.sueldoPareja).cargaTotal;
      conCarga($('btn-postular'), function () {
        guardarCompra(Object.assign({}, estado.compra, { subpaso: 'documentos', carga: k }));
        renderMiCompra();
        window.scrollTo(0, 0);
        anunciar('Datos listos. Ahora tus documentos.');
      });
    });
    prepararSalir();

    // Si ya había sueldos guardados, se muestra la carga de inmediato.
    habiaCarga = renderCarga(p, { propio: estado.sueldoPropio !== null, pareja: estado.sueldoPareja !== null });
  }

  // ---------- Tus documentos: archivos de ejemplo precargados (S8-F3) ----------
  // Los archivos ya vienen en la app: nada se lee, se guarda ni se envía.
  var DOCUMENTOS = [
    { id: 'liquidaciones', corto: 'Liquidación', nombre: 'Últimas 3 liquidaciones de sueldo', para: 'Muestran tu sueldo líquido de los últimos meses.',
      archivos: ['liquidacion_septiembre.pdf', 'liquidacion_agosto.pdf', 'liquidacion_julio.pdf'] },
    { id: 'afp', corto: 'AFP', nombre: 'Certificado de cotizaciones de la AFP', para: 'Muestra 12 meses de cotizaciones: que tu ingreso es estable.',
      archivos: ['certificado_cotizaciones_12_meses.pdf', 'certificado_cotizaciones_24_meses.pdf'] },
    { id: 'contrato', corto: 'Contrato', nombre: 'Contrato de trabajo o certificado de antigüedad', para: 'Muestra tu tipo de contrato y desde cuándo trabajas.',
      archivos: ['contrato_de_trabajo.pdf', 'certificado_de_antiguedad.pdf'] },
    { id: 'carnet', corto: 'Carnet', nombre: 'Carnet de identidad por ambos lados', para: 'Confirma tu identidad.',
      archivos: ['carnet_ambos_lados.pdf', 'carnet_frente_y_reverso.jpg'] }
  ];

  // Miniatura dibujada: rectángulo, líneas grises, título y la marca "DOCUMENTO DE EJEMPLO".
  function miniaturaDoc(titulo, corto) {
    return '<svg class="miniatura-doc" viewBox="0 0 60 78" aria-hidden="true">' +
      '<rect class="md-hoja" x="1" y="1" width="58" height="76" rx="4"/>' +
      '<text class="md-nombre" x="8" y="13">' + esc(corto) + '</text>' +
      '<rect class="md-linea" x="8" y="18" width="44" height="3" rx="1.5"/>' +
      '<rect class="md-linea" x="8" y="25" width="40" height="3" rx="1.5"/>' +
      '<rect class="md-linea" x="8" y="32" width="44" height="3" rx="1.5"/>' +
      '<rect class="md-linea" x="8" y="39" width="34" height="3" rx="1.5"/>' +
      '<rect class="md-marca" x="4" y="49" width="52" height="18" rx="2"/>' +
      '<text class="md-texto" x="30" y="57" text-anchor="middle">DOCUMENTO</text>' +
      '<text class="md-texto" x="30" y="64" text-anchor="middle">DE EJEMPLO</text>' +
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
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-subir-docs"' + (c.cliente === false ? ' aria-pressed="true"' : '') + '>No soy cliente: subir documentos</button>' +
      '</div>';

    var lista = '';
    if (c.cliente === false) {
      // S16-F6: pasaporte con timbres. Cada página es un documento; al subirlo cae el timbre "Listo".
      var listos = DOCUMENTOS.filter(function (x) { return !!docs[x.id]; }).length;
      lista = '<p class="pasaporte-cuenta">' + listos + ' de ' + DOCUMENTOS.length + ' timbrados</p>' +
        '<ul class="pasaporte">' + DOCUMENTOS.map(function (x) {
        var archivo = docs[x.id];
        return '<li class="documento pagina' + (archivo ? ' listo' : '') + '" id="doc-' + x.id + '">' +
          '<button type="button" class="pagina-boton btn-subir" data-doc="' + x.id + '" aria-haspopup="dialog" aria-expanded="false">' +
            '<span class="documento-icono timbre' + (archivo && docRecien === x.id ? ' cae' : '') + '" aria-hidden="true">' + (archivo ? 'LISTO' : 'FALTA') + '</span>' +
            '<strong>' + x.corto + '</strong>' +
            '<small>' + (archivo ? 'Listo' : 'Falta') + '</small>' +
            '<span class="oculto-visual">' + x.nombre + '. ' + (archivo ? 'Cambiar' : 'Subir') + '</span>' +
          '</button>' +
        '</li>';
      }).join('') + '</ul>';
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pagas al mes', resumen(p).escenario.totalMes, formatoRedondeado) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-documentos">' +
        '<h2 class="h3" id="titulo-documentos">Tus documentos</h2>' +
        partesPostula('Tus documentos') +
        '<p class="aviso">En esta demo tus archivos no se guardan ni se envían.</p>' +
        opciones + lista +
        (c.cliente === false
          ? '<div class="accion-fija">' + (documentosListos()
            ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-preaprobacion">Ver mi preaprobación</button>'
            : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-siguiente-doc" aria-haspopup="dialog">Subir ' +
                DOCUMENTOS.filter(function (x) { return !docs[x.id]; })[0].corto.toLowerCase() + '</button>') + '</div>'
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
    if ($('btn-siguiente-doc')) $('btn-siguiente-doc').addEventListener('click', function () {
      var falta = DOCUMENTOS.filter(function (x) { return !docs[x.id]; })[0];
      abrirHoja(p, document.querySelector('.btn-subir[data-doc="' + falta.id + '"]'));
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

  // S12-F3: el check se dibuja en el documento que se acaba de subir.
  var docRecien = null;
  function checkDibujado(animar) {
    return '<svg class="check-documento' + (animar ? ' dibujar' : '') + '" viewBox="0 0 24 24">' +
      '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>';
  }

  // S12-F3: el archivo elegido vuela desde la hoja hasta la fila de su documento.
  function volar(svg, origen, destino) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var el = document.createElement('div');
    el.className = 'archivo-volando';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = svg;
    el.style.left = origen.left + 'px'; el.style.top = origen.top + 'px';
    el.style.width = origen.width + 'px'; el.style.height = origen.height + 'px';
    document.body.appendChild(el);
    var dx = destino.left + destino.width / 2 - (origen.left + origen.width / 2);
    var dy = destino.top + destino.height / 2 - (origen.top + origen.height / 2);
    var k = destino.width / origen.width;
    requestAnimationFrame(function () {
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')';
      el.style.opacity = '0.3';
    });
    setTimeout(function () { el.remove(); }, 450);
  }

  // S12-F3: hoja inferior. Sube desde abajo con fondo atenuado; se cierra con Esc, tocando afuera o con "Cerrar".
  var botonHoja = null;
  function escHoja(ev) { if (ev.key === 'Escape') cerrarHoja(true); }
  function cerrarHoja(devolverFoco) {
    var h = $('hoja-inferior'), f = $('hoja-fondo');
    if (h) h.remove();
    if (f) f.remove();
    document.removeEventListener('keydown', escHoja);
    document.body.classList.remove('con-hoja');
    if (botonHoja) {
      botonHoja.setAttribute('aria-expanded', 'false');
      if (devolverFoco && document.body.contains(botonHoja)) botonHoja.focus();
    }
  }
  function abrirHoja(p, boton) {
    var id = boton.dataset.doc;
    var x = DOCUMENTOS.filter(function (k) { return k.id === id; })[0];
    cerrarHoja(false);
    botonHoja = boton;
    var fondo = document.createElement('div');
    fondo.id = 'hoja-fondo'; fondo.className = 'hoja-fondo';
    var hoja = document.createElement('div');
    hoja.id = 'hoja-inferior'; hoja.className = 'hoja-inferior';
    hoja.setAttribute('role', 'dialog'); hoja.setAttribute('aria-modal', 'true'); hoja.setAttribute('aria-labelledby', 'hoja-titulo');
    hoja.innerHTML = '<span class="hoja-asa" aria-hidden="true"></span>' +
      '<h2 class="h4" id="hoja-titulo">' + x.nombre + '</h2>' +
      '<p class="texto-apoyo">Elige un archivo de ejemplo</p>' +
      '<ul class="archivos">' + x.archivos.map(function (nombre) {
        return '<li><button type="button" class="archivo" data-archivo="' + esc(nombre) + '">' + miniaturaDoc(nombre, x.corto) +
          '<span class="archivo-nombre">' + esc(nombre) + '</span></button></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="btn btn-terciario btn-bloque" id="btn-cerrar-hoja">Cerrar</button>';
    document.body.appendChild(fondo);
    document.body.appendChild(hoja);
    document.body.classList.add('con-hoja');
    boton.setAttribute('aria-expanded', 'true');
    fondo.addEventListener('click', function () { cerrarHoja(true); });
    $('btn-cerrar-hoja').addEventListener('click', function () { cerrarHoja(true); });
    document.addEventListener('keydown', escHoja);
    hoja.querySelector('.archivo').focus();
    hoja.querySelectorAll('.archivo').forEach(function (a) {
      a.addEventListener('click', function () {
        var nombre = a.dataset.archivo;
        var mini = a.querySelector('.miniatura-doc');
        var origen = mini.getBoundingClientRect();
        var svg = mini.outerHTML;
        cerrarHoja(false);
        var fila = $('doc-' + id);
        var destino = fila.querySelector('.documento-icono');
        fila.classList.add('subiendo');
        fila.querySelector('small').textContent = 'Subiendo…';
        anunciar('Subiendo ' + nombre + '…');
        volar(svg, origen, destino.getBoundingClientRect());
        setTimeout(function () {
          if (!estado.compra || subpasoPostula() !== 'documentos' || $('pantalla-mis-proyectos').hidden || !document.body.contains(fila)) return;
          var docs = Object.assign({}, estado.compra.documentos || {});
          docs[id] = nombre;
          guardarCompra(Object.assign({}, estado.compra, { documentos: docs }));
          docRecien = id;
          renderDocumentos(p);
          docRecien = null;
          var reducirTimbre = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!reducirTimbre && navigator.vibrate) navigator.vibrate(30);
          if (documentosListos()) {
            $('btn-ver-preaprobacion').focus();
            toast('Subiste todos tus documentos.');
          } else {
            if ($('btn-siguiente-doc')) $('btn-siguiente-doc').focus();
            anunciar(x.nombre + ': timbrado.');
          }
        }, ESPERA_CARGA);
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
      // S17-F5: el resultado en palabras de la persona; las cifras del crédito, en "Ver números".
      cuerpo =
        '<div class="tarjeta protagonista aprobado' + (alcanza ? '' : ' no-alcanza') + '">' +
          (alcanza
            ? '<p class="estado-semaforo">' + icono('i-ok') + 'Simulado</p><strong class="h3 aprobado-titulo">Bci te aprueba este departamento</strong>'
            : '<p class="estado-semaforo">' + icono('i-alerta') + 'Simulado</p><strong class="h3 aprobado-titulo">Este departamento supera lo que Bci te presta</strong>') +
        '</div>' +
        plegable('numeros-pre', 'Ver números', '',
          '<ul class="datos-inversion">' +
            '<li><span>Bci te presta hasta</span><strong>' + formatoRedondeado(ufAPesos(r.creditoUF)) + '</strong></li>' +
            '<li><span>Este departamento necesita</span><strong>' + formatoRedondeado(ufAPesos(creditoNecesario)) + '</strong></li>' +
            '<li><span>Pagarías hasta al mes</span><strong>' + formatoRedondeado(r.dividendo) + '</strong></li>' +
          '</ul>');
      puedeSeguir = alcanza;
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pagas al mes', e.totalMes) +
      listaPasos(1) +
      '<section class="bloque" aria-labelledby="titulo-resultado">' +
        '<h2 class="h3" id="titulo-resultado">Tu preaprobación</h2>' +
        partesPostula('Resultado') +
        cuerpo +
        '<section class="tarjeta bloque" aria-labelledby="titulo-falta">' +
          '<h3 class="h5" id="titulo-falta">Lo que falta</h3>' +
          '<ol class="lista-numerada"><li>Tasación</li><li>Estudio de títulos</li><li>Firma</li></ol>' +
        '</section>' +
        (puedeSeguir
          ? '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-seguir-pie">Seguir a Tu pie</button></div>'
          : '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div>') +
        '<div class="acciones"><button type="button" class="enlace" id="btn-editar-datos">Editar mis datos</button></div>' +
      '</section>';

    iniciarPlegables();
    var seguir = $('btn-seguir-pie');
    if (seguir) {
      seguir.addEventListener('click', function () {
        conCarga(seguir, function () {
          guardarCompra(Object.assign({}, estado.compra, { paso: pasoTrasPostular(metaCompra(p), p) }));
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
    propio: '',
    grupal: 'Con un grupo y una meta común. Cada uno retira lo que aportó.'
  };

  // Barra de avance con hitos al 25\u00a0%, 50\u00a0%, 75\u00a0% y 100\u00a0%.
  // S11-F4: la alcancía que se llena (desde el % anterior), con los hitos a su lado.
  var pctAlcanciaMostrado = null;
  var hitoNuevo = null;
  var alcanciaDescansa = false;
  function barraHitos(ahorrado, meta) {
    var pct = porcentajeEntero(avance(ahorrado, meta));
    var desde = pctAlcanciaMostrado === null ? 0 : pctAlcanciaMostrado;
    pctAlcanciaMostrado = pct;
    var logrados = hitosAlcanzados(ahorrado, meta);
    // S15: el chanchito se llena de rosado desde abajo, a medida que juntas tu pie.
    var cuerpo = 'M14 54 C14 34 32 24 56 24 C76 24 90 33 94 46 C95 50 95 60 94 64 C90 78 76 86 56 86 C32 86 14 76 14 54 Z';
    var hitos = HITOS_AHORRO.map(function (h) {
      var ok = logrados.indexOf(h) !== -1;
      return '<li class="hito-chip' + (ok ? ' logrado' : '') + (hitoNuevo === h ? ' nuevo' : '') + '">' +
        '<span class="hito-sello" aria-hidden="true">' + (ok ? '<svg><use href="#i-ok"/></svg>' : '') + '</span>' +
        porcentajeEntero(h) + NBSP + '%' + '<span class="oculto-visual">' + (ok ? ', logrado' : ', pendiente') + '</span></li>';
    }).join('');
    var salta = hitoNuevo !== null, descansa = alcanciaDescansa;
    hitoNuevo = null;
    alcanciaDescansa = false;
    return '<div class="alcancia-avance">' +
      '<svg class="alcancia chanchito' + (salta ? ' salta' : '') + (descansa ? ' descansa' : '') + '" id="alcancia" viewBox="0 0 112 100" role="img" aria-label="Llevas ' + pct + ' % de tu meta">' +
        '<defs><clipPath id="clip-alcancia"><path d="' + cuerpo + '"/></clipPath></defs>' +
        '<ellipse class="chancho-sombra" cx="54" cy="95" rx="38" ry="4"/>' +
        '<rect class="chancho-pata" x="26" y="74" width="12" height="19" rx="5"/>' +
        '<rect class="chancho-pata" x="68" y="74" width="12" height="19" rx="5"/>' +
        '<path class="chancho-cola" d="M15 50 C6 49 5 40 11 40 C16 40 15 47 9 47"/>' +
        '<path class="chancho-oreja" d="M70 27 L80 12 L84 31 Z"/>' +
        '<path class="chancho-fondo" d="' + cuerpo + '"/>' +
        // El recorte va en un grupo: si va en el mismo rect, el scaleY también encoge el recorte y el rosado se sale del chanchito.
        '<g clip-path="url(#clip-alcancia)"><rect class="alcancia-relleno" x="0" y="24" width="112" height="62" style="--desde:' + (desde / 100) + ';transform:scaleY(' + (pct / 100) + ')"/></g>' +
        '<path class="chancho-borde" d="' + cuerpo + '"/>' +
        '<path class="chancho-brillo" d="M26 44 C29 37 36 32 44 30"/>' +
        '<rect class="chancho-pata" x="36" y="76" width="12" height="19" rx="5"/>' +
        '<rect class="chancho-pata" x="78" y="74" width="12" height="19" rx="5"/>' +
        '<path class="chancho-oreja" d="M60 26 L68 10 L74 29 Z"/>' +
        '<ellipse class="chancho-hocico" cx="96" cy="56" rx="9" ry="11"/>' +
        '<ellipse class="chancho-nariz" cx="94" cy="52" rx="1.6" ry="2.4"/><ellipse class="chancho-nariz" cx="99" cy="52" rx="1.6" ry="2.4"/>' +
        '<circle class="chancho-ojo" cx="80" cy="45" r="3"/>' +
        '<circle class="chancho-mejilla" cx="82" cy="60" r="4.5"/>' +
        '<rect class="chancho-ranura" x="42" y="27" width="22" height="4.5" rx="2.25"/>' +
      '</svg>' +
      '<div class="alcancia-datos">' +
        '<p class="avance-texto">Llevas ' + formatoPesos(ahorrado) + ' de ' + formatoPesos(meta) + '</p>' +
        '<ol class="hitos-lista" aria-label="Hitos">' + hitos + '</ol>' +
      '</div>' +
    '</div>';
  }

  // S14-F4: arrastrar la cuota a la alcancía simula el mes. "Simular un mes" queda como alternativa.
  function iniciarMoneda() {
    var moneda = $('moneda');
    var alcancia = $('alcancia');
    if (!moneda || !alcancia || !window.PointerEvent) return;
    var x0 = 0, y0 = 0, arrastrando = false, apretada = false;
    moneda.addEventListener('pointerdown', function (ev) {
      apretada = true;
      x0 = ev.clientX; y0 = ev.clientY;
      moneda.setPointerCapture(ev.pointerId);
    });
    moneda.addEventListener('pointermove', function (ev) {
      if (!apretada) return;
      // Umbral: un toque o un temblor no arrastra la moneda.
      if (!arrastrando && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
      if (!arrastrando) { arrastrando = true; moneda.classList.add('arrastrando'); }
      moneda.style.transform = 'translate(' + (ev.clientX - x0) + 'px,' + (ev.clientY - y0) + 'px) scale(1.05)';
      var a = alcancia.getBoundingClientRect();
      alcancia.classList.toggle('lista', ev.clientX > a.left && ev.clientX < a.right && ev.clientY > a.top && ev.clientY < a.bottom);
    });
    function soltar(ev) {
      apretada = false;
      if (!arrastrando) return;
      arrastrando = false;
      moneda.classList.remove('arrastrando');
      var a = alcancia.getBoundingClientRect();
      var dentro = ev.clientX > a.left && ev.clientX < a.right && ev.clientY > a.top && ev.clientY < a.bottom;
      alcancia.classList.remove('lista');
      if (dentro) {
        moneda.classList.add('entra');
        setTimeout(function () { $('btn-simular-mes').click(); }, 180);
      } else {
        moneda.style.transform = '';
      }
    }
    moneda.addEventListener('pointerup', soltar);
    moneda.addEventListener('pointercancel', function () { apretada = false; arrastrando = false; moneda.style.transform = ''; moneda.classList.remove('arrastrando'); });
  }

  // S11-F4: la racha como 6 puntos de calendario (los últimos meses simulados).
  function puntosRacha() {
    var h = (estado.historialMeses || []).slice(-6);
    var puntos = [];
    for (var i = 0; i < 6; i++) {
      var r = h[i];
      var clase = r === 'pago' ? 'pagado' : (r === 'protector' ? 'protegido' : (r === 'reinicio' ? 'perdido' : 'vacio'));
      var ic = r === 'pago' ? '<svg aria-hidden="true"><use href="#i-check"/></svg>' : (r === 'protector' ? '<svg aria-hidden="true"><use href="#i-escudo"/></svg>' : '');
      puntos.push('<li class="punto-mes ' + clase + '">' + ic + '</li>');
    }
    var texto = estado.racha > 0 ? plural(estado.racha, 'mes seguido', 'meses seguidos') : 'Tu racha empieza este mes';
    return '<div class="racha-meses"><ol class="puntos-racha" aria-hidden="true">' + puntos.join('') + '</ol>' +
      '<p class="racha-texto">' + texto + '</p></div>';
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

  // Plazo de la recompra para mostrar: con el tope de 84 meses.
  function textoPlazo(pl) {
    if (pl.noAlcanza) return 'El arriendo no alcanza';
    if (pl.superaTope) return 'Mes 84: refinancias o vendes';
    return '≈ ' + textoMeses(pl.meses);
  }

  function renderTu5(p, d) {
    var meta = metaCompra(p);
    // Si ya se juntó todo (por ejemplo, al cambiar a un proyecto más barato), se pasa a la firma.
    var enGrupo = p.tipo === 'conjunto';
    var cabecera = tarjetaCompacta(p, 'Pagas al mes', resumen(p).escenario.totalMes, formatoRedondeado) + listaPasos(2) +
      '<h2 class="h3 bloque" id="titulo-tu5">' + (enGrupo ? 'Tu pie en cuotas ' : 'Tu pie ') + ayuda('pie') + '</h2>';
    // S10-F3: en la compra en grupo, el pie va a una cuenta bloqueada de Bci y se puede salir sin multa.
    var cuentaGrupo = (enGrupo
      ? '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Tu pie está asegurado en Bci</p>'
      : '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Tu ahorro está en tu cuenta Bci</p>') +
      '<p class="texto-apoyo">Salida sin multa ' + ayuda('salida-sin-multa') + '</p>';

    if (!estado.ahorroIniciado) {
      $('panel-compra').innerHTML = cabecera +
        '<section aria-labelledby="titulo-tu5">' +
          campoDinero('ahorro-mensual', enGrupo ? 'Tu cuota al mes' : '¿Cuánto puedes ahorrar al mes?', estado.ahorroMensual) +
          '<div id="meses-resultado" aria-live="polite"></div>' +
          cuentaGrupo +
          '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-empezar">Empezar a ahorrar</button></div>' +
            '<div class="acciones">' +
            '<p class="texto-centro"><button type="button" class="enlace" id="btn-salir">Salir de esta compra</button></p>' +
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
        var pl = plazoTuPie(p, meta);
        $('meses-resultado').innerHTML =
          '<div class="tarjeta resultado-meses">' +
            '<p class="etiqueta">Tus llaves en</p>' +
            '<strong class="numero display-2">' + textoMeses(pl.meses) + '</strong>' +
            '<p class="texto-apoyo">' + fechaLlaves(pl.meses, hoyDemo()) + SEP + FRENO[pl.freno] + '</p>' +
            barraHitos(ahorradoTuPie(meta), meta) +
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
        if ($('btn-empezar').disabled) { temblar($('ahorro-mensual')); $('ahorro-mensual').focus(); return; }
        // Lo que ya tenía ahorrado cuenta desde el primer día.
        if (!estado.ahorrado) estado.ahorrado = Math.min(meta, estado.ahorroActual || 0);
        estado.ahorroIniciado = true;
        guardarEstado();
        renderMiCompra();
        window.scrollTo(0, 0);
      });
      prepararSalir();
      dibujarMeses();
      return;
    }

    // S18-F2: si el pie ya está pero el edificio aún no se entrega, se espera la entrega (no se firma antes).
    if (estado.ahorrado >= meta && entregaPendiente(p)) { renderPieListo(p, d, meta, cabecera, cuentaGrupo); return; }

    // Ya empezó a ahorrar: el número es lo que falta, y la acción es simular un mes.
    var plTu = plazoTuPie(p, meta);
    var faltan = plTu.meses;
    var protector = protectorDisponible(estado.mesAhorro + 1, estado.ultimoProtector);
    $('panel-compra').innerHTML = cabecera +
      '<section aria-labelledby="titulo-tu5">' +
        '<div class="tarjeta resultado-meses">' +
          '<p class="etiqueta">Tus llaves en</p>' +
          '<strong class="numero display-2">' + textoMeses(faltan) + '</strong>' +
          '<p class="texto-apoyo">' + fechaLlaves(faltan, hoyDemo()) + SEP + FRENO[plTu.freno] + '</p>' +
          '<div class="zona-moneda">' +
            '<span class="moneda" id="moneda" aria-hidden="true">' + formatoPesos(estado.ahorroMensual) + '</span>' +
            '<span class="moneda-pista">' + (enGrupo ? 'Tu cuota' : 'Tu ahorro') + ' al mes' +
              '<small aria-hidden="true">Arrastra la moneda</small></span>' +
          '</div>' +
          barraHitos(estado.ahorrado, meta) +
          puntosRacha() +
          cuentaGrupo +
        '</div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-simular-mes">Pagar mi cuota</button></div>' +
        // S17-F10: lo que no es la acción del mes queda plegado.
        plegable('mas-opciones', enGrupo ? 'Tu cuota' : 'Tu ahorro', '',
          '<button type="button" class="interruptor interruptor-cuota" role="switch" aria-checked="' + estado.cuotaAutomatica + '" id="btn-cuota-automatica">' +
            '<span>' + icono('i-calendario') + 'Pagar mi cuota sola el día 5</span>' +
            '<span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>' +
          '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-no-pude">' + (estado.cuotaAutomatica ? 'Pausar este mes' : 'Este mes no pude') + '</button>' +
          '<p class="texto-apoyo texto-centro">' + (protector ? 'Protector de racha disponible ' + ayuda('protector') : 'Protector de racha en ' + textoMeses(mesesParaProtector(estado.mesAhorro + 1, estado.ultimoProtector))) + '</p>' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-cambiar-ahorro">Cambiar mi ahorro mensual</button>') +
        bloqueJuntos() +
        (enGrupo ? tuGrupoYObra(p) : '') +
      '</section>';

    iniciarJuntos(p, d);
    iniciarPlegables();
    $('btn-cuota-automatica').addEventListener('click', function () {
      estado.cuotaAutomatica = !estado.cuotaAutomatica;
      guardarEstado();
      renderTu5(p, d);
      plegablesAbiertos['mas-opciones'] = true;
      $('btn-cuota-automatica').focus();
      toast(estado.cuotaAutomatica ? 'Tu cuota se paga sola el día 5 (simulado).' : 'Pagas tu cuota a mano.');
    });
    $('btn-no-pude').addEventListener('click', function () {
      var r = registrarMes({ mes: estado.mesAhorro, racha: estado.racha, ultimoProtector: estado.ultimoProtector }, false);
      estado.mesAhorro = r.mes; estado.racha = r.racha; estado.ultimoProtector = r.ultimoProtector;
      estado.historialMeses = (estado.historialMeses || []).concat([r.resultado]).slice(-6);
      guardarEstado();
      alcanciaDescansa = true;
      renderTu5(p, d);
      toast(r.resultado === 'protector' ? 'Usaste tu protector: tu racha sigue.' : 'Tu racha vuelve a empezar. Lo ahorrado sigue ahí.');
      $('btn-no-pude').focus();
    });

    $('btn-simular-mes').addEventListener('click', function () {
      var antes = hitosAlcanzados(estado.ahorrado, meta);
      estado.ahorrado = sumarMes(estado.ahorrado, estado.ahorroMensual, meta);
      var r = registrarMes({ mes: estado.mesAhorro, racha: estado.racha, ultimoProtector: estado.ultimoProtector }, true);
      estado.mesAhorro = r.mes; estado.racha = r.racha; estado.ultimoProtector = r.ultimoProtector;
      estado.historialMeses = (estado.historialMeses || []).concat([r.resultado]).slice(-6);
      guardarEstado();
      if (estado.ahorrado >= meta) {
        if (entregaPendiente(p)) {
          renderTu5(p, d);
          toast('¡Juntaste tu pie! Ahora esperas la entrega.');
          if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
          return;
        }
        guardarCompra(Object.assign({}, estado.compra, { paso: 3 }));
        llegoAFirma = true;
        renderMiCompra();
        return;
      }
      var nuevos = hitosAlcanzados(estado.ahorrado, meta).filter(function (h) { return antes.indexOf(h) === -1; });
      if (nuevos.length) hitoNuevo = nuevos[nuevos.length - 1];
      renderTu5(p, d);
      var faltanAhora = plazoTuPie(p, meta).meses;
      if (nuevos.length) {
        toast(textoHito(nuevos[nuevos.length - 1], enGrupo ? (p.etapaObra || 0) : undefined));
        if (navigator.vibrate) navigator.vibrate(40);
      }
      else anunciar('Cuota pagada (simulado). Te faltan ' + textoMeses(faltanAhora) + '.');
      $('btn-simular-mes').focus();
    });
    iniciarMoneda();
    prepararSeUne(p, d);
    $('btn-cambiar-ahorro').addEventListener('click', function () {
      estado.ahorroIniciado = false;
      guardarEstado();
      renderMiCompra();
    });
  }

  // S18-F2: el pie está listo y falta la entrega. Tus llaves las fija el edificio; la demo puede saltar a ese mes.
  function renderPieListo(p, d, meta, cabecera, cuentaGrupo) {
    var esp = esperaMinima(p);
    var m = esp.meses;
    $('panel-compra').innerHTML = cabecera +
      '<section aria-labelledby="titulo-tu5">' +
        '<div class="tarjeta resultado-meses">' +
          '<p class="sello"><svg aria-hidden="true"><use href="#i-ok"/></svg>Tu pie está listo</p>' +
          '<p class="etiqueta">Tus llaves en</p>' +
          '<strong class="numero display-2">' + textoMeses(m) + '</strong>' +
          '<p class="texto-apoyo">' + fechaLlaves(m, hoyDemo()) + SEP + FRENO[esp.freno] + '</p>' +
          barraHitos(estado.ahorrado, meta) +
          cuentaGrupo +
        '</div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-saltar-entrega">' + (esp.freno === 'entrega' ? 'Ir a la entrega · demo' : 'Ir a tu firma · demo') + '</button></div>' +
        bloqueJuntos() +
        (p.tipo === 'conjunto' ? tuGrupoYObra(p) : '') +
      '</section>';
    iniciarJuntos(p, d);
    iniciarPlegables();
    prepararSeUne(p, d);
    $('btn-saltar-entrega').addEventListener('click', function () {
      estado.mesAhorro = (estado.mesAhorro || 0) + esperaMinima(p).meses;
      guardarEstado();
      guardarCompra(Object.assign({}, estado.compra, { paso: 3 }));
      llegoAFirma = true;
      renderMiCompra();
      window.scrollTo(0, 0);
    });
  }

  function prepararSeUne(p, d) {
    if ($('btn-se-une')) $('btn-se-une').addEventListener('click', function () {
      var antes = resumen(p).cuposTomados;
      estado.unidosGrupo[p.id] = (estado.unidosGrupo[p.id] || 0) + 1;
      guardarEstado();
      var despues = resumen(p).cuposTomados;
      var escalon = escalonCruzado(antes, despues);
      plegablesAbiertos.grupo = true;
      if (escalon) grupoDestella = true;
      renderTu5(p, d);
      $('titulo-grupo').scrollIntoView({ block: 'start' });
      toast(escalon ? '¡Su grupo llegó a ' + escalon.cupos + '! Todos tienen ' + formatoPorcentaje(escalon.descuento, 0) + ' de descuento.' : 'Se unió alguien a tu grupo.');
      if (escalon && navigator.vibrate) navigator.vibrate([40, 60, 40]);
    });
  }

  // ---------- Paso 3: Firma (S4-F5) ----------
  function renderFirma(p, d, recienLlegado) {
    var e = resumen(p).escenario;
    var arrendar = estado.modo === 'arrendar';
    // S18-F7: para vivir, lo que firmas en filas (aquí sí van los montos exactos) y con las piezas elegidas.
    var credito = arrendar
      ? filaFirma('Crédito hipotecario Bci ' + ayuda('dividendo'),
          Math.round(e.pctCredito * 100) + ' % (' + formatoPesos(e.reparto.bci) + ') a 30 años, al 3,9 %: ' + formatoPesos(e.dividendo) + ' al mes.')
      : '';
    var filasVivir = arrendar ? '' :
      '<ul class="datos-inversion">' +
        '<li><span>Precio' + (e.conPiezas && e.conPiezas.iva ? ' sin IVA' : '') + '</span><strong>' + formatoPesos(e.precio) + '</strong></li>' +
        '<li><span>Bci te presta</span><strong>' + formatoPesos(e.reparto.bci) + '</strong></li>' +
        (e.subsidio ? '<li><span>Subsidio del Estado</span><strong>' + formatoPesos(e.subsidio) + '</strong></li>' : '') +
        '<li><span>Pagas al mes</span><strong>' + formatoPesos(e.dividendo) + '</strong></li>' +
        '<li><span>Plazo</span><strong>30 años</strong></li>' +
        '<li><span>Tasa ' + ayuda('dividendo') + '</span><strong>3,9 %</strong></li>' +
        '<li><span>Sin subsidio a la tasa</span><strong>' + formatoPesos(e.dividendoSinSubsidio) + ' al mes</strong></li>' +
      '</ul>';
    var segunda = arrendar && e.pctInversionistas === 0 ? ''
      : arrendar
      ? filaFirma('Participación de los inversionistas ' + ayuda('participacion'),
          '15 % (' + formatoPesos(e.reparto.inversionistas) + '). Sin cuota para ti: el arriendo les paga 6 % al año en UF y recompra su parte.') +
        filaFirma('Cuenta custodia Bci ' + ayuda('cuenta-custodia'),
          'Recibe el arriendo y paga a los inversionistas.')
      : filaFirma(e.conPiezas && e.conPiezas.respaldo ? 'Respaldo familiar · propuesta' : 'Garantía del Estado (FOGAES)',
          e.conPiezas && e.conPiezas.respaldo ? 'Un familiar deja una garantía en Bci.' : 'Para tu primera vivienda. Se usa una sola vez.');

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Ya tienes', metaCompra(p)) + listaPasos(3) +
      '<div class="logro bloque"' + (recienLlegado ? ' role="status"' : '') + '>' +
        '<svg aria-hidden="true"><use href="#i-ok"/></svg>' +
        '<p><strong>¡Juntaste tu pie!</strong></p>' +
      '</div>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-firma">' +
        '<h2 class="h3" id="titulo-firma">Lo que firmas</h2>' +
        filasVivir +
        '<ul class="lista-check">' + credito + segunda + '</ul>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque btn-mantener" id="btn-firmar">' +
        '<span class="mantener-relleno" aria-hidden="true"></span><span class="mantener-texto">Mantén para firmar</span></button></div>' +
        '<div class="acciones">' +
        '<p class="texto-apoyo">Firma simulada.</p>' +
      '</div>';

    // S14-F5: mantener presionado 1,5 s para firmar. Con teclado (o con movimiento reducido), un toque firma.
    var boton = $('btn-firmar');
    var espera = null;
    var presiono = false; // los clics de lectores de pantalla (VoiceOver, TalkBack) llegan sin pointerdown
    var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function cancelar() { clearTimeout(espera); espera = null; boton.classList.remove('presionando'); }
    boton.addEventListener('pointerdown', function (ev) {
      presiono = true;
      if (reducir || ev.button > 0) return;
      clearTimeout(espera);
      boton.classList.add('presionando');
      espera = setTimeout(function () { espera = null; boton.classList.remove('presionando'); firmar(); }, 1500);
    });
    ['pointerup', 'pointerleave', 'pointercancel', 'lostpointercapture'].forEach(function (t) { boton.addEventListener(t, function () { if (espera) cancelar(); }); });
    boton.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    boton.addEventListener('click', function (ev) {
      // Un clic con el mouse o el dedo no firma (hay que mantener). Enter, Espacio o un lector de pantalla sí.
      var sinPresionar = !presiono;
      presiono = false;
      if (ev.detail === 0 || reducir || sinPresionar) firmar();
    });
    function firmar() {
      // Solo firma si el botón sigue en pantalla (por ejemplo, si no se cambió de paso mientras se mantenía).
      if (!document.body.contains(boton)) return;
      conCarga(boton, function () {
        // El ahorro se usó para escriturar: queda en cero.
        estado.ahorrado = 0;
        estado.ahorroIniciado = false;
        guardarEstado();
        guardarCompra(Object.assign({}, estado.compra, {
          paso: 4, mes: 1, arriendoMes: d.arriendoEstimadoIA, saldoParticipacionUF: e.participacionUF, fraccion: 1
        }));
        recienFirmado = true;
        puertaHasta = Date.now() + 4000; // la ruta puede volver a dibujar Mi departamento: la puerta se mantiene
        renderMiCompra();
        recienFirmado = false;
        window.scrollTo(0, 0);
        toast(estado.regalos.length ? '¡Es tuyo! Avisamos a quienes aportaron.' : '¡Es tuyo!');
        confeti();
        if (navigator.vibrate) navigator.vibrate([60, 80, 60]);
      });
    }
  }

  // S14-F5: la única celebración grande de la app, en los colores del Bci Kit. Nunca con movimiento reducido.
  function confeti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var capa = document.createElement('div');
    capa.className = 'confeti';
    capa.setAttribute('aria-hidden', 'true');
    var colores = ['var(--blue-normal)', 'var(--green-normal)', 'var(--yellow-normal)', 'var(--red-normal)', 'var(--blue-40)'];
    for (var i = 0; i < 36; i++) {
      var pieza = document.createElement('span');
      pieza.style.left = (Math.random() * 100) + '%';
      pieza.style.background = colores[i % colores.length];
      pieza.style.animationDelay = (Math.random() * 300) + 'ms';
      pieza.style.setProperty('--giro', (Math.random() * 720 - 360) + 'deg');
      pieza.style.setProperty('--deriva', (Math.random() * 80 - 40) + 'px');
      capa.appendChild(pieza);
    }
    document.body.appendChild(capa);
    setTimeout(function () { capa.remove(); }, 2200);
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
    var arriendo = c.arriendoMes === undefined || c.arriendoMes === null ? d.arriendoEstimadoIA : c.arriendoMes;
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
      plazo: plazoRecompra(saldo, netoUF, fraccion, mes - 1),
      plazoPeor: plazoRecompra(saldo, arriendoNeto(arriendo * 0.9) / SUPUESTOS.uf, fraccion, mes - 1),
      conInversionistas: arrendar && e.pctInversionistas > 0,
      patrimonioUF: patrimonioUF(e.precioUF, saldoBciUF(e.precioUF, mes, modoFinanciero(p), arrendar ? undefined : e.pctCredito), arrendar ? cascada.saldoDespuesUF : 0),
      crecimientoUF: crecimientoMesUF(e.precioUF, mes, modoFinanciero(p), arrendar ? pesosAUF(cascada.recompra) : 0, arrendar ? undefined : e.pctCredito),
      pone: arrendar ? cascada.pone : e.totalMes,
      excedente: arrendar ? cascada.excedente : 0,
      saldoBci: ufAPesos(saldoBciUF(e.precioUF, mes, estado.modo, arrendar ? undefined : e.pctCredito)),
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
  // S10-F2: si vende este mes, en qué orden se paga (sin plusvalía) y la venta asistida.
  function seccionArrepiento(m) {
    var v = ventaHoy(m.e.precioUF, saldoBciUF(m.e.precioUF, m.mes, modoFinanciero(buscarProyecto(estado.compra.proyectoId))), m.saldoParticipacionUF);
    var n = 1;
    return '<section class="tarjeta bloque" aria-labelledby="btn-arrepiento">' +
      '<button type="button" class="enlace desplegar" id="btn-arrepiento" aria-expanded="false" aria-controls="arrepiento">' +
        '¿Y si me arrepiento?<svg aria-hidden="true"><use href="#i-flecha"/></svg></button>' +
      '<div id="arrepiento" hidden>' +
        '<p class="texto-apoyo">Si vendes este mes en ' + formatoPesos(v.valor) + ':</p>' +
        '<ol class="cascada">' +
          pasoCascada(n++, 'Bci', 'Lo que queda del crédito', formatoPesos(v.bci)) +
          (v.inversionistas > 0 ? pasoCascada(n++, 'Inversionistas', 'Según su parte', formatoPesos(v.inversionistas)) : '') +
          pasoCascada(n++, 'Costos de venta', null, formatoPesos(v.costos)) +
          pasoCascada(n++, 'Para ti', null, formatoPesos(v.usuario), 'cascada-final') +
        '</ol>' +
        (v.faltaParaBci > 0 ? '<p class="aviso aviso-alerta">Faltan ' + formatoPesos(v.faltaParaBci) + ' para pagar el crédito.</p>' : '') +
        '<p class="texto-apoyo nota">Si atrasas 2 dividendos, Bci te acompaña a vender antes de un remate.</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</div>' +
    '</section>';
  }

  // S10-F1: la casa se va pintando desde abajo con la parte que ya es tuya.
  var pctCasaMostrado = null;
  var recienFirmado = false;
  var puertaHasta = 0;
  // Departamento contemporáneo ilustrado: sus pisos y muros se van pintando desde abajo con la parte que ya es tuya.
  function casaPintada(pct) {
    var desde = pctCasaMostrado === null ? pct : pctCasaMostrado;
    pctCasaMostrado = pct;
    return '<svg class="casa casa-ilustrada" viewBox="0 0 120 100" aria-hidden="true">' +
      '<defs><clipPath id="clip-casa"><rect x="22" y="28" width="76" height="62" rx="2"/></clipPath></defs>' +
      '<ellipse class="casa-pasto" cx="60" cy="93" rx="54" ry="4"/>' +
      '<polygon class="casa-sendero" points="54,90 66,90 70,95 50,95"/>' +
      '<circle class="casa-arbusto-2" cx="13" cy="88" r="6"/><circle class="casa-arbusto" cx="19" cy="89.5" r="5"/>' +
      '<circle class="casa-arbusto-2" cx="107" cy="88" r="6"/><circle class="casa-arbusto" cx="101" cy="89.5" r="5"/>' +
      '<rect class="casa-cornisa" x="19" y="25" width="82" height="4" rx="1.5"/>' +
      '<line class="casa-pergola-post" x1="28" y1="13" x2="28" y2="25"/><line class="casa-pergola-post" x1="56" y1="13" x2="56" y2="25"/>' +
      '<path class="casa-pergola-vigas" d="M24 13 H60 M26 17 H58 M28 21 H56"/>' +
      '<rect class="casa-macetero-techo" x="72" y="19" width="14" height="6" rx="1"/>' +
      '<circle class="casa-hoja-r1" cx="76" cy="16" r="3.2"/><circle class="casa-hoja-r2" cx="82" cy="16" r="3.2"/>' +
      '<rect class="casa-fondo" x="22" y="28" width="76" height="62" rx="2"/>' +
      '<rect class="casa-pintura" x="22" y="28" width="76" height="62" clip-path="url(#clip-casa)" style="--desde:' + (desde / 100) + ';transform:scaleY(' + (pct / 100) + ')"/>' +
      '<rect class="casa-borde" x="22" y="28" width="76" height="62" rx="2"/>' +
      '<line class="casa-piso-linea" x1="22" y1="58" x2="98" y2="58"/>' +
      '<rect class="casa-balcon-vidrio" x="28" y="44" width="34" height="14" rx="1"/>' +
      '<line class="casa-balcon-baranda" x1="27" y1="44" x2="63" y2="44"/><line class="casa-balcon-post" x1="45" y1="44" x2="45" y2="58"/>' +
      '<rect class="casa-ventana-balcon" x="30" y="32" width="30" height="24" rx="1.5"/>' +
      '<line class="casa-marco" x1="45" y1="32" x2="45" y2="56"/>' +
      '<rect class="casa-macetero-balcon" x="52" y="42" width="7" height="4" rx="1"/>' +
      '<path class="casa-hoja" d="M53 46 c-1 4 2 5 2 7 M57 46 c1 3 -1 6 0 8"/>' +
      '<rect class="casa-ventana" x="68" y="34" width="22" height="18" rx="1.5"/>' +
      '<path class="casa-marco" d="M79 34 V52 M68 43 H90"/>' +
      '<rect class="casa-ventana" x="28" y="64" width="30" height="22" rx="1.5"/>' +
      '<path class="casa-marco" d="M43 64 V86 M28 75 H58"/>' +
      '<circle class="casa-planta-interior" cx="35" cy="82" r="2.5"/>' +
      '<rect class="casa-puerta" x="68" y="62" width="22" height="28" rx="1.5"/>' +
      '<path class="casa-puerta-lineas" d="M76 68 H87 M76 74 H87 M76 80 H87"/>' +
      '<line class="casa-pomo-barra" x1="72" y1="72" x2="72" y2="80"/>' +
      '<circle class="casa-pomo-punto" cx="72" cy="72" r="0.8"/><circle class="casa-pomo-punto" cx="72" cy="80" r="0.8"/>' +
      '<polygon class="casa-luz-cono" points="64.5,69 61,77 68,77"/>' +
      '<rect class="casa-lampara" x="63" y="66" width="3" height="4.5" rx="0.8"/>' +
    '</svg>';
  }

  // S12-F4: el arriendo del mes como un flujo: entra arriba y baja por tramos de ancho proporcional a su monto.
  function flujoArriendo(c, tramos, aparte) {
    var fila = function (t, i) {
      var k = Math.min(1, Math.max(0, t.monto / c.bruto));
      return '<li class="flujo-fila' + (t.final ? ' flujo-final' : '') + '" style="animation-delay:' + (i * 80) + 'ms">' +
        '<span class="flujo-texto">' + icono(t.icono) + '<span>' + t.nombre + (t.detalle ? '<small>' + t.detalle + '</small>' : '') + '</span></span>' +
        '<strong>' + (t.resta ? '−' : '') + formatoPesos(t.monto) + '</strong>' +
        '<span class="flujo-barra" aria-hidden="true"><span class="flujo-relleno tono-' + t.tono + '" style="transform:scaleX(' + k.toFixed(3) + ')"></span></span>' +
      '</li>';
    };
    return '<ol class="flujo">' +
      fila({ nombre: 'Entra el arriendo', icono: 'i-llave', monto: c.bruto, tono: 'arriendo' }, 0) +
      '<li class="flujo-flecha" aria-hidden="true"><svg><use href="#i-flujo"/></svg></li>' +
      tramos.map(function (t, i) { return fila(t, i + 1); }).join('') +
    '</ol>' +
    '<div class="flujo-aparte">' + icono('i-persona', 'icono-grande') +
      '<span><strong>' + aparte.nombre + '</strong><small>' + aparte.detalle + '</small></span>' +
      '<strong class="flujo-aparte-monto">' + formatoPesos(aparte.monto) + '</strong></div>';
  }


  function textoPlazoCasa(pl, faltan) {
    if (faltan === 0) return 'Ya es 100 % tuyo.';
    if (pl.noAlcanza) return 'El arriendo de hoy no alcanza para recomprar.';
    if (pl.superaTope) return 'No llegas al 100 %: en el mes 84 refinancias o vendes.';
    return 'Te faltan ' + textoMeses(pl.meses) + '.';
  }

  // Cuánto del departamento ya es tuyo (pie compartido): la parte de los inversionistas se recompra con el arriendo.
  function barraParticipacion(m) {
    var pct = Math.max(0, Math.min(100, m.porcentajeTuyo));
    var peor = m.faltanRecompra === 0 ? ''
      : '<p class="peor-caso"><strong>Peor caso:</strong> con 10\u00a0% menos de arriendo, ' +
        (m.plazoPeor.superaTope ? 'en el mes 84 refinancias o vendes.' : textoMeses(m.plazoPeor.meses) + '.') + '</p>';
    return '<div class="casa-avance" role="img" aria-label="Ya es tuyo el ' + pct + ' % del departamento">' +
      casaPintada(pct) +
      '<div><p class="etiqueta">Ya es tuyo</p><strong class="numero display-3">' + pct + ' %</strong>' +
      '<p class="cierre">' + textoPlazoCasa(m.plazo, m.faltanRecompra) + '</p></div>' +
    '</div>' + peor;
  }


  // S16-F3 y F4: al firmar, la puerta se abre con la usuaria y todo su equipo delante.
  function puertaEquipo() {
    var texto = textoEquipo();
    return '<section class="puerta-equipo bloque" aria-labelledby="titulo-puerta">' +
      '<div class="puerta-abierta" aria-hidden="true"><span class="puerta-luz"></span><span class="puerta-hoja"></span></div>' +
      '<div class="puerta-figuras" aria-hidden="true">' + avatarSVG(estado.avatar, 56, 'puerta-av') +
        estado.equipo.map(function (m) { return avatarMiembro(m, 48, 'puerta-av'); }).join('') + '</div>' +
      '<p class="h4" id="titulo-puerta">¡Es tuyo!</p>' +
      (texto ? '<p class="texto-apoyo">' + texto + '</p>' : '') +
    '</section>';
  }

  function renderMiDepartamento(p, d) {
    var m = mesDelDepartamento(p, d);
    var c = m.cascada;
    var arrendar = estado.modo === 'arrendar';
    var conParticipacion = arrendar && m.saldoParticipacionUF > 1e-9;
    var cuerpo;

    if (arrendar) {
      // S10-F1 y S12-F4: arriendo → administración → renta → recompra; el dividendo lo pagas tú, aparte.
      var gastos = { nombre: 'Administración y mes vacío', icono: 'i-documento', monto: c.administracion + c.vacancia, tono: 'gastos', resta: true };
      var tramos = conParticipacion
        ? [gastos,
          { nombre: 'Renta de los inversionistas', detalle: '6 % al año en UF', icono: 'i-inversionistas', monto: c.renta, tono: 'inversionistas' },
          { nombre: 'Recompras su parte', icono: 'i-casa', monto: c.recompra, tono: 'tu', final: m.fraccion === 1 }]
          .concat(m.fraccion < 1 ? [{ nombre: 'Te ayuda con el dividendo', icono: 'i-persona', monto: c.aUsuario, tono: 'ayuda', final: true }] : [])
        : [gastos, { nombre: 'Va a tu dividendo', icono: 'i-banco', monto: c.aUsuario, tono: 'tu', final: true }];
      var aparte = conParticipacion
        ? { nombre: 'Lo pagas tú', detalle: 'Dividendo, con tu sueldo', monto: m.pone }
        : (m.excedente > 0 ? { nombre: 'Te sobra', detalle: 'Después del dividendo', monto: m.excedente }
          : { nombre: 'Lo completas tú', detalle: 'El resto del dividendo', monto: m.pone });
      cuerpo =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">' + (m.excedente > 0 ? 'Este mes te sobraron' : 'Este mes pusiste') + '</p>' +
          '<strong class="numero display-3">' + formatoPesos(m.excedente > 0 ? m.excedente : m.pone) + '</strong>' +
          (conParticipacion ? ''
            : '<p class="texto-apoyo">' + (m.excedente > 0 ? 'El arriendo alcanzó para todo el dividendo.' : 'El arriendo cubrió ' + formatoPesos(c.aUsuario) + ' del dividendo.') + '</p>') +
        '</div>' +
        campoDinero('arriendo-mes', 'Arriendo que entró este mes', m.arriendo) +
        (conParticipacion
          ? '<fieldset class="selector"><legend>¿Cuánto del arriendo va a la recompra?</legend><div class="selector-opciones">' +
              '<input type="radio" name="fraccion" id="fraccion-100" value="1"' + (m.fraccion === 1 ? ' checked' : '') + '><label for="fraccion-100">100 %</label>' +
              '<input type="radio" name="fraccion" id="fraccion-80" value="0.8"' + (m.fraccion === 0.8 ? ' checked' : '') + '><label for="fraccion-80">80 %</label>' +
            '</div></fieldset>' +
            '<p class="texto-apoyo">Con 80 %, el 20 % restante te ayuda con el dividendo.</p>'
          : '') +
        '<section class="tarjeta bloque" aria-labelledby="titulo-cascada">' +
          '<h2 class="h4" id="titulo-cascada">Cómo se movió tu dinero</h2>' +
          '<p class="texto-apoyo">En tu cuenta custodia Bci ' + ayuda('cuenta-custodia') + '</p>' +
          flujoArriendo(c, tramos, aparte) +
        '</section>';
    } else {
      // S5-F3: modo vivir, comparado con el arriendo que pagaba.
      // S18-F8: el arriendo ya se dio en las preguntas; solo se pide si falta. Los datos van en filas.
      var antes = estado.arriendoActual;
      var tiene = antes !== null && antes !== undefined && antes > 0;
      var dif = tiene ? m.e.totalMes - antes : 0;
      cuerpo =
        '<div class="tarjeta protagonista">' +
          '<p class="etiqueta">Este mes pagaste</p>' +
          '<strong class="numero display-3">' + formatoPesos(m.e.totalMes) + '</strong>' +
          '<p class="texto-apoyo">Con seguros incluidos.</p>' +
          (tiene ? '<ul class="datos-inversion">' +
            '<li><span>Antes, de arriendo</span><strong>' + formatoPesos(antes) + '</strong></li>' +
            '<li><span>Diferencia</span><strong>' + (dif === 0 ? 'Lo mismo' : (dif > 0 ? '+' : '−') + formatoPesos(Math.abs(dif)) + ' al mes') + '</strong></li>' +
          '</ul>' : '') +
        '</div>' +
        (tiene ? '' : campoDinero('arriendo-antes', 'Lo que pagabas de arriendo', antes));
    }

    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pagas al mes', m.e.totalMes) + listaPasos(4) +
      (recienFirmado || Date.now() < puertaHasta ? puertaEquipo() : '') +
      '<h2 class="h3 bloque" id="titulo-departamento">' + (recienFirmado ? '<span class="llave-firma" aria-hidden="true">' + icono('i-llave', 'icono-grande') + '</span>' : '') + 'Mi departamento</h2><p class="texto-apoyo">Mes ' + m.mes + '</p>' +
      // Fotos: tu departamento, con la misma galería del detalle (referencial).
      galeria(fotosDe(p, departamentoDeMiCompra(p))) +
      cuerpo +
      loTuyo(m) +
      '<section class="tarjeta bloque" aria-labelledby="titulo-deudas">' +
        '<h2 class="h4" id="titulo-deudas">Tu avance</h2>' +
        (m.conInversionistas ? barraParticipacion(m) : '') +
        barraDeuda('Crédito Bci (30 años)', m.mes, SUPUESTOS.mesesBci, m.saldoBci, m.avanceBci) +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      seccionArrepiento(m) +
      '<div class="acciones">' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-otro-mes">Simular otro mes</button>' +
      '</div>';
    var patrimonio = ufAPesos(m.patrimonioUF);
    contarHasta($('lo-tuyo'), loTuyoMostrado, patrimonio, formatoPesos);
    loTuyoMostrado = patrimonio;
    $('btn-arrepiento').addEventListener('click', function () {
      var b = $('btn-arrepiento');
      var abierto = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!abierto));
      $('arrepiento').hidden = abierto;
    });
    iniciarGalerias($('panel-compra'));

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
    } else if ($('arriendo-antes')) {
      $('arriendo-antes').addEventListener('change', function () {
        estado.arriendoActual = formatearCampo($('arriendo-antes'));
        guardarEstado();
        renderMiCompra();
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
  // S19-B2: antes de la preaprobación, la cifra va redondeada (formato = formatoRedondeado).
  function tarjetaCompacta(p, etiqueta, pesos, formato) {
    return '<div class="tarjeta compacta">' +
      '<a class="enlace" href="#camino/proyecto/' + esc(p.id) + '">' + esc(p.nombre) + '</a>' +
      '<p class="compacta-cifra"><span>' + etiqueta + '</span><strong>' + (formato || formatoPesos)(pesos) + '</strong></p>' +
    '</div>';
  }

  // Salir de la compra es destructivo: primero se confirma.
  function prepararSalir() {
    var boton = $('btn-salir');
    if (!boton) return;
    var caja = document.createElement('div');
    caja.id = 'confirmar-salir';
    caja.className = 'confirmar';
    caja.hidden = true;
    caja.innerHTML = '<p><strong>¿Salir de esta compra?</strong></p>' +
      '<button type="button" class="btn btn-peligro btn-bloque" id="btn-salir-si">Sí, salir</button>' +
      '<button type="button" class="enlace" id="btn-salir-no">Cancelar</button>';
    boton.insertAdjacentElement('afterend', caja);
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', 'confirmar-salir');
    boton.addEventListener('click', function () {
      caja.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      $('btn-salir-si').focus();
    });
    $('btn-salir-no').addEventListener('click', function () {
      caja.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
      boton.focus();
    });
    $('btn-salir-si').addEventListener('click', salirDeCompra);
  }

  function salirDeCompra() {
    guardarCompra(null);
    location.hash = '#camino';
    toast('Saliste de la compra. Tu ahorro sigue en tu cuenta.');
  }

  // En qué paso está la compra, sin guardar nada (lo usan Mi compra e Inicio).
  // Sin postulación guardada se vuelve a Postula; con la meta ya juntada se pasa a la firma.
  function pasoEfectivo() {
    var c = estado.compra;
    var paso = c.paso || 1;
    if (paso >= 2 && paso < 4 && !c.carga) return 1;
    var pc = buscarProyecto(c.proyectoId);
    if (paso === 2 && estado.ahorroIniciado && estado.ahorrado >= metaCompra(pc) && !entregaPendiente(pc)) return 3;
    return paso;
  }

  // Después de postular: va a Tu pie, o directo a la firma si el ahorro ya alcanza la meta.
  function pasoTrasPostular(meta, p) {
    return estado.ahorroIniciado && estado.ahorrado >= meta && !(p && entregaPendiente(p)) ? 3 : 2;
  }

  // S15-F1: cada paso tiene su dirección. Ir al paso actual cambia la dirección (así Atrás vuelve al anterior);
  // si ya se está en ella, solo se vuelve a dibujar.
  var NOMBRES_PASO = { postular: 1, pie: 2, firmar: 3, 'mi-departamento': 4 };
  function rutaPasoActual() {
    if (!estado.compra) return '';
    var paso = pasoEfectivo();
    if (paso === 4) return 'mi-departamento';
    if (paso === 3) return 'firmar';
    if (paso === 2) return 'pie';
    return 'postular/' + subpasoPostula();
  }
  var llegoAFirma = false;
  function renderMiCompra() {
    var destino = '#camino/' + rutaPasoActual();
    if (location.hash !== destino) { location.hash = destino; return; }
    renderPasoActual();
  }
  function renderPasoActual() {
    var p = buscarProyecto(estado.compra.proyectoId);
    var d = departamentoDeMiCompra(p);
    var paso = pasoEfectivo();
    $('titulo-paso').textContent = 'Paso ' + (paso + 1) + ' de 5: ' + CAMINO[paso];
    if (paso === 4) renderMiDepartamento(p, d);
    else if (paso === 3) { renderFirma(p, d, llegoAFirma || estado.compra.paso === 2); llegoAFirma = false; }
    else if (paso === 2) renderTu5(p, d);
    else renderPostula(p, d);
  }

  // Un paso pedido por su dirección: si es el actual, se muestra; si ya pasó, su resumen; si aún no llega, el actual.
  var SUBPASOS = ['datos', 'documentos', 'resultado'];
  function renderPaso(nombre, sub) {
    if (!estado.compra) { location.replace('#camino'); return; }
    var pedido = NOMBRES_PASO[nombre];
    var actual = pasoEfectivo();
    if (pedido > actual) { location.replace('#camino/' + rutaPasoActual()); return; }
    if (pedido < actual) return renderResumenPaso(pedido);
    if (pedido === 1) {
      var spPedido = SUBPASOS.indexOf(sub);
      var spActual = SUBPASOS.indexOf(subpasoPostula());
      if (spPedido === -1 || spPedido > spActual) { location.replace('#camino/' + rutaPasoActual()); return; }
      if (spPedido < spActual) guardarSubpaso(sub);
    }
    renderPasoActual();
  }

  // Resumen de un paso que ya se hizo (se llega desde la escalera o con Atrás). Solo para leer.
  function renderResumenPaso(paso) {
    var p = buscarProyecto(estado.compra.proyectoId);
    var e = resumen(p).escenario;
    var filas = '';
    if (paso === 1) {
      var pre = preaprobacion(estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);
      filas = '<li><span>Parte de tu sueldo</span><strong>' + formatoPorcentaje(estado.compra.carga || 0, 1) + '</strong></li>' +
        (pre && pre.cumple ? '<li><span>Bci te preaprobó hasta</span><strong>' + formatoPesos(ufAPesos(pre.creditoUF)) + '</strong></li>' : '');
    } else if (paso === 2) {
      filas = '<li><span>Juntaste</span><strong>' + formatoPesos(e.alEscriturar) + '</strong></li>';
    } else if (paso === 3) {
      filas = '<li><span>Firmaste</span><strong>' + esc(p.nombre) + '</strong></li>';
    }
    $('titulo-paso').textContent = CAMINO[paso] + ': listo';
    $('panel-compra').innerHTML =
      tarjetaCompacta(p, 'Pagas al mes', e.totalMes) +
      '<section class="tarjeta bloque" aria-labelledby="titulo-resumen-paso">' +
        '<p class="estado-semaforo">' + icono('i-ok') + 'Listo</p>' +
        '<h2 class="h3" id="titulo-resumen-paso">' + CAMINO[paso] + '</h2>' +
        '<ul class="datos-inversion">' + filas + '</ul>' +
      '</section>' +
      '<div class="acciones"><a class="btn btn-primario btn-bloque" href="#camino/' + rutaPasoActual() + '">Ir a tu paso de hoy</a></div>';
  }

  // "Mi plan" ya no existe: la compra vive en Mi camino y las inversiones en su pestaña.
  function renderMisProyectos() {
    if (estado.compra) renderMiCompra();
    else location.hash = '#camino';
  }
  // ---------- Sprint 9: Tu mes real, Tus caminos, Todavía no y fichas ----------

  // Registro de la sesión de prueba (S9-F6): lo llena la facilitadora; "Me interesa" y el camino
  // elegido se anotan solos. Se guarda aparte de los datos del usuario.
  var CLAVE_REGISTRO = 'primer-peldano-registro';
  var REGISTRO_VACIO = { plazoAntes: null, plazoDespues: null, camino: null, explicacion: null, confianza: null,
    meInteresa: [], recordarme: null, volveria: null, avisoVolver: null };
  var VOLVERIA = ['Sí', 'Tal vez', 'No'];
  function leerRegistro() {
    var r = Object.assign({}, REGISTRO_VACIO, { meInteresa: [] });
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE_REGISTRO));
      if (!g || typeof g !== 'object') return r;
      var entero = function (v, min, max) { return typeof v === 'number' && v >= min && v <= max && Math.floor(v) === v ? v : null; };
      r.plazoAntes = entero(g.plazoAntes, 0, 60);
      r.plazoDespues = entero(g.plazoDespues, 0, 60);
      r.camino = CAMINOS[g.camino] ? g.camino : null;
      r.explicacion = entero(g.explicacion, 0, 3);
      r.confianza = entero(g.confianza, 1, 5);
      r.meInteresa = Array.isArray(g.meInteresa) ? g.meInteresa.filter(function (id) { return CAMINOS[id]; }) : [];
      r.recordarme = entero(g.recordarme, 1, 24);
      r.volveria = VOLVERIA.indexOf(g.volveria) !== -1 ? g.volveria : null;
      r.avisoVolver = typeof g.avisoVolver === 'string' && g.avisoVolver.length < 60 ? g.avisoVolver : null;
    } catch (e) { /* sin localStorage: registro vacío */ }
    return r;
  }
  var registro = leerRegistro();
  function guardarRegistro() {
    try { localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(registro)); } catch (e) { /* queda en memoria */ }
  }

  // ¿Hay una compra en grupo que le alcance? (en modo arrendar, solo las que pasan el filtro de 3,9 %)
  function hayGrupoQueAlcanza() {
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo);
    if (cap === null) return false;
    return PROYECTOS.some(function (p) {
      if (p.tipo !== 'conjunto') return false;
      var r = resumen(p);
      return (estado.modo !== 'arrendar' || r.pasaFiltro) && r.escenario.precioUF <= cap;
    });
  }

  // El rango de precio que eligió la usuaria. Los cálculos usan su techo (el caso conservador).
  function rangoActual() { return buscarRango(estado.rangoPrecio); }
  function listaMeta() { var r = rangoActual(); return r ? r.hasta : LISTA_REFERENCIA_UF; }
  function hayGrupoEnRango(rango) {
    return departamentosEnRango(rango).some(function (p) { return p.tipo === 'conjunto'; });
  }

  // Con un rango elegido, el camino se calcula con su techo; hay grupo si hay una compra en grupo en el rango.
  function perfilActual() {
    var r = rangoActual();
    return {
      modo: estado.modo, sueldoPropio: estado.sueldoPropio, sueldoPareja: estado.sueldoPareja,
      arriendoActual: estado.arriendoActual, otrasCuotas: estado.otrasCuotas,
      ahorroActual: estado.ahorroActual, ahorroMensual: estado.ahorroMensual,
      hayGrupo: r ? hayGrupoEnRango(r) : hayGrupoQueAlcanza(),
      listaUF: r ? r.hasta : undefined
    };
  }

  // Sin sueldos no hay nada que calcular: se vuelve a Inicio.
  function sinSueldos(contenedor, titulo, idTitulo) {
    contenedor.innerHTML =
      '<header class="encabezado"><h1 id="' + idTitulo + '" class="h2">' + titulo + '</h1></header>' +
      '<div class="vacio">' +
        '<svg aria-hidden="true"><use href="#i-inicio"/></svg>' +
        '<h2 class="h3">Primero, sus sueldos</h2>' +
        '<p class="texto-apoyo">Con sus sueldos calculamos cuánto les queda al mes y qué camino les conviene.</p>' +
        '<div class="acciones"><a href="#inicio" class="btn btn-primario btn-bloque">Escribir los sueldos</a></div>' +
      '</div>';
  }

  // ----- Tus caminos (S11-F3): tarjetas que se deslizan, Todavía no con interruptores y Tu mes -----
  var RAZONES = {
    'vivir-grupo': 'es para vivir y hay un grupo a tu alcance.',
    'vivir-sin-grupo': 'es para vivir y hoy no hay un grupo a tu alcance.',
    'invertir-poco-ahorro': 'inviertes y tienes menos del 20 % del precio.',
    'invertir-poco-ahorro-sin-grupo': 'inviertes, tienes menos del 20 % y no hay un grupo a tu alcance.',
    'invertir-ahorro': 'inviertes y ya tienes el 20 % del precio.',
    'invertir-ahorro-sin-grupo': 'inviertes, ya tienes el 20 % y no hay un grupo a tu alcance.'
  };

  // Por qué un camino todavía no conviene, en una frase corta.
  function motivoNoConviene(ev) {
    if (ev.cargaDividendo > LIMITE_HOLGADO + TOLERANCIA) return 'el dividendo es el ' + formatoPorcentaje(ev.cargaDividendo) + ' de su ingreso (máximo 25 %).';
    if (!ev.cumpleCarga) return 'con sus cuotas, la carga es ' + formatoPorcentaje(ev.cargaTotal) + ' (máximo 30 %).';
    return 'les quedaría menos del 40 % para vivir.';
  }

  function textoMesesCamino(n) {
    if (n.meses === 0) return 'Ya lo tienes';
    if (n.meses === null) return 'Falta tu ahorro';
    return textoMeses(n.meses);
  }

  function peorCaso(id, n) {
    var c = CAMINOS[id];
    var partes = [];
    if (c.grupo) partes.push('sin grupo, ' + formatoPesos(n.dividendoSinGrupo) + ' al mes');
    if (c.inversionistas > 0) partes.push('con 10 % menos de arriendo, ' + n.mesesRecompraPeor + ' meses de recompra');
    if (!c.grupo) partes.push('sin subsidio, ' + formatoPesos(n.dividendoSinSubsidio) + ' al mes');
    return partes.join('; ');
  }

  function chipExiste(id) {
    return CAMINOS[id].existeHoy
      ? '<span class="chip chip-existe">Existe hoy</span>'
      : '<span class="chip chip-propuesta">Propuesta</span>';
  }

  // S11-F2: reparto visual. Una casa en franjas (desde abajo: Bci, inversionistas, tú), con su leyenda.
  var FORMA_CASA = 'M50 4 L94 40 L86 40 L86 80 L14 80 L14 40 L6 40 Z';
  var idCasa = 0;
  function repartoCasa(partes, formato) {
    formato = formato || formatoPesos;
    var id = 'clip-reparto-' + (++idCasa);
    var y = 80;
    var franjas = partes.map(function (x, i) {
      var alto = 76 * x.pct;
      y -= alto;
      return '<rect class="franja franja-' + x.clave + '" style="animation-delay:' + (i * 60) + 'ms" x="0" y="' + y.toFixed(1) +
        '" width="100" height="' + alto.toFixed(1) + '" clip-path="url(#' + id + ')"/>';
    }).join('');
    return '<div class="reparto-casa">' +
      '<svg class="casa-reparto" viewBox="0 0 100 84" aria-hidden="true">' +
        '<defs><clipPath id="' + id + '"><path d="' + FORMA_CASA + '"/></clipPath></defs>' +
        franjas + '<path class="casa-borde" d="' + FORMA_CASA + '"/></svg>' +
      '<ul class="reparto-leyenda">' + partes.slice().reverse().map(function (x) {
        return '<li><span class="punto punto-' + x.clave + '" aria-hidden="true"></span>' +
          '<span>' + Math.round(x.pct * 100) + NBSP + '% ' + x.nombre + '</span><strong>' + formato(x.monto) + '</strong></li>';
      }).join('') + '</ul>' +
    '</div>';
  }

  function partesCamino(id, n) {
    var c = CAMINOS[id];
    var partes = [{ clave: 'bci', icono: 'i-banco', nombre: 'Bci', pct: c.credito, monto: Math.round(n.precio * c.credito) }];
    if (c.inversionistas > 0) partes.push({ clave: 'inversionistas', icono: 'i-inversionistas', nombre: 'inversionistas', pct: c.inversionistas, monto: n.inversionistas });
    partes.push({ clave: 'tu', icono: 'i-persona', nombre: 'tú', pct: c.usuario, monto: n.pie });
    return partes;
  }

  var ICONOS_FICHA = { 'arriendo-opcion': ['i-llave', 'i-casa'], 'respaldo-familiar': ['i-grupo', 'i-escudo'] };

  function resumenFicha(id) {
    if (id === 'arriendo-opcion') {
      var a = arriendoConOpcion(listaMeta());
      return '<ul class="datos-inversion"><li><span>Pagas al mes</span><strong>' + formatoPesos(a.mensualidad) + '</strong></li>' +
        '<li><span>Juntas el 10 % en</span><strong>' + textoMeses(a.meses) + '</strong></li></ul>';
    }
    var r = respaldoFamiliar(listaMeta());
    return '<ul class="datos-inversion"><li><span>Pones tú</span><strong>' + formatoPesos(r.pie) + '</strong></li>' +
      '<li><span>Deja tu familiar</span><strong>' + formatoPesos(r.deposito) + '</strong></li></ul>';
  }

  // S15-F3: frente al crédito de siempre, en una línea.
  function lineaContraBase(id, n, base, nBase) {
    if (id === base) return '<p class="contra-base es-base">' + icono('i-banco') + 'El crédito de siempre</p>';
    var d = diferenciaConBase(id, n, nBase);
    var partes = [];
    if (d.enCuotas) partes.push('Pie en cuotas');
    if (d.descuento > 0.001) partes.push(formatoPorcentaje(d.descuento, 0) + ' más barato');
    if (d.mesesAntes > 0) partes.push('llegas ' + plural(d.mesesAntes, 'mes', 'meses') + ' antes');
    if (d.pieMenos > 0 && d.descuento <= 0.001) partes.push('pones ' + formatoPesos(d.pieMenos) + ' menos');
    if (!partes.length) return '';
    return '<p class="contra-base">' + icono('i-sube') + '<span><small>Frente al crédito de siempre</small>' + partes.join(SEP) + '</span></p>';
  }

  // S15-F7: Hoja de Simulación (tasa, dividendo con y sin seguros, CAE y costo total).
  function abrirSimulacion(id, boton) {
    var n = numerosCamino(id, listaMeta(), perfilActual());
    var c = CAMINOS[id];
    var s = simulacionCredito(n.precioUF, c.credito);
    var sin = simulacionCredito(n.precioUF, c.credito, SUPUESTOS.tasaSinSubsidio);
    abrirHojaContenido('Simulación: ' + c.corto,
      '<p class="texto-apoyo">Departamento de ' + formatoUF(n.precioUF) + SEP + '30 años</p>' +
      '<ul class="datos-inversion">' +
        '<li><span>Crédito Bci</span><strong>' + formatoPesos(ufAPesos(s.creditoUF)) + '</strong></li>' +
        '<li><span>Tasa, con subsidio</span><strong>' + formatoPorcentaje(s.tasa, 1) + '</strong></li>' +
        '<li><span>Dividendo sin seguros</span><strong>' + formatoPesos(s.dividendoSinSeguros) + '</strong></li>' +
        '<li><span>Dividendo con seguros</span><strong>' + formatoPesos(s.dividendoConSeguros) + '</strong></li>' +
        '<li><span>CAE ' + ayuda('simulacion') + '</span><strong>' + formatoPorcentaje(s.cae, 2) + '</strong></li>' +
        '<li><span>Costo total del crédito</span><strong>' + formatoPesos(s.costoTotal) + '</strong></li>' +
        '<li><span>Sin subsidio a la tasa: CAE</span><strong>' + formatoPorcentaje(sin.cae, 2) + '</strong></li>' +
      '</ul>' +
      '<p class="sello">' + icono('i-documento') + 'Simulación referencial</p>', boton);
  }

  function tarjetaCamino(id, perfil, recomendado, razon, i, total, base, nBase) {
    var c = CAMINOS[id];
    var cabeza = '<div class="camino-cabeza"><h3 class="h4">' + c.nombre + '</h3>' + chipExiste(id) + '</div>';
    var atributos = ' class="tarjeta camino-slide' + (recomendado ? ' recomendado' : '') + '" aria-roledescription="diapositiva" aria-label="' +
      (i + 1) + ' de ' + total + ': ' + c.nombre + '"';
    if (c.ficha) {
      return '<li' + atributos + '>' +
        '<div class="ilustracion-ficha" aria-hidden="true">' + ICONOS_FICHA[id].map(function (x) { return icono(x, 'icono-grande'); }).join('') + '</div>' +
        cabeza + resumenFicha(id) +
        '<a class="btn btn-secundario-dark btn-bloque" href="#camino/ficha/' + id + '">Ver cómo funciona</a></li>';
    }
    var n = numerosCamino(id, listaMeta(), perfil);
    var noConviene = !n.evaluacion.cumple;
    return '<li' + atributos + '>' +
      (recomendado ? '<p class="chip chip-recomendado">' + icono('i-ok') + 'Te recomendamos</p>' : '') +
      repartoCasa(partesCamino(id, n)) +
      cabeza +
      (recomendado && razon ? '<p class="razon">Porque ' + RAZONES[razon] + '</p>' : '') +
      (noConviene ? '<p class="aviso aviso-alerta aviso-icono">' + icono('i-alerta') + 'Todavía no te conviene.</p>' : '') +
      (nBase ? lineaContraBase(id, n, base, nBase) : '') +
      '<ul class="datos-inversion">' +
        '<li><span>Al escriturar</span><strong>' + formatoPesos(n.alEscriturar) + '</strong></li>' +
        '<li><span>Dividendo al mes</span><strong>' + formatoPesos(n.dividendo) + '</strong></li>' +
        '<li><span>' + icono('i-calendario') + 'Llegas en</span><strong>' + textoMesesCamino(n) + '</strong></li>' +
        '<li><span>Carga</span><strong>' + formatoPorcentaje(n.evaluacion.cargaTotal, 0) + '</strong></li>' +
      '</ul>' +
      '<p class="peor-caso"><strong>Peor caso:</strong> ' + peorCaso(id, n) + '.</p>' +
      '<button type="button" class="btn btn-terciario btn-bloque" data-simular="' + id + '" aria-haspopup="dialog">Ver simulación</button>' +
      '<button type="button" class="btn ' + (recomendado ? 'btn-primario' : 'btn-secundario-dark') + ' btn-bloque" data-elegir="' + id + '">' +
        (estado.caminoElegido === id ? 'Tu camino ✓' : 'Elegir este camino') + '</button>' +
    '</li>';
  }

  function carruselCaminos(ids, perfil, r, base) {
    var total = ids.length;
    var nBase = numerosCamino(base, listaMeta(), perfil);
    return '<section class="carrusel" aria-roledescription="carrusel" aria-label="Caminos">' +
      '<ul class="carrusel-pista" id="carrusel-pista" tabindex="0">' +
        ids.map(function (id, i) { return tarjetaCamino(id, perfil, !r.todaviaNo && i === 0, r.razon, i, total, base, nBase); }).join('') +
      '</ul>' +
      '<div class="carrusel-control">' +
        '<button type="button" class="carrusel-boton" id="carrusel-anterior" aria-label="Camino anterior">' + icono('i-flecha', 'flecha-izquierda') + '</button>' +
        '<div class="carrusel-puntos" aria-hidden="true">' + ids.map(function (x, i) { return '<span class="' + (i === 0 ? 'activo' : '') + '"></span>'; }).join('') + '</div>' +
        '<button type="button" class="carrusel-boton" id="carrusel-siguiente" aria-label="Camino siguiente">' + icono('i-flecha', 'flecha-derecha') + '</button>' +
      '</div>' +
    '</section>';
  }

  function iniciarCarrusel() {
    var pista = $('carrusel-pista');
    if (!pista) return;
    var puntos = document.querySelectorAll('.carrusel-puntos span');
    var actual = function () { return Math.round(pista.scrollLeft / pista.clientWidth); };
    var marcar = function () {
      var i = actual();
      puntos.forEach(function (p, k) { p.classList.toggle('activo', k === i); });
      $('carrusel-anterior').disabled = i === 0;
      $('carrusel-siguiente').disabled = i === puntos.length - 1;
    };
    var ir = function (delta) {
      var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pista.scrollTo({ left: (actual() + delta) * pista.clientWidth, behavior: reducir ? 'auto' : 'smooth' });
    };
    $('carrusel-anterior').addEventListener('click', function () { ir(-1); });
    $('carrusel-siguiente').addEventListener('click', function () { ir(1); });
    pista.addEventListener('scroll', function () { window.requestAnimationFrame(marcar); });
    marcar();
  }

  // S11-F3: Todavía no con interruptores. Cada cambio recalcula en vivo (simularCambios).
  var cambiosActivos = {};
  function tituloCambio(x) {
    if (x.tipo === 'cuotas') return 'Terminar tus otras cuotas';
    if (x.tipo === 'estudio') return 'Un estudio de ' + formatoUF(x.listaUF);
    return 'Una renta de ' + formatoPesos(x.ingreso);
  }
  function bloqueTodaviaNo(r, perfil) {
    var cambios = cambiosTodaviaNo(perfil, r.id);
    var meses = mesesRecordar(perfil, r.id);
    var avisado = registro.recordarme;
    return '<section class="tarjeta todavia-no" aria-labelledby="titulo-todavia-no">' +
      '<p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
      '<h2 class="h3" id="titulo-todavia-no">Hoy te dejaría muy justo</h2>' +
      '<p class="etiqueta">Prueba qué lo cambia</p>' +
      '<ul class="interruptores">' + cambios.map(function (x) {
        return '<li><button type="button" class="interruptor" role="switch" aria-checked="' + !!cambiosActivos[x.tipo] + '" data-cambio="' + x.tipo + '">' +
          '<span>' + tituloCambio(x) + '</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button></li>';
      }).join('') + '</ul>' +
      '<div id="simulacion" aria-live="polite"></div>' +
      '<div class="acciones">' +
        (avisado ? ''
          : '<button type="button" class="btn btn-primario btn-bloque" id="btn-recordarme" data-meses="' + meses + '">Recordarme en ' + meses + ' meses</button>') +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-ver-estudios">Ver estudios</button>' +
      '</div>' +
    '</section>';
  }
  function dibujarSimulacion(r, perfil) {
    var s = simularCambios(perfil, r.id, cambiosActivos);
    var ev = s.numeros.evaluacion;
    $('simulacion').innerHTML =
      '<div class="simulacion ' + (s.cumple ? 'simulacion-ok' : '') + '">' +
        '<p class="estado-semaforo">' + icono(s.cumple ? 'i-ok' : 'i-pronto') + (s.cumple ? 'Ya te conviene' : 'Todavía no') + '</p>' +
        '<ul class="datos-inversion">' +
          '<li><span>Carga</span><strong>' + formatoPorcentaje(ev.cargaTotal) + '</strong></li>' +
          '<li><span>Te queda al mes</span><strong>' + formatoPesos(ev.mes.queda) + '</strong></li>' +
          '<li><span>Llegas en</span><strong>' + textoMesesCamino(s.numeros) + '</strong></li>' +
        '</ul>' +
      '</div>';
  }

  // S11-F2: Tu mes, como una barra del ingreso partida en tramos, con la marca del 40 % para vivir.
  function barraMes(n) {
    var m = n.evaluacion.mes;
    var total = m.ingreso;
    var tramos = [
      { clave: 'dividendo', icono: 'i-banco', nombre: 'Dividendo', monto: m.dividendo },
      { clave: 'cuotas', icono: 'i-documento', nombre: 'Otras cuotas', monto: m.otras },
      { clave: 'arriendo', icono: 'i-llave', nombre: 'Arriendo', monto: m.arriendo },
      { clave: 'queda', icono: 'i-persona', nombre: 'Te queda', monto: Math.max(0, m.queda) }
    ].filter(function (t) { return t.monto > 0; });
    var alerta = !m.alcanzaParaVivir;
    var etiqueta = tramos.map(function (t) { return t.nombre + ' ' + Math.round(100 * t.monto / total) + ' %'; }).join(', ');
    return '<section class="tarjeta bloque tu-mes" id="tu-mes" aria-labelledby="titulo-tu-mes">' +
      '<h2 class="h4" id="titulo-tu-mes">Tu mes</h2>' +
      '<p class="etiqueta">Te quedan para vivir</p>' +
      '<strong class="numero display-3' + (alerta ? ' numero-alerta' : '') + '">' + formatoPesos(m.queda) + '</strong>' +
      '<div class="barra-mes" role="img" aria-label="De su ingreso: ' + etiqueta + '. Mínimo para vivir: 40 %.">' +
        tramos.map(function (t) {
          return '<span class="tramo tramo-' + t.clave + (alerta && t.clave === 'queda' ? ' tramo-alerta' : '') + '" style="flex-basis:' + (100 * t.monto / total).toFixed(2) + '%"></span>';
        }).join('') +
        '<span class="marca-40" aria-hidden="true"><span>40 % para vivir</span></span>' +
      '</div>' +
      (alerta ? '<p class="aviso aviso-alerta aviso-icono">' + icono('i-alerta') + '<span><strong>Ojo:</strong> ' + motivoNoConviene(n.evaluacion) + '</span></p>' : '') +
      '<ul class="leyenda-mes">' + tramos.map(function (t) {
        return '<li><span class="punto tramo-' + t.clave + '" aria-hidden="true"></span>' + icono(t.icono) + '<span>' + t.nombre + '</span><strong>' + formatoPesos(t.monto) + '</strong></li>';
      }).join('') + '</ul>' +
      '<ul class="datos-inversion"><li><span>Te prestan hasta</span><strong>' +
        formatoUF(capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo) || 0) + '</strong></li></ul>' +
    '</section>';
  }

  // S16-F5: la carrera a la puerta. Un carril por camino; el avatar avanza según cuántos meses le faltan.
  var LETRA_CARRERA = {
    'grupo-vivir': 'el pie va en cuotas a una cuenta Bci bloqueada', 'grupo-invertir': 'el pie va en cuotas a una cuenta Bci bloqueada',
    'pie-compartido': 'los inversionistas tienen el 15\u00a0% hasta que lo recompres', 'grupo-pie-compartido': 'los inversionistas tienen el 15\u00a0% hasta que lo recompres',
    'individual-vivir': 'el departamento es 100\u00a0% tuyo al firmar', 'individual-invertir': 'el departamento es 100\u00a0% tuyo al firmar'
  };
  var MIN_CARRERA = 100000, PASO_CARRERA = 50000;
  function mesesCarrera(ids, perfil, mensual) {
    var pf = Object.assign({}, perfil, { ahorroMensual: mensual });
    var rango = rangoActual();
    return ids.map(function (id) {
      var techo = numerosCamino(id, listaMeta(), pf).meses;
      var desde = rango ? numerosCamino(id, rango.desde, pf).meses : techo;
      return { id: id, desde: desde, techo: techo };
    });
  }
  function letraCarrera(filas) {
    var con = filas.filter(function (x) { return x.techo !== null; });
    if (con.length < 2) return '';
    var rapido = con.reduce(function (a, x) { return x.techo < a.techo ? x : a; });
    var lento = con.reduce(function (a, x) { return x.techo > a.techo ? x : a; });
    var dif = lento.techo - rapido.techo;
    if (dif <= 0) return 'Todos llegan en ' + textoMeses(rapido.techo) + '.';
    return CAMINOS[rapido.id].corto + ' llega ' + plural(dif, 'mes', 'meses') + ' antes: ' + LETRA_CARRERA[rapido.id] + '.';
  }
  function carrera(ids, perfil, todos) {
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var maximo = Math.max(1000000, Math.ceil(ingreso * 0.4 / PASO_CARRERA) * PASO_CARRERA);
    var mensual = Math.min(maximo, Math.max(MIN_CARRERA, estado.ahorroMensual || 300000));
    var escala = Math.max.apply(null, mesesCarrera(ids, perfil, MIN_CARRERA).map(function (x) { return x.techo || 0; }).concat([1]));
    var filas = mesesCarrera(ids, perfil, mensual);
    return '<section class="tarjeta bloque carrera" aria-labelledby="titulo-carrera" data-escala="' + escala + '" data-max="' + maximo + '">' +
      '<h2 class="h4" id="titulo-carrera">¿Por cuál llegas antes?</h2>' +
      '<ul class="carriles">' + filas.map(function (x, i) {
        var grupo = CAMINOS[x.id].grupo;
        return '<li><button type="button" class="carril" data-ir="' + todos.indexOf(x.id) + '">' +
          '<span class="carril-fila"><strong>' + CAMINOS[x.id].corto + '</strong><span class="numero" data-meses="' + x.id + '">' + textoPlazos(x) + '</span></span>' +
          '<span class="pista" aria-hidden="true"><span class="recorrido" data-pos="' + x.id + '" style="--pos:' + posicionCarrera(x.techo, escala).toFixed(3) + '">' +
            '<span class="carril-avs">' + avatarSVG(estado.avatar, 34, 'carril-av') +
              (grupo ? avatarSVG({ piel: (i + 2) % 5, pelo: 'rizado', colorPelo: 0, ropa: 2 }, 26, 'carril-av otro') +
                avatarSVG({ piel: (i + 4) % 5, pelo: 'corto', colorPelo: 2, ropa: 1 }, 26, 'carril-av otro') : '') +
            '</span></span><span class="carril-puerta"></span></span>' +
        '</button></li>';
      }).join('') + '</ul>' +
      '<p class="carrera-letra" id="carrera-letra">' + letraCarrera(filas) + '</p>' +
      '<p class="si-juntas-fila"><label for="carrera-mensual">Si juntas al mes</label><strong class="numero" id="carrera-valor">' + formatoPesos(mensual) + '</strong></p>' +
      '<input type="range" id="carrera-mensual" min="' + MIN_CARRERA + '" max="' + maximo + '" step="' + PASO_CARRERA + '" value="' + mensual + '" aria-valuetext="' + formatoPesos(mensual) + ' al mes">' +
    '</section>';
  }
  function iniciarCarrera(ids, perfil) {
    var sec = document.querySelector('.carrera');
    if (!sec) return;
    var escala = Number(sec.dataset.escala), maximo = Number(sec.dataset.max);
    var rango = $('carrera-mensual');
    var pintar = function () {
      var v = Number(rango.value);
      rango.style.setProperty('--lleno', ((v - MIN_CARRERA) / (maximo - MIN_CARRERA) * 100).toFixed(1) + '%');
      return v;
    };
    pintar();
    rango.addEventListener('input', function () {
      var v = pintar();
      var filas = mesesCarrera(ids, perfil, v);
      filas.forEach(function (x) {
        sec.querySelector('[data-meses="' + x.id + '"]').textContent = textoPlazos(x);
        sec.querySelector('[data-pos="' + x.id + '"]').style.setProperty('--pos', posicionCarrera(x.techo, escala).toFixed(3));
      });
      $('carrera-valor').textContent = formatoPesos(v);
      $('carrera-letra').textContent = letraCarrera(filas);
      rango.setAttribute('aria-valuetext', formatoPesos(v) + ' al mes');
    });
    // Al soltar se guarda y las tarjetas se recalculan con ese monto.
    rango.addEventListener('change', function () {
      estado.ahorroMensual = Number(rango.value);
      guardarEstado();
      var y = window.scrollY;
      renderCaminos();
      window.scrollTo(0, y);
      $('carrera-mensual').focus();
    });
    sec.querySelectorAll('[data-ir]').forEach(function (b) {
      b.addEventListener('click', function () {
        var pista = $('carrusel-pista');
        var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        pista.scrollTo({ left: Number(b.dataset.ir) * pista.clientWidth, behavior: reducir ? 'auto' : 'smooth' });
        pista.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  function renderCaminos() {
    var cont = $('caminos-contenido');
    if (!ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return sinSueldos(cont, 'Tus caminos', 'titulo-caminos');
    var perfil = perfilActual();
    var r = recomendarCamino(perfil);
    // S17-F9: para vivir, Llega antes reemplaza el carrusel y la carrera.
    // S18-F5: también para "Todavía no": las piezas dicen si lo cambian.
    if (estado.modo === 'vivir') return renderLlegaAntes();
    // S15-F3: no todas las opciones: las que sirven, comparadas con el crédito de siempre.
    var sel = caminosParaMostrar(perfil, r);
    var ids = sel.mostrados;
    var idsCarrera = ids.filter(function (id) { return !CAMINOS[id].ficha; });
    var rango = rangoActual();

    cont.innerHTML =
      '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Mi camino</a>' +
      '<header class="encabezado">' +
        '<h1 id="titulo-caminos" class="h2">Tus caminos</h1>' +
      '</header>' +
      '<div class="tarjeta compacta con-numeros"><p class="meta-departamento">' + icono('i-persona') +
        '<span><strong>Con tus números</strong><small>' + (rango ? textoRango(rango) + SEP : '') +
          formatoPesos(ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) + ' al mes' + SEP + (perfil.modo === 'vivir' ? 'para vivir' : 'para arrendar') + '</small></span>' +
        '<button type="button" class="enlace" id="btn-caminos-datos" aria-haspopup="dialog">Cambiar</button></p></div>' +
      (r.todaviaNo ? bloqueTodaviaNo(r, perfil) +
        (perfil.modo === 'vivir' ? '<p class="texto-centro"><a class="enlace" href="#camino/ficha/arriendo-opcion">Mientras tanto: arriendo con opción de compra</a></p>' : '') : '') +
      (r.todaviaNo ? '' : carrera(idsCarrera, perfil, ids)) +
      carruselCaminos(ids, perfil, r, sel.base) +
      plegable('no-mostrados', 'Por qué no te mostramos otros', plural(sel.noMostrados.length, 'camino', 'caminos'),
        '<ul class="lista-razones">' + sel.noMostrados.map(function (x) {
          return '<li><strong>' + CAMINOS[x.id].corto + ':</strong> ' + RAZON_NO_MOSTRADO[x.razon] + '</li>';
        }).join('') + '</ul>') +
      '<section class="tarjeta bloque" aria-labelledby="titulo-llega-antes">' +
        '<h2 class="h4" id="titulo-llega-antes">Llega antes</h2>' +
        '<ul class="filas">' +
          '<li><a class="fila" href="#camino/ficha/respaldo-familiar">' + icono('i-grupo', 'icono-grande') +
            '<span><strong>Respaldo familiar</strong><small>Un familiar deja el 10' + NBSP + '% en Bci y lo recupera</small></span>' +
            '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>' +
          '<li><div class="fila">' + icono('i-regalo', 'icono-grande') +
            '<span><strong>Lista de regalos</strong><small>Tu familia aporta a tu pie en una ocasión especial</small></span></div></li>' +
          '<li><div class="fila">' + icono('i-casa', 'icono-grande') +
            '<span><strong>Comprar más barato</strong><small>Estudio, 1 dormitorio, usado o IVA cero, en "Filtrar"</small></span></div></li>' +
        '</ul>' +
      '</section>' +
      barraMes(r.numeros) +
      '<p class="sello">' + icono('i-escudo') + 'Calculado sin plusvalía</p>';

    iniciarCarrusel();
    iniciarCarrera(idsCarrera, perfil);
    iniciarPlegables();
    $('btn-caminos-datos').addEventListener('click', function () { abrirMisDatos($('btn-caminos-datos')); });
    cont.querySelectorAll('[data-simular]').forEach(function (b) {
      b.addEventListener('click', function () { abrirSimulacion(b.dataset.simular, b); });
    });
    cont.querySelectorAll('[data-elegir]').forEach(function (b) {
      b.addEventListener('click', function () { elegirCamino(b.dataset.elegir); });
    });
    if (r.todaviaNo) {
      dibujarSimulacion(r, perfil);
      cont.querySelectorAll('.interruptor').forEach(function (b) {
        b.addEventListener('click', function () {
          var tipo = b.dataset.cambio;
          cambiosActivos[tipo] = !cambiosActivos[tipo];
          b.setAttribute('aria-checked', String(!!cambiosActivos[tipo]));
          dibujarSimulacion(r, perfil);
        });
      });
    }
    if ($('btn-recordarme')) $('btn-recordarme').addEventListener('click', function () {
      registro.recordarme = Number($('btn-recordarme').dataset.meses);
      guardarRegistro();
      $('btn-recordarme').remove();
      toast('Listo: te avisamos en ' + registro.recordarme + ' meses (simulado).');
    });
    if ($('btn-ver-estudios')) $('btn-ver-estudios').addEventListener('click', function () {
      estado.masBaratoTipo = 'estudio';
      estado.meAlcanza = false;
      location.hash = estado.caminoElegido ? '#camino/elegir' : '#departamentos';
    });
  }

  // Proyectos se abre con los filtros del camino.
  function prepararProyectos(id) {
    estado.filtroRango = !!rangoActual();
    estado.meAlcanza = !estado.filtroRango;
    estado.pestana = id === 'pie-compartido' ? 'financiamiento' : 'conjunto';
  }

  // Elegir un camino: se anota en el registro y lleva a los proyectos de ese camino.
  function elegirCamino(id) {
    estado.caminoElegido = id;
    guardarEstado();
    registro.camino = id;
    guardarRegistro();
    prepararProyectos(id);
    toast('Tu camino: ' + primeraMinuscula(CAMINOS[id].corto) + '.');
    location.hash = '#camino/elegir';
  }

  // ----- Fichas de caminos informativos (S9-F4) -----
  function renderFicha(id) {
    var cont = $('ficha-contenido');
    if (id !== 'arriendo-opcion' && id !== 'respaldo-familiar') { location.replace('#caminos'); return; }
    var c = CAMINOS[id];
    var pasos, numeros, peor, referente;
    if (id === 'arriendo-opcion') {
      var a = arriendoConOpcion(listaMeta());
      pasos = ['Una empresa compra el departamento y te lo arrienda.',
        'Cada mes, parte de lo que pagas va a tu pie.',
        'Con el 10\u00a0%, pides el crédito y lo compras.'];
      numeros = '<li><span>Arriendo</span><strong>' + formatoPesos(a.arriendo) + '</strong></li>' +
        '<li><span>Va a tu pie</span><strong>' + formatoPesos(a.alPie) + '</strong></li>' +
        '<li><span>Pagas al mes</span><strong>' + formatoPesos(a.mensualidad) + '</strong></li>' +
        '<li><span>Juntas el 10 % en</span><strong>' + a.meses + ' meses</strong></li>' +
        '<li><span>Después, dividendo</span><strong>' + formatoPesos(a.dividendoDespues) + '</strong></li>';
      var carga = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja);
      if (carga) numeros += '<li><span>Es de su ingreso</span><strong>' + formatoPorcentaje(a.mensualidad / carga, 0) + '</strong></li>';
      peor = 'mensualidad alta y multa si no compras.';
      referente = 'Hogarízate (Chile).';
    } else {
      var f = respaldoFamiliar(listaMeta());
      pasos = ['Un familiar deja el 10\u00a0% en una cuenta Bci con intereses.',
        'Bci te presta el 95\u00a0% y tú pones el 5\u00a0%.',
        'Cuando la deuda baja al 80\u00a0%, el dinero vuelve a tu familiar.'];
      numeros = '<li><span>Pones tú</span><strong>' + formatoPesos(f.pie) + '</strong></li>' +
        '<li><span>Deja tu familiar</span><strong>' + formatoPesos(f.deposito) + '</strong></li>' +
        '<li><span>Dividendo al mes</span><strong>' + formatoPesos(f.dividendo) + '</strong></li>' +
        '<li><span>Tu familiar lo recupera en</span><strong>' + (f.mesesLibera / 12).toFixed(1).replace('.', ',') + ' años</strong></li>';
      peor = 'si hay remate, tu familiar puede perder su depósito.';
      referente = 'Barclays Family Springboard (Reino Unido). En Chile no existe hoy.';
    }
    var interesa = registro.meInteresa.indexOf(id) !== -1;
    cont.innerHTML =
      '<a href="#caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Tus caminos</a>' +
      '<header class="encabezado">' +
        '<div class="camino-cabeza">' + chipExiste(id) + '</div>' +
        '<h1 id="titulo-ficha" class="h2">' + c.nombre + '</h1>' +
      '</header>' +
      '<section class="tarjeta" aria-labelledby="titulo-como">' +
        '<h2 class="h5" id="titulo-como">Cómo funciona</h2>' +
        '<ol class="lista-numerada">' + pasos.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol>' +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-numeros">' +
        '<h2 class="h5" id="titulo-numeros">Con un departamento de ' + formatoUF(listaMeta()) + '</h2>' +
        '<ul class="datos-inversion">' + numeros + '</ul>' +
        '<p class="peor-caso"><strong>Peor caso:</strong> ' + peor + '</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-referente">' +
        '<h2 class="h5" id="titulo-referente">Dónde existe</h2>' +
        '<p class="texto-apoyo">' + referente + '</p>' +
      '</section>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-me-interesa" aria-pressed="' + interesa + '">' +
        (interesa ? 'Te interesa ✓' : 'Me interesa') + '</button></div>' +
      '';

    $('btn-me-interesa').addEventListener('click', function () {
      var i = registro.meInteresa.indexOf(id);
      if (i === -1) registro.meInteresa.push(id); else registro.meInteresa.splice(i, 1);
      guardarRegistro();
      var ahora = i === -1;
      $('btn-me-interesa').setAttribute('aria-pressed', String(ahora));
      $('btn-me-interesa').textContent = ahora ? 'Te interesa ✓' : 'Me interesa';
      toast(ahora ? 'Anotado: te interesa.' : 'Quitado de lo que te interesa.');
    });
  }

  // ----- Registro de la sesión de prueba (S9-F6) -----
  function renderRegistro() {
    var cont = $('registro-contenido');
    var escala = function (nombre, desde, hasta, valor, legend, extremos) {
      var html = '<fieldset class="escala"><legend>' + legend + '</legend><div class="escala-opciones">';
      for (var v = desde; v <= hasta; v++) {
        html += '<input type="radio" name="' + nombre + '" id="' + nombre + '-' + v + '" value="' + v + '"' + (valor === v ? ' checked' : '') + '>' +
          '<label for="' + nombre + '-' + v + '">' + v + '</label>';
      }
      return html + '</div><p class="texto-apoyo escala-extremos"><span>' + extremos[0] + '</span><span>' + extremos[1] + '</span></p></fieldset>';
    };
    var campoAnios = function (id, etiqueta, valor) {
      return '<div class="campo"><label for="' + id + '">' + etiqueta + '</label>' +
        '<div class="campo-caja campo-anios"><input id="' + id + '" type="text" inputmode="numeric" autocomplete="off" maxlength="2" value="' +
        (valor === null ? '' : valor) + '"><span class="sufijo" aria-hidden="true">años</span></div></div>';
    };
    var opcionesCamino = Object.keys(CAMINOS).map(function (id) {
      return '<option value="' + id + '"' + (registro.camino === id ? ' selected' : '') + '>' + CAMINOS[id].nombre + '</option>';
    }).join('');
    cont.innerHTML =
      '<a href="#perfil" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Perfil</a>' +
      '<header class="encabezado">' +
        '<h1 id="titulo-registro" class="h2">Sesión de prueba</h1>' +
        '<p class="texto-apoyo">Para la facilitadora. Se guarda solo en este teléfono.</p>' +
      '</header>' +
      '<form id="form-registro" class="tarjeta" novalidate>' +
        '<div class="campos-dos">' +
          campoAnios('reg-antes', 'Plazo que cree necesitar, antes', registro.plazoAntes) +
          campoAnios('reg-despues', 'Plazo que cree necesitar, después', registro.plazoDespues) +
        '</div>' +
        '<div class="campo"><label for="reg-camino">Camino elegido</label>' +
          '<select id="reg-camino" class="campo-select"><option value="">Sin elegir</option>' + opcionesCamino + '</select></div>' +
        escala('reg-explicacion', 0, 3, registro.explicacion, '¿Explica el camino con sus palabras? (0 a 3)', ['0: no lo explica', '3: lo explica completo']) +
        escala('reg-confianza', 1, 5, registro.confianza, 'Confianza en el camino (1 a 5)', ['1: nada', '5: mucha']) +
        '<fieldset class="escala"><legend>¿Volverías a abrir la app el próximo mes?</legend><div class="escala-opciones">' +
          VOLVERIA.map(function (v, k) {
            return '<input type="radio" name="reg-volveria" id="reg-volveria-' + k + '" value="' + v + '"' + (registro.volveria === v ? ' checked' : '') + '>' +
              '<label for="reg-volveria-' + k + '">' + v + '</label>';
          }).join('') + '</div></fieldset>' +
        '<div class="campo"><label for="reg-aviso">¿Qué aviso te haría volver?</label>' +
          '<select id="reg-aviso" class="campo-select"><option value="">Sin elegir</option>' +
          TIPOS_AVISO.map(function (t) { return '<option' + (registro.avisoVolver === NOMBRE_AVISO[t] ? ' selected' : '') + '>' + NOMBRE_AVISO[t] + '</option>'; }).join('') +
          '</select></div>' +
        '<p class="etiqueta">Me interesa</p>' +
        '<p class="texto-apoyo">' + (registro.meInteresa.length ? registro.meInteresa.map(function (id) { return CAMINOS[id].nombre; }).join(', ') : 'Todavía nada. Se anota solo desde las fichas.') + '</p>' +
      '</form>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-exportar">' +
        '<h2 class="h5" id="titulo-exportar">Para copiar</h2>' +
        '<label class="oculto-visual" for="reg-texto">Registro en texto</label>' +
        '<textarea id="reg-texto" class="registro-texto" rows="9" readonly></textarea>' +
        '<div class="acciones">' +
          '<button type="button" class="btn btn-primario btn-bloque" id="btn-copiar-registro">Copiar el registro</button>' +
          '<p class="aviso aviso-ok" id="registro-copiado" aria-live="polite" hidden></p>' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-nueva-sesion">Nueva sesión: borrar el registro</button>' +
        '</div>' +
      '</section>';

    var hoy = new Date();
    var fecha = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
    var actualizar = function () { $('reg-texto').value = textoRegistro(registro, fecha); };
    [['reg-antes', 'plazoAntes'], ['reg-despues', 'plazoDespues']].forEach(function (x) {
      $(x[0]).addEventListener('input', function () {
        var limpio = $(x[0]).value.replace(/\D/g, '').slice(0, 2);
        $(x[0]).value = limpio;
        registro[x[1]] = limpio === '' ? null : Number(limpio);
        guardarRegistro(); actualizar();
      });
    });
    document.querySelectorAll('input[name="reg-volveria"]').forEach(function (r) {
      r.addEventListener('change', function () { registro.volveria = r.value; guardarRegistro(); actualizar(); });
    });
    $('reg-aviso').addEventListener('change', function () {
      registro.avisoVolver = $('reg-aviso').value || null;
      guardarRegistro(); actualizar();
    });
    $('reg-camino').addEventListener('change', function () {
      registro.camino = $('reg-camino').value || null;
      guardarRegistro(); actualizar();
    });
    [['reg-explicacion', 'explicacion'], ['reg-confianza', 'confianza']].forEach(function (x) {
      document.querySelectorAll('input[name="' + x[0] + '"]').forEach(function (r) {
        r.addEventListener('change', function () { registro[x[1]] = Number(r.value); guardarRegistro(); actualizar(); });
      });
    });
    $('btn-copiar-registro').addEventListener('click', function () {
      var aviso = $('registro-copiado');
      var listo = function () { aviso.textContent = 'Copiado. Pégalo en tus notas de la sesión.'; aviso.hidden = false; };
      var aMano = function () {
        $('reg-texto').focus(); $('reg-texto').select();
        aviso.textContent = 'Texto seleccionado: cópialo con el menú del teléfono.'; aviso.hidden = false;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText($('reg-texto').value).then(listo, aMano);
      else aMano();
    });
    $('btn-nueva-sesion').addEventListener('click', function () {
      registro = Object.assign({}, REGISTRO_VACIO, { meInteresa: [] });
      try { localStorage.removeItem(CLAVE_REGISTRO); } catch (e) { /* nada guardado */ }
      renderRegistro();
      anunciar('Registro borrado. Lista para una nueva sesión.');
    });
    actualizar();
  }


  // ---------- Sprint 13: volver a la app ----------

  // S13-F1: lo que la app sabe para armar los avisos del mes (las reglas están en avisosDelMes).
  function contextoAvisos() {
    var c = { apagados: estado.avisosApagados, cuota: estado.ahorroMensual, ultimoMes: (estado.historialMeses || []).slice(-1)[0] };
    c.inversiones = estado.inversiones.map(function (x) {
      return { nombre: buscarProyecto(x.proyectoId).nombre, pesos: ufAPesos(cuotaMensualTotalUF(datosCobro([x]))) };
    });
    if (estado.compra) {
      var p = buscarProyecto(estado.compra.proyectoId);
      var r = resumen(p);
      var paso = pasoEfectivo();
      c.lugar = 'en ' + p.comuna;
      if (p.tipo === 'conjunto' && paso < 4) {
        c.grupo = cuposParaMasDescuento(r.cuposTomados, r.cupos);
        c.obra = { etapa: p.etapaObra || 0 };
      }
      if (paso <= 3) {
        c.etapa = 'pie';
        c.meses = mesesRestantes(metaCompra(p), estado.ahorrado, estado.ahorroMensual);
        if (c.meses === null) c.etapa = null;
      } else {
        var m = mesDelDepartamento(p, departamentoDeMiCompra(p));
        c.etapa = 'departamento';
        c.crecioPesos = ufAPesos(m.crecimientoUF);
        c.porcentajeTuyo = m.porcentajeTuyo;
      }
    } else if (estado.preguntasListas && rangoActual()) {
      // El mismo plazo que muestra Inicio: de los departamentos más baratos del rango a los más caros.
      var perfil = perfilActual();
      var rango = rangoActual();
      var rc = recomendarCamino(perfil);
      var id = estado.caminoElegido && !CAMINOS[estado.caminoElegido].ficha ? estado.caminoElegido : null;
      var pr = plazoRango(perfil, rango);
      var desde = id ? numerosCamino(id, rango.desde, perfil).meses : pr.desde.numeros.meses;
      var hasta = id ? numerosCamino(id, listaMeta(), perfil).meses : rc.numeros.meses;
      c.etapa = 'camino';
      c.lugar = 'de ' + textoRango(rango);
      c.meses = rc.todaviaNo && !id ? null : (desde === hasta ? hasta : desde + ' a ' + hasta);
    }
    return c;
  }

  // Clave del "mes" de los avisos: el mes simulado de la compra, o el mes del calendario.
  function claveMesAvisos() {
    var c = estado.compra;
    if (c && pasoEfectivo() >= 4) return 'departamento-' + (c.mes || 1);
    if (c) return 'pie-' + (estado.mesAhorro || 0);
    var hoy = new Date();
    return 'camino-' + hoy.getFullYear() + '-' + hoy.getMonth();
  }

  function campana() {
    var n = estado.avisosVistos === claveMesAvisos() ? 0 : avisosDelMes(contextoAvisos()).length;
    return '<a class="campana" href="#camino/avisos" aria-label="Avisos' + (n ? ', ' + n + ' este mes' : '') + '">' + icono('i-campana', 'icono-campana') +
      (n ? '<span class="campana-numero" aria-hidden="true">' + n + '</span>' : '') + '</a>';
  }

  var NOMBRE_AVISO = { cuota: 'Tu cuota y tu plazo', grupo: 'Tu grupo', obra: 'Tu obra', departamento: 'Tu departamento e inversiones' };

  function renderAvisos() {
    var avisos = avisosDelMes(contextoAvisos());
    estado.avisosVistos = claveMesAvisos();
    guardarEstado();
    $('avisos-contenido').innerHTML =
      '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Mi camino</a>' +
      '<header class="encabezado"><h1 id="titulo-avisos" class="h2">Avisos</h1>' +
        '<p class="texto-apoyo">Este mes, simulados.</p></header>' +
      (avisos.length
        ? '<ol class="notificaciones">' + avisos.map(function (a, i) {
            return '<li class="notificacion" style="animation-delay:' + (i * 60) + 'ms">' +
              '<span class="notificacion-app" aria-hidden="true">' + icono('i-casa') + '</span>' +
              '<span class="notificacion-cuerpo"><small>Primer Peldaño · día ' + a.dia + '</small>' +
                '<strong>' + a.titulo + '</strong><span>' + a.texto + '</span></span></li>';
          }).join('') + '</ol>'
        : '<div class="vacio">' + icono('i-campana', 'icono-grande') + '<h2 class="h3">Sin avisos este mes</h2></div>') +
      '<p class="texto-centro"><a class="enlace" href="#perfil/avisos">Elegir qué avisos recibir</a></p>';
  }

  // S13-F4: tu grupo (lo asegurado hoy y cuántas personas faltan) y tu obra (5 etapas, la actual marcada).
  // Tu pie: Juntos, Tu grupo y Tu obra se abren al tocarlos, para que arriba quede el pie y su acción.
  // Lo abierto se recuerda mientras dura la sesión (Tu pie se vuelve a dibujar en cada mes simulado).
  var plegablesAbiertos = {};
  function plegable(id, titulo, resumenHtml, contenido) {
    return '<details class="tarjeta bloque plegable" data-plegable="' + id + '"' + (plegablesAbiertos[id] ? ' open' : '') + '>' +
      '<summary><span class="plegable-titulo"><span class="h4" id="titulo-' + id + '">' + titulo + '</span>' +
        (resumenHtml ? '<span class="plegable-resumen">' + resumenHtml + '</span>' : '') + '</span>' +
        '<svg class="plegable-flecha" aria-hidden="true"><use href="#i-flecha"/></svg></summary>' +
      '<div class="plegable-cuerpo">' + contenido + '</div></details>';
  }
  function iniciarPlegables() {
    document.querySelectorAll('[data-plegable]').forEach(function (d) {
      d.addEventListener('toggle', function () { plegablesAbiertos[d.dataset.plegable] = d.open; });
    });
  }

  // S18-F2: la obra avanza con el reloj de la demo; al llegar la entrega queda en Recepción.
  function etapaObraHoy(p) {
    var e0 = p.etapaObra || 0;
    if (!p.entregaEstimada) return e0;
    if (mesesParaEntrega(p) <= 0) return Math.max(e0, 3);
    var total = Math.max(1, mesesEntre(FECHA_REFERENCIA, p.entregaEstimada));
    return Math.min(2, e0 + Math.floor((estado.mesAhorro || 0) / total * (3 - e0)));
  }

  function tuGrupoYObra(p) {
    var r = resumen(p);
    var g = cuposParaMasDescuento(r.cuposTomados, r.cupos);
    var etapa = etapaObraHoy(p);
    var obra = '<ol class="camino obra" aria-label="Avance de la obra">' + ETAPAS_OBRA.map(function (nombre, i) {
      var est = i < etapa ? 'hecho' : (i === etapa ? 'actual' : 'pendiente');
      var ic = est === 'hecho' ? '<svg aria-hidden="true"><use href="#i-ok"/></svg>'
        : (est === 'actual' ? '<svg aria-hidden="true"><use href="#i-casa"/></svg>' : '<span aria-hidden="true">' + (i + 1) + '</span>');
      return '<li class="' + est + '"' + (est === 'actual' ? ' aria-current="step"' : '') + '><span class="camino-icono">' + ic + '</span>' +
        '<span class="camino-nombre">' + nombre + '</span>' + (est === 'actual' ? '<span class="camino-estado">ahora</span>' : '') + '</li>';
    }).join('') + '</ol>';
    var g2 = p.grupo || {};
    var juntos = totalGrupo(p.cuposTomados, g2.cuotaPromedio || 0, g2.mesesAhorrando || 0, estado.ahorrado);
    var cerrado = grupoCerrado(p);
    var mEntrega = mesesParaEntrega(p);
    var entrega = mEntrega > 0 ? 'Entrega en ' + textoMeses(mEntrega) : 'Edificio entregado';
    return plegable('grupo', 'Tu grupo y tu obra', r.cuposTomados + ' de ' + r.cupos + ' compradores' + (cerrado ? SEP + 'cerrado' : '') + SEP + entrega,
        grupoConEdificio(p, r) +
        '<ul class="datos-inversion">' +
          '<li><span>' + icono('i-alcancia') + 'Entre todos llevan ' + ayuda('meta-comun') + '</span><strong>' + formatoRedondeado(juntos) + '</strong></li>' +
          '<li><span>' + icono('i-regalo') + (cerrado ? 'Tu descuento' : 'Descuento asegurado hoy') + '</span><strong>' + formatoPorcentaje(g.asegurado, 0) + '</strong></li>' +
          (g.faltan > 0 && !cerrado ? '<li><span>Con ' + plural(g.faltan, 'persona', 'personas') + ' más</span><strong>' + formatoPorcentaje(g.descuentoSiguiente, 0) + '</strong></li>' : '') +
        '</ul>' +
        (cerrado ? '' : '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-compartir">Compartir el proyecto</button>' +
        (r.cuposLibres > 0 ? '<button type="button" class="btn btn-terciario btn-bloque" id="btn-se-une">Simular que alguien se une</button>' : '')) +
        // S18-F2: la obra dice la entrega del edificio, con el mismo reloj que Tus llaves.
        '<h3 class="h5 bloque">Tu obra</h3>' +
        '<p class="texto-apoyo">' + entrega + SEP + fechaLlaves(0, p.entregaEstimada) + '</p>' +
        obra);
  }

  // S13-F3: juntos. La pareja ve el mismo avance. La familia aporta con una lista de regalos,
  // como una lista de regalos de matrimonio pero para el pie, en una ocasión real (simulado).
  var MONTOS_REGALO = [50000, 100000, 200000];
  var creandoLista = false;

  function bloqueJuntos() {
    var total = estado.regalos.reduce(function (a, x) { return a + x.monto; }, 0);
    var lista = estado.listaRegalos;
    var regalo;
    if (lista) {
      regalo = '<p class="chip-fila"><span class="chip chip-existe">' + esc(lista.ocasion) + '</span></p>' +
        (estado.regalos.length
          ? '<ul class="aportes">' + estado.regalos.map(function (x) {
              return '<li><span class="aporte-fila">' + avatarDeAporte(x, 36) + '<span>De tu ' + x.relacion + '</span><strong>' + formatoPesos(x.monto) + '</strong></span>' +
                (x.mensaje ? '<q class="aporte-mensaje">' + esc(x.mensaje) + '</q>' : '') + '</li>';
            }).join('') + '<li class="aporte-total"><span>Total</span><strong>' + formatoPesos(total) + '</strong></li></ul>'
          : '') +
        '<div class="acciones-dos">' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-enlace-regalo">Copiar enlace</button>' +
          '<a class="btn btn-terciario btn-bloque" href="#regalo">Ver como familia</a>' +
        '</div>';
    } else if (creandoLista) {
      regalo = '<fieldset class="escala"><legend>¿Para qué ocasión?</legend><div class="escala-opciones escala-envuelve">' +
          OCASIONES.map(function (o, k) {
            return '<input type="radio" name="ocasion" id="ocasion-' + k + '" value="' + o + '"' + (k === 0 ? ' checked' : '') + '>' +
              '<label for="ocasion-' + k + '">' + o + '</label>';
          }).join('') + '</div></fieldset>' +
        '<button type="button" class="interruptor" role="switch" aria-checked="false" id="btn-mostrar-montos">' +
          '<span>Mostrar montos a tu familia</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>' +
        '<button type="button" class="btn btn-primario btn-bloque bloque-chico" id="btn-crear-lista">Crear mi lista</button>';
    } else {
      regalo = '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-nueva-lista">' + icono('i-regalo') + 'Crear lista de regalos</button>';
    }
    var resumenJuntos = total > 0 ? 'Tu familia aportó ' + formatoPesos(total) : (estado.parejaInvitada ? 'Con tu pareja' : 'Tu pareja y tu familia');
    var pareja = miembrosCon(['pareja'])[0];
    return plegable('juntos', 'Juntos', resumenJuntos,
      (estado.parejaInvitada
        ? '<p class="juntos-avatares">' + avatarSVG(estado.avatar, 40, 'avatar') + (pareja ? avatarMiembro(pareja, 40, 'avatar avatar-2') : avatarSVG(null, 40, 'avatar avatar-2')) +
          '<span>Tú y tu pareja ven este avance</span></p>'
        : '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-invitar-pareja">' + icono('i-persona') + 'Invitar a mi pareja</button>') +
      tuEquipo() +
      '<div class="regalo">' +
        '<p class="etiqueta">' + icono('i-regalo') + 'Regalo para tu pie ' + ayuda('regalo-pie') + '</p>' +
        regalo +
      '</div>');
  }

  // S16-F4: Tu equipo dentro de Juntos. Cada persona con su relación y lo que hizo (ve tu avance o aportó).
  function papelEnEquipo(m) {
    if (m.relacion === 'pareja' && estado.parejaInvitada) return 'Ve este avance';
    if (estado.regalos.some(function (x) { return x.relacion === m.relacion; })) return 'Aportó';
    return '';
  }
  function avatarDeAporte(x, tam) {
    if (x.avatar) return avatarSVG(x.avatar, tam, 'aporte-av');
    var m = miembrosCon([x.relacion])[0];
    return m ? avatarMiembro(m, tam, 'aporte-av') : avatarSVG(null, tam, 'aporte-av');
  }
  function tuEquipo() {
    return '<div class="tu-equipo">' +
      '<p class="etiqueta" id="titulo-equipo">Tu equipo</p>' +
      '<ul class="equipo-lista" aria-labelledby="titulo-equipo">' +
        '<li>' + avatarSVG(estado.avatar, 52, 'equipo-av') + '<span>Tú</span></li>' +
        estado.equipo.map(function (m) {
          var papel = papelEnEquipo(m);
          return '<li>' + avatarMiembro(m, 52, 'equipo-av') + '<span>' + NOMBRE_RELACION[m.relacion] + '</span>' + (papel ? '<small>' + papel + '</small>' : '') + '</li>';
        }).join('') +
      '</ul>' +
      '<button type="button" class="btn btn-terciario btn-bloque" id="btn-agregar-equipo" aria-haspopup="dialog">Agregar a alguien</button>' +
    '</div>';
  }

  function iniciarJuntos(p, d) {
    var otraVez = function (foco) {
      plegablesAbiertos.juntos = true;
      renderTu5(p, d);
      if ($(foco)) $(foco).focus();
    };
    if ($('btn-invitar-pareja')) $('btn-invitar-pareja').addEventListener('click', function () {
      var invitar = function () {
        estado.parejaInvitada = true;
        guardarEstado();
        otraVez('btn-agregar-equipo');
        toast('Invitamos a tu pareja (simulado).');
      };
      // Sin pareja en tu equipo, primero se diseña su avatar (sin uno sugerido).
      if (!miembrosCon(['pareja']).length) agregarAlEquipo($('btn-invitar-pareja'), 'pareja', invitar);
      else invitar();
    });
    if ($('btn-agregar-equipo')) $('btn-agregar-equipo').addEventListener('click', function () {
      agregarAlEquipo($('btn-agregar-equipo'), null, function () { otraVez('btn-agregar-equipo'); }, 'mamá');
    });
    if ($('btn-nueva-lista')) $('btn-nueva-lista').addEventListener('click', function () {
      creandoLista = true;
      plegablesAbiertos.juntos = true;
      renderTu5(p, d);
      $('ocasion-0').focus();
    });
    if ($('btn-mostrar-montos')) $('btn-mostrar-montos').addEventListener('click', function () {
      var b = $('btn-mostrar-montos');
      b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true'));
    });
    if ($('btn-crear-lista')) $('btn-crear-lista').addEventListener('click', function () {
      var elegida = document.querySelector('input[name="ocasion"]:checked');
      estado.listaRegalos = { ocasion: elegida ? elegida.value : OCASIONES[0], mostrarMontos: $('btn-mostrar-montos').getAttribute('aria-checked') === 'true' };
      creandoLista = false;
      guardarEstado();
      renderTu5(p, d);
      toast('Tu lista está lista. Comparte el enlace.');
    });
    if ($('btn-enlace-regalo')) $('btn-enlace-regalo').addEventListener('click', function () { toast('Enlace copiado (simulado).'); });
    if ($('btn-compartir')) $('btn-compartir').addEventListener('click', function () { toast('Enlace del proyecto copiado (simulado).'); });
  }

  // Lo que ve la familia al abrir el enlace: una sola pantalla, sin cuenta ni app.
  function renderRegaloFamilia() {
    var cont = $('regalo-contenido');
    var c = estado.compra;
    var volver = '<p class="vista-familia">' + icono('i-persona') + 'Así lo ve tu familia · simulado ' +
      '<a class="enlace" href="#mis-proyectos/compra">Volver</a></p>';
    if (!c || !estado.listaRegalos || pasoEfectivo() !== 2 || !estado.ahorroIniciado) {
      cont.innerHTML = volver + '<div class="vacio">' + icono('i-regalo', 'icono-grande') + '<h1 class="h3" id="titulo-regalo">Primero crea tu lista en Tu pie</h1></div>';
      return;
    }
    var p = buscarProyecto(c.proyectoId);
    var d = departamentoDeMiCompra(p);
    var meta = metaCompra(p);
    var lista = estado.listaRegalos;
    var pct = porcentajeEntero(avance(estado.ahorrado, meta));
    var monto = MONTOS_REGALO[2];

    cont.innerHTML = volver +
      '<header class="encabezado familia-cabeza">' + FIGURAS + icono('i-casa', 'icono-grande') +
        '<h1 class="h2" id="titulo-regalo">Un aporte para su primer departamento</h1>' +
        '<p class="texto-apoyo">' + esc(lista.ocasion) + ' · ' + p.comuna + '</p></header>' +
      '<section class="tarjeta bloque" aria-label="Su avance">' +
        '<p class="etiqueta">Lleva de su pie</p>' +
        '<strong class="numero display-3">' + (lista.mostrarMontos ? formatoPesos(estado.ahorrado) : pct + NBSP + '%') + '</strong>' +
        (lista.mostrarMontos ? '<p class="texto-apoyo">de ' + formatoPesos(meta) + '</p>' : '') +
        '<div class="avance-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Avance del pie">' +
          '<span style="width:' + Math.max(pct, 1) + '%"></span></div>' +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-tu-aporte">' +
        '<h2 class="h4" id="titulo-tu-aporte">Tu aporte</h2>' +
        '<fieldset class="escala"><legend class="oculto-visual">Monto</legend><div class="escala-opciones">' +
          MONTOS_REGALO.map(function (m, k) {
            return '<input type="radio" name="monto-regalo" id="monto-regalo-' + k + '" value="' + m + '"' + (m === monto ? ' checked' : '') + '>' +
              '<label for="monto-regalo-' + k + '">' + formatoPesos(m) + '</label>';
          }).join('') + '</div></fieldset>' +
        '<p class="adelanta" id="adelanta" aria-live="polite"></p>' +
        '<div class="campo"><label for="regalo-relacion">Eres su</label>' +
          '<select id="regalo-relacion" class="campo-select">' + RELACIONES.map(function (r) { return '<option>' + r + '</option>'; }).join('') + '</select></div>' +
        '<div class="avatar-familia"><span id="avatar-familia" aria-hidden="true"></span>' +
          '<button type="button" class="btn btn-terciario btn-sm" id="btn-avatar-familia" aria-haspopup="dialog">Tu avatar</button></div>' +
        '<div class="campo"><label for="regalo-mensaje">Mensaje (opcional)</label>' +
          '<textarea id="regalo-mensaje" class="campo-texto" maxlength="140" rows="2"></textarea></div>' +
        '<p class="sello">' + icono('i-escudo') + 'Va directo a su cuenta Bci para el pie</p>' +
      '</section>' +
      '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-aportar">Aportar</button></div>';

    function adelanta() {
      monto = Number(document.querySelector('input[name="monto-regalo"]:checked').value);
      var n = mesesQueAdelanta(meta, estado.ahorrado, estado.ahorroMensual, monto);
      $('adelanta').innerHTML = icono('i-calendario') + (n > 0 ? 'Adelanta su departamento ' + plural(n, 'mes', 'meses')
        : 'Equivale a ' + plural(diasDeAhorro(monto, estado.ahorroMensual), 'día', 'días') + ' de su ahorro');
    }
    document.querySelectorAll('input[name="monto-regalo"]').forEach(function (r) { r.addEventListener('change', adelanta); });
    adelanta();

    // S16-F4: quien aporta puede retocar su propio avatar antes de aportar (simulado).
    var avatarFamilia = null;
    var avatarActual = function () {
      if (avatarFamilia) return avatarFamilia;
      var m = miembrosCon([$('regalo-relacion').value])[0];
      return m ? m.avatar : null;
    };
    var pintarAvatar = function () { $('avatar-familia').innerHTML = avatarSVG(avatarActual(), 56); };
    pintarAvatar();
    $('regalo-relacion').addEventListener('change', function () { avatarFamilia = null; pintarAvatar(); });
    $('btn-avatar-familia').addEventListener('click', function () {
      abrirCreador({ titulo: 'Tu avatar', avatar: avatarActual(), boton: $('btn-avatar-familia'), relacion: $('regalo-relacion').value,
        alGuardar: function (av) { avatarFamilia = av; pintarAvatar(); } });
    });

    $('btn-aportar').addEventListener('click', function () {
      var regalo = { relacion: $('regalo-relacion').value, monto: monto, mensaje: $('regalo-mensaje').value.trim().slice(0, 140), avatar: avatarActual() };
      estado.regalos = estado.regalos.concat([regalo]);
      // Quien aporta queda en Tu equipo.
      if (!miembrosCon([regalo.relacion]).length) estado.equipo = agregarMiembro(estado.equipo, regalo.relacion, regalo.avatar);
      estado.ahorrado = Math.min(meta, estado.ahorrado + monto);
      guardarEstado();
      if (estado.ahorrado >= meta && !entregaPendiente(p)) guardarCompra(Object.assign({}, estado.compra, { paso: 3 }));
      location.hash = '#mis-proyectos/compra';
      toast('Tu ' + regalo.relacion + ' aportó ' + formatoPesos(monto) + '.');
    });
  }

  // S13-F5: lo tuyo en el departamento hoy y cuánto creció este mes (sin plusvalía).
  var loTuyoMostrado = null;
  function loTuyo(m) {
    var html = '<section class="tarjeta bloque lo-tuyo" aria-labelledby="titulo-lo-tuyo">' +
      '<ul class="datos-inversion"><li><span id="titulo-lo-tuyo">Tu patrimonio ' + ayuda('patrimonio') + '</span><strong class="numero" id="lo-tuyo"></strong></li></ul>' +
      '<p class="crecio">' + icono('i-sube', 'icono-crecio') + 'Creció ' + formatoPesos(ufAPesos(m.crecimientoUF)) + ' este mes</p>' +
    '</section>';
    return html;
  }

  // ---------- Perfil (S3-F5) ----------
  // S15-F6: Perfil en filas cortas. Mis datos se edita en una hoja; avisos y ayuda tienen su pantalla.
  function renderPerfil(sub) {
    var c = $('perfil-contenido');
    var volver = '<a href="#perfil" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Perfil</a>';
    if (sub === 'avisos') {
      c.innerHTML = volver + '<section class="tarjeta bloque" aria-labelledby="titulo-avisos-perfil">' +
        '<h2 class="h4" id="titulo-avisos-perfil">Avisos</h2>' +
        '<ul class="interruptores">' + TIPOS_AVISO.map(function (t) {
          return '<li><button type="button" class="interruptor" role="switch" data-aviso="' + t + '" aria-checked="' + !estado.avisosApagados[t] + '">' +
            '<span>' + NOMBRE_AVISO[t] + '</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button></li>';
        }).join('') + '</ul></section>';
      document.querySelectorAll('[data-aviso]').forEach(function (b) {
        b.addEventListener('click', function () {
          var t = b.dataset.aviso;
          estado.avisosApagados[t] = !estado.avisosApagados[t];
          if (!estado.avisosApagados[t]) delete estado.avisosApagados[t];
          b.setAttribute('aria-checked', String(!estado.avisosApagados[t]));
          guardarEstado();
        });
      });
      return;
    }
    if (sub === 'ayuda') {
      c.innerHTML = volver + '<section class="tarjeta bloque" aria-labelledby="titulo-ayuda"><h2 class="h4" id="titulo-ayuda">Ayuda</h2>' + glosarioCompleto() + '</section>';
      return;
    }
    var activos = TIPOS_AVISO.filter(function (t) { return !estado.avisosApagados[t]; }).length;
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja);
    var fila = function (etiqueta, href, ic, titulo, detalle, id) {
      var dentro = icono(ic, 'icono-grande') + '<span><strong>' + titulo + '</strong>' + (detalle ? '<small>' + detalle + '</small>' : '') + '</span>' +
        '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg>';
      return '<li>' + (etiqueta === 'a' ? '<a class="fila" href="' + href + '">' + dentro + '</a>'
        : '<button type="button" class="fila" id="' + id + '" aria-haspopup="dialog">' + dentro + '</button>') + '</li>';
    };
    c.innerHTML =
      '<ul class="filas tarjeta">' +
        '<li><button type="button" class="fila fila-avatar" id="btn-perfil-avatar" aria-haspopup="dialog">' + avatarSVG(estado.avatar, 48, 'fila-av') +
          '<span><strong>Tu avatar</strong><small>' + (estado.avatar ? 'Cambiar' : 'Créalo') + (estado.equipo.length ? SEP + 'Tu equipo: ' + plural(estado.equipo.length + 1, 'persona', 'personas') : '') + '</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></button></li>' +
        fila('b', '', 'i-persona', 'Mis datos', (estado.modo === 'vivir' ? 'Para vivir' : 'Para arrendar') + (ingreso ? SEP + formatoPesos(ingreso) + ' al mes' : ''), 'btn-mis-datos') +
        fila('a', '#perfil/avisos', 'i-campana', 'Avisos', activos + ' de ' + TIPOS_AVISO.length + ' activos') +
        (estado.modo === 'vivir' ? '<li><button type="button" class="interruptor fila-interruptor" role="switch" aria-checked="' + !!estado.quiereInvertir + '" id="btn-quiero-invertir">' +
          '<span>' + icono('i-sube', 'icono-grande') + 'También quiero invertir</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button></li>' : '') +
        fila('a', '#perfil/ayuda', 'i-ayuda', 'Ayuda', 'Qué significa cada término') +
        fila('a', '#bienvenida', 'i-casa', 'Ver la introducción', '') +
        fila('a', '#registro', 'i-documento', 'Sesión de prueba', '') +
      '</ul>' +
      '<div class="acciones">' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-reiniciar" aria-expanded="false" aria-controls="confirmar-reinicio">Empezar de nuevo</button>' +
        '<div id="confirmar-reinicio" class="confirmar" hidden>' +
          '<p><strong>¿Seguro?</strong> Esto no se puede deshacer.</p>' +
          '<button type="button" class="btn btn-peligro btn-bloque" id="btn-reiniciar-si">Sí, borrar todo</button>' +
          '<button type="button" class="enlace" id="btn-reiniciar-no">Cancelar</button>' +
        '</div>' +
      '</div>';
    $('btn-mis-datos').addEventListener('click', function () { abrirMisDatos($('btn-mis-datos')); });
    $('btn-perfil-avatar').addEventListener('click', function () { editarMiAvatar($('btn-perfil-avatar')); });
    if ($('btn-quiero-invertir')) $('btn-quiero-invertir').addEventListener('click', function () {
      estado.quiereInvertir = !estado.quiereInvertir;
      guardarEstado();
      $('btn-quiero-invertir').setAttribute('aria-checked', String(estado.quiereInvertir));
      actualizarBarraInversiones();
      toast(estado.quiereInvertir ? 'Inversiones está en la barra.' : 'Inversiones salió de la barra.');
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
      location.hash = '#camino';
    });
  }

  // Si el usuario ya postuló y cambia sus sueldos, la carga guardada se vuelve a
  // calcular; si ya no le alcanza para postular, vuelve al paso 1.
  function recalcularPostulacion() {
    if (!estado.compra || (estado.compra.paso !== 2 && estado.compra.paso !== 3)) return;
    var p = buscarProyecto(estado.compra.proyectoId);
    var ev = evaluarCarga(resumen(p).escenario.totalMes, estado.otrasCuotas, estado.sueldoPropio, estado.sueldoPareja);
    if (!ev || ev.nivel === 'no-aprueba') guardarCompra(Object.assign({}, estado.compra, { paso: 1, carga: null }));
    else guardarCompra(Object.assign({}, estado.compra, { carga: ev.cargaTotal }));
  }

  // ---------- Navegación (S15-F1) ----------
  // Las direcciones antiguas se llevan a las nuevas (enlaces guardados, avisos, código anterior).
  function rutaLegada(hash) {
    var p = hash.replace('#', '').split('/');
    switch (p[0]) {
      case '': case 'inicio': return '#camino';
      case 'caminos': case 'mes-real': return '#camino/caminos';
      case 'ficha': return '#camino/ficha/' + (p[1] || '');
      case 'avisos': return '#camino/avisos';
      case 'proyectos': return estado.preguntasListas && estado.caminoElegido && !estado.compra ? '#camino/elegir' : '#departamentos';
      case 'proyecto': return (estado.compra || estado.caminoElegido ? '#camino/proyecto/' : '#departamentos/') + (p[1] || '');
      case 'invertir': return '#inversiones/' + (p[1] || '') + '/invertir';
      case 'mis-proyectos': return p[1] === 'inversiones' ? '#inversiones' : (estado.compra ? '#camino/' + rutaPasoActual() : '#camino');
    }
    return RUTAS[p[0]] ? null : '#camino';
  }

  // De la dirección a la pantalla: { pantalla, seccion, dibujar }.
  function resolverRuta() {
    var p = location.hash.replace('#', '').split('/').map(function (x) { return decodeURIComponent(x); });
    var r = function (pantalla, seccion, dibujar) { return { pantalla: pantalla, seccion: seccion, dibujar: dibujar }; };
    if (p[0] === 'bienvenida') return r('intro', null, function () {});
    if (p[0] === 'regalo') return r('regalo', null, renderRegaloFamilia);
    if (p[0] === 'registro') return r('registro', 'perfil', renderRegistro);
    if (p[0] === 'perfil') return r('perfil', 'perfil', function () { renderPerfil(p[1]); });
    if (p[0] === 'departamentos') {
      if (p[1]) return r('proyecto', 'departamentos', function () { renderDetalle(p[1], 'departamentos'); });
      return r('proyectos', 'departamentos', function () { renderLista('explorar'); });
    }
    if (p[0] === 'inversiones') {
      if (p[1] && p[2] === 'invertir') return r('invertir', 'inversiones', function () { renderInvertir(p[1]); });
      if (p[1]) return r('proyecto', 'inversiones', function () { renderDetalle(p[1], 'inversiones'); });
      return r('inversiones', 'inversiones', renderInversiones);
    }
    // Mi camino
    switch (p[1]) {
      case 'caminos': return r('caminos', 'camino', function () { cambiosActivos = {}; renderCaminos(); });
      case 'ficha': return r('ficha', 'camino', function () { renderFicha(p[2]); });
      case 'elegir': return r('proyectos', 'camino', function () { renderLista('camino'); });
      case 'proyecto': return r('proyecto', 'camino', function () { renderDetalle(p[2], 'camino'); });
      case 'avisos': return r('avisos', 'camino', renderAvisos);
      case 'postular': case 'pie': case 'firmar': case 'mi-departamento':
        return r('mis-proyectos', 'camino', function () { renderPaso(p[1], p[2]); });
    }
    return r('inicio', 'camino', renderInicio);
  }

  // Cada pestaña recuerda dónde quedaste; tocar la pestaña en la que estás vuelve a su raíz.
  var ultimaRuta = {};
  var seccionActual = null;
  function iniciarBarra() {
    document.querySelectorAll('.barra a').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var s = a.dataset.seccion;
        var destino = s === seccionActual ? a.getAttribute('href') : (ultimaRuta[s] || a.getAttribute('href'));
        if (location.hash === destino) mostrar();
        else location.hash = destino;
      });
    });
    // Un peldaño que todavía no llega dice qué hacer primero.
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('.peldano-enlace.futuro');
      if (b) toast('Primero: ' + b.dataset.primero + '.');
    });
  }

  // Historial propio de rutas: si la nueva es la anterior, es "Atrás" y se recupera dónde estaba.
  var pilaRutas = [];
  var primeraPantalla = true;
  // S17-F11: quien compra para vivir no ve Inversiones, salvo que lo pida en Perfil o ya tenga inversiones.
  function actualizarBarraInversiones() {
    var a = document.querySelector('.barra a[data-seccion="inversiones"]');
    if (!a) return;
    a.parentElement.hidden = estado.modo === 'vivir' && !estado.quiereInvertir && !estado.inversiones.length;
  }
  function mostrar() {
    cerrarHoja(false);
    cerrarToastViejo();
    var legado = rutaLegada(location.hash);
    if (legado) { location.replace(legado); return; }
    var hashNuevo = location.hash;
    // S7-F6: la primera vez, antes de Mi camino, se muestra la introducción.
    if (hashNuevo === '#camino' && !estado.introVista) { location.replace('#bienvenida'); return; }
    var yAntes = window.scrollY;
    var destino = resolverRuta();
    destino.dibujar();
    // Si la pantalla redirigió mientras se dibujaba, la nueva dirección se encarga.
    if (location.hash !== hashNuevo) return;
    document.body.classList.toggle('en-intro', destino.pantalla === 'intro');
    if (destino.pantalla !== 'inicio') document.body.classList.remove('en-preguntas');
    actualizarBarraInversiones();
    document.body.classList.toggle('en-familia', destino.pantalla === 'regalo');
    var volviendo = pilaRutas.length > 1 && pilaRutas[pilaRutas.length - 2].hash === hashNuevo;
    if (pilaRutas.length) pilaRutas[pilaRutas.length - 1].y = yAntes;
    if (volviendo) pilaRutas.pop();
    else if (!pilaRutas.length || pilaRutas[pilaRutas.length - 1].hash !== hashNuevo) pilaRutas.push({ hash: hashNuevo, y: 0 });
    var yVolver = volviendo ? pilaRutas[pilaRutas.length - 1].y : 0;
    if (destino.seccion) { ultimaRuta[destino.seccion] = hashNuevo; seccionActual = destino.seccion; }

    document.querySelectorAll('main > .pantalla').forEach(function (s) {
      s.hidden = s.id !== 'pantalla-' + destino.pantalla;
    });
    document.querySelectorAll('.barra a').forEach(function (a) {
      if (a.dataset.seccion === destino.seccion) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, yVolver);
    // S11-F1: la pantalla que entra hace un fundido corto (la que sale no se anima).
    var visible = $('pantalla-' + destino.pantalla);
    // Al cambiar de pantalla, el foco va a su título: así el lector de pantalla anuncia dónde llegó.
    if (!primeraPantalla) {
      var titulo = visible.querySelector('h1');
      if (titulo) {
        if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1');
        titulo.focus({ preventScroll: true });
      }
    }
    primeraPantalla = false;
    visible.classList.remove('entrando');
    void visible.offsetWidth;
    visible.classList.add('entrando');
  }

  window.addEventListener('hashchange', mostrar);
  iniciarBarra();
  iniciarAyudas();
  iniciarIntro();
  estado.introVista = leerIntroVista() || !!estado.compra || estado.inversiones.length > 0;
  mostrar();
})();
