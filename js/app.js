// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  // Ruta → pantalla que se muestra y botón de la barra que queda activo.
  // S15-F1: cuatro pestañas. La primera parte de la dirección dice la pestaña; el resto, la pantalla.
  var RUTAS = {
    'bienvenida': 'bienvenida', 'camino': 'inicio', 'pasos': 'pasos', 'pie': 'inicio', 'explorar': 'explorar', 'departamentos': 'explorar',
    'inversiones': 'perfil', 'perfil': 'perfil', 'registro': 'perfil', 'regalo': 'inicio'
  };

  // S21-B3: hitos y misiones que se marcan como hechos (simulado).
  var CLAVES_PASOS = ['cuentaVivienda', 'rsh', 'ds1Postulado', 'documentos', 'bajoLlave', 'preaprobado', 'contratoArriendo', 'arriendoTuyo'];
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
    quiereInvertir: false,   // S17-F11: en modo vivir, Inversiones aparece solo si lo pide
    ultimaVisita: null,      // S19-B4: foto de Inicio la última vez { proyecto, mes, cupos, etapa, llegada }
    novedades: [],           // S19-B4: lo que cambió desde la última visita (cambiosDesdeVisita), hasta que se ve
    construido: null,        // S23-B: la última etapa del departamento que se vio construida (para animar solo lo nuevo)
    favoritos: [],           // S23-C: proyectos guardados con el corazón
    trabajo: '',             // 9-nov: dónde trabaja (para ver cómo llegar en el mapa, dentro de la app)
    arriendoElegido: null,   // 9-nov: el departamento elegido en el arriendo con opción de compra (ARRIENDOS_OPCION)
    mesContrato: null,       // 9-nov: el mes de la demo (mesAhorro) en que firmó el contrato de arriendo
    animosDados: null,       // S22-F2: hitos y misiones que ya recibieron su "¡Bien!" (null = todavía no se mira)
    animos: [],              // S22-F2: "¡Bien!" de Tu equipo que falta ver [{ clave, motivo, relacion, id }]
    pasos: {}                // S21-B3: hitos y misiones hechos { cuentaVivienda, rsh, ds1Postulado, documentos, bajoLlave, preaprobado }
  };

  // ---------- Elecciones que se recuerdan entre visitas (S3-F3) ----------
  var CLAVE_ESTADO = 'primer-peldano-estado';
  var GUARDADOS = ['modo', 'sueldoPropio', 'sueldoPareja', 'arriendoActual', 'otrasCuotas', 'contrato',
    'ahorroMensual', 'tipoAhorro', 'ahorrado', 'ahorroIniciado', 'ahorroActual', 'caminoElegido', 'mesAhorro', 'racha', 'ultimoProtector', 'historialMeses', 'preguntasListas', 'rangoPrecio',
    'avisosApagados', 'cuotaAutomatica', 'parejaInvitada', 'regalos', 'listaRegalos', 'unidosGrupo', 'avisosVistos', 'avatar', 'equipo', 'conQuien', 'piezas', 'modoElegido', 'quiereInvertir', 'ultimaVisita', 'novedades', 'pasos', 'animosDados', 'animos', 'construido', 'favoritos', 'visita', 'visitaVersion', 'vecinos', 'trabajo', 'arriendoElegido', 'mesContrato'];
  var VALORES_POR_DEFECTO = { modo: 'arrendar', sueldoPropio: null, sueldoPareja: null, arriendoActual: null,
    otrasCuotas: null, contrato: 'indefinido',
    ahorroMensual: null, tipoAhorro: 'propio', ahorrado: 0, ahorroIniciado: false, meAlcanza: false,
    ahorroActual: null, caminoElegido: null, masBaratoTipo: null, masBaratoAjuste: null,
    mesAhorro: 0, racha: 0, ultimoProtector: null, historialMeses: [], preguntasListas: false, pregunta: 1, rangoPrecio: null, filtroRango: false,
    avisosApagados: {}, cuotaAutomatica: false, parejaInvitada: false, regalos: [], listaRegalos: null, unidosGrupo: {}, avisosVistos: null, avatar: null, conQuien: null, modoElegido: false, quiereInvertir: false, ultimaVisita: null, novedades: [], pasos: {}, animosDados: null, animos: [], construido: null, favoritos: [], visita: {}, visitaVersion: 2, vecinos: {}, trabajo: '', arriendoElegido: null, mesContrato: null };

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
      var num = function (v) { return typeof v === 'number' && isFinite(v) ? v : null; };
      if (g.ultimaVisita && typeof g.ultimaVisita.proyecto === 'string' && buscarProyecto(g.ultimaVisita.proyecto)) {
        var u = g.ultimaVisita;
        estado.ultimaVisita = { proyecto: u.proyecto, mes: num(u.mes) || 0, cupos: num(u.cupos) || 0, etapa: num(u.etapa) || 0, llegada: num(u.llegada) };
      }
      estado.novedades = Array.isArray(g.novedades) ? g.novedades.filter(function (x) {
        return x && ['cuotas', 'cupos', 'etapa', 'antes', 'despues'].indexOf(x.tipo) !== -1 && Number.isInteger(x.n || x.etapa);
      }).slice(0, 4) : [];
      estado.piezas = {};
      if (g.piezas && typeof g.piezas === 'object') ORDEN_PIEZAS.forEach(function (id) { if (g.piezas[id] === true) estado.piezas[id] = true; });
      estado.modoElegido = g.modoElegido === true || g.preguntasListas === true;
      estado.quiereInvertir = g.quiereInvertir === true;
      estado.animosDados = Array.isArray(g.animosDados) ? g.animosDados.filter(function (k) { return typeof k === 'string'; }) : null;
      estado.animos = Array.isArray(g.animos) ? g.animos.filter(function (x) { return x && MOTIVO_ANIMO[x.clave] && RELACIONES_EQUIPO.indexOf(x.relacion) !== -1; }).slice(0, 2) : [];
      estado.construido = Number.isInteger(g.construido) ? g.construido : null;
      // 9-nov: en qué grupos quiere conocer a sus vecinos (solo para vivir, por elección propia).
      estado.trabajo = typeof g.trabajo === 'string' ? g.trabajo.slice(0, 120) : '';
      estado.mesContrato = Number.isInteger(g.mesContrato) ? g.mesContrato : null;
      estado.arriendoElegido = ARRIENDOS_OPCION.some(function (u) { return u.id === g.arriendoElegido; }) ? g.arriendoElegido : null;
      estado.vecinos = {};
      if (g.vecinos && typeof g.vecinos === 'object') Object.keys(g.vecinos).forEach(function (id) { if (g.vecinos[id] === true && buscarProyecto(id)) estado.vecinos[id] = true; });
      estado.favoritos = Array.isArray(g.favoritos) ? g.favoritos.filter(function (id) { return typeof id === 'string' && buscarProyecto(id); }) : [];
      // S26: lo que ya revisaste en la visita, por departamento.
      estado.visita = {};
      if (g.visita && typeof g.visita === 'object') Object.keys(g.visita).forEach(function (id) {
        var viejo = g.visitaVersion !== 2; // 9-nov: se sacó el ítem 6 (el viaje al trabajo); lo anterior se corre una posición.
        var esUsado = USADOS.some(function (u) { return u.id === id; });
        if ((buscarProyecto(id) || esUsado) && Array.isArray(g.visita[id])) estado.visita[id] = g.visita[id]
          .filter(function (n) { return Number.isInteger(n) && n >= 0 && (viejo ? n < 8 && n !== 6 : n < 7); })
          .map(function (n) { return viejo && n === 7 ? 6 : n; });
      });
      estado.visitaVersion = 2;
      estado.pasos = {};
      if (g.pasos && typeof g.pasos === 'object') CLAVES_PASOS.forEach(function (k) { if (g.pasos[k] === true) estado.pasos[k] = true; });
      if (['solo', 'pareja', 'familia'].indexOf(g.conQuien) !== -1) estado.conQuien = g.conQuien;
      estado.equipo = [];
      if (Array.isArray(g.equipo)) g.equipo.forEach(function (m) { if (m) estado.equipo = agregarMiembro(estado.equipo, m.relacion, m.avatar); });
      // Quien ya tenía sueldos y ahorro mensual guardados no repite las preguntas.
      estado.preguntasListas = g.preguntasListas === true ||
        (g.preguntasListas === undefined && estado.sueldoPropio > 0 && estado.ahorroMensual > 0);
      // S26: el camino que juntaba grupo y pie compartido ya no se ofrece: pasa a pie compartido.
      if (g.caminoElegido === 'grupo-pie-compartido') g.caminoElegido = 'pie-compartido';
      if (typeof CAMINOS !== 'undefined' && CAMINOS[g.caminoElegido] && (!CAMINOS[g.caminoElegido].ficha || g.caminoElegido === 'arriendo-opcion')) estado.caminoElegido = g.caminoElegido;
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
    estado.novedades = [];
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
    var tuyo = estado.compra && estado.compra.proyectoId === proyecto.id && !estado.compra.sinGrupo ? 1 : 0;
    var unidos = estado.unidosGrupo[proyecto.id] || 0;
    return Math.min(tuyo + unidos, proyecto.cupos - proyecto.cuposTomados);
  }
  function esMiProyecto(proyecto) { return !!(estado.compra && estado.compra.proyectoId === proyecto.id); }
  // 9-nov (opción 2): un edificio en obra con grupo también se puede comprar solo, con garantía del Estado,
  // a precio de lista. La compra lo anota con sinGrupo; el grupo se muestra como posibilidad, nunca aplicado.
  function compraSinGrupo(p) { return !!(estado.compra && estado.compra.proyectoId === p.id && estado.compra.sinGrupo); }
  function enGrupoDe(p) { return p.tipo === 'conjunto' && !compraSinGrupo(p); }

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
    var pdep = plazoDepartamento(p);
    if (pdep.on.subsidio && pdep.ds1 && pdep.ds1.mesesCuenta > 0) {
      var cuenta = Math.max(0, pdep.ds1.mesesCuenta - (estado.mesAhorro || 0));
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

  // 9-nov: el grupo da el descuento, pero nadie carga con el riesgo de otros.
  function siAlguienSeVa(p) {
    var cerrado = grupoCerrado(p);
    return '<details class="si-se-va"><summary>' + icono('i-escudo') + '<span>¿Y si alguien se retira?</span><svg class="plegable-flecha" aria-hidden="true"><use href="#i-flecha"/></svg></summary>' +
      '<ul>' +
        (cerrado ? '' : '<li>Antes del cierre, cualquiera sale sin costo, tú también.</li>') +
        '<li>Tu descuento se fija con los que haya al cierre' + (p.cierre ? ' (' + formatoFecha(p.cierre) + ')' : '') + '. Si después alguien se va, su cupo pasa a la lista de espera y tu descuento no baja.</li>' +
        '<li>Tu pie está en tu propia cuenta en Bci y tu crédito es solo tuyo: nunca pagas la parte de otra persona.</li>' +
      '</ul></details>';
  }
  // 9-nov: Tus vecinos. Solo para vivir y por elección propia. Sin nombres (CLAUDE.md): solo la cifra y avatares sin nombre.
  function tusVecinos(p, r) {
    if (estado.modo !== 'vivir') return '';
    var on = !!estado.vecinos[p.id];
    var cerrado = grupoCerrado(p);
    var otros = Math.max(0, r.cuposTomados - 1);
    var sumados = Math.min(otros, Math.max(1, Math.round(otros * 0.6)));
    var cuerpo;
    if (!on) cuerpo = '<p class="texto-apoyo">Si quieres, conoce a quienes van a vivir en tu edificio. Nunca ven tu teléfono, tu sueldo ni tus pagos.</p>' +
      '<button type="button" class="btn btn-secundario-dark btn-bloque" data-vecinos="' + esc(p.id) + '">Quiero conocer a mis vecinos</button>';
    else if (!cerrado) cuerpo = '<p class="texto-apoyo">Listo. Cuando el grupo cierre' + (p.cierre ? ', el ' + formatoFecha(p.cierre) : '') + ', te mostramos a los vecinos que también quieran conocerse.</p>' +
      '<button type="button" class="enlace" data-vecinos="' + esc(p.id) + '">Ya no quiero</button>';
    else cuerpo = '<p class="texto-apoyo">' + plural(sumados, 'vecino quiere', 'vecinos quieren') + ' conocerse (simulado):</p>' +
      '<div class="vecinos-lista" aria-hidden="true">' + new Array(sumados + 1).join('<span class="vecino-inicial">' + icono('i-persona') + '</span>') + '</div>' +
      '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-saludar-vecinos">Saludar al grupo</button>' +
      '<button type="button" class="enlace" data-vecinos="' + esc(p.id) + '">Ya no quiero</button>';
    return '<section class="tus-vecinos" aria-labelledby="titulo-vecinos"><h3 class="h5" id="titulo-vecinos">' + icono('i-grupo') + 'Tus vecinos</h3>' + cuerpo +
      '<p class="vecinos-nota"><small>Lo modera Bci. Es opcional y puedes salir cuando quieras.</small></p></section>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-vecinos]');
    if (b) {
      var id = b.dataset.vecinos;
      if (estado.vecinos[id]) delete estado.vecinos[id]; else estado.vecinos[id] = true;
      guardarEstado();
      toast(estado.vecinos[id] ? 'Te sumaste a Tus vecinos.' : 'Saliste de Tus vecinos.');
      mostrar();
      return;
    }
    if (ev.target.closest('#btn-saludar-vecinos')) toast('Saludo enviado al grupo (simulado).');
  });
  function grupoConEdificio(proyecto, r) {
    return '<div class="grupo-edificio">' + edificioGrupo(proyecto, r) +
      '<div class="grupo-datos">' +
        '<p class="etiqueta">' + icono('i-grupo') + 'Compradores</p>' +
        '<strong class="numero h3">' + r.cuposTomados + ' de ' + r.cupos + '</strong>' +
        actividadGrupo(proyecto, r) +
      '</div></div>';
  }

  // Comentario 9-nov: cuántas personas ya ponen parte del pie compartido (tú incluida si invertiste).
  function personasPie(p) { return (p.inversionistas || 0) + (invertidoEn(p.id) > 0 ? 1 : 0); }
  function lineaPersonasPie(p) {
    var n = personasPie(p);
    return '<span class="personas-pie">' + icono('i-grupo') + (n ? (n === 1 ? '1 persona ya pone' : n + ' personas ya ponen') + ' parte del pie' : 'Todavía nadie pone parte del pie') + '</span>';
  }
  // S12-F1: la participación reunida como el 15 % de la casa que se llena.
  function casaParticipacion(r, p) {
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
      (p && p.tipo === 'financiamiento' ? '<p class="avance-texto">' + lineaPersonasPie(p) + '</p>' : '') +
    '</div>';
  }

  function avanceDe(proyecto, r) {
    if (proyecto.tipo === 'venta') return '';
    return proyecto.tipo === 'conjunto' ? personasGrupo(proyecto, r) : casaParticipacion(r, proyecto);
  }

  // ---------- S7-F4: explicaciones a un toque ----------
  // Una frase por término, sin jerga. Las mismas se reúnen en Perfil › Ayuda.
  var GLOSARIO = {
    'protector': { termino: 'Protector de racha', pregunta: '¿Qué es el protector de racha?',
      texto: 'Si un mes no puedes pagar tu cuota, tu racha sigue, una vez cada 6 meses. Lo ahorrado nunca se pierde.' },
    'garantia': { termino: 'Garantía del Estado', pregunta: '¿Qué es la garantía del Estado?',
      texto: 'Con la garantía FOGAES, Bci te presta el 90 % y pones solo el 10 % de pie. Sin ella, Bci presta el 80 % y juntas más tiempo.' },
    'tasa-ejemplo': { termino: 'Tasa de ejemplo', pregunta: 'Qué significa tasa de ejemplo',
      texto: 'Cada banco fija su tasa según tu caso. Se fija el día que firmas.' },
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
    'donacion': { termino: 'Rebaja a las donaciones', pregunta: '¿Paga impuesto el regalo?',
      texto: 'Hasta noviembre de 2027, una donación por escritura de padres o abuelos a sus hijos o nietos paga la mitad del impuesto, una vez por donante (Ley 21.850).' },
    'regalo-pie': { termino: 'Regalo para tu pie', pregunta: '¿Cómo funciona el regalo para tu pie?',
      texto: 'Para un cumpleaños o una Navidad, tu familia aporta a tu cuenta Bci con un enlace, sin descargar la app. Tú eliges si ven los montos o solo el avance.' },
    'mas-barato': { termino: 'Comprar más barato', pregunta: '¿Cómo baja el precio?',
      texto: 'Un usado parecido cuesta cerca de 17,6 % menos, pero no tiene subsidio a la tasa. IVA cero baja cerca de 10 % los terminados antes del 17-oct-2026, del 1-dic-2026 al 1-dic-2027.' },
    'financiamiento-pie': { termino: 'Pie compartido', pregunta: '¿Qué es el pie compartido?',
      texto: 'Pones el 5 % y unos inversionistas el 15 %. El arriendo les paga una renta y te devuelve su parte de a poco.' }
  };

  // Botón de ayuda (44 × 44 px) para un término del glosario.
  function ayuda(clave) {
    return '<button type="button" class="btn-ayuda" data-ayuda="' + clave + '" aria-expanded="false" aria-label="' +
      GLOSARIO[clave].pregunta + '"><svg aria-hidden="true"><use href="#i-ayuda"/></svg></button>';
  }

  // S20-T1: el botón "i" de la tasa de ejemplo. Mismo globo que el "?", con el ícono de información.
  function info(clave) {
    return '<button type="button" class="btn-ayuda btn-info" data-ayuda="' + clave + '" aria-expanded="false" aria-label="' +
      GLOSARIO[clave].pregunta + '"><svg aria-hidden="true"><use href="#i-info"/></svg></button>';
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
      return estado.caminoElegido ? '#camino/elegir' : '#explorar';
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

  var NOMBRE_HITO = { 0.25: 'el primer cuarto de tu pie', 0.5: 'la mitad de tu pie', 0.75: 'los tres cuartos de tu pie', 1: 'juntar tu pie' };

  // S19-B4: "Desde tu última visita". Se compara con la foto de la vez anterior; lo nuevo queda hasta que se ve.
  function fotoVisita(x) {
    var p = x.p;
    var grupo = enGrupoDe(p);
    var plazo = x.paso === 2 && estado.ahorroIniciado ? plazoTuPie(p, metaCompra(p)).meses : null;
    return { proyecto: p.id, mes: estado.mesAhorro || 0, cupos: grupo ? resumen(p).cuposTomados : 0, etapa: grupo ? etapaObraHoy(p) : 0,
      llegada: typeof plazo === 'number' ? (estado.mesAhorro || 0) + plazo : null };
  }
  function textoNovedad(c) {
    if (c.tipo === 'cuotas') return c.n === 1 ? 'Sumaste 1 cuota a tu pie' : 'Sumaste ' + c.n + ' cuotas a tu pie';
    if (c.tipo === 'cupos') return c.n === 1 ? 'Se sumó 1 persona al grupo' : 'Se sumaron ' + c.n + ' personas al grupo';
    if (c.tipo === 'etapa') return 'La obra pasó a ' + ETAPAS_OBRA[c.etapa].toLowerCase();
    if (c.tipo === 'antes') return 'Llegas ' + plural(c.n, 'mes', 'meses') + ' antes';
    return 'Tu fecha se movió ' + plural(c.n, 'mes', 'meses');
  }
  function novedadesInicio(x) {
    var ahora = fotoVisita(x);
    var cambios = cambiosDesdeVisita(estado.ultimaVisita, ahora);
    if (cambios.length) estado.novedades = cambios;
    estado.ultimaVisita = ahora;
    guardarEstado();
    if (!estado.novedades.length) return '';
    return '<section class="novedades" aria-labelledby="titulo-novedades">' +
      '<h2 class="h6" id="titulo-novedades">Desde tu última visita</h2>' +
      '<ul class="lista-check">' + estado.novedades.map(function (c) {
        return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + textoNovedad(c) + '</span></li>';
      }).join('') + '</ul>' +
      (estado.novedades.some(function (c) { return c.tipo === 'etapa'; }) && x.p && x.p.tipo === 'conjunto' ? obraVisual(x.p) : '') +
      '<button type="button" class="enlace" id="btn-novedades-ok">Entendido</button>' +
    '</section>';
  }

  // Avisos: máximo 2, calculados con reglas fijas sobre datos del proyecto y del ahorro.
  function avisosIA(x) {
    var p = x.p;
    var r = resumen(p);
    var avisos = [];
    var dias = p.cierre ? diasEntre(hoyDemo(), p.cierre) : 0;
    var aviso = {
      cierre: dias > 0 ? 'El proyecto cierra en ' + plural(dias, 'día', 'días') + ', el ' + formatoFecha(p.cierre) + '.' : null,
      cupos: enGrupoDe(p)
        ? (grupoCerrado(p) && r.cuposLibres > 0
          ? 'El grupo cerró con ' + r.cuposTomados + ' de ' + r.cupos + ': tu descuento es ' + formatoPorcentaje(r.descuento, 0) + '.'
          : r.cuposLibres > 0
          ? 'El grupo lleva ' + r.cuposTomados + ' de ' + r.cupos + ' cupos: ' + (r.cuposLibres === 1 ? 'falta 1' : 'faltan ' + r.cuposLibres) + ' para completarlo.'
          : 'El grupo ya está completo.')
        : p.tipo === 'venta' ? null
        : 'Ya se reunió el ' + formatoPorcentaje(r.avanceFinanciamiento, 0) + ' de la participación de 15\u00a0% con inversionistas.'
    };
    if (x.paso === 2 && estado.ahorroIniciado) {
      // S19-B4: el próximo hito en meses, no en montos exactos.
      var hs = hitoSiguiente(estado.ahorrado, metaCompra(p), estado.ahorroMensual);
      if (hs && hs.meses) avisos.push((hs.meses === 1 ? 'Te falta 1 mes para ' : 'Te faltan ' + hs.meses + ' meses para ') + NOMBRE_HITO[hs.hito] + '.');
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
      novedadesInicio(x) +
      (x.paso < 4 ? cuandoLlegasCompra(x.p) + tarjetaObra() + animosInicio() + tarjetaSiguientePaso() :
      '<section class="tarjeta proximo" aria-label="Dónde vas">' +
        '<p class="chip">' + x.etapa + '</p>' +
        '<p class="etiqueta">' + x.etiqueta + '</p>' +
        (x.visual ? x.visual : (x.numero ? '<strong class="numero display-2">' + x.numero + '</strong>' : '')) +
        (x.detalle ? '<p class="texto-apoyo">' + x.detalle + '</p>' : '') +
      '</section>' +
      '<div class="accion">' +
        '<a href="#camino/' + rutaPasoActual() + '" class="btn btn-primario btn-lg btn-bloque">' + x.accion + '</a>' +
      '</div>' +
      (avisos.length
        ? '<section class="tarjeta bloque avisos" aria-labelledby="titulo-avisos">' +
            '<h2 class="h5" id="titulo-avisos">Avisos</h2>' +
            '<ul class="lista-check">' + avisos.map(function (a) {
              return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + a + '</span></li>';
            }).join('') + '</ul>' +
          '</section>'
        : ''));
    iniciarSiguientePaso();
    if ($('btn-novedades-ok')) $('btn-novedades-ok').addEventListener('click', function () {
      estado.novedades = [];
      guardarEstado();
      var s = document.querySelector('.novedades');
      if (s) s.remove();
      $('titulo-inicio').focus();
    });
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
      [1, 2, 3, 4].map(function (i) { return '<span class="b' + i + (i <= n ? ' lleno' : '') + '"></span>'; }).join('') + '</div>';
  }

  function textoPlazoMeses(n) { return n === 0 ? 'Ya lo tienes' : textoMeses(n); }

  // Las 3 preguntas de la primera vez: para qué, sus ingresos y su ahorro.
  function renderPreguntas() {
    document.body.classList.add('en-preguntas');
    var n = estado.pregunta || 1;
    var c = $('inicio-principal');
    // S16-F2: arriba, tu escena. Cada respuesta le suma algo (tu pareja, tu familia, tu mascota).
    var cabeza = function (titulo) {
      // S25: como el canvas: marca, barra de 4 colores Bci, "Pregunta N de 4" y el título.
      return '<header class="encabezado preguntas-cabeza"><p class="marca-intro"><img class="logo-bci logo-intro" src="logo_bci_negro.svg" alt="Bci" width="78" height="36"><span class="sep" aria-hidden="true">·</span>Primer Peldaño</p>' +
        barraPreguntas(n) + '<p class="pregunta-n">Pregunta ' + n + ' de 4</p>' +
        '<h1 id="titulo-inicio" class="h2" tabindex="-1">' + titulo + '</h1></header>';
    };
    var atras = n > 1 ? '<p class="texto-centro"><button type="button" class="enlace" id="btn-atras-pregunta">Atrás</button></p>' : '';

    if (n === 1) {
      var opcion = function (modo, dibujo, texto, sub) {
        return '<button type="button" class="opcion-grande opcion-' + modo + '" role="radio" aria-checked="' + (estado.modoElegido && estado.modo === modo) + '" data-modo="' + modo + '">' +
          '<span class="opcion-circulo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + dibujo + '"/></svg></span><strong>' + texto + '</strong><small>' + sub + '</small></button>';
      };
      c.innerHTML = cabeza('¿Para qué quieres tu departamento?') +
        '<div class="opciones-grandes" role="radiogroup" aria-labelledby="titulo-inicio">' +
          opcion('vivir', 'M3.5 10.5L12 4l8.5 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z', 'Para vivir', 'Tu primera vivienda') +
          opcion('arrendar', 'M4 17l6-6 4 4 6-7M15 8h5v5', 'Para arrendar', 'Inversión') +
        '</div>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-siguiente">Siguiente</button></div>';
      c.querySelectorAll('.opcion-grande').forEach(function (b) {
        b.addEventListener('click', function () {
          estado.modo = b.dataset.modo;
          estado.modoElegido = true;
          guardarEstado();
          renderPreguntas();
          c.querySelector('[data-modo="' + estado.modo + '"]').focus();
        });
      });
      $('btn-siguiente').addEventListener('click', function () {
        if (!estado.modoElegido) { temblar(c.querySelector('.opciones-grandes')); return; }
        estado.pregunta = 2;
        renderPreguntas();
        $('titulo-inicio').focus();
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
    if (x.desde !== null && x.techo !== null && x.desde !== x.techo) return (x.desde === 0 ? 'Ya' : x.techo >= 12 ? textoMeses(x.desde) : x.desde) + ' a ' + textoMeses(x.techo);
    return x.techo === null ? '—' : textoPlazoMeses(x.techo);
  }
  // S16-F3: tu ventana es más grande (2 columnas × 3 pisos) y adentro estás tú con quienes viven contigo.
  var VENTANAS_NOCHE = [1, 0, 1, 'tu', 1, 0, 1, 1, 1, 0];


  // ---------- Sprint 17: un solo plazo, piezas que se suman y texto mínimo (modo vivir) ----------
  function piezasOn() { return estado.piezas || {}; }
  // S20-T2: el DS1 mira el sueldo del núcleo (tope de su tramo) y el modo (no sirve para invertir).
  function perfilPiezas() {
    return { ahorroActual: estado.ahorroActual || 0, ahorroMensual: estado.ahorroMensual,
      sueldoPropio: estado.sueldoPropio, sueldoPareja: estado.sueldoPareja, modo: estado.modo };
  }
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
    if (on.subsidio) hasta = Math.min(hasta, DS1.tramo4.hastaUF / ((on.grupo ? 1 - desc : 1) * (on.iva ? 1 - SUPUESTOS_PIEZAS.bajaIVA : 1)));
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
      return precioConPiezas(d.listaUF, o, d.descuento) <= DS1.tramo4.hastaUF + 1e-9;
    })) return { razon: 'Sobre UF 4.000', como: 'En tu rango no hay de hasta UF 4.000. Prueba otro rango.' };
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
  // sinGrupo: el mismo departamento comprado solo (a precio de lista), por ejemplo desde el camino con garantía del Estado.
  function plazoDepartamento(p, mensual, sinGrupo) {
    var on = Object.assign({}, piezasOn(), { grupo: p.tipo === 'conjunto' && !sinGrupo && !compraSinGrupo(p) });
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
    // Con años, cada lado no se corta: "1 año y 2 meses a / 1 año y 7 meses".
    var junto = function (t) { return t.replace(/ /g, NBSP); };
    // Corto: si los dos caen en el mismo año, "1 año y 2 a 7 meses".
    var A = Math.floor(a / 12);
    if (a >= 12 && a % 12 && A === Math.floor(b / 12) && b % 12) return (A === 1 ? '1 año' : A + ' años') + ' y ' + (a % 12) + ' a ' + textoMeses(b % 12);
    if (b >= 12) return (a === 0 ? 'Ya' : junto(textoMeses(a))) + ' a ' + junto(textoMeses(b));
    return (a === 0 ? 'Ya' : a) + ' a ' + textoMeses(b);
  }
  // Comentario 9-nov: "Tu pie para … en", según tu camino. Evaluación heurística: un solo nombre por crédito.
  var PIE_PARA = { 'grupo-vivir': 'compra en grupo', 'individual-vivir': 'crédito con garantía del Estado', 'arriendo-opcion': 'arriendo con opción', 'respaldo-familiar': 'respaldo familiar' };
  function etiquetaLlaves(hasta) {
    var para = PIE_PARA[estado.caminoElegido] || PIE_PARA['individual-vivir'];
    return hasta === 0 ? 'Ya tienes tu pie para ' + para : 'Tu pie para ' + para + ' en';
  }
  function claseLargo(t) { return t.indexOf('año') !== -1 ? ' largo' : ''; }
  function textoLlavesRango(x) {
    if (x.desde.meses === null) return '';
    if (x.desde.meses === x.hasta.meses) return x.hasta.llaves;
    var a = x.desde.llaves.split(' de '), b = x.hasta.llaves.split(' de ');
    return 'Entre ' + (a[1] === b[1] ? a[0] : x.desde.llaves) + ' y ' + x.hasta.llaves;
  }
  var FRENO = { ahorro: 'Te frena: juntar tu pie', entrega: 'Te frena: la entrega', 'cuenta-vivienda': 'Te frena: tu cuenta de vivienda', ninguno: 'Nada te frena' };
  // S24-B1: lo que cambia al mover el slider, comparado con lo que juntas hoy.
  function textoDelta(base, ahora) {
    if (base === null || ahora === null) return '';
    var d = base - ahora;
    if (d > 0) return '↑ Llegas ' + textoMeses(d) + ' antes que con lo que juntas hoy';
    if (d < 0) return '↓ Te demoras ' + textoMeses(-d) + ' más que con lo que juntas hoy';
    return 'Mueve para ver qué cambia.';
  }
  // S24-B1: el dividendo se muestra en UF y debajo cuánto es hoy en pesos.
  function rangoUF(desde, hasta) {
    var a = ufDecimales(Math.min(desde, hasta) / SUPUESTOS.uf, 1), b = ufDecimales(Math.max(desde, hasta) / SUPUESTOS.uf, 1);
    return a === b ? b : a + ' a ' + b.replace('UF\u00a0', '');
  }
  // S25: UF con decimales fijos, como en el canvas (UF 8,5 a 11,0; UF 10,76).
  function ufDecimales(uf, d) { return 'UF\u00a0' + uf.toFixed(d).replace('.', ','); }
  // S25: como el canvas: tu arriendo (amarillo) y tu dividendo (azul), cada uno con su barra.
  function vsArriendo(div) {
    if (!(estado.arriendoActual > 0)) return '';
    var max = Math.max(estado.arriendoActual, div);
    return '<div class="vs-arriendo" aria-hidden="true">' +
      '<p><span>Tu arriendo hoy</span><strong>' + formatoRedondeado(estado.arriendoActual) + '</strong></p>' +
      '<span class="b amarillo"><i style="width:' + (estado.arriendoActual / max * 100).toFixed(1) + '%"></i></span>' +
      '<p><span>Tu dividendo</span><span><strong>' + ufDecimales(div / SUPUESTOS.uf, 2) + '</strong> <span class="hoy">' + SEP + 'hoy ' + formatoRedondeado(div) + '</span></span></p>' +
      '<span class="b azul"><i style="width:' + (div / max * 100).toFixed(1) + '%"></i></span>' +
    '</div>';
  }
  // S25: tu pie dentro del azul de Inicio, como en el canvas.
  var VENTANAS_CANVAS = [1, 0, 0, 1, 'tu', 1, 0, 1, 1, 1, 1, 0, 1];
  // 9-nov: abajo en Inicio, tu departamento en construcción a la izquierda y qué hacer a la derecha.
  // Sin cuenta: la invitación a empezar. Con cuenta: lo que va y seguir sumando.
  function tarjetaObra() {
    var s = fotoPasos();
    if (!s.numeros) return '';
    var o = avanceObraDe(s);
    if (!s.cuentaVivienda)
      return '<section class="tarjeta tarjeta-obra" aria-labelledby="titulo-obra">' +
        '<div class="obra-izq">' + obraSvg(o) + '</div><div class="obra-der">' +
          '<h2 class="h5" id="titulo-obra">Comienza a construir tu pie para tu departamento</h2>' +
          '<a class="btn btn-primario btn-sm" href="#pie">Abrir mi cuenta</a></div></section>';
    // Comentario 9-nov: Tu pie (Cuenta Vivienda) y su avance van en la misma tarjeta que tu departamento en obra.
    var pct = s.meta > 0 ? Math.min(100, Math.round(s.ahorrado / s.meta * 100)) : 0;
    return '<a class="tarjeta tarjeta-obra con-pie" href="#pie" aria-label="Tu pie: ' + formatoPesos(s.ahorrado) + ', ' + pct + ' % de ' + formatoRedondeado(s.meta) + '. ' + textoEtapaPie(o) + '. Ver tu pie">' +
      '<div class="obra-izq">' + obraSvg(o) + '</div>' +
      '<div class="obra-der">' +
        '<span class="obra-titulo">Tu pie' + SEP + 'Cuenta Vivienda</span>' +
        '<strong class="numero">' + formatoPesos(s.ahorrado) + '</strong>' +
        '<span class="obra-etapa-chica">' + textoEtapaPie(o) + '</span>' +
      '</div>' +
      '<span class="obra-barra" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' +
      '<span class="obra-pie-linea"><small>' + pct + NBSP + '% de ' + formatoRedondeado(s.meta) + '</small>' +
        '<span class="linea-ver">Ver <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span></span>' +
    '</a>';
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
            '<p class="noche-etiqueta" id="titulo-plazo">' + etiquetaLlaves(x.hasta.meses) + '</p>' +
            '<strong class="numero noche-plazo' + claseLargo(textoMesesRango(x.desde.meses, x.hasta.meses)) + '" id="numero-plazo" aria-live="polite">' + textoMesesRango(x.desde.meses, x.hasta.meses) + '</strong>' +
            '<span class="oculto-visual" id="llaves-fecha">' + textoLlavesRango(x) + '</span>' +
            '<span class="freno-llaves" id="freno-llaves">' + FRENO[x.hasta.freno] + '</span>' +
            (techoJusto ? '<p class="noche-aviso">' + icono('i-alerta') + 'Los de ' + formatoUF(x.deptos.hasta.listaUF) + ' te dejan poco para vivir.</p>' : '') +
            // S25: el edificio del canvas: 4 columnas y tu ventana de 2 × 2.
            '<div class="noche-edificio" aria-hidden="true"><div class="noche-fachada">' +
              VENTANAS_CANVAS.map(function (v) { return v === 'tu' ? '<span class="nv tu" id="mi-ventana">' + escena(46, 'ventana-av') + '</span>' : '<span class="nv' + (v ? ' on' : '') + '"></span>'; }).join('') +
            '</div></div>' +
          '</section>') +
      // S23-A: vuelven el slider "Si juntas al mes" y lo que pagas después (pedido del 7-nov).
      '<section class="tarjeta bloque si-juntas" aria-labelledby="titulo-si-juntas">' +
        '<p class="si-juntas-fila"><label for="rango-mensual" id="titulo-si-juntas">Si juntas al mes</label><strong class="numero" id="valor-mensual">' + formatoRedondeado(mensual) + '</strong></p>' +
        '<input type="range" id="rango-mensual" min="' + minimo + '" max="' + maximo + '" step="' + paso + '" value="' + mensual + '" aria-valuetext="' + formatoRedondeado(mensual) + ' al mes: ' + textoMesesRango(x.desde.meses, x.hasta.meses) + '">' +
        '<p class="delta-plazo" id="delta-plazo" aria-live="polite">' + textoDelta(x.hasta.meses, x.hasta.meses) + '</p>' +
      '</section>' +
      // Comentario 9-nov: Tu pie va arriba de "Después, pagas al mes".
      tarjetaObra() +
      '<section class="tarjeta bloque despues" aria-labelledby="titulo-despues">' +
        '<p class="etiqueta" id="titulo-despues">Después, pagas al mes</p>' +
        '<strong class="numero">' + rangoUF(x.desde.dividendo, x.hasta.dividendo) + '</strong>' +
        '<p class="hoy-pesos">hoy son ' + formatoRango(x.desde.dividendo, x.hasta.dividendo).replace(/^entre /, '') + '</p>' +
        vsArriendo(x.hasta.dividendo) +
        '<a class="dueno-link" href="#camino/dueno">Ver todo lo que pagarías como dueño ›</a>' +
      '</section>' +
      animosInicio() +
      tarjetaSiguientePaso();

    var rm = $('rango-mensual');
    var pintar = function () { var v = Number(rm.value); rm.style.setProperty('--lleno', ((v - minimo) / (maximo - minimo) * 100).toFixed(1) + '%'); return v; };
    pintar();
    rm.addEventListener('input', function () {
      var v = pintar();
      var y = plazoVivir(v);
      $('valor-mensual').textContent = formatoRedondeado(v);
      if ($('numero-plazo')) {
        var tp = textoMesesRango(y.desde.meses, y.hasta.meses);
        $('numero-plazo').textContent = tp;
        $('numero-plazo').classList.toggle('largo', !!claseLargo(tp));
        $('titulo-plazo').textContent = etiquetaLlaves(y.hasta.meses);
        $('llaves-fecha').textContent = textoLlavesRango(y);
        $('freno-llaves').textContent = FRENO[y.hasta.freno];
        var ventana = $('mi-ventana'); ventana.classList.remove('brilla'); void ventana.offsetWidth; ventana.classList.add('brilla');
      }
      var dp = $('delta-plazo'); dp.innerHTML = textoDelta(x.hasta.meses, y.hasta.meses);
      dp.className = 'delta-plazo' + (y.hasta.meses < x.hasta.meses ? ' sube' : y.hasta.meses > x.hasta.meses ? ' baja' : '');
      rm.setAttribute('aria-valuetext', formatoRedondeado(v) + ' al mes: ' + textoMesesRango(y.desde.meses, y.hasta.meses));
    });
    rm.addEventListener('change', function () { estado.ahorroMensual = Number(rm.value); guardarEstado(); });
    iniciarSiguientePaso();
    if ($('btn-ver-departamentos')) $('btn-ver-departamentos').addEventListener('click', function () { prepararProyectos(estado.caminoElegido); });
    $('btn-cambiar-departamento').addEventListener('click', function () { abrirCambiarRango($('btn-cambiar-departamento')); });
    if ($('btn-meta-rango')) $('btn-meta-rango').addEventListener('click', function () { abrirCambiarRango($('btn-meta-rango')); });
  }

  // S19-B4: cuando todavía no llega, una meta concreta para este mes (metaDelMes en calculos.js).
  function metaMesHtml() {
    var on = piezasOn();
    var lista = metaDelMes({ ahorroMensual: estado.ahorroMensual || 0, otrasCuotas: estado.otrasCuotas || 0,
      subsidio: on.subsidio ? false : cabeCon('subsidio'), iva: on.iva ? false : cabeCon('iva') });
    var texto = function (m) {
      if (m.tipo === 'ahorrar') return 'Aparta ' + formatoRedondeado(m.monto) + ' este mes';
      if (m.tipo === 'subsidio') return '<a href="#explorar">Revisa el subsidio del Estado</a>';
      if (m.tipo === 'iva') return '<a href="#explorar">Mira los terminados sin IVA</a>';
      if (m.tipo === 'cuota') return 'Termina una de tus otras cuotas';
      return '<button type="button" class="enlace" id="btn-meta-rango" aria-haspopup="dialog">Prueba un rango más bajo</button>';
    };
    return '<section class="tarjeta bloque meta-mes" aria-labelledby="titulo-meta-mes">' +
      '<h2 class="h5" id="titulo-meta-mes">Tu meta de este mes</h2>' +
      '<ul class="lista-check">' + lista.map(function (m) {
        return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + texto(m) + '</span></li>';
      }).join('') + '</ul>' +
    '</section>';
  }

  // S17-F9: Llega antes. Cada pieza es una fila: nombre, efecto, "?" e interruptor. La recomendada lleva ★.
  var piezaAbierta = null, mesesLlegaAntes = null;
  // S24-B2: una línea por ayuda, para que se entienda sin abrir el "?".
  var DESC_PIEZA = {
    grupo: 'Compras con otros y la inmobiliaria baja el precio.',
    subsidio: 'El Estado pone UF que se suman a tu pie.',
    iva: 'Algunos departamentos nuevos no cobran IVA.',
    regalo: 'Tu familia aporta a tu pie con un enlace.',
    respaldo: 'Un familiar deja una garantía y pones menos pie.'
  };
  function renderLlegaAntes(volverA) {
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
    // S24-B2: contra qué se compara: el plazo sin ninguna ayuda.
    var sinAyudas = plazoVivir(null, {});
    var adelanto = sinAyudas.hasta.meses !== null && x.hasta.meses !== null ? sinAyudas.hasta.meses - x.hasta.meses : 0;
    // Si todas las piezas de un grupo son propuesta, el chip va una sola vez, en su título.
    var grupoPropuesta = {};
    ['menos', 'ayuda'].forEach(function (g) {
      grupoPropuesta[g] = ORDEN_PIEZAS.filter(function (id) { return PIEZAS_VIVIR[id].grupo === g; })
        .every(function (id) { return !PIEZAS_VIVIR[id].existeHoy; });
    });
    var fila = function (id) {
      var pz = PIEZAS_VIVIR[id];
      var b = bloqueoApp(id, on) || (id === 'iva' || id === 'subsidio' ? bloqueoPieza(id, on, x.deptos.desde, x.perfil) : null);
      var activo = !!on[id];
      var ef = b ? b.razon : justo && activo ? 'Sumado' : justo && !activo ? (cambia[id] === 'sola' ? 'Así cabe' : cambia[id] ? 'Con otra, cabe' : 'Aún no') : efectoPieza(id, x.perfil, on, x.deptos.hasta, hoyDemo()).texto;
      return '<li class="pieza-fila' + (activo ? ' on' : '') + (b ? ' bloq' : '') + (justo && !b && !activo ? (cambia[id] ? ' cabe' : ' aun') : '') + '">' +
        '<span class="pieza-nombre"><strong>' + (mejor === id ? '<span class="pieza-estrella" aria-label="Recomendado">★ </span>' : '') + (id === 'subsidio' ? 'Subsidio del Estado (DS1)' : pz.nombre) + '</strong>' +
          (DESC_PIEZA[id] ? '<small class="pieza-desc">' + DESC_PIEZA[id] + '</small>' : '') +
          '<small class="pieza-efecto' + (/^[−-]/.test(ef) ? ' gana' : '') + '">' + (/^Misma fecha$/.test(ef) ? 'Misma fecha, pagas menos' : ef) +
            (pz.existeHoy || grupoPropuesta[pz.grupo] ? '' : SEP + 'Propuesta') + '</small></span>' +
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
      (volverA ? '<a href="#explorar/' + volverA + '" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + CAMINOS[volverA].corto + '</a>' : '') +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2">¿Cómo puedes llegar antes?</h1>' +
        '<p class="texto-apoyo">Hay ayudas que te acercan a tus llaves. Activa las que podrías usar y mira cuántos meses te ahorras.</p>' +
        '<p class="llega-rango">' + (rango ? 'Para un departamento de ' + textoRango(rango) + SEP : '') + '<button type="button" class="enlace" id="btn-caminos-rango" aria-haspopup="dialog">Cambiar</button></p></header>' +
      (justo
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-llaves"><p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-llaves" aria-live="polite">' + razon + ' ' + ayuda('tu-limite') + '</h2></section>'
        // S19-B2: el plazo ya está en Tu camino; aquí, una línea que cambia con cada pieza.
        : '<section class="llaves-linea llaves-azul" aria-labelledby="titulo-llaves">' +
        '<p><span class="etiqueta" id="titulo-llaves">Tienes tus llaves en</span>' +
          '<strong class="numero" aria-live="polite">' + textoMesesRango(x.desde.meses, x.hasta.meses) + '</strong>' +
          (cambio ? '<span class="cambio-llaves" aria-hidden="true">' + (cambio > 0 ? '−' : '+') + plural(Math.abs(cambio), 'mes', 'meses') + '</span>' : '') + '</p>' +
        (sinAyudas.hasta.meses !== null ? '<p class="llaves-sin">Sin ayudas: ' + textoMesesRango(sinAyudas.desde.meses, sinAyudas.hasta.meses) + '</p>' : '') +
        '<p class="llaves-adelanto' + (adelanto > 0 ? ' sube' : '') + '">' + (adelanto > 0 ? '↑ Llegas ' + textoMeses(adelanto) + ' antes' : 'Activa una ayuda para ver cuánto adelantas') + '</p>' +
        (x.hasta.ivaTarde ? '<p class="llaves-freno">Sin IVA vence antes</p>' : '') +
      '</section>') +
      grupo('menos', 'Paga menos') + grupo('ayuda', 'Recibe ayuda') +
      (siempre !== null ? '<p class="llega-siempre">Sin garantía del Estado: ' + textoMeses(siempre) + '</p>' : '') +
      '<p class="llega-sello">Calculado sin plusvalía</p>' +
      (justo ? '<p class="texto-centro"><a class="enlace" href="#camino/ficha/arriendo-opcion">Mientras tanto: arriendo con opción de compra</a></p>' : '') +
      '<div class="llega-accion">' + (justo
        ? (registro.recordarme ? '<a href="#camino" class="btn btn-secundario-dark btn-lg btn-bloque">Volver a mi camino</a>'
          : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-recordarme" data-meses="1">Recordarme cada mes</button>')
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
      toast('Listo: te recordamos tu meta cada mes (simulado).');
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
          // Comentario 9-nov: tu pie arriba, dentro del azul, como en el canvas.
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
      tarjetaObra() +
      (justo ? '' : datos) +
      animosInicio() +
      tarjetaSiguientePaso();
    iniciarSiguientePaso();

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



  // ---------- S22-F2: Tu equipo anima ----------
  // Al volver a Inicio, lo que se hizo desde la última vez recibe un "¡Bien!" de alguien de Tu equipo (simulado).
  function hechosAhora() {
    var s = fotoPasos();
    var h = hitoActual(s).hitos.filter(function (x) { return x.estado === 'hecho'; }).map(function (x) { return x.id; });
    var m = misiones(s, hoyDemo()).filter(function (x) { return x.hecho; }).map(function (x) { return x.id; });
    return h.concat(m);
  }
  function animosInicio() {
    var hechos = hechosAhora();
    if (estado.animosDados === null) {
      // Primera vez: lo que ya estaba hecho no se celebra de nuevo.
      estado.animosDados = hechos.filter(function (k) { return MOTIVO_ANIMO[k]; });
      guardarEstado();
    } else {
      var r = animosNuevos(hechos, estado.animosDados, estado.equipo);
      if (r.dados.length !== estado.animosDados.length) {
        estado.animosDados = r.dados;
        estado.animos = estado.animos.concat(r.nuevos).slice(-2);
        guardarEstado();
      }
    }
    if (!estado.animos.length) return '';
    return '<section class="tarjeta animos" aria-labelledby="titulo-animos">' +
      '<h2 class="h6" id="titulo-animos">Tu equipo te anima</h2>' +
      '<ul class="animos-lista">' + estado.animos.map(function (x) {
        var m = estado.equipo.filter(function (e) { return e.id === x.id; })[0];
        return '<li>' + avatarSVG(m ? m.avatar : null, 36, 'animo-av') +
          '<span><strong>¡Bien!</strong> Tu ' + esc(x.relacion) + ', por ' + x.motivo + '.</span></li>';
      }).join('') + '</ul>' +
      '<button type="button" class="enlace" id="btn-animos-ok">Gracias</button></section>';
  }
  function iniciarAnimos() {
    if (!$('btn-animos-ok')) return;
    $('btn-animos-ok').addEventListener('click', function () {
      estado.animos = []; guardarEstado();
      var s = document.querySelector('.animos'); if (s) s.remove();
      toast('Le contamos a tu equipo (simulado).');
    });
  }

  // ---------- S21-B2: Inicio en tres bloques: cuándo llegas · qué haces ahora · cuánto llevas ----------
  var pasoInicio = null;
  function fechaCorta(iso) { return formatoFecha(iso).replace(/ de \d{4}$/, ''); }
  // Con compra: cuándo llegas según lo que falta del pie y la entrega del edificio.
  function cuandoLlegasCompra(p) {
    var pl = plazoTuPie(p, metaCompra(p));
    // Comentario 9-nov: como el canvas: tus llaves en el azul y tu pie adentro, arriba.
    return '<section class="noche sin-slider" aria-labelledby="titulo-cuando">' +
      '<span class="noche-luna" aria-hidden="true"></span>' +
      '<p class="noche-etiqueta" id="titulo-cuando">Tus llaves en</p>' +
      '<strong class="numero noche-plazo">' + textoMeses(pl.meses) + '</strong>' +
      '<p class="noche-sub">' + fechaLlaves(pl.meses, hoyDemo()) + '</p>' +
      '<div class="noche-edificio" aria-hidden="true"><div class="noche-fachada">' +
        VENTANAS_CANVAS.map(function (v) { return v === 'tu' ? '<span class="nv tu" id="mi-ventana">' + escena(46, 'ventana-av') + '</span>' : '<span class="nv' + (v ? ' on' : '') + '"></span>'; }).join('') +
      '</div></div>' +
    '</section>';
  }
  function tarjetaSiguientePaso() {
    var s = fotoPasos();
    var sp = siguientePaso(s, hoyDemo());
    pasoInicio = sp;
    if (sp.tipo === 'listo') return '';
    var gana = sp.tipo === 'mision' ? (sp.gana.charAt(0) === '+' ? 'Ganas ' + sp.gana : 'Sirve para: ' + sp.gana) : sp.gana;
    var href = destinoSiguiente(sp);
    // S25: como el canvas: "Avanza pasos", el paso, para qué sirve y un botón a Tus pasos.
    return '<section class="tarjeta siguiente-paso" aria-labelledby="titulo-siguiente">' +
      '<p class="etiqueta">Avanza pasos</p>' +
      '<h2 class="h3" id="titulo-siguiente">' + sp.titulo + '</h2>' +
      (gana ? '<p class="siguiente-gana">' + gana + '</p>' : '') +
      '<a class="btn btn-primario btn-bloque" href="#pasos">Ir a pasos</a>' +
    '</section>';
  }
  function textoBoton(sp) { return sp.tipo === 'cuota' ? 'Pagar mi cuota' : (sp.tipo === 'mision' ? 'Hacerlo ahora' : 'Empezar'); }
  // Adónde lleva la tarjeta: una dirección, o null si se abre la hoja del hito o la misión.
  function destinoSiguiente(sp) {
    if (sp.tipo === 'cuota') return '#pie';
    if (sp.tipo === 'mision') return sp.id === 'equipo' ? '#perfil' : (sp.id === 'elegir' ? (esArriendo() ? '#explorar/arriendo-opcion' : estado.caminoElegido ? '#camino/elegir' : '#explorar') : null);
    if (sp.id === 'numeros') return '#camino';
    if (sp.id === 'pie') return '#pie';
    if (esArriendo()) return null;
    if (sp.id === 'cuenta' || (sp.id === 'preaprobacion' && !(estado.compra && !estado.compra.carga))) return null;
    if (estado.compra) return '#camino/' + rutaPasoActual();
    return estado.caminoElegido ? '#camino/elegir' : '#explorar';
  }
  function iniciarSiguientePaso() {
    iniciarAnimos();
    var b = $('btn-siguiente');
    if (b) b.addEventListener('click', function () {
      if (pasoInicio.tipo === 'mision') abrirMision(pasoInicio.id, b); else abrirHito(pasoInicio.id, b);
    });
    if ($('btn-recuerdame')) $('btn-recuerdame').addEventListener('click', function () {
      $('btn-recuerdame').remove();
      toast('Te lo recordamos el viernes (simulado).');
    });
  }
  // Tu pie, compacto: saldo, barra hacia la meta y "Bajo llave". Abre la pantalla Tu pie.
  function tuPieCompacto() {
    var s = fotoPasos();
    if (!s.numeros) return '';
    var pct = s.meta > 0 ? Math.min(100, Math.round(s.ahorrado / s.meta * 100)) : 0;
    return '<a class="tarjeta pie-compacto" href="#pie">' +
      '<span class="pie-compacto-fila"><span class="etiqueta">Tu pie</span>' +
        (s.bajoLlave ? '<span class="chip chip-existe">' + icono('i-candado') + 'Bajo llave</span>' : '') + '</span>' +
      (s.cuentaVivienda
        ? '<strong class="numero h3">' + formatoPesos(s.ahorrado) + '</strong>' +
          '<span class="avance-barra" aria-hidden="true"><span style="width:' + pct + '%"></span></span>' +
          '<small>' + pct + ' % de ' + formatoRedondeado(s.meta) + '</small>'
        : '<strong>Todavía sin cuenta de vivienda</strong>') +
      '<span class="linea-ver">Ver <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span></a>';
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
    if (estado.compra) return renderCamino();
    if (estado.inversiones.length && !estado.preguntasListas) return renderSoloInversiones();
    if (!estado.preguntasListas) return renderPreguntas();
    if (!rangoActual()) { estado.pregunta = 4; return renderPreguntas(); }
    if (esArriendo()) return renderInicioArriendo();
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
  function primeraMayuscula(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
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
            '<figcaption>' + x.nombre + (fotos.length > 1 ? SEP + (i + 1) + ' de ' + fotos.length : '') + '</figcaption></figure>';
        }).join('') +
      '</div>' +
      (fotos.length > 1 ? '<button type="button" class="galeria-flecha anterior" data-paso="-1" aria-label="Foto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
        '<button type="button" class="galeria-flecha siguiente" data-paso="1" aria-label="Foto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' : '') +
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
      // S24-B2: flechas para pasar de foto sin deslizar.
      g.querySelectorAll('.galeria-flecha').forEach(function (b) {
        b.addEventListener('click', function () {
          var n = puntos.length, i = Math.round(pista.scrollLeft / Math.max(1, pista.clientWidth));
          var j = (i + Number(b.dataset.paso) + n) % n;
          pista.scrollTo({ left: j * pista.clientWidth, behavior: reducir ? 'auto' : 'smooth' });
        });
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
  // S25: la tarjeta del canvas: foto, corazón, tipo, nombre, ficha, la cifra, una línea de datos y Ver proyecto.
  // compacta (Un camino): sin el tipo ni "Ver proyecto", y el grupo y el cierre en una línea.
  // sufijo (9-nov): lo que va después del id en la dirección, por ejemplo el camino desde el que se mira.
  function tarjetaProyecto(p, base, compacta, sufijo) {
    var r = resumen(p);
    // 9-nov (opción 2): en un camino sin grupo, el edificio en obra se muestra a precio de lista, sin el descuento del grupo.
    var caminoT = sufijo && CAMINOS[sufijo.slice(1)];
    var solo = p.tipo === 'conjunto' && estado.modo === 'vivir' && !!caminoT && !caminoT.grupo;
    var d = departamentosDe(p.id)[0];
    var completo = r.ahorroCompleto > r.ahorro ? formatoRedondeado(r.ahorroCompleto) + ' si se completa' : '';
    var conIva = p.tipo === 'venta' && estado.modo === 'vivir' && piezasValidas(piezasOn()).iva;
    var grupoTxt = p.tipo === 'conjunto' ? r.cuposTomados + ' de ' + p.cupos : '';
    var etiqueta, cifra, lineas = [];
    if (solo) {
      etiqueta = 'Precio del departamento';
      cifra = formatoRedondeado(ufAPesos(plazoDepartamento(p, null, true).precioUF));
      lineas.push('En obra' + SEP + (p.entregaEstimada ? 'entrega ' + formatoFecha(p.entregaEstimada) : 'en construcción'));
    } else if (p.tipo !== 'conjunto') {
      etiqueta = 'Precio' + (conIva ? ' sin IVA' : ' del departamento');
      cifra = formatoRedondeado(p.tipo === 'venta' && estado.modo === 'vivir' ? ufAPesos(plazoDepartamento(p).precioUF) : r.escenario.precio);
      if (p.tipo === 'financiamiento') lineas.push(lineaPersonasPie(p));
      lineas.push((p.tipo === 'financiamiento' ? porcentajeEntero(r.avanceFinanciamiento) + NBSP + '% del pie reunido' + SEP : '') +
        (p.cierre ? 'Cierra el ' + formatoFecha(p.cierre) : 'Terminado' + SEP + 'lo recibes al firmar'));
    } else {
      etiqueta = r.ahorro > 0 ? 'Ahorras al unirte' : 'Si el grupo se completa';
      cifra = formatoRedondeado(r.ahorro > 0 ? r.ahorro : r.ahorroCompleto);
      if (compacta) lineas.push(grupoTxt + ' en el grupo' + SEP + 'cierra el ' + fechaCorta(p.cierre));
      else { lineas.push((r.ahorro > 0 && completo ? completo + SEP : '') + grupoTxt); lineas.push('Cierra el ' + formatoFecha(p.cierre)); }
    }
    var foto = fotoEdificio(p);
    var chipTipo = solo ? ['azul', 'En obra'] : p.tipo === 'conjunto' ? ['azul', 'Compra en grupo'] : p.tipo === 'venta' ? ['verde', 'Terminado' + (conIva ? SEP + 'sin IVA' : '')] : ['amarillo', NOMBRE_TIPO[p.tipo]];
    return '<li><a class="tarjeta tarjeta-proyecto tarjeta-canvas" href="' + (base || '#departamentos/') + esc(p.id) + (sufijo || '') + '">' +
      (foto ? '<img class="tp-foto" src="' + foto + '" alt="' + esc(p.nombre) + ' (foto referencial)" loading="lazy" width="800" height="600">' : '<span class="tp-foto">' + fachada(p) + '</span>') +
      (compacta ? '' : '<span class="tp-tipo ' + chipTipo[0] + '">' + chipTipo[1] + '</span>') +
      '<h2 class="tp-nombre">' + esc(p.nombre) + '</h2>' +
      '<p class="tp-ficha">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '<p class="tp-etiqueta">' + etiqueta + '</p><strong class="tp-cifra">' + cifra + '</strong>' +
      lineas.map(function (l) { return '<p class="tp-linea">' + l + '</p>'; }).join('') +
      lineaMasBarato(p, r, d) +
      (estado.modo === 'vivir' && estado.preguntasListas && paraVivir(p) && razonJusto(plazoDepartamento(p, null, solo))
        ? '<p class="texto-apoyo aviso-justo">' + icono('i-alerta') + 'Te queda poco para vivir</p>' : '') +
      (compacta ? '' : '<span class="tp-ver">Ver proyecto ›</span>') +
      '</a>' + botonFavorito(p) + '</li>';
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
      location.replace(estado.preguntasListas ? '#explorar' : '#camino');
      return;
    }
    var rango = rangoActual();
    var arrendar = estado.modo === 'arrendar';
    var visibles = proyectosVisibles(ctx);
    var soloCamino = camino || !estado.verTodos;
    var n = filtrosActivos();
    $('lista-contenido').innerHTML =
      // S25: como el canvas: volver a Explorar, el título y cuántos hay.
      '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>' +
      '<header class="encabezado">' +
        '<h1 id="titulo-proyectos" class="h2">' + (camino ? 'Elige tu departamento' : 'Departamentos') + '</h1>' +
        '<p class="texto-apoyo">' + (camino ? CAMINOS[estado.caminoElegido].nombre : (arrendar ? 'Para arrendar' : 'Para vivir')) + SEP + visibles.length + (rango && soloCamino && estado.filtroRango ? ' en tu rango' : '') + '</p>' +
      '</header>' +
      '<div class="controles-lista">' +
        (rango && soloCamino ? '<button type="button" class="chip chip-filtro" id="filtro-rango" aria-pressed="' + !!estado.filtroRango + '">' + textoRango(rango) + '</button>' : '') +
        (!camino && estado.caminoElegido ? '<button type="button" class="chip chip-filtro" id="filtro-todos" aria-pressed="' + !estado.verTodos + '">' +
          'Solo mi camino</button>' : '') +
        '<button type="button" class="btn btn-terciario btn-sm" id="btn-filtrar" aria-haspopup="dialog">' + icono('i-filtro') + 'Filtrar' + (n ? ' (' + n + ')' : '') + '</button>' +
      '</div>' +
      (arrendar ? '<p class="chip chip-ia">' + icono('i-escudo') + 'Filtrado por IA: rinde ' + formatoPorcentaje(RENTABILIDAD_MINIMA, 2) + ' o más</p>' : '') +
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
  // S24-B4: como en el canvas: foto, renta, lo que falta, el plazo y cuánto se ha reunido.
  function tarjetaOportunidad(p) {
    var r = resumen(p);
    var d = departamentosDe(p.id)[0];
    var foto = fotoEdificio(p);
    var pl = plazoRecompra(r.porFinanciarUF, r.netoMensualUF, 1);
    var reunido = porcentajeEntero(r.avanceFinanciamiento);
    return '<li><a class="tarjeta oportunidad" href="#inversiones/' + esc(p.id) + '">' +
      '<span class="oportunidad-foto">' + (foto ? '<img src="' + foto + '" alt="" loading="lazy" width="800" height="600">' : fachada(p)) +
        '<span class="oportunidad-renta">6' + NBSP + '% al año en UF</span></span>' +
      '<span class="oportunidad-cuerpo">' +
        '<span class="oportunidad-nombre"><strong>' + esc(p.nombre) + '</strong><small>' + esc(p.comuna) + SEP + ficha(d) + '</small></span>' +
        '<span class="oportunidad-datos"><span><small>Falta por financiar</small><strong>' + formatoRedondeado(ufAPesos(r.faltaUF)) + '</strong></span>' +
          '<span><small>Plazo</small><strong>' + textoPlazo(pl) + '</strong></span></span>' +
        '<span class="oportunidad-barra" aria-hidden="true"><i style="width:' + reunido + '%"></i></span>' +
        lineaPersonasPie(p) +
        '<span class="oportunidad-pie"><small>' + reunido + NBSP + '% reunido</small><span class="ver">Ver oportunidad <svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></span></span>' +
      '</span></a></li>';
  }
  var montoSimInversion = 2000000;
  function cabezaInversiones() {
    return '<section class="invertir-heroe" aria-labelledby="titulo-inversiones">' +
        '<h1 id="titulo-inversiones" class="h2">Invertir en el pie de otros</h1>' +
        '<p>Pones parte del pie de alguien que compra para arrendar. Recibes <strong>6' + NBSP + '% al año en UF</strong> y el arriendo te lo devuelve.</p>' +
        '<a class="invertir-como-btn" href="#inversiones/como">¿Cómo funciona? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a>' +
        '<svg class="invertir-barras" viewBox="0 0 320 90" aria-hidden="true">' +
          '<rect x="18" y="58" width="40" height="32" rx="6" fill="rgba(255,255,255,0.25)"/><rect x="76" y="44" width="40" height="46" rx="6" fill="#2772CC"/>' +
          '<rect x="134" y="30" width="40" height="60" rx="6" fill="#FFE300"/><rect x="192" y="16" width="40" height="74" rx="6" fill="#ED0C19"/>' +
          '<rect x="250" y="4" width="40" height="86" rx="6" fill="#FFFFFF"/>' +
          '<path d="M38 50L96 36l58-14 58-14 58-6" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 7"/></svg>' +
      '</section>' +
      // S25: como el canvas: sin simulador ni los tres pasos (están en ¿Cómo funciona?).
      (estado.inversiones.length ? '' : '<p class="inv-sin">Aún no tienes inversiones</p>');
  }
  // S25: el simulador vive ahora en ¿Cómo funciona invertir?, como en el canvas.
  function simInversionHtml() {
    return '<section class="tarjeta bloque si-juntas invertir-sim" aria-labelledby="inv-sim">' +
        '<p class="si-juntas-fila"><label id="inv-sim" for="inv-rango">Si inviertes</label><strong class="numero" id="inv-monto"></strong></p>' +
        '<input type="range" id="inv-rango" min="500000" max="5000000" step="250000" value="' + montoSimInversion + '">' +
        '<div class="invertir-sim-datos"><p><small>En 4 años recibes</small><strong id="inv-final"></strong></p><p class="ganas"><small>Ganas</small><strong id="inv-gana"></strong></p></div>' +
        '<p class="texto-apoyo"><small>Calculado en UF, con 6' + NBSP + '% al año. Simulado.</small></p>' +
      '</section>';
  }
  function iniciarSimInversion() {
    var rango = $('inv-rango');
    var tasa = SUPUESTOS.rentaParticipacion;
    var tope = 5000000 * Math.pow(1 + tasa, 4);
    var pintar = function () {
      var m = Number(rango.value), fin = m * Math.pow(1 + tasa, 4);
      montoSimInversion = m;
      $('inv-monto').textContent = formatoPesos(m);
      $('inv-final').textContent = formatoPesos(Math.round(fin));
      $('inv-gana').textContent = '+' + formatoPesos(Math.round(fin - m));
      for (var a = 0; a <= 4; a++) if ($('inv-anio-' + a)) $('inv-anio-' + a).style.height = Math.max(6, Math.round(m * Math.pow(1 + tasa, a) / tope * 56)) + 'px';
      rango.style.setProperty('--lleno', ((m - 500000) / 4500000 * 100).toFixed(1) + '%');
      rango.setAttribute('aria-valuetext', formatoPesos(m) + ': recibes ' + formatoPesos(Math.round(fin)) + ' en 4 años');
    };
    rango.addEventListener('input', pintar);
    pintar();
  }
  function renderInversiones() {
    $('inversiones-cabeza').innerHTML = cabezaInversiones();
    renderMisInversiones();
    $('estado-inversiones').textContent = '';
    // S24-B4: primero las que más han reunido; se ven 3 y el resto con "Ver todas" (como en el canvas).
    var lista = PROYECTOS.filter(function (p) { return resumen(p).faltaUF > 0 && !esMiProyecto(p); })
      .sort(function (a, b) { return resumen(b).avanceFinanciamiento - resumen(a).avanceFinanciamiento; });
    var visibles = verTodasOportunidades ? lista : lista.slice(0, 3);
    $('lista-oportunidades').innerHTML = lista.length ? visibles.map(tarjetaOportunidad).join('') +
''
      : '<li class="vacio"><h3 class="h4">Sin oportunidades abiertas</h3></li>';
    if ($('btn-todas-oportunidades')) $('btn-todas-oportunidades').addEventListener('click', function () {
      verTodasOportunidades = true; renderInversiones();
      var t = document.querySelectorAll('#lista-oportunidades .oportunidad')[3]; if (t) t.focus();
    });
  }
  var verTodasOportunidades = false;

  // S24-B4: la explicación a fondo, como en el canvas (brief del Proyecto B).
  var mesRecompraDemo = 0;
  function renderInvertirComo() {
    var c = $('invertir-como-contenido');
    var pasos = [
      ['Eliges un departamento', 'Solo ves departamentos nuevos donde el arriendo alcanza para recomprar en 7 años o menos, incluso en el peor caso.', 'azul'],
      ['Pones desde UF 10', 'Junto a otros inversionistas, juntan el 15' + NBSP + '% del valor. Pasas a ser dueño de esa parte.', 'verde'],
      ['Bci da el crédito', 'Bci presta el 80' + NBSP + '% y autoriza tu participación con una hipoteca de segundo grado.', 'azul-oscuro'],
      ['El arriendo te paga', 'Entra a una cuenta custodia de Bci. De ahí sale tu renta de 6' + NBSP + '% al año en UF.', 'rojo'],
      ['Recuperas tu inversión', 'Con el resto del arriendo, el comprador te recompra tu parte en unos 4 años.', 'verde-oscuro']
    ];
    var faq = [
      ['¿Y si el comprador se baja?', 'Uno de los inversionistas que marcó "comprador de respaldo" puede quedarse con el departamento. Si nadie lo hace, se hace una venta asistida del departamento.'],
      ['¿Y si el arriendo baja?', 'La app solo muestra departamentos donde, incluso con un arriendo 10' + NBSP + '% más bajo y sin plusvalía, la recompra termina en 7 años o menos.'],
      ['¿Es seguro y legal?', 'Lo operaría Bci o un aliado inscrito en la CMF como plataforma de financiamiento colectivo (Ley Fintec). Firmas un contrato de participación en el valor, respaldado por una hipoteca de segundo grado.'],
      ['¿Por qué 6' + NBSP + '% en UF?', 'Es una renta en UF, así no la come la inflación. Queda bajo la tasa máxima convencional en UF.']
    ];
    c.innerHTML =
      '<a href="#inversiones" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Invertir</a>' +
      '<header class="encabezado">' +
        '<h1 id="titulo-invertir-como" class="h2">¿Cómo funciona invertir en el pie de otros?</h1>' +
        '<p class="texto-apoyo">Ayudas a una persona joven a comprar su primer departamento con solo el 5' + NBSP + '% de pie. A cambio, eres dueño de una parte del departamento y el arriendo te paga.</p></header>' +
      '<section class="tarjeta bloque" aria-labelledby="ic-quien">' +
        '<h2 class="h4" id="ic-quien">Quién pone qué en un departamento</h2>' +
        '<p class="quien-barra" aria-hidden="true"><span class="bci">80' + NBSP + '%</span><span class="inv">15' + NBSP + '%</span><span class="comp"></span></p>' +
        '<ul class="quien-lista">' +
          '<li><i class="bci"></i><span><strong>Bci presta el 80' + NBSP + '%</strong> <span>con crédito hipotecario y subsidio a la tasa.</span></span></li>' +
          '<li><i class="inv"></i><span><strong>Inversionistas ponen el 15' + NBSP + '%</strong> <span>y pasan a ser dueños de esa parte del valor. Aquí entras tú.</span></span></li>' +
          '<li><i class="comp"></i><span><strong>El comprador pone el 5' + NBSP + '%</strong> <span>después de ahorrarlo 12 meses, como prueba de que puede pagar.</span></span></li>' +
        '</ul>' +
      '</section>' +
      simInversionHtml() +
      '<section class="tarjeta bloque" aria-labelledby="ic-pasos">' +
        '<h2 class="h4" id="ic-pasos">Paso a paso</h2>' +
        '<ol class="respaldo-pasos">' + pasos.map(function (x, i) {
          return '<li><span class="respaldo-num ' + x[2] + '" aria-hidden="true">' + (i + 1) + '</span><span><strong>' + x[0] + '</strong><small>' + x[1] + '</small></span></li>';
        }).join('') + '</ol>' +
      '</section>' +
      '<section class="tarjeta bloque si-juntas" aria-labelledby="ic-recompra">' +
        '<h2 class="h4" id="ic-recompra">Cómo se devuelve tu parte</h2>' +
        '<p class="si-juntas-fila"><label for="ic-mes">Mueve el tiempo</label><strong class="numero" id="ic-mes-texto"></strong></p>' +
        '<input type="range" id="ic-mes" min="0" max="48" step="6" value="' + mesRecompraDemo + '">' +
        '<p class="recompra-barra" aria-hidden="true"><i class="comp" id="ic-b-comp"></i><i class="inv" id="ic-b-inv"></i></p>' +
        '<div class="invertir-sim-datos"><p class="comprador"><small>Del comprador</small><strong id="ic-comp"></strong></p><p class="ganas"><small>De los inversionistas</small><strong id="ic-inv"></strong></p></div>' +
        '<p class="texto-apoyo"><small>Cada mes el arriendo te paga tu renta de 6' + NBSP + '% al año en UF y, con lo que sobra, el comprador te recompra un poco de tu parte. En unos 4 años es dueño del todo. Sin contar el crédito de Bci.</small></p>' +
      '</section>' +
      '<section class="respaldo-comprador"><p class="respaldo-comprador-titulo"><span class="circulo-icono" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/></svg></span><strong>Puedes ser comprador de respaldo</strong></p>' +
        '<p>Si el comprador se baja, uno de los inversionistas puede quedarse con el departamento. Para marcar esta opción necesitas una preevaluación de Bci.</p></section>' +
      '<h2 class="h4 bloque">Preguntas frecuentes</h2>' +
      '<div class="faq-invertir">' + faq.map(function (f) {
        return '<details class="tarjeta"><summary><strong>' + f[0] + '</strong><svg class="flecha-abajo" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary><p>' + f[1] + '</p></details>';
      }).join('') + '</div>' +
      '<p class="tarjeta compacta nota-inversion nota-linea"><svg class="icono" aria-hidden="true"><use href="#i-info"/></svg><span><strong>Es una propuesta.</strong> Esta forma de invertir aún no existe en Bci. Los números son simulados.</span></p>' +
      '<div class="acciones"><a class="btn btn-primario btn-lg btn-bloque" href="#inversiones">Ver oportunidades</a></div>';
    iniciarSimInversion();
    var rango = $('ic-mes');
    var pintar = function () {
      var mes = Number(rango.value);
      mesRecompraDemo = mes;
      var inv = Math.round(15 * (1 - mes / 48) * 10) / 10, comp = Math.round((100 - inv) * 10) / 10;
      var txt = function (x) { return String(x).replace('.', ',') + NBSP + '%'; };
      $('ic-mes-texto').textContent = mes === 0 ? 'El día de la compra' : (mes === 48 ? 'A los 4 años' : 'Mes ' + mes);
      $('ic-comp').textContent = txt(comp);
      $('ic-inv').textContent = txt(inv);
      $('ic-b-comp').style.flexGrow = comp;
      $('ic-b-inv').style.flexGrow = inv;
      $('ic-b-inv').hidden = inv === 0;
      rango.style.setProperty('--lleno', (mes / 48 * 100).toFixed(1) + '%');
      rango.setAttribute('aria-valuetext', $('ic-mes-texto').textContent + ': inversionistas ' + txt(inv));
    };
    rango.addEventListener('input', pintar);
    pintar();
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
      if (compraSinGrupo(p)) return 'individual-vivir';
      if (c && c.grupo) return estado.caminoElegido;
      return estado.modo === 'vivir' ? 'grupo-vivir' : 'grupo-invertir';
    }
    if (c && !c.grupo && !c.ficha) return estado.caminoElegido;
    return 'pie-compartido';
  }
  function renderDetalle(id, ctx, caminoVista) {
    ctx = ctx || 'departamentos';
    $('detalle-volver').setAttribute('href', caminoVista ? '#explorar/' + caminoVista : VOLVER_DETALLE[ctx][0]);
    $('detalle-volver').lastChild.textContent = caminoVista ? CAMINOS[caminoVista].corto : VOLVER_DETALLE[ctx][1];
    // 9-nov: si se mira desde un camino sin grupo (por ejemplo, el crédito con garantía del Estado), no va "Tu grupo de compra".
    var caminoSinGrupo = !!(caminoVista && !CAMINOS[caminoVista].grupo);
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
    // 9-nov (opción 2): desde un camino sin grupo (o si lo compraste solo), el edificio en obra va a precio de lista
    // y el grupo es solo una posibilidad. Regla del CLAUDE.md: un atajo nunca se da por aplicado si no lo elegiste.
    var solo = conjunto && estado.modo === 'vivir' && (caminoSinGrupo || compraSinGrupo(p));
    var enGrupo = conjunto && !solo;
    var pd = vivirAqui ? plazoDepartamento(p, null, solo) : null;

    var precio = enGrupo
      ? '<p class="precio-lista">Precio de lista <s>' + formatoPesos(e.precioLista) + '</s></p>' +
        '<strong class="numero display-3">' + formatoPesos(e.precio) + '</strong>' +
        '<p class="texto-apoyo">Ahorras ' + formatoPesos(r.ahorro) + ' (' + formatoPorcentaje(r.descuento, 0) + ')</p>'
      : '<strong class="numero display-3">' + formatoPesos(solo ? ufAPesos(d.listaUF) : e.precio) + '</strong>';

    var rinde = estado.modo === 'arrendar'
      ? '<p class="texto-apoyo bloque">Arriendo estimado por IA: <strong>' + formatoPesos(r.arriendoBruto) + '</strong> · rinde <strong>' +
        formatoPorcentaje(r.rentabilidad, 1) + '</strong> neto</p>'
      : '';

    var frase = conjunto
      ? 'Si no se completa, sales sin costo.'
      : 'Si no se reúne el 15\u00a0%, sales sin costo.';

    // La posibilidad: el mismo departamento uniéndote a su grupo (otro camino).
    var grupoPosible = '';
    if (solo && vivirAqui && !esMiCompra && !grupoCerrado(p) && r.cuposLibres > 0) {
      var pdG = plazoDepartamento(p);
      var menos = ufAPesos(pd.precioUF - pdG.precioUF), antes = (pd.meses || 0) - (pdG.meses || 0);
      if (menos > 0) grupoPosible = '<a class="tarjeta fila grupo-posible" href="#camino/proyecto/' + esc(p.id) + '/grupo-vivir">' + icono('i-grupo', 'icono-grande') +
        '<span><strong>Si te unes a su grupo</strong><small>Podrías pagar ' + formatoRedondeado(menos) + ' menos' + (antes > 0 ? ' y llegar ' + plural(antes, 'mes', 'meses') + ' antes' : '') + '</small></span>' +
        '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>';
    }
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
          : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-llevar" aria-haspopup="dialog">Elegir este departamento</button>');
    }
    if (ctx === 'inversiones') {
      comprar = r.faltaUF > 0 && !esMiCompra
        ? '<a href="#inversiones/' + esc(p.id) + '/invertir" class="btn btn-primario btn-lg btn-bloque">Invertir aquí</a>'
        : '<p class="texto-apoyo">' + (esMiCompra ? 'En tu propia compra no puedes invertir.' : 'Este proyecto ya reunió su 15' + NBSP + '%.') + '</p>';
    }

    // 9-nov: en compra en grupo, cuántos se unieron va arriba, bajo las fotos.
    var bloqueGrupo = p.tipo === 'venta' || caminoSinGrupo || solo || conjunto && ctx !== 'inversiones' && estado.caminoElegido && CAMINOS[estado.caminoElegido] && !CAMINOS[estado.caminoElegido].grupo ? '' : '<div class="tarjeta bloque">' +
        (p.tipo === 'conjunto' ? grupoConEdificio(p, r) : avanceDe(p, r)) +
        '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
        '<p class="frase-cierre">' + frase + '</p>' +
      '</div>';
    if (conjunto && bloqueGrupo) bloqueGrupo = bloqueGrupo.replace('<div class="tarjeta bloque">', '<div class="tarjeta bloque grupo-detalle"><h2 class="grupo-detalle-titulo">Tu grupo de compra</h2>')
      .replace(/<\/div>$/, siAlguienSeVa(p) + '</div>');
    contenedor.innerHTML =
      // S25: como el canvas: título, el tipo en un chip y la ficha.
      '<header class="detalle-cabecera">' + (ctx !== 'inversiones' ? botonFavorito(p) : '') +
        '<h1 id="titulo-proyecto" class="h2">' + esc(p.nombre) + '</h1>' +
        '<span class="tp-tipo ' + (conjunto ? 'azul' : p.tipo === 'venta' ? 'verde' : 'amarillo') + '">' + (solo ? 'En obra' : NOMBRE_TIPO[p.tipo]) + '</span>' +
        '<p class="texto-apoyo">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '</header>' +
      galeria(fotosDe(p, d)) +
      (conjunto && !vivirAqui ? bloqueGrupo : '') +

      (vivirAqui
        // S17-F1 y F2: para vivir, el mismo plazo que Inicio y Tu pie, con cifras redondeadas.
        ? '<section class="detalle-llaves" aria-labelledby="det-llaves"><p id="det-llaves">Tus llaves</p>' +
            '<strong>' + (pd.meses === 0 ? 'Ya' : textoMeses(pd.meses)) + '</strong>' +
            '<p>' + pd.llaves + SEP + FRENO[pd.freno] + '</p></section>' +
          // 9-nov: el grupo va justo debajo de tus llaves.
          (conjunto ? bloqueGrupo : '') +
          '<ul class="detalle-filas">' +
            '<li><span>Precio' + (enGrupo ? ' con descuento' : p.tipo === 'venta' && piezasValidas(piezasOn()).iva ? ' sin IVA' : '') + '</span><strong>' + formatoRedondeado(ufAPesos(pd.precioUF)) + '</strong></li>' +
            (enGrupo ? '<li><span>Ahorras en grupo hoy</span><strong>' + formatoRedondeado(r.ahorro) + '</strong></li>' : '') +
            '<li><span>Juntas antes de firmar</span><strong>' + formatoRedondeado(pd.meta) + '</strong></li>' +
            '<li><span>Después pagas al mes</span><span class="en-uf"><strong>' + ufDecimales(pd.dividendo / SUPUESTOS.uf, 2) + '</strong><small>hoy son ' + formatoRedondeado(pd.dividendo) + '</small></span></li>' +
            '<li class="suave"><span>Sin subsidio a la tasa</span><span>' + ufDecimales(pd.dividendoSinSubsidio / SUPUESTOS.uf, 2) + SEP + 'hoy ' + formatoRedondeado(pd.dividendoSinSubsidio) + '</span></li>' +
          '</ul>' +
          grupoPosible +
          '<a class="tarjeta dueno-card" href="#camino/dueno/' + esc(p.id) + '"><span class="circulo-icono azul" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 10.5L12 4l8.5 6.5V20H3.5zM9.5 20v-5h5v5"/></svg></span>' +
            '<span><strong>Tu mes como dueño</strong><small>Dividendo, gastos comunes y lo que te queda para vivir</small></span><svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>' +
          barrioHtml(p) +
          '<p class="llega-sello detalle-sello">' + icono('i-escudo') + 'Calculado sin plusvalía</p>'
        : '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Precio del departamento</p>' + precio +
        '<p class="secundario">Y luego <strong>' + formatoPesos(e.totalMes) + '</strong> al mes de dividendo</p>' +
        '<p class="texto-apoyo">Sin subsidio: ' + formatoPesos(e.dividendoSinSubsidio) + ' al mes ' + ayuda('dividendo') + '</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Calculado sin plusvalía</p>' +
      '</div>') +
      rinde +

      // S19-B1: el detalle del crédito queda plegado; a la vista, las filas que deciden.
      (vivirAqui ? '' : plegable('detalle-credito', 'Ver detalle del crédito', '',
        // S18-F4: para vivir, redondeado; los exactos quedan en la simulación, la preaprobación y Firmar.
        (vivirAqui ? repartoCasa(partesPiezas(pd), formatoRedondeado) : repartoCasa(partesEscenario(e))) +
        '<ul class="datos-inversion">' +
          '<li><span>Gastos al firmar</span><strong>' + (vivirAqui ? formatoRedondeado(pd.gastos) : formatoPesos(e.gastos)) + '</strong></li>' +
          (vivirAqui ? '' : '<li><span>Juntas antes de firmar</span><strong>' + formatoPesos(e.alEscriturar) + '</strong></li>') +
          (vivirAqui && enGrupo && r.ahorroCompleto > r.ahorro ? '<li><span>Si el grupo se completa, ahorras</span><strong>' + formatoRedondeado(r.ahorroCompleto) + '</strong></li>' : '') +
        '</ul>')) +

      (p.tipo === 'venta'
        ? '<p class="detalle-terminado">Edificio terminado' + SEP + 'lo recibes al firmar</p>' +
          (vivirAqui ? '<button type="button" class="enlace detalle-credito-link" id="btn-detalle-credito" aria-haspopup="dialog">Ver detalle del crédito</button>' : '')
        // S26: con el crédito con garantía del Estado (camino individual) no se muestra el grupo: no compra en grupo.
        : (conjunto ? '' : bloqueGrupo) + (vivirAqui ? '<button type="button" class="enlace detalle-credito-link" id="btn-detalle-credito" aria-haspopup="dialog">Ver detalle del crédito</button>' : '')) +

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

      // Evaluación heurística (punto 3): la acción principal queda fija abajo mientras se lee el detalle.
      '<div class="acciones accion-fija detalle-accion">' + comprar + '</div>';

    iniciarGalerias(contenedor);
    iniciarPlegables();
    iniciarVisita(p);
    if ($('btn-detalle-credito')) $('btn-detalle-credito').addEventListener('click', function () {
      abrirHojaContenido('Detalle del crédito', repartoCasa(partesPiezas(pd), formatoRedondeado) +
        '<ul class="datos-inversion"><li><span>Gastos al firmar</span><strong>' + formatoRedondeado(pd.gastos) + '</strong></li>' +
        (enGrupo && r.ahorroCompleto > r.ahorro ? '<li><span>Si el grupo se completa, ahorras</span><strong>' + formatoRedondeado(r.ahorroCompleto) + '</strong></li>' : '') + '</ul>',
        $('btn-detalle-credito'));
    });
    var botonComprar = $('btn-comprar');
    if (botonComprar) {
      botonComprar.addEventListener('click', function () {
        conCarga(botonComprar, function () {
          guardarCompra(solo ? { proyectoId: p.id, departamentoId: d.id, paso: 1, sinGrupo: true } : { proyectoId: p.id, departamentoId: d.id, paso: 1 });
          location.hash = '#camino/postular/datos';
        });
      });
    }
    var botonCambiar = $('btn-cambiar-compra');
    if (botonCambiar) {
      botonCambiar.addEventListener('click', function () {
        conCarga(botonCambiar, function () {
          guardarCompra(solo ? { proyectoId: p.id, departamentoId: d.id, paso: 1, sinGrupo: true } : { proyectoId: p.id, departamentoId: d.id, paso: 1 });
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
            guardarCompra(solo ? { proyectoId: p.id, departamentoId: d.id, paso: 1, sinGrupo: true } : { proyectoId: p.id, departamentoId: d.id, paso: 1 });
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
      // S24-B4: sin inversiones, solo una línea junto a Oportunidades (como en el canvas).
      $('panel-inversiones').innerHTML = '';
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
  // Evaluación heurística: un solo "Paso X de 6", el de la escalera de Tus pasos.
  // La compra (Postular, Juntar el pie, Firmar) se numera con el hito que le corresponde.
  var HITO_DE_COMPRA = { 1: 'preaprobacion', 2: 'pie', 3: 'es-tuyo' };
  function pasoEscalera(id) {
    var h = hitoActual(fotoPasos());
    var i = h.hitos.map(function (x) { return x.id; }).indexOf(id);
    return i === -1 ? null : { n: i + 1, total: h.total, nombre: h.hitos[i].nombre };
  }
  function listaPasos(pasoCompra) {
    var e = pasoEscalera(HITO_DE_COMPRA[pasoCompra]);
    return e ? '<p class="paso-de">Paso ' + e.n + ' de ' + e.total + SEP + e.nombre + '</p>' : '';
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
      '<div class="tarjeta semaforo carga-canvas semaforo-' + ev.nivel + '">' +
        '<p class="carga-titulo">Parte de tu sueldo que iría al dividendo</p>' +
        medidorCarga(hayCuotas ? ev.cargaTotal : ev.cargaDividendo, hayCuotas ? ev.cargaDividendo : null) +
        '<strong class="carga-numero">' + formatoPorcentaje(hayCuotas ? ev.cargaTotal : ev.cargaDividendo, 1) + '</strong>' +
        '<span class="carga-chip ' + ev.nivel + '">' + (ev.nivel === 'limite' ? 'Justo' : ev.nivel === 'no-aprueba' ? 'Alto' : 'Holgado') + '</span>' +
        '<p class="carga-explica">' + (ev.nivel === 'holgado' ? 'Bci pide que no pase del 25' + NBSP + '%. Te sobra margen.' : ev.nivel === 'limite' ? 'Estás cerca de lo que pide Bci: poco margen.' : 'Pasa lo que pide Bci: 25' + NBSP + '%, y con cuotas 30' + NBSP + '%.') + '</p>' +
        (hayCuotas ? '<p class="carga-explica">Dividendo solo: ' + formatoPorcentaje(ev.cargaDividendo, 1) + '</p>' : '') +
        '<p class="carga-leyenda" aria-hidden="true"><span><i class="holgado"></i>Holgado</span><span><i class="justo"></i>Justo</span><span><i class="alto"></i>Alto</span></p>' +
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


  // S25: el contrato en tres tarjetas con ícono, como en el canvas.
  var ICONO_CONTRATO = { indefinido: 'M4 8h16v12H4zM9 8V5h6v3M4 13h16', 'plazo-fijo': 'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4M9 15h3', independiente: 'M4 5h16v11H4zM2.5 19.5h19M10 16v3.5M14 16v3.5' };
  function campoContrato() {
    var opcion = function (valor) {
      return '<input type="radio" name="contrato" id="contrato-' + valor + '" value="' + valor + '"' +
        (estado.contrato === valor ? ' checked' : '') + '><label for="contrato-' + valor + '"><span class="contrato-circulo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + ICONO_CONTRATO[valor] + '"/></svg></span>' + CONTRATOS[valor] + '</label>';
    };
    return '<fieldset class="contratos"><legend>Tu tipo de contrato</legend>' +
      '<div class="contratos-opciones">' + opcion('indefinido') + opcion('plazo-fijo') + opcion('independiente') + '</div>' +
      '</fieldset>';
  }
  function personaGanan(color, quien, monto) {
    return '<span class="ganan-persona"><span class="ganan-av ' + color + '" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg></span>' +
      '<span><small>' + quien + '</small><strong>' + formatoPesos(monto || 0) + '</strong></span></span>';
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
  // S25: la ceja del canvas: en qué paso de Tus pasos está la preaprobación.
  function cejaPreaprobacion() {
    var e = pasoEscalera('preaprobacion');
    return e ? '<p class="ceja-paso">Paso ' + e.n + ' de ' + e.total + SEP + e.nombre + '</p>' : '';
  }
  // S24-B3: las tres partes como un indicador con colores Bci (azul, verde, amarillo) y un check en las hechas.
  var COLOR_PARTE = ['azul', 'verde', 'amarillo'];
  function partesPostula(actual) {
    var i = PARTES_POSTULA.indexOf(actual);
    return '<ol class="pasos-postula" aria-label="Parte ' + (i + 1) + ' de 3: ' + actual + '">' + PARTES_POSTULA.map(function (nombre, j) {
      var est = j < i ? 'hecha' : (j === i ? 'actual' : 'pendiente');
      return '<li class="' + est + ' ' + COLOR_PARTE[j] + '"' + (j === i ? ' aria-current="step"' : '') + '>' +
        '<span class="paso-postula-marca" aria-hidden="true">' + (j < i ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : (j + 1)) + '</span>' +
        '<span class="paso-postula-nombre">' + ['Tus datos', 'Documentos', 'Resultado'][j] + '</span></li>';
    }).join('') + '</ol>';
  }

  // S24-B3: el ingreso del hogar y cuánto pone cada uno, en una barra partida.
  function ingresoHogar() {
    var a = estado.sueldoPropio || 0, b = estado.sueldoPareja || 0, t = a + b;
    if (!t) return '';
    return '<p class="ingreso-hogar"><span class="etiqueta">Ingreso del hogar</span><strong class="numero h3">' + formatoRedondeado(t) + '</strong></p>' +
      (b ? '<p class="barra-partida" aria-hidden="true"><i class="tu" style="flex:' + a + '"></i><i class="pareja" style="flex:' + b + '"></i></p>' +
        '<p class="barra-partida-leyenda"><span><i class="tu"></i>Tú</span><span><i class="pareja"></i>Tu pareja</span></p>' : '');
  }
  var editandoPostula = false;
  function renderPostula(p, d) {
    var sp = subpasoPostula();
    if (sp === 'documentos') return renderDocumentos(p, d);
    if (sp === 'resultado') return renderResultadoPreaprobacion(p, d);

    var e = resumen(p).escenario;
    var yaTiene = estado.sueldoPropio > 0 && !editandoPostula;
    $('panel-compra').innerHTML =
      '<section aria-labelledby="titulo-postula">' +
        cejaPreaprobacion() +
        '<h2 class="h2 titulo-postula" id="titulo-postula">Tus datos</h2>' +
        partesPostula('Tus datos') +
        // S17-F5: no se vuelve a pedir lo ya respondido: se muestra con "Cambiar".
        (yaTiene
          ? '<section class="tarjeta ganan" id="resumen-datos" aria-labelledby="titulo-ganan">' +
              '<div class="ganan-cabeza"><h3 id="titulo-ganan">Lo que ' + (estado.sueldoPareja ? 'ganan' : 'ganas') + ' al mes</h3><button type="button" class="enlace" id="btn-cambiar-postula">Cambiar</button></div>' +
              '<strong class="ganan-total">' + formatoPesos((estado.sueldoPropio || 0) + (estado.sueldoPareja || 0)) + '</strong>' +
              (estado.sueldoPareja ? '<p class="barra-partida" aria-hidden="true"><i class="tu" style="flex:' + estado.sueldoPropio + '"></i><i class="pareja" style="flex:' + estado.sueldoPareja + '"></i></p>' : '') +
              '<div class="ganan-personas">' + personaGanan('azul', 'Tú', estado.sueldoPropio) + (estado.sueldoPareja ? personaGanan('verde', 'Tu pareja', estado.sueldoPareja) : '') + '</div>' +
              '<p class="ganan-cuotas"><span>Otras cuotas que pagas</span><strong>' + formatoPesos(estado.otrasCuotas || 0) + '</strong></p>' +
            '</section>'
          : '') +
        '<div class="formulario" id="form-postula"' + (yaTiene ? ' hidden' : '') + '>' +
          campoDinero('sueldo-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          campoDinero('sueldo-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
          campoDinero('otras-cuotas', 'Otras cuotas al mes', estado.otrasCuotas) +
        '</div>' +
        campoContrato() +
        '<div id="carga-resultado" aria-live="polite"></div>' +
        '<p class="sin-compromiso"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/></svg>Sin compromiso: postular no te obliga a comprar</p>' +
        '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-postular" aria-describedby="postular-explica">Seguir</button>' +
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

  // S25: como el canvas: anillo con cuántos faltan, aviso para clientes Bci y una fila por documento.
  var ICONO_DOC = {
    liquidaciones: ['azul', 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'],
    afp: ['verde', 'M4 19h16M6 16V11M10 16V8M14 16v-6M18 16V6'],
    contrato: ['amarillo', 'M4 8h16v12H4zM9 8V5h6v3M4 13h16'],
    carnet: ['rojo', 'M3 6h18v12H3zM8 10.5a1.8 1.8 0 1 0 0 .01M5.5 15c.4-1.4 1.4-2 2.5-2s2.1.6 2.5 2M13 10h5M13 13h4']
  };
  var NOMBRE_DOC = { liquidaciones: ['Liquidaciones de sueldo', 'Las últimas 3'], afp: ['Cotizaciones de AFP', 'Los últimos 12 meses'],
    contrato: ['Contrato de trabajo', 'O certificado de antigüedad'], carnet: ['Carnet', 'Por los dos lados'] };
  function renderDocumentos(p) {
    var c = estado.compra;
    var docs = c.documentos || {};
    if (c.cliente !== false) guardarCompra(Object.assign({}, c, { cliente: false }));
    var total = DOCUMENTOS.length;
    var listos = DOCUMENTOS.filter(function (x) { return !!docs[x.id]; }).length;
    var faltan = total - listos;
    var vuelta = 2 * Math.PI * 31;
    $('panel-compra').innerHTML =
      '<section aria-labelledby="titulo-documentos">' +
        cejaPreaprobacion() +
        '<h2 class="h2 titulo-postula" id="titulo-documentos">Tus documentos</h2>' +
        partesPostula('Tus documentos') +
        '<div class="tarjeta docs-resumen"><span class="docs-anillo-caja" aria-hidden="true"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="31" fill="none" stroke="#D4E7D5" stroke-width="10"/>' +
            '<circle cx="38" cy="38" r="31" fill="none" stroke="#28892B" stroke-width="10" stroke-linecap="round" transform="rotate(-90 38 38)" style="stroke-dasharray:' + (vuelta * listos / total).toFixed(1) + ' ' + vuelta.toFixed(1) + '"/></svg>' +
            '<strong>' + listos + '/' + total + '</strong></span>' +
          '<span><strong>' + (faltan ? plural(faltan, 'documento por subir', 'documentos por subir') : 'Todo listo') + '</strong><small>' + (faltan ? 'Toma unos 2 minutos' : 'Bci ya tiene lo que necesita') + '</small></span></div>' +
        '<p class="docs-cliente"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5h.01"/></svg><span>Si eres cliente Bci, ya los tenemos. Solo revisa que estén.</span></p>' +
        '<ul class="docs-lista">' + DOCUMENTOS.map(function (x) {
          var ok = !!docs[x.id], ic = ICONO_DOC[x.id] || ICONO_DOC.liquidaciones, nm = NOMBRE_DOC[x.id] || [x.nombre, ''];
          return '<li class="tarjeta doc-fila" id="doc-' + x.id + '"><span class="doc-icono ' + ic[0] + '" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + ic[1] + '"/></svg></span>' +
            '<span class="doc-texto"><strong>' + nm[0] + '</strong><span class="doc-estado' + (ok ? ' listo' : '') + '">' + (ok ? '✓ Listo' : 'Falta' + SEP + nm[1]) + '</span></span>' +
            '<button type="button" class="doc-boton btn-subir' + (ok ? '' : ' falta') + '" data-doc="' + x.id + '" aria-haspopup="dialog" aria-label="' + (ok ? 'Cambiar ' : 'Subir ') + nm[0] + '">' + (ok ? 'Cambiar' : 'Subir') + '</button></li>';
        }).join('') + '</ul>' +
        (faltan ? '' : '<div class="docs-todo" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#FFFFFF"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#28652B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>¡Todo listo! Ya puedes pedirla.</div>') +
        '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-preaprobacion">Pedir mi preaprobación</button>' +
        '<div class="acciones"><button type="button" class="enlace" id="btn-volver-datos">Volver a mis datos</button></div>' +
      '</section>';

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
        // Si falta alguno, se abre el que falta.
        if (!documentosListos()) {
          var falta = DOCUMENTOS.filter(function (x) { return !docs[x.id]; })[0];
          abrirHoja(p, document.querySelector('.btn-subir[data-doc="' + falta.id + '"]'));
          return;
        }
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
        var destino = fila.querySelector('.doc-icono');
        fila.classList.add('subiendo');
        fila.querySelector('.doc-estado').textContent = 'Subiendo…';
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
            var sig = document.querySelector('.doc-boton.falta'); if (sig) sig.focus();
            anunciar(x.nombre + ': listo.');
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
      var rg = rangoActual();
      var tope = Math.max(r.creditoUF, rg ? rg.hasta : 0, creditoNecesario);
      var ev = evaluarCarga(e.totalMes, estado.otrasCuotas, estado.sueldoPropio, estado.sueldoPareja);
      var cargaV = ev ? ((estado.otrasCuotas || 0) > 0 ? ev.cargaTotal : ev.cargaDividendo) : null;
      // S25: igual al canvas: celebración centrada, si alcanza para tu rango, dos datos y cuándo vence.
      cuerpo =
        (alcanza
          ? '<section class="preaprobado-heroe"><span class="pp-papel p1" aria-hidden="true"></span><span class="pp-papel p2" aria-hidden="true"></span><span class="pp-papel p3" aria-hidden="true"></span><span class="pp-papel p4" aria-hidden="true"></span><span class="pp-papel p5" aria-hidden="true"></span>' +
              '<span class="pp-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-8.5"/></svg></span>' +
              '<h3>¡Bci te preaprobó!</h3><p>Te podría prestar hasta</p>' +
              '<strong>' + formatoRedondeado(ufAPesos(r.creditoUF)) + '</strong>' +
              '<span class="pp-chip">' + formatoUF(r.creditoUF) + SEP + 'simulado</span></section>' +
            '<section class="tarjeta pp-rango"><p class="pp-rango-titulo">' + icono('i-ok') + (rg ? 'Alcanza para tu rango' : 'Alcanza para este departamento') + '</p>' +
              '<span class="pp-barra" aria-hidden="true"><i style="left:' + ((rg ? rg.desde : creditoNecesario * 0.9) / tope * 100).toFixed(1) + '%;width:' + (((rg ? rg.hasta - rg.desde : creditoNecesario * 0.1)) / tope * 100).toFixed(1) + '%"></i></span>' +
              '<p class="pp-rango-leyenda"><span>UF 0</span><span class="tuyo">' + (rg ? 'Tu rango: ' + textoRango(rg) : 'Este departamento') + '</span><span>' + formatoUF(r.creditoUF) + '</span></p></section>' +
            '<div class="pp-dos">' +
              '<div class="tarjeta pp-dato"><span class="circulo-icono verde" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 0 1 16 0M12 16l3-5"/></svg></span><small>Parte de tu sueldo</small><strong>' + (cargaV !== null ? formatoPorcentaje(cargaV, 1) : '—') + '</strong>' +
                (ev ? '<span class="carga-chip ' + ev.nivel + '">' + (ev.nivel === 'limite' ? 'Justo' : ev.nivel === 'no-aprueba' ? 'Alto' : 'Holgado') + '</span>' : '') + '</div>' +
              '<div class="tarjeta pp-dato"><span class="circulo-icono azul" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></span><small>Dividendo máximo</small><strong>' + ufDecimales(r.dividendo / SUPUESTOS.uf, 2) + '</strong><small>al mes' + SEP + 'hoy son ' + formatoPesos(r.dividendo) + '</small></div>' +
            '</div>' +
            '<p class="pp-vence">' + icono('i-pronto') + '<span><strong>La preaprobación vence.</strong> Su vigencia la confirma Bci. Conviene pedirla con tu pie casi listo.</span></p>'
          : '<div class="tarjeta protagonista aprobado no-alcanza">' +
              '<p class="estado-semaforo">' + icono('i-alerta') + 'Simulado</p><strong class="h3 aprobado-titulo">Este departamento supera lo que Bci te presta</strong>' +
            '</div>' +
        plegable('numeros-pre', 'Ver números', '',
          '<ul class="datos-inversion">' +
            '<li><span>Bci te presta hasta</span><strong>' + formatoRedondeado(ufAPesos(r.creditoUF)) + '</strong></li>' +
            '<li><span>Este departamento necesita</span><strong>' + formatoRedondeado(ufAPesos(creditoNecesario)) + '</strong></li>' +
            '<li><span>Pagarías hasta al mes</span><strong>' + formatoRedondeado(r.dividendo) + '</strong></li>' +
          '</ul>'));
      puedeSeguir = alcanza;
    }

    $('panel-compra').innerHTML =
      '<section aria-labelledby="titulo-resultado">' +
        cejaPreaprobacion() +
        '<h2 class="oculto-visual" id="titulo-resultado">Tu preaprobación</h2>' +
        partesPostula('Resultado') +
        cuerpo +
        (puedeSeguir
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque pp-seguir" id="btn-seguir-pie">Volver a tus pasos</button>' +
            '<p class="texto-centro"><a class="pp-link" href="#departamentos">Ver departamentos que te alcanzan ›</a></p>'
          : '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div>') +
        '<div class="acciones"><button type="button" class="enlace" id="btn-editar-datos">Editar mis datos</button></div>' +
      '</section>';

    iniciarPlegables();
    var seguir = $('btn-seguir-pie');
    if (seguir) {
      seguir.addEventListener('click', function () {
        conCarga(seguir, function () {
          guardarCompra(Object.assign({}, estado.compra, { paso: pasoTrasPostular(metaCompra(p), p) }));
          location.hash = '#pasos';
          anunciar('Preaprobación lista.');
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

  // Comentario 9-nov: desde 12 meses se lee en años y meses ("1 año y 2 meses").
  function textoMeses(n) {
    if (n < 12) return n === 1 ? '1 mes' : n + ' meses';
    var a = Math.floor(n / 12), m = n % 12;
    return (a === 1 ? '1 año' : a + ' años') + (m ? ' y ' + (m === 1 ? '1 mes' : m + ' meses') : '');
  }

  // Plazo de la recompra para mostrar: con el tope de 84 meses.
  function textoPlazo(pl) {
    if (pl.noAlcanza) return 'El arriendo no alcanza';
    if (pl.superaTope) return 'Mes 84: refinancias o vendes';
    return '≈ ' + textoMeses(pl.meses);
  }

  function renderTu5(p, d) {
    var meta = metaCompra(p);
    // Si ya se juntó todo (por ejemplo, al cambiar a un proyecto más barato), se pasa a la firma.
    var enGrupo = enGrupoDe(p);
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
        // S19-B4: cada hito se celebra una sola vez (solo los recién cruzados) y sin movimiento si se pidió reducirlo.
        confeti();
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
        (enGrupoDe(p) ? tuGrupoYObra(p) : '') +
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
          Math.round(e.pctCredito * 100) + ' % (' + formatoPesos(e.reparto.bci) + ') a 30 años, tasa de ejemplo ' + formatoPorcentaje(SUPUESTOS.tasaBci, 2) + ' ' + info('tasa-ejemplo') + ': ' + formatoPesos(e.dividendo) + ' al mes.')
      : '';
    var filasVivir = arrendar ? '' :
      '<p class="firma-fila"><span>Precio' + (e.conPiezas && e.conPiezas.iva ? ' sin IVA' : '') + '</span><strong>' + formatoPesos(e.precio) + '</strong></p>' +
      '<p class="firma-fila"><span>Bci te presta</span><strong>' + formatoPesos(e.reparto.bci) + '</strong></p>' +
      (e.subsidio ? '<p class="firma-fila"><span>Subsidio del Estado</span><strong>' + formatoPesos(e.subsidio) + '</strong></p>' : '') +
      '<p class="firma-fila"><span>Plazo</span><strong>30 años</strong></p>' +
      '<p class="firma-fila"><span>Tasa de ejemplo ' + info('tasa-ejemplo') + '</span><strong>' + formatoPorcentaje(SUPUESTOS.tasaBci, 2) + '</strong></p>' +
      '<p class="firma-fila suave"><span>Sin subsidio a la tasa</span><span>' + ufDecimales(e.dividendoSinSubsidio / SUPUESTOS.uf, 2) + SEP + 'hoy ' + formatoPesos(e.dividendoSinSubsidio) + '</span></p>';
    var segunda = arrendar && e.pctInversionistas === 0 ? ''
      : arrendar
      ? filaFirma('Participación de los inversionistas ' + ayuda('participacion'),
          '15 % (' + formatoPesos(e.reparto.inversionistas) + '). Sin cuota para ti: el arriendo les paga 6 % al año en UF y recompra su parte.') +
        filaFirma('Cuenta custodia Bci ' + ayuda('cuenta-custodia'),
          'Recibe el arriendo y paga a los inversionistas.')
      : filaFirma(e.conPiezas && e.conPiezas.respaldo ? 'Respaldo familiar · propuesta' : 'Garantía del Estado (FOGAES)',
          e.conPiezas && e.conPiezas.respaldo ? 'Un familiar deja una garantía en Bci.' : 'Departamentos nuevos de hasta UF 6.000. Bci te presta hasta el 90 %.');

    var hp = hitoActual(fotoPasos());
    var nota = arrendar ? '' : (e.conPiezas && e.conPiezas.respaldo
      ? '<p class="firma-nota"><strong>Respaldo familiar (propuesta):</strong> un familiar deja una garantía en Bci.</p>'
      : '<p class="firma-nota"><strong>Garantía del Estado (FOGAES):</strong> departamentos nuevos de hasta UF 6.000. Bci te presta hasta el 90' + NBSP + '%.</p>');
    var TRAMITES = [['Tasación del departamento', 'M4 20V9l8-5 8 5v11zM9 20v-6h6v6'], ['Seguros de desgravamen e incendio', 'M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z'],
      ['Escritura en la notaría', 'M4 20l3-1 11-11-2-2L5 17zM14 6l2 2'], ['Inscripción en el Conservador', 'M7 3h7l4 4v14H7zM14 3v4h4M10 13h5M10 17h5'], ['Entrega de llaves', 'M8 12a3.5 3.5 0 1 0 0 .01M11.5 12H21M18 12v3M21 12v2']];
    // S25: igual al canvas: la alegría arriba, el contrato serio, el día de la firma y firmar con la casilla.
    $('panel-compra').innerHTML =
      '<section class="firma-heroe"' + (recienLlegado ? ' role="status"' : '') + '>' +
        '<span class="firma-chip">Paso ' + pasoEscalera('es-tuyo').n + ' de ' + hp.total + SEP + pasoEscalera('es-tuyo').nombre + '</span>' +
        '<div class="firma-heroe-fila"><span><h2>¡Juntaste tu pie!</h2><span>Solo falta firmar. Revisa todo con calma.</span></span>' +
          '<svg aria-hidden="true" width="92" height="104" viewBox="0 0 92 104"><rect x="8" y="8" width="64" height="96" rx="4" fill="#1B3A63"/>' +
          '<rect x="16" y="18" width="12" height="10" rx="2" fill="#FFE300"/><rect x="34" y="18" width="12" height="10" rx="2" fill="#2E4F80"/><rect x="52" y="18" width="12" height="10" rx="2" fill="#FFE300"/>' +
          '<rect x="16" y="36" width="12" height="10" rx="2" fill="#2E4F80"/><rect x="34" y="36" width="30" height="22" rx="2" fill="#FFF499"/>' +
          '<circle cx="49" cy="45" r="4" fill="#90A4AE"/><path d="M42 58c0-5 3-8 7-8s7 3 7 8z" fill="#546E7A"/>' +
          '<rect x="16" y="54" width="12" height="10" rx="2" fill="#FFE300"/><rect x="16" y="72" width="12" height="10" rx="2" fill="#2E4F80"/><rect x="34" y="72" width="12" height="10" rx="2" fill="#FFE300"/><rect x="52" y="72" width="12" height="10" rx="2" fill="#FFE300"/>' +
          '<rect x="32" y="88" width="16" height="16" rx="2" fill="#2772CC"/></svg></div>' +
      '</section>' +
      '<section class="tarjeta firma-doc" aria-labelledby="titulo-firma">' +
        '<div class="firma-doc-cabeza"><span class="firma-doc-icono" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 2.5h8l4 4V21.5H6zM14 2.5v4h4M9 11h6M9 14.5h6M9 18h4"/></svg></span>' +
          '<span><h2 id="titulo-firma">Lo que firmas</h2><small>' + esc(p.nombre) + SEP + esc(p.comuna) + '</small></span></div>' +
        (arrendar ? '' : '<div class="firma-monto"><span>Pagas al mes</span><span><strong>' + ufDecimales(e.dividendo / SUPUESTOS.uf, 2) + '</strong><small>hoy son ' + formatoPesos(e.dividendo) + '</small></span></div>') +
        filasVivir +
        (arrendar ? '<ul class="lista-check">' + credito + segunda + '</ul>' : nota) +
      '</section>' +
      '<section class="tarjeta firma-dia" aria-labelledby="titulo-tramites">' +
        '<h2 id="titulo-tramites">El día de la firma</h2>' +
        '<ol>' + TRAMITES.map(function (t) {
          return '<li><span class="firma-dia-icono" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + t[1] + '"/></svg></span><span>' + t[0] + '</span></li>';
        }).join('') + '</ol>' +
      '</section>' +
      '<label class="firma-reviso"><input type="checkbox" id="firma-reviso"><span>Revisé los montos y entiendo lo que firmo</span></label>' +
      '<button type="button" class="btn btn-primario btn-lg btn-bloque btn-mantener" id="btn-firmar" aria-disabled="true" aria-describedby="firma-explica">' +
        '<span class="mantener-relleno" aria-hidden="true"></span><span class="mantener-texto">Marca la casilla para firmar</span></button>' +
      '<p class="firma-explica" id="firma-explica">Mantén apretado 2 segundos' + SEP + 'firma simulada</p>';

    // S14-F5: mantener presionado 1,5 s para firmar. Con teclado (o con movimiento reducido), un toque firma.
    var boton = $('btn-firmar');
    var espera = null;
    var presiono = false; // los clics de lectores de pantalla (VoiceOver, TalkBack) llegan sin pointerdown
    var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reviso = $('firma-reviso');
    reviso.addEventListener('change', function () {
      boton.setAttribute('aria-disabled', String(!reviso.checked));
      boton.querySelector('.mantener-texto').textContent = reviso.checked ? 'Mantén para firmar' : 'Marca la casilla para firmar';
    });
    function cancelar() { clearTimeout(espera); espera = null; boton.classList.remove('presionando'); }
    boton.addEventListener('pointerdown', function (ev) {
      presiono = true;
      if (!reviso.checked) { temblar(reviso.parentNode); return; }
      if (reducir || ev.button > 0) return;
      clearTimeout(espera);
      boton.classList.add('presionando');
      espera = setTimeout(function () { espera = null; boton.classList.remove('presionando'); firmar(); }, 2000);
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
      if (!reviso.checked) { temblar(reviso.parentNode); reviso.focus(); return; }
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
        '<section class="tarjeta md-pagaste"><p>Este mes pagaste</p>' +
          '<strong>' + formatoPesos(m.e.totalMes) + '</strong>' +
          '<p class="md-pagaste-detalle">Con seguros incluidos.' + (tiene ? ' Antes, de arriendo: ' + formatoPesos(antes) + ' (' + (dif === 0 ? 'lo mismo' : (dif > 0 ? '+' : '−') + formatoPesos(Math.abs(dif)) + ' al mes') + ')' : '') + '</p>' +
        '</section>' +
        (tiene ? '' : campoDinero('arriendo-antes', 'Lo que pagabas de arriendo', antes));
    }

    $('panel-compra').innerHTML =
      (recienFirmado || Date.now() < puertaHasta ? puertaEquipo() : '') +
      // S25: igual al canvas: la foto con "Es tuyo", lo que pagaste, tu patrimonio en azul y tu avance.
      '<header class="md-cabeza"><p class="md-marca"><img class="logo-bci" src="logo_bci_negro.svg" alt="Bci" width="52" height="24"><span class="figuras-bci" aria-hidden="true"></span></p>' +
        '<h2 class="md-titulo" id="titulo-departamento">' + (recienFirmado ? '<span class="llave-firma" aria-hidden="true">' + icono('i-llave', 'icono-grande') + '</span>' : '') + 'Mi departamento</h2>' +
        '<p class="texto-apoyo">' + esc(p.nombre) + SEP + 'Mes ' + m.mes + '</p></header>' +
      (fotoEdificio(p) ? '<figure class="md-foto"><img src="' + fotoEdificio(p) + '" alt="' + esc(p.nombre) + ' (foto referencial)" width="800" height="600"><figcaption>' + icono('i-llave') + 'Es tuyo</figcaption></figure>' : '') +
      cuerpo +
      loTuyo(m) +
      '<section class="tarjeta md-avance" aria-labelledby="titulo-deudas">' +
        '<h2 id="titulo-deudas">Tu avance</h2>' +
        (m.conInversionistas ? barraParticipacion(m) : '') +
        barraDeuda('Crédito Bci (30 años)', m.mes, SUPUESTOS.mesesBci, m.saldoBci, m.avanceBci) +
      '</section>' +
      '<p class="llega-sello">Calculado sin plusvalía</p>' +
      seccionArrepiento(m) +
      '<button type="button" class="btn md-otro-mes" id="btn-otro-mes">Simular otro mes</button>';
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
    var ep = pasoEscalera(HITO_DE_COMPRA[paso]);
    $('titulo-paso').textContent = ep ? 'Paso ' + ep.n + ' de ' + ep.total + ': ' + ep.nombre : CAMINO[paso];
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

  // ¿Hay una compra en grupo que le alcance? (en modo arrendar, solo las que pasan el filtro de rentabilidad)
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

  // S15-F3: frente al crédito base del modo (con garantía del Estado para vivir, al 80 % para invertir), en una línea.
  function lineaContraBase(id, n, base, nBase) {
    if (id === base) return '<p class="contra-base es-base">' + icono('i-banco') + CAMINOS[base].nombre + '</p>';
    var d = diferenciaConBase(id, n, nBase);
    var partes = [];
    if (d.enCuotas) partes.push('Pie en cuotas');
    if (d.descuento > 0.001) partes.push(formatoPorcentaje(d.descuento, 0) + ' más barato');
    if (d.mesesAntes > 0) partes.push('llegas ' + plural(d.mesesAntes, 'mes', 'meses') + ' antes');
    if (d.pieMenos > 0 && d.descuento <= 0.001) partes.push('pones ' + formatoPesos(d.pieMenos) + ' menos');
    if (!partes.length) return '';
    return '<p class="contra-base">' + icono('i-sube') + '<span><small>Frente al ' + primeraMinuscula(CAMINOS[base].nombre) + '</small>' + partes.join(SEP) + '</span></p>';
  }

  // S15-F7: Hoja de Simulación (tasa, dividendo con y sin seguros, CAE y costo total).
  function abrirSimulacion(id, boton) {
    var n = numerosCamino(id, listaMeta(), perfilActual());
    var c = CAMINOS[id];
    var s = simulacionCredito(n.precioUF, c.credito);
    var sin = simulacionCredito(n.precioUF, c.credito, SUPUESTOS.tasaPeorCaso);
    abrirHojaContenido('Simulación: ' + c.corto,
      '<p class="texto-apoyo">Departamento de ' + formatoUF(n.precioUF) + SEP + '30 años</p>' +
      '<ul class="datos-inversion">' +
        '<li><span>Crédito Bci</span><strong>' + formatoPesos(ufAPesos(s.creditoUF)) + '</strong></li>' +
        '<li><span>Tasa de ejemplo, con subsidio ' + info('tasa-ejemplo') + '</span><strong>' + formatoPorcentaje(s.tasa, 2) + '</strong></li>' +
        '<li><span>Dividendo sin seguros</span><strong>' + formatoPesos(s.dividendoSinSeguros) + '</strong></li>' +
        '<li><span>Dividendo con seguros</span><strong>' + formatoPesos(s.dividendoConSeguros) + '</strong></li>' +
        '<li><span>CAE ' + ayuda('simulacion') + '</span><strong>' + formatoPorcentaje(s.cae, 2) + '</strong></li>' +
        '<li><span>Costo total del crédito</span><strong>' + formatoPesos(s.costoTotal) + '</strong></li>' +
        '<li><span>Peor caso, sin subsidio: CAE</span><strong>' + formatoPorcentaje(sin.cae, 2) + '</strong></li>' +
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
          : '<button type="button" class="btn btn-primario btn-bloque" id="btn-recordarme" data-meses="1">Recordarme cada mes</button>') +
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

  // S21-B1: desde Explorar se llega a todos los departamentos.
  var VER_TODOS = '<p class="texto-centro"><a class="enlace" href="#departamentos">Ver todos los departamentos</a></p>';

  // ---------- S21-B3: Tus pasos, hitos y misiones ----------
  function proyectoCompra() { return estado.compra ? buscarProyecto(estado.compra.proyectoId) : null; }
  function esGrupo() {
    var p = proyectoCompra();
    if (p) return enGrupoDe(p);
    return !!(estado.caminoElegido && CAMINOS[estado.caminoElegido] && CAMINOS[estado.caminoElegido].grupo);
  }
  // Lo que hay que juntar: con compra, la de su departamento; sin compra, la del techo de su rango.
  function metaPie() {
    var p = proyectoCompra();
    if (p) return metaCompra(p);
    if (esArriendo()) return arriendoActual().a.meta;
    if (!estado.preguntasListas || !rangoActual()) return 0;
    if (estado.modo === 'vivir') return plazoVivir(estado.ahorroMensual || 300000).hasta.meta;
    var id = estado.caminoElegido || recomendarCamino(perfilActual()).id;
    return CAMINOS[id].ficha ? 0 : numerosCamino(id, listaMeta(), perfilActual()).alEscriturar;
  }
  // El DS1 aparece como misión si sirve para lo que busca (para vivir, precio y sueldo dentro del tramo).
  function ds1Mision() {
    if (estado.modo !== 'vivir' || !estado.preguntasListas || !rangoActual()) return null;
    var p = proyectoCompra();
    var precio = p ? deptoDeProyecto(p).listaUF : deptosRango({}).desde.listaUF;
    var r = ds1Para(precio, perfilPiezas());
    return r && r.montoUF ? { montoUF: r.montoUF } : null;
  }
  // La foto del estado que usan hitoActual, misiones y siguientePaso (js/calculos.js).
  function fotoPasos() {
    var ps = estado.pasos, c = estado.compra, meta = metaPie();
    var paso = c ? pasoEfectivo() : 0;
    var preaprobado = !!ps.preaprobado || !!(c && c.carga);
    return {
      grupo: !esArriendo() && esGrupo(), numeros: !!(estado.preguntasListas && rangoActual()),
      cuentaVivienda: !!ps.cuentaVivienda || estado.ahorroIniciado,
      ahorrado: ahorradoTuPie(meta), meta: meta,
      preaprobado: preaprobado, asegurado: !!(c && c.carga), esTuyo: paso === 4 || (esArriendo() && !!ps.arriendoTuyo),
      ds1: ds1Mision(), rsh: !!ps.rsh, ds1Postulado: !!ps.ds1Postulado, documentos: !!ps.documentos || preaprobado,
      bajoLlave: !!ps.bajoLlave, ahorroAutomatico: !!estado.cuotaAutomatica, equipo: estado.equipo.length > 0,
      eligio: !!c || (esArriendo() && !!estado.arriendoElegido), cuotaPendiente: false,
      // 9-nov: arriendo con opción de compra.
      arriendo: esArriendo(), entrada: esArriendo() ? arriendoActual().a.entrada : 0,
      contratoArriendo: !!ps.contratoArriendo
    };
  }
  function nombreCaminoActual() {
    var p = proyectoCompra();
    if (p) return enGrupoDe(p) ? CAMINOS['grupo-' + (estado.modo === 'vivir' ? 'vivir' : 'invertir')].corto : CAMINOS[estado.modo === 'vivir' ? 'individual-vivir' : 'individual-invertir'].corto;
    return estado.caminoElegido && CAMINOS[estado.caminoElegido] ? CAMINOS[estado.caminoElegido].corto : null;
  }
  function listosDe(h) { return h.hitos.filter(function (x) { return x.estado === 'hecho'; }).length; }
  // S24-B1: cada hito con su color Bci, como en el canvas.
  var COLORES_HITO = ['azul', 'verde', 'amarillo', 'rojo'];
  function filaHito(h, i) {
    var marca = h.estado === 'hecho' ? icono('i-check') : String(i + 1);
    var sub = h.estado === 'hecho' ? 'Listo' : (h.estado === 'actual' ? 'Ahora' + SEP + h.cuesta : '');
    return '<li class="hito ' + h.estado + ' color-' + COLORES_HITO[i % 4] + '"' + (h.estado === 'actual' ? ' aria-current="step"' : '') + '>' +
      '<button type="button" class="fila hito-fila" data-hito="' + h.id + '" aria-haspopup="dialog">' +
        '<span class="hito-marca" aria-hidden="true">' + marca + '</span>' +
        '<span><strong>' + h.nombre + '</strong>' + (sub ? '<small>' + sub + '</small>' : '') + '</span>' +
        '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg>' +
      '</button></li>';
  }
  function textoVence(f) {
    var d = diasEntre(hoyDemo(), f);
    if (d >= 0 && d <= 30) return d === 0 ? 'Vence hoy' : 'Vence en ' + d + (d === 1 ? ' día' : ' días');
    return 'Hasta el ' + formatoFecha(f).replace(/ de \d{4}$/, '');
  }
  function filaMision(x) {
    return '<li><button type="button" class="fila mision-fila' + (x.hecho ? ' hecha' : '') + '" data-mision="' + x.id + '" aria-haspopup="dialog">' +
      (x.hecho ? icono('i-check', 'icono-grande mision-check') : '') +
      '<span><strong>' + x.titulo + '</strong>' +
        (x.fecha && !x.hecho ? '<small' + (diasEntre(hoyDemo(), x.fecha) <= 30 ? ' class="vence"' : '') + '>' + textoVence(x.fecha) + '</small>' : '') + '</span>' +
      '<span class="chip">' + x.etiqueta + '</span></button></li>';
  }


  // ---------- 9-nov: tu departamento se construye con tu pie (Inicio y Tu pie) ----------
  // Como la casa del prototipo en Base44. PIEZAS_OBRA (calculos.js): cimientos, piso por piso
  // (estructura, 3 muros, 3 ventanas; la puerta en el primero) y el techo. La parte en obra crece con lo que llevas.
  var ANCHO_BAHIA = 116 / 3, ALTO_PISO = 80 / PISOS_OBRA;
  function piezaObra(i) {
    if (i === 0) return '<rect class="cn-gris" x="58" y="124" width="124" height="7" rx="1"/><path class="cn-linea-fina" d="M70 124v-4M90 124v-4M110 124v-4M130 124v-4M150 124v-4M170 124v-4"/>';
    if (i === PIEZAS_OBRA.length - 1) return '<path class="cn-techo" d="M56 44h128l-8-10H64z"/>';
    var f = Math.floor((i - 1) / 7), r = (i - 1) % 7;
    var abajo = 124 - f * ALTO_PISO, arriba = abajo - ALTO_PISO;
    if (r === 0) {
      var cols = [0, 1, 2, 3].map(function (k) { return 'M' + (62 + k * ANCHO_BAHIA).toFixed(1) + ' ' + abajo + 'V' + arriba; }).join('');
      return '<path class="cn-linea" d="' + cols + 'M60 ' + arriba + 'h120"/>';
    }
    var k = (r - 1) % 3, x = 62 + k * ANCHO_BAHIA;
    if (r <= 3) return '<rect class="cn-muro" x="' + x.toFixed(1) + '" y="' + arriba + '" width="' + ANCHO_BAHIA.toFixed(1) + '" height="' + ALTO_PISO + '"/>';
    if (f === 0 && k === 1) return '<rect class="cn-puerta" x="' + (x + 10.3).toFixed(1) + '" y="' + (arriba + 3) + '" width="18" height="' + (ALTO_PISO - 3) + '" rx="2"/>';
    return '<rect class="cn-ventana" x="' + (x + 11).toFixed(1) + '" y="' + (arriba + 4) + '" width="17" height="' + (ALTO_PISO - 8) + '" rx="2"/>';
  }
  function avanceObraDe(s) { return avanceObra(s.ahorrado, s.meta, s.cuentaVivienda); }
  var NOMBRE_PIEZA = { cimientos: 'los cimientos', estructura: 'la estructura', muros: 'los muros', ventanas: 'las ventanas', puerta: 'la puerta', techo: 'el techo' };
  function textoEtapaPie(o) { return o.etapa === 'terreno' ? 'Terreno listo' : o.etapa === 'listo' ? '¡Tu pie está listo!' : 'Construyendo ' + NOMBRE_PIEZA[o.etapa]; }
  function obraSvg(o) {
    var antes = estado.construido;
    var nuevaDesde = antes === null || antes > o.listas ? o.listas : antes;
    if (antes !== o.listas) { estado.construido = o.listas; guardarEstado(); }
    var terminado = o.etapa === 'listo';
    var grua = o.etapa !== 'terreno' && !terminado
      ? '<g class="cn-grua"><path d="M206 130V20M190 20h34M206 20l-10 8M196 20v14"/><rect x="192" y="34" width="8" height="6"/></g>' : '';
    var piezas = '';
    for (var i = 0; i < o.listas; i++)
      piezas += '<g class="cn-pieza' + (i >= nuevaDesde ? ' cn-nueva' : '') + '" style="--i:' + (i - nuevaDesde) + '">' + piezaObra(i) + '</g>';
    // La parte en obra: crece desde abajo con lo que llevas de ella (al menos un poco, para que se vea).
    if (o.parcial > 0 && o.listas < o.total)
      piezas += '<g class="cn-parcial" style="--f:' + Math.max(0.2, o.parcial).toFixed(2) + '">' + piezaObra(o.listas) + '</g>';
    // Pie listo: tu ventana se enciende, un árbol y la llave.
    var tuVentana = 1 + 2 * 7 + 5;
    var fin = terminado ? '<g class="cn-pieza">' + piezaObra(tuVentana).replace('cn-ventana', 'cn-luz') +
      '<circle class="cn-arbol" cx="200" cy="108" r="12"/><path class="cn-linea" d="M200 120v10"/>' +
      '<g class="cn-llave"><circle cx="34" cy="40" r="7"/><path d="M41 40h16M52 40v5M56 40v4"/></g></g>' : '';
    var terreno = '<path class="cn-suelo" d="M10 130h220"/>' +
      (o.etapa === 'terreno' ? '<path class="cn-contorno" d="M62 124V44h116v80M56 44h128l-8-10H64z"/><g class="cn-letrero"><path d="M200 130v-26"/><rect x="174" y="88" width="52" height="18" rx="3"/></g>' : '');
    return '<svg class="obra-svg" viewBox="22 12 202 122" aria-hidden="true">' + terreno + grua + piezas + fin + '</svg>';
  }

  function renderTusPasos() {
    var cont = $('pasos-contenido');
    var s = fotoPasos();
    var h = hitoActual(s);
    var ms = misiones(s, hoyDemo());
    var pendientes = ms.filter(function (x) { return !x.hecho; });
    var camino = nombreCaminoActual();
    var todaviaNo = estado.preguntasListas && rangoActual() && !estado.compra && (estado.modo === 'vivir' ? evaluarCabe().razon : recomendarCamino(perfilActual()).todaviaNo);
    // S25: como el canvas: la escalera en escalones de colores, el paso elegido y las misiones en tarjetas.
    var listos = listosDe(h);
    var celebra = listosVistos !== null && listos > listosVistos;
    listosVistos = listos;
    var actualI = h.terminado ? h.total - 1 : h.indice - 1;
    if (pasoElegido === null || pasoElegido >= h.total || celebra) pasoElegido = actualI;
    var sel = h.hitos[pasoElegido];
    var colorDe = function (x, i) { return x.estado === 'pendiente' ? 'claro-' + i : 'solido-' + i; };
    cont.innerHTML =
      '<header class="encabezado"><img class="logo-bci" src="logo_bci_negro.svg" alt="Bci" width="52" height="24">' +
        '<h1 id="titulo-pasos" class="h2">Tus pasos</h1>' +
        '<p class="texto-apoyo">' + (h.terminado ? 'Llegaste: es tuyo' : 'Vas en el paso ' + h.indice + ' de ' + h.total + SEP + h.nombre) + '</p></header>' +
      (todaviaNo ? '<p class="tarjeta compacta aviso-todavia">' + icono('i-pronto') + '<span><strong>Todavía no</strong> ' +
        '<a class="enlace" href="#explorar">Ver qué lo cambia</a></span></p>' + (estado.modo === 'vivir' ? metaMesHtml() : '') : '') +
      '<section aria-labelledby="titulo-hitos" class="tarjeta escalones-tarjeta">' +
        '<div class="escalones-cabeza"><h2 id="titulo-hitos">Tu escalera</h2><span>' + listos + ' de ' + h.total + ' listos</span></div>' +
        '<ol class="escalones" aria-label="Tus pasos">' + h.hitos.map(function (x, i) {
          return '<li class="' + x.estado + '">' +
            (x.estado === 'actual' ? '<svg class="escalon-av' + (celebra ? ' sube' : '') + '" width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><circle cx="15" cy="9" r="7" fill="#E8BFA0"/><path d="M8 6a7 7 0 0 1 14 0c-3-2-9-2-14 0z" fill="#37474F"/><path d="M4 40c0-10 5-17 11-17s11 7 11 17z" fill="#28892B"/></svg>' : '') +
            (i === h.total - 1 && x.estado !== 'actual' ? '<svg width="26" height="36" viewBox="0 0 26 36" aria-hidden="true"><rect x="3" y="2" width="20" height="34" rx="2" fill="#2772CC"/><rect x="6" y="5" width="14" height="13" rx="1" fill="#D4E3F5"/><circle cx="18" cy="24" r="1.6" fill="#FFE300"/></svg>' : '') +
            '<button type="button" class="escalon ' + colorDe(x, i) + '" data-paso="' + i + '" aria-pressed="' + (i === pasoElegido) + '" style="height:' + (44 + i * 16) + 'px" aria-label="Paso ' + (i + 1) + ': ' + x.nombre + ', ' + (x.estado === 'hecho' ? 'listo' : x.estado === 'actual' ? 'ahora, ' + x.cuesta : 'después') + '">' + (x.estado === 'hecho' ? '✓' : i + 1) + '</button>' +
            '<span class="escalon-nombre">' + (CORTO_HITO[x.id] || x.nombre) + '</span></li>';
        }).join('') + '</ol>' +
        '<div class="escalones-barra" aria-hidden="true">' + h.hitos.map(function (x) { return '<i class="' + x.estado + '"></i>'; }).join('') + '</div>' +
      '</section>' +
      (celebra ? '<div class="escalon-celebra" role="status"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#FFFFFF"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#28652B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<span>¡Subiste un escalón!<small>Sigue así, ya vas en el paso ' + h.indice + '.</small></span></div>' : '') +
      '<article class="tarjeta paso-elegido" aria-live="polite">' +
        '<div class="paso-elegido-cabeza"><span class="paso-elegido-num ' + colorDe(sel, pasoElegido) + '" aria-hidden="true">' + (pasoElegido + 1) + '</span>' +
          '<span><span class="paso-elegido-ceja' + (sel.estado === 'pendiente' ? ' despues' : '') + '">Paso ' + (pasoElegido + 1) + ' de ' + h.total + SEP + (sel.estado === 'hecho' ? 'Listo' : sel.estado === 'actual' ? 'Ahora' : 'Después') + '</span>' +
          '<h3>' + sel.nombre + '</h3></span></div>' +
        '<div class="paso-elegido-cuerpo"><span class="paso-elegido-tiempo"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#546E7A" stroke-width="2.4"/><path d="M12 7v5l3 2" fill="none" stroke="#546E7A" stroke-width="2.4" stroke-linecap="round"/></svg>' + sel.cuesta + '</span>' +
          '<p>' + textoHito(sel.id, s.grupo) + '</p>' +
          (sel.estado === 'actual' ? '<button type="button" class="btn btn-primario btn-bloque" data-hito="' + sel.id + '" aria-haspopup="dialog">Empezar</button>'
            : sel.estado === 'hecho' ? '<p class="paso-elegido-hecho"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#28892B"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Ya lo hiciste</p>'
            : '<p class="paso-elegido-despues">Se abre cuando termines el paso ' + h.indice + '.</p>') +
        '</div></article>' +
      '<section aria-labelledby="titulo-misiones" class="misiones-canvas">' +
        '<div class="misiones-cabeza"><h2 class="h3" id="titulo-misiones">Misiones</h2><button type="button" class="enlace" id="btn-todas-misiones" aria-haspopup="dialog">Ver todas ›</button></div>' +
        (pendientes.length ? '<ul class="misiones-tarjetas">' + pendientes.slice(0, 3).map(function (x, k) { return tarjetaMision(x, k); }).join('') + '</ul>'
          : '<p class="tarjeta compacta">Hiciste todas tus misiones.</p>') +
        '<p class="misiones-nota">En "Ver todas" están las fechas que importan.</p>' +
      '</section>';
    cont.querySelectorAll('[data-paso]').forEach(function (b) {
      b.addEventListener('click', function () { pasoElegido = Number(b.dataset.paso); renderTusPasos(); cont.querySelector('[data-paso="' + pasoElegido + '"]').focus(); });
    });
    cont.querySelectorAll('[data-hito]').forEach(function (b) {
      b.addEventListener('click', function () { abrirHito(b.dataset.hito, b); });
    });
    cont.querySelectorAll('[data-mision]').forEach(function (b) {
      b.addEventListener('click', function () { abrirMision(b.dataset.mision, b); });
    });
    $('btn-todas-misiones').addEventListener('click', function () { abrirTodasMisiones($('btn-todas-misiones')); });
    if (celebra) confeti();
    if ($('btn-meta-rango')) $('btn-meta-rango').addEventListener('click', function () { abrirCambiarRango($('btn-meta-rango')); });
  }
  var pasoElegido = null, listosVistos = null;
  var CORTO_HITO = { numeros: 'Números', cuenta: 'Cuenta', pie: 'Pie', preaprobacion: 'Crédito', asegurar: 'Reserva', aprobacion: 'Final', 'es-tuyo': 'Es tuyo', entrada: 'Entrada', contrato: 'Te mudas' };
  var TEXTO_HITO = {
    numeros: 'Con tus sueldos y tu ahorro calculamos cuándo llegas.',
    cuenta: 'Una cuenta de ahorro para la vivienda en Bci, en UF. Todo tu pie pasa por ella.',
    pie: 'Lo juntas cada mes en tu cuenta de vivienda.',
    preaprobacion: 'Bci revisa tus sueldos y te dice cuánto te presta.',
    asegurar: 'Eliges tu departamento, lo reservas y firmas la promesa.',
    aprobacion: 'Bci revisa todo y confirma tu crédito.',
    'es-tuyo': 'Tasación, seguros, escritura y llaves, en un solo momento.',
    entrada: 'Juntas el 5' + NBSP + '% en tu cuenta de vivienda para entrar.',
    contrato: 'Firmas el contrato con el precio fijo en UF y te mudas.'
  };
  var TEXTO_HITO_ARRIENDO = {
    pie: 'Cada mes, el aporte de tu mensualidad va a tu pie.',
    preaprobacion: 'Desde el tercer año, Bci revisa tus sueldos y te presta el 80' + NBSP + '%.',
    'es-tuyo': 'Le compras el departamento al socio y pasa a tu nombre.'
  };
  var TEXTO_HITO_GRUPO = {
    preaprobacion: 'Bci revisa tus sueldos y aseguras tu cupo en el grupo.',
    pie: 'Lo pagas en cuotas mientras se construye el edificio.'
  };
  function textoHito(id, grupo) { return (esArriendo() && TEXTO_HITO_ARRIENDO[id]) || (grupo && TEXTO_HITO_GRUPO[id]) || TEXTO_HITO[id] || ''; }
  // Las misiones como en el canvas: círculo de color con ícono, título, fecha en rojo y chip azul.
  var ICONOS_MISION = [
    ['rojo', 'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4'],
    ['azul', 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'],
    ['verde', 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4']
  ];
  function tarjetaMision(x, k) {
    var ic = x.fecha ? ICONOS_MISION[0] : ICONOS_MISION[1 + (k % 2)];
    return '<li><button type="button" class="mision-tarjeta" data-mision="' + x.id + '" aria-haspopup="dialog">' +
      '<span class="mision-circulo ' + ic[0] + '" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24"><path d="' + ic[1] + '"/></svg></span>' +
      '<span class="mision-texto"><strong>' + x.titulo + '</strong>' + (x.fecha ? '<small>' + textoVence(x.fecha) + (/^Vence/.test(textoVence(x.fecha)) ? SEP + fechaCorta(x.fecha) : '') + '</small>' : '') + '</span>' +
      '<span class="mision-chip">' + x.etiqueta + '</span></button></li>';
  }

  // Marca un hito o misión como hecho (simulado), avisa y vuelve a dibujar donde esté.
  function marcarPaso(clave, mensaje) {
    estado.pasos[clave] = true;
    guardarEstado();
    cerrarHoja(false);
    toast(mensaje);
    mostrar();
  }
  function botonEnHoja(id, texto) { return '<button type="button" class="btn btn-primario btn-bloque" id="' + id + '">' + texto + '</button>'; }
  function enlaceHoja(href, texto) { return '<a class="btn btn-primario btn-bloque" href="' + href + '">' + texto + '</a>'; }
  function rutaTuPie() { return '#pie'; }

  function abrirHito(id, boton) {
    var s = fotoPasos();
    var h = hitoActual(s).hitos.filter(function (x) { return x.id === id; })[0];
    var hecho = h.estado === 'hecho';
    var c = estado.compra;
    var texto = '', accion = '';
    var ar = s.arriendo ? arriendoActual() : null;
    if (ar && (id === 'entrada' || id === 'contrato' || id === 'preaprobacion' || id === 'es-tuyo')) {
      // 9-nov: los hitos del arriendo con opción de compra.
      var aa = ar.a, uu = ar.u;
      if (id === 'entrada') {
        texto = 'Para entrar necesitas ' + formatoRedondeado(aa.entrada) + ' (el 5' + NBSP + '%) en tu cuenta de vivienda.';
        accion = hecho ? '' : (!s.cuentaVivienda ? botonEnHoja('btn-hito-accion', 'Abrir mi cuenta') : enlaceHoja('#pie', 'Ver tu pie'));
      } else if (id === 'contrato') {
        texto = 'Firmas con el socio un contrato de hasta 5 años, con el precio fijo en ' + formatoUF(uu.listaUF) + ', y te mudas a ' + esc(uu.nombre) + '.';
        accion = hecho ? '' : (!ar.elegido ? enlaceHoja('#explorar/arriendo-opcion', 'Elegir departamento') : botonEnHoja('btn-hito-accion', 'Firmar y mudarme'));
      } else if (id === 'preaprobacion') {
        texto = 'Desde el tercer año y con tu pie listo, Bci revisa tus sueldos y te presta el 80' + NBSP + '% (sin subsidio a la tasa).';
        accion = hecho ? '' : botonEnHoja('btn-hito-accion', 'Pedir mi preaprobación');
      } else {
        texto = 'Le compras el departamento al socio al precio fijo. Firmas la escritura y pasa a tu nombre.';
        accion = hecho ? '' : botonEnHoja('btn-hito-accion', 'Firmar la escritura');
      }
    } else if (id === 'numeros') {
      texto = 'Con tus sueldos y tu ahorro calculamos cuándo llegas.';
      accion = hecho ? botonEnHoja('btn-hito-accion', 'Cambiar mis números') : enlaceHoja('#camino', 'Contar mis números');
    } else if (id === 'cuenta') {
      texto = 'Una cuenta de ahorro para la vivienda en Bci, en UF. Todo tu pie pasa por ella y el DS1 la pide.';
      accion = hecho ? '' : botonEnHoja('btn-hito-accion', 'Abrir mi cuenta');
    } else if (id === 'pie') {
      texto = s.grupo ? 'Pagas tu pie en cuotas durante la obra, en una cuenta bloqueada a tu nombre.' : 'Lo juntas cada mes en tu cuenta de vivienda.';
      var pc = proyectoCompra();
      if (pc && pc.tipo === 'conjunto') texto += '</p>' + obraVisual(pc) + '<p class="texto-apoyo">';
      accion = enlaceHoja(rutaTuPie(), 'Ver tu pie');
    } else if (id === 'preaprobacion') {
      var pr = preaprobacion(estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);
      texto = (s.grupo ? 'Bci revisa tus sueldos y aseguras tu cupo en el grupo.' : 'Bci revisa tus sueldos. Pídela con tu pie casi listo: la preaprobación vence.') +
        (pr && pr.cumple ? '</p><p class="texto-apoyo">Bci te podría prestar hasta <strong>' + formatoRedondeado(ufAPesos(pr.creditoUF)) + '</strong>' + SEP + 'simulado' : '');
      accion = hecho ? '' : (c && !c.carga ? enlaceHoja('#camino/' + rutaPasoActual(), 'Ir a postular') : botonEnHoja('btn-hito-accion', 'Pedir mi preaprobación'));
    } else if (id === 'asegurar' || id === 'aprobacion') {
      texto = id === 'asegurar' ? 'Eliges tu departamento, lo reservas y firmas la promesa.' : 'Bci confirma tu crédito con la tasación del departamento.';
      accion = hecho ? '' : (c ? enlaceHoja('#camino/' + rutaPasoActual(), 'Seguir mi compra')
        : (estado.caminoElegido ? enlaceHoja('#camino/elegir', 'Elegir departamento') : enlaceHoja('#explorar', 'Explorar caminos')));
    } else {
      texto = 'Tasación, seguros, escritura, inscripción y llaves: todo en un solo momento.';
      accion = c && pasoEfectivo() >= 3 ? enlaceHoja('#camino/' + rutaPasoActual(), hecho ? 'Ver mi departamento' : 'Preparar mi firma') : '';
    }
    abrirHojaContenido(h.nombre + (hecho ? ' ' + icono('i-check', 'hoja-check') : ''),
      '<p class="texto-apoyo">' + texto + '</p>' +
      (!hecho && h.estado === 'pendiente' ? '<p class="texto-apoyo"><small>Va después de ' + hitoActual(s).nombre.toLowerCase() + '.</small></p>' : '') +
      (accion ? '<div class="acciones">' + accion + '</div>' : ''), boton, function () {
        var b = $('btn-hito-accion');
        if (!b) return;
        b.addEventListener('click', function () {
          if (id === 'numeros') { cerrarHoja(false); abrirMisDatos(boton); }
          else if (id === 'cuenta' || id === 'entrada') marcarPaso('cuentaVivienda', 'Abriste tu cuenta de vivienda (simulado).');
          else if (id === 'contrato') {
            if (!hitoHecho('entrada', s)) { toast('Primero: junta el 5 % para entrar.'); return; }
            estado.mesContrato = estado.mesAhorro || 0;
            marcarPaso('contratoArriendo', 'Firmaste y te mudaste (simulado).');
          } else if (id === 'es-tuyo' && s.arriendo) {
            if (!s.preaprobado) { toast('Primero: tu preaprobación.'); return; }
            marcarPaso('arriendoTuyo', '¡Es tuyo! (simulado)');
          }
          else if (id === 'preaprobacion') {
            if (!s.documentos) { toast('Primero: completa tus datos y documentos.'); return; }
            if (s.arriendo && !hitoHecho('pie', s)) { toast('Primero: junta tu pie.'); return; }
            if (s.arriendo && (estado.mesAhorro || 0) - (estado.mesContrato || 0) < ARRIENDO_OPCION.compraDesdeMes) { toast('Puedes comprar desde el tercer año de contrato.'); return; }
            marcarPaso('preaprobado', 'Bci te preaprobó (simulado).');
          }
        });
      });
  }


  // ---------- S21-B5: Tu pie y su protección ----------
  function selloProteccion(s) {
    var p = proyectoCompra();
    var capas = capasProteccion({ grupo: s.grupo, cuentaVivienda: s.cuentaVivienda, bajoLlave: s.bajoLlave,
      enVerde: !!(p && s.asegurado && deptoDeProyecto(p).enObra) });
    return '<section class="tarjeta bloque sello-capas" aria-labelledby="titulo-protegido">' +
      '<h2 class="h4" id="titulo-protegido">' + icono('i-escudo') + 'Tu pie está protegido</h2>' +
      '<ul class="capas">' + capas.map(function (c) {
        return '<li class="capa' + (c.activa ? ' activa' : '') + '">' + icono(c.activa ? 'i-check' : 'i-candado', 'capa-icono') +
          '<span><strong>' + c.titulo + (c.propuesta ? '<span class="chip-propuesta-mini">Propuesta</span>' : '') + '</strong>' +
          '<small>' + (c.activa ? c.de : 'Actívalo abajo, en Tu cuota') + '</small></span></li>';
      }).join('') + '</ul></section>';
  }
  function movimientosPie() {
    var h = estado.historialMeses || [];
    if (!h.length && !estado.regalos.length) return '<p class="texto-apoyo">Todavía no hay movimientos.</p>';
    var n = h.length;
    var regalos = estado.regalos.map(function (x) {
      return '<li><div class="fila"><span><strong>Regalo de tu ' + esc(x.relacion) + '</strong></span><strong class="numero">+' + formatoPesos(x.monto) + '</strong></div></li>';
    }).reverse().join('');
    return '<ul class="filas">' + regalos + h.map(function (r, k) {
      var mes = fechaMasMeses(FECHA_REFERENCIA, estado.mesAhorro - (n - k));
      var nombre = MESES[Number(mes.split('-')[1]) - 1];
      var texto = r === 'pago' ? 'Cuota de ' + nombre : (r === 'protector' ? nombre + ': usaste tu protector' : nombre + ': no pagaste');
      return '<li><div class="fila"><span><strong>' + primeraMayuscula(texto) + '</strong></span>' +
        (r === 'pago' ? '<strong class="numero">+' + formatoPesos(estado.ahorroMensual) + '</strong>' : '') + '</div></li>';
    }).reverse().join('') + '</ul>';
  }
  // 9-nov: con el arriendo con opción firmado, la cuota de Tu pie es el aporte de la mensualidad.
  function cuotaMes() { return esArriendo() && estado.pasos.contratoArriendo ? arriendoActual().a.aporte : estado.ahorroMensual; }
  function renderTuPie() {
    var cont = $('pie-contenido');
    var s = fotoPasos();
    var meta = s.meta;
    var cabeza = '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Inicio</a>' +
      '<header class="encabezado"><h1 id="titulo-tu-pie" class="h2">Tu pie</h1></header>';
    if (!s.numeros) {
      cont.innerHTML = cabeza + '<p class="texto-apoyo">Primero, tus números.</p>' +
        '<div class="accion"><a class="btn btn-primario btn-lg btn-bloque" href="#camino">Contar mis números</a></div>';
      return;
    }
    if (!s.cuentaVivienda) {
      cont.innerHTML = cabeza +
        '<section class="tarjeta bloque obra-invita"><div class="obra-claro">' + obraSvg(avanceObra(0, 0, false)) + '</div>' +
          '<h2 class="h4">Comienza a construir tu pie para tu departamento</h2>' +
          '<p class="texto-apoyo">Tu pie vive en una cuenta de vivienda Bci, en UF. Cada cuota suma una parte.</p></section>' +
        selloProteccion(s) +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-abrir-cuenta">Abrir mi cuenta</button></div>';
      $('btn-abrir-cuenta').addEventListener('click', function () { marcarPaso('cuentaVivienda', 'Abriste tu cuenta de vivienda (simulado).'); });
      return;
    }
    var listo = meta > 0 && s.ahorrado >= meta;
    var pctPie = porcentajeEntero(avance(s.ahorrado, meta));
    var faltaM = '$' + (Math.max(0, meta - s.ahorrado) / 1e6).toFixed(1).replace('.', ',') + ' millones';
    var racha = estado.racha || 0;
    // S25: igual al canvas: el lápiz abre Tu cuota, Movimientos va en el azul y la cuota del mes flota.
    cont.innerHTML =
      '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Inicio</a>' +
      '<header class="encabezado pie-cabeza"><h1 id="titulo-tu-pie" class="h2">Tu pie</h1>' +
        '<button type="button" class="pie-lapiz" id="btn-pie-cuota" aria-haspopup="dialog" aria-label="Tu cuota y cómo ahorras"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button>' +
        '<p class="texto-apoyo">' + (s.grupo ? 'Cuenta bloqueada de tu grupo' : 'Cuenta Vivienda Bci') + SEP + 'en UF</p></header>' +
      '<section class="saldo-pie pie-heroe" aria-labelledby="titulo-saldo">' +
        '<div class="pie-heroe-arriba"><p class="etiqueta" id="titulo-saldo">Llevas</p>' +
          '<button type="button" class="pie-movimientos" id="btn-movimientos" aria-haspopup="dialog">Movimientos</button></div>' +
        '<div class="pie-heroe-fila"><div><strong class="numero">' + formatoPesos(s.ahorrado) + '</strong>' +
          (meta > s.ahorrado ? '<p>Te faltan ' + faltaM + ' para tu pie</p>' : '<p>¡Juntaste tu pie!</p>') + '</div>' +
          '</div>' +
        '<div class="pie-barra" aria-hidden="true"><span style="width:' + Math.max(1, pctPie) + '%"></span>' + [25, 50, 75].map(function (m) {
          return '<i style="left:' + m + '%"' + (pctPie >= m ? ' class="pasada"' : '') + '></i>'; }).join('') + '</div>' +
        '<p class="pie-barra-texto"><span>' + pctPie + NBSP + '% de ' + formatoRedondeado(meta) + '</span><span>100' + NBSP + '%</span></p>' +
        '<div class="obra-pie"><div class="obra-claro">' + obraSvg(avanceObraDe(s)) + '</div><p class="obra-etapa">' + textoEtapaPie(avanceObraDe(s)) + '</p></div>' +
        (estado.ahorroIniciado ? '<span class="pie-racha"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>' +
          (racha > 0 ? plural(racha, 'mes seguido', 'meses seguidos') : 'Tu racha empieza este mes') + '</span>' : '') +
      '</section>' +
      '<section class="tarjeta pie-cuota-mes" aria-labelledby="titulo-cuota-mes">' +
        '<p class="pie-cuota-fila"><span id="titulo-cuota-mes">Cuota de ' + MESES[Number(hoyDemo().split('-')[1]) - 1] + '</span><strong class="numero">' + formatoRedondeado(cuotaMes() || 0) + '</strong></p>' +
        (listo
          ? '<a class="btn btn-primario btn-lg btn-bloque" href="#pasos">Ver tu siguiente hito</a>'
          : pieLogro
            ? '<div class="pie-listo" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#28892B"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '<span><strong>¡Listo! Sumaste ' + formatoRedondeado(cuotaMes() || 0) + '</strong><small>' + pieLogro + '</small></span></div>' +
              '<button type="button" class="enlace pie-otro-mes" id="btn-otro-mes">Simular el mes siguiente</button>'
            : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-pagar-cuota">Pagar mi cuota</button>') +
      '</section>' +
      '<button type="button" class="tarjeta fila fila-regalo" id="btn-pedir-regalo" aria-haspopup="dialog"><span class="regalo-circulo" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="1" fill="none" stroke="#B20913" stroke-width="2"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="#B20913" stroke-width="2" stroke-linejoin="round"/></svg></span>' +
        '<span><strong>Regalo para tu pie</strong><small>Comparte un enlace con tu familia</small><span class="regalo-compartir">Compartir ›</span></span></button>' +
      '<section class="tarjeta pie-protegido" aria-labelledby="titulo-protegido"><h2 id="titulo-protegido">Tu pie está protegido</h2>' +
        '<div><i class="f-rojo" aria-hidden="true"></i><span><strong>Separado y bajo llave</strong><small>Avisas 30 días antes de sacar</small></span></div>' +
        '<div><i class="f-verde" aria-hidden="true"></i><span><strong>En UF</strong><small>No lo come la inflación</small></span></div>' +
        '<div><i class="f-azul" aria-hidden="true"></i><span><strong>Un mes malo</strong><small>Lo ahorrado no se pierde</small></span></div>' +
      '</section>';
    $('btn-pedir-regalo').addEventListener('click', function () { abrirPedirRegalo($('btn-pedir-regalo')); });
    $('btn-movimientos').addEventListener('click', function () {
      abrirHojaContenido('Movimientos', movimientosPie(), $('btn-movimientos'));
    });
    var pagar = function (pago) {
      if (!estado.ahorroIniciado) { estado.ahorrado = Math.min(meta, estado.ahorroActual || 0); estado.ahorroIniciado = true; }
      var antes = hitosAlcanzados(estado.ahorrado, meta);
      if (pago) estado.ahorrado = sumarMes(estado.ahorrado, cuotaMes(), meta);
      var r = registrarMes({ mes: estado.mesAhorro, racha: estado.racha, ultimoProtector: estado.ultimoProtector }, pago);
      estado.mesAhorro = r.mes; estado.racha = r.racha; estado.ultimoProtector = r.ultimoProtector;
      estado.historialMeses = (estado.historialMeses || []).concat([r.resultado]).slice(-6);
      guardarEstado();
      var nuevos = hitosAlcanzados(estado.ahorrado, meta).filter(function (h) { return antes.indexOf(h) === -1; });
      if (pago) pieLogro = nuevos.length ? '¡Pasaste el ' + porcentajeEntero(nuevos[nuevos.length - 1]) + NBSP + '% de tu pie!' : 'Llevas ' + plural(estado.racha, 'mes seguido', 'meses seguidos');
      // 9-nov: la pantalla se queda donde estaba (antes bajaba al enfocar "Simular el mes siguiente").
      var y = window.scrollY;
      cerrarHoja(false);
      renderTuPie();
      window.scrollTo(0, y);
      if (!pago) toast(r.resultado === 'protector' ? 'Usaste tu protector: tu racha sigue.' : 'Tu racha vuelve a empezar. Lo ahorrado sigue ahí.');
      else if (nuevos.length) { confeti(); if (navigator.vibrate) navigator.vibrate(40); }
      if ($('btn-otro-mes')) $('btn-otro-mes').focus({ preventScroll: true });
    };
    if ($('btn-pagar-cuota')) $('btn-pagar-cuota').addEventListener('click', function () {
      if (!(cuotaMes() > 0)) { abrirMisDatos($('btn-pagar-cuota')); return; }
      pagar(true);
    });
    if ($('btn-otro-mes')) $('btn-otro-mes').addEventListener('click', function () {
      var y = window.scrollY;
      pieLogro = null; renderTuPie(); window.scrollTo(0, y);
      if ($('btn-pagar-cuota')) $('btn-pagar-cuota').focus({ preventScroll: true });
    });
    var hojaCuota = function () {
      abrirHojaContenido('Tu cuota', '<p class="texto-apoyo">' + formatoRedondeado(cuotaMes() || 0) + ' al mes</p>' +
        '<button type="button" class="interruptor interruptor-cuota" role="switch" aria-checked="' + !!estado.cuotaAutomatica + '" id="btn-pie-auto">' +
          '<span>' + icono('i-calendario') + 'Ahorro automático el día de pago</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>' +
        '<button type="button" class="interruptor interruptor-cuota" role="switch" aria-checked="' + !!estado.pasos.bajoLlave + '" id="btn-pie-llave">' +
          '<span>' + icono('i-candado') + 'Guardar bajo llave</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>' +
        (listo ? '' : '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-pie-no-pude">' + (estado.cuotaAutomatica ? 'Pausar este mes' : 'Este mes no pude') + '</button>'),
        $('btn-pie-cuota'), function () {
          $('btn-pie-auto').addEventListener('click', function () {
            estado.cuotaAutomatica = !estado.cuotaAutomatica; guardarEstado();
            $('btn-pie-auto').setAttribute('aria-checked', String(!!estado.cuotaAutomatica));
            if ($('btn-pie-no-pude')) $('btn-pie-no-pude').textContent = estado.cuotaAutomatica ? 'Pausar este mes' : 'Este mes no pude';
            toast(estado.cuotaAutomatica ? 'Ahorro automático activo (simulado).' : 'Pagas tu cuota a mano.');
          });
          $('btn-pie-llave').addEventListener('click', function () {
            estado.pasos.bajoLlave = !estado.pasos.bajoLlave; guardarEstado();
            $('btn-pie-llave').setAttribute('aria-checked', String(!!estado.pasos.bajoLlave));
            toast(estado.pasos.bajoLlave ? 'Tu pie quedó bajo llave (simulado).' : 'Tu pie ya no está bajo llave.');
          });
          if ($('btn-pie-no-pude')) $('btn-pie-no-pude').addEventListener('click', function () { pagar(false); });
        });
    };
    $('btn-pie-cuota').addEventListener('click', hojaCuota);
  }
  var pieLogro = null;

  var MISIONES_TEXTO = {
    ds1: ['Subsidio del Estado para tu primera vivienda. Se postula en línea en el Minvu.', 'Ya postulé'],
    rsh: ['Lo pide el DS1. Te inscribes en línea con tu ClaveÚnica.', 'Ya me inscribí'],
    documentos: ['Liquidaciones de sueldo, cotizaciones y carnet. Si eres cliente Bci, ya los tenemos.', 'Completar'],
    'bajo-llave': ['Para sacar plata de tu pie avisas 30 días antes. Así no se gasta.', 'Guardar bajo llave'],
    'ahorro-auto': ['Bci pasa tu cuota a tu cuenta de vivienda el día de pago.', 'Activar'],
    equipo: ['Suma a tu pareja o familia para que te acompañen.', null],
    elegir: ['Mira tus caminos y elige un departamento.', null]
  };
  var MISION_CLAVE = { ds1: 'ds1Postulado', rsh: 'rsh', documentos: 'documentos', 'bajo-llave': 'bajoLlave' };
  var MISION_LISTA = { ds1: 'Postulaste al DS1 (simulado).', rsh: 'Te inscribiste en el Registro Social (simulado).',
    documentos: 'Tus documentos están listos (simulado).', 'bajo-llave': 'Tu pie quedó bajo llave (simulado).' };

  function abrirMision(id, boton) {
    var s = fotoPasos();
    var x = misiones(s, hoyDemo()).filter(function (m) { return m.id === id; })[0];
    var t = MISIONES_TEXTO[id];
    var falta = id === 'ds1' && !x.hecho ? (!s.cuentaVivienda ? 'tu cuenta de vivienda' : (!s.rsh ? 'el Registro Social de Hogares' : null)) : null;
    var accion = x.hecho ? '' :
      id === 'equipo' ? enlaceHoja('#perfil', 'Ir a Tu equipo') :
      id === 'elegir' ? enlaceHoja(esArriendo() ? '#explorar/arriendo-opcion' : estado.caminoElegido ? '#camino/elegir' : '#explorar', estado.caminoElegido ? 'Elegir departamento' : 'Explorar caminos') :
      botonEnHoja('btn-mision-accion', t[1]);
    abrirHojaContenido(x.titulo + (x.hecho ? ' ' + icono('i-check', 'hoja-check') : ''),
      '<p><span class="chip">' + x.etiqueta + '</span>' + (x.fecha ? ' <small class="texto-apoyo">Hasta el ' + formatoFecha(x.fecha) + '</small>' : '') + '</p>' +
      '<p class="texto-apoyo">' + t[0] + '</p>' +
      (falta ? '<p class="texto-apoyo">' + icono('i-alerta') + ' Primero: ' + falta + '.</p>' : '') +
      (accion ? '<div class="acciones">' + accion + '</div>' : ''), boton, function () {
        var b = $('btn-mision-accion');
        if (!b) return;
        if (falta) b.disabled = true;
        b.addEventListener('click', function () {
          if (id === 'ahorro-auto') {
            estado.cuotaAutomatica = true; guardarEstado(); cerrarHoja(false);
            toast('Ahorro automático activo (simulado).'); mostrar(); return;
          }
          marcarPaso(MISION_CLAVE[id], MISION_LISTA[id]);
        });
      });
  }

  function abrirTodasMisiones(boton) {
    var s = fotoPasos();
    var hoy = hoyDemo();
    var ms = misiones(s, hoy);
    var fechas = FECHAS_IMPORTAN.filter(function (f) { return diasHastaFecha(f.fecha, hoy) >= 0 && (f.id !== 'ds1' || s.ds1); });
    abrirHojaContenido('Todas tus misiones',
      '<ul class="filas">' + ms.map(filaMision).join('') + '</ul>' +
      '<h3 class="h4 bloque-chico">Fechas que importan</h3>' +
      '<ul class="filas">' + fechas.map(function (f) {
        return '<li><div class="fila">' + icono('i-calendario', 'icono-grande') + '<span><strong>' + formatoFecha(f.fecha) + '</strong><small>' + f.texto + '</small></span></div></li>';
      }).join('') + '</ul>', boton, function (hoja) {
        hoja.querySelectorAll('[data-mision]').forEach(function (b) {
          b.addEventListener('click', function () { abrirMision(b.dataset.mision, boton); });
        });
      });
  }


  // ---------- S21-B4: Explorar, caminos primero ----------
  var LINEA_CAMINO = {
    'grupo-vivir': 'Compras con otros y pagas menos. Edificios en obra.',
    'individual-vivir': 'Bci te presta hasta el 90' + NBSP + '% con la garantía del Estado.',
    'grupo-pie-compartido': 'Compras en grupo y unos inversionistas ponen parte del pie.',
    'pie-compartido': 'Pones el 5' + NBSP + '% y unos inversionistas ponen el 15' + NBSP + '%.',
    'grupo-invertir': 'Compras con otros, en obra, y pagas menos.',
    'individual-invertir': 'Bci presta el 80' + NBSP + '% y tú pones el 20' + NBSP + '%. Sirve para nuevos y usados.'
  };
  // Meses hasta las llaves por un camino. Para vivir, con las piezas que sumaste (igual que Inicio).
  function mesesDeCamino(id, perfil) {
    var mensual = estado.ahorroMensual || 300000;
    if (estado.modo === 'vivir') return plazoVivir(mensual, Object.assign({}, piezasOn(), { grupo: !!CAMINOS[id].grupo })).hasta.meses;
    return mesesCarrera([id], perfil, mensual)[0].techo;
  }
  function textoLlegada(meses) { return meses === null || meses === undefined ? 'Todavía no' : fechaLlaves(meses, hoyDemo()); }
  // S24-B1: el ícono grande de cada camino en Explorar (como en el canvas).
  function iconoCamino(id) {
    var d = id.indexOf('grupo') === 0
      ? 'M9 7.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0M6.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M2.7 9.5a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 0 0-4.6 0M16.7 9.5a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 0 0-4.6 0M1.5 18.5c0-2.4 1.5-4.3 3.5-4.3M22.5 18.5c0-2.4-1.5-4.3-3.5-4.3'
      : id === 'arriendo-opcion' ? 'M7.5 15a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM11 11.5h10M18 11.5v3M21 11.5v2.5'
      : (id === 'individual-vivir' ? 'M3 9.5L12 4l9 5.5zM5 10v7.5M9.7 10v7.5M14.3 10v7.5M19 10v7.5M3 20.5h18'
        : 'M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6zM8.5 12.2l2.4 2.4 4.6-4.8');
    return '<svg class="camino-dibujo" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function etiquetaCamino(id, r) {
    if (id === estado.caminoElegido) return '<span class="chip chip-recomendado">Tu camino</span>';
    if (!CAMINOS[id].existeHoy) return '<span class="chip chip-propuesta">Propuesta</span>';
    if (r && r.id === id) return '<span class="chip chip-existe">Recomendado</span>';
    return '<span class="chip chip-existe">Existe hoy</span>';
  }
  function caminosExplorar(perfil, r) {
    var sel = caminosParaMostrar(perfil, r);
    var ids = sel.mostrados.filter(function (id) { return !CAMINOS[id].ficha; });
    var tuyo = estado.caminoElegido;
    if (tuyo && CAMINOS[tuyo] && !CAMINOS[tuyo].ficha && (CAMINOS[tuyo].modo === estado.modo)) {
      ids = [tuyo].concat(ids.filter(function (id) { return id !== tuyo; }));
    }
    return { ids: ids, sel: sel };
  }
  function renderExplorar() {
    var cont = $('caminos-contenido');
    if (!ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return sinSueldos(cont, '¿Qué quieres explorar?', 'titulo-caminos');
    var perfil = perfilActual();
    var r = recomendarCamino(perfil);
    var x = caminosExplorar(perfil, r);
    // 9-nov: el arriendo con opción de compra pasó de ficha a camino completo (un botón más, solo para vivir).
    var fichas = ['respaldo-familiar'];
    // S25: como el canvas: tres tarjetas de color (con el crédito de siempre como tercera), favoritos y todos, y otras formas.
    // 9-nov: para invertir, los usados no son un camino aparte: son el mismo Crédito al 80 % (se ven dentro de él).
    var ids = x.ids.slice().sort(function (a, b) { return (ORDEN_EXPLORAR[a] || 9) - (ORDEN_EXPLORAR[b] || 9); })
      .concat(estado.modo === 'vivir' ? ['usados', 'arriendo-opcion'] : []);
    var nGuardados = guardadosProyectos().length;
    cont.innerHTML =
      '<header class="encabezado"><img class="logo-bci" src="logo_bci_negro.svg" alt="Bci" width="52" height="24"><h1 id="titulo-caminos" class="h2">¿Qué quieres explorar?</h1>' +
        '<p class="texto-apoyo">Tienes ' + plural(ids.length, 'camino', 'caminos') + ' para llegar a tu departamento</p></header>' +
      '<ul class="caminos-botones">' + ids.map(function (id, i) {
        var usados = id === 'usados';
        var color = COLOR_EXPLORAR[id] !== undefined ? COLOR_EXPLORAR[id] : i % 3;
        return '<li><a class="camino-boton color-' + color + '" href="#explorar/' + id + '">' +
          '<span class="camino-figura" aria-hidden="true"><i></i></span>' +
          '<span class="camino-boton-cabeza"><span class="camino-datos">' + (DATOS_CAMINO[id] || []).map(function (d) { return '<span class="chip">' + d + '</span>'; }).join('') + '</span>' + iconoCamino(usados ? 'individual-invertir' : id) + '</span>' +
          '<span class="camino-boton-cuerpo"><strong class="h4">' + (usados ? NOMBRE_USADOS : CAMINOS[id].nombre) + '</strong>' +
          '<span class="camino-boton-texto">' + (TEXTO_EXPLORAR[id] || LINEA_CAMINO[id] || '') + '</span></span>' +
          '<span class="camino-boton-ir" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span></a></li>';
      }).join('') + '</ul>' +
      (estado.modo === 'arrendar' && r.todaviaNo ? '<p class="texto-centro"><a class="enlace" href="#explorar/cambia">Ver qué lo cambia</a></p>' : '') +
      '<div class="explorar-dos">' +
        '<a class="tarjeta explorar-mini" href="#explorar/guardados"><span class="explorar-mini-icono rojo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z"/></svg></span>' +
          '<strong>Favoritos</strong><small>' + (nGuardados ? plural(nGuardados, 'departamento', 'departamentos') : 'Todavía ninguno') + '</small></a>' +
        '<a class="tarjeta explorar-mini" href="#departamentos"><span class="explorar-mini-icono azul" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 21V5h10v16M14 9h6v12M2.5 21h19M7 8.5h1.5M9.5 8.5H11M7 12h1.5M9.5 12H11M7 15.5h1.5M9.5 15.5H11M16.5 13h1.5M16.5 16.5h1.5"/></svg></span>' +
          '<strong>Todos los departamentos</strong><small>Nuevos y usados</small></a>' +
      '</div>' +
      (x.sel.noMostrados.length ? '<details class="tarjeta explorar-porque"><summary><span class="explorar-mini-icono gris" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6M12 17h.01M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z"/></svg></span>' +
          '<span><strong>Por qué no te mostramos otros</strong><small>' + plural(x.sel.noMostrados.length, 'camino', 'caminos') + '</small></span>' +
          '<svg class="flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary>' +
          x.sel.noMostrados.map(function (n) { return '<p><strong>' + CAMINOS[n.id].corto + ':</strong> ' + RAZON_NO_MOSTRADO[n.razon] + '</p>'; }).join('') + '</details>' : '') +
      '<section class="explorar-otras" aria-labelledby="titulo-otras-formas"><h2 class="h3" id="titulo-otras-formas">Otras formas</h2>' +
        fichas.map(function (id) {
          return '<a class="tarjeta explorar-otra" href="#camino/ficha/' + id + '"><span class="explorar-mini-icono verde" aria-hidden="true">' + (id === 'arriendo-opcion'
              ? '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/></svg>'
              : '<svg viewBox="0 0 24 24"><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z"/></svg>') + '</span>' +
            '<span><strong>' + CAMINOS[id].nombre + '</strong><small>' + (CAMINOS[id].existeHoy ? 'Existe hoy' : 'Propuesta') + '</small></span></a>';
        }).join('') +
      '</section>';
  }
  // Evaluación heurística: el crédito de los usados tiene su propio nombre (antes "Crédito de siempre").
  var NOMBRE_USADOS = 'Crédito para usados';
  var ORDEN_EXPLORAR = { 'individual-vivir': 1, 'grupo-vivir': 2 };
  var COLOR_EXPLORAR = { 'individual-vivir': 0, 'grupo-vivir': 1, usados: 2, 'arriendo-opcion': 3 };
  var DATOS_CAMINO = {
    'individual-vivir': ['Pie 10' + NBSP + '%', 'Nuevos'], 'grupo-vivir': ['Pagan menos', 'En obra'], usados: ['Pie 20' + NBSP + '%', 'Usados'],
    'arriendo-opcion': ['Entras con 5' + NBSP + '%', 'Propuesta'],
    'pie-compartido': ['Pie 5' + NBSP + '%', 'Para arrendar'], 'grupo-pie-compartido': ['Pie 5' + NBSP + '%', 'En grupo'],
    'grupo-invertir': ['Pagan menos', 'En obra'], 'individual-invertir': ['Pie 20' + NBSP + '%', 'Para arrendar']
  };
  var TEXTO_EXPLORAR = {
    'individual-vivir': 'Bci te presta hasta el 90' + NBSP + '%. Tú juntas solo el 10' + NBSP + '% de pie.',
    'grupo-vivir': 'Compras con otras personas un edificio en obra y pagan menos.',
    usados: 'Bci te presta el 80' + NBSP + '%. Sirve para departamentos usados.',
    'arriendo-opcion': 'Te mudas ahora y parte de tu arriendo va a tu pie.'
  };

  // Los departamentos de un camino, sin cambiar el camino elegido (mirar no cambia el plan).
  function proyectosDeCamino(id) {
    var guardado = { c: estado.caminoElegido, f: estado.filtroRango, p: estado.piezas };
    estado.caminoElegido = id;
    estado.filtroRango = !!rangoActual();
    if (estado.modo === 'vivir') estado.piezas = Object.assign({}, estado.piezas, { grupo: !!CAMINOS[id].grupo });
    var lista = proyectosVisibles('camino');
    estado.caminoElegido = guardado.c; estado.filtroRango = guardado.f; estado.piezas = guardado.p;
    return lista;
  }
  // S24-B2: la descripción larga de cada camino (Un camino), como en el canvas.
  var soloFavoritos = false;
  var DESCRIPCION_CAMINO = {
    'grupo-vivir': 'Te unes con otras personas para comprar departamentos en un mismo edificio en obra. Como compran varios, la inmobiliaria les baja el precio entre 3 y 5' + NBSP + '%: más descuento mientras más se unan.',
    'individual-vivir': 'Bci te presta hasta el 90' + NBSP + '% con la garantía del Estado. Tú juntas solo el 10' + NBSP + '% de pie y eliges un departamento nuevo.'
  };
  function chipsPiezas() {
    if (estado.modo !== 'vivir') return '';
    var on = piezasValidas(piezasOn());
    var n = ORDEN_PIEZAS.filter(function (id) { return on[id] && id !== 'grupo'; });
    return n.length ? '<p class="chip-fila">' + n.map(function (id) { return '<span class="chip chip-existe">' + PIEZAS_VIVIR[id].nombre + '</span>'; }).join(' ') + '</p>' : '';
  }
  function renderUnCamino(id) {
    var cont = $('caminos-contenido');
    if (!CAMINOS[id] || CAMINOS[id].ficha) { location.replace('#explorar'); return; }
    if (!ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return sinSueldos(cont, CAMINOS[id].nombre, 'titulo-caminos');
    var perfil = perfilActual();
    var r = recomendarCamino(perfil);
    var todos = proyectosDeCamino(id);
    var lista = filtrarChips(todos, id).filter(function (p) { return !soloFavoritos || esFavorito(p.id); });
    var m = mesesDeCamino(id, perfil);
    var esTuyo = id === estado.caminoElegido;
    var vivir = estado.modo === 'vivir';
    cont.innerHTML =
      '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>' +
      '<header class="encabezado">' +
        '<h1 id="titulo-caminos" class="h2">' + CAMINOS[id].nombre + '</h1>' +
        '<p class="texto-apoyo camino-descripcion">' + (DESCRIPCION_CAMINO[id] || LINEA_CAMINO[id] || '') + '</p>' +
      '</header>' +
      (esTuyo ? '<p class="camino-es-tuyo">' + icono('i-check') + 'Es tu camino</p>' : '<button type="button" class="btn btn-mi-camino" id="btn-mi-camino" aria-haspopup="dialog">Hacerlo mi camino</button>') +
      (vivir ? '<a class="tarjeta fila como-funciona" href="#explorar/' + id + '/como"><span class="circulo-icono verde" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg></span>' +
          '<span><strong>¿Cómo puedes llegar antes?</strong><small>Mira qué ayudas te acercan a tus llaves</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>'
        : '<button type="button" class="tarjeta fila como-funciona" data-simular="' + id + '" aria-haspopup="dialog">' + icono('i-ayuda', 'icono-grande') +
          '<span><strong>¿Cómo funciona?</strong><small>Tasa, dividendo y costo total</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></button>') +
      '<h2 class="h3 camino-explorar-titulo">Explorar</h2>' +
      chipsExplorar(id).replace('</div>', '<button type="button" class="chip chip-filtro chip-favoritos" id="chip-favoritos" aria-pressed="' + soloFavoritos + '">' + icono('i-corazon') + 'Favoritos</button></div>') +
      (!vivir && id === 'individual-invertir'
        ? '<a class="tarjeta fila como-funciona" href="#explorar/usados">' + icono('i-casa', 'icono-grande') +
            '<span><strong>También usados</strong><small>El mismo crédito al 80' + NBSP + '%, sin subsidio a la tasa</small></span>' +
            '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>' : '') +
      '<section aria-labelledby="titulo-deptos-camino"><h2 class="oculto-visual" id="titulo-deptos-camino">' + plural(lista.length, 'departamento', 'departamentos') + '</h2>' +
        (lista.length ? '<ul class="lista-proyectos">' + lista.map(function (p) { return tarjetaProyecto(p, '#camino/proyecto/', true, '/' + esc(id)); }).join('') + '</ul>'
          : '<p class="texto-apoyo">' + (soloFavoritos && todos.length ? 'Todavía no guardas ninguno de este camino.' : todos.length ? 'Ninguno con estos filtros.' : 'Hoy no hay departamentos de este camino en tu rango.') + '</p>') +
      '</section>';
    var b = cont.querySelector('[data-simular]');
    if (b) b.addEventListener('click', function () { abrirSimulacion(id, b); });
    if ($('btn-mi-camino')) $('btn-mi-camino').addEventListener('click', function () { confirmarMiCamino(id, $('btn-mi-camino')); });
    $('chip-favoritos').addEventListener('click', function () { soloFavoritos = !soloFavoritos; renderUnCamino(id); $('chip-favoritos').focus(); });
    cont.querySelectorAll('[data-chip]').forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.dataset.chip;
        if (c.dataset.razon) { toast(CHIPS_EXPLORAR[k].nombre + ': ' + RAZON_CHIP[k]); return; }
        chipsActivos[k] = !chipsActivos[k];
        renderUnCamino(id);
        var nuevo = document.querySelector('[data-chip="' + k + '"]');
        if (nuevo) nuevo.focus();
      });
    });
  }


  // ---------- S26: Cómo es vivir ahí ----------
  var REVISAR_VISITA = [
    ['Ve de día y de noche', 'El ruido y la luz cambian mucho.'],
    ['Mira hacia dónde da', 'La luz y el calor dependen de la orientación.'],
    ['Abre las llaves', 'Revisa la presión y cuánto tarda el agua caliente.'],
    ['Busca humedad', 'Manchas en esquinas, ventanas y closets.'],
    ['Pide los gastos comunes reales', 'Las últimas boletas del edificio.'],
    ['Lee el reglamento', 'Mascotas, arriendos y uso de espacios comunes.'],
    ['Pregunta por bodega y estacionamiento', 'Si vienen incluidos o se pagan aparte.']
  ];
  var ICONOS_BARRIO = {
    metro: ['azul', 'M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 11h14M8 21l2-3M16 21l-2-3M8.5 14.5h.01M15.5 14.5h.01'],
    verde: ['verde', 'M12 21v-6M12 15c-4 0-6-3-6-6a6 6 0 0 1 12 0c0 3-2 6-6 6z'],
    salud: ['rojo', 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z'],
    vida: ['amarillo', 'M4 10h16l-1.5-5h-13zM5 10v10h14V10M9 20v-5h6v5']
  };
  // 9-nov: mapa embebido (sin clave de API). Con dirección de trabajo, muestra la ruta en transporte público.
  function lugarComuna(comuna) { return encodeURIComponent(comuna + ', Santiago, Chile'); }
  function urlMapa(comuna, trabajo) {
    return trabajo
      ? 'https://maps.google.com/maps?saddr=' + encodeURIComponent(trabajo + ', Santiago, Chile') + '&amp;daddr=' + lugarComuna(comuna) + '&amp;dirflg=r&amp;output=embed'
      : 'https://maps.google.com/maps?q=' + lugarComuna(comuna) + '&amp;z=14&amp;output=embed';
  }
  function urlMapaAfuera(comuna, trabajo) {
    return trabajo
      ? 'https://www.google.com/maps/dir/?api=1&amp;origin=' + encodeURIComponent(trabajo + ', Santiago, Chile') + '&amp;destination=' + lugarComuna(comuna) + '&amp;travelmode=transit'
      : 'https://www.google.com/maps/search/?api=1&amp;query=' + lugarComuna(comuna);
  }
  function iniciarMapaBarrio(p) {
    var f = $('form-trabajo');
    if (!f) return;
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      estado.trabajo = $('campo-trabajo').value.trim().slice(0, 120);
      guardarEstado();
      var amp = function (u) { return u.replace(/&amp;/g, '&'); };
      $('barrio-iframe').src = amp(urlMapa(p.comuna, estado.trabajo));
      $('barrio-abrir').href = amp(urlMapaAfuera(p.comuna, estado.trabajo));
      $('barrio-ruta').textContent = estado.trabajo ? 'En transporte público, desde ' + estado.trabajo : '';
    });
  }
  function barrioHtml(p) {
    var b = BARRIOS[p.comuna];
    if (!b) return '';
    var hechos = estado.visita[p.id] || [];
    var fila = function (k, titulo, texto) {
      return '<li><span class="barrio-icono ' + ICONOS_BARRIO[k][0] + '" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + ICONOS_BARRIO[k][1] + '"/></svg></span><span><strong>' + titulo + '</strong><small>' + texto + '</small></span></li>';
    };
    return '<section class="tarjeta barrio" aria-labelledby="titulo-barrio">' +
        '<h2 id="titulo-barrio">Cómo es vivir aquí</h2><p class="barrio-sub">' + esc(p.comuna) + SEP + 'referencias de la comuna</p>' +
        '<ul>' + fila('metro', 'Metro', b.metro) + fila('verde', 'Áreas verdes', b.verde) + fila('salud', 'Salud', b.salud) + fila('vida', 'Para el día a día', b.vida) + '</ul>' +
        // Comentario 9-nov: el mapa va dentro de la app (antes abría Google Maps afuera).
        '<div class="barrio-mapa"><iframe id="barrio-iframe" title="Mapa de ' + esc(p.comuna) + '" src="' + urlMapa(p.comuna, estado.trabajo) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>' +
        '<form class="barrio-trabajo" id="form-trabajo"><label for="campo-trabajo">¿Dónde trabajas?</label>' +
          '<div class="barrio-trabajo-fila"><input id="campo-trabajo" type="text" autocomplete="street-address" maxlength="120" placeholder="Dirección o comuna" value="' + esc(estado.trabajo) + '">' +
          '<button type="submit" class="btn btn-primario btn-sm">Ver ruta</button></div>' +
          '<p class="barrio-ruta" id="barrio-ruta" aria-live="polite">' + (estado.trabajo ? 'En transporte público, desde ' + esc(estado.trabajo) : '') + '</p></form>' +
        '<a class="barrio-link" id="barrio-abrir" href="' + urlMapaAfuera(p.comuna, estado.trabajo) + '" target="_blank" rel="noopener">Abrir en Google Maps</a>' +
      '</section>' +
      // 9-nov: plegada; se abre al tocar el título.
      '<details class="tarjeta visita">' +
        '<summary class="visita-cabeza"><h2 id="titulo-visita">Qué revisar en la visita</h2><span id="visita-cuenta">' + hechos.length + ' de ' + REVISAR_VISITA.length + '</span>' +
          '<svg class="plegable-flecha" aria-hidden="true"><use href="#i-flecha"/></svg></summary>' +
        '<ul>' + REVISAR_VISITA.map(function (r, i) {
          return '<li><label><input type="checkbox" data-visita="' + i + '"' + (hechos.indexOf(i) !== -1 ? ' checked' : '') + '><span><strong>' + r[0] + '</strong><small>' + r[1] + '</small></span></label></li>';
        }).join('') + '</ul>' +
      '</details>';
  }
  function iniciarVisita(p) {
    iniciarMapaBarrio(p);
    document.querySelectorAll('[data-visita]').forEach(function (c) {
      c.addEventListener('change', function () {
        var n = Number(c.dataset.visita), l = (estado.visita[p.id] || []).filter(function (x) { return x !== n; });
        if (c.checked) l.push(n);
        estado.visita = Object.assign({}, estado.visita); estado.visita[p.id] = l;
        guardarEstado();
        $('visita-cuenta').textContent = l.length + ' de ' + REVISAR_VISITA.length;
        if (l.length === REVISAR_VISITA.length) toast('Revisaste todo. ¡Buena visita!');
      });
    });
  }

  // ---------- S26: Tu mes como dueño ----------
  // Todo lo que pagarías al mes como dueño frente a tu arriendo, cuánto te queda para vivir y lo que se paga una vez.
  // Con id: ese departamento. Sin id (desde Inicio): el más caro de tu rango, con lo que juntas hoy.
  function renderMesDueno(id) {
    var cont = $('caminos-contenido');
    var p = id ? buscarProyecto(id) : null;
    var base, m2, volver;
    if (p) {
      var dp = departamentosDe(p.id)[0];
      base = estado.modo === 'vivir' && paraVivir(p) ? plazoDepartamento(p) : resumen(p).escenario;
      m2 = dp.m2;
      volver = ['#departamentos/' + esc(p.id), 'Un departamento'];
    } else {
      var x = plazoVivir(estado.ahorroMensual || 300000);
      base = x.hasta;
      var cand = candidatosVivir().map(function (q) { return departamentosDe(q.id)[0]; }).sort(function (a, b) { return b.listaUF - a.listaUF; });
      m2 = cand.length ? cand[0].m2 : 45;
      volver = ['#camino', 'Inicio'];
    }
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var m = mesDueno({ dividendo: base.dividendo, m2: m2, precioUF: base.precioUF, arriendo: estado.arriendoActual, ingreso: ingreso, otrasCuotas: estado.otrasCuotas });
    var partes = [['azul', 'Dividendo', m.dividendo, 'Lo que le pagas a Bci'], ['celeste', 'Seguros', m.seguros, 'Desgravamen e incendio, van con el dividendo'],
      ['verde', 'Gastos comunes', m.gastosComunes, 'Estimado para ' + m2 + NBSP + 'm²'], ['amarillo', 'Para arreglos', m.arreglos, 'Lo que conviene guardar cada mes']];
    var pctVive = ingreso > 0 ? m.teQueda / ingreso : null;
    var nivel = pctVive === null ? null : pctVive >= 0.5 ? 'holgado' : pctVive >= 0.35 ? 'limite' : 'no-aprueba';
    cont.innerHTML =
      '<a href="' + volver[0] + '" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + volver[1] + '</a>' +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2">Tu mes como dueño</h1>' +
        '<p class="texto-apoyo">' + (p ? esc(p.nombre) + SEP + m2 + NBSP + 'm²' : 'Un departamento de ' + formatoUF(base.precioUF) + ' y unos ' + m2 + NBSP + 'm²') + '</p></header>' +
      '<section class="dueno-heroe" aria-labelledby="dueno-total">' +
        '<p id="dueno-total">Cada mes pagarías</p><strong>' + formatoPesos(m.total) + '</strong>' +
        (m.vsArriendo !== null ? '<span class="dueno-vs">' + (m.vsArriendo > 0 ? formatoRedondeado(m.vsArriendo) + ' más que tu arriendo de hoy' : m.vsArriendo < 0 ? formatoRedondeado(-m.vsArriendo) + ' menos que tu arriendo de hoy' : 'Lo mismo que tu arriendo de hoy') + '</span>' : '') +
        '<span class="dueno-barra" aria-hidden="true">' + partes.map(function (x) { return '<i class="' + x[0] + '" style="flex:' + x[2] + '"></i>'; }).join('') + '</span>' +
      '</section>' +
      '<section class="tarjeta dueno-partes" aria-label="En qué se va">' + partes.map(function (x) {
        return '<p><i class="' + x[0] + '" aria-hidden="true"></i><span><strong>' + x[1] + '</strong><small>' + x[3] + '</small></span><strong>' + formatoPesos(x[2]) + '</strong></p>';
      }).join('') +
        '<p class="dueno-contrib"><span><strong>Contribuciones</strong><small>Si el avalúo fiscal es menor a ' + formatoUF(SUPUESTOS.exentoContribucionesUF) + ' (≈' + NBSP + formatoRedondeado(ufAPesos(SUPUESTOS.exentoContribucionesUF)) + '), no pagas. Revísalo en el SII.</small></span></p>' +
      '</section>' +
      (estado.arriendoActual > 0 ? '<section class="tarjeta dueno-compara" aria-labelledby="dueno-hoy"><h2 id="dueno-hoy">Hoy y como dueño</h2>' +
        '<p><span>Tu arriendo hoy</span><strong>' + formatoPesos(estado.arriendoActual) + '</strong></p><span class="dueno-mini amarillo" aria-hidden="true"><i style="width:' + Math.min(100, estado.arriendoActual / Math.max(m.total, estado.arriendoActual) * 100).toFixed(1) + '%"></i></span>' +
        '<p><span>Como dueño</span><strong>' + formatoPesos(m.total) + '</strong></p><span class="dueno-mini azul" aria-hidden="true"><i style="width:' + Math.min(100, m.total / Math.max(m.total, estado.arriendoActual) * 100).toFixed(1) + '%"></i></span>' +
        '<p class="dueno-nota">La diferencia: el dividendo va a algo que es tuyo; el arriendo, no.</p></section>' : '') +
      (pctVive !== null ? '<section class="tarjeta dueno-vivir" aria-labelledby="dueno-queda"><h2 id="dueno-queda">Te queda para vivir</h2>' +
        '<strong>' + formatoPesos(Math.max(0, m.teQueda)) + '</strong>' +
        '<span class="carga-chip ' + nivel + '">' + (nivel === 'holgado' ? 'Holgado' : nivel === 'limite' ? 'Justo' : 'Poco') + '</span>' +
        '<p class="dueno-nota">De ' + formatoPesos(ingreso) + ' al mes' + ((estado.otrasCuotas || 0) > 0 ? ', después de tus otras cuotas' : '') + '. Para comida, transporte, cuentas y ahorro.</p></section>' : '') +
      '<section class="tarjeta dueno-vez" aria-labelledby="dueno-vez"><h2 id="dueno-vez">Una sola vez</h2>' +
        '<p><span><strong>Gastos al firmar</strong><small>Notaría, tasación, estudio de títulos e inscripción</small></span><strong>' + formatoRedondeado(m.alFirmar) + '</strong></p>' +
        '<p><span><strong>Mudanza</strong><small>Estimado dentro de Santiago</small></span><strong>' + formatoRedondeado(m.mudanza) + '</strong></p>' +
        '<p class="dueno-vez-total"><span>Total</span><strong>' + formatoRedondeado(m.unaVez) + '</strong></p>' +
        '<p class="dueno-nota">Los gastos al firmar ya están en lo que juntas antes de firmar.</p></section>' +
      '<p class="dueno-fuente">Estimados. Gastos comunes con el promedio de Santiago Centro (Assetplan, mar-2026); arreglos y mudanza son supuestos. Los del edificio los da la administración.</p>';
  }

  // ---------- S23-C: guardar departamentos ----------
  // Los usados también se pueden guardar, pero Tus guardados muestra solo proyectos.
  function guardadosProyectos() { return estado.favoritos.map(buscarProyecto).filter(Boolean); }
  function esFavorito(id) { return estado.favoritos.indexOf(id) !== -1; }
  function botonFavorito(p) {
    var on = esFavorito(p.id);
    return '<button type="button" class="btn-favorito" data-favorito="' + esc(p.id) + '" aria-pressed="' + on + '" aria-label="Guardar ' + esc(p.nombre) + '">' +
      '<svg aria-hidden="true"><use href="#i-corazon"/></svg></button>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-favorito]');
    if (!b) return;
    ev.preventDefault();
    var id = b.dataset.favorito;
    estado.favoritos = alternarFavorito(estado.favoritos, id);
    guardarEstado();
    var on = esFavorito(id);
    document.querySelectorAll('[data-favorito="' + id + '"]').forEach(function (x) {
      x.setAttribute('aria-pressed', String(on));
      x.classList.remove('late'); void x.offsetWidth; if (on) x.classList.add('late');
    });
    toast(on ? 'Guardado. Te avisamos si cambia algo.' : 'Lo sacaste de tus guardados.');
  });
  // Lo que importa hoy de un guardado: cupos, cierre, sin IVA o lo financiado.
  function novedadGuardado(p) {
    var r = resumen(p);
    if (p.tipo === 'conjunto') return (r.cuposLibres > 0 ? (r.cuposLibres === 1 ? 'Falta 1 persona' : 'Faltan ' + r.cuposLibres + ' personas') : 'Grupo completo') + SEP + 'cierra el ' + fechaCorta(p.cierre);
    if (p.tipo === 'venta') return cumpleChip('sin-iva', p, departamentosDe(p.id)[0]) ? 'Sin IVA si firmas la promesa antes de dic-2027' : 'Terminado' + SEP + 'lo recibes al firmar';
    return formatoPorcentaje(r.avanceFinanciamiento, 0) + ' financiado' + SEP + 'cierra el ' + fechaCorta(p.cierre);
  }
  function renderGuardados() {
    var cont = $('caminos-contenido');
    var lista = estado.favoritos.map(buscarProyecto).filter(Boolean);
    cont.innerHTML =
      '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>' +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2 titulo-favoritos">Favoritos <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z"/></svg></h1>' +
        '<p class="texto-apoyo">Te avisamos si cambia algo.</p></header>' +
      (lista.length
        // S25: como el canvas: la novedad arriba, la foto, el nombre y una sola cifra.
        ? '<ul class="lista-proyectos">' + lista.map(function (p) {
            var r = resumen(p), d = departamentosDe(p.id)[0], foto = fotoEdificio(p);
            return '<li><a class="tarjeta tarjeta-canvas guardado" href="#camino/proyecto/' + esc(p.id) + '">' +
              '<p class="novedad-guardado ' + (p.tipo === 'venta' ? 'verde' : 'amarilla') + '">' + icono('i-campana') + novedadGuardado(p) + '</p>' +
              (foto ? '<img class="tp-foto" src="' + foto + '" alt="' + esc(p.nombre) + ' (foto referencial)" loading="lazy" width="800" height="600">' : '<span class="tp-foto">' + fachada(p) + '</span>') +
              '<h2 class="tp-nombre">' + esc(p.nombre) + '</h2>' +
              '<p class="tp-ficha">' + esc(p.comuna) + SEP + (d.dormitorios ? plural(d.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + d.m2 + NBSP + 'm²</p>' +
              (p.tipo === 'conjunto'
                ? '<strong class="tp-cifra guardado-cifra">' + formatoRedondeado(r.ahorro > 0 ? r.ahorro : r.ahorroCompleto) + ' <small>de ahorro al unirte</small></strong>'
                : '<strong class="tp-cifra guardado-cifra">' + formatoRedondeado(p.tipo === 'venta' && estado.modo === 'vivir' ? ufAPesos(plazoDepartamento(p).precioUF) : r.escenario.precio) + '</strong>') +
              '</a>' + botonFavorito(p) + '</li>';
          }).join('') + '</ul>'
        : '<div class="vacio">' + icono('i-corazon', 'icono-grande') + '<h2 class="h3">Todavía no guardas ninguno</h2>' +
          '<p class="texto-apoyo">Toca el corazón de un departamento.</p></div>');
  }

  // ---------- S22-F4: chips con su regla (cumpleChip y bloqueoChip en calculos.js) ----------
  var chipsActivos = {};
  var RAZON_CHIP = { 'sin-iva': 'solo terminados; este camino es en obra.' };
  function filtrarChips(lista, idCamino) {
    var on = Object.keys(chipsActivos).filter(function (k) {
      return chipsActivos[k] && chipsDelModo(estado.modo).indexOf(k) !== -1 && !bloqueoChip(k, CAMINOS[idCamino]);
    });
    return lista.filter(function (p) { return on.every(function (k) { return cumpleChip(k, p, departamentosDe(p.id)[0]); }); });
  }
  function chipsExplorar(idCamino) {
    // S25: como el canvas, los filtros que no aplican a este camino no se muestran.
    return '<div class="chips-explorar" role="group" aria-label="Filtrar">' + chipsDelModo(estado.modo).filter(function (k) { return !bloqueoChip(k, CAMINOS[idCamino]); }).map(function (k) {
      var b = bloqueoChip(k, CAMINOS[idCamino]);
      return '<button type="button" class="chip chip-filtro' + (b ? ' bloqueado' : '') + '" data-chip="' + k + '" aria-pressed="' + (!b && !!chipsActivos[k]) + '"' +
        (b ? ' aria-disabled="true" data-razon="1"' : '') + '>' + CHIPS_EXPLORAR[k].nombre + (b ? '<small>' + SEP + b + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }

  // S22-F4: usados de ejemplo para el crédito de siempre. Solo para mirar (la compra de usados no está en la demo).
  function renderUsados() {
    var cont = $('caminos-contenido');
    var vivir = estado.modo === 'vivir';
    // S24-B2: como Un camino: descripción, filtros y tarjetas con foto.
    var lista = USADOS.filter(function (u) {
      return (!filtroUsados.dos || u.dormitorios === 2) && (!filtroUsados.barato || u.listaUF <= 2000) && (!filtroUsados.fav || esFavorito(u.id));
    });
    var chip = function (k, texto) {
      return '<button type="button" class="chip chip-filtro' + (k === 'fav' ? ' chip-favoritos' : '') + '" data-usado-filtro="' + k + '" aria-pressed="' + !!filtroUsados[k] + '">' +
        (k === 'fav' ? icono('i-corazon') : '') + texto + '</button>';
    };
    cont.innerHTML =
      (vivir ? '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>'
        : '<a href="#explorar/individual-invertir" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + CAMINOS['individual-invertir'].nombre + '</a>') +
      '<header class="encabezado">' +
        '<h1 id="titulo-caminos" class="h2">' + (vivir ? NOMBRE_USADOS : CAMINOS['individual-invertir'].nombre + SEP + 'usados') + '</h1>' +
        '<p class="texto-apoyo camino-descripcion">Bci te presta hasta el 80' + NBSP + '% del valor y tú juntas el 20' + NBSP + '% de pie. Un usado no tiene subsidio a la tasa.</p></header>' +
      '<button type="button" class="btn btn-mi-camino" id="btn-usados-camino">Hacerlo mi camino</button>' +
      '<h2 class="h3 camino-explorar-titulo">Explorar</h2>' +
      '<div class="chips-explorar" role="group" aria-label="Filtrar">' + chip('dos', '2 dormitorios') + chip('barato', 'Hasta ' + formatoUF(2000)) + chip('fav', 'Favoritos') + '</div>' +
      '<p class="usados-conteo">' + (lista.length ? plural(lista.length, 'departamento usado', 'departamentos usados') : 'Ningún departamento con estos filtros') + '</p>' +
      (lista.length ? '<ul class="lista-usados">' + lista.map(function (u) {
        var calza = vivir && u.listaUF <= DS1.tramo4.hastaUF;
        // Para que dos usados iguales no muestren la misma foto, se alterna living y cocina.
        var tipo = (u.dormitorios === 2 ? '2d' : u.dormitorios === 1 ? '1d' : 'estudio') + (USADOS.indexOf(u) % 2 ? '-cocina' : '-living');
        var foto = FOTOS.interiores[tipo];
        var titulo = 'Departamento en ' + esc(u.comuna);
        return '<li class="tarjeta usado">' +
          (foto ? '<img class="usado-foto" src="fotos/interiores/' + encodeURI(foto) + '" alt="' + (tipo.indexOf('cocina') !== -1 ? 'Cocina' : 'Living') + ' de un departamento de ' + (u.dormitorios || 1) + ' dormitorio' + (u.dormitorios > 1 ? 's' : '') + ' (foto referencial)" loading="lazy" width="800" height="600">' : '') +
          botonFavorito({ id: u.id, nombre: titulo }) +
          '<span class="usado-etiqueta">Usado' + SEP + 'de ' + u.anio + (!vivir && u.dfl2 ? SEP + 'DFL-2' : '') + '</span>' +
          // Comentario 9-nov: la tarjeta entera abre el departamento (el corazón queda encima).
          '<h3 class="tp-nombre"><a class="usado-enlace" href="#explorar/usados/' + esc(u.id) + '">' + titulo + '</a></h3>' +
          '<p class="tp-ficha">' + esc(u.comuna) + SEP + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + plural(u.banos || 1, 'baño', 'baños') + SEP + u.m2 + NBSP + 'm²</p>' +
          '<p class="tp-etiqueta">Precio</p>' +
          '<p class="usado-precio"><strong class="tp-cifra">' + formatoUF(u.listaUF) + '</strong> <span>' + formatoRedondeado(ufAPesos(u.listaUF)) + '</span></p>' +
          '<p class="tp-linea">Pie de ' + formatoUF(u.listaUF * 0.2) + (calza ? SEP + 'calza con DS1' : '') + '</p>' +
          '<p class="usado-ver" aria-hidden="true">Ver departamento ›</p>' +
        '</li>';
      }).join('') + '</ul>' : '<p class="texto-apoyo">' + (filtroUsados.fav ? 'Todavía no guardas ninguno.' : 'Ninguno con estos filtros.') + '</p>') +
      '<p class="texto-apoyo texto-centro"><small>Ejemplos simulados' + SEP + 'fotos referenciales</small></p>';
    // 9-nov: para invertir, es el mismo Crédito al 80 %: se puede hacer tu camino.
    $('btn-usados-camino').addEventListener('click', function () { if (vivir) toast('En la demo, los usados son para mirar (simulado).'); else confirmarMiCamino('individual-invertir', $('btn-usados-camino')); });
    cont.querySelectorAll('[data-usado-filtro]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.usadoFiltro;
        filtroUsados[k] = !filtroUsados[k];
        renderUsados();
        cont.querySelector('[data-usado-filtro="' + k + '"]').focus();
      });
    });
  }
  var filtroUsados = {};

  // Comentario 9-nov: el detalle de un usado. Crédito de siempre: Bci presta el 80 %, sin subsidio a la tasa.
  function fotosUsado(u) {
    var t = u.dormitorios === 0 ? 'estudio' : u.dormitorios === 1 ? '1d' : '2d';
    var ficha = u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'estudio';
    return ESPACIOS[t].filter(function (e) { return hayFotos() && FOTOS.interiores[t + '-' + e]; }).map(function (e) {
      return { src: 'fotos/interiores/' + encodeURI(FOTOS.interiores[t + '-' + e]), alt: NOMBRE_ESPACIO[e] + ' de un departamento de ' + ficha + ' (foto referencial)', nombre: NOMBRE_ESPACIO[e] };
    });
  }
  function renderUsado(id) {
    var cont = $('caminos-contenido');
    var u = USADOS.filter(function (x) { return x.id === id; })[0];
    if (!u) { location.replace('#explorar/usados'); return; }
    var vivir = estado.modo === 'vivir';
    var titulo = 'Departamento en ' + esc(u.comuna);
    var pie = ufAPesos(u.listaUF * 0.2), gastos = ufAPesos(gastosUF(u.listaUF)), meta = pie + gastos;
    var dividendo = ufAPesos(cuotaFija(u.listaUF * 0.8, SUPUESTOS.tasaSinSubsidio, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
    var perfil = perfilActual();
    var falta = Math.max(0, meta - (perfil.ahorroActual || 0));
    var meses = falta === 0 ? 0 : mesesParaMeta(falta, perfil.ahorroMensual);
    var calza = vivir && u.listaUF <= DS1.tramo4.hastaUF;
    cont.innerHTML =
      '<a href="#explorar/usados" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + (vivir ? NOMBRE_USADOS : CAMINOS['individual-invertir'].nombre + ' · usados') + '</a>' +
      '<header class="detalle-cabecera">' + botonFavorito({ id: u.id, nombre: titulo }) +
        '<h1 id="titulo-caminos" class="h2">' + titulo + '</h1>' +
        '<span class="tp-tipo verde">Usado' + SEP + 'de ' + u.anio + '</span>' +
        '<p class="texto-apoyo">' + esc(u.comuna) + SEP + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + plural(u.banos || 1, 'baño', 'baños') + SEP + u.m2 + NBSP + 'm²</p>' +
      '</header>' +
      galeria(fotosUsado(u)) +
      (vivir && isFinite(meses)
        ? '<section class="detalle-llaves" aria-labelledby="usado-llaves"><p id="usado-llaves">Tus llaves</p>' +
            '<strong>' + (meses === 0 ? 'Ya' : textoMeses(meses)) + '</strong>' +
            '<p>' + (meses === 0 ? 'Ya tienes lo que se junta antes de firmar' : 'Si sigues ahorrando como ahora') + '</p></section>'
        : '') +
      '<ul class="detalle-filas">' +
        '<li><span>Precio</span><strong>' + formatoRedondeado(ufAPesos(u.listaUF)) + '</strong></li>' +
        '<li><span>Pie (20' + NBSP + '%)</span><strong>' + formatoRedondeado(pie) + '</strong></li>' +
        '<li><span>Gastos de escritura</span><strong>' + formatoRedondeado(gastos) + '</strong></li>' +
        '<li><span>Juntas antes de firmar</span><strong>' + formatoRedondeado(meta) + '</strong></li>' +
        '<li><span>Después pagas al mes</span><span class="en-uf"><strong>' + ufDecimales(dividendo / SUPUESTOS.uf, 2) + '</strong><small>hoy son ' + formatoRedondeado(dividendo) + '</small></span></li>' +
      '</ul>' +
      '<p class="texto-apoyo usado-nota"><small>Bci presta el 80' + NBSP + '% a 30 años. Un usado no tiene subsidio a la tasa ni garantía del Estado, por eso el pie es más alto.</small></p>' +
      (vivir ? barrioHtml(u) : '') +
      '<button type="button" class="btn btn-primario btn-bloque usado-cta" id="btn-usado-camino">Hacerlo mi camino</button>' +
      '<p class="texto-apoyo texto-centro"><small>Ejemplo simulado' + SEP + 'fotos referenciales</small></p>';
    iniciarGalerias(cont);
    if (vivir) iniciarVisita(u);
    $('btn-usado-camino').addEventListener('click', function () { if (vivir) toast('En la demo, los usados son para mirar (simulado).'); else confirmarMiCamino('individual-invertir', $('btn-usado-camino')); });
  }
  // ---------- 9-nov: Arriendo con opción de compra, camino completo (propuesta Bci) ----------
  // Hacerlo tu camino: Inicio y Tus pasos siguen sus 6 hitos (entrada, contrato, pie, crédito y escritura).
  function esArriendo() { return estado.modo === 'vivir' && estado.caminoElegido === 'arriendo-opcion' && !estado.compra; }
  // El departamento del camino: el que elegiste o, si no, el que antes es tuyo dentro de tu rango.
  function arriendoActual() {
    var perfil = perfilActual();
    var elegido = ARRIENDOS_OPCION.filter(function (u) { return u.id === estado.arriendoElegido; })[0];
    var rango = rangoActual();
    var lista = elegido ? [elegido] : ARRIENDOS_OPCION.filter(function (u) { return !rango || enRango(u.listaUF, rango); });
    if (!lista.length) lista = ARRIENDOS_OPCION;
    var mejor = lista.map(function (u) { return { u: u, a: arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, perfil) }; })
      .sort(function (x, y) { return (y.a.cumple - x.a.cumple) || ((x.a.mesesTuyo || 999) - (y.a.mesesTuyo || 999)); })[0];
    mejor.elegido = !!elegido;
    return mejor;
  }
  function confirmarArriendo(boton, u) {
    var perfil = perfilActual();
    var a = u ? arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, perfil) : null;
    var ya = estado.caminoElegido === 'arriendo-opcion';
    abrirHojaContenido(u ? '¿Quieres este departamento?' : '¿Hacerlo tu camino?',
      (a ? '<p class="texto-apoyo">' + esc(u.nombre) + ': ' + (a.cumple ? 'es tuyo en ' + textoMeses(a.mesesTuyo) + (a.mesesEntrada ? ' y te mudas en ' + textoMeses(a.mesesEntrada) : ' y te mudas ya') + '.' : primeraMinuscula(a.razon) + '.') + '</p>' : '') +
      (ya ? '' : '<p class="texto-apoyo">Tu plan pasa a arriendo con opción de compra. Tu cuenta, tu ahorro y tus misiones se mantienen.</p>') +
      '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-confirmar-arriendo">' + (u ? 'Sí, quiero este departamento' : 'Sí, hacerlo mi camino') + '</button></div>', boton,
      function () {
        $('btn-confirmar-arriendo').addEventListener('click', function () {
          estado.caminoElegido = 'arriendo-opcion';
          if (u) estado.arriendoElegido = u.id;
          guardarEstado();
          registro.camino = 'arriendo-opcion'; guardarRegistro();
          cerrarHoja(false);
          toast(u ? 'Elegiste ' + u.nombre + '.' : 'Tu camino: arriendo con opción de compra.');
          location.hash = '#camino';
        });
      });
  }
  // Inicio con este camino: cuándo es tuyo, cuándo te mudas, tu pie y el siguiente paso.
  function renderInicioArriendo() {
    var c = $('inicio-principal');
    var x = arriendoActual(), u = x.u, a = x.a;
    var ps = estado.pasos;
    var vive = !!ps.contratoArriendo, tuyo = !!ps.arriendoTuyo;
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var minimo = 100000, paso = 50000, maximo = Math.max(1000000, Math.ceil(ingreso * 0.4 / paso) * paso);
    var mensual = Math.min(maximo, Math.max(minimo, estado.ahorroMensual || 300000));
    var llevas = ahorradoTuPie(a.meta);
    var calc = function (m) {
      var y = arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, Object.assign({}, perfilActual(), { ahorroMensual: m, ahorroActual: Math.max(estado.ahorroActual || 0, llevas) }));
      if (vive) {
        // Ya vives ahí: lo que falta del pie con el aporte y el mínimo del tercer año desde que firmaste.
        var pasaron = Math.max(0, (estado.mesAhorro || 0) - (estado.mesContrato || 0));
        var resto = mesesParaMeta(Math.max(0, y.meta - llevas), y.aporte) || 0;
        y.mesesEntrada = 0;
        y.mesesTuyo = Math.max(resto, ARRIENDO_OPCION.compraDesdeMes - pasaron, 0) + ARRIENDO_OPCION.mesesEscritura;
      }
      return y;
    };
    a = calc(mensual);
    var sub = function (y) { return vive ? 'Ya vives en ' + esc(u.nombre) : (y.mesesEntrada ? 'Te mudas en ' + textoMeses(y.mesesEntrada) : 'Te mudas ya'); };
    c.innerHTML =
      '<header class="encabezado">' + FIGURAS + campana() +
        '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tu camino</h1>' +
        '<p class="texto-apoyo">Arriendo con opción de compra' + SEP + '<a class="enlace" href="#explorar/arriendo-opcion/' + esc(u.id) + '">' + esc(u.nombre) + '</a></p>' +
      '</header>' +
      (tuyo
        ? '<section class="noche sin-slider" aria-labelledby="titulo-plazo"><span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">¡Es tuyo!</p><strong class="numero noche-plazo">' + esc(u.nombre) + '</strong>' +
            '<p class="noche-sub">Firmaste la escritura (simulado)</p></section>'
        : !a.cumple
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-plazo"><p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-plazo">' + a.razon + '</h2><p class="texto-apoyo"><a class="enlace" href="#explorar/arriendo-opcion">Ver otros departamentos</a></p></section>'
        : '<section class="noche' + (vive ? ' sin-slider' : '') + '" aria-labelledby="titulo-plazo">' +
            '<span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">Es tuyo en</p>' +
            '<strong class="numero noche-plazo' + claseLargo(textoMeses(a.mesesTuyo)) + '" id="numero-plazo" aria-live="polite">' + textoMeses(a.mesesTuyo) + '</strong>' +
            '<span class="freno-llaves" id="freno-llaves">' + sub(a) + '</span>' +
            '<div class="noche-edificio" aria-hidden="true"><div class="noche-fachada">' +
              VENTANAS_CANVAS.map(function (v) { return v === 'tu' ? '<span class="nv tu" id="mi-ventana">' + escena(46, 'ventana-av') + '</span>' : '<span class="nv' + (v ? ' on' : '') + '"></span>'; }).join('') +
            '</div></div>' +
          '</section>') +
      (!tuyo && a.cumple && !vive
        ? '<section class="tarjeta bloque si-juntas" aria-labelledby="titulo-si-juntas">' +
            '<p class="si-juntas-fila"><label for="rango-mensual" id="titulo-si-juntas">Si juntas al mes</label><strong class="numero" id="valor-mensual">' + formatoRedondeado(mensual) + '</strong></p>' +
            '<input type="range" id="rango-mensual" min="' + minimo + '" max="' + maximo + '" step="' + paso + '" value="' + mensual + '">' +
            '<p class="delta-plazo" id="delta-plazo" aria-live="polite">Hasta mudarte: para juntar el 5' + NBSP + '%</p>' +
          '</section>' : '') +
      (tuyo ? '' : tarjetaObra()) +
      (tuyo ? '' : '<section class="tarjeta bloque despues" aria-labelledby="titulo-despues">' +
        '<p class="etiqueta" id="titulo-despues">' + (vive ? 'Hoy pagas al mes' : 'Al mudarte, pagas al mes') + '</p>' +
        '<strong class="numero">' + formatoRedondeado(a.mensualidad) + '</strong>' +
        '<ul class="detalle-filas"><li><span>Arriendo</span><strong>' + formatoRedondeado(a.arriendo) + '</strong></li>' +
          '<li><span>Va a tu pie</span><strong>' + formatoRedondeado(a.aporte) + '</strong></li>' +
          '<li><span>Al comprar, dividendo</span><span class="en-uf"><strong>' + ufDecimales(a.dividendo / SUPUESTOS.uf, 2) + '</strong><small>hoy son ' + formatoRedondeado(a.dividendo) + '</small></span></li></ul>' +
        '<a class="dueno-link" href="#explorar/arriendo-opcion/' + esc(u.id) + '">Ver el departamento ›</a>' +
      '</section>') +
      animosInicio() +
      tarjetaSiguientePaso();
    var rm = $('rango-mensual');
    if (rm) {
      var pintar = function () { var v = Number(rm.value); rm.style.setProperty('--lleno', ((v - minimo) / (maximo - minimo) * 100).toFixed(1) + '%'); return v; };
      pintar();
      rm.addEventListener('input', function () {
        var v = pintar(), y = calc(v);
        $('valor-mensual').textContent = formatoRedondeado(v);
        if ($('numero-plazo') && y.mesesTuyo !== null) $('numero-plazo').textContent = textoMeses(y.mesesTuyo);
        if ($('freno-llaves')) $('freno-llaves').textContent = sub(y);
        var ventana = $('mi-ventana'); if (ventana) { ventana.classList.remove('brilla'); void ventana.offsetWidth; ventana.classList.add('brilla'); }
      });
      rm.addEventListener('change', function () { estado.ahorroMensual = Number(rm.value); guardarEstado(); });
    }
    iniciarSiguientePaso();
  }
  // arriendoOpcion (calculos.js): mensualidad = arriendo + aporte a tu pie; cuándo es tuyo; si se sostiene.
  function fotosArriendo(u) { return fotosUsado(u); }
  function fichaArriendo(u) { return esc(u.comuna) + SEP + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + plural(u.banos || 1, 'baño', 'baños') + SEP + u.m2 + NBSP + 'm²'; }
  function siMeArrepientoArriendo() {
    return '<ul class="lista-check">' +
      '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>Si te vas sin comprar, recuperas tu ahorro inicial y la mitad de tus aportes.</span></li>' +
      '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>Lo que pagaste de arriendo no se devuelve, como en cualquier arriendo.</span></li>' +
      '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>Si Bci no te aprueba el crédito, lo recuperas todo.</span></li>' +
    '</ul>';
  }
  function renderArriendoCamino() {
    var cont = $('caminos-contenido');
    if (estado.modo !== 'vivir') { location.replace('#explorar'); return; }
    var perfil = perfilActual();
    var lista = ARRIENDOS_OPCION.map(function (u) { return { u: u, a: arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, perfil) }; })
      .sort(function (x, y) { return (y.a.cumple - x.a.cumple) || (x.a.mesesTuyo - y.a.mesesTuyo); });
    cont.innerHTML =
      '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>' +
      '<header class="encabezado">' +
        '<div class="camino-cabeza"><span class="chip chip-propuesta">Propuesta</span></div>' +
        '<h1 id="titulo-caminos" class="h2">Arriendo con opción de compra</h1>' +
        '<p class="texto-apoyo camino-descripcion">Entras con el 5' + NBSP + '% ahorrado, te mudas a un departamento terminado y lo arriendas. Parte de lo que pagas cada mes va a tu pie. Desde el tercer año, con el 20' + NBSP + '%, Bci te presta el resto y es tuyo.</p>' +
      '</header>' +
      '<p class="texto-apoyo"><small>Hoy existe en Chile con otras empresas; con Bci es una propuesta.</small></p>' +
      // Comentario 9-nov: ¿Cómo funciona? y ¿Y si me arrepiento? van solo en el detalle de cada departamento.
      (estado.caminoElegido === 'arriendo-opcion' ? '<p class="chip chip-recomendado">Tu camino</p>' : '<button type="button" class="btn btn-mi-camino" id="btn-arriendo-camino">Hacerlo mi camino</button>') +
      '<h2 class="h3 camino-explorar-titulo">Departamentos</h2>' +
      '<ul class="lista-usados">' + lista.map(function (x, i) {
        var u = x.u, a = x.a;
        var t = u.dormitorios === 2 ? '2d' : u.dormitorios === 1 ? '1d' : 'estudio';
        var foto = hayFotos() && FOTOS.interiores[t + (i % 2 ? '-cocina' : '-living')];
        return '<li class="tarjeta usado">' +
          (foto ? '<img class="usado-foto" src="fotos/interiores/' + encodeURI(foto) + '" alt="' + (i % 2 ? 'Cocina' : 'Living') + ' de un departamento de ' + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'un ambiente') + ' (foto referencial)" loading="lazy" width="800" height="600">' : '') +
          '<span class="usado-etiqueta">Terminado' + SEP + (a.mesesEntrada ? 'te mudas en ' + textoMeses(a.mesesEntrada) : 'te mudas ya') + '</span>' +
          '<h3 class="tp-nombre"><a class="usado-enlace" href="#explorar/arriendo-opcion/' + esc(u.id) + '">' + esc(u.nombre) + '</a></h3>' +
          '<p class="tp-ficha">' + fichaArriendo(u) + '</p>' +
          '<p class="tp-etiqueta">Pagas al mes</p>' +
          '<p class="usado-precio"><strong class="tp-cifra">' + formatoRedondeado(a.mensualidad) + '</strong> <span>' + formatoRedondeado(a.aporte) + ' va a tu pie</span></p>' +
          '<p class="tp-linea">' + (a.cumple ? 'Es tuyo en ' + textoMeses(a.mesesTuyo) : 'Todavía no' + SEP + primeraMinuscula(a.razon)) + '</p>' +
          '<p class="usado-ver" aria-hidden="true">Ver departamento ›</p>' +
        '</li>';
      }).join('') + '</ul>' +
      '<p class="llega-sello">' + icono('i-escudo') + 'Calculado sin plusvalía</p>' +
      '<p class="texto-apoyo texto-centro"><small>Ejemplos simulados' + SEP + 'fotos referenciales</small></p>';
    if ($('btn-arriendo-camino')) $('btn-arriendo-camino').addEventListener('click', function () { confirmarArriendo($('btn-arriendo-camino')); });
  }
  function renderArriendoDepto(id) {
    var cont = $('caminos-contenido');
    var u = ARRIENDOS_OPCION.filter(function (x) { return x.id === id; })[0];
    if (!u || estado.modo !== 'vivir') { location.replace('#explorar/arriendo-opcion'); return; }
    var perfil = perfilActual();
    var a = arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, perfil);
    var hoy = hoyDemo();
    var m0 = a.mesesEntrada || 0;
    var mes = function (n) { return n === 0 ? 'Hoy' : 'Mes ' + n; };
    var linea = (m0 ? [['Hoy', 'Juntas el 5' + NBSP + '% para entrar']] : []).concat([
      [mes(m0), 'Firmas el contrato con el precio fijo y te mudas'],
      ['Cada mes', 'Sumas ' + formatoRedondeado(a.aporte) + ' a tu pie'],
      [mes(m0 + a.mesCompra), a.mesCompra > a.mesesPie ? 'Tercer año: pides tu crédito Bci' : 'Juntaste el 20' + NBSP + '%: pides tu crédito Bci'],
      [mes(a.mesesTuyo), 'Firmas la escritura: es tuyo']
    ]);
    cont.innerHTML =
      '<a href="#explorar/arriendo-opcion" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Arriendo con opción</a>' +
      '<header class="detalle-cabecera">' +
        '<h1 id="titulo-caminos" class="h2">' + esc(u.nombre) + '</h1>' +
        '<span class="tp-tipo verde">Arriendo con opción de compra</span>' +
        '<p class="texto-apoyo">' + fichaArriendo(u) + '</p>' +
      '</header>' +
      galeria(fotosArriendo(u)) +
      '<section class="detalle-llaves" aria-labelledby="ao-tuyo"><p id="ao-tuyo">' + (a.cumple ? 'Es tuyo en' : 'Todavía no') + '</p>' +
        '<strong>' + (a.cumple ? textoMeses(a.mesesTuyo) : a.razon) + '</strong>' +
        '<p>' + (a.cumple ? fechaLlaves(a.mesesTuyo, hoy) + SEP + (m0 ? 'te mudas en ' + textoMeses(m0) : 'te mudas ya') : 'Puedes mirar otro departamento o cambiar tus números') + '</p></section>' +
      '<ul class="detalle-filas">' +
        '<li><span>Arriendo</span><strong>' + formatoRedondeado(a.arriendo) + '</strong></li>' +
        '<li><span>Va a tu pie</span><strong>' + formatoRedondeado(a.aporte) + '</strong></li>' +
        '<li><span>Pagas al mes</span><strong>' + formatoRedondeado(a.mensualidad) + '</strong></li>' +
        (a.pctIngreso !== null ? '<li class="suave"><span>Es de tu ingreso</span><span>' + formatoPorcentaje(a.pctIngreso, 0) + '</span></li>' : '') +
        '<li><span>Para entrar, el 5' + NBSP + '%</span><strong>' + formatoRedondeado(a.entrada) + '</strong></li>' +
        '<li><span>Precio de compra, fijo</span><span class="en-uf"><strong>' + formatoUF(u.listaUF) + '</strong><small>hoy son ' + formatoRedondeado(ufAPesos(u.listaUF)) + '</small></span></li>' +
        '<li><span>Juntas antes de comprar</span><strong>' + formatoRedondeado(a.meta) + '</strong></li>' +
        '<li><span>Después pagas al mes</span><span class="en-uf"><strong>' + ufDecimales(a.dividendo / SUPUESTOS.uf, 2) + '</strong><small>hoy son ' + formatoRedondeado(a.dividendo) + '</small></span></li>' +
        '<li class="suave"><span>Peor caso</span><span>' + ufDecimales(a.dividendoPeor / SUPUESTOS.uf, 2) + SEP + 'hoy ' + formatoRedondeado(a.dividendoPeor) + '</span></li>' +
      '</ul>' +
      '<section class="tarjeta bloque" aria-labelledby="ao-cuando"><h2 class="h4" id="ao-cuando">Cuándo pasa a ser tuyo</h2>' +
        '<ol class="arriendo-linea">' + linea.map(function (x, i) {
          return '<li' + (i === linea.length - 1 ? ' class="final"' : '') + '><span class="arriendo-cuando">' + x[0] + '</span><span>' + x[1] + '</span></li>';
        }).join('') + '</ol>' +
        '<p class="texto-apoyo"><small>Mientras arriendas, el departamento es del socio. Es tuyo al firmar la escritura. Bci presta el 80' + NBSP + '% sin subsidio a la tasa (segunda venta).</small></p></section>' +
      plegable('arriendo-arrepiento', '¿Y si me arrepiento?', 'Recuperas parte de tu pie', siMeArrepientoArriendo()) +
      barrioHtml(u) +
      '<p class="llega-sello detalle-sello">' + icono('i-escudo') + 'Calculado sin plusvalía</p>' +
      (esArriendo() && estado.arriendoElegido === u.id
        ? '<div class="accion-fija detalle-accion"><p class="aviso">Es tu departamento.</p><a class="btn btn-secundario-dark btn-bloque" href="#camino">Ver mi camino</a></div>'
        : '<div class="accion-fija detalle-accion"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-arriendo-depto">Quiero este departamento</button></div>') +
      '<p class="texto-apoyo texto-centro"><small>Ejemplo simulado' + SEP + 'fotos referenciales' + SEP + 'arriendo: ' + u.origenArriendo + '</small></p>';
    iniciarGalerias(cont);
    iniciarPlegables();
    iniciarVisita(u);
    if ($('btn-arriendo-depto')) $('btn-arriendo-depto').addEventListener('click', function () { confirmarArriendo($('btn-arriendo-depto'), u); });
  }

  // Hacerlo mi camino: muestra qué cambia y pide confirmar. Lo hecho (cuenta, ahorro, misiones) se conserva.
  function confirmarMiCamino(id, boton) {
    var perfil = perfilActual();
    var antes = estado.caminoElegido && CAMINOS[estado.caminoElegido] && !CAMINOS[estado.caminoElegido].ficha ? mesesDeCamino(estado.caminoElegido, perfil) : null;
    var despues = mesesDeCamino(id, perfil);
    var hitosAntes = estado.caminoElegido ? (CAMINOS[estado.caminoElegido].grupo ? 'grupo' : 'individual') : null;
    var cambio = (antes !== null ? 'Tu fecha pasa de ' + textoLlegada(antes) + ' a ' + textoLlegada(despues) + '.' : 'Llegas en ' + textoLlegada(despues) + '.') +
      (hitosAntes && hitosAntes !== (CAMINOS[id].grupo ? 'grupo' : 'individual') ? ' Cambia el orden de tus hitos.' : '');
    abrirHojaContenido('¿Hacerlo tu camino?',
      '<p class="texto-apoyo">' + cambio + '</p><p class="texto-apoyo">Tu cuenta, tu ahorro y tus misiones se mantienen.</p>' +
      '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-confirmar-camino">Sí, hacerlo mi camino</button></div>', boton,
      function () {
        $('btn-confirmar-camino').addEventListener('click', function () {
          estado.caminoElegido = id;
          if (estado.modo === 'vivir') estado.piezas = Object.assign({}, estado.piezas, { grupo: !!CAMINOS[id].grupo });
          guardarEstado();
          registro.camino = id; guardarRegistro();
          cerrarHoja(false);
          toast('Tu camino: ' + primeraMinuscula(CAMINOS[id].corto) + '.');
          mostrar();
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
      VER_TODOS +
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
      toast('Listo: te recordamos tu meta cada mes (simulado).');
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
    if (id === 'respaldo-familiar') return renderRespaldo(cont);
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
      '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>' +
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

  // ---------- S24-B2: Respaldo familiar, como en el canvas ----------
  // Héroe con dibujo, "Tú / Tu familiar", un slider de precio y los pasos.
  var respaldoVista = 'tu', respaldoUF = null;
  var DIBUJO_RESPALDO = '<svg class="respaldo-dibujo" aria-hidden="true" viewBox="0 0 320 110">' +
    '<rect x="0" y="104" width="320" height="6" rx="3" fill="rgba(255,255,255,0.25)"/>' +
    '<circle cx="48" cy="44" r="13" fill="#E8BFA0"/><path d="M35 40a13 13 0 0 1 26 0c-6-5-18-5-26 0z" fill="#BBC5CA"/><path d="M24 104c0-24 11-40 24-40s24 16 24 40z" fill="#FFE300"/>' +
    '<circle cx="112" cy="50" r="12" fill="#E8BFA0"/><path d="M100 46a12 12 0 0 1 24 0c-6-4-17-4-24 0z" fill="#37474F"/><path d="M90 104c0-22 10-36 22-36s22 14 22 36z" fill="#28892B"/>' +
    '<path d="M80 30s-9-5.5-9-11.5a5 5 0 0 1 9-2.8 5 5 0 0 1 9 2.8c0 6-9 11.5-9 11.5z" fill="#ED0C19"/>' +
    '<path d="M150 80h60" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 8"/><path d="M206 74l8 6-8 6" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="236" y="24" width="64" height="80" rx="4" fill="#1B3A63"/>' +
    '<rect x="246" y="34" width="12" height="10" rx="2" fill="#FFE300"/><rect x="266" y="34" width="12" height="10" rx="2" fill="#2E4F80"/><rect x="286" y="34" width="6" height="10" rx="2" fill="#FFE300"/>' +
    '<rect x="246" y="52" width="12" height="10" rx="2" fill="#2E4F80"/><rect x="266" y="52" width="12" height="10" rx="2" fill="#FFF499"/><rect x="286" y="52" width="6" height="10" rx="2" fill="#2E4F80"/>' +
    '<rect x="246" y="70" width="12" height="10" rx="2" fill="#FFE300"/><rect x="286" y="70" width="6" height="10" rx="2" fill="#FFE300"/>' +
    '<rect x="262" y="84" width="16" height="20" rx="2" fill="#2772CC"/></svg>';
  function renderRespaldo(cont) {
    var id = 'respaldo-familiar';
    if (respaldoUF === null) respaldoUF = Math.min(3000, Math.max(1500, Math.round(listaMeta() / 100) * 100));
    var f = respaldoFamiliar(respaldoUF);
    var interesa = registro.meInteresa.indexOf(id) !== -1;
    var tu = respaldoVista === 'tu';
    var pasos = [['Tu familiar deja el 10' + NBSP + '%', 'Lo guarda en una cuenta Bci con intereses, como garantía.', 'azul'],
      ['Bci te presta el 95' + NBSP + '%', 'Tú pones solo el 5' + NBSP + '% de pie.', 'verde'],
      ['La plata vuelve a tu familiar', 'Cuando tu deuda baja al 80' + NBSP + '% del valor, el depósito se libera.', 'azul-oscuro']];
    cont.innerHTML =
      '<a href="#explorar" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Explorar</a>' +
      '<section class="respaldo-heroe" aria-labelledby="titulo-ficha">' +
        '<span class="respaldo-chip">Propuesta' + SEP + 'aún no existe en Chile</span>' +
        '<h1 id="titulo-ficha" class="h2">Respaldo familiar</h1>' +
        '<p>Un familiar te ayuda con el pie <strong>sin regalarte la plata</strong>: la deja guardada en Bci como garantía y la recupera después.</p>' +
        DIBUJO_RESPALDO +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="titulo-vista">' +
        '<h2 class="h4" id="titulo-vista">¿Cómo lo vive cada uno?</h2>' +
        '<div class="respaldo-pestanas" role="tablist" aria-label="Punto de vista">' +
          '<button type="button" role="tab" id="tab-tu" aria-selected="' + tu + '" aria-controls="vista-tu">Tú</button>' +
          '<button type="button" role="tab" id="tab-fam" aria-selected="' + !tu + '" aria-controls="vista-fam">Tu familiar</button></div>' +
        '<div id="vista-tu" role="tabpanel" aria-labelledby="tab-tu"' + (tu ? '' : ' hidden') + '>' +
          '<p class="respaldo-titular">Juntas la mitad del pie</p>' +
          '<div class="respaldo-compara">' +
            '<p><small>Sin respaldo</small><strong id="rf-pie10">' + formatoPesos(ufAPesos(respaldoUF * 0.1)) + '</strong><small>10' + NBSP + '% de pie</small></p>' +
            '<p class="con"><small>Con respaldo</small><strong id="rf-pie5">' + formatoPesos(f.pie) + '</strong><small>5' + NBSP + '% de pie</small></p></div>' +
          '<p class="respaldo-dividendo"><span>Tu dividendo al mes</span><span class="en-uf"><strong id="rf-div-uf">' + ufDecimales(f.dividendo / SUPUESTOS.uf, 2) + '</strong><small id="rf-div">hoy son ' + formatoPesos(f.dividendo) + '</small></span></p>' +
        '</div>' +
        '<div id="vista-fam" role="tabpanel" aria-labelledby="tab-fam"' + (tu ? ' hidden' : '') + '>' +
          '<p class="respaldo-titular">Deja su plata guardada, no la regala</p>' +
          '<p class="respaldo-deposito"><span><small>Deja en Bci</small><strong id="rf-deposito">' + formatoRedondeado(f.deposito) + '</strong></span><small>10' + NBSP + '%' + SEP + 'con intereses</small></p>' +
          '<p class="respaldo-dividendo"><span>La recupera en</span><strong>' + (f.mesesLibera / 12).toFixed(1).replace('.', ',') + ' años</strong></p>' +
          '<p class="texto-apoyo"><small>Cuando tu deuda baja al 80' + NBSP + '%</small></p>' +
        '</div>' +
      '</section>' +
      '<section class="tarjeta bloque si-juntas" aria-labelledby="rf-precio">' +
        '<p class="si-juntas-fila"><label for="rf-rango" id="rf-precio">Si tu departamento cuesta</label><strong class="numero" id="rf-uf">' + formatoUF(respaldoUF) + '</strong></p>' +
        '<input type="range" id="rf-rango" min="1500" max="3000" step="100" value="' + respaldoUF + '">' +
        '<p class="texto-apoyo"><small>Mueve la barra: los montos de arriba cambian.</small></p>' +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="rf-como">' +
        '<h2 class="h4" id="rf-como">Cómo funciona</h2>' +
        '<ol class="respaldo-pasos">' + pasos.map(function (x, i) {
          return '<li><span class="respaldo-num ' + x[2] + '" aria-hidden="true">' + (i + 1) + '</span><span><strong>' + x[0] + '</strong><small>' + x[1] + '</small></span></li>';
        }).join('') + '</ol>' +
      '</section>' +
      '<p class="respaldo-riesgo">' + icono('i-alerta') + '<span><strong>Lo que hay que saber</strong><small>Si no pagas y hay remate, tu familiar puede perder su depósito.</small></span></p>' +
      '<p class="respaldo-inspira"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>Se inspira en Barclays Family Springboard, del Reino Unido.</p>' +
      '<div class="respaldo-accion" id="rf-accion">' + (interesa
        ? '<p class="respaldo-anotado" role="status">' + icono('i-check') + '<span><strong>¡Anotado!</strong><small>Te avisamos si Bci lo lanza.</small></span></p>'
        : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-me-interesa">Me interesa</button>') + '</div>';

    ['tu', 'fam'].forEach(function (v) {
      $('tab-' + v).addEventListener('click', function () { respaldoVista = v; renderRespaldo(cont); $('tab-' + v).focus(); });
    });
    var rango = $('rf-rango');
    var pintar = function () { rango.style.setProperty('--lleno', ((respaldoUF - 1500) / 1500 * 100).toFixed(1) + '%'); };
    pintar();
    rango.addEventListener('input', function () {
      respaldoUF = Number(rango.value);
      var g = respaldoFamiliar(respaldoUF);
      $('rf-uf').textContent = formatoUF(respaldoUF);
      $('rf-pie10').textContent = formatoPesos(ufAPesos(respaldoUF * 0.1));
      $('rf-pie5').textContent = formatoPesos(g.pie);
      $('rf-div-uf').textContent = ufDecimales(g.dividendo / SUPUESTOS.uf, 2);
      $('rf-div').textContent = 'hoy son ' + formatoPesos(g.dividendo);
      $('rf-deposito').textContent = formatoRedondeado(g.deposito);
      rango.setAttribute('aria-valuetext', formatoUF(respaldoUF) + ': pones ' + formatoRedondeado(g.pie));
      pintar();
    });
    if ($('btn-me-interesa')) $('btn-me-interesa').addEventListener('click', function () {
      registro.meInteresa.push(id);
      guardarRegistro();
      renderRespaldo(cont);
      confeti();
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
      if (enGrupoDe(p) && paso < 4) {
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

  // S25: cada aviso con su círculo de color, como en el canvas.
  var ICONO_AVISO = {
    cuota: ['verde', 'M3.5 5h17v15.5h-17zM3.5 10h17M8 3v4M16 3v4'],
    grupo: ['azul', 'M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z'],
    obra: ['amarillo', 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zM12 7v5l3 2'],
    departamento: ['azul', 'M3.5 10.5L12 4l8.5 6.5V20H3.5z']
  };
  function renderAvisos() {
    var avisos = avisosDelMes(contextoAvisos());
    estado.avisosVistos = claveMesAvisos();
    guardarEstado();
    $('avisos-contenido').innerHTML =
      '<a href="#camino" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Inicio</a>' +
      '<header class="encabezado"><h1 id="titulo-avisos" class="h2">Avisos</h1>' +
        '<p class="texto-apoyo">Este mes' + SEP + 'máximo uno por semana</p></header>' +
      (avisos.length
        ? '<ol class="notificaciones">' + avisos.map(function (a, i) {
            return '<li class="notificacion" style="animation-delay:' + (i * 60) + 'ms">' +
              '<span class="notificacion-app ' + (ICONO_AVISO[a.tipo] || ICONO_AVISO.cuota)[0] + '" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + (ICONO_AVISO[a.tipo] || ICONO_AVISO.cuota)[1] + '"/></svg></span>' +
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


  // ---------- S22-F1: avance de obra con foto ----------
  // Si está la foto de la etapa (fotos/obra/), se usa; si no, un dibujo de línea de esa etapa.
  var DIBUJO_ETAPA = [
    // Excavación: terreno abierto y una grúa
    '<path d="M8 70h104" /><path d="M24 70l8-14h56l8 14" /><path d="M86 70V18h4v52M60 18h44M90 18l-6 10" /><path d="M66 18v18" /><rect x="62" y="36" width="8" height="6" />',
    // Obra gruesa: estructura sin ventanas
    '<path d="M8 70h104" /><path d="M34 70V22h52v48" /><path d="M34 34h52M34 46h52M34 58h52M52 22v48M68 22v48" /><path d="M96 70V12h3v58M80 12h32" />',
    // Terminaciones: fachada con algunas ventanas
    '<path d="M8 70h104" /><rect x="34" y="20" width="52" height="50" /><rect x="40" y="27" width="10" height="8" /><rect x="55" y="27" width="10" height="8" /><rect x="70" y="27" width="10" height="8" /><rect x="40" y="42" width="10" height="8" /><rect x="55" y="42" width="10" height="8" /><path d="M70 42h10M70 50h10M40 57h10" />',
    // Recepción: edificio terminado con puerta y árbol
    '<path d="M8 70h104" /><rect x="34" y="20" width="52" height="50" /><rect x="40" y="27" width="10" height="8" /><rect x="55" y="27" width="10" height="8" /><rect x="70" y="27" width="10" height="8" /><rect x="40" y="42" width="10" height="8" /><rect x="55" y="42" width="10" height="8" /><rect x="70" y="42" width="10" height="8" /><path d="M55 70V58h10v12" /><circle cx="100" cy="54" r="7" /><path d="M100 61v9" />'
  ];
  function obraVisual(p) {
    var etapa = etapaObraHoy(p);
    var slug = FOTOS_ETAPA[etapa];
    var foto = hayFotos() && FOTOS.obra && FOTOS.obra[slug] ? 'fotos/obra/' + encodeURI(FOTOS.obra[slug]) : null;
    var mEntrega = mesesParaEntrega(p);
    var imagen = foto
      ? '<img class="obra-foto" src="' + foto + '" alt="Edificio en ' + ETAPAS_OBRA[etapa].toLowerCase() + ' (foto referencial)" loading="lazy">'
      : '<svg class="obra-dibujo" viewBox="0 0 120 76" role="img" aria-label="Edificio en ' + ETAPAS_OBRA[etapa].toLowerCase() + '">' + DIBUJO_ETAPA[Math.min(3, etapa)] + '</svg>';
    return '<figure class="obra-visual">' + imagen +
      '<figcaption><strong>' + ETAPAS_OBRA[etapa] + '</strong>' +
        (p.entregaEstimada ? SEP + (mEntrega > 0 ? 'Entrega en ' + fechaLlaves(0, p.entregaEstimada) : 'Entregado') : '') +
        '<small>' + (foto ? 'Foto referencial' : 'Dibujo referencial') + '</small></figcaption></figure>';
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
        siAlguienSeVa(p) +
        tusVecinos(p, r) +
        // S18-F2: la obra dice la entrega del edificio, con el mismo reloj que Tus llaves.
        '<h3 class="h5 bloque">Tu obra</h3>' +
        obraVisual(p) +
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


  // ---------- S22-F3: regalo de pie por enlace ----------
  function codigoRegalo() {
    if (!estado.listaRegalos.codigo) {
      estado.listaRegalos.codigo = Math.random().toString(36).slice(2, 10);
      guardarEstado();
    }
    return estado.listaRegalos.codigo;
  }
  function textoMensajeRegalo() {
    var s = fotoPasos();
    var pct = s.meta > 0 ? s.ahorrado / s.meta * 100 : 0;
    var faltan = estado.ahorroMensual > 0 && s.meta > s.ahorrado ? Math.ceil((s.meta - s.ahorrado) / estado.ahorroMensual) : 0;
    return mensajeRegalo({ ocasion: estado.listaRegalos.ocasion, pct: pct, mesesFaltan: faltan, enlace: enlaceRegalo(codigoRegalo()) });
  }
  function abrirPedirRegalo(boton) {
    if (!estado.listaRegalos) { estado.listaRegalos = { ocasion: OCASIONES[0], mostrarMontos: false }; guardarEstado(); }
    var dibujar = function () {
      return '<fieldset class="escala"><legend>¿Para qué ocasión?</legend><div class="escala-opciones escala-envuelve">' +
          OCASIONES.map(function (o, k) {
            return '<input type="radio" name="ocasion-regalo" id="ocasion-regalo-' + k + '" value="' + o + '"' + (o === estado.listaRegalos.ocasion ? ' checked' : '') + '>' +
              '<label for="ocasion-regalo-' + k + '">' + o + '</label>';
          }).join('') + '</div></fieldset>' +
        '<p class="etiqueta">Tu mensaje</p><blockquote class="mensaje-regalo" id="mensaje-regalo">' + esc(textoMensajeRegalo()) + '</blockquote>' +
        '<p class="texto-apoyo"><small>Sin montos ni datos tuyos: solo cuánto llevas en % y los meses que faltan.</small></p>' +
        '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-compartir-regalo">Compartir enlace</button>' +
        '<a class="btn btn-terciario btn-bloque" href="#regalo">Ver como familia</a></div>';
    };
    abrirHojaContenido('Regalo para tu pie', dibujar(), boton, function (hoja) {
      hoja.querySelectorAll('input[name="ocasion-regalo"]').forEach(function (r) {
        r.addEventListener('change', function () {
          estado.listaRegalos.ocasion = r.value; guardarEstado();
          $('mensaje-regalo').textContent = textoMensajeRegalo();
        });
      });
      $('btn-compartir-regalo').addEventListener('click', function () {
        var texto = textoMensajeRegalo();
        if (navigator.share) { navigator.share({ text: texto }).catch(function () {}); return; }
        try { navigator.clipboard.writeText(texto); } catch (e) { /* sin portapapeles */ }
        toast('Mensaje copiado (simulado).');
      });
    });
  }

  // Lo que ve la familia al abrir el enlace: una sola pantalla, sin cuenta ni app.
  function renderRegaloFamilia() {
    var cont = $('regalo-contenido');
    var c = estado.compra;
    // S22-F3: también sin compra, desde Tu pie. Con compra en el paso del pie, vuelve a esa pantalla.
    var conCompra = !!(c && pasoEfectivo() === 2);
    var volverA = conCompra ? '#mis-proyectos/compra' : '#pie';
    var volver = '<p class="vista-familia">' + icono('i-persona') + 'Así lo ve tu familia · simulado ' +
      '<a class="enlace" href="' + volverA + '">Volver</a></p>';
    var sp = fotoPasos();
    if (!estado.listaRegalos || !sp.cuentaVivienda || !(sp.meta > 0) || (c && !conCompra)) {
      cont.innerHTML = volver + '<div class="vacio">' + icono('i-regalo', 'icono-grande') + '<h1 class="h3" id="titulo-regalo">Primero abre tu cuenta y crea tu enlace en Tu pie</h1></div>';
      return;
    }
    if (!estado.ahorroIniciado) { estado.ahorrado = sp.ahorrado; estado.ahorroIniciado = true; guardarEstado(); }
    var p = proyectoCompra();
    var meta = sp.meta;
    var lista = estado.listaRegalos;

    var esPadre = function (r) { return ['mamá', 'papá', 'abuela', 'abuelo'].indexOf(r) !== -1; };
    var sel = { monto: 2, avatar: 0, relacion: RELACIONES[0], mensaje: '' };
    var cumple = /umple/.test(lista.ocasion);
    // S24-B4: igual que el canvas: tarjeta de regalo, montos con nombre, avatar y cómo le llega el aviso.
    cont.innerHTML = volver +
      '<section class="regalo-tarjeta" aria-labelledby="titulo-regalo">' +
        '<span class="regalo-papel r1" aria-hidden="true"></span><span class="regalo-papel r2" aria-hidden="true"></span><span class="regalo-papel r3" aria-hidden="true"></span><span class="regalo-papel r4" aria-hidden="true"></span>' +
        '<div class="regalo-tarjeta-cabeza"><img src="logo_bci_negro.svg" alt="Bci" width="52" height="24">' +
          '<span class="regalo-ocasion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h16v-8H4zM6 13V9h12v4M12 9V6M12 6a1.5 1.5 0 1 0 0-.01"/></svg>' + esc(lista.ocasion) + '</span></div>' +
        '<div class="regalo-tarjeta-titulo"><span class="regalo-caja" aria-hidden="true">' + REGALO_SVG + '</span>' +
          '<h1 class="h3" id="titulo-regalo">Un aporte para su primer departamento</h1></div>' +
        '<p>Está juntando su pie en una Cuenta Vivienda Bci. Tu regalo la acerca a sus llaves.</p>' +
      '</section>' +
      '<div id="regalo-cuerpo"></div>';

    function pintar() {
      var monto = MONTOS_REGALO[sel.monto];
      $('regalo-cuerpo').innerHTML =
        '<section class="tarjeta bloque regalo-aporte" aria-labelledby="titulo-tu-aporte">' +
          '<h2 class="h4" id="titulo-tu-aporte">Elige tu aporte</h2>' +
          '<div class="regalo-montos" role="radiogroup" aria-label="Monto">' + MONTOS_REGALO.map(function (m, k) {
            return '<button type="button" role="radio" aria-checked="' + (k === sel.monto) + '" data-monto="' + k + '"><strong>' + formatoPesos(m) + '</strong><small>' + NOMBRE_MONTO[k] + '</small></button>';
          }).join('') + '</div>' +
          '<p class="regalo-cerca" aria-live="polite">' + icono('i-corazon') + '<span>Cada aporte le deja más cerca de sus llaves.</span></p>' +
          '<div class="campo"><label for="regalo-relacion">Eres su</label>' +
            '<span class="regalo-select"><select id="regalo-relacion" class="campo-select">' + RELACIONES.map(function (r) { return '<option' + (r === sel.relacion ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span></div>' +
          '<div class="campo"><label for="regalo-mensaje">Escríbele algo (opcional)</label>' +
            '<textarea id="regalo-mensaje" class="campo-texto regalo-texto" maxlength="140" rows="3" placeholder="' + (cumple ? '¡Feliz cumpleaños! ' : '') + 'Para tu departamento…">' + esc(sel.mensaje) + '</textarea></div>' +
          '<div class="regalo-avatares-campo"><span class="etiqueta-campo" id="titulo-avatar">Elige tu avatar</span>' +
            '<div class="regalo-avatares" role="radiogroup" aria-labelledby="titulo-avatar">' + AVATARES_REGALO.map(function (a, k) {
              return '<button type="button" role="radio" aria-checked="' + (k === sel.avatar) + '" data-avatar="' + k + '" aria-label="Avatar ' + (k + 1) + '" style="--fondo:' + a.fondo + '">' + avatarSVG(a.av, 40) + '</button>';
            }).join('') + '</div></div>' +
          '<div class="regalo-aviso-campo"><span class="etiqueta-campo">Así le llegará el aviso</span>' +
            '<div class="regalo-aviso"><span class="regalo-aviso-av" style="--fondo:' + AVATARES_REGALO[sel.avatar].fondo + '">' + avatarSVG(AVATARES_REGALO[sel.avatar].av, 40) + '</span>' +
              '<span><span class="regalo-aviso-app"><span>Primer Peldaño · Bci</span><span>ahora</span></span>' +
              '<strong>Tu ' + sel.relacion + ' te regaló ' + formatoPesos(monto) + ' para tu pie</strong>' +
              '<small id="regalo-aviso-texto">' + (sel.mensaje ? '“' + esc(sel.mensaje) + '”' : 'Toca para verlo y darle las gracias.') + '</small></span></div></div>' +
          '<div class="regalo-seguro"><p>' + icono('i-candado') + 'Va directo a su cuenta Bci para el pie</p>' +
            (esPadre(sel.relacion) ? '<p class="texto-apoyo"><small>Como eres su ' + sel.relacion + ', si lo haces por escritura hasta noviembre de 2027, la donación paga la mitad del impuesto ' + ayuda('donacion') + '</small></p>' : '') + '</div>' +
          '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-aportar">Aportar ' + formatoPesos(monto) + '</button>' +
        '</section>';
      document.querySelectorAll('[data-monto]').forEach(function (b) {
        b.addEventListener('click', function () { sel.monto = Number(b.dataset.monto); pintar(); document.querySelector('[data-monto="' + sel.monto + '"]').focus(); });
      });
      document.querySelectorAll('[data-avatar]').forEach(function (b) {
        b.addEventListener('click', function () { sel.avatar = Number(b.dataset.avatar); pintar(); document.querySelector('[data-avatar="' + sel.avatar + '"]').focus(); });
      });
      $('regalo-relacion').addEventListener('change', function () { sel.relacion = $('regalo-relacion').value; pintar(); $('regalo-relacion').focus(); });
      $('regalo-mensaje').addEventListener('input', function () {
        sel.mensaje = $('regalo-mensaje').value.slice(0, 140);
        $('regalo-aviso-texto').textContent = sel.mensaje ? '“' + sel.mensaje + '”' : 'Toca para verlo y darle las gracias.';
      });
      $('btn-aportar').addEventListener('click', aportar);
    }

    function aportar() {
      // El regalo suma una vez: el botón se apaga al tocarlo.
      if ($('btn-aportar').disabled) return;
      $('btn-aportar').disabled = true;
      var monto = MONTOS_REGALO[sel.monto];
      var regalo = { relacion: sel.relacion, monto: monto, mensaje: sel.mensaje.trim(), avatar: AVATARES_REGALO[sel.avatar].av };
      estado.regalos = estado.regalos.concat([regalo]);
      // Quien aporta queda en Tu equipo.
      if (!miembrosCon([regalo.relacion]).length) estado.equipo = agregarMiembro(estado.equipo, regalo.relacion, regalo.avatar);
      estado.ahorrado = Math.min(meta, estado.ahorrado + monto);
      guardarEstado();
      if (conCompra && estado.ahorrado >= meta && !entregaPendiente(p)) guardarCompra(Object.assign({}, estado.compra, { paso: 3 }));
      var nuevo = porcentajeEntero(avance(estado.ahorrado, meta));
      $('regalo-cuerpo').innerHTML =
        '<section class="regalo-gracias" role="status">' +
          '<span class="regalo-cae c1" aria-hidden="true"></span><span class="regalo-cae c2" aria-hidden="true"></span><span class="regalo-cae c3" aria-hidden="true"></span><span class="regalo-cae c4" aria-hidden="true"></span>' +
          '<span class="regalo-corazon" aria-hidden="true">' + icono('i-corazon') + '</span>' +
          '<strong>¡Gracias por tu aporte!</strong>' +
          '<p>Tu aporte de ' + formatoPesos(monto) + ' ya está en su pie.</p>' +
          '<span class="regalo-lleva">Ahora lleva ' + nuevo + NBSP + '% de su pie</span>' +
          '<a class="regalo-volver" href="' + volverA + '">Volver</a>' +
        '</section>';
      window.scrollTo(0, 0);
    }
    pintar();
  }
  var NOMBRE_MONTO = ['Un empujón', 'Un gran paso', 'Un salto a su meta'];
  var AVATARES_REGALO = [
    { fondo: '#D4E3F5', av: { piel: 1, pelo: 'largo', colorPelo: 0, ropa: 0 } },
    { fondo: '#D4E7D5', av: { piel: 2, pelo: 'corto', colorPelo: 1, ropa: 2 } },
    { fondo: '#FFF9CC', av: { piel: 0, pelo: 'moño', colorPelo: 5, ropa: 3 } },
    { fondo: '#FBCED1', av: { piel: 3, pelo: 'corto', colorPelo: 5, ropa: 1 } },
    { fondo: '#E2E8EA', av: { piel: 1, pelo: 'ondulado', colorPelo: 2, ropa: 4 } },
    { fondo: '#D4E3F5', av: { piel: 4, pelo: 'rizado', colorPelo: 0, ropa: 2 } }
  ];
  var REGALO_SVG = '<svg width="44" height="44" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="1" fill="#FBCED1" stroke="#B20913" stroke-width="1.8"/>' +
    '<path d="M3 7h18v3H3z" fill="#ED0C19" stroke="#B20913" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7v13" stroke="#B20913" stroke-width="1.8"/>' +
    '<path d="M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="#B20913" stroke-width="1.8" stroke-linecap="round"/></svg>';

  // S13-F5: lo tuyo en el departamento hoy y cuánto creció este mes (sin plusvalía).
  var loTuyoMostrado = null;
  function loTuyo(m) {
    var html = '<section class="lo-tuyo md-patrimonio" aria-labelledby="titulo-lo-tuyo">' +
      '<p><span id="titulo-lo-tuyo">Tu patrimonio</span> ' + ayuda('patrimonio') + '</p><strong id="lo-tuyo"></strong>' +
      '<p class="md-crecio">Creció ' + formatoPesos(ufAPesos(m.crecimientoUF)) + ' este mes</p>' +
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
          '<span><strong>Tu avatar y tu equipo</strong><small>' + (estado.equipo.length ? textoEquipoPerfil() : (estado.avatar ? 'Cambiar' : 'Créalo')) + '</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></button></li>' +
        fila('b', '', 'i-persona', 'Mis datos', (estado.modo === 'vivir' ? 'Para vivir' : 'Para arrendar') + (ingreso ? SEP + formatoPesos(ingreso) + ' al mes' : ''), 'btn-mis-datos') +
        fila('a', '#perfil/avisos', 'i-campana', 'Avisos', activos + ' de ' + TIPOS_AVISO.length + ' activos') +
        fila('a', '#inversiones', 'i-sube', 'Invertir en el pie de otros', estado.inversiones.length ? plural(estado.inversiones.length, 'inversión', 'inversiones') : '6' + NBSP + '% al año en UF') +
        fila('a', '#perfil/ayuda', 'i-ayuda', 'Ayuda', 'Qué significa cada término') +
        fila('a', '#bienvenida', 'i-casa', 'Ver la introducción', '') +
        fila('a', '#registro', 'i-documento', 'Sesión de prueba', 'Para las entrevistas') +
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

  // S25: "Tu pareja y tu mamá te acompañan", como en el canvas.
  function textoEquipoPerfil() {
    var n = estado.equipo.map(function (m) { return (NOMBRE_RELACION[m.relacion] || m.relacion).replace(/^Tu /, 'tu '); });
    if (!n.length) return '';
    var t = n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1];
    return t.charAt(0).toUpperCase() + t.slice(1) + (n.length === 1 ? ' te acompaña' : ' te acompañan');
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
      case 'caminos': case 'mes-real': return '#explorar';
      case 'camino': return p[1] === 'caminos' ? '#explorar' : null;
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
    // S21-B1: cuatro pestañas. Las direcciones de antes se mantienen; cambia la pestaña que se marca.
    if (p[0] === 'pasos') return r('pasos', 'pasos', renderTusPasos);
    // S21-B5: Tu pie. Si la compra está en su paso del pie, se usa esa pantalla.
    if (p[0] === 'pie') return r('pie', 'inicio', function () { if (estado.compra && pasoEfectivo() === 2) location.replace('#camino/pie'); else renderTuPie(); });
    if (p[0] === 'explorar') {
      if (p[1] === 'cambia') return r('caminos', 'explorar', function () { cambiosActivos = {}; renderCaminos(); });
      // 9-nov: arriendo con opción de compra: el camino y cada departamento.
      if (p[1] === 'arriendo-opcion') return r('caminos', 'explorar', function () { if (p[2]) renderArriendoDepto(p[2]); else renderArriendoCamino(); });
      if (p[1] && p[2] === 'como') return r('caminos', 'explorar', function () { renderLlegaAntes(p[1]); });
      if (p[1] === 'usados' && p[2]) return r('caminos', 'explorar', function () { renderUsado(p[2]); });
      if (p[1] === 'usados') return r('caminos', 'explorar', renderUsados);
      if (p[1] === 'guardados') return r('caminos', 'explorar', renderGuardados);
      if (p[1]) return r('caminos', 'explorar', function () { renderUnCamino(p[1]); });
      return r('caminos', 'explorar', renderExplorar);
    }
    if (p[0] === 'departamentos') {
      if (p[1]) return r('proyecto', 'explorar', function () { renderDetalle(p[1], 'departamentos'); });
      return r('proyectos', 'explorar', function () { renderLista('explorar'); });
    }
    if (p[0] === 'inversiones') {
      if (p[1] === 'como') return r('invertir-como', 'perfil', renderInvertirComo);
      if (p[1] && p[2] === 'invertir') return r('invertir', 'perfil', function () { renderInvertir(p[1]); });
      if (p[1]) return r('proyecto', 'perfil', function () { renderDetalle(p[1], 'inversiones'); });
      return r('inversiones', 'perfil', renderInversiones);
    }
    // #camino/…: Explorar (fichas, elegir, departamento), Tus pasos (pasos de la compra) o Inicio.
    switch (p[1]) {
      case 'ficha': return r('ficha', 'explorar', function () { if (p[2] === 'arriendo-opcion') location.replace('#explorar/arriendo-opcion'); else renderFicha(p[2]); });
      case 'dueno': return r('caminos', p[2] ? 'explorar' : 'inicio', function () { renderMesDueno(p[2]); });
      case 'elegir': return r('proyectos', 'explorar', function () { renderLista('camino'); });
      // 9-nov: #camino/proyecto/<departamento>/<camino>: el camino desde el que se mira (Explorar → Un camino).
      case 'proyecto': return r('proyecto', 'explorar', function () { renderDetalle(p[2], 'camino', CAMINOS[p[3]] ? p[3] : null); });
      case 'avisos': return r('avisos', 'inicio', renderAvisos);
      case 'postular': case 'pie': case 'firmar': case 'mi-departamento':
        return r('mis-proyectos', 'pasos', function () { renderPaso(p[1], p[2]); });
    }
    return r('inicio', 'inicio', renderInicio);
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
