# Sprint 4 · Entrega: Tu 5 % y escritura

Estado: listo para que el Evaluator lo revise. Las features S4-F1 a S4-F6 quedan `en progreso` en `PLAN.md`.

## Primero: las correcciones 1 a 6 de `evaluations/sprint-3.md`

| # | Corrección | Qué se hizo | Medido |
|---|---|---|---|
| 1 | **La carga no se veía sin bajar** | En Postula la tarjeta del proyecto ahora es una fila corta: el nombre como enlace y "Total al mes $571.425". El párrafo de apoyo pasó al título ("Postula, con los sueldos líquidos"). Además, la primera vez que aparece la carga, la app la trae a la vista con `scrollIntoView` (por si el teclado la tapa). | A 390 × 844, con los dos campos llenos, el número termina en y = 662, sobre la barra (y = 779). Antes empezaba en y = 813. |
| 2 | **El semáforo contradecía al número** | Hay una función nueva, `cargaRedondeada()` (a 1 decimal). `nivelCarga()` usa ese valor y la pantalla muestra ese mismo valor. | $902.214 + $1.000.000 → "30,0 %", **En el límite**, se puede postular. 25,03 % → "25,0 %", **Holgado**. 30,06 % → "30,1 %", No aprueba. Tiene pruebas nuevas. |
| 3 | **En rojo sugería otro "no aprueba"** | La sugerencia solo propone un proyecto si ese proyecto queda en verde o amarillo. Si ninguno sirve, dice cuánto ingreso falta, con las funciones nuevas `ingresoMinimo()` e `ingresoFaltante()` en `calculos.js`. El texto bajo "Postular" cambia según el caso. | $900.000 + $800.000 en Alto Ñuñoa → "a su ingreso le faltan **$204.750** al mes: necesitan $1.904.750 entre los dos". |
| 4 | **Suma de sueldos en la pantalla** | Hay una función nueva, `ingresoTotal()`, en `calculos.js`. La usan `carga()` y la pantalla. | Tiene prueba. |
| 5 | **"Cambiar mi compra" era un botón débil** | Ahora es el botón principal (verde y grande), arriba de "Invertir aquí". El aviso nombra el proyecto actual ("Ya tienes una compra en Edificio Alto Ñuñoa"). Si ya habías postulado, avisa: "Tu postulación en Edificio Alto Ñuñoa se reemplaza: vuelves a postular aquí". | Probado. |
| 6 | **CSS sin usar** | Borré `.campo .ayuda` y `.filtro .btn-terciario`. | — |
| Sección 6 | **El "·" pegado a la palabra siguiente** | El separador ahora es un elemento con el mismo margen a ambos lados (`.sep`), en las fichas y en Inicio. | Visto en las capturas. |

**Cambio en una prueba:** con la regla nueva, una carga de 30,0001 % ahora es "en el límite", porque la pantalla muestra 30,0 %. La prueba que decía "no aprueba" pasó a usar 30,1 %. Las pruebas de exactamente 25 % y exactamente 30 % siguen iguales.

## Qué se hizo, feature por feature

**S4-F1 Fórmula de meses** (`calculos.js`)
- Funciones nuevas: `mesesParaMeta()`, `mesesRestantes()`, `hitosAlcanzados()` y `sumarMes()`.
- Arrendar en lote ($6.467.738) ahorrando $500.000 al mes → **13 meses**.
- Con un ahorro de cero, vacío o negativo, la función devuelve `null` (un error), nunca un número infinito.
- Pasan 36 de 36 pruebas.

**S4-F2 Tu 5 % (paso 2 de Mi compra)**
- La meta sale del proyecto al que te uniste: tu 5 % más los gastos. Por ejemplo, $6.467.738 en Alto Ñuñoa.
- Campo "¿Cuánto puedes ahorrar al mes?" con teclado numérico y punto de miles. Con el campo vacío o en $0 aparece un error y "Empezar a ahorrar" queda deshabilitado.
- Número protagonista: "**13 meses**" en Display 2.
- Barra de avance con hitos al 25 %, 50 %, 75 % y 100 %. Cada hito alcanzado se pone verde, con un check.
- Acción principal: "**Empezar a ahorrar**". Después, el número pasa a "Te faltan 9 meses" y la acción pasa a "Simular un mes".

**S4-F3 Propio o grupal**
- Un selector "Ahorro propio / Ahorro grupal".
- Ahorro grupal: "Ahorras junto a un grupo con una meta común, para motivarse. Cada persona junta su propio 5 % y retira exactamente lo que aportó: nadie aporta por otro ni queda debiendo."
- El título del paso dice "Tu 5 %, más gastos, lo juntas tú". En ninguna parte se sugiere que el 5 % lo pongan inversionistas u otras personas.
- La palabra "auto" no aparece en la app (lo revisé con una búsqueda).

**S4-F4 Avance simulado**
- "Simular un mes" suma el ahorro mensual, sin pasarse de la meta, y lo guarda en `localStorage`. Al recargar, el avance sigue igual.
- Al cruzar un hito aparece "¡Llegaste al 25 % de tu meta! Sigue así."
- "Cambiar mi ahorro mensual" deja corregir el monto sin perder lo ya ahorrado.

**S4-F5 Lista de firma (paso 3)**
- Al llegar a la meta, se pasa solo al paso 3 con el logro "**¡Juntaste tu 5 %!** Ya tienes $6.467.738 para escriturar."
- "Lo que firmas" es una lista con checks, en palabras simples y con los montos del proyecto:
  - **Crédito hipotecario Bci:** el 80 % a 30 años al 4,5 %, y el dividendo con seguros.
  - **Segunda hipoteca con los inversionistas:** el 15 % a 10 años, a UF + 8 %, la cuota al mes y "si no pagas, cobran después de Bci".
  - **Cuenta custodia Bci:** en modo arrendar explica el orden de los pagos; en modo vivir, cómo se paga cada mes.
- Incluye el sello "Calculado sin plusvalía".
- Acción principal: "**Firmar**" (simulado, y lo dice). Después, Mi compra muestra "¡Firmaste!" con los 3 pasos listos y Mi departamento como "Disponible pronto", porque es del Sprint 5.

**S4-F6 Inicio con próximo paso**
- Con una compra en curso, Inicio muestra una tarjeta con la etapa ("Paso 2 de 3 · Tu 5 %"), el proyecto y el número de esa etapa. Por ejemplo, "Te faltan **13 meses**".
- Debajo hay un botón que lleva directo al paso: "Ir a Postula", "Ir a Tu 5 %", "Seguir ahorrando", "Ir a firmar" o "Ver mi departamento".
- "**Volver a simular**" queda a un toque. En el simulador aparece "Volver a mi próximo paso".
- Sin compra, Inicio sigue siendo el simulador de siempre.

## Cómo verlo en el teléfono

**Desde cualquier lugar** (cuando se suba a GitHub): https://barbarasandreas-hue.github.io/vault-18/

**Por wifi:**
1. En la terminal, dentro de la carpeta del proyecto, escribe `python -m http.server 8000 --bind 0.0.0.0`.
2. Con `ipconfig`, busca la línea "Dirección IPv4" (hoy es `172.20.10.2`).
3. Con el teléfono en la misma red, abre `http://172.20.10.2:8000`.
4. Si no carga, permite Python en el Firewall de Windows para redes privadas.

Si ya habías probado la app, conviene ir a **Perfil y tocar "Empezar de nuevo"** para partir limpio.

## Qué tocar para probar

1. Entra a **Proyectos**, abre Alto Ñuñoa y toca **Comprar aquí**.
2. En **Postula**:
   - Escribe 900.000 y 800.000: sale rojo y dice cuánto ingreso falta.
   - Cambia a 1.200.000 y 800.000: sale amarillo, con la sugerencia de Mirador Santa Lucía.
   - Cambia a 1.500.000 y 1.000.000: sale verde. Toca **Postular**.
3. En **Tu 5 %**:
   - Elige "Ahorro grupal" y lee la frase.
   - Escribe 500.000: aparecen **13 meses**.
   - Toca **Empezar a ahorrar** y luego **Simular un mes** varias veces. Mira los hitos.
4. Vuelve a **Inicio**: dice "Te faltan … meses", con el botón "Seguir ahorrando".
5. Sigue simulando hasta la meta: aparecen "¡Juntaste tu 5 %!" y la lista de lo que firmas. Toca **Firmar**.
6. Para probar "Cambiar mi compra": con una compra hecha, abre otro proyecto. El botón verde grande es "Cambiar mi compra a este proyecto".

## Decisiones

- **El número de cada etapa en Inicio:**

  | Paso | Qué muestra |
  |---|---|
  | Postula | La carga. Si aún no hay sueldos, "Revisa si califican". |
  | Tu 5 % | Los meses que faltan. Si aún no hay ahorro mensual, la meta en pesos. |
  | Firma | Lo juntado. |
  | Después de firmar | El total al mes. |

- **El ahorro es del usuario, no del proyecto:** si cambias de compra, lo ahorrado se mantiene. Si ya alcanza la meta del proyecto nuevo, pasas directo a la firma.
- **La firma pasa sola al paso 3 al llegar a la meta** para no agregar un toque más. El logro se anuncia a los lectores de pantalla.
- **"Cambiar mis sueldos" ya no aparece en el paso 2:** los sueldos se cambian en Perfil. Si con los sueldos nuevos la carga pasa de 30 %, la compra vuelve a Postula (esto ya funcionaba en el Sprint 3, ahora también desde el paso 3).
- **Las features S4-F2 a S4-F5 van en un solo commit**, porque son la misma pantalla en sus distintos momentos.

## Pendiente o para saber

- **Lo probé en Chrome emulando teléfonos de 360 × 640 y 390 × 844, no en un teléfono real.** Recorrí todas las pantallas y pasos: no hay errores, scroll horizontal ni textos cortados. Falta revisar con el teclado abierto de verdad.
- **Mi departamento**, después de firmar, todavía dice "Disponible pronto": es el Sprint 5.
- **Pendientes del Planner:**
  - El comando `node --test tests/` en `CLAUDE.md` y en `PLAN.md`.
  - El valor $752.318 de la tabla de referencia.
  - Las excepciones al kit en `docs/bci-kit.md`.
  - Registrar "Cambiar mi compra" y "Salir de esta compra" en el plan.
