# Sprint 6 · Entrega: Inversionista

Estado: listo para que el Evaluator lo revise. Las features S6-F1 a S6-F4 quedan `en progreso` en `PLAN.md`.

## Primero: las correcciones de `evaluations/sprint-5.md`

| # | Corrección | Qué se hizo | Medido |
|---|---|---|---|
| 1 | **El botón fijo tapaba "UF 2.472" en Inicio** | Agregué `scroll-padding-bottom` en `html` (barra + área segura + 88 px) para que `scrollIntoView` deje libre el botón fijo. La app también tiene más espacio libre abajo (`padding-bottom` + 88 px). | A 360 × 640, con los dos sueldos escritos, "UF 2.472" termina en y = 284 y el botón empieza en y = 480. |
| 2 | **El "%" quedaba solo al final de una línea** | Ahora todos los "número + %" usan un espacio que no se corta: en `formatoPorcentaje()`, en los textos de `app.js` (` `) y en `index.html` (`&nbsp;`). | El título "Tu departamento con el 5 %" ya no deja el "%" solo. |
| 3 | **"Paso 1 de 3" no coincidía con el recorrido de 5 pasos** | El chip de Mi camino usa la misma numeración del recorrido: "Paso 2 de 5 · Postula", "Paso 3 de 5 · Ahorra", "Paso 4 de 5 · Firma" y "Paso 5 de 5 · Departamento, mes 1". | Visto. |
| 4 | **`formatoUF()` redondeaba mal** | Ahora redondea primero a un decimal y después separa el entero. | Pruebas nuevas: 337,95 → "UF 338", 337,94 → "UF 337,9" y 1.234,999 → "UF 1.235". |
| 5 | **El abono se restaba en plano** | Los abonos se guardan como una lista `{ mes, uf }`. `saldoDeuda()` descuenta cada abono con los intereses que deja de generar: abono × (1 + i)^(meses desde el abono). Las compras guardadas con el formato anterior se siguen leyendo. | Prueba nueva: un mes después de abonar UF 1, el saldo baja en 1 × (1 + 0,08/12). |
| Sug. | **El selector vivir/arrendar** tenía distinto orden en Inicio y en Perfil | Ahora los dos ponen "Para arrendar" primero. | — |
| Sug. | **Con excedente, el número era $0** | Ahora el número protagonista es lo que sobró: "Este mes te sobraron $6.075", con "El arriendo alcanzó para todo: no pusiste nada." En Mi camino pasa lo mismo. | — |
| 6 | Pendientes del Planner | El comando de pruebas, $752.318, las excepciones al kit, registrar los agregados del Generator y decidir si se separa `app.js`. | `app.js` sigue en un solo archivo, porque `CLAUDE.md` no cambió. |

## Qué se hizo, feature por feature

**S6-F1 Invertir aquí**
- En el detalle de cada proyecto, "Invertir aquí" ahora es un enlace activo que abre la pantalla Invertir (`#invertir/<proyecto>`).
- Un usuario puede tener una compra e inversiones al mismo tiempo. La única excepción es el proyecto de su propia compra: ahí no puede invertir, porque su parte es el 5 % y la junta él. La app lo explica.

**S6-F2 Información para invertir**
- Hay una tarjeta nueva, "Para invertir", en el detalle de cada proyecto, con:
  - Rentabilidad: UF + 8 % al año.
  - Plazo: 10 años.
  - Garantía: segunda hipoteca.
  - **Falta por financiar.** En Alto Ñuñoa (UF 2.250 en compra en conjunto) es **UF 337,5 = $13.859.438**, con prueba.
- Incluye una barra con el avance del 15 % y una frase sobre la cuenta custodia: "Bci cobra el arriendo en una cuenta custodia y paga a los inversionistas después del dividendo."

**S6-F3 Invertir**
- Campo "¿Cuánto quieres invertir?" en UF, con teclado numérico y una ayuda: "Desde UF 10 hasta UF 337,5, lo que falta por financiar".
- Número protagonista: "Recibirás al mes **$4.982**" con UF 10 (con prueba). Debajo dice cuánto es hoy en pesos y que la cuota está en UF.
- Errores, con "Confirmar" deshabilitado:
  - Vacío: "Escribe cuánto quieres invertir, desde UF 10."
  - Menos de UF 10: "La inversión mínima es UF 10."
  - Más de lo que falta: "Falta financiar UF 337,5: no puedes invertir más que eso."
- Al confirmar, la inversión se guarda y **el avance del proyecto sube en el marketplace**. Por ejemplo, Plaza Independencia pasa de 60 % a 80 % con UF 67,5, y "Falta por financiar" baja. Después lleva a Mis proyectos › Mis inversiones.
- Si a un proyecto le falta menos de UF 10, ya no se puede invertir y lo dice.

**S6-F4 Mis inversiones**
- Es la pestaña de Mis proyectos. La lista se guarda en `localStorage` (`primer-peldano-inversiones`); si hay datos dañados, se descartan.
- Número protagonista: "Cobrado a la fecha". Debajo dice cuántas inversiones hay y cuánto recibes al mes.
- "Simular un mes" suma una cuota por inversión (hasta 120). El foco vuelve al botón y se anuncia lo cobrado.
- Cada inversión muestra el proyecto, lo invertido, la cuota mensual y una barra "Cuotas cobradas 3 de 120".
- Sin inversiones: estado vacío con "Ver proyectos".
- **Solo con inversiones (sin compra):**
  - Mis proyectos abre directo en esta pestaña.
  - Inicio muestra "Tus inversiones", con "Cobrado a la fecha" como número y la acción "Ver mis inversiones".
- **Con compra e inversiones:** Mi camino agrega una línea con lo cobrado a la fecha y un enlace "Ver".
- "Empezar de nuevo" (Perfil) también borra las inversiones.

**Fórmulas nuevas en `calculos.js`**, con pruebas:
- `cuotaInversionUF()`, `validarInversion()` y `faltaFinanciarUF()`.
- `cobradoUF()` y `cuotaMensualTotalUF()`.
- `resumenProyecto()` ahora suma lo invertido por el usuario.

Pasan 52 de 52 pruebas.

## Cómo verlo en el teléfono

**Desde cualquier lugar** (cuando se suba a GitHub): https://barbarasandreas-hue.github.io/vault-18/

**Por wifi:**
1. En la terminal, dentro de la carpeta del proyecto, escribe `python -m http.server 8000 --bind 0.0.0.0`.
2. Busca la IP con `ipconfig` (hoy es `172.20.10.2`).
3. Abre `http://172.20.10.2:8000` en el teléfono, conectado a la misma red.
4. Si no carga, permite Python en el Firewall de Windows.

Antes de probar, en Perfil toca "Empezar de nuevo".

## Qué tocar para probar

1. **Como inversionista, sin compra:**
   - Entra a Proyectos, abre Alto Ñuñoa y baja hasta "Para invertir": falta UF 337,5.
   - Toca "Invertir aquí". Escribe 9 (sale error), 400 (sale error) y luego 10: debe decir **$4.982 al mes**.
   - Cambia a 100 y toca "Confirmar".
   - En Mis inversiones, toca "Simular un mes" varias veces.
   - Ve a Inicio: dice "Tus inversiones", con lo cobrado.
2. Vuelve al detalle de Alto Ñuñoa: "Falta por financiar" ahora es UF 237,5.
3. **Comprar e invertir a la vez:**
   - Compra en otro proyecto. Inicio pasa a Mi camino, con la línea de tus inversiones abajo.
   - En el proyecto de tu compra, "Invertir aquí" no aparece y se explica por qué.

## Decisiones

- **No se puede invertir en el proyecto de la propia compra.** El plan no lo dice, pero `SPEC.md` aclara que el 5 % lo pone el usuario y que el 15 % lo financian otras personas. Si el comprador también prestara su propio 15 %, sería lo mismo que poner más pie.
- **En compra en conjunto, lo que se financia es el 15 % de un departamento del lote** (UF 337,5 en Alto Ñuñoa), como pide el ejemplo del plan.
- **Montos en UF enteras:** el teclado numérico del teléfono no tiene coma.
- **La fecha de cada inversión es `FECHA_REFERENCIA`** (la de la demo), igual que los días al cierre.

## Pendiente o para saber

- **Lo probé en Chrome emulando teléfonos de 360 × 640 y 390 × 844.** Recorrí el detalle, Invertir, Mis inversiones, Inicio (solo inversiones, y compra con inversiones) y Perfil. No hubo errores, scroll horizontal, textos cortados ni toques de menos de 44 px. Falta probarlo en un teléfono real.
- **Un commit intermedio (`308340a`) quedó con una prueba que fallaba.** La expectativa estaba mal escrita: con menos de UF 10 por financiar, el error correcto es "máximo". La corregí en el commit siguiente (`53932f1`). Desde entonces solo hago commit si todas las pruebas pasan.

---

## Segunda entrega: correcciones de `evaluations/sprint-6.md`

El Evaluator rechazó S6-F1 y aprobó S6-F2 a S6-F4. Estas son las correcciones; S6-F1 vuelve a `en progreso` para que la revise de nuevo.

| # | Corrección | Qué se hizo | Medido |
|---|---|---|---|
| 1 | **Un proyecto con menos de UF 10 por financiar quedaba trabado** y decía "ya reunió su 15 %" aunque faltaba algo | Hay una función nueva, `inversionMinimaUF()`: el mínimo es UF 10, o lo que falta si queda menos. `validarInversion()` devuelve `completo` solo si falta 0. "Invertir aquí" aparece mientras falte algo, y la ayuda dice "Falta UF 5 para completar el 15 %: puedes invertir justo eso". | En Plaza Independencia, con UF 5 por financiar: UF 4 da error, UF 10 da error y UF 5 se acepta. Después dice "ya reunió su 15 %" y "Falta por financiar UF 0". La prueba que tenía mal escrita también quedó corregida. |
| 2 | **La regla de la propia compra se saltaba en el orden inverso** | Si ya invertiste en un proyecto, el detalle no ofrece "Comprar aquí" ni "Cambiar mi compra a este proyecto". En su lugar dice "Ya invertiste en este proyecto, así que no puedes comprar aquí: tu 15 % lo financian otras personas" y ofrece "Ver mis inversiones". La sugerencia de Postula tampoco propone ese proyecto. | Probé los dos órdenes: invertir y después comprar queda bloqueado; comprar y después invertir sigue bloqueado como antes. |
| 3 | **Decimales en UF:** "12,5" se convertía en UF 125 | El campo acepta un decimal con coma y punto de miles (`limpiarCampoUF()` y `leerMontoUF()` en `calculos.js`, con pruebas) y abre el teclado numérico con coma (`inputmode="decimal"`). Si escribes más de un decimal, se corta al primero. | "12,5" queda en UF 12,5 ($6.228 al mes), y UF 337,5 se puede invertir completa. |
| 4 | **El enlace "Ver" medía 25 px de ancho** | Ahora toda la línea "Tus inversiones: cobrado a la fecha" es un enlace. | 350 × 78 px. |
| 5 | **El `120` repetido y la barra doble** | `app.js` usa `SUPUESTOS.mesesInversionistas` y `SUPUESTOS.mesesBci` en vez de 120 y 360. En financiamiento del pie, la barra del 15 % aparece una sola vez. | Hay 1 barra en Plaza Independencia, y 2 en Alto Ñuñoa (cupos y 15 %), que son cosas distintas. |
| 6 | Pendientes del Planner | El comando de pruebas, un 15 % por departamento en compra en conjunto y el departamento que se guarda en cada inversión. | No me corresponden. |

**Verificación:**
- Pasan 53 de 53 pruebas, sin errores de sintaxis ni palabras prohibidas.
- Recorrí Invertir, Mis inversiones, el detalle e Inicio a 360 × 640 y 390 × 844: no hubo errores, scroll horizontal, textos cortados ni toques chicos.
