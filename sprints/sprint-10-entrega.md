# Sprint 10 · Entrega: pie compartido, pie en cuotas y Sostener

Estado: listo para que el Evaluator lo revise. Las features S10-F1 a S10-F5 quedan `en progreso` en `PLAN.md`. Los textos siguen la regla de textos mínimos de `CLAUDE.md`.

## Qué se hizo

**S10-F1 Pie compartido en Mi departamento**
- **Casa que se va pintando:** un SVG que se llena desde abajo con el % que ya es tuyo. Al lado se ve "Ya es tuyo 85 %" y "Te faltan 51 meses". Si no se termina antes del tope, dice "en el mes 84 refinancias o vendes".
- **Peor caso:** "con 10 % menos de arriendo, 58 meses". Usa `plazoRecompra` con el arriendo × 0,9 y cuenta los meses que ya pasaron.
- **Cascada en el orden del plan:** arriendo → administración y mes vacío → dividendo (lo pagas tú) → renta de los inversionistas → recompra.
- El selector 100 % / 80 % se mantiene.

**S10-F2 Comprador de respaldo y "¿Y si me arrepiento?"**
- **Inversionista:** en Invertir hay una casilla "Quiero ser comprador de respaldo", con un "?" que la explica. Se guarda en la inversión, y Mis inversiones muestra el chip "Comprador de respaldo".
- **Comprador:** en Mi departamento hay un desplegable "¿Y si me arrepiento?" que dice qué pasa si vende este mes, sin plusvalía (`ventaHoy`):
  - El orden de pago es Bci (lo que queda del crédito), inversionistas (según su parte del valor neto de costos), costos de venta y, al final, lo que queda para ti.
  - Si la venta no alcanza para pagar el crédito, avisa cuánto falta.
  - Se lee "Si atrasas 2 dividendos, Bci te acompaña a vender antes de un remate".
- Supuesto nuevo en `CLAUDE.md`: costos de venta de 2 %.

**S10-F3 Pie en cuotas (A)**
- En la compra en grupo, el paso 2 se llama "Tu pie en cuotas" y el campo dice "Tu cuota al mes".
- La pantalla muestra:
  - el sello "Tu dinero está en Bci, no en la inmobiliaria";
  - "Salida sin multa", con un "?" que explica cuándo aplica (Bci no aprueba el crédito o la tasación sale menor);
  - el avance del grupo (cupos tomados).
- **Camino A solo para arrendar** (pendiente del Sprint 9): si el camino elegido es "A · Compra en grupo" o "Crédito al 80 %", los proyectos en grupo usan el modo `propio`:
  - Bci 80 % y el usuario 20 %, sin inversionistas;
  - el detalle muestra 80 / 20, la firma no muestra la participación y Mi departamento no muestra la casa;
  - funciones: `modoFinanciero(proyecto)` en `app.js` y `MODOS.propio` en `calculos.js`.

**S10-F4 Sostener**
- El chip "N meses seguidos" muestra la racha, y la barra de hitos sigue igual.
- **"Este mes no pude":** `registrarMes` en `calculos.js` decide qué pasa con la racha. Lo ahorrado nunca se descuenta.
  - Una vez cada 6 meses usa el protector y la racha sigue ("Usaste tu protector: tu racha sigue").
  - Si ya lo usó en los últimos 6 meses, la racha vuelve a 0, sin castigo ("Tu racha vuelve a empezar. Lo ahorrado sigue ahí").
- Debajo se lee si el protector está disponible o en cuántos meses vuelve.

**S10-F5 Pendientes del Sprint 7**
- **El "?" responde al primer toque:** un `mousedown` con `preventDefault` evita que el campo pierda el foco y se vuelva a dibujar el bloque. Probado con el cursor en "Sueldo de tu pareja": se abre a la primera.
- **Zona de 44 px:** `.btn-ayuda` tiene `position: relative; z-index: 1`, y `#proyectos-explica` tiene un margen inferior de 14 px.
- **`conCarga`:**
  - fija también el alto del botón;
  - si el usuario cambió de pantalla durante la carga, la acción no se ejecuta. Probado: Comprar aquí → Perfil sigue en Perfil.
- **"Empezar"** de la introducción usa `location.replace('#inicio')`.

## Verificación

- `node --test tests/*.test.js`: 122 pruebas, 0 fallas. Hay 6 nuevas en `tests/sprint10.test.js`: modo propio, venta con y sin inversionistas, deuda mayor que la venta, racha y protector.
- `node --check js/*.js`: sin errores. No hay "plata", "depto" ni "dpto".
- Recorridos con Playwright a 390 y 360 px, sin errores de JavaScript ni scroll horizontal:
  - compra en grupo completa con pie en cuotas, Sostener (pago, protector y reinicio), firma, Mi departamento con la casa y "¿Y si me arrepiento?";
  - inversión con comprador de respaldo;
  - detalle con el camino A propio;
  - los recorridos de los Sprints 8 y 9.

## Decisiones y límites

1. **Peor caso del pie compartido:** se muestra el plazo con 10 % menos de arriendo. No se simula una venta con baja de precio, porque la app no promete ni proyecta plusvalía en ningún sentido.
2. **Reparto de la venta:** los inversionistas reciben su parte del valor neto de costos, y el comprador paga la deuda con su parte. Así funciona la "participación en el valor" del modelo B. Si el precio baja, la pérdida se reparte de la misma forma.
3. **Venta asistida:** queda como una frase informativa, sin simular atrasos.
4. **El protector se cuenta por meses simulados**, no por fechas reales.
