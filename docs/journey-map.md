# Journey map de Primer Peldaño

El journey map muestra el recorrido completo de cada tipo de usuario: qué hace, qué piensa y qué siente en cada etapa, y qué puede hacer la app para ayudarlo. Es la base de las pantallas de `SPEC.md` y del orden de los sprints de `PLAN.md`.

Primer Peldaño es un **marketplace de departamentos**: el usuario ve proyectos y se une a ellos, ya sea a una **compra en conjunto** (varios compradores compran un lote con 10 % de descuento) o a un **financiamiento del pie** (el usuario reúne su 15 % con ayuda de inversionistas). El 5 % restante lo pone el usuario por sí solo, con su propio ahorro. Hay dos recorridos: el del **comprador** (el foco del prototipo) y el del **inversionista**.

---

## 1. Comprador

**Quién es:** un joven profesional de 25 a 35 años que arrienda, tiene sueldo estable y postula junto a su pareja. Puede pagar un dividendo, pero no tiene el pie del 20 %.

**Qué quiere:** dejar de pagar arriendo y tener su primer departamento, para vivirlo o para arrendarlo.

| Etapa | 1. Descubre | 2. ¿Cuánto puedo comprar? | 3. Explora proyectos | 4. Postula | 5. Junta su 5 % | 6. Escritura | 7. Mi departamento |
|---|---|---|---|---|---|---|---|
| **Qué hace** | Ve un aviso en la app Bci o en redes | Escribe su sueldo y el de su pareja | Recorre el marketplace y se une a una compra en conjunto o a un financiamiento del pie | Ingresa su sueldo y el de su pareja | Fija cuánto ahorra al mes, solo o en grupo | Firma (simulada) y paga su 5 % más los gastos | Mira cómo se movió el dinero del mes |
| **Qué piensa** | "Nunca voy a juntar el 20 %" | "¿Me alcanza? ¿Y solo pongo $7 millones?" | "¿Cuál me conviene? ¿Y si el grupo no se completa?" | "¿Nos van a rechazar?" | "13 meses… ¿lo voy a lograr?" | "¿Estoy firmando algo que no entiendo?" | "¿Cuánto me toca poner este mes?" |
| **Qué siente** | Frustración | Sorpresa y desconfianza | Entusiasmo, con algo de duda | Ansiedad | Motivación que cae a mitad de camino | Nervios y orgullo | Tranquilidad, o alerta si algo cambia |
| **Dónde ocurre** | — | Inicio, primera vez | Proyectos → detalle → "Comprar aquí" | Mis proyectos › Mi compra, paso 1 | Mis proyectos › Mi compra, paso 2 | Mis proyectos › Mi compra, paso 3 | Mis proyectos › Mi compra (después de firmar) |
| **Número protagonista** | — | Hasta cuántas UF puede comprar | Cuánto ahorra por unirse (en compra en conjunto) o cuánto falta por financiar | Porcentaje de carga | Meses para llegar a la meta | — | Cuánto puso este mes |
| **Dolor** | El pie parece imposible | No sabe si califica; desconfía de lo que parece demasiado bueno | Demasiadas opciones; miedo a que el grupo no se complete | Hablar de dinero en pareja; miedo al rechazo | Pierde motivación entre el mes 4 y el 6 | Lo legal es difícil de entender | Un mes vacío o un arriendo más bajo de lo esperado |
| **Oportunidad** | Un mensaje simple: "5 % en vez de 20 %" | Responder con su propio sueldo, mostrar de dónde sale el resto (80 / 15 / 5) y siempre el escenario sin plusvalía; llevarlo a los proyectos que le alcanzan | La IA filtra proyectos que rinden 4,5 % o más; cupos y fecha de cierre a la vista; qué pasa si el grupo no se completa, dicho claro | Semáforo sin juicio y qué cambiar para quedar holgado | Hitos visibles, avance en porcentaje y ahorro grupal | Lista con checks de lo que firma, en palabras simples | Flujo de la cuenta custodia claro y aviso de cuándo conviene abonar |
| **Sprint** | — | 1 | 2 | 3 | 4 | 4 | 5 |

### Curva emocional

```
alto  |          *        *                            *
      |         / \      / \                *         / \  *
medio |        /   \    /   \     *        / \       /   \/
      |       /     \  /     \   / \      /   \     /
bajo  |  *---/       \/       \-*   \----*     \---/
      +--Descubre--Cuánto--Proyectos--Postula--Junta--Escritura--Mi departamento
```

**Inicio acompaña todo el recorrido.** La primera vez responde "¿cuánto puedo comprar?"; desde que el usuario se une a un proyecto se convierte en **Mi camino**: un número según la etapa, el recorrido de 5 pasos, la acción que sigue y los avisos de la IA.

### Momentos críticos

Son los puntos donde el usuario puede abandonar. Ahí se concentra el diseño:

1. **Duda en "¿Cuánto puedo comprar?".** No sabe si califica y el número parece demasiado bueno. Solución: calcularlo con su propio sueldo, mostrar de dónde sale el resto del dinero y nunca prometer plusvalía.
2. **Duda en Proyectos.** Unirse a un grupo de desconocidos da miedo. Solución: mostrar cupos tomados, fecha de cierre y qué pasa si el grupo no se completa (puede pasar a compra individual o salir sin costo).
3. **Miedo en Postula.** Nadie quiere ver "rechazado". Solución: un semáforo que, si sale amarillo o rojo, dice qué cambiar (por ejemplo, unirse a una compra en conjunto o elegir un departamento más barato).
4. **Valle en Tu 5 %.** Ahorrar meses cansa. Solución: hitos, avance visible y la opción de ahorrar en grupo.

---

## 2. Inversionista

**Quién es:** una persona con ahorros que busca una renta fija en UF, más alta que un depósito a plazo, con una garantía que entiende.

**Qué quiere:** unirse a un proyecto de financiamiento del pie, prestar parte del 15 % de un departamento y recibir una cuota mensual durante 10 años.

| Etapa | 1. Descubre | 2. Explora proyectos | 3. Invierte | 4. Cobra | 5. Termina (10 años) |
|---|---|---|---|---|---|
| **Qué hace** | Ve "UF + 8 % con segunda hipoteca" | Recorre el mismo marketplace, filtrado por proyectos que buscan financiamiento | Elige el monto (desde UF 10) y confirma | Recibe su cuota cada mes | Recupera todo su capital |
| **Qué piensa** | "¿Es seguro?" | "¿Qué pasa si el comprador no paga?" | "¿Cuánto me llega al mes?" | "¿Me pagaron este mes?" | "¿Vuelvo a invertir?" |
| **Qué siente** | Curiosidad y cautela | Analítico | Decidido | Confianza | Satisfacción |
| **Dónde ocurre** | — | Proyectos → detalle | "Invertir aquí" → Invertir | Mis proyectos › Mis inversiones | Mis proyectos › Mis inversiones |
| **Dolor** | No entiende el riesgo | Información dispersa | Miedo a equivocarse con el monto | No ver qué pasa con su dinero | — |
| **Oportunidad** | Explicar la cuenta custodia en una frase | Rentabilidad, plazo, garantía y avance del financiamiento en una sola tarjeta | Ver la cuota mensual antes de confirmar | Mostrar lo cobrado a la fecha y lo que falta | Botón para volver a invertir |
| **Sprint** | — | 6 | 6 | 6 | 6 |
