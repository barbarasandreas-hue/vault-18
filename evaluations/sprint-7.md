# Evaluación del Sprint 7 · Pulido, comprensión y accesibilidad

Evaluado sobre el commit `611e97c`, contra la sección "Sprint 7" de `PLAN.md` (S7-F1 a S7-F6), `CLAUDE.md`, `docs/bci-kit.md` y `sprints/sprint-7-entrega.md`.

Usé el servidor local del puerto 8000 y Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 640, con un script que habla directo con Chrome por CDP. El script escribió tecla por tecla en los campos y tocó los botones con clics reales en su posición en pantalla.

Recorrió 28 pantallas y estados en cada tamaño:
- Introducción e Inicio, vacío y con resultado.
- Proyectos, con las dos pestañas y el filtro.
- 2 detalles, con todas las explicaciones abiertas y el botón en carga.
- Postula: vacío, con error, en rojo, en amarillo y en holgado.
- Tu 5 %: inicio, error, meses y avance.
- Firma, Mi departamento y su excedente, y Mi camino.
- Invertir: vacío, con error y con un monto válido.
- Mis inversiones, con cobro.
- Perfil, con la confirmación de borrar abierta.
- Una ruta que no existe.

En cada estado midió el contraste del texto contra su fondo real, los elementos fuera del ancho, los textos cortados y los toques chicos. Hubo 0 excepciones, 0 errores de consola y 0 respuestas 4xx. No probé en un teléfono físico.

## 1. Veredicto

**RECHAZADO.** S7-F2, S7-F3, S7-F5 y S7-F6 se aprueban. **S7-F1 y S7-F4 se rechazan**:

- **S7-F4:** el botón "?" no responde al primer toque cuando el cursor está en un campo. Pasa justo donde más se usa: en Inicio y en Postula, recién después de escribir los sueldos. Además, tres botones "?" tienen una zona tocable real de 32 a 34 px de alto, y en Proyectos la parte de abajo abre una tarjeta de proyecto.
- **S7-F1:** "Cambiar mi compra a este proyecto" pasa de 80 a 57 px de alto al cargar. Además, si el usuario toca otra sección durante la carga, la app lo devuelve a Mis proyectos.

Los dos pendientes de la segunda revisión del Sprint 6 están resueltos.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 75 de 75 pasan, incluidas las 22 de `tests/contraste.test.js` |
| `node --test tests/` | En Node 24.19 sigue fallando (`✖ tests … 'test failed'`), igual que en los sprints anteriores. `node --test tests/*.test.js` da 75 de 75. Es tarea del Planner (octavo sprint pendiente) y no bloquea por sí sola, igual que antes |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto" index.html js/ css/` | Vacío |
| Rutas `src="/"` o `href="/"` | Ninguna |
| Librerías externas | Ninguna, solo Google Fonts (Overpass) |
| HTTP 200, en local y en GitHub Pages | `/`, `index.html`, `css/estilos.css`, los 3 JS, `manifest.webmanifest` y los 3 íconos. El `app.js` y el `estilos.css` de Pages son idénticos a los locales (mismo md5) |

**Sobre `tests/contraste.test.js`:** prueba algo real, porque lee los hexadecimales del CSS y aplica la fórmula WCAG. El límite es que revisa una lista de 21 parejas escrita a mano y no las que la app usa de verdad. Por eso no habría detectado las 2 fallas por herencia que el Generator encontró con su script. Lo dejo como sugerencia.

## Pendientes de la segunda revisión del Sprint 6

| # | Pendiente | | Evidencia |
|---|---|---|---|
| 1 | `Math.min(360, …)` en "Otro mes" | ✅ | `js/app.js:1479` usa `Math.min(SUPUESTOS.mesesBci, m.mes + 1)`. `grep` no encuentra ningún `360` ni `120` literal en `app.js` |
| 2 | "Ver" de "Tus inversiones" en gris | ✅ | `css/estilos.css:718`: la regla del gris ahora es `.linea-inversiones > span:first-child`, así que `.linea-ver` queda en `--blue-dark` |

## 3. Tabla por feature

### S7-F1 Estado de carga en botones — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Comprar aquí, Postular, Firmar y Confirmar muestran la carga antes de avanzar | ✅ | `conCarga()` (`js/app.js:90-99`). Medido en los 4: el texto pasa a "Cargando…", con `aria-busy="true"`, se anuncia "Cargando…" en `#anuncio` y avanza a los 0,7 s |
| Cambiar mi compra a este proyecto muestra la carga | ✅ | `js/app.js:754-760`. Avanza a `#mis-proyectos` con la compra en Mirador Santa Lucía, paso 1 |
| Mantiene el tamaño | ❌ | Comprar, Postular, Firmar y Confirmar quedan en 350 × 57 (390) y 320 × 57 (360), y mantienen su color (`rgb(40,137,43)` con texto blanco). **Cambiar mi compra mide 350 × 80 y en carga pasa a 350 × 57 (a 360: de 320 × 80 a 320 × 57)**: el texto largo ocupa 2 líneas y "Cargando…" solo 1. `conCarga` fija `minWidth`, pero no la altura (`js/app.js:92`) |
| Un segundo toque no repite la acción | ✅ | Con doble toque en Confirmar (clic real y `.click()`) queda 1 sola inversión en `localStorage`. La compra se guarda 1 vez. La protección es la clase `is-cargando` (`js/app.js:90`) y `pointer-events: none` (`css/estilos.css:201`) |
| Respeta el movimiento reducido | ✅ | Con `prefers-reduced-motion: reduce` emulado, el `::after` queda con `animation-name: none` y `opacity: 0.6` (`css/estilos.css:211-214`) |
| No secuestra la navegación | ❌ | Toqué Comprar aquí y enseguida Perfil en la barra: el hash pasa a `#perfil` y 0,7 s después la app salta sola a `#mis-proyectos`. El `setTimeout` (`js/app.js:98`) ejecuta la acción aunque el usuario ya se haya ido. Postular y Firmar además llaman a `renderMisProyectos()`/`renderMiCompra()` y a `scrollTo(0,0)` sobre otra pantalla |

### S7-F2 Contraste AA — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Todo el texto visible cumple 4,5:1 (normal) o 3:1 (grande) contra su fondo real | ✅ | Mi auditoría independiente (color calculado de cada elemento con texto, mezclando la opacidad y el fondo real de los ancestros) da **0 fallas en las 28 pantallas y estados, a 390 y a 360**, con todas las explicaciones abiertas, el botón en carga, Postula en rojo, amarillo (25,1 %, con 1.200.000 + 900.000) y holgado, y los errores |
| Las 2 correcciones | ✅ | `.ayuda-globo` con `--gray-dark` sobre `--blue-20` = 7,40:1 (antes 4,14). `.cascada-final small` con `--gray-dark` sobre `--green-20` = 7,44:1 (antes 4,16) |
| Casos al borde | ✅ | El blanco sobre `--green-normal` da 4,46:1, pero el botón primario es de 19 px en negrita 700 (texto grande, mínimo 3:1). El ícono "?" `--blue-dark` da 7,39:1 sobre blanco, 6,92:1 sobre `--yellow-20` y 5,22:1 sobre `--red-20` |

### S7-F3 Textos de 10 segundos — ✅ aprobada

| Pantalla | Título | Apoyo | |
|---|---|---|---|
| Introducción | "Tu departamento con el 5 % del precio" (7) | "Lo pagan entre tres partes, y tú pones la más chica." (11) | ✅ con excepción |
| Inicio | "Tu departamento con el 5 %" (5) | 10 | ✅ |
| Proyectos | "Proyectos" (1) | "Únete a una compra o financia tu pie." (8) | ✅ |
| Detalle | "Edificio Alto Ñuñoa" (3), "Edificio Plaza Independencia" (3) | comuna y ficha | ✅ |
| Invertir | "Invertir" (1) | nombre y comuna | ✅ |
| Mis proyectos | "Mis proyectos" (2) | 9 | ✅ |
| Mi camino | "Mi camino" (2) | nombre y comuna | ✅ |
| Perfil | "Perfil" (1) | "Lo que la app recuerda en este teléfono." (8) | ✅ |

**Sobre la Introducción:** acepto las 7 palabras. S7-F6 dicta ese texto entre comillas, y un requisito específico prevalece sobre la regla general de S7-F3. Además, la frase se lee de un vistazo: son 2 líneas en Display 4 a 360 px. Recomiendo que el Planner deje anotada la excepción en `PLAN.md`, para que no vuelva a discutirse.

### S7-F4 Explicaciones a un toque — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Los 7 términos tienen un botón de ayuda | ✅ | `GLOSARIO` (`js/app.js:203-218`), en Inicio (pie), Proyectos (las 2 pestañas), Detalle (tipo, dividendo, segunda hipoteca, cuenta custodia), Postula (carga), Tu 5 % (pie), Firma (dividendo, segunda hipoteca, cuenta custodia) y Mi departamento (cuenta custodia) |
| Botón de 44 × 44 px con `aria-label` y `aria-expanded` | ❌ | La caja mide 44 × 44 y tiene `aria-label` ("¿Qué es la carga?") y `aria-expanded`. Pero los márgenes negativos (`css/estilos.css:723`, `margin: -12px -10px -12px -6px`) dejan su parte de abajo bajo el elemento siguiente. Medido con `elementFromPoint` en una grilla de 2 px: **Inicio (pie): 34 px de alto útil**, porque la tapa la tarjeta protagonista. **Postula (carga): 32 px**, porque la tapa el número "26,0 %". **Proyectos: 34 px**, y los 10 px de abajo caen sobre la primera tarjeta de proyecto, que es un enlace: un toque en esa zona abre un proyecto en vez de la explicación. En el detalle quedan entre 42 y 44 px |
| Abre y cierra | ❌ | Al tocar se abre (`aria-expanded="true"` y un globo), y al volver a tocar se cierra (`false` y 0 globos). **Pero si el cursor está en un campo, el primer toque no hace nada:** el `blur` del campo vuelve a dibujar el resultado y reemplaza el botón antes del clic. Reproducido: Inicio con el foco en "Sueldo de tu pareja" da `['false', 0]`, Postula con el foco en el sueldo da `['false', 0]`, y Mi departamento recién cambiado el arriendo (`change` → `renderMiCompra()`) da `['false', 0]`. Son `js/app.js:471`, `:1086` y `:1451`. Es el camino natural: escribir el sueldo y tocar "?" para entender la carga |
| Una frase sin jerga | ✅ | Las 7 son una frase, en segunda persona y sin siglas. "Precio de lista" es lo más técnico, y es aceptable |
| Perfil › Ayuda reúne las 7 | ✅ | `glosarioCompleto()` como `<dl>`, con las 7 en el mismo orden y el enlace "Ver de nuevo la introducción", que lleva a `#bienvenida` |

### S7-F5 Revisión en 360 px — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Sin scroll horizontal | ✅ | `scrollWidth − innerWidth = 0` en las 28 pantallas a 360 × 640 y a 390 × 844. Como `body` tiene `overflow-x: hidden`, también revisé el rectángulo de cada elemento: 0 elementos fuera del ancho |
| Ningún texto cortado | ✅ | 0 elementos con texto recortado por `overflow` o `ellipsis`, también con las explicaciones abiertas |
| Toques | ✅ | Salvo los "?" (ver S7-F4), nada mide menos de 44 px. Los `input[type=radio]` de 13 × 13 son los nativos ocultos de los selectores, que se tocan por su etiqueta (aprobado en sprints anteriores) |

Nota: en la Introducción a 360 × 640, "Empezar" quedó al final del contenido (y = 606 a 663 en un alto de 640), así que se ve solo la parte de arriba del botón hasta bajar un poco. No es un texto cortado, pero ver "Qué revisar a mano".

### S7-F6 Introducción — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Solo la primera vez y antes de Inicio | ✅ | Sin datos, `/` lleva a `#bienvenida` sin la barra (`display: none`). "Empezar" guarda `primer-peldano-intro=1` y lleva a `#inicio`. Al recargar ya no aparece. Con una compra o inversiones guardadas tampoco (`js/app.js:1703`) |
| El mensaje y la lista con check de las 3 partes | ✅ | `index.html:47-58`: "Tu departamento con el 5 % del precio", con `lista-check` de Bci (80 %), inversionistas (15 %) y tú (5 % y los gastos). Las tres van con check, y el orden no importa |
| No repite el cálculo | ✅ | El texto no tiene `$` ni "UF + número" (revisado con una expresión regular sobre `innerText`) |
| Vuelve tras "Empezar de nuevo" | ✅ | Perfil › Empezar de nuevo › "Sí, borrar todo" lleva a `#bienvenida` con la introducción visible. `borrarTodo()` borra `CLAVE_INTRO` |
| Funciona sin localStorage | ✅ | Con `localStorage` bloqueado (el getter lanza `SecurityError`): aparece la introducción, "Empezar" lleva a Inicio, ir a Proyectos y volver a Inicio no la repite, "Empezar de nuevo" la muestra otra vez, y hay 0 excepciones |
| Sin plusvalía | ✅ | Sello "Sin promesas de plusvalía" |

Defecto menor que no bloquea: después de "Empezar", el botón Atrás del teléfono vuelve a `#bienvenida` y muestra la introducción otra vez. El motivo es que "Empezar" usa `location.hash = '#inicio'` (`js/app.js:270`), que agrega una entrada al historial.

### Regresiones

No hay. Recalculé con `node -e` (UF $41.065; 4,5 % a 30 años; UF + 8 % a 10 años; seguros UF 0,7; 10 % de administración y 1 mes vacío; tope de 25 %):

| Dato | En pantalla | Recalculado |
|---|---|---|
| Alto Ñuñoa en lote (UF 2.250): dividendo | $403.272 | $403.272 |
| Alto Ñuñoa en lote: inversionistas | $168.153 | $168.153 |
| Alto Ñuñoa en lote: total al mes | $571.425 | $571.425 |
| Arriendo $450.000: neto | $371.250 | $371.250 |
| Arriendo $450.000: tú pones | $200.175 | $200.175 |
| Carga con $2.200.000 | 26,0 % | 26,0 % |
| Carga con $2.700.000 | 21,2 % | 21,2 % |
| Inicio con 1.200.000 + 1.000.000: compras hasta | UF 2.161 | UF 2.161 ($549.959 ≤ $550.000; UF 2.162 ya da $550.200) |
| UF 50 invertidas: recibes al mes | $24.912 | $24.912 |

El sprint no agrega fórmulas, y `app.js` no hace cálculos nuevos por su cuenta.

## 4. Puntuaciones

| Dimensión | Nota | Por qué |
|---|---|---|
| Funcionalidad | 3 | La introducción, el contraste y los textos funcionan bien, pero la ayuda falla al primer toque en el flujo principal, y la carga puede llevarte a otra pantalla sin que la pidas |
| Calidad móvil | 3 | No hay desbordes a 360 y se respeta el movimiento reducido, pero tres "?" tienen 32 a 34 px de alto útil, uno abre un proyecto por error y un botón cambia de alto al cargar |
| Código | 4 | `conCarga` y el manejador único de ayudas son limpios, y la prueba de contraste es real. Faltan cancelar el temporizador y un comentario quedó fuera de lugar en `index.html:46` ("Inicio: simulador" quedó sobre la Introducción) |
| Diseño | 4 | La introducción es clara y de marca. El globo azul claro se lee bien. La explicación de la pestaña de Proyectos casi repite la frase de arriba, y el término "pie" no aparece escrito donde está su "?" (Inicio y Tu 5 %) |

## 5. Correcciones requeridas

1. **S7-F4: que el "?" responda al primer toque aunque el cursor esté en un campo.** En `js/app.js:471` (Inicio), `:1086` (Postula) y `:1451` (Mi departamento), el `blur`/`change` vuelve a dibujar el bloque que contiene el botón y lo reemplaza antes del clic. Opciones: no volver a dibujar en `blur` si el valor no cambió; actualizar solo el texto del error sin rehacer el `innerHTML` del resultado; o escuchar el `pointerdown` de `.btn-ayuda`, con `preventDefault()` para que el campo no pierda el foco antes del clic. Para probarlo: escribe un sueldo y, sin tocar fuera, toca "?" de "Tu carga". Debe abrirse a la primera.
2. **S7-F4: zona tocable real de 44 × 44 px en todos los "?".** Los márgenes negativos de `.btn-ayuda` (`css/estilos.css:723`) hacen que el elemento siguiente tape la parte de abajo: Inicio (34 px), Postula (32 px) y Proyectos (34 px, con 10 px encima de la tarjeta de proyecto, que abre un proyecto). Hay que darle `position: relative; z-index: 1` al botón y separar el bloque siguiente (por ejemplo, `margin-bottom` en `#proyectos-explica`, en `.etiqueta` de la carga y en el apoyo de Inicio), para que ningún enlace quede bajo esos 44 px.
3. **S7-F1: mantener también el alto en la carga.** En `conCarga` (`js/app.js:92`), fija además `boton.style.minHeight = boton.offsetHeight + 'px'`. Hoy "Cambiar mi compra a este proyecto" pasa de 80 a 57 px.
4. **S7-F1: no ejecutar la acción si el usuario ya se fue de la pantalla.** Guarda el hash al empezar la carga y, dentro del `setTimeout`, no hagas nada si cambió, o cancela el temporizador en `mostrar()`. Hoy, tocar Comprar aquí y luego Perfil devuelve al usuario a Mis proyectos 0,7 s después.
5. **S7-F6 (menor): en "Empezar" usar `location.replace('#inicio')`** (`js/app.js:270`), para que Atrás no vuelva a la introducción.
6. Mover el comentario `<!-- ===== Inicio: simulador ===== -->` de `index.html:46` a donde empieza Inicio.
7. Planner: `node --test tests/` sigue fallando en Node 24 (octavo sprint). Hay que cambiar el comando en `CLAUDE.md` a `node --test` y dejar anotada la excepción de las 7 palabras de la Introducción.

## 6. Qué revisar a mano en el teléfono

1. **Los "?" con el teclado abierto:** en Postula, escribe los sueldos y, con el teclado todavía arriba, toca el "?" de "Tu carga". Fíjate si se abre a la primera o si solo se cierra el teclado. Después tócalo por su borde de abajo.
2. **La Introducción en un teléfono chico:** mira si "Empezar" se ve entero sin bajar. A 360 × 640 queda cortado por el borde de la pantalla, y en un teléfono real la barra del navegador quita aún más alto.
3. **El "Cargando…":** fíjate si 0,7 s se siente como respuesta o como demora, y si con VoiceOver o TalkBack se escucha "Cargando…" y el nombre de cada "?".

## 7. Sugerencias (no bloquean)

- Que `tests/contraste.test.js` derive las parejas del CSS (por ejemplo, las reglas que tienen `color` y `background` juntas), o al menos que agregue las 2 parejas por herencia que se arreglaron, para que no vuelvan.
- En Inicio y en Tu 5 % no se lee la palabra "pie" junto a su "?". Se podría decir "poniendo **$6.211.902 de pie** al escriturar", para que el "?" explique algo que se ve.
- La explicación de "Financiamiento del pie" casi repite la frase que tiene encima en Proyectos. Podría contar lo que falta: que el 15 % se devuelve en 10 años con segunda hipoteca.
- Separar un poco (8 px) el globo de la tarjeta que tiene debajo en Proyectos.
- Durante la carga, los campos de Postula e Invertir siguen editables. No rompe nada (el monto queda guardado), pero se podrían desactivar.
