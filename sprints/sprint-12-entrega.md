# Sprint 12 · Entrega: interacción de compra, inversión y cierre

Estado: listo para que el Evaluator lo revise. S12-F1 a S12-F6 quedan `en progreso`. Se construyó con la skill `interaccion-bci-vanilla`, con las mismas reglas del Sprint 11.

## Qué se hizo

**S12-F1 Proyectos y Detalle**
- **Personas del grupo:** la barra de cupos pasa a ser una fila de figuras.
  - Las tomadas se ven en verde claro. La del usuario va en verde oscuro con borde y la etiqueta "Tú". Las libres van en contorno punteado.
  - Las figuras entran escalonadas, a 40 ms una de otra.
  - Se mantiene "6 de 10", y el `aria-label` dice cuántas hay y si una es tuya.
- **Pie compartido:** la participación reunida pasa a ser la franja del 15 % de una casa, que se llena de izquierda a derecha. Aparece en la tarjeta, en el detalle y en "Para invertir".
- **Detalle:** "De dónde sale el precio" usa la misma casa en franjas del Sprint 11 (`partesEscenario`) y reemplaza la lista.

**S12-F2 Postula: medidor de carga**
- Un semicírculo de 0 a 40 % con zonas: verde hasta 25 %, amarilla de 25 a 30 % y roja sobre 30 %.
- La aguja gira desde el valor anterior con `--ease-mover`.
- Con cuotas, una marca muestra el dividendo solo, y se lee "Dividendo solo: X %".
- Se mantienen el número, la palabra (Holgado, En el límite, No aprueba) y el ícono. El color nunca va solo.

**S12-F3 Tus documentos**
- **Hoja inferior de verdad:** sube desde abajo, con fondo atenuado, `role="dialog"` y `aria-modal`. Se cierra con Esc, tocando afuera o con "Cerrar", y devuelve el foco al botón. También se cierra si se cambia de pantalla.
- **El archivo vuela:** la miniatura elegida viaja hasta el ícono de su fila (`translate` y `scale` en `--dur-media`), y después el check se dibuja (`stroke-dasharray`).
- Reemplaza la barra de subida, cuyo CSS se borró. Al terminar los cuatro documentos, un toast dice "Subiste todos tus documentos".

**S12-F4 Firma y Mi departamento**
- **Firmar:** la llave entra con `--ease-resorte` en el título de Mi departamento, y un toast dice "¡Firmaste!".
- **Casa:** se pinta desde el % anterior cada vez que se simula un mes.
- **Flujo del arriendo:** reemplaza la cascada numerada.
  - Arriba entra el arriendo, y cada tramo baja con su ícono, su monto y una barra proporcional (`scaleX`): administración y mes vacío, renta de los inversionistas, recompra y, con 80 %, la ayuda al dividendo.
  - Los tramos entran escalonados, a 80 ms uno de otro.
  - El dividendo va aparte, en un recuadro punteado: "Lo pagas tú". Sin inversionistas, dice "Va a tu dividendo" y "Te sobra" o "Lo completas tú".

**S12-F5 Invertir y Mis inversiones**
- **Deslizador de UF** desde el mínimo hasta lo que falta por financiar, sincronizado con el campo. "Recibirás el primer mes" cuenta desde el valor anterior.
- **Mis inversiones:** "Cobrado a la fecha" cuenta al simular un mes. Se sacó la línea que repetía lo que dice cada tarjeta.

**S12-F6 Errores y revisión final**
- **Error que tiembla** en: las preguntas de Inicio, el sueldo en Postula, la cuota en Tu pie, el monto en Invertir y los sueldos en Perfil. Siempre va con su mensaje.
- **Palabras visibles antes y después**, medidas con Playwright a 390 px y el mismo recorrido:

| Pantalla | Antes | Después | Cambio |
|---|---|---|---|
| Proyectos (compra en grupo) | 131 | 125 | -6 |
| Proyectos (pie compartido) | 110 | 110 | +0 |
| Detalle del proyecto | 153 | 138 | -15 |
| Postula (con cuotas) | 107 | 102 | -5 |
| Tus documentos (hoja abierta) | 194 | 171 | -23 |
| Tus documentos (listos) | 149 | 149 | +0 |
| Firma | 122 | 122 | +0 |
| Mi departamento | 199 | 180 | -19 |
| Mi departamento (mes 2) | 199 | 180 | -19 |
| Invertir | 56 | 50 | -6 |
| Mis inversiones | 41 | 35 | -6 |

  Bajan todas las pantallas que recibieron una visualización nueva que reemplaza texto: Proyectos, Detalle, Postula, Tus documentos con la hoja abierta, Mi departamento, Invertir y Mis inversiones. Quedan iguales:
  - Proyectos con el pie compartido: el título y la cifra de la casa del 15 % ocupan las mismas palabras que la barra.
  - Tus documentos con todo listo: el check animado reemplaza un check que ya existía.
  - Firma: su visualización, la llave, aparece en la pantalla siguiente.

## Verificación

- `node --test tests/*.test.js`: 124 pruebas, 0 fallas.
- `node --check`: sin errores. No hay "plata", "depto", "dpto" ni "la IA recomienda".
- Recorridos con Playwright a 390 y 360 px, sin errores de JavaScript ni scroll horizontal:
  - el del Sprint 11 y los de los Sprints 8, 9 y 10, adaptados a la hoja inferior;
  - la medición de palabras.
- **Zona táctil de "Subir":** 54 px.
- **Movimiento reducido:** la regla global deja el estado final de cada animación (aguja, casa, franjas, flujo y hoja). El archivo que vuela no se crea.

## Decisiones y límites

1. **El medidor llega hasta 40 %.** Una carga mayor deja la aguja al tope, y el número sigue diciendo el valor real.
2. **La leyenda de "Cupos tomados" quedó solo en el número y el ícono de grupo.** Las figuras dicen el resto.
3. **Las hojas inferiores no atrapan el foco por completo:** se enfoca el primer archivo, y Esc y "Cerrar" devuelven el foco al botón.
