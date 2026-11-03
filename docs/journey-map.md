# Journey map de Primer Peldaño

El journey map muestra el recorrido completo de cada tipo de usuario: qué hace, qué piensa y qué siente en cada etapa, y qué puede hacer la app para ayudarlo. Es la base de las pantallas de `SPEC.md` y del orden de los sprints de `PLAN.md`.

Hay dos recorridos: el del **comprador** (el foco del prototipo) y el del **inversionista**.

---

## 1. Comprador

**Quién es:** un joven profesional de 25 a 35 años que arrienda, tiene sueldo estable y postula junto a su pareja. Puede pagar un dividendo, pero no tiene el pie del 20 %.

**Qué quiere:** dejar de pagar arriendo y tener su primer departamento, para vivirlo o para arrendarlo.

| Etapa | 1. Descubre | 2. Simula | 3. Postula | 4. Junta su 5 % | 5. Elige | 6. Escritura | 7. Mi departamento |
|---|---|---|---|---|---|---|---|
| **Qué hace** | Ve un aviso en la app Bci o en redes | Elige vivir o arrendar, lote o individual | Ingresa su sueldo y el de su pareja | Fija cuánto ahorra al mes, solo o en grupo | Revisa los departamentos y lotes que la IA filtró | Firma (simulada) y paga su 5 % más los gastos | Mira cómo se movió el dinero del mes |
| **Qué piensa** | "Nunca voy a juntar el 20 %" | "¿Solo $6,5 millones? ¿Dónde está la letra chica?" | "¿Nos van a rechazar?" | "13 meses… ¿lo voy a lograr?" | "¿Cómo sé cuál conviene?" | "¿Estoy firmando algo que no entiendo?" | "¿Cuánto me toca poner este mes?" |
| **Qué siente** | Frustración | Sorpresa y desconfianza | Ansiedad | Motivación que cae a mitad de camino | Abrumado | Nervios y orgullo | Tranquilidad, o alerta si algo cambia |
| **Pantalla** | — | Simula | Postula | Tu 5 % | Elige | Lista de firma dentro de Elige | Mi departamento |
| **Número protagonista** | — | Cuánto pone al escriturar | Porcentaje de carga | Meses para llegar a la meta | Precio y de dónde sale | — | Cuánto puso este mes |
| **Dolor** | El pie parece imposible | Desconfía de lo que parece demasiado bueno | Hablar de dinero en pareja; miedo al rechazo | Pierde motivación entre el mes 4 y el 6 | Demasiadas opciones; no sabe leer la rentabilidad | Lo legal es difícil de entender | Un mes vacío o un arriendo más bajo de lo esperado |
| **Oportunidad** | Un mensaje simple: "5 % en vez de 20 %" | Mostrar de dónde sale el resto (80 / 15 / 5) con un toque y siempre el escenario sin plusvalía | Semáforo sin juicio y qué cambiar para quedar holgado | Hitos visibles, avance en porcentaje y ahorro grupal | La IA muestra solo departamentos que rinden 4,5 % o más; un número por tarjeta | Lista con checks de lo que firma, en palabras simples | Flujo de la cuenta custodia claro y aviso de cuándo conviene abonar |
| **Sprint** | — | 1 | 2 | 3 | 4 | 4 | 5 |

### Curva emocional

```
alto  |          *                                    *
      |         / \                    *             / \  *
medio |        /   \        *         / \      *    /   \/
      |       /     \      / \       /   \    / \  /
bajo  |  *---/       \----*   \-----*     \--/   \/
      +--Descubre--Simula--Postula--Junta--Elige--Escritura--Mi departamento
```

### Momentos críticos

Son los puntos donde el usuario puede abandonar. Ahí se concentra el diseño:

1. **Desconfianza en Simula.** El número es tan bueno que parece mentira. Solución: mostrar de dónde sale el resto del dinero y nunca prometer plusvalía.
2. **Miedo en Postula.** Nadie quiere ver "rechazado". Solución: un semáforo que, si sale amarillo o rojo, dice qué cambiar (por ejemplo, compra en lote o un departamento más barato).
3. **Valle en Tu 5 %.** Ahorrar meses cansa. Solución: hitos, avance visible y la opción de ahorrar en grupo.

---

## 2. Inversionista

**Quién es:** una persona con ahorros que busca una renta fija en UF, más alta que un depósito a plazo, con una garantía que entiende.

**Qué quiere:** prestar parte del 15 % de un departamento y recibir una cuota mensual durante 10 años.

| Etapa | 1. Descubre | 2. Oportunidades | 3. Invierte | 4. Cobra | 5. Termina (10 años) |
|---|---|---|---|---|---|
| **Qué hace** | Ve "UF + 8 % con segunda hipoteca" | Compara departamentos y lotes por financiar | Elige el monto (desde UF 10) y confirma | Recibe su cuota cada mes | Recupera todo su capital |
| **Qué piensa** | "¿Es seguro?" | "¿Qué pasa si el comprador no paga?" | "¿Cuánto me llega al mes?" | "¿Me pagaron este mes?" | "¿Vuelvo a invertir?" |
| **Qué siente** | Curiosidad y cautela | Analítico | Decidido | Confianza | Satisfacción |
| **Pantalla** | — | Oportunidades | Invertir | Mi cartera | Mi cartera |
| **Dolor** | No entiende el riesgo | Información dispersa | Miedo a equivocarse con el monto | No ver qué pasa con su dinero | — |
| **Oportunidad** | Explicar la cuenta custodia en una frase | Rentabilidad, plazo y garantía en una sola tarjeta | Ver la cuota mensual antes de confirmar | Mostrar lo cobrado a la fecha y lo que falta | Botón para volver a invertir |
| **Sprint** | — | 6 | 6 | 6 | 6 |
