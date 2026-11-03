# Evaluación · Sprint 3 · Bci Kit oficial, Postula, Perfil y agregar a pantalla de inicio

Evaluado sobre el commit `d80882d`, contra la sección "Sprint 3" de `PLAN.md`, `CLAUDE.md` y `docs/bci-kit.md`.

**Cómo se probó:**
- Con `python -m http.server` (puerto 8000) y **también en GitHub Pages** (`https://barbarasandreas-hue.github.io/vault-18/`). Pages ya muestra este sprint: `index.html`, `css/estilos.css`, `js/app.js`, `js/calculos.js` y `manifest.webmanifest` tienen el mismo sha1 que el commit.
- En Chrome sin ventana, emulando teléfonos de 390 × 844, 360 × 844 y 360 × 640, con un script que manda órdenes a Chrome directamente (sin librerías). El script tocó cada botón y escribió los sueldos tecla por tecla.
- No se probó en un teléfono físico.

**Nota:** durante esta revisión apareció el commit `d57965a`, con otra evaluación del Sprint 3 hecha en paralelo. Este informe la reemplaza. Se rehicieron todas las mediciones y se comprobó su hallazgo de los bordes del 25 % y el 30 % (corrección 2). El veredicto es el mismo.

## 1. Veredicto

**APROBADO.** Las 6 features (S3-F0 a S3-F5) cumplen todos sus criterios de aceptación, y ninguna dimensión queda bajo 3. Aun así, hay 3 correcciones importantes para el Sprint 4:
- En Postula, la carga no se ve sin bajar.
- En los bordes, el semáforo contradice al porcentaje que se muestra.
- En rojo, la sugerencia puede proponer algo que tampoco aprueba.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` (Node 24.19) | 30 de 30 pasan |
| `node --test tests/` | Falla en Node 24 ("test failed" sobre la carpeta). Es del Planner: `CLAUDE.md:62` y `PLAN.md:20`. **Es el tercer sprint seguido** |
| `node --check js/*.js` | Sin errores |
| `grep -rniE "plata\|depto\|dpto" index.html js/ css/` (más el manifest) | Vacío |
| `src="/` o `href="/` | Ninguno; el manifest usa `./` |
| Recursos externos | Solo Google Fonts (Overpass 400, 600 y 700). El favicon es un SVG en línea |
| HTTP 200, local y en Pages | `/`, `index.html`, `css/estilos.css`, los 3 JS, `manifest.webmanifest` e `iconos/icono-180.png`, `-192.png` y `-512.png` |
| Consola y red, en local y en Pages (todo el recorrido, 3 tamaños, almacenamiento bloqueado y dato dañado) | 0 errores de JavaScript y 0 respuestas 4xx/5xx |
| Auto o plusvalía | No se menciona el auto. "Plusvalía" solo aparece en "Calculado sin plusvalía" |

**Las pruebas prueban algo real:**
- Los 4 casos de S3-F1.
- Los bordes con valores exactos (250.000 y 300.000 sobre 1.000.000) y con un peso más (250.001 y 300.001).
- El caso sin ingreso.
- `mejorAlternativa()`: elige la opción más baja y devuelve `null` si nada mejora.
- `leerMonto()` con "$ 800.000", "abc", "" y "0".

**Falta:** no hay ninguna prueba de un valor que se muestre como "30,0 %" pero que esté sobre 30 % (ver la corrección 2).

### Recálculo independiente (`node -e`, sin `calculos.js`)

| Caso | Esperado | Recalculado | En pantalla |
|---|---|---|---|
| Arrendar en lote (Alto Ñuñoa), $1.500.000 + $1.000.000 | 22,9 %, holgado | 571.425 / 2.500.000 = 22,86 % | "22,9 %", Holgado, ícono check ✅ |
| Lo mismo con $1.200.000 + $800.000 | 28,6 %, en el límite | 28,57 % | "28,6 %", En el límite, ícono alerta ✅ |
| Vivir individual (UF 3.000), $1.500.000 + $1.000.000 | 30,1 %, no aprueba | 752.318 / 2.500.000 = 30,09 % | Solo se comprueba en `node --test`, porque en los datos no hay ningún proyecto individual de UF 3.000 ✅ |
| Alto Ñuñoa, $900.000 + $800.000 | — | 33,61 % | "33,6 %", No aprueba, "Postular" deshabilitado ✅ |
| Sugerencia: Mirador Santa Lucía (UF 2.070), $1.200.000 + $800.000 | — | 528.011 → 26,40 % | "tu carga baja a 26,4 % (en el límite)" ✅ |
| Vista Apoquindo (UF 3.060, en modo vivir), $1.500.000 + $1.000.000 | — | 766.790 → 30,67 % | "30,7 %", No aprueba; sugiere Mirador con 21,1 % ✅ |
| Perfil: pareja a $300.000 (Alto Ñuñoa) | — | 571.425 / 1.800.000 = 31,75 % | "31,7 %", vuelve al paso 1 ✅ |
| **Borde:** Alto Ñuñoa, $902.214 + $1.000.000 | — | 30,04 % | **"30,0 %" junto a "No aprueba" y "sobre 30 %"** ❌ (corrección 2) |
| **Borde:** $1.283.000 + $1.000.000 | — | 25,03 % | **"25,0 %" junto a "En el límite"** ❌ |

### Colores del Bci Kit

Se compararon con un script las 30 variables de `css/estilos.css:10-43` con las tablas de `docs/bci-kit.md`: **son idénticas**, incluidas las dos derivadas (`--yellow-dark` y `--red-dark`). Barlow Condensed y Figtree ya no aparecen en ningún archivo.

## 3. Criterios por feature

### S3-F0 Bci Kit oficial

| Criterio | | Evidencia |
|---|---|---|
| Colores exactos de `docs/bci-kit.md` | ✅ | `css/estilos.css:10-43`, 30 de 30 iguales |
| Overpass 400, 600 y 700 reemplaza a Barlow y Figtree; títulos en 400 | ✅ | `index.html:18`; `--font` (`css/estilos.css:46`). En el navegador: `document.fonts.check` es verdadero para los 3 pesos. `#titulo-inicio` mide Overpass 400, 26 px e interlineado 1,3 |
| Display 1–4 y Encabezado 1–6 con los tamaños del kit | ✅ | `css/estilos.css:95-104`: 64 / 52 / 42 / 34 y 30 / 26 / 22 / 20 / 18 / 16 px |
| Botones píldora (radio 48 px, borde 1,6 px, mayúsculas), de 36, 50 y 56 px; small con 44 px táctiles | ✅ | `css/estilos.css:125-150`. El small llega a 44 px con su `::before` de ±4 px. Medido: el primario large mide 56,8 px y el normal ≈ 52 px, porque la etiqueta es de 19 px. Es una diferencia menor (ver sugerencias) |
| Blanco sobre `--green-normal` en negrita de 19 px o más; texto verde chico en `--green-dark`; ningún texto amarillo | ✅ | El primario mide 19 px y peso 700 (4,46:1, válido como texto grande). El primario small usa `--green-dark`. `--green-normal` y el amarillo solo se usan en fondos, bordes, íconos o barras (`grep "color: var(--green-normal\|--yellow"` solo encuentra el ícono de la lista con check) |
| Campos de dinero de 50 px, texto de 18 px y radio de 6 px | ✅ | `css/estilos.css:216-226`; etiqueta visible arriba y borde `--gray-semidark` |
| Íconos SVG de línea dibujados en el código | ✅ | Símbolos en `index.html:22-37`; no se usa ninguna fuente de íconos |

### S3-F1 Fórmula de carga

| Criterio | | Evidencia |
|---|---|---|
| Carga y nivel en `calculos.js`, con pruebas | ✅ | `js/calculos.js:189-204`; `tests/calculos.test.js:159-191` |
| 22,9 % holgado / 28,6 % en el límite / 30,1 % no aprueba | ✅ | Ver el recálculo |
| Exactamente 25 % es holgado y exactamente 30 % es en el límite | ✅ | Tolerancia de `1e-9` (`calculos.js:198`); se prueba también con un peso más |

### S3-F2 Postula (paso 1 de Mi compra)

| Criterio | | Evidencia |
|---|---|---|
| Dos campos de sueldo, con el proyecto elegido arriba | ✅ | Tarjeta "Edificio Alto Ñuñoa · Total al mes: $571.425" sobre los campos (`app.js:460`) |
| `inputmode="numeric"` y punto de miles al escribir | ✅ | `app.js:377`. Tecla por tecla, el campo queda en "1.500.000". Insertar un dígito a mitad del número también funciona ("1.200.000" → "150.200.000") |
| Carga como número protagonista, con semáforo (color + palabra + ícono) | ✅ | `.display-2` (52 px); el borde y la píldora van en el color del nivel; "Holgado" / "En el límite" / "No aprueba"; íconos `i-ok` / `i-alerta` / `i-no` |
| Con un campo vacío o en cero: error claro y no calcula | ✅ | Con "0": "El sueldo tiene que ser mayor a $0.". Al dejar un campo vacío: "Escribe el sueldo líquido del mes.". En los dos casos no aparece la carga, "Postular" queda `disabled` y se marcan `aria-invalid` y `aria-describedby` |
| En amarillo o rojo, una sugerencia calculada con `calculos.js` y un enlace a Proyectos | ✅ | `mejorAlternativa()`: "Si te unes a la compra en conjunto de Edificio Mirador Santa Lucía, tu carga baja a 26,4 % (en el límite).", con enlaces a `#proyecto/mirador-santa-lucia` y `#proyectos`. En verde no aparece. Hay un defecto en rojo: ver la corrección 3 |
| "Postular" deshabilitado en rojo; en verde o amarillo avanza al paso 2 | ✅ | Rojo: `disabled`, más "Con una carga sobre 30 % no puedes postular…". Verde y amarillo: el paso 2 queda con `aria-current="step"`, aparece "Postulación enviada (simulada): tu carga es 28,6 %, en el límite." y se guarda `paso: 2` |

### S3-F3 Recordar elecciones

| Criterio | | Evidencia |
|---|---|---|
| Modo, tipo, proyecto y sueldos en `localStorage` | ✅ | `primer-peldano-estado` (`app.js:28-52`) y `primer-peldano-compra` |
| Al recargar, Inicio, Proyectos y Mis proyectos muestran lo último | ✅ | Tras recargar: Inicio en vivir/individual con $8.623.650; Proyectos en "Financiamiento del pie · Para vivir · todos" (3 tarjetas); Mis proyectos en el paso 2. Después de "Cambiar mis sueldos" y recargar: 1.500.000 y 1.000.000 con 22,9 % |
| Sin `localStorage`, funciona igual con valores por defecto | ✅ | Bloqueado antes de cargar la página (lanza `SecurityError`): Inicio por defecto, cambio a vivir, Proyectos, comprar, 22,9 %, paso 2, Perfil y "Empezar de nuevo" funcionan, sin errores. Con datos dañados (`{malo`, un proyecto inexistente, `modo:'x'` o sueldo negativo): valores por defecto y Mis proyectos vacío |

### S3-F4 Agregar a pantalla de inicio

| Criterio | | Evidencia |
|---|---|---|
| Manifest con nombre, colores del Bci Kit e íconos de 192 y 512 px | ✅ | "Primer Peldaño · Bci", `theme_color` `#28892B`, `background_color` `#F6F7F8`, `standalone`. Los íconos se decodifican en 192 × 192 y 512 × 512. El peldaño queda dentro de la zona segura de un ícono `maskable` (esquina a 203 px del centro; el límite es 204,8). Hay además un `apple-touch-icon` de 180 px |
| Responde 200 y está enlazado desde `index.html` | ✅ | `index.html:10`. En local y en Pages, Chrome no reporta errores del manifest (`Page.getAppManifest`) ni problemas para instalar la app (`Page.getInstallabilityErrors` vacío) |

### S3-F5 Perfil

| Criterio | | Evidencia |
|---|---|---|
| Muestra y permite editar modo, sueldos y arriendo actual | ✅ | Abre con lo guardado (vivir, 1.500.000 y 1.000.000); los 3 campos usan `inputmode="numeric"` |
| Al guardar, todo se recalcula | ✅ | Con el paso 2 activo, cambié a arrendar con pareja en $300.000 y arriendo en $450.000. Se guarda todo, aparece "Cambios guardados…", la compra vuelve al paso 1 con 31,7 % (No aprueba) e Inicio queda en arrendar. Con un sueldo en $0 no guarda y muestra el error |
| "Empezar de nuevo" borra todo y vuelve al simulador de Inicio | ✅ | La confirmación aparece en la misma página, sin ventana emergente, y el foco va a "Sí, borrar todo". "Cancelar" no borra nada. Después de borrar: `#inicio`, las 2 claves en `null`, arrendar/lote, $6.467.738 y Mis proyectos vacío, también al recargar |

### Correcciones del Sprint 2 (`evaluations/sprint-2.md`)

| Corrección | | Evidencia |
|---|---|---|
| 2. "52 m²" se partía | ✅ | `app.js:98-104` usa un espacio que no se corta; a 360 px no hay cortes |
| 3. Porcentaje calculado en `barraAvance()` | ✅ | `porcentajeEntero()` (`calculos.js:135`), con prueba; se usa en `app.js:117` |
| 4. Estilos en línea en `app.js` | ✅ | Solo queda `style="width:…%"` en `app.js:121`, que cambia según cada proyecto; está justificado |
| 5. Comando de pruebas (Planner) | ❌ | Sigue pendiente; no le corresponde al Generator |

**Hay una regresión menor del mismo tipo que la corrección 3:** `app.js:447` suma `estado.sueldoPropio + estado.sueldoPareja` en la pantalla (ver la corrección 4).

### Decisiones del Generator que se apartan del kit o del plan

| Decisión | Juicio |
|---|---|
| Enlaces en `--blue-dark` | **Correcta.** `--blue-normal` sobre `--gray-light` da 4,49:1, bajo AA; `--blue-dark` da 6,89:1 (sobre amarillo 20, 6,92:1; sobre rojo 20, 5,22:1). Hay que registrarla en `docs/bci-kit.md` |
| Deshabilitado con texto `--gray-dark` (7,79:1) | **Correcta.** El `--gray-neutral` del kit da 1,42:1. AA no exige contraste en controles deshabilitados, pero con baja visión hay que poder leer qué está bloqueado. El fondo gris ya lo distingue del verde, y siempre lleva una explicación |
| Números protagonistas en peso 600 | **Aceptable.** Los títulos siguen en 400. Hay que registrarla en `docs/bci-kit.md` |
| Indicador de pasos compacto | **Aceptable como diseño,** pero **no cumple su objetivo declarado.** La entrega dice que es "para que la carga quede arriba", y a 390 × 844 la carga empieza en y = 766 y su número en y = 813, bajo la barra (y = 779). Ver la corrección 1 |
| "Cambiar mi compra a este proyecto" | **Útil, pero con jerarquía invertida.** Hace que la sugerencia se pueda seguir hasta el final. Sin embargo, es terciario (gris) y queda sobre "Invertir aquí", secundario verde, que se ve más fuerte aunque dice "Disponible pronto". Además, borra la postulación (paso 2 → 1) sin avisar. Ver la corrección 5 |
| El 80 % se muestra como $73.916.999 | **Correcta.** Con 4.619.812,5 → $4.619.813 y 13.859.437,5 → $13.859.438, las partes suman $1 de más ($92.396.251). Solo el 80 % puede absorber ese peso sin chocar con "al escriturar" ($6.467.738, S1-F5) ni con "por financiar" ($13.859.438, S6-F2) |

### Calidad en el teléfono (medida en el navegador)

- **Sin scroll horizontal ni elementos fuera del ancho** en Inicio, Proyectos, Detalle, Postula (los 3 semáforos), el paso 2, Perfil y la confirmación, a 390 y 360 px.
- **Inicio:** "Ver proyectos" termina en y = 543 (390 × 844) y en y = 538 (360 × 640), con la barra en y = 575. Se ve sin bajar. "$8.623.650" mide 278 de 278 px a 360 px, sin cortarse.
- **Postula, primera vista:** a 390 × 844, el primer campo está en y = 604–654; la tarjeta de la carga empieza en y = 766, su número en y = 813 y "Postular" en y = 1.274. **La carga queda bajo la barra y no se ve sin bajar.** Con el teclado del teléfono abierto, se ve todavía menos.
- **Detalle de un proyecto:** "Comprar aquí" sigue en y ≈ 1.192, igual que en el Sprint 2.
- **Toques:** todos los botones y enlaces miden 44 px o más. Los únicos más chicos son los `input` de radio ocultos (sus `label` miden 44 px) y las etiquetas de los campos, que no son zonas táctiles.
- **Contraste con los colores oficiales** (calculado; AA pide 4,5:1, y 3:1 para texto grande y gráficos):

| Combinación | Contraste |
|---|---|
| Primario: blanco sobre `--green-normal`, 19 px en 700 (texto grande) | 4,46 ✅ |
| Selección, pestaña activa y paso actual: blanco sobre `--green-dark` | 7,03 |
| Enlaces `--blue-dark` sobre gris claro / blanco | 6,89 / 7,39 |
| Deshabilitado: `--gray-dark` sobre `--gray-semilight` | 7,79 |
| Semáforo "Holgado": `--green-dark` sobre `--green-20` | 5,42 |
| Semáforo "En el límite": `--gray-dark` sobre `--yellow-normal` | 7,46 |
| Semáforo "No aprueba": `--red-dark` sobre `--red-20` | 5,05 |
| Ícono de error o de no aprueba (gráfico): `--red-normal` sobre `--red-20` | 3,18 |
| Error: `--gray-dark` sobre `--red-20` | 6,82 |
| Sugerencia: `--gray-dark` sobre `--yellow-20` | 9,04 |
| "Sí, borrar todo": `--red-dark` sobre blanco | 7,14 |
| Texto de apoyo sobre gris claro | 5,04 |
| Foco: `--blue-normal` sobre gris claro (gráfico) | 4,49 |

El borde amarillo del semáforo da 1,29:1, pero no es la única señal: lo acompañan la palabra y el ícono.

- **Áreas seguras y viewport:** `viewport-fit=cover` (`index.html:5`); `env(safe-area-inset-*)` en `.app`, `.pantalla` y `.barra`.

## 4. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 4 | Todos los criterios se comprobaron tocando la app, en local y en Pages, y resiste el almacenamiento bloqueado y los datos dañados. Baja porque en los bordes el semáforo contradice al número y porque en rojo la sugerencia puede ser otro "no aprueba". |
| Calidad móvil | 3 | No hay desbordes, los toques miden 44 px y todo el texto cumple AA. Pero en Postula el número protagonista no se ve sin bajar (y = 813 con la barra en 779), contra lo que dice la entrega, y "Comprar aquí" sigue a 1,4 pantallas. |
| Código | 4 | Las fórmulas están en `calculos.js` con pruebas reales y la lectura del almacenamiento es defensiva. Quedan una suma en la pantalla (`app.js:447`), CSS sin usar (`.campo .ayuda`, `.filtro .btn-terciario`) y un `app.js` de 713 líneas. |
| Diseño | 4 | Aplica fielmente el Bci Kit: figuras de marca, píldoras verdes, semáforo con 3 señales y confirmación sin ventana emergente. Bajan la jerarquía de "Cambiar mi compra" frente a "Invertir aquí" y una Postula larga antes del número. |

## 5. Correcciones requeridas

No bloquean este sprint. Para el Sprint 4, en orden de importancia:

1. **Postula: la carga tiene que verse sin bajar** (`js/app.js`, `renderPostula()` y `tarjetaMiCompra()`). A 390 × 844, el número empieza en y = 813, bajo la barra (y = 779), y en el teléfono el teclado lo tapa mientras se escribe. Hay 3 cambios posibles:
   - Hacer una versión compacta de la tarjeta del proyecto en Postula: nombre y total al mes en una línea, sin chip ni "Ver proyecto", porque el nombre ya puede enlazar.
   - Quitar el párrafo de apoyo o juntarlo con el título.
   - Al completar los dos sueldos, llamar a `scrollIntoView({ block: 'nearest' })` sobre `#carga-resultado`.

   La meta es que, con los dos campos llenos, el número quede sobre y = 779 a 390 × 844. Tu 5 % (S4-F2) tendrá la misma estructura, así que conviene resolverlo antes.
2. **El semáforo contradice al número en los bordes** (`js/calculos.js`, `nivelCarga()`). Alto Ñuñoa con $902.214 + $1.000.000 da 30,04 %, y la pantalla dice "30,0 %", "No aprueba" y "Con una carga sobre 30 % no puedes postular". Con 25,03 % dice "25,0 %" y "En el límite". La solución:
   - Agregar en `calculos.js` una `cargaRedondeada(k)` (a 1 decimal) que usen tanto `nivelCarga()` como `formatoPorcentaje()`.
   - Agregar pruebas con 25,03 % y 30,04 %, sin romper las de exactamente 25 % y 30 %.
3. **En rojo, la sugerencia no puede proponer otro "no aprueba"** (`js/app.js:403-420`, `sugerencia()`). Con $900.000 + $800.000, sugiere Mirador Santa Lucía con 31,1 % ("no aprueba"), y bajo "Postular" dice "Prueba la sugerencia de arriba", que tampoco sirve. Hay que hacer dos cosas:
   - Si `mejor.nivel === 'no-aprueba'`, decir cuánto ingreso falta para llegar a 30 %, con una función nueva en `calculos.js` (por ejemplo, `ingresoMinimo(totalMes)` = total / 0,30). Para Alto Ñuñoa da $1.904.750, es decir, faltan $204.750.
   - Cambiar el texto de `postular-explica` según el caso.
4. **`js/app.js:447`:** `estado.sueldoPropio + estado.sueldoPareja` es un cálculo hecho en la pantalla. Hay que agregar `ingresoTotal(propio, pareja)` en `calculos.js`, usarla dentro de `carga()` y mostrarla desde ahí.
5. **"Cambiar mi compra a este proyecto"** (`js/app.js:274-276`):
   - Cuando se llega desde una sugerencia, es la acción principal de la pantalla. Debe ser `btn-primario btn-lg`, no terciario bajo un secundario verde.
   - Si la compra actual ya está en el paso 2, hay que avisar en una línea que se vuelve a postular (por ejemplo, "Tu postulación en Edificio Alto Ñuñoa se reemplaza").
6. **Limpiar el CSS sin usar:** `.campo .ayuda` (`css/estilos.css:210`) y `.filtro .btn-terciario` (`:420`). Ninguna pantalla los usa.
7. **Planner:**
   - Cambiar `node --test tests/` por `node --test` en `CLAUDE.md:62` y `PLAN.md:20` (tercer sprint pendiente).
   - Actualizar la tabla de `PLAN.md` a vivir individual = $752.318.
   - Registrar en `docs/bci-kit.md` las excepciones aceptadas: enlaces en `--blue-dark`, deshabilitado con `--gray-dark` y cifras en peso 600.
   - Registrar en el plan "Cambiar mi compra" y "Salir de esta compra".

## 6. Qué revisar a mano en el teléfono

1. **Postula con el teclado abierto:** en Mi compra, escribe los dos sueldos. Fíjate si ves tu carga y su color sin cerrar el teclado ni bajar. En el navegador no se ve; probablemente tampoco en el teléfono.
2. **Instalar la app desde Pages:** usa "Agregar a pantalla de inicio" y revisa que el ícono verde del peldaño no quede recortado (Android lo recorta en círculo o en gota) y que la app abra sin la barra del navegador. En iPhone, revisa también que el ícono activo de la barra inferior se vea relleno.
3. **El "·" de la ficha:** en Mi compra, "Ñuñoa · Piso 4 · 2 dormitorios" se ve en Chrome con el punto pegado a la palabra siguiente ("Ñuñoa ·Piso"). Fíjate si en tu teléfono se lee bien o se ve descuadrado.

## 7. Sugerencias (no bloquean)

- **Borrar sobre un punto de miles:** con el cursor justo después de un "." y la tecla de borrar, no pasa nada y el cursor salta al final ("1.500.000" queda igual). Se podría borrar el dígito anterior al punto.
- **Montos absurdos:** "99999999999999999" queda en "999.999.999.999" y da "0,0 %", Holgado. Conviene un tope razonable (por ejemplo, 9 dígitos) o un aviso.
- **Alto del primario:** con 19 px y un interlineado de 1,2, mide ≈ 52 y 56,8 px en vez de 50 y 56. Se corrige con `line-height: 1.1` en `.btn-primario`.
- **Manifest:** Chrome recomienda separar `"purpose": "any"` y `"maskable"` en entradas distintas. Hoy el ícono cabe en la zona segura, así que funciona, pero no conviene combinarlos.
- **Pestaña de Proyectos:** si el usuario toca la otra pestaña sin cambiar el tipo en Inicio, al recargar vuelve a la del tipo. Está dentro del criterio, pero se podría recordar también.
- **`app.js` tiene 713 líneas.** Antes del Sprint 4 conviene ordenarlo por pantalla, o dividirlo si el Planner lo aprueba.
