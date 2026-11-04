# Evaluación del Sprint 9 · Tus caminos y Todavía no

Evaluado el 4-nov-2026 contra la sección "Sprint 9" de `PLAN.md` (S9-F1 a S9-F6), `CLAUDE.md` (modelo v3), `SPEC.md` §0 y `sprints/sprint-9-entrega.md`. No hay `.git`, así que no hay commit de referencia.

**Cómo lo revisé:**
- Servidor local en el puerto 8030 y Chromium sin ventana (Playwright), emulando teléfonos táctiles de 390 y 360 px. Google Fonts bloqueado.
- Escribí con el teclado y toqué los botones con clics reales.
- Recorridos:
  - **Arrendar con $1.500.000 + $1.000.000.** Inicio → Tu mes real (sin arriendo y con $450.000 de arriendo, ahorro de $2.000.000 y $300.000 al mes) → Tus caminos → Ver otros caminos → las dos fichas con "Me interesa" → Elegir el recomendado → Proyectos con los 4 chips de Comprar más barato en las dos pestañas → Perfil → Abrir el registro → llenar, copiar.
  - **Vivir con $1.200.000 (sin pareja) y $200.000 de otras cuotas.** Tu mes real → Todavía no → Recordarme → Ver los caminos → Ver estudios.
- En cada pantalla medí el desborde horizontal, las zonas táctiles, el contraste contra el fondo real, el peso de los títulos y los errores de JavaScript.
- No probé en un teléfono físico.

## 1. Veredicto

**RECHAZADO.** Se aprueban S9-F1, S9-F2, S9-F4 y S9-F6. **Se rechazan S9-F3 y S9-F5.**

- **S9-F3 Todavía no:** la tarjeta promete "esto lo cambia", pero en el caso de prueba 2 de los 3 cambios no lo cambian, y nada lo dice. Además los 3 llevan un check verde, que se lee como "esto te funciona".
  - "Si terminas de pagar tus otras cuotas… tu carga baja a 36,9 %": sigue sobre el 25 %.
  - "Con un estudio de UF 1.200… pagas $227.472": con las cuotas queda en 35,6 %, sobre el 30 %.
  - Es la pantalla donde la app más necesita ser honesta.
- **S9-F5 Comprar más barato:**
  - El precio "Usado" aplica además el descuento de compra en grupo: un usado no se compra en el grupo de la inmobiliaria. En Parque Quinta Normal muestra $57.439.258, y mi cálculo da $59.215.730.
  - "Cuánto baja el pie" se compara con un departamento de UF 2.500 a precio de lista, así que no muestra lo que baja el filtro de precio en ese proyecto.

La entrega es fiel a lo que hay en el código. Sus cifras (Hogarízate, respaldo familiar, recompra) coinciden con mis cálculos.

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test tests/` | Falla en Node 22.23 por el problema conocido. **No bloquea** |
| `node --test tests/*.test.js` | **115 de 115 pasan.** `tests/caminos.test.js` tiene 18, como dice la entrega |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto"` | Vacío |
| Rutas absolutas y librerías externas | Ninguna (solo Google Fonts) |
| HTTP 200 | `/`, `index.html`, CSS, 3 JS, manifest e ícono |
| Errores de JavaScript | 0 en todos los recorridos, a 390 y a 360 |
| Desborde horizontal | 0 a 390 y a 360 (`scrollWidth` = ancho en las 13 pantallas medidas) |
| Zonas táctiles bajo 44 px en las pantallas nuevas | 0 |
| Contraste bajo AA en las pantallas nuevas | 0. Se midió el color calculado de cada texto contra su fondo real, incluidos los chips "Propuesta" y "Existe hoy", el aviso "Ojo", "Todavía no" en azul y las líneas de Comprar más barato. Los únicos avisos fueron los separadores `·` de 0 px (son decorativos) |
| Títulos en peso 400 | Sí en Tu mes real, Tus caminos, las fichas y el registro |

**Sobre las pruebas:** `tests/caminos.test.js` prueba cada regla de recomendación, los números de SPEC §0, los meses, Recordarme, las dos fichas, Comprar más barato, el texto del registro y que ninguna regla se presente como IA. Son útiles. No hay ninguna que exija que los cambios de "Todavía no" resuelvan el problema, ni una del precio del usado en grupo.

## 3. Números recalculados (con `node -e`, sin las funciones de la app)

| Qué | Mi cálculo | En pantalla | |
|---|---|---|---|
| Tu mes real, arrendar, $2,5 M, sin arriendo: 2.500.000 − 396.758 | $2.103.242 (84 %) | "$2.103.242 · Es el 84 %" | ✅ |
| Con $450.000 de arriendo | $1.653.242 (66 %) | "$1.653.242 · 66 %" | ✅ |
| Vivir, $1,2 M, $200.000 de cuotas: 1.200.000 − 200.000 − 442.759 | $557.241 (46 %). Dividendo 36,9 % y con cuotas 53,6 % | Igual, con "Ojo: El dividendo pasa del límite del banco" | ✅ |
| A + B: al escriturar 4.876.469 + 1.950.588 | $6.827.057. Le faltan $4.827.057, que con $300.000 al mes son 17 meses | "$6.827.057 · 17 meses ahorrando $300.000" | ✅ |
| B: al escriturar 5.133.125 + 2.053.250 | $7.186.375, 18 meses | Igual | ✅ |
| A para invertir (20 % + gastos de UF 2.375) | $21.456.463 | Igual | ✅ |
| Peor caso de la recompra | 48 → 54 (grupo), 51 → 57 (individual) | Igual | ✅ |
| Renta para que convenga (vivir): máx(442.759/0,25; 642.759/0,30; 642.759/0,60) | $2.143.000 | "$2.143.000 ($943.000 más al mes…)" | ✅ |
| Estudio en grupo, vivir: pie 10 % + gastos de UF 1.140 y dividendo | $5.617.692 y $227.472. **Con las cuotas, 35,6 %: no conviene** | Lo muestra sin decir que no alcanza | ❌ (S9-F3) |
| Arriendo con opción (proporción de Hogarízate) | $354.919 + $343.186 = $698.105. 10 % en 30 meses. 27,9 % del ingreso | Igual ("28 %") | ✅ |
| Respaldo familiar: 95 % de UF 2.500 a 3,9 % | $488.761. Libera a los 93 meses (7,8 años) | Igual | ✅ |
| Usado en Parque Quinta Normal: UF 1.750 × 0,824 | **$59.215.730** (pie 5 % = $2.960.787) | "$57.439.258", pie de $2.871.963: aplica también el 3 % de grupo | ❌ (S9-F5) |
| IVA cero en Parque Quinta Normal: 1.750 × 0,935 × 0,97 | $65.176.828, pie de $3.258.841 | Igual | ✅ |

## 4. Tabla por feature

### S9-F1 Tu mes real — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Ingreso − arriendo (en modo invertir) − otras cuotas − dividendo | ✅ | `mesReal` (`js/calculos.js:583`). En modo vivir no resta el arriendo, y lo explica ("dejas de pagar arriendo"). Cuentas recalculadas (sección 3) |
| En pesos y en % | ✅ | "Te quedan al mes para vivir $X · Es el N % de su ingreso" |
| Número protagonista: lo que queda | ✅ | Display 2 en la tarjeta protagonista |
| Aviso si queda menos del 40 % | ✅ | "Ojo: Les quedaría menos del 40 %…", o el motivo de carga cuando corresponde. Con ícono y palabra, no solo color. Se calcula con `sostenible` (`:598`) |
| Escenario sin plusvalía y peor caso | ✅ | "Calculado sin plusvalía". En arrendar: "No contamos el arriendo que recibirías: es el peor caso" |

Detalle menor: dice "Ingreso líquido de los dos" aunque haya un solo sueldo (`js/app.js:2075`).

### S9-F2 Tus caminos — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| `recomendarCamino(perfil)` en `calculos.js`, con las 4 reglas y pruebas | ✅ | `js/calculos.js:653-684`. Pruebas de las reglas 1 a 4 en `tests/caminos.test.js:64-101` |
| Un solo camino arriba, con su razón en una frase | ✅ | "Te recomendamos · A + B · Grupo y pie compartido · Porque inviertes y tu ahorro es menor al 20 % del precio…" |
| "Ver otros caminos" | ✅ | Botón con `aria-expanded` que despliega 4 |
| Cada camino: pie, cuota, meses, peor caso, y si existe hoy o es propuesta | ✅ | `datosCamino` y `chipExiste` (`js/app.js:2112-2127`). Recalculados (sección 3) |
| Nunca "la IA recomienda" | ✅ | No aparece. Nota al pie: "Las recomendaciones salen de reglas fijas, no de la IA" |

Observaciones que no bloquean (ver Sugerencias):
- `elegirCamino` (`js/app.js:2265`) lleva "Crédito con FOGAES" y "Crédito al 80 %", que son individuales, a la pestaña **Compra en grupo**.
- La razón de "vivir-sin-grupo" dice "El Estado garantiza el 90 %", y no es así. FOGAES garantiza una parte del crédito para que el banco preste el 90 %, como sí dice Firma.

### S9-F3 Todavía no — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Aparece si no cumple la carga o Tu mes real | ✅ | Regla 1 en `recomendarCamino` (`:675`). Caso vivir, $1,2 M, $200.000 de cuotas |
| Título "Todavía no te conviene", sin juicio | ✅ | Ícono de reloj, "Todavía no" en azul y sin rojo. "No es un no para siempre" |
| Hasta 3 cambios **calculados** que muestran qué cambiar | ❌ | Son 3 y están bien calculados, pero el bloque dice "esto lo cambia" y **2 de los 3 no lo cambian**, sin aviso. "Terminar las cuotas" deja el dividendo en 36,9 % (límite de 25 %). "Un estudio de UF 1.200" deja la carga con cuotas en 35,6 % (límite de 30 %). `cambiosTodaviaNo` ya calcula `cumple` en cada cambio (`js/calculos.js:704-710`), pero `textoCambio` (`js/app.js:2159-2173`) solo lo usa para agregar ": ya te conviene" cuando es verdadero. Cuando es falso no dice nada, y los 3 llevan un check verde (`#i-check`). La usuaria lee que con un estudio ya puede |
| "Recordarme en N meses" (simulado) | ✅ | "Recordarme en 6 meses" (sin ahorro mensual). El foco pasa a "Listo: te avisamos en 6 meses (simulado)" y se anuncia. Queda en el registro |
| Acceso a opciones más baratas | ✅ | "Ver estudios" lleva a Proyectos con el filtro Estudio (Portal Estación en modo vivir) |

### S9-F4 Fichas de caminos informativos — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Cómo funciona en 3 pasos | ✅ | `<ol>` de 3 pasos en las dos fichas |
| Números con el departamento de referencia | ✅ | UF 2.500. Recalculados (sección 3) |
| Peor caso | ✅ | Arriendo con opción: multa y aprobación del crédito. Respaldo: el familiar puede perder su depósito |
| Referente real | ✅ | Hogarízate (DF, 2023) y Family Springboard de Barclays, con "En Chile no existe hoy" |
| "Me interesa" se guarda en el registro | ✅ | `aria-pressed` cambia y aparece en el texto del registro: "Me interesa: Respaldo familiar, Arriendo con opción de compra" |
| Sin plusvalía | ✅ | Sello en las dos |

Para el Planner, sin bloquear:
- El respaldo familiar supone que Bci presta el 95 %, cosa que el modelo v3 no define.
- Tarda 7,8 años, no los "≈ 5 años" de `CLAUDE.md`. La ficha lo dice con honestidad.

### S9-F5 Comprar más barato — ❌ rechazada

| Criterio | | Evidencia |
|---|---|---|
| Chips Estudio, 1 dormitorio, Usado (−17,6 %) e IVA cero (−6,5 %) en Proyectos | ✅ | `index.html`, `#mas-barato`, con `aria-pressed`. Cada grupo se excluye entre sí |
| Estudio y 1 dormitorio filtran | ✅ | Estudio: Portal Estación (grupo) y Plaza Estación (pie compartido). 1 dormitorio: Parque Quinta Normal. Si no hay en la pestaña: "No hay departamentos de 1 dormitorio en esta pestaña" con "Quitar el filtro de tamaño" |
| Usado con −17,6 % | ❌ | `pieMasBarato` (`js/calculos.js:769-772`) aplica `precioUF(lista, tipoCompra, unidades)` después del −17,6 %. En proyectos de grupo le suma el 3 % o 5 % de grupo a un usado. Parque Quinta Normal: $57.439.258 en vez de $59.215.730, y el pie da $2.871.963 en vez de $2.960.787 |
| IVA cero con −6,5 % y sus fechas (1-dic-2026 al 1-dic-2027) | ✅ | Nota: "IVA cero rige del 1 de diciembre de 2026 al 1 de diciembre de 2027… estimamos 6,5 %" |
| Muestra cuánto baja el pie | ⚠️ | Dice "Tu pie: $Y, $Z menos que en uno de UF 2.500". Compara con un departamento de lista individual, no con el mismo proyecto sin el ajuste: en Parque Quinta Normal, IVA cero baja el pie en $226.551 y la tarjeta dice $1.874.284 (mezcla tamaño, grupo e IVA). Lo acepto para los chips de tamaño, pero para Usado e IVA cero no responde "cuánto me ahorra esto". Va junto con la corrección del usado |

### S9-F6 Registro de la sesión de prueba — ✅ aprobada

| Criterio | | Evidencia |
|---|---|---|
| Pantalla para la facilitadora, con acceso desde Perfil | ✅ | Perfil → "Abrir el registro" → `#registro`, "Sesión de prueba · Para la facilitadora" |
| Plazo antes y después | ✅ | Campos de años con `inputmode="numeric"` |
| Camino elegido | ✅ | Se llena solo al elegir ("A + B · Grupo y pie compartido") y se puede cambiar con un `<select>` |
| Explicación (0–3) y confianza (1–5) | ✅ | Radios con etiquetas de 44 px o más (medido) |
| Los "Me interesa" | ✅ | Listados |
| Se exporta como texto para copiar | ✅ | Un `textarea` de solo lectura con `textoRegistro`. Sin permiso para el portapapeles (sin ventana) cae en "Texto seleccionado: cópialo con el menú del teléfono" |
| "Empezar de nuevo" no borra el registro | ✅ | `borrarTodo` solo quita estado, compra, inversiones e intro (`js/app.js:89-92`) |

## 5. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 3 | Las reglas, Tu mes real, las fichas y el registro funcionan con números exactos. Todavía no sugiere cambios que no resuelven el problema, y el usado tiene un precio mal calculado |
| Calidad móvil | 4 | 0 desbordes, 0 toques chicos y 0 fallas de contraste en las pantallas nuevas a 360 y a 390. Foco y anuncios en Recordarme. Un número y una acción en cada pantalla |
| Código | 3 | Toda la lógica nueva vive en `calculos.js`, con pruebas por regla. `textoCambio` ignora el `cumple` que ya existe, el usado reusa `precioUF` de grupo, y `elegirCamino` resuelve la pestaña con un ternario que no cubre los créditos individuales |
| Diseño | 3 | Coherente con el Bci Kit: "Todavía no" en azul y no en rojo, chips "Existe hoy" y "Propuesta" y peor caso destacado. Pero el check verde en cambios que no funcionan comunica lo contrario de la verdad |

## 6. Correcciones requeridas

1. **Todavía no honesto (S9-F3):**
   - En `textoCambio` (`js/app.js:2159-2173`), cuando `x.cumple` es falso, terminar la frase con cuánto falta. Por ejemplo, "…tu dividendo queda en 36,9 %: todavía sobre el 25 %", o "…con tus cuotas, 35,6 %: aún sobre el 30 %".
   - En `bloqueTodaviaNo` (`:2184`), usar el check verde solo para los cambios con `cumple: true` y un ícono neutro (por ejemplo, flecha o reloj) para los que solo acercan.
   - Cambiar "esto lo cambia" por "esto te acerca" cuando ningún cambio cumple.
   - Mejor aún, que `cambiosTodaviaNo` (`js/calculos.js:697`) combine: estudio + terminar cuotas, o el monto de cuotas que hay que bajar, y que al menos un cambio cumpla.
   - Agregar una prueba con vivir, $1,2 M y $200.000 que exija que al menos un cambio tenga `cumple: true`.
2. **Precio del usado (S9-F5):** en `pieMasBarato` (`js/calculos.js:769`), cuando `ajuste === 'usado'`, no aplicar el descuento de grupo (`precio = lista`, sin `precioUF(…, 'lote', …)`). Agregar una prueba: UF 1.750 usado → $59.215.730 y pie de $2.960.787 en arrendar.
3. **Cuánto baja el pie con el ajuste (S9-F5):** que `pieMasBarato` devuelva también `bajaAjuste` (el pie del mismo proyecto sin ajuste menos el pie con ajuste) y que `lineaMasBarato` (`js/app.js:598`) diga "IVA cero baja tu pie en $226.551". Mantener la comparación con UF 2.500 solo para los chips de tamaño.
4. **Destino al elegir un crédito individual (S9-F2, menor):** en `elegirCamino` (`js/app.js:2265`), no mandar "Crédito con FOGAES" ni "Crédito al 80 %" a la pestaña Compra en grupo. Usar la pestaña que corresponda o mostrar un aviso de que la app todavía no tiene departamentos sueltos (la entrega lo reconoce).
5. **Texto de la razón vivir-sin-grupo (S9-F2, menor):** en `RAZONES['vivir-sin-grupo']` (`js/app.js:2089`), cambiar "El Estado garantiza el 90 %" por "Con la garantía del Estado (FOGAES), Bci presta el 90 % y tú pones el 10 %".

## 7. Qué revisar a mano en el teléfono

1. Leer la tarjeta "Todavía no" con una usuaria del perfil de $1,2 M y preguntarle qué cree que pasaría si comprara un estudio. Hoy la respuesta probable es "que ya puede", y no es cierto.
2. En Tus caminos, ver si "Ver otros caminos (4)", con 4 a 5 tarjetas largas, se recorre sin perderse, y si se nota la diferencia entre "Propuesta" y "Existe hoy".
3. En Proyectos, con un chip de precio activo, ver si la línea "Tu pie: $Y, $Z menos que en uno de UF 2.500" se entiende o si se confunde con el ahorro del grupo.

## 8. Sugerencias (no bloquean)

- Tu mes real y Tus caminos usan siempre el departamento de UF 2.500, mientras Inicio dice "Puedes comprar hasta UF 3.847". Conviene decir en Tu mes real por qué se usa UF 2.500, o usar el proyecto en grupo que le alcanza (la entrega lo deja como decisión para el Planner).
- "Ingreso líquido de los dos" con un solo sueldo: decir "Ingreso líquido" o "de tu hogar".
- "Avisos de la IA" (Mi camino) y el chip "Filtrado por IA" son reglas. La nota de Tus caminos dice que "la IA solo estima el arriendo". Para ser coherentes, "Avisos" y "Rinde 3,9 % o más (con el arriendo que estima la IA)".
- Que el registro guarde también el modo, los sueldos y el camino recomendado (no solo el elegido), para que la facilitadora compare.

---

**Resumen:** RECHAZADO. Tu mes real, Tus caminos, las fichas y el registro están bien y con números exactos. Todavía no ofrece cambios que no resuelven el problema, con check verde y sin decirlo, y el filtro Usado aplica el descuento de grupo a un usado y no muestra cuánto baja el pie por el propio ajuste.
