# Sprint 18 · Entrega del Bloque 1: que los números no se contradigan

Estado: S18-F1 a S18-F4 quedan `en progreso` para que el Evaluator los revise. Los Bloques 2 y 3 siguen pendientes.

## Qué se hizo
- **S18-F1 Descuento real del grupo.**
  - `precioUF` ya no supone 10 unidades.
  - `unidadesHoy` y `resumenProyecto(..., { descuentoHoy, yaEstas })` usan los cupos tomados más el tuyo. Agregan `ahorroCompleto` y `descuentoCompleto`.
  - En modo vivir, con 6 de 10 cupos, el precio lleva el 3 % y el 5 % se muestra como posibilidad:
    - Elegir: "Ahorras al unirte $3,1 millones · $5,1 millones si se completa";
    - Detalle: "Ahorras en grupo hoy" y "Si se completa".
  - Si alguien se une y el grupo llega a 10, el precio baja solo.
- **S18-F2 Un solo reloj.**
  - `hoyDemo()` = fecha de referencia + meses de la demo (`fechaMasMeses`). De ahí salen el plazo, la fecha de las llaves, la entrega, el cierre del grupo, los avisos y la etapa de la obra.
  - Tu obra dice "Entrega en N meses" con la misma fecha que el freno "entrega". Ya no dice "días para tus llaves".
  - Si el grupo ya cerró:
    - el aviso dice "El grupo cerró con 7 de 10: tu descuento es 3 %";
    - se ocultan "Compartir" y "Simular que alguien se une".
  - Si el pie se completa antes de la entrega:
    - aparece "Tu pie está listo · Tus llaves en N meses · Te frena: la entrega" y el botón "Saltar a la entrega · demo";
    - ya no se firma antes de la entrega.
- **S18-F3 Un solo monto.** Detalle, Tu pie, Inicio, avisos, lista de regalos y paso tras postular usan `metaCompra`. Se acabó la diferencia de $1.
- **S18-F4 Precisión.**
  - Las tarjetas de Elegir y Departamentos muestran montos redondeados.
  - En Detalle, para vivir:
    - "De dónde sale el precio", los gastos y el peor caso van redondeados;
    - se quitó la fila repetida "Juntas antes de firmar".
  - "Entre todos llevan", en Tu grupo, va redondeado.
- **Arreglo encontrado al probar:** un aviso (toast) tapaba "Mantén para firmar" y no dejaba firmar. Ahora los avisos dejan pasar los toques (`pointer-events: none`).

## Diferencias con el plan
- El modo arrendar sigue suponiendo el grupo completo: Departamentos muestra "Ahorras al unirte $5,1 millones". Se dejó así porque el sprint no toca arrendar y ese número mueve la participación de los inversionistas. Hay que decidirlo aparte.
- Las cifras del ejemplo cambiaron porque ahora usan el 3 %:
  - Juntas antes de firmar: $11,9 millones;
  - Pagas al mes: $451 mil;
  - Precio: $99,6 millones.

## Verificación
- `node --test tests/*.test.js`: 162 pruebas, 0 fallas (5 nuevas en `tests/sprint18.test.js`).
- Recorrido del Sprint 17 a 390, 360 y 320 px: el mismo plazo en Inicio, Llega antes, Detalle y Tu pie, sin desborde ni errores.
- Recorrido completo, de las preguntas a Mi departamento:
  - con $600 mil al mes: el pie se junta en 15 meses y la firma llega después de la entrega;
  - con $1 millón al mes: pie listo en el mes 9, espera de 5 meses a la entrega, firma y Mi departamento;
  - en los dos casos, sin errores de JavaScript.
- Modo arrendar, revisión rápida: sin errores.
