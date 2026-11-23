// Estado y render de las pantallas de Primer Peldaño.
// Las cifras salen siempre de js/calculos.js; aquí solo se muestran.

(function () {
  // Ruta → pantalla que se muestra y botón de la barra que queda activo.
  // S15-F1: cuatro pestañas. La primera parte de la dirección dice la pestaña; el resto, la pantalla.
  var RUTAS = {
    'bienvenida': 'bienvenida', 'compra': 'compra', 'pie': 'pie', 'departamentos': 'deptos',
    'inversiones': 'perfil', 'perfil': 'perfil', 'registro': 'perfil', 'regalo': 'compra'
  };

  // S21-B3: hitos y misiones que se marcan como hechos (simulado).
  // 23-nov: «Sumar a alguien al crédito»: opciones válidas del acuerdo.
  var ACUERDO_CON = ['pareja', 'familiar', 'otra'];
  var ACUERDO_PAGA = ['parte', 'mitad'];
  var ACUERDO_SALE = ['vende', 'compra'];
  var CLAVES_PASOS = ['cuentaVivienda', 'rsh', 'ds1Postulado', 'documentos', 'bajoLlave', 'preaprobado', 'contratoArriendo', 'arriendoTuyo', 'usadoReservado', 'usadoTuyo', 'sumarAgregado'];
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
    mesesTrabajo: null,      // S31-A: meses en el trabajo actual (¿Listo para el banco?)
    deudasAtrasadas: null,   // S31-A: true / false; null = no lo ha dicho
    rshTramo: null,          // S31-D: tramo del Registro Social (40 a 100); null = no lo sabe
    caminoAnterior: null,    // S32-B4: { id, listos } el camino de antes, para «Volver» hasta el siguiente paso
    prioridadRespondida: false, // 23-nov: ya contestó «¿Qué es lo que más te importa?» en Departamentos (también si dijo «No estoy seguro»)
    prioridad: null,         // S32-B4: lo que más le importa al comparar: 'antes', 'menos' o 'ya'
    respaldoAceptado: false, // 23-nov: el familiar aceptó ser el respaldo (pantalla de consentimiento, simulada)
    acuerdoCredito: null,    // 23-nov: acuerdo de «Sumar a alguien al crédito»: { con, tuParte, quienPaga, siSale }
    usadoElegido: null,      // S32-B5: el usado elegido como meta en el crédito tradicional (USADOS)
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
    'avisosApagados', 'cuotaAutomatica', 'parejaInvitada', 'regalos', 'listaRegalos', 'unidosGrupo', 'avisosVistos', 'avatar', 'equipo', 'conQuien', 'piezas', 'modoElegido', 'quiereInvertir', 'ultimaVisita', 'novedades', 'pasos', 'animosDados', 'animos', 'construido', 'favoritos', 'visita', 'visitaVersion', 'vecinos', 'trabajo', 'arriendoElegido', 'mesContrato', 'visitas', 'caminoPorModo', 'presentacion', 'muro', 'visitaGrupo', 'saldoCorriente', 'mesesTrabajo', 'deudasAtrasadas', 'rshTramo', 'caminoAnterior', 'prioridad', 'prioridadRespondida', 'acuerdoCredito', 'respaldoAceptado', 'usadoElegido'];
  var VALORES_POR_DEFECTO = { modo: 'arrendar', sueldoPropio: null, sueldoPareja: null, arriendoActual: null,
    otrasCuotas: null, contrato: 'indefinido', mesesTrabajo: null, deudasAtrasadas: null, rshTramo: null, caminoAnterior: null, prioridad: null, prioridadRespondida: false, acuerdoCredito: null, respaldoAceptado: false, usadoElegido: null,
    ahorroMensual: null, tipoAhorro: 'propio', ahorrado: 0, ahorroIniciado: false, meAlcanza: false,
    ahorroActual: null, caminoElegido: null, masBaratoTipo: null, masBaratoAjuste: null,
    mesAhorro: 0, racha: 0, ultimoProtector: null, historialMeses: [], preguntasListas: false, pregunta: 1, rangoPrecio: null, filtroRango: false,
    avisosApagados: {}, cuotaAutomatica: false, parejaInvitada: false, regalos: [], listaRegalos: null, unidosGrupo: {}, avisosVistos: null, avatar: null, conQuien: null, modoElegido: false, quiereInvertir: false, ultimaVisita: null, novedades: [], pasos: {}, animosDados: null, animos: [], construido: null, favoritos: [], visita: {}, visitaVersion: 2, vecinos: {}, trabajo: '', arriendoElegido: null, mesContrato: null, visitas: {}, caminoPorModo: {}, presentacion: null, muro: {}, visitaGrupo: {} };

  // Revisión del 12-nov: un estado nuevo (sin nada guardado) no traía visitas, muro, vecinos y otros datos,
  // y "Ver proyecto" se caía la primera vez. Se completa con los valores por defecto que falten.
  Object.keys(VALORES_POR_DEFECTO).forEach(function (k) {
    if (estado[k] === undefined) estado[k] = JSON.parse(JSON.stringify(VALORES_POR_DEFECTO[k]));
  });

  function montoValido(n) { return typeof n === 'number' && isFinite(n) && n >= 0 ? n : null; }

  var CONTRATOS = { 'indefinido': 'Indefinido', 'plazo-fijo': 'Plazo fijo', 'independiente': 'Independiente' };

  // Lee lo guardado y descarta lo que no tenga sentido (por si el dato se dañó).
  // S13-F3: lista de regalos (se usan al leer el estado guardado).
  var RELACIONES = ['mamá', 'papá', 'hermana', 'hermano', 'abuela', 'abuelo', 'tía', 'tío', 'amiga', 'amigo'];
  var OCASIONES = ['Cumpleaños', 'Navidad', 'Titulación', 'Otra ocasión'];

  // ---------- S16: avatar y Tu equipo ----------
  // Sin género: todos los peinados, colores y accesorios son para todos. Lo no elegido se dibuja neutro (gris).
  var AV_PIEL = ['#F3D3B5', '#E8BFA0', '#C99572', '#9C6B47', '#6B4630'];
  var AV_COLOR_PELO = [['#2B2B2B', 'Pelo negro'], ['#6D4C41', 'Pelo castaño'], ['#A1774F', 'Pelo castaño claro'], ['#D9B26A', 'Pelo rubio'], ['#2772CC', 'Pelo azul'], ['#B0BEC5', 'Canas'],
    ['#ED0C19', 'Pelo rojo'], ['#28892B', 'Pelo verde'], ['#FFE300', 'Pelo amarillo']];
  var AV_ROPA = [['#2772CC', 'Ropa azul'], ['#1D5699', 'Ropa azul oscuro'], ['#28892B', 'Ropa verde'], ['#37474F', 'Ropa gris oscuro'], ['#FFE300', 'Ropa amarilla'], ['#E2E8EA', 'Ropa gris claro'],
    // 9-nov: los colores Bci que faltaban (rojo y verde oscuro), al final para no cambiar los avatares guardados.
    ['#ED0C19', 'Ropa roja'], ['#28652B', 'Ropa verde oscuro'], ['#B20913', 'Ropa roja oscura']];
  var AV_NOMBRE_PELO = { corto: 'Corto', largo: 'Largo', 'moño': 'Moño', rizado: 'Rizado', rapado: 'Rapado', ondulado: 'Ondulado' };
  var AV_NOMBRE_ACC = { lentes: 'Lentes', audifonos: 'Audífonos', mochila: 'Mochila', gorro: 'Gorro', planta: 'Planta' };
  var AV_OSCURO = '#263238';
  var NOMBRE_RELACION = { pareja: 'Tu pareja', hija: 'Tu hija', hijo: 'Tu hijo', 'bebé': 'Tu bebé', 'mamá': 'Tu mamá', 'papá': 'Tu papá', hermana: 'Tu hermana', hermano: 'Tu hermano',
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
  // 11-nov: un bebé (cabeza grande, cuerpo chico con su ropita, un mechón y gorro opcional).
  function bebeSVG(a, tam, clase) {
    a = a || {};
    var col = avColores(a);
    var gorro = (a.accesorios || []).indexOf('gorro') !== -1;
    return '<svg class="' + (clase || 'avatar-svg') + '" viewBox="0 0 100 100" width="' + tam + '" height="' + tam + '" aria-hidden="true" focusable="false">' +
      '<path d="M30 100Q30 78 50 76Q70 78 70 100Z" fill="' + col.ropa + '"/>' +
      '<path d="M42 82h16" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
      '<circle cx="50" cy="52" r="23" fill="' + col.piel + '"/>' +
      '<circle cx="27" cy="54" r="4" fill="' + col.piel + '"/><circle cx="73" cy="54" r="4" fill="' + col.piel + '"/>' +
      (gorro ? '<path d="M27 48Q27 24 50 24Q73 24 73 48Z" fill="#FFE300"/><rect x="25" y="44" width="50" height="7" rx="3.5" fill="#2772CC"/><circle cx="50" cy="22" r="5" fill="#2772CC"/>'
        : '<path d="M46 30q2-9 9-6q-6 1-5 7" fill="none" stroke="' + col.pelo + '" stroke-width="3.5" stroke-linecap="round"/>') +
      '</svg>';
  }
  function avatarMiembro(m, tam, clase) {
    if (m.relacion === 'bebé') return bebeSVG(m.avatar, tam, clase);
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
    if (estado.conQuien === 'familia') return miembrosCon(['pareja', 'hija', 'hijo', 'bebé', 'mamá', 'papá', 'hermana', 'hermano', 'abuela', 'abuelo', 'tía', 'tío']).slice(0, 3);
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
      if (relacion === 'bebé') return grupo('Tono de piel', AV_PIEL.map(function (c, i) { return boton('piel', i, 'Tono ' + (i + 1), c); }).join('')) +
        grupo('Color de pelo', AV_COLOR_PELO.map(function (c, i) { return boton('colorPelo', i, c[1], c[0]); }).join('')) +
        grupo('Ropita', AV_ROPA.map(function (c, i) { return boton('ropa', i, c[1], c[0]); }).join('')) +
        grupo('Accesorios', boton('accesorios', 'gorro', 'Gorro'));
      return grupo('Tono de piel', AV_PIEL.map(function (c, i) { return boton('piel', i, 'Tono ' + (i + 1), c); }).join('')) +
        grupo('Pelo', AVATAR_PELOS.map(function (p) { return boton('pelo', p, AV_NOMBRE_PELO[p]); }).join('')) +
        grupo('Color de pelo', AV_COLOR_PELO.map(function (c, i) { return boton('colorPelo', i, c[1], c[0]); }).join('')) +
        grupo('Ropa', AV_ROPA.map(function (c, i) { return boton('ropa', i, c[1], c[0]); }).join('')) +
        grupo('Accesorios', AVATAR_ACCESORIOS.map(function (x) { return boton('accesorios', x, AV_NOMBRE_ACC[x]); }).join('')) +
        (op.elegirRelacion || relacion ? '' : grupo('Mascota', boton('mascota', '', 'Sin mascota') + boton('mascota', 'perro', 'Perro') + boton('mascota', 'gato', 'Gato')));
    }
    function vista() { return relacion === 'mascota' ? mascotaSVG(a.mascota || 'perro', 132) : relacion === 'bebé' ? bebeSVG(a, 132) : avatarSVG(a, 132); }
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
    abrirCreador({ titulo: relacion === 'pareja' ? 'Tu pareja' : relacion === 'bebé' ? 'Tu bebé' : 'Agregar a alguien', relacion: relacion || inicial, elegirRelacion: !relacion, boton: boton,
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
      estado.mesesTrabajo = Number.isInteger(g.mesesTrabajo) && g.mesesTrabajo >= 0 ? g.mesesTrabajo : null;
      estado.deudasAtrasadas = typeof g.deudasAtrasadas === 'boolean' ? g.deudasAtrasadas : null;
      estado.rshTramo = [40, 50, 60, 70, 80, 90, 100].indexOf(g.rshTramo) !== -1 ? g.rshTramo : null;
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
      // 11-nov (test): confianza en el grupo. Tu presentación, tus saludos en el muro y la visita en grupo (simulado).
      estado.presentacion = g.presentacion && typeof g.presentacion === 'object' ? {
        trabajo: String(g.presentacion.trabajo || '').slice(0, 40), hogar: String(g.presentacion.hogar || '').slice(0, 40), motivo: String(g.presentacion.motivo || '').slice(0, 60) } : null;
      estado.muro = {};
      if (g.muro && typeof g.muro === 'object') Object.keys(g.muro).forEach(function (id) {
        if (buscarProyecto(id) && Array.isArray(g.muro[id])) estado.muro[id] = g.muro[id].filter(function (m) { return typeof m === 'string'; }).map(function (m) { return m.slice(0, 140); }).slice(-10);
      });
      estado.visitaGrupo = {};
      if (g.visitaGrupo && typeof g.visitaGrupo === 'object') Object.keys(g.visitaGrupo).forEach(function (id) { if (buscarProyecto(id) && g.visitaGrupo[id] === true) estado.visitaGrupo[id] = true; });
      estado.caminoPorModo = {};
      if (g.caminoPorModo && typeof g.caminoPorModo === 'object') ['vivir', 'arrendar'].forEach(function (m) {
        if (typeof g.caminoPorModo[m] === 'string' && typeof CAMINOS !== 'undefined' && CAMINOS[g.caminoPorModo[m]]) estado.caminoPorModo[m] = g.caminoPorModo[m];
      });
      // 10-nov: visitas agendadas por departamento ({ fecha, hora, fue }).
      estado.visitas = {};
      if (g.visitas && typeof g.visitas === 'object') Object.keys(g.visitas).forEach(function (id) {
        var v = g.visitas[id];
        if (buscarProyecto(id) && v && /^\d{4}-\d{2}-\d{2}$/.test(v.fecha) && typeof v.hora === 'string') estado.visitas[id] = { fecha: v.fecha, hora: v.hora.slice(0, 5), fue: !!v.fue };
      });
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
      if (g.caminoAnterior && typeof g.caminoAnterior === 'object' && typeof CAMINOS !== 'undefined' && CAMINOS[g.caminoAnterior.id])
        estado.caminoAnterior = { id: g.caminoAnterior.id, listos: Number(g.caminoAnterior.listos) || 0 };
      if (['antes', 'menos', 'ya'].indexOf(g.prioridad) !== -1) estado.prioridad = g.prioridad;
      estado.prioridadRespondida = g.prioridadRespondida === true || estado.prioridad !== null;
      estado.respaldoAceptado = g.respaldoAceptado === true;
      if (g.acuerdoCredito && typeof g.acuerdoCredito === 'object' && ACUERDO_CON.indexOf(g.acuerdoCredito.con) !== -1 && ACUERDO_PAGA.indexOf(g.acuerdoCredito.quienPaga) !== -1 && ACUERDO_SALE.indexOf(g.acuerdoCredito.siSale) !== -1) {
        var tp = Math.round(Number(g.acuerdoCredito.tuParte));
        estado.acuerdoCredito = { con: g.acuerdoCredito.con, tuParte: tp >= 10 && tp <= 90 ? tp : 50, quienPaga: g.acuerdoCredito.quienPaga, siSale: g.acuerdoCredito.siSale };
      }
      if (USADOS.some(function (u) { return u.id === g.usadoElegido; })) estado.usadoElegido = g.usadoElegido;
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
  // 20-nov: el respaldo familiar ya no es una ayuda suelta: va solo con el camino «Garantía de un familiar».
  if (estado.modo === 'vivir') estado.piezas = Object.assign({}, estado.piezas, { respaldo: estado.caminoElegido === 'familiar-vivir' });
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
  var caminoMirado = null; // 20-nov: el camino desde el que se mira un detalle para arrendar (no cambia tu plan).
  function modoFinanciero(proyecto) {
    var cam = caminoMirado || estado.caminoElegido;
    if (estado.modo === 'arrendar' && cam === 'familiar-invertir') return 'familiar';
    if (estado.modo === 'arrendar' && proyecto.tipo === 'conjunto' && CAMINOS_PROPIOS.indexOf(cam) !== -1) return 'propio';
    return estado.modo;
  }

  // S18-F1: para vivir, el precio usa el descuento que el grupo ya tiene (contándote); completar el grupo es posibilidad.
  function resumenBase(proyecto) {
    var op = estado.modo === 'vivir' ? { descuentoHoy: true, yaEstas: esMiProyecto(proyecto) } : null;
    var r = resumenProyecto(proyecto, departamentosDe(proyecto.id), cuposExtra(proyecto), invertidoEn(proyecto.id), modoFinanciero(proyecto), op);
    return estado.modo !== 'vivir' && compraSinGrupo(proyecto) ? resumenSinGrupo(proyecto, r) : r;
  }
  // 9-nov: para invertir, un edificio en obra con grupo comprado solo (Crédito al 80 %): precio de lista, sin descuento.
  // 20-nov: sin grupo, con el financiamiento del camino (pie compartido: 5 % + inversionistas; familiar: 95 %).
  function resumenSinGrupo(p, r, caminoVista) {
    var d = departamentosDe(p.id)[0];
    var c = CAMINOS[caminoVista] || CAMINOS[estado.caminoElegido];
    var modo = c && c.inversionistas > 0 ? 'arrendar' : c && c.familiar ? 'familiar' : 'propio';
    return Object.assign({}, r, { tipoCompra: 'individual', escenario: escenario(d.listaUF, 'individual', modo, 1), ahorro: 0, ahorroCompleto: 0,
      descuento: 0, rentabilidad: rentabilidad(d.arriendoEstimadoIA, d.listaUF) });
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
  // S30-B8 (testeo: dudas de comprar con desconocidos): dos datos grandes, arriba del grupo.
  // "Si alguien se va" repite lo que ya dice la hoja de abajo; sigue como Propuesta hasta definirlo con Bci.
  function bandaConfianza() {
    // S33-C7: más chico: dos datos en una línea; el detalle de «si alguien se va» queda en su desplegable.
    return '<ul class="grupo-confianza compacta">' +
      '<li>' + icono('i-escudo') + 'Todos preaprobados por Bci</li>' +
      '<li>' + icono('i-persona') + 'Si alguien se va, tu descuento no baja</li>' +
    '</ul>';
  }
  function siAlguienSeVa(p) {
    var cerrado = grupoCerrado(p);
    return '<details class="si-se-va"><summary>' + icono('i-escudo') + '<span>¿Y si alguien se retira?</span><svg class="plegable-flecha" aria-hidden="true"><use href="#i-flecha"/></svg></summary>' +
      '<ul>' +
        (cerrado ? '' : '<li>Antes del cierre, cualquiera sale sin costo, tú también.</li>') +
        '<li>Tu descuento se fija con los que haya al cierre' + (p.cierre ? ' (' + formatoFecha(p.cierre) + ')' : '') + '. Si después alguien se va, su cupo pasa a la lista de espera y tu descuento no baja.</li>' +
        '<li>Tu pie está en tu propia cuenta en Bci y tu crédito es solo tuyo: nunca pagas la parte de otra persona.</li>' +
      '</ul></details>';
  }
  // ---------- 11-nov (test): conoce a tu grupo ----------
  // Una usuaria no compraría en grupo sin saber quiénes son. Sin nombres ni datos (CLAUDE.md): Bci responde por cada uno
  // (todos preaprobados), cifras del grupo, presentaciones opcionales, un muro moderado, una visita a la obra y una meta del mes.
  var PRESENTACIONES = [
    { trabajo: 'Enfermería', hogar: 'Con su pareja', motivo: 'Le queda cerca del hospital donde trabaja' },
    { trabajo: 'Contabilidad', hogar: 'Con su perro', motivo: 'El metro a dos cuadras' },
    { trabajo: 'Docencia', hogar: 'Con su hija', motivo: 'Hay colegios y plazas cerca' },
    { trabajo: 'Gastronomía', hogar: 'Con su pareja y su gato', motivo: 'Le gustan las ferias del barrio' },
    { trabajo: 'Estudia y trabaja', hogar: 'Hogar de una persona', motivo: 'Le queda cerca de su universidad' },
    { trabajo: 'Ingeniería', hogar: 'Con su mamá', motivo: 'Su familia vive en la comuna' },
    { trabajo: 'Diseño', hogar: 'Con amistades', motivo: 'Edificio nuevo y buen precio' }
  ];
  var MURO_BASE = ['¡Hola! Feliz de ser parte del grupo. Este mes ya pagué mi cuota.', '¿Alguien más va a la visita de la obra? Me gustaría conocerles.', 'Pregunté en Bci y el cierre sigue en la fecha. ¡Vamos bien!'];
  var OPCIONES_PRESENTACION = {
    trabajo: ['Salud', 'Educación', 'Comercio', 'Tecnología', 'Construcción', 'Estudio', 'Otra cosa'],
    hogar: ['Hogar de una persona', 'Con mi pareja', 'Con mi familia', 'Con mi mascota', 'Con amistades'],
    motivo: ['El metro y la locomoción', 'Está cerca de mi trabajo', 'Mi familia vive cerca', 'El precio', 'Es un barrio que me gusta']
  };
  function semillaDe(id) { var n = 0; for (var i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 997; return n; }
  function proximoSabado(semanas) {
    var h = new Date(), base = Date.UTC(h.getFullYear(), h.getMonth(), h.getDate()), dia = new Date(base).getUTCDay();
    return new Date(base + ((((6 - dia + 7) % 7) || 7) + 7 * (semanas || 0)) * 864e5).toISOString().slice(0, 10);
  }
  function conoceTuGrupo(p, r) {
    var g = p.grupo || {};
    // 11-nov: antes de unirte ves quiénes son; el muro, tu presentación y la visita llegan al unirte.
    var miembro = esMiProyecto(p);
    var otros = Math.max(0, r.cuposTomados - (esMiProyecto(p) ? 1 : 0));
    var semilla = semillaDe(p.id);
    var conPresentacion = Math.min(otros, Math.max(1, Math.round(otros * 0.7)));
    var ultimo = (estado.historialMeses || []).slice(-1)[0];
    var pagaron = Math.min(r.cuposTomados, (g.pagaronMes || 0) + (esMiProyecto(p) && ultimo === 'pago' ? 1 : 0));
    var pct = r.cuposTomados ? Math.round(pagaron / r.cuposTomados * 100) : 0;
    var tarjetas = '';
    for (var i = 0; i < conPresentacion; i++) {
      var x = PRESENTACIONES[(semilla + i) % PRESENTACIONES.length], a = AVATARES_REGALO[(semilla + i) % AVATARES_REGALO.length];
      tarjetas += '<li class="presentacion"><span class="presentacion-av" style="--fondo:' + a.fondo + '">' + avatarSVG(a.av, 44) + '</span>' +
        '<strong>' + x.trabajo + '</strong><small>' + x.hogar + '</small><small class="presentacion-motivo">“' + x.motivo + '”</small>' +
        '<span class="presentacion-ok">' + icono('i-check') + 'Preaprobado por Bci</span></li>';
    }
    var yo = estado.presentacion;
    var mios = estado.muro[p.id] || [];
    var mensajes = MURO_BASE.map(function (t, k) {
      var a = AVATARES_REGALO[(semilla + k) % AVATARES_REGALO.length];
      return '<li><span class="muro-av" style="--fondo:' + a.fondo + '">' + avatarSVG(a.av, 32) + '</span><span><small>' + PRESENTACIONES[(semilla + k) % PRESENTACIONES.length].trabajo + SEP + 'hace ' + plural(k + 1, 'día', 'días') + '</small>' + t + '</span></li>';
    }).join('') + mios.map(function (t) {
      return '<li class="muro-tuyo"><span class="muro-av">' + avatarSVG(estado.avatar, 32) + '</span><span><small>Tú' + SEP + 'ahora</small>' + esc(t) + '</span></li>';
    }).join('');
    var vas = !!estado.visitaGrupo[p.id];
    var vanVisita = Math.max(2, Math.round(otros * 0.5)) + (vas ? 1 : 0);
    var fechaVisita = proximoSabado(1);
    return '<section class="tarjeta bloque conoce-grupo" aria-labelledby="titulo-conoce-' + esc(p.id) + '">' +
      '<h2 class="h4" id="titulo-conoce-' + esc(p.id) + '">' + (miembro ? 'Conoce a tu grupo' : 'Conoce al grupo') + '</h2>' +
      '<ul class="grupo-cifras">' +
        '<li><strong>' + r.cuposTomados + ' de ' + r.cupos + '</strong><small>se unieron</small></li>' +
        '<li><strong>' + plural(g.mesesAhorrando || 1, 'mes', 'meses') + '</strong><small>ahorrando juntos</small></li>' +
        '<li><strong>' + formatoRedondeado(g.cuotaPromedio || 0) + '</strong><small>cuota promedio</small></li>' +
      '</ul>' +
      // Meta del mes del grupo.
      '<div class="grupo-meta"><p><span>Meta de ' + MESES[Number(hoyDemo().split('-')[1]) - 1] + ': que todos paguen su cuota</span><strong>' + pagaron + ' de ' + r.cuposTomados + '</strong></p>' +
        '<span class="grupo-meta-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Meta del grupo"><i style="width:' + pct + '%"></i></span></div>' +
      // Capa 3: presentaciones opcionales.
      '<h3 class="h5 grupo-sub">Quiénes son</h3>' +
      '<p class="texto-apoyo"><small>' + plural(conPresentacion, 'persona se presentó', 'personas se presentaron') + '. Sin nombres ni datos: solo lo que cada uno quiso contar.</small></p>' +
      '<ul class="presentaciones">' + tarjetas +
      (miembro ?
        '<li class="presentacion presentacion-tuya"><span class="presentacion-av">' + avatarSVG(estado.avatar, 44) + '</span>' +
          (yo ? '<strong>' + esc(yo.trabajo) + '</strong><small>' + esc(yo.hogar) + '</small><small class="presentacion-motivo">“' + esc(yo.motivo) + '”</small>' : '<strong>Tú</strong><small>Preséntate si quieres</small>') +
          '<button type="button" class="enlace" data-presentarme="' + esc(p.id) + '" aria-haspopup="dialog">' + (yo ? 'Editar' : 'Presentarme') + '</button></li>' : '') +
      '</ul>' +
      (!miembro ? '<p class="vecinos-nota"><small>Al unirte podrás presentarte, escribir en el muro del grupo y sumarte a la visita a la obra.</small></p>' : '' +
      // Muro moderado.
      '<h3 class="h5 grupo-sub">Muro del grupo</h3>' +
      '<ul class="muro">' + mensajes + '</ul>' +
      '<form class="muro-form" data-muro="' + esc(p.id) + '"><label class="oculto-visual" for="muro-' + esc(p.id) + '">Escribe un saludo</label>' +
        '<input id="muro-' + esc(p.id) + '" class="campo-texto" maxlength="140" placeholder="Escribe un saludo…" autocomplete="off">' +
        '<button type="submit" class="btn btn-secundario-dark btn-sm">Enviar</button></form>' +
      '<p class="vecinos-nota"><small>Lo modera Bci. Nadie ve tu teléfono, tu sueldo ni tus pagos.</small></p>' +
      // Visita a la obra en grupo.
      '<div class="grupo-visita">' + icono('i-calendario', 'icono-grande') + '<span><strong>Visita a la obra en grupo</strong>' +
        '<small>' + textoVisita({ fecha: fechaVisita, hora: '11:00' }) + '</small><small>' + plural(vanVisita, 'persona va', 'personas van') + '</small></span>' +
        '<button type="button" class="btn btn-sm ' + (vas ? 'btn-terciario' : 'btn-primario') + '" data-visita-grupo="' + esc(p.id) + '">' + (vas ? 'Ya no voy' : 'Me sumo') + '</button></div>' +
      '') +
    '</section>';
  }
  document.addEventListener('click', function (ev) {
    var v = ev.target.closest('[data-visita-grupo]');
    if (v) {
      var id = v.dataset.visitaGrupo;
      estado.visitaGrupo = Object.assign({}, estado.visitaGrupo);
      if (estado.visitaGrupo[id]) delete estado.visitaGrupo[id]; else estado.visitaGrupo[id] = true;
      guardarEstado();
      var y = window.scrollY; mostrar(); window.scrollTo(0, y);
      toast(estado.visitaGrupo[id] ? 'Te sumaste a la visita (simulado).' : 'Ya no vas a la visita.');
      return;
    }
    var b = ev.target.closest('[data-presentarme]');
    if (!b) return;
    var opciones = function (campo, titulo) {
      var actual = estado.presentacion ? estado.presentacion[campo] : null;
      return '<fieldset class="escala"><legend>' + titulo + '</legend><div class="escala-opciones escala-envuelve">' +
        OPCIONES_PRESENTACION[campo].map(function (o, k) {
          return '<input type="radio" name="pres-' + campo + '" id="pres-' + campo + '-' + k + '" value="' + o + '"' + (o === actual ? ' checked' : '') + '><label for="pres-' + campo + '-' + k + '">' + o + '</label>';
        }).join('') + '</div></fieldset>';
    };
    abrirHojaContenido('Tu presentación',
      '<p class="texto-apoyo">Lo ve solo tu grupo, sin tu nombre. Puedes borrarla cuando quieras.</p>' +
      opciones('trabajo', '¿A qué te dedicas?') + opciones('hogar', '¿Con quién vas a vivir?') + opciones('motivo', '¿Por qué elegiste este edificio?') +
      '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-guardar-pres">Guardar</button>' +
      (estado.presentacion ? '<button type="button" class="btn btn-terciario btn-bloque" id="btn-borrar-pres">Borrar mi presentación</button>' : '') + '</div>',
      b, function () {
        $('btn-guardar-pres').addEventListener('click', function () {
          var leer = function (c) { var x = document.querySelector('input[name="pres-' + c + '"]:checked'); return x ? x.value : ''; };
          var pres = { trabajo: leer('trabajo'), hogar: leer('hogar'), motivo: leer('motivo') };
          if (!pres.trabajo && !pres.hogar && !pres.motivo) { toast('Elige al menos una cosa para contar.'); return; }
          estado.presentacion = pres; guardarEstado();
          cerrarHoja(false); var y = window.scrollY; mostrar(); window.scrollTo(0, y);
          toast('Tu grupo ya puede verte (simulado).');
        });
        if ($('btn-borrar-pres')) $('btn-borrar-pres').addEventListener('click', function () {
          estado.presentacion = null; guardarEstado();
          cerrarHoja(false); var y = window.scrollY; mostrar(); window.scrollTo(0, y);
          toast('Borraste tu presentación.');
        });
      });
  });
  document.addEventListener('submit', function (ev) {
    var f = ev.target.closest && ev.target.closest('[data-muro]');
    if (!f) return;
    ev.preventDefault();
    var id = f.dataset.muro, input = f.querySelector('input'), texto = (input.value || '').trim().slice(0, 140);
    if (!texto) { input.focus(); return; }
    estado.muro = Object.assign({}, estado.muro);
    estado.muro[id] = (estado.muro[id] || []).concat([texto]).slice(-10);
    guardarEstado();
    var y = window.scrollY; mostrar(); window.scrollTo(0, y);
    toast('Saludo publicado en el muro (simulado).');
  });
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
    // S34 (recorrido como usuaria): los términos que aparecían sin explicación, primero.
    'uf': { termino: 'UF', pregunta: '¿Qué es la UF?',
      texto: 'Unidad de Fomento: una medida en pesos que sube con los precios. Los departamentos y los créditos se cobran en UF.' },
    'cuenta-vivienda': { termino: 'Cuenta de vivienda', pregunta: '¿Qué es la cuenta de vivienda?',
      texto: 'Tu cuenta de ahorro en Bci para el pie, en UF. Ahí pagas tus cuotas del pie.' },
    'cuota-pie': { termino: 'Cuota del pie', pregunta: '¿Qué es la cuota del pie?',
      texto: 'Lo que depositas cada mes en tu cuenta de vivienda hasta juntar tu pie. No es el dividendo: ese se paga después de firmar.' },
    'ds1': { termino: 'Subsidio DS1', pregunta: '¿Qué es el DS1?',
      texto: 'Dinero del Estado que se suma a tu pie para tu primera vivienda. No se devuelve. Se postula en el Minvu, en fechas fijas.' },
    'rsh': { termino: 'Registro Social de Hogares', pregunta: '¿Qué es el Registro Social?',
      texto: 'El registro del Estado sobre tu hogar. Lo pide el DS1. Te inscribes gratis en línea con tu ClaveÚnica.' },
    'preaprobacion': { termino: 'Preaprobación', pregunta: '¿Qué es la preaprobación?',
      texto: 'Bci revisa tus sueldos y documentos y te dice cuánto te podría prestar. No te obliga a comprar. No es lo mismo que postular a un subsidio.' },
    'promesa': { termino: 'Promesa', pregunta: '¿Qué es la promesa?',
      texto: 'Un contrato con la inmobiliaria donde ambos se comprometen a firmar la compra más adelante, a un precio fijo.' },
    'tasacion': { termino: 'Tasación', pregunta: '¿Qué es la tasación?',
      texto: 'Bci revisa cuánto vale el departamento. Presta sobre el menor entre el precio y la tasación.' },
    'escritura': { termino: 'Escritura', pregunta: '¿Qué es la escritura?',
      texto: 'El contrato de compra que firmas en la notaría con la inmobiliaria y Bci. Cuando se inscribe en el Conservador, el departamento es tuyo.' },
    'protector': { termino: 'Protector de racha', pregunta: '¿Qué es el protector de racha?',
      texto: 'Si un mes no puedes pagar tu cuota, tu racha sigue, una vez cada 6 meses. Lo ahorrado nunca se pierde.' },
    'garantia': { termino: 'Garantía del Estado', pregunta: '¿Qué es la garantía del Estado?',
      texto: 'Con la garantía FOGAES, Bci te presta el 90 % y pones solo el 10 % de pie. Sin ella, Bci presta el 80 % y juntas más tiempo.' },
    'tasa-ejemplo': { termino: 'Tasa de ejemplo', pregunta: 'Qué significa tasa de ejemplo',
      texto: 'Cada banco fija su tasa según tu caso. Se fija el día que firmas.' },
    'dividendo': { termino: 'Dividendo', pregunta: '¿Qué es el dividendo?',
      texto: 'Es la cuota que pagas cada mes a Bci por el crédito hipotecario, con los seguros incluidos.' },
    'pie': { termino: 'Pie', pregunta: '¿Qué es el pie?',
      texto: 'Es la parte del precio que pones tú: 10 % con garantía del Estado o en grupo, 20 % con crédito tradicional y 5 % con pie compartido (para arrendar). Además juntas los gastos de escritura.' },
    'tu-limite': { termino: 'Tu límite', pregunta: '¿Cuál es el límite?',
      texto: 'Lo que pagas al mes no puede pasar de 25 % de lo que ganan tú y tu pareja, y te tiene que quedar al menos 40 % para tus gastos del mes (comida, transporte, cuentas).' },
    'carga': { termino: 'Carga', pregunta: '¿Qué es la carga?',
      texto: 'Es la parte de lo que ganan tú y tu pareja que se va cada mes en el dividendo. Bci pide que no pase de 25 %.' },
    'participacion': { termino: 'Participación', pregunta: '¿Qué es la participación de los inversionistas?',
      texto: 'Es el 15 % del departamento que ponen inversionistas. No es un préstamo: no te cobran una cuota, y el arriendo se los va recomprando.' },
    'cuenta-custodia': { termino: 'Cuenta custodia', pregunta: '¿Qué es la cuenta custodia?',
      texto: 'Es una cuenta de Bci donde entra el arriendo y desde la que se paga a los inversionistas y se recompra su parte.' },
    'terminado': { termino: 'Departamento terminado', pregunta: '¿Qué es un departamento terminado?',
      texto: 'Un departamento nuevo ya construido. Lo compras solo, sin grupo, y lo recibes al firmar.' },
    'compra-conjunto': { termino: 'Compra en grupo', pregunta: '¿Qué es la compra en grupo?',
      texto: 'Varias personas compran juntas en un proyecto y todas pagan 5 % menos cuando el grupo llega a 5 personas.' },
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
    'patrimonio': { termino: 'Lo que ya es tuyo (patrimonio)', pregunta: '¿Qué es lo que ya es tuyo?',
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

  // S27-B3 (test del 12-nov: P1 y P3 no entendían "crédito del Estado", DS1 ni DS19): cada término, donde aparece,
  // con un botón "¿Qué es…?" que abre una hoja de 3 líneas: qué es, con qué se combina y su límite.
  var TERMINOS = {
    garantia: { nombre: 'Garantía del Estado (FOGAES)', pregunta: '¿Qué es la garantía del Estado?',
      que: 'El Estado respalda tu crédito: Bci te presta el 90' + NBSP + '% y pones solo el 10' + NBSP + '% de pie.',
      combina: 'Compra directa y compra en grupo. Se suma al DS1.',
      limite: 'Solo para tu primera vivienda, para vivir en ella. Se pide hasta el ' + formatoFecha(FECHAS_IMPORTAN[2].fecha) + '.' },
    ds1: { nombre: 'Subsidio DS1', pregunta: '¿Qué es el DS1?',
      que: 'Dinero del Estado que se suma a tu pie para tu primera vivienda. No se devuelve.',
      combina: 'Es un acelerador: se suma a un camino (compra directa o compra en grupo); no es un camino ni un tipo de departamento.',
      limite: PIEZAS_VIVIR.subsidio.cond, mas: 'ds1' },
    ds19: { nombre: 'Proyectos DS19', pregunta: '¿Qué es el DS19?',
      que: 'Un subsidio del Estado para tu primera vivienda, pero solo en proyectos DS19 específicos, que tienen cupos limitados. No sirve para cualquier departamento: primero revisas si el proyecto es DS19.',
      combina: 'Se puede sumar al DS1.',
      limite: 'Para postular necesitas estar en el Registro Social de Hogares. El precio tope depende de la comuna y el tramo.', mas: 'ds19' },
    rsh: { nombre: 'Registro Social de Hogares', pregunta: '¿Qué es el Registro Social?',
      que: 'El registro del Estado sobre la situación de tu hogar. Te inscribes en línea con tu ClaveÚnica.',
      combina: 'Lo piden el DS1 y los proyectos DS19.',
      limite: 'Es gratis. Hazlo antes de postular al DS1.' },
    grupo: { nombre: 'Compra en grupo', pregunta: '¿Qué es la compra en grupo?',
      que: GLOSARIO['compra-conjunto'].texto,
      combina: 'Con la garantía del Estado y el DS1.',
      limite: PIEZAS_VIVIR.grupo.cond }
  };
  function termino(k) {
    return '<button type="button" class="termino" data-termino="' + k + '" aria-haspopup="dialog">' + TERMINOS[k].pregunta + '</button>';
  }
  // S30-B2: un solo "Qué significan" por pantalla; abre una hoja con cada término plegado (qué es, con qué se combina, su límite).
  function terminos(lista) {
    return lista.length ? '<p class="terminos"><button type="button" class="termino" data-terminos="' + lista.join(',') + '" aria-haspopup="dialog">' + icono('i-info') + 'Qué significan estos términos</button></p>' : '';
  }
  function abrirTerminos(lista, boton) {
    abrirHojaContenido('Qué significan', lista.map(function (k, i) {
      return '<details class="termino-detalle"' + (i === 0 ? ' open' : '') + '><summary>' + TERMINOS[k].nombre + '</summary>' + cuerpoTermino(k) + '</details>';
    }).join(''), boton);
  }
  function cuerpoTermino(k) {
    var t = TERMINOS[k];
    return '<p>' + t.que + '</p>' +
      '<dl class="termino-datos"><div><dt>Se combina con</dt><dd>' + t.combina + '</dd></div>' +
        '<div><dt>Su límite</dt><dd>' + t.limite + '</dd></div></dl>' +
      (t.mas ? '<a class="enlace" href="#compra/caminos/individual-vivir/como" data-cerrar-hoja>Ver todas las ayudas ›</a>' : '');
  }
  function abrirTermino(k, boton) { abrirHojaContenido(TERMINOS[k].nombre, cuerpoTermino(k), boton); }
  // Dentro de otra hoja no se abre una segunda: el término se despliega ahí mismo.
  function terminoDesplegable(k) {
    return '<details class="termino-detalle"><summary>' + TERMINOS[k].pregunta + '</summary>' + cuerpoTermino(k) + '</details>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-termino]');
    if (b && TERMINOS[b.dataset.termino]) { abrirTermino(b.dataset.termino, b); return; }
    var g = ev.target.closest && ev.target.closest('[data-terminos]');
    if (g) abrirTerminos(g.dataset.terminos.split(',').filter(function (k) { return TERMINOS[k]; }), g);
  });

  function glosarioCompleto() {
    return '<dl class="glosario">' + Object.keys(GLOSARIO).map(function (k) {
      return '<div><dt>' + GLOSARIO[k].termino + '</dt><dd>' + GLOSARIO[k].texto + '</dd></div>';
    }).join('') + '</dl>';
  }

  // S36 (lienzo P41): Ayuda por temas, con buscador y cada palabra desplegable.
  var TEMAS_AYUDA = [
    ['Tu pie y tu ahorro', 'verde', 'i-alcancia', ['pie', 'uf', 'cuenta-vivienda', 'cuota-pie', 'regalo-pie', 'protector', 'donacion']],
    ['Tu crédito', 'azul', 'i-banco', ['preaprobacion', 'dividendo', 'tu-limite', 'carga', 'tasa-ejemplo', 'simulacion', 'tasacion', 'garantia']],
    ['Ayudas del Estado', 'celeste', 'i-escudo', ['ds1', 'rsh']],
    ['Comprar y firmar', 'gris', 'i-documento', ['promesa', 'escritura', 'salida-sin-multa', 'terminado', 'mas-barato', 'cliente-bci', 'patrimonio']],
    ['Comprar con otros', 'verde', 'i-grupo', ['compra-conjunto', 'meta-comun', 'comprador-respaldo', 'financiamiento-pie', 'participacion', 'cuenta-custodia']]
  ];
  function ayudaPorSecciones() {
    var usados = [].concat.apply([], TEMAS_AYUDA.map(function (t) { return t[3]; }));
    var otros = Object.keys(GLOSARIO).filter(function (k) { return usados.indexOf(k) === -1; });
    var temas = TEMAS_AYUDA.concat(otros.length ? [['Otras palabras', 'gris', 'i-info', otros]] : []);
    return '<section class="ayuda" aria-labelledby="titulo-ayuda">' +
      '<h1 class="h2" id="titulo-ayuda" tabindex="-1">Ayuda</h1><p class="texto-apoyo">Las palabras de tu compra, explicadas simple.</p>' +
      '<label class="ayuda-buscar">' + icono('i-buscar') + '<span class="oculto-visual">Buscar una palabra</span>' +
        '<input type="search" id="ayuda-buscar" placeholder="Busca una palabra, por ejemplo «UF»" autocomplete="off"></label>' +
      '<div class="ayuda-chips" role="group" aria-label="Temas">' + temas.map(function (t, i) {
        return '<button type="button" class="ayuda-chip ' + t[1] + '" data-ayuda-tema="' + i + '">' + t[0] + '</button>';
      }).join('') + '</div>' +
      temas.map(function (t, i) {
        var ks = t[3].filter(function (k) { return GLOSARIO[k]; });
        return '<section class="ayuda-tema" id="ayuda-tema-' + i + '" aria-labelledby="ayuda-t' + i + '">' +
          '<div class="ayuda-cab ' + t[1] + '"><span class="ayuda-icono" aria-hidden="true">' + icono(t[2]) + '</span>' +
            '<span><h2 id="ayuda-t' + i + '">' + t[0] + '</h2><small>' + plural(ks.length, 'palabra', 'palabras') + '</small></span></div>' +
          '<ul class="ayuda-lista">' + ks.map(function (k, j) {
            return '<li data-ayuda-texto="' + esc((GLOSARIO[k].termino + ' ' + GLOSARIO[k].texto).toLowerCase()) + '"><details' + (i === 0 && j === 0 ? ' open' : '') + '><summary>' + GLOSARIO[k].termino + '</summary><p>' + GLOSARIO[k].texto + '</p></details></li>';
          }).join('') + '</ul></section>';
      }).join('') +
      '<p class="texto-apoyo ayuda-nada" id="ayuda-nada" hidden>No encontramos esa palabra.</p></section>';
  }
  function iniciarAyuda(c) {
    c.querySelectorAll('[data-ayuda-tema]').forEach(function (b) {
      b.addEventListener('click', function () { var t = $('ayuda-tema-' + b.dataset.ayudaTema); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    });
    var q = $('ayuda-buscar');
    if (q) q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase(), hay = 0;
      c.querySelectorAll('.ayuda-tema').forEach(function (t) {
        var n = 0;
        t.querySelectorAll('[data-ayuda-texto]').forEach(function (li) {
          var ok = !v || li.dataset.ayudaTexto.indexOf(v) !== -1;
          li.hidden = !ok; if (ok) n++;
          var d = li.querySelector('details'); if (d && v) d.open = ok;
        });
        t.hidden = !n; hay += n;
      });
      $('ayuda-nada').hidden = !!hay;
    });
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
      location.replace('#compra');
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
      p: p, paso: 4, etapa: 'Paso 5 de 5' + SEP + 'Tu departamento, mes ' + m.mes,
      etiqueta: m.excedente > 0 ? 'Este mes te sobraron' : (estado.modo === 'arrendar' ? 'Este mes pusiste' : 'Este mes pagaste'),
      numero: formatoPesos(m.excedente > 0 ? m.excedente : m.pone),
      detalle: estado.modo !== 'arrendar' ? (estado.arriendoActual > 0 ? 'Antes pagabas ' + formatoRedondeado(estado.arriendoActual) + ' de arriendo.' : 'En algo que es tuyo.')
        : (m.porcentajeTuyo < 100 ? 'Ya es tuyo el ' + m.porcentajeTuyo + '\u00a0% del departamento.'
          : (m.excedente > 0 ? 'El arriendo alcanzó para todo el dividendo.' : 'El arriendo cubrió ' + formatoPesos(m.cascada.aUsuario) + ' del dividendo.')),
      accion: 'Ver mi departamento'
    };
  }

  // Recorrido de 5 pasos de Mi camino.
  var CAMINO = ['Elegir', 'Postular', 'Juntar el pie', 'Firmar', 'Tu departamento'];

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
      if (estado.compra) return '#compra/proyecto/' + encodeURIComponent(estado.compra.proyectoId);
      return rutaElegir();
    }
    if (estadoPaso === 'actual' && estado.compra) return '#compra/' + rutaPasoActual();
    return '#compra/' + ['', '', 'postular/datos', 'pie', 'firmar', 'mi-departamento'][n];
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
    if (c.tipo === 'etapa') return 'Avanzó la obra: ' + etapaClaraMin(c.etapa);
    if (c.tipo === 'antes') return 'Llegas ' + plural(c.n, 'mes', 'meses') + ' antes';
    return 'Tu fecha se movió ' + plural(c.n, 'mes', 'meses');
  }
  function novedadesInicio(x) {
    var ahora = fotoVisita(x);
    var cambios = cambiosDesdeVisita(estado.ultimaVisita, ahora);
    if (cambios.length) estado.novedades = cambios;
    estado.ultimaVisita = ahora;
    guardarEstado();
    // S33-B (Bárbara): lo que cambió desde tu última visita va en la campana (Avisos), no arriba de Tu compra.
    return '';
  }
  function novedadesHtml() {
    if (!estado.novedades.length) return '';
    var x = { p: proyectoCompra() };
    return '<section class="novedades" aria-labelledby="titulo-novedades">' +
      '<h2 class="h6" id="titulo-novedades">Desde tu última visita</h2>' +
      '<ul class="lista-check">' + estado.novedades.map(function (c) {
        return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + textoNovedad(c) + '</span></li>';
      }).join('') + '</ul>' +
      (estado.novedades.some(function (c) { return c.tipo === 'etapa'; }) && x.p && x.p.tipo === 'conjunto' ? obraVisual(x.p) : '') +
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
        campana() + '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tu compra</h1>' +
        '<p class="texto-apoyo">' + esc(x.p.nombre) + SEP + esc(x.p.comuna) + '</p>' +
      '</header>' +
      novedadesInicio(x) +
      (x.paso < 4 ? cuandoLlegasCompra(x.p, true) + animosInicio() + bloqueRecorrido() :
      '<section class="tarjeta proximo" aria-label="Dónde vas">' +
        '<p class="chip">' + x.etapa + '</p>' +
        '<p class="etiqueta">' + x.etiqueta + '</p>' +
        (x.visual ? x.visual : (x.numero ? '<strong class="numero display-2">' + x.numero + '</strong>' : '')) +
        (x.detalle ? '<p class="texto-apoyo">' + x.detalle + '</p>' : '') +
      '</section>' +
      '<div class="accion">' +
        '<a href="#compra/' + rutaPasoActual() + '" class="btn btn-primario btn-lg btn-bloque">' + x.accion + '</a>' +
      '</div>' +
      (x.paso >= 4 ? bloqueRecorrido() : '') +
      // 11-nov (test): al terminar, Inicio no queda vacío: qué puedes hacer ahora.
      (x.paso >= 4 ? '<section class="tarjeta bloque que-sigue" aria-labelledby="titulo-que-sigue">' +
        '<h2 class="h4" id="titulo-que-sigue">¿Qué sigue?</h2>' +
        '<ul class="filas">' +
          '<li><a class="fila" href="#compra/dueno">' + icono('i-casa', 'icono-grande') + '<span><strong>Tu mes como dueño</strong><small>Dividendo, gastos comunes y lo que te queda</small></span><svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>' +
          '<li><a class="fila" href="#compra/caminos">' + icono('i-sube', 'icono-grande') + '<span><strong>Comprar otro para arrendar</strong><small>En Comparar caminos, elige «Para arrendar»</small></span><svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>' +
          '<li><a class="fila" href="#inversiones">' + icono('i-inversionistas', 'icono-grande') + '<span><strong>Invierte en el pie de otra persona</strong><small>Desde ' + formatoRedondeado(ufAPesos(INVERSION_MINIMA_UF)) + ', con renta de 6' + NBSP + '% al año</small></span><svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>' +
        '</ul></section>' : '') +
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
      '<p class="texto-centro"><button type="button" class="enlace" id="btn-mi-camino">Ver tu compra</button></p>';
    $('btn-mi-camino').addEventListener('click', function () { estado.preguntasListas = false; estado.pregunta = 1; renderPreguntas(); });
  }

  // ---------- Inicio = Tu camino (S11-F0 y S11-F2) ----------
  // Siempre responde "¿cuánto falta y cuándo llegas?", con un número y una acción según la etapa.
  // El logo de Bci sobre el título de Mi camino (reemplaza las cuatro figuras sueltas).
  // S29 (13-nov, Bárbara): arriba de cada pestaña se dice dónde estás: Bci · Primer Peldaño.
  var MARCA = '<p class="marca-app"><img class="logo-bci" src="logo_bci_negro.svg" alt="Bci" width="52" height="24"><span class="marca-nombre">Primer Peldaño</span></p>';
  var FIGURAS = MARCA;

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
    t.classList.remove('con-accion');
    t.hidden = false;
    toastDesde = Date.now();
    t.classList.remove('toast-entra');
    void t.offsetWidth;
    t.classList.add('toast-entra');
    clearTimeout(temporizadorToast);
    // 3,5 s para lo corto y 5 s para lo que se demora en leer.
    temporizadorToast = setTimeout(function () { t.hidden = true; }, texto.length > 40 ? 5000 : 3500);
  }
  // S32-B4: un aviso con un botón (Deshacer). Dura un poco más para alcanzar a tocarlo.
  function toastAccion(texto, accion, fn) {
    toast(texto);
    var t = $('toast');
    t.classList.add('con-accion');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'toast-accion'; b.textContent = accion;
    b.addEventListener('click', function () { clearTimeout(temporizadorToast); t.hidden = true; t.classList.remove('con-accion'); fn(); });
    t.appendChild(b);
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () { t.hidden = true; t.classList.remove('con-accion'); }, 6000);
  }

  function barraPreguntas(n) {
    return '<div class="barra-preguntas" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="' + n +
      '" aria-label="Pregunta ' + n + ' de 4">' +
      [1, 2, 3, 4].map(function (i) { return '<span class="b' + i + (i <= n ? ' lleno' : '') + '"></span>'; }).join('') + '</div>';
  }

  function textoPlazoMeses(n) { return n === 0 ? 'Ya lo tienes' : textoMeses(n); }

  // Las 3 preguntas de la primera vez: para qué, sus ingresos y su ahorro.
  // S33-C8: la persona del estudio (usuaria objetivo): 28 años, ingeniera, ≈ $1,9 M líquidos, vive con su pareja
  // y su hija de 2 años, arrienda y hoy casi no ahorra. Sus datos llenan las preguntas y se crea su avatar.
  var AVATAR_EJEMPLO = { piel: 1, pelo: 'largo', colorPelo: 1, ropa: 2, accesorios: ['lentes'], mascota: '' };
  function usarPerfilEjemplo() {
    Object.assign(estado, { modo: 'vivir', modoElegido: true, sueldoPropio: 1900000, sueldoPareja: null, otrasCuotas: 0, contrato: 'indefinido',
      mesesTrabajo: 36, deudasAtrasadas: false, arriendoActual: 450000, ahorroActual: 0, ahorroMensual: 300000, conQuien: 'familia',
      avatar: normalizarAvatar(AVATAR_EJEMPLO) });
    if (!estado.equipo.length) {
      estado.equipo = agregarMiembro(estado.equipo, 'pareja', normalizarAvatar({ piel: 2, pelo: 'corto', colorPelo: 0, ropa: 1, accesorios: [] }));
      estado.equipo = agregarMiembro(estado.equipo, 'hija', normalizarAvatar({ piel: 1, pelo: 'moño', colorPelo: 1, ropa: 4, accesorios: [] }));
    }
    // El primer rango (sobre «hasta UF 1.500») en que hoy hay departamentos que le alcanzan.
    var elegido = null;
    RANGOS_PRECIO.forEach(function (rg) {
      if (elegido || rg.id === 'hasta-1500') return;
      conCambios({ rangoPrecio: rg.id }, function () { if (candidatosVivir().length && evaluarCabe().cabe) elegido = rg.id; });
    });
    elegirRango(elegido || RANGOS_PRECIO[0].id);
    estado.preguntasListas = true;
    estado.pregunta = 1;
    guardarEstado();
    renderInicio();
    window.scrollTo(0, 0);
    toast('Usas el perfil de ejemplo: pareja con una hija, $1,9 millones líquidos, arriendan y juntan $300 mil al mes. Lo cambias en Perfil › Mis datos.');
    $('titulo-inicio').focus();
  }
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
        // S33-C8 (E8): saltar las preguntas con el perfil de la persona del estudio, con su avatar.
        '<button type="button" class="tarjeta perfil-ejemplo" id="btn-perfil-ejemplo">' + avatarSVG(AVATAR_EJEMPLO, 56, 'perfil-ejemplo-av') +
          '<span><strong>Usar el perfil de ejemplo</strong><small>28 años' + SEP + '$1,9 millones líquidos' + SEP + 'vive con su pareja y su hija de 2 años' + SEP + 'arrienda</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></button>' +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-siguiente">Siguiente</button></div>';
      $('btn-perfil-ejemplo').addEventListener('click', usarPerfilEjemplo);
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
      // Comentario 9-nov: parte en "Solo yo"; el sueldo de la pareja aparece solo si eliges "Con mi pareja".
      if (!estado.conQuien) { estado.conQuien = 'solo'; guardarEstado(); }
      var quien = function (v, texto) {
        return '<button type="button" class="chip-opcion" role="radio" aria-checked="' + (estado.conQuien === v) + '" data-quien="' + v + '">' + texto + '</button>';
      };
      c.innerHTML = cabeza('¿Con quién vives y cuánto ganan?') +
        '<div class="con-quien">' +
          '<p class="etiqueta" id="titulo-con-quien">¿Con quién vas a vivir?</p>' +
          '<div class="chips-opcion" role="radiogroup" aria-labelledby="titulo-con-quien">' +
            quien('solo', 'Solo yo') + quien('pareja', 'Con mi pareja') + quien('familia', 'Con mi familia') +
          '</div>' +
          (estado.conQuien === 'familia' ? '<button type="button" class="enlace" id="btn-agregar-familia" aria-haspopup="dialog">Agregar a alguien de tu familia</button>' : '') +
        '</div>' +
        '<div class="formulario">' +
          campoDinero('q-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          // 9-nov: con familia, un familiar puede sumar su sueldo como codeudor (crédito con codeudor solidario).
          (estado.conQuien === 'pareja' ? campoDinero('q-pareja', 'Sueldo de tu pareja', estado.sueldoPareja)
            : estado.conQuien === 'familia' ? campoDinero('q-pareja', 'Sueldo de un familiar codeudor (opcional)', estado.sueldoPareja) +
              '<p class="texto-apoyo campo-nota"><small>Si compra contigo como codeudor, su sueldo se suma al de tu hogar.</small></p>' : '') +
          campoDinero('q-otras', 'Deudas que pagas al mes (tarjetas, créditos)', estado.otrasCuotas) +
        '</div>' +
        // 11-nov (test): el avatar va al final de esta pregunta, después de con quién y los sueldos (antes cortaba la pregunta).
        '<div class="pregunta-avatar"><span class="pregunta-escena" aria-hidden="true">' + escena(64, 'escena-av') + '</span>' +
          '<span class="pregunta-avatar-texto"><small>Opcional</small>' +
          '<button type="button" class="btn btn-secundario-dark btn-sm" id="btn-crear-avatar" aria-haspopup="dialog">' + (estado.avatar ? 'Cambiar mi avatar' : 'Crea tu avatar') + '</button></span></div>' +
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
      $('btn-crear-avatar').addEventListener('click', function () {
        editarMiAvatar($('btn-crear-avatar'), function () { volverA('#btn-crear-avatar'); });
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
  // S34: el rango en pesos, como en la pregunta 4 (la UF va al lado donde hay espacio).
  function pesosRango(rg) { return rg.id === 'hasta-1500' ? 'Hasta ' + millones(rg.hasta) : millones(rg.desde).replace(' millones', '') + ' a ' + millones(rg.hasta); }
  function millones(uf) { return '$' + (ufAPesos(uf) / 1e6).toFixed(0) + ' millones'; }

  function renderPreguntaRango(cabeza, atras) {
    var cap = capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo);
    var c = $('inicio-principal');
    var conteos = RANGOS_PRECIO.map(function (rg) { return departamentosEnRango(rg).length; });
    var conteoIgual = conteos.every(function (x) { return x === conteos[0]; });
    // 11-nov (test): se veía como una pregunta a ciegas; ahora cada rango muestra una foto y qué departamentos hay.
    var queHay = function (rg) {
      var ds = departamentosEnRango(rg).map(function (p) { return departamentosDe(p.id)[0]; });
      if (!ds.length) return '';
      var dor = ds.map(function (d) { return d.dormitorios; }), m2 = ds.map(function (d) { return d.m2; });
      var nombreD = function (n) { return n === 0 ? 'Estudio' : n === 1 ? '1 dormitorio' : n + ' dormitorios'; };
      var a = Math.min.apply(null, dor), b = Math.max.apply(null, dor);
      return (a === b ? nombreD(a) : nombreD(a) + ' a ' + nombreD(b).replace(/^Estudio$/, 'estudio')) + SEP + Math.min.apply(null, m2) + ' a ' + Math.max.apply(null, m2) + NBSP + 'm²';
    };
    // S36 (lienzo P05): un rango no es una casa específica: todos con el mismo ícono, sin foto.
    var fotoRango = function () { return icono('i-casa', 'icono-grande'); };
    c.innerHTML = cabeza +
      '<p class="texto-apoyo pregunta-ayuda">Elige un rango de precio. Te mostramos qué hay en cada uno; después ves cada departamento con fotos en Departamentos.</p>' +
      '<ul class="opciones-departamento" role="radiogroup" aria-labelledby="titulo-inicio">' + RANGOS_PRECIO.map(function (rg, i) {
        var n = conteos[i];
        var alcanza = cap !== null && rg.desde <= cap;
        return '<li><button type="button" class="opcion-departamento" role="radio" aria-checked="' + (estado.rangoPrecio === rg.id) + '" data-rango="' + rg.id + '"' +
          (n === 0 ? ' aria-disabled="true" disabled' : '') + '>' +
          fotoRango(rg) +
          '<span class="opcion-texto"><strong>' + (rg.id === 'hasta-1500' ? 'Hasta ' + millones(rg.hasta) : millones(rg.desde).replace(' millones', '') + ' a ' + millones(rg.hasta)) + '</strong>' +
            '<small>' + textoRango(rg) + (queHay(rg) ? SEP + queHay(rg) : '') + '</small>' +
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
  // 10-nov: el plazo del pie va en meses; si pasa del año, abajo y en chico va "aprox. 1 año y 3 meses".
  function mesesRango(a, b) {
    if (a === null || b === null || a === undefined || b === undefined) return '—';
    if (a === b) return a === 0 ? 'Ya' : (a === 1 ? '1 mes' : a + ' meses');
    return (a === 0 ? 'Ya' : a) + ' a ' + b + ' meses';
  }
  // Comentario 10-nov: una sola fecha, la del caso conservador (el techo del rango).
  function aproxRango(a, b) {
    if (b === null || b === undefined || b < 12) return '';
    return 'aprox. ' + textoMeses(b);
  }
  function mesesPlazos(x) { return x.techo === null ? '—' : mesesRango(x.desde !== null ? x.desde : x.techo, x.techo); }
  function aproxPlazos(x) { return x.techo === null ? '' : aproxRango(x.desde !== null ? x.desde : x.techo, x.techo); }
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
    // S34: con tu pie ya en marcha, se calcula con lo que llevas (antes, con lo del principio: el mismo
    // edificio salía un mes más tarde en Departamentos que en Tu compra).
    return { ahorroActual: (estado.ahorroIniciado ? estado.ahorrado : estado.ahorroActual) || 0, ahorroMensual: estado.ahorroMensual,
      sueldoPropio: estado.sueldoPropio, sueldoPareja: estado.sueldoPareja, modo: estado.modo,
      rshTramo: estado.rshTramo || undefined, rshSobre90: estado.rshTramo ? estado.rshTramo > 90 : undefined };
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
  var PIE_PARA = { 'grupo-vivir': 'compra en grupo', 'individual-vivir': 'compra directa', 'arriendo-opcion': 'arriendo con opción', 'respaldo-familiar': 'garantía de un familiar', 'familiar-vivir': 'garantía de un familiar' };
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
    return '';
  }
  // S24-B1 (10-nov): la UF va chica, bajo el monto en pesos.
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
      '<span class="b gris"><i style="width:' + (estado.arriendoActual / max * 100).toFixed(1) + '%"></i></span>' +
      '<p><span>Tu dividendo</span><span><strong>' + formatoRedondeado(div) + '</strong> <span class="hoy">' + SEP + ufDecimales(div / SUPUESTOS.uf, 2) + '</span></span></p>' +
      '<span class="b azul"><i style="width:' + (div / max * 100).toFixed(1) + '%"></i></span>' +
    '</div>';
  }
  // S25: tu pie dentro del azul de Inicio, como en el canvas.
  var VENTANAS_CANVAS = [1, 0, 0, 1, 'tu', 1, 0, 1, 1, 1, 1, 0, 1];
  // 9-nov: abajo en Inicio, tu departamento en construcción a la izquierda y qué hacer a la derecha.
  // Sin cuenta: la invitación a empezar. Con cuenta: lo que va y seguir sumando.
  // Comentario 10-nov: el edificio en construcción va dentro de la sección azul de Inicio (dentro = true).
  function tarjetaObra(dentro) {
    var s = fotoPasos();
    if (!s.numeros) return '';
    var o = avanceObraDe(s);
    var clase = dentro ? 'tarjeta-obra obra-en-noche' : 'tarjeta tarjeta-obra';
    if (!s.cuentaVivienda)
      return '<div class="' + clase + '">' +
        '<div class="obra-izq">' + obraSvg(o) + '</div><div class="obra-der">' +
          '<h2 class="h5" id="titulo-obra">Empieza a llenar tu pie</h2>' +
          '<a class="btn ' + (dentro ? 'btn-secundario-light' : 'btn-secundario-dark') + ' btn-sm" href="#pie">Abrir mi cuenta</a></div></div>';
    // Comentario 9-nov: Tu pie (Cuenta Vivienda) y su avance van en la misma tarjeta que tu departamento en obra.
    var pct = s.meta > 0 ? Math.min(100, Math.round(s.ahorrado / s.meta * 100)) : 0;
    return '<a class="' + clase + ' con-pie" href="#pie" aria-label="Tu pie: ' + formatoPesos(s.ahorrado) + ', ' + pct + ' % de ' + formatoRedondeado(s.meta) + '. ' + textoEtapaPie(o) + '. Ver tu pie">' +
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
  // S27-B2 (test del 12-nov: 4 de 5 no sabían que tenían que ir a Explorar): el camino recomendado,
  // con el porqué en una línea y un enlace directo a ese camino. Solo mientras no eliges uno.
  function recomendadoParaTi() {
    if (estado.caminoElegido && CAMINOS[estado.caminoElegido] && !CAMINOS[estado.caminoElegido].ficha) return null;
    if (!estado.preguntasListas || !ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return null;
    var r; try { r = recomendarCamino(perfilActual()); } catch (e) { return null; }
    return r && !r.todaviaNo && CAMINOS[r.id] ? r : null;
  }
  function selloParaTi() { return '<span class="sello-para-ti">' + icono('i-ok') + 'Te lo recomendamos</span>'; }
  // El crédito tradicional (Bci presta el 80 %; pie del 20 % más gastos) para el rango, sin piezas.
  function plazoTradicional(mensual) {
    var pf = perfilPiezas();
    if (mensual) pf.ahorroMensual = mensual;
    var d = deptosRango({});
    // Mismos departamentos que los otros caminos: si está en obra, también esperas la entrega.
    var uno = function (dep) {
      var listaUF = dep.listaUF, meses = plazoCreditoSiempre(pf, listaUF), freno = 'ahorro';
      if (dep.enObra && dep.mesesEntrega > 0 && meses !== null && dep.mesesEntrega > meses) { meses = dep.mesesEntrega; freno = 'entrega'; }
      return { meses: meses, freno: freno,
        dividendo: ufAPesos(cuotaFija(listaUF * SUPUESTOS_PIEZAS.creditoSiempre, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF) };
    };
    return { desde: uno(d.desde), hasta: uno(d.hasta), deptos: d };
  }
  function etiquetaTradicional(m) {
    // S29 (13-nov, Bárbara): más corto, sin "para un crédito tradicional".
    // S31 (18-nov, Bárbara): se mantiene arriba, pero dice claro que es el crédito tradicional.
    return m === 0 ? 'Ya tienes tu pie del 20' + NBSP + '%' : 'Si compras con crédito tradicional (pie del 20' + NBSP + '%), lo juntas en';
  }
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
    // S27-B2 (pedido de Bárbara, 12-nov): sin camino elegido, arriba va el crédito tradicional (pie del 20 %),
    // y debajo, "¿Te parece mucho tiempo?" con los caminos que te hacen llegar antes.
    var trad = (!eligio || estado.caminoElegido === 'usados') && !justo;
    var h = trad ? plazoTradicional(mensual) : x;
    var etiqueta = function (m) { return trad ? etiquetaTradicional(m) : etiquetaLlaves(m); };

    c.innerHTML =
      // S29 (13-nov): el rango va como chip junto al título: una línea menos arriba.
      '<header class="encabezado inicio-cabeza">' + FIGURAS + campana() +
        '<div class="titulo-fila"><h1 id="titulo-inicio" class="h2" tabindex="-1">Tu compra</h1>' +
        '<button type="button" class="chip-rango" id="btn-cambiar-departamento" aria-haspopup="dialog" aria-label="Tu rango de precio: ' + pesosRango(rango) + '. Cambiar">' +
          pesosRango(rango) + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button></div>' +
      '</header>' +
      // 10-nov: el edificio que se construye va dentro de la sección azul; con "Todavía no", arriba.
      (justo
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-plazo"><p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-plazo">' + razon + ' ' + ayuda('tu-limite') + '</h2>' + salidaPrincipalHtml() + '</section>'
        : '<section class="noche mi-compra-fecha" aria-labelledby="titulo-plazo">' +
            '<span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">' + etiqueta(h.hasta.meses) + '</p>' +
            '<strong class="numero noche-plazo' + claseLargo(mesesRango(h.desde.meses, h.hasta.meses)) + '" id="numero-plazo" aria-live="polite">' + mesesRango(h.desde.meses, h.hasta.meses) + '</strong>' +
            '<span class="noche-aprox" id="plazo-aprox">' + aproxRango(h.desde.meses, h.hasta.meses) + '</span>' +
            '<span class="oculto-visual" id="llaves-fecha">' + (trad ? '' : textoLlavesRango(x)) + '</span>' +
            // S29 (13-nov, Bárbara): sin el chip "Te frena".
            // S29 (opción B, 13-nov): el edificio grande, a todo el ancho, y el botón debajo de la obra.
            // S32-B3: la obra vive en Tu pie (D7). Aquí, comparar caminos.
            // S34: sin camino, «Ahora» ya dice «Comparar caminos»: no se repite arriba.
            // 20-nov: con camino elegido ya no se muestra «Comparar caminos» aquí (sigue en Departamentos y en la ficha).
          '</section>') +
      // S32-B3: el deslizador pasa a Tu pie y al comparador (D9); «¿Te parece mucho tiempo?» lo reemplaza «Ahora» (D8).
      animosInicio() +
      bloqueRecorrido();

    iniciarSiguientePaso();
    if ($('btn-ver-departamentos')) $('btn-ver-departamentos').addEventListener('click', function () { prepararProyectos(estado.caminoElegido); });
    $('btn-cambiar-departamento').addEventListener('click', function () { abrirCambiarRango($('btn-cambiar-departamento')); });
    if ($('btn-meta-rango')) $('btn-meta-rango').addEventListener('click', function () { abrirCambiarRango($('btn-meta-rango')); });
  }

  // S19-B4: cuando todavía no llega, una meta concreta para este mes (metaDelMes en calculos.js).

  // ---------- 9-nov: "Todavía no" con salida (evaluación heurística, punto 6) ----------
  // Lo que, por sí solo, hace que te alcance, con su fecha. Orden: ayudas que existen hoy, terminar cuotas,
  // un rango más bajo, la compra en grupo (propuesta) y sumar una renta.
  function conCambios(cambios, fn) {
    var antes = {};
    Object.keys(cambios).forEach(function (k) { antes[k] = estado[k]; estado[k] = cambios[k]; });
    try { return fn(); } finally { Object.keys(antes).forEach(function (k) { estado[k] = antes[k]; }); }
  }
  var salidasActuales = [];
  function salidasTodaviaNo() {
    var lista = [];
    var on = piezasOn();
    var mensual = estado.ahorroMensual || 300000;
    var llaves = function (onX) { var x = plazoVivir(mensual, onX); return x.desde.meses; };
    var pieza = function (id, texto, boton, href) {
      if (on[id]) return;
      var on2 = Object.assign({}, on); on2[id] = true;
      if (piezasValidas(on2)[id] && evaluarCabe(on2).cabe) lista.push({ tipo: 'pieza', id: id, texto: texto, boton: boton, href: href, meses: llaves(on2) });
    };
    pieza('subsidio', 'Con el subsidio DS1 sí te alcanza', 'Ver cómo sumar el DS1', '#compra/caminos/individual-vivir/como');
    pieza('iva', 'Con un departamento sin IVA sí te alcanza', 'Ver los sin IVA', '#compra/caminos/individual-vivir/como');
    if (estado.otrasCuotas > 0) conCambios({ otrasCuotas: 0 }, function () {
      if (evaluarCabe().cabe) lista.push({ tipo: 'cuota', texto: 'Al terminar tus otras cuotas sí te alcanza', boton: 'Actualizar mis cuotas', meses: llaves() });
    });
    var actual = rangoActual();
    if (actual) RANGOS_PRECIO.filter(function (x) { return x.hasta <= actual.desde; }).reverse().some(function (x) {
      return conCambios({ rangoPrecio: x.id }, function () {
        if (!candidatosVivir().length || !evaluarCabe().cabe) return false;
        lista.push({ tipo: 'rango', rango: x, texto: 'En el rango ' + textoRango(x) + ' sí hay departamentos que te alcanzan', boton: 'Cambiar mi rango', meses: llaves() });
        return true;
      });
    });
    pieza('grupo', 'Comprando en grupo sí te alcanza', 'Ver la compra en grupo', '#compra/caminos/grupo-vivir');
    // Sumar una renta (tu pareja o un familiar como codeudor), de $50 mil en $50 mil, hasta $2 millones.
    for (var extra = 50000; extra <= 2000000; extra += 50000) {
      var cabe = conCambios({ sueldoPareja: (estado.sueldoPareja || 0) + extra }, function () { return evaluarCabe().cabe ? llaves() : false; });
      if (cabe !== false) { lista.push({ tipo: 'renta', extra: extra, texto: 'Con ' + formatoRedondeado(extra) + ' más de renta en tu hogar sí te alcanza', boton: 'Sumar a alguien de tu equipo', href: '#perfil', meses: cabe }); break; }
    }
    salidasActuales = lista;
    return lista;
  }
  function textoSalida(x) { return x.texto + (typeof x.meses === 'number' ? ': llaves en ' + fechaLlaves(x.meses, hoyDemo()) : '') + '.'; }
  function botonSalida(x, i, clase) {
    return x.href ? '<a class="' + clase + '" href="' + x.href + '">' + x.boton + '</a>'
      : '<button type="button" class="' + clase + '" data-salida="' + i + '"' + (x.tipo === 'cuota' ? ' aria-haspopup="dialog"' : '') + '>' + x.boton + '</button>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-salida]');
    if (!b) return;
    var x = salidasActuales[Number(b.dataset.salida)];
    if (!x) return;
    if (x.tipo === 'cuota') abrirMisDatos(b);
    else if (x.tipo === 'rango') { estado.rangoPrecio = x.rango.id; guardarEstado(); toast('Tu rango: ' + textoRango(x.rango) + '.'); mostrar(); }
  });
  // Inicio: la razón, el "sí" más cercano con su fecha y una acción.
  function salidaPrincipalHtml() {
    var x = salidasTodaviaNo()[0];
    if (!x) return '<p class="todavia-salida">Sigue juntando tu pie: cuando cambien tus números, te avisamos.</p>';
    return '<p class="todavia-salida">' + textoSalida(x) + '</p>' + botonSalida(x, 0, 'btn btn-primario btn-bloque');
  }
  // Tus pasos: todas las salidas, más apartar lo de este mes.
  function salidasHtml() {
    var lista = salidasTodaviaNo();
    return '<section class="tarjeta bloque meta-mes" aria-labelledby="titulo-que-cambia">' +
      '<h2 class="h5" id="titulo-que-cambia">Qué lo cambia</h2>' +
      '<ul class="lista-check">' +
        (estado.ahorroMensual > 0 ? '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>Mientras tanto, aparta ' + formatoRedondeado(estado.ahorroMensual) + ' este mes en tu pie</span></li>' : '') +
        lista.map(function (x, i) {
          return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + textoSalida(x) + '<br>' + botonSalida(x, i, 'enlace') + '</span></li>';
        }).join('') +
      '</ul></section>';
  }

  // S17-F9: Llega antes. Cada pieza es una fila: nombre, efecto, "?" e interruptor. La recomendada lleva ★.
  var piezaAbierta = null, mesesLlegaAntes = null;
  // S24-B2: una línea por ayuda, para que se entienda sin abrir el "?".
  var DESC_PIEZA = {
    grupo: 'Te unes a otros para comprar, cada uno su departamento, y baja el precio.',
    subsidio: 'El Estado pone UF que se suman a tu pie.',
    iva: 'Algunos departamentos nuevos no cobran IVA.',
    regalo: 'Tu familia aporta a tu pie con un enlace.',
    respaldo: 'Un familiar deja una garantía y pones menos pie.'
  };
  // 11-nov (test con usuarios): "¿Cómo puedes llegar antes?" ya no son interruptores. Es una sección que explica
  // cada ayuda (qué es, para quién, cuánto, cómo se pide y dónde la ves en la app) y qué significa en tu caso.
  // Solo se muestran las ayudas que sirven en el camino desde el que se entra (sin IVA, solo con terminados).
  var AYUDAS_CAMINO = {
    'individual-vivir': ['ds1', 'ds19', 'iva', 'regalo'],
    'familiar-vivir': ['ds1', 'ds19', 'iva', 'regalo'],
    'grupo-vivir': ['ds1', 'ds19', 'regalo']
  };
  function mesesQueAcerca(pieza) {
    try {
      var sin = plazoVivir(null, {}).hasta.meses;
      var on = {}; on[pieza] = true;
      var con = plazoVivir(null, on).hasta.meses;
      return sin !== null && con !== null ? sin - con : 0;
    } catch (e) { return 0; }
  }
  function renderLlegaAntes(volverA) {
    var cont = $('caminos-contenido');
    var rango = rangoActual();
    var x = plazoVivir();
    var pf = x.perfil;
    var ids = (AYUDAS_CAMINO[volverA] || ['ds1', 'ds19', 'iva', 'regalo']).slice();
    var camino = volverA && CAMINOS[volverA] ? volverA : null;
    var precioRef = x.deptos && x.deptos.hasta ? x.deptos.hasta.listaUF : null;
    var cierreDS1 = FECHAS_IMPORTAN[0].fecha;
    var nDS19 = (camino ? proyectosDeCamino(camino) : PROYECTOS).filter(function (p) { return p.ds19; }).length;
    // S30-B1 (test: "no entendían los términos", y Ayudas tenía 597 palabras): cada ayuda es una fila con su efecto en meses;
    // al tocarla se abre lo esencial (para quién, cuánto, hasta cuándo, cómo pedirlo) y dos acciones. Cifras y fechas salen de los datos.
    var AYUDA = {
      ds1: { sigla: 'DS1', nombre: 'Subsidio DS1', hoy: true, pieza: 'subsidio', filtro: 'ds1',
        quien: 'Primera vivienda, solo en proyectos DS19 con cupos limitados, y con Registro Social de Hogares',
        cuanto: 'UF 250 a 410 a tu pie (deptos hasta UF 4.000)',
        hasta: 'Llamado cierra el ' + formatoFecha(cierreDS1),
        suma: ['Garantía del Estado', 'Compra en grupo'],
        pasos: ['Inscríbete en el Registro Social', 'Junta el ahorro en tu cuenta', 'Postula en el sitio del Minvu'] },
      ds19: { sigla: 'DS19', nombre: 'Proyectos DS19', hoy: true, filtro: 'ds19',
        quien: 'Primera vivienda, solo en proyectos DS19 con cupos limitados, y con Registro Social de Hogares',
        cuanto: 'Un subsidio del Estado; el monto depende del tramo y la comuna (por confirmar)',
        hasta: 'Según el proyecto',
        suma: ['Garantía del Estado', 'Compra en grupo', 'DS1'],
        pasos: ['Elige un proyecto DS19', 'La inmobiliaria te ayuda a postular', 'Confirma los montos con ella o el Serviu'] },
      iva: { sigla: 'IVA', nombre: 'Sin IVA', hoy: true, pieza: 'iva', filtro: 'sin-iva',
        quien: 'Departamentos nuevos terminados, en su primera venta',
        cuanto: 'El precio baja cerca de un 10' + NBSP + '%',
        hasta: 'Promesa hasta el ' + formatoFecha(FECHAS_IMPORTAN[1].fecha),
        pasos: ['Elige uno terminado', 'Pide el precio sin IVA', 'Firma la promesa a tiempo'] },
      regalo: { sigla: '$', nombre: 'Regalo de tu familia', hoy: false, pieza: 'regalo', href: '#regalo', accion: 'Pedir un regalo para mi pie',
        quien: 'Familia o amistades',
        cuanto: 'Lo que cada uno quiera aportar',
        hasta: 'Mitad del impuesto hasta nov-2027, si donan por escritura',
        pasos: ['Manda el enlace desde Tu pie', 'Tu familia aporta', 'Llega a tu cuenta de vivienda'] },
      respaldo: { sigla: 'Fam', nombre: 'Respaldo familiar', hoy: false, pieza: 'respaldo', href: '#compra/ficha/respaldo-familiar', accion: 'Ver el respaldo familiar',
        quien: 'Un familiar que deja el 10' + NBSP + '% en garantía',
        cuanto: 'Pones el 5' + NBSP + '% de pie en vez del 10' + NBSP + '%',
        hasta: '',
        pasos: ['Manda el enlace a tu familiar', 'Deja la garantía', 'La recupera después'] }
    };
    // Impacto en meses (lo que ya calcula la app). Las que no se calculan muestran su cifra.
    ids.forEach(function (id) {
      var a = AYUDA[id];
      a.meses = a.pieza ? mesesQueAcerca(a.pieza) : 0;
      a.cifra = id === 'ds19' ? 'Subsidio del Estado' : (id === 'regalo' ? 'Lo que aporten' : (id === 'respaldo' ? 'Pie del 5' + NBSP + '%' : ''));
    });
    ids.sort(function (p, q) { return AYUDA[q].meses - AYUDA[p].meses; });
    var maxMeses = Math.max.apply(null, ids.map(function (id) { return AYUDA[id].meses; }).concat([1]));
    // ✓ / Te falta, según tus números.
    var tuMarca = function (id) {
      if (id === 'ds1') {
        if (!precioRef) return '';
        var r = ds1Para(precioRef, pf);
        return r.bloqueo ? '<span class="ayuda-marca falta">' + icono('i-alerta') + 'Hoy no: ' + primeraMinuscula(r.bloqueo.razon) + '</span>'
          : '<span class="ayuda-marca ok">' + icono('i-check') + 'Te sirve</span>';
      }
      if (id === 'ds19') return nDS19 ? '<span class="ayuda-marca ok">' + icono('i-check') + plural(nDS19, 'proyecto aquí', 'proyectos aquí') + '</span>' : '<span class="ayuda-marca falta">' + icono('i-alerta') + 'Sin proyectos aquí</span>';
      return '';
    };
    var fila = function (id, abierta) {
      var a = AYUDA[id];
      var impacto = a.meses > 0
        ? '<span class="ayuda-barra" aria-hidden="true"><i style="--w:' + (a.meses / maxMeses).toFixed(2) + '"></i></span><strong><span aria-hidden="true">−</span>' + textoMeses(a.meses) + '<span class="oculto-visual"> antes</span></strong>'
        : '<strong>' + a.cifra + '</strong>';
      var cuerpo =
        (id === 'ds1' ? '<p class="ayuda-tu">' + icono('i-info') + 'Es un acelerador: se suma a un camino. No es un camino ni un tipo de departamento.</p>' : '') +
        (id === 'ds19' ? '<p class="ayuda-tu">' + icono('i-info') + 'DS19 es un camino aparte: solo sirve en proyectos DS19 específicos. Si eliges uno, tu elección se limita a esos proyectos.</p>' : '') +
        '<dl class="ayuda-datos">' +
          '<div>' + icono('i-persona') + '<dt>Para quién</dt><dd>' + a.quien + '</dd></div>' +
          '<div>' + icono('i-alcancia') + '<dt>Cuánto</dt><dd>' + a.cuanto + '</dd></div>' +
          (a.hasta ? '<div>' + icono('i-calendario') + '<dt>Hasta cuándo</dt><dd>' + a.hasta + '</dd></div>' : '') +
          (a.suma ? '<div>' + icono('i-grupo') + '<dt>Se suma a</dt><dd>' + a.suma.join(' · ') + '</dd></div>' : '') +
        '</dl>' +
        (tuMarca(id) ? '<p class="ayuda-tu">' + tuMarca(id) + '</p>' : '') +
        '<ol class="ayuda-pasos" aria-label="Cómo pedirlo">' + a.pasos.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>' +
        '<div class="ayuda-acciones">' +
          (id === 'ds1' ? '<button type="button" class="btn btn-primario btn-bloque" data-ayuda-mision="ds1">Postular al DS1</button>'
            : a.href ? '<a class="btn btn-primario btn-bloque" href="' + a.href + '">' + a.accion + '</a>'
            : camino ? '<button type="button" class="btn btn-primario btn-bloque" data-ayuda-filtro="' + a.filtro + '">Ver departamentos ' + (id === 'iva' ? 'sin IVA' : id === 'ds19' ? 'DS19' : 'con DS1') + '</button>' : '') +
          (id === 'ds1' && camino ? '<button type="button" class="btn btn-terciario btn-bloque" data-ayuda-filtro="ds1">Ver departamentos con DS1</button>' : '') +
        '</div>';
      return '<li class="ayuda-fila" id="ayuda-' + id + '">' +
        '<h2 class="ayuda-fila-titulo"><button type="button" class="ayuda-cab" data-ayuda="' + id + '" aria-expanded="' + (abierta ? 'true' : 'false') + '" aria-controls="ayuda-cuerpo-' + id + '">' +
          '<span class="ayuda-sigla" aria-hidden="true">' + a.sigla + '</span>' +
          '<span class="ayuda-nombre"><span>' + a.nombre + '</span><span class="chip ' + (a.hoy ? 'chip-existe' : 'chip-propuesta') + '">' + (a.hoy ? 'Existe hoy' : 'Propuesta para Bci') + '</span>' + (id === 'ds19' ? '' : '<span class="chip chip-existe">Acelerador</span>') + '</span>' +
          '<span class="ayuda-impacto">' + impacto + '</span>' +
          icono('i-flecha', 'ayuda-flecha') +
        '</button></h2>' +
        '<div class="ayuda-cuerpo" id="ayuda-cuerpo-' + id + '"' + (abierta ? '' : ' hidden') + '>' + cuerpo + '</div></li>';
    };
    cont.innerHTML =
      (camino ? '<a href="#compra/caminos/' + camino + '" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + CAMINOS[camino].corto + '</a>'
        : '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>') +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2">Ayudas para llegar antes</h1>' +
        '<p class="texto-apoyo">Suman a tu pie y adelantan tus llaves.</p>' +
        (rango ? '<p class="llega-rango">Para un departamento de ' + textoRango(rango) + SEP + '<button type="button" class="enlace" id="btn-caminos-rango" aria-haspopup="dialog">Cambiar</button></p>' : '') +
      '</header>' +
      '<ul class="ayudas-lista">' + ids.map(function (id, i) { return fila(id, i === 0); }).join('') + '</ul>' +
      (camino === 'grupo-vivir' ? '<p class="texto-apoyo"><small>Sin IVA: ' + RAZON_CHIP['sin-iva'] + '</small></p>' : '') +
      '<p class="llega-sello">Montos referenciales. Sin contar que el departamento suba de precio.</p>';
    // Una sola abierta a la vez.
    cont.querySelectorAll('.ayuda-cab').forEach(function (b) {
      b.addEventListener('click', function () {
        var abrir = b.getAttribute('aria-expanded') !== 'true';
        cont.querySelectorAll('.ayuda-cab').forEach(function (o) {
          o.setAttribute('aria-expanded', 'false');
          $('ayuda-cuerpo-' + o.dataset.ayuda).hidden = true;
        });
        if (abrir) {
          b.setAttribute('aria-expanded', 'true');
          $('ayuda-cuerpo-' + b.dataset.ayuda).hidden = false;
        }
      });
    });
    cont.querySelectorAll('[data-ayuda-filtro]').forEach(function (b) {
      b.addEventListener('click', function () {
        chipsActivos = {}; chipsActivos[b.dataset.ayudaFiltro] = true; soloFavoritos = false;
        location.hash = '#compra/caminos/' + camino;
      });
    });
    var m = cont.querySelector('[data-ayuda-mision]');
    if (m) m.addEventListener('click', function () { abrirMision('ds1', m); });
    if ($('btn-caminos-rango')) $('btn-caminos-rango').addEventListener('click', function () { abrirCambiarRango($('btn-caminos-rango')); });
  }


  // S35 (informe «dónde se confunde», punto 13): para arrendar, la misma estructura que Tu compra para vivir:
  // la fecha en azul, Tus pasos con «Ahora» adentro, tu edificio y las misiones. Sin «ventana» ni deslizador
  // (el deslizador vive en Tu pie y en Comparar). Sin camino elegido, arriba va el crédito al 80 % (el de siempre
  // para arrendar), igual que el crédito tradicional para vivir.
  function plazoArrendar(mensual) {
    var pf = Object.assign({}, perfilActual(), { ahorroMensual: mensual || estado.ahorroMensual || 300000 });
    var rango = rangoActual();
    var c = estado.caminoElegido;
    var id = c && CAMINOS[c] && !CAMINOS[c].ficha && CAMINOS[c].modo === 'arrendar' ? c : caminoBase('arrendar');
    var techo = numerosCamino(id, listaMeta(), pf);
    var desde = rango ? numerosCamino(id, rango.desde, pf) : techo;
    var cumple = function (n) { return !!(n.evaluacion && n.evaluacion.cumple) && n.meses !== null; };
    return { id: id, eligio: id === c, desde: desde.meses, techo: techo.meses, cabe: cumple(techo) || cumple(desde) };
  }
  function renderTuCamino() {
    var c = $('inicio-principal');
    var perfil = perfilActual();
    var rango = rangoActual();
    var x = plazoArrendar();
    var justo = !x.cabe;
    var desde = x.desde !== null && x.desde <= x.techo ? x.desde : x.techo;
    var etiqueta = x.techo === 0 ? 'Ya tienes tu pie' : x.eligio ? 'Juntas tu pie en'
      : 'Si compras con crédito al 80' + NBSP + '% (pie del 20' + NBSP + '%), lo juntas en';
    var plazoTxt = mesesRango(desde, x.techo);
    c.innerHTML =
      '<header class="encabezado inicio-cabeza">' + FIGURAS + campana() +
        '<div class="titulo-fila"><h1 id="titulo-inicio" class="h2" tabindex="-1">Tu compra</h1>' +
        '<button type="button" class="chip-rango" id="btn-cambiar-departamento" aria-haspopup="dialog" aria-label="Tu rango de precio: ' + pesosRango(rango) + '. Cambiar">' +
          pesosRango(rango) + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button></div>' +
      '</header>' +
      (justo
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-plazo">' +
            '<p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-plazo">Hoy te dejaría muy justo ' + ayuda('tu-limite') + '</h2>' +
            (function () {
              var cx = cambiosTodaviaNo(perfil, x.id)[0];
              return (cx ? '<p class="todavia-salida">' + tituloCambio(cx) + ' sí te dejaría bien.</p>' : '') +
                '<a class="btn btn-primario btn-bloque" href="#compra/caminos/cambia">Ver qué lo cambia</a>';
            })() +
          '</section>'
        : '<section class="noche mi-compra-fecha" aria-labelledby="titulo-plazo">' +
            '<span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">' + etiqueta + '</p>' +
            '<strong class="numero noche-plazo' + claseLargo(plazoTxt) + '" id="numero-plazo">' + plazoTxt + '</strong>' +
            '<span class="noche-aprox" id="plazo-aprox">' + aproxRango(desde, x.techo) + '</span>' +
            (x.eligio ? '<p class="noche-sub">Tu camino: ' + primeraMinuscula(CAMINOS[x.id].corto) + '</p>' : '') +
          '</section>') +
      animosInicio() +
      bloqueRecorrido();
    iniciarSiguientePaso();
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
  // 20-nov (regla del grupo): los cupos cierran en una fecha fija y todos firman el mismo día, cuando se entrega el edificio.
  // «Es tuyo» es esa fecha, igual para todos. Tu pie se paga en cuotas hasta ese día: la app dice cuánto juntar al mes
  // y, si no se puede (te quedaría menos del 40 % de tu sueldo para vivir), lo dice.
  function planGrupo(p) {
    var pd = plazoDepartamento(p);
    var meta = pd.meta;
    var falta = Math.max(0, meta - ahorradoTuPie(meta));
    var meses = mesesParaEntrega(p);
    var cuota = meses > 0 ? Math.ceil(falta / meses / 1000) * 1000 : falta;
    var pf = perfilActual();
    var ingreso = ingresoTotal(pf.sueldoPropio, pf.sueldoPareja) || 0;
    var maximo = ingreso ? Math.max(0, ingreso * (1 - MINIMO_PARA_VIVIR) - (pf.arriendoActual || 0) - (pf.otrasCuotas || 0)) : Infinity;
    return { meses: meses, fecha: fechaLlaves(meses, hoyDemo()), meta: meta, falta: falta, cuota: cuota,
      alcanza: falta === 0 || (estado.ahorroMensual || 0) >= cuota, posible: cuota <= maximo };
  }
  function textoPlanGrupo(g) {
    return g.falta === 0 ? 'Ya tienes tu pie para la firma.'
      : g.alcanza ? 'Con lo que juntas hoy llegas con tu pie a la firma.'
      : g.posible ? 'Para llegar con tu pie, sube tu cuota a ' + formatoRedondeado(g.cuota) + ' al mes.'
      : 'No alcanzas: necesitarías juntar ' + formatoRedondeado(g.cuota) + ' al mes. Mira otro edificio u otro camino.';
  }
  // 20-nov: la compra en grupo tiene una fecha fija; se ve siempre (en Tu compra y en el detalle).
  function cierreGrupoHtml(p, clase) {
    if (!p || p.tipo !== 'conjunto' || !p.cierre) return '';
    var d = diasEntre(hoyDemo(), p.cierre);
    var asegurado = !!(estado.pasos && estado.pasos.preaprobado);
    var texto = d <= 0 ? 'El grupo ya cerró el ' + formatoFecha(p.cierre)
      : (asegurado ? 'El grupo cierra el ' : 'Asegura tu cupo antes del ') + formatoFecha(p.cierre);
    return '<p class="cierre-grupo ' + (clase || '') + (d > 0 && d <= 14 ? ' pronto' : '') + '">' + icono('i-pronto') +
      '<span>' + texto + (d > 0 ? '<b>' + (d === 1 ? 'Queda 1 día' : 'Quedan ' + d + ' días') + '</b>' : '') + '</span></p>';
  }
  // 23-nov: ficha estándar de la compra en grupo. Cada inmobiliaria define sus reglas; lo fijo lo pone Bci.
  // Las cifras son de ejemplo (simuladas): no están validadas con inmobiliarias.
  function fichaGrupoHtml(p) {
    if (!p || p.tipo !== 'conjunto') return '';
    var d = p.cierre ? diasEntre(hoyDemo(), p.cierre) : 0;
    var cierre = p.cierre ? (d > 0 ? 'cierra el ' + formatoFecha(p.cierre) : 'cerró el ' + formatoFecha(p.cierre)) : 'cierra pronto';
    var pct = Math.round(SUPUESTOS_PIEZAS.descuentoGrupo * 100);
    return '<section class="ficha-grupo" aria-labelledby="ficha-grupo-titulo">' +
      '<h3 class="h6" id="ficha-grupo-titulo">Reglas de este grupo <span class="chip chip-propuesta">Ejemplo simulado</span></h3>' +
      '<p class="ficha-grupo-linea">Necesitas 10 compradores' + SEP + cierre + SEP + 'beneficio: ' + pct + NBSP + '% menos en el precio' + SEP + 'si no se llega al mínimo, nadie queda amarrado.</p>' +
      '<ul class="ficha-grupo-lista">' +
        '<li>' + icono('i-check') + 'Cada persona tiene su cuenta, su promesa y su crédito en Bci.</li>' +
        '<li>' + icono('i-check') + 'No hay fondo común: tu dinero es solo tuyo.</li>' +
        '<li>' + icono('i-check') + 'Puedes salir sin costo antes de la fecha de cierre.</li>' +
      '</ul>' +
      '<p class="ficha-grupo-nota">Cada inmobiliaria define sus reglas. Estas son de ejemplo.</p></section>';
  }
  function cuandoLlegasCompra(p, sinObra) {
    if (estado.modo === 'vivir' && p.tipo === 'conjunto' && !compraSinGrupo(p) && mesesParaEntrega(p) > 0) {
      var g = planGrupo(p);
      return '<section class="noche sin-slider' + (sinObra ? ' mi-compra-fecha' : '') + '" aria-labelledby="titulo-cuando">' +
        '<span class="noche-luna" aria-hidden="true"></span>' +
        '<p class="noche-etiqueta" id="titulo-cuando">Firman todos en</p>' +
        '<strong class="numero noche-plazo' + claseLargo(textoMeses(g.meses)) + '">' + textoMeses(g.meses) + '</strong>' +
        '<p class="noche-sub">Recibes tus llaves en ' + g.fecha + ': el mismo día para todo el grupo</p>' +
        '<p class="plan-grupo' + (g.alcanza ? ' ok' : g.posible ? ' sube' : ' no') + '">' + icono(g.alcanza ? 'i-check' : 'i-info') + '<span>' + textoPlanGrupo(g) + '</span></p>' +
        cierreGrupoHtml(p, 'en-azul') +
        (sinObra ? '' : tarjetaObra(true)) +
      '</section>';
    }
    var meta = metaCompra(p);
    var pl = plazoTuPie(p, meta);
    var mesesPie = mesesParaMeta(Math.max(0, meta - ahorradoTuPie(meta)), estado.ahorroMensual) || 0;
    // Comentario 9-nov: como el canvas: tus llaves en el azul y tu pie adentro, arriba.
    return '<section class="noche sin-slider' + (sinObra ? ' mi-compra-fecha' : '') + '" aria-labelledby="titulo-cuando">' +
      '<span class="noche-luna" aria-hidden="true"></span>' +
      // Comentario 9-nov: la cifra es cuándo logras tu pie; las llaves (que pueden esperar la entrega) van debajo.
      // S33: con el pie ya juntado no se dice «Logras tu pie en Ya».
      '<p class="noche-etiqueta" id="titulo-cuando">' + (mesesPie === 0 ? 'Tu pie' : 'Logras tu pie en') + '</p>' +
      '<strong class="numero noche-plazo">' + (mesesPie === 0 ? '¡Listo!' : mesesRango(mesesPie, mesesPie)) + '</strong>' +
      (aproxRango(mesesPie, mesesPie) ? '<span class="noche-aprox">' + aproxRango(mesesPie, mesesPie) + '</span>' : '') +
      '<p class="noche-sub">' + (sinObra ? 'Recibes tus llaves aprox. en ' + fechaLlaves(pl.meses + MESES_SI_A_LLAVES, hoyDemo()) : 'Tus llaves: ' + fechaLlaves(pl.meses, hoyDemo())) + '</p>' +
      cierreGrupoHtml(p, 'en-azul') +
      (sinObra ? '' : tarjetaObra(true)) +
    '</section>';
  }
  // S32-B3: «Ahora» (antes «Avanza pasos»): el paso o la misión que toca, con su botón directo.
  var BOTON_AHORA = { camino: 'Comparar caminos', depto: 'Elegir mi departamento', preaprobacion: 'Pedir mi preaprobación', pie: 'Ir a mi pie', aprobacion: 'Ver qué hace Bci', 'es-tuyo': 'Preparar mi firma', asegurar: 'Reservar', cuota: 'Pagar mi cuota', cuenta: 'Abrir mi cuenta' };
  function tarjetaSiguientePaso(dentro) {
    var s = fotoPasos();
    var sp = siguientePaso(s, hoyDemo());
    // S33-C2: dentro de «Tus pasos», «Ahora» es siempre el paso al que apunta (lo que vence sigue en Misiones).
    var hA = hitoActual(s);
    if (dentro && sp.tipo === 'mision' || dentro && sp.tipo === 'hito' && sp.id !== hA.id) {
      var dA = datosHito(hA.id, tipoHitos(s));
      sp = { tipo: 'hito', id: hA.id, titulo: dA.accion, gana: dA.gana, cuesta: dA.cuesta, plazo: null, hito: { indice: hA.indice, total: hA.total } };
    }
    pasoInicio = sp;
    if (sp.tipo === 'listo') return '';
    var gana = sp.tipo === 'mision' ? (sp.gana.charAt(0) === '+' ? 'Ganas ' + sp.gana : 'Sirve para: ' + sp.gana) : sp.gana;
    var href = destinoSiguiente(sp);
    var conCamino = !!estado.caminoElegido || s.eligio;
    // El número de paso solo cuando la tarjeta es el paso actual; si es algo que una fecha adelanta, se dice.
    var esPaso = sp.tipo === 'hito' && hitoActual(s).id === sp.id;
    var chip = esPaso ? 'Ahora' + SEP + 'paso ' + sp.hito.indice + (conCamino ? ' de ' + sp.hito.total : '')
      : sp.plazo ? 'Ahora' + SEP + 'vence pronto' : 'Ahora' + SEP + (sp.tipo === 'mision' ? 'misión' : 'antes de seguir');
    var boton = sp.id === 'pie' && !s.cuentaVivienda ? 'Abrir mi cuenta' : (sp.id === 'camino' && estado.modo === 'vivir' ? 'Elegir en Departamentos' : (BOTON_AHORA[sp.id] || 'Empezar'));
    return '<section class="' + (dentro ? 'ahora-dentro' : 'tarjeta siguiente-paso ahora') + '" aria-labelledby="titulo-siguiente">' +
      '<p class="chip chip-ahora">' + chip + '</p>' +
      '<h2 class="h3" id="titulo-siguiente">' + sp.titulo + '</h2>' +
      (gana ? '<p class="siguiente-gana">' + gana + '</p>' : '') +
      (href ? '<a class="btn btn-primario btn-bloque" href="' + href + '">' + boton + '</a>'
        : '<button type="button" class="btn btn-primario btn-bloque" id="btn-siguiente" aria-haspopup="dialog">' + boton + '</button>') +
    '</section>';
  }
  function textoBoton(sp) { return sp.tipo === 'cuota' ? 'Pagar mi cuota' : (sp.tipo === 'mision' ? 'Hacerlo ahora' : 'Empezar'); }
  // Adónde lleva la tarjeta: una dirección, o null si se abre la hoja del hito o la misión.
  function destinoSiguiente(sp) {
    if (sp.tipo === 'cuota') return '#pie';
    if (sp.tipo === 'mision') return sp.id === 'equipo' ? '#perfil' : (sp.id === 'elegir' ? (esArriendo() ? '#compra/caminos/arriendo-opcion' : rutaElegir()) : null);
    if (sp.id === 'numeros') return '#compra';
    // S32-B3: los pasos nuevos del camino.
    if (sp.id === 'camino') return estado.modo === 'vivir' ? '#departamentos' : '#compra/caminos';
    if (sp.id === 'depto') return rutaElegir();
    // D3: sin cuenta, «Juntar el pie» parte por abrirla (en su hoja).
    if (sp.id === 'pie') return fotoPasos().cuentaVivienda ? '#pie' : null;
    if (esArriendo()) return null;
    if (sp.id === 'cuenta' || (sp.id === 'preaprobacion' && !(estado.compra && !estado.compra.carga))) return null;
    // S34-1: si la compra sigue en el pie (grupo esperando la entrega), el paso de ahora se abre en su hoja;
    // antes llevaba a #compra/pie → #pie, y Tu pie devolvía a Tu compra: un círculo.
    if (estado.compra && rutaPasoActual() === 'pie' && sp.id !== 'pie') return null;
    if (estado.compra) return '#compra/' + rutaPasoActual();
    return rutaElegir();
  }
  // S33-C2 (E4): «Tus pasos» como una línea de metro: una parada por paso, tu avatar en la de ahora y
  // un edificio de departamentos al final. «Ahora» va dentro de la misma tarjeta, apuntando a tu parada.
  var celebraInicio = false;
  var abrirPasoAlLlegar = false;
  function edificioMeta(listo) {
    var luz = listo ? '#FFE300' : '#D4E3F5';
    var v = '';
    for (var f = 0; f < 4; f++) for (var c = 0; c < 3; c++) v += '<rect x="' + (12 + c * 8) + '" y="' + (10 + f * 8) + '" width="5" height="5" rx="1" fill="' + luz + '"/>';
    return '<svg width="44" height="48" viewBox="0 0 44 48" aria-hidden="true">' +
      '<rect x="8" y="5" width="28" height="41" rx="2" fill="#1D5699"/>' + v +
      '<rect x="19" y="40" width="6" height="6" fill="' + (listo ? '#FFE300' : '#7DAAE0') + '"/>' +
      (listo ? '<path d="M22 5V0l7 2.5L22 5" fill="#B20913"/>' : '') +
      '<rect x="2" y="45" width="40" height="3" rx="1.5" fill="#546E7A"/></svg>';
  }
  // S36 (lienzo P18): con departamento elegido, la última parada es la foto de tu futuro departamento.
  function fotoMeta(listo) {
    var p = proyectoCompra(), f = p && fotoEdificio(p);
    return f ? '<img class="cj-foto-meta" src="' + f + '" alt="" width="46" height="46">' : edificioMeta(listo);
  }
  function caminoJuego(h, celebra) {
    var N = h.total;
    var hechos = h.terminado ? N - 1 : Math.max(0, h.indice - 1);
    var actualI = h.terminado ? N - 1 : h.indice - 1;
    var sinCamino = N <= 2 && !estado.caminoElegido;
    var pct = function (i) { return ((i + 0.5) / N * 100).toFixed(2) + '%'; };
    var paradas = h.hitos.map(function (x, i) {
      var ultimo = i === N - 1, actual = x.estado === 'actual';
      var dentro = actual ? avatarSVG(estado.avatar, 46, 'cj-av' + (celebra ? ' sube' : ''))
        : ultimo ? fotoMeta(h.terminado) : '<span class="cj-num">' + (x.estado === 'hecho' ? '✓' : i + 1) + '</span>';
      return '<li class="metro-parada ' + x.estado + (ultimo ? ' meta' : '') + '"' + (actual ? ' aria-current="step"' : '') + '>' +
        '<button type="button" class="cj-parada ' + x.estado + '" data-cj-hito="' + x.id + '" aria-haspopup="dialog"' +
          ' aria-label="Paso ' + (i + 1) + ' de ' + N + ': ' + x.nombre + (x.estado === 'hecho' ? ', listo' : actual ? ', ahora' : '') + '">' + dentro + '</button>' +
        '<span class="metro-nombre" aria-hidden="true">' + (ultimo ? '¡Llaves!' : (CORTO_HITO[x.id] || x.nombre)) + '</span></li>';
    }).join('');
    var ahora = h.terminado ? '' : tarjetaSiguientePaso(true);
    return '<section class="camino-juego metro" aria-labelledby="titulo-recorrido">' +
      '<div class="camino-juego-cab"><h2 id="titulo-recorrido" class="h5">Tus pasos</h2><span>' + (h.terminado ? '¡Llegaste!' : !fotoPasos().caminoElegido && !fotoPasos().eligio ? 'Según tu camino' : listosDe(h) + ' de ' + N + ' listos') + '</span></div>' +
      '<div class="metro-linea" style="--n:' + N + '">' +
        '<span class="metro-via" aria-hidden="true" style="left:' + pct(0) + ';right:' + pct(0) + '"><i style="width:' + (N > 1 ? (hechos / (N - 1) * 100).toFixed(1) : 0) + '%"></i></span>' +
        '<ol class="metro-paradas" style="grid-template-columns:repeat(' + N + ',1fr)">' + paradas + '</ol>' +
      '</div>' +
      (sinCamino ? '<p class="camino-juego-nota">Tus pasos aparecen cuando eliges tu camino: cada camino tiene los suyos.</p>' : '') +
      (celebra ? '<div class="escalon-celebra cj-celebra" role="status"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#FFFFFF"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#28652B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<span>¡Avanzaste un paso!<small>Sigue así: ya vas en el paso ' + Math.min(h.indice, N) + ' de ' + N + '.</small></span></div>' : '') +
      (ahora ? '<div class="metro-ahora" style="--x:' + pct(actualI) + '">' + ahora + '</div>' : '') +
      // S36: sin camino no hay fechas que mostrar.
      (sinCamino ? '' : '<a class="enlace metro-fechas" href="#compra/recorrido">Ver con fechas ›</a>') +
    '</section>';
  }
  // S33-C2 (E7): tu edificio y tu grupo, como avance de tu compra. Al tocarla, abre Tu pie.
  // S33-C2 (E7), ajustado: el edificio real (foto o dibujo de la obra y su etapa), no el dibujo de tu pie,
  // para no confundir los dos. Al tocarla, abre Tu pie (donde están tu grupo y tu edificio).
  function tuEdificioHtml(s) {
    var p = proyectoCompra();
    if (!p || !(p.tipo === 'conjunto' || entregaPendiente(p))) return '';
    var etapa = etapaObraHoy(p), slug = FOTOS_ETAPA[etapa];
    var foto = hayFotos() && FOTOS.obra && FOTOS.obra[slug] ? 'fotos/obra/' + encodeURI(FOTOS.obra[slug]) : null;
    var fe = fotoEdificio(p);
    var img = fe ? '<img src="' + fe + '" alt="" loading="lazy">' : foto ? '<img src="' + foto + '" alt="" loading="lazy">' : '<svg viewBox="0 0 120 76" aria-hidden="true">' + DIBUJO_ETAPA[Math.min(3, etapa)] + '</svg>';
    var linea = '';
    if (p.tipo === 'conjunto' && !(estado.compra && estado.compra.sinGrupo)) {
      var r = resumen(p), g = p.grupo || {};
      var ultimo = (estado.historialMeses || []).slice(-1)[0];
      var pagaron = Math.min(r.cuposTomados, (g.pagaronMes || 0) + (ultimo === 'pago' ? 1 : 0));
      linea = '<small>' + icono('i-grupo') + pagaron + ' de ' + r.cuposTomados + ' de tu grupo pagaron este mes</small>';
    }
    var mE = mesesParaEntrega(p);
    return '<a class="tarjeta tu-edificio" href="#pie">' +
      '<span class="tu-edificio-obra" aria-hidden="true">' + img + '</span>' +
      '<span class="tu-edificio-texto"><span class="etiqueta">Tu edificio real</span><strong>' + ETAPAS_OBRA_CLARA[etapa] + '</strong>' +
        (p.entregaEstimada && mE > 0 ? '<small>Se termina en ' + fechaLlaves(0, p.entregaEstimada) + '</small>' : '') +
        // S34: si tu pie se completa después de que termine la obra, se dice (antes parecía que te lo entregaban antes de ser tuyo).
        (piePasaObra(p, mE) ? '<small>Firmas cuando juntes tu pie, aunque la obra termine antes.</small>' : '') + linea + '</span>' +
      '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>';
  }
  function piePasaObra(p, mE) {
    try { var pl = plazoTuPie(p, metaCompra(p)); return pl.meses !== null && pl.meses > (mE || 0); } catch (e) { return false; }
  }
  // S33-C2: las misiones en una sola tarjeta ordenada: lo que vence primero arriba y dos más.
  function misionesCompraHtml(ms, hoy) {
    var conFecha = misionesConFecha(ms, hoy);
    var idsF = conFecha.map(function (x) { return x.id; });
    var resto = ms.filter(function (x) { return !x.hecho && idsF.indexOf(x.id) === -1; });
    var pend = ms.filter(function (x) { return !x.hecho; }).length;
    if (!pend) return '';
    var filas = conFecha.slice(0, 1).map(function (x) {
      var f = new Date(x.fecha + 'T00:00:00'), d = diasEntre(hoy, x.fecha);
      return '<li><button type="button" class="mc-fila mc-vence" data-mision="' + x.id + '" aria-haspopup="dialog">' +
        '<span class="mc-dia" aria-hidden="true"><strong>' + f.getDate() + '</strong><small>' + MESES[f.getMonth()].slice(0, 3) + '</small></span>' +
        '<span class="mc-texto"><strong>' + x.titulo + '</strong><small>' + (d === 0 ? 'Vence hoy' : d === 1 ? 'Vence mañana' : 'Vence en ' + d + ' días') + '</small></span>' +
        '</button></li>';
    }).concat(resto.slice(0, conFecha.length ? 2 : 3).map(function (x) {
      return '<li><button type="button" class="mc-fila" data-mision="' + x.id + '" aria-haspopup="dialog">' +
        '<span class="mc-icono" aria-hidden="true">' + icono(ICONO_MISION_ID[x.id] || 'i-check') + '</span>' +
        '<span class="mc-texto"><strong>' + x.titulo + '</strong></span></button></li>';
    })).join('');
    return '<section class="tarjeta misiones-compra" aria-labelledby="titulo-mc">' +
      '<div class="mc-cab"><h2 class="h5" id="titulo-mc">Misiones</h2><a class="enlace" href="#compra/misiones">Ver todas ›</a></div>' +
      '<ul class="mc-lista">' + filas + '</ul></section>';
  }
  var ICONO_MISION_ID = { tasa: 'i-sube', fogaes: 'i-escudo', familiar: 'i-grupo', ds1: 'i-casa', rsh: 'i-documento', 'ahorro-auto': 'i-calendario', 'bajo-llave': 'i-candado', equipo: 'i-grupo', cuota: 'i-alcancia' };
  // 23-nov: los aceleradores en Tu compra, con departamento elegido: los que ya sumaste y los que puedes sumar.
  // Si un acelerador no sirve para este departamento (bloqueado), no aparece.
  function aceleradoresCompraHtml() {
    if (estado.modo !== 'vivir') return '';
    var p = proyectoCompra();
    if (!p) return '';
    var formas;
    try { formas = formasPagarMenos(p, compraSinGrupo(p)); } catch (e) { return ''; }
    var aplican = formas.filter(function (f) { return !f.bloqueo; });
    var elegidos = aplican.filter(function (f) { return f.auto || f.enPasos; });
    var elegibles = aplican.filter(function (f) { return !(f.auto || f.enPasos); });
    if (!elegidos.length && !elegibles.length) return '';
    var fila = function (f, clase, marca) {
      return '<li><button type="button" class="ac-fila ' + clase + '" data-aceleradores-abrir>' +
        '<span class="ac-sigla" aria-hidden="true">' + f.sigla + '</span>' +
        '<span class="ac-texto"><strong>' + f.nombre + '</strong><small>' + marca + '</small></span>' +
        icono('i-flecha', 'ac-flecha') + '</button></li>';
    };
    return '<section class="tarjeta aceleradores-compra" aria-labelledby="titulo-ac">' +
      '<div class="mc-cab"><h2 class="h5" id="titulo-ac">¿Cómo puedes llegar antes?</h2></div>' +
      (elegidos.length ? '<p class="ac-sub">Ya los sumaste</p><ul class="mc-lista">' + elegidos.map(function (f) { return fila(f, 'ac-elegido', f.auto ? 'Va incluido en tu camino' : 'En tus pasos'); }).join('') + '</ul>' : '') +
      (elegibles.length ? '<p class="ac-sub">Puedes sumar</p><ul class="mc-lista">' + elegibles.map(function (f) { return fila(f, 'ac-elegible', 'Sin sumar todavía'); }).join('') + '</ul>' : '') +
      '</section>';
  }
  // Lo que va bajo la fecha en Tu compra.
  function bloqueRecorrido(extra) {
    var s = fotoPasos(), h = hitoActual(s), hoy = hoyDemo();
    var listos = listosDe(h);
    var celebra = listosVistos !== null && listos > listosVistos;
    listosVistos = listos;
    celebraInicio = celebra;
    var ms = misiones(s, hoy);
    return barraCaminoAnterior() + caminoJuego(h, celebra) + tuEdificioHtml(s) + (extra || '') + misionesCompraHtml(ms, hoy) + aceleradoresCompraHtml();
  }
  // S32-B3: la fecha aproximada de cada paso, con los plazos que ya calcula la app (D13: nada del prototipo).
  function fechasRecorrido() {
    var s = fotoPasos(), hoy = hoyDemo();
    var mes = function (n) { return n === null || n === undefined || isNaN(n) ? 'Cuando te alcance' : n <= 0 ? 'Este mes' : 'aprox. ' + fechaLlaves(n, hoy); };
    var mas = function (m, k) { return m === null || m === undefined ? null : m + k; };
    var f = {};
    try {
      if (s.arriendo) {
        var a = arriendoActual().a;
        var compra = mas(a.mesesTuyo, -ARRIENDO_OPCION.mesesEscritura);
        f = { entrada: mes(a.mesesEntrada), contrato: mes(mas(a.mesesEntrada, 1)), pie: mes(compra), preaprobacion: mes(compra), 'es-tuyo': mes(a.mesesTuyo) };
      } else {
        var m = null, mm = mesesMeta();
        if (mm !== undefined) m = mm;
        else if (estado.modo === 'arrendar') { var xa = plazoArrendar(); m = xa.cabe ? xa.techo : null; }
        else if (!evaluarCabe().razon) {
          var mensual = estado.ahorroMensual || 300000;
          var c = estado.caminoElegido && CAMINOS[estado.caminoElegido];
          m = (c && !c.ficha && !c.tradicional ? plazoVivir(mensual) : plazoTradicional(mensual)).hasta.meses;
        }
        f = { pie: mes(m), preaprobacion: s.grupo ? 'Este mes' : mes(m), asegurar: mes(mas(m, 1)), aprobacion: mes(mas(m, 1)), 'es-tuyo': mes(mas(m, 3)) };
      }
    } catch (e) { f = {}; }
    f.camino = 'Hoy';
    f.depto = 'Este mes';
    return f;
  }
  function renderRecorrido() {
    var cont = $('pasos-contenido');
    var s = fotoPasos(), h = hitoActual(s), f = fechasRecorrido();
    var cid = idCaminoPasos();
    var sinCamino = !s.caminoElegido && !s.eligio;
    cont.innerHTML =
      '<a href="#compra" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Tu compra</a>' +
      '<header class="encabezado"><h1 id="titulo-pasos" class="h2" tabindex="-1">Tus pasos</h1>' +
        '<p class="texto-apoyo">' + (sinCamino ? 'Elige tu camino y aquí verás tus pasos con fechas.'
          : (cid && CAMINOS[cid] ? CAMINOS[cid].corto + SEP : '') + h.total + ' pasos' + SEP + 'fechas aproximadas') + '</p></header>' +
      '<ol class="recorrido-lista">' + h.hitos.map(function (x, i) {
        var fecha = x.estado === 'hecho' ? 'Listo' : (f[x.id] || '');
        return '<li class="' + x.estado + '"' + (x.estado === 'actual' ? ' aria-current="step"' : '') + '>' +
          '<button type="button" class="recorrido-fila" data-hito="' + x.id + '" aria-haspopup="dialog">' +
            '<span class="recorrido-punto" aria-hidden="true">' + (x.estado === 'hecho' ? '✓' : i + 1) + '</span>' +
            '<span class="recorrido-texto"><strong>' + x.nombre + '</strong><span class="recorrido-fecha">' + fecha + '</span>' +
              // S32-B8 (dieta de texto): la explicación solo en el paso de ahora; el resto, en su hoja.
              (x.estado === 'actual' ? '<small>' + textoHito(x.id, s.grupo) + '</small>' : '') + '</span></button></li>';
      }).join('') + '</ol>' +
      (sinCamino ? (estado.modo === 'vivir' ? '<a class="btn btn-primario btn-bloque" href="#departamentos">Elegir en Departamentos</a>' : '<a class="btn btn-primario btn-bloque" href="#compra/caminos">Comparar caminos</a>') : '') +
      '<p class="texto-apoyo recorrido-nota"><small>Del sí del banco a las llaves: unos ' + TOTAL_SI_A_LLAVES + '. Las fechas cambian con lo que juntas al mes.</small></p>' +
      '<a class="dueno-link" href="#compra/dueno">Ver todo lo que pagarías como dueño ›</a>';
    cont.querySelectorAll('[data-hito]').forEach(function (b) {
      b.addEventListener('click', function () { abrirHito(b.dataset.hito, b); });
    });
  }
  function iniciarSiguientePaso() {
    iniciarAnimos();
    var ip = $('inicio-principal');
    if (ip) {
      ip.querySelectorAll('[data-cj-hito]').forEach(function (b) { b.addEventListener('click', function () { abrirHito(b.dataset.cjHito, b); }); });
      ip.querySelectorAll('[data-aceleradores-abrir]').forEach(function (b) {
        b.addEventListener('click', function () { var pc = proyectoCompra(); if (pc) abrirBajarPrecio(pc, compraSinGrupo(pc), null, b); });
      });
      ip.querySelectorAll('.misiones-compra [data-mision], .con-fecha [data-mision]').forEach(function (b) { b.addEventListener('click', function () { abrirMision(b.dataset.mision, b); }); });
      // S33-C2: el azul de la fecha lleva a Tu pie (con un enlace visible y el bloque entero tocable).
      ip.querySelectorAll('.mi-compra-fecha').forEach(function (sec) {
        if (!sec.querySelector('.noche-pie')) {
          var a = document.createElement('a'); a.className = 'noche-pie'; a.href = '#pie'; a.setAttribute('aria-label', 'Ver tu pie');
          a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'; sec.appendChild(a);
        }
        sec.classList.add('clicable');
        sec.addEventListener('click', function (ev) { if (!ev.target.closest('a, button')) location.hash = '#pie'; });
      });
    }
    iniciarCaminoAnterior(ip);
    if (celebraInicio) { celebraInicio = false; confeti(); }
    var b = $('btn-siguiente');
    if (b) b.addEventListener('click', function () {
      if (pasoInicio.tipo === 'mision') abrirMision(pasoInicio.id, b); else abrirHito(pasoInicio.id, b);
    });
    // S34-1: «Ver tu siguiente paso» (desde Tu pie) llega aquí y abre la hoja del paso de ahora.
    if (abrirPasoAlLlegar) {
      abrirPasoAlLlegar = false;
      var hAhora = hitoActual(fotoPasos());
      if (hAhora && hAhora.id) setTimeout(function () { abrirHito(hAhora.id, b); }, 60);
    }
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
    var solo = p.tipo === 'conjunto' && !!caminoT && !caminoT.grupo;
    var d = departamentosDe(p.id)[0];
    var completo = r.ahorroCompleto > r.ahorro ? formatoRedondeado(r.ahorroCompleto) + ' si llegan a 5' : '';
    var conIva = p.tipo === 'venta' && estado.modo === 'vivir' && piezasValidas(piezasOn()).iva;
    var grupoTxt = p.tipo === 'conjunto' ? '<span class="tp-grupo">' + icono('i-grupo') + '<strong>' + r.cuposTomados + ' de ' + p.cupos + '</strong> personas en el grupo</span>' : '';
    var etiqueta, cifra, lineas = [];
    if (solo) {
      etiqueta = 'Precio del departamento';
      cifra = formatoRedondeado(ufAPesos(estado.modo === 'vivir' ? plazoDepartamento(p, null, true).precioUF : d.listaUF));
      lineas.push('En obra' + SEP + (p.entregaEstimada ? 'entrega ' + formatoFecha(p.entregaEstimada) : 'en construcción'));
    } else if (p.tipo !== 'conjunto') {
      etiqueta = 'Precio' + (conIva ? ' sin IVA' : ' del departamento');
      cifra = formatoRedondeado(p.tipo === 'venta' && estado.modo === 'vivir' ? ufAPesos(plazoDepartamento(p).precioUF) : r.escenario.precio);
      if (p.tipo === 'financiamiento') lineas.push(lineaPersonasPie(p));
      lineas.push((p.tipo === 'financiamiento' ? porcentajeEntero(r.avanceFinanciamiento) + NBSP + '% del pie reunido' + SEP : '') +
        (p.cierre ? 'Cierra el ' + formatoFecha(p.cierre) : 'Terminado' + SEP + 'lo recibes al firmar'));
    } else {
      // 11-nov: el precio total con el descuento del grupo, y cuánto te descuentan al unirte.
      var conDesc = estado.modo === 'vivir' ? ufAPesos(plazoDepartamento(p).precioUF) : r.escenario.precio;
      var lista = conDesc + r.ahorro;
      var pctDe = function (x) { return lista ? Math.round(x / lista * 100) + NBSP + '%' : ''; };
      etiqueta = r.ahorro > 0 ? 'Precio con descuento del grupo' : 'Precio del departamento';
      cifra = formatoRedondeado(conDesc);
      if (r.ahorro > 0) lineas.push('Precio normal <s>' + formatoRedondeado(lista) + '</s>');
      lineas.push(r.ahorro > 0
        ? '<span class="tp-descuento">Descuento al unirte: ' + formatoRedondeado(r.ahorro) + ' (' + pctDe(r.ahorro) + ')</span>'
        : '<span class="tp-descuento">Si el grupo llega a 5 personas: ' + formatoRedondeado(r.ahorroCompleto) + ' de descuento (' + pctDe(r.ahorroCompleto) + ')</span>');
      // 11-nov: cuántas personas hay en el grupo, en su propia línea y con ícono.
      lineas.push(grupoTxt);
      if (compacta) lineas.push('Cierra el ' + fechaCorta(p.cierre));
      else { if (r.ahorro > 0 && completo) lineas.push(completo); lineas.push('Cierra el ' + formatoFecha(p.cierre)); }
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
        ? '<p class="texto-apoyo aviso-justo">' + icono('i-alerta') + 'Te quedaría poco para tus gastos del mes</p>' : '') +
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
      // 9-nov: el Crédito al 80 % (sin grupo ni inversionistas) no muestra los de pie compartido.
      if (arrendar && !c.grupo && !c.inversionistas) lista = lista.filter(function (p) { return p.tipo !== 'financiamiento'; });
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
      location.replace(estado.preguntasListas ? '#compra/caminos' : '#compra');
      return;
    }
    var rango = rangoActual();
    var arrendar = estado.modo === 'arrendar';
    var visibles = proyectosVisibles(ctx);
    var soloCamino = camino || !estado.verTodos;
    var n = filtrosActivos();
    $('lista-contenido').innerHTML =
      // S25: como el canvas: volver a Explorar, el título y cuántos hay.
      '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>' +
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
        ? '<ul class="lista-proyectos" id="lista-proyectos">' + visibles.map(function (p) { return tarjetaProyecto(p, camino ? '#compra/proyecto/' : '#departamentos/'); }).join('') + '</ul>'
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

  // Hoja genérica. S33-C5 (E5): se abre como pantalla aparte, con «‹ Volver» y su título.
  // Solo las confirmaciones cortas ({ confirmacion: true }) siguen subiendo desde abajo.
  function abrirHojaContenido(titulo, html, boton, alAbrir, opciones) {
    var pantalla = !(opciones && (opciones.confirmacion || opciones.hoja));
    cerrarHoja(false);
    botonHoja = boton || null;
    var fondo = document.createElement('div');
    fondo.id = 'hoja-fondo'; fondo.className = 'hoja-fondo';
    var hoja = document.createElement('div');
    hoja.id = 'hoja-inferior'; hoja.className = 'hoja-inferior';
    hoja.setAttribute('role', 'dialog'); hoja.setAttribute('aria-modal', 'true'); hoja.setAttribute('aria-labelledby', 'hoja-titulo');
    if (pantalla) hoja.className += ' hoja-pantalla';
    hoja.innerHTML = pantalla
      ? '<div class="pantalla-cab"><button type="button" class="enlace volver" id="btn-cerrar-hoja"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Volver</button></div>' +
        '<h2 class="h3" id="hoja-titulo" tabindex="-1">' + titulo + '</h2>' + html
      : '<span class="hoja-asa" aria-hidden="true"></span>' +
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
    // 20-nov: el foco no mueve la pantalla (antes el título quedaba bajo la barra «Volver»).
    if (pantalla) { $('hoja-titulo').focus({ preventScroll: true }); hoja.scrollTop = 0; return; }
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
      campoDinero('datos-pareja', estado.conQuien === 'familia' ? 'Sueldo de tu familiar codeudor' : estado.conQuien === 'pareja' ? 'Sueldo líquido de tu pareja' : 'Sueldo de quien complementa renta', estado.sueldoPareja) +
      // S31-D: complementar renta, con la regla de Bci (UF 39 entre los dos y UF 16 quien complementa).
      '<p class="campo-ayuda">Opcional. Bci pide UF 39 entre los dos y UF 16 a quien complementa.</p>' +
      campoDinero('datos-otras', 'Deudas que pagas al mes (tarjetas, créditos)', estado.otrasCuotas) +
      campoDinero('datos-ahorro', 'Lo que tienes ahorrado', estado.ahorroActual) +
      campoDinero('datos-mensual', 'Lo que puedes juntar al mes', estado.ahorroMensual) +
      campoDinero('datos-arriendo', 'Lo que pagas hoy de arriendo', estado.arriendoActual) +
      // S31-A: lo que el banco revisa además del sueldo. S31-D: el Registro Social afina el DS1.
      '<h3 class="h4 datos-subtitulo">Para el banco</h3>' +
      '<fieldset class="selector"><legend>Tu contrato</legend><div class="selector-opciones selector-tres">' +
        Object.keys(CONTRATOS).map(function (k) {
          return '<input type="radio" name="datos-contrato" id="datos-contrato-' + k + '" value="' + k + '"' + (estado.contrato === k ? ' checked' : '') + '><label for="datos-contrato-' + k + '">' + CONTRATOS[k] + '</label>';
        }).join('') + '</div></fieldset>' +
      '<div class="campo"><label for="datos-meses">Meses en tu trabajo actual</label>' +
        '<div class="campo-caja"><input id="datos-meses" type="text" inputmode="numeric" autocomplete="off" maxlength="3" placeholder="Ej.: 14" value="' + (estado.mesesTrabajo !== null ? estado.mesesTrabajo : '') + '"></div></div>' +
      '<fieldset class="selector"><legend>¿Tienes deudas atrasadas?</legend><div class="selector-opciones">' +
        '<input type="radio" name="datos-deudas" id="datos-deudas-no" value="no"' + (estado.deudasAtrasadas === false ? ' checked' : '') + '><label for="datos-deudas-no">No</label>' +
        '<input type="radio" name="datos-deudas" id="datos-deudas-si" value="si"' + (estado.deudasAtrasadas === true ? ' checked' : '') + '><label for="datos-deudas-si">Sí</label></div></fieldset>' +
      '<div class="campo"><label for="datos-rsh">Tu tramo del Registro Social de Hogares</label>' +
        '<span class="regalo-select"><select id="datos-rsh" class="campo-select">' +
          [['', 'No sé o no estoy inscrita'], ['40', 'Hasta 40 %'], ['60', '50 o 60 %'], ['80', '70 u 80 %'], ['90', '90 %'], ['100', 'Más de 90 %']].map(function (o) {
            return '<option value="' + o[0] + '"' + (String(estado.rshTramo || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
          }).join('') + '</select><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>' +
        '<p class="campo-ayuda">Afina tu subsidio. Lo ves en ChileAtiende con tu ClaveÚnica.</p></div>' +
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
        var ct = document.querySelector('input[name="datos-contrato"]:checked');
        if (ct) estado.contrato = ct.value;
        var mt = parseInt(String($('datos-meses').value).replace(/\D/g, ''), 10);
        estado.mesesTrabajo = isNaN(mt) ? null : Math.min(600, mt);
        var dd = document.querySelector('input[name="datos-deudas"]:checked');
        estado.deudasAtrasadas = dd ? dd.value === 'si' : null;
        estado.rshTramo = Number($('datos-rsh').value) || null;
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
        '<span class="opcion-texto"><strong>' + pesosRango(rg) + '</strong><small>' + textoRango(rg) + SEP + (n === 0 ? 'Sin departamentos hoy' : plural(n, 'departamento', 'departamentos')) + '</small></span></button></li>';
    }).join('') + '</ul>';
    abrirHojaContenido('Tu rango de precio', html, boton, function (hoja) {
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
          return '<li><span class="respaldo-num ' + x[2] + '" aria-hidden="true">' + (i + 1) + '</span><span><strong>' + x[0] + '</strong>' + (x[1] ? '<small>' + x[1] + '</small>' : '') + '</span></li>';
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
    camino: ['#compra/caminos', 'Comparar caminos'], departamentos: ['#departamentos', 'Departamentos'], inversiones: ['#inversiones', 'Inversiones']
  };
  function caminoParaProyecto(p) {
    var c = estado.caminoElegido && CAMINOS[estado.caminoElegido];
    var solo = c && c.familiar ? estado.caminoElegido : 'individual-vivir';
    if (p.tipo === 'venta') return solo;
    if (p.tipo === 'conjunto') {
      if (compraSinGrupo(p)) return solo;
      if (c && c.grupo) return estado.caminoElegido;
      return estado.modo === 'vivir' ? 'grupo-vivir' : 'grupo-invertir';
    }
    if (c && !c.grupo && !c.ficha) return estado.caminoElegido;
    return 'pie-compartido';
  }
  // 10-nov: agendar visita antes de elegir. La visita se pide con la mitad del pie, para no hacer perder tiempo a la corredora.
  var DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES_NOMBRE = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function textoVisita(v) {
    var f = v.fecha.split('-').map(Number), d = new Date(Date.UTC(f[0], f[1] - 1, f[2]));
    return DIAS_SEMANA[d.getUTCDay()] + ' ' + f[2] + ' de ' + MESES_NOMBRE[f[1] - 1] + ', ' + v.hora;
  }
  // Tres horarios de ejemplo desde hoy (la fecha real, no la de la demo: una visita es una cita de verdad):
  // el próximo martes en la tarde y los dos sábados siguientes en la mañana.
  function horariosVisita() {
    var h = new Date(), base = Date.UTC(h.getFullYear(), h.getMonth(), h.getDate()), dia = new Date(base).getUTCDay();
    var en = function (n) { return new Date(base + n * 864e5).toISOString().slice(0, 10); };
    var martes = ((2 - dia + 7) % 7) || 7, sabado = ((6 - dia + 7) % 7) || 7;
    return [{ fecha: en(martes), hora: '18:30' }, { fecha: en(sabado), hora: '11:00' }, { fecha: en(sabado + 7), hora: '11:00' }]
      .sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  }
  // Comentario 10-nov: la barra fija lleva solo el botón; lo que explica (cuánto falta, la fecha) va en la página.
  function accionVisita(p, solo) {
    var v = estado.visitas[p.id];
    if (v && v.fue) return '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-comprar">Elegir este departamento</button>';
    if (v) return '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-ya-visite">Ya lo visité</button>';
    var meta = metaCompra(p), tengo = ahorradoTuPie(meta), umbral = Math.ceil(meta / 2);
    // S28-B6: en grupo el pie se paga en cuotas durante la obra; no se espera tenerlo antes.
    if (enGrupoDe(p) && !solo) return '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-comprar">Unirme al grupo</button>';
    if (tengo < umbral) return '<a href="#pie" class="btn btn-secundario-dark btn-lg btn-bloque">Juntar mi pie</a>';
    return '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-agendar" aria-haspopup="dialog">Agendar visita</button>';
  }
  function infoVisita(p) {
    var v = estado.visitas[p.id];
    if (v && v.fue) return '<p class="sello visita-info">' + icono('i-ok') + 'Ya lo visitaste</p>';
    if (v) return '<p class="aviso visita-info">Tu visita: ' + textoVisita(v) + '</p>' +
      '<button type="button" class="btn btn-terciario btn-sm" id="btn-agendar" aria-haspopup="dialog">Cambiar la visita</button>';
    var meta = metaCompra(p), tengo = ahorradoTuPie(meta), umbral = Math.ceil(meta / 2);
    if (tengo >= umbral) return '';
    var falta = umbral - tengo, m = mesesParaMeta(falta, estado.ahorroMensual);
    return '<p class="aviso visita-info">Visitas con la mitad de tu pie: te faltan ' + formatoRedondeado(falta) + (m ? ', unos ' + textoMeses(m) : '') + '.</p>';
  }
  function abrirAgenda(p, boton, alListo) {
    var hs = horariosVisita();
    abrirHojaContenido('Agendar visita',
      '<p class="texto-apoyo">' + esc(p.nombre) + '. Te acompaña la corredora de la inmobiliaria.</p>' +
      '<div class="horarios-visita">' + hs.map(function (h, i) {
        return '<button type="button" class="btn btn-secundario-dark btn-bloque" data-horario="' + i + '">' + textoVisita(h) + '</button>';
      }).join('') + '</div><p class="texto-apoyo">Horarios de ejemplo · simulado</p>', boton, function (hoja) {
        hoja.querySelectorAll('[data-horario]').forEach(function (b) {
          b.addEventListener('click', function () {
            var h = hs[Number(b.dataset.horario)];
            estado.visitas = Object.assign({}, estado.visitas);
            estado.visitas[p.id] = { fecha: h.fecha, hora: h.hora, fue: false };
            guardarEstado();
            cerrarHoja(false);
            toast('Visita agendada: ' + textoVisita(h));
            alListo();
          });
        });
      });
  }

  // 11-nov (test): si ya te preaprobaron en Tus pasos, al elegir departamento no se repite: se salta a revisar que alcance.
  function irAPostular() {
    if (estado.pasos.preaprobado) { guardarSubpaso('resultado'); location.hash = '#compra/postular/resultado'; }
    else location.hash = '#compra/postular/datos';
  }
  // 20-nov (Bárbara): en Ganancia, en cuántos años terminas de pagar el crédito y cómo adelantarlo:
  // pagando más al mes (prepago) o si baja la tasa (refinanciar).
  var PAGO_EXTRA_MAX = 400000, PAGO_EXTRA_PASO = 25000, BAJA_TASA = 0.01;
  function mesesParaPagar(creditoUF, tasa, cuotaUF) {
    var i = tasa / 12;
    if (cuotaUF <= creditoUF * i) return null;
    return Math.ceil(-Math.log(1 - i * creditoUF / cuotaUF) / Math.log(1 + i));
  }
  function textoAnios(m) {
    if (m === null) return '—';
    var a = Math.floor(m / 12), r = m % 12;
    return r === 0 ? plural(a, 'año', 'años') : a === 0 ? plural(r, 'mes', 'meses') : plural(a, 'año', 'años') + ' y ' + plural(r, 'mes', 'meses');
  }
  function planPago(creditoUF, tasa, extra) {
    var cuota = cuotaFija(creditoUF, tasa, SUPUESTOS.mesesBci);
    var m = mesesParaPagar(creditoUF, tasa, cuota + extra / SUPUESTOS.uf);
    return { meses: m, intereses: m === null ? null : ufAPesos(m * (cuota + extra / SUPUESTOS.uf) - creditoUF) };
  }
  function pagoAntesHtml(e, mFirma) {
    var creditoUF = e.precioUF * e.pctCredito, tasa = SUPUESTOS.tasaBci;
    var base = planPago(creditoUF, tasa, 0);
    var fin = function (m) { return mFirma === null ? '' : ' (aprox. ' + fechaLlaves(mFirma + m, hoyDemo()).split(' de ').pop() + ')'; };
    var tasaBaja = tasa - BAJA_TASA;
    var cuotaHoy = cuotaFija(creditoUF, tasa, SUPUESTOS.mesesBci), cuotaBaja = cuotaFija(creditoUF, tasaBaja, SUPUESTOS.mesesBci);
    var mismoDiv = mesesParaPagar(creditoUF, tasaBaja, cuotaHoy);
    var pct = function (t) { return (t * 100).toFixed(2).replace('.', ',') + NBSP + '%'; };
    return '<section class="pa" aria-labelledby="pa-titulo" data-credito="' + creditoUF.toFixed(4) + '" data-firma="' + (mFirma === null ? '' : mFirma) + '">' +
      '<h2 class="h5" id="pa-titulo">¿En cuántos años lo pagas?</h2>' +
      '<div class="pa-plazo"><span class="pa-icono" aria-hidden="true">' + icono('i-calendario') + '</span><span><small>Con el dividendo de siempre, terminas de pagar en</small>' +
        '<strong>' + textoAnios(base.meses) + fin(base.meses) + '</strong></span></div>' +
      '<div class="pa-bloque pa-juntas"><h3 class="h6">Si pagas más al mes</h3>' +
        '<p class="si-juntas-fila"><label for="pa-extra">Pagas de más</label><strong class="numero" id="pa-extra-valor">$0</strong></p>' +
        '<input type="range" id="pa-extra" min="0" max="' + PAGO_EXTRA_MAX + '" step="' + PAGO_EXTRA_PASO + '" value="0" aria-valuetext="$0 al mes: terminas en ' + textoAnios(base.meses) + '">' +
        '<div class="pa-resultado" id="pa-resultado" aria-live="polite">' + resultadoPago(creditoUF, tasa, 0, base, mFirma) + '</div>' +
        '<p class="pa-nota">' + icono('i-info') + '<span>También puedes abonar una vez (un bono, un aguinaldo). Por ley, Bci puede cobrar por prepagar hasta 1,5 meses de intereses.</span></p></div>' +
      '<div class="pa-bloque"><h3 class="h6">Si baja la tasa</h3>' +
        '<p class="pa-tasa"><span>Hoy</span><b>' + pct(tasa) + '</b><span aria-hidden="true">→</span><span>Si baja 1 punto</span><b>' + pct(tasaBaja) + '</b></p>' +
        '<ul class="pa-opciones">' +
          '<li><small>Pagas menos al mes</small><strong>−' + formatoRedondeado(ufAPesos(cuotaHoy - cuotaBaja)) + '</strong><small>mismo plazo</small></li>' +
          '<li><small>O, con el mismo dividendo, terminas en</small><strong>' + textoAnios(mismoDiv) + '</strong><small>' + textoAnios(base.meses - mismoDiv) + ' antes</small></li>' +
        '</ul>' +
        '<p class="pa-nota">' + icono('i-info') + '<span>Para eso cambias tu crédito a la tasa nueva (refinanciar). Tiene gastos de tasación y notaría: conviene si la baja es grande.</span></p></div>' +
    '</section>';
  }
  function resultadoPago(creditoUF, tasa, extra, base, mFirma) {
    if (!extra) return '<p>Sube el monto para ver cuánto antes terminas.</p>';
    var x = planPago(creditoUF, tasa, extra);
    var antes = base.meses - x.meses, ahorro = base.intereses - x.intereses;
    return '<p>Terminas en <strong>' + textoAnios(x.meses) + '</strong>' + (mFirma === null || mFirma === '' ? '' : ' (aprox. ' + fechaLlaves(Number(mFirma) + x.meses, hoyDemo()).split(' de ').pop() + ')') + ': <strong>' + textoAnios(antes) + ' antes</strong>.</p>' +
      '<p>Ahorras unos <strong>' + formatoRedondeado(ahorro) + '</strong> en intereses.</p>';
  }
  function iniciarPagoAntes() {
    var sec = document.querySelector('.pa'), rango = $('pa-extra');
    if (!sec || !rango) return;
    var creditoUF = Number(sec.dataset.credito), mFirma = sec.dataset.firma === '' ? null : Number(sec.dataset.firma);
    var tasa = SUPUESTOS.tasaBci, base = planPago(creditoUF, tasa, 0);
    var pintar = function () {
      var v = Number(rango.value);
      rango.style.setProperty('--lleno', (v / PAGO_EXTRA_MAX * 100).toFixed(1) + '%');
      $('pa-extra-valor').textContent = v ? formatoRedondeado(v) : '$0';
      $('pa-resultado').innerHTML = resultadoPago(creditoUF, tasa, v, base, mFirma);
      rango.setAttribute('aria-valuetext', formatoRedondeado(v) + ' al mes: terminas en ' + textoAnios(v ? planPago(creditoUF, tasa, v).meses : base.meses));
    };
    rango.addEventListener('input', pintar);
    pintar();
  }
  function grupoInvertirHtml(p, ahorroGrupo) {
    return '<a class="tarjeta fila grupo-posible" href="#compra/proyecto/' + esc(p.id) + '/grupo-invertir">' + icono('i-grupo', 'icono-grande') +
      '<span><strong>Si te unes a su grupo</strong><small>Podrías pagar ' + formatoRedondeado(ahorroGrupo) + ' menos</small></span>' +
      '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>';
  }
  // 20-nov (Bárbara): el detalle para arrendar, como el de vivir: arriba el precio y cuándo firmas; abajo, pestañas
  // (Números, Ganancia, Grupo, Barrio y Visita). «Ganancia»: lo que entra con el arriendo, lo que sale y lo que te queda.
  function detalleArrendarHtml(p, r, e, o) {
    var perfil = perfilActual();
    var falta = Math.max(0, e.alEscriturar - (perfil.ahorroActual || 0));
    var mPie = falta === 0 ? 0 : mesesParaMeta(falta, perfil.ahorroMensual);
    var mFirma = mPie === null || !isFinite(mPie) ? null : Math.max(mPie + MESES_SI_A_LLAVES, mesesParaEntrega(p));
    var bruto = r.arriendoBruto, neto = Math.round(arriendoNeto(bruto)), gastos = bruto - neto;
    var dividendo = e.dividendo, queda = neto - dividendo;
    var conInv = e.participacionUF > 0;
    var rec = conInv ? plazoRecompra(e.participacionUF, r.netoMensualUF, 1) : null;
    var peor = Math.round(arriendoNeto(bruto * PEOR_CASO_ARRIENDO)) - dividendo;
    var plata = function (v) { return (v < 0 ? '−' : '+') + formatoRedondeado(Math.abs(v)); };
    var escala = Math.max(bruto, gastos + dividendo);
    var ancho = function (v) { return Math.max(2, Math.round(v / escala * 100)) + '%'; };
    var anios = function (m) { return m === null ? '—' : m < 12 ? plural(m, 'mes', 'meses') : (Math.round(m / 6) / 2).toString().replace('.', ',') + ' años'; };
    var precioNum = o.enGrupo ? e.precio : (o.solo ? ufAPesos(o.listaUF) : e.precio);
    var ganancia =
      '<section class="ga" aria-labelledby="ga-titulo"><h2 class="h5" id="ga-titulo">Lo que ganas al arrendarlo</h2>' +
        '<p class="ga-sub">Cada mes, con el arriendo estimado por IA</p>' +
        '<div class="ga-barras" aria-hidden="true">' +
          '<div class="ga-fila"><small>Entra</small><div class="ga-pista"><span class="ga-arriendo" style="width:' + ancho(bruto) + '"></span></div></div>' +
          '<div class="ga-fila"><small>Sale</small><div class="ga-pista"><span class="ga-gastos" style="width:' + ancho(gastos) + '"></span><span class="ga-dividendo" style="width:' + ancho(dividendo) + '"></span></div></div>' +
        '</div>' +
        '<ul class="ga-lista">' +
          '<li><span class="ga-punto arriendo" aria-hidden="true"></span><span>Arriendo</span><strong>' + formatoRedondeado(bruto) + '</strong></li>' +
          '<li><span class="ga-punto gastos" aria-hidden="true"></span><span>Administración y un mes vacío al año</span><strong>−' + formatoRedondeado(gastos) + '</strong></li>' +
          '<li><span class="ga-punto dividendo" aria-hidden="true"></span><span>Dividendo</span><strong>−' + formatoRedondeado(dividendo) + '</strong></li>' +
        '</ul>' +
        (conInv
          ? '<div class="ga-total negativo"><span>Mientras compras la parte de los inversionistas (' + (rec && !rec.noAlcanza ? 'unos ' + anios(rec.meses) : 'más de 7 años') + '), pones al mes<small>El arriendo va a esa compra; el dividendo lo pagas tú</small></span><strong>' + formatoRedondeado(dividendo) + '</strong></div>' +
            '<div class="ga-total ' + (queda >= 0 ? 'positivo' : 'negativo') + '"><span>Después, ' + (queda >= 0 ? 'te queda al mes' : 'pones al mes') + '</span><strong>' + formatoRedondeado(Math.abs(queda)) + '</strong></div>'
          : '<div class="ga-total ' + (queda >= 0 ? 'positivo' : 'negativo') + '"><span>' + (queda >= 0 ? 'Te queda al mes' : 'Pones de tu bolsillo al mes') + '</span><strong>' + formatoRedondeado(Math.abs(queda)) + '</strong></div>') +
      '</section>' +
      '<div class="det-cifras ga-cifras"><div><small>Rentabilidad neta</small><strong>' + formatoPorcentaje(r.rentabilidad, 1) + '</strong><small>al año, sobre el precio</small></div>' +
        '<div><small>Arriendo neto al año</small><strong>' + formatoRedondeado(neto * 12) + '</strong><small>después de gastos</small></div></div>' +
      '<section class="ga-riesgos" aria-labelledby="ga-riesgos-t"><h3 class="h6" id="ga-riesgos-t">Si las cosas salen peor</h3>' +
        '<p>' + icono('i-flujo') + '<span>Si el arriendo es 10' + NBSP + '% más bajo: ' + (peor >= 0 ? 'te quedan ' : 'pones ') + '<strong>' + formatoRedondeado(Math.abs(peor)) + '</strong> al mes.</span></p>' +
        '<p>' + icono('i-alerta') + '<span>Un mes sin arrendatario: el dividendo de ' + formatoRedondeado(dividendo) + ' lo pagas tú.</span></p>' +
      '</section>' +
      pagoAntesHtml(e, mFirma) +
      '<p class="llega-sello detalle-sello">' + icono('i-escudo') + 'Sin contar que el departamento suba de precio</p>';
    // 20-nov (Bárbara): con la garantía de un familiar, Números parte explicando cómo funciona; sin «Ver detalle del crédito».
    var familiar = e.pctCredito >= 0.95;
    var numeros =
      (familiar ? garantiaFamiliarDetalle({ precioUF: e.precioUF, pie: e.pie, subsidioUF: 0, creditoUF: e.precioUF * e.pctCredito }) : '') +
      '<div class="det-cifras"><div><small>Juntas antes de firmar</small><strong>' + formatoRedondeado(e.alEscriturar) + '</strong><small>' + (familiar ? 'pie del 5' + NBSP + '% y gastos' : 'pie y gastos') + '</small></div>' +
        '<div><small>Dividendo al mes</small><strong>' + formatoRedondeado(dividendo) + '</strong><small>' + (familiar ? 'crédito del 95' + NBSP + '%' : 'con seguros' + SEP + ufDecimales(dividendo / SUPUESTOS.uf, 2)) + '</small></div></div>' +
      '<p class="det-subsidio">' + icono('i-info') + '<span>Si se acaba el subsidio a la tasa, el dividendo sube a <strong>' + formatoRedondeado(e.dividendoSinSubsidio) + '</strong>.</span></p>' +
      o.extraNumeros +
      (familiar ? '' : plegable('detalle-credito', 'Ver detalle del crédito', '', repartoCasa(partesEscenario(e)) +
        '<ul class="datos-inversion"><li><span>Gastos al firmar</span><strong>' + formatoRedondeado(e.gastos) + '</strong></li></ul>'));
    return '<section class="det-precio" aria-labelledby="det-llaves">' +
        (familiar ? '<span class="det-camino-chip">' + icono('i-grupo') + 'Con la garantía de un familiar</span>' : '') +
        '<p class="det-etq">Precio' + (o.enGrupo ? ' con descuento del grupo' : '') + '</p>' +
        '<div class="det-precio-fila"><strong class="det-precio-num">' + formatoRedondeado(precioNum) + '</strong>' +
          (o.enGrupo && r.ahorro > 0 ? '<span class="det-ahorras">Ahorras ' + formatoRedondeado(r.ahorro) + '</span>' : '') + '</div>' +
        '<p class="det-tuyo" id="det-llaves">' + icono('i-calendario') + '<span>' + (mFirma === null ? 'Todavía no te alcanza' : 'Firmas <strong>aprox. ' + fechaLlaves(mFirma, hoyDemo()) + '</strong>') + '</span></p>' +
        '<p class="det-freno">Lo arriendas en unos ' + formatoRedondeado(bruto) + ' al mes' + (conInv ? '' : SEP + (queda >= 0 ? 'te quedan ' + formatoRedondeado(queda) : 'pones ' + formatoRedondeado(-queda))) + '</p>' +
        (o.enGrupo ? cierreGrupoHtml(p, 'en-azul') : '') +
      '</section>' +
      pestanasDetalle(p, [
        ['numeros', 'Números', numeros],
        ['ganancia', 'Ganancia', ganancia],
        o.grupo ? ['grupo', 'Grupo', o.grupo] : null,
        BARRIOS[p.comuna] ? ['barrio', 'Barrio', barrioSolo(p)] : null,
        ['visita', 'Visita', visitaHtml(p)]
      ]);
  }
  // 20-nov (Bárbara): «Formas de pagar menos» en el detalle de un departamento: la garantía del Estado (FOGAES)
  // y el subsidio DS1, con cuánto cambian lo que juntas y lo que pagas al mes, tus requisitos y un botón
  // para sumarlos a tus pasos como misión.
  function formasPagarMenos(p, solo) {
    var pd = plazoDepartamento(p, null, solo);
    var perfil = perfilPiezas(), depto = deptoDeProyecto(p), hoy = hoyDemo();
    var precio = pd.precioUF, ps = estado.pasos;
    var formas = [];
    // Garantía del Estado: Bci presta 90 % en vez del 80 % del crédito tradicional.
    if (!pd.on.respaldo) {
      var meta80 = ufAPesos(precio * (1 - SUPUESTOS_PIEZAS.creditoSiempre) + gastosUF(precio) - pd.subsidioUF);
      var div80 = ufAPesos(cuotaFija(precio * SUPUESTOS_PIEZAS.creditoSiempre - pd.subsidioUF, SUPUESTOS.tasaBci, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
      formas.push({ id: 'fogaes', sigla: 'FOGAES', nombre: 'Garantía del Estado', que: 'El Estado respalda tu crédito: Bci te presta hasta el 90' + NBSP + '% y juntas un pie del 10' + NBSP + '% (en vez del 20' + NBSP + '%).',
        juntas: pd.meta - meta80, pagas: pd.dividendo - div80, incluido: true,
        req: [['Departamento nuevo, en primera venta', true], ['De hasta UF 6.000', precio <= 6000], ['Primera vez que la usas', null]],
        enPasos: !!ps.fogaesAgregado, lista: !!ps.fogaesCalifica });
    }
    // Subsidio DS1: dinero del Estado para tu pie.
    var conDS1 = pd.on.subsidio, bloq = conDS1 ? null : bloqueoPieza('subsidio', pd.on, depto, perfil);
    var otro = calcularPiezas(perfil, Object.assign({}, pd.on, { subsidio: !conDS1 }), depto, hoy);
    var con = conDS1 ? pd : otro, sin = conDS1 ? otro : pd;
    var ds1 = ds1Para(precio, perfil);
    formas.push({ id: 'ds1', sigla: 'DS1', nombre: 'Subsidio DS1', que: 'El Estado pone dinero en tu pie' + (ds1.montoUF ? ': unas ' + formatoUF(Math.round(ds1.montoUF)) + ' para este departamento' : '') + '. Se postula en el Minvu.',
      juntas: bloq ? null : con.meta - sin.meta, pagas: bloq ? null : con.dividendo - sin.dividendo, incluido: conDS1, bloqueo: bloq,
      espera: !bloq && ds1.mesesCuenta ? 'Tu cuenta de vivienda debe tener ' + ds1.mesesCuenta + ' meses' : '',
      req: [['Departamento de hasta UF 4.000', precio <= 4000], ['Tu sueldo bajo el tope del tramo', !(bloq && /sueldo/i.test(bloq.razon))],
        ['Registro Social de Hogares', ps.rsh ? true : null], ['No tener otra vivienda', null]],
      enPasos: !!(conDS1 || ps.ds1Agregado || ps.ds1Postulado), lista: !!ps.ds1Postulado });
    // 20-nov (Bárbara): el subsidio a la tasa no se da por sentado: depende de los cupos cuando Bci apruebe tu crédito.
    formas.push({ id: 'tasa', sigla: '%', nombre: 'Subsidio a la tasa', que: 'Baja la tasa de tu crédito en un departamento nuevo. No es seguro: depende de los cupos que queden cuando Bci apruebe tu crédito.',
      juntas: 0, pagas: pd.dividendo - pd.dividendoSinSubsidio, soloPagas: true,
      req: [['Departamento nuevo, en primera venta', true], ['De hasta UF 4.000', precio <= 4000], ['Que queden cupos', null]],
      enPasos: !!ps.tasaAgregado, lista: !!ps.tasaPedido });
    // 23-nov: sumar a alguien al crédito (en Bci, complementar renta con un codeudor). No cambia los montos: suma renta.
    formas.push({ id: 'sumar', sigla: '+1', nombre: 'Sumar a alguien al crédito', sinEfecto: true,
      que: 'Tu pareja, un familiar u otra persona aparece en el mismo crédito y suma su renta. La app te ayuda a dejar por escrito el acuerdo entre ustedes.',
      juntas: 0, pagas: 0,
      req: [['Con familiar directo o pareja legal: tu renta desde 23 UF y la de la otra persona desde 16 UF (según Bci)', null],
            ['Con otra persona: tu renta desde 50 UF y la de ambos desde 70 UF; hasta 80 % a 25 años (según Bci)', null]],
      enPasos: !!ps.sumarAgregado, lista: !!ps.sumarAgregado });
    return formas;
  }
  // 23-nov: el acuerdo entre quienes comparten el crédito: con quién, qué parte del departamento es de cada uno,
  // quién paga la cuota y qué pasa si alguien sale. Es un borrador de la app: no reemplaza un contrato ni asesoría legal.
  function abrirAcuerdoCredito(boton) {
    var a = estado.acuerdoCredito || { con: 'pareja', tuParte: 50, quienPaga: 'parte', siSale: 'compra' };
    var opt = function (v, t, sel) { return '<option value="' + v + '"' + (sel === v ? ' selected' : '') + '>' + t + '</option>'; };
    var html = '<p class="texto-apoyo">Dejen escrito el acuerdo antes de pedir el crédito juntos. Es un borrador de la app: no reemplaza un contrato ni asesoría legal.</p>' +
      '<form class="form-acuerdo" id="form-acuerdo">' +
        '<label class="campo"><span>¿Con quién?</span><select id="ac-con">' + opt('pareja', 'Mi pareja', a.con) + opt('familiar', 'Un familiar directo', a.con) + opt('otra', 'Otra persona', a.con) + '</select></label>' +
        '<label class="campo"><span>Tu parte del departamento: <strong id="ac-parte-val">' + a.tuParte + NBSP + '%</strong></span>' +
          '<input type="range" id="ac-parte" min="10" max="90" step="5" value="' + a.tuParte + '"></label>' +
        '<label class="campo"><span>¿Quién paga la cuota?</span><select id="ac-paga">' + opt('parte', 'Cada uno según su parte', a.quienPaga) + opt('mitad', 'Mitad y mitad', a.quienPaga) + '</select></label>' +
        '<label class="campo"><span>Si uno quiere salir</span><select id="ac-sale">' + opt('compra', 'El otro compra su parte', a.siSale) + opt('vende', 'Se vende y se reparte según la parte', a.siSale) + '</select></label>' +
        '<p class="fp-sello">' + icono('i-escudo') + 'Si alguien deja de pagar, el banco puede cobrarle la cuota completa a cualquiera de los dos. Revísenlo con Bci.</p>' +
        '<button type="submit" class="btn btn-primario btn-bloque">Guardar el acuerdo</button>' +
      '</form>';
    abrirHojaContenido('Acuerdo para comprar juntos', html, boton, function () {
      var r = document.getElementById('ac-parte'), v = document.getElementById('ac-parte-val');
      r.addEventListener('input', function () { v.textContent = r.value + NBSP + '%'; });
      document.getElementById('form-acuerdo').addEventListener('submit', function (e) {
        e.preventDefault();
        estado.acuerdoCredito = { con: document.getElementById('ac-con').value, tuParte: Number(r.value), quienPaga: document.getElementById('ac-paga').value, siSale: document.getElementById('ac-sale').value };
        estado.pasos.sumarAgregado = true;
        guardarEstado();
        cerrarHoja(false);
        mostrar();
        toast('Guardaste el acuerdo para comprar juntos.');
      });
    });
  }
  function efectoPill(etq, v, alMes) {
    if (v === null || v === undefined || Math.abs(v) < 1000) return '<span class="fp-efecto igual"><small>' + etq + '</small><strong>Igual</strong></span>';
    var baja = v < 0;
    return '<span class="fp-efecto ' + (baja ? 'baja' : 'sube') + '"><small>' + etq + '</small><strong>' + (baja ? '−' : '+') + formatoRedondeado(Math.abs(v)) + (alMes ? ' al mes' : '') + '</strong></span>';
  }
  function abrirBajarPrecio(p, solo, caminoVista, boton) {
    var c = caminoVista && CAMINOS[caminoVista], antes = estado.piezas, formas;
    if (c && !c.grupo && estado.modo === 'vivir') estado.piezas = Object.assign({}, antes, { respaldo: !!c.familiar });
    try { formas = formasPagarMenos(p, solo); } finally { estado.piezas = antes; }
    var marca = function (ok) { return '<span class="fp-marca ' + (ok === true ? 'ok' : ok === false ? 'no' : 'q') + '" aria-hidden="true">' + (ok === true ? icono('i-check') : ok === false ? '✕' : '?') + '</span>'; };
    var html = '<p class="texto-apoyo">Cuánto cambia lo que juntas y lo que pagas al mes en este departamento. Súmalas a tus pasos para revisar si cumples y pedirlas.</p>' +
      '<ul class="fp-lista">' + formas.map(function (f) {
        var estadoF = f.auto ? '<span class="fp-chip">Va incluido</span>'
          : f.bloqueo ? '<span class="fp-chip gris">' + f.bloqueo.razon + '</span>'
          : f.id === 'tasa' && !f.enPasos ? '<span class="fp-chip gris">Si quedan cupos</span>'
          : f.lista ? '<span class="fp-chip verde">' + icono('i-check') + 'Lista</span>'
          : f.enPasos ? '<span class="fp-chip verde">' + icono('i-check') + 'En tus pasos</span>' : '';
        return '<li class="fp-forma"><div class="fp-cab"><span class="fp-sigla" aria-hidden="true">' + f.sigla + '</span><h3 class="h6">' + f.nombre + '</h3>' + estadoF + '</div>' +
          '<p class="fp-que">' + f.que + '</p>' +
          (f.bloqueo ? '<p class="fp-bloqueo">' + icono('i-info') + '<span>' + f.bloqueo.como + '</span></p>'
            : f.sinEfecto ? '<p class="fp-espera">' + icono('i-info') + 'No cambia el monto del pie: suma renta para que te aprueben el crédito.</p>'
            : '<div class="fp-efectos">' + (f.soloPagas ? '' : efectoPill(f.id === 'fogaes' ? 'Juntas, frente al 20' + NBSP + '%' : 'Juntas', f.juntas)) +
              efectoPill(f.soloPagas ? 'Si te lo dan, pagas' : 'Pagas', f.soloPagas ? -Math.abs(f.pagas) : f.pagas, true) + '</div>') +
          (f.espera ? '<p class="fp-espera">' + icono('i-calendario') + f.espera + '</p>' : '') +
          (f.req.length ? '<ul class="fp-req">' + f.req.map(function (r) { return '<li>' + marca(r[1]) + '<span>' + r[0] + (r[1] === null ? ' <small>(lo revisas en la misión)</small>' : '') + '</span></li>'; }).join('') + '</ul>' : '') +
          (f.auto || f.bloqueo ? '' : f.id === 'sumar' ? '<button type="button" class="btn btn-secundario btn-bloque" data-sumar-forma="sumar">' + (f.enPasos ? 'Cambiar el acuerdo' : 'Armar el acuerdo') + '</button>'
            : f.enPasos ? '' : '<button type="button" class="btn btn-secundario btn-bloque" data-sumar-forma="' + f.id + '">Agregar a mis pasos</button>') +
        '</li>';
      }).join('') + '</ul>' +
      '<p class="fp-sello">' + icono('i-escudo') + 'Lo confirma Bci al aprobar tu crédito.</p>';
    abrirHojaContenido('¿Cómo puedes llegar antes?', html, boton, function () {
      document.querySelectorAll('[data-sumar-forma]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.sumarForma;
          if (id === 'sumar') { abrirAcuerdoCredito(b); return; }
          if (id === 'fogaes') estado.pasos.fogaesAgregado = true;
          if (id === 'tasa') estado.pasos.tasaAgregado = true;
          if (id === 'ds1') { estado.pasos.ds1Agregado = true; if (estado.modo === 'vivir') estado.piezas = Object.assign({}, estado.piezas, { subsidio: true }); }
          guardarEstado();
          cerrarHoja(false);
          mostrar();
          toast(id === 'fogaes' ? 'Se sumó a tus pasos: revisa si calificas a la garantía del Estado.' : id === 'tasa' ? 'Se sumó a tus pasos: pide el subsidio a la tasa.' : 'Se sumó a tus pasos: postula al DS1.');
        });
      });
    });
  }
  // 20-nov (Bárbara): en el detalle, qué es la garantía de un familiar, diagramado: cómo se paga el precio
  // (tu pie y el crédito Bci del 95 %) y, aparte, la garantía que deja tu familiar y cuándo la recupera.
  function garantiaFamiliarDetalle(pd) {
    var precio = ufAPesos(pd.precioUF), pie = pd.pie, subsidio = ufAPesos(pd.subsidioUF || 0), credito = ufAPesos(pd.creditoUF);
    var rf = respaldoFamiliar(pd.precioUF);
    var anios = Math.round(rf.mesesLibera / 12);
    var pct = function (v) { return Math.max(3, v / precio * 100).toFixed(1) + '%'; };
    var parte = function (clase, etq, monto, nota) {
      return '<li class="gf-parte ' + clase + '"><span class="gf-punto" aria-hidden="true"></span><span class="gf-parte-txt"><small>' + etq + '</small><strong>' + formatoRedondeado(monto) + '</strong></span><small class="gf-nota">' + nota + '</small></li>';
    };
    return '<section class="gf" aria-labelledby="gf-titulo">' +
      '<h2 class="h5" id="gf-titulo">Cómo funciona aquí</h2>' +
      '<p class="gf-que">Tu familiar <strong>no te regala el dinero</strong>: lo deja en Bci como garantía. Así Bci te presta más y tú juntas menos pie.</p>' +
      '<p class="gf-sub">Cómo se paga el precio (' + formatoRedondeado(precio) + ')</p>' +
      '<div class="gf-barra" aria-hidden="true"><span class="tu" style="width:' + pct(pie) + '"></span>' +
        (subsidio > 0 ? '<span class="sub" style="width:' + pct(subsidio) + '"></span>' : '') +
        '<span class="bci" style="flex:1"></span></div>' +
      '<ul class="gf-partes">' +
        parte('tu', 'Tú pones', pie, 'Pie del 5' + NBSP + '%') +
        (subsidio > 0 ? parte('sub', 'Subsidio', subsidio, 'Del Estado') : '') +
        parte('bci', 'Bci te presta', credito, 'Crédito del 95' + NBSP + '%') +
      '</ul>' +
      '<div class="gf-familiar">' +
        '<span class="gf-fam-icono" aria-hidden="true">' + icono('i-grupo') + '</span>' +
        '<div class="gf-fam-txt"><small>Tu familiar deja en Bci</small><strong>' + formatoRedondeado(rf.deposito) + '</strong><small>10' + NBSP + '% del precio' + SEP + 'con intereses</small></div>' +
        '<ol class="gf-linea"><li><b>Hoy</b><span>Lo deja</span></li><li><b>' + (anios === 1 ? '1 año' : 'En ' + anios + ' años') + '</b><span>Tu deuda baja al 80' + NBSP + '%</span></li><li><b>Vuelve</b><span>Lo recupera</span></li></ol>' +
      '</div>' +
      '<p class="gf-ojo">' + icono('i-alerta') + '<span>Si no pagas y hay remate, tu familiar puede perder su garantía. Es una propuesta: hoy no existe en Chile.</span></p>' +
      '<a class="enlace gf-enlace" href="#compra/ficha/respaldo-familiar/familiar">Cómo lo vive tu familiar ›</a>' +
    '</section>';
  }
  // 20-nov: mirado desde la garantía de un familiar (o desde la del Estado), el detalle usa el crédito de ese camino.
  function renderDetalle(id, ctx, caminoVista) {
    var c = caminoVista && CAMINOS[caminoVista];
    if (estado.modo === 'arrendar' && c) {
      caminoMirado = caminoVista;
      try { return renderDetalleBase(id, ctx, caminoVista); } finally { caminoMirado = null; }
    }
    if (!c || c.grupo || estado.modo !== 'vivir' || !!c.familiar === !!piezasOn().respaldo) return renderDetalleBase(id, ctx, caminoVista);
    var antes = estado.piezas;
    estado.piezas = Object.assign({}, antes, { respaldo: !!c.familiar });
    try { return renderDetalleBase(id, ctx, caminoVista); } finally { estado.piezas = antes; }
  }
  function renderDetalleBase(id, ctx, caminoVista) {
    ctx = ctx || 'departamentos';
    var desdeCamino = caminoVista && ctx !== 'departamentos';
    $('detalle-volver').setAttribute('href', desdeCamino ? '#compra/caminos/' + caminoVista : VOLVER_DETALLE[ctx][0]);
    $('detalle-volver').lastChild.textContent = desdeCamino ? CAMINOS[caminoVista].corto : VOLVER_DETALLE[ctx][1];
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
    var solo = conjunto && ctx !== 'inversiones' && (caminoSinGrupo || compraSinGrupo(p));
    var enGrupo = conjunto && !solo;
    var ahorroGrupo = r.ahorro;
    if (solo && estado.modo !== 'vivir') { r = resumenSinGrupo(p, r, caminoVista); e = r.escenario; }
    var pd = vivirAqui ? plazoDepartamento(p, null, solo) : null;
    // 20-nov (Bárbara): para arrendar, el detalle va en secciones como el de vivir, con una de lo que ganas.
    var arrendarAqui = estado.modo === 'arrendar' && ctx !== 'inversiones';

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
    if (solo && vivirAqui && !esMiCompra && !grupoCerrado(p) && r.cuposLibres > 0 && !pd.on.respaldo) {
      var pdG = plazoDepartamento(p);
      var menos = ufAPesos(pd.precioUF - pdG.precioUF), antes = (pd.meses || 0) - (pdG.meses || 0);
      if (menos > 0) grupoPosible = '<a class="tarjeta fila grupo-posible" href="#compra/proyecto/' + esc(p.id) + '/grupo-vivir">' + icono('i-grupo', 'icono-grande') +
        '<span><strong>Si te unes a su grupo</strong><small>' + r.cuposTomados + ' de ' + r.cupos + ' personas ya se unieron. Podrías pagar ' + formatoRedondeado(menos) + ' menos' + (antes > 0 ? ' y llegar ' + plural(antes, 'mes', 'meses') + ' antes' : '') + '</small></span>' +
        '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>';
    }
    // 11-nov: el mismo departamento en grupo también se puede comprar solo, desde aquí mismo.
    var soloPosible = '';
    if (conjunto && !solo && !esMiCompra && ctx !== 'inversiones') {
      var caminoSolo = estado.modo === 'vivir' ? 'individual-vivir' : 'individual-invertir';
      var masSolo = vivirAqui ? ufAPesos(plazoDepartamento(p, null, true).precioUF - pd.precioUF) : 0;
      // S33-C7: opción secundaria, al final del grupo.
      soloPosible = '<p class="sin-grupo-opcion"><a class="enlace" href="#departamentos/' + esc(p.id) + '/' + caminoSolo + '">¿Prefieres comprarlo sin grupo? ›</a>' +
        '<small>Con ' + CAMINOS[caminoSolo].corto.replace(/^C/, 'c') + ', sin esperar al grupo' + (masSolo > 0 ? SEP + 'pagas ' + formatoRedondeado(masSolo) + ' más' : '') + '</small></p>';
    }
    var invertiste = invertidoEn(p.id) > 0;
    var comprar;
    if (p.tipo === 'financiamiento' && estado.modo === 'vivir' && !esMiCompra) {
      comprar = '<p class="aviso">El pie compartido es para comprar para arrendar: los inversionistas recuperan su parte con el arriendo.</p>' +
        '<button type="button" class="btn btn-terciario btn-bloque" id="btn-detalle-datos">Cambiar mis datos</button>';
    } else if (esMiCompra && estado.modo === 'vivir' && puedeCambiarMeta()) {
      // S32-B5 (D5): es tu meta, todavía sin reservar.
      comprar = '<p class="aviso">Es tu departamento: con él calculamos tu fecha.</p><a href="#compra" class="btn btn-secundario-dark btn-bloque">Ver tu compra</a>';
    } else if (esMiCompra) {
      comprar = '<p class="aviso">Ya te uniste a este proyecto.</p>' +
        '<a href="#compra/' + rutaPasoActual() + '" class="btn btn-primario btn-lg btn-bloque">Ver tu compra</a>';
    } else if (invertiste) {
      // El 15 % de un comprador lo financian otras personas: quien ya invirtió aquí no puede comprar aquí.
      comprar = '<p class="aviso">Ya invertiste en este proyecto, así que no puedes comprar aquí: el 15' + NBSP + '% de un comprador lo ponen otras personas.</p>' +
        '<a href="#inversiones" class="btn btn-terciario btn-bloque">Ver mis inversiones</a>';
    } else if (estado.compra && estado.compra.paso === 4) {
      comprar = '<p class="aviso">Ya firmaste tu compra en ' + esc(buscarProyecto(estado.compra.proyectoId).nombre) + '.</p>';
    } else if (estado.compra) {
      var actual = buscarProyecto(estado.compra.proyectoId);
      var reemplaza = (estado.compra.paso || 1) >= 2
        ? '<p class="texto-apoyo">Tu solicitud en ' + esc(actual.nombre) + ' se reemplaza: la pides de nuevo aquí.</p>'
        : '';
      var metaVivir = ctx === 'departamentos' && estado.modo === 'vivir' && puedeCambiarMeta();
      comprar = (metaVivir ? '<p class="aviso">Tu departamento es ' + esc(actual.nombre) + '.</p>' : '<p class="aviso">Ya estás comprando en ' + esc(actual.nombre) + '.</p>') +
        (metaVivir && r.cuposLibres > 0 ? notaCambioCamino({ tipo: 'proyecto', p: p, d: d, solo: solo, camino: caminoVista }) + '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-cambiar-compra" aria-haspopup="dialog">Cambiar mi departamento a este</button>' :
        ctx === 'camino' && r.cuposLibres > 0
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-cambiar-compra">Cambiar mi compra a este departamento</button>' + reemplaza
          : '<a href="#compra" class="btn btn-secundario-dark btn-bloque">Ver tu compra</a>');
    } else if (r.cuposLibres === 0) {
      comprar = '<p class="aviso">Sin cupos disponibles.</p>';
    } else {
      // 10-nov: comprar es una decisión grande. Primero se visita (con la mitad del pie juntada) y solo después se elige.
      comprar = ctx === 'camino'
        ? accionVisita(p, solo)
        : (!estado.preguntasListas
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-me-alcanza">¿Me alcanza?</button>'
          : notaCambioCamino({ tipo: 'proyecto', p: p, d: d, solo: solo, camino: caminoVista }) +
            '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-llevar" aria-haspopup="dialog">Elegir este departamento</button>');
    }
    if (ctx === 'inversiones') {
      comprar = r.faltaUF > 0 && !esMiCompra
        ? '<a href="#inversiones/' + esc(p.id) + '/invertir" class="btn btn-primario btn-lg btn-bloque">Invertir aquí</a>'
        : '<p class="texto-apoyo">' + (esMiCompra ? 'En tu propia compra no puedes invertir.' : 'Este proyecto ya reunió su 15' + NBSP + '%.') + '</p>';
    }

    // 9-nov: en compra en grupo, cuántos se unieron va arriba, bajo las fotos.
    // 11-nov: el grupo se muestra siempre que el precio sea con grupo (antes se ocultaba si tu camino elegido era otro).
    var bloqueGrupo = p.tipo === 'venta' || caminoSinGrupo || solo ? '' : '<div class="tarjeta bloque">' +
        (p.tipo === 'conjunto' ? grupoConEdificio(p, r) : avanceDe(p, r)) +
        '<p class="cierre">Cierra el ' + formatoFecha(p.cierre) + '</p>' +
        '<p class="frase-cierre">' + frase + '</p>' +
      '</div>';
    var conoceGrupo = '';
    if (conjunto && bloqueGrupo) conoceGrupo = conoceTuGrupo(p, r);
    if (conjunto && bloqueGrupo) bloqueGrupo = bloqueGrupo.replace('<div class="tarjeta bloque">', '<div class="tarjeta bloque grupo-detalle"><h2 class="grupo-detalle-titulo">' + (esMiCompra ? 'Tu grupo de compra' : 'Su grupo de compra') + '</h2>' + bandaConfianza())
      .replace(/<\/div>$/, siAlguienSeVa(p) + '</div>');
    contenedor.innerHTML =
      // S25: como el canvas: título, el tipo en un chip y la ficha.
      '<header class="detalle-cabecera">' + (ctx !== 'inversiones' ? botonFavorito(p) : '') +
        '<h1 id="titulo-proyecto" class="h2">' + esc(p.nombre) + '</h1>' +
        '<span class="tp-tipo ' + (conjunto ? 'azul' : p.tipo === 'venta' ? 'verde' : 'amarillo') + '">' + (solo ? 'En obra' : NOMBRE_TIPO[p.tipo]) + '</span>' +
        '<p class="texto-apoyo">' + esc(p.comuna) + SEP + ficha(d) + '</p>' +
      '</header>' +
      galeria(fotosDe(p, d)) +
      (conjunto && !vivirAqui && !arrendarAqui ? bloqueGrupo + conoceGrupo + soloPosible : '') +
      (solo && !vivirAqui && !arrendarAqui && !esMiCompra && !grupoCerrado(p) && r.cuposLibres > 0 && ahorroGrupo > 0 ? grupoInvertirHtml(p, ahorroGrupo) : '') +

      (arrendarAqui ? detalleArrendarHtml(p, r, e, {
          enGrupo: enGrupo, conjunto: conjunto, solo: solo, listaUF: d.listaUF,
          grupo: conjunto && bloqueGrupo ? bloqueGrupo + conoceGrupo : '',
          extraNumeros: (solo && !esMiCompra && !grupoCerrado(p) && r.cuposLibres > 0 && ahorroGrupo > 0 && !(CAMINOS[caminoVista] && CAMINOS[caminoVista].familiar) ? grupoInvertirHtml(p, ahorroGrupo) : '') + (conjunto && !solo ? soloPosible : '')
        }) :
      vivirAqui
        // S17-F1 y F2: para vivir, el mismo plazo que Inicio y Tu pie, con cifras redondeadas.
        // S33-C7: «Es tuyo» se calcula igual que en el resto de la app (tu pie + 3 meses hasta las llaves).
        // S36 (lienzo P22, P25 y P62): menos scroll. Arriba el precio y cuándo sería tuyo; abajo, pestañas.
        ? '<section class="det-precio" aria-labelledby="det-llaves">' +
            (pd.on.respaldo ? '<span class="det-camino-chip">' + icono('i-grupo') + 'Con la garantía de un familiar</span>' : '') +
            '<p class="det-etq">Precio' + (enGrupo ? ' con descuento del grupo' : p.tipo === 'venta' && piezasValidas(piezasOn()).iva ? ' sin IVA' : '') + '</p>' +
            '<div class="det-precio-fila"><strong class="det-precio-num">' + formatoRedondeado(ufAPesos(pd.precioUF)) + '</strong>' +
              (enGrupo && r.ahorro > 0 ? '<span class="det-ahorras">Ahorras ' + formatoRedondeado(r.ahorro) + '</span>' : '') + '</div>' +
            (enGrupo && mesesParaEntrega(p) > 0
              ? (function () { var g = planGrupo(p); return '<p class="det-tuyo" id="det-llaves">' + icono('i-calendario') + '<span>Firman todos en <strong>' + g.fecha + '</strong>: ese día recibes tus llaves</span></p>' +
                  '<p class="det-freno">' + textoPlanGrupo(g) + '</p>'; })()
              : '<p class="det-tuyo" id="det-llaves">' + icono('i-calendario') + '<span>' + (pd.meses === null || pd.meses === undefined ? 'Todavía no te alcanza' : 'Recibirías tus llaves <strong>aprox. ' + fechaLlaves(pd.meses + MESES_SI_A_LLAVES, hoyDemo()) + '</strong>') + '</span></p>' +
                '<p class="det-freno">' + FRENO[pd.freno] + '</p>') +
            (conjunto && !pd.on.respaldo ? cierreGrupoHtml(p, 'en-azul') : '') + '</section>' +
          (conjunto && !pd.on.respaldo ? fichaGrupoHtml(p) : '') +
          pestanasDetalle(p, [
            ['numeros', 'Números',
              (pd.on.respaldo ? garantiaFamiliarDetalle(pd) : '') +
              '<div class="det-cifras"><div><small>Juntas antes de firmar</small><strong>' + formatoRedondeado(pd.meta) + '</strong><small>' + (pd.on.respaldo ? 'pie del 5' + NBSP + '% y gastos' : 'pie y gastos') + '</small></div>' +
                '<div><small>Dividendo al mes</small><strong>' + formatoRedondeado(pd.dividendo) + '</strong><small>' + (pd.on.respaldo ? 'crédito del 95' + NBSP + '%' : 'con seguros' + SEP + ufDecimales(pd.dividendo / SUPUESTOS.uf, 2)) + '</small></div></div>' +
              '<p class="det-subsidio">' + icono('i-info') + '<span>Si se acaba el subsidio a la tasa, el dividendo sube a <strong>' + formatoRedondeado(pd.dividendoSinSubsidio) + '</strong> (' + ufDecimales(pd.dividendoSinSubsidio / SUPUESTOS.uf, 2) + ').</span></p>' +
              grupoPosible +
              '<button type="button" class="tarjeta dueno-card bajar-card" id="btn-bajar-precio" aria-haspopup="dialog"><span class="circulo-icono verde" aria-hidden="true">' + icono('i-alcancia') + '</span>' +
                '<span><strong>¿Cómo puedes llegar antes?</strong><small>Garantía del Estado y subsidio: cuánto cambian tus números</small></span><svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></button>' +
              '<a class="tarjeta dueno-card" href="#compra/dueno/' + esc(p.id) + '"><span class="circulo-icono azul" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 10.5L12 4l8.5 6.5V20H3.5zM9.5 20v-5h5v5"/></svg></span>' +
                '<span><strong>Tu mes como dueño</strong><small>Dividendo, gastos comunes y lo que te queda para tus gastos</small></span><svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>' +
              soloPosible +
              (pd.on.respaldo ? '' : '<button type="button" class="enlace detalle-credito-link" id="btn-detalle-credito" aria-haspopup="dialog">Ver detalle del crédito</button>')],
            conjunto && bloqueGrupo ? ['grupo', 'Grupo', bloqueGrupo + conoceGrupo] : null,
            BARRIOS[p.comuna] ? ['barrio', 'Barrio', barrioSolo(p)] : null,
            ['visita', 'Visita', visitaHtml(p)]
          ]) +
          '<p class="llega-sello detalle-sello">' + icono('i-escudo') + 'Sin contar que el departamento suba de precio</p>'
        : '<div class="tarjeta protagonista">' +
        '<p class="etiqueta">Precio del departamento</p>' + precio +
        '<p class="secundario">Y luego <strong>' + formatoPesos(e.totalMes) + '</strong> al mes de dividendo</p>' +
        '<p class="texto-apoyo">Sin subsidio: ' + formatoPesos(e.dividendoSinSubsidio) + ' al mes ' + ayuda('dividendo') + '</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Sin contar que el departamento suba de precio</p>' +
      '</div>') +
      (arrendarAqui ? '' : rinde) +

      // S19-B1: el detalle del crédito queda plegado; a la vista, las filas que deciden.
      (vivirAqui || arrendarAqui ? '' : plegable('detalle-credito', 'Ver detalle del crédito', '',
        // S18-F4: para vivir, redondeado; los exactos quedan en la simulación, la preaprobación y Firmar.
        (vivirAqui ? repartoCasa(partesPiezas(pd), formatoRedondeado) : repartoCasa(partesEscenario(e))) +
        '<ul class="datos-inversion">' +
          '<li><span>Gastos al firmar</span><strong>' + (vivirAqui ? formatoRedondeado(pd.gastos) : formatoPesos(e.gastos)) + '</strong></li>' +
          (vivirAqui ? '' : '<li><span>Juntas antes de firmar</span><strong>' + formatoPesos(e.alEscriturar) + '</strong></li>') +
          (vivirAqui && enGrupo && r.ahorroCompleto > r.ahorro ? '<li><span>Si el grupo llega a 5 personas, ahorras</span><strong>' + formatoRedondeado(r.ahorroCompleto) + '</strong></li>' : '') +
        '</ul>')) +

      (arrendarAqui ? '' : p.tipo === 'venta'
        ? (vivirAqui ? '' : '<p class="detalle-terminado">Edificio terminado' + SEP + 'lo recibes al firmar</p>')
        // S26: con el crédito con garantía del Estado (camino individual) no se muestra el grupo: no compra en grupo.
        : (conjunto ? '' : bloqueGrupo)) +

      (ctx !== 'inversiones' ? '' :
      '<section class="tarjeta bloque" aria-labelledby="titulo-para-invertir">' +
        '<h2 class="h5" id="titulo-para-invertir">Para invertir</h2>' +
        '<ul class="datos-inversion">' +
          '<li><span>Rentabilidad</span><strong>6\u00a0% al año en UF</strong></li>' +
          '<li><span>Plazo</span><strong>' + textoPlazo(plazoRecompra(r.porFinanciarUF, r.netoMensualUF, 1)) + '</strong></li>' +
          '<li><span>Tu respaldo</span><strong>Parte del departamento ' + ayuda('participacion') + '</strong></li>' +
          '<li><span>Falta por financiar</span><span class="en-uf"><strong>' + formatoRedondeado(ufAPesos(r.faltaUF)) + '</strong><small>' + formatoUF(r.faltaUF) + '</small></span></li>' +
        '</ul>' +
        (conjunto ? casaParticipacion(r) : '') +
        '<p class="frase-cierre">Ganancias y pérdidas, según la parte de cada uno. ' + ayuda('cuenta-custodia') + '</p>' +
      '</section>') +

      // Evaluación heurística (punto 3): la acción principal queda fija abajo mientras se lee el detalle.
      (ctx === 'camino' && /btn-(comprar|ya-visite|agendar)|href="#pie"/.test(comprar) ? '<div class="visita-bloque">' + infoVisita(p) + '</div>' : '') +
      '<div class="acciones accion-fija detalle-accion">' + comprar + '</div>';

    iniciarGalerias(contenedor);
    iniciarPlegables();
    iniciarPestanasDetalle(contenedor);
    iniciarPagoAntes();
    iniciarVisita(p);
    if ($('btn-bajar-precio')) $('btn-bajar-precio').addEventListener('click', function () { abrirBajarPrecio(p, solo, caminoVista, $('btn-bajar-precio')); });
    if ($('btn-detalle-credito')) $('btn-detalle-credito').addEventListener('click', function () {
      abrirHojaContenido('Detalle del crédito', repartoCasa(partesPiezas(pd), formatoRedondeado) +
        '<ul class="datos-inversion"><li><span>Gastos al firmar</span><strong>' + formatoRedondeado(pd.gastos) + '</strong></li>' +
        (enGrupo && r.ahorroCompleto > r.ahorro ? '<li><span>Si el grupo llega a 5 personas, ahorras</span><strong>' + formatoRedondeado(r.ahorroCompleto) + '</strong></li>' : '') + '</ul>',
        $('btn-detalle-credito'));
    });
    if ($('btn-agendar')) $('btn-agendar').addEventListener('click', function () {
      abrirAgenda(p, $('btn-agendar'), function () { renderDetalle(id, ctx, caminoVista); var b = $('btn-ya-visite'); if (b) b.focus(); });
    });
    if ($('btn-ya-visite')) $('btn-ya-visite').addEventListener('click', function () {
      estado.visitas = Object.assign({}, estado.visitas);
      estado.visitas[p.id] = Object.assign({}, estado.visitas[p.id], { fue: true });
      guardarEstado();
      renderDetalle(id, ctx, caminoVista);
      var b = $('btn-comprar'); if (b) b.focus();
    });
    var botonComprar = $('btn-comprar');
    if (botonComprar) {
      botonComprar.addEventListener('click', function () {
        conCarga(botonComprar, function () {
          guardarCompra(solo ? { proyectoId: p.id, departamentoId: d.id, paso: 1, sinGrupo: true } : { proyectoId: p.id, departamentoId: d.id, paso: 1 });
          irAPostular();
        });
      });
    }
    var botonCambiar = $('btn-cambiar-compra');
    if (botonCambiar) {
      botonCambiar.addEventListener('click', function () {
        if (ctx === 'departamentos' && estado.modo === 'vivir') { confirmarDeptoMeta({ tipo: 'proyecto', p: p, d: d, solo: solo, camino: caminoVista }, botonCambiar); return; }
        conCarga(botonCambiar, function () {
          guardarCompra(solo ? { proyectoId: p.id, departamentoId: d.id, paso: 1, sinGrupo: true } : { proyectoId: p.id, departamentoId: d.id, paso: 1 });
          irAPostular();
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
      location.hash = '#compra';
    });
    // El único cruce entre pestañas: se confirma en una hoja.
    if ($('btn-llevar')) $('btn-llevar').addEventListener('click', function () {
      if (estado.modo === 'vivir' || ctx === 'departamentos') { confirmarDeptoMeta({ tipo: 'proyecto', p: p, d: d, solo: solo, camino: caminoVista }, $('btn-llevar')); return; }
      abrirHojaContenido('¿Elegir ' + esc(p.nombre) + ' para tu camino?',
        '<p class="texto-apoyo">Sigues con tu preaprobación en Tu compra.</p>' +
        '<button type="button" class="btn btn-primario btn-bloque" id="btn-llevar-si">Sí, elegir</button>', $('btn-llevar'), function () {
          $('btn-llevar-si').addEventListener('click', function () {
            cerrarHoja(false);
            estado.caminoElegido = caminoParaProyecto(p);
            guardarEstado();
            guardarCompra(solo ? { proyectoId: p.id, departamentoId: d.id, paso: 1, sinGrupo: true } : { proyectoId: p.id, departamentoId: d.id, paso: 1 });
            irAPostular();
          });
        }, { confirmacion: true });
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
        '<p class="inversion-fila"><span>Invertiste</span><span class="en-uf"><strong>' + formatoRedondeado(ufAPesos(x.montoUF)) + '</strong><small>' + formatoUF(x.montoUF) + '</small></span></p>' +
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
    { titulo: 'Tu departamento', apoyo: 'Ya es tuyo.' }
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
    return e ? '<p class="paso-de">Tus pasos' + SEP + e.nombre + '</p>' : '';
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
      $('postular-explica').textContent = 'Para pedir tu preaprobación, escribe tu sueldo.';
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
      : (sug && sug.aprueba ? 'Así Bci no te preaprueba aquí. Revisa la sugerencia.' : 'Así Bci no te preaprueba aquí.');
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
    // S33-C9 (E9): sin «Paso 3 de 6» arriba de los pasos 1-2-3 (se confundían): solo el nombre.
    var e = pasoEscalera('preaprobacion');
    // S34: el título ya dice el paso; la ceja lo repetía dos veces.
    return '';
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
              '<p class="ganan-cuotas"><span>Deudas que pagas al mes</span><strong>' + formatoPesos(estado.otrasCuotas || 0) + '</strong></p>' +
            '</section>'
          : '') +
        '<div class="formulario" id="form-postula"' + (yaTiene ? ' hidden' : '') + '>' +
          campoDinero('sueldo-propio', 'Tu sueldo líquido', estado.sueldoPropio) +
          campoDinero('sueldo-pareja', 'Sueldo líquido de tu pareja', estado.sueldoPareja) +
          campoDinero('otras-cuotas', 'Deudas que pagas al mes (tarjetas, créditos)', estado.otrasCuotas) +
        '</div>' +
        campoContrato() +
        '<div id="carga-resultado" aria-live="polite"></div>' +
        '<p class="sin-compromiso"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/></svg>Sin compromiso: pedirla no te obliga a comprar</p>' +
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
      archivos: ['carnet_ambos_lados.pdf', 'carnet_frente_y_reverso.jpg'] },
    // S31-C: la carpeta completa. Independientes: la carpeta tributaria del SII muestra su renta.
    { id: 'tributaria', corto: 'SII', nombre: 'Carpeta tributaria del SII', para: 'Muestra tus boletas y tu renta de los últimos 2 años.',
      archivos: ['carpeta_tributaria_sii.pdf'], solo: function () { return estado.contrato === 'independiente'; } },
    // Para vivir: el subsidio a la tasa pide una declaración jurada simple del comprador (Diario Oficial, 17-jul-2025).
    { id: 'declaracion', corto: 'Declaración', nombre: 'Declaración jurada simple del comprador', para: 'La pide el subsidio a la tasa: compras tu primera vivienda.',
      archivos: ['declaracion_jurada_comprador.pdf'], solo: function () { return estado.modo !== 'arrendar'; } }
  ];
  function docsRequeridos() { return DOCUMENTOS.filter(function (x) { return !x.solo || x.solo(); }); }

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
    return docsRequeridos().every(function (x) { return !!docs[x.id]; });
  }

  // S25: como el canvas: anillo con cuántos faltan, aviso para clientes Bci y una fila por documento.
  var ICONO_DOC = {
    liquidaciones: ['azul', 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'],
    afp: ['verde', 'M4 19h16M6 16V11M10 16V8M14 16v-6M18 16V6'],
    contrato: ['amarillo', 'M4 8h16v12H4zM9 8V5h6v3M4 13h16'],
    carnet: ['rojo', 'M3 6h18v12H3zM8 10.5a1.8 1.8 0 1 0 0 .01M5.5 15c.4-1.4 1.4-2 2.5-2s2.1.6 2.5 2M13 10h5M13 13h4'],
    tributaria: ['azul', 'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5'],
    declaracion: ['verde', 'M7 3h7l4 4v14H7zM14 3v4h4M9.5 14l2 2 3.5-4']
  };
  var NOMBRE_DOC = { liquidaciones: ['Liquidaciones de sueldo', 'Las últimas 3'], afp: ['Cotizaciones de AFP', 'Los últimos 12 meses'],
    contrato: ['Contrato de trabajo', 'O certificado de antigüedad'], carnet: ['Carnet', 'Por los dos lados'],
    tributaria: ['Carpeta tributaria', 'Del SII, últimos 2 años'], declaracion: ['Declaración jurada', 'Simple, primera vivienda'] };
  function renderDocumentos(p) {
    var c = estado.compra;
    var docs = c.documentos || {};
    if (c.cliente !== false) guardarCompra(Object.assign({}, c, { cliente: false }));
    var req = docsRequeridos();
    var total = req.length;
    var listos = req.filter(function (x) { return !!docs[x.id]; }).length;
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
        // S34: con todo subido, el aviso de «cliente Bci» ya no se repite.
        (!faltan ? '' : '<p class="docs-cliente"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5h.01"/></svg><span>Si eres cliente Bci, ya los tenemos. Solo revisa que estén.</span></p>') +
        '<ul class="docs-lista">' + req.map(function (x) {
          var ok = !!docs[x.id], ic = ICONO_DOC[x.id] || ICONO_DOC.liquidaciones, nm = NOMBRE_DOC[x.id] || [x.nombre, ''];
          return '<li class="tarjeta doc-fila" id="doc-' + x.id + '"><span class="doc-icono ' + ic[0] + '" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + ic[1] + '"/></svg></span>' +
            '<span class="doc-texto"><strong>' + nm[0] + '</strong><span class="doc-estado' + (ok ? ' listo' : '') + '">' + (ok ? '✓ Listo' : 'Falta' + SEP + nm[1]) + '</span></span>' +
            '<button type="button" class="doc-boton btn-subir' + (ok ? '' : ' falta') + '" data-doc="' + x.id + '" aria-haspopup="dialog" aria-label="' + (ok ? 'Cambiar ' : 'Subir ') + nm[0] + '">' + (ok ? 'Cambiar' : 'Subir') + '</button></li>';
        }).join('') + '</ul>' +
        (faltan ? '' : '<div class="docs-todo" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#FFFFFF"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#28652B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>¡Todo listo! Ya puedes pedirla.</div>') +
        '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-ver-preaprobacion">' + (faltan ? 'Subir documentos (' + listos + ' de ' + total + ')' : 'Pedir mi preaprobación') + '</button>' +
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
          var falta = docsRequeridos().filter(function (x) { return !docs[x.id]; })[0];
          abrirHoja(p, document.querySelector('.btn-subir[data-doc="' + falta.id + '"]'));
          return;
        }
        conCarga(ver, function () {
          guardarCompra(Object.assign({}, estado.compra, { respuestaLista: false }));
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
  // S33-C9 (E9): mientras Bci revisa, cuánto demora y «Avanzar el tiempo» para la simulación.
  var DIAS_RESPUESTA_BCI = '2 a 5 días hábiles';
  function esperaPreaprobacion() {
    $('panel-compra').innerHTML =
      '<section aria-labelledby="titulo-espera">' + cejaPreaprobacion() + partesPostula('Resultado') +
        '<div class="tarjeta espera-bci">' +
          '<span class="espera-reloj" aria-hidden="true">' + icono('i-pronto') + '</span>' +
          '<h2 class="h3" id="titulo-espera">Bci está revisando tu solicitud</h2>' +
          '<p class="texto-apoyo">Responde en <strong>' + DIAS_RESPUESTA_BCI + '</strong>. Te avisamos cuando esté lista.</p>' +
          '<ol class="espera-linea"><li class="hecho">Enviaste tus datos y documentos</li><li class="actual">Bci revisa tu sueldo y tus deudas</li><li>Te llega la respuesta</li></ol>' +
        '</div>' +
        '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-avanzar-tiempo">' + icono('i-pronto') + 'Avanzar 3 días (simulación)</button>' +
        '<p class="texto-centro"><a class="enlace" href="#compra">Volver a tus pasos</a></p>' +
      '</section>';
    $('btn-avanzar-tiempo').addEventListener('click', function () {
      guardarCompra(Object.assign({}, estado.compra, { respuestaLista: true }));
      toast('Pasaron 3 días hábiles: llegó la respuesta de Bci (simulado).');
      renderMiCompra();
      window.scrollTo(0, 0);
    });
  }
  function renderResultadoPreaprobacion(p) {
    if (estado.compra && estado.compra.respuestaLista === false) return esperaPreaprobacion();
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
              (estado.pasos.preaprobado
                ? '<h3>Tu preaprobación alcanza</h3><p>Es la misma que ya tenías: no la pides de nuevo. Te podría prestar hasta</p>'
                : '<h3>¡Bci te preaprobó!</h3><p>Te podría prestar hasta</p>') +
              '<strong>' + formatoRedondeado(ufAPesos(r.creditoUF)) + '</strong>' +
              '<span class="pp-chip">' + formatoUF(r.creditoUF) + SEP + 'simulado</span></section>' +
            '<section class="tarjeta pp-rango"><p class="pp-rango-titulo">' + icono('i-ok') + (rg ? 'Alcanza para tu rango' : 'Alcanza para este departamento') + '</p>' +
              '<span class="pp-barra" aria-hidden="true"><i style="left:' + ((rg ? rg.desde : creditoNecesario * 0.9) / tope * 100).toFixed(1) + '%;width:' + (((rg ? rg.hasta - rg.desde : creditoNecesario * 0.1)) / tope * 100).toFixed(1) + '%"></i></span>' +
              '<p class="pp-rango-leyenda"><span>UF 0</span><span class="tuyo">' + (rg ? 'Tu rango: ' + textoRango(rg) : 'Este departamento') + '</span><span>' + formatoUF(r.creditoUF) + '</span></p></section>' +
            '<div class="pp-dos">' +
              '<div class="tarjeta pp-dato"><span class="circulo-icono verde" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 0 1 16 0M12 16l3-5"/></svg></span><small>Parte de tu sueldo</small><strong>' + (cargaV !== null ? formatoPorcentaje(cargaV, 1) : '—') + '</strong>' +
                (ev ? '<span class="carga-chip ' + ev.nivel + '">' + (ev.nivel === 'limite' ? 'Justo' : ev.nivel === 'no-aprueba' ? 'Alto' : 'Holgado') + '</span>' : '') + '</div>' +
              '<div class="tarjeta pp-dato"><span class="circulo-icono azul" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></span><small>Lo máximo que Bci acepta</small><strong>' + formatoRedondeado(r.dividendo) + '</strong><small>de dividendo al mes' + SEP + ufDecimales(r.dividendo / SUPUESTOS.uf, 2) + '</small></div>' +
            '</div>' +
            // S34: en grupo se pide antes del pie (asegura el cupo); el texto ya no contradice al paso.
            (p.tipo === 'conjunto' && !(estado.compra && estado.compra.sinGrupo)
              ? '<p class="pp-cupo">' + icono('i-grupo') + '<span><strong>Tu cupo en el grupo está asegurado.</strong> Ahora juntas tu pie en cuotas.</span></p>' +
                '<p class="pp-vence">' + icono('i-pronto') + '<span><strong>La preaprobación vence.</strong> Antes de firmar, Bci la revisa de nuevo: no tienes que hacer nada.</span></p>'
              : '<p class="pp-vence">' + icono('i-pronto') + '<span><strong>La preaprobación vence.</strong> Su vigencia la confirma Bci. Conviene pedirla con tu pie casi listo.</span></p>')
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
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque pp-seguir" id="btn-seguir-pie">' + (pasoTrasPostular(metaCompra(p), p) === 2 ? 'Seguir: junta tu pie' : 'Seguir con tu compra') + '</button>' +
            // S34: si ya elegiste departamento, ver otros es secundario (y no parece que tengas que cambiarlo).
            '<a class="enlace pp-deptos" href="#departamentos">Mirar otros departamentos que te alcanzan</a>'
          : '<div class="acciones"><a href="#proyectos" class="btn btn-primario btn-bloque">Ver proyectos</a></div>') +
        '<p class="texto-centro pp-editar"><button type="button" class="enlace enlace-gris" id="btn-editar-datos">' + icono('i-documento') + 'Editar mis datos</button></p>' +
      '</section>';

    iniciarPlegables();
    var seguir = $('btn-seguir-pie');
    if (seguir) {
      seguir.addEventListener('click', function () {
        conCarga(seguir, function () {
          var sig = pasoTrasPostular(metaCompra(p), p);
          guardarCompra(Object.assign({}, estado.compra, { paso: sig }));
          location.hash = sig === 2 ? '#pie' : '#compra';
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
      toast(estado.cuotaAutomatica ? 'Cuota automática el día 5 (simulado).' : 'Pagas tu cuota a mano.');
    });
    $('btn-no-pude').addEventListener('click', function () {
      var r = registrarMes({ mes: estado.mesAhorro, racha: estado.racha, ultimoProtector: estado.ultimoProtector }, false);
      estado.mesAhorro = r.mes; estado.racha = r.racha; estado.ultimoProtector = r.ultimoProtector;
      estado.historialMeses = (estado.historialMeses || []).concat([r.resultado]).slice(-6);
      guardarEstado();
      alcanciaDescansa = true;
      renderTu5(p, d);
      toast(r.resultado === 'protector' ? 'Usaste tu protector: tu racha sigue.' : 'Tu racha empieza de nuevo. Tu ahorro sigue.');
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
      toast(escalon ? '¡Grupo de ' + escalon.cupos + '! ' + formatoPorcentaje(escalon.descuento, 0) + ' de descuento para todos.' : 'Se unió alguien a tu grupo.');
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
      '<p class="firma-fila suave"><span>Si se acaba el subsidio a la tasa</span><span>' + formatoPesos(e.dividendoSinSubsidio) + SEP + ufDecimales(e.dividendoSinSubsidio / SUPUESTOS.uf, 2) + '</span></p>';
    var segunda = arrendar && e.pctInversionistas === 0 ? ''
      : arrendar
      ? filaFirma('Participación de los inversionistas ' + ayuda('participacion'),
          '15 % (' + formatoPesos(e.reparto.inversionistas) + '). Sin cuota para ti: el arriendo les paga 6 % al año en UF y recompra su parte.') +
        filaFirma('Cuenta custodia Bci ' + ayuda('cuenta-custodia'),
          'Recibe el arriendo y paga a los inversionistas.')
      : filaFirma(e.conPiezas && e.conPiezas.respaldo ? 'Garantía de un familiar · propuesta' : 'Garantía del Estado (FOGAES)',
          e.conPiezas && e.conPiezas.respaldo ? 'Un familiar deja una garantía en Bci.' : 'Departamentos nuevos de hasta UF 6.000. Bci te presta hasta el 90 %.');

    var hp = hitoActual(fotoPasos());
    var nota = arrendar ? '' : (e.conPiezas && e.conPiezas.respaldo
      ? '<p class="firma-nota"><strong>Garantía de un familiar (propuesta):</strong> un familiar deja una garantía en Bci.</p>'
      : '<p class="firma-nota"><strong>Garantía del Estado:</strong> el Estado respalda tu crédito, por eso Bci te presta hasta el 90' + NBSP + '% y pones solo el 10' + NBSP + '% de pie. Sirve para departamentos nuevos de hasta UF 6.000.</p>');
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
        (arrendar ? '' : '<div class="firma-monto"><span>Dividendo al mes (con seguros)</span><span><strong>' + formatoPesos(e.dividendo) + '</strong><small>' + ufDecimales(e.dividendo / SUPUESTOS.uf, 2) + '</small></span></div>') +
        filasVivir +
        (arrendar ? '<ul class="lista-check">' + credito + segunda + '</ul>' : nota) +
      '</section>' +
      // S31-B: el orden real (la tasación y los títulos van antes; la inscripción, después).
      '<section class="tarjeta firma-dia" aria-labelledby="titulo-tramites">' +
        '<h2 id="titulo-tramites">Del sí del banco a las llaves</h2>' + lineaSiALlaves(4) +
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
        '¿Y si quiero vender?<svg aria-hidden="true"><use href="#i-flecha"/></svg></button>' +
      // 11-nov (test): primero la respuesta directa; el detalle, después.
      '<p class="arrepiento-directo">Si vendes hoy, te quedan <strong>' + formatoPesos(v.usuario) + '</strong></p>' +
      '<div id="arrepiento" hidden>' +
        '<p class="texto-apoyo">Así se reparte si vendes este mes en ' + formatoPesos(v.valor) + ':</p>' +
        '<ol class="cascada">' +
          pasoCascada(n++, 'Bci', 'Lo que queda del crédito', formatoPesos(v.bci)) +
          (v.inversionistas > 0 ? pasoCascada(n++, 'Inversionistas', 'Según su parte', formatoPesos(v.inversionistas)) : '') +
          pasoCascada(n++, 'Costos de venta', null, formatoPesos(v.costos)) +
          pasoCascada(n++, 'Para ti', null, formatoPesos(v.usuario), 'cascada-final') +
        '</ol>' +
        (v.faltaParaBci > 0 ? '<p class="aviso aviso-alerta">Faltan ' + formatoPesos(v.faltaParaBci) + ' para pagar el crédito.</p>' : '') +
        '<p class="texto-apoyo nota">Si atrasas 2 dividendos, Bci te acompaña a vender antes de un remate.</p>' +
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Sin contar que el departamento suba de precio</p>' +
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
        '<h2 class="md-titulo" id="titulo-departamento">' + (recienFirmado ? '<span class="llave-firma" aria-hidden="true">' + icono('i-llave', 'icono-grande') + '</span>' : '') + 'Tu departamento</h2>' +
        '<p class="texto-apoyo">' + esc(p.nombre) + SEP + 'Mes ' + m.mes + '</p></header>' +
      (fotoEdificio(p) ? '<figure class="md-foto"><img src="' + fotoEdificio(p) + '" alt="' + esc(p.nombre) + ' (foto referencial)" width="800" height="600"><figcaption>' + icono('i-llave') + 'Es tuyo</figcaption></figure>' : '') +
      cuerpo +
      loTuyo(m) +
      '<section class="tarjeta md-avance" aria-labelledby="titulo-deudas">' +
        '<h2 id="titulo-deudas">Tu avance</h2>' +
        (m.conInversionistas ? barraParticipacion(m) : '') +
        barraDeuda('Crédito Bci (30 años)', m.mes, SUPUESTOS.mesesBci, m.saldoBci, m.avanceBci) +
      '</section>' +
      '<p class="llega-sello">Sin contar que el departamento suba de precio</p>' +
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
      '<a class="enlace" href="#compra/proyecto/' + esc(p.id) + '">' + esc(p.nombre) + '</a>' +
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
    location.hash = '#compra';
    toast('Saliste de la compra. Tu ahorro sigue ahí.');
  }

  // En qué paso está la compra, sin guardar nada (lo usan Tu compra e Inicio).
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
    var destino = '#compra/' + rutaPasoActual();
    if (location.hash !== destino) { location.hash = destino; return; }
    renderPasoActual();
  }
  function renderPasoActual() {
    var p = buscarProyecto(estado.compra.proyectoId);
    var d = departamentoDeMiCompra(p);
    var paso = pasoEfectivo();
    var ep = pasoEscalera(HITO_DE_COMPRA[paso]);
    $('titulo-paso').textContent = ep ? ep.nombre : CAMINO[paso];
    if (paso === 4) renderMiDepartamento(p, d);
    else if (paso === 3) { renderFirma(p, d, llegoAFirma || estado.compra.paso === 2); llegoAFirma = false; }
    else if (paso === 2) renderTu5(p, d);
    else renderPostula(p, d);
  }

  // Un paso pedido por su dirección: si es el actual, se muestra; si ya pasó, su resumen; si aún no llega, el actual.
  var SUBPASOS = ['datos', 'documentos', 'resultado'];
  function renderPaso(nombre, sub) {
    if (!estado.compra) { location.replace('#compra'); return; }
    var pedido = NOMBRES_PASO[nombre];
    var actual = pasoEfectivo();
    if (pedido > actual) { location.replace('#compra/' + rutaPasoActual()); return; }
    if (pedido < actual) return renderResumenPaso(pedido);
    if (pedido === 1) {
      var spPedido = SUBPASOS.indexOf(sub);
      var spActual = SUBPASOS.indexOf(subpasoPostula());
      if (spPedido === -1 || spPedido > spActual) { location.replace('#compra/' + rutaPasoActual()); return; }
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
      '<div class="acciones"><a class="btn btn-primario btn-bloque" href="#compra/' + rutaPasoActual() + '">Ir a tu paso de hoy</a></div>';
  }

  // "Mi plan" ya no existe: la compra vive en Mi camino y las inversiones en su pestaña.
  function renderMisProyectos() {
    if (estado.compra) renderMiCompra();
    else location.hash = '#compra';
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
      listaUF: r ? r.hasta : undefined,
      rshTramo: estado.rshTramo || undefined, rshSobre90: estado.rshTramo ? estado.rshTramo > 90 : undefined
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
      : '<span class="chip chip-propuesta">Propuesta para Bci</span>';
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
        '<a class="btn btn-secundario-dark btn-bloque" href="#compra/ficha/' + id + '">Ver cómo funciona</a></li>';
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
      { clave: 'cuotas', icono: 'i-documento', nombre: 'Deudas', monto: m.otras },
      { clave: 'arriendo', icono: 'i-llave', nombre: 'Arriendo', monto: m.arriendo },
      { clave: 'queda', icono: 'i-persona', nombre: 'Te queda', monto: Math.max(0, m.queda) }
    ].filter(function (t) { return t.monto > 0; });
    var alerta = !m.alcanzaParaVivir;
    var etiqueta = tramos.map(function (t) { return t.nombre + ' ' + Math.round(100 * t.monto / total) + ' %'; }).join(', ');
    return '<section class="tarjeta bloque tu-mes" id="tu-mes" aria-labelledby="titulo-tu-mes">' +
      '<h2 class="h4" id="titulo-tu-mes">Tu mes</h2>' +
      '<p class="etiqueta">Te queda para tus gastos del mes</p>' +
      '<strong class="numero display-3' + (alerta ? ' numero-alerta' : '') + '">' + formatoPesos(m.queda) + '</strong>' +
      '<div class="barra-mes" role="img" aria-label="De su ingreso: ' + etiqueta + '. Mínimo para vivir: 40 %.">' +
        tramos.map(function (t) {
          return '<span class="tramo tramo-' + t.clave + (alerta && t.clave === 'queda' ? ' tramo-alerta' : '') + '" style="flex-basis:' + (100 * t.monto / total).toFixed(2) + '%"></span>';
        }).join('') +
        '<span class="marca-40" aria-hidden="true"><span>Mínimo 40 % para gastos</span></span>' +
      '</div>' +
      (alerta ? '<p class="aviso aviso-alerta aviso-icono">' + icono('i-alerta') + '<span><strong>Ojo:</strong> ' + motivoNoConviene(n.evaluacion) + '</span></p>' : '') +
      '<ul class="leyenda-mes">' + tramos.map(function (t) {
        return '<li><span class="punto tramo-' + t.clave + '" aria-hidden="true"></span>' + icono(t.icono) + '<span>' + t.nombre + '</span><strong>' + formatoPesos(t.monto) + '</strong></li>';
      }).join('') + '</ul>' +
      '<ul class="datos-inversion"><li><span>Te prestan hasta</span><strong>' +
        formatoRedondeado(ufAPesos(capacidadCompraUF(estado.sueldoPropio, estado.sueldoPareja, estado.modo) || 0)) + '</strong></li></ul>' +
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
  function usadoMeta() { return !estado.compra && estado.caminoElegido === 'usados' && !!estado.usadoElegido; }
  function fotoPasos() {
    var ps = estado.pasos, c = estado.compra, meta = metaPie();
    var paso = c ? pasoEfectivo() : 0;
    var preaprobado = !!ps.preaprobado || !!(c && c.carga && c.respuestaLista !== false);
    return {
      grupo: !esArriendo() && esGrupo(), numeros: !!(estado.preguntasListas && rangoActual()),
      cuentaVivienda: !!ps.cuentaVivienda || estado.ahorroIniciado,
      ahorrado: ahorradoTuPie(meta), meta: meta,
      // S32-B9: el usado (crédito tradicional) no es un proyecto: su reserva y su escritura se marcan aparte (simulado).
      // S32-B9 (D5): la compra nace al elegir el departamento; «asegurado» es cuando ya pasaste de la postulación (reserva y promesa).
      // S33-C0: en grupo, la aprobación final va después de juntar el pie (paso 3 de la compra).
      preaprobado: preaprobado, asegurado: !!(c && c.carga && paso >= (c.sinGrupo || !esGrupo() ? 2 : 3)) || (usadoMeta() && !!ps.usadoReservado),
      esTuyo: paso === 4 || (esArriendo() && !!ps.arriendoTuyo) || (usadoMeta() && !!ps.usadoTuyo),
      ds1: ds1Mision(), rsh: !!ps.rsh, ds1Postulado: !!ps.ds1Postulado,
      ds1Elegido: !!(piezasOn().subsidio || ps.ds1Agregado || ps.ds1Postulado || ps.rsh),
      fogaes: !!ps.fogaesAgregado && estado.caminoElegido !== 'familiar-vivir', fogaesCalifica: !!ps.fogaesCalifica, documentos: !!ps.documentos || preaprobado,
      bajoLlave: !!ps.bajoLlave, ahorroAutomatico: !!estado.cuotaAutomatica, equipo: estado.equipo.length > 0,
      eligio: !!c || (esArriendo() && !!estado.arriendoElegido) || (estado.caminoElegido === 'usados' && !!estado.usadoElegido), cuotaPendiente: false,
      // 9-nov: arriendo con opción de compra.
      arriendo: esArriendo(), entrada: esArriendo() ? arriendoActual().a.entrada : 0,
      contratoArriendo: !!ps.contratoArriendo,
      // 20-nov: garantía de un familiar.
      familiar: !!(CAMINOS[estado.caminoElegido] && CAMINOS[estado.caminoElegido].familiar) && !esArriendo(),
      tasa: !!ps.tasaAgregado && estado.modo === 'vivir', tasaPedido: !!ps.tasaPedido || preaprobado, garantiaFamiliar: !!ps.garantiaFamiliar,
      // S28: con el camino ya elegido, la misión pide solo el departamento.
      caminoElegido: !!estado.caminoElegido
    };
  }
  function nombreCaminoActual() {
    var p = proyectoCompra();
    if (p) return enGrupoDe(p) ? CAMINOS['grupo-' + (estado.modo === 'vivir' ? 'vivir' : 'invertir')].corto : CAMINOS[(CAMINOS[estado.caminoElegido] && CAMINOS[estado.caminoElegido].familiar) ? estado.caminoElegido : estado.modo === 'vivir' ? 'individual-vivir' : 'individual-invertir'].corto;
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
  // S34: tu pie ya no se dibuja como un edificio (se confundía con tu edificio real): es una alcancía,
  // como el ícono de la pestaña «Tu pie», que se llena con lo que llevas.
  function fraccionPie(o) { return o.etapa === 'listo' ? 1 : o.total ? Math.min(1, (o.listas + (o.parcial || 0)) / o.total) : 0; }
  function textoEtapaPie(o) {
    if (o.etapa === 'listo') return '¡Tu pie está listo!';
    // S35 (19-nov, Bárbara): el pie vuelve a ser un edificio en obra (S34 lo había cambiado por una alcancía).
    if (o.etapa === 'terreno') return 'Tu edificio espera tu primer depósito';
    return 'Tu edificio va en el ' + Math.round(fraccionPie(o) * 100) + NBSP + '%';
  }
  var idAlcancia = 0;
  // S35: ya no se usa (el pie vuelve a ser un edificio en obra); se deja por si se quiere volver.
  function alcanciaSvg(o) {
    var f = fraccionPie(o), id = 'alc-' + (++idAlcancia);
    var nivel = Math.round(102 - f * 72);
    var cuerpo = '<ellipse cx="76" cy="66" rx="50" ry="36"/><rect x="116" y="55" width="22" height="22" rx="8"/>' +
      '<path d="M86 36L98 18L108 40Z"/><rect x="46" y="92" width="13" height="16" rx="3"/><rect x="90" y="92" width="13" height="16" rx="3"/>';
    return '<svg class="obra-svg alcancia-svg" viewBox="0 0 160 116" aria-hidden="true">' +
      '<defs><clipPath id="' + id + '">' + cuerpo + '</clipPath></defs>' +
      '<g fill="#FFFFFF">' + cuerpo + '</g>' +
      '<g clip-path="url(#' + id + ')"><rect class="alcancia-nivel" x="0" y="' + nivel + '" width="160" height="' + (116 - nivel) + '" fill="#FFE300"/>' +
        (f > 0 && f < 1 ? '<path d="M0 ' + nivel + 'q20 -5 40 0t40 0t40 0t40 0" fill="#FFF499"/>' : '') + '</g>' +
      '<g fill="none" stroke="#1B3A63" stroke-width="3" stroke-linejoin="round">' + cuerpo + '<path d="M26 62q-12 -2 -8 -12"/></g>' +
      '<rect x="64" y="33" width="24" height="5" rx="2.5" fill="#1B3A63"/><circle cx="110" cy="58" r="3.5" fill="#1B3A63"/>' +
      '<circle cx="124" cy="66" r="2" fill="#1B3A63"/><circle cx="131" cy="66" r="2" fill="#1B3A63"/>' +
      (f < 1 ? '<g class="alcancia-moneda"><circle cx="76" cy="14" r="9" fill="#FFE300" stroke="#8A6D00" stroke-width="2"/><path d="M76 9v10" stroke="#8A6D00" stroke-width="2"/></g>' : '') +
    '</svg>';
  }
  function obraSvg(o) {
    var antes = estado.construido;
    var nuevaDesde = antes === null || antes > o.listas ? o.listas : antes;
    if (antes !== o.listas) { estado.construido = o.listas; guardarEstado(); }
    var terminado = o.etapa === 'listo';
    // 11-nov (test): la viga baja solo hasta el techo de lo que va construido (antes atravesaba el edificio).
    var arriba = Math.max(o.listas - 1, o.parcial > 0 ? o.listas : 0);
    var techoY = arriba < 1 ? 124 : 124 - (Math.floor((arriba - 1) / 7) + 1) * ALTO_PISO;
    var baja = Math.max(0, Math.round(techoY - 50));
    var grua = o.etapa !== 'terreno' && !terminado
      // 10-nov: grúa torre (mástil reticulado, pluma, contrapeso y una viga colgando) para que no parezca el juego del ahorcado.
      ? '<g class="cn-grua">' +
          '<path d="M202 130V26M210 130V26"/>' +
          '<path class="cn-grua-fina" d="M202 130L210 120M202 120L210 110M202 110L210 100M202 100L210 90M202 90L210 80M202 80L210 70M202 70L210 60M202 60L210 50M202 50L210 40M202 40L210 30"/>' +
          '<path d="M120 20H224M120 26H212M120 20v6"/>' +
          '<path class="cn-grua-fina" d="M122 26l6-6l6 6l6-6l6 6l6-6l6 6l6-6l6 6l6-6l6 6l6-6l6 6l6-6l6 6l6-6M206 12L124 20M206 12L224 20M206 12V20"/>' +
          '<rect class="cn-grua-cabina" x="211" y="27" width="8" height="7" rx="1"/>' +
          '<rect class="cn-grua-peso" x="214" y="21" width="10" height="9" rx="1"/>' +
          // 10-nov: la grúa trabaja: el carro corre por la pluma y baja la viga hacia el edificio, y vuelve a subir.
          '<g class="cn-grua-carro" style="--baja:' + baja + 'px;--escala:' + ((12 + baja) / 12).toFixed(2) + '"><rect class="cn-grua-trolley" x="157" y="25" width="8" height="3" rx="1"/>' +
            '<path class="cn-grua-cable" d="M161 28v12"/>' +
            '<rect class="cn-grua-viga" x="150" y="40" width="22" height="4" rx="1"/></g>' +
        '</g>' : '';
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

  // 11-nov: Tus pasos dice, explícito, qué camino sigues (o cuál se usa si aún no eliges).
  function idCaminoPasos() {
    var p = proyectoCompra();
    if (p) return enGrupoDe(p) ? (estado.modo === 'vivir' ? 'grupo-vivir' : 'grupo-invertir') : ((CAMINOS[estado.caminoElegido] && CAMINOS[estado.caminoElegido].familiar) ? estado.caminoElegido : estado.modo === 'vivir' ? 'individual-vivir' : 'individual-invertir');
    if (estado.caminoElegido && CAMINOS[estado.caminoElegido]) return estado.caminoElegido;
    return null;
  }


  // 11-nov: cada misión del paso se puede apretar; "Ir" abre la pantalla para hacerla.
  function filaMisionIr(x) {
    return '<li><button type="button" class="mision-ir' + (x.hecho ? ' hecha' : '') + '" data-mision="' + x.id + '" aria-haspopup="dialog">' +
      '<span class="mision-ir-estado" aria-hidden="true">' + (x.hecho ? '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : '') + '</span>' +
      '<span class="mision-ir-texto"><strong>' + x.titulo + '</strong>' +
        '<small>' + (x.fecha && !x.hecho ? '<span' + (diasEntre(hoyDemo(), x.fecha) <= 30 ? ' class="vence"' : '') + '>' + textoVence(x.fecha) + '</span>' + SEP : '') + x.etiqueta + '</small></span>' +
      '<span class="mision-ir-accion">' + (x.hecho ? 'Lista' : 'Ir ›') + '</span></button></li>';
  }

  // S27-B1 (test del 12-nov: 10 % de éxito en "la misión que vence primero"): las misiones con fecha
  // van en su propio bloque, arriba y en cualquier paso, ordenadas por vencimiento. La primera lleva el sello.
  function filaConFecha(x, i) {
    var d = diasEntre(hoyDemo(), x.fecha), f = new Date(x.fecha + 'T00:00:00');
    var cuando = d === 0 ? 'Vence hoy' : d === 1 ? 'Vence mañana' : 'Vence en ' + d + ' días';
    return '<li><button type="button" class="mision-fecha' + (i === 0 ? ' primero' : '') + '" data-mision="' + x.id + '" aria-haspopup="dialog">' +
      '<span class="mision-fecha-dia" aria-hidden="true"><strong>' + f.getDate() + '</strong><small>' + MESES[f.getMonth()].slice(0, 3) + '</small></span>' +
      '<span class="mision-ir-texto">' + (i === 0 ? '<span class="sello-vence">' + icono('i-calendario') + 'Vence primero</span>' : '') +
        '<strong>' + x.titulo + '</strong><small>' + cuando + '<span class="oculto-visual">, el ' + fechaCorta(x.fecha) + '</span></small></span>' +
      '<span class="mision-ir-accion">Ir ›</span></button></li>';
  }
  function bloqueConFecha(lista) {
    if (!lista.length) return '';
    // S30-B4: sin tarjeta contenedora ni título visible: la fila amarilla "Vence primero" es lo primero que se ve.
    // Los términos (DS1, Registro Social) se explican dentro de la misión, que es lo que se toca.
    return '<section class="con-fecha" aria-labelledby="titulo-con-fecha">' +
      '<h2 id="titulo-con-fecha" class="oculto-visual">Con fecha</h2>' +
      '<ul class="lista-misiones">' + lista.map(filaConFecha).join('') + '</ul></section>';
  }

  var pasoElegido = null, listosVistos = null;
  var CORTO_HITO = { camino: 'Camino', depto: 'Depto', numeros: 'Números', cuenta: 'Cuenta', pie: 'Pie', preaprobacion: 'Pre\u00ADapro\u00ADbación', asegurar: 'Reserva', aprobacion: 'Apro\u00ADbación', 'es-tuyo': 'Firma', entrada: 'Entrada', contrato: 'Te mudas' };
  var TEXTO_HITO = {
    camino: 'Comparas los caminos con tus números y eliges cómo comprar.',
    depto: 'Eliges el departamento que quieres. No lo reservas: con él calculamos tu fecha.',
    numeros: 'Con tus sueldos y tu ahorro calculamos cuándo llegas.',
    cuenta: 'Tu cuenta de ahorro en Bci, en UF. Todo tu pie pasa por ella.',
    pie: 'Lo juntas cada mes en tu cuenta de vivienda.',
    preaprobacion: 'Bci revisa tus sueldos y te dice cuánto te presta.',
    asegurar: 'Visitas tu departamento, lo reservas y firmas la promesa.',
    aprobacion: 'Bci tasa tu departamento y confirma el crédito. No envías nada de nuevo.',
    'es-tuyo': 'Firmas la escritura, se inscribe a tu nombre y recibes las llaves.',
    entrada: 'Juntas el 5' + NBSP + '% en tu cuenta de vivienda para entrar.',
    contrato: 'Firmas el contrato con el precio fijo en UF y te mudas.'
  };
  var TEXTO_HITO_ARRIENDO = {
    pie: 'Cada mes, el aporte de tu mensualidad va a tu pie.',
    preaprobacion: 'Del tercer año, Bci revisa tus sueldos y te presta el 80' + NBSP + '%.',
    'es-tuyo': 'Le compras el departamento al socio y pasa a tu nombre.'
  };
  var TEXTO_HITO_GRUPO = {
    depto: 'Eliges el edificio y te unes al grupo. No pagas nada todavía.',
    preaprobacion: 'Bci revisa tus sueldos y aseguras tu cupo en el grupo.',
    pie: 'Lo pagas en cuotas mientras se construye el edificio. Si cuando terminen todavía te falta, sigues pagando hasta juntarlo.'
  };
  function textoHito(id, grupo) { return (esArriendo() && TEXTO_HITO_ARRIENDO[id]) || (grupo && TEXTO_HITO_GRUPO[id]) || TEXTO_HITO[id] || ''; }
  // Las misiones como en el canvas: círculo de color con ícono, título, fecha en rojo y chip azul.
  var ICONOS_MISION = [
    ['rojo', 'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4'],
    ['azul', 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'],
    ['verde', 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4']
  ];
  function tarjetaMision(x, k) {
    // 9-nov (colores): rojo solo si vence en menos de 30 días; el resto, azul.
    var urgente = x.fecha && diasEntre(hoyDemo(), x.fecha) >= 0 && diasEntre(hoyDemo(), x.fecha) <= 30;
    var ic = urgente ? ICONOS_MISION[0] : ['azul', ICONOS_MISION[1 + (k % 2)][1]];
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

  // S31-A: ¿Listo para el banco? Lo que el banco revisa, con qué falta y cuándo se cumple.
  function creditoNecesarioRango() {
    var r = rangoActual();
    if (!r) return 0;
    return r.hasta * (estado.modo === 'arrendar' ? MODOS.arrendar.credito : MODOS.vivir.credito);
  }
  function revisarBanco() {
    return listoParaBanco({ contrato: estado.contrato, mesesTrabajo: estado.mesesTrabajo, deudasAtrasadas: estado.deudasAtrasadas,
      sueldoPropio: estado.sueldoPropio, sueldoPareja: estado.sueldoPareja, otrasCuotas: estado.otrasCuotas }, creditoNecesarioRango());
  }
  var ICONO_BANCO = { ok: 'i-check', ojo: 'i-alerta', falta: 'i-no', pendiente: 'i-pronto' };
  var PALABRA_BANCO = { ok: 'Listo', ojo: 'Ojo', falta: 'Falta', pendiente: 'Cuéntanos' };
  function listaBanco(rb, documentos) {
    var items = rb.items.concat([{ id: 'documentos', estado: documentos ? 'ok' : 'pendiente', titulo: 'Tus documentos',
      detalle: documentos ? 'Tu carpeta está lista.' : 'Liquidaciones, AFP, contrato y carnet.' }]);
    return '<ul class="banco-lista">' + items.map(function (x) {
      return '<li class="banco-item ' + x.estado + '">' + icono(ICONO_BANCO[x.estado], 'banco-icono') +
        '<span><strong>' + x.titulo + '<span class="oculto-visual">: ' + PALABRA_BANCO[x.estado] + '</span></strong><small>' + x.detalle + '</small></span></li>';
    }).join('') + '</ul>';
  }
  // S31-B: del sí del banco a las llaves, con el paso actual marcado.
  // soloMirar: el paso todavía no llega; se marca dónde va, sin dar por hechos los anteriores.
  function lineaSiALlaves(actual, soloMirar) {
    // S34: la lista de 7 trámites no son «pasos» tuyos: va rotulada como lo que pasa por dentro.
    var intro = !soloMirar && actual >= 4 && actual < DE_SI_A_LLAVES.length
      ? 'Mientras juntabas tu pie, la inmobiliaria y Bci hicieron los primeros trámites por ti. Te falta firmar.'
      : 'Por dentro: los trámites de este tramo y quién los hace.';
    return '<p class="llaves-intro">' + intro + '</p><ol class="llaves-linea">' + DE_SI_A_LLAVES.map(function (x, i) {
      var listo = !soloMirar && i < actual; // si solo se mira, ninguno anterior queda como hecho
      var cls = listo ? 'hecho' : (i === actual ? 'actual' : '');
      return '<li class="' + cls + '"' + (i === actual ? ' aria-current="step"' : '') + '><span class="llaves-punto" aria-hidden="true">' + (listo ? icono('i-check') : (i + 1)) + '</span>' +
        '<span><strong>' + x.titulo + '</strong><small>' + x.quien + (x.plazo ? SEP + x.plazo : '') + '</small>' +
        (i === actual ? '<small class="llaves-texto">' + x.texto + '</small>' : '') + '</span></li>';
    }).join('') + '</ol>' +
    '<p class="llaves-total">En total, unos ' + TOTAL_SI_A_LLAVES + '. Tasación, abogados, notaría y Conservador ya van en tus gastos.</p>';
  }

  // El pie de la compra está listo, pero falta la entrega del edificio (o los meses de la cuenta).
  function esperaEntrega(s) {
    var c = estado.compra, pc = proyectoCompra();
    return !!(c && pc && c.carga && (c.paso || 1) === 2 && hitoHecho('pie', s) && esperaMinima(pc).meses > 0);
  }
  function abrirHito(id, boton) {
    var s = fotoPasos();
    var h = hitoActual(s).hitos.filter(function (x) { return x.id === id; })[0] ||
      // S32-B3: la cuenta ya no es un paso, pero una misión la puede pedir.
      { id: id, nombre: id === 'cuenta' ? 'Tu cuenta de vivienda' : (typeof HITOS !== 'undefined' && HITOS[id] ? HITOS[id].nombre : id), estado: hitoHecho(id, s) ? 'hecho' : 'actual' };
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
        accion = hecho ? '' : (!ar.elegido ? enlaceHoja('#compra/caminos/arriendo-opcion', 'Elegir departamento') : botonEnHoja('btn-hito-accion', 'Firmar y mudarme'));
      } else if (id === 'preaprobacion') {
        texto = 'Desde el tercer año y con tu pie listo, Bci revisa tus sueldos y te presta el 80' + NBSP + '% (sin subsidio a la tasa).';
        accion = hecho ? '' : botonEnHoja('btn-hito-accion', 'Pedir mi preaprobación');
      } else {
        texto = 'Le compras el departamento al socio al precio fijo. Firmas la escritura y pasa a tu nombre.';
        accion = hecho ? '' : botonEnHoja('btn-hito-accion', 'Firmar la escritura');
      }
    } else if (id === 'camino') {
      // S32-B3: el primer paso: comparar y elegir cómo comprar.
      var cc = estado.caminoElegido && CAMINOS[estado.caminoElegido];
      texto = hecho && cc ? 'Vas por ' + primeraMinuscula(cc.corto) + '. Puedes compararlo con los otros cuando quieras.'
        : 'Hay varios caminos para tu primera vivienda. Compáralos con tus números y elige uno: tus pasos se arman según el camino.';
      accion = estado.modo === 'vivir' ? enlaceHoja('#departamentos', hecho ? 'Ver los caminos en Departamentos' : 'Elegir en Departamentos') : enlaceHoja('#compra/caminos', hecho ? 'Comparar caminos' : 'Comparar y elegir');
    } else if (id === 'depto') {
      // D5: el departamento que eliges aquí es tu meta; reservarlo es un paso después.
      var uz = USADOS.filter(function (u) { return u.id === estado.usadoElegido; })[0];
      var pd = s.arriendo ? (ar && ar.elegido ? ar.u : null) : estado.caminoElegido === 'usados' && uz ? { nombre: 'el departamento en ' + uz.comuna } : proyectoCompra();
      texto = hecho && pd ? 'Elegiste ' + esc(pd.nombre) + '. Con él calculamos tu fecha; todavía no lo reservas.'
        : (s.grupo ? 'Eliges el edificio y te unes al grupo. No pagas nada todavía.' : 'Eliges el departamento que quieres. No lo reservas: con él calculamos tu fecha.');
      accion = enlaceHoja(rutaElegir(), hecho ? 'Ver otros departamentos' : 'Elegir mi departamento');
    } else if (id === 'numeros') {
      texto = 'Con tus sueldos y tu ahorro calculamos cuándo llegas.';
      accion = hecho ? botonEnHoja('btn-hito-accion', 'Cambiar mis números') : enlaceHoja('#compra', 'Contar mis números');
    } else if (id === 'cuenta') {
      texto = 'Una cuenta de ahorro para la vivienda en Bci, en UF. Todo tu pie pasa por ella y el DS1 la pide.';
      accion = hecho ? '' : botonEnHoja('btn-hito-accion', 'Abrir mi cuenta');
    } else if (id === 'pie') {
      texto = s.grupo ? 'Pagas tu pie en cuotas durante la obra, en una cuenta bloqueada a tu nombre.' : 'Lo juntas cada mes en tu cuenta de vivienda.';
      var pc = proyectoCompra();
      if (pc && pc.tipo === 'conjunto') texto += '</p>' + obraVisual(pc) + '<p class="texto-apoyo">';
      // D3: la cuenta de vivienda es la primera acción de juntar el pie.
      if (!s.cuentaVivienda) texto += '</p><p class="texto-apoyo">' + (s.grupo ? 'Primero abre tu cuenta en Bci: ahí pagas tus cuotas mientras se construye.' : 'Primero abre tu cuenta de vivienda en Bci: todo tu pie pasa por ella y el DS1 la pide.');
      accion = !s.cuentaVivienda ? botonEnHoja('btn-hito-accion', 'Abrir mi cuenta') : enlaceHoja(rutaTuPie(), 'Ver tu pie');
    } else if (id === 'preaprobacion') {
      var pr = preaprobacion(estado.sueldoPropio, estado.sueldoPareja, estado.otrasCuotas);
      texto = (s.grupo ? 'Bci revisa tus sueldos y aseguras tu cupo en el grupo.' : 'Bci revisa tus sueldos. Pídela con tu pie casi listo: la preaprobación vence.') +
        (pr && pr.cumple ? '</p><p class="texto-apoyo">Bci te podría prestar hasta <strong>' + formatoRedondeado(ufAPesos(pr.creditoUF)) + '</strong>' + SEP + 'simulado' : '');
      // S28-B4: sin callejón. Si faltan datos o documentos, la hoja los resuelve aquí mismo.
      // S31-A: antes de pedir, "¿Listo para el banco?": lo que el banco revisa, para no recibir un no.
      var rb = revisarBanco();
      var faltaPre = !s.numeros ? 'numeros' : (rb.pendiente ? 'datos' : (!s.documentos ? 'documentos' : ''));
      // S32-B7: con departamento meta (D5) también se muestra la lista antes de postular.
      if (!hecho) {
        texto += '</p><h3 class="h4 banco-titulo">¿Listo para el banco?</h3>' + listaBanco(rb, s.documentos) +
          (rb.falta ? '<p class="aviso aviso-alerta aviso-icono">' + icono('i-alerta') + 'Hoy el banco te diría que no. ' +
            (rb.cumpleEnMeses ? 'Pídela en ' + plural(rb.cumpleEnMeses, 'mes', 'meses') + '.' : 'Resuelve lo marcado primero.') + '</p>' : '') +
          '<p class="texto-apoyo">';
      }
      accion = hecho ? '' : (c && (!c.carga || c.respuestaLista === false) ? enlaceHoja('#compra/' + rutaPasoActual(), c.carga ? 'Ver tu solicitud' : 'Pedir mi preaprobación')
        : botonEnHoja('btn-hito-accion', faltaPre === 'numeros' ? 'Completar mis sueldos' : faltaPre === 'datos' ? 'Completar mis datos' : faltaPre === 'documentos' ? 'Subir mis documentos' : 'Pedir mi preaprobación'));
    } else if ((id === 'asegurar' || id === 'aprobacion' || id === 'es-tuyo') && !hecho && esperaEntrega(s)) {
      // S33-C9: tu pie está listo, pero el edificio todavía no se entrega. Se puede avanzar el tiempo (simulación).
      var pE = proyectoCompra(), mE = esperaMinima(pE).meses;
      texto = 'Tu pie está listo. Bci confirma tu crédito y firmas cuando terminen tu edificio: aprox. en ' + fechaLlaves(mE, hoyDemo()) + '.';
      accion = botonEnHoja('btn-hito-accion', 'Avanzar hasta la entrega (simulación)');
    } else if (id === 'asegurar' || id === 'aprobacion') {
      texto = id === 'asegurar' ? 'Visitas tu departamento, lo reservas y firmas la promesa.' : 'Bci confirma tu crédito con la tasación del departamento.';
      // S31-B: lo que sigue hasta las llaves, con quién hace cada paso.
      texto += '</p>' + lineaSiALlaves(id === 'asegurar' ? (hecho ? 1 : 0) : (hecho ? 4 : 1), h.estado === 'pendiente') + '<p class="texto-apoyo">';
      accion = hecho ? '' : usadoMeta() ? (s.preaprobado ? botonEnHoja('btn-hito-accion', 'Reservar y firmar la promesa') : '') : (c ? enlaceHoja('#compra/' + rutaPasoActual(), 'Seguir mi compra')
        : (estado.caminoElegido ? enlaceHoja(rutaElegir(), 'Elegir departamento') : enlaceHoja('#compra/caminos', 'Comparar caminos')));
    } else {
      texto = 'Firmas la escritura, se inscribe a tu nombre y recibes las llaves.</p>' + lineaSiALlaves(hecho ? DE_SI_A_LLAVES.length : 4, h.estado === 'pendiente') + '<p class="texto-apoyo">';
      accion = c && pasoEfectivo() >= 3 ? enlaceHoja('#compra/' + rutaPasoActual(), hecho ? 'Ver mi departamento' : 'Preparar mi firma')
        : usadoMeta() && !hecho && s.asegurado ? botonEnHoja('btn-hito-accion', 'Firmar la escritura') : '';
    }
    // S31: un paso que viene después se puede mirar, pero no se hace antes de tiempo (salvo completar tus datos).
    if (h.estado === 'pendiente' && !(id === 'preaprobacion' && (faltaPre === 'datos' || faltaPre === 'numeros'))) accion = '';
    abrirHojaContenido(h.nombre + (hecho ? ' ' + icono('i-check', 'hoja-check') : ''),
      '<p class="texto-apoyo">' + texto + '</p>' +
      (!hecho && h.estado === 'pendiente' ? '<p class="texto-apoyo"><small>Va después de ' + hitoActual(s).nombre.toLowerCase() + '.</small></p>' : '') +
      (accion ? '<div class="acciones">' + accion + '</div>' : ''), boton, function () {
        var b = $('btn-hito-accion');
        if (!b) return;
        b.addEventListener('click', function () {
          if (esperaEntrega(s) && (id === 'asegurar' || id === 'aprobacion' || id === 'es-tuyo')) {
            var mz = esperaMinima(proyectoCompra()).meses;
            estado.mesAhorro = (estado.mesAhorro || 0) + mz;
            guardarEstado(); cerrarHoja(false);
            toast('Pasaron ' + plural(mz, 'mes', 'meses') + ': entregaron tu edificio (simulado).');
            mostrar();
          }
          else if (id === 'numeros') { cerrarHoja(false); abrirMisDatos(boton); }
          else if (id === 'cuenta' || id === 'entrada' || id === 'pie') marcarPaso('cuentaVivienda', textoCuentaAbierta());
          else if (id === 'contrato') {
            if (!hitoHecho('entrada', s)) { toast('Primero: junta el 5 % para entrar.'); return; }
            estado.mesContrato = estado.mesAhorro || 0;
            marcarPaso('contratoArriendo', 'Firmaste y te mudaste (simulado).');
          } else if (id === 'asegurar' && usadoMeta()) marcarPaso('usadoReservado', 'Reservaste tu departamento y firmaste la promesa (simulado).');
          else if (id === 'es-tuyo' && usadoMeta()) { marcarPaso('usadoTuyo', '¡Es tuyo! Firmaste la escritura (simulado).'); confeti(); }
          else if (id === 'es-tuyo' && s.arriendo) {
            if (!s.preaprobado) { toast('Primero: tu preaprobación.'); return; }
            marcarPaso('arriendoTuyo', '¡Es tuyo! (simulado)');
          }
          else if (id === 'preaprobacion') {
            if (!s.numeros) { cerrarHoja(false); abrirMisDatos(boton); return; }
            var rbb = revisarBanco();
            if (rbb.pendiente) { cerrarHoja(false); abrirMisDatos(boton); return; }
            if (!s.documentos) {
              estado.pasos.documentos = true; guardarEstado();
              mostrar();
              toast('Documentos listos (simulado).');
              abrirHito('preaprobacion', null);
              return;
            }
            if (rbb.falta) { toast('Primero resuelve lo marcado en rojo.'); return; }
            if (s.arriendo && !hitoHecho('pie', s)) { toast('Primero: junta tu pie.'); return; }
            if (s.arriendo && (estado.mesAhorro || 0) - (estado.mesContrato || 0) < ARRIENDO_OPCION.compraDesdeMes) { toast('Puedes comprar desde el tercer año de contrato.'); return; }
            marcarPaso('preaprobado', 'Bci te preaprobó (simulado).');
          }
        });
      }, ar && id === 'entrada' ? { confirmacion: true } : undefined); // S36 (lienzo P65): la entrada del 5 % es una ventana chica sobre Tu compra.
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
          '<span><strong>' + c.titulo + (c.propuesta ? '<span class="chip-propuesta-mini">Propuesta para Bci</span>' : '') + '</strong>' +
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
  // 11-nov (test): este mes se puede depositar más o menos que la cuota sugerida.
  var montoMesElegido = null, ultimoPagoMonto = null;
  function montoMes() { return montoMesElegido !== null ? montoMesElegido : (cuotaMes() || 0); }
  function cuotaMes() { return esArriendo() && estado.pasos.contratoArriendo ? arriendoActual().a.aporte : estado.ahorroMensual; }
  function capaIcono(activa) {
    return activa
      ? '<svg class="capa-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#28652B"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg class="capa-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="#546E7A" stroke-width="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#546E7A" stroke-width="2"/></svg>';
  }
  // S32-B6 (D9): «Si juntas al mes» en Tu pie, con su efecto en cuándo es tuyo.
  // Sin camino, la fecha es la del crédito tradicional (como arriba en Tu compra, S27-B2).
  function caminoDelPie() { return CAMINOS_COMPARAR.indexOf(estado.caminoElegido) !== -1 ? estado.caminoElegido : 'usados'; }
  function tuyoConMensual(v) { return conCambios({ ahorroMensual: v }, function () { return numerosComparar(caminoDelPie()).tuyo; }); }
  function limitesMensual() {
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var minimo = 100000, paso = 50000, maximo = Math.max(1000000, Math.ceil(ingreso * 0.4 / paso) * paso);
    return { minimo: minimo, paso: paso, maximo: maximo, valor: Math.min(maximo, Math.max(minimo, estado.ahorroMensual || 300000)) };
  }
  // 20-nov: en grupo la fecha no se mueve (todos firman el mismo día): el deslizador dice si llegas con tu pie a esa firma.
  function grupoDelPie() {
    var p = proyectoCompra();
    return p && estado.modo === 'vivir' && p.tipo === 'conjunto' && !compraSinGrupo(p) && mesesParaEntrega(p) > 0 ? p : null;
  }
  function textoPieTuyo(v, m) {
    var p = grupoDelPie();
    if (p) {
      var g = planGrupo(p);
      return g.falta === 0 || v >= g.cuota ? 'Llegas con tu pie a la firma: <strong>' + g.fecha + '</strong>'
        : 'No llegas a la firma de ' + g.fecha + ': junta <strong>' + formatoRedondeado(g.cuota) + '</strong> al mes';
    }
    return m === null ? 'Todavía no te alcanza' : 'Recibes tus llaves <strong>' + mesTuyo(m) + '</strong>';
  }
  function deslizadorPie(dentro) {
    if (estado.modo !== 'vivir' || esArriendo()) return '';
    var l = limitesMensual();
    var m = tuyoConMensual(l.valor);
    return '<' + (dentro ? 'div class="si-juntas pie-si-juntas dentro"' : 'section class="tarjeta bloque si-juntas pie-si-juntas" aria-labelledby="titulo-si-juntas"') + '>' +
      '<p class="si-juntas-fila"><label for="rango-mensual" id="titulo-si-juntas">Si juntas al mes</label><strong class="numero" id="valor-mensual">' + formatoRedondeado(l.valor) + '</strong></p>' +
      '<input type="range" id="rango-mensual" min="' + l.minimo + '" max="' + l.maximo + '" step="' + l.paso + '" value="' + l.valor + '" aria-valuetext="' + formatoRedondeado(l.valor) + ' al mes: recibes tus llaves ' + mesTuyo(m) + '">' +
      '<p class="pie-tuyo" id="pie-tuyo" aria-live="polite">' + icono('i-calendario') + '<span>' + textoPieTuyo(l.valor, m) +
        (estado.caminoElegido && CAMINOS_COMPARAR.indexOf(estado.caminoElegido) !== -1 ? '' : '<small>Con crédito tradicional</small>') + '</span></p>' +
      '<p class="delta-plazo" id="delta-plazo" aria-live="polite"></p>' +
    (dentro ? '</div>' : '</section>');
  }
  function iniciarDeslizadorPie() {
    var rm = $('rango-mensual');
    if (!rm) return;
    var l = limitesMensual();
    var base = tuyoConMensual(l.valor);
    var pintar = function () { var v = Number(rm.value); rm.style.setProperty('--lleno', ((v - l.minimo) / (l.maximo - l.minimo) * 100).toFixed(1) + '%'); return v; };
    pintar();
    rm.addEventListener('input', function () {
      var v = pintar(), m = tuyoConMensual(v);
      $('valor-mensual').textContent = formatoRedondeado(v);
      $('pie-tuyo').querySelector('span').innerHTML = textoPieTuyo(v, m);
      var dp = $('delta-plazo'); dp.innerHTML = grupoDelPie() ? '' : textoDelta(base, m);
      dp.className = 'delta-plazo' + (m !== null && base !== null && m < base ? ' sube' : m !== null && base !== null && m > base ? ' baja' : '');
      rm.setAttribute('aria-valuetext', formatoRedondeado(v) + ' al mes: recibes tus llaves ' + mesTuyo(m));
    });
    rm.addEventListener('change', function () {
      estado.ahorroMensual = Number(rm.value);
      guardarEstado();
      toast('Listo: juntas ' + formatoRedondeado(estado.ahorroMensual) + ' al mes. Tu fecha se actualizó en Tu compra.');
    });
  }
  // S33-C4: en grupo, cómo va tu grupo con sus cuotas y en qué etapa está la obra de verdad.
  function grupoEnPieHtml() {
    var pc = proyectoCompra();
    if (!pc || pc.tipo !== 'conjunto' || (estado.compra && estado.compra.sinGrupo)) return '';
    return '<section class="tarjeta tu-grupo-pie" aria-labelledby="titulo-grupo-pie">' +
      '<h2 class="h5" id="titulo-grupo-pie">Tu edificio real y tu grupo</h2>' +
      '<p class="texto-apoyo"><small>Así va la obra donde vas a vivir.</small></p>' +
      obraVisual(pc) + actividadGrupo(pc, resumen(pc)) +
      '<a class="enlace" href="#departamentos/' + esc(pc.id) + '">Ver tu edificio ›</a></section>';
  }
  function renderTuPie() {
    var cont = $('pie-contenido');
    var s = fotoPasos();
    var meta = s.meta;
    // S32-B6: Tu pie vuelve a ser pestaña (raíz, sin «Volver»). El deslizador «Si juntas al mes» vive aquí (D9).
    var volverPie = '';
    var cabeza = '<header class="encabezado">' + MARCA + '<h1 id="titulo-tu-pie" class="h2" tabindex="-1">Tu pie</h1></header>';
    if (!s.numeros) {
      cont.innerHTML = cabeza + '<p class="texto-apoyo">Primero, tus números.</p>' +
        '<div class="accion"><a class="btn btn-primario btn-lg btn-bloque" href="#compra">Contar mis números</a></div>';
      return;
    }
    if (!s.cuentaVivienda) {
      cont.innerHTML = cabeza +
        '<section class="tarjeta bloque obra-invita"><div class="obra-claro">' + obraSvg(avanceObra(0, 0, false)) + '</div>' +
          '<h2 class="h4">Empieza a llenar tu pie</h2>' +
          '<p class="texto-apoyo">Tu pie vive en una cuenta de vivienda Bci, en UF. Cada cuota suma una parte.</p></section>' +
        deslizadorPie() +
        selloProteccion(s) +
        '<div class="accion-fija"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-abrir-cuenta">Abrir mi cuenta</button></div>';
      $('btn-abrir-cuenta').addEventListener('click', function () { marcarPaso('cuentaVivienda', textoCuentaAbierta()); });
      iniciarDeslizadorPie();
      return;
    }
    var listo = meta > 0 && s.ahorrado >= meta;
    var pctPie = porcentajeEntero(avance(s.ahorrado, meta));
    var faltaM = '$' + (Math.max(0, meta - s.ahorrado) / 1e6).toFixed(1).replace('.', ',') + ' millones';
    var racha = estado.racha || 0;
    // S25: igual al canvas: el lápiz abre Tu cuota, Movimientos va en el azul y la cuota del mes flota.
    cont.innerHTML =
      volverPie + '<header class="encabezado pie-cabeza">' + MARCA + '<h1 id="titulo-tu-pie" class="h2" tabindex="-1">Tu pie</h1>' +
        '<button type="button" class="pie-lapiz" id="btn-pie-cuota" aria-haspopup="dialog" aria-label="Tu cuota y cómo ahorras"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button>' +
        '<p class="texto-apoyo">' + 'Tu cuenta de vivienda Bci' + SEP + 'en UF</p></header>' +
      '<section class="saldo-pie pie-heroe" aria-labelledby="titulo-saldo">' +
        '<div class="pie-heroe-arriba"><p class="etiqueta" id="titulo-saldo">Llevas</p>' +
          '<button type="button" class="pie-movimientos" id="btn-movimientos" aria-haspopup="dialog">Movimientos</button></div>' +
        '<div class="pie-heroe-fila"><div><strong class="numero">' + formatoPesos(s.ahorrado) + '</strong>' +
          (meta > s.ahorrado ? '<p>Te faltan ' + faltaM + ' para tu pie</p>' : '<p>¡Juntaste tu pie!</p>') + '</div>' +
          '</div>' +
        '<div class="pie-barra" aria-hidden="true"><span style="width:' + Math.max(1, pctPie) + '%"></span>' + [25, 50, 75].map(function (m) {
          return '<i style="left:' + m + '%"' + (pctPie >= m ? ' class="pasada"' : '') + '></i>'; }).join('') + '</div>' +
        '<p class="pie-barra-texto"><span>' + pctPie + NBSP + '% de ' + formatoRedondeado(meta) + '</span><span>100' + NBSP + '%</span></p>' +
        '<div class="obra-pie"><p class="obra-pie-titulo">Así se construye tu pie</p><div class="obra-claro">' + obraSvg(avanceObraDe(s)) + '</div><p class="obra-etapa">' + textoEtapaPie(avanceObraDe(s)) + '</p></div>' +
        (estado.ahorroIniciado ? '<span class="pie-racha"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>' +
          (racha > 0 ? plural(racha, 'mes seguido', 'meses seguidos') : 'Tu racha empieza este mes') + '</span>' : '') +
      '</section>' +
      // S33-C4 (E6): «Si juntas al mes» y la cuota del mes en una sola tarjeta, montada sobre el azul.
      '<section class="tarjeta pie-cuota-mes" aria-labelledby="titulo-cuota-mes">' +
        (listo ? '' : deslizadorPie(true)) +
        '<p class="pie-cuota-fila"><span id="titulo-cuota-mes">' + (pieLogro ? 'Depositaste' : (montoMesElegido !== null ? 'Depositas en ' : 'Cuota de ') + MESES[Number(hoyDemo().split('-')[1]) - 1]) + '</span><strong class="numero">' + formatoRedondeado(pieLogro && ultimoPagoMonto !== null ? ultimoPagoMonto : montoMes()) + '</strong></p>' +
        // S31: el monto del mes se cambia dentro de la transferencia.

        (listo
          ? '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-siguiente-hito">Ver tu siguiente paso</button>'
          : pieLogro
            ? '<div class="pie-listo" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#28892B"/><path d="M6.5 12.5l3.6 3.6L17.5 8.8" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '<span><strong>¡Listo! Sumaste ' + formatoRedondeado(ultimoPagoMonto !== null ? ultimoPagoMonto : cuotaMes() || 0) + '</strong><small>' + pieLogro + '</small></span></div>' +
              '<button type="button" class="enlace pie-otro-mes" id="btn-otro-mes">Simular el mes siguiente</button>'
            : '<button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-pagar-cuota">Pagar mi cuota</button>') +
      '</section>' +
      grupoEnPieHtml() +
      '<button type="button" class="tarjeta fila fila-regalo" id="btn-pedir-regalo" aria-haspopup="dialog"><span class="regalo-circulo" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="1" fill="none" stroke="#B20913" stroke-width="2"/><path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" fill="none" stroke="#B20913" stroke-width="2" stroke-linejoin="round"/></svg></span>' +
        '<span><strong>Regalo para tu pie</strong><small>Comparte un enlace con tu familia</small><span class="regalo-compartir">Compartir ›</span></span></button>' +
      // S36 (lienzo P31 y P32): cabecera azul con el escudo y las protecciones como una lista de banco (reemplaza a protegido-visual).
      '<section class="pp-protegido" aria-labelledby="titulo-protegido">' +
        '<div class="pp-cab"><svg class="pp-fondo" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/></svg>' +
          '<span class="pp-escudo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg></span>' +
          '<span><h2 id="titulo-protegido">Tu pie está protegido</h2><small>En tu cuenta de vivienda Bci, a tu nombre</small></span></div>' +
        '<ul class="pp-lista">' +
          '<li><span class="pp-icono verde" aria-hidden="true"><b>UF</b></span>' +
            '<span class="pp-texto"><strong>En UF</strong><small>Sube con los precios: tu pie no pierde valor.</small></span>' +
            '<span class="pp-siempre">' + icono('i-check') + 'Siempre</span></li>' +
          '<li><span class="pp-icono azul" aria-hidden="true">' + icono('i-candado') + '</span>' +
            (s.grupo
              ? '<span class="pp-texto"><strong>Bloqueado hasta la firma</strong><small>Nadie lo saca hasta la escritura. Si Bci no aprueba, vuelve entero.</small></span><span class="pp-siempre">' + icono('i-check') + 'Siempre</span>'
              : '<span class="pp-texto"><strong>Bajo llave</strong><small>Avisas 30 días antes de sacarlo. Así no lo gastas por impulso.</small></span>' +
                '<button type="button" class="pp-interruptor" role="switch" id="btn-activar-llave" aria-checked="' + !!s.bajoLlave + '"' + (s.bajoLlave ? ' disabled' : '') + ' aria-label="Bajo llave"><span></span></button>') +
          '</li>' +
        '</ul>' +
      '</section>';
    $('btn-pedir-regalo').addEventListener('click', function () { abrirPedirRegalo($('btn-pedir-regalo')); });
    iniciarDeslizadorPie();
    if ($('btn-activar-llave')) $('btn-activar-llave').addEventListener('click', function () { marcarPaso('bajoLlave', 'Tu pie quedó bajo llave (simulado).'); });
    $('btn-movimientos').addEventListener('click', function () {
      abrirHojaContenido('Movimientos', movimientosPie(), $('btn-movimientos'));
    });
    var pagar = function (pago) {
      var hoyAntes = hoyDemo();
      if (!estado.ahorroIniciado) { estado.ahorrado = Math.min(meta, estado.ahorroActual || 0); estado.ahorroIniciado = true; }
      var antes = hitosAlcanzados(estado.ahorrado, meta);
      if (pago) { ultimoPagoMonto = montoMes(); estado.ahorrado = sumarMes(estado.ahorrado, ultimoPagoMonto, meta); montoMesElegido = null; }
      var r = registrarMes({ mes: estado.mesAhorro, racha: estado.racha, ultimoProtector: estado.ultimoProtector }, pago);
      estado.mesAhorro = r.mes; estado.racha = r.racha; estado.ultimoProtector = r.ultimoProtector;
      estado.historialMeses = (estado.historialMeses || []).concat([r.resultado]).slice(-6);
      guardarEstado();
      // S34: cada cuota adelanta un mes (simulación): se dice, y si con eso cerró el DS1, también.
      var fAntes = new Date(hoyAntes), fAhora = new Date(hoyDemo());
      avisoTiempo = 'Simulación: con cada cuota pasa un mes. Ahora estás en ' + MESES[fAhora.getMonth()] + '.';
      var sF = fotoPasos();
      if (sF.ds1 && sF.caminoElegido && !sF.ds1Postulado && diasHastaFecha(FECHAS_IMPORTAN[0].fecha, fAntes) >= 0 && diasHastaFecha(FECHAS_IMPORTAN[0].fecha, fAhora) < 0)
        avisoTiempo += ' Cerró la postulación al DS1 de ' + MESES[new Date(FECHAS_IMPORTAN[0].fecha + 'T00:00:00').getMonth()] + ': queda el próximo llamado.';
      var nuevos = hitosAlcanzados(estado.ahorrado, meta).filter(function (h) { return antes.indexOf(h) === -1; });
      if (pago) pieLogro = nuevos.length ? '¡Pasaste el ' + porcentajeEntero(nuevos[nuevos.length - 1]) + NBSP + '% de tu pie!' : 'Llevas ' + plural(estado.racha, 'mes seguido', 'meses seguidos');
      // 9-nov: la pantalla se queda donde estaba (antes bajaba al enfocar "Simular el mes siguiente").
      var y = window.scrollY;
      cerrarHoja(false);
      renderTuPie();
      window.scrollTo(0, y);
      if (!pago) { toast((r.resultado === 'protector' ? 'Usaste tu protector: tu racha sigue.' : 'Tu racha empieza de nuevo. Tu ahorro sigue.') + ' ' + avisoTiempo); avisoTiempo = ''; }
      else if (nuevos.length) { confeti(); if (navigator.vibrate) navigator.vibrate(40); }
      if ($('btn-otro-mes')) $('btn-otro-mes').focus({ preventScroll: true });
    };
    if ($('btn-pagar-cuota')) $('btn-pagar-cuota').addEventListener('click', function () {
      if (!(montoMes() > 0)) { abrirMisDatos($('btn-pagar-cuota')); return; }
      // S29 (13-nov, Bárbara): pagar la cuota se siente como una transferencia de tu cuenta Bci a tu cuenta de vivienda.
      abrirTransferencia($('btn-pagar-cuota'), montoMes(), function (comprobante) {
        montoMesElegido = comprobante.monto;
        pagar(true);
        mostrarComprobante(comprobante);
      }, cuotaMes() || 0);
    });
    if ($('btn-siguiente-hito')) $('btn-siguiente-hito').addEventListener('click', function () {
      abrirPasoAlLlegar = true;
      location.hash = '#compra';
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
        // S34: en grupo la cuenta ya está bloqueada hasta la firma: no hay «bajo llave» que activar.
        (s.grupo ? '' : '<button type="button" class="interruptor interruptor-cuota" role="switch" aria-checked="' + !!estado.pasos.bajoLlave + '" id="btn-pie-llave">' +
          '<span>' + icono('i-candado') + 'Guardar bajo llave</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>') +
        (listo ? '' : '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-pie-no-pude">' + (estado.cuotaAutomatica ? 'Pausar este mes' : 'Este mes no pude') + '</button>'),
        $('btn-pie-cuota'), function () {
          $('btn-pie-auto').addEventListener('click', function () {
            estado.cuotaAutomatica = !estado.cuotaAutomatica; guardarEstado();
            $('btn-pie-auto').setAttribute('aria-checked', String(!!estado.cuotaAutomatica));
            if ($('btn-pie-no-pude')) $('btn-pie-no-pude').textContent = estado.cuotaAutomatica ? 'Pausar este mes' : 'Este mes no pude';
            toast(estado.cuotaAutomatica ? 'Ahorro automático activo.' : 'Pagas tu cuota a mano.');
          });
          if ($('btn-pie-llave')) $('btn-pie-llave').addEventListener('click', function () {
            estado.pasos.bajoLlave = !estado.pasos.bajoLlave; guardarEstado();
            $('btn-pie-llave').setAttribute('aria-checked', String(!!estado.pasos.bajoLlave));
            toast(estado.pasos.bajoLlave ? 'Tu pie quedó bajo llave.' : 'Tu pie ya no está bajo llave.');
          });
          if ($('btn-pie-no-pude')) $('btn-pie-no-pude').addEventListener('click', function () { pagar(false); });
        });
    };
    $('btn-pie-cuota').addEventListener('click', hojaCuota);
    // S29: si vienes de una misión (ahorro automático o bajo llave), Tu cuota se abre con ese interruptor marcado.
    if (cuotaAlLlegar) {
      var k = cuotaAlLlegar; cuotaAlLlegar = null;
      setTimeout(function () {
        hojaCuota();
        var sw = $(k === 'ahorro-auto' ? 'btn-pie-auto' : 'btn-pie-llave');
        if (sw) { sw.classList.add('resaltado'); sw.focus(); }
      }, 60);
    }
  }
  var pieLogro = null;

  // ---------- S29: transferencia a tu pie (simulada, con la forma de una transferencia Bci) ----------
  var CUENTA_ORIGEN = { nombre: 'Cuenta Corriente Bci', numero: '·· 4821' };
  var CUENTA_PIE = { nombre: 'Cuenta Vivienda Bci', numero: '·· 7305' };
  function saldoCorriente() {
    if (typeof estado.saldoCorriente !== 'number') estado.saldoCorriente = Math.max(Math.round((estado.sueldoPropio || 0) * 0.85 / 1000) * 1000, 600000);
    return estado.saldoCorriente;
  }
  function filaCuenta(etq, c, extra) {
    return '<div class="tr-cuenta"><span class="tr-cuenta-icono" aria-hidden="true">' + icono(etq === 'Desde' ? 'i-banco' : 'i-alcancia') + '</span>' +
      '<span><small>' + etq + '</small><strong>' + c.nombre + '</strong><small>' + c.numero + (extra ? SEP + extra : '') + '</small></span></div>';
  }
  // S31 (18-nov): el monto del mes se cambia aquí mismo; si es menor que tu cuota, te avisamos.
  function abrirTransferencia(boton, monto, alTerminar, sugerida) {
    var mes = MESES[Number(hoyDemo().split('-')[1]) - 1];
    var saldo = saldoCorriente();
    var ufDe = function (m) { return pesosAUF(m).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
    abrirHojaContenido('Transferir a tu pie',
      '<div id="tr-cuerpo">' +
        '<div class="tr-monto-editable">' + campoDinero('tr-monto-campo', 'Monto', monto) +
          '<p class="tr-monto-uf" id="tr-monto-uf">≈ UF' + NBSP + ufDe(monto) + ' en tu cuenta de vivienda</p></div>' +
        '<p class="aviso aviso-alerta aviso-icono" id="tr-aviso-menor" hidden>' + icono('i-alerta') + 'Es menos que tu cuota de ' + formatoRedondeado(sugerida || 0) + ': llegarás más tarde a tu pie.</p>' +
        '<p class="aviso aviso-alerta aviso-icono" id="tr-aviso-saldo" hidden>' + icono('i-alerta') + 'No te alcanza el saldo de tu cuenta corriente.</p>' +
        '<div class="tr-cuentas">' + filaCuenta('Desde', CUENTA_ORIGEN, 'Disponible ' + formatoPesos(saldo)) +
          '<span class="tr-flecha" aria-hidden="true">' + icono('i-flecha') + '</span>' +
          filaCuenta('Hacia', CUENTA_PIE, 'Tu pie') + '</div>' +
        '<p class="tr-detalle"><span>Mensaje</span><strong>Cuota de ' + mes + '</strong></p>' +
        '<p class="tr-detalle"><span>Costo</span><strong>Sin costo</strong></p>' +
        '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-tr-transferir">Transferir ' + formatoPesos(monto) + '</button></div>' +
      '</div>', boton, function () {
        var campo = $('tr-monto-campo'), btn = $('btn-tr-transferir');
        var actual = monto;
        var revisar = function () {
          var ok = actual > 0 && actual <= saldo;
          $('tr-monto-uf').textContent = '≈ UF' + NBSP + ufDe(actual > 0 ? actual : 0) + ' en tu cuenta de vivienda';
          $('tr-aviso-menor').hidden = !(sugerida > 0 && actual > 0 && actual < sugerida);
          $('tr-aviso-saldo').hidden = !(actual > saldo);
          btn.disabled = !ok;
          btn.textContent = actual > 0 ? 'Transferir ' + formatoPesos(actual) : 'Escribe un monto';
        };
        campo.addEventListener('input', function () { actual = formatearCampo(campo) || 0; revisar(); });
        revisar();
        btn.addEventListener('click', function () {
          if (!(actual > 0) || actual > saldo) { temblar(campo); campo.focus(); return; }
          pasoAutorizar(actual, mes, alTerminar);
        });
      });
  }
  function pasoAutorizar(monto, mes, alTerminar) {
    var c = $('tr-cuerpo'); if (!c) return;
    $('hoja-titulo').textContent = 'Autoriza la transferencia';
    c.innerHTML = '<p class="texto-apoyo">' + formatoPesos(monto) + ' a tu ' + CUENTA_PIE.nombre + ' ' + CUENTA_PIE.numero + '</p>' +
      '<button type="button" class="tr-huella" id="btn-tr-huella" aria-label="Autorizar con tu huella">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11v4M8.5 8.5a5 5 0 0 1 8.5 3.5v2.5M7 12v1.5a5 5 0 0 0 1.2 3.3M12 7a5 5 0 0 0-5 5M10 12a2 2 0 0 1 4 0v3.5a5 5 0 0 1-1 3M16.5 17.5a9 9 0 0 1-.8 2.5M5 9.5A8 8 0 0 1 19 9"/></svg>' +
      '</button><p class="tr-huella-texto">Toca para autorizar con tu huella</p>';
    var b = $('btn-tr-huella'); b.focus();
    b.addEventListener('click', function () {
      $('hoja-titulo').textContent = 'Transfiriendo…';
      if ($('btn-cerrar-hoja')) $('btn-cerrar-hoja').hidden = true;
      c.innerHTML = '<div class="tr-cargando" role="status"><span class="tr-rueda" aria-hidden="true"></span><p>Transfiriendo ' + formatoPesos(monto) + '…</p></div>';
      var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(function () {
        estado.saldoCorriente = saldoCorriente() - monto;
        var ahora = new Date();
        alTerminar({ monto: monto, mes: mes, operacion: String(Math.floor(100000000 + Math.random() * 899999999)),
          fecha: ahora.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }),
          hora: ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) });
      }, reducido ? 300 : 1400);
    });
  }
  // S34: al abrir la cuenta se dice que lo ahorrado pasa a tu pie (antes aparecía de golpe, sin explicar).
  function textoCuentaAbierta() {
    var a = estado.ahorroActual || 0;
    return a > 0 ? 'Abriste tu cuenta de vivienda y pasaste ahí tus ' + formatoRedondeado(a) + ' ahorrados (simulado).' : 'Abriste tu cuenta de vivienda (simulado).';
  }
  var avisoTiempo = '';
  function mostrarComprobante(x) {
    abrirHojaContenido('Transferencia exitosa',
      '<div class="tr-exito"><svg class="tr-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>' +
        '<strong class="numero">' + formatoPesos(x.monto) + '</strong><small>ya está en tu pie</small></div>' +
      '<dl class="tr-comprobante">' +
        '<div><dt>Desde</dt><dd>' + CUENTA_ORIGEN.nombre + ' ' + CUENTA_ORIGEN.numero + '</dd></div>' +
        '<div><dt>Hacia</dt><dd>' + CUENTA_PIE.nombre + ' ' + CUENTA_PIE.numero + '</dd></div>' +
        '<div><dt>Mensaje</dt><dd>Cuota de ' + x.mes + '</dd></div>' +
        '<div><dt>Fecha</dt><dd>' + x.fecha + ', ' + x.hora + '</dd></div>' +
        '<div><dt>N° de operación</dt><dd>' + x.operacion + '</dd></div>' +
      '</dl>' +
      (avisoTiempo ? '<p class="aviso-tiempo" role="status">' + icono('i-calendario') + '<span>' + avisoTiempo + '</span></p>' : '') +
      '<p class="texto-apoyo"><small>Prototipo: no se mueve dinero real.</small></p>', null);
    avisoTiempo = '';
    if ($('btn-cerrar-hoja')) { $('btn-cerrar-hoja').textContent = 'Listo'; $('btn-cerrar-hoja').className = 'btn btn-primario btn-bloque bloque-chico'; $('btn-cerrar-hoja').focus(); }
  }

  var MISIONES_TEXTO = {
    ds1: ['Subsidio del Estado para tu primera vivienda. Se postula en línea en el Minvu, con tu ClaveÚnica.', 'Ya postulé'],
    rsh: ['Lo pide el DS1. Te inscribes en línea con tu ClaveÚnica.', 'Ya me inscribí'],
    documentos: ['Liquidaciones de sueldo, cotizaciones y carnet. Si eres cliente Bci, ya los tenemos.', 'Completar'],
    'bajo-llave': ['Para sacar dinero de tu pie avisas 30 días antes. Así no se gasta.', 'Guardar bajo llave'],
    'ahorro-auto': ['Bci pasa tu cuota a tu cuenta de vivienda el día de pago.', 'Activar'],
    equipo: ['Suma a tu pareja, tu familia o tu bebé para que te acompañen.', null],
    elegir: ['Mira tus caminos y elige un departamento.', null],
    tasa: ['Lo pides junto con tu crédito, al pedir tu preaprobación. Baja tu dividendo si quedan cupos cuando Bci lo apruebe.', 'Ya lo pedí'],
    fogaes: ['La garantía del Estado (FOGAES) deja que Bci te preste hasta el 90' + NBSP + '%: juntas un pie del 10' + NBSP + '%. Es para departamentos nuevos y se usa una sola vez.', null],
    familiar: ['Tu familiar deja el 10' + NBSP + '% en una cuenta Bci, con intereses. Lo recupera cuando tu deuda baja al 80' + NBSP + '%.', 'Ya la dejó']
  };
  var MISION_CLAVE = { tasa: 'tasaPedido', ds1: 'ds1Postulado', rsh: 'rsh', documentos: 'documentos', 'bajo-llave': 'bajoLlave', familiar: 'garantiaFamiliar' };
  var MISION_LISTA = { tasa: 'Listo: pediste el subsidio a la tasa.', ds1: 'Listo: postulaste al DS1.', rsh: 'Listo: te inscribiste en el Registro Social.',
    documentos: 'Tus documentos están listos.', 'bajo-llave': 'Tu pie quedó bajo llave.', familiar: 'Listo: tu familiar dejó su garantía.' };
  // S29 (13-nov, Bárbara): las misiones llevan a hacer la acción, no la marcan como hecha.
  // DS1 y Registro Social se hacen en los sitios del Estado (con ClaveÚnica); al volver, la persona confirma.
  var MISION_SITIO = {
    ds1: { url: 'https://www.chileatiende.gob.cl/fichas/19094', texto: 'Postular en el sitio del Minvu', nota: 'Se abre ChileAtiende, con el trámite del Minvu. Necesitas tu ClaveÚnica.' },
    rsh: { url: 'https://www.registrosocial.gob.cl', texto: 'Inscribirme en el Registro Social', nota: 'Necesitas tu ClaveÚnica.' }
  };
  // Ahorro automático y bajo llave se activan en Tu pie → Tu cuota: la misión te lleva ahí con el interruptor a la vista.
  var cuotaAlLlegar = null;

  function abrirMision(id, boton) {
    var s = fotoPasos();
    var x = misiones(s, hoyDemo()).filter(function (m) { return m.id === id; })[0];
    var t = MISIONES_TEXTO[id];
    var falta = !x.hecho && (id === 'ds1' || id === 'ahorro-auto') && !s.cuentaVivienda ? 'cuenta'
      : (!x.hecho && id === 'ds1' && !s.rsh ? 'rsh' : null);
    var sitio = MISION_SITIO[id];
    var accion = x.hecho ? '' :
      falta === 'cuenta' ? '<p class="texto-apoyo">' + icono('i-alerta') + ' Primero abre tu cuenta de vivienda: el DS1 pide ahorrar en ella.</p>' + enlaceHoja('#pie', 'Abrir mi cuenta') :
      falta === 'rsh' ? '<p class="texto-apoyo">' + icono('i-alerta') + ' Primero: el Registro Social de Hogares.</p>' + botonEnHoja('btn-mision-rsh', 'Ir a inscribirme en el Registro Social') :
      id === 'equipo' ? enlaceHoja('#perfil/equipo', 'Ir a Tu equipo') :
      id === 'fogaes' ? enlaceHoja('#compra/caminos/individual-vivir/califica', 'Revisar si califico') :
      id === 'familiar' ? enlaceHoja('#compra/ficha/respaldo-familiar/familiar', 'Ver cómo lo vive tu familiar') +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-mision-accion">' + t[1] + '</button>' :
      id === 'elegir' ? enlaceHoja(esArriendo() ? '#compra/caminos/arriendo-opcion' : rutaElegir(), estado.caminoElegido ? 'Elegir departamento' : 'Comparar caminos') :
      sitio ? '<a class="btn btn-primario btn-bloque" href="' + sitio.url + '" target="_blank" rel="noopener">' + sitio.texto + '<span class="oculto-visual"> (se abre en otra pestaña)</span> ↗</a>' +
          '<p class="texto-apoyo mision-nota"><small>' + sitio.nota + '</small></p>' +
          '<button type="button" class="btn btn-terciario btn-bloque" id="btn-mision-accion">' + t[1] + '</button>' :
      (id === 'ahorro-auto' || id === 'bajo-llave') ? botonEnHoja('btn-mision-ir', 'Ir a Tu cuota') :
      botonEnHoja('btn-mision-accion', t[1]);
    abrirHojaContenido(x.titulo + (x.hecho ? ' ' + icono('i-check', 'hoja-check') : ''),
      '<p><span class="chip">' + x.etiqueta + '</span>' + (x.fecha ? ' <small class="texto-apoyo">Hasta el ' + formatoFecha(x.fecha) + '</small>' : '') + '</p>' +
      '<p class="texto-apoyo">' + t[0] + '</p>' +
      (id === 'ds1' ? terminoDesplegable('ds1') : id === 'rsh' ? terminoDesplegable('rsh') : '') +
      (accion ? '<div class="acciones">' + accion + '</div>' : ''), boton, function () {
        if ($('btn-mision-rsh')) $('btn-mision-rsh').addEventListener('click', function () { abrirMision('rsh', boton); });
        if ($('btn-mision-ir')) $('btn-mision-ir').addEventListener('click', function () {
          cuotaAlLlegar = id; cerrarHoja(false);
          if (location.hash === '#pie') mostrar(); else location.hash = '#pie';
        });
        var b = $('btn-mision-accion');
        if (b) b.addEventListener('click', function () { marcarPaso(MISION_CLAVE[id], MISION_LISTA[id]); });
      }, { hoja: true });
  }

  // 10-nov: cada misión va en el paso al que ayuda (ayudaA); las que no son de un paso (como sumar tu equipo) van en el paso de ahora.
  function misionesPorPaso(h, ms) {
    var ids = h.hitos.map(function (x) { return x.id; });
    var actual = h.terminado ? h.total - 1 : h.indice - 1;
    var grupos = h.hitos.map(function () { return []; });
    ms.forEach(function (x) { var i = ids.indexOf(x.ayudaA); grupos[i === -1 ? actual : i].push(x); });
    return grupos;
  }
  // 10-nov: "Ver todas" lleva a una pantalla con todas las misiones separadas por etapa.
  // S33-C3: Misiones, más visual y con menos texto: lo que vence primero, las que faltan en mosaico y las fechas en una línea de tiempo.
  var COLOR_MISION_ID = { tasa: 'verde', fogaes: 'azul', familiar: 'azul', ds1: 'rojo', rsh: 'azul', 'ahorro-auto': 'verde', 'bajo-llave': 'azul', equipo: 'verde', cuota: 'verde' };
  function renderTodasMisiones() {
    var cont = $('pasos-contenido');
    var s = fotoPasos(), hoy = hoyDemo();
    var todas = misiones(s, hoy), conFecha = misionesConFecha(todas, hoy);
    var idsFecha = conFecha.map(function (x) { return x.id; });
    var faltan = todas.filter(function (x) { return !x.hecho && idsFecha.indexOf(x.id) === -1; });
    var listas = todas.filter(function (x) { return x.hecho; });
    var fechas = fechasDelCamino(s, hoy);
    var total = todas.length, hechas = listas.length;
    var mosaico = function (x) {
      return '<li><button type="button" class="mision-mosaico' + (x.hecho ? ' hecha' : '') + '" data-mision="' + x.id + '" aria-haspopup="dialog">' +
        '<span class="mm-icono ' + (x.hecho ? 'listo' : (COLOR_MISION_ID[x.id] || 'azul')) + '" aria-hidden="true">' + (x.hecho ? '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' : icono(ICONO_MISION_ID[x.id] || 'i-check')) + '</span>' +
        '<strong>' + x.titulo + '</strong>' +
        '<span class="mc-chip azul">' + (x.hecho ? 'Lista' : x.etiqueta) + '</span></button></li>';
    };
    cont.innerHTML =
      '<a href="#compra" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Tu compra</a>' +
      '<header class="encabezado misiones-cabeza"><h1 id="titulo-pasos" class="h2" tabindex="-1">Misiones</h1>' +
        '<span class="misiones-anillo" style="--p:' + (total ? Math.round(hechas / total * 100) : 0) + '" aria-label="' + hechas + ' de ' + total + ' listas"><strong>' + hechas + '/' + total + '</strong></span></header>' +
      '<p class="texto-apoyo">Hazlas en cualquier orden: cada una te acerca a tu fecha.</p>' +
      bloqueConFecha(conFecha) +
      (faltan.length ? '<h2 class="h5 misiones-sub">Por hacer</h2><ul class="mosaico-misiones">' + faltan.map(mosaico).join('') + '</ul>' : '') +
      (listas.length ? '<h2 class="h5 misiones-sub">Listas</h2><ul class="mosaico-misiones">' + listas.map(mosaico).join('') + '</ul>' : '') +
      (fechas.length ? '<section class="tarjeta bloque fechas-linea" aria-labelledby="titulo-fechas"><h2 class="h5" id="titulo-fechas">Fechas que importan</h2>' +
        '<ol class="linea-fechas">' + fechas.map(function (f) {
          var d = new Date(f.fecha + 'T00:00:00');
          return '<li><span class="lf-punto" aria-hidden="true"></span><strong>' + d.getDate() + ' ' + MESES[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear() + '</strong><small>' + f.texto + '</small></li>';
        }).join('') + '</ol></section>' : '');
    cont.querySelectorAll('[data-mision]').forEach(function (b) {
      b.addEventListener('click', function () { abrirMision(b.dataset.mision, b); });
    });
  }
  // S34-8: las fechas que importan son las del camino que elegiste (sin camino, ninguna).
  function fechasDelCamino(s, hoy) {
    var cam = estado.caminoElegido;
    return FECHAS_IMPORTAN.filter(function (f) {
      if (diasHastaFecha(f.fecha, hoy) < 0 || !cam) return false;
      if (f.id === 'ds1') return !!s.ds1;
      if (f.id === 'iva') return cam !== 'usados' && !s.arriendo;
      if (f.id === 'garantia') return cam === 'grupo-vivir' || cam === 'individual-vivir';
      return true;
    });
  }
  function abrirTodasMisiones(boton) {
    var s = fotoPasos();
    var hoy = hoyDemo();
    var ms = misiones(s, hoy);
    var fechas = fechasDelCamino(s, hoy);
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
    'grupo-vivir': 'Te unes a otras personas para comprar; cada uno con su departamento.',
    'individual-vivir': 'El crédito de siempre. Si es nuevo, la garantía del Estado te acerca al 90' + NBSP + '%.',
    'familiar-vivir': 'Un familiar deja una garantía y Bci te presta el 95' + NBSP + '%.',
    'familiar-invertir': 'Un familiar deja una garantía y Bci te presta el 95' + NBSP + '%.',
    'grupo-pie-compartido': 'Compras en grupo y unos inversionistas ponen parte del pie.',
    'pie-compartido': 'Pones el 5' + NBSP + '% y unos inversionistas ponen el 15' + NBSP + '%.',
    'grupo-invertir': 'Te unes a otras personas para comprar; cada uno con su departamento.',
    'individual-invertir': 'Bci presta el 80' + NBSP + '% y tú pones el 20' + NBSP + '%. Sirve para nuevos y usados.'
  };
  // Meses hasta las llaves por un camino. Para vivir, con las piezas que sumaste (igual que Inicio).
  function mesesDeCamino(id, perfil) {
    var mensual = estado.ahorroMensual || 300000;
    if (id === 'usados') return plazoTradicional(mensual).hasta.meses; // S32-B4
    if (estado.modo === 'vivir') return plazoVivir(mensual, Object.assign({}, piezasOn(), { grupo: !!CAMINOS[id].grupo, respaldo: !!CAMINOS[id].familiar })).hasta.meses;
    return mesesCarrera([id], perfil, mensual)[0].techo;
  }
  function textoLlegada(meses) { return meses === null || meses === undefined ? 'Todavía no' : fechaLlaves(meses, hoyDemo()); }
  // S24-B1: el ícono grande de cada camino en Explorar (como en el canvas).
  function iconoCamino(id) {
    var d = id.indexOf('grupo') === 0
      ? 'M9 7.5a3 3 0 1 0 6 0 3 3 0 0 0-6 0M6.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M2.7 9.5a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 0 0-4.6 0M16.7 9.5a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 0 0-4.6 0M1.5 18.5c0-2.4 1.5-4.3 3.5-4.3M22.5 18.5c0-2.4-1.5-4.3-3.5-4.3'
      : id === 'arriendo-opcion' ? 'M7.5 15a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM11 11.5h10M18 11.5v3M21 11.5v2.5'
      : id.indexOf('familiar') === 0 ? 'M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z'
      : (id === 'individual-vivir' ? 'M3 9.5L12 4l9 5.5zM5 10v7.5M9.7 10v7.5M14.3 10v7.5M19 10v7.5M3 20.5h18'
        : 'M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6zM8.5 12.2l2.4 2.4 4.6-4.8');
    return '<svg class="camino-dibujo" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function etiquetaCamino(id, r) {
    if (id === estado.caminoElegido) return '<span class="chip chip-recomendado">Tu camino</span>';
    if (!CAMINOS[id].existeHoy) return '<span class="chip chip-propuesta">Propuesta para Bci</span>';
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
  // 11-nov: cambiar entre vivir y arrendar desde Explorar. Cada modo recuerda su camino, así volver no lo borra.
  function cambiarModoExplorar(modo) {
    if (modo === estado.modo || (modo !== 'vivir' && modo !== 'arrendar')) return;
    estado.caminoPorModo = Object.assign({}, estado.caminoPorModo);
    estado.caminoPorModo[estado.modo] = estado.caminoElegido;
    var guardado = estado.caminoPorModo[modo];
    estado.modo = modo;
    estado.caminoElegido = guardado && CAMINOS[guardado] && CAMINOS[guardado].modo === modo ? guardado : null;
    guardarEstado();
    recalcularPostulacion();
    mostrar();
    toast(modo === 'vivir' ? 'Ahora ves caminos para vivir.' : 'Ahora ves caminos para arrendar.');
    var r = document.getElementById('explorar-' + modo); if (r) r.focus();
  }
  document.addEventListener('change', function (ev) {
    if (ev.target && ev.target.name === 'explorar-modo') cambiarModoExplorar(ev.target.value);
  });
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
    // S27-B2: sin camino elegido, el recomendado va primero y lleva el sello "Para ti".
    var paraTi = recomendadoParaTi();
    var idParaTi = paraTi && ids.indexOf(paraTi.id) !== -1 ? paraTi.id : null;
    if (idParaTi) ids = [idParaTi].concat(ids.filter(function (k) { return k !== idParaTi; }));
    var nGuardados = guardadosProyectos().length;
    cont.innerHTML =
      '<header class="encabezado">' + MARCA + '<h1 id="titulo-caminos" class="h2">¿Qué quieres explorar?</h1>' +
        '</header>' +
      // 11-nov: en Explorar se puede cambiar si el departamento es para vivir o para arrendar.
      '<fieldset class="selector explorar-modo"><legend class="oculto-visual">¿Para qué es el departamento?</legend><div class="selector-opciones">' +
        '<input type="radio" name="explorar-modo" id="explorar-vivir" value="vivir"' + (estado.modo === 'vivir' ? ' checked' : '') + '><label for="explorar-vivir">Para vivir</label>' +
        '<input type="radio" name="explorar-modo" id="explorar-arrendar" value="arrendar"' + (estado.modo === 'arrendar' ? ' checked' : '') + '><label for="explorar-arrendar">Para arrendar</label>' +
      '</div></fieldset>' +
      cajaCaminos(ids, idParaTi, perfil) +
      (estado.modo === 'arrendar' && r.todaviaNo ? '<p class="texto-centro"><a class="enlace" href="#compra/caminos/cambia">Ver qué lo cambia</a></p>' : '') +
      '<div class="explorar-dos">' +
        '<a class="tarjeta explorar-mini" href="#compra/caminos/guardados"><span class="explorar-mini-icono rojo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z"/></svg></span>' +
          '<strong>Favoritos</strong>' + (nGuardados ? '<small>' + nGuardados + '</small>' : '') + '</a>' +
        '<a class="tarjeta explorar-mini" href="#departamentos"><span class="explorar-mini-icono azul" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 21V5h10v16M14 9h6v12M2.5 21h19M7 8.5h1.5M9.5 8.5H11M7 12h1.5M9.5 12H11M7 15.5h1.5M9.5 15.5H11M16.5 13h1.5M16.5 16.5h1.5"/></svg></span>' +
          '<strong>Todos los departamentos</strong></a>' +
      '</div>' +
      (x.sel.noMostrados.length ? '<details class="tarjeta explorar-porque"><summary><span class="explorar-mini-icono gris" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6M12 17h.01M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19z"/></svg></span>' +
          '<span><strong>Por qué no te mostramos otros</strong><small>' + plural(x.sel.noMostrados.length, 'camino', 'caminos') + '</small></span>' +
          '<svg class="flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary>' +
          x.sel.noMostrados.map(function (n) { return '<p><strong>' + CAMINOS[n.id].corto + ':</strong> ' + RAZON_NO_MOSTRADO[n.razon] + '</p>'; }).join('') + '</details>' : '') +
      // S30-B5: para vivir, el respaldo familiar es una de las "Ayudas para llegar antes"; "Otras formas" queda solo para arrendar.
      (estado.modo === 'vivir' ? '' : '<section class="explorar-otras" aria-labelledby="titulo-otras-formas"><h2 class="h3" id="titulo-otras-formas">Otras formas</h2>' +
        fichas.map(function (id) {
          return '<a class="tarjeta explorar-otra" href="#compra/ficha/' + id + '"><span class="explorar-mini-icono verde" aria-hidden="true">' + (id === 'arriendo-opcion'
              ? '<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/></svg>'
              : '<svg viewBox="0 0 24 24"><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z"/></svg>') + '</span>' +
            '<span><strong>' + CAMINOS[id].nombre + '</strong><small>' + (CAMINOS[id].existeHoy ? 'Existe hoy' : 'Propuesta para Bci') + '</small></span></a>';
        }).join('') +
      '</section>') ;
  }
  // S30-B5 (test: "demasiados caminos"; solo 3 de 4 cabían en la pantalla): un camino destacado y los demás en filas de una línea.
  var TEXTO_CORTO_EXPLORAR = {
    'individual-vivir': 'El crédito de siempre; la garantía del Estado es una ayuda para llegar antes.',
    'grupo-vivir': 'Compras con otros y pagas menos.',
    usados: 'Pie del 20' + NBSP + '%, para departamentos usados.',
    'familiar-vivir': 'Pie del 5' + NBSP + '%, con la garantía de un familiar.',
    'familiar-invertir': 'Pones el 5' + NBSP + '%; un familiar deja una garantía.',
    'arriendo-opcion': 'Te mudas ya; tu arriendo va al pie.',
    'pie-compartido': 'Pones el 5' + NBSP + '%; inversionistas, el 15' + NBSP + '%.',
    'grupo-pie-compartido': 'En grupo, con inversionistas en el pie.',
    'grupo-invertir': 'Compras con otros y pagas menos.',
    'individual-invertir': 'Bci presta el 80' + NBSP + '%; tú pones el 20' + NBSP + '%.'
  };
  function cajaCaminos(ids, idParaTi, perfil) {
    var llegada = function (id) {
      if (id === 'usados' || id === 'arriendo-opcion') return '';
      try { var m = mesesDeCamino(id, perfil); return m === null || m === undefined ? 'Todavía no' : 'Llegas en ' + textoLlegada(m); } catch (e) { return ''; }
    };
    var nombre = function (id) { return id === 'usados' ? NOMBRE_USADOS : CAMINOS[id].nombre; };
    var color = function (id, i) { return COLOR_EXPLORAR[id] !== undefined ? COLOR_EXPLORAR[id] : i % 3; };
    var destacado = idParaTi || (estado.caminoElegido && ids.indexOf(estado.caminoElegido) !== -1 ? estado.caminoElegido : ids[0]);
    var sello = destacado === idParaTi ? selloParaTi() : (destacado === estado.caminoElegido ? '<span class="sello-para-ti">' + icono('i-check') + 'Tu camino</span>' : '');
    var d = destacado;
    var primero = '<a class="camino-boton camino-destacado color-' + color(d, 0) + '" href="#compra/caminos/' + d + '">' +
      '<span class="camino-figura" aria-hidden="true"><i></i></span>' +
      '<span class="camino-boton-cabeza"><span class="camino-datos">' + sello + '</span>' + iconoCamino(d === 'usados' ? 'individual-invertir' : d) + '</span>' +
      '<span class="camino-boton-cuerpo"><strong class="h4">' + nombre(d) + '</strong>' +
        '<span class="camino-boton-texto">' + (TEXTO_CORTO_EXPLORAR[d] || LINEA_CAMINO[d] || '') + '</span>' +
        (llegada(d) ? '<span class="chip camino-llegada-chip">' + icono('i-calendario') + llegada(d) + '</span>' : '') + '</span>' +
      '<span class="camino-boton-ir" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span></a>';
    var otros = ids.filter(function (id) { return id !== d; });
    return '<div class="camino-destacado-caja">' + primero + '</div>' +
      (otros.length ? '<h2 class="h5 otros-caminos-titulo">Otros caminos</h2>' +
        '<ul class="caminos-filas">' + otros.map(function (id, i) {
          var detalle = (DATOS_CAMINO[id] ? DATOS_CAMINO[id][0] : '') + (llegada(id) ? SEP + llegada(id).replace('Llegas en ', '').replace(' de ', ' ') : '');
          return '<li><a class="camino-fila color-' + color(id, i + 1) + '" href="#compra/caminos/' + id + '">' +
            '<span class="camino-fila-ico" aria-hidden="true">' + iconoCamino(id === 'usados' ? 'individual-invertir' : id) + '</span>' +
            '<span class="camino-fila-txt"><strong>' + nombre(id) + '</strong><small>' + detalle + '</small></span>' +
            '<svg class="camino-fila-ir" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></a></li>';
        }).join('') + '</ul>' : '');
  }
  // Evaluación heurística: el crédito de los usados tiene su propio nombre (antes "Crédito de siempre").
  var NOMBRE_USADOS = 'Crédito para usados';
  var ORDEN_EXPLORAR = { 'individual-vivir': 1, 'grupo-vivir': 2 };
  var COLOR_EXPLORAR = { 'individual-vivir': 0, 'grupo-vivir': 1, usados: 2, 'arriendo-opcion': 3, 'familiar-vivir': 0 };
  var DATOS_CAMINO = {
    'individual-vivir': ['Pie 10' + NBSP + '%', 'Nuevos'], 'grupo-vivir': ['Pagan menos', 'En obra'], usados: ['Pie 20' + NBSP + '%', 'Usados'],
    'arriendo-opcion': ['Entras con 5' + NBSP + '%', 'Propuesta'],
    'familiar-vivir': ['Pie 5' + NBSP + '%', 'Propuesta'], 'familiar-invertir': ['Pie 5' + NBSP + '%', 'Propuesta'],
    'pie-compartido': ['Pie 5' + NBSP + '%', 'Para arrendar'], 'grupo-pie-compartido': ['Pie 5' + NBSP + '%', 'En grupo'],
    'grupo-invertir': ['Pagan menos', 'En obra'], 'individual-invertir': ['Pie 20' + NBSP + '%']
  };
  var TEXTO_EXPLORAR = {
    'individual-vivir': 'Bci te presta hasta el 90' + NBSP + '%. Tú juntas solo el 10' + NBSP + '% de pie.',
    'grupo-vivir': 'Te unes a otras personas para comprar, pero cada uno con su propio departamento.',
    usados: 'Bci te presta el 80' + NBSP + '%. Sirve para departamentos usados.',
    'arriendo-opcion': 'Te mudas ahora y parte de tu arriendo va a tu pie.',
    'familiar-vivir': 'Un familiar deja el 10' + NBSP + '% en garantía y lo recupera. Tú juntas solo el 5' + NBSP + '%.',
    'pie-compartido': 'Pones el 5' + NBSP + '% y unos inversionistas el 15' + NBSP + '%. Con el arriendo les compras su parte.',
    'grupo-invertir': 'Te unes a otras personas para comprar en obra; cada uno con su departamento y su crédito.',
    'individual-invertir': 'Bci te presta el 80' + NBSP + '% y tú juntas el 20' + NBSP + '%. Sirve para nuevos y usados.',
    'familiar-invertir': 'Un familiar deja el 10' + NBSP + '% en garantía. Tú pones el 5' + NBSP + '% y el departamento es todo tuyo.'
  };

  // Los departamentos de un camino, sin cambiar el camino elegido (mirar no cambia el plan).
  function proyectosDeCamino(id) {
    var guardado = { c: estado.caminoElegido, f: estado.filtroRango, p: estado.piezas };
    estado.caminoElegido = id;
    estado.filtroRango = !!rangoActual();
    if (estado.modo === 'vivir') estado.piezas = Object.assign({}, estado.piezas, { grupo: !!CAMINOS[id].grupo, respaldo: !!CAMINOS[id].familiar });
    var lista = proyectosVisibles('camino');
    estado.caminoElegido = guardado.c; estado.filtroRango = guardado.f; estado.piezas = guardado.p;
    return lista;
  }
  // S24-B2: la descripción larga de cada camino (Un camino), como en el canvas.
  var soloFavoritos = false;
  var DESCRIPCION_CAMINO = {
    // S30-B2: una línea (≤ 14 palabras); el detalle (5 % con 5 personas, crédito y escritura propios) está en "Qué significan".
    'grupo-vivir': 'Compras con otros en obra, cada uno con su crédito. Baja el precio.',
    'individual-vivir': 'El crédito de siempre. Si es nuevo, la garantía del Estado te permite pedir hasta el 90' + NBSP + '% y juntar solo el 10' + NBSP + '%.'
  };
  function chipsPiezas() {
    if (estado.modo !== 'vivir') return '';
    var on = piezasValidas(piezasOn());
    var n = ORDEN_PIEZAS.filter(function (id) { return on[id] && id !== 'grupo'; });
    return n.length ? '<p class="chip-fila">' + n.map(function (id) { return '<span class="chip chip-existe">' + PIEZAS_VIVIR[id].nombre + '</span>'; }).join(' ') + '</p>' : '';
  }
  // 11-nov: dentro de un camino, cambiarse a otro sin volver a Explorar.
  // S30-D3: "Cambiar de camino" dentro de cada camino se sintió incómodo; ver otro camino es volver a Explorar. Con true vuelve la hoja.
  var TIRA_CAMINOS = false;
  function ponerOtrosCaminos(cont, actual) {
    if (!TIRA_CAMINOS) return;
    try {
      var perfil = perfilActual();
      var ids = caminosExplorar(perfil, recomendarCamino(perfil)).ids.slice()
        .sort(function (a, b) { return (ORDEN_EXPLORAR[a] || 9) - (ORDEN_EXPLORAR[b] || 9); })
        .concat(estado.modo === 'vivir' ? ['usados', 'arriendo-opcion'] : []);
      if (ids.length < 2) return;
      var h1 = cont.querySelector('.encabezado h1');
      if (!h1) return;
      h1.insertAdjacentHTML('afterend', '<button type="button" class="cambiar-camino" id="btn-cambiar-camino" aria-haspopup="dialog">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>Cambiar de camino</button>');
      var b = $('btn-cambiar-camino');
      b.addEventListener('click', function () {
        abrirHojaContenido('Cambiar de camino',
          '<ul class="hoja-caminos">' + ids.map(function (id) {
            var nombre = id === 'usados' ? NOMBRE_USADOS : CAMINOS[id].nombre;
            var color = COLOR_EXPLORAR[id] !== undefined ? COLOR_EXPLORAR[id] : 1;
            var linea = TEXTO_EXPLORAR[id] || LINEA_CAMINO[id] || '';
            var es = id === actual;
            return '<li><a class="hoja-camino punto-' + color + '" href="#compra/caminos/' + id + '"' + (es ? ' aria-current="page"' : '') + ' data-cerrar-hoja>' +
              '<span><strong>' + nombre + '</strong><small>' + linea + '</small></span>' +
              (es ? '<span class="chip">Lo estás viendo</span>' : '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg>') + '</a></li>';
          }).join('') + '</ul>', b,
          function () {
            document.querySelectorAll('[data-cerrar-hoja]').forEach(function (a) {
              a.addEventListener('click', function () { cerrarHoja(false); });
            });
          }, { confirmacion: true });
      });
    } catch (e) { /* si falla, la página sigue igual */ }
  }


  // S30-B2: vista previa de las ayudas que sirven en este camino y lo máximo que adelantan.
  function vistaAyudas(id) {
    var ids = AYUDAS_CAMINO[id] || [];
    var nombres = ids.filter(function (k) { return k === 'ds1' || k === 'ds19' || k === 'iva'; }).map(function (k) { return k === 'ds1' ? 'DS1' : k === 'ds19' ? 'DS19' : 'Sin IVA'; });
    var max = 0;
    ['subsidio', 'iva', 'regalo', 'respaldo'].forEach(function (p) {
      if (p === 'iva' && ids.indexOf('iva') === -1) return;
      max = Math.max(max, mesesQueAcerca(p));
    });
    return nombres.join(', ') + (max > 0 ? ' · hasta ' + textoMeses(max) + ' antes' : '');
  }
  // S30-B2: el filtro que viene de una ayuda se ve como un chip con ✕.
  function filtrosActivosHtml(id) {
    var on = Object.keys(chipsActivos).filter(function (k) {
      return chipsActivos[k] && chipsDelModo(estado.modo).indexOf(k) !== -1 && !bloqueoChip(k, CAMINOS[id]);
    });
    return on.length ? '<p class="chip-fila">' + on.map(function (k) {
      return '<button type="button" class="chip chip-filtro activo" data-quitar-chip="' + k + '" aria-label="Quitar filtro ' + CHIPS_EXPLORAR[k].nombre + '">' + CHIPS_EXPLORAR[k].nombre + ' <span aria-hidden="true">✕</span></button>';
    }).join(' ') + '</p>' : '';
  }
  var TERMINOS_CAMINO = { 'individual-vivir': ['garantia', 'ds1', 'ds19'], 'grupo-vivir': ['grupo', 'ds1', 'ds19'] };
  function renderUnCamino(id, modoElegir) {
    var cont = $('caminos-contenido');
    if (!CAMINOS[id] || CAMINOS[id].ficha) { location.replace('#compra/caminos'); return; }
    if (!ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return sinSueldos(cont, CAMINOS[id].nombre, 'titulo-caminos');
    var perfil = perfilActual();
    var r = recomendarCamino(perfil);
    var todos = proyectosDeCamino(id);
    var lista = filtrarChips(todos, id).filter(function (p) { return !soloFavoritos || esFavorito(p.id); });
    var m = mesesDeCamino(id, perfil);
    var esTuyo = id === estado.caminoElegido;
    var vivir = estado.modo === 'vivir';
    // S30-B6: "Elige tu departamento" es esta misma lista, con una franja arriba (no otra pantalla).
    var elegir = !!modoElegir && esTuyo && !estado.compra;
    cont.innerHTML =
      (elegir ? '<a href="#compra" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Tu compra</a>'
        : '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>') +
      (elegir
        ? '<header class="encabezado"><h1 id="titulo-caminos" class="h2">Elige tu departamento</h1>' +
            '<p class="texto-apoyo">' + CAMINOS[id].nombre + SEP + plural(lista.length, 'departamento', 'departamentos') + '</p></header>'
        : '<header class="encabezado">' +
        '<h1 id="titulo-caminos" class="h2">' + CAMINOS[id].nombre + '</h1>' +
        '<p class="texto-apoyo camino-descripcion">' + (DESCRIPCION_CAMINO[id] || LINEA_CAMINO[id] || '') + '</p>' +
        terminos(TERMINOS_CAMINO[id] || []) +
      '</header>' +
      // S32-B4: cómo funciona en tres pasos, para quién y qué tener en cuenta.
      (vivir && INFO_CAMINO[id] ? ilustracionCamino(id, 'ilustracion-cabeza') + '<section class="tarjeta bloque info-camino" aria-labelledby="titulo-como"><h2 class="h5" id="titulo-como">Cómo funciona</h2>' +
        pasosVisuales(id) +
        '<p class="texto-apoyo"><strong>Para quién:</strong> ' + INFO_CAMINO[id].para + '</p>' +
        '<p class="aviso aviso-icono">' + icono('i-alerta') + '<span><strong>Ten en cuenta:</strong> ' + INFO_CAMINO[id].cuidado + '</span></p></section>' : '')) +
      (elegir ? '' : esTuyo ? '<a class="camino-es-tuyo" href="#compra">' + icono('i-check') + 'Es tu camino' + SEP + 'ver tus pasos</a>'
        : '<p class="camino-llegada">' + icono('i-calendario') + (vivir ? (numerosComparar(id).tuyo === null ? 'Todavía no te alcanza' : 'Recibes tus llaves <strong>' + mesTuyo(numerosComparar(id).tuyo) + '</strong>')
            : (m === null || m === undefined ? 'Todavía no llegas' : 'Llegas en <strong>' + textoLlegada(m) + '</strong>')) + '</p>' +
          '<button type="button" class="btn btn-mi-camino" id="btn-mi-camino" aria-haspopup="dialog">Elegir este camino</button>') +
      (vivir && id === 'arriendo-opcion' ? '' : vivir ? '<a class="tarjeta fila como-funciona" href="#compra/caminos/' + id + '/como"><span class="circulo-icono verde" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg></span>' +
          '<span><strong>Ayudas para llegar antes</strong><small>' + vistaAyudas(id) + '</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>'
        : '<button type="button" class="tarjeta fila como-funciona" data-simular="' + id + '" aria-haspopup="dialog">' + icono('i-ayuda', 'icono-grande') +
          '<span><strong>¿Cómo funciona?</strong><small>Tasa, dividendo y costo total</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></button>') +
      // S30-B2: para vivir, los filtros DS1 / DS19 / Sin IVA viven en "Ayudas para llegar antes" (cada ayuda tiene su botón "Ver departamentos con…").
      // S32-B4: para vivir, la lista de departamentos vive en Departamentos (salvo al elegir el tuyo).
      (vivir && !elegir
        ? '<a class="tarjeta fila como-funciona" href="#departamentos/camino/' + id + '">' + icono('i-casa', 'icono-grande') +
            '<span><strong>Ver sus departamentos</strong><small>' + plural(todos.length, 'departamento', 'departamentos') + ' en tu rango</small></span>' +
            '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>'
        : '') +
      (vivir && !elegir ? '' : (
      (vivir
        ? '<div class="camino-lista-cab' + (elegir ? ' solo-chip' : '') + '">' + (elegir ? '' : '<h2 class="h3 camino-explorar-titulo">Departamentos</h2>') +
            '<button type="button" class="chip chip-filtro chip-favoritos" id="chip-favoritos" aria-pressed="' + soloFavoritos + '">' + icono('i-corazon') + 'Favoritos</button></div>' + filtrosActivosHtml(id)
        : '<h2 class="h3 camino-explorar-titulo">Departamentos</h2>' +
          chipsExplorar(id).replace('</div>', '<button type="button" class="chip chip-filtro chip-favoritos" id="chip-favoritos" aria-pressed="' + soloFavoritos + '">' + icono('i-corazon') + 'Favoritos</button></div>')) +
      (!vivir && id === 'individual-invertir'
        ? '<a class="tarjeta fila como-funciona" href="#compra/caminos/usados">' + icono('i-casa', 'icono-grande') +
            '<span><strong>También usados</strong><small>El mismo crédito al 80' + NBSP + '%, sin subsidio a la tasa</small></span>' +
            '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>' : '') +
      '<section aria-labelledby="titulo-deptos-camino"><h2 class="oculto-visual" id="titulo-deptos-camino">' + plural(lista.length, 'departamento', 'departamentos') + '</h2>' +
        (lista.length ? '<ul class="lista-proyectos">' + lista.map(function (p) { return tarjetaProyecto(p, '#compra/proyecto/', true, '/' + esc(id)); }).join('') + '</ul>'
          : '<p class="texto-apoyo">' + (soloFavoritos && todos.length ? 'Todavía no guardas ninguno de este camino.' : todos.length ? 'Ninguno con estos filtros.' : 'Hoy no hay departamentos de este camino en tu rango.') + '</p>') +
      '</section>'));
    var b = cont.querySelector('[data-simular]');
    if (b) b.addEventListener('click', function () { abrirSimulacion(id, b); });
    if ($('btn-mi-camino')) $('btn-mi-camino').addEventListener('click', function () { confirmarMiCamino(id, $('btn-mi-camino')); });
    if ($('chip-favoritos')) $('chip-favoritos').addEventListener('click', function () { soloFavoritos = !soloFavoritos; renderUnCamino(id); $('chip-favoritos').focus(); });
    cont.querySelectorAll('[data-quitar-chip]').forEach(function (b) {
      b.addEventListener('click', function () { chipsActivos[b.dataset.quitarChip] = false; renderUnCamino(id); var l = document.querySelector('#caminos-contenido .camino-lista-cab h2'); if (l) { l.setAttribute('tabindex', '-1'); l.focus(); } });
    });
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
    ponerOtrosCaminos(cont, id);
  }
  // S32-B5: «Cómo funciona» del crédito tradicional y del arriendo con opción (los departamentos, en Departamentos).
  function renderCaminoInfo(id) {
    var cont = $('caminos-contenido');
    var esTuyo = id === estado.caminoElegido;
    cont.innerHTML =
      '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>' +
      '<header class="encabezado fc-titulo"><h1 id="titulo-caminos" class="h2" tabindex="-1">' + nombreCamino(id) + '</h1></header>' +
      fichaCaminoHtml(id) +
      (esTuyo ? '<a class="camino-es-tuyo" href="#compra">' + icono('i-check') + 'Es tu camino' + SEP + 'ver tus pasos</a>'
        : '<div class="acciones accion-fija"><button type="button" class="btn btn-primario btn-bloque" id="btn-mi-camino" aria-haspopup="dialog">Elegir este camino</button></div>');
    if ($('btn-mi-camino')) $('btn-mi-camino').addEventListener('click', function () { confirmarMiCamino(id, $('btn-mi-camino')); });
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
  var detPestana = { id: null, tab: 'numeros' };
  function pestanasDetalle(p, lista) {
    lista = lista.filter(Boolean);
    if (detPestana.id !== p.id) detPestana = { id: p.id, tab: 'numeros' };
    if (!lista.some(function (t) { return t[0] === detPestana.tab; })) detPestana.tab = lista[0][0];
    return '<div class="det-tabs" role="tablist" aria-label="Información del departamento">' + lista.map(function (t) {
        var on = t[0] === detPestana.tab;
        return '<button type="button" role="tab" id="det-tab-' + t[0] + '" aria-controls="det-panel-' + t[0] + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-det-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      lista.map(function (t) {
        return '<section class="det-panel" role="tabpanel" id="det-panel-' + t[0] + '" aria-labelledby="det-tab-' + t[0] + '"' + (t[0] === detPestana.tab ? '' : ' hidden') + '>' + t[2] + '</section>';
      }).join('');
  }
  function iniciarPestanasDetalle(cont) {
    var tabs = cont.querySelectorAll('[data-det-tab]');
    var mostrar = function (k, foco) {
      detPestana.tab = k;
      tabs.forEach(function (b) { var on = b.dataset.detTab === k; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && foco) b.focus(); });
      cont.querySelectorAll('.det-panel').forEach(function (pn) { pn.hidden = pn.id !== 'det-panel-' + k; });
      // 20-nov: si las pestañas ya están pegadas arriba, la sección nueva empieza justo bajo ellas (no bajo la barra blanca).
      var barra = cont.querySelector('.det-tabs'), panel = $('det-panel-' + k);
      if (barra && panel) {
        var bajo = barra.getBoundingClientRect().bottom + 8, arriba = panel.getBoundingClientRect().top;
        if (arriba < bajo) window.scrollBy(0, arriba - bajo);
      }
    };
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { mostrar(b.dataset.detTab); });
      b.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (d) { ev.preventDefault(); mostrar(tabs[(i + d + tabs.length) % tabs.length].dataset.detTab, true); }
      });
    });
  }
  function barrioHtml(p) { return barrioSolo(p) + visitaHtml(p); }
  // S36: el barrio en cuadros de color y la visita, por separado (cada uno en su pestaña del detalle).
  function barrioSolo(p) {
    var b = BARRIOS[p.comuna];
    if (!b) return '';
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
          '<button type="submit" class="btn btn-secundario-dark btn-sm">Ver ruta</button></div>' +
          '<p class="barrio-ruta" id="barrio-ruta" aria-live="polite">' + (estado.trabajo ? 'En transporte público, desde ' + esc(estado.trabajo) : '') + '</p></form>' +
        '<a class="barrio-link" id="barrio-abrir" href="' + urlMapaAfuera(p.comuna, estado.trabajo) + '" target="_blank" rel="noopener">Abrir en Google Maps</a>' +
      '</section>';
  }
  function visitaHtml(p) {
    var hechos = estado.visita[p.id] || [];
    return '<details class="tarjeta visita" open>' +
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
      volver = ['#compra', 'Tu compra'];
    }
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var m = mesDueno({ dividendo: base.dividendo, m2: m2, precioUF: base.precioUF, arriendo: estado.arriendoActual, ingreso: ingreso, otrasCuotas: estado.otrasCuotas });
    var partes = [['azul', 'Dividendo', m.dividendo, 'Lo que le pagas a Bci (sin seguros)'], ['celeste', 'Seguros', m.seguros, 'Desgravamen e incendio, van con el dividendo'],
      ['verde', 'Gastos comunes', m.gastosComunes, 'Estimado para ' + m2 + NBSP + 'm²'], ['amarillo', 'Para arreglos', m.arreglos, 'Lo que conviene guardar cada mes']];
    var pctVive = ingreso > 0 ? m.teQueda / ingreso : null;
    var nivel = pctVive === null ? null : pctVive >= 0.5 ? 'holgado' : pctVive >= 0.35 ? 'limite' : 'no-aprueba';
    cont.innerHTML =
      '<a href="' + volver[0] + '" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + volver[1] + '</a>' +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2">Tu mes como dueño</h1>' +
        '<p class="texto-apoyo">' + (p ? esc(p.nombre) + SEP + m2 + NBSP + 'm²' : 'Un departamento de ' + formatoUF(base.precioUF) + ' y unos ' + m2 + NBSP + 'm²') + '</p></header>' +
      '<section class="dueno-heroe" aria-labelledby="dueno-total">' +
        '<p id="dueno-total">Todo tu mes como dueño</p><strong>' + formatoPesos(m.total) + '</strong>' +
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
      (pctVive !== null ? '<section class="tarjeta dueno-vivir dueno-' + nivel + '" aria-labelledby="dueno-queda"><h2 id="dueno-queda">Te queda para tus gastos del mes</h2>' +
        '<strong>' + formatoPesos(Math.max(0, m.teQueda)) + '</strong>' +
        '<span class="carga-chip ' + nivel + '">' + (nivel === 'holgado' ? 'Holgado' : nivel === 'limite' ? 'Justo' : 'Poco') + '</span>' +
        '<p class="dueno-nota">Lo que te sobra de tus ' + formatoPesos(ingreso) + ' al mes después de pagar tu departamento' + ((estado.otrasCuotas || 0) > 0 ? ' y tus deudas' : '') + ': para comida, transporte, cuentas y ahorro.</p></section>' : '') +
      '<section class="tarjeta dueno-vez" aria-labelledby="dueno-vez"><h2 id="dueno-vez">Gastos de compra</h2><p class="dueno-vez-sub">Una sola vez</p>' +
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
      '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>' +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2 titulo-favoritos">Favoritos <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z"/></svg></h1>' +
        '<p class="texto-apoyo">Te avisamos si cambia algo.</p></header>' +
      (lista.length
        // S25: como el canvas: la novedad arriba, la foto, el nombre y una sola cifra.
        ? '<ul class="lista-proyectos">' + lista.map(function (p) {
            var r = resumen(p), d = departamentosDe(p.id)[0], foto = fotoEdificio(p);
            return '<li><a class="tarjeta tarjeta-canvas guardado" href="#compra/proyecto/' + esc(p.id) + '">' +
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
      (vivir ? '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>'
        : '<a href="#compra/caminos/individual-invertir" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + CAMINOS['individual-invertir'].nombre + '</a>') +
      '<header class="encabezado">' +
        '<h1 id="titulo-caminos" class="h2">' + (vivir ? NOMBRE_USADOS : CAMINOS['individual-invertir'].nombre + SEP + 'usados') + '</h1>' +
        '<p class="texto-apoyo camino-descripcion">Bci te presta hasta el 80' + NBSP + '%; tú juntas el 20' + NBSP + '%. Sin subsidio a la tasa.</p></header>' +
      (vivir ? '<p class="texto-apoyo"><small>Solo para mirar: tus pasos siguen tu camino.</small></p>' : '<button type="button" class="btn btn-mi-camino" id="btn-usados-camino" aria-haspopup="dialog">Elegir este camino</button>') +
      '<h2 class="h3 camino-explorar-titulo">Departamentos usados</h2>' +
      '<div class="chips-explorar" role="group" aria-label="Filtrar">' + chip('dos', '2 dormitorios') + chip('barato', 'Hasta ' + formatoUF(2000)) + chip('fav', 'Favoritos') + '</div>' +
      '<p class="usados-conteo">' + (lista.length ? plural(lista.length, 'departamento', 'departamentos') : 'Ningún departamento con estos filtros') + '</p>' +
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
          '<h3 class="tp-nombre"><a class="usado-enlace" href="#compra/caminos/usados/' + esc(u.id) + '">' + titulo + '</a></h3>' +
          '<p class="tp-ficha">' + esc(u.comuna) + SEP + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + plural(u.banos || 1, 'baño', 'baños') + SEP + u.m2 + NBSP + 'm²</p>' +
          '<p class="usado-precio"><strong class="tp-cifra">' + formatoRedondeado(ufAPesos(u.listaUF)) + '</strong> <span>' + formatoUF(u.listaUF) + '</span></p>' +
          '<p class="tp-linea">Pie de ' + formatoRedondeado(ufAPesos(u.listaUF * 0.2)) + (calza ? SEP + 'calza con DS1' : '') + '</p>' +
        '</li>';
      }).join('') + '</ul>' : '<p class="texto-apoyo">' + (filtroUsados.fav ? 'Todavía no guardas ninguno.' : 'Ninguno con estos filtros.') + '</p>') +
      '<p class="texto-apoyo texto-centro"><small>Ejemplos simulados' + SEP + 'fotos referenciales</small></p>';
    // 9-nov: para invertir, es el mismo Crédito al 80 %: se puede hacer tu camino.
    if ($('btn-usados-camino')) $('btn-usados-camino').addEventListener('click', function () { confirmarMiCamino('individual-invertir', $('btn-usados-camino')); });
    cont.querySelectorAll('[data-usado-filtro]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.usadoFiltro;
        filtroUsados[k] = !filtroUsados[k];
        renderUsados();
        cont.querySelector('[data-usado-filtro="' + k + '"]').focus();
      });
    });
    ponerOtrosCaminos(cont, 'usados');
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
    if (!u) { location.replace('#compra/caminos/usados'); return; }
    var vivir = estado.modo === 'vivir';
    var titulo = 'Departamento en ' + esc(u.comuna);
    var pie = ufAPesos(u.listaUF * 0.2), gastos = ufAPesos(gastosUF(u.listaUF)), meta = pie + gastos;
    var dividendo = ufAPesos(cuotaFija(u.listaUF * 0.8, SUPUESTOS.tasaSinSubsidio, SUPUESTOS.mesesBci) + SUPUESTOS.segurosUF);
    var perfil = perfilActual();
    var falta = Math.max(0, meta - (perfil.ahorroActual || 0));
    var meses = falta === 0 ? 0 : mesesParaMeta(falta, perfil.ahorroMensual);
    var calza = vivir && u.listaUF <= DS1.tramo4.hastaUF;
    cont.innerHTML =
      (vivir ? '<a href="#departamentos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Departamentos</a>'
        : '<a href="#compra/caminos/usados" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + CAMINOS['individual-invertir'].nombre + ' · usados</a>') +
      '<header class="detalle-cabecera">' + botonFavorito({ id: u.id, nombre: titulo }) +
        '<h1 id="titulo-caminos" class="h2">' + titulo + '</h1>' +
        '<span class="tp-tipo verde">Usado' + SEP + 'de ' + u.anio + '</span>' +
        '<p class="texto-apoyo">' + esc(u.comuna) + SEP + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + plural(u.banos || 1, 'baño', 'baños') + SEP + u.m2 + NBSP + 'm²</p>' +
      '</header>' +
      galeria(fotosUsado(u)) +
      // S36 (lienzo P22): el mismo sistema del detalle, también para los usados.
      '<section class="det-precio" aria-labelledby="usado-llaves"><p class="det-etq">Precio</p>' +
        '<div class="det-precio-fila"><strong class="det-precio-num">' + formatoRedondeado(ufAPesos(u.listaUF)) + '</strong></div>' +
        (vivir ? '<p class="det-tuyo" id="usado-llaves">' + icono('i-calendario') + '<span>' + (!isFinite(meses) || meses === null ? 'Todavía no te alcanza' : meses === 0 ? 'Ya tienes lo que se junta antes de firmar' : 'Recibirías tus llaves <strong>aprox. ' + fechaLlaves(meses + MESES_SI_A_LLAVES, hoyDemo()) + '</strong>') + '</span></p>' : '<p class="oculto-visual" id="usado-llaves">Precio</p>') + '</section>' +
      (vivir ? pestanasDetalle(u, [
          ['numeros', 'Números', '<div class="det-cifras"><div><small>Pie (20' + NBSP + '%)</small><strong>' + formatoRedondeado(pie) + '</strong><small>más ' + formatoRedondeado(gastos) + ' de gastos</small></div>' +
            '<div><small>Dividendo al mes</small><strong>' + formatoRedondeado(dividendo) + '</strong><small>con seguros' + SEP + ufDecimales(dividendo / SUPUESTOS.uf, 2) + '</small></div></div>' +
          '<p class="det-subsidio">' + icono('i-info') + '<span>Bci presta el 80' + NBSP + '% a 30 años. Un usado no tiene subsidio a la tasa ni garantía del Estado, por eso el pie es más alto.</span></p>' + '<p class="det-subsidio">' + icono('i-alcancia') + '<span>Juntas <strong>' + formatoRedondeado(meta) + '</strong> antes de firmar.</span></p>'],
          BARRIOS[u.comuna] ? ['barrio', 'Barrio', barrioSolo(u)] : null,
          ['visita', 'Visita', visitaHtml(u)]
        ]) : '<div class="det-cifras"><div><small>Pie (20' + NBSP + '%)</small><strong>' + formatoRedondeado(pie) + '</strong><small>más ' + formatoRedondeado(gastos) + ' de gastos</small></div>' +
            '<div><small>Dividendo al mes</small><strong>' + formatoRedondeado(dividendo) + '</strong><small>con seguros' + SEP + ufDecimales(dividendo / SUPUESTOS.uf, 2) + '</small></div></div>' +
          '<p class="det-subsidio">' + icono('i-info') + '<span>Bci presta el 80' + NBSP + '% a 30 años. Un usado no tiene subsidio a la tasa ni garantía del Estado, por eso el pie es más alto.</span></p>') +
      (vivir ? (estado.usadoElegido === u.id && estado.caminoElegido === 'usados' ? '<p class="aviso">Es tu departamento: con él calculamos tu fecha.</p>'
          : puedeCambiarMeta() ? notaCambioCamino({ tipo: 'usado', u: u }) + '<button type="button" class="btn btn-primario btn-bloque usado-cta" id="btn-usado-meta" aria-haspopup="dialog">Elegir este departamento</button>' : '')
        : '<button type="button" class="btn btn-primario btn-bloque usado-cta" id="btn-usado-camino" aria-haspopup="dialog">Elegir este camino</button>') +
      '<p class="texto-apoyo texto-centro"><small>Ejemplo simulado' + SEP + 'fotos referenciales</small></p>';
    iniciarGalerias(cont);
    if (vivir) { iniciarPestanasDetalle(cont); iniciarVisita(u); }
    if ($('btn-usado-meta')) $('btn-usado-meta').addEventListener('click', function () { confirmarDeptoMeta({ tipo: 'usado', u: u }, $('btn-usado-meta')); });
    if ($('btn-usado-camino')) $('btn-usado-camino').addEventListener('click', function () { confirmarMiCamino('individual-invertir', $('btn-usado-camino')); });
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
    abrirHojaContenido(u ? '¿Quieres este departamento?' : 'Tus pasos con arriendo con opción de compra',
      (a ? '<p class="texto-apoyo">' + esc(u.nombre) + ': ' + (a.cumple ? 'es tuyo en ' + textoMeses(a.mesesTuyo) + (a.mesesEntrada ? ' y te mudas en ' + textoMeses(a.mesesEntrada) : ' y te mudas ya') + '.' : primeraMinuscula(a.razon) + '.') + '</p>' : '') +
      (ya || u ? '' : '<p class="texto-apoyo">Si sigues este camino, estos son tus pasos hasta que recibes tus llaves.</p>' + listaPasosPrevia(pasosDeCamino('arriendo-opcion'))) +
      (ya ? '' : '<p class="texto-apoyo"><small>Tu cuenta, tu ahorro y tus misiones se mantienen.</small></p>') +
      '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-confirmar-arriendo">' + (u ? 'Sí, quiero este departamento' : 'Seguir este camino') + '</button></div>', boton,
      function () {
        $('btn-confirmar-arriendo').addEventListener('click', function () {
          estado.caminoElegido = 'arriendo-opcion';
          if (u) estado.arriendoElegido = u.id;
          guardarEstado();
          registro.camino = 'arriendo-opcion'; guardarRegistro();
          cerrarHoja(false);
          if (u) { toast('Elegiste ' + u.nombre + '.'); location.hash = '#compra'; }
          else { caminoRecien = 'arriendo-opcion'; pasoElegido = null; location.hash = '#compra'; }
        });
      }, { confirmacion: true });
  }
  // "Todavía no" en este camino: otro departamento que sí te alcance, o cambiar tus números.
  function salidaArriendoHtml(u) {
    var perfil = perfilActual();
    var otro = ARRIENDOS_OPCION.filter(function (x) { return x.id !== u.id; })
      .map(function (x) { return { u: x, a: arriendoOpcion(x.listaUF, x.arriendoEstimadoIA, perfil) }; })
      .filter(function (x) { return x.a.cumple; }).sort(function (x, y) { return x.a.mesesTuyo - y.a.mesesTuyo; })[0];
    if (otro) return '<p class="todavia-salida">En ' + esc(otro.u.nombre) + ' sí te alcanza: es tuyo en ' + textoMeses(otro.a.mesesTuyo) + '.</p>' +
      '<a class="btn btn-primario btn-bloque" href="#compra/caminos/arriendo-opcion/' + esc(otro.u.id) + '">Ver ese departamento</a>';
    return '<p class="todavia-salida">Con estos números, ningún departamento de este camino te alcanza.</p>' +
      '<a class="btn btn-primario btn-bloque" href="#compra/caminos">Ver otros caminos</a>';
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
    // S36 (lienzo P60 y P63): arriba cuándo te mudas y cuándo es tuyo; el departamento como chip; los pasos antes de lo que pagas.
    var etq = function (y) { return vive ? 'Es tuyo en' : y.mesesEntrada ? 'Te mudas en' : 'Te mudas'; };
    var num = function (y) { return vive ? textoMeses(y.mesesTuyo) : y.mesesEntrada ? textoMeses(y.mesesEntrada) : 'ya'; };
    var sub = function (y) { return vive ? 'Ya vives en ' + esc(u.nombre) : 'Es tuyo en ' + textoMeses(y.mesesTuyo); };
    var pct = a.mensualidad ? Math.round(a.arriendo / a.mensualidad * 1000) / 10 : 50;
    var pago = tuyo ? '' : '<section class="ar-pago" aria-labelledby="titulo-despues">' +
        '<div class="ar-pago-cab"><svg class="ar-pago-fondo" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11L12 4l8.5 7M5.5 9.5V20h13V9.5M10 20v-5h4v5"/></svg>' +
          '<p id="titulo-despues">' + (vive ? 'Hoy pagas al mes' : 'Al mudarte, pagas al mes') + '</p>' +
          '<strong class="numero">' + formatoRedondeado(a.mensualidad) + '</strong>' +
          '<span class="ar-barra" aria-hidden="true"><i style="width:' + pct + '%"></i><i style="width:' + (100 - pct) + '%"></i></span></div>' +
        '<ul class="pp-lista">' +
          '<li><span class="pp-icono azul" aria-hidden="true">' + icono('i-llave') + '</span><span class="pp-texto"><strong>Arriendo</strong><small>Lo que pagas por vivir ahí</small></span><strong class="ar-monto">' + formatoRedondeado(a.arriendo) + '</strong></li>' +
          '<li><span class="pp-icono verde" aria-hidden="true">' + icono('i-sube') + '</span><span class="pp-texto"><strong>Va a tu pie</strong><small>Se junta cada mes para comprarlo</small></span><strong class="ar-monto verde">' + formatoRedondeado(a.aporte) + '</strong></li>' +
        '</ul>' +
        '<div class="ar-despues"><span class="ar-despues-icono" aria-hidden="true">' + icono('i-casa') + '</span>' +
          '<span class="pp-texto"><small>Después, al comprar</small><strong>Dividendo de ' + formatoRedondeado(a.dividendo) + '</strong></span>' +
          '<span class="ar-uf">' + ufDecimales(a.dividendo / SUPUESTOS.uf, 2) + '</span></div>' +
      '</section>';
    c.innerHTML =
      '<header class="encabezado">' + FIGURAS + campana() +
        '<h1 id="titulo-inicio" class="h2" tabindex="-1">Tu compra</h1>' +
      '</header>' +
      (tuyo
        ? '<section class="noche sin-slider" aria-labelledby="titulo-plazo"><span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">¡Es tuyo!</p><strong class="numero noche-plazo">' + esc(u.nombre) + '</strong>' +
            '<p class="noche-sub">Firmaste la escritura (simulado)</p></section>'
        : !a.cumple
        ? '<section class="tarjeta protagonista todavia-no" aria-labelledby="titulo-plazo"><p class="estado-semaforo">' + icono('i-pronto') + 'Todavía no</p>' +
            '<h2 class="h3" id="titulo-plazo">' + a.razon + '</h2>' + salidaArriendoHtml(u) + '</section>'
        : '<section class="noche mi-compra-fecha" aria-labelledby="titulo-plazo">' +
            '<span class="noche-luna" aria-hidden="true"></span>' +
            '<p class="noche-etiqueta" id="titulo-plazo">' + etq(a) + '</p>' +
            '<strong class="numero noche-plazo' + claseLargo(num(a)) + '" id="numero-plazo" aria-live="polite">' + num(a) + '</strong>' +
            '<span class="freno-llaves" id="freno-llaves">' + sub(a) + '</span>' +
          '</section>') +
      animosInicio() +
      // 20-nov: el departamento, sin píldora: una tarjeta con su foto, como «Tu edificio real» en los otros caminos.
      bloqueRecorrido(tuDeptoArriendo(u, a, vive, tuyo) + pago);
    var rm = $('rango-mensual');
    if (rm) {
      var pintar = function () { var v = Number(rm.value); rm.style.setProperty('--lleno', ((v - minimo) / (maximo - minimo) * 100).toFixed(1) + '%'); return v; };
      pintar();
      rm.addEventListener('input', function () {
        var v = pintar(), y = calc(v);
        $('valor-mensual').textContent = formatoRedondeado(v);
        if ($('numero-plazo') && y.mesesTuyo !== null) $('numero-plazo').textContent = num(y);
        if ($('freno-llaves')) $('freno-llaves').textContent = sub(y);
        var ventana = $('mi-ventana'); if (ventana) { ventana.classList.remove('brilla'); void ventana.offsetWidth; ventana.classList.add('brilla'); }
      });
      rm.addEventListener('change', function () { estado.ahorroMensual = Number(rm.value); guardarEstado(); });
    }
    iniciarSiguientePaso();
  }
  // arriendoOpcion (calculos.js): mensualidad = arriendo + aporte a tu pie; cuándo es tuyo; si se sostiene.
  function fotosArriendo(u) { return fotosUsado(u); }
  function tuDeptoArriendo(u, a, vive, tuyo) {
    if (tuyo) return '';
    var f = fotosArriendo(u)[0];
    return '<a class="tarjeta tu-edificio" href="#departamentos/arriendo/' + esc(u.id) + '">' +
      '<span class="tu-edificio-obra" aria-hidden="true">' + (f ? '<img src="' + f.src + '" alt="" loading="lazy">' : icono('i-casa')) + '</span>' +
      '<span class="tu-edificio-texto"><span class="etiqueta">' + (estado.arriendoElegido === u.id ? 'Tu departamento' : 'Con este calculamos tu fecha') + '</span><strong>' + esc(u.nombre) + '</strong>' +
        '<small>' + fichaArriendo(u) + '</small>' +
        '<small>' + (vive ? 'Ya vives aquí: lo arriendas con opción de compra.' : 'Lo arriendas con opción de compra y, después, es tuyo.') + '</small></span>' +
      '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a>';
  }
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
    if (estado.modo !== 'vivir') { location.replace('#compra/caminos'); return; }
    var perfil = perfilActual();
    var lista = ARRIENDOS_OPCION.map(function (u) { return { u: u, a: arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, perfil) }; })
      .sort(function (x, y) { return (y.a.cumple - x.a.cumple) || (x.a.mesesTuyo - y.a.mesesTuyo); });
    cont.innerHTML =
      '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>' +
      '<header class="encabezado">' +
        '<div class="camino-cabeza"><span class="chip chip-propuesta">Propuesta</span></div>' +
        '<h1 id="titulo-caminos" class="h2">Arriendo con opción de compra</h1>' +
        '<p class="texto-apoyo camino-descripcion">Entras con el 5' + NBSP + '% y arriendas. Parte de cada cuota va a tu pie. Con el 20' + NBSP + '%, Bci te presta el resto.</p>' +
      '</header>' +
      '<p class="texto-apoyo"><small>Existe con otras empresas; con Bci es propuesta.</small></p>' +
      // Comentario 9-nov: ¿Cómo funciona? y ¿Y si me arrepiento? van solo en el detalle de cada departamento.
      (estado.caminoElegido === 'arriendo-opcion' ? '<p class="chip chip-recomendado">Tu camino</p>' : '<button type="button" class="btn btn-mi-camino" id="btn-arriendo-camino" aria-haspopup="dialog">Elegir este camino</button>') +
      '<h2 class="h3 camino-explorar-titulo">Departamentos</h2>' +
      '<ul class="lista-usados">' + lista.map(function (x, i) {
        var u = x.u, a = x.a;
        var t = u.dormitorios === 2 ? '2d' : u.dormitorios === 1 ? '1d' : 'estudio';
        var foto = hayFotos() && FOTOS.interiores[t + (i % 2 ? '-cocina' : '-living')];
        return '<li class="tarjeta usado">' +
          (foto ? '<img class="usado-foto" src="fotos/interiores/' + encodeURI(foto) + '" alt="' + (i % 2 ? 'Cocina' : 'Living') + ' de un departamento de ' + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'un ambiente') + ' (foto referencial)" loading="lazy" width="800" height="600">' : '') +
          '<span class="usado-etiqueta">Terminado' + SEP + (a.mesesEntrada ? 'te mudas en ' + textoMeses(a.mesesEntrada) : 'te mudas ya') + '</span>' +
          '<h3 class="tp-nombre"><a class="usado-enlace" href="#compra/caminos/arriendo-opcion/' + esc(u.id) + '">' + esc(u.nombre) + '</a></h3>' +
          '<p class="tp-ficha">' + fichaArriendo(u) + '</p>' +
          '<p class="tp-etiqueta">Pagas al mes</p>' +
          '<p class="usado-precio"><strong class="tp-cifra">' + formatoRedondeado(a.mensualidad) + '</strong> <span>' + formatoRedondeado(a.aporte) + ' va a tu pie</span></p>' +
          '<p class="tp-linea">' + (a.cumple ? 'Es tuyo en ' + textoMeses(a.mesesTuyo) : 'Todavía no' + SEP + primeraMinuscula(a.razon)) + '</p>' +
        '</li>';
      }).join('') + '</ul>' +
      '<p class="llega-sello">' + icono('i-escudo') + 'Sin contar que el departamento suba de precio</p>' +
      '<p class="texto-apoyo texto-centro"><small>Ejemplos simulados' + SEP + 'fotos referenciales</small></p>';
    if ($('btn-arriendo-camino')) $('btn-arriendo-camino').addEventListener('click', function () { confirmarArriendo($('btn-arriendo-camino')); });
    ponerOtrosCaminos(cont, 'arriendo-opcion');
  }
  function renderArriendoDepto(id) {
    var cont = $('caminos-contenido');
    var u = ARRIENDOS_OPCION.filter(function (x) { return x.id === id; })[0];
    if (!u || estado.modo !== 'vivir') { location.replace('#compra/caminos/arriendo-opcion'); return; }
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
      '<a href="#departamentos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Departamentos</a>' +
      '<header class="detalle-cabecera">' +
        '<h1 id="titulo-caminos" class="h2">' + esc(u.nombre) + '</h1>' +
        '<span class="tp-tipo verde">Arriendo con opción de compra</span>' +
        '<p class="texto-apoyo">' + fichaArriendo(u) + '</p>' +
      '</header>' +
      galeria(fotosArriendo(u)) +
      // S36 (lienzo P62): el mismo sistema del detalle: arriba lo que pagas y cuándo es tuyo; abajo, pestañas.
      '<section class="det-precio" aria-labelledby="ao-tuyo">' +
        '<p class="det-etq">Pagas al mes</p>' +
        '<div class="det-precio-fila"><strong class="det-precio-num">' + formatoRedondeado(a.mensualidad) + '</strong>' +
          '<span class="det-ahorras">' + formatoRedondeado(a.aporte) + ' va a tu pie</span></div>' +
        '<p class="det-tuyo" id="ao-tuyo">' + icono('i-calendario') + '<span>' + (a.cumple ? 'Sería tuyo <strong>aprox. ' + fechaLlaves(a.mesesTuyo, hoy) + '</strong>' + SEP + (m0 ? 'te mudas en ' + textoMeses(m0) : 'te mudas ya') : a.razon) + '</span></p></section>' +
      pestanasDetalle(u, [
        ['numeros', 'Números',
          '<div class="det-cifras"><div><small>Para entrar, el 5' + NBSP + '%</small><strong>' + formatoRedondeado(a.entrada) + '</strong><small>en tu cuenta de vivienda</small></div>' +
            '<div><small>Precio de compra</small><strong>' + formatoRedondeado(ufAPesos(u.listaUF)) + '</strong><small>' + formatoUF(u.listaUF) + ' fijo</small></div></div>' +
          '<ul class="detalle-filas">' +
            '<li><span>Arriendo</span><strong>' + formatoRedondeado(a.arriendo) + '</strong></li>' +
            '<li><span>Va a tu pie</span><strong>' + formatoRedondeado(a.aporte) + '</strong></li>' +
            (a.pctIngreso !== null ? '<li class="suave"><span>Es de tu ingreso</span><span>' + formatoPorcentaje(a.pctIngreso, 0) + '</span></li>' : '') +
            '<li><span>Juntas antes de comprar</span><strong>' + formatoRedondeado(a.meta) + '</strong></li>' +
            '<li><span>Dividendo al mes (con seguros)</span><span class="en-uf"><strong>' + formatoRedondeado(a.dividendo) + '</strong><small>' + ufDecimales(a.dividendo / SUPUESTOS.uf, 2) + '</small></span></li>' +
            '<li class="suave"><span>Peor caso</span><span>' + formatoRedondeado(a.dividendoPeor) + SEP + ufDecimales(a.dividendoPeor / SUPUESTOS.uf, 2) + '</span></li>' +
          '</ul>' +
          '<section class="tarjeta bloque" aria-labelledby="ao-cuando"><h2 class="h4" id="ao-cuando">Cuándo pasa a ser tuyo</h2>' +
            '<ol class="arriendo-linea">' + linea.map(function (x, i) {
              return '<li' + (i === linea.length - 1 ? ' class="final"' : '') + '><span class="arriendo-cuando">' + x[0] + '</span><span>' + x[1] + '</span></li>';
            }).join('') + '</ol>' +
            '<p class="texto-apoyo"><small>Mientras arriendas, el departamento es del socio. Es tuyo al firmar la escritura. Bci presta el 80' + NBSP + '% sin subsidio a la tasa (segunda venta).</small></p></section>' +
          plegable('arriendo-arrepiento', '¿Y si al final no compro?', 'Recuperas tu ahorro y la mitad de tus aportes', siMeArrepientoArriendo())],
        BARRIOS[u.comuna] ? ['barrio', 'Barrio', barrioSolo(u)] : null,
        ['visita', 'Visita', visitaHtml(u)]
      ]) +
      '<p class="llega-sello detalle-sello">' + icono('i-escudo') + 'Sin contar que el departamento suba de precio</p>' +
      (esArriendo() && estado.arriendoElegido === u.id
        ? '<div class="accion-fija detalle-accion"><p class="aviso">Es tu departamento.</p><a class="btn btn-secundario-dark btn-bloque" href="#compra">Ver tu compra</a></div>'
        : '<div class="accion-fija detalle-accion"><button type="button" class="btn btn-primario btn-lg btn-bloque" id="btn-arriendo-depto">Quiero este departamento</button></div>') +
      '<p class="texto-apoyo texto-centro"><small>Ejemplo simulado' + SEP + 'fotos referenciales' + SEP + 'arriendo: ' + u.origenArriendo + '</small></p>';
    iniciarGalerias(cont);
    iniciarPlegables();
    iniciarPestanasDetalle(cont);
    iniciarVisita(u);
    if ($('btn-arriendo-depto')) $('btn-arriendo-depto').addEventListener('click', function () { confirmarArriendo($('btn-arriendo-depto'), u); });
  }

  // 11-nov: "Elegir este camino" (S30): antes de confirmar se ven los pasos de ese camino y, al confirmar, vas a Tus pasos.
  function pasosDeCamino(id) {
    var g = { c: estado.caminoElegido, p: estado.piezas, k: estado.compra };
    try {
      if (choqueCompra(id)) estado.compra = null;
      estado.caminoElegido = id;
      if (estado.modo === 'vivir' && CAMINOS[id] && !CAMINOS[id].ficha) estado.piezas = Object.assign({}, estado.piezas, { grupo: !!CAMINOS[id].grupo, respaldo: !!CAMINOS[id].familiar });
      return hitoActual(fotoPasos());
    } finally { estado.caminoElegido = g.c; estado.piezas = g.p; estado.compra = g.k; }
  }
  // 11-nov: tu departamento elegido es de otro tipo (en grupo o solo) que este camino.
  function choqueCompra(id) {
    var p = proyectoCompra();
    return !!(p && CAMINOS[id] && !CAMINOS[id].ficha && enGrupoDe(p) !== !!CAMINOS[id].grupo) || !!(p && id === 'arriendo-opcion');
  }
  function listaPasosPrevia(h) {
    return '<ol class="pasos-previa">' + h.hitos.map(function (x, i) {
      return '<li class="' + x.estado + '"><span class="pasos-previa-num" aria-hidden="true">' + (x.estado === 'hecho' ? icono('i-check') : i + 1) + '</span>' +
        '<span><strong>' + x.nombre + '</strong><small>' + (x.estado === 'hecho' ? 'Ya lo hiciste' : x.gana) + '</small></span></li>';
    }).join('') + '</ol>';
  }
  // ---------- S32-B4: Comparar caminos ----------
  // Los cuatro caminos para vivir, con los números que ya calcula la app (D13: nada del prototipo).
  var CAMINOS_COMPARAR = ['grupo-vivir', 'individual-vivir', 'familiar-vivir', 'usados', 'arriendo-opcion'];
  // S35: los caminos para arrendar, en el mismo Comparar (el grupo y el pie compartido ya no van juntos, S26).
  var CAMINOS_ARRENDAR = ['pie-compartido', 'grupo-invertir', 'individual-invertir', 'familiar-invertir'];
  function esArrendarCamino(id) { return CAMINOS_ARRENDAR.indexOf(id) !== -1; }
  // S31: del sí del banco a las llaves son «2 a 3 meses» (TOTAL_SI_A_LLAVES); para comparar, el caso conservador.
  var MESES_SI_A_LLAVES = 3;
  var INFO_CAMINO = {
    'grupo-vivir': { bueno: 'Descuento por comprar juntos', ojo: 'Esperas que termine la obra', depto: 'Nuevo, en obra',
      que: 'Te unes a otras personas para comprar en un mismo edificio en obra. Cada uno con su propio departamento y su propio crédito.',
      como: ['Eliges el edificio y aseguras tu cupo con tu preaprobación Bci.', 'Pagas tu pie en cuotas mientras se construye.', 'Bci confirma tu crédito, firmas y recibes tus llaves.'],
      para: 'Si quieres pagar menos y puedes esperar la obra.',
      cuidado: 'Esperas que terminen la obra para firmar.' },
    'individual-vivir': { bueno: 'Pie de solo 10' + NBSP + '%', ojo: 'Solo departamentos nuevos', depto: 'Nuevo',
      que: 'El crédito de siempre: compras solo, un departamento nuevo o usado. La garantía del Estado (FOGAES) es una ayuda: en uno nuevo, Bci te presta hasta el 90' + NBSP + '% y juntas el 10' + NBSP + '%.',
      como: ['Eliges un departamento nuevo.', 'Juntas el 10' + NBSP + '% en tu cuenta de vivienda.', 'Bci te preaprueba; reservas, firmas y recibes tus llaves.'],
      para: 'Si quieres un departamento nuevo y juntar menos pie.',
      cuidado: 'Solo departamentos nuevos, de hasta ' + formatoUF(SUPUESTOS.topeFogaesUF) + '.' },
    // 20-nov: la garantía de un familiar (propuesta; referente: Barclays Family Springboard).
    'familiar-vivir': { bueno: 'Pie de solo 5' + NBSP + '%', ojo: 'Depende de tu familiar', depto: 'Nuevo',
      que: 'Un familiar deja el 10' + NBSP + '% del precio en una cuenta Bci, como garantía. Bci te presta el 95' + NBSP + '% y tú juntas el 5' + NBSP + '% y los gastos.',
      como: ['Tu familiar deja el 10' + NBSP + '% en una cuenta Bci, con intereses.', 'Juntas el 5' + NBSP + '% y Bci te presta el 95' + NBSP + '%.', 'Cuando tu deuda baja al 80' + NBSP + '%, el dinero vuelve a tu familiar.'],
      para: 'Si un familiar puede dejar dinero guardado unos años.',
      cuidado: 'Es una propuesta: hoy no existe en Chile. Si no pagas y hay remate, tu familiar puede perder su garantía.' },
    usados: { bueno: 'Sirve para usados', ojo: 'Pie del 20' + NBSP + '%: tardas más', depto: 'Nuevo o usado',
      que: 'El crédito de siempre: Bci te presta el 80' + NBSP + '% y tú juntas el 20' + NBSP + '%. Es el que sirve para departamentos usados.',
      como: ['Eliges un departamento nuevo o usado.', 'Juntas el 20' + NBSP + '% en tu cuenta de vivienda.', 'Bci te preaprueba; reservas, firmas y recibes tus llaves.'],
      para: 'Si buscas un usado, o un barrio sin proyectos nuevos.',
      cuidado: 'Juntas el doble de pie que con la garantía del Estado (solo en nuevos): llegas más tarde.' },
    // S35: los caminos para arrendar, con la misma ficha.
    'pie-compartido': { bueno: 'Pones solo el 5' + NBSP + '%', ojo: 'Compartes una parte al principio', depto: 'Nuevo',
      que: 'Unos inversionistas ponen el 15' + NBSP + '% a cambio de una parte del departamento. Con el arriendo les compras su parte, mes a mes.',
      como: ['Eliges un departamento que rinde con su arriendo.', 'Juntas el 5' + NBSP + '% y los gastos; ellos ponen el 15' + NBSP + '%.', 'Firmas con Bci (80' + NBSP + '%) y el arriendo recompra su parte.'],
      para: 'Si quieres invertir con poco ahorro.',
      cuidado: 'Mientras recompras, ellos reciben 6' + NBSP + '% al año en UF sobre su parte. Ganancias y pérdidas se reparten según la parte de cada uno.' },
    'grupo-invertir': { bueno: 'Descuento por comprar juntos', ojo: 'Esperas que termine la obra', depto: 'Nuevo, en obra',
      que: 'Te unes a otras personas para comprar en un mismo edificio en obra. Cada uno con su departamento y su crédito al 80' + NBSP + '%.',
      como: ['Eliges el edificio y aseguras tu cupo con tu preaprobación Bci.', 'Pagas tu pie del 20' + NBSP + '% en cuotas mientras se construye.', 'Bci confirma tu crédito, firmas y lo arriendas.'],
      para: 'Si quieres pagar menos y puedes esperar la obra.',
      cuidado: 'Esperas que terminen la obra para firmar y arrendarlo.' },
    // 20-nov: la garantía de un familiar también para arrendar (el departamento es todo tuyo, sin inversionistas).
    'familiar-invertir': { bueno: 'Pones solo el 5' + NBSP + '%', ojo: 'Depende de tu familiar', depto: 'Nuevo',
      que: 'Un familiar deja el 10' + NBSP + '% del precio en una cuenta Bci, como garantía. Bci te presta el 95' + NBSP + '% y el departamento es todo tuyo, sin inversionistas.',
      como: ['Tu familiar deja el 10' + NBSP + '% en una cuenta Bci, con intereses.', 'Juntas el 5' + NBSP + '% y Bci te presta el 95' + NBSP + '%.', 'Lo arriendas y, cuando tu deuda baja al 80' + NBSP + '%, el dinero vuelve a tu familiar.'],
      para: 'Si quieres invertir con poco ahorro y un familiar puede dejar dinero guardado unos años.',
      cuidado: 'Es una propuesta: hoy no existe en Chile. Si un mes no lo arriendas, el dividendo lo pagas tú; si no pagas y hay remate, tu familiar puede perder su garantía.' },
    'individual-invertir': { bueno: 'Sirve para nuevos y usados', ojo: 'Pie del 20' + NBSP + '%: tardas más', depto: 'Nuevo o usado',
      que: 'El crédito de siempre: Bci te presta el 80' + NBSP + '% y tú juntas el 20' + NBSP + '% y los gastos.',
      como: ['Eliges un departamento nuevo o usado.', 'Juntas el 20' + NBSP + '% en tu cuenta de vivienda.', 'Bci te preaprueba; firmas y lo arriendas.'],
      para: 'Si quieres arrendarlo pronto, ya terminado.',
      cuidado: 'Si un mes no lo arriendas, el dividendo lo pagas tú.' },
    'arriendo-opcion': { bueno: 'Te mudas casi ya', ojo: 'Es tuyo desde el tercer año', depto: 'Nuevo, del socio',
      que: 'Te mudas ahora a un departamento nuevo y parte de lo que pagas cada mes va a tu pie.',
      como: ['Eliges el departamento y juntas la entrada (5' + NBSP + '%).', 'Firmas el contrato con precio fijo en UF y te mudas.', 'Desde el tercer año se lo compras al socio con crédito Bci.'],
      para: 'Si quieres dejar tu arriendo actual cuanto antes.',
      cuidado: 'Es tuyo recién desde el tercer año de contrato. Si te vas antes, recuperas solo una parte de tu pie.' }
  };
  // ---------- S33-C6 (E3): Conoce los caminos, con ilustraciones ----------
  // Dibujos simples con los colores Bci: un edificio por camino y lo que lo distingue.
  function edificioDibujo(x, y, an, al, color, luz) {
    var v = '', filas = Math.floor((al - 14) / 12), cols = Math.floor((an - 8) / 12);
    for (var f = 0; f < filas; f++) for (var c = 0; c < cols; c++)
      v += '<rect x="' + (x + 6 + c * 12) + '" y="' + (y + 6 + f * 12) + '" width="7" height="7" rx="1" fill="' + luz + '"/>';
    return '<rect x="' + x + '" y="' + y + '" width="' + an + '" height="' + al + '" rx="3" fill="' + color + '"/>' + v;
  }
  function personita(x, y, ropa) {
    return '<circle cx="' + x + '" cy="' + (y - 16) + '" r="6" fill="#E8BFA0"/><path d="M' + (x - 8) + ' ' + y + 'q8-12 16 0z" fill="' + ropa + '"/>';
  }
  var DIBUJO_CAMINO = {
    'grupo-vivir': function () {
      return edificioDibujo(118, 34, 70, 86, '#1D5699', '#D4E3F5') +
        // S36: sin grúa; una insignia verde con el ícono de grupo, como el escudo del camino con garantía.
        '<circle cx="236" cy="60" r="24" fill="#28892B"/><g fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round">' +
        '<circle cx="236" cy="51" r="5"/><circle cx="223" cy="56" r="3.6"/><circle cx="249" cy="56" r="3.6"/>' +
        '<path d="M227 72c0-5.5 4-9 9-9s9 3.5 9 9M215 70c0-3.4 2.2-6 5.2-6.4M257 70c0-3.4-2.2-6-5.2-6.4"/></g>' +
        personita(62, 122, '#28892B') + personita(84, 122, '#2772CC') + personita(240, 122, '#546E7A') + personita(262, 122, '#28652B');
    },
    'individual-vivir': function () {
      return edificioDibujo(110, 26, 80, 94, '#2772CC', '#FFF9CC') +
        '<path d="M228 40l26 10v18c0 16-11 26-26 32-15-6-26-16-26-32V50z" fill="#28892B"/><path d="M216 70l8 8 16-17" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        personita(76, 122, '#1D5699');
    },
    'familiar-vivir': function () {
      return edificioDibujo(150, 30, 74, 90, '#3B5A9A', '#DCE2F0') +
        '<circle cx="262" cy="56" r="22" fill="#243B6B"/><path d="M262 70s-11-6.8-11-14.2a5.6 5.6 0 0 1 11-2.6 5.6 5.6 0 0 1 11 2.6c0 7.4-11 14.2-11 14.2z" fill="#FFFFFF"/>' +
        personita(64, 122, '#546E7A') + '<path d="M58 105a6 6 0 0 1 12 0" fill="none" stroke="#BBC5CA" stroke-width="3"/>' +
        personita(90, 122, '#2772CC');
    },
    usados: function () {
      return edificioDibujo(70, 40, 76, 80, '#546E7A', '#FFE933') + edificioDibujo(150, 56, 56, 64, '#37474F', '#FFF499') +
        '<circle cx="246" cy="70" r="14" fill="none" stroke="#546E7A" stroke-width="5"/><path d="M256 80l26 26M268 92l6-6M276 100l6-6" stroke="#546E7A" stroke-width="5" stroke-linecap="round"/>';
    },
    'arriendo-opcion': function () {
      return edificioDibujo(150, 30, 74, 90, '#28652B', '#D4E7D5') +
        '<rect x="62" y="96" width="34" height="26" rx="2" fill="#E8BFA0"/><path d="M62 104h34M79 96v8" stroke="#B88A64" stroke-width="2"/>' +
        '<path d="M104 104h34m-8-8 8 8-8 8" stroke="#2772CC" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        personita(250, 122, '#2772CC') + '<circle cx="262" cy="50" r="10" fill="#FFE300"/><path d="M262 60v18m0-6h6" stroke="#736600" stroke-width="3" stroke-linecap="round"/>';
    }
  };
  // S35: los caminos para arrendar. El grupo y el crédito al 80 % usan el dibujo de su par para vivir.
  DIBUJO_CAMINO['grupo-invertir'] = DIBUJO_CAMINO['grupo-vivir'];
  DIBUJO_CAMINO['individual-invertir'] = DIBUJO_CAMINO.usados;
  DIBUJO_CAMINO['familiar-invertir'] = DIBUJO_CAMINO['familiar-vivir'];
  DIBUJO_CAMINO['pie-compartido'] = function () {
    return edificioDibujo(116, 30, 80, 90, '#2772CC', '#FFF9CC') + personita(70, 122, '#28892B') +
      personita(240, 122, '#546E7A') + personita(264, 122, '#28652B') +
      '<circle cx="226" cy="62" r="12" fill="#FFE300"/><circle cx="250" cy="50" r="12" fill="#FFE933"/>' +
      '<path d="M220 62h12M244 50h12" stroke="#736600" stroke-width="3" stroke-linecap="round"/>';
  };
  function ilustracionCamino(id, clase) {
    var d = DIBUJO_CAMINO[id];
    if (!d) return '';
    return '<svg class="ilustracion-camino ' + (clase || '') + '" viewBox="0 0 320 130" aria-hidden="true" focusable="false">' +
      '<rect x="0" y="0" width="320" height="130" rx="18" fill="#D4E3F5"/><circle cx="286" cy="26" r="10" fill="#FFF499"/>' +
      '<rect x="0" y="120" width="320" height="10" fill="#A9D0AA"/>' + d() + '</svg>';
  }
  var ICONOS_COMO = {
    'grupo-vivir': ['i-grupo', 'i-alcancia', 'i-llave'],
    'individual-vivir': ['i-casa', 'i-alcancia', 'i-llave'],
    usados: ['i-casa', 'i-alcancia', 'i-llave'],
    'familiar-vivir': ['i-grupo', 'i-alcancia', 'i-llave'], 'familiar-invertir': ['i-grupo', 'i-alcancia', 'i-llave'],
    'arriendo-opcion': ['i-alcancia', 'i-documento', 'i-llave'],
    'pie-compartido': ['i-casa', 'i-grupo', 'i-llave'],
    'grupo-invertir': ['i-grupo', 'i-alcancia', 'i-llave'],
    'individual-invertir': ['i-casa', 'i-alcancia', 'i-llave']
  };
  // Cómo funciona en 3 pasos, con un ícono por paso.
  function pasosVisuales(id) {
    var inf = INFO_CAMINO[id];
    if (!inf) return '';
    return '<ol class="como-visual">' + inf.como.map(function (t, i) {
      return '<li><span class="cv-icono" aria-hidden="true">' + icono(ICONOS_COMO[id][i]) + '<b>' + (i + 1) + '</b></span><span>' + t + '</span></li>';
    }).join('') + '</ol>';
  }
  // Arriba de Comparar caminos: una tarjeta ilustrada por camino que se desliza.
  function conoceCaminosHtml(ids) {
    return '<section class="conoce-caminos" aria-labelledby="titulo-conoce"><h2 class="h5" id="titulo-conoce">Conoce los caminos</h2>' +
      '<ul class="conoce-pista">' + ids.map(function (id) {
        return '<li><a class="conoce-tarjeta" href="' + rutaCamino(id) + '">' + ilustracionCamino(id) +
          '<strong>' + nombreCamino(id) + '</strong><small>' + INFO_CAMINO[id].bueno + '</small><span class="conoce-ir">Cómo funciona ›</span></a></li>';
      }).join('') + '</ul></section>';
  }
  var PRIORIDADES = [['antes', 'Llegar antes'], ['menos', 'Pagar menos al mes'], ['ya', 'Mudarme ya']];
  var comparaSel = null;
  function nombreCamino(id) { return CAMINOS[id] ? CAMINOS[id].nombre : id; }
  // Mes corto para tarjetas chicas: «dic 2028».
  function mesCorto(m) { if (m === null || m === undefined) return 'Todavía no'; var t = fechaLlaves(m, hoyDemo()).split(' de '); return t[0].slice(0, 3) + ' ' + t[1]; }
  function mesTuyo(m) { return m === null || m === undefined ? 'Todavía no' : 'aprox. ' + fechaLlaves(m, hoyDemo()); }
  function mesPlazo(m) { return m === null || m === undefined ? 'Todavía no' : m <= 0 ? 'Ya' : 'aprox. ' + fechaLlaves(m, hoyDemo()); }
  // Te mudas, es tuyo, pie, pagas al mes y si te alcanza, para un camino y lo que juntas al mes.
  // S32-B5: con un departamento meta elegido, tu fecha sale de ese departamento (no del rango).
  function mesesMeta() {
    var pc = proyectoCompra();
    if (pc) return plazoTuPie(pc, metaCompra(pc)).meses;
    var uz = estado.caminoElegido === 'usados' && USADOS.filter(function (u) { return u.id === estado.usadoElegido; })[0];
    if (uz) {
      var perfil = perfilActual();
      var falta = Math.max(0, ufAPesos(uz.listaUF * (1 - SUPUESTOS_PIEZAS.creditoSiempre) + gastosUF(uz.listaUF)) - (perfil.ahorroActual || 0));
      var mz = falta === 0 ? 0 : mesesParaMeta(falta, perfil.ahorroMensual);
      return mz === null || !isFinite(mz) ? null : mz;
    }
    return undefined;
  }
  function numerosComparar(id, mensual) {
    var conMeta = id === estado.caminoElegido && id !== 'arriendo-opcion' && (!mensual || mensual === (estado.ahorroMensual || 300000));
    var r0 = numerosCaminoRango(id, mensual);
    if (conMeta) {
      var mm = mesesMeta();
      if (mm !== undefined) { r0.tuyo = r0.mudas = mm === null ? null : mm + MESES_SI_A_LLAVES; r0.cumple = mm !== null; }
    }
    return r0;
  }
  function numerosCaminoRango(id, mensual) {
    mensual = mensual || estado.ahorroMensual || 300000;
    var perfil = perfilActual();
    var mas = function (m, k) { return m === null || m === undefined ? null : m + k; };
    try {
      // S35: para arrendar no te mudas; la fecha es cuándo firmas (juntas tu pie + del sí del banco a la firma).
      if (esArrendarCamino(id)) {
        var na = numerosCamino(id, listaMeta(), Object.assign({}, perfil, { ahorroMensual: mensual }));
        var oka = !!(na.evaluacion && na.evaluacion.cumple) && na.meses !== null;
        return { id: id, cumple: oka, mudas: null, tuyo: oka ? na.meses + MESES_SI_A_LLAVES : null,
          pie: na.alEscriturar, pieNota: 'pie y gastos', pagas: na.dividendo, pagasNota: 'dividendo', dividendo: na.dividendo };
      }
      if (id === 'arriendo-opcion') {
        var u = arriendoActual().u;
        var a = arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, Object.assign({}, perfil, { ahorroMensual: mensual }));
        return { id: id, cumple: !!a.cumple, mudas: a.cumple ? a.mesesEntrada : null, tuyo: a.cumple ? a.mesesTuyo : null,
          pie: a.entrada, pieNota: 'la entrada', pagas: a.mensualidad, pagasNota: 'arriendo y tu pie', dividendo: a.dividendo };
      }
      if (id === 'usados') {
        var t = plazoTradicional(mensual), lista = t.deptos.hasta.listaUF;
        var razon = razonTodaviaNo(perfil, t.hasta.dividendo);
        var mt = razon ? null : mas(t.hasta.meses, MESES_SI_A_LLAVES);
        return { id: id, cumple: !razon, mudas: mt, tuyo: mt, pie: ufAPesos(lista * (1 - SUPUESTOS_PIEZAS.creditoSiempre) + gastosUF(lista)),
          pieNota: 'pie y gastos', pagas: t.hasta.dividendo, pagasNota: 'dividendo', dividendo: t.hasta.dividendo };
      }
      var on = Object.assign({}, piezasOn(), { grupo: !!CAMINOS[id].grupo, respaldo: !!CAMINOS[id].familiar });
      var y = plazoVivir(mensual, on);
      var cabe = !evaluarCabe(on).razon;
      var mv = cabe ? mas(y.hasta.meses, MESES_SI_A_LLAVES) : null;
      return { id: id, cumple: cabe, mudas: mv, tuyo: mv, pie: y.hasta.meta, pieNota: 'pie y gastos', pagas: y.hasta.dividendo, pagasNota: 'dividendo', dividendo: y.hasta.dividendo };
    } catch (e) {
      return { id: id, cumple: false, mudas: null, tuyo: null, pie: null, pagas: null, dividendo: null };
    }
  }
  // Los caminos que se comparan: el en grupo solo si hay un grupo a tu alcance (o si ya es el tuyo).
  function idsComparar() {
    var pf = perfilActual();
    var lista = estado.modo === 'arrendar' ? CAMINOS_ARRENDAR : CAMINOS_COMPARAR;
    return lista.filter(function (id) { return !CAMINOS[id].grupo || pf.hayGrupo || estado.caminoElegido === id; });
  }
  // «Para ti»: sin prioridad, el que recomienda la app; con prioridad, el mejor en eso.
  function paraTiComparar(nums) {
    var ok = nums.filter(function (n) { return n.cumple && n.tuyo !== null; });
    if (!ok.length) return null;
    var p = estado.prioridad;
    if (!p) { var r = recomendadoParaTi(); return r && nums.some(function (n) { return n.id === r.id; }) ? r.id : null; }
    var clave = p === 'antes' ? 'tuyo' : p === 'menos' ? 'dividendo' : 'mudas';
    return ok.slice().sort(function (a, b) { return (a[clave] === null ? 1e9 : a[clave]) - (b[clave] === null ? 1e9 : b[clave]); })[0].id;
  }
  function selloComparar(id, paraTi) {
    return id === estado.caminoElegido ? '<span class="sello-para-ti sello-tuyo">' + icono('i-check') + 'Tu camino</span>'
      : id === paraTi ? selloParaTi() : '';
  }
  // S36 (lienzo P13): una línea de tiempo con los años y una barra del color de cada camino (sin rojo ni amarillo).
  function carreraHtml(nums, paraTi) {
    var max = Math.max.apply(null, nums.map(function (n) { return n.tuyo || 0; }).concat([12]));
    var hoy = new Date(hoyDemo()), mes0 = hoy.getMonth();
    var anioFin = hoy.getFullYear() + Math.ceil((max + mes0 + 1) / 12);
    var total = (anioFin - hoy.getFullYear()) * 12 - mes0;
    var pasoA = anioFin - hoy.getFullYear() > 6 ? 2 : 1, anios = [];
    for (var y = hoy.getFullYear() + 1; y <= anioFin; y += pasoA) anios.push('<span style="left:' + (((y - hoy.getFullYear()) * 12 - mes0) / total * 100).toFixed(1) + '%">' + y + '</span>');
    var pct = function (m) { return Math.max(4, Math.min(100, Math.round(m / total * 100))) + '%'; };
    // 20-nov: sin la línea de años arriba ni la fecha escrita bajo cada camino; la barra muestra cuánto falta.
    return '<ul class="carrera-lista cr-lista">' + nums.map(function (n) {
      var sel = comparaSel.indexOf(n.id) !== -1;
      var nota = n.id === 'arriendo-opcion' ? (n.mudas === null ? INFO_CAMINO[n.id].ojo : 'Te mudas ' + (n.mudas <= 0 ? 'ya' : mesPlazo(n.mudas).replace('aprox. ', 'en ')))
        : (DATOS_CAMINO[n.id] ? DATOS_CAMINO[n.id][0] : '') + SEP + INFO_CAMINO[n.id].depto;
      return '<li class="carrera-item cr-item' + (sel ? ' sel' : '') + '" style="' + varsCamino(n.id) + '">' +
        '<button type="button" class="carrera-fila" data-comparar="' + n.id + '" aria-pressed="' + sel + '">' +
          '<span class="carrera-cab"><span class="cr-punto" aria-hidden="true"></span><strong>' + nombreCamino(n.id) + '</strong>' + selloComparar(n.id, paraTi) +
            (sel ? '<span class="cr-check" aria-hidden="true">' + icono('i-check') + '</span>' : '') + '</span>' +
          '<span class="cr-pista" aria-hidden="true"><i style="width:' + (n.tuyo === null ? 0 : pct(n.tuyo)) + '"></i>' +
            (n.id === 'arriendo-opcion' && n.mudas !== null ? '<b style="left:' + pct(Math.max(0, n.mudas)) + '"></b>' : '') + '</span>' +
          '<span class="carrera-pie"><span class="carrera-fecha">' + (n.tuyo === null ? 'Todavía no te alcanza' : (esArrendarCamino(n.id) ? 'Firmas ' : 'Recibes tus llaves ') + mesTuyo(n.tuyo)) + '</span></span>' +
        '</button>' +
        '<button type="button" class="carrera-info" data-info-camino="' + n.id + '" aria-haspopup="dialog" aria-label="Cómo funciona ' + nombreCamino(n.id) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5h.01"/></svg></button>' +
      '</li>';
    }).join('') + '</ul>' +
    (nums.some(function (n) { return n.id === 'arriendo-opcion'; }) ? '<p class="cr-leyenda"><b aria-hidden="true"></b>Te mudas (arriendo con opción de compra)</p>' : '');
  }
  function ladoALadoHtml(nums) {
    var dos = comparaSel.map(function (id) { return nums.filter(function (n) { return n.id === id; })[0]; }).filter(Boolean);
    if (dos.length < 2) return '<p class="texto-apoyo lado-vacio"><small>Toca otro camino para verlos lado a lado.</small></p>';
    // 20-nov (como en Claude Design): dos columnas, una por camino, con solo lo importante.
    var plata = function (v) { return v === null || v === undefined ? '—' : formatoRedondeado(v); };
    var dato = function (etq, val, nota, clase) { return '<span class="ll-dato' + (clase ? ' ' + clase : '') + '"><small>' + etq + '</small><strong>' + val + '</strong>' + (nota ? '<small>' + nota + '</small>' : '') + '</span>'; };
    return '<div class="lado-a-lado"><div class="ll-columnas">' + dos.map(function (n) {
      var c = COLOR_CAMINO[n.id] || COLOR_CAMINO.todos;
      return '<div class="ll-col" style="border-top-color:' + c[1] + '">' +
        '<strong class="ll-nombre">' + nombreCamino(n.id) + '</strong>' +
        dato(estado.modo === 'arrendar' ? 'Firmas' : 'Llaves', mesTuyo(n.tuyo).replace('aprox. ', ''), '', 'fuerte') +
        (n.id === 'arriendo-opcion' ? dato('Te mudas', n.mudas !== null && n.mudas <= 0 ? 'Ya' : mesPlazo(n.mudas).replace('aprox. ', '')) : '') +
        dato('Juntas', plata(n.pie), n.pieNota || 'pie y gastos') +
        dato('Pagas al mes', plata(n.pagas), n.pagasNota || 'dividendo') +
        '<span class="ll-bueno">' + icono('i-check') + INFO_CAMINO[n.id].bueno + '</span>' +
        '<span class="ll-ojo">' + icono('i-info') + INFO_CAMINO[n.id].ojo + '</span>' +
        (n.id === estado.caminoElegido ? '<span class="lado-tuyo">' + icono('i-check') + 'Tu camino</span>'
          : '<button type="button" class="btn btn-secundario ll-elegir" data-elegir-camino="' + n.id + '" aria-haspopup="dialog">Elegir</button>') +
      '</div>';
    }).join('') + '</div></div>';
  }
  function rutaCamino(id) { return '#compra/caminos/' + id; }
  // La barra «Antes ibas por X · Volver», hasta que avanzas un paso.
  function barraCaminoAnterior() {
    var ca = estado.caminoAnterior;
    if (!ca || !CAMINOS[ca.id] || ca.id === estado.caminoElegido) return '';
    if (listosDe(hitoActual(fotoPasos())) > ca.listos) { estado.caminoAnterior = null; guardarEstado(); return ''; }
    return '<div class="camino-anterior" role="status"><span>Antes ibas por <strong>' + CAMINOS[ca.id].corto + '</strong>.</span>' +
      '<button type="button" class="btn btn-secundario-dark btn-chico" data-volver-camino>Volver</button></div>';
  }
  function iniciarCaminoAnterior(cont) {
    (cont || document).querySelectorAll('[data-volver-camino]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ca = estado.caminoAnterior;
        if (!ca) return;
        aplicarCamino(ca.id);
        estado.caminoAnterior = null;
        guardarEstado();
        toast('Volviste a ' + primeraMinuscula(CAMINOS[ca.id].corto) + '.');
        mostrar();
      });
    });
  }
  function aplicarCamino(id) {
    deptoCamino = null; deptosAbierto = false; // S35: al cambiar de camino, Departamentos muestra el nuevo.
    estado.caminoElegido = id || null;
    if (estado.modo === 'vivir') estado.piezas = Object.assign({}, estado.piezas, { grupo: !!(id && CAMINOS[id] && CAMINOS[id].grupo), respaldo: !!(id && CAMINOS[id] && CAMINOS[id].familiar) });
    registro.camino = id || null; guardarRegistro();
    guardarEstado();
  }
  function renderComparar() {
    var cont = $('caminos-contenido');
    // S35: para arrendar, el mismo Comparar (antes iba a «¿Qué quieres explorar?»).
    var arrendar = estado.modo === 'arrendar';
    if (!ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return sinSueldos(cont, 'Compara tus caminos', 'titulo-caminos');
    var perfil = perfilActual();
    var ids = idsComparar();
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var minimo = 100000, paso = 50000, maximo = Math.max(1000000, Math.ceil(ingreso * 0.4 / paso) * paso);
    var mensual = Math.min(maximo, Math.max(minimo, estado.ahorroMensual || 300000));
    var nums = ids.map(function (id) { return numerosComparar(id, mensual); });
    var paraTi = paraTiComparar(nums);
    if (!comparaSel || comparaSel.some(function (id) { return ids.indexOf(id) === -1; })) {
      var primero = estado.caminoElegido && ids.indexOf(estado.caminoElegido) !== -1 ? estado.caminoElegido : (paraTi || ids[0]);
      var otro = nums.filter(function (n) { return n.id !== primero && n.cumple; })[0] || nums.filter(function (n) { return n.id !== primero; })[0];
      comparaSel = otro ? [primero, otro.id] : [primero];
    }
    var r = recomendarCamino(perfil);
    var noMostrados = caminosParaMostrar(perfil, r).noMostrados.filter(function (n) { return ids.indexOf(n.id) === -1; });
    var idGrupo = arrendar ? 'grupo-invertir' : 'grupo-vivir';
    if (ids.indexOf(idGrupo) === -1) noMostrados = [{ id: idGrupo, razon: 'sin-grupo' }].concat(noMostrados.filter(function (n) { return n.id !== idGrupo; }));
    var prioridades = arrendar ? PRIORIDADES.filter(function (p) { return p[0] !== 'ya'; }) : PRIORIDADES;
    cont.innerHTML =
      '<a href="#compra" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Tu compra</a>' +
      '<header class="encabezado"><h1 id="titulo-caminos" class="h2" tabindex="-1">Compara tus caminos</h1>' +
        '<p class="texto-apoyo">Mirar no cambia tu plan.</p></header>' +
      '<fieldset class="selector explorar-modo"><legend class="oculto-visual">¿Para qué es el departamento?</legend><div class="selector-opciones">' +
        '<input type="radio" name="explorar-modo" id="explorar-vivir" value="vivir"' + (arrendar ? '' : ' checked') + '><label for="explorar-vivir">Para vivir</label>' +
        '<input type="radio" name="explorar-modo" id="explorar-arrendar" value="arrendar"' + (arrendar ? ' checked' : '') + '><label for="explorar-arrendar">Para arrendar</label>' +
      '</div></fieldset>' +
      barraCaminoAnterior() +
      '<fieldset class="prioridades cr-prioridades"><legend class="h6">¿Qué te importa más?</legend><div class="prioridades-chips">' +
        prioridades.map(function (p) {
          return '<button type="button" class="chip chip-filtro" data-prioridad="' + p[0] + '" aria-pressed="' + (estado.prioridad === p[0]) + '">' + p[1] + '</button>';
        }).join('') + '</div></fieldset>' +
      '<section class="tarjeta bloque si-juntas" aria-labelledby="titulo-si-juntas">' +
        '<p class="si-juntas-fila"><label for="rango-comparar" id="titulo-si-juntas">Si juntas al mes</label><strong class="numero" id="valor-comparar">' + formatoRedondeado(mensual) + '</strong></p>' +
        '<input type="range" id="rango-comparar" min="' + minimo + '" max="' + maximo + '" step="' + paso + '" value="' + mensual + '" aria-valuetext="' + formatoRedondeado(mensual) + ' al mes">' +
      '</section>' +
      '<section class="carrera" aria-labelledby="titulo-carrera"><h2 class="h5" id="titulo-carrera">' + (arrendar ? '¿Cuándo firmas con cada camino?' : '¿Cuándo recibes tus llaves con cada camino?') + '</h2>' +
        // 20-nov: sin la descripción bajo el título.
        '<div id="carrera-cuerpo" aria-live="polite">' + carreraHtml(nums, paraTi) + '</div></section>' +
      '<section class="lado" aria-labelledby="titulo-lado"><h2 class="h5" id="titulo-lado">Lado a lado</h2>' +
        '<div id="lado-cuerpo">' + ladoALadoHtml(nums) + '</div></section>' +
      (noMostrados.length ? '<details class="tarjeta explorar-porque"><summary><span><strong>Por qué no te mostramos otros</strong><small>' + plural(noMostrados.length, 'camino', 'caminos') + '</small></span>' +
          '<svg class="flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></summary>' +
          noMostrados.map(function (n) { return '<p><strong>' + CAMINOS[n.id].corto + ':</strong> ' + RAZON_NO_MOSTRADO[n.razon] + '</p>'; }).join('') + '</details>' : '');
    var pintarCuerpo = function (v) {
      var ns = ids.map(function (id) { return numerosComparar(id, v); });
      var pt = paraTiComparar(ns);
      $('carrera-cuerpo').innerHTML = carreraHtml(ns, pt);
      $('lado-cuerpo').innerHTML = ladoALadoHtml(ns);
      enlazar();
    };
    var enlazar = function () {
      cont.querySelectorAll('[data-comparar]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.dataset.comparar, i = comparaSel.indexOf(id);
          if (i !== -1) { if (comparaSel.length > 1) comparaSel.splice(i, 1); }
          else { comparaSel.push(id); if (comparaSel.length > 2) comparaSel.shift(); }
          pintarCuerpo(Number($('rango-comparar').value));
          var nb = cont.querySelector('[data-comparar="' + id + '"]'); if (nb) nb.focus();
        });
      });
      cont.querySelectorAll('[data-info-camino]').forEach(function (b) {
        b.addEventListener('click', function () { abrirInfoCamino(b.dataset.infoCamino, b); });
      });
      cont.querySelectorAll('[data-elegir-camino]').forEach(function (b) {
        b.addEventListener('click', function () { confirmarMiCamino(b.dataset.elegirCamino, b); });
      });
    };
    enlazar();
    iniciarCaminoAnterior(cont);
    cont.querySelectorAll('[data-prioridad]').forEach(function (b) {
      b.addEventListener('click', function () {
        estado.prioridad = estado.prioridad === b.dataset.prioridad ? null : b.dataset.prioridad;
        guardarEstado();
        renderComparar();
        var nb = cont.querySelector('[data-prioridad="' + b.dataset.prioridad + '"]'); if (nb) nb.focus();
      });
    });
    var rm = $('rango-comparar');
    var pintar = function () { var v = Number(rm.value); rm.style.setProperty('--lleno', ((v - minimo) / (maximo - minimo) * 100).toFixed(1) + '%'); return v; };
    pintar();
    rm.addEventListener('input', function () {
      var v = pintar();
      $('valor-comparar').textContent = formatoRedondeado(v);
      rm.setAttribute('aria-valuetext', formatoRedondeado(v) + ' al mes');
      pintarCuerpo(v);
    });
    rm.addEventListener('change', function () { estado.ahorroMensual = Number(rm.value); guardarEstado(); });
  }
  // La «i» de cada camino: qué es, cómo funciona, tus pasos, tus números, para quién y qué tener en cuenta.
  // S36 (lienzo P14): la ficha de un camino tiene todo; ya no hay «Ver todo sobre este camino».
  var CAMINO_TERMINOS = { 'grupo-vivir': 'Grupo, cuota del pie, preaprobación', 'individual-vivir': 'Garantía del Estado, pie, dividendo',
    usados: 'Pie, tasación, escritura', 'arriendo-opcion': 'Entrada, aporte al pie, opción de compra', 'familiar-vivir': 'Garantía, pie, dividendo', 'familiar-invertir': 'Garantía, pie, dividendo' };
  function fichaCaminoHtml(id) {
    var inf = INFO_CAMINO[id], n = numerosComparar(id), h = pasosDeCamino(id);
    var c = COLOR_CAMINO[id] || COLOR_CAMINO.todos;
    var r = recomendadoParaTi();
    var chips = (id === estado.caminoElegido ? '<span class="fc-chip fuerte">Tu camino</span>' : r && r.id === id ? '<span class="fc-chip fuerte">Te lo recomendamos</span>' : '') +
      (DATOS_CAMINO[id] || []).slice(-1).map(function (t) { return '<span class="fc-chip">' + t + '</span>'; }).join('');
    var celda = function (etq, val, nota) { return '<div><small>' + etq + '</small><strong>' + val + '</strong><small>' + nota + '</small></div>'; };
    var k = filtrarDeptos(itemsDeptos(id), filtrosDeptos).length;
    return '<div class="fc" style="' + varsCamino(id) + '">' +
      '<section class="fc-cabeza" style="background: linear-gradient(180deg, ' + c[0] + ' 0%, var(--gray-light) 100%)">' +
        '<div class="fc-dibujo">' + ilustracionCamino(id) + '</div>' +
        (chips ? '<div class="fc-chips">' + chips + '</div>' : '') +
        '<p class="fc-que">' + inf.que + '</p></section>' +
      '<section class="fc-tarjeta" aria-labelledby="fc-num"><h2 class="h5" id="fc-num">Con tus números</h2><div class="fc-numeros">' +
        celda('Juntas', n.pie ? formatoRedondeado(n.pie) : '—', n.pieNota || 'pie y gastos') +
        (esArrendarCamino(id) ? celda('Firmas', mesCorto(n.tuyo), 'aprox.') : id === 'arriendo-opcion' ? celda('Te mudas', n.mudas !== null && n.mudas <= 0 ? 'Ya' : mesCorto(n.mudas), 'aprox.') : celda('Llaves', mesCorto(n.tuyo), 'aprox.')) +
        celda('Pagas al mes', n.pagas ? formatoRedondeado(n.pagas) : '—', n.pagasNota || 'dividendo') +
        '</div><p class="fc-sello">' + icono('i-escudo') + 'Sin contar que el departamento suba de precio</p></section>' +
      '<section class="fc-tarjeta" aria-labelledby="fc-como"><h2 class="h5" id="fc-como">Cómo funciona</h2>' + pasosVisuales(id) +
        '<details class="fc-pasos"><summary>Ver tus ' + h.total + ' pasos</summary>' + listaPasosPrevia(h) + '</details></section>' +
      '<section class="fc-tarjeta fc-para"><span class="fc-para-icono" aria-hidden="true">' + icono('i-persona') + '</span><span><strong>Para quién</strong><small>' + inf.para + '</small></span></section>' +
      '<nav class="fc-mas" aria-label="Más sobre este camino">' +
        (esArrendarCamino(id) ? '' : '<a href="#departamentos/camino/' + id + '"><span class="fc-mas-icono verde" aria-hidden="true">' + icono('i-casa') + '</span><span><strong>Ver sus departamentos</strong><small>' + plural(k, 'departamento', 'departamentos') + (filtrosDeptos.rango && rangoActual() ? ' en tu rango' : '') + '</small></span>' + icono('i-flecha', 'fc-flecha') + '</a>') +
        (CAMINOS[id] && CAMINOS[id].familiar ? (function () { var rf = respaldoFamiliar(listaMeta()); return '<a href="#compra/ficha/respaldo-familiar/familiar"><span class="fc-mas-icono azul" aria-hidden="true">' + icono('i-grupo') + '</span><span><strong>Cómo lo vive tu familiar</strong><small>Deja ' + formatoRedondeado(rf.deposito) + ' y lo recupera en ' + (rf.mesesLibera / 12).toFixed(0) + ' años</small></span>' + icono('i-flecha', 'fc-flecha') + '</a>'; })() : '') +
        (id === 'individual-vivir' ? '<a href="#compra/caminos/individual-vivir/califica"><span class="fc-mas-icono azul" aria-hidden="true">' + icono('i-escudo') + '</span><span><strong>¿Calificas?</strong><small>Revisa los requisitos con tus datos</small></span>' + icono('i-flecha', 'fc-flecha') + '</a>' : '') +
        (estado.modo === 'vivir' && id !== 'arriendo-opcion' ? '<a href="#compra/caminos/' + id + '/como"><span class="fc-mas-icono azul" aria-hidden="true">' + icono('i-pronto') + '</span><span><strong>Ayudas para llegar antes</strong><small>Lo que puede acercar tu fecha</small></span>' + icono('i-flecha', 'fc-flecha') + '</a>' : '') +
        '<a href="#perfil/ayuda"><span class="fc-mas-icono gris" aria-hidden="true">' + icono('i-info') + '</span><span><strong>Qué significan estos términos</strong><small>' + (CAMINO_TERMINOS[id] || 'Pie, dividendo, preaprobación') + '</small></span>' + icono('i-flecha', 'fc-flecha') + '</a>' +
      '</nav>' +
      '<p class="fc-cuidado">' + icono('i-alerta') + '<span><strong>Ten en cuenta:</strong> ' + inf.cuidado + '</span></p>' +
    '</div>';
  }
  // S36 (lienzo P19): ¿Calificas a la garantía del Estado y al subsidio a la tasa? Con lo que ya contaste y una pregunta.
  var respuestaGarantia = null;
  function renderCalifica() {
    var cont = $('caminos-contenido');
    var id = 'individual-vivir';
    var rg = rangoActual();
    var ingreso = ingresoTotal(estado.sueldoPropio, estado.sueldoPareja) || 0;
    var y = null;
    try { y = plazoVivir(estado.ahorroMensual || 300000, Object.assign({}, piezasOn(), { grupo: false })).hasta; } catch (e) { y = null; }
    var carga = y && ingreso ? Math.round(y.dividendo / ingreso * 100) : null;
    var tope = Math.round(LIMITE_HOLGADO * 100);
    var req = [
      ['Departamento nuevo, en primera venta', rg ? 'Tu rango: ' + millones(rg.desde).replace(' millones', '') + ' a ' + millones(rg.hasta) : 'Los departamentos usados no tienen esta garantía', true],
      ['De hasta UF 6.000', rg ? 'Tu rango llega a ' + formatoUF(rg.hasta) : 'Revisa el precio del departamento', !rg || rg.hasta <= 6000],
      ['Tu sueldo alcanza', carga !== null ? 'El dividendo sería el ' + carga + NBSP + '% de tu sueldo (el máximo es ' + tope + NBSP + '%)' : 'Cuéntanos tu sueldo en Mis datos', carga !== null && carga <= tope],
      ['Compras como persona, no como empresa', 'Y la promesa la firmas desde ahora', true]
    ];
    var r = respuestaGarantia;
    cont.innerHTML =
      '<a href="' + rutaCamino(id) + '" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + nombreCamino(id) + '</a>' +
      '<section class="cal-cabeza"><p class="cal-sobre">Garantía del Estado y subsidio a la tasa</p>' +
        '<h1 id="titulo-caminos" class="h2" tabindex="-1">¿Calificas?</h1>' +
        '<p class="texto-apoyo">Revisamos los requisitos con lo que ya nos contaste. Solo falta una pregunta.</p>' +
        '<div class="cal-beneficios"><div><span aria-hidden="true">' + icono('i-alcancia') + '</span><strong>Pie del 10' + NBSP + '%</strong><small>Bci te presta hasta el 90' + NBSP + '%</small></div>' +
          '<div><span aria-hidden="true">' + icono('i-sube') + '</span><strong>Tasa más baja</strong><small>Con el subsidio, pagas menos al mes</small></div></div></section>' +
      '<section class="cal-req" aria-labelledby="cal-t"><h2 class="h5" id="cal-t">Los requisitos</h2>' +
        req.map(function (q) {
          return '<div class="cal-fila' + (q[2] ? ' ok' : ' no') + '"><span class="cal-marca" aria-hidden="true">' + icono(q[2] ? 'i-check' : 'i-alerta') + '</span>' +
            '<span><strong>' + q[0] + '</strong><small>' + q[1] + '</small></span><span class="oculto-visual">' + (q[2] ? 'Cumples' : 'Revisa') + '</span></div>';
        }).join('') +
        '<div class="cal-pregunta"><p class="cal-fila-q"><span class="cal-marca-q" aria-hidden="true">' + (r === 'no' ? '✓' : r === 'si' ? '–' : '?') + '</span>' +
          '<strong id="cal-q">¿Ya recibiste antes esta garantía para otra vivienda?</strong></p>' +
          '<div class="cal-opciones" role="radiogroup" aria-labelledby="cal-q">' +
            '<button type="button" role="radio" aria-checked="' + (r === 'no') + '" data-cal="no">No, nunca</button>' +
            '<button type="button" role="radio" aria-checked="' + (r === 'si') + '" data-cal="si">Sí</button></div></div></section>' +
      (r === 'no' ? '<section class="cal-resultado ok" role="status">' + icono('i-check') + '<span><strong>' + (req.every(function (q) { return q[2]; }) ? 'Calificas' : 'Calificas si cumples lo que falta') + '</strong><small>Lo pides con tu crédito, al pedir tu preaprobación.</small></span></section>'
        : r === 'si' ? '<section class="cal-resultado no" role="status"><span><strong>Esta garantía es una sola vez</strong><small>Igual puedes comprar con el crédito tradicional: Bci presta el 80' + NBSP + '% y juntas un pie del 20' + NBSP + '%.</small>' +
          '<a class="enlace" href="' + rutaCamino('usados') + '">Ver el crédito tradicional ›</a></span></section>' : '') +
      '<div class="cal-notas"><p>' + icono('i-info') + '<span><strong>No es seguro:</strong> el subsidio a la tasa depende de los cupos que queden cuando Bci apruebe tu crédito.' +
          (y ? ' Sin subsidio, tu dividendo sería <strong>' + formatoRedondeado(y.dividendoSinSubsidio) + '</strong> en vez de ' + formatoRedondeado(y.dividendo) + '.' : '') + '</span></p>' +
        '<p>' + icono('i-escudo') + 'Lo confirma Bci al aprobar tu crédito.</p></div>' +
      '<div class="acciones accion-fija">' + (r === 'no' && estado.caminoElegido !== id ? '<button type="button" class="btn btn-primario btn-bloque" id="btn-cal-elegir" aria-haspopup="dialog">Elegir este camino</button>'
        : r === 'si' ? '<a class="btn btn-primario btn-bloque" href="#compra/caminos">Volver a los caminos</a>'
        : r === 'no' ? '<a class="btn btn-primario btn-bloque" href="#compra">Ver tu compra</a>'
        : '<button type="button" class="btn btn-primario btn-bloque" disabled>Responde la pregunta</button>') + '</div>';
    cont.querySelectorAll('[data-cal]').forEach(function (b) {
      b.addEventListener('click', function () {
        respuestaGarantia = b.dataset.cal;
        if (estado.pasos.fogaesAgregado) { estado.pasos.fogaesCalifica = respuestaGarantia === 'no'; guardarEstado(); }
        renderCalifica(); var nb = cont.querySelector('[data-cal="' + respuestaGarantia + '"]'); if (nb) nb.focus(); });
    });
    if ($('btn-cal-elegir')) $('btn-cal-elegir').addEventListener('click', function () { confirmarMiCamino(id, $('btn-cal-elegir')); });
  }
  function abrirInfoCamino(id, boton) {
    abrirHojaContenido(nombreCamino(id), fichaCaminoHtml(id) +
      (id === estado.caminoElegido ? '' : '<div class="acciones accion-fija"><button type="button" class="btn btn-primario btn-bloque" id="btn-info-elegir">Elegir este camino</button></div>'), boton,
      function () {
        if ($('btn-info-elegir')) $('btn-info-elegir').addEventListener('click', function () { cerrarHoja(false); confirmarMiCamino(id, boton); });
      });
  }
  // ---------- S32-B5: Departamentos ----------
  // Una sola lista: los de cada camino (en grupo, con garantía, usados y arriendo con opción), con «Camino ▾» y «Filtros».
  // Mirar otro camino no cambia tu plan.
  var deptoCamino = null; // null = el de tu camino (o todos); 'todos' o un id de CAMINOS_COMPARAR
  var filtrosDeptos = { comuna: null, rango: true, dormitorios: null, estado: null, orden: 'antes', favoritos: false };
  // 20-nov: Departamentos para arrendar funciona igual que para vivir, con los caminos para arrendar.
  function caminosDeptos() { return estado.modo === 'arrendar' ? CAMINOS_ARRENDAR : CAMINOS_COMPARAR; }
  function caminoDeptosActual() {
    if (deptoCamino && (deptoCamino === 'todos' || caminosDeptos().indexOf(deptoCamino) !== -1)) return deptoCamino;
    return caminosDeptos().indexOf(estado.caminoElegido) !== -1 ? estado.caminoElegido : 'todos';
  }
  // Los proyectos de un camino sin los filtros de la lista antigua (el rango y los demás se aplican aquí).
  function proyectosParaDeptos(id) {
    var g = { c: estado.caminoElegido, f: estado.filtroRango, p: estado.piezas, t: estado.masBaratoTipo, a: estado.masBaratoAjuste, m: estado.meAlcanza, v: estado.verTodos };
    estado.caminoElegido = id; estado.filtroRango = false; estado.masBaratoTipo = null; estado.masBaratoAjuste = null; estado.meAlcanza = false;
    estado.piezas = Object.assign({}, estado.piezas, { grupo: !!CAMINOS[id].grupo, respaldo: !!CAMINOS[id].familiar });
    try { return proyectosVisibles('camino'); }
    finally { estado.caminoElegido = g.c; estado.filtroRango = g.f; estado.piezas = g.p; estado.masBaratoTipo = g.t; estado.masBaratoAjuste = g.a; estado.meAlcanza = g.m; estado.verTodos = g.v; }
  }
  // Todos los departamentos de un camino (o de todos), con lo que se necesita para filtrar y ordenar.
  function itemsDeptos(cam) {
    if (estado.modo === 'arrendar') return itemsDeptosArrendar(cam);
    var items = [], perfil = perfilActual();
    var vistos = {};
    var proy = function (id) {
      // 20-nov: los números de cada lista con su crédito (95 % solo en la garantía de un familiar).
      var piezasAntes = estado.piezas;
      if (estado.modo === 'vivir') estado.piezas = Object.assign({}, piezasAntes, { respaldo: id === 'familiar-vivir' });
      try { proyectosParaDeptos(id).forEach(function (p) {
        if (vistos[p.id]) return;
        vistos[p.id] = true;
        var d = departamentosDe(p.id)[0];
        var solo = p.tipo === 'conjunto' && id !== 'grupo-vivir';
        var m = null;
        var g = null;
        try { var pd = plazoDepartamento(p, null, solo); m = razonJusto(pd) || pd.meses === null ? null : pd.meses + MESES_SI_A_LLAVES; } catch (e) { m = null; }
        // 20-nov: en grupo, la fecha es la firma de todos (la entrega del edificio).
        if (p.tipo === 'conjunto' && !solo && estado.modo === 'vivir' && mesesParaEntrega(p) > 0) { try { g = planGrupo(p); m = g.posible ? g.meses : null; } catch (e) { g = null; } }
        items.push({ tipo: 'proyecto', id: p.id, p: p, d: d, solo: solo, camino: id, comuna: p.comuna, uf: d.listaUF, dorm: d.dormitorios, estado: p.tipo === 'conjunto' ? 'obra' : 'nuevo', tuyo: m, grupo: g });
      }); } finally { estado.piezas = piezasAntes; }
    };
    if (cam === 'todos' || cam === 'grupo-vivir') { if (perfil.hayGrupo || cam === 'grupo-vivir') proy('grupo-vivir'); }
    if (cam === 'todos' || cam === 'individual-vivir') proy('individual-vivir');
    if (cam === 'familiar-vivir') proy('familiar-vivir');
    if (cam === 'todos' || cam === 'usados') USADOS.forEach(function (u) {
      var meta = ufAPesos(u.listaUF * (1 - SUPUESTOS_PIEZAS.creditoSiempre) + gastosUF(u.listaUF));
      var falta = Math.max(0, meta - (perfil.ahorroActual || 0));
      var meses = falta === 0 ? 0 : mesesParaMeta(falta, perfil.ahorroMensual);
      items.push({ tipo: 'usado', id: u.id, u: u, camino: 'usados', comuna: u.comuna, uf: u.listaUF, dorm: u.dormitorios, estado: 'usado',
        tuyo: meses === null || !isFinite(meses) ? null : meses + MESES_SI_A_LLAVES });
    });
    if (cam === 'todos' || cam === 'arriendo-opcion') ARRIENDOS_OPCION.forEach(function (u) {
      var a = arriendoOpcion(u.listaUF, u.arriendoEstimadoIA, perfil);
      items.push({ tipo: 'arriendo', id: u.id, u: u, a: a, camino: 'arriendo-opcion', comuna: u.comuna, uf: u.listaUF, dorm: u.dormitorios, estado: 'nuevo', tuyo: a.cumple ? a.mesesTuyo : null });
    });
    return items;
  }
  // Para arrendar: los edificios de cada camino; la fecha es cuándo firmas (juntas tu pie + del sí a la firma, o la entrega).
  function itemsDeptosArrendar(cam) {
    var items = [], perfil = perfilActual(), vistos = {};
    var ids = cam === 'todos' ? idsComparar() : [cam];
    ids.forEach(function (id) {
      proyectosParaDeptos(id).forEach(function (p) {
        if (vistos[p.id]) return;
        vistos[p.id] = true;
        var d = departamentosDe(p.id)[0];
        var c = CAMINOS[id];
        var m = null;
        try {
          var n = numerosCamino(id, d.listaUF, perfil);
          m = n.meses === null || !isFinite(n.meses) || !(n.evaluacion && n.evaluacion.cumple) ? null
            : Math.max(n.meses + MESES_SI_A_LLAVES, c.grupo ? mesesParaEntrega(p) : 0);
        } catch (e) { m = null; }
        items.push({ tipo: 'proyecto', id: p.id, p: p, d: d, solo: p.tipo === 'conjunto' && !c.grupo, camino: id, comuna: p.comuna, uf: d.listaUF, dorm: d.dormitorios,
          estado: p.tipo === 'conjunto' ? 'obra' : 'nuevo', tuyo: m });
      });
    });
    return items;
  }
  function filtrarDeptos(items, f) {
    var rango = rangoActual();
    var lista = items.filter(function (x) {
      if (f.comuna && x.comuna !== f.comuna) return false;
      if (f.rango && rango && !enRango(x.uf, rango)) return false;
      if (f.dormitorios !== null && x.dorm !== f.dormitorios) return false;
      if (f.estado && x.estado !== f.estado) return false;
      if (f.favoritos && !esFavorito(x.id)) return false;
      return true;
    });
    var clave = function (x) { return f.orden === 'precio' ? x.uf : (x.tuyo === null ? 1e6 : x.tuyo); };
    return lista.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return (clave(a.x) - clave(b.x)) || (a.i - b.i); }).map(function (o) { return o.x; });
  }
  function nFiltrosDeptos() {
    var f = filtrosDeptos;
    return (f.comuna ? 1 : 0) + (f.rango ? 0 : 1) + (f.dormitorios !== null ? 1 : 0) + (f.estado ? 1 : 0) + (f.orden !== 'antes' ? 1 : 0) + (f.favoritos ? 1 : 0);
  }
  function lineaGrupo(g) {
    return '<p class="tp-linea tp-tuyo">' + icono('i-calendario') + 'Firman todos en ' + g.fecha + '</p>' +
      (g.falta && !g.alcanza ? '<p class="tp-linea tp-cuota' + (g.posible ? '' : ' no') + '">' + (g.posible ? 'Junta ' + formatoRedondeado(g.cuota) + ' al mes para llegar' : 'No te alcanza: necesitarías ' + formatoRedondeado(g.cuota) + ' al mes') + '</p>' : '');
  }
  function lineaTuyo(m) { return '<p class="tp-linea tp-tuyo">' + icono('i-calendario') + (m === null ? 'Todavía no te alcanza' : (estado.modo === 'arrendar' ? 'Firmas ' : 'Recibirías tus llaves ') + mesTuyo(m)) + '</p>'; }
  function tarjetaDepto(x, i) {
    if (x.tipo === 'proyecto') {
      var html = tarjetaProyecto(x.p, '#departamentos/', false, estado.modo === 'arrendar' ? '/' + x.camino : x.camino === 'familiar-vivir' ? '/familiar-vivir' : x.solo ? '/individual-vivir' : '');
      html = html.replace('<span class="tp-ver">', (x.grupo ? lineaGrupo(x.grupo) : lineaTuyo(x.tuyo)) + '<span class="tp-ver">');
      // S34: el que elegiste se marca en la lista.
      if (estado.compra && estado.compra.proyectoId === x.p.id) html = html.replace('<span class="tp-ver">', '<span class="chip chip-recomendado chip-tu-eleccion">' + icono('i-ok') + 'Tu elección</span><span class="tp-ver">');
      return html;
    }
    var u = x.u;
    var t = u.dormitorios === 2 ? '2d' : u.dormitorios === 1 ? '1d' : 'estudio';
    var foto = hayFotos() && FOTOS.interiores[t + (i % 2 ? '-cocina' : '-living')];
    var dorm = u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'un ambiente';
    var img = foto ? '<img class="usado-foto" src="fotos/interiores/' + encodeURI(foto) + '" alt="' + (i % 2 ? 'Cocina' : 'Living') + ' de un departamento de ' + dorm + ' (foto referencial)" loading="lazy" width="800" height="600">' : '';
    if (x.tipo === 'usado') {
      var titulo = 'Departamento en ' + esc(u.comuna);
      return '<li class="tarjeta usado">' + img + botonFavorito({ id: u.id, nombre: titulo }) +
        '<span class="usado-etiqueta">Usado' + SEP + 'de ' + u.anio + SEP + 'crédito tradicional</span>' +
        '<h3 class="tp-nombre"><a class="usado-enlace" href="#departamentos/usado/' + esc(u.id) + '">' + titulo + '</a></h3>' +
        '<p class="tp-ficha">' + esc(u.comuna) + SEP + (u.dormitorios ? plural(u.dormitorios, 'dormitorio', 'dormitorios') : 'Estudio') + SEP + plural(u.banos || 1, 'baño', 'baños') + SEP + u.m2 + NBSP + 'm²</p>' +
        '<p class="usado-precio"><strong class="tp-cifra">' + formatoRedondeado(ufAPesos(u.listaUF)) + '</strong> <span>' + formatoUF(u.listaUF) + '</span></p>' +
        lineaTuyo(x.tuyo) + '</li>';
    }
    var a = x.a;
    return '<li class="tarjeta usado">' + img + botonFavorito({ id: u.id, nombre: u.nombre }) +
      '<span class="usado-etiqueta">Arriendo con opción' + SEP + (a.mesesEntrada ? 'te mudas en ' + textoMeses(a.mesesEntrada) : 'te mudas ya') + '</span>' +
      '<h3 class="tp-nombre"><a class="usado-enlace" href="#departamentos/arriendo/' + esc(u.id) + '">' + esc(u.nombre) + '</a></h3>' +
      '<p class="tp-ficha">' + fichaArriendo(u) + '</p>' +
      '<p class="tp-etiqueta">Pagas al mes</p>' +
      '<p class="usado-precio"><strong class="tp-cifra">' + formatoRedondeado(a.mensualidad) + '</strong> <span>' + formatoRedondeado(a.aporte) + ' va a tu pie</span></p>' +
      lineaTuyo(x.tuyo) + '</li>';
  }
  var CORTO_DEPTOS = { todos: 'Todos', 'grupo-vivir': 'En grupo', 'individual-vivir': 'Con garantía', 'familiar-vivir': 'Con familiar', usados: 'Tradicional', 'arriendo-opcion': 'Arriendo',
    'pie-compartido': 'Pie compartido', 'grupo-invertir': 'En grupo', 'individual-invertir': 'Crédito 80' + NBSP + '%', 'familiar-invertir': 'Con familiar' };
  function nombreCaminoDeptos(cam) { return cam === 'todos' ? 'Todos los caminos' : nombreCamino(cam); }
  // S35 (19-nov, Bárbara, opción D del canvas): con camino elegido, arriba va el camino que estás mirando y
  // «Cambiar» despliega los demás ahí mismo. Sin camino, «¿Qué quieres explorar?» con las tarjetas de colores
  // y la recomendación según lo que te importa más.
  var COLOR_DEPTOS = { todos: 'gris', 'grupo-vivir': 'verde', 'individual-vivir': 'azul', 'familiar-vivir': 'azul', usados: 'amarillo', 'arriendo-opcion': 'rojo' };
  var deptosAbierto = false;
  function nombreCaminoD(id) { return id === 'todos' ? 'Todos los caminos' : id === 'usados' ? NOMBRE_USADOS : nombreCamino(id); }
  // S36: el mismo ícono por camino en toda la app: grupo, escudo (garantía), casa (tradicional) y llave (arriendo).
  var ICONO_CAMINO_D = { 'familiar-invertir': 'M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z', 'familiar-vivir': 'M12 20.5S3.5 15.3 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.1-8.5 11.3-8.5 11.3z', 'individual-vivir': 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5', usados: 'M3.5 11L12 4l8.5 7M5.5 9.5V20h13V9.5M10 20v-5h4v5' };
  function iconoCaminoD(id) {
    if (id === 'todos') return icono('i-proyectos');
    if (ICONO_CAMINO_D[id]) return '<svg class="camino-dibujo" viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICONO_CAMINO_D[id] + '"/></svg>';
    return iconoCamino(id);
  }
  // S36 (20-nov, Claude Design): colores de cada camino (sin rojo ni amarillo): suave, fuerte e ícono.
  var COLOR_CAMINO = { 'grupo-vivir': ['#D4E7D5', '#28892B', '#28652B'], 'individual-vivir': ['#D4E3F5', '#2772CC', '#1D5699'],
    usados: ['#E2E8EA', '#546E7A', '#37474F'], 'arriendo-opcion': ['#E4EEFA', '#7DAAE0', '#2772CC'], 'familiar-vivir': ['#DCE2F0', '#3B5A9A', '#243B6B'], 'familiar-invertir': ['#DCE2F0', '#3B5A9A', '#243B6B'],
    'pie-compartido': ['#D4E3F5', '#2772CC', '#1D5699'], 'grupo-invertir': ['#D4E7D5', '#28892B', '#28652B'], 'individual-invertir': ['#E2E8EA', '#546E7A', '#37474F'], todos: ['#E2E8EA', '#546E7A', '#37474F'] };
  function varsCamino(id) { var c = COLOR_CAMINO[id] || COLOR_CAMINO.todos; return '--cs:' + c[0] + ';--cf:' + c[1] + ';--ci:' + c[2]; }
  // S36: «¿Qué quieres explorar?» lleva a conocer los caminos para elegir uno (lienzo P20).
  var cambiandoPrioridad = false;
  function renderExplorarDeptos(cont) {
    var ids = idsComparar();
    var nums = ids.map(function (id) { return numerosComparar(id); });
    var porId = {}; nums.forEach(function (n) { porId[n.id] = n; });
    var paraTi = paraTiComparar(nums);
    var reco = paraTi || ids[0];
    var porque = { antes: 'llegas antes', menos: 'pagas menos al mes', ya: 'te mudas antes' };
    var chips = function (id) { return (DATOS_CAMINO[id] || []).map(function (t) { return '<span class="ex-chip">' + t + '</span>'; }).join(''); };
    var linea = function (id) {
      var n = porId[id] || {};
      var etq = id === 'arriendo-opcion' ? 'Te mudas' : esArrendarCamino(id) ? 'Firmas' : 'Recibes tus llaves';
      var f = id === 'arriendo-opcion' ? n.mudas : n.tuyo;
      return etq + ' <b>' + mesCorto(f) + '</b>' + (n.pagas ? SEP + formatoRedondeado(n.pagas) + ' al mes' : '');
    };
    var favs = guardadosProyectos();
    // 23-nov: arriba, una tarjeta pregunta qué te importa para recomendarte uno.
    // La respuesta se guarda. «Ahora no» también se guarda, para que la tarjeta no vuelva a insistir.
    var conReco = !!estado.prioridad;
    var preguntando = !estado.prioridadRespondida || cambiandoPrioridad;
    var nombrePrioridad = conReco ? PRIORIDADES.filter(function (p) { return p[0] === estado.prioridad; })[0][1] : '';
    var itemCamino = function (id) {
      return '<li><a class="ex-camino" href="' + rutaCamino(id) + '" style="' + varsCamino(id) + '">' +
        '<span class="ex-camino-franja" aria-hidden="true"><span class="ex-camino-icono">' + iconoCaminoD(id) + '</span></span>' +
        '<span class="ex-camino-texto"><strong>' + nombreCaminoD(id) + '</strong><span class="ex-chips">' + chips(id) + '</span>' +
          '<small>' + linea(id) + '</small></span>' +
        '<span class="ex-conocer">Conocer<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></span></a></li>';
    };
    var heroHtml = !conReco ? '' :
      '<section class="ex-reco" aria-labelledby="ex-reco-nombre" style="' + varsCamino(reco) + '">' +
        '<div class="ex-reco-dibujo">' + ilustracionCamino(reco) +
          '<span class="ex-sello">' + icono('i-ok') + 'Para ti: ' + porque[estado.prioridad] + '</span></div>' +
        '<div class="ex-reco-cuerpo"><div class="ex-chips">' + chips(reco) + '</div>' +
          '<h2 class="ex-reco-nombre" id="ex-reco-nombre">' + nombreCaminoD(reco) + '</h2>' +
          '<p class="ex-reco-texto">' + (TEXTO_EXPLORAR[reco] || '') + '</p>' +
          '<a class="btn btn-primario btn-bloque" href="' + rutaCamino(reco) + '">Conocer este camino</a>' +
          '<button type="button" class="enlace ex-ver-deptos" data-explorar-camino="' + reco + '">Ver sus departamentos ›</button></div></section>';
    var lineaPrioridad = conReco && !preguntando
      ? '<p class="prioridad-guardada">Lo que más te importa: <strong>' + nombrePrioridad + '</strong> <button type="button" class="enlace" id="btn-cambiar-prioridad">Cambiar mi respuesta</button></p>' : '';
    var preguntaHtml = !preguntando ? '' :
      '<section class="tarjeta pregunta-prioridad" aria-labelledby="titulo-pregunta-prioridad">' +
        '<h2 class="h5" id="titulo-pregunta-prioridad">¿Qué es lo que más te importa?</h2>' +
        '<p class="texto-apoyo">Con tu respuesta te recomendamos uno de estos caminos. Puedes cambiarla cuando quieras.</p>' +
        '<div class="prioridades-chips">' + PRIORIDADES.map(function (p) {
          return '<button type="button" class="chip chip-filtro" data-prioridad-deptos="' + p[0] + '" aria-pressed="' + (estado.prioridad === p[0]) + '">' + p[1] + '</button>';
        }).join('') + '</div>' +
        '<button type="button" class="enlace" data-prioridad-deptos="ninguna">Ahora no</button>' +
      '</section>';
    cont.innerHTML =
      '<header class="encabezado">' + MARCA + '<h1 id="titulo-proyectos" class="h2" tabindex="-1">¿Qué quieres explorar?</h1>' +
        '<p class="texto-apoyo">Hay ' + ids.length + ' caminos para llegar a tu departamento. Conoce cada uno y elige el tuyo.</p></header>' +
      lineaPrioridad + preguntaHtml + heroHtml +
      '<section class="ex-otros" aria-labelledby="ex-otros-titulo"><h2 class="h5" id="ex-otros-titulo">' + (conReco ? 'Otros caminos' : 'Los caminos') + '</h2><ul>' +
        ids.filter(function (id) { return !conReco || id !== reco; }).map(itemCamino).join('') + '</ul>' +
        '<a class="btn btn-secundario btn-bloque ex-comparar" href="#compra/caminos">Comparar los ' + ids.length + ' caminos</a></section>' +
      (favs.length ? '<section class="ex-favs" aria-labelledby="ex-favs-titulo"><div class="ex-favs-cab"><h2 class="h5" id="ex-favs-titulo">' + icono('i-corazon') + 'Tus favoritos</h2>' +
          '<a class="enlace" href="#compra/caminos/guardados">Ver todos ›</a></div><ul class="ex-favs-pista">' +
        favs.map(function (p) {
          var foto = fotoEdificio(p), d = departamentosDe(p.id)[0];
          return '<li><a class="ex-fav" href="#departamentos/' + esc(p.id) + '">' +
            (foto ? '<img src="' + foto + '" alt="' + esc(p.nombre) + ' (foto referencial)" loading="lazy" width="800" height="600">' : '<span class="ex-fav-foto">' + fachada(p) + '</span>') +
            '<span class="ex-fav-texto"><small>' + (p.tipo === 'conjunto' ? 'Compra en grupo' : p.tipo === 'venta' ? 'Terminado' : NOMBRE_TIPO[p.tipo]) + '</small>' +
            '<strong>' + esc(p.nombre) + '</strong><span>' + (d ? formatoRedondeado(ufAPesos(d.listaUF)) : '') + '</span></span></a></li>';
        }).join('') + '</ul></section>' : '') +
      '<div class="acciones"><button type="button" class="btn btn-terciario btn-bloque" data-explorar-camino="todos">Ver todos los departamentos</button></div>';
    cont.querySelectorAll('[data-explorar-camino]').forEach(function (b) {
      b.addEventListener('click', function () { deptoCamino = b.dataset.explorarCamino; deptosAbierto = false; renderDepartamentos(); $('titulo-proyectos').focus(); });
    });
    cont.querySelectorAll('[data-prioridad-deptos]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.prioridadDeptos !== 'ninguna') estado.prioridad = b.dataset.prioridadDeptos;
        estado.prioridadRespondida = true;
        cambiandoPrioridad = false;
        guardarEstado();
        renderDepartamentos();
        var h = $('titulo-proyectos'); if (h) h.focus();
      });
    });
    var bc = $('btn-cambiar-prioridad');
    if (bc) bc.addEventListener('click', function () { cambiandoPrioridad = true; renderDepartamentos(); var t = $('titulo-pregunta-prioridad'); if (t) t.scrollIntoView(); });
  }
  // S36 (lienzo P23 y P24): el camino como una tarjeta de su color; «Cambiar» abre una grilla de 2 columnas adentro.
  var DEGRADE_CAMINO = { 'grupo-vivir': ['#28652B', '#28892B'], 'individual-vivir': ['#1D5699', '#2772CC'], usados: ['#37474F', '#546E7A'],
    'arriendo-opcion': ['#1D5699', '#2772CC'], 'familiar-vivir': ['#243B6B', '#3B5A9A'], 'familiar-invertir': ['#243B6B', '#3B5A9A'],
    'pie-compartido': ['#1D5699', '#2772CC'], 'grupo-invertir': ['#28652B', '#28892B'], 'individual-invertir': ['#37474F', '#546E7A'], todos: ['#37474F', '#546E7A'] };
  function bannerCaminoHtml(cam) {
    var tuyo = cam === estado.caminoElegido;
    var ids = ['todos'].concat(idsComparar());
    var sinCamino = !estado.caminoElegido;
    var g = DEGRADE_CAMINO[cam] || DEGRADE_CAMINO.todos;
    var datos = (DATOS_CAMINO[cam] || []).map(function (t) { return '<span>' + t + '</span>'; }).join('');
    return '<section class="dc-tarjeta" aria-labelledby="deptos-camino-nombre" style="background: linear-gradient(120deg, ' + g[0] + ' 0%, ' + g[1] + ' 70%, #7DAAE0 160%)">' +
      (deptosAbierto ? '' : '<span class="dc-dibujo" aria-hidden="true">' + iconoCaminoD(cam) + '</span>') +
      '<div class="dc-fila">' +
        '<span class="dc-texto"><small>' + (tuyo ? 'Tu camino' : 'Estás mirando') + '</small>' +
          '<strong id="deptos-camino-nombre">' + nombreCaminoD(cam) + '</strong></span>' +
        '<button type="button" class="dc-cambiar" id="btn-deptos-cambiar"' + (sinCamino ? '' : ' aria-expanded="' + deptosAbierto + '" aria-controls="deptos-otros"') + '>' + (deptosAbierto ? 'Listo' : 'Cambiar') + '</button>' +
      '</div>' +
      (!deptosAbierto && datos ? '<div class="dc-datos">' + datos + (tuyo || sinCamino ? '' : '<span>No cambia tu plan</span>') + '</div>' : '') +
      (deptosAbierto && !sinCamino ? '<ul class="dc-grilla" id="deptos-otros">' + ids.map(function (id) {
          var k = filtrarDeptos(itemsDeptos(id), filtrosDeptos).length;
          return '<li><button type="button" class="dc-opcion" data-filtro-camino="' + id + '" aria-pressed="' + (id === cam) + '" style="' + varsCamino(id) + '">' +
            '<span class="dc-mini" aria-hidden="true">' + iconoCaminoD(id) + '</span>' +
            '<span class="dc-opcion-texto"><strong>' + (CORTO_DEPTOS[id] || nombreCaminoD(id)) + '</strong><small>' + plural(k, 'departamento', 'departamentos') + '</small>' +
            (id === estado.caminoElegido ? '<small class="dc-tuyo">Tu camino</small>' : '') + '</span></button></li>';
        }).join('') +
        '<li><a class="dc-comparar" href="#compra/caminos">Comparar caminos ›</a></li></ul>' : '') +
    '</section>';
  }
  function renderDepartamentos() {
    if (!estado.preguntasListas) return renderLista('explorar'); // 20-nov: para arrendar, igual que para vivir.
    var cont = $('lista-contenido');
    if (!estado.caminoElegido && !deptoCamino && ingresoTotal(estado.sueldoPropio, estado.sueldoPareja)) return renderExplorarDeptos(cont);
    var cam = caminoDeptosActual();
    var lista = filtrarDeptos(itemsDeptos(cam), filtrosDeptos);
    var n = nFiltrosDeptos();
    var rango = rangoActual();
    cont.innerHTML =
      '<header class="encabezado">' + MARCA + '<div class="titulo-con-boton"><h1 id="titulo-proyectos" class="h2" tabindex="-1">Departamentos</h1>' +
        '<button type="button" class="btn btn-terciario btn-sm" id="btn-deptos-filtros" aria-haspopup="dialog">' + icono('i-filtro') + 'Filtros' + (n ? ' (' + n + ')' : '') + '</button></div>' +
        '<p class="texto-apoyo">' + plural(lista.length, 'departamento', 'departamentos') + (filtrosDeptos.rango && rango ? ' en tu rango' : '') + '</p></header>' +
      bannerCaminoHtml(cam) +
      (lista.length
        ? '<ul class="lista-proyectos lista-deptos" id="lista-proyectos">' + lista.map(tarjetaDepto).join('') + '</ul>'
        : '<div class="vacio"><svg aria-hidden="true"><use href="#i-proyectos"/></svg><h2 class="h3">Ninguno con estos filtros</h2>' +
            '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-deptos-limpiar">Quitar filtros</button></div></div>') +
      '<p class="texto-apoyo texto-centro"><small>Ejemplos simulados' + SEP + 'fotos referenciales</small></p>';
    $('btn-deptos-cambiar').addEventListener('click', function () {
      // Sin camino elegido, «Cambiar» vuelve a «¿Qué quieres explorar?».
      if (!estado.caminoElegido) { deptoCamino = null; deptosAbierto = false; renderDepartamentos(); $('titulo-proyectos').focus(); return; }
      deptosAbierto = !deptosAbierto;
      renderDepartamentos();
      $('btn-deptos-cambiar').focus();
    });
    cont.querySelectorAll('[data-filtro-camino]').forEach(function (b) {
      b.addEventListener('click', function () {
        deptoCamino = b.dataset.filtroCamino; deptosAbierto = false;
        renderDepartamentos();
        $('btn-deptos-cambiar').focus();
      });
    });
    if ($('btn-deptos-filtros')) $('btn-deptos-filtros').addEventListener('click', function () { abrirFiltrosDeptos($('btn-deptos-filtros')); });
    if ($('btn-deptos-limpiar')) $('btn-deptos-limpiar').addEventListener('click', function () {
      filtrosDeptos = { comuna: null, rango: true, dormitorios: null, estado: null, orden: 'antes', favoritos: false };
      renderDepartamentos();
    });
  }
  function abrirCaminoDeptos(boton) {
    var cam = caminoDeptosActual();
    var ids = ['todos'].concat(idsComparar());
    abrirHojaContenido('¿De qué camino?',
      '<ul class="hoja-opciones">' + ids.map(function (id) {
        var k = filtrarDeptos(itemsDeptos(id), filtrosDeptos).length;
        return '<li><button type="button" class="hoja-opcion" data-deptos-camino="' + id + '" aria-pressed="' + (id === cam) + '">' +
          '<span><strong>' + nombreCaminoDeptos(id) + '</strong>' + (id === estado.caminoElegido ? '<small>Tu camino</small>' : '') + '</span>' +
          '<span class="hoja-opcion-n">' + k + '</span></button></li>';
      }).join('') + '</ul>' +
      '<p class="texto-apoyo"><small>Mirar otro camino no cambia tu plan.</small></p>' +
      '<a class="enlace" href="#compra/caminos">Comparar caminos ›</a>', boton, function (hoja) {
        hoja.querySelectorAll('[data-deptos-camino]').forEach(function (b) {
          b.addEventListener('click', function () {
            deptoCamino = b.dataset.deptosCamino;
            cerrarHoja(false);
            renderDepartamentos();
            $('titulo-proyectos').focus();
          });
        });
      });
  }
  function abrirFiltrosDeptos(boton) {
    var cam = caminoDeptosActual();
    var f = Object.assign({}, filtrosDeptos);
    var rango = rangoActual();
    var comunas = itemsDeptos(cam).map(function (x) { return x.comuna; }).filter(function (c, i, a) { return a.indexOf(c) === i; }).sort();
    var chip = function (grupo, valor, texto) {
      return '<button type="button" class="chip chip-filtro" data-f="' + grupo + '" data-v="' + valor + '">' + texto + '</button>';
    };
    var html =
      '<p class="etiqueta">Comuna</p><div class="chips-filtros">' + chip('comuna', '', 'Todas') + comunas.map(function (c) { return chip('comuna', esc(c), esc(c)); }).join('') + '</div>' +
      (rango ? '<p class="etiqueta">Precio</p><div class="chips-filtros">' + chip('rango', '1', 'Tu rango' + SEP + textoRango(rango)) + chip('rango', '0', 'Todos los precios') + '</div>' : '') +
      '<p class="etiqueta">Dormitorios</p><div class="chips-filtros">' + chip('dormitorios', '', 'Todos') + chip('dormitorios', '0', 'Estudio') + chip('dormitorios', '1', '1') + chip('dormitorios', '2', '2') + '</div>' +
      '<p class="etiqueta">Estado</p><div class="chips-filtros">' + chip('estado', '', 'Todos') + chip('estado', 'obra', 'En obra') + chip('estado', 'nuevo', 'Terminado') + chip('estado', 'usado', 'Usado') + '</div>' +
      '<p class="etiqueta">Ordenar por</p><div class="chips-filtros">' + chip('orden', 'antes', 'Llaves antes') + chip('orden', 'precio', 'Menor precio') + '</div>' +
      '<button type="button" class="interruptor bloque-chico" role="switch" id="filtro-favoritos" aria-checked="' + f.favoritos + '">' +
        '<span>Solo mis favoritos</span><span class="interruptor-pista" aria-hidden="true"><span class="interruptor-bola"></span></span></button>' +
      '<button type="button" class="btn btn-primario btn-bloque bloque-chico" id="btn-ver-deptos"></button>';
    abrirHojaContenido('Filtros', html, boton, function (hoja) {
      var valorDe = function (g) { return g === 'rango' ? (f.rango ? '1' : '0') : f[g] === null ? '' : String(f[g]); };
      var actualizar = function () {
        hoja.querySelectorAll('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', String(valorDe(b.dataset.f) === b.dataset.v)); });
        $('filtro-favoritos').setAttribute('aria-checked', String(f.favoritos));
        var k = filtrarDeptos(itemsDeptos(cam), f).length;
        $('btn-ver-deptos').textContent = k ? 'Ver ' + plural(k, 'departamento', 'departamentos') : 'Ninguno con estos filtros';
      };
      hoja.querySelectorAll('[data-f]').forEach(function (b) {
        b.addEventListener('click', function () {
          var g = b.dataset.f, v = b.dataset.v;
          if (g === 'rango') f.rango = v === '1';
          else if (g === 'dormitorios') f.dormitorios = v === '' ? null : Number(v);
          else if (g === 'orden') f.orden = v;
          else f[g] = v === '' ? null : v;
          actualizar();
        });
      });
      $('filtro-favoritos').addEventListener('click', function () { f.favoritos = !f.favoritos; actualizar(); });
      $('btn-ver-deptos').addEventListener('click', function () { filtrosDeptos = f; cerrarHoja(false); renderDepartamentos(); $('titulo-proyectos').focus(); });
      actualizar();
    });
  }
  // S32-B5 (D5): elegir un departamento es elegir tu meta. No lo reservas: con él calculamos tu fecha.
  function caminoDeItem(item) {
    if (estado.modo === 'arrendar') return item.camino && CAMINOS[item.camino] ? item.camino : (item.p ? caminoParaProyecto(item.p) : estado.caminoElegido);
    return item.tipo === 'usado' ? 'usados' : item.tipo === 'arriendo' ? 'arriendo-opcion' : (item.p.tipo === 'conjunto' && !item.solo ? 'grupo-vivir'
      : item.camino === 'familiar-vivir' || estado.caminoElegido === 'familiar-vivir' ? 'familiar-vivir' : 'individual-vivir');
  }
  // 20-nov (Bárbara): el botón dice siempre lo mismo; si cambias de camino, lo dice una línea arriba (el texto largo no cabía).
  function textoElegirDepto() { return 'Elegir este departamento'; }
  function notaCambioCamino(item) {
    var cam = caminoDeItem(item);
    if (!estado.caminoElegido || estado.caminoElegido === cam || !CAMINOS[cam]) return '';
    return '<p class="nota-cambio-camino" style="' + varsCamino(cam) + '"><span class="ncc-icono" aria-hidden="true">' + iconoCaminoD(cam) + '</span>' +
      '<span class="ncc-txt">Con este, tu camino pasa a <strong>' + CAMINOS[cam].corto + '</strong></span>' +
      '<a class="ncc-ver" href="#compra/caminos/' + cam + '">Ver<span class="oculto-visual"> cómo funciona ' + CAMINOS[cam].corto + '</span></a></p>';
  }
  function confirmarDeptoMeta(item, boton) {
    var cam = caminoDeItem(item);
    var actual = estado.caminoElegido;
    var cambia = !!actual && actual !== cam;
    var nombre = item.tipo === 'usado' ? 'el departamento en ' + esc(item.u.comuna) : esc((item.p || item.u).nombre);
    var fechaDe = function (c) { var m = numerosComparar(c).tuyo; return m === null ? 'Todavía no' : fechaLlaves(m, hoyDemo()); };
    // La fecha nueva es la de este departamento (la misma que muestra su tarjeta).
    var fechaItem = function () {
      var x = itemsDeptos(cam).filter(function (y) { return y.id === (item.p || item.u).id; })[0];
      if (!x) return fechaDe(cam);
      return x.tuyo === null ? 'Todavía no' : fechaLlaves(x.tuyo, hoyDemo());
    };
    abrirHojaContenido(cambia ? 'Cambiarte a ' + primeraMinuscula(CAMINOS[cam].corto) : '¿Elegir ' + nombre + '?',
      (cambia ? '<p class="camino-cambio">Tu fecha pasa de <strong>' + fechaDe(actual) + '</strong> a <strong>' + fechaItem() + '</strong></p>' : '') +
      '<p class="texto-apoyo">No lo reservas: con él calculamos tu fecha. Lo reservas más adelante, con tu pie casi listo.</p>' +
      (!actual ? '<p class="texto-apoyo"><small>Tu camino será ' + primeraMinuscula(CAMINOS[cam].corto) + '.</small></p>' : '') +
      '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-meta-si">' + (cambia ? 'Sí, cambiarme con este' : 'Sí, elegir') + '</button>' +
      (cambia ? '<a class="enlace" href="#compra/caminos/' + cam + '">Cómo funciona este camino</a>' : '') + '</div>', boton, function () {
        $('btn-meta-si').addEventListener('click', function () {
          var antes = { camino: estado.caminoElegido, compra: estado.compra, usado: estado.usadoElegido, arriendo: estado.arriendoElegido };
          cerrarHoja(false);
          aplicarCamino(cam);
          if (item.tipo === 'proyecto') guardarCompra(item.solo ? { proyectoId: item.p.id, departamentoId: item.d.id, paso: 1, sinGrupo: true } : { proyectoId: item.p.id, departamentoId: item.d.id, paso: 1 });
          else guardarCompra(null);
          estado.usadoElegido = item.tipo === 'usado' ? item.u.id : null;
          if (item.tipo === 'arriendo') estado.arriendoElegido = item.u.id;
          estado.caminoAnterior = cambia ? { id: antes.camino, listos: listosDe(hitoActual(fotoPasos())) } : null;
          guardarEstado();
          location.hash = '#compra';
          toastAccion('Elegiste ' + nombre.replace(/^el /, 'el ') + '.', 'Deshacer', function () {
            aplicarCamino(antes.camino);
            guardarCompra(antes.compra);
            estado.usadoElegido = antes.usado; estado.arriendoElegido = antes.arriendo; estado.caminoAnterior = null;
            guardarEstado();
            mostrar();
            toast('Listo: lo deshiciste.');
          });
        });
      }, { confirmacion: true });
  }
  // Se puede cambiar el departamento meta mientras no lo hayas reservado (la compra sigue en su primer paso).
  function puedeCambiarMeta() { return !estado.compra || (estado.compra.paso || 1) <= 1; }
  var caminoRecien = null;
  function confirmarMiCamino(id, boton) {
    var perfil = perfilActual();
    // S32-B4: para los cuatro caminos de vivir, la fecha es cuándo es tuyo (la misma del comparador y del recorrido).
    var vivir4 = function (c) { return (estado.modo === 'vivir' && CAMINOS_COMPARAR.indexOf(c) !== -1) || (estado.modo === 'arrendar' && esArrendarCamino(c)); };
    var tuyoDe = function (c) { return vivir4(c) ? numerosComparar(c).tuyo : mesesDeCamino(c, perfil); };
    var textoDe = function (c, m) { return vivir4(c) ? (m === null || m === undefined ? 'Todavía no' : fechaLlaves(m, hoyDemo())) : textoLlegada(m); };
    var c0 = estado.caminoElegido;
    var actual = c0 && CAMINOS[c0] && (!CAMINOS[c0].ficha || c0 === 'arriendo-opcion') ? c0 : null;
    var antes = actual ? tuyoDe(actual) : null;
    var despues = tuyoDe(id);
    var h = pasosDeCamino(id);
    var pasosAntes = actual ? pasosDeCamino(actual).total : null;
    var dif = pasosAntes === null ? 0 : h.total - pasosAntes;
    var cambio = dif === 0 ? '' : SEP + (dif > 0 ? 'se suma ' + plural(dif, 'paso', 'pasos') : 'se va ' + plural(-dif, 'paso', 'pasos'));
    // S30-B3: la hoja dice una cosa: cómo cambia tu fecha y tus pasos. La lista completa queda plegada.
    var fecha = actual && actual !== id && antes !== despues ? 'Tu fecha pasa de <strong>' + textoDe(actual, antes) + '</strong> a <strong>' + textoDe(id, despues) + '</strong>' + cambio
      : (vivir4(id) ? (esArrendarCamino(id) ? 'Firmas en <strong>' : 'Recibes tus llaves en <strong>') + textoDe(id, despues) + '</strong> (aprox.)' : 'Llegas en <strong>' + textoLlegada(despues) + '</strong>') +
        (pasosAntes === null ? SEP + plural(h.total, 'paso', 'pasos') : cambio);
    abrirHojaContenido('Elegir este camino',
      '<p class="camino-cambio">' + fecha + '</p>' +
      '<details class="termino-detalle"><summary>Ver mis ' + h.total + ' pasos</summary>' + listaPasosPrevia(h) + '</details>' +
      (choqueCompra(id)
        ? '<p class="aviso">Ya elegiste ' + esc(proyectoCompra().nombre) + ', que es de otro camino. Para seguir este, elige uno de sus departamentos.</p>' +
          '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-ver-deptos-camino">Ver sus departamentos</button></div>'
        : '<p class="texto-apoyo"><small>Lo que ya hiciste se mantiene. Puedes deshacerlo.</small></p>' +
          '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-confirmar-camino">Elegir este camino</button></div>'), boton,
      function () {
        if ($('btn-ver-deptos-camino')) $('btn-ver-deptos-camino').addEventListener('click', function () {
          cerrarHoja(false);
          location.hash = '#departamentos/camino/' + id;
        });
        if ($('btn-confirmar-camino')) $('btn-confirmar-camino').addEventListener('click', function () {
          var anterior = estado.caminoElegido;
          aplicarCamino(id);
          // «Antes ibas por X · Volver» se muestra hasta que avanzas un paso.
          estado.caminoAnterior = anterior && anterior !== id ? { id: anterior, listos: listosDe(hitoActual(fotoPasos())) } : null;
          guardarEstado();
          caminoRecien = id; pasoElegido = null;
          cerrarHoja(false);
          location.hash = '#compra';
          toastAccion('Ahora vas por ' + primeraMinuscula(CAMINOS[id].corto) + '.', 'Deshacer', function () {
            aplicarCamino(anterior);
            estado.caminoAnterior = null;
            guardarEstado();
            mostrar();
            toast(anterior && CAMINOS[anterior] ? 'Volviste a ' + primeraMinuscula(CAMINOS[anterior].corto) + '.' : 'Listo: todavía no eliges camino.');
          });
        });
      }, { confirmacion: true });
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
        (perfil.modo === 'vivir' ? '<p class="texto-centro"><a class="enlace" href="#compra/ficha/arriendo-opcion">Mientras tanto: arriendo con opción de compra</a></p>' : '') : '') +
      (r.todaviaNo ? '' : carrera(idsCarrera, perfil, ids)) +
      carruselCaminos(ids, perfil, r, sel.base) +
      plegable('no-mostrados', 'Por qué no te mostramos otros', plural(sel.noMostrados.length, 'camino', 'caminos'),
        '<ul class="lista-razones">' + sel.noMostrados.map(function (x) {
          return '<li><strong>' + CAMINOS[x.id].corto + ':</strong> ' + RAZON_NO_MOSTRADO[x.razon] + '</li>';
        }).join('') + '</ul>') +
      '<section class="tarjeta bloque" aria-labelledby="titulo-llega-antes">' +
        '<h2 class="h4" id="titulo-llega-antes">Llega antes</h2>' +
        '<ul class="filas">' +
          '<li><a class="fila" href="#compra/ficha/respaldo-familiar">' + icono('i-grupo', 'icono-grande') +
            '<span><strong>Garantía de un familiar</strong><small>Un familiar deja el 10' + NBSP + '% en Bci y lo recupera</small></span>' +
            '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>' +
          '<li><div class="fila">' + icono('i-regalo', 'icono-grande') +
            '<span><strong>Lista de regalos</strong><small>Tu familia aporta a tu pie en una ocasión especial</small></span></div></li>' +
          '<li><div class="fila">' + icono('i-casa', 'icono-grande') +
            '<span><strong>Comprar más barato</strong><small>Estudio, 1 dormitorio, usado o IVA cero, en "Filtrar"</small></span></div></li>' +
        '</ul>' +
      '</section>' +
      barraMes(r.numeros) +
      VER_TODOS +
      '<p class="sello">' + icono('i-escudo') + 'Sin contar que el departamento suba de precio</p>';

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
      location.hash = estado.caminoElegido ? rutaElegir() : '#departamentos';
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
    location.hash = rutaElegir();
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
      '<a href="#compra/caminos" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Comparar caminos</a>' +
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
        '<p class="sello"><svg aria-hidden="true"><use href="#i-escudo"/></svg>Sin contar que el departamento suba de precio</p>' +
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
  function enlaceRespaldo() { return location.href.split('#')[0] + '#compra/ficha/respaldo-familiar/familiar'; }
  function renderRespaldo(cont) {
    var id = 'respaldo-familiar';
    if (respaldoUF === null) respaldoUF = Math.min(3000, Math.max(1500, Math.round(listaMeta() / 100) * 100));
    var f = respaldoFamiliar(respaldoUF);
    var interesa = registro.meInteresa.indexOf(id) !== -1;
    var tu = respaldoVista === 'tu';
    var pasos = [['Tu familiar deja el 10' + NBSP + '% en Bci', '', 'azul'],
      ['Bci te presta el 95' + NBSP + '%: tú pones el 5' + NBSP + '%', '', 'verde'],
      ['Le vuelve cuando tu deuda baja al 80' + NBSP + '%', '', 'azul-oscuro']];
    cont.innerHTML =
      '<a href="#compra/caminos/familiar-' + (estado.modo === 'vivir' ? 'vivir' : 'invertir') + '" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>' + CAMINOS['familiar-vivir'].nombre + '</a>' +
      '<section class="respaldo-heroe" aria-labelledby="titulo-ficha">' +
        '<span class="respaldo-chip">Propuesta' + SEP + 'aún no existe en Chile</span>' +
        '<h1 id="titulo-ficha" class="h2">Garantía de un familiar</h1>' +
        '<p>Tu familiar <strong>no te regala el dinero</strong>: lo deja en Bci como garantía y lo recupera.</p>' +
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
            '<p><small>Sin su garantía</small><strong id="rf-pie10">' + formatoPesos(ufAPesos(respaldoUF * 0.1)) + '</strong><small>10' + NBSP + '% de pie</small></p>' +
            '<p class="con"><small>Con su garantía</small><strong id="rf-pie5">' + formatoPesos(f.pie) + '</strong><small>5' + NBSP + '% de pie</small></p></div>' +
          '<p class="respaldo-dividendo"><span>Tu dividendo al mes</span><span class="en-uf"><strong id="rf-div">' + formatoPesos(f.dividendo) + '</strong><small id="rf-div-uf">' + ufDecimales(f.dividendo / SUPUESTOS.uf, 2) + '</small></span></p>' +
        '</div>' +
        '<div id="vista-fam" role="tabpanel" aria-labelledby="tab-fam"' + (tu ? ' hidden' : '') + '>' +
          '<p class="respaldo-titular">Deja su dinero guardado, no lo regala</p>' +
          '<p class="respaldo-deposito"><span><small>Deja en Bci</small><strong id="rf-deposito">' + formatoRedondeado(f.deposito) + '</strong></span><small>10' + NBSP + '%' + SEP + 'con intereses</small></p>' +
          '<p class="respaldo-dividendo"><span>La recupera en</span><strong>' + (f.mesesLibera / 12).toFixed(1).replace('.', ',') + ' años</strong></p>' +
          '<p class="texto-apoyo"><small>Cuando tu deuda baja al 80' + NBSP + '%</small></p>' +
          // 23-nov: consentimiento claro del familiar. Aquí sí se dice «perder»; en el uso diario se habla de «respaldo».
          '<section class="consentimiento-familiar" aria-labelledby="cf-titulo">' +
            '<h3 class="h5" id="cf-titulo">Antes de aceptar</h3>' +
            '<p>Si ' + 'quien compra' + ' deja de pagar su crédito y no hay otra forma de cubrir la deuda, el banco puede usar tu depósito para pagar lo que falte. Ese dinero no se recupera.</p>' +
            '<p class="cf-cifra"><small>Lo máximo que puedes perder</small><strong id="rf-maximo">' + formatoRedondeado(f.deposito) + '</strong></p>' +
            '<p class="cf-cifra cf-ok"><small>Lo esperable si todo sigue bien</small><strong>$0, y se te libera de a poco</strong></p>' +
            '<p class="texto-apoyo"><small>Puedes perder tu depósito, hasta ese monto. Esto es una propuesta a validar con Bci: hoy no existe.</small></p>' +
            (estado.respaldoAceptado
              ? '<p class="cf-semaforo" role="status"><span class="cf-luz verde" aria-hidden="true"></span><span><strong>Todo al día</strong><small>Tu semáforo está en verde. Si cambia, te avisamos antes de que se use tu respaldo.</small></span></p>'
              : '<label class="cf-casilla"><input type="checkbox" id="cf-acepto"> <span>Entiendo que puedo perder hasta <strong id="cf-monto">' + formatoRedondeado(f.deposito) + '</strong> si el crédito no se paga.</span></label>' +
                '<button type="button" class="btn btn-primario btn-bloque" id="btn-acepto-respaldo" aria-disabled="true">Acepto ser su respaldo</button>') +
          '</section>' +
        '</div>' +
      '</section>' +
      '<section class="tarjeta bloque si-juntas" aria-labelledby="rf-precio">' +
        '<p class="si-juntas-fila"><label for="rf-rango" id="rf-precio">Si tu departamento cuesta</label><strong class="numero" id="rf-uf">' + formatoRedondeado(ufAPesos(respaldoUF)) + '</strong></p>' +
        '<p class="texto-apoyo rf-uf-chico"><small id="rf-uf-chico">' + formatoUF(respaldoUF) + '</small></p>' +
        '<input type="range" id="rf-rango" min="1500" max="3000" step="100" value="' + respaldoUF + '">' +
      '</section>' +
      '<section class="tarjeta bloque" aria-labelledby="rf-como">' +
        '<h2 class="h4" id="rf-como">Cómo funciona</h2>' +
        '<ol class="respaldo-pasos">' + pasos.map(function (x, i) {
          return '<li><span class="respaldo-num ' + x[2] + '" aria-hidden="true">' + (i + 1) + '</span><span><strong>' + x[0] + '</strong>' + (x[1] ? '<small>' + x[1] + '</small>' : '') + '</span></li>';
        }).join('') + '</ol>' +
      '</section>' +
      // 10-nov: un enlace para mandárselo al familiar (abre esta misma ficha en la vista "Tu familiar").
      '<section class="tarjeta bloque respaldo-invita" aria-labelledby="rf-invita">' +
        '<h2 class="h4" id="rf-invita">Cuéntale a tu familiar</h2>' +
        '<p class="enlace-copiar oculto-visual"><span id="rf-enlace">' + esc(enlaceRespaldo()) + '</span></p>' +
        '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-enviar-enlace">Enviar enlace</button>' +
      '</section>' +
      '<p class="respaldo-riesgo">' + icono('i-alerta') + '<span><strong>Lo que hay que saber</strong><small>Si no pagas y hay remate, tu familiar puede perder su depósito.</small></span></p>' +
      '<p class="respaldo-inspira"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>Inspirado en Barclays (Reino Unido).</p>' +
      // 20-nov: para vivir es un camino: lleva a su ficha (o a tu compra, si ya es el tuyo).
      '<div class="respaldo-accion" id="rf-accion">' + (true
        ? ((CAMINOS[estado.caminoElegido] && CAMINOS[estado.caminoElegido].familiar) ? '<a class="btn btn-primario btn-lg btn-bloque" href="#compra">Ver tu compra</a>'
          : '<a class="btn btn-primario btn-lg btn-bloque" href="#compra/caminos/familiar-' + (estado.modo === 'vivir' ? 'vivir' : 'invertir') + '">Ver el camino</a>')
        : interesa
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
      $('rf-uf').textContent = formatoRedondeado(ufAPesos(respaldoUF));
      $('rf-uf-chico').textContent = formatoUF(respaldoUF);
      $('rf-pie10').textContent = formatoPesos(ufAPesos(respaldoUF * 0.1));
      $('rf-pie5').textContent = formatoPesos(g.pie);
      $('rf-div-uf').textContent = ufDecimales(g.dividendo / SUPUESTOS.uf, 2);
      $('rf-div').textContent = formatoPesos(g.dividendo);
      $('rf-deposito').textContent = formatoRedondeado(g.deposito);
      if ($('rf-maximo')) $('rf-maximo').textContent = formatoRedondeado(g.deposito);
      if ($('cf-monto')) $('cf-monto').textContent = formatoRedondeado(g.deposito);
      rango.setAttribute('aria-valuetext', formatoUF(respaldoUF) + ': pones ' + formatoRedondeado(g.pie));
      pintar();
    });
    if ($('cf-acepto')) {
      $('cf-acepto').addEventListener('change', function () { $('btn-acepto-respaldo').setAttribute('aria-disabled', this.checked ? 'false' : 'true'); });
      $('btn-acepto-respaldo').addEventListener('click', function () {
        if (!$('cf-acepto').checked) { toast('Marca la casilla para aceptar.'); return; }
        estado.respaldoAceptado = true; guardarEstado(); renderRespaldo(cont); toast('Quedaste como respaldo. Es una simulación.');
      });
    }
    $('btn-enviar-enlace').addEventListener('click', function () {
      var url = enlaceRespaldo(), texto = 'Mira cómo me podrías ayudar con el pie de mi departamento, sin regalarme el dinero:';
      if (navigator.share) { navigator.share({ title: 'Garantía de un familiar', text: texto, url: url }).catch(function () {}); return; }
      var listo = function () { toast('Enlace copiado. Pégalo en un mensaje.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(listo, function () { toast('Copia el enlace de arriba y mándaselo.'); });
      else toast('Copia el enlace de arriba y mándaselo.');
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
    var n = (estado.avisosVistos === claveMesAvisos() ? 0 : avisosDelMes(contextoAvisos()).length) + (estado.novedades || []).length;
    return '<a class="campana" href="#compra/avisos" aria-label="Avisos' + (n ? ', ' + n + ' este mes' : '') + '">' + icono('i-campana', 'icono-campana') +
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
      '<a href="#compra" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Tu compra</a>' +
      '<header class="encabezado"><h1 id="titulo-avisos" class="h2">Avisos</h1>' +
        '<p class="texto-apoyo">Este mes' + SEP + 'máximo uno por semana</p></header>' +
      novedadesHtml() +
      (avisos.length
        ? '<ol class="notificaciones">' + avisos.map(function (a, i) {
            return '<li class="notificacion" style="animation-delay:' + (i * 60) + 'ms">' +
              '<span class="notificacion-app ' + (ICONO_AVISO[a.tipo] || ICONO_AVISO.cuota)[0] + '" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + (ICONO_AVISO[a.tipo] || ICONO_AVISO.cuota)[1] + '"/></svg></span>' +
              '<span class="notificacion-cuerpo"><small>Primer Peldaño' + SEP + a.dia + ' de ' + MESES[Number(hoyDemo().split('-')[1]) - 1] + '</small>' +
                '<strong>' + a.titulo + '</strong><span>' + a.texto + '</span></span></li>';
          }).join('') + '</ol>'
        : '<div class="vacio">' + icono('i-campana', 'icono-grande') + '<h2 class="h3">Sin avisos este mes</h2></div>') +
      '<p class="texto-centro"><a class="enlace" href="#perfil/avisos">Elegir qué avisos recibir</a></p>';
    // Ya las viste: la campana deja de contarlas.
    estado.novedades = []; guardarEstado();
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
      ? '<img class="obra-foto" src="' + foto + '" alt="' + ETAPAS_OBRA_CLARA[etapa] + ' (foto referencial)" loading="lazy">'
      : '<svg class="obra-dibujo" viewBox="0 0 120 76" role="img" aria-label="' + ETAPAS_OBRA_CLARA[etapa] + '">' + DIBUJO_ETAPA[Math.min(3, etapa)] + '</svg>';
    return '<figure class="obra-visual">' + imagen +
      '<figcaption><strong>' + ETAPAS_OBRA_CLARA[etapa] + '</strong>' +
        (p.entregaEstimada ? SEP + (mEntrega > 0 ? 'Se termina en ' + fechaLlaves(0, p.entregaEstimada) : 'Terminado') : '') +
        '<small>' + (foto ? 'Foto referencial' : 'Dibujo referencial') + '</small></figcaption></figure>';
  }
  function tuGrupoYObra(p) {
    var r = resumen(p);
    var g = cuposParaMasDescuento(r.cuposTomados, r.cupos);
    var etapa = etapaObraHoy(p);
    var obra = '<ol class="camino obra" aria-label="Avance de la obra">' + ['Terreno', 'Muros', 'Terminaciones', 'Terminado', 'Entrega'].map(function (nombre, i) {
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
        // 11-nov (test): el mensaje se puede editar y no dice cuánto llevas del pie.
        '<div class="campo"><label for="mensaje-regalo">Tu mensaje (puedes cambiarlo)</label>' +
          '<textarea id="mensaje-regalo" class="campo-texto mensaje-regalo" rows="5" maxlength="400">' + esc(estado.listaRegalos.mensaje || textoMensajeRegalo()) + '</textarea></div>' +
        '<p class="texto-apoyo"><small>Sin montos ni cuánto llevas: solo tu mensaje y el enlace.</small></p>' +
        '<div class="acciones"><button type="button" class="btn btn-primario btn-bloque" id="btn-compartir-regalo">Compartir enlace</button>' +
        '<a class="btn btn-terciario btn-bloque" href="#regalo">Ver como familia</a></div>';
    };
    abrirHojaContenido('Regalo para tu pie', dibujar(), boton, function (hoja) {
      hoja.querySelectorAll('input[name="ocasion-regalo"]').forEach(function (r) {
        r.addEventListener('change', function () {
          estado.listaRegalos.ocasion = r.value; estado.listaRegalos.mensaje = null; guardarEstado();
          $('mensaje-regalo').value = textoMensajeRegalo();
        });
      });
      $('mensaje-regalo').addEventListener('input', function () {
        estado.listaRegalos.mensaje = $('mensaje-regalo').value.slice(0, 400); guardarEstado();
      });
      $('btn-compartir-regalo').addEventListener('click', function () {
        var texto = ($('mensaje-regalo').value || '').trim() || textoMensajeRegalo();
        if (texto.indexOf(enlaceRegalo(codigoRegalo())) === -1) texto += ' ' + enlaceRegalo(codigoRegalo());
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
    var sel = { monto: 2, avatar: 0, relacion: RELACIONES[0], mensaje: '', otro: null };
    // 11-nov (test): además de los montos sugeridos, la familia puede escribir otro.
    var montoElegido = function () { return sel.monto === MONTOS_REGALO.length ? (sel.otro || 0) : MONTOS_REGALO[sel.monto]; };
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
      var monto = montoElegido();
      $('regalo-cuerpo').innerHTML =
        '<section class="tarjeta bloque regalo-aporte" aria-labelledby="titulo-tu-aporte">' +
          '<h2 class="h4" id="titulo-tu-aporte">Elige tu aporte</h2>' +
          '<div class="regalo-montos" role="radiogroup" aria-label="Monto">' + MONTOS_REGALO.map(function (m, k) {
            return '<button type="button" role="radio" aria-checked="' + (k === sel.monto) + '" data-monto="' + k + '"><strong>' + formatoPesos(m) + '</strong><small>' + NOMBRE_MONTO[k] + '</small></button>';
          }).join('') + '<button type="button" role="radio" aria-checked="' + (sel.monto === MONTOS_REGALO.length) + '" data-monto="' + MONTOS_REGALO.length + '"><strong>Otro</strong><small>Tú eliges</small></button></div>' +
          (sel.monto === MONTOS_REGALO.length ? campoDinero('regalo-otro', '¿Cuánto quieres aportar?', sel.otro) : '') +
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
      if ($('regalo-otro')) $('regalo-otro').addEventListener('input', function () {
        sel.otro = formatearCampo($('regalo-otro'));
        var m = montoElegido();
        $('btn-aportar').textContent = m > 0 ? 'Aportar ' + formatoPesos(m) : 'Escribe un monto';
        $('btn-aportar').disabled = !(m > 0);
      });
      if (!(monto > 0)) { $('btn-aportar').textContent = 'Escribe un monto'; $('btn-aportar').disabled = true; }
      $('btn-aportar').addEventListener('click', aportar);
    }

    function aportar() {
      // El regalo suma una vez: el botón se apaga al tocarlo.
      if ($('btn-aportar').disabled) return;
      $('btn-aportar').disabled = true;
      var monto = montoElegido();
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
      '<p><span id="titulo-lo-tuyo">Lo que ya es tuyo</span> ' + ayuda('patrimonio') + '</p><strong id="lo-tuyo"></strong>' +
      '<p class="md-crecio">Creció ' + formatoPesos(ufAPesos(m.crecimientoUF)) + ' este mes</p>' +
    '</section>';
    return html;
  }

  // ---------- Perfil (S3-F5) ----------
  // S15-F6: Perfil en filas cortas. Mis datos se edita en una hoja; avisos y ayuda tienen su pantalla.
  function renderPerfil(sub) {
    var c = $('perfil-contenido');
    // S28-B7: una sola cabecera por pantalla. En las subpantallas (Tu equipo, Avisos, Ayuda) manda la suya.
    $('perfil-cabeza').hidden = !!sub;
    var volver = '<a href="#perfil" class="enlace volver"><svg aria-hidden="true"><use href="#i-flecha"/></svg>Perfil</a>';
    // 11-nov: Tu avatar y tu equipo: cambiar tu avatar, agregar personas o un bebé, y quitar a alguien.
    if (sub === 'equipo') {
      c.innerHTML = volver +
        '<header class="encabezado"><h1 class="h2" id="titulo-perfil-equipo">Tu equipo</h1>' +
          '<p class="texto-apoyo">Las personas que te acompañan en tu camino. Te animan cuando avanzas y pueden aportar a tu pie.</p></header>' +
        '<ul class="tarjeta equipo-filas" aria-labelledby="titulo-perfil-equipo">' +
          '<li>' + avatarSVG(estado.avatar, 52, 'equipo-fila-av') + '<span><strong>Tú</strong><small>' + (estado.avatar ? 'Tu avatar' : 'Aún no creas tu avatar') + '</small></span>' +
            '<button type="button" class="enlace" id="btn-equipo-avatar" aria-haspopup="dialog">' + (estado.avatar ? 'Cambiar' : 'Crear') + '</button></li>' +
          estado.equipo.map(function (m) {
            var papel = papelEnEquipo(m);
            return '<li>' + avatarMiembro(m, 52, 'equipo-fila-av') + '<span><strong>' + NOMBRE_RELACION[m.relacion] + '</strong>' + (papel ? '<small>' + papel + '</small>' : '') + '</span>' +
              '<button type="button" class="enlace equipo-quitar" data-quitar="' + esc(m.id) + '" aria-label="Quitar a ' + NOMBRE_RELACION[m.relacion].toLowerCase() + '">Quitar</button></li>';
          }).join('') +
        '</ul>' +
        (estado.equipo.length ? '' : '<p class="texto-apoyo texto-centro">Todavía no sumas a nadie.</p>') +
        '<div class="acciones equipo-acciones">' +
          '<button type="button" class="btn btn-primario btn-bloque" id="btn-equipo-persona" aria-haspopup="dialog">Agregar a una persona</button>' +
          '<button type="button" class="btn btn-secundario-dark btn-bloque" id="btn-equipo-bebe" aria-haspopup="dialog">Agregar a un bebé</button>' +
        '</div>';
      var otraVez = function () { renderPerfil('equipo'); };
      $('btn-equipo-avatar').addEventListener('click', function () { editarMiAvatar($('btn-equipo-avatar'), otraVez); });
      $('btn-equipo-persona').addEventListener('click', function () { agregarAlEquipo($('btn-equipo-persona'), null, otraVez, 'pareja'); });
      $('btn-equipo-bebe').addEventListener('click', function () { agregarAlEquipo($('btn-equipo-bebe'), 'bebé', otraVez); });
      c.querySelectorAll('[data-quitar]').forEach(function (b) {
        b.addEventListener('click', function () {
          var m = estado.equipo.filter(function (x) { return x.id === b.dataset.quitar; })[0];
          estado.equipo = quitarMiembro(estado.equipo, b.dataset.quitar);
          guardarEstado();
          otraVez();
          if (m) toast(NOMBRE_RELACION[m.relacion] + ' salió de tu equipo.');
        });
      });
      return;
    }
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
      c.innerHTML = volver + ayudaPorSecciones();
      iniciarAyuda(c);
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
        '<li><a class="fila fila-avatar" href="#perfil/equipo">' + avatarSVG(estado.avatar, 48, 'fila-av') +
          '<span><strong>Tu avatar y tu equipo</strong><small>' + (estado.equipo.length ? textoEquipoPerfil() : (estado.avatar ? 'Cambiar' : 'Créalo')) + '</small></span>' +
          '<svg class="flecha-derecha" aria-hidden="true"><use href="#i-flecha"/></svg></a></li>' +
        fila('b', '', 'i-persona', 'Mis datos', (estado.modo === 'vivir' ? 'Para vivir' : 'Para arrendar') + (ingreso ? SEP + formatoPesos(ingreso) + ' al mes' : ''), 'btn-mis-datos') +
        fila('a', '#perfil/avisos', 'i-campana', 'Avisos', activos + ' de ' + TIPOS_AVISO.length + ' activos') +
        fila('b', '', 'i-buscar', 'Qué te importa más', estado.prioridad ? PRIORIDADES.filter(function (p) { return p[0] === estado.prioridad; })[0][1] : 'Sin elegir', 'btn-cambiar-prioridad-perfil') +
        fila('a', '#perfil/ayuda', 'i-ayuda', 'Ayuda', 'Qué significa cada término') +
      '</ul>' +
      // S34: lo que no es parte de tu compra va aparte (antes se mezclaba con tus datos).
      '<h2 class="h6 perfil-sub">Más de Primer Peldaño</h2>' +
      '<ul class="filas tarjeta">' +
        fila('a', '#inversiones', 'i-sube', 'Invertir en el pie de otros', estado.inversiones.length ? plural(estado.inversiones.length, 'inversión', 'inversiones') : 'Otro producto: 6' + NBSP + '% al año en UF') +
        fila('a', '#bienvenida', 'i-casa', 'Ver la introducción', '') +
      '</ul>' +
      '<h2 class="h6 perfil-sub">Para las entrevistas</h2>' +
      '<ul class="filas tarjeta">' +
        fila('a', '#registro', 'i-documento', 'Sesión de prueba', 'Registro de la entrevista') +
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
    $('btn-cambiar-prioridad-perfil').addEventListener('click', function () {
      estado.prioridadRespondida = false; guardarEstado(); location.hash = '#departamentos';
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
      location.hash = '#compra';
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
  // S30-B6: elegir departamento es una decisión de Explorar: la lista de TU camino, con la franja "Elige tu departamento".
  function rutaElegir() {
    var c = estado.caminoElegido && CAMINOS[estado.caminoElegido];
    if (!estado.preguntasListas) return '#compra';
    if (!c || (c.ficha && estado.caminoElegido !== 'arriendo-opcion')) return '#compra/caminos';
    // S32-B5: elegir departamento es la lista de Departamentos con tu camino.
    if (estado.modo === 'vivir' && CAMINOS_COMPARAR.indexOf(estado.caminoElegido) !== -1) return '#departamentos/camino/' + estado.caminoElegido;
    return '#compra/caminos/' + estado.caminoElegido + '/elegir';
  }
  // Las direcciones antiguas se llevan a las nuevas (enlaces guardados, avisos, código anterior).
  // S32-B2: las direcciones de antes (Inicio, Tus pasos, Explorar) se llevan a las nuevas pestañas.
  function rutaLegada(hash) {
    var p = hash.replace('#', '').split('/');
    var resto = p.slice(1).join('/');
    switch (p[0]) {
      case '': case 'inicio': return '#compra';
      case 'caminos': case 'mes-real': return '#compra/caminos';
      case 'camino': return '#compra' + (resto ? '/' + resto : '');
      case 'pasos': return p[1] === 'misiones' ? '#compra/misiones' : '#compra';
      case 'explorar': return '#compra/caminos' + (resto ? '/' + resto : '');
      case 'compra': return p[1] === 'elegir' ? rutaElegir() : null;
      case 'ficha': return '#compra/ficha/' + (p[1] || '');
      case 'avisos': return '#compra/avisos';
      case 'proyectos': return '#departamentos';
      case 'proyecto': return '#departamentos/' + (p[1] || '');
      case 'invertir': return '#inversiones/' + (p[1] || '') + '/invertir';
      case 'mis-proyectos': return p[1] === 'inversiones' ? '#inversiones' : (estado.compra ? '#compra/' + rutaPasoActual() : '#compra');
    }
    return RUTAS[p[0]] ? null : '#compra';
  }

  // De la dirección a la pantalla: { pantalla, seccion, dibujar }.
  // S32-B2: cuatro pestañas: Tu compra (compra), Tu pie (pie), Departamentos (deptos) y Perfil (perfil).
  function resolverRuta() {
    var p = location.hash.replace('#', '').split('/').map(function (x) { return decodeURIComponent(x); });
    var r = function (pantalla, seccion, dibujar) { return { pantalla: pantalla, seccion: seccion, dibujar: dibujar }; };
    if (p[0] === 'bienvenida') return r('intro', null, function () {});
    if (p[0] === 'regalo') return r('regalo', null, renderRegaloFamilia);
    if (p[0] === 'registro') return r('registro', 'perfil', renderRegistro);
    if (p[0] === 'perfil') return r('perfil', 'perfil', function () { renderPerfil(p[1]); });
    // Tu pie es pestaña. Si la compra está en su paso del pie (grupo), se usa esa pantalla, dentro de Tu compra.
    // S33-C4 (E6): Tu pie es siempre la pantalla del edificio en obra (también en grupo).
    if (p[0] === 'pie') return r('pie', 'pie', renderTuPie);
    if (p[0] === 'compra' && p[1] === 'pie') return r('pie', 'pie', function () { location.replace('#pie'); });
    if (p[0] === 'departamentos') {
      // S32-B5: una sola lista con «Camino ▾» y «Filtros»; usados y arriendo con opción tienen su detalle aquí.
      if (p[1] === 'camino') return r('proyectos', 'deptos', function () { if (p[2] === 'todos' || caminosDeptos().indexOf(p[2]) !== -1) deptoCamino = p[2]; renderDepartamentos(); });
      if (p[1] === 'usado' && p[2]) return r('caminos', 'deptos', function () { renderUsado(p[2]); });
      if (p[1] === 'arriendo' && p[2]) return r('caminos', 'deptos', function () { renderArriendoDepto(p[2]); });
      if (p[1]) return r('proyecto', 'deptos', function () { renderDetalle(p[1], 'departamentos', CAMINOS[p[2]] ? p[2] : null); });
      return r('proyectos', 'deptos', renderDepartamentos);
    }
    if (p[0] === 'inversiones') {
      if (p[1] === 'como') return r('invertir-como', 'perfil', renderInvertirComo);
      if (p[1] && p[2] === 'invertir') return r('invertir', 'perfil', function () { renderInvertir(p[1]); });
      if (p[1]) return r('proyecto', 'perfil', function () { renderDetalle(p[1], 'inversiones'); });
      return r('inversiones', 'perfil', renderInversiones);
    }
    // #compra/…: todo vive en Tu compra.
    if (p[1] === 'misiones') return r('pasos', 'compra', renderTodasMisiones);
    if (p[1] === 'recorrido') return r('pasos', 'compra', renderRecorrido);
    if (p[1] === 'caminos') {
      var q = p.slice(1);
      if (q[1] === 'cambia') return r('caminos', 'compra', function () { cambiosActivos = {}; renderCaminos(); });
      if (q[1] === 'arriendo-opcion') return r('caminos', 'compra', function () { if (q[2] === 'como') location.replace('#compra/caminos/arriendo-opcion'); else if (q[2]) location.replace('#departamentos/arriendo/' + q[2]); else if (estado.modo === 'vivir') renderCaminoInfo('arriendo-opcion'); else renderArriendoCamino(); });
      if (q[1] && q[2] === 'como') return r('caminos', 'compra', function () { renderLlegaAntes(q[1]); });
      if (q[1] === 'individual-vivir' && q[2] === 'califica') return r('caminos', 'compra', renderCalifica);
      if (q[1] === 'usados' && q[2]) return r('caminos', 'deptos', function () { location.replace('#departamentos/usado/' + q[2]); });
      if (q[1] === 'usados') return r('caminos', 'compra', function () { if (estado.modo === 'vivir') renderCaminoInfo('usados'); else renderUsados(); });
      if (q[1] === 'guardados') return r('caminos', 'deptos', renderGuardados);
      // S36: para vivir, cada camino abre su ficha completa (la misma de la «i»).
      if (q[1] && !q[2] && estado.modo === 'vivir' && INFO_CAMINO[q[1]] && CAMINOS_COMPARAR.indexOf(q[1]) !== -1) return r('caminos', 'compra', function () { renderCaminoInfo(q[1]); });
      if (q[1]) return r('caminos', 'compra', function () { renderUnCamino(q[1], q[2] === 'elegir'); });
      return r('caminos', 'compra', renderComparar);
    }
    switch (p[1]) {
      case 'ficha': return r('ficha', 'compra', function () { if (p[2] === 'arriendo-opcion') location.replace('#compra/caminos/arriendo-opcion'); else { if (p[2] === 'respaldo-familiar' && p[3] === 'familiar') respaldoVista = 'fam'; renderFicha(p[2]); } });
      case 'dueno': return r('caminos', 'compra', function () { renderMesDueno(p[2]); });
      case 'elegir': return r('caminos', 'deptos', function () { location.replace(rutaElegir()); });
      // #compra/proyecto/<departamento>/<camino>: un departamento mirado desde un camino; vive en Departamentos.
      case 'proyecto': return r('proyecto', 'deptos', function () { renderDetalle(p[2], 'camino', CAMINOS[p[3]] ? p[3] : null); });
      case 'avisos': return r('avisos', 'compra', renderAvisos);
      case 'postular': case 'pie': case 'firmar': case 'mi-departamento':
        return r('mis-proyectos', 'compra', function () { renderPaso(p[1], p[2]); });
    }
    return r('inicio', 'compra', renderInicio);
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
        // S28-B2: cambiar de pestaña empieza un historial nuevo: "Volver" no salta a otra pestaña.
        cambioPorBarra = true;
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
  var cambioPorBarra = false;
  var primeraPantalla = true;
  // 10-nov: en las páginas largas, el mismo "volver" de arriba se repite al final, para no tener que subir.
  function ponerVolverAbajo(pantalla) {
    if (!pantalla) return;
    pantalla.querySelectorAll('.volver-abajo').forEach(function (x) { x.remove(); });
    var arriba = [].filter.call(pantalla.querySelectorAll('a.enlace.volver'), function (x) { return !x.hidden; })[0];
    if (!arriba || !arriba.getAttribute('href')) return;
    if (pantalla.scrollHeight < window.innerHeight * 1.3) return;
    // S34: si la pantalla ya termina con su propio «Volver…», no se repite.
    var otro = [].some.call(pantalla.querySelectorAll('a, button'), function (x) {
      return x !== arriba && x.offsetParent !== null && /^\s*volver/i.test(x.textContent || '');
    });
    if (otro) return;
    var a = document.createElement('a');
    a.className = 'btn btn-terciario btn-bloque volver-abajo';
    a.href = arriba.getAttribute('href');
    var donde = arriba.textContent.trim();
    a.innerHTML = '<svg aria-hidden="true"><use href="#i-flecha"/></svg>' + (donde.length <= 14 ? 'Volver a ' + esc(donde) : 'Volver');
    a.setAttribute('aria-label', 'Volver a ' + donde);
    pantalla.appendChild(a);
  }
  // S28-B2: "Volver" vuelve a la pantalla de la que vienes (como el gesto atrás), con su nombre.
  // Si llegaste directo (sin pantalla anterior), queda el destino fijo de siempre.
  function volverAlAnterior(pantalla, hash) {
    var a = [].filter.call(pantalla.querySelectorAll('a.enlace.volver'), function (x) { return !x.hidden; })[0];
    if (!a || pilaRutas.length < 2) return;
    // S34: después de firmar, «Volver» no lleva a la firma: va a Tu compra.
    if (hash === '#compra/mi-departamento') return;
    var ant = pilaRutas[pilaRutas.length - 2];
    if (!ant || ant.hash === hash || !ant.titulo) return;
    // S34: «Volver» no salta a otra pestaña (desde Avisos a Comparar, desde Perfil a Tu mes como dueño…).
    if (seccionDeRuta(ant.hash) !== seccionDeRuta(hash) && (seccionDeRuta(ant.hash) === 'perfil' || ant.hash === '#compra/avisos')) return;
    if (RAICES_PESTANA[ant.hash]) ant = { hash: ant.hash, titulo: RAICES_PESTANA[ant.hash] };
    a.setAttribute('href', ant.hash);
    var corto = ant.titulo.length > 28 ? ant.titulo.slice(0, 26).replace(/\s+\S*$/, '') + '…' : ant.titulo;
    a.innerHTML = '<svg aria-hidden="true"><use href="#i-flecha"/></svg>' + esc(corto);
    a.setAttribute('aria-label', 'Volver a ' + ant.titulo);
  }
  function seccionDeRuta(h) {
    var p = String(h || '').replace(/^#/, '').split('/')[0];
    if (p === 'inversiones' || p === 'registro' || p === 'perfil') return 'perfil';
    if (p === 'pasos' || p === 'inicio' || p === '') return 'compra';
    return p;
  }
  var RAICES_PESTANA = { '#compra': 'Tu compra', '#pie': 'Tu pie', '#departamentos': 'Departamentos', '#perfil': 'Perfil' };
  // S28-B1: Perfil vive en el avatar de arriba a la derecha de cada pestaña.
  function ponerAvatarPerfil(pantalla, hash) {
    document.querySelectorAll('.avatar-perfil').forEach(function (x) { x.remove(); });
    // S29: Perfil volvió a la barra de abajo; el avatar de arriba ya no se pone.
    if (true) return;
    var a = document.createElement('a');
    a.className = 'avatar-perfil' + (pantalla.querySelector('.campana') ? ' con-campana' : '');
    a.href = '#perfil';
    a.setAttribute('aria-label', 'Tu perfil');
    a.innerHTML = estado.avatar ? avatarSVG(estado.avatar, 40, 'avatar-perfil-av') : '<svg aria-hidden="true"><use href="#i-perfil"/></svg>';
    pantalla.insertBefore(a, pantalla.firstChild);
  }
  function mostrar() {
    cerrarHoja(false);
    cerrarToastViejo();
    var legado = rutaLegada(location.hash);
    if (legado) { location.replace(legado); return; }
    var hashNuevo = location.hash;
    // S7-F6: la primera vez, antes de Mi camino, se muestra la introducción.
    if (hashNuevo === '#compra' && !estado.introVista) { location.replace('#bienvenida'); return; }
    var yAntes = window.scrollY;
    var destino = resolverRuta();
    destino.dibujar();
    // Si la pantalla redirigió mientras se dibujaba, la nueva dirección se encarga.
    if (location.hash !== hashNuevo) return;
    document.body.classList.toggle('en-intro', destino.pantalla === 'intro');
    if (destino.pantalla !== 'inicio') document.body.classList.remove('en-preguntas');
    document.body.classList.toggle('en-familia', destino.pantalla === 'regalo');
    if (cambioPorBarra) { pilaRutas = []; cambioPorBarra = false; }
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
    var h1 = visible.querySelector('h1');
    pilaRutas[pilaRutas.length - 1].titulo = h1 ? h1.textContent.trim() : '';
    volverAlAnterior(visible, hashNuevo);
    ponerAvatarPerfil(visible, hashNuevo);
    ponerVolverAbajo(visible);
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
