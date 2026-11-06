# Sprint 18 · Entrega del Bloque 3: el final en el idioma nuevo

Estado: S18-F7 a S18-F9 quedan `en progreso`. Con esto, el Sprint 18 completo (F1 a F9) queda listo para el Evaluator.

## Qué se hizo
- **S18-F7 Toda la compra con las piezas.**
  - Para vivir, `resumen(p).escenario` sale de las mismas piezas que el Detalle y Tu pie (`escenarioConPiezas`): precio con descuento o sin IVA, subsidio y respaldo. Antes salía del precio de lista al 90 %.
  - El encabezado de Postular, la preaprobación, Firmar, Mi departamento, la carga y los avisos muestran las mismas cifras.
  - Firmar, en "Lo que firmas", va en filas con los montos exactos: Precio (sin IVA si aplica), Bci te presta, Subsidio del Estado, Pagas al mes, Plazo, Tasa y "Sin subsidio a la tasa" (peor caso).
  - El saldo del crédito y el patrimonio usan la parte que presta Bci de verdad (`saldoBciUF` con `pctCredito`).
  - Se separó `resumenBase` (sin piezas) para no caer en un ciclo.
- **S18-F8 Después de firmar.**
  - Mi departamento muestra "Este mes pagaste · Con seguros incluidos", con las filas "Antes, de arriendo" y "Diferencia".
  - El arriendo se pide solo si no se dio en las preguntas.
  - Inicio: "Antes pagabas $450 mil de arriendo." (ya no dice "Tu dividendo").
  - Tu equipo dice a quién, no cuántos: "Con tu pareja", "Con tu pareja y 2 personas más". En Perfil, "Tu equipo: 2 personas", contándote a ti.
- **S18-F9 Palabras en todo el modo vivir.**
  - La búsqueda revisa todas las pantallas, de Tu camino a Inicio después de firmar (fuera de "?", la simulación y lo plegado): dividendo, escritura, carga, participación, peor caso, "te presta hasta", plata y depto.
  - Cambios de texto: "Gastos de escritura" pasa a "Gastos al firmar", y en "Lo que falta", "Escritura" pasa a "Firma".
- **Arreglos encontrados en la revisión del Bloque 2:**
  - "Así cabe" se decide con los departamentos reales del rango, no con el piso teórico. Antes podía decir "Así cabe" y que ningún departamento cupiera.
  - Si hacen falta dos piezas, cada una dice "Con otra, cabe".
  - Una pieza ya sumada dice "Sumado".
  - En Elegir, primero van los que caben. Los que no, llevan "Te dejaría justo".

## Verificación
- `node --test tests/*.test.js`: 165 pruebas, 0 fallas.
- Revisión automática de palabras, montos exactos antes de Postular y desborde, a 390, 360 y 320 px, en tres recorridos completos hasta Mi departamento:
  - pareja en grupo (Mirador);
  - pareja con un terminado sin IVA y con subsidio (Las Acacias);
  - persona sola de $1,1 millones con subsidio y sin IVA (Los Aromos).

  No hay hallazgos ni errores de JavaScript.
- Cifras de Las Acacias en el Detalle, Postular, Firmar y Mi departamento:
  - pagas al mes $361.893;
  - Bci te presta $70,6 millones;
  - subsidio $11,1 millones;
  - juntas $4.985.291.
- Recorrido A del Sprint 17: OK. Modo arrendar: sin errores.

## Pendiente fuera del sprint
- Modo arrendar: sigue suponiendo el grupo completo (5 %) y con las pantallas del Sprint 16.
- Supuestos por validar con Bci: subsidio de UF 270 promedio, sin IVA de −10 % y respaldo familiar al 100 %.
