# Evaluación · Sprint 5 · Inicio y Mi departamento

Evaluado sobre el commit `16cf2e7`, contra la sección "Sprint 5" de `PLAN.md` (versión de `f3fcff0`) y `CLAUDE.md`.

La app se probó con `python -m http.server`, en Chrome sin ventana, emulando teléfonos de 390 × 844 y 360 × 640. Un script recorrió todo el flujo: Inicio sin compra, el filtro "Me alcanza", comprar, Postula, Tu 5 %, firma, Mi departamento en arrendar y en vivir, abono, otro mes y "Empezar de nuevo". Escribió tecla por tecla en los campos. No se probó en un teléfono físico.

El commit `9984141` cambia el identificador interno `titulo-depto` por `titulo-departamento`. No era texto visible, así que el cambio es legítimo y no esconde nada a la búsqueda de palabras prohibidas.

## 1. Veredicto

**APROBADO.** Las 7 features (S5-F0 a S5-F6) cumplen sus criterios y ninguna dimensión queda bajo 3. Hay una corrección importante para el Sprint 6: a 360 × 640, el botón fijo tapa el número protagonista de Inicio (corrección 1).

## 2. Verificaciones automáticas

| Verificación | Resultado |
|---|---|
| `node --test` | 46 de 46 pasan |
| `node --test tests/` | Sigue fallando en Node 24. `CLAUDE.md:62` y `PLAN.md:20` (**quinto sprint pendiente**, corresponde al Planner) |
| `node --check` de los 3 JS | Sin errores |
| `grep -rniE "plata\|depto\|dpto"` (incluido el manifest) | Vacío |
| Rutas `/` y librerías externas | Ninguna; solo Google Fonts |
| HTTP 200 en local | `/`, `index.html`, el CSS, los 3 JS y el manifest |
| Consola y red en todo el recorrido (2 tamaños) | 0 errores y 0 respuestas 4xx/5xx |
| Auto o plusvalía | No se menciona el auto. "Calculado sin plusvalía" aparece en Inicio, el detalle, la firma y el avance de la deuda |
| Simulador genérico y "Volver a simular" | Ya no aparecen en la app |

### Recálculo independiente (`node -e`, sin `calculos.js`)

| Caso | Plan | Recalculado (fuerza bruta UF por UF) | En pantalla |
|---|---|---|---|
| $1.500.000 + $1.000.000 | UF 2.472 · $7.105.888 · $624.970 | UF 2.472 · $7.105.888 · $624.969 (suma de partes) | "UF 2.472 … $7.105.888 … $624.969" ✅ (±$1) |
| $1.200.000 + $800.000 | UF 1.953 · $5.613.996 · $499.792 | Igual | "UF 1.953" ✅ |
| $2.000.000 + $1.000.000 | UF 2.990 · $8.594.905 · $749.907 | Igual; la carga queda en 25,00 % | Lo prueba `node --test` ✅ |
| Arriendo de $450.000 | neto $371.250 → pone $200.175 | Igual | "Este mes pusiste $200.175" ✅ |
| Arriendo de $700.000 | neto $577.500 → excedente $6.075 | Igual | "Te sobraron $6.075", "Abonar $6.075" ✅ |
| Saldos después de 12 cuotas (UF 2.250) | — | Bci $72.724.551; inversionistas $12.916.269 (mes a mes) | `saldoBciUF` y `saldoInversionistasUF` dan lo mismo ✅ |
| Días al cierre de Alto Ñuñoa | — | 42 (del 3 de noviembre al 15 de diciembre de 2026) | "El proyecto cierra en 42 días" ✅ |

## 3. Criterios por feature

### S5-F0 Inicio: ¿Cuánto puedo comprar?

| Criterio | | Evidencia (navegador) |
|---|---|---|
| `capacidadCompraUF()` con los 3 casos y `null` sin sueldos | ✅ | Pruebas y recálculo; también comprueba que una UF más pase de 25 % |
| Título "Tu departamento con el 5 %" con figuras, selector vivir/arrendar y 2 campos numéricos | ✅ | Las 4 figuras, `inputmode="numeric"` en los dos campos. A 360 px el "%" queda solo en la segunda línea (corrección 2) |
| Protagonista "Puedes comprar hasta UF 2.472", con lo que pone al escriturar y al mes, y "Calculado sin plusvalía" | ✅ | Se ve a 390 × 844 (termina en y = 515). A 360 × 640 queda **tapado por el botón fijo** (corrección 1) |
| "¿De dónde sale el resto?" con 80 / 15 / 5 en pesos | ✅ | $81.210.144 / $15.226.902 / $5.075.634, más $2.030.254 de gastos |
| Sin sueldos: el mensaje y ningún número | ✅ | "Escribe los sueldos para saber cuánto puedes comprar."; ningún `.numero`. Al tocar el botón así, no navega y marca los dos campos |
| Los mismos sueldos que Postula | ✅ | Postula se abre con "1.500.000", "1.000.000" y 22,9 % |
| "Ver proyectos que me alcanzan" → Proyectos con el filtro "Me alcanza" activo; se puede quitar | ✅ | En vivir con UF 2.472: conjunto muestra Alto Ñuñoa y Mirador (sale Vista Apoquindo, UF 3.060); financiamiento muestra Plaza Independencia y Brisas (sale Parque Macul, UF 2.600). El chip tiene `aria-pressed`; se quita y se vuelve a poner. Con UF 1.953, el estado vacío ofrece "Quitar el filtro Me alcanza" y funciona |
| Sin simulador genérico; "Empezar de nuevo" vuelve aquí | ✅ | Después del reinicio: `#inicio` con "Tu departamento con el 5 %" |

### S5-F1 Fórmulas del mes

| Criterio | | Evidencia |
|---|---|---|
| $450.000 → $371.250 → pone $200.175 | ✅ | `cascadaMes()` y `loQuePoneUsuario()`, con pruebas |
| $700.000 → $577.500 → excedente $6.075 | ✅ | Ídem |
| Saldo de cada deuda después de N cuotas | ✅ | `saldoDeuda()`, comparado en las pruebas con una tabla mes a mes |

### S5-F2 Cascada de la cuenta custodia

| Criterio | | Evidencia |
|---|---|---|
| Se ve en Mi compra después de firmar, con pasos numerados | ✅ | 1 Entra el arriendo $450.000 · 2 Administración y mes vacío −$78.750 · 3 Dividendo $403.272 (el arriendo cubre $371.250) · 4 Inversionistas $168.153 (cubre $0) · 5 Tú completas $200.175 |
| Protagonista: lo que puso el usuario ($200.175) | ✅ | `.display-3` "$200.175" |

### S5-F3 Modo vivir

| Criterio | | Evidencia |
|---|---|---|
| Total al mes comparado con el arriendo actual | ✅ | "Este mes pagaste $571.425 · Dividendo $403.272 + inversionistas $168.153 · Antes pagabas $450.000 de arriendo: ahora pagas $121.425 más al mes, pero en algo que es tuyo." Sin cascada ni abono |

### S5-F4 Avance de la deuda

| Criterio | | Evidencia |
|---|---|---|
| Dos barras (Bci 30 años e inversionistas 10 años), con meses pagados y saldo en pesos | ✅ | 2 `progressbar`: "Mes 1 de 360 · Te queda por pagar $73.819.662" y "Mes 1 de 120 · $13.783.681". En el mes 2: $73.721.959 y $13.701.344 |
| "Calculado sin plusvalía" junto al avance | ✅ | Sello dentro de la tarjeta "Avance de tu deuda" |

### S5-F5 Aviso de abono

| Criterio | | Evidencia |
|---|---|---|
| Con excedente: "Abonar" y la explicación de la tasa más alta | ✅ | "La IA recomienda abonar: … UF + 8 %, contra 4,5 % del crédito Bci." Botón fijo "Abonar $6.075", visible sobre la barra (390 y 360). Al abonar, la deuda baja exactamente $6.075 ($13.783.681 → $13.777.606), el botón desaparece y aparece "Abonaste… este mes" |
| Sin excedente, la acción no aparece | ✅ | Con $450.000: no hay botón ni aviso |

### S5-F6 Inicio: Mi camino

| Criterio | | Evidencia |
|---|---|---|
| Nombre del proyecto y un solo número por etapa | ✅ | Postula "22,9 %", Tu 5 % "11 meses", Firma "$6.467.738", Departamento "$200.175" (arrendar) y "$571.425" (vivir) |
| Recorrido de 5 pasos; hechos con check y el actual con color e ícono; nada cortado a 360 px; sin abreviaciones | ✅ | Únete · Postula · Ahorra · Firma · Departamento. Los hechos llevan `i-ok` y "listo"; el actual lleva un ícono relleno `--green-dark`, negrita y "estás aquí"; 0 nombres cortados |
| Acción principal del paso actual, directa a ese paso | ✅ | "Ir a Postula", "Seguir ahorrando", "Ir a firmar" y "Ver mi departamento" → `#mis-proyectos` en el paso correcto |
| Avisos de la IA: máximo 2, con check, con datos reales; sin avisos, la sección no aparece | ✅ | Paso 1: cierre en 42 días y "7 de 10 cupos: faltan 3". Ahorro: "Te faltan $616.935 para llegar al 25 %" ($6.467.738 × 0,25 − $1.000.000 = $616.934,5, que da $616.935) y el cierre. Departamento con excedente: el aviso de abono. Sin excedente: no hay sección |
| Inversiones | — | Llegan en el Sprint 6 (lo dice la entrega) |

### Calidad en el teléfono (medida en el navegador)

- **Sin scroll horizontal ni elementos fuera del ancho** en Inicio (capacidad y Mi camino), Proyectos, Mi departamento en los dos modos y el abono, a 390 y 360 px.
- **Toques:** todos los botones y enlaces miden 44 px o más.
- **Acciones fijas:** "Ver proyectos que me alcanzan" y "Abonar $6.075" quedan sobre la barra en los dos tamaños.
- **Contraste:** los colores nuevos (camino, cascada, aviso de abono y recuadro sin número) usan combinaciones ya medidas, todas AA: `--green-dark` sobre blanco 7,03; `--green-dark` sobre `--green-20` 5,42; `--gray-dark` sobre `--gray-light` 8,99; `--gray-semidark` sobre blanco 5,40 y sobre `--gray-light` 5,04.

## 4. Puntuaciones

| Dimensión | Nota | Justificación |
|---|---|---|
| Funcionalidad | 5 | Todos los números coinciden con el recálculo, y el abono, otro mes, el filtro y el reinicio funcionan de punta a punta. |
| Calidad móvil | 3 | No hay desbordes y los toques miden 44 px, pero a 360 × 640 el botón fijo tapa el número protagonista de Inicio, justo la pantalla que abre la app. |
| Código | 4 | Las fórmulas están probadas contra una amortización real y `pasoEfectivo()` no guarda al dibujar. Hay un error latente en `formatoUF()` y `app.js` ya tiene 1.357 líneas. |
| Diseño | 4 | Mi camino es claro (un número, una acción, recorrido con estados no solo de color) y la cascada se entiende. El chip "Paso 1 de 3" contradice el recorrido de 5 pasos, y el "%" del título queda solo. |

## 5. Correcciones requeridas

No bloquean. Para el Sprint 6, en orden de importancia:

1. **El botón fijo tapa el número protagonista de Inicio** (`css/estilos.css:599`, `.accion-fija`; `js/app.js:318`). A 360 × 640, con los dos sueldos escritos, "UF 2.472" queda detrás de "Ver proyectos que me alcanzan". El `scrollIntoView({ block: 'nearest' })` lo deja a la vista para la ventana, pero no descuenta el botón fijo. Hay que:
   - Agregar `scroll-padding-bottom` en `html` con el alto de la barra más el de la acción fija.
   - Dar a la pantalla un `padding-bottom` que deje libre ese espacio.
   - Comprobar que "UF 2.472" termine sobre el borde superior del botón (hoy y ≈ 504) a 360 × 640.

   Lo mismo puede pasar con "Abonar" sobre la cascada.
2. **El "%" queda solo en el título de Inicio a 360 px** (`js/app.js:294`). Hay que usar un espacio que no se corta: `'Tu departamento con el 5 %'`. Conviene revisar los demás "5 %" de la app.
3. **"Paso 1 de 3" contradice el recorrido de 5 pasos** (`js/app.js:160`, `:171` y `:181`). En Mi camino, el chip dice "Paso 1 de 3 · Postula", pero justo abajo Postula es el punto 2 de 5. Hay que usar una sola numeración: el chip puede mostrar solo el nombre de la etapa, o "Paso 2 de 5".
4. **`formatoUF()` redondea mal** (`js/calculos.js`). `formatoUF(337.95)` da "UF 337,9" y `formatoUF(1234.999)` da "UF 1.234,10". Hay que redondear primero a un decimal (`Math.round(uf * 10) / 10`) y luego separar el entero, con pruebas de esos dos casos. Hoy no se nota, porque solo recibe enteros o valores terminados en ,5, pero el Sprint 6 muestra montos en UF ("por financiar UF 337,5" y lo que invierte el usuario).
5. **El abono resta en plano** (`saldoDeuda()`, `abonadoUF`). Después de abonar, el saldo de los meses siguientes resta los $6.075 sin los intereses que dejan de correr (en el mes 2 sobran unos $40 en el saldo). Es conservador y no promete de más; si se quiere exacto, hay que guardar el mes del abono y restar `abono × (1 + i)^(meses desde el abono)`.
6. **Planner:** `node --test tests/` (quinto sprint pendiente), $752.318 en la tabla, las excepciones al kit en `docs/bci-kit.md`, "Cambiar mi compra", "Salir de esta compra", "Simular otro mes" y el campo "Arriendo que entró este mes" en el plan. Además, hay que decidir si `CLAUDE.md` permite separar `app.js` (ver la sugerencia).

## 6. Qué revisar a mano en el teléfono

1. **Inicio en un teléfono chico:** escribe los dos sueldos y fíjate si ves "Puedes comprar hasta UF …" sin que lo tape el botón verde.
2. **Mi camino:** fíjate si se entiende el recorrido de 5 pasos junto al chip "Paso 1 de 3", o si confunde (corrección 3).
3. **Mi departamento:** escribe un arriendo de 700.000 y fíjate si se entiende por qué conviene abonar.

## 7. Sugerencias (no bloquean)

- **`app.js` tiene 1.357 líneas.** El Generator tiene razón: `CLAUDE.md` fija 5 archivos. Le toca al Planner decidir si se agrega, por ejemplo, `js/pantallas/` antes del Sprint 6, que suma la pantalla Invertir.
- **El selector vivir/arrendar de Inicio** pone "Para vivir" primero, mientras Perfil pone "Para arrendar" primero. Conviene el mismo orden en las dos pantallas.
- **"Este mes no pusiste nada · $0":** con excedente, el número protagonista es $0. Podría ser más claro mostrar "Te sobraron $6.075" como número.
