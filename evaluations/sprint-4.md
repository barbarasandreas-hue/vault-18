# Evaluación · Sprint 4 · Tu 5 % y escritura

Evaluado sobre el commit `24aee3b`, contra la sección "Sprint 4" de `PLAN.md` (S4-F1 a S4-F6), `CLAUDE.md`, `docs/bci-kit.md` y las correcciones 1 a 6 de `evaluations/sprint-3.md`.

**Cómo se probó:**
- En local (`python -m http.server`, puerto 8000) y en GitHub Pages (`https://barbarasandreas-hue.github.io/vault-18/`). Pages tiene este commit: `index.html`, `css/estilos.css`, los 3 JS y el manifest dan el mismo sha1 que `24aee3b`.
- En Chrome 156 sin ventana, emulando teléfonos de 390 × 844 y 360 × 640 con toques, mediante un script que manda órdenes a Chrome directamente (sin librerías). Los montos se escribieron tecla por tecla, y se recargó la página para comprobar `localStorage`.
- No se probó en un teléfono físico.

**Nota:** durante la revisión apareció el commit `f3fcff0` ("Rediseña Inicio…"). Solo cambia `PLAN.md`, `SPEC.md` y `docs/journey-map.md`, y no toca `js/`, `css/`, `index.html` ni `tests/`, así que las mediciones siguen valiendo.

## 1. Veredicto

**APROBADO.** Las 6 features (S4-F1 a S4-F6) cumplen sus criterios de aceptación, y ninguna dimensión queda bajo 3. Las correcciones 1 a 6 del Sprint 3 están resueltas.

Quedan correcciones importantes para el Sprint 5:
- Se puede "cambiar" una compra ya firmada, y el ahorro usado al escriturar sigue contando.
- "Empezar a ahorrar" y "Firmar" no se ven sin bajar.
- Después de "Simular un mes" el foco se pierde.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` (Node 24.19) | 36 de 36 pasan |
| `node --test tests/` | Falla en Node 24 ("test failed" sobre la carpeta). Es del Planner: `CLAUDE.md:62` y `PLAN.md:20`. **Es el cuarto sprint seguido** |
| `node --check js/*.js` | Sin errores |
| `grep -rniE "plata\|depto\|dpto" index.html js/ css/` (más el manifest) | Vacío |
| `src="/` o `href="/` | Ninguno |
| Recursos externos | Solo Google Fonts (Overpass) |
| HTTP 200, local y en Pages | `/`, `index.html`, `css/estilos.css`, `js/calculos.js`, `js/datos.js`, `js/app.js`, `manifest.webmanifest` y los 3 íconos |
| Consola y red (todo el recorrido, 2 tamaños, local y Pages, almacenamiento bloqueado y datos dañados) | 0 errores de JavaScript y 0 respuestas 4xx/5xx |
| Auto | No aparece en el código (`\bauto` solo aparece en CSS: `margin: 0 auto`). En el texto de todas las pantallas, 0 menciones |
| Plusvalía | Solo aparece en "Calculado sin plusvalía": en el detalle, en la lista de firma y en Inicio después de firmar |

**Las pruebas nuevas prueban algo real:**
- Los 13 meses con el valor exacto de la tabla.
- Cero, `null`, `undefined` y negativo dan `null`.
- El redondeo hacia arriba (1.000.001 → 3).
- Los meses que faltan descontando lo ahorrado.
- Los hitos en 0, 50 y 100 %.
- Que `sumarMes` no pase de la meta.
- Los bordes del semáforo con `cargaRedondeada`, incluido el caso real de 30,04 % en Alto Ñuñoa.
- `ingresoMinimo` y `ingresoFaltante` ($1.904.750 y $204.750).

### Recálculo independiente (`node -e`, sin `calculos.js`)

| Caso | Recalculado | En pantalla |
|---|---|---|
| Meta de Alto Ñuñoa (UF 2.250 = 2.500 − 10 %): 5 % + 2 % | $6.467.738 | "Meta al escriturar $6.467.738" ✅ |
| $500.000 al mes | ⌈6.467.738 / 500.000⌉ = 13 | "13 meses" ✅ |
| Hitos con $500.000 | 25 % en el mes 4 (30,9 %), 50 % en el mes 7 (54,1 %), 75 % en el mes 10 (77,3 %) y 100 % en el mes 13 | El aviso aparece exactamente en los meses 4, 7 y 10, y en el mes 13 se pasa a la firma. "Te faltan" baja de 12 a 1, mes a mes ✅ |
| Total al mes | 403.272 + 168.153 = $571.425 | "Total al mes $571.425", y la lista de firma muestra $403.272 y $168.153 ✅ |
| Borde 30,04 % ($902.214 + $1.000.000) | 30,0400 % | "30,0 %", **En el límite**, "Postular" activo ✅ |
| Borde 25,03 % ($1.283.000 + $1.000.000) | 25,0296 % | "25,0 %", **Holgado** ✅ |
| $900.000 + $1.000.000 | 30,075 % | "30,1 %", No aprueba, sugiere Mirador Santa Lucía con 27,8 % ✅ |
| Rojo: $900.000 + $800.000 | 33,61 %; 571.425 / 0,30 = $1.904.750; faltan $204.750 | "33,6 %", No aprueba, "le faltan **$204.750** al mes: necesitan $1.904.750 entre los dos". No propone otro proyecto ✅ |

**Fuerza bruta:** para cada ingreso entero entre $1.700.000 y $2.400.000 (700.001 casos), el semáforo siempre coincide con el porcentaje que se muestra: 0 contradicciones.

### El cambio de prueba (30,0001 % pasa a "en el límite")

**Se acepta.** Es justo lo que pidió la corrección 2: que el semáforo use el mismo número que ve el usuario. Mostrar "30,0 %" junto a "No aprueba" era peor. Así, el corte real queda en 30,05 %: con 300.499 sobre 1.000.000 dice "30,0 %, en el límite", y con 300.500 dice "30,1 %, no aprueba". Hay dos matices:
- **La regla de `CLAUDE.md` ("sobre 30 % no aprueba") se relaja hasta en 0,05 puntos.** El Planner debe dejar escrito en `CLAUDE.md` y en `PLAN.md` que los límites se aplican a la carga redondeada a 1 decimal. Si no, el próximo sprint puede "corregirlo" de vuelta.
- **Las pruebas que reemplazaron a las de "un peso más" ya no prueban el borde nuevo.** 301.000 y 251.000 quedan lejos del corte. Hay que agregar 300.499 → límite, 300.500 → no aprueba, 250.499 → holgado y 250.500 → límite (sugerencia 3).

**Incoherencia menor:** `ingresoMinimo()` usa el 30 % estricto (`Math.ceil(total / 0,30)`), pero el semáforo usa la carga redondeada. Con $1.901.580 sale rojo y dice "faltan $3.170", aunque con $1 más ya estaría en el límite. Pide un poco de más, así que no confunde; ver la sugerencia 2.

### Contraste de lo nuevo (colores reales de `css/estilos.css`)

| Combinación | Contraste |
|---|---|
| Texto de los hitos pendientes: `--gray-semidark` sobre blanco (13 px, 600) | 5,40 ✅ |
| Hito logrado: `--green-dark` sobre blanco (texto y punto) | 7,03 ✅ |
| Check blanco sobre `--green-dark` | 7,03 ✅ |
| Logro: `--gray-dark` / `--green-dark` sobre `--green-20` | 7,44 / 5,42 ✅ |
| Aviso de hito (`.aviso-ok`): `--green-dark` sobre `--green-20` | 5,42 ✅ |
| Chip de etapa en Inicio: `--blue-dark` sobre `--blue-20` | 5,66 ✅ |
| Tarjeta compacta: `--gray-semidark` sobre blanco | 5,40 ✅ |
| Barra de avance: `--green-normal` sobre `--gray-semilight` (gráfico) | 3,61 ✅ |

## 3. Correcciones del Sprint 3

| # | Corrección | | Evidencia |
|---|---|---|---|
| 1 | La carga se ve sin bajar | ✅ | A 390 × 844, con los dos sueldos y sin bajar, el número queda en y = 602–662 y "Holgado" en 666–705, sobre la barra (y = 779). Mientras se escribe, `scrollIntoView` lo deja en y = 480–540. A 360 × 640 (barra en 575), queda en 650–710 sin bajar, y `scrollIntoView` lo sube a 276–336 al escribir. `app.js:616` |
| 2 | Semáforo igual al número | ✅ | `cargaRedondeada()` (`calculos.js:202`) la usa `nivelCarga()` (`:212`) y la pantalla (`app.js:572`, `:159`, `:524`). 30,04 % → "30,0 %", En el límite; 25,03 % → "25,0 %", Holgado. Tiene pruebas |
| 3 | En rojo no sugiere otro "no aprueba" | ✅ | `app.js:517` solo sugiere si `mejor.nivel !== 'no-aprueba'`; si no, usa `ingresoFaltante` e `ingresoMinimo` (`calculos.js:221-228`). El texto bajo "Postular" cambia según el caso (`app.js:581-584`) |
| 4 | Suma de sueldos fuera de la pantalla | ✅ | `ingresoTotal()` (`calculos.js:189`), usada en `carga()` y en `app.js:576`. `grep "sueldoPropio *+"` en `app.js` sale vacío |
| 5 | "Cambiar mi compra" como acción principal | ✅ | `btn-primario btn-lg`, sobre "Invertir aquí" (`app.js:376`), con "Ya tienes una compra en …" y el aviso de reemplazo si el paso es 2 o más |
| 6 | CSS sin usar | ✅ | `.campo .ayuda` y `.filtro .btn-terciario` ya no existen |
| Sección 6 | El "·" pegado | ✅ | `.sep` con margen de 0,4 em a cada lado (`css/estilos.css`). Se ve parejo en las capturas ("Paso 2 de 3 · Tu 5 %") |

## 4. Criterios por feature

### S4-F1 Fórmula de meses

| Criterio | | Evidencia |
|---|---|---|
| Meses para la meta en `calculos.js`, con pruebas | ✅ | `mesesParaMeta`, `mesesRestantes`, `hitosAlcanzados` y `sumarMes` (`calculos.js:260-282`); 4 pruebas nuevas |
| $6.467.738 con $500.000 → 13 meses | ✅ | Prueba y recálculo independiente |
| Ahorro cero o vacío → error, no infinito | ✅ | `0`, `null`, `undefined`, `-100`, `""` y `NaN` → `null` (comprobado con `node -e`) |

### S4-F2 Tu 5 % (paso 2 de Mi compra)

| Criterio | | Evidencia |
|---|---|---|
| La meta sale del proyecto al que se unió el usuario | ✅ | `resumen(p).escenario.alEscriturar` (`app.js:681`): Alto Ñuñoa $6.467.738 |
| Número protagonista: los meses | ✅ | "13 meses" en `.display-2`. A 390 × 844 queda en y = 613–672, visible. A 360 × 640 queda en y = 704, bajo la barra (575), y no se trae a la vista (ver la corrección 3) |
| Campo de ahorro con teclado numérico | ✅ | `inputmode="numeric"`; tecla por tecla queda "500.000" |
| Estado de error | ✅ | Vacío y tocado: "Escribe cuánto puedes ahorrar al mes.". Con "0": "El ahorro tiene que ser mayor a $0.", `aria-invalid="true"` y "Empezar a ahorrar" `disabled`. No muestra meses |
| Barra con hitos al 25, 50, 75 y 100 % | ✅ | `barraHitos()` (`app.js:648`). Los logrados se ponen en `--green-dark` con check y texto oculto ", logrado" |
| Acción principal "Empezar a ahorrar" | ✅ | `btn-primario btn-lg`. Después, "Te faltan 13 meses" y "Simular un mes". A 390 × 844 el botón queda en y = 864, bajo la barra (corrección 2) |

### S4-F3 Propio o grupal

| Criterio | | Evidencia |
|---|---|---|
| Elige propio o grupal | ✅ | Selector de radios con etiquetas de 44 px. Se guarda `tipoAhorro` y se recuerda al recargar ("Ahorro grupal de $500.000 al mes") |
| El grupal explica, en una frase, que cada uno junta su propio 5 % y retira lo suyo | ✅ | "Cada persona junta su propio 5 % y retira exactamente lo que aportó: nadie aporta por otro ni queda debiendo." (`app.js:643`). Tiene una frase previa de contexto ("Ahorras junto a un grupo…"); son 2 frases, pero la condición queda en una |
| Nada sugiere que el 5 % lo pongan inversionistas u otras personas | ✅ | Se revisó el texto de todas las pantallas: "5 % lo pones tú · Con tu ahorro, propio o grupal", "Tu 5 % más gastos, lo juntas tú" y "¡Juntaste tu 5 %!". Los inversionistas solo aparecen con el 15 % |
| No se menciona el auto | ✅ | 0 menciones en el código y en las pantallas |

### S4-F4 Avance simulado

| Criterio | | Evidencia |
|---|---|---|
| "Simular un mes" suma el ahorro mensual | ✅ | $500.000 por toque, 13 toques hasta la meta, sin pasarse (`sumarMes`) |
| Se guarda en `localStorage` | ✅ | En el mes 4 y al recargar: `ahorrado: 2000000` y "Te faltan 9 meses", con el hito del 25 % logrado. Con el almacenamiento bloqueado funciona en memoria, sin errores. Con datos dañados (`ahorrado: -5`, `ahorroMensual: 'x'`) vuelve al estado inicial |
| (Extra) Aviso de hito y "Cambiar mi ahorro mensual" | ✅ | "¡Llegaste al 25 % de tu meta! Sigue así." Al cambiar a $200.000, se mantienen los $6.000.000 ahorrados y dice "3 meses". **Defecto de accesibilidad:** después de cada toque el foco queda en `BODY` (corrección 4) |

### S4-F5 Lista de firma

| Criterio | | Evidencia |
|---|---|---|
| Al llegar a la meta, un mensaje de logro | ✅ | "¡Juntaste tu 5 %! Ya tienes $6.467.738 para escriturar.", con `role="status"` |
| Lista de crédito Bci, segunda hipoteca y cuenta custodia, con checks y en palabras simples | ✅ | Los 3 ítems usan `#i-check`, con los montos $73.916.999, $403.272, $13.859.438 y $168.153. La cuenta custodia cambia entre arrendar y vivir. Lleva el sello "Calculado sin plusvalía" |
| Es el paso 3; acción "Firmar" (simulado) | ✅ | `paso: 3` guardado; al recargar sigue ahí. "Firmar" dice que es simulado. A 390 × 844 queda en y = 923, bajo la barra (corrección 2) |
| Después, Mi compra muestra Mi departamento | ✅ | "¡Firmaste! El departamento del piso 4 es tuyo (simulado)", los 3 pasos con check y "Disponible pronto: Mi departamento…". Su contenido llega en el Sprint 5. **Defecto:** después de firmar se puede "cambiar" la compra (corrección 1) |

### S4-F6 Inicio con próximo paso

| Criterio | | Evidencia |
|---|---|---|
| Tarjeta con el paso y su número | ✅ | Paso 1: "Revisa si califican" (sin sueldos) o "Tu carga 22,9 % Holgado". Paso 2: "Te faltan 13 meses · Llevas $0 de $6.467.738". Paso 3: "Ya juntaste $6.467.738". Después de firmar: "Pagas al mes $571.425 … Calculado sin plusvalía" |
| Un botón que lleva directo a ese paso | ✅ | "Ir a Postula", "Ir a Tu 5 %", "Seguir ahorrando", "Ir a firmar" y "Ver mi departamento", todos a `#mis-proyectos`, que abre el paso guardado. Comprobado tocando "Seguir ahorrando" e "Ir a firmar". El botón queda en y = 367–424 |
| "Volver a simular" a un toque | ✅ | Enlace de 44 px en y = 440. Muestra el simulador, pone el foco en "Para arrendar" y aparece "Volver a mi próximo paso" (44 px), que regresa a la tarjeta |
| Sin compra, Inicio es el simulador | ✅ | Comprobado con `localStorage` vacío |

## 5. Calidad en el teléfono

- **Sin scroll horizontal ni elementos fuera del ancho** en Inicio (con y sin compra), Postula, Tu 5 % (antes y después de empezar), Firma y después de firmar, a 390 y a 360 px.
- **Toques:** los botones nuevos miden 57 px de alto, y "Volver a simular" y "Volver a mi próximo paso" miden 44 px.
- **Viewport y áreas seguras:** sin cambios respecto del Sprint 3 (`viewport-fit=cover` y `env(safe-area-inset-*)`).
- **Acción principal fuera de la vista:**

| Pantalla | Tamaño | Elemento | Posición | Barra |
|---|---|---|---|---|
| Tu 5 % | 390 × 844 | "Empezar a ahorrar" | y = 864 | y = 779 |
| Tu 5 % | 360 × 640 | "Empezar a ahorrar" | y = 956 | y = 575 |
| Tu 5 % | 360 × 640 | Número "13 meses" | y = 704 | y = 575 |
| Firma | 390 × 844 | "Firmar" | y = 923 | y = 779 |
| Firma | 360 × 640 | "Firmar" | y = 989 | y = 575 |

## 6. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 4 | Todos los criterios se comprobaron tocando la app, en local y en Pages, y resiste el almacenamiento bloqueado y los datos dañados. Baja porque una compra ya firmada se puede reemplazar y el ahorro gastado al escriturar sigue contando. |
| Calidad móvil | 3 | No hay desbordes, los toques miden 44 px o más y todo el texto cumple AA. Pero "Empezar a ahorrar" y "Firmar" no se ven sin bajar, el número de Tu 5 % queda oculto a 360 × 640 y el foco se pierde después de "Simular un mes". |
| Código | 4 | Las fórmulas están en `calculos.js` con pruebas reales, y no se encontró ningún cálculo en la pantalla. Bajan un `app.js` de 1.032 líneas, un render con efectos (`renderTu5` guarda el paso 3) y `.pasos` declarado dos veces en el CSS. |
| Diseño | 4 | Aplica el Bci Kit: hitos con check verde, logro en verde 20, lista con checks y sello sin plusvalía, con un número y una acción por estado. Baja porque en Firma el botón queda debajo de una lista larga. |

## 7. Correcciones requeridas

No bloquean este sprint. Para el Sprint 5, en orden de importancia:

1. **Después de firmar no se puede "cambiar la compra"** (`js/app.js:369-377`, `renderDetalle()`). Con `paso: 4`, abrir otro proyecto muestra "Cambiar mi compra a este proyecto". Al tocarlo, se reemplaza la compra firmada por una en el paso 1, y quedan `ahorrado: 6467738`, aunque ese dinero se usó al escriturar. Si el proyecto nuevo es más barato, se saltaría Tu 5 %. Hay que hacer dos cosas:
   - Con `paso >= 4`, mostrar solo "Ya compraste en …" (sin botón para cambiar).
   - Al firmar, dejar el ahorro en 0 o marcarlo como usado.
2. **La acción principal tiene que verse sin bajar en Tu 5 % y en Firma** (`renderTu5()` y `renderFirma()`). Hoy "Empezar a ahorrar" queda en y = 864 y "Firmar" en y = 923 a 390 × 844, con la barra en 779. Opciones:
   - En Tu 5 %, poner la barra de hitos después del botón, o mostrarla solo después de "Empezar a ahorrar", porque con $0 ahorrado no aporta.
   - En Firma, poner "Firmar" justo después del logro y la lista debajo, o dejar los textos de cada ítem en una línea.
3. **Tu 5 % a 360 × 640: traer los meses a la vista** al aparecer por primera vez, igual que la carga en Postula (`app.js:616`). Hoy el número queda en y = 704, con la barra en 575.
4. **Mantener el foco después de "Simular un mes"** (`app.js:769-785`). `renderTu5()` vuelve a crear el botón y el foco queda en `BODY`. Hay que llamar a `$('btn-simular-mes').focus()` después de dibujar. Además, el aviso de hito se crea y se llena en el mismo momento, así que un lector de pantalla puede no leerlo. Conviene una región `aria-live` fija, fuera de `#panel-compra`.
5. **Sacar el guardado del render:** `renderTu5()` llama a `guardarCompra({ paso: 3 })` mientras dibuja (`app.js:683-686`). Mejor decidir el paso en `renderMiCompra()` y dejar `renderTu5()` solo para dibujar.
6. **CSS:** `.pasos` se declara en `css/estilos.css:480` y otra vez en `:545` (`margin-top: 12px`). Hay que dejar una sola.
7. **Planner:**
   - Cambiar `node --test tests/` por `node --test` en `CLAUDE.md:62` y `PLAN.md:20` (cuarto sprint pendiente).
   - Registrar en `CLAUDE.md` que los límites de 25 % y 30 % se aplican a la carga redondeada a 1 decimal.
   - Registrar en `docs/bci-kit.md` las excepciones aceptadas en el Sprint 3.
   - Registrar en el plan "Cambiar mi compra", "Salir de esta compra" y la regla del punto 1.

## 8. Qué revisar a mano en el teléfono

1. **Tu 5 % con el teclado abierto:** escribe 500.000 y fíjate si ves "13 meses" sin cerrar el teclado. En Postula la app sube la carga sola; en Tu 5 % todavía no.
2. **Los hitos:** toca "Simular un mes" 4 veces. Revisa que el círculo verde con check del 25 % se vea centrado sobre la barra y que el aviso verde se lea bien. También, que "100 %" no quede pegado al borde derecho.
3. **Firma:** después de juntar la meta, fíjate si entiendes la lista "Lo que firmas" en 10 segundos y si encuentras "Firmar" sin buscarlo.

## 9. Sugerencias (no bloquean)

- **Pruebas en el borde exacto del redondeo:** 300.499 → límite, 300.500 → no aprueba, 250.499 → holgado y 250.500 → límite.
- **Coherencia de `ingresoMinimo()`:** usar el mismo corte del semáforo (`total / 0,3005`, redondeado hacia arriba), o decir "necesitan cerca de", para que "faltan" sea exacto.
- **"Cambiar mi ahorro mensual"** vuelve a la pantalla inicial, que dice "Juntas $6.467.738 ahorrando…" aunque ya hay dinero juntado. Mejor "Te faltan $467.738".
- **Inicio en el paso 1, sin sueldos:** no muestra número. Se podría mostrar el total al mes del proyecto como número, con "Revisa si califican" de apoyo.
- **El texto del grupal** son 2 frases. Se podría dejar en una: "Ahorras con un grupo para motivarse: cada persona junta su propio 5 % y retira exactamente lo que aportó."
- **`app.js` ya tiene 1.032 líneas.** Antes del Sprint 5 conviene dividirlo por pantalla, con el permiso del Planner.
