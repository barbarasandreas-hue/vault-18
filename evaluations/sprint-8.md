# Evaluación del Sprint 8 · Modelo v3 y preaprobación simulada

Evaluado el 4-nov-2026 contra la sección "Sprint 8" de `PLAN.md` (S8-F0, S8-F5, S8-F1, S8-F2, S8-F3, S8-F4), `CLAUDE.md` (modelo v3 y supuestos de cálculo) y `SPEC.md`, sección 0.

**No hay `sprints/sprint-8-entrega.md`**, así que evalué solo contra los criterios y el código. Tampoco hay `.git` en la carpeta, así que no hay commit de referencia. La tabla Estado de `PLAN.md` marcaba las 6 features como `aprobada`, pero nunca se habían evaluado: las traté como no evaluadas.

**Cómo lo revisé:**
- Servidor local en el puerto 8030 y Chromium sin ventana (Playwright), emulando teléfonos táctiles de 390 × 800 y 360 × 800. Google Fonts bloqueado, porque no carga en este entorno.
- Escribí tecla por tecla en los campos y toqué los botones con clics reales.
- Recorrí la compra completa: Proyectos → Mirador Independencia → Comprar aquí → Postula (Tus datos → Tus documentos con "No soy cliente" y los 4 archivos → Resultado) → Tu pie → Firma → Mi departamento → Inicio (Mi camino).
- También probé estas variantes:
  - "Soy cliente Bci".
  - Otras cuotas de $200.000, $500.000 y $760.000.
  - $800.000 + $100.000, que no cumple la renta.
  - Recargar la página a mitad de los documentos.
  - Cambiar un archivo.
  - Ir a otra sección durante una subida.
  - Movimiento reducido.
  - "Empezar de nuevo".
- En cada pantalla medí el desborde horizontal, las zonas táctiles (también con `elementFromPoint`), el contraste contra el fondo real y los errores de JavaScript.
- No probé en un teléfono físico.

## 1. Veredicto

**RECHAZADO.** S8-F1 y S8-F4 se aprueban. **S8-F0, S8-F5, S8-F2 y S8-F3 se rechazan.**

Las fórmulas centrales del modelo v3 están bien: recalculé todos los números de `SPEC.md`, sección 0, y coinciden al peso. Ya no queda ningún préstamo a UF + 8 %. Los rechazos vienen de criterios concretos que no se cumplen:

- **S8-F0:** no existe `participacionUF(precio)`, y `mesesRecompra` no aplica el tope de 84 meses (devuelve 94 o 127 meses y la pantalla los muestra tal cual).
- **S8-F5:** los departamentos no tienen `arriendoEstimadoIA` ni `origenArriendo`.
- **S8-F2:** Tus datos pide "Otras cuotas", pero el semáforo de carga las ignora. Con $500.000 de cuotas dice "15,9 % Holgado", y en la pantalla siguiente el crédito preaprobado (UF 1.142) no alcanza para el departamento. Además, el semáforo sigue con la regla v2: un dividendo de 25 a 30 % sale "En el límite" y deja postular. Tampoco se puede postular sin pareja.
- **S8-F3:** el botón "Subir" tiene una zona tocable real de 42 px (no 44). La miniatura corta "DOCUMENTO DE EJEMPLO" ("OCUMENTO DE EJEMPL") y no lleva el título del documento.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test tests/` | Falla en Node 22.23 (`# fail 1`), por el problema conocido con la carpeta. **No bloquea**, igual que en sprints anteriores. Sigue pendiente para el Planner |
| `node --test tests/*.test.js` | **115 de 115 pasan** (calculos 75, caminos 18, contraste 22) |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto" index.html js/ css/` | Vacío |
| `grep -rn "0.08\|UF + 8" js/ index.html` | Vacío (criterio de S8-F0) |
| Rutas `src="/` o `href="/` | Ninguna |
| Librerías externas | Ninguna, solo Google Fonts (Overpass) |
| HTTP 200 | `/`, `index.html`, `css/estilos.css`, los 3 JS, `manifest.webmanifest` e `iconos/icono-180.png` |
| Errores de JavaScript en los recorridos | 0 `pageerror` y 0 `console.error` (sin contar las fuentes bloqueadas) |

**Sobre las pruebas del Sprint 8:** prueban cosas reales. Están la tabla de dividendos v3 con ±$1, las 8 recompras con ±1 mes, las 6 preaprobaciones, el requisito de renta, los descuentos de grupo y que no queden `cuotaInversionistasUF` ni `tasaInversionistas`. Faltan pruebas del tope de 84 meses (por eso nadie vio que no se aplica) y de los campos `arriendoEstimadoIA` y `origenArriendo`.

## 3. Números recalculados

Los recalculé con `node -e` desde los supuestos, sin usar las funciones de la app: UF $41.065, 3,9 % y 4,5 % a 360 meses, seguros UF 0,7, renta de 6 % al año en UF y arriendo neto = bruto × 0,9 × 11/12.

| Escenario | Esperado (SPEC §0) | Mi cálculo | En pantalla | |
|---|---|---|---|---|
| Vivir individual, UF 2.500 | $464.549 / $496.904 | $464.549 / $496.904 | Ficha de arriendo con opción: "Después, dividendo $464.549" | ✅ |
| Vivir en grupo, UF 2.375 | $442.759 / $473.496 | $442.759 / $473.496 | Tu mes real (vivir): "Dividendo … Sin subsidio: $473.496 … $442.759" | ✅ |
| Invertir individual, UF 2.500 | $416.127 / $444.886 | $416.127 / $444.886 | Caminos: "B · Pie compartido … $416.127" | ✅ |
| Invertir en grupo, UF 2.375 | $396.758 / $424.079 | $396.758 / $424.079 | Detalle de Mirador Independencia: "$396.758 … Sin subsidio: $424.079" | ✅ |
| Pie 5 % y participación 15 % en grupo | $4.876.469 / $14.629.406 | igual | Detalle de Mirador: "$4.876.469", "$14.629.406"; al escriturar $6.827.057 | ✅ |
| Recompra individual, 420 / 380 mil, 100 % y 80 % | 51, 66, 57, 74 | 51, 66, 57, 74 | Caminos: "57 meses en vez de 51" | ✅ |
| Recompra en grupo | 48, 62, 54, 70 | 48, 62, 54, 70 | Caminos: "54 meses en vez de 48" | ✅ |
| Renta inicial de los inversionistas | UF 1,875 = $76.997 | igual | — | ✅ |
| Preaprobación, $2,5 M con $0 / $200.000 / $500.000 de otras cuotas | UF 3.078 / 2.691 / 1.142 | igual (sin subsidio: 2.865 / 2.505 / 1.063) | "Preaprobado (simulado) hasta UF 3.078", "UF 2.691", "UF 1.142" | ✅ |
| Dividendo máximo con UF 3.078 | $624.925 | $624.925 | "Dividendo de hasta $624.925 al mes" | ✅ |
| Renta mínima: titular UF 23 / familiar UF 39 / pareja UF 16 | — | $944.495 / $1.601.535 / $657.040 | Mismo texto en el resultado "Todavía no" | ✅ |

## 4. Tabla por feature

### S8-F0 Modelo v3 en las fórmulas — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Se elimina el préstamo a UF + 8 % | ✅ | `grep "0.08\|UF + 8"` vacío. La prueba `no queda ningún préstamo de inversionistas a UF + 8 %` (`tests/calculos.test.js:38`) |
| Vivir 90 / 10 y arrendar 80 / 15 / 5. Tasa 3,9 % y `tasaSinSubsidio` 4,5 % | ✅ | `js/calculos.js:5-23` (`SUPUESTOS`, `MODOS`) |
| Descuento de grupo de 3 % desde 5 unidades y 5 % desde 10 | ✅ | `descuentoGrupo` (`js/calculos.js:27-31`). Parque Quinta Normal (8 cupos) usa 3 % y Mirador (10) usa 5 %, verificado en pantalla |
| Nueva `participacionUF(precio)` | ❌ | **No existe.** `grep -n "participacionUF(" js/` solo encuentra `rentaParticipacionUF` y `saldoParticipacionUF`. La participación se calcula en `porFinanciarUF` (`:137`) y en `repartoUF` |
| `rentaParticipacionUF(saldo)` con 6 % / 12 | ✅ | `js/calculos.js:334-336` |
| `mesesRecompra(precio, arriendoBruto, fraccion)` con tope de 84 meses | ❌ | La firma es otra: `mesesRecompra(participacionUF, netoUF, fraccion)` (`:366`). **El tope no se aplica:** el bucle llega a 1.200 meses y `SUPUESTOS.topeRecompraMeses` solo se usa como respaldo cuando el resultado es `null` (`js/app.js:830, 938, 983`). Con arriendos de $350.000, $300.000 o $250.000 devuelve 63, 75 y **94 meses**, y Mi departamento muestra "Te faltan 94 meses", sin decir que a los 84 se refinancia o se vende. Peor: cuando el arriendo no alcanza (`null`), Proyectos e Invertir muestran "≈ 84 meses", un plazo que no se cumple |
| Pruebas con la tabla de SPEC §0 (±$1, ±1 mes) | ✅ | `tests/calculos.test.js:7-35` y `:370-389` |
| Filtro de rentabilidad neta ≥ 3,9 % en modo invertir | ✅ | `RENTABILIDAD_MINIMA = 0.039` (`:128`). Altos de Recoleta y Barrio Recoleta no aparecen en modo arrendar |
| Las pantallas muestran "Participación de inversionistas: 15 % (sin cuota para ti)" | ✅ | Inicio y Detalle: "15 % lo ponen inversionistas · Sin cuota para ti: el arriendo les recompra su parte" (`js/app.js:555, 811`). En Firma: "No te cobran cuota" |

### S8-F5 Datos de ejemplo v3 — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Solo Independencia, Quinta Normal, Recoleta y Estación Central | ✅ | `js/datos.js:14-29`. Prueba en `tests/calculos.test.js:150` |
| Rentabilidad bruta entre 4,0 % y 5,0 % | ✅ | Recalculada sobre el precio pagado: de 4,27 % (br-1004) a 5,00 % (pt-715) |
| Al menos 2 departamentos bajo 3,9 % neto | ✅ | 3: ar-502 (3,61 %), ar-901 (3,71 %) y br-1004 (3,52 %) |
| Un estudio de ≈ UF 1.200 y un 1 dormitorio de ≈ UF 1.750 | ✅ | pe-601 y pt-208 (UF 1.200, 0 dormitorios). pq-302 (UF 1.750, 1 dormitorio) |
| Cada departamento tiene `arriendoEstimadoIA` y `origenArriendo: 'estimación IA (demo)'` | ❌ | **Ningún departamento los tiene.** El campo sigue llamándose `arriendoBruto`, y el origen es una sola constante global, `ORIGEN_ARRIENDO` (`js/datos.js:35`), que ninguna pantalla usa (`grep ORIGEN_ARRIENDO js/app.js` vacío) |

### S8-F1 Fórmula de preaprobación — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Dividendo máximo = el menor entre 25 % y 30 % − otras cuotas | ✅ | `js/calculos.js:528` |
| UF enteras hacia abajo, a 360 meses, con seguros. 3,9 % por defecto, y la pantalla dice "con subsidio a la tasa" | ✅ | `:530`. En pantalla: "…al mes, con subsidio a la tasa" |
| UF 3.078 / 2.691 / 1.142 (sin subsidio: 2.865 / 2.505 / 1.063) | ✅ | Recalculado (ver la sección 3). Pruebas en `tests/calculos.test.js:483-500` |
| Requisito de renta: $800.000 sin pareja no cumple; $800.000 + $900.000 cumple | ✅ | `:526-527` y la prueba en `:506` |
| Sin sueldos → `null` | ✅ | `:524` y la prueba en `:521` |

### S8-F2 Postula con preaprobación — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Tres partes: Tus datos → Tus documentos → Resultado | ✅ | `partesPostula` (`js/app.js:1181-1188`) y el `subpaso` guardado en la compra |
| Sueldos prellenados | ✅ | Llegan los de Inicio |
| Campo "Otras cuotas al mes" con teclado numérico | ✅ | `inputmode="numeric"`. Llega vacío con "Si no tienes, déjalo vacío", que acepto como equivalente a $0 |
| Tipo de contrato: indefinido, plazo fijo o independiente | ✅ | `campoContrato()` (`:1161`). Se guarda en `estado.contrato`, pero nada lo usa |
| El dato de otras cuotas se usa en la carga de Tus datos | ❌ | La pantalla dice "El banco las suma: dividendo más cuotas no puede pasar de 30 %", pero `renderCarga` (`js/app.js:1123-1159`) calcula `carga(total, …)` sin las cuotas. Con $500.000 de cuotas muestra **"15,9 % Holgado"**, deja postular, y el resultado dice que el crédito de UF 1.142 no alcanza para los UF 1.900 que se necesitan. Con $760.000 también sale "Holgado" y la preaprobación da "Todavía no". Las dos pantallas seguidas se contradicen |
| Regla de carga v3 (dividendo ≤ 25 %, dividendo + cuotas ≤ 30 %) | ❌ | `nivelCarga` (`js/calculos.js:234-240`) mantiene "en el límite" entre 25 y 30 % del dividendo, y Postular queda habilitado. En v3 un dividendo sobre 25 % no aprueba (`CLAUDE.md`, "Límite de carga") |
| Se puede postular con un solo sueldo | ❌ | `renderCarga` exige los dos sueldos ("Escribe los dos sueldos para ver tu carga", botón deshabilitado). El caso de S8-F1 de $800.000 sin pareja (y cualquier titular solo que gane ≥ UF 23) no se puede recorrer en la app, aunque la fórmula y Tus caminos lo aceptan |
| "Soy cliente Bci" se salta los documentos con una carga de ≈ 1 s | ✅ | Medido: 830 ms hasta el resultado, con "Cargando…" en el botón |
| "No soy cliente: subir documentos" | ✅ | Muestra la lista y deja el foco en el primer "Subir" |

### S8-F3 Documentos de ejemplo precargados — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Lista con los 4 documentos y una frase de para qué sirve cada uno | ✅ | `DOCUMENTOS` (`js/app.js:1262-1271`). El círculo pasa a check al completar |
| La hoja muestra 2 o 3 archivos ya cargados en la app | ✅ | 3 liquidaciones y 2 de cada uno de los otros. Al abrir, el foco va al primer archivo |
| Miniatura SVG: rectángulo, líneas grises, **título del documento** y la marca "DOCUMENTO DE EJEMPLO" | ❌ | El título solo es una barra gris (`md-titulo`, `:1277`). El nombre va en un `span.oculto-visual` y debajo, fuera del SVG. **La marca se corta:** el texto de 5,2 px en negrita no cabe en el `viewBox` de 60 y se ve "OCUMENTO DE EJEMPL" (captura `f3-390-hoja.png`; probado con la fuente de respaldo, y con Overpass también es más ancho que 52 unidades) |
| Sin nombres, RUT, montos ni logos | ✅ | Solo nombres de archivo genéricos |
| Barra de ≈ 1 s, sin animación con `prefers-reduced-motion`; después el check y el nombre; se puede cambiar | ✅ | 1.037 a 1.057 ms. Con movimiento reducido emulado, `animation-name: none`. Se puede cambiar (probado con la AFP: 12 → 24 meses) |
| Sin `<input type="file">` y con la frase "En esta demo tus archivos no se guardan ni se envían" | ✅ | `input[type=file]`: 0. La frase está en `:1327` |
| Zonas táctiles de 44 × 44 px | ❌ | "Subir" y "Cambiar" son `.btn-sm` de 95 × 36 y 121 × 36. El `::before` (`css/estilos.css:153`) agrega −4 px arriba y abajo, pero desde el borde interior. Con `elementFromPoint` en una columna de 1 px la zona real es de **42 px** de alto, a 360 y a 390 |
| Al completar, el foco pasa a "Ver mi preaprobación" y se anuncia | ✅ | Foco en `btn-ver-preaprobacion`. `#anuncio` (aria-live polite): "Subiste todos tus documentos. Ya puedes ver tu preaprobación." |
| (Robustez) | ⚠️ | Si el usuario se va a otra sección durante una subida, el `setTimeout` (`:1393`) igual dibuja en el panel oculto, intenta enfocar y vuelve a anunciar "Subiste todos tus documentos…" estando en Perfil. Es el mismo patrón del S7-F1. No bloquea por sí solo |

### S8-F4 Resultado de la preaprobación — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| "Preaprobado (simulado) hasta UF 3.078 de crédito" y "Dividendo de hasta $624.925 al mes, con subsidio a la tasa" | ✅ | Texto exacto en pantalla, en Display 2 |
| Si no cumple: palabra + ícono, sin juicio, qué cambiar y editar los datos | ✅ | "Todavía no" con ícono de alerta. Por renta: "el banco pide sumar la renta de tu pareja…". Por carga: "Terminar una de ellas libera espacio…". Botón "Editar mis datos" |
| "La aprobación final depende de la tasación y del estudio de títulos del departamento" y lista numerada (tasación, estudio de títulos, escritura) | ✅ | `:1455-1461`, con `<ol>` |
| Acción principal: seguir al paso siguiente | ✅ | "Seguir a Tu pie" lleva a Tu pie (paso 2) |
| Documentos y resultado guardados; "Empezar de nuevo" los borra | ✅ | Al recargar a mitad de los documentos vuelve a Tus documentos con lo marcado. El resultado no se guarda: se recalcula con los sueldos guardados, y lo acepto. "Empezar de nuevo" borra la compra con los documentos, y conserva el registro de la sesión |
| Extra: si lo preaprobado no alcanza para el departamento elegido | ✅ | "necesita UF 1.900 de crédito: es más de lo preaprobado. Revisa un departamento más barato" y "Ver proyectos" |

Detalles menores, que no bloquean:
- Con $760.000 de cuotas el texto dice que "ya ocupan casi todo el 30 % de su ingreso", pero ya lo pasan (30,4 %).
- Mezcla "su" con "tus".

## 5. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 3 | Todas las cifras v3 cuadran al peso. Pero Tus datos contradice al resultado (cuotas ignoradas y regla v2), no se puede postular sin pareja y el tope de 84 meses no existe |
| Calidad móvil | 3 | Sin desborde a 360 ni a 390, contraste AA en todo lo medido y foco y anuncios bien encadenados. El "Subir" queda en 42 px y la marca de la miniatura se corta |
| Código | 3 | Las fórmulas están en `calculos.js` y las pantallas no calculan por su cuenta. Faltan las funciones y campos que pide el plan (`participacionUF`, `arriendoEstimadoIA`). `topeRecompraMeses` se usa como valor de relleno, `ORIGEN_ARRIENDO` y `estado.contrato` no se usan, y el `setTimeout` de la subida no revisa la ruta |
| Diseño | 3 | Sigue el Bci Kit, con títulos en 400, check en las listas sin orden y lista numerada para lo que falta. El resultado es claro. La miniatura cortada se ve descuidada |

## 6. Correcciones requeridas

1. **Carga en Tus datos (S8-F2):**
   - En `renderCarga` (`js/app.js:1123`), sumar `estado.otrasCuotas` y volver a dibujar la carga en el `input` del campo `#otras-cuotas` (hoy solo guarda).
   - Usar la regla v3: crear en `js/calculos.js` una función `nivelCargaV3(dividendo, otrasCuotas, ingreso)` que dé "no aprueba" si el dividendo pasa de 25 % o si dividendo + cuotas pasa de 30 %, y usarla en el semáforo y en `btn-postular.disabled`.
   - Mostrar las dos cifras: "dividendo X %" y "con cuotas Y %".
2. **Postular sin pareja (S8-F2):** en `renderCarga`, aceptar el sueldo de la pareja vacío (o en $0) y exigir solo el propio. Que `preaprobacion` decida por renta. Cambiar el texto "Escribe los dos sueldos…".
3. **Tope de 84 meses (S8-F0):**
   - En `mesesRecompra` (`js/calculos.js:366`), devolver también si se llega al tope: por ejemplo, `{ meses, superaTope }`, o `Math.min(m, 84)` más una función `superaTopeRecompra`.
   - En pantalla, cuando pase de 84 meses, decir "a los 84 meses refinancias o vendes" en vez de "Te faltan 94 meses".
   - Quitar `|| SUPUESTOS.topeRecompraMeses` en `js/app.js:830, 938 y 983` y mostrar "el arriendo no alcanza" cuando el resultado es `null`.
   - Agregar una prueba con un arriendo de $250.000.
4. **`participacionUF(precio)` (S8-F0):** crearla en `js/calculos.js` (= precio × `MODOS.arrendar.inversionistas`), exportarla, usarla en `porFinanciarUF`, `repartoUF` y `escenario`, y probarla (UF 2.500 → UF 375).
5. **Datos (S8-F5):** en `js/datos.js`, renombrar `arriendoBruto` a `arriendoEstimadoIA` (o agregarlo) y poner `origenArriendo: ORIGEN_ARRIENDO` en cada departamento. Actualizar `calculos.js` y `app.js`. Agregar a la prueba "datos de ejemplo v3" que los dos campos existan.
6. **Zona táctil de "Subir" y "Cambiar" (S8-F3):** en `css/estilos.css:153`, poner `top: -6px; bottom: -6px` en `.btn-sm::before` (o `min-height: 44px` en `.btn-subir`), y verificar con `elementFromPoint` que la zona mida 44 px.
7. **Miniatura (S8-F3):**
   - En `miniaturaDoc` (`js/app.js:1274`), dibujar el título del documento dentro del SVG: un `<text>` corto, por ejemplo "Liquidación" o "AFP", en vez de la barra `md-titulo`.
   - Partir la marca en dos líneas ("DOCUMENTO" / "DE EJEMPLO") o usar `textLength="48" lengthAdjust="spacingAndGlyphs"`, para que no se corte.
8. **Subida en curso (S8-F3, menor):** en el `setTimeout` de `abrirHoja` (`:1393`), salir también si la pantalla de Mis proyectos está oculta, antes de dibujar, enfocar o anunciar.

## 7. Qué revisar a mano en el teléfono

1. Con Overpass cargada de verdad, mirar la hoja de archivos: si la marca "DOCUMENTO DE EJEMPLO" se lee completa y si el usuario entiende que son archivos de ejemplo y no los suyos.
2. Tocar "Subir" y "Cambiar" con el pulgar, sobre todo el borde de arriba y el de abajo, para ver si responde al primer toque.
3. Escribir otras cuotas en Tus datos y ver si el salto de "Holgado" a "Tu departamento necesita más de lo preaprobado" confunde. Es lo primero que se corrige.

## 8. Sugerencias (no bloquean)

- Inicio ("Puedes comprar hasta…") sigue sin considerar las otras cuotas ni el arriendo actual, que `SPEC.md` §0 pide para "Inicio · Traducir". Con $500.000 de cuotas, Inicio ofrece UF 3.847 (arrendar) y la preaprobación da UF 1.142 de crédito. Conviene que el Planner lo asigne a un sprint.
- Usar el tipo de contrato en algo visible (por ejemplo, avisar que con plazo fijo el banco pide antigüedad) o quitarlo.
- `manifest.webmanifest` dice "poniendo el 5 % del precio", que en modo vivir es 10 %.
- "Avisos de la IA" (Mi camino) son reglas fijas. `CLAUDE.md` pide no llamar IA a una regla: mejor "Avisos".
- Agregar una entrega (`sprints/sprint-8-entrega.md`) aunque sea tardía, para que quede la traza del sprint.

---

**Resumen:** RECHAZADO. Los números del modelo v3 están bien, pero Tus datos ignora las otras cuotas, mantiene la regla de carga v2 y exige pareja. Falta el tope de 84 meses y `participacionUF`, los datos no tienen `arriendoEstimadoIA` ni `origenArriendo`, y el "Subir" mide 42 px con la miniatura cortada.
