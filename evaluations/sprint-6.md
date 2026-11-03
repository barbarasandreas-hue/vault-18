# Evaluación · Sprint 6 · Inversionista

## Segunda revisión (commit `75cc88b`)

Revisé el commit `75cc88b` contra las correcciones 1 a 5 de la primera revisión (más abajo) y la sección "Segunda entrega" de `sprints/sprint-6-entrega.md`. Usé el servidor local del puerto 8000 y Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 640. Un script habló directo con Chrome: escribió tecla por tecla y tocó los botones en su posición real en pantalla. Recorrí los dos tamaños con 0 excepciones, 0 errores de consola y 0 respuestas 4xx o 5xx. No probé en un teléfono físico.

### Veredicto

**APROBADO.** Las 5 correcciones están resueltas. **S6-F1 se aprueba**, y S6-F2, S6-F3 y S6-F4 siguen cumpliendo. No encontré regresiones.

### Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 53 de 53 pasan. La prueba nueva del campo de UF y la del mínimo prueban casos reales: 5 de 5, 4 de 5, 0 por financiar, "12,56" y "337,5" |
| `node --test tests/` | En Node 24 sigue fallando (`✖ tests … 'test failed'`). Es tarea del Planner, igual que en los sprints anteriores |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto"` (incluido el manifest) | Vacío |
| Rutas `src="/"` o `href="/"` | Ninguna |
| Librerías externas | Ninguna, solo Google Fonts |
| HTTP 200 en local y en GitHub Pages | `/`, `index.html`, el CSS, los 3 JS y el manifest. Pages ya sirve este commit: contiene `leerMontoUF` y `linea-ver` |

### Correcciones de la primera revisión

| # | Corrección | | Evidencia |
|---|---|---|---|
| 1 | Con menos de UF 10 por financiar, el mínimo pasa a ser lo que falta | ✅ | Guardé en `localStorage` UF 130 en Plaza Independencia. El detalle muestra "Falta por financiar UF 5 = $205.325", la barra en 99 % y "Invertir aquí". En Invertir, la ayuda dice "Falta UF 5 para completar el 15 %: puedes invertir justo eso". UF 4 da error y deja Confirmar desactivado, UF 10 da error por máximo y UF 5 se acepta: "Recibirás al mes $2.491" (recalculado: $2.491). Después de confirmar, el detalle muestra "UF 0 = $0", 100 % y "Este proyecto ya reunió su 15 %", e Invertir dice "no queda nada por financiar". `inversionMinimaUF()` y `validarInversion()` (`js/calculos.js:394-405`) devuelven `completo` solo cuando falta 0 |
| 2 | La regla de la propia compra, en los dos órdenes | ✅ | Invertir y después comprar: con UF 50 en Alto Ñuñoa, no hay `#btn-comprar`. En su lugar aparece "Ya invertiste en este proyecto, así que no puedes comprar aquí…" y "Ver mis inversiones" (350 × 50 px). Con una compra en Mirador Santa Lucía, Alto Ñuñoa no ofrece `#btn-cambiar-compra`, pero Vista Apoquindo sí, así que el bloqueo es solo donde invertiste. Lo mismo pasa en Plaza Independencia (financiamiento del pie). Comprar y después invertir: el detalle dice "En tu propia compra no puedes invertir", e Invertir no muestra el campo. La sugerencia de Postula excluye los proyectos donde invertiste (`js/app.js:881`). `guardarCompra` solo se llama desde esos dos botones (`js/app.js:652-665`) |
| 3 | Decimales en UF | ✅ | En la pantalla, "12,5" queda en "12,5" con $6.228 al mes ($513.313 hoy); "12,56" se corta a "12,5" y "1234" se muestra como "1.234". "337,5" se acepta: Confirmar queda activo y muestra $168.153 al mes y $13.859.438. Mis inversiones queda con "UF 337,5", y el detalle con 100 %. Recalculé todo con `node -e`. Todos los "falta por financiar" de los datos tienen como máximo un decimal (337,5; 310,5; 459; 135; 234; 78), así que con un decimal siempre se puede completar el proyecto |
| 4 | Enlace "Tus inversiones" de 44 px o más | ✅ | Toda la línea es un `<a href="#mis-proyectos/inversiones">`. Mide 350 × 78 px a 390 de ancho y 320 × 78 px a 360. Al tocarla se abre Mis inversiones |
| 5 | Sin el `120` repetido ni la barra doble | ✅ | No queda ningún `120` literal en `js/app.js`. Hay 1 barra en Plaza Independencia y en Brisas de La Florida, y 2 en Alto Ñuñoa (cupos y 15 %, que son cosas distintas) |

### Estado por feature

| ID | Estado | Nota |
|---|---|---|
| S6-F1 Invertir aquí | ✅ aprobada | Ya no hay callejón sin salida, y la regla de la propia compra se cumple en los dos órdenes |
| S6-F2 Información para invertir | ✅ aprobada | Muestra "UF + 8 % al año · 10 años · Segunda hipoteca · Falta por financiar UF 337,5 = $13.859.438" y la frase de la cuenta custodia |
| S6-F3 Invertir | ✅ aprobada | El mínimo, el máximo, los decimales, el resultado en vivo y Confirmar funcionan |
| S6-F4 Mis inversiones | ✅ aprobada | Con UF 337,5 y 2 meses: "Cobrado a la fecha $336.306" (2 × $168.153) y "2 de 120". Con datos dañados en `localStorage` aparece el estado vacío |

Regresiones: recorrí Inicio, Proyectos, 4 detalles, Mis proyectos, Mis inversiones, Perfil, Invertir y dos rutas que no existen, en los dos tamaños. No hubo scroll horizontal (`scrollWidth − innerWidth = 0`), textos cortados ni toques menores a 44 px.

### Puntuaciones

| Dimensión | Nota | Por qué |
|---|---|---|
| Funcionalidad | 5 | Las 4 features cumplen, y los números calzan con el recálculo independiente |
| Calidad móvil | 4 | Los toques miden 44 px o más y no hay scroll horizontal. El teclado decimal depende del idioma del teléfono (ver abajo) |
| Código | 4 | Las fórmulas nuevas viven en `calculos.js` y tienen pruebas. Quedan un `360` literal y una regla de CSS que no se aplica |
| Diseño | 4 | La línea de inversiones se lee como tarjeta tocable y los avisos son claros. El "Ver" sale gris en vez de azul |

### Correcciones requeridas

Ninguna bloquea. Para el Sprint 7:

1. En `js/app.js:1374`, "Otro mes" de Mi compra todavía usa `Math.min(360, …)`. Hay que cambiarlo por `SUPUESTOS.mesesBci`. La entrega dice que se reemplazaron "120 y 360", pero este quedó.
2. En `css/estilos.css`, `.linea-inversiones span` (más específica) le gana a `.linea-ver`. Por eso "Ver" sale `--gray-semidark` (#546e7a, 5,4:1, sí cumple AA) y no `--blue-dark` como pide la regla. Se arregla con `.linea-inversiones .linea-ver` o moviendo la regla.
3. Planner: `node --test tests/` (séptimo sprint pendiente), y lo que dicen `SPEC.md:108` y `:137`, tal como quedó en la primera revisión.

### Qué revisar a mano en el teléfono

1. **El teclado de Invertir:** mira si muestra coma o punto. Si muestra punto (teléfono en inglés), "12.5" se lee como UF 125, porque el punto es separador de miles. El número se ve en el campo y en "Recibirás al mes", pero conviene saber qué pasa en tu teléfono.
2. **La línea "Tus inversiones" en Mi camino:** fíjate si se entiende que toda la tarjeta se puede tocar.
3. **El aviso "Ya invertiste en este proyecto…":** fíjate si se entiende en 10 segundos por qué no puedes comprar ahí.

### Sugerencias (no bloquean)

- Si alguien escribe un punto seguido de 1 o 2 cifras al final (por ejemplo "12.5"), se podría tratar como decimal, o avisar "Usa coma para los decimales".
- Siguen vigentes las sugerencias de la primera revisión: decir "Terminaste de cobrar" al llegar a 120 de 120, y poner un "Ver proyecto" explícito en cada inversión.

---

## Primera revisión (commit `bd9e1d6`)

Evaluado sobre el commit `bd9e1d6`, contra la sección "Sprint 6" de `PLAN.md`, `SPEC.md`, `CLAUDE.md` y `docs/bci-kit.md`.

La app se probó con `python -m http.server` (puerto 8000), en Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 640, con un script que habla directo con Chrome. El script escribió tecla por tecla en los campos y tocó los botones con clics reales en su posición en pantalla. Recorrió:

- Inicio, el detalle de Alto Ñuñoa, Invertir (vacío, 9, 400, 338, 337, 10 y 100) y Confirmar.
- Mis inversiones, "Simular un mes" ×3, recargar, Inicio con solo inversiones y el detalle después de invertir.
- La lista del marketplace antes y después de invertir en Plaza Independencia.
- Compra más inversiones, el proyecto de la propia compra, un proyecto inexistente, datos dañados en `localStorage` y "Empezar de nuevo".

También se probó el orden inverso: invertir primero y comprar después en el mismo proyecto. No se probó en un teléfono físico. GitHub Pages responde 200 y ya sirve este código.

## 1. Veredicto

**RECHAZADO.** S6-F2, S6-F3 y S6-F4 cumplen sus criterios y se aprueban. **S6-F1 se rechaza** por tres defectos en la regla que decide cuándo se puede invertir:

- **El proyecto queda trabado.** Si falta menos de UF 10, nadie puede terminar de financiarlo. La app dice entonces "Este proyecto ya reunió su 15 %: no queda nada por financiar", mientras la misma pantalla muestra "Falta por financiar UF 5" y una barra en 99 %. `SPEC.md:115` dice que los inversionistas aportan "hasta completarlo".
- **La regla de no invertir en la propia compra se puede saltar.** Basta invertir primero y comprar después.

Las correcciones del Sprint 5 (1 a 5 y las 2 sugerencias) están resueltas.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 52 de 52 pasan |
| `node --test tests/` | Sigue fallando en Node 24 (`✖ tests … 'test failed'`), como en los sprints anteriores. Le corresponde al Planner (`CLAUDE.md` y `PLAN.md` siguen citando ese comando) |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto"` (incluido el manifest) | Vacío |
| Rutas `src="/"` o `href="/"` | Ninguna |
| Librerías externas | Ninguna; solo Google Fonts |
| HTTP 200 en local | `/`, `index.html`, `css/estilos.css`, los 3 JS, el manifest y los 3 íconos |
| HTTP 200 en GitHub Pages | `/`, `index.html`, el CSS, `app.js` (contiene `renderMisInversiones`) y el manifest |
| Consola y red en todo el recorrido (2 tamaños) | 0 excepciones, 0 errores de consola y 0 respuestas 4xx/5xx |
| Commit intermedio `308340a` con una prueba fallando | Confirmado y declarado en la entrega; `53932f1` lo corrige. No es un problema de la app, pero rompe la regla de un commit funcional por cambio |

### Recálculo independiente (`node -e`, sin `calculos.js`)

| Caso | Plan | Recalculado | En pantalla |
|---|---|---|---|
| Por financiar en Alto Ñuñoa (UF 2.500 × 0,9 × 0,15) | UF 337,5 = $13.859.438 | 337,5 × 41.065 = $13.859.438 | "UF 337,5 = $13.859.438" ✅ |
| Cuota por UF 10 (8 %/12, 120 meses) | $4.982 | $4.982,32 → $4.982 | "Recibirás al mes $4.982" ✅ |
| Cuota por UF 100 | — | $49.823 | "$49.823" ✅ |
| Cobrado después de 3 meses con UF 100 | — | 3 × cuota = $149.470 | "Cobrado a la fecha $149.470" ✅ |
| Alto Ñuñoa después de invertir UF 100 | — | falta UF 237,5 = $9.752.938; 100 / 337,5 = 30 % | "UF 237,5 = $9.752.938", "30 %" ✅ |
| Plaza Independencia + UF 130 | — | (202,5 + 130) / 337,5 = 98,5 % → 99 %; falta UF 5 | Lista: 60 % → 99 % ✅; detalle "UF 5 = $205.325" ✅ |

Ninguna pantalla calcula por su cuenta. `cuotaInversionUF`, `validarInversion`, `faltaFinanciarUF`, `cobradoUF` y `cuotaMensualTotalUF` viven en `js/calculos.js:380-413`, y `app.js` solo las llama. La única excepción es el literal `120` en `js/app.js` (`leerInversiones`, la barra "de 120" y "Simular un mes"), que duplica `SUPUESTOS.mesesInversionistas`.

## 3. Correcciones del Sprint 5

| # | Corrección | | Evidencia |
|---|---|---|---|
| 1 | "UF 2.472" libre del botón fijo a 360 × 640 | ✅ | Medido: el número termina en y = 308 y el botón empieza en y = 480. A 390 × 844: 512 contra 684. `scroll-padding-bottom` en `css/estilos.css:62` y `padding-bottom` en `:253` |
| 2 | "%" sin cortarse | ✅ | `formatoPorcentaje` y los textos usan ` ` o un NBSP literal (comprobado con `cat -A` en `js/app.js:685-686`) |
| 3 | Una sola numeración de pasos | ✅ | `js/app.js:194-223`: "Paso 2 de 5 · Postula" … "Paso 5 de 5 · Departamento". En pantalla: "Paso 2 de 5 · Postula" junto al recorrido de 5 |
| 4 | `formatoUF()` | ✅ | `node -e`: 337,95 → "UF 338", 337,94 → "UF 337,9", 1.234,999 → "UF 1.235", 337,5 → "UF 337,5" |
| 5 | Abono con intereses | ✅ | `saldoDeuda()` (`js/calculos.js:347-357`) descuenta `uf × (1 + i)^(n − mes)`. Prueba en `tests/calculos.test.js:351`. `abonosDe()` sigue leyendo el formato anterior (`js/app.js:1205`) |
| Sug. | Mismo orden del selector | ✅ | `js/app.js:357` y `:1460`: "Para arrendar" primero en los dos |
| Sug. | Número con excedente | ✅ | `js/app.js:224` y `:1259`: "Este mes te sobraron" |

## 4. Criterios por feature

### S6-F1 Invertir aquí — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| "Invertir aquí" activo en el detalle y abre Invertir | ✅ | `<a href="#invertir/alto-nunoa" class="btn btn-secundario-dark">`. El toque lleva a `#invertir/alto-nunoa` |
| Un usuario puede tener una compra e inversiones a la vez | ✅ | Con UF 100 en Alto Ñuñoa, compró en Mirador Santa Lucía. Mi camino muestra "Tus inversiones: cobrado a la fecha $149.470 · Ver", y las dos pestañas funcionan |
| (Calidad del flujo) Cuando falta menos de UF 10, el mensaje es correcto y se puede completar el 15 % | ❌ | En Plaza Independencia, después de invertir UF 130, el detalle dice "Falta por financiar UF 5 = $205.325", la barra muestra 99 % y en vez del botón aparece "**Este proyecto ya reunió su 15 %.**" (`js/app.js:644`). Invertir dice "ya reunió su 15 %: **no queda nada por financiar**" (`:686`). Las dos cosas son falsas. Además, nadie puede terminar de financiarlo: el mínimo es UF 10 y el máximo es UF 5. La prueba `tests/calculos.test.js:387` deja fijo ese callejón sin salida. Contradice `SPEC.md:115` ("aportan partes hasta completarlo") |
| (Decisión del Generator) No se puede invertir en el proyecto de la propia compra | ❌ en la implementación | La regla es razonable y coherente con `SPEC.md:118` y la tabla del 15 %. **Pero se salta en el orden inverso**: se invirtieron UF 50 en Alto Ñuñoa y después se tocó "Comprar aquí" en Alto Ñuñoa. Se aceptó (`{"proyectoId":"alto-nunoa",…}`). Ahora el detalle dice "En tu propia compra no puedes invertir", mientras Mis inversiones muestra UF 50 invertidas en ese mismo proyecto |

### S6-F2 Información para invertir — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Rentabilidad, plazo, garantía y falta por financiar | ✅ | Tarjeta "Para invertir": "UF + 8 % al año · 10 años · Segunda hipoteca · Falta por financiar UF 337,5 = $13.859.438" (`js/app.js:627-635`) |
| UF 2.250 en compra en conjunto → UF 337,5 = $13.859.438 | ✅ | Recálculo y prueba `tests/calculos.test.js:368` |
| Frase de la cuenta custodia | ✅ | "Bci cobra el arriendo en una cuenta custodia y paga a los inversionistas después del dividendo." |

### S6-F3 Invertir — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Campo en UF con teclado numérico | ✅ | `#monto-uf` con `inputmode="numeric"`, prefijo "UF" y ayuda "Desde UF 10 hasta UF 337,5" |
| Protagonista: cuota mensual; UF 10 → $4.982 | ✅ | `.numero.display-2` "$4.982". A 360 × 640 termina en y = 391, sobre el botón fijo (y = 495) |
| Vacío → error y Confirmar deshabilitado | ✅ | Al salir del campo: "Escribe cuánto quieres invertir, desde UF 10."; `disabled = true` |
| Menos de UF 10 → error y deshabilitado | ✅ | Con 9: "La inversión mínima es UF 10."; `disabled = true`; no aparece ningún número |
| Más de lo que falta → error y deshabilitado | ✅ | Con 400 y con 338: "Falta financiar UF 337,5: no puedes invertir más que eso."; `disabled = true`. Con 337 sí permite |
| Al confirmar, el avance sube en el marketplace | ✅ | Lista de financiamiento del pie: Plaza Independencia 60 % → 99 %. Alto Ñuñoa: el detalle pasa de 0 % a 30 % (en la lista, las tarjetas de compra en conjunto muestran cupos, como pide S2-F3). Después lleva a `#mis-proyectos/inversiones` |

Observación (no bloquea, pero hay que corregirlo): el campo solo acepta enteros. Por eso **UF 337,5 nunca se puede invertir completa**, aunque la ayuda diga "hasta UF 337,5", y en Alto Ñuñoa siempre quedaría UF 0,5 sin financiar. Además, escribir "12,5" se convierte **sin aviso** en "125": diez veces más de lo que se quiso escribir.

### S6-F4 Mis inversiones — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Pestaña con la lista guardada en `localStorage` | ✅ | `primer-peldano-inversiones` = `[{"id":"inv-…","proyectoId":"alto-nunoa","montoUF":100,"fecha":"2026-11-03","cuotasCobradas":3}]`. Al recargar, todo sigue igual |
| Protagonista: cobrado a la fecha; "Simular un mes" suma una cuota por inversión | ✅ | $0 → $149.470 después de 3 toques. "Cuotas cobradas 3 de 120". El foco vuelve al botón y se anuncia "Cobraste un mes. Llevas $149.470 a la fecha." |
| Sin inversiones: estado vacío con "Ver proyectos" | ✅ | Con una compra y sin inversiones: "Aún no tienes inversiones … VER PROYECTOS". Sin nada: el vacío general de Mis proyectos |
| Solo inversiones: Mis proyectos abre en esa pestaña | ✅ | `#mis-proyectos` sin parámetro → `Mis inversiones:true` (`js/app.js:1421`) |
| Solo inversiones: Inicio muestra lo cobrado | ✅ | "Tus inversiones · Cobrado a la fecha $149.470 · 1 inversión · recibes $49.823 al mes · VER MIS INVERSIONES" |
| (Extra) Datos dañados | ✅ | Se descartan un proyecto inexistente, un monto en texto y un `null`; 999 cuotas se limitan a 120. Con JSON roto aparece el estado vacío, sin errores |
| (Extra) "Empezar de nuevo" | ✅ | Borra `primer-peldano-inversiones` y `primer-peldano-compra`, vuelve a `#inicio` con "Tu departamento con el 5 %", y Mis proyectos queda vacío |

### Calidad en el teléfono (medida en el navegador)

- **Sin scroll horizontal ni elementos fuera del ancho** en ninguna de las 15 vistas recorridas, a 390 y 360 px.
- **Toques: un defecto.** El enlace "Ver" de la línea "Tus inversiones" en Mi camino mide **25 × 44 px**, en los dos tamaños. `.enlace` solo fija `min-height`. Todos los demás controles nuevos miden 44 px o más (los 2 radios de 13 × 13 de Inicio están dentro de etiquetas grandes, como antes).
- **Acciones fijas:** "Confirmar" y "Simular un mes" quedan sobre la barra sin tapar el número protagonista.
- **Contraste:** los estilos nuevos reusan combinaciones ya medidas, todas AA. `--gray-semidark` sobre blanco da 5,40 (`.datos-inversion span`, `.linea-inversiones span`, `.inversion-fila span`) y `--gray-dark` sobre `--gray-light` da 8,99 (`.ficha-inversion`).
- **Viewport:** `viewport-fit=cover`; las áreas seguras se usan en `.app` y en la barra.

## 5. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 3 | Todos los números del plan coinciden con el recálculo, y la persistencia y el reinicio funcionan. Pero un proyecto puede quedar trabado con un mensaje falso, la regla de la propia compra se salta y "12,5" se vuelve 125 sin aviso. |
| Calidad móvil | 4 | La corrección 1 está resuelta y no hay desbordes. El enlace "Ver" de Mi camino mide 25 px de ancho. |
| Código | 4 | Las fórmulas están en `calculos.js`, probadas y bien nombradas, y los datos dañados se limpian. El `120` se repite en `app.js`, una prueba fija el callejón sin salida y `app.js` ya tiene 1.577 líneas. |
| Diseño | 4 | Invertir y Mis inversiones tienen un número y una acción, y se entienden rápido. En financiamiento del pie, el detalle repite dos veces la barra "15 % reunido con inversionistas". |

## 6. Correcciones requeridas

1. **El proyecto queda trabado cuando falta menos de UF 10** (S6-F1; `js/calculos.js:394` `validarInversion`, `js/app.js:641-645` y `:682-688`, `tests/calculos.test.js:387`).
   - Si lo que falta es menor que UF 10, el mínimo debe ser lo que falta, para que alguien pueda completarlo: `min = Math.min(INVERSION_MINIMA_UF, faltaUF)`.
   - Solo cuando `faltaUF === 0` corresponde decir "Este proyecto ya reunió su 15 %".
   - Actualizar la prueba: `validarInversion(5, 5)` → `null` y `validarInversion(4, 5)` → `'minimo'`. La ayuda debería decir "Invierte lo que falta: UF 5".
2. **La regla "no puedes invertir en tu propia compra" se salta en el orden inverso** (S6-F1; `renderDetalle`, botón `btn-comprar`). Si el usuario tiene una inversión en ese proyecto, "Comprar aquí" debe reemplazarse por un aviso ("Ya invertiste en este proyecto: no puedes comprar en él") o pedir que primero retire la inversión. Hay que probar las dos secuencias.
3. **Montos con decimales** (S6-F3; `leerMonto` en `js/calculos.js:252`, usado en `js/app.js:737`). Hoy:
   - "12,5" se vuelve UF 125 sin aviso.
   - UF 337,5 no se puede invertir completa, aunque la ayuda lo ofrezca.

   Hay dos opciones:
   - Aceptar un decimal en el campo de UF (con `inputmode="decimal"` y coma).
   - Mantener enteros: rechazar la coma con un mensaje, y redondear lo que falta a UF enteras en los datos o en la ayuda ("hasta UF 337").

   La corrección 1 resuelve el resto (UF 0,5).
4. **El enlace "Ver" de "Tus inversiones" en Mi camino mide 25 × 44 px** (S6-F4; `js/app.js:316-318`, `css/estilos.css:701`). Hay que darle `min-width: 44px` (o padding horizontal), o convertir toda la línea en un solo enlace a `#mis-proyectos/inversiones`.
5. **Duplicados menores en el código.** Reemplazar el `120` literal de `js/app.js` (`leerInversiones`, "de 120" y "Simular un mes") por `SUPUESTOS.mesesInversionistas`, o exportarlo desde `calculos.js`. En el detalle de financiamiento del pie, mostrar una sola barra "15 % reunido con inversionistas", no dos.
6. **Planner:** `node --test tests/` (sexto sprint pendiente). Además, `SPEC.md:108` dice que en compra en conjunto "cada departamento del lote tiene su 15 %", pero la app y el plan financian un solo 15 % por proyecto (UF 337,5 para todo Alto Ñuñoa). Hay que decidir si eso basta para el prototipo y dejarlo escrito. `SPEC.md:137` pide además guardar el departamento en cada inversión.

## 7. Qué revisar a mano en el teléfono

1. **El teclado del campo de UF:** en Invertir, fíjate si tu teléfono muestra coma o punto en el teclado numérico. Escribe "12,5" y mira qué número queda (hoy queda 125).
2. **Mis inversiones:** toca "Simular un mes" varias veces y fíjate si se entiende que "Cobrado a la fecha" es dinero que recibes, y no algo que debes.
3. **Mi camino con inversiones:** con una compra y una inversión, fíjate si notas la línea "Tus inversiones" al final y si el "Ver" se toca fácil con el dedo.

## 8. Sugerencias (no bloquean)

- Cuando una inversión llega a 120 de 120 cuotas, "Simular un mes" sigue activo y no hace nada. Podría decir "Terminaste de cobrar esta inversión".
- `SPEC.md:91` pide "Ver proyecto" desde cada inversión. Hoy el enlace es el nombre del edificio, y un "Ver proyecto" explícito sería más claro.
- En compra en conjunto, la tarjeta de la lista solo muestra cupos, así que quien invierte no ve cambiar nada en la lista. Se podría agregar una línea corta "15 % reunido: 30 %" en el detalle de la tarjeta, si el Planner lo acepta (S2-F3 pide un solo número por tarjeta).
- `app.js` tiene 1.577 líneas. Sigue pendiente la decisión del Planner sobre separarlo.
