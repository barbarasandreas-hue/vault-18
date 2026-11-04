# Primer Peldaño

App de Bci para que jóvenes profesionales compren su primer departamento sin tener que juntar el pie completo. Es un prototipo para el Taller de Interacción IV (UDD), desafío Bci Labs. El dinero, los inversionistas y la parte legal son simulados; los cálculos son reales. La app debe ser facil de comprender para el usuario. La idea es que sea un marketplace de departamentos en done el usario vea proyectos donde se puede unir, tanto de compras en junto como de financiamiento para el pie.

## El modelo (v3, 4-nov-2026)

Fuente: brief común v3. Primer Peldaño **no inventa un crédito**: traduce el pie a cuotas que el usuario sí puede pagar, compara con sus números los caminos reales que existen y lo acompaña hasta escriturar. El recorrido tiene cuatro pasos: **Traducir → Elegir → Sostener → Llegar**.

### Crédito según el modo

- **Para vivir:** Bci presta el 90% con la garantía estatal FOGAES (primera vivienda, intención de habitarla, hasta UF 4.500) y el subsidio a la tasa (Ley 21.836). El usuario pone el 10% de pie.
- **Para invertir:** Bci presta el 80% con el subsidio a la tasa (exige primera venta, no primera vivienda, así que sirve para invertir). **Sin FOGAES**, que queda guardado para la vivienda futura del usuario.
- Crédito mancomunado (usuario y pareja), a 30 años. Tasa con subsidio: 3,9% (4,5% − 0,6). Si se acaban los cupos del subsidio, 4,5%.

### Los caminos

| Camino | Modo | Qué hace |
|---|---|---|
| **A · Compra en grupo** | Vivir o invertir | Bci reúne compradores preaprobados. Descuento real de 3% (5 unidades) a 5% (10 unidades), en uno o varios proyectos de la misma inmobiliaria en una zona. El pie se paga en cuotas durante la construcción, en una **cuenta de ahorro bloqueada en Bci** (art. 138 bis de la LGUC); la inmobiliaria lo recibe solo al escriturar. Salida sin multa si Bci no aprueba el crédito final o si la tasación sale menor que el precio. |
| **B · Pie compartido** | Invertir | Inversionistas ponen el 15% como **participación en el valor** (no es un préstamo). Reciben una renta de 6% anual en UF sobre su parte, y con el resto del arriendo el comprador les **recompra** su parte cada mes. Ganancias y pérdidas se reparten según la parte de cada uno; **sin recurso al sueldo** del comprador. El comprador pone el 5% con ahorro propio. Comprador de respaldo y venta asistida antes del remate. |
| **A + B** | Invertir | Grupo + pie compartido: el comprador pone el 5% del precio con descuento. |
| **Arriendo con opción de compra** | Vivir | Ficha informativa: parte de la mensualidad va al pie (referente: Hogarízate). |
| **Respaldo familiar** | Vivir o invertir | Ficha informativa: un familiar deja el 10% en una cuenta bloqueada en Bci ≈ 5 años y lo recupera con intereses (referente: Barclays Family Springboard). |
| **Todavía no** | Los dos | Cuando ningún camino es sostenible, la app lo dice y muestra qué cambiar (ver "Tu mes real"). |

**Comprar más barato** es un filtro sobre todos los caminos: estudio, 1 dormitorio, usado, IVA cero (Ley 21.850, del 1-dic-2026 al 1-dic-2027).

### Reglas que no se rompen

- **Nunca bono pie:** el precio de la escritura es siempre el real.
- **Nunca un préstamo de inversionistas a UF + 8%:** supera la tasa máxima convencional (6,51% en UF hasta UF 2.000 y 6,03% sobre ese monto; CMF, 15-sep-2026).
- La inmobiliaria **no puede ser inversionista** de sus propias unidades.
- El dinero del usuario siempre está en cuentas de Bci; nunca en un fondo común de la app (art. 39 de la Ley General de Bancos).
- Siempre se muestra el escenario sin plusvalía y el peor caso.

### La IA

- **Recomendar el camino = reglas transparentes**, escritas en `js/calculos.js` y explicadas en pantalla ("Te recomendamos B porque…"). No se llama IA a una regla.
- **Estimar el arriendo de cada departamento = el modelo de IA** (en la demo, valores precalculados por comuna y tipología, con un error de 10% o menos como hipótesis). Con ese arriendo se calcula la rentabilidad y el plazo de recompra.

## Supuestos de cálculo

- UF de referencia: $41.065.
- Seguros del crédito: ≈ UF 0,7 al mes.
- Arriendo neto = arriendo bruto × 0,9 (administración) × 11/12 (1 mes vacío al año). Peor caso: arriendo 10% más bajo.
- Rentabilidad neta = arriendo neto × 12 / precio. En modo invertir la IA solo muestra departamentos con rentabilidad neta ≥ 3,9% (la tasa con subsidio).
- Límite de carga: dividendo ≤ 25% del ingreso líquido familiar, y dividendo + otras cuotas ≤ 30%. Sobre eso, no aprueba.
- **Tu mes real:** ingreso líquido − arriendo que paga hoy (si sigue arrendando) − otras cuotas − dividendo. Si no cumple el límite de carga, o si queda menos del 40% del ingreso para vivir (supuesto de diseño, a validar en las sesiones), el camino es "Todavía no".
- Departamento de referencia: UF 2.500 de lista. Comunas de los ejemplos: Independencia, Quinta Normal, Recoleta y Estación Central.

## Reglas de diseño y contenido

- Interfaz en español de Chile. Usar "dinero", nunca "plata".
- Escribir siempre "departamento" completo, nunca "depto." ni "dpto.".
- No usar nombres de personas en la interfaz; hablar de "usuario" o "cliente" O "inversionista".
- No usar el auto como forma de juntar el pie. Sí se puede mostrar, en "Todavía no", que terminar de pagar una cuota libera capacidad.
- Seguir el **Bci Kit**, la guía de diseño de Bci: https://www.bci.cl/corporativo/documentacion
  - Colores: cuatro familias (azul, verde, amarillo y rojo) más grises. Cada familia tiene tonos `dark`, `normal`, `80`, `60`, `40` y `20`, y los grises van de `dark` a `light`. Usar variables con esos nombres: `--blue-dark`, `--blue-normal`, `--blue-80` … `--blue-20`, `--green-*`, `--yellow-*`, `--red-*`, `--gray-dark`, `--gray-semidark`, `--gray-neutral`, `--gray-semilight`, `--gray-light`, `--white`.
  - Los valores oficiales (colores, tipografía, botones, formularios) están en `docs/bci-kit.md`, tomados de la página del Bci Kit. Rojo y amarillo no tienen tono `dark` en la guía: se usan los derivados de ese documento.
  - Botones: primario, secundario dark, secundario light, terciario y terciario light, en tamaños small, normal y large, con estado de carga. Son píldoras (borde redondeado de 48 px) con texto en mayúsculas.
  - Títulos: estilos Display 1 a 4 y Encabezado 1 a 6.
  - Listas: viñetas con ícono de check cuando el orden no importa; listas numeradas solo para secuencias o prioridades.
  - Accesibilidad: contraste AA como mínimo, pensando en usuarios con baja visión. Ojo: el texto blanco sobre `--green-normal` no llega a AA en tamaño normal; seguir la regla de `docs/bci-kit.md`. El amarillo nunca se usa como texto.
  - Íconos: Bci usa una fuente propia que no es pública; usar íconos SVG de línea dibujados en el código.
- Fondos claros. Tipografía: **Overpass** (la del Bci Kit) para títulos y textos, desde Google Fonts. Los títulos van en peso 400, no en negrita.
- Mobile first (390 px de ancho). Un número y una acción por pantalla. Se entiende en 10 segundos. Siempre mostrar el escenario sin plusvalía.
- Los montos se muestran en pesos chilenos, con punto de miles (es-CL).

## Stack técnico

- Sitio estático: HTML, CSS y JavaScript sin frameworks ni paso de compilación, para que se pueda abrir con doble clic y publicar gratis en GitHub Pages.
- El punto de partida es `primer-peldano.html`, un solo archivo. Al ordenarlo, usar esta estructura:

```
index.html          pantallas y navegación
css/estilos.css     tokens de color y tipografía del Bci Kit, componentes
js/calculos.js      todas las fórmulas (dividendo, cuota, arriendo neto, carga)
js/datos.js         departamentos y lotes de ejemplo
js/app.js           estado y render de las pantallas
```

- Todas las fórmulas viven en `js/calculos.js`; las pantallas solo las llaman.
- Fuentes desde Google Fonts. No agregar librerías salvo que sea necesario, y avisar antes.

## Cómo correrlo

- En el computador: `python -m http.server 8000 --bind 0.0.0.0` en la carpeta del proyecto (en Windows es `python`, no `python3`) y abrir http://localhost:8000. Probar siempre con el navegador en ancho de celular.
- En el teléfono, misma red wifi: con el servidor anterior corriendo, buscar la IP del computador con `ipconfig` ("Dirección IPv4", por ejemplo `192.168.1.20`) y abrir `http://192.168.1.20:8000` en el teléfono. Si no carga, permitir Python en el firewall de Windows para redes privadas.
- En el teléfono, desde cualquier lugar: publicarla en GitHub Pages desde la rama `main` y abrir la dirección `https://<usuario>.github.io/<repositorio>/`. Desde el menú del navegador, "Agregar a pantalla de inicio" la deja como un ícono de app.
- Pruebas de las fórmulas: `node --test tests/` (Node ya viene instalado; no hace falta `npm install`).
- Roles de Claude Code en `.claude/agents/`: `planner` (escribe SPEC.md y PLAN.md), `generator` (programa un sprint) y `evaluator` (revisa el sprint y lo aprueba o rechaza).

## Forma de trabajo

- Hacer cambios pequeños y explicar el plan antes de un cambio grande.
- Después de cada cambio, decir qué archivo cambió y cómo verlo.
- Usar git: un commit por cambio, con el mensaje en español.
- Quien trabaja en el proyecto es diseñadora, no programadora: explicar los pasos de terminal en palabras simples.
