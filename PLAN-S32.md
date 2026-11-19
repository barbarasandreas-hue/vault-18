# PLAN · Sprint 32 — La nueva navegación, sobre la app de siempre (19-nov-2026)

Plan para llevar la navegación del prototipo (lienzo «Primer Peldaño · Prototipo de navegación», versión 2) a la app de `vault-18`, **usando la app como base**: sus cálculos, pantallas, textos, ilustraciones y pruebas. Del prototipo se toma la **estructura** (pestañas, recorrido, comparador, filtros), no su código ni sus cifras de ejemplo.

**Frase para partir:**
> Ejecuta `PLAN-S32.md` completo, en orden. Primero el respaldo (B0); publica un borrador después de B3 y otro después de B6; no subas nada a GitHub.

---

## 0. Decisiones que tomé por ti (cada una se cambia con una línea)

| # | Duda | Qué asumí | Alternativa |
|---|---|---|---|
| D1 | Nombres y orden de la barra | **Mi compra · Mi pie · Departamentos · Perfil** (pedido del 19-nov). | — |
| D2 | ¿«Tus números» es un paso? | **No.** Son obligatorios al entrar: viven en el registro y en Mis datos. | — |
| D3 | ¿«Tu cuenta de vivienda» es un paso? | **No como paso aparte**: es la primera acción de «Juntar el pie» (si no la tienes, el botón dice «Abrir mi cuenta»). Si hay DS1, la misión «Postula al DS1» la sigue pidiendo. | Dejarla como paso 2 en todos los caminos. |
| D4 | Pasos según el camino | Los del prototipo, con los ids que ya usa `calculos.js` (tabla §3). «Elegir camino» y «Elegir departamento» pasan de misión a paso. | — |
| D5 | Elegir departamento temprano (paso 2) | Es **tu departamento meta**: fija el precio con que se calcula tu fecha. **No se reserva**: eso es «Asegurarlo». Se puede cambiar sin perder nada. | Mantenerlo como requisito antes de Asegurar (como hoy). |
| D6 | Cómo se ve el recorrido | **El camino horizontal** del prototipo (paradas que ondulan hasta tu casa, tu avatar en la actual). La escalera queda solo en la lógica. | Volver a la escalera visual. |
| D7 | Dónde va el edificio en obra | **Solo en Mi pie** (ya existe en Tu pie: `obraSvg` y `textoEtapaPie`). No se repite en Mi compra. | — |
| D8 | «¿Te parece mucho tiempo?» de Inicio | Se reemplaza por la tarjeta «Ahora» (el paso «¿Cómo compro?» lleva al comparador). La cifra del crédito tradicional sigue arriba hasta que eliges camino (decisión S27-B2, confirmada el 18-nov). | — |
| D9 | El deslizador «Si juntas al mes» | Se va a **Mi pie** y al **comparador**. En Mi compra solo se ve su efecto («Llegas N meses antes»). | Dejar una copia en Mi compra. |
| D10 | Las ayudas (DS1, sin IVA, regalo, respaldo) | Se mantienen tal cual (S30-B1), dentro de la página de cada camino («Cómo funciona»). | — |
| D11 | Modo «Para arrendar» (inversión) | Misma estructura de 4 pestañas; el comparador muestra los caminos de inversión que ya existen. Sin pantallas nuevas en este sprint. | Dejarlo para un sprint aparte. |
| D12 | Estampillas de logro del pie | **No se agregan.** La barra de Tu pie y sus marcas quedan como están. | — |
| D13 | Cifras | **Ninguna cifra del prototipo pasa a la app.** Fechas, metas, dividendos y plazos salen de `calculos.js`, `datos.js` y S31. | — |

---

## 1. Qué se queda, qué cambia y qué se va

### Se queda tal cual (la base)
- **Cálculos y datos:** `calculos.js` completo (plazos, piezas, DS1 con tramos 1–4, preaprobación, `listoParaBanco`, `DE_SI_A_LLAVES`), `datos.js` (proyectos, usados, arriendo con opción, fotos).
- **Pantallas que funcionan bien:** registro de 4 preguntas (`renderPreguntas`), Tu pie (`renderTuPie`) con transferencia S30/S31, preaprobación (`renderPostula`, `renderDocumentos`, `renderResultadoPreaprobacion`), firma (`renderFirma` con «Del sí del banco a las llaves»), Mi departamento, detalle de proyecto (`renderDetalle`), ayudas (`renderLlegaAntes`), respaldo familiar, regalo de la familia, avisos, Perfil e Inversiones.
- **Recursos visuales:** avatar y creador de avatar (`avatarSVG`, `abrirCreador`), obra que se construye (`obraSvg`, `obraGrande`, `tarjetaObra`), confeti y «¡Subiste un escalón!», ánimos del equipo (`animosInicio`), íconos del sprite de `index.html`, fotos de edificios e interiores, Bci Kit en `estilos.css` (colores, Overpass, botones píldora, hojas inferiores, tokens de movimiento).
- **Reglas de navegación vigentes:** la barra solo cambia cuando se toca; «Volver» al anterior con su nombre (`volverAlAnterior`); tocar la pestaña activa vuelve a su raíz; cada pestaña recuerda dónde quedaste (`ultimaRuta`); una acción principal por pantalla; datos y filtros en hojas inferiores.

### Cambia (del prototipo)
| Hoy en la app | Pasa a |
|---|---|
| Barra Inicio · Tus pasos · Explorar · Perfil | Mi compra · Mi pie · Departamentos · Perfil |
| Inicio (fecha, «¿Te parece mucho tiempo?», obra) + Tus pasos (escalera, misiones) | **Mi compra**: fecha · camino horizontal · «Ahora» · «Vence primero» y misiones · «Ver todo tu recorrido» |
| Explorar › «¿Qué quieres explorar?» y Un camino | **Comparar caminos** (desde Mi compra y Departamentos): carrera, «¿Qué te importa más?», lado a lado, «i» de cada camino |
| Tres listas de departamentos (del camino, todos, usados) + arriendo aparte | **Departamentos**: una lista con «Camino ▾» y «Filtros» |
| Tu pie como pantalla escondida bajo Inicio | **Mi pie** como pestaña |
| Escalera con «Tus números» y «Tu cuenta» | Pasos según el camino, desde «¿Cómo compro?» |
| Cambiar de camino sin vuelta atrás | Hoja «Tu fecha pasa de X a Y» + **Deshacer** y «Volver» |

### Se va
- Las raíces `#pasos` y `#explorar` (redirigen, no se borran sus funciones de golpe: B8).
- La tarjeta «¿Te parece mucho tiempo?» y el deslizador de Inicio (D8, D9).
- Los botones «Ver mi pie» de Inicio y Tus pasos (Mi pie es pestaña).

---

## 2. Rutas nuevas y redirecciones

| Ruta nueva | Pestaña | Qué es | Reemplaza |
|---|---|---|---|
| `#compra` | Mi compra | Portada | `#camino` (Inicio) |
| `#compra/recorrido` | Mi compra | Línea de tiempo con fechas | `#pasos` |
| `#compra/misiones` | Mi compra | Todas las misiones | `#pasos/misiones` |
| `#compra/caminos` | Mi compra | Comparar caminos | `#explorar` |
| `#compra/caminos/<id>` | Mi compra | Cómo funciona un camino (+ ayudas) | `#explorar/<id>`, `#explorar/<id>/como` |
| `#compra/<paso>` | Mi compra | Pantallas de la compra (postular, documentos, pie del grupo, firmar, mi departamento) | `#camino/postular`, `#camino/firmar`… |
| `#pie` | Mi pie | Tu pie | `#pie` (marcaba Inicio) y `#camino/pie` |
| `#departamentos` · `#departamentos/<id>` | Departamentos | Lista y detalle | `#departamentos`, `#explorar/usados`, `#explorar/arriendo-opcion`, `#camino/proyecto/…` |
| `#perfil…` | Perfil | Igual que hoy | — |

`rutaLegada()` redirige **todas** las rutas viejas (incluidos enlaces de avisos, toasts y hojas). Antes de cerrar B2: `grep -n "'#camino\|'#pasos\|'#explorar" js/app.js` debe devolver solo redirecciones.

---

## 3. Pasos por camino (B1)

Nueva constante en `calculos.js`, junto a la actual de hitos:

| Camino (id en la app) | Pasos |
|---|---|
| Crédito con garantía (`individual-vivir`) | `camino` → `depto` → `pie` → `preaprobacion` → `asegurar` → `es-tuyo` |
| Crédito tradicional / usados (`usados`) | `camino` → `depto` → `pie` → `preaprobacion` → `asegurar` → `es-tuyo` |
| Compra en grupo (`grupo-vivir`) | `camino` → `depto` → `preaprobacion` (tu cupo) → `pie` (cuotas en obra) → `aprobacion` → `es-tuyo` |
| Arriendo con opción (`arriendo-opcion`) | `camino` → `depto` → `entrada` → `contrato` → `pie` → `preaprobacion` → `es-tuyo` |
| Sin camino | `camino` → `es-tuyo` (se muestra: «Tus pasos aparecen cuando eliges tu camino») |

- `hitoActual(s)` y `hitoHecho(id, s)` usan esta lista. `camino` está hecho si hay `caminoElegido`; `depto` si hay departamento meta.
- Las misiones (`misiones()`) pierden «Elige tu camino y tu departamento» (ahora son pasos). Siguen: DS1 con fecha, Registro Social, ahorro automático, bajo llave, equipo. El orden por urgencia no cambia.
- Pruebas: actualizar las que esperan 6 hitos con `numeros` y `cuenta` (`caminos.test.js`, `sprint21`, `sprint22`, `sprint26`, `sprint27`, `sprint30`); **actualizar, no borrar**.

---

## 4. Bloques de trabajo (en este orden)

### B0 · Respaldo y base (10 min)
- Copia de `vault-18` a `vault-18_respaldo-s32` (como en S30).
- Hay trabajo de S27–S31 sin commit: proponer el commit local con el mensaje de `claude/sprint-30-resultado-nov2026.md` + S31, **y preguntar antes de hacerlo**. Nada a GitHub.
- Todas las pruebas en verde antes de tocar nada (hoy: 18 archivos).

### B1 · Pasos por camino (lógica)
- `PASOS_POR_CAMINO` en `calculos.js` (§3), `hitoActual` y `misiones` adaptados.
- `NOMBRE_HITO`, `CORTO_HITO` y `TEXTO_HITO` suman `camino` y `depto`; los textos de grupo y arriendo ya existen (`TEXTO_HITO_GRUPO`, `TEXTO_HITO_ARRIENDO`).
- `tests/sprint32.test.js`: cada camino da su lista; sin camino, 2 pasos; las misiones no repiten pasos.

### B2 · Barra y rutas
- `index.html`: barra con `#compra`, `#pie`, `#departamentos`, `#perfil` y sus íconos (casa, alcancía, lupa, persona; trazo como el resto del sprite).
- `resolverRuta()`: tabla §2. `RAICES_PESTANA` y `ultimaRuta` con las 4 nuevas.
- `rutaLegada()`: todas las rutas viejas (§2).
- Recorrer las rutas con Playwright a 390 px: ninguna con error de JavaScript, ninguna pestaña marcada de más (vuelve a nacer el chequeo de rutas de S30).

### B3 · Mi compra (portada)
- `renderMiCompra()` nueva, armada con piezas que ya existen:
  1. **Fecha**: el bloque azul de `renderTuCaminoVivir` (con «Con crédito tradicional…» hasta elegir camino, «Todavía no» con `salidaPrincipalHtml` si no alcanza) + botón «Comparar caminos ›».
  2. **Camino horizontal** (nuevo, `caminoJuego(hitos)`): SVG con las paradas del camino, `avatarSVG(estado.avatar)` en la actual, la casa al final; cada parada es un `<button>` que abre `abrirHito`. Colores Bci (verde lo recorrido, blanco por recorrer).
  3. **Ahora**: `tarjetaSiguientePaso()` (ya elige qué mostrar).
  4. **Vence primero** y «Misiones (N) ›»: la tarjeta amarilla de Tus pasos.
  5. «Ver todo tu recorrido, con fechas ›» → `#compra/recorrido` (lista vertical de `renderTusPasos` con fecha aproximada por paso).
- Se mantienen el confeti, «¡Avanzaste un paso!» (antes «¡Subiste un escalón!») y los ánimos del equipo.
- **Borrador 1** al terminar B3.

### B4 · Comparar caminos
- `renderComparar()` en `#compra/caminos`, con los caminos que ya calcula `renderExplorar` (`recomendarCamino`, `llegada()`, `DATOS_CAMINO`, «Por qué no te mostramos otros»):
  - «¿Qué te importa más?» (llegar antes · pagar menos al mes · mudarme ya): cambia el «Para ti».
  - Deslizador «Si juntas al mes» que mueve todas las barras.
  - Carrera hacia tus llaves (una barra por camino, con su fecha real).
  - Lado a lado (dos caminos): te mudas, es tuyo, pasos, pie, pagas al mes, departamento, lo bueno, ojo.
- «i» de cada camino: hoja corta (qué es, cómo funciona en 3 pasos, tus pasos, con tus números, para quién, ten en cuenta) + «Ver todo sobre este camino ›» → `#compra/caminos/<id>`: `renderUnCamino` **sin lista de departamentos** (vive en Departamentos) y con las ayudas de S30.
- Elegir: hoja de S30-B3 («Tu fecha pasa de X a Y») + **Deshacer** en el toast y «Antes ibas por X · Volver» hasta el siguiente paso (`estado.caminoAnterior`).

### B5 · Departamentos
- `renderLista` como raíz de la pestaña, con dos botones: **Camino ▾** (hoja: todos + cada camino, con cuántos hay y «mirar no cambia tu plan») y **Filtros** (`abrirFiltros` ampliado: comuna, precio, dormitorios, estado —en obra, nuevo, usado—, ordenar por —llegas antes, menor precio— y solo favoritos).
- Usados y arriendo con opción entran a la misma lista (filtro por camino); `renderUsado` y `renderArriendoDepto` quedan como detalle.
- Detalle (`renderDetalle`): «Elegir este departamento» si es tu camino y vas en ese paso; si es de otro camino, «Cambiarme a X con este» (pasa por la hoja de B4 y queda elegido) y «Cómo funciona este camino». Al elegir, vuelves a Mi compra con el paso marcado.
- Cada tarjeta mantiene foto, precio y «Con este, tus llaves en…».

### B6 · Mi pie
- `renderTuPie` es la raíz de la pestaña. Se suma el deslizador «Si juntas al mes» con su efecto en la fecha (sale de Inicio).
- El edificio en obra que ya tiene (`obraSvg`, `textoEtapaPie`) queda arriba, junto al saldo.
- Si no hay cuenta: «Abrir mi cuenta» (D3).
- **Borrador 2** al terminar B6.

### B7 · Los pasos de la compra dentro de Mi compra
- Preaprobación, documentos, pie del grupo, firma y Mi departamento siguen siendo las mismas pantallas; solo cambian su ruta (`#compra/…`) y su pestaña (Mi compra).
- «¿Me aprueban?» abre con la lista «¿Listo para el banco?» de S31 y la carpeta de documentos; «Es tuyo» con «Del sí del banco a las llaves».

### B8 · Limpieza
- Quitar los botones y textos que apuntaban a Tus pasos, Explorar o «Ver mi pie».
- Las funciones que quedaron sin uso (`renderExplorar`, raíz de `renderTusPasos`) se borran solo si `grep` confirma que nada las llama.
- Dieta de texto de S30: ≤ 60 palabras visibles por pantalla sin desplegar; un texto de apoyo por tarjeta.

### B9 · Verificación
- Todas las pruebas en verde, más `sprint32.test.js`.
- Recorrido completo de los 4 caminos (de elegir camino a «¡Es tuyo!»), cambio de camino con deshacer y cambio desde un departamento, con Playwright a 390 px y sin errores de JavaScript.
- Capturas a 360 y 390 px, texto al 150 %, contraste ≥ 4,5:1 en lo nuevo, toques ≥ 44 px.

### B10 · Cierre
- `claude/sprint-32-resultado-nov2026.md` en el proyecto, actualizar `mapa-navegacion-nov2026.md`, `CLAUDE.md` (sección de estructura) y el artefacto publicado.

---

## 5. Cómo sabremos si mejoró (siguiente testeo)

| Tarea | Hoy | Meta |
|---|---|---|
| Elegir camino y departamento | 60 % | ≥ 80 % |
| Encontrar la misión que vence primero | 10 % → ya arriba | ≥ 80 % |
| «¿Qué camino te conviene y por qué?» (nueva) | — | ≥ 80 % con razón correcta |
| Toques de Mi compra a elegir camino | 3–4 | ≤ 2 |
| SEQ en esas tareas | 4,8 y 4,6 | ≥ 5,5 |

---

## 6. Riesgos

- **B1 toca la columna vertebral** (hitos y misiones): muchas pruebas dependen de ella. Hacer B1 solo, con todas las pruebas en verde, antes de B2.
- **Elegir departamento temprano (D5)** cambia la promesa: dejar claro «no lo reservas, lo usamos para calcular tu fecha».
- **Modo arrendar (D11)** queda con la misma barra pero sin rediseño propio: revisar que nada se rompa.
- **Rutas viejas** en avisos y toasts: si se escapa una, la usuaria cae en una pestaña vacía. El chequeo de B2 lo evita.
- **Tamaño**: `app.js` tiene 8.443 líneas; construir funciones nuevas pequeñas que llamen a las existentes, no reescribir las grandes.
