# Evaluación heurística · Primer Peldaño

**Fecha:** 9 de noviembre de 2026
**Método:** las 10 heurísticas de Nielsen y los principios de diseño de Norman.
**Versión evaluada:** la app publicada, versión 20.

**Pantallas revisadas:**
- Intro e Inicio.
- Tus pasos.
- Explorar y Un camino.
- Departamentos y el detalle de un departamento.
- Tu pie.
- Preaprobación (Tus datos, Documentos y Resultado).
- Firmar.
- Mi departamento.
- Perfil.

## En resumen

La app tiene un modelo mental muy claro: la escalera de 6 pasos y "tus llaves en X meses". Además, responde bien a cada acción. Lo que más le resta es que **nombra lo mismo de varias formas** y que **algunas pantallas acumulan demasiado**, sobre todo el detalle del departamento.

---

## Las 10 heurísticas de Nielsen

### 1. Visibilidad del estado del sistema · Bien, con un problema

**Fortalezas**
- El plazo cambia en vivo al mover "Si juntas al mes", y la ventana del edificio brilla.
- El avance se ve en todas partes: "2/4 documentos", la barra del pie, "6 de 10" compradores y la racha de cuotas.

**Problema**
- La numeración de los pasos no coincide entre pantallas:
  - Tus pasos dice "Paso 3 de 6 · Preaprobación".
  - Tus datos dice "Paso 4 de 6 · Preaprobación Bci".
  - En la escalera, el paso 6 es "Es tuyo", pero la pantalla de firma también dice "Paso 6 de 6 · Es tuyo", cuando debería ser el 5 ("Final").

### 2. Relación entre el sistema y el mundo real · Regular

**Fortalezas**
- Habla como la persona: "Te frena: juntar tu pie", "Lo que ganan al mes", "Después, pagas al mes".
- Evita la jerga, y los términos que quedan tienen ayuda.

**Problemas**
- El mismo crédito aparece con cuatro nombres:
  - "Crédito con garantía del Estado" en Explorar.
  - "Crédito con FOGAES" en el nombre corto.
  - "Crédito tradicional" en Inicio.
  - "Crédito de siempre", que en realidad es otro producto (los usados, al 80 %), pero se confunde con los anteriores.
- Los montos aparecen en UF y en pesos en la misma pantalla. Mostrar los dos está bien, pero el orden cambia: a veces va primero la UF y otras veces los pesos.

### 3. Control y libertad del usuario · Bien

**Fortalezas**
- Hay salidas claras en varios lugares:
  - "Este mes no pude" y "Pausar este mes".
  - "Ya no quiero" en Tus vecinos.
  - "Si no se completa, sales sin costo" en la compra en grupo.
  - Volver con nombre, por ejemplo "‹ Tus pasos".

**Problema**
- En los usados, "Hacerlo mi camino" parece una acción real, pero solo muestra un aviso de demo.

### 4. Consistencia y estándares · El punto más débil

**Problemas**
- La misma información se ve distinta según la pantalla:
  - "Tus llaves" en Inicio va en una tarjeta azul con un edificio dibujado y un rango ("1 año y 2 a 7 meses").
  - En el detalle es otra tarjeta azul, sin dibujo y con un solo plazo.
- Los plegables se comportan distinto: "Tu grupo y tu obra" usa un estilo, y "Qué revisar en la visita" y "¿Y si alguien se retira?" usan otro.
- El amarillo significa varias cosas: Crédito de siempre, tu arriendo, Pie compartido y los avisos.

### 5. Prevención de errores · Bien

**Fortalezas**
- "¿Hacerlo tu camino?" dice qué cambia (tu fecha y el orden de tus hitos) antes de confirmar.
- "Empezar de nuevo" pide confirmación ("Sí, borrar todo" o "Cancelar").
- Los filtros que no aplican al camino no aparecen, o dicen por qué no aplican.
- Avisa "Te queda poco para vivir" antes de que elijas un departamento.

### 6. Reconocer en vez de recordar · Bien, con un problema

**Fortalezas**
- Las tarjetas muestran lo que decide: precio, cuánto ahorras al unirte, compradores y fecha de cierre.
- Favoritos guarda lo que ya viste.

**Problema**
- Invertir está dentro de Perfil, y alguien que quiere invertir no lo buscaría ahí.

### 7. Flexibilidad y eficiencia de uso · Regular

**Fortalezas**
- Hay atajos: el lápiz para cambiar la cuota, "Ir a pasos" y la cuota automática del día 5.

**Problema**
- En el detalle, "Elegir este departamento" queda al final de una página muy larga. Un botón fijo abajo ahorraría tener que desplazarse.

### 8. Diseño estético y minimalista · Regular

**Fortalezas**
- Inicio, Tu pie y Explorar están limpios: un número grande y una acción.

**Problema**
- El detalle del departamento acumula muchas secciones antes de la acción: llaves, grupo, filas de precio, mes como dueño, barrio, visita, sello y detalle del crédito. Ya se sacó "Calza con" y la visita quedó plegada, pero sigue siendo largo.

### 9. Ayudar a reconocer, diagnosticar y corregir errores · Bien en lo que se ve

**Fortalezas**
- Documentos dice qué falta y cómo resolverlo, por ejemplo "Falta · certificado de antigüedad" con el botón "Subir".

**Problema**
- Cuando algo no alcanza, como en "Todavía no" o "Hoy te dejaría muy justo", la app dice el problema pero no siempre ofrece el siguiente paso concreto. Por ejemplo: "baja el rango", "suma a tu pareja" o "prueba otro camino".

### 10. Ayuda y documentación · Bien

**Fortalezas**
- Íconos "?" junto a los términos difíciles.
- Glosario en Perfil ("Qué significa cada término").
- "¿Cómo funciona?" en cada camino.
- Opción de volver a ver la introducción.

---

## Los principios de Norman

| Principio | Evaluación | Qué se ve en la app |
|---|---|---|
| **Modelo conceptual** | Fuerte | La escalera (Números, Cuenta, Crédito, Pie, Final, Es tuyo) y "tu ventana se enciende" explican el proceso sin texto. Es lo mejor de la app. |
| **Retroalimentación** | Fuerte | La ventana brilla, los avisos confirman cada acción, la racha avanza al pagar y el contador de la visita sube al marcar. |
| **Mapeo** | Bien | Con el slider, más plata da menos meses. Las barras de tu arriendo frente al dividendo se comparan con solo mirarlas. |
| **Indicadores de acción (signifiers)** | Desigual | Las tarjetas grandes con "›" invitan a tocar. Otros elementos se ven tocables sin serlo, como el chip "Te frena: juntar tu pie". "Ver ›" es un link chico que se pierde dentro de la tarjeta azul. |
| **Restricciones** | Bien | Los filtros que no aplican no aparecen, no puedes invertir en tu propia compra y antes del cierre del grupo sales sin costo. |
| **Descubrimiento** | Regular | Invertir queda escondido en Perfil, y Tus vecinos solo aparece dentro de "Tu grupo y tu obra". |
| **Brecha de evaluación** (¿entiendo lo que pasó?) | Pequeña | Siempre sabes cuántos meses faltan y qué te frena. |
| **Brecha de ejecución** (¿sé cómo hacerlo?) | Más grande en el detalle | La acción principal queda lejos, al final de la página. |

---

## Prioridades

| # | Problema | Heurística | Gravedad | Propuesta |
|---|---|---|---|---|
| 1 | ~~El mismo crédito tiene cuatro nombres~~ **Resuelto (9-nov):** "Crédito con garantía del Estado", "Crédito al 80 %" y "Crédito para usados" | Nielsen 2 y 4 | Alta | Elegir un nombre por producto y usarlo en toda la app (Inicio, Explorar, detalle y glosario). |
| 2 | ~~La numeración de los pasos no coincide~~ **Resuelto (9-nov):** todo "Paso X de 6" sigue la escalera de Tus pasos | Nielsen 1 y 4 | Alta | Que "Paso X de 6" siga siempre la escalera: Números 1, Cuenta 2, Crédito 3, Pie 4, Final 5 y Es tuyo 6. |
| 3 | La acción principal queda al final del detalle | Nielsen 7 y 8 · Norman (brecha de ejecución) | Media | Botón fijo "Elegir este departamento" abajo. |
| 4 | Invertir está escondido en Perfil | Nielsen 6 · Norman (descubrimiento) | Media | Un acceso desde Explorar, o desde Inicio en modo invertir. |
| 5 | "Hacerlo mi camino" en los usados no hace nada | Nielsen 3 · Norman (indicadores de acción) | Baja | Deshabilitarlo con una explicación, o hacer que funcione. |
| 6 | "Todavía no" sin un siguiente paso | Nielsen 9 | Baja | Agregar una acción concreta para salir de ese estado. |
| 7 | Colores con varios significados | Nielsen 4 | Baja | Un color por camino y otro distinto para los avisos. |
