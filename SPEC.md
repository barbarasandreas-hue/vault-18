# SPEC · Primer Peldaño

Especificación del producto. La fuente de verdad del modelo y de las reglas es `CLAUDE.md`; este documento no la contradice. El recorrido de los usuarios está en [`docs/journey-map.md`](docs/journey-map.md).

---

## 1. Resumen

Primer Peldaño es un marketplace de departamentos de Bci, para el teléfono, que permite a jóvenes profesionales comprar su primer departamento poniendo solo el 5 % del precio (más gastos), en vez del 20 %. En el marketplace el usuario ve proyectos y se une a ellos: **compras en conjunto** (varios compradores compran un lote con 10 % de descuento) o **financiamiento del pie** (inversionistas prestan el 15 % y el usuario pone el 5 %); Bci presta el 80 % restante. La app debe ser fácil de comprender: cada pantalla se entiende en 10 segundos.

## 2. Usuario objetivo

- **Comprador:** joven profesional de 25 a 35 años que arrienda, tiene sueldo estable y postula junto a su pareja. Puede pagar un dividendo, pero no tiene el pie. En la interfaz se le llama "usuario" o "cliente", nunca por nombre.
- **Inversionista:** persona con ahorros que busca renta fija en UF. En la interfaz se le llama "inversionista", nunca por nombre.
- **Escenario principal:** el usuario abre la app en el celular, en el metro o en su casa, para saber si puede comprar y cuánto le cuesta. Tiene poco tiempo y desconfía de las promesas.

## 3. Pantallas

Cada pantalla tiene **un número protagonista** y **una acción principal**.

### Lado del comprador

| Pantalla | Propósito | Número protagonista | Acción principal |
|---|---|---|---|
| **Simula** | Ver cuánto cuesta comprar, para vivir o arrendar, en lote o individual | Cuánto pone al escriturar (5 % + gastos) | Ver proyectos |
| **Proyectos** (marketplace) | Recorrer los proyectos filtrados por la IA y unirse a uno | En compra en conjunto: cuánto ahorra por unirse. En financiamiento del pie: el precio y de dónde sale (80 / 15 / 5) | Unirme |
| **Postula** | Saber si el usuario y su pareja califican para el proyecto elegido | Porcentaje de carga, con semáforo: holgado (verde), en el límite (amarillo), no aprueba (rojo) | Postular |
| **Tu 5 %** | Planificar cómo juntar lo que pone al escriturar y, al llegar, revisar lo que firma | Meses para llegar a la meta | Empezar a ahorrar |
| **Mi departamento** | Ver cómo se movió el dinero del mes y el avance de la deuda | Cuánto puso el usuario este mes | Abonar (solo aparece cuando la IA lo recomienda) |

### El marketplace: dos tipos de proyecto

| | Compra en conjunto | Financiamiento del pie |
|---|---|---|
| **Qué es** | Un lote de departamentos que se compra entre varios compradores, con 10 % de descuento | Un departamento a precio de lista; el usuario reúne su 15 % con ayuda de inversionistas |
| **Quién se une** | Compradores (uno por departamento del lote) | El comprador del departamento y los inversionistas que financian |
| **Qué muestra la tarjeta** | Ahorro por unirse, cupos tomados (por ejemplo, 6 de 10) y fecha de cierre | Precio, avance del financiamiento (por ejemplo, 60 % financiado) y fecha de cierre |
| **Si no se completa** | El comprador puede pasar a compra individual (precio de lista) o salir sin costo | El comprador puede esperar o salir sin costo; el inversionista recupera su dinero |

Los proyectos de compra en conjunto también se financian con inversionistas (cada departamento del lote tiene su 15 %).

### Quién pone qué

| Parte | Quién | Cómo |
|---|---|---|
| 80 % | Bci | Crédito hipotecario mancomunado (usuario y pareja), 30 años, 4,5 % |
| 15 % | El usuario, con ayuda de inversionistas | Lo reúne en el marketplace: varios inversionistas aportan partes hasta completarlo; se devuelve en 10 años a UF + 8 % |
| 5 % + gastos | El usuario, por sí solo | Con su propio ahorro. Puede ahorrar solo o en un ahorro grupal, pero en el grupo cada persona junta su propio 5 %: nadie aporta por otro ni queda debiendo |

El 5 % nunca lo financian inversionistas ni otras personas.

### Lado del inversionista

| Pantalla | Propósito | Número protagonista | Acción principal |
|---|---|---|---|
| **Proyectos** (vista inversionista) | El mismo marketplace, mostrando lo que falta por financiar en cada proyecto | Rentabilidad: UF + 8 % a 10 años | Invertir |
| **Invertir** | Elegir cuánto prestar | Cuota mensual que recibirá | Confirmar |
| **Mi cartera** | Seguir sus inversiones | Cobrado a la fecha | Ver detalle |

Un selector al inicio permite elegir entre "Quiero comprar" y "Quiero invertir".

## 4. Flujos clave

1. **Comprador, de principio a fin:** Simula → Proyectos (se une a uno) → Postula → Tu 5 % (con lista de firma al llegar a la meta) → Mi departamento.
2. **Inversionista:** Proyectos → Invertir → Mi cartera.
3. **Unirse a una compra en conjunto:** ve la tarjeta → revisa ahorro, cupos y fecha de cierre → "Unirme" → toma un cupo → se le explica qué pasa si el grupo no se completa → sigue a Postula.
4. **Un mes en modo arrendar:** entra el arriendo a la cuenta custodia de Bci → se descuentan administración → se paga primero el dividendo → luego la cuota a los inversionistas → el usuario completa la diferencia. Mi departamento lo muestra como una cascada de pasos.
5. **Un mes en modo vivir:** el usuario paga el dividendo y la cuota a los inversionistas, y se compara con lo que pagaba de arriendo.
6. **Postula en amarillo o rojo:** la app sugiere qué cambiar (unirse a una compra en conjunto, un departamento más barato, sumar el ingreso de la pareja) y deja volver a Proyectos.

## 5. Modelo de datos

- **Departamento:** id, comuna, metros cuadrados, dormitorios, baños, precio de lista en UF, arriendo bruto estimado en pesos, id de proyecto.
- **Proyecto:** id, nombre del edificio (nunca nombres de personas), comuna, tipo (compra en conjunto o financiamiento del pie), lista de departamentos, cupos totales, cupos tomados, UF ya financiadas por inversionistas, fecha de cierre, descuento (10 % solo en compra en conjunto).
- **Usuario:** modo (vivir o arrendar), tipo de compra (lote o individual), sueldo propio, sueldo de la pareja, arriendo actual, ahorro mensual, tipo de ahorro (propio o grupal), proyecto y departamento al que se unió.
- **Crédito Bci:** monto (80 % del precio), tasa 4,5 % anual, 360 meses, seguros UF 0,7 al mes, cuotas pagadas.
- **Préstamo de inversionistas:** monto (15 % del precio), tasa 8 % anual sobre UF, 120 meses, cuotas pagadas.
- **Inversión:** id, proyecto y departamento, monto en UF, fecha, cuotas cobradas.

Los datos del usuario y las inversiones se guardan en el teléfono (`localStorage`). No hay servidor.

## 6. Fórmulas

Todas viven en `js/calculos.js`; las pantallas solo las llaman. Los montos se calculan en UF y se muestran en pesos con UF = $41.065 y punto de miles.

| Cálculo | Fórmula |
|---|---|
| Precio | Precio de lista; en compra en conjunto (lote), precio de lista × 0,9 |
| Ahorro por unirse | Precio de lista × 10 % (UF 2.500 → UF 250 = $10.266.250) |
| Avance de un proyecto | Cupos tomados / cupos totales; en financiamiento, UF financiadas / UF por financiar |
| Pie del usuario | Precio × 5 % |
| Gastos de escritura | Precio × 2 % |
| Al escriturar | Pie + gastos |
| Dividendo Bci | Cuota fija (sistema francés) sobre el 80 % del precio, tasa 4,5 % / 12 mensual, 360 meses, más seguros UF 0,7 |
| Cuota inversionistas | Cuota fija sobre el 15 % del precio, tasa 8 % / 12 mensual, 120 meses, en UF |
| Total al mes | Dividendo + cuota inversionistas |
| Arriendo neto mensual | Arriendo bruto × 0,9 × 11 / 12 |
| Rentabilidad del arriendo | Arriendo neto × 12 / precio en pesos; la IA solo muestra departamentos con 4,5 % o más |
| Carga | Total al mes / (sueldo propio + sueldo de la pareja). Hasta 25 %: holgado. Sobre 25 % y hasta 30 %: en el límite. Sobre 30 %: no aprueba |
| Lo que pone el usuario (arrendar) | Total al mes − arriendo neto (si es negativo, el usuario recibe la diferencia) |
| Meses para la meta | Al escriturar / ahorro mensual, redondeado hacia arriba |
| Cuota al inversionista | Cuota fija sobre el monto invertido, 8 % / 12, 120 meses |

Valores de referencia (UF $41.065, redondeados al peso):

| Escenario | Precio | Al escriturar | Dividendo + seguros | Cuota inversionistas | Total al mes |
|---|---|---|---|---|---|
| Arrendar, lote | UF 2.250 | $6.467.738 | $403.272 | $168.153 | $571.425 |
| Arrendar, individual | UF 2.500 | $7.186.375 | $444.886 | $186.837 | $631.723 |
| Vivir, lote | UF 2.700 | $7.761.285 | $478.177 | $201.784 | $679.961 |
| Vivir, individual | UF 3.000 | $8.623.650 | $528.114 | $224.204 | $752.319 |

**Siempre se muestra el escenario sin plusvalía.** La app nunca proyecta que el departamento subirá de valor.

## 7. Dirección visual

- **Bci Kit** (https://www.bci.cl/corporativo/documentacion). Colores con variables `--blue-*`, `--green-*`, `--yellow-*`, `--red-*` (tonos `dark`, `normal`, `80`, `60`, `40`, `20`) y grises `--gray-dark`, `--gray-semidark`, `--gray-neutral`, `--gray-semilight`, `--gray-light`, `--white`. Si no se pueden leer los valores del sitio, usar azul #0033cc, verde #19a246, amarillo #ffc629, rojo #d7261e y aclarar para los tonos 80 a 20.
- **Tipografías:** Barlow Condensed para títulos (Display 1 a 4, Encabezado 1 a 6) y Figtree para el texto, desde Google Fonts.
- **Botones:** primario, secundario dark, secundario light, terciario y terciario light; tamaños small, normal y large; con estado de carga.
- **Semáforo:** verde = holgado, amarillo = en el límite, rojo = no aprueba. Nunca solo con color: siempre con palabra e ícono.
- **Listas:** con check cuando el orden no importa; numeradas solo para pasos.
- **Fondos claros**, mucho aire, el número protagonista grande y arriba.
- **Contraste AA** como mínimo, pensando en baja visión. El amarillo nunca se usa para texto sobre blanco.

## 8. Requisitos móviles

- Diseñada para 390 px de ancho; sin scroll horizontal a 360 px.
- Respeta el notch y la barra inferior (áreas seguras).
- Campos de dinero con teclado numérico.
- Botones y zonas táctiles de 44 × 44 px como mínimo.
- Fácil de comprender: se entiende en 10 segundos, con un número, una acción y textos cortos. Los términos financieros (dividendo, pie, carga, segunda hipoteca, cuenta custodia) tienen una explicación de una frase a un toque.
- Se puede agregar a la pantalla de inicio como una app.
- Funciona abierta con doble clic, por wifi desde el computador y publicada en GitHub Pages.

## 9. Fuera de alcance

- Servidor, cuentas de usuario o inicio de sesión real.
- Dinero real, pagos o transferencias.
- Firma legal o evaluación crediticia real.
- Proyecciones de plusvalía.
- Notificaciones push.
- Uso del auto como forma de juntar el pie.

## 10. Suposiciones

1. No existe un prototipo previo (`primer-peldano.html`); el Sprint 1 parte desde cero.
2. Los departamentos de referencia (UF 2.500 y UF 3.000) son precios de lista; en lote se les aplica el 10 % de descuento.
3. La tasa mensual es la tasa anual dividida por 12.
4. La rentabilidad del arriendo se mide con el arriendo **neto** sobre el precio pagado.
5. El ahorro grupal es un grupo que ahorra junto con un compromiso común, pero cada persona junta su propio 5 %; al terminar, cada una retira exactamente lo que aportó, así nadie queda debiendo. (Confirmado con el equipo.)
6. La inversión mínima es UF 10.
7. Los inversionistas y compradores de ejemplo no tienen nombres.
8. "Avisar cuándo conviene abonar" se simula con una regla simple: cuando el usuario tiene un excedente (por ejemplo, un mes con arriendo mayor al total), la app sugiere abonar a la deuda de inversionistas, que tiene la tasa más alta.
9. **Los dos tipos de proyecto del marketplace** se interpretan así: "compra en conjunto" es un lote que se completa con varios compradores y tiene 10 % de descuento; "financiamiento del pie" es un departamento a precio de lista en el que el usuario reúne su 15 % con ayuda de inversionistas. El 5 % lo pone el usuario por sí solo y se planifica en Tu 5 %, no en el marketplace. (Confirmado con el equipo.)
10. Si una compra en conjunto no completa sus cupos antes de la fecha de cierre, el comprador puede pasar a compra individual o salir sin costo.
