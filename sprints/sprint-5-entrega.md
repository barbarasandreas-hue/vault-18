# Sprint 5 · Entrega: Inicio y Mi departamento

Estado: listo para que el Evaluator lo revise. Las features S5-F0 a S5-F6 quedan `en progreso` en `PLAN.md`.

## Primero: las correcciones de `evaluations/sprint-4.md`

El informe del Sprint 4 se reescribió dos veces (`fc43745`, `dd55220` y `a8baf28`). Atendí las correcciones de la primera versión y también las de la última.

| Corrección | Qué se hizo | Medido |
|---|---|---|
| **Una compra firmada se podía reemplazar** | Después de firmar, el detalle de otro proyecto dice "Ya firmaste tu compra en Edificio Alto Ñuñoa." y no ofrece cambiarla. Al firmar, el ahorro queda en $0, porque se usó para escriturar. | Probado: no aparece el botón y el ahorro guardado queda en 0. |
| **Las acciones principales quedaban bajo la barra** ("Empezar a ahorrar", "Simular un mes", "Firmar" y también "Postular") | Ahora van en una franja fija (`.accion-fija`) que queda sobre la barra mientras bajas. La uso también en Inicio ("Ver proyectos que me alcanzan") y en el aviso de abono. | A 360 × 640, las 4 acciones quedan en y = 503–560, con la barra en y = 575. |
| **"13 meses" quedaba bajo la barra a 360 × 640** | La primera vez que aparece, la app lo trae a la vista (`scrollIntoView`), igual que la carga en Postula. | El resultado empieza en y = 364. |
| **Se perdía el foco después de "Simular un mes"** | El foco vuelve al botón. Hay una región fija para lectores de pantalla (`#anuncio`, con `aria-live`) que lee "¡Llegaste al 25 % de tu meta! Sigue así. Sumaste un mes. Te faltan 9 meses." | Probado: `document.activeElement` es el botón. |
| **Se guardaba el paso mientras se dibujaba** | Hay una función nueva, `pasoEfectivo()`, que decide el paso sin guardar nada; la usan Mi compra e Inicio. El paso solo se guarda cuando el usuario toca un botón (Postular, Simular un mes o Firmar). | — |
| **Regla `.pasos` repetida** | Borrada. | — |
| **Faltaban pruebas justo en el corte** (sugerencia) | Agregué 300.499 → en el límite, 300.500 → no aprueba, 250.499 → holgado y 250.500 → en el límite. Para que la mitad exacta suba siempre, `cargaRedondeada()` suma 0,0000001 antes de redondear: así 30,05 % muestra "30,1 %" aunque la multiplicación del computador dé 300,4999… | 37 de 37 pruebas en ese momento. |
| **Separar `app.js` en varios archivos** (última versión del informe) | **No lo hice.** `CLAUDE.md` fija la estructura de 5 archivos ("Al ordenarlo, usar esta estructura") y no puedo cambiarla por mi cuenta. Si el Planner quiere separar las pantallas (por ejemplo, `js/pantallas/inicio.js`), hay que cambiar primero `CLAUDE.md`. | — |
| **El "·" pegado a la palabra siguiente** | En Overpass el punto medio queda cargado hacia un lado. Ahora el separador es un punto dibujado con CSS, con 7 px a cada lado. | Visto en las capturas. |
| Pendientes del Planner | El comando de pruebas, la regla de la carga redondeada en `CLAUDE.md`, las excepciones al kit, "Cambiar mi compra" en el plan y $752.318 en la tabla. | No me corresponden. |

## Qué se hizo, feature por feature

**S5-F0 Inicio: ¿Cuánto puedo comprar?**
- Fórmula nueva `capacidadCompraUF()` en `calculos.js`: el mayor precio en UF enteras con una carga de 25 % o menos. Las pruebas cubren los 3 casos del plan:

  | Sueldos | Capacidad | Al escriturar | Al mes |
  |---|---|---|---|
  | $1.500.000 + $1.000.000 | UF 2.472 | $7.105.888 | $624.970 |
  | $1.200.000 + $800.000 | UF 1.953 | $5.613.996 | $499.792 |
  | $2.000.000 + $1.000.000 | UF 2.990 | $8.594.905 | $749.907 |

  En los tres casos se comprueba que la carga quede en 25 % o menos y que una UF más ya pase de 25 %. Sin sueldos, la función devuelve `null`.
- La pantalla tiene el título "Tu departamento con el 5 %" con las 4 figuras, el selector "Para vivir / Para arrendar" y dos campos de sueldo con teclado numérico.
- **Número protagonista:** "Puedes comprar hasta **UF 2.472**". Debajo: "Es decir, $101.512.680, poniendo $7.105.888 al escriturar y $624.969 al mes", y el sello "Calculado sin plusvalía".
- "¿De dónde sale el resto?" muestra el reparto 80 / 15 / 5 de ese precio.
- Sin sueldos aparece "Escribe los sueldos para saber cuánto puedes comprar.", sin ningún número. Si tocas el botón así, te muestra qué falta escribir.
- Son los mismos sueldos de Postula: al llegar a Postula ya están escritos.
- **Acción:** "Ver proyectos que me alcanzan" abre Proyectos con el filtro **"Me alcanza: hasta UF 2.472 ×"** activo; tocarlo lo quita. Con sueldos de $1.500.000 + $1.000.000 en modo vivir, el filtro saca Vista Apoquindo (UF 3.060) y Parque Macul (UF 2.600). Si el filtro deja una pestaña vacía, el estado vacío lo explica y ofrece "Quitar el filtro Me alcanza".
- Ya no existe el simulador genérico ni "Volver a simular". "Empezar de nuevo" (en Perfil) vuelve a esta pantalla. También quité `DEPARTAMENTO_REFERENCIA` de `datos.js`, que ya no se usaba.

**S5-F1 Fórmulas del mes** (`calculos.js`)
- Funciones nuevas: `cascadaMes()`, `loQuePoneUsuario()`, `saldoDeuda()`, `saldoBciUF()`, `saldoInversionistasUF()`, `pesosAUF()` y `diasEntre()`.
- Con un arriendo de $450.000 el neto es $371.250, y el usuario pone **$200.175**.
- Con un arriendo de $700.000 el neto es $577.500, y queda un **excedente de $6.075**.
- El saldo de las deudas se compara en las pruebas con una tabla de amortización hecha mes a mes. En total pasan 46 de 46 pruebas.

**S5-F2 Cascada de la cuenta custodia (modo arrendar)**
- Se ve en Mis proyectos › Mi compra después de firmar.
- Número protagonista: "Este mes pusiste **$200.175**".
- Pasos numerados, cada uno con su monto:
  1. Entra el arriendo.
  2. Se descuentan la administración (10 %) y el mes vacío del año, prorrateado.
  3. Se paga el dividendo, con cuánto cubre el arriendo.
  4. Se paga a los inversionistas.
  5. Tú completas la diferencia.
- El campo "Arriendo que entró este mes" viene con el arriendo estimado del departamento y se puede cambiar, por ejemplo para probar un mes vacío o un arriendo más alto.

**S5-F3 Modo vivir**
- Muestra "Este mes pagaste **$571.425**", con el dividendo y la cuota por separado.
- Compara con lo que pagabas de arriendo: "Antes pagabas $450.000 de arriendo: ahora pagas $121.425 más al mes, pero en algo que es tuyo." Ese monto se escribe ahí mismo o en Perfil.

**S5-F4 Avance de la deuda**
- Hay dos barras: Crédito Bci (30 años, "Mes 1 de 360") e Inversionistas (10 años, "Mes 1 de 120").
- Cada barra muestra cuánto queda por pagar, y abajo va "Calculado sin plusvalía".
- "Simular otro mes" suma una cuota pagada a cada deuda.

**S5-F5 Aviso de abono**
- Solo aparece cuando sobra dinero del arriendo. Dice: "La IA recomienda abonar: Te sobraron $6.075. Conviene abonarlos a la deuda con inversionistas, porque tiene la tasa más alta: UF + 8 %, contra 4,5 % del crédito Bci."
- Botón principal: **"Abonar $6.075"**. Al tocarlo, la deuda con inversionistas baja exactamente esa cifra ($13.783.681 → $13.777.606) y se puede abonar una sola vez por mes.
- Sin excedente, el aviso no aparece.

**S5-F6 Inicio: Mi camino**
- Arriba van el nombre y la comuna del proyecto. Después, un solo número según el paso:

  | Paso | Número |
  |---|---|
  | Postula | La carga (si todavía no hay sueldos, solo el texto "Revisa si califican") |
  | Tu 5 % | "Te faltan 8 meses" |
  | Firma | "Ya juntaste $6.467.738" |
  | Mi departamento | "Este mes pusiste $200.175" |

- El recorrido tiene 5 pasos en una lista vertical: **Únete · Postula · Ahorra · Firma · Departamento**. Los pasos hechos llevan un check y "listo", y el actual va relleno, en verde y con "estás aquí". Ningún nombre se corta a 360 px.
- Acción principal: la del paso actual ("Ir a Postula", "Seguir ahorrando", "Ir a firmar" o "Ver mi departamento").
- **Avisos de la IA:** como máximo 2, en una lista con check, calculados con datos reales:
  - Días para el cierre, contados desde `FECHA_REFERENCIA = '2026-11-03'` en `datos.js`: "El proyecto cierra en 42 días, el 15 de diciembre de 2026".
  - Cupos del grupo: "El grupo lleva 7 de 10 cupos: faltan 3".
  - Siguiente hito del ahorro: "Te faltan $733.869 para llegar al 50 % de tu meta".
  - Después de firmar, el aviso de abono.

  Si no hay avisos, la sección no aparece.
- Las inversiones (lo cobrado a la fecha) llegan con el Sprint 6.

## Cómo verlo en el teléfono

**Desde cualquier lugar** (cuando se suba a GitHub): https://barbarasandreas-hue.github.io/vault-18/

**Por wifi:**
1. En la terminal, dentro de la carpeta del proyecto, escribe `python -m http.server 8000 --bind 0.0.0.0`.
2. Busca la IP con `ipconfig` (hoy es `172.20.10.2`).
3. Abre `http://172.20.10.2:8000` en el teléfono, conectado a la misma red.
4. Si no carga, permite Python en el Firewall de Windows.

**Antes de probar:** ve a Perfil y toca "Empezar de nuevo", porque el Inicio cambió por completo.

## Qué tocar para probar

1. **Inicio:** escribe 1.500.000 y 1.000.000. Debe decir "UF 2.472". Toca "¿De dónde sale el resto?".
2. Toca **"Ver proyectos que me alcanzan"**. El filtro aparece activo; tócalo para quitarlo y volver a ponerlo.
3. Abre Alto Ñuñoa, toca **Comprar aquí** y vuelve a **Inicio**: ahora es **Mi camino**, con los avisos de la IA.
4. **En Mis proyectos:**
   - Toca Postular (los sueldos ya están escritos).
   - Ahorra 500.000 al mes y toca "Simular un mes" hasta llegar a la meta.
   - Toca Firmar.
5. **Mi departamento:**
   - Debe decir $200.175 y mostrar la cascada.
   - Cambia el arriendo del mes a 700.000 y sal del campo: aparece "Abonar $6.075". Tócalo y mira bajar la deuda con inversionistas.
   - Toca "Simular otro mes".
6. **Modo vivir:** en Perfil, elige "Para vivir", escribe 450.000 en arriendo y guarda. Mi departamento compara con ese arriendo.

## Decisiones

- **"Simular otro mes" y el campo "Arriendo que entró este mes"** no estaban en el plan. Sin ellos no se puede ver avanzar la deuda, y el aviso de abono no aparecería nunca: ningún departamento de los datos tiene un arriendo que supere el total al mes. Así se prueba el ejemplo de $700.000 del plan.
- **Inicio calcula la capacidad aunque haya un solo sueldo.** Postula sí exige los dos, porque el crédito es mancomunado.
- **Lo que se paga al mes en Inicio es $624.969, no $624.970.** El total es la suma del dividendo y la cuota ya redondeados, igual que en el resto de la app. La diferencia de $1 está dentro de la tolerancia del plan, y las pruebas la aceptan.
- **"Cambiar" en Proyectos ahora lleva a Perfil.** Una vez que tienes una compra, Inicio ya no muestra el selector de modo.
- **El resultado de S5-F0 y S5-F2 a S5-F6 va en un solo commit**, porque reemplaza el mismo bloque de `app.js`. Las fórmulas van en un commit aparte, con sus pruebas.
- **Renombré `titulo-depto` a `titulo-departamento`.** No se veía en pantalla, pero hacía fallar la búsqueda de palabras prohibidas.

## Pendiente o para saber

- **Lo probé en Chrome emulando teléfonos de 360 × 640 y 390 × 844.** Recorrí Inicio (sin y con compra), Proyectos con el filtro, los 4 pasos y Mi departamento en los dos modos. No hubo errores, scroll horizontal, textos cortados ni toques de menos de 44 px. Falta probarlo en un teléfono real.
- **Mi camino aún no muestra inversiones:** llegan en el Sprint 6.
- **`app.js` sigue en un solo archivo** (ver la tabla de correcciones).
