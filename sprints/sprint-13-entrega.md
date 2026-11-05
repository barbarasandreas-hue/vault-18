# Sprint 13 · Entrega: volver a la app

Estado: listo para que el Evaluator lo revise. S13-F1 a S13-F6 quedan `en progreso`. Todo lo que pasa con dinero, avisos, pareja y familia es simulado; los cálculos son reales y están en `js/calculos.js`, con pruebas en `tests/sprint13.test.js`.

## Qué se hizo

**S13-F1 Avisos con tu meta**
- Una campana en el encabezado de Inicio (Tu camino, tu compra y tus inversiones) muestra cuántos avisos hay este mes y abre la pantalla `#avisos`.
- Los avisos se ven como notificaciones del teléfono: "Primer Peldaño · día N", título y una línea.
- Cada aviso nombra la meta: "Faltan 7 a 9 meses para tu departamento de UF 2.000 a 2.500", el mismo plazo que muestra Inicio. Con compra: "Faltan N meses para tu departamento en Independencia". Si el mes anterior no se pudo: "Nuevo mes, nueva racha".
- Máximo uno por semana (días 1, 8, 15 y 22) y cuatro al mes. Las reglas viven en `avisosDelMes`.
- En Perfil, la sección "Avisos" tiene cuatro interruptores: tu cuota y tu plazo, tu grupo, tu obra, y tu departamento e inversiones. Se guardan en el navegador.

**S13-F2 Cuota automática y pausa**
- En Tu pie, el interruptor "Pagar mi cuota sola el día 5" lleva un ícono de calendario.
- Si está activo, "Este mes no pude" pasa a llamarse "Pausar este mes" y funciona igual (protector de racha y sin perder lo ahorrado).
- "Salida sin multa" se ve siempre, también en el pie compartido ("Tu ahorro está en tu cuenta Bci").

**S13-F3 Juntos**
- "Invitar a mi pareja": muestra dos avatares y "Tú y tu pareja ven este avance".
- **Lista de regalos para tu pie** (rehecha después de la revisión con la usuaria del proyecto):
  - En Tu pie, "Crear lista de regalos": la ocasión (Cumpleaños, Navidad, Titulación u Otra ocasión) y el interruptor "Mostrar montos a tu familia".
  - Con la lista creada: la ocasión, los aportes ("De tu abuela", el monto y su mensaje entre comillas), el total, "Copiar enlace" (simulado) y "Ver como familia".
  - **Vista de la familia** (`#regalo`): una sola pantalla sin la barra de la app, con la franja "Así lo ve tu familia · simulado". Muestra el avance del pie (porcentaje o montos, según eligió la usuaria), el aporte en tres montos, su efecto en meses o en días de ahorro, "Eres su…", un mensaje opcional de hasta 140 caracteres y el sello "Va directo a su cuenta Bci para el pie". "Aportar" suma el aporte y vuelve a Tu pie con un toast.
  - Si el aporte completa el pie, pasa a Firmar. Al firmar, el toast dice "Avisamos a quienes aportaron".
  - El "?" lo explica como "una lista de novios, pero para tu pie".
**S13-F4 Tu grupo y tu obra** (compra en grupo)
- Tu grupo: las figuras del grupo, "Descuento asegurado hoy" y "Con N personas más" con el descuento siguiente (`cuposParaMasDescuento`). Botón "Compartir el proyecto" (simulado).
- Tu obra: "Entrega estimada" y una línea de tiempo de 5 etapas (excavación, obra gruesa, terminaciones, recepción y escritura), con la etapa actual marcada como "ahora".
- `js/datos.js`: cada proyecto en grupo tiene `etapaObra` y `entregaEstimada`.
- Diferencia con el plan: cada etapa lleva ícono (hecha, actual o pendiente), no una ilustración propia ni una fecha por etapa; solo la entrega tiene fecha.

**S13-F5 Lo tuyo creció este mes**
- En Mi departamento, la tarjeta "Tu patrimonio" muestra el total (`patrimonioUF`: precio − saldo Bci − parte de los inversionistas), contando desde el valor anterior al simular un mes, con "Creció $X este mes" (`crecimientoMesUF`: recompra + lo que bajó la deuda con Bci) y el sello "Sin plusvalía".
- Se llama "Tu patrimonio", y no "Lo tuyo", para no confundirse con "Ya es tuyo 85 %" (la parte que no es de los inversionistas). El "?" lo explica.
- El aviso mensual del departamento usa la misma cifra; para quien invierte, "Recibiste $X" con el nombre del edificio.

**S13-F6 Medición en la sesión de prueba**
- El registro agrega "¿Volverías a abrir la app el próximo mes?" (Sí, Tal vez, No) y "¿Qué aviso te haría volver?" (los cuatro tipos). Las dos respuestas se guardan y salen en el texto exportado.

## Cómo verlo

1. Abrir la app (`python -m http.server 8000` y http://localhost:8000) en ancho de celular.
2. Responder las 4 preguntas de Inicio y tocar la campana.
3. Elegir un proyecto en grupo (por ejemplo Mirador Independencia) y llegar a Tu pie: probar el interruptor, invitar a la pareja, crear la lista de regalos, tocar "Ver como familia", aportar y bajar hasta Tu grupo y Tu obra.
4. En Perfil, apagar "Tu grupo" y volver a Avisos.
5. Firmar y ver "Tu patrimonio" en Mi departamento.
6. Perfil → Registro de la sesión: las dos preguntas nuevas.

## Verificación

- `node --test tests/*.test.js`: 135 pruebas, 0 fallas (9 nuevas en `tests/sprint13.test.js`).
- Recorrido con Playwright a 390 y 360 px: sin errores de JavaScript y sin desborde horizontal. Revisa la campana, el plazo del aviso, el interruptor, la pareja, el regalo hasta la firma, el aviso apagado, Tu patrimonio y el registro.
- Recorridos de los Sprints 8, 10 y 11: sin errores.
- Sin "plata", "depto", "dpto" ni "la IA recomienda".
- Contraste: el número de la campana usa blanco sobre `--red-dark` (el rojo normal no llega a AA con texto chico).
